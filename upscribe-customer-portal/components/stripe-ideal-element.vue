<script>
import { mapState, mapMutations } from 'vuex'


export default {
  props: {
    stripePublicKey: {
      type: [Boolean, String],
      default: false,
    },
  },
  data: () => {
    return {
      idealBank: null,
      stripe: null,
      name: '',
      error: '',

      style: {
        base: {
          padding: '10px 12px',
          color: '#A3B5BF',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          fontSmoothing: 'antialiased',
          fontSize: '16px',
          '::placeholder': {
            color: '#A3B5BF',
          },
        },
        invalid: {
          color: '#fa755a',
        },

        '::placeholder': {
          color: '#CFD7E0',
        },
      },
    }
  },
  computed: {
    ...mapState('checkout', ['checkoutData', 'shopData']),
    ...mapState('payment', ['paymentType', 'paymentSource']),
  },
  mounted() {
    const vm = this
    const { style } = this
    const stripe = window.Stripe(vm.stripePublicKey)
    const elements = stripe.elements()

    // Create an instance of the card Element.
    const idealBank = elements.create('idealBank', {
      style,
      placeholder: 'iDEAL Bank',
    })

    this.stripe = stripe
    this.idealBank = idealBank

    // Add an instance of the card Element into the `card-element` <div>.
    idealBank.mount('#ideal-element')
    idealBank.addEventListener('change', function(event) {
      vm.handleChange(event)
    })
  },
  methods: {
    ...mapMutations('payment', [
      'setPaymentType',
      'setPaymentSource',
      'setSavedPaymentData',
    ]),

    // ...mapActions('payment', ['CREATE_SEPA_DEBIT_SOURCE']),

    handleChange($event) {
      this.error = $event.error ? $event.error.message : ''
      this.$emit('handleChange', $event)
    },
    createPaymentMethod() {
      const vm = this
      const { name, checkoutData } = this
      const { currency, payment_due } = checkoutData
      const redirectUrl = window.location.href

      const idealSourceData = {
        type: 'ideal',
        amount: payment_due * 100,
        currency: 'eur',
        owner: {
          name,
        },
        redirect: {
          return_url: redirectUrl,
        },
      }

      this.stripe.createSource(vm.idealBank, idealSourceData).then( async result => {
        if (result.error) {
          this.error = result.error.message
          return
        }
        this.error = ''

        // save for after confirmation comparison
        this.setSavedPaymentData(result.source)

        this.setPaymentSource(result.source)
        this.setPaymentType('stripe_ideal')

        let authorizeUrl = result.source.redirect.url
        window.location.href = authorizeUrl
      })
    },
  },
}
</script>

<template>
<form class="c-stripeIban" @submit.prevent="$emit('submitPaymentForm')">
  <div class="form-row inline c-stripeFormSplitGroups">
    <div class="col c-paymentMethodFormGroup">
      <!-- <label for="name" class="c-stripeFormLabel">
        Name
      </label> -->
      <input v-model="name" class="c-stripeFormInput--text" placeholder="Full Name" required>
    </div>
  </div>

  <div class="form-row mb-20" style="margin-bottom:20px">
    <!-- <label for="ideal-element" class="c-stripeFormLabel mb-20">
      iDEAL Bank
    </label> -->
    <div id="ideal-element" class="c-stripeFormInput--text" style="padding:0">
      <!-- A Stripe Element will be inserted here. -->
    </div>
  </div>

  <!-- Used to display form errors. -->
  <div v-if="error" id="sepa-error-message" class="c-paymentMethodErrors" role="alert">{{ error }}</div>

  <!-- Display mandate acceptance text. -->
  <div id="mandate-acceptance" class="c-stripeInfo">
    By providing your IBAN and confirming this payment, you are
    authorizing {{ shopData.name }} and Stripe, our payment service
    provider, to send instructions to your bank to debit your account and
    your bank to debit your account in accordance with those instructions.
    You are entitled to a refund from your bank under the terms and
    conditions of your agreement with your bank. A refund must be claimed
    within 8 weeks starting from the date on which your account was debited.
  </div>
</form>
</template>
