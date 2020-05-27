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
      console.log('handleNewCheckoutUpdate')

      return new Promise((resolve, reject) => {

        let updateCount = updateArray.length
        let updatesFinished = 0

          // for each update
          updateArray.forEach(async (update) => {
            console.log({update})
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
      if (
        e &&
        e.data &&
        e.data.shipping_update_required
      ) {
        this.SET_SHIPPING_METHODS(e.data.rates)
        this.setSavedNewCheckoutUpdate(handleNewCheckoutUpdatePayload)

        this.$emit('setMode', 'shipping-method-list')
        this.$emit('setDrawerStatus', false)
      } else {
        console.log('subscription/UPDATE_SUBSCRIPTION error: ', e)
        this.$emit('setDrawerStatus', { state: 'FAILURE', message: e.message })
      }
    },

    async handleAddProductVariantToSubscription(variantId) {

      const {
        editNextOrder,
        activeSubscription,
        variantSelectProduct,
      } = this

      const { addPayload: nextAddItemPayload} = productChangeRequest({
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
          items: subscriptionAddItemPayload ? [subscriptionAddItemPayload] : undefined,
        },
      }

      const nextOrderUpdatePayload = {
        requestPayload: {
          items: nextAddItemPayload ? [nextAddItemPayload] : undefined,
        },
      }

      let analyticsEventName, handleNewCheckoutUpdatePayload

      if (editNextOrder) {
        analyticsEventName = 'Upscribe Next Order Product Add'

        handleNewCheckoutUpdatePayload = [
          buildNewCheckoutUpdatePayload(
            this.UPDATE_NEXT_ORDER(nextOrderUpdatePayload),
            nextOrderUpdatePayload,
            'subscriptions',
            'UPDATE_NEXT_ORDER',
            `Product add to next order.`
          ),
        ]

      } else {
        analyticsEventName = 'Upscribe Subscription Product Add'

        handleNewCheckoutUpdatePayload = [
          buildNewCheckoutUpdatePayload(
            this.UPDATE_NEXT_ORDER(nextOrderUpdatePayload),
            nextOrderUpdatePayload,
            'subscriptions',
            'UPDATE_NEXT_ORDER',
            `Product added to next order.`
          ),
          buildNewCheckoutUpdatePayload(
            this.UPDATE_SUBSCRIPTION(updateSubscriptionPayload),
            updateSubscriptionPayload,
            'subscriptions',
            'UPDATE_SUBSCRIPTION',
            `Product added to subscription.`,
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
    <h2 class="c-drawer__title">{{ atc['portal.addProductDrawerTitle'] || 'Add Product' }}</h2>

    <p
      v-if="activeSubscription.interval && activeSubscription.period"
      class="c-drawer__subtitle"
      >{{ atc['portal.editProductsDrawerInfoText'] || 'These product will ship every' }} {{ activeSubscription.interval }}
      {{ activeSubscription.period }}</p
    >

    <div class="c-drawerDeliveryFrequency__options">
      <variant-select-block
        v-if="variantSelectProduct"
        :product="variantSelectProduct"
        :updating="updating"
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
