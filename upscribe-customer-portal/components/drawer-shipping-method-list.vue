<script>
import { mapMutations, mapActions, mapGetters, mapState } from 'vuex'
import ShippingMethodItem from '@components/shipping-method-item.vue'
import VButton from '@components/v-button.vue'

export default {
  components: {
    ShippingMethodItem,
    VButton,
  },
  props: {
    selectDuringProductUpdate: {
      type: Boolean,
      default: false,
    },
    otoShippingUpdateAdd: {
      type: Boolean,
      default: false,
    },
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

    ...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),

    ...mapActions('subscriptions', [
      'UPDATE_SUBSCRIPTION_ONE_TIME',
      'UPDATE_SUBSCRIPTION',
    ]),

    ...mapActions('newCheckoutUpdates', ['COMPLETE_SAVED_NEW_CHECKOUT_UPDATE']),

    handleCancel() {
      this.$emit('setMode', 'edit')
    },

    async handleSelectShippingMethod(shippingMethod) {
      const { activeShippingMethod, selectDuringProductUpdate, savedProductUpdatePayload } = this

      // no change if same reate
      if (activeShippingMethod.handle === shippingMethod.handle) {
        return false
      }

      if (selectDuringProductUpdate) {
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
          this.$emit('completedSavedUpdated')

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
        } finally {
          this.isUpdating = false
        }
      } else {
        this.setNewSwapShippingMethod(shippingMethod)
        this.$emit('setMode', 'swap')
      }
    },
  },
}
</script>

<template>
  <div class="c-drawer">
     <!-- eslint-disable vue/valid-v-on -->
    <div class="c-drawer__intro">
      <h2 v-if="selectDuringProductUpdate" class="c-drawer__title"
        >{{ atc['portal.shippingUpdateRequiredDrawerTitle'] || 'Shipping Update Required' }}</h2
      >

      <h2 v-else class="c-drawer__title">{{ atc['portal.shippingUpdateRequiredDrawerMethodsSubtitle'] || 'Shipping Methods' }}</h2>

      <div class="c-drawer__introDetail">
        <p v-if="selectDuringProductUpdate" class="c-drawer__subtitle"
          >{{ atc['portal.shippingUpdateRequiredDrawerPrompt'] || "The changes you've selected require a shipping method update. Select a new shipping method update to complete your updates." }}
        </p>

        <p v-else class="c-drawer__subtitle"
          >{{ atc['portal.shippingUpdateRequiredDrawerPromptDefault'] ||"Select A Shipping Method Option To Update The Current Subscription's Shipping Method." }}
        </p></div
      >
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

      <div v-if="selectDuringProductUpdate" class="c-drawer__actionButtons">
        <v-button
          v-if="otoShippingUpdateAdd && isUpdating"
          class="c-form__submitButton"
          type="alt"
          @onClick=""
          >{{ atc['notices.updatingNotice'] || 'Updating' }}</v-button
        >

        <v-button
          v-else
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

.c-drawer__introDetail{
  max-width: 392px;
}
</style>
