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
      iban: null,
      stripe: null,
      bankName: null,
      name: '',
      email: '',

      error: '',

      style: {
        base: {
          color: '#32325d',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          fontSmoothing: 'antialiased',
          fontSize: '16px',
          '::placeholder': {
            color: '#aab7c4',
          },
          ':-webkit-autofill': {
            color: '#32325d',
          },
        },
        invalid: {
          color: '#fa755a',
          iconColor: '#fa755a',
          ':-webkit-autofill': {
            color: '#fa755a',
          },
        },
      },
    }
  },
  computed: {
    ...mapState('shop', ['shopData']),
    ...mapState('translations', ['atc']),

    stripeIbanConfirmation() {
      const { atc, shopData } = this
      return atc['notices.stripeIbanConfirmation'] ? atc['notices.stripeIbanConfirmation'].replace('<shop-name>', shopData.name) : `By providing your IBAN and confirming this payment, you are authorizing
      ${shopData.name} and Stripe, our payment service provider, to send
      instructions to your bank to debit your account and your bank to debit
      your account in accordance with those instructions. You are entitled to a
      refund from your bank under the terms and conditions of your agreement
      with your bank. A refund must be claimed within 8 weeks starting from the
      date on which your account was debited.`
    },
  },
  mounted() {
    const vm = this
    const { style } = this
    const stripe = window.Stripe(vm.stripePublicKey)
    const elements = stripe.elements()

    // Create an instance of the card Element.
    const iban = elements.create('iban', {style, supportedCountries: ['SEPA']})

    this.stripe = stripe
    this.iban = iban

    // Add an instance of the card Element into the `card-element` <div>.
    iban.mount('#iban-element')
    iban.addEventListener('change', function(event) {
      vm.handleChange(event)
    })
  },
  methods: {
    handleChange($event) {
      this.error = $event.error ? $event.error.message : ''
      this.bankName = $event.bankName || ''
      this.$emit('handleChange', $event)
    },

    handleClear(){
      this.iban.clear()
      this.name=''
      this.email=''
    },

    createPaymentMethod() {
      const vm = this

      const sourceData = {
        type: 'sepa_debit',
        currency: 'eur',
        owner: {
          name: this.name,
          email: this.email,
        },
        mandate: {
          notification_method: 'email',
        },
      }

      this.stripe.createSource(vm.iban, sourceData).then(result => {
        this.error = result.error ? result.error.message : ''
        this.$emit('createPaymentMethodResponse', {
          fullResponse: result,
          newPaymentData: result.source,
          updatePaymentData: result.source,
          paymentType: 'stripe_sepa_direct_debit',
        })
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
      <input v-model="name" class="c-stripeFormInput" :placeholder="atc['forms.fullNameLabel'] || 'Full Name'" required>
    </div>
    <div class="col c-paymentMethodFormGroup">
      <!-- <label for="email" class="c-stripeFormLabel">
        Email Address
      </label> -->
      <input v-model="email" class="c-stripeFormInput" type="email" :placeholder="atc['forms.emailPlaceholder'] || 'your.email@example.com'" required>
    </div>
  </div>

  <div class="form-row">
    <!-- <label for="iban-element" class="c-stripeFormLabel">
      IBAN
    </label> -->
    <div id="iban-element" class="c-stripeFormInput">
      <!-- A Stripe Element will be inserted here. -->
    </div>
  </div>
  <div v-if="bankName" id="bank-name" class="c-stripeBankName">{{ bankName }}</div>

  <!-- Used to display form errors. -->
  <div v-if="error" id="sepa-error-message" class="c-paymentMethodErrors" role="alert">{{ error }}</div>

    <!-- Display mandate acceptance text. -->
    <div id="mandate-acceptance" class="c-stripeInfo">
      {{ stripeIbanConfirmation }}
    </div>
</form>
</template>

<style lang="scss" scoped>
@import '@design';

.c-stripeIban {
  display: block;
}

.c-paymentMethodFormGroup {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}

.c-stripeFormLabel {
  color: #A3B5BF;
  font-size: 13px;
  margin-bottom: 2px;
}

.c-stripeFormInput {
  background-color: $color-white;
  &:focus {
    outline: none;
    border-color: $color-primary;
  }
}

input,
.StripeElement {
  height: 42px;
  padding: 10px 12px;
  border-radius: 4px;
  border: 1px solid #EAF1F4;
  font-size: 14px;
}

input:focus,
.StripeElement--focus {
  outline: none;
  border-color: $color-primary;
}

.StripeElement--invalid {
  border-color: #fa755a;
}

.StripeElement--webkit-autofill {
  background-color: #fefde5 !important;
}
</style>
