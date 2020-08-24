<script>
import { mapActions, mapGetters, mapState } from 'vuex'

import DrawerWrap from '@components/drawer-wrap.vue'
import NewAddressForm from '@components/new-address-form.vue'

export default {
  components: {
    DrawerWrap,
    NewAddressForm,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  data: () => {
    return {
      drawerStatus: null,
    }
  },
  computed: {
    ...mapState('translations', ['atc']),

    ...mapState('editMode', ['editNextOrder']),

    ...mapGetters('activeSubscription', [
      'activeShippingAddress',
      'activeSubscription',
    ]),

    deliveryEveryText() {
      const { activeSubscription } = this
      if (!activeSubscription) return false
      return `${activeSubscription.interval}`
    },

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
      const { activeSubscription } = this
      return activeSubscription.items
    },
  },

  methods: {
    ...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),

    ...mapActions('subscriptions', [
      'UPDATE_SUBSCRIPTION',
      'UPDATE_NEXT_ORDER',
    ]),

    async updateShippingAddress(address) {
      const { editNextOrder } = this
      const updatePayload = {
        requestPayload: {
          shipping_address: address,
        },
      }

      let updateAction
      let analyticsEventName
      let analyticsPayload = { address }

      if (editNextOrder) {
        updateAction = this.UPDATE_NEXT_ORDER(updatePayload)
        analyticsEventName = 'Upscribe Next Order Shipping Address Update'
      }

      // determine if updating both of just one
      else {
        analyticsEventName = 'Upscribe Subscription Shipping Address Update'

        updateAction = (async () => {
          await this.UPDATE_NEXT_ORDER(updatePayload)
          await this.UPDATE_SUBSCRIPTION(updatePayload)
        })()
      }

      try {
        this.drawerStatus = 'PENDING'
        await updateAction
        this.drawerStatus = 'SUCCESS'

        this.triggerAnalyticsEvent({
          event: analyticsEventName,
          payload: analyticsPayload,
        })
      } catch (e) {
        console.log('subscription/UPDATE_SUBSCRIPTION error: ', e)
        this.drawerStatus = { state: 'FAILURE', message: e.message }
      }
    },
  },
}
</script>

<template>
  <drawer-wrap
    class="c-darwer__edittingAddress"
    :show="show"
    :status="drawerStatus"
    @close="$emit('close')"
  >
    <div class="c-drawerShippingAddresses c-drawer">
      <h2 class="c-drawer__title"
        >{{
          atc['portal.editShippingAddressDrawerTitle'] ||
            'Edit Shipping Address'
        }}
      </h2>

      <p class="c-drawer__subtitle">
        {{
          atc['portal.editShippingAddressDrawerPrompt'] ||
            'These products ship every'
        }}
        {{ deliveryEveryText }} {{ intervalUnitDisplay }}
      </p>

      <new-address-form
        class="c-formBlock--noPadding c-shippingAddressForm"
        :form-submit-button-text="atc['buttons.updateAddress'] || 'Add Address'"
        form-name="shipping-address"
        :data-fill="activeShippingAddress"
        @onSubmit="updateShippingAddress"
      />
    </div>
  </drawer-wrap>
</template>

<style lang="scss">
@import '@design';

.c-shippingAddressForm {
  padding: 0;
  background-color: transparent;

  @include bp(tablet) {
    padding: 24px 24px 0;
    background-color: $color-white;
  }
}
</style>
