<script>
import { mapState } from 'vuex'
export default {
  props: {
    stripePublicKey: {
      type: [Boolean, String],
      default: false,
    },
  },
  data: () => {
    return {
      stripe: null,
      prButton: null,
      // paymentRequestAvailable: false,
      enabledCountryCodes: ['AE', 'AT', 'AU', 'BE', 'BR', 'CA', 'CH', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GB', 'GR', 'HK', 'IE', 'IN', 'IT', 'JP', 'LT', 'LU', 'LV', 'MX', 'MY', 'NL', 'NO', 'NZ', 'PH', 'PL', 'PT', 'RO', 'SE', 'SG', 'SI', 'SK', 'US'],
    }
  },
  computed: {
    ...mapState('checkout', ['checkoutData']),

    isPaymentRequestCountry() {
      const { checkoutData, enabledCountryCodes } = this
      const { billing_address } = checkoutData

      return enabledCountryCodes.indexOf(billing_address.country_code) > -1
    },

    paymentRequestObject() {
      const { checkoutData } = this
      const { payment_due, currency, billing_address } = checkoutData
      return {
        country: billing_address.country_code || 'US',
        currency: currency.toLowerCase(),
          total: {
          label: 'Total',
          amount: payment_due * 100,
        },
        requestPayerName: true,
        requestPayerEmail: true,
      }
    },
  },
  mounted() {
    const vm = this
    const { paymentRequestObject, isPaymentRequestCountry } = this
    const stripe = window.Stripe(vm.stripePublicKey)
    const elements = stripe.elements()

    if (!isPaymentRequestCountry) {
      return
    }

    const paymentRequest = stripe.paymentRequest(paymentRequestObject)

    // Create an instance of the card Element.
    const prButton = elements.create('paymentRequestButton', {
      paymentRequest,
    })

    this.stripe = stripe
    this.prButton = prButton

    // Check the availability of the Payment Request API first.
    paymentRequest.canMakePayment().then((result) => {
      console.log('canmakepayment: ', { result})
      if (result) {
        prButton.mount('#payment-request-button')
        this.$emit('enableStripePaymentRequest', true)
      } else {
        // this.paymentRequestAvailable = false
        // this.$emit('enableStripePaymentRequest', false)
      }
    })

    paymentRequest.on('token', (ev) => {
      this.createPaymentMethod(ev)
    })
  },
  methods: {
    createPaymentMethod(result) {
      console.log('placeOrder', { result})
      console.log('success place order in type', {
        fullResponse: result,
        paymentData: result,
        paymentType: 'stripe_payment_request',
      })
      // stripeTokenHandler(result.token);
      this.$emit('placeOrderResponse', {
        fullResponse: result,
        paymentData: result.token,
        paymentType: 'stripe_payment_request',
      })
    },
  },
}
</script>

<template>
<div class="c-stripePayRequest__wrapper">
  <!-- <p class="c-stripePayRequest__text">Or use</p> -->
  <div id="payment-request-button" class="c-stripePayRequest__button">
    <!-- A Stripe Element will be inserted here. -->
  </div>
</div>
</template>

<style lang="scss" scoped>
@import '@design';
.c-stripePayRequest__wrapper {
  margin-top: 30px;
  margin-bottom: 30px;
}
.c-stripePayRequest__text {
  color: $color-text;
  text-align: center;
}
.c-stripePayRequest__button {

}

.c-stripePayRequest__button {
  height: auto !important;
}

</style>
