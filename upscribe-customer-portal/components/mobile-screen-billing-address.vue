<template>
  <div class="c-addressPayment__formattedComponent">
     <portal to="header">
        <the-header
          middle-html="Edit Billing Address"
          mode="customized"
          customized-func-text="Cancel"
          @headerAction="handleHeaderAction"
        />
    </portal>

      <new-address-form
        ref="edit-billing-address-form"
        class="c-formBlock--noPadding c-billingAddressForm"
        :form-submit-button-text="atc['buttons.updateAddress'] || 'Update Address'"
        form-name="billing-address"
        @onSubmit="updateBillingAddress"
      />
  </div>
</template>

<script>
import NewAddressForm from '@components/new-address-form.vue'
import { mapState, mapActions, mapMutations } from 'vuex'
import TheHeader from '@components/the-header'
export default {
  components:{
    NewAddressForm,
    TheHeader,
  },

  computed:{
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
      this.$refs['edit-billing-address-form'].fillFormWithDefaultData()
    },

    async updateBillingAddress(address) {
      const { editNextOrder } = this
      this.setMessage('Updating new Billing Address')
      this.setStatus('updating')
      const updatePayload = {
        requestPayload: {
          billing_address: address,
        },
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
        updateAction = (async () => {
          await this.UPDATE_SUBSCRIPTION(updatePayload)
          await this.UPDATE_NEXT_ORDER(updatePayload)
        })()
        analyticsEventName = 'Upscribe Subscription Billing Address Update'
      }

      try {
        await updateAction
        this.triggerAnalyticsEvent({
          event: analyticsEventName,
          payload: analyticsPayload,
        })
        this.setMessage('Saved new Billing Address')
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
