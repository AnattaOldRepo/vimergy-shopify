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
      const { editNextOrder, activeSubscription, activeQueue } = this

      if (editNextOrder) {
        return activeQueue.items
      } else {
        return activeSubscription.items
      }
    },

    // shows only the products which are part of next items and are subscription without any change in quantity
    subscriptionProducts() {
      if (this.editNextOrder) {
        let subscriptionItems = []
        this.activeSubscription.items.forEach((item) => {
          const otpProduct = this.activeSubscription.next.items.find(
            (otp) => otp.variant_id === item.variant_id
          )
          if (otpProduct && otpProduct.quantity === item.quantity) {
            subscriptionItems.push(item)
          }
        })
        return subscriptionItems
      }
      return this.activeSubscription.items
    },

    oneTimeProducts() {
      let otp = []
      const variantIdArray = this.activeSubscription.items.map(
        (item) => item.variant_id
      )

      // if variant id does not match it is obviously a OTP
      this.activeSubscription.next.items.forEach((item) => {
        if (!variantIdArray.includes(item.variant_id)) {
          otp.push(item)
        } else {
          const subscriptionProduct = this.activeSubscription.items.find(
            (subscriptionProduct) =>
              subscriptionProduct.variant_id === item.variant_id
          )
          if (subscriptionProduct.quantity !== item.quantity) {
            otp.push(item)
          }
        }
      })

      return otp
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
      if (e && e.data && e.data.shipping_update_required) {
        this.SET_SHIPPING_METHODS(e.data.rates)
        this.setSavedNewCheckoutUpdate(handleNewCheckoutUpdatePayload)

        this.$emit('setMode', 'shipping-method-list')
        this.$emit('setDrawerStatus', false)
      } else {
        console.error('subscription/UPDATE_SUBSCRIPTION error: ', e)
        this.$emit('setDrawerStatus', { state: 'FAILURE', message: e.message })
      }
    },

    async handleQuantityChangeManual({ quantity, id, product }) {
      const { editNextOrder, activeSubscription, atc } = this

      const { setQuantityPayload: nextItemPayload } = productChangeRequest({
        quantity,
        id,
        variantId: product.variant_id,
        editNextOrder: true,
        subscription: activeSubscription,
      })

      const {
        setQuantityPayload: subscriptionItemPayload,
      } = productChangeRequest({
        quantity,
        id,
        variantId: product.variant_id,
        editNextOrder: false,
        subscription: activeSubscription,
      })

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

      this.updatingId = id
      this.quantityUpdating = true

      let handleNewCheckoutUpdatePayload
      let analyticsEventName

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
            'queues',
            'UPDATE_NEXT_ORDER',
            atc['notices.quantityUpdatedToXOnNextOrder'] ? atc['notices.quantityUpdatedToXOnNextOrder'].replace('<quantity>', quantity) : `Quantity updated to ${quantity} on next order.`
          ),
        ]
      } else {
        analyticsEventName = 'Upscribe Subscription Product Quantity Change'

        handleNewCheckoutUpdatePayload = [
          buildNewCheckoutUpdatePayload(
            this.UPDATE_SUBSCRIPTION(updateSubscriptionPayload),
            updateSubscriptionPayload,
            'subscriptions',
            'UPDATE_SUBSCRIPTION',
            atc['notices.quantityUpdatedToXOnSubscription'] ? atc['notices.quantityUpdatedToXOnSubscription'].replace('<quantity>', quantity): `Quantity updated to ${quantity} on subscription.`
          ),
        ]
      }

      this.$emit('setDrawerStatus', 'PENDING')

      // hande everything in handleNewCheckoutUpdate function
      try {
        await this.handleNewCheckoutUpdate(handleNewCheckoutUpdatePayload)
        if (!editNextOrder) {
          this.$toast.info(
            atc['portal.nextShipmentResetFromSubscriptionChange'] || 'Changing Subscription Settings resets your next shipment.',
            { duration: 5000 }
          )
        }
      } catch(e) {
        console.error(e)
      }

      this.triggerAnalyticsEvent({
        event: analyticsEventName,
        payload: analyticsPayload,
      })

      // this.$emit('setMode', 'edit')
      this.$emit('setDrawerStatus', 'SUCCESS')
    },

    async handleQuantityChange({ type, id, quantity, variant_id, product }) {
      if (this.updating) return

      const { editNextOrder, activeSubscription, atc } = this

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
            atc['notices.quantityUpdatedToXOnNextOrder'] ? atc['notices.quantityUpdatedToXOnNextOrder'].replace('<quantity>', quantity) : `Quantity updated to ${quantity} on next order.`
          ),
        ]
      } else {
        analyticsEventName = 'Upscribe Subscription Product Quantity Change'

        handleNewCheckoutUpdatePayload = [
          buildNewCheckoutUpdatePayload(
            this.UPDATE_SUBSCRIPTION(updateSubscriptionPayload),
            updateSubscriptionPayload,
            'subscriptions',
            'UPDATE_SUBSCRIPTION',
            atc['notices.quantityUpdatedToXOnSubscription'] ? atc['notices.quantityUpdatedToXOnSubscription'].replace('<quantity>', quantity): `Quantity updated to ${quantity} on subscription.`
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

      this.$emit('setDrawerStatus', 'SUCCESS')
    },

    async handleRemove(product) {
      const { atc } = this
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
        analyticsEventName = 'Upscribe Next Order Product Removed'

        handleNewCheckoutUpdatePayload = [
          buildNewCheckoutUpdatePayload(
            this.UPDATE_NEXT_ORDER(nextOrderUpdatePayload),
            nextOrderUpdatePayload,
            'subscriptions',
            'UPDATE_NEXT_ORDER',
            atc['notices.productRemovedFromNextOrder'] || `Product removed from next order.`
          ),
        ]
      } else {
        analyticsEventName = 'Upscribe Subscription Product Removed'

        handleNewCheckoutUpdatePayload = [
          buildNewCheckoutUpdatePayload(
            this.UPDATE_SUBSCRIPTION(updateSubscriptionPayload),
            updateSubscriptionPayload,
            'subscriptions',
            'UPDATE_SUBSCRIPTION',
            atc['notices.productRemovedFromSubscription'] || `Product removed from subscription`
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

    async handleAddProductVariantToSubscription({
      variantId,
      product,
      addToNextOrder,
    }) {
      const { activeSubscription, variantSelectProduct, atc } = this

      const { addPayload: nextAddItemPayload } = productChangeRequest({
        variantId,
        editNextOrder: true,
        subscription: activeSubscription,
      })

      const { addPayload: subscriptionAddItemPayload } = productChangeRequest({
        variantId,
        editNextOrder: false,
        subscription: activeSubscription,
      })

      const updateSubscriptionPayload = {
        requestPayload: {
          items: subscriptionAddItemPayload
            ? [subscriptionAddItemPayload]
            : undefined,
        },
      }

      const nextOrderUpdatePayload = {
        requestPayload: {
          items: nextAddItemPayload ? [nextAddItemPayload] : undefined,
        },
      }

      let analyticsEventName, handleNewCheckoutUpdatePayload

      if (addToNextOrder) {
        analyticsEventName = 'Upscribe Next Order Product Add'

        handleNewCheckoutUpdatePayload = [
          buildNewCheckoutUpdatePayload(
            this.UPDATE_NEXT_ORDER(nextOrderUpdatePayload),
            nextOrderUpdatePayload,
            'subscriptions',
            'UPDATE_NEXT_ORDER',
            atc['notices.productAddedToSubscription'] || `Product added to subscription`

          ),
        ]
      } else {
        analyticsEventName = 'Upscribe Subscription Product Add'

        handleNewCheckoutUpdatePayload = [
          buildNewCheckoutUpdatePayload(
            this.UPDATE_SUBSCRIPTION(updateSubscriptionPayload),
            updateSubscriptionPayload,
            'subscriptions',
            'UPDATE_SUBSCRIPTION',
            atc['notices.productAddedToNextOrder'] || `Product added to next order`

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
        payload: { product: variantSelectProduct },
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
      v-if="
        activeSubscription.interval &&
          activeSubscription.period &&
          subscriptionProducts.length
      "
      class="c-drawer__subtitle"
      >{{
        atc['portal.editProductsDrawerInfoText'] || 'These products ship every'
      }}
      {{ activeSubscription.interval }} {{ intervalUnitDisplay }}</p
    >

    <div class="c-drawerDeliveryFrequency__options">
      <drawer-product-block
        v-for="(product, index) in subscriptionProducts"
        :key="product.id + '-' + index"
        :product="product"
        :remove="subscriptionProducts.length > 1"
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

    <p v-if="editNextOrder && oneTimeProducts.length" class="c-drawer__subtitle"
      >{{
        atc['portal.productsShipNextOrderOnly'] ||
          'These products ship one-time in your next shipment only'
      }}
    </p>

    <div
      v-if="editNextOrder && oneTimeProducts.length"
      class="c-drawerDeliveryFrequency__options"
    >
      <drawer-product-block
        v-for="(product, index) in oneTimeProducts"
        :key="product.id + '-' + index"
        :product="product"
        :remove="oneTimeProducts.length > 1"
        swap
        quantity
        existing-product
        :updating="updating"
        @swapProduct="handleSwapProduct"
        @removeProduct="handleRemove"
        @quantityChange="handleQuantityChange"
        @quantityChangeManual="handleQuantityChangeManual"
        @subscribe="handleAddProductVariantToSubscription"
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
