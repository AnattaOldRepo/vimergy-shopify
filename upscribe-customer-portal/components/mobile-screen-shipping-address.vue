<template>
  <div class="c-addressPayment__formattedComponent">
    <portal to="header">
      <the-header
        middle-html="Edit Shipping Address"
        mode="customized"
        customized-func-text="Cancel"
        @headerAction="handleHeaderAction"
      />
    </portal>


    <new-address-form
      ref="edit-shipping-address-form"
      class="c-formBlock--noPadding c-shippingAddressForm"
      :form-submit-button-text="atc['buttons.updateAddress'] || 'Add Address'"
      form-name="shipping-address"
      @onSubmit="updateShippingAddress"
    />
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex'
import NewAddressForm from '@components/new-address-form.vue'
import TheHeader from '@components/the-header'

export default {
  components:{
    NewAddressForm,
    TheHeader,
  },

  computed: {
    ...mapState('translations', ['atc']),
  },
  methods: {
    ...mapMutations('mobileGlobalManagement', ['setMessage', 'setStatus']),

    ...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),

    ...mapActions('subscriptions', [
      'UPDATE_SUBSCRIPTION',
      'UPDATE_NEXT_ORDER',
    ]),

    handleHeaderAction() {
      this.$refs['edit-shipping-address-form'].fillFormWithDefaultData()
    },

    async updateShippingAddress(address) {
      const { editNextOrder } = this
      this.setMessage('Updating new Shipping Address')
      this.setStatus('updating')
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
        await updateAction
        this.triggerAnalyticsEvent({
          event: analyticsEventName,
          payload: analyticsPayload,
        })

        this.setMessage('Saved new Shipping Address')
        this.setStatus('success')
      } catch (e) {
        console.log('subscription/UPDATE_SUBSCRIPTION error: ', e)
        this.setMessage(e.message)
        this.setStatus('error')
      }
    },
  },
}
</script>
