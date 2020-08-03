
<template>
  <div class="c-modalShippingRequire">
      <h2 class="c-modalSubscription__shippingTitle">
        {{ atc['portal.shippingUpdateRequiredDrawerTitle'] || 'Shipping Update Required' }}
      </h2>

      <p class="c-modalSubscription__shippingSubtitle"
        >{{ atc['portal.shippingUpdateRequiredDrawerPrompt'] || "The changes you've selected require a shipping method update. Select a new shipping method update to complete your updates." }}
      </p>

      <div>
        <div v-if="shippingMethods" class="c-modalSubscription__shippingList">
          <shipping-method-item
            v-for="(shippingMethod, index) in shippingMethods"
            :key="shippingMethod.id"
            :shipping-method="shippingMethod"
            :is-selected="activeShippingMethod === shippingMethod.handle"
            :index="index"
            class="c-modalSubscription__shippingListItem"
            @selectShippingMethod="handleSelectShippingMethod(shippingMethod)"
          />
        </div>

        <div v-else class="c-modalSubscription__loadingWrap">
          <span class="c-modalSubscription__loadingText">
            {{ atc['portal.shippingMethodsLoadingMethods'] || 'Loading Shipping Methods...' }}
            </span>
        </div>
      </div>
  </div>
</template>


<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import ShippingMethodItem from '@components/shipping-method-item.vue'
export default {
  components: {
      ShippingMethodItem,
  },

  computed: {
    ...mapState('translations', ['atc']),

    ...mapState('shippingMethods', [
      'activeEditShippingMethod',
      'shippingMethods',
    ]),

    ...mapState('subscriptions', ['savedProductUpdatePayload']),

    ...mapState('editMode', ['editNextOrder']),

    ...mapGetters('activeSubscription', [
      'activeSubscription',
      'activeQueue',
    ]),

    activeShippingMethod() {
      const { activeSubscription, activeQueue, editNextOrder } = this

      let shippingLines = null

      if (editNextOrder) {
        shippingLines = activeQueue.shipping_lines
      } else {
        shippingLines = activeSubscription.shipping_lines
      }

      return shippingLines ? shippingLines[0].handle : false
    },
  },

  methods: {
    ...mapMutations('shippingMethods', ['SET_SHIPPING_METHODS', 'setActiveEditShippingMethod', 'setNewSwapShippingMethod']),

    ...mapActions('newCheckoutUpdates', ['COMPLETE_SAVED_NEW_CHECKOUT_UPDATE']),

    ...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),

    async handleSelectShippingMethod(shippingMethod) {
      const { activeShippingMethod } = this

      // no change if same reate
      if (activeShippingMethod.handle === shippingMethod.handle) {
        return false
      }

      this.setNewSwapShippingMethod(shippingMethod)
      this.$emit('updateStatus', {status: 'updating', statusText: 'Saving'})
      try {
          await this.COMPLETE_SAVED_NEW_CHECKOUT_UPDATE(shippingMethod)

          this.triggerAnalyticsEvent({
            event: 'Upscribe Subscription Update Shipping Method',
            payload: { shippingMethod },
          })
          this.$emit('updateStatus', {status: 'success', statusText: 'saved successfully'})
      }
      catch(e) {
          console.log('COMPLETE_SAVED_NEW_CHECKOUT_UPDATE error: ', e)
          this.$emit('updateStatus', {status: 'rejected', statusText: e.message })
      } finally {
          setTimeout(() => {
            this.$emit('updateStatus', {status: '', statusText: '',  needUpdating: 'stop'})
          }, 1500)
        }
      },
  },
}
</script>
