<template>
  <div class="c-addressPayment__formattedComponent">
    <portal to="header">
      <the-header
        middle-html="Edit Payment Method"
        mode="customized"
        customized-func-text="Cancel"
        @headerAction="handleHeaderAction"
      />
    </portal>

    <div v-if="activeEditCard">
        <card-item no-edit :card="activeEditCard" />

        <payment-methods-block
          ref="payment-methods-block"
          :submit-button-text="atc['buttons.updateCard'] || 'Save Updated Payment Method'"
          edit-payment-method-mode
          @finalPaymentPayloadResponse="handleFinalPaymentPayloadResponse"
        />
      </div>

      <div v-else>
        <p class="c-modalSubscription__loadingText">Loading Current Card...</p>
      </div>
  </div>
</template>


<script>
import TheHeader from '@components/the-header'
import CardItem from '@components/card-item.vue'
import PaymentMethodsBlock from '@components/payment-methods-block.vue'
// import VButton from '@components/v-button.vue'
import { mapState, mapActions, mapMutations } from 'vuex'

export default {
  components: {
    TheHeader,
    PaymentMethodsBlock,
    // VButton,
    CardItem,
  },

  computed:{
    ...mapState('cards', ['activeEditCard']),

    ...mapState('translations', ['atc']),

    ...mapState('editMode', ['editNextOrder']),
  },

  methods:{
    ...mapMutations('mobileGlobalManagement', ['setMessage', 'setStatus']),

    ...mapActions('mobileGlobalManagement', ['swapPageTransitionDynamic']),

    ...mapActions('subscriptions', ['UPDATE_NEXT_ORDER']),

    ...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),

    ...mapActions('cards', ['UPDATE_PAYMENT_METHOD']),

    handleFinalPaymentPayloadResponse({fullResponse, newPaymentData, updatePaymentData, paymentType}) {
      this.updatePaymentMethod(updatePaymentData)
    },

    handleHeaderAction(){
      this.$refs['payment-methods-block'].handleClear()
    },

    async updatePaymentMethod({ cardName, cardMonth, cardYear, cardZipcode }) {
      const { activeEditCard, editNextOrder } = this

      const paymentCustomerId = activeEditCard.payment_customer_id
      const paymentMethodId = activeEditCard.id
      const updatePayload = {}
      if (cardName) updatePayload.name = cardName
      if (cardMonth) updatePayload.exp_month = cardMonth
      if (cardYear) updatePayload.exp_year = cardYear
      if (cardZipcode) updatePayload.zipcode = cardZipcode


      let updateAction

      let analyticsEventName
      let analyticsPayload = {
        card: { cardName, cardMonth, cardYear, cardZipcode },
      }

      this.setMessage('Updating Shipping Method')
      this.setStatus('updating')

      if (editNextOrder) {
        analyticsEventName = 'Upscribe Next Order Payment Update'

        updateAction = (async () => {
          await this.UPDATE_NEXT_ORDER({
            requestPayload: {
              payment_method_id: paymentMethodId,
            },
          })
          await this.UPDATE_PAYMENT_METHOD({ updatePayload, paymentMethodId, paymentCustomerId })
        })()
      }

      // determine if updating both of just one
      else {
        analyticsEventName = 'Upscribe Subscription Payment Update'

        updateAction = (async () => {
          await this.UPDATE_NEXT_ORDER({
            requestPayload: {
              payment_method_id: paymentMethodId,
            },
          })
          await this.UPDATE_PAYMENT_METHOD({ updatePayload, paymentMethodId, paymentCustomerId })
        })()
      }

      try {
        await updateAction
        this.setMessage('Saved new Shipping Method')
        this.setStatus('success')

        const updateCard = this.activeEditCard

        console.log('updateCard', updateCard)

        this.triggerAnalyticsEvent({
          event: analyticsEventName,
          payload: {
            ...analyticsPayload,
            card: updateCard,
          },
        })
      } catch (e) {
        console.log('card/UPDATE_PAYMENT_METHOD error: message', e.message)

        this.setMessage(e.message)
        this.setStatus('error')
      }
    },

    goBackRoute(){
      this.swapPageTransitionDynamic('page')
      this.$router.go(-1)
    },
  },
}
</script>
