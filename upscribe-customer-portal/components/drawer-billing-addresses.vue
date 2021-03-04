<script>
import { isEqual } from 'lodash'

import { mapActions, mapGetters, mapState } from 'vuex'

import DrawerWrap from '@components/drawer-wrap.vue'
import { windowSizes } from '@mixins/windowSizes'
import NewAddressForm from '@components/new-address-form.vue'
import Checkbox from '@components/checkbox.vue'

export default {
  components: {
    DrawerWrap,
    NewAddressForm,
    Checkbox,
  },
  mixins: [windowSizes],

  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  data: () => {
    return {
      drawerStatus: null,
      hasSameAddress: true,
      initialHasSameAddressState: null,
      applyToAllActiveSusbscriptions: false,
      initialAddressMatchStateSet: false,
    }
  },
  computed: {
    ...mapState('translations', ['atc']),

    ...mapState('customer', ['paymentCards', 'customerShopifyId']),

    ...mapState('editMode', ['editNextOrder']),

    ...mapGetters('activeSubscription', ['activeSubscription']),

    ...mapGetters('activeSubscription', ['activeBillingAddress']),

    ...mapState('cards', ['cards']),

    activePaymentType() {
      const { editNextOrder, activeSubscription, cards } = this

      let paymentId = editNextOrder
        ? activeSubscription.next.payment_method_id
        : activeSubscription.payment_method_id

      let activePaymentType = false

      cards.forEach((card) => {
        if (card.id === paymentId) activePaymentType = card.type
      })
      return activePaymentType
    },

    billingAddress() {
      const { activeSubscription } = this
      return activeSubscription.billing_address
    },

    shippingAddress() {
      const { activeSubscription } = this
      return activeSubscription.shipping_address
    },

    deliveryEveryText() {
      const { activeSubscription } = this
      if (!activeSubscription) return false
      return activeSubscription.interval
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
  },
  mounted() {
    const initialHasSameAddress = this.isSameAsSubscription()
    this.hasSameAddress = initialHasSameAddress
    this.initialHasSameAddressState = initialHasSameAddress
    this.$nextTick(() => {
      this.initialAddressMatchStateSet = true
    })
  },
  methods: {
    ...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),

    ...mapActions('subscriptions', [
      'UPDATE_SUBSCRIPTION',
      'UPDATE_NEXT_ORDER',
      'UPDATE_ALL_SUBS_ADDRESSES',
    ]),
    ...mapActions('subscriptions', ['GET_SUBSCRIPTIONS']),

    isSameAsSubscription() {
      const { shippingAddress, billingAddress } = this

      const cleanedShippingAddress = {
        address1: shippingAddress.address1 || undefined,
        address2: shippingAddress.address2 || undefined,
        city: shippingAddress.city || undefined,
        company: shippingAddress.company || undefined,
        country: shippingAddress.country || undefined,
        country_code: shippingAddress.country_code || undefined,
        first_name: shippingAddress.first_name || undefined,
        last_name: shippingAddress.last_name || undefined,
        latitude: shippingAddress.latitude || undefined,
        longitude: shippingAddress.longitude || undefined,
        name: shippingAddress.name || undefined,
        phone: shippingAddress.phone || undefined,
        province: shippingAddress.province || undefined,
        province_code: shippingAddress.province_code || undefined,
        zip: shippingAddress.zip || undefined,
      }

      const cleanedBillingAddress = {
        address1: billingAddress.address1 || undefined,
        address2: billingAddress.address2 || undefined,
        city: billingAddress.city || undefined,
        company: billingAddress.company || undefined,
        country: billingAddress.country || undefined,
        country_code: billingAddress.country_code || undefined,
        first_name: billingAddress.first_name || undefined,
        last_name: billingAddress.last_name || undefined,
        latitude: billingAddress.latitude || undefined,
        longitude: billingAddress.longitude || undefined,
        name: billingAddress.name || undefined,
        phone: billingAddress.phone || undefined,
        province: billingAddress.province || undefined,
        province_code: billingAddress.province_code || undefined,
        zip: billingAddress.zip || undefined,
      }

      return isEqual(cleanedShippingAddress, cleanedBillingAddress)
    },

    updateBillingAddressToMatchShipping() {
      const { shippingAddress } = this

      // cvv got stuck in shipping addresses, and was causing errors in billing address match
      const removeCvvFieldAddress = { ...shippingAddress }
      delete removeCvvFieldAddress.cvv

      this.updateBillingAddress(removeCvvFieldAddress)
    },

    async updateBillingAddress(address) {
      const { editNextOrder, atc } = this
      const updatePayload = {
        requestPayload: {
          billing_address: address,
        },
        bulkUpdate: this.applyToAllActiveSusbscriptions,
      }

      let updateAction
      let analyticsEventName
      let analyticsPayload = { address }

      if (editNextOrder) {
        updateAction = this.UPDATE_NEXT_ORDER(updatePayload)
        analyticsEventName = 'Upscribe Next Order Billing Address Update'
      }

      // determine if updating both of just one
      else {
        updateAction = this.UPDATE_SUBSCRIPTION(updatePayload)
        analyticsEventName = 'Upscribe Subscription Billing Address Update'
      }

      try {
        this.drawerStatus = 'PENDING'
        await updateAction
        this.$nextTick(() => {
          this.$refs['billing-address-form'].$v.$reset()
        })
        this.triggerAnalyticsEvent({
          event: analyticsEventName,
          payload: analyticsPayload,
        })
        await this.GET_SUBSCRIPTIONS()
        this.drawerStatus = 'SUCCESS'
        if (!editNextOrder) {
          this.$toast.info(
            atc['portal.nextShipmentResetFromSubscriptionChange'] || 'Changing Subscription Settings resets your next shipment.',
            { duration: 5000 }
          )
        }
      } catch (e) {
        console.error('subscription/UPDATE_SUBSCRIPTION error: ', e)
        this.drawerStatus = { state: 'FAILURE', message: e.message }
      }
    },
  },
  watch: {
    hasSameAddress(newVal) {
      // if (newVal) {
      // current state of saved subscription is not matching shipping / billing
      // so we do an update when checking the same as shipping option

      if (
        this.initialAddressMatchStateSet &&
        !this.initialHasSameAddressState
      ) {
        this.updateBillingAddressToMatchShipping()
      }
      // initial state was matching, so only do an update after they "Update Billing" action
      // from within the address-form component
      // }
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
    <div class="c-drawerBillingAddresses c-drawer">
      <h2 class="c-drawer__title">{{
        atc['portal.editBillingAddressDrawerTitle'] || 'Edit Billing Address'
      }}</h2>

      <p class="c-drawer__subtitle">
        {{
          atc['portal.editBillingAddressDrawerPrompt'] ||
            'These products ship every'
        }}
        {{ deliveryEveryText }} {{ intervalUnitDisplay }}
      </p>

      <checkbox
        v-model="applyToAllActiveSusbscriptions"
        :label="
          atc['portal.applyToAllActiveSusbscriptions'] ||
            'Apply to all active subscriptions'
        "
      />

      <checkbox
        v-if="initialAddressMatchStateSet"
        v-model="hasSameAddress"
        :label="atc['labels.sameAsShippingAddress'] || 'Same As Shipping Address'"
      />

      <new-address-form
        ref="billing-address-form"
        class="c-formBlock--noPadding c-billingAddressForm"
        :class="{ 'c-billingAddressForm--inactive': hasSameAddress }"
        :form-submit-button-text="
          atc['buttons.updateAddress'] || 'Update Address'
        "
        :active-payment-type="activePaymentType"
        form-name="billing-address"
        :data-fill="activeBillingAddress"
        :has-same-address="hasSameAddress"
        @onSubmit="updateBillingAddress"
      />
    </div>
  </drawer-wrap>
</template>

<style lang="scss">
@import '@design';

.c-billingAddressForm--inactive {
  visibility: hidden;
  opacity: 0;
}

.c-billingAddressForm {
  padding: 0;
  background-color: transparent;

  @include bp(tablet) {
    padding: 24px 24px 0;
    background-color: $color-white;
  }
}
</style>
