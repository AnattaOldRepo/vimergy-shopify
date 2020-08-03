<script>
import { mapMutations, mapActions, mapGetters, mapState } from 'vuex'
import ShippingMethodItem from '@components/shipping-method-item.vue'
import VButton from '@components/v-button.vue'

export default {
  components: {
    ShippingMethodItem,
    VButton,
  },
  data: () => {
    return {
      isUpdating: false,
    }
  },
  computed: {
    ...mapState('translations', ['atc']),

    ...mapState('shippingMethods', [
      'activeEditShippingMethod',
      'shippingMethods',
    ]),

    ...mapState('editMode', ['editNextOrder']),

    ...mapGetters('activeSubscription', ['activeSubscription', 'activeQueue']),

    ...mapState('subscriptions', ['savedProductUpdatePayload']),

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
    ...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),

    ...mapMutations('shippingMethods', [
      'setActiveEditShippingMethod',
      'setNewSwapShippingMethod',
    ]),

    ...mapActions('subscriptions', [
      'UPDATE_SUBSCRIPTION_ONE_TIME',
      'UPDATE_SUBSCRIPTION',
    ]),

    ...mapActions('newCheckoutUpdates', ['COMPLETE_SAVED_NEW_CHECKOUT_UPDATE']),

    handleCancel() {
      this.$emit('setMode', 'edit')
    },

    async handleSelectShippingMethod(shippingMethod) {
      const { activeShippingMethod, savedProductUpdatePayload } = this

      // no change if same reate
      if (activeShippingMethod.handle === shippingMethod.handle) {
        return false
      }

      this.setNewSwapShippingMethod(shippingMethod)

      this.isUpdating = true
      this.$emit('setDrawerStatus', { state: 'PENDING' })

      try {
        await this.COMPLETE_SAVED_NEW_CHECKOUT_UPDATE(shippingMethod)

        this.$emit('setDrawerStatus', {
          state: 'SUCCESS',
          message: (savedProductUpdatePayload && savedProductUpdatePayload.successMessage) ? savedProductUpdatePayload.successMessage : 'Updated',
        })
        this.$emit('setMode', 'edit')
        this.$emit('close')

        this.triggerAnalyticsEvent({
          event: 'Upscribe Subscription Update Shipping Method',
          payload: { shippingMethod },
        })
      }
      catch(e) {
        this.$emit('setDrawerStatus', {
          state: 'FAILURE',
          message: e.message,
        })
        this.$emit('close')

      } finally {
        this.isUpdating = false
      }
    },
  },
}
</script>

<template>
  <div class="c-drawer">
    <div class="c-drawer__intro">
      <h2 class="c-drawer__title"
        >{{ atc['portal.shippingUpdateRequiredDrawerTitle'] || 'Shipping Update Required' }}</h2
      >

      <div class="c-drawer__introDetail">
        <p class="c-drawer__subtitle"
          >{{ atc['portal.shippingUpdateRequiredDrawerPrompt'] || "The changes you've selected require a shipping method update. Select a new shipping method update to complete your updates." }}
        </p>
        </div>
    </div>

    <div class="c-drawer__main">
      <div v-if="shippingMethods" class="c-shippingMethodList">
        <shipping-method-item
          v-for="(shippingMethod, index) in shippingMethods"
          :key="shippingMethod.id"
          :shipping-method="shippingMethod"
          :is-selected="activeShippingMethod === shippingMethod.handle"
          :index="index"
          class="c-drawerShippingMethodList__item"
          @selectShippingMethod="handleSelectShippingMethod(shippingMethod)"
        />
      </div>

      <div v-else class="c-shippingMethodList__loadingWrap">
        <span class="c-shippingMethodList__loadingText"
          >{{ atc['portal.shippingMethodsLoadingMethods'] || 'Loading Shipping Methods...' }}</span
        >
      </div>

      <div class="c-drawer__actionButtons">
        <v-button
          class="c-form__submitButton"
          type="alt"
          @onClick="handleCancel"
          >{{ atc['buttons.cancel'] || 'Cancel' }}</v-button
        >
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import '@design';
.c-shippingMethodList__loadingWrap {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
}

.c-shippingMethodList__loadingText {
  font-family: $font-primary-regular;
  font-size: 22px;
  font-weight: 500;
  color: $color-primary;
  text-align: center;
}
</style>
