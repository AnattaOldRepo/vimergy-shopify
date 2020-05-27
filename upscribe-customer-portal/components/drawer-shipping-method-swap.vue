<template>
  <div v-if="newSwapShippingMethod">
    <div class="c-drawer">
      <h2 class="c-drawer__title">{{ atc['portal.swapShippingMethodDrawerTitle'] || 'Swap Shipping Method' }}</h2>

      <div class="c-drawer__inner">
        <p class="c-drawer__subtitle">{{ atc['portal.swapShippingMethodCurrentLabel'] || 'Current Shipping Method' }}</p>
        <div class="c-drawerCardSwap">
          <shipping-method-item
            :shipping-method="activeShippingMethod"
            :has-click-option="false"
            no-edit
            class="c-defaultDrawerShippingMethodList__item"
          />
        </div>

        <p class="c-drawer__subtitle">{{ atc['portal.swapShippingMethodNewLabel'] || 'New Shipping Method' }}</p>
        <div class="c-drawerCardList">
          <shipping-method-item
            :shipping-method="newSwapShippingMethod"
            :is-selected="shippingMethodSwapHolder === newSwapShippingMethod"
            no-edit
            class="c-defaultDrawerShippingMethodList__item"
            @click.native="seletectingShippingMethod(newSwapShippingMethod)"
          />
        </div>

        <v-button class="c-form__submitButton" @onClick="swapShippingMethods"
          >{{ atc['buttons.moveToNewShippingMethod'] || 'Move to New Shipping Method' }}</v-button
        >

        <v-button
          class="c-drawerCardSwap__cancelButton"
          type="link"
          @onClick="$emit('setMode', 'default')"
          >{{ atc['buttons.cancel'] || 'Cancel' }}</v-button
        >
      </div>
    </div>
  </div>
</template>

<script>
import ShippingMethodItem from '@components/shipping-method-item.vue'
import VButton from '@components/v-button.vue'

import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'

export default {
  components: {
    ShippingMethodItem,
    VButton,
  },
  props: {
    oneTime: {
      type: Boolean,
      default: false,
    },
  },
  data: () => {
    return {
      updating: false,
      shippingMethodSwapHolder: undefined,
    }
  },
  computed: {
    ...mapState('translations', ['atc']),

    ...mapState('shippingMethods', [
      'shippingMethods',
      'newSwapShippingMethod',
    ]),

    ...mapGetters('shippingMethods', ['activeShippingMethod']),

    ...mapGetters('activeSubscription', [
      'activeTotalPrice',
      'activeSubscription',
    ]),

    ...mapState('editMode', ['editNextOrder']),
  },


  methods: {
    ...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),

    ...mapMutations('shippingMethods', [
      'setActiveEditShippingMethod',
      'setNewSwapShippingMethod',
    ]),

    ...mapActions('subscriptions', [
      'UPDATE_SUBSCRIPTION',
      'UPDATE_NEXT_ORDER',
    ]),

    seletectingShippingMethod(shippingMethod){
      this.shippingMethodSwapHolder = shippingMethod
    },

    async swapShippingMethods() {
      console.log('swap shipping methods')

      const { newSwapShippingMethod, editNextOrder, activeSubscription } = this

      const updatePayload = {
        requestPayload: {
          shipping_rate: {
            handle: newSwapShippingMethod.handle,
            price: newSwapShippingMethod.price,
            title: newSwapShippingMethod.title,
          },
        },
      }

      let analyticsEventName
      let analyticsPayload

      let updateAction
      if (editNextOrder) {
        updateAction = this.UPDATE_NEXT_ORDER(updatePayload)
        analyticsEventName = 'Upscribe Next Order Shipping Method Change'
        analyticsPayload = {
          oldShippingMethod:
            activeSubscription.next && activeSubscription.next.shipping_lines
              ? activeSubscription.next.shipping_lines[0]
              : null,
          newShippingMethod: newSwapShippingMethod,
        }
      }

      // determine if updating both of just one
      else {
        updateAction = (async () => {
          await this.UPDATE_NEXT_ORDER(updatePayload)
          await this.UPDATE_SUBSCRIPTION(updatePayload)
        })()

        analyticsEventName = 'Upscribe Subscription Shipping Method Change'
        analyticsPayload = {
          oldShippingMethod: activeSubscription.shipping_lines
            ? activeSubscription.shipping_lines[0]
            : null,
          newShippingMethod: newSwapShippingMethod,
        }
      }

      try {
        console.log('WHU')
        this.$emit('setDrawerStatus', 'PENDING')
        await updateAction
        this.$emit('setDrawerStatus', 'SUCCESS')

        this.setNewSwapShippingMethod(null)
        this.$emit('setMode', 'default')

        this.triggerAnalyticsEvent({
          event: analyticsEventName,
          payload: analyticsPayload,
        })
      } catch (e) {
        console.log('swapShippingMethods error: ', e)
        this.$emit('setDrawerStatus', { state: 'FAILURE', message: e.message })
      }
    },
  },
}
</script>

<style lang="scss">
.c-drawer__swapBox {
  margin-bottom: 50px;
}
</style>
