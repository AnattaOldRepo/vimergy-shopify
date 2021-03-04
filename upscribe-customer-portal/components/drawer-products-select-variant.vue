<script>
import { mapActions, mapState, mapMutations, mapGetters } from 'vuex'
import VariantSelectBlock from '@components/variant-select-block.vue'
import VButton from '@components/v-button.vue'
import productChangeRequest from '@utils/product-change-request.js'
import { buildNewCheckoutUpdatePayload } from '@utils/newCheckoutUpdateHelpers'

export default {
  components: {
    VariantSelectBlock,
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

    ...mapGetters('activeSubscription', ['activeSubscription']),

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
  },
  methods: {
    ...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),

    ...mapActions('subscriptions', [
      'UPDATE_SUBSCRIPTION',
      'UPDATE_NEXT_ORDER',
    ]),

    ...mapMutations('newCheckoutUpdates', ['setSavedNewCheckoutUpdate']),

    ...mapMutations('subscriptions', ['setSavedProductUpdatePayload']),

    ...mapMutations('shippingMethods', ['SET_SHIPPING_METHODS']),

    handleSetMode(mode) {
      this.$emit('setMode', mode)
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

    // addToNextOrder will over ride the editNextOrder condition

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

      console.log({addToNextOrder})

      if (addToNextOrder) {
        analyticsEventName = 'Upscribe Next Order Product Add'

        handleNewCheckoutUpdatePayload = [
          buildNewCheckoutUpdatePayload(
            this.UPDATE_NEXT_ORDER(nextOrderUpdatePayload),
            nextOrderUpdatePayload,
            'subscriptions',
            'UPDATE_NEXT_ORDER',
            atc['notices.productAddedToNextOrder'] || `Product added to next order`
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
            atc['notices.productAddedToSubscription'] || `Product added to subscription`
          ),
        ]
      }

      this.$emit('setDrawerStatus', 'PENDING')

      // hande everything in handleNewCheckoutUpdate function
      try {
        await this.handleNewCheckoutUpdate(handleNewCheckoutUpdatePayload)
        if (!addToNextOrder) {
          this.$toast.info(
            atc['portal.nextShipmentResetFromSubscriptionChange'] || 'Changing Subscription Settings resets your next shipment.',
            { duration: 5000 }
          )
        }
      } catch(e) {
        console.error(e)
      }

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
      atc['portal.addProductDrawerTitle'] || 'Add Product'
    }}</h2>

    <p
      v-if="
        activeSubscription.interval &&
          activeSubscription.period &&
          !editNextOrder
      "
      class="c-drawer__subtitle"
      >{{
        atc['portal.editProductsDrawerInfoText'] ||
          'This product will ship every'
      }}
      {{ activeSubscription.interval }} {{ intervalUnitDisplay }}</p
    >

    <div class="c-drawerDeliveryFrequency__options">
      <variant-select-block
        v-if="variantSelectProduct"
        :product="variantSelectProduct"
        :updating="updating"
        :button-text="
          editNextOrder
            ? atc['buttons.addProductToNextOrder'] || 'Add to Next Shipment'
            : atc['buttons.addProductToSubscription'] || 'Add to Subscription'
        "
        :secondary-button-text="
          !editNextOrder
            ? atc['buttons.addProductToNextOrder'] || 'Add to Next Shipment'
            : atc['buttons.addProductToSubscription'] || 'Add to Subscription'
        "
        @addProductVariantToSubscription="handleAddProductVariantToSubscription"
        @setMode="handleSetMode"
      />
    </div>

    <div class="c-drawer__actionButtons">
      <v-button
        class="c-form__submitButton"
        type="alt"
        @onClick="$emit('setMode', 'add')"
        >{{ atc['buttons.cancel'] || 'Cancel' }}</v-button
      >
    </div>
  </div>
</template>
