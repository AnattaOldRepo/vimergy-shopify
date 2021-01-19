<template>
  <div class="c-addressPayment__formattedComponent">
    <portal to="header">
      <the-header middle-html="Edit Billing Address" mode="customized" />
    </portal>

    <checkbox
      v-model="applyToAllActiveSusbscriptions"
      class="u-mt-3"
      :label="
        atc['portal.applyToAllActiveSusbscriptions'] ||
          'Apply to all active subscriptions'
      "
    />
    <new-address-form
      ref="edit-billing-address-form"
      class="c-formBlock--noPadding c-billingAddressForm"
      :form-submit-button-text="
        atc['buttons.updateAddress'] || 'Update Address'
      "
      form-name="billing-address"
      :data-fill="activeBillingAddress"
      :has-same-address="hasSameAddress"
      @onSubmit="updateBillingAddress"
    />
  </div>
</template>

<script>
import { isEqual } from 'lodash'
import NewAddressForm from '@components/new-address-form.vue'
import { mapState, mapActions, mapMutations, mapGetters } from 'vuex'
import TheHeader from '@components/the-header'
import Checkbox from '@components/checkbox.vue'

export default {
  components: {
    NewAddressForm,
    TheHeader,
    Checkbox,
  },

  data() {
    return {
      hasSameAddress: true,
      initialHasSameAddressState: null,
      applyToAllActiveSusbscriptions: false,
    }
  },

  computed: {
    ...mapState('translations', ['atc']),

    ...mapGetters('activeSubscription', [
      'activeSubscription',
      'activeBillingAddress',
    ]),

    billingAddress() {
      const { activeSubscription } = this
      return activeSubscription.billing_address
    },

    shippingAddress() {
      const { activeSubscription } = this
      return activeSubscription.shipping_address
    },
  },

  mounted() {
    const initialHasSameAddress = this.isSameAsSubscription()
    this.hasSameAddress = initialHasSameAddress
    this.initialHasSameAddressState = initialHasSameAddress
  },

  methods: {
    ...mapMutations('mobileGlobalManagement', ['setMessage', 'setStatus']),

    ...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),

    ...mapActions('subscriptions', [
      'UPDATE_SUBSCRIPTION',
      'UPDATE_NEXT_ORDER',
      'UPDATE_ALL_SUBS_ADDRESSES',
      'GET_SUBSCRIPTIONS',
    ]),

    handleHeaderAction() {
      this.$refs['edit-billing-address-form'].fillFormWithDefaultData()
    },

    isSameAsSubscription() {
      const { shippingAddress, billingAddress } = this

      if (billingAddress && shippingAddress) {
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
      }
    },

    async updateBillingAddress(address) {
      const { editNextOrder } = this
      this.setMessage('Updating new Billing Address')
      this.setStatus('updating')
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
        await updateAction
        this.triggerAnalyticsEvent({
          event: analyticsEventName,
          payload: analyticsPayload,
        })
        await this.GET_SUBSCRIPTIONS()
        this.setMessage('Saved new Billing Address')
        this.setStatus('success')
      } catch (e) {
        console.error('subscription/UPDATE_SUBSCRIPTION error: ', e)
        this.setMessage(e.message)
        this.setStatus('error')
      }
    },
  },
}
</script>
