<template>
	<div
		v-if="subscriptions && !isEmptyObject(subscriptions) && windowWidth >= 768"
		class="c-subscriptionPicker__container"
	>
		<div
			class="c-subscriptionPicker o-container"
			:class="{
				'c-subscriptionPicker--singleSub':
					Object.keys(editableSubscriptions).length === 1,
			}"
		>
			<a
				v-for="subscription in currentSubscriptions"
				:key="subscription.id"
				:data-id="subscription.id"
				class="c-subscriptionPicker__option"
				:class="{
					'c-subscriptionPicker__option--active':
						subscription.id == activeSubscriptionId,
					'c-subscriptionPicker__option--inactive': !subscription.active,
				}"
				@click.prevent="swapAndSetSubscription(subscription.id, false, false)"
			>
				{{ atc['labels.subscription'] || 'Subscription' }}
				{{ subscription.name || subscription.id }}
				{{ shipmentDate(subscription) && '-' }}
				{{ shipmentDate(subscription) }}
			</a>
		</div>
	</div>

	<!-- Mobile Subscription -->

	<div v-else class="c-subscriptionPicker--mobile">
		<div class="c-subscriptionPicker--mobile-container">
			<nuxt-link
				v-for="subscription in currentSubscriptions
					.slice()
					.splice(0, mobileSubscriptionEnd)"
				:key="subscription.id"
				:data-id="subscription.id"
				class="c-subscriptionPicker__option c-subscriptionPicker__option--mobile"
				:to="{
					query: {
						template: 'default',
						...currentRoute,
						storeDomain,
						customerId,
					},
				}"
				@click.native.prevent="setActiveSubscriptionId(subscription.id)"
			>
				{{ atc['labels.subscription'] || 'Subscription' }}
				{{ subscription.id }} <span>{{ shipmentDate(subscription) }}</span>

				<icon-chevron-right
					class="c-subscriptionPicker__chev c-subscriptionPicker__chev--mobile"
				/>
			</nuxt-link>
		</div>

		<div
			v-if="
				!isMobileDropDownOpen &&
				currentSubscriptions.length > mobileSubscriptionEnd
			"
			class="c-subscriptionPicker--mobile-button-contain"
		>
			<v-button
				class="c-subscriptionPicker__option c-subscriptionPicker__option--button c-subscriptionPicker__option--button-mobile"
				@onClick="openMobileDropDown"
			>
				Show More
			</v-button>
		</div>
	</div>
</template>

<script>
import { mapMutations, mapState, mapGetters, mapActions } from 'vuex'
import moment from 'moment'
import { windowSizes } from '@mixins/windowSizes'
import IconChevronRight from '@components/Icon/icon-chevron-right.vue'
import VButton from '@components/v-button.vue'

export default {
	components: {
		IconChevronRight,
		VButton,
	},

	mixins: [windowSizes],

	props: {
		query: {
			type: String,
			default: '',
		},
	},

	data() {
		return {
			isToggling: false,
			subscriptionStart: 0,
			deleteCount: 2,
			currentSubscriptionWithoutActive: [],
			mobileSubscriptionEnd: 3,
			isMobileDropDownOpen: false,
		}
	},

	computed: {
		...mapGetters('subscriptions', [
			'subscriptionActive',
			'subscriptionInActive',
		]),

		...mapState('translations', ['atc']),

		...mapState('subscriptions', ['subscriptions']),

		...mapState('route', ['storeDomain', 'customerId']),

		...mapState('activeSubscription', ['activeSubscriptionId']),

		...mapGetters('activeSubscription', ['activeSubscription']),

		editableSubscriptions() {
			const { subscriptions } = this
			return subscriptions
			// const editable = {}
			// Object.keys(subscriptions).forEach((subscriptionKey) => {
			//   const subscription = subscriptions[subscriptionKey]
			//   if (subscription.active) {
			//     editable[subscriptionKey] = subscription
			//   }
			//   // trial subscription inactive
			//   else if (!subscription.active && subscription.charge_limit > 1 && subscription.cancellation_reason === 'Trial period has expired') {
			//     editable[subscriptionKey] = subscription
			//   }

			//   // trial onetime subscription inactive
			//   else if (!subscription.active && !subscription.charge_limit && subscription.cancellation_reason === 'Trial period has expired') {
			//     editable[subscriptionKey] = subscription
			//   }
			// })
			// return editables
		},

		currentSubscriptions() {
			const { subscriptionActive, subscriptionInActive } = this
			return this.query === 'cancelledSubscriptions'
				? subscriptionInActive
				: subscriptionActive
		},

		currentRoute() {
			return this.query === 'cancelledSubscriptions'
				? { route: 'cancelledSubscriptions' }
				: {}
		},

		showingSubscriptions() {
			return this.currentSubscriptions
				.slice()
				.splice(this.subscriptionStart, this.deleteCount)
		},

		dropDownLength() {
			return (
				this.currentSubscriptions.length -
				(this.subscriptionStart === this.currentSubscriptions.length - 1
					? 1
					: 2)
			)
		},
	},

	watch: {
		activeSubscriptionId: {
			// handler: 'GET_SUBSCRIPTION_SHIPPING_METHODS',
			handler: 'resetSubscriptionSettings',
			immediate: true,
		},
	},

	mounted() {
		const {
			subscriptionActive,
			subscriptionInActive,
			activeSubscriptionId,
		} = this

		if (
			((subscriptionActive && subscriptionActive.length) ||
				(subscriptionInActive && subscriptionInActive.length)) &&
			!activeSubscriptionId
		) {
			if (subscriptionActive && subscriptionActive.length) {
				this.setActiveSubscriptionId(subscriptionActive[0].id)
			} else {
				this.setActiveSubscriptionId(subscriptionInActive[0].id)
			}
		}
	},

	methods: {
		...mapMutations('activeSubscription', ['setActiveSubscriptionId']),

		...mapActions('orders', ['GET_SUBSCRIPTION_ORDERS']),

		...mapMutations('shippingMethods', ['clearShippingMethods']),

		...mapActions('editMode', ['setEditNextOrder']),

		// reset settings when changing tabs to give fresh setup
		resetSubscriptionSettings() {
			this.clearShippingMethods()
			if (!this.$route.query.editNextOrder) {
				this.setEditNextOrder(false)
			}
		},

		toggleDropDown() {
			this.isToggling = !this.isToggling
		},

		swapAndSetSubscription(subscriptionId, index, needToggled) {
			if (index || index === 0) {
				this.subscriptionStart = index
			}

			this.$router.push({
				name: 'index',
				query: {
					storeDomain: this.storeDomain,
					customerId: this.customerId,
					subscriptionId: subscriptionId,
					...(this.$route.query.editNextOrder
						? { editNextOrder: this.$route.query.editNextOrder }
						: {}),
				},
			})
			// this.setActiveSubscriptionId(subscriptionId)
			this.GET_SUBSCRIPTION_ORDERS(this.activeSubscription.shopify_order_id)
		},

		openMobileDropDown() {
			this.isMobileDropDownOpen = true
			this.mobileSubscriptionEnd = this.currentSubscriptions.length
		},

		shipmentDate(subscription) {
			if (!subscription || !subscription.next || !subscription.next.date) return
			const date = subscription.next.date

			if (!moment(date, 'MMMM-DD-YYYY').isValid()) {
				return ''
			} else {
				return moment(date, 'YYYYMMDD').format('MMM Do')
			}
		},
	},
}
</script>

<style lang="scss">
@import '@design';

.c-subscriptionPicker__container {
	background-color: $color-white;
}

.c-subscriptionPicker--mobile {
	padding: 0 16px;

	@media (min-width: 420px) {
		padding: 0;
	}
}

.c-subscriptionPicker {
	display: flex;
	padding: 0 20px;
	margin: 0 auto 0;
	overflow-x: scroll;

	@include bp(tablet) {
		padding: 0 32px;
	}

	@include bp(desktop) {
		justify-content: center;
		height: 90px;
		padding: 0;
	}

	&--singleSub {
		display: none;
	}
}

.c-subscriptionPicker__option {
	margin-right: 25px;
	font-size: 14px;
	line-height: 65px;
	color: $color-black;
	text-align: center;
	text-decoration: none;
	white-space: nowrap;
	cursor: pointer;
	border-bottom: 3px solid transparent;
	border-bottom: 3px solid transparent;

	&--active,
	&:hover {
		@include border-focus;
	}

	&--active {
		font-weight: bold;
	}

	&--hidden {
		display: none;
	}

	&--button {
		padding-right: 0;
		margin-right: 0;
		cursor: pointer;
		background: transparent;
		border: none;
		border-bottom: 3px solid transparent;

		&:hover {
			// border-bottom: 3px solid transparent;
			border-bottom: 3px solid $color-blue-brand;
		}
	}
}

.c-subscriptionPicker__dropdown-contain {
	position: relative;
	display: inline-block;
	background-color: transparent;
}

.c-subscriptionPicker__dropdown {
	position: absolute;
	z-index: 100;
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 100%;
	background-color: $color-white;

	&--hidden {
		z-index: -1;
		visibility: hidden;
	}

	&--active {
		z-index: 100;
		visibility: visible;
	}
}

.c-subscriptionPicker__dropdown--option {
	width: 100%;
	margin-right: 0;
	margin-bottom: 10px;

	&:last-child {
		margin-bottom: 0;
	}
}

.c-subscriptionPicker__chev {
	width: 12px;
	height: 11px;
	margin-left: 2px;

	&--up {
		transform: rotate(-90deg);
	}

	&--down {
		transform: rotate(90deg);
	}
}

.c-subscriptionPicker--mobile-container {
	display: flex;
	flex-direction: column;
	margin-top: 30px;
}

.c-subscriptionPicker__option--mobile {
	position: relative;
	width: 100%;
	padding: 17px 16px;
	margin: 0 auto;
	font-size: 16px;
	font-weight: bold;
	line-height: 21px;
	text-align: left;
	background-color: $color-white;
	border: 1px solid $color-blue-light-border;
	border-radius: 4px;

	span {
		margin-left: 5px;
		font-weight: 400;
		color: $color-blue-secondary;
	}

	&:hover {
		border: 1px solid $color-blue-light-border;
	}
}

.c-subscriptionPicker__chev--mobile {
	position: absolute;
	top: 50%;
	right: 20px;
	fill: #a3b5bf;
	transform: translateY(-50%);
}

.c-subscriptionPicker--mobile-button-contain {
	width: 100%;
	margin: 24px auto 0;
}

.c-subscriptionPicker__option--button-mobile {
	width: 100%;
	font-weight: bold;
	text-transform: uppercase;
	background-color: $color-white;
	border: 1px solid $color-blue-light-border;
	border-radius: 4px;

	&:hover {
		background-color: $color-white;
	}
}
</style>
