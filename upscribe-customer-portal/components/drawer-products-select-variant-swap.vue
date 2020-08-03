<script>
import { mapActions, mapState, mapMutations, mapGetters } from 'vuex'
import VariantSelectBlock from '@components/variant-select-block.vue'
import VButton from '@components/v-button.vue'
import DrawerProductBlock from '@components/drawer-product-block.vue'
import productChangeRequest from '@utils/product-change-request.js'
import { buildNewCheckoutUpdatePayload } from '@utils/newCheckoutUpdateHelpers'

export default {
	components: {
		VariantSelectBlock,
		VButton,
		DrawerProductBlock,
	},
	props: {
		updating: {
			type: Boolean,
			default: false,
		},
	},
	computed: {
		...mapState('translations', ['atc']),

		...mapGetters('activeSubscription', [
			'activeSubscription',
			'activeSubscriptionNextOrder',
		]),

		...mapState('products', ['products', 'productImages']),

		...mapState('swapProduct', ['swapProduct']),

		...mapState('variantSelectProduct', ['variantSelectProduct']),

    ...mapState('editMode', ['editNextOrder']),

    intervalUnitDisplay() {
      const { activeSubscription, atc } = this
      let intervalUnit = activeSubscription.period
      let plural = activeSubscription.interval > 1

      let displayUnit = ''
      if (intervalUnit.indexOf('day') > -1) {
        if (plural) {
          displayUnit = atc['date-time.days-unit'] || 'days'
        } else {
          displayUnit = atc['date-time.day-unit'] || 'day'
        }
      } else if (intervalUnit.indexOf('week') > -1) {
        if (plural) {
          displayUnit = atc['date-time.weeks-unit'] || 'weeks'
        } else {
          displayUnit = atc['date-time.week-unit'] || 'week'
        }
      } else if (intervalUnit.indexOf('month') > -1) {
        if (plural) {
          displayUnit = atc['date-time.months-unit'] || 'months'
        } else {
          displayUnit = atc['date-time.month-unit'] || 'month'
        }
      } else {
        displayUnit = intervalUnit
      }
      return displayUnit
    },

		activeSubscriptionProducts() {
			return this.activeSubscription.items
		},
	},
	methods: {
		...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),

		...mapActions('subscriptions', [
			'UPDATE_SUBSCRIPTION',
			'UPDATE_NEXT_ORDER',
		]),

		...mapMutations('subscriptions', ['setSavedProductUpdatePayload']),

		...mapMutations('shippingMethods', ['SET_SHIPPING_METHODS']),

		handleNewCheckoutUpdate(updateArray) {
			return new Promise((resolve, reject) => {
				let updateCount = updateArray.length
				let updatesFinished = 0

				// for each update
				updateArray.forEach(async (update) => {
					try {
						await update.updateAction
					} catch (e) {
						this.handleNewCheckoutUpdateError(e, update)
					} finally {
						updatesFinished += 1
					}

					if (updatesFinished === updateCount) {
						resolve(true)
					}
				})
			})
		},

		handleNewCheckoutUpdateError(e, handleNewCheckoutUpdatePayload) {
			console.log('handleNewCheckoutUpdateError: ', e)
			if (e && e.data && e.data.shipping_update_required) {
				this.SET_SHIPPING_METHODS(e.data.rates)
				this.setSavedNewCheckoutUpdate(handleNewCheckoutUpdatePayload)

				this.$emit('setMode', 'shipping-method-list')
				this.$emit('setDrawerStatus', false)
			} else {
				console.log('subscription/UPDATE_SUBSCRIPTION error: ', e)
				this.$emit('setDrawerStatus', { state: 'FAILURE', message: e.message })
			}
		},

		async handleSwapProductVariant({ variantId, product }) {
			if (this.updating) return
			const { editNextOrder, activeSubscription } = this

			const productToReplace = this.swapProduct

			// console.log({productToReplace})
			// console.log({product})

			const { addPayload: nextAddSwapItemPayload } = productChangeRequest({
				variantId,
				editNextOrder: true,
				subscription: activeSubscription,
			})

			const {
				removePayload: nextRemoveSwappedItemPayload,
			} = productChangeRequest({
				variantId: productToReplace.variant_id,
				editNextOrder: true,
				subscription: activeSubscription,
			})

			const {
				addPayload: subscriptionAddSwapItemPayload,
			} = productChangeRequest({
				variantId,
				editNextOrder: false,
				subscription: activeSubscription,
			})

			const {
				removePayload: subscriptionRemoveSwappedItemPayload,
			} = productChangeRequest({
				variantId: productToReplace.variant_id,
				editNextOrder: false,
				subscription: activeSubscription,
			})

			// console.log({nextAddSwapItemPayload, nextRemoveSwappedItemPayload})
			// console.log({subscriptionAddSwapItemPayload, subscriptionRemoveSwappedItemPayload})

			// create next swap payload depending on the diff product upday payload options
			let nextItemPayload = []
			if (!nextAddSwapItemPayload && !nextRemoveSwappedItemPayload) {
				nextItemPayload = false
			} else {
				if (nextAddSwapItemPayload) {
					nextItemPayload = [...nextItemPayload, nextAddSwapItemPayload]
				}
				if (nextRemoveSwappedItemPayload) {
					nextItemPayload = [...nextItemPayload, nextRemoveSwappedItemPayload]
				}
			}

			// create sub swap payload depending on the diff product upday payload options
			let subscriptionItemPayload = []
			if (
				!subscriptionAddSwapItemPayload &&
				!subscriptionRemoveSwappedItemPayload
			) {
				subscriptionItemPayload = false
			} else {
				if (subscriptionAddSwapItemPayload) {
					subscriptionItemPayload = [
						...subscriptionItemPayload,
						subscriptionAddSwapItemPayload,
					]
				}
				if (subscriptionRemoveSwappedItemPayload) {
					subscriptionItemPayload = [
						...subscriptionItemPayload,
						subscriptionRemoveSwappedItemPayload,
					]
				}
			}

			const updateSubscriptionPayload = {
				requestPayload: {
					items: subscriptionItemPayload || undefined,
				},
			}

			const nextOrderUpdatePayload = {
				requestPayload: {
					items: nextItemPayload || undefined,
				},
			}

			let analyticsEventName, handleNewCheckoutUpdatePayload
			let analyticsPayload = {
				newProduct: product,
				oldProduct: productToReplace,
			}

			if (editNextOrder) {
				analyticsEventName = 'Upscribe Next Order Product Swap'

				// updateMessage = `Quantity updated to ${quantity} on next order.`
				handleNewCheckoutUpdatePayload = [
					buildNewCheckoutUpdatePayload(
						this.UPDATE_NEXT_ORDER(nextOrderUpdatePayload),
						nextOrderUpdatePayload,
						'subscriptions',
						'UPDATE_NEXT_ORDER',
						`Product swapped on next order.`
					),
				]
			} else {
				analyticsEventName = 'Upscribe Subscription Product Swap'

				handleNewCheckoutUpdatePayload = [
					buildNewCheckoutUpdatePayload(
						this.UPDATE_NEXT_ORDER(nextOrderUpdatePayload),
						nextOrderUpdatePayload,
						'subscriptions',
						'UPDATE_NEXT_ORDER',
						`Product swapped on next order.`
					),
					buildNewCheckoutUpdatePayload(
						this.UPDATE_SUBSCRIPTION(updateSubscriptionPayload),
						updateSubscriptionPayload,
						'subscriptions',
						'UPDATE_SUBSCRIPTION',
						`Product swapped on subscription.`
					),
				]
			}

			this.$emit('setDrawerStatus', 'PENDING')

			// hande everything in handleNewCheckoutUpdate function
			await this.handleNewCheckoutUpdate(handleNewCheckoutUpdatePayload)

			this.$emit('setDrawerStatus', 'SUCCESS')
			this.$emit('setMode', 'edit')

			this.triggerAnalyticsEvent({
				event: analyticsEventName,
				payload: analyticsPayload,
			})
		},
	},
}
</script>

<template>
	<div>
		<h2 class="c-drawer__title">{{
			atc['portal.selectVariantSwapDrawerTitle'] ||
				'Select Swap Product Options'
		}}</h2>

		<p class="c-drawer__subtitle">{{
			atc['portal.selectVariantCurrentProductLabel'] || 'Current Product'
		}}</p>

		<div class="c-drawerDeliveryFrequency__options">
			<drawer-product-block :product="swapProduct" existing-product />
		</div>

		<p class="c-drawer__subtitle">{{
			atc['portal.selectVariantSwapProductLabel'] || 'Swap Product'
		}}</p>

		<p
			v-if="activeSubscription.interval && activeSubscription.period"
			class="c-drawer__subtitle"
			>{{
				atc['portal.editProductsDrawerInfoText'] ||
					'These product will ship every'
			}}
			{{ activeSubscription.interval }} {{ intervalUnitDisplay }}</p
		>

		<div class="c-drawerDeliveryFrequency__options">
			<variant-select-block
				v-if="variantSelectProduct"
				:product="variantSelectProduct"
				:button-text="atc['buttons.swapProduct'] || 'Swap'"
				variant-action="swap"
				:updating="updating"
				@swapProductVariant="handleSwapProductVariant"
			/>
		</div>

		<div class="c-drawer__actionButtons">
			<v-button
				class="c-form__submitButton"
				type="alt"
				@onClick="$emit('setMode', 'swap')"
				>{{ atc['buttons.cancel'] || 'Cancel' }}</v-button
			>
		</div>
	</div>
</template>
