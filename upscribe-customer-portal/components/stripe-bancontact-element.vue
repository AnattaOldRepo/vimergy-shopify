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
      name: '',
      error: '',
    }
  },
  computed: {
    ...mapState('checkout', ['checkoutData', 'shopData']),
    ...mapState('payment', ['paymentType', 'paymentSource']),
  },
  mounted() {
    const vm = this
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
      const { name } = this
      console.log({$event})
      this.error = $event.error ? $event.error.message : ''
      this.$emit('handleChange', {complete: !!name })
      // this.$emit('handleChange', $event)
    },
    createPaymentMethod() {
      console.log('createPaymentMethod')

      // const vm = this
      const { name, checkoutData } = this
      const { payment_due } = checkoutData
      const redirectUrl = window.location.href

      const bancontactSourceData = {
        type: 'bancontact',
        amount: payment_due * 100,
        currency: 'eur',
        owner: {
          name,
        },
        redirect: {
          return_url: redirectUrl,
        },
      }

      console.log({bancontactSourceData})

      this.stripe.createSource(bancontactSourceData).then( async result => {
        if (result.error) {
          this.error = result.error.message
          return
        }
        this.error = ''

        console.log('createSource in bancontact: ', {result})

        // save for after confirmation comparison
        this.setSavedPaymentData(result.source)

        this.setPaymentSource(result.source)
        this.setPaymentType('stripe_bancontact')

        let authorizeUrl = result.source.redirect.url

        console.log({authorizeUrl})

        // debugger

        window.location.href = authorizeUrl

        const sourceId = result.source.id

        const sepaDebitSourcePayload = {
          type: 'sepa_debit',
          sepa_debit: {
            bancontact: sourceId,
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
    <div class="col c-stripeFormGroup" style="margin:0">
      <!-- <label for="name" class="c-stripeFormLabel">
        Name
      </label> -->
      <input v-model="name" class="c-stripeFormInput--text" placeholder="Full Name" required @change="handleChange">
    </div>
  </div>

  <!-- Used to display form errors. -->
  <div v-if="error" id="sepa-error-message" class="c-stripeErrors" role="alert">{{ error }}</div>

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
