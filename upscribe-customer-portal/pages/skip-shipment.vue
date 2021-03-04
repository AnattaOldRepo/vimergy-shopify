<template>
	<div>
		<portal to="header">
			<the-header />
		</portal>

		<div v-if="activeSubscription && initedSkipAction" class="c-skipShipment">
			<thank-you-block
				v-if="shipmentSkipped"
				:active-charge="thankYouCharge"
				:multiple-order-display="multipleSubscriptionUpdates"
				class="c-skipShipment__thankYou"
			/>

			<div v-else class="c-skipShipment__loading">
				<h2 v-if="error" class="c-skipShipment__loadingText">{{
					error.message === 'NETWORK ERROR'
						? 'Network Error, please wait a moment and then refresh the page.'
						: error.message
				}}</h2>

				<h2 v-else class="c-skipShipment__loadingText">{{
					atc['portal.skippingNextShipmentMessage'] ||
					'Skipping your next shipment...'
				}}</h2>

				<second-loader-icon class="c-skipShipment__loadingIcon" />
			</div>
		</div>

		<div v-else class="c-skipShipment">
			<div
				v-if="allDataLoaded && !shipmentSkipped && !isEmptyObject(atc)"
				class="c-skipShipment__loading"
			>
				<h3 class="c-skipShipment__loadingText">{{
					atc['portal.skipNextShipmentMessage'] || 'Skip your next shipment'
				}}</h3>
				<v-button
					:text="atc['buttons.skipShipment'] || 'Skip Shipment'"
					auto
					@click.native="skipShipment"
				/>
			</div>

			<div v-else class="c-skipShipment__loading">
				<second-loader-icon class="c-skipShipment__loadingIcon" />
			</div>
		</div>
	</div>
</template>

<script>
import moment from 'moment'
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import ThankYouBlock from '@components/thank-you-block.vue'
import SecondLoaderIcon from '@components/Icon/second-loader-icon.vue'
import VButton from '@components/v-button.vue'

export default {
	components: {
		ThankYouBlock,
		SecondLoaderIcon,
		VButton,
	},
	data: () => {
		return {
			isLoading: false,
			shipmentSkipped: false,
			error: null,
			initedSkipAction: false,
			multipleSubscriptionUpdates: false,
			multipleSkipValues: [],
			thankYouCharge: null,
		}
	},
	computed: {
		...mapGetters('activeSubscription', ['activeSubscription']),

		...mapState('activeSubscription', ['activeSubscriptionId']),

		...mapState('translations', ['activeLanguageCode', 'atc']),

		allDataLoaded() {
			if (this.activeSubscription && this.activeSubscription.id) {
				return true
			} else {
				return false
			}
		},
	},
	async mounted() {
		const { query } = this.$route
		this.error = null

		if (!query) {
			return
		}

		const {
			skipShipment,
			skipShipmentSubscriptionId,
			skipShipmentQueueId,
			customerId,
		} = query

		try {
			this.GET_SUBSCRIPTIONS(customerId)
		} catch (e) {
			console.error({ e })
		}

		if (!skipShipment || !skipShipmentSubscriptionId) {
			return this.$nuxt.error({
				statusCode: 404,
				message: `Skip Shipment parameters are missing. skipShipment: ${skipShipment}, skipShipmentSubscriptionId: ${skipShipmentSubscriptionId}`,
			})
		}

		// if multiple ids save all of them
		if (skipShipmentSubscriptionId.indexOf(',') > -1) {
			this.multipleSubscriptionUpdates = true
			let subIds = skipShipmentSubscriptionId.split(',')
			let queueIds = skipShipmentQueueId.split(',')

			// set multiple queu/sub combos for multiple manual passed id requests
			subIds.forEach((subId, index) => {
				this.multipleSkipValues.push({
					subscriptionId: parseInt(subIds[index]),
					queueId: parseInt(queueIds[index]),
				})
			})

			// set first for display purposes
			this.setActiveSubscriptionId(subIds[0])
		}

		// only one subscription skip
		else {
			this.setActiveSubscriptionId(parseInt(skipShipmentSubscriptionId))
		}
	},

	methods: {
		...mapActions('subscriptions', [
			'UPDATE_SUBSCRIPTION_QUEUE',
			'GET_SUBSCRIPTIONS',
		]),

		...mapMutations('activeSubscription', ['setActiveSubscriptionId']),

		...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),

		async skipShipment() {
			const {
				activeSubscription,
				multipleSkipValues,
				multipleSubscriptionUpdates,
			} = this

			const { next, interval, period } = activeSubscription

			if (!next) {
				return false
			}

			this.initedSkipAction = true

			const currentDate = next.date

			const newDate = moment(currentDate)
				.add(interval, period)
				.format('YYYYMMDDHHmmss')

			let requestPayload = {
				newDate,
				currentDate,
			}
			let analyticsPayload = {
				newDate,
				oldDate: currentDate,
			}

			this.drawerStatus = 'PENDING'
			try {
				// all updates
				if (multipleSubscriptionUpdates) {
					const updatedCharges = await Promise.all(
						multipleSkipValues.map((valObj) =>
							this.UPDATE_SUBSCRIPTION_QUEUE({
								...requestPayload,
								subscriptionId: valObj.subscriptionId,
								queueId: valObj.queueId,
							})
						)
					)
					this.thankYouCharge = updatedCharges
					// http://localhost:3000/#/skip-shipment?storeDomain=upscribe-demo.myshopify.com&customerId=1051286306867&skipShipmentSubscriptionId=556,558&skipShipmentQueueId=3137,2512&skipShipment=true
				}
				// single update
				else {
					const updatedCharge = await this.UPDATE_SUBSCRIPTION_QUEUE(
						requestPayload
					)
					this.thankYouCharge = updatedCharge
				}
				this.triggerAnalyticsEvent({
					event: 'Upscribe Skip Shipment',
					payload: analyticsPayload,
				})
				this.shipmentSkipped = true
				// this.removeSkipShipmentUrlParams()
			} catch (e) {
				this.error = { state: 'FAILURE', message: e.message }
				console.error('subscription/UPDATE_SUBSCRIPTION error: ', e)
			}
		},

		removeSkipShipmentUrlParams() {
			const { removeParam } = this
			let newUrl = window.location.href

			newUrl = removeParam('skipShipment', newUrl)
			newUrl = removeParam('skipShipmentSubscriptionId', newUrl)

			window.history.pushState({}, document.title, '/' + newUrl)
		},
	},
}
</script>

<style lang="scss">
@import '@design';

.c-skipShipment {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 100%;
}

.c-skipShipment__thankYou {
	width: 100%;
}

.c-skipShipment__loading {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	max-width: 500px;
	min-height: 50vh;
	padding: 20px;
	margin-top: 40px;
	text-align: center;
}

.c-skipShipment__loadingText {
	margin-bottom: 30px;
	line-height: 1.5;
}
</style>
