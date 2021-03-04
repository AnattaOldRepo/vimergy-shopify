<script>
import { mapState, mapGetters } from 'vuex'
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
      enabledCountryCodes: [
        'AE',
        'AT',
        'AU',
        'BE',
        'BR',
        'CA',
        'CH',
        'CZ',
        'DE',
        'DK',
        'EE',
        'ES',
        'FI',
        'FR',
        'GB',
        'GR',
        'HK',
        'IE',
        'IN',
        'IT',
        'JP',
        'LT',
        'LU',
        'LV',
        'MX',
        'MY',
        'NL',
        'NO',
        'NZ',
        'PH',
        'PL',
        'PT',
        'RO',
        'SE',
        'SG',
        'SI',
        'SK',
        'US',
      ],
    }
  },
  computed: {
    ...mapState('shop', ['shopData']),

    ...mapState('translations', ['atc']),

    ...mapGetters('activeSubscription', ['activeSubscription']),

    isPaymentRequestCountry() {
      const { enabledCountryCodes, shopData } = this
      const { country_code } = shopData

      return enabledCountryCodes.indexOf(country_code) > -1
    },

    paymentRequestObject() {
      const { shopData, activeSubscription, atc } = this
      return {
        country: shopData.country_code,
        currency: shopData.currency.toLowerCase(),
        total: {
          label: atc['labels.total'] || 'Total',
          amount: Math.floor(activeSubscription.total_price * 100),
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

    window.paymentRequest = stripe.paymentRequest(paymentRequestObject)

    // Create an instance of the card Element.
    const prButton = elements.create('paymentRequestButton', {
      paymentRequest: window.paymentRequest,
    })

    this.stripe = stripe
    this.prButton = prButton

    // Check the availability of the Payment Request API first.
    window.paymentRequest.canMakePayment().then((result) => {
      if (result) {
        prButton.mount('#payment-request-button')
        this.$nextTick(() => {
          this.$emit('enableStripePaymentRequest', true)
        })
      } else {
        this.paymentRequestAvailable = false
        this.$nextTick(() => {
          this.$emit('enableStripePaymentRequest', false)
        })
      }
    })

    window.paymentRequest.on('token', (ev) => {
      this.placeOrder(ev)

      ev.complete('success')
    })
  },
  methods: {
    placeOrder(result) {
      if (this.placeOrderPending) return

      this.$emit('createPaymentMethodResponse', {
        fullResponse: result,
        newPaymentData: result.token,
        updatePaymentData: result.token.card,
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
