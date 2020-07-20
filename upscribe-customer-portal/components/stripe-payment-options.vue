<script>
import StripeCardElement from '@components/stripe-card-element.vue'
import StripeSepaElement from '@components/stripe-sepa-element.vue'
// import StripeSofortElement from '@components/stripe-sofort-element.vue'
// import StripeIdealElement from '@components/stripe-ideal-element.vue'
// import StripeBancontactElement from '@components/stripe-bancontact-element.vue'

// import StripePaymentRequestElement from '@components/stripe-payment-request-element.vue'


export default {
  components: {
    StripeCardElement,
    StripeSepaElement,
    // StripeSofortElement,
    // StripeIdealElement,
    // StripeBancontactElement,
    // StripePaymentRequestElement,
  },
  props: {
    activePaymentType: {
      type: String,
      default: 'card',
    },
    completeStripeCardInfo: {
      type: Boolean,
      default: false,
    },
    stripePublicKey: {
      type: [Boolean, String],
      default: false,
    },
    stripePaymentRequestEnabled: {
      type: Boolean,
      default: false,
    },
  },
  data: () => {
    return {
      stripeOptions: {},
   }
  },
  mounted() {

  },
  methods: {
    handleChange($event) {
      console.log('stripe payment options: ', {$event})
      this.$emit('handleChange', $event)
    },

    handleClear(){
      if(this.$refs['active-payment-type-stripe_card']){
        this.$refs['active-payment-type-stripe_card'].handleClear()
      } else if(this.$refs['active-payment-type-stripe_sepa_direct_debit']){
        this.$refs['active-payment-type-stripe_sepa_direct_debit'].handleClear()
      }
    },

    handleCreateStripeCardToken(token) {
      console.log({token})
    },
    handleCreatePaymentMethodResponse(response) {
      console.log('handleCreatePaymentMethodResponse: ', response)
      this.$emit('createPaymentMethodResponse', response)
    },
    handleEnableStripePaymentRequest(val){
      console.log('handleEnableStripePaymentRequest', val)
      this.$emit('enableStripePaymentRequest', val)
    },
  },
}
</script>

<template>
<div>
  <no-ssr>
    <stripe-card-element
      v-if="activePaymentType === 'stripe_card'"
      ref="active-payment-type-stripe_card"
      :stripe-public-key="stripePublicKey"
      @handleChange="handleChange($event)"
      @submitPaymentForm="$emit('submitPaymentForm')"
      @createPaymentMethodResponse="handleCreatePaymentMethodResponse($event)"
    />
    <stripe-sepa-element
      v-if="activePaymentType === 'stripe_sepa_direct_debit'"
      ref="active-payment-type-stripe_sepa_direct_debit"
      :stripe-public-key="stripePublicKey"
      @handleChange="handleChange($event)"
      @submitPaymentForm="$emit('submitPaymentForm')"
      @createPaymentMethodResponse="handleCreatePaymentMethodResponse($event)"
    />
    <!--
   <stripe-bancontact-element
      v-if="activePaymentType === 'stripe_bancontact'"
      ref="active-payment-type-stripe_bancontact"
      :stripe-public-key="stripePublicKey"
      @handleChange="handleChange($event)"
      @submitPaymentForm="$emit('submitPaymentForm')"
      @placeOrderResponse="handlePlaceOrderResponse($event)"
    />
   <stripe-ideal-element
      v-if="activePaymentType === 'stripe_ideal'"
      ref="active-payment-type-stripe_ideal"
      :stripe-public-key="stripePublicKey"
      @handleChange="handleChange($event)"
      @submitPaymentForm="$emit('submitPaymentForm')"
      @placeOrderResponse="handlePlaceOrderResponse($event)"
    />
   <stripe-sofort-element
      v-if="activePaymentType === 'stripe_sofort'"
      ref="active-payment-type-stripe_sofort"
      :stripe-public-key="stripePublicKey"
      @handleChange="handleChange($event)"
      @submitPaymentForm="$emit('submitPaymentForm')"
      @placeOrderResponse="handlePlaceOrderResponse($event)"
    />
   <stripe-payment-request-element
      ref="active-payment-type-strpe_payment_request"
      :class="{'js-strip-payment-request-element-is-hidden': (!stripePaymentRequestEnabled || activePaymentType !== 'stripe_payment_request')}"
      :stripe-public-key="stripePublicKey"
      @enableStripePaymentRequest="handleEnableStripePaymentRequest($event)"
      @handleChange="handleChange($event)"
      @submitPaymentForm="$emit('submitPaymentForm')"
      @placeOrderResponse="handlePlaceOrderResponse($event)"
    /> -->
  </no-ssr>
</div>
</template>

<style lang="scss">
@import '@design';

.c-paymentMethodErrors, {
  margin: 20px 0;
  color: $color-error;
  padding: 20px;
  background-color: lighten($color-error, 55%);
  border-radius: 4px;
  line-height: 1.3;
}

.c-stripeInfo {
  margin: 16px 0;
  color: #171725;
  padding: 20px;
  background-color: #EAF1F4;
  border-radius: 4px;
  font-size: 14px;
  line-height: 18px
}
.js-strip-payment-request-element-is-hidden {
  display: none;
}

.StripeElement {
  background-color: $color-white;
}


.c-stripeIban {
  display: block;
}

.c-paymentMethodFormGroup {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}

.c-stripeFormLabel {
  color: $color-text;
  font-size: 13px;
  margin-bottom: 2px;
}

.c-stripeFormInput {
  &::placeholder {
    color: #A3B5BF;
    font-size: 14px;
  }
  &:focus {
    outline: none;
    border-color: $color-primary;
  }
}

.c-stripeFormInput--text {
  border: 1px solid #EAF1F4;

}


.c-stripeFormInput--select {

  .vs__dropdown-toggle {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    display: flex;
    padding: 0 0 4px;
    background: none;
    border-radius: 4px;
    white-space: normal;

    font-size: 16px;
    outline: none;
    position: relative;
    text-align: left;
    width: 100%;
    cursor: pointer;
    height: 42px;
    padding: 0 16px 0 4px;
    border: 1px solid #EAF1F4;
    outline: none;
    white-space: nowrap;
  }

  .vs__search {
    font-size: 14px;
    &::placeholder {
      color: #A3B5BF;
      font-size: 14px;
    }
  }
}

.c-stripeFormInput--text,
.StripeElement {
  height: 40px;
  padding: 10px 12px;
  border-radius: 4px;
  border: 1px solid #EAF1F4;
  font-size: 14px;

  &::placeholder {
    color: #A3B5BF;
  }
}

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

.c-stripeFormSplitGroups {
  display: grid;
  grid-template-columns: 1fr;
  grid-column-gap: 20px;
  width: 100%;
}

.c-stripeBankName {
  color: $color-black;
  font-size: 14px;
  margin-top: 4px;
}

.c-stripeIban {
  display: block;
}

.c-paymentMethodFormGroup {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}

.c-stripeFormLabel {
  color: $color-text;
  font-size: 13px;
  margin-bottom: 2px;
}

.c-stripeFormInput {
  &:focus {
    outline: none;
    border-color: $color-primary;
  }
  &::placeholder {
    color: #A3B5BF;
  }
}

c-strinput,
.StripeElement {
  height: 40px;
  padding: 10px 12px;
  border-radius: 4px;
  border: 1px solid $color-border;
  font-size: 14px;
  background-color: $color-white;
  color: #A3B5BF;

  height: 44px;
  border-color: #EAF1F4;
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
