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
      stripe: null,
      sofortCountry: null,
      sofortCountryCodeOptions: [
        {
          label: 'Austria',
          code: 'AT',
          },
        {
          label: 'Belgium',
          code: 'BE',
          },
        {
          label: 'Germany',
          code: 'DE',
          },
        {
          label: 'Italy',
          code: 'IT',
          },
        {
          label: 'Netherlands',
          code: 'NL',
          },
        {
          label: 'Poland',
          code: 'PL',
          },
        {
          label: 'Spain',
          code: 'EA',
          },
        {
          label: 'Switzerland',
          code: 'CH',
          },
      ],
      name: '',
      error: '',

      style: {
        base: {
          padding: '10px 12px',
          color: '#32325d',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          fontSmoothing: 'antialiased',
          fontSize: '16px',
          '::placeholder': {
            color: '#aab7c4',
          },
        },
        invalid: {
          color: '#fa755a',
        },
      },
    }
  },
  computed: {
    ...mapState('checkout', ['checkoutData', 'shopData']),
    ...mapState('payment', ['paymentType', 'paymentSource']),

    sofortCountryCode() {
      return (this.sofortCountry && this.sofortCountry.code) ? this.sofortCountry.code : false
    },
  },
  mounted() {
    const vm = this
    // const { style } = this
    const stripe = window.Stripe(vm.stripePublicKey)

    this.stripe = stripe
  },
  methods: {
    ...mapMutations('payment', [
      'setPaymentType',
      'setPaymentSource',
      'setSavedPaymentData',
    ]),

    // ...mapActions('payment', ['CREATE_SEPA_DEBIT_SOURCE']),

    handleChange($event) {
      const { name, sofortCountryCode } = this
      console.log({$event})
      this.error = $event.error ? $event.error.message : ''
      this.$emit('handleChange', {complete: (name && sofortCountryCode) })
      // this.$emit('handleChange', $event)
    },
    createPaymentMethod() {
      // const vm = this
      const { name, checkoutData, sofortCountryCode } = this
      const { payment_due } = checkoutData
      const redirectUrl = window.location.href

      const sofortSourceData = {
        type: 'sofort',
        amount: payment_due * 100,
        currency: 'eur',
        owner: {
          name,
        },
        sofort: {
          country: sofortCountryCode,
        },
        redirect: {
          return_url: redirectUrl,
        },
      }

      console.log({sofortSourceData})

      debugger

      this.stripe.createSource(sofortSourceData).then( async result => {
        if (result.error) {
          this.error = result.error.message
          return
        }
        this.error = ''

        console.log('createSource in sofort: ', {result})

        // save for after confirmation comparison
        this.setSavedPaymentData(result.source)

        this.setPaymentSource(result.source)
        this.setPaymentType('stripe_sofort')

        let authorizeUrl = result.source.redirect.url

        console.log({authorizeUrl})

        // debugger

        window.location.href = authorizeUrl

        const sourceId = result.source.id

        const sepaDebitSourcePayload = {
          type: 'sepa_debit',
          sepa_debit: {
            sofort: sourceId,
          },
          currency: 'eur',
          owner: {
            name,
          },
        }


        // http://localhost:3000/
        // ?client_secret=src_client_secret_GTSjZWvgRkG5GcIIYpuEeJlr
        // &currentStep=3
        // &livemode=false
        // &reachedStep=3
        // &source=src_1FwVoKCAVKE2YnNzj6F9nQQP
        // &store=upscribe-demo.myshopify.com
        // &token=17a7fe2bdab0f9815b295877d355cfb8

        console.log({sepaDebitSourcePayload})

        // const createSepaDebitSourceResponse = await this.CREATE_SEPA_DEBIT_SOURCE({sepaDebitSourcePayload })
        // console.log({createSepaDebitSourceResponse})

        // // vm.$emit('placeOrderResponse', result.token)
        // this.$emit('placeOrderResponse', {
        //   fullResponse: result,
        //   paymentData: result.source,
        //   paymentType: 'stripe_ideal',
        // })

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
      <input v-model="name" class="c-stripeFormInput--text" placeholder="Full Name" required @change="handleChange">
    </div>
  </div>

  <div class="form-row mb-20" style="margin-bottom:20px">
    <!-- <label for="sofort-country-code" class="c-stripeFormLabel mb-20">
      Bank Country
    </label> -->
    <div id="sofort-country-code" class="c-stripeFormInput" style="padding:0">
      <v-select
        v-model="sofortCountry"
        class="c-stripeFormInput--select"
        :options="sofortCountryCodeOptions"
        :clearable="false"
        placeholder="Country"
        @search:focus="inputFocused = true"
        @search:blur="inputFocused = false"
        @input="handleChange"
      />
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

<style lang="scss" scoped>
@import '@design';

</style>
