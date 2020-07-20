<script>
import { mapGetters, mapMutations, mapState, mapActions } from 'vuex'
import DrawerProductBlock from '@components/drawer-product-block.vue'
import VButton from '@components/v-button.vue'
import productChangeRequest from '@utils/product-change-request.js'
import { buildNewCheckoutUpdatePayload } from '@utils/newCheckoutUpdateHelpers'

export default {
	components: {
		DrawerProductBlock,
		VButton,
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
			'activeQueue',
		]),

		...mapState('editMode', ['editNextOrder']),

    ...mapState('products', ['products', 'productImages']),

intervalUnitDisplay() {
      const { activeSubscription, atc } = this
      let intervalUnit = activeSubscription.period
      let plural = activeSubscription.interval > 1

      let displayUnit = ''
      if (intervalUnit === 'day') {
        if (plural) {
          displayUnit = atc['date-time.days-unit'] || 'days'
        } else {
          displayUnit = atc['date-time.day-unit'] || 'day'
        }
      } else if (intervalUnit === 'week') {
        if (plural) {
          displayUnit = atc['date-time.weeks-unit'] || 'weeks'
        } else {
          displayUnit = atc['date-time.week-unit'] || 'week'
        }
      } else if (intervalUnit === 'month') {
        if (plural) {
          displayUnit = atc['date-time.months-unit'] || 'months'
        } else {
          displayUnit = atc['date-time.month-unit'] || 'month'
        }
      } else {
        displayUnit = atc['date-time.days-unit'] || 'days'
      }
      return displayUnit
    },

		activeSubscriptionProducts() {
			const { editNextOrder, activeSubscription, activeQueue } = this

			if (editNextOrder) {
				return activeQueue.items
			} else {
				return activeSubscription.items
			}
		},
	},
	methods: {
		...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),

		...mapMutations('swapProduct', ['setSwapProduct']),

		...mapActions('subscriptions', [
			'UPDATE_SUBSCRIPTION',
			'UPDATE_NEXT_ORDER',
		]),

		...mapMutations('newCheckoutUpdates', ['setSavedNewCheckoutUpdate']),

		...mapMutations('subscriptions', ['setSavedProductUpdatePayload']),

		...mapMutations('shippingMethods', ['SET_SHIPPING_METHODS']),

		handleSwapProduct(product) {
			if (this.updating) return
			this.setSwapProduct(product)
			this.$emit('setMode', 'swap')
		},

		handleNewCheckoutUpdate(updateArray) {
			console.log('handleNewCheckoutUpdate')

			return new Promise((resolve, reject) => {
				let updateCount = updateArray.length
				let updatesFinished = 0

				// for each update
				updateArray.forEach(async (update) => {
					try {
						await update.updateAction
						// this.$toasted.global.success({
						//   message: update.successMessage,
						// })
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
			console.log('e', e)
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

    async handleQuantityChangeManual({quantity, id, product}) {
     const { editNextOrder } = this

      if (this.updating) return


      const finalPayload = {
        requestPayload: {
          items: [{quantity, id}],
        },
      }

      this.updatingId = id
      this.quantityUpdating = true

       let handleNewCheckoutUpdatePayload, analyticsEventName
      let analyticsPayload = {
        quantity,
        ...product,
      }

      if (editNextOrder) {
        // updateMessage = `Quantity updated to ${quantity} on next order.`
        analyticsEventName = 'Upscribe Next Order Product Quantity Change'

        handleNewCheckoutUpdatePayload = [
          buildNewCheckoutUpdatePayload(
            this.UPDATE_NEXT_ORDER(finalPayload),
            finalPayload,
            'subscriptions',
            'UPDATE_NEXT_ORDER',
            `Quantity updated to ${quantity} on next order.`
          ),
        ]

      } else {
        // updateMessage = `Quantity updated to ${quantity}.`
        analyticsEventName = 'Upscribe Subscription Product Quantity Change'

        handleNewCheckoutUpdatePayload = [
          buildNewCheckoutUpdatePayload(
            this.UPDATE_NEXT_ORDER(finalPayload),
            finalPayload,
            'subscriptions',
            'UPDATE_NEXT_ORDER',
            `Quantity updated to ${quantity} on next order.`
          ),
          buildNewCheckoutUpdatePayload(
            this.UPDATE_SUBSCRIPTION(finalPayload),
            finalPayload,
            'subscriptions',
            'UPDATE_SUBSCRIPTION',
            `Quantity updated to ${quantity} on subscription.`,
          ),
        ]
      }

      this.$emit('setDrawerStatus', 'PENDING')

      // hande everything in handleNewCheckoutUpdate function
      await this.handleNewCheckoutUpdate(handleNewCheckoutUpdatePayload)

      this.triggerAnalyticsEvent({
        event: analyticsEventName,
        payload: analyticsPayload,
      })

      // this.$emit('setMode', 'edit')
      this.$emit('setDrawerStatus', 'SUCCESS')
    },



		async handleQuantityChange({ type, id, quantity, variant_id, product }) {
			if (this.updating) return

			const { editNextOrder, activeSubscription } = this

			const {
				increasePayload: nextIncreaseItemPayload,
				decreasePayload: nextDecreaseItemPayload,
			} = productChangeRequest({
				variantId: variant_id,
				editNextOrder: true,
				subscription: activeSubscription,
			})

			const {
				increasePayload: subscriptionIncreaseItemPayload,
				decreasePayload: subscriptionDecreaseItemPayload,
			} = productChangeRequest({
				variantId: variant_id,
				editNextOrder: false,
				subscription: activeSubscription,
			})

			// console.log({nextIncreaseItemPayload, nextDecreaseItemPayload})
			// console.log({subscriptionIncreaseItemPayload, subscriptionDecreaseItemPayload})

			// determine increase or decrease payload by the type param
			// coming from the quantity change event
			const subscriptionItemPayload =
				type === 'increase'
					? subscriptionIncreaseItemPayload
					: subscriptionDecreaseItemPayload
			const nextItemPayload =
				type === 'increase' ? nextIncreaseItemPayload : nextDecreaseItemPayload

			const updateSubscriptionPayload = {
				requestPayload: {
					items: subscriptionItemPayload
						? [subscriptionItemPayload]
						: undefined,
				},
			}

			const nextOrderUpdatePayload = {
				requestPayload: {
					items: nextItemPayload ? [nextItemPayload] : undefined,
				},
			}

			let handleNewCheckoutUpdatePayload, analyticsEventName
			let analyticsPayload = {
				quantity,
				...product,
			}

			if (editNextOrder) {
				// updateMessage = `Quantity updated to ${quantity} on next order.`
				analyticsEventName = 'Upscribe Next Order Product Quantity Change'

				handleNewCheckoutUpdatePayload = [
					buildNewCheckoutUpdatePayload(
						this.UPDATE_NEXT_ORDER(nextOrderUpdatePayload),
						nextOrderUpdatePayload,
						'subscriptions',
						'UPDATE_NEXT_ORDER',
						`Quantity updated to ${quantity} on next order.`
					),
				]
			} else {
				// updateMessage = `Quantity updated to ${quantity}.`
				analyticsEventName = 'Upscribe Subscription Product Quantity Change'

				handleNewCheckoutUpdatePayload = [
					buildNewCheckoutUpdatePayload(
						this.UPDATE_NEXT_ORDER(nextOrderUpdatePayload),
						nextOrderUpdatePayload,
						'subscriptions',
						'UPDATE_NEXT_ORDER',
						`Quantity updated to ${quantity} on next order.`
					),
					buildNewCheckoutUpdatePayload(
						this.UPDATE_SUBSCRIPTION(updateSubscriptionPayload),
						updateSubscriptionPayload,
						'subscriptions',
						'UPDATE_SUBSCRIPTION',
						`Quantity updated to ${quantity} on subscription.`
					),
				]
			}

			this.$emit('setDrawerStatus', 'PENDING')

			// hande everything in handleNewCheckoutUpdate function
			await this.handleNewCheckoutUpdate(handleNewCheckoutUpdatePayload)

			this.triggerAnalyticsEvent({
				event: analyticsEventName,
				payload: analyticsPayload,
			})

			// this.$emit('setMode', 'edit')
			this.$emit('setDrawerStatus', 'SUCCESS')
		},

		async handleRemove(product) {
			if (this.updating) return

			const { activeSubscription, activeQueue, editNextOrder } = this

			const itemCount = editNextOrder
				? activeQueue.items.length
				: activeSubscription.items.length

			if (itemCount <= 1) {
				this.$router.push({
					name: 'cancel',
				})
			}

			const { removePayload: nextRemoveItemPayload } = productChangeRequest({
				variantId: product.variant_id,
				editNextOrder: true,
				subscription: activeSubscription,
			})

			const {
				removePayload: subscriptionRemoveItemPayload,
			} = productChangeRequest({
				variantId: product.variant_id,
				editNextOrder: false,
				subscription: activeSubscription,
			})

			// console.log({ nextRemoveItemPayload })
			// console.log({ subscriptionRemoveItemPayload })

			const updateSubscriptionPayload = {
				requestPayload: {
					items: subscriptionRemoveItemPayload
						? [subscriptionRemoveItemPayload]
						: undefined,
				},
			}

			const nextOrderUpdatePayload = {
				requestPayload: {
					items: nextRemoveItemPayload ? [nextRemoveItemPayload] : undefined,
				},
			}

			let handleNewCheckoutUpdatePayload, analyticsEventName

			if (editNextOrder) {
				analyticsEventName = 'Upscribe Next Order Product Remove'

				handleNewCheckoutUpdatePayload = [
					buildNewCheckoutUpdatePayload(
						this.UPDATE_NEXT_ORDER(nextOrderUpdatePayload),
						nextOrderUpdatePayload,
						'subscriptions',
						'UPDATE_NEXT_ORDER',
						`Product removed from next order.`
					),
				]
			} else {
				analyticsEventName = 'Upscribe Subscription Product Remove'

				handleNewCheckoutUpdatePayload = [
					buildNewCheckoutUpdatePayload(
						this.UPDATE_NEXT_ORDER(nextOrderUpdatePayload),
						nextOrderUpdatePayload,
						'subscriptions',
						'UPDATE_NEXT_ORDER',
						`Product removed from next order.`
					),
					buildNewCheckoutUpdatePayload(
						this.UPDATE_SUBSCRIPTION(updateSubscriptionPayload),
						updateSubscriptionPayload,
						'subscriptions',
						'UPDATE_SUBSCRIPTION',
						`Product removed from subscription`
					),
				]
			}

			// this.removeUpdating = false
			// this.updatingId = null
			this.$emit('setDrawerStatus', 'PENDING')

			// hande everything in handleNewCheckoutUpdate function
			await this.handleNewCheckoutUpdate(handleNewCheckoutUpdatePayload)

			this.$emit('setDrawerStatus', 'SUCCESS')
			this.$emit('setMode', 'edit')
			this.triggerAnalyticsEvent({
				event: analyticsEventName,
				payload: { product },
			})
		},
	},
}
</script>

<template>
	<div>
		<h2 class="c-drawer__title">{{
			atc['portal.editProductsDrawerTitle'] || 'Edit Products'
		}}</h2>

		<p
			v-if="activeSubscription.interval && activeSubscription.period"
			class="c-drawer__subtitle"
			>{{
				atc['portal.editProductsDrawerInfoText'] || 'These products ship every'
			}}
			{{ activeSubscription.interval }} {{ intervalUnitDisplay }}</p
		>

		<div class="c-drawerDeliveryFrequency__options">
			<drawer-product-block
				v-for="(product, index) in activeSubscriptionProducts"
				:key="product.id + '-' + index"
				:product="product"
				:remove="activeSubscriptionProducts.length > 1"
				swap
				quantity
				existing-product
				:updating="updating"
				@swapProduct="handleSwapProduct"
				@removeProduct="handleRemove"
				@quantityChange="handleQuantityChange"
        @quantityChangeManual="handleQuantityChangeManual"
			/>
		</div>

		<div class="c-drawer__actionButtons">
			<v-button
				class="c-form__submitButton"
				type="submit"
				@onClick="$emit('setMode', 'add')"
				>{{ atc['buttons.addProducts'] || 'Add Products' }}
			</v-button>
		</div>
	</div>
</template>
