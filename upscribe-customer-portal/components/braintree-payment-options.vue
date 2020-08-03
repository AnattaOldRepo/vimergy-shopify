<script>
import BraintreePaypalElement from '@components/braintree-paypal-element.vue'
import BraintreeCardElement from '@components/braintree-card-element.vue'
import { mapState }  from 'vuex'

export default {
  components: {
    BraintreeCardElement,
    BraintreePaypalElement,
  },
  props: {
    activePaymentType: {
      type: String,
      default: 'card',
    },
    completebraintreeCardInfo: {
      type: Boolean,
      default: false,
    },
    placeOrderPending: {
      type: Boolean,
      default: false,
    },
  },
  data: () => {
    return {
      braintreeOptions: {},
      authorization: null,
      error: '',
      braintreeLoaded: false,
   }
  },
  computed: {
    ...mapState('shop', ['braintreeClientToken']),
  },
  methods: {
    clearErrors() {
      this.$emit('handleError', {type: false, message: false})
      this.error = false
    },

    handleChange($event) {
      this.$emit('handleChange', $event)
    },
    handlePlaceOrderResponse(response) {
      // console.log('handlePlaceOrderResponse: ', response)
      this.$emit('placeOrderResponse', response)
    },
    handleCreatePaymentMethodResponse(response) {
      // console.log('handleCreatePaymentMethodResponse: ', response)
      this.$emit('createPaymentMethodResponse', response)
    },
    handleEnablebraintreePaymentRequest(val){
      // console.log('handleEnablebraintreePaymentRequest', val)
      this.$emit('enablebraintreePaymentRequest', val)
    },
    submitPaymentForm() {
      // console.log('submit braintree')
      this.$emit('handleError', {type: false, message: false})
    },
  },
}
</script>

<template>
<div>
  <no-ssr>
    <braintree-card-element
      v-if="activePaymentType === 'braintree_card' && braintreeClientToken"
      ref="active-payment-type-braintree_card"
      :braintree-client-token="braintreeClientToken"
      @handleChange="handleChange($event)"
      @submitPaymentForm="$emit('submitPaymentForm')"
      @placeOrderResponse="handlePlaceOrderResponse($event)"
      @createPaymentMethodResponse="handleCreatePaymentMethodResponse($event)"
    />

    <braintree-paypal-element
      v-if="activePaymentType === 'braintree_paypal' && braintreeClientToken"
      ref="active-payment-type-braintree_paypal"
      :braintree-client-token="braintreeClientToken"
      @handleChange="handleChange($event)"
      @submitPaymentForm="$emit('submitPaymentForm')"
      @placeOrderResponse="handlePlaceOrderResponse($event)"
      @createPaymentMethodResponse="handleCreatePaymentMethodResponse($event)"
    />

  </no-ssr>
</div>
</template>

<style lang="scss">
@import '@design';

.c-braintreeErrors, {
  margin: 20px 0;
  color: $color-error;
  padding: 20px;
  background-color: lighten($color-error, 55%);
  border-radius: 4px;
  line-height: 1.3;
}

.c-braintreeInfo {
  margin: 16px 0;
  color: #171725;
  padding: 20px;
  background-color: #EAF1F4;
  border-radius: 4px;
  font-size: 14px;
  line-height: 18px
}

.braintreeElement {
  background-color: $color-white;
  border: 1px solid $color-border;
}


.c-braintreeIban {
  display: block;
}

.c-braintreeFormGroup {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}

.c-braintreeFormLabel {
  color: $color-text;
  font-size: 13px;
  margin-bottom: 2px;
}

.c-braintreeFormInput {
  &::placeholder {
    color: #A3B5BF;
    font-size: 14px;
  }
  &:focus {
    outline: none;
    border-color: $color-border;
  }
}

.c-braintreeFormInput--select {

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
    border: 1px solid $color-border;
    outline: none;
    white-space: nowrap;
  }

  .vs__search {
    font-size: 14px;
    &::placeholder {
      color: $color-border;
      font-size: 14px;
    }
  }
}

.c-braintreeFormInput--text,
.braintreeElement {
  height: 40px;
  padding: 10px 12px;
  border-radius: 4px;
  border: 1px solid $color-border;
  font-size: 14px;
  background-color: $color-white;

  &::placeholder {
    color: $color-border;
  }
}

.braintreeElement--focus {
  outline: none;
  border-color: $color-black;
}

.braintreeElement--invalid {
  border-color: $color-error;
}

.braintreeElement--webkit-autofill {
  background-color: $color-background !important;
}

.c-braintreeFormSplitGroups {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-column-gap: 20px;
  grid-row-gap: 20px;
  width: 100%;
}

.c-braintreeBankName {
  color: $color-black;
  font-size: 14px;
  margin-top: 4px;
}


.c-braintreeIban {
  display: block;
}

.c-braintreeFormGroup {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}

.c-braintreeFormLabel {
  color: $color-text;
  font-size: 13px;
  margin-bottom: 2px;
}

.c-braintreeFormInput {
  &:focus {
    outline: none;
    border-color: $color-input-border;
  }
  &::placeholder {
    color: #A3B5BF;
  }
}

// input,
.braintreeElement {
  height: 40px;
  padding: 10px 12px;
  border-radius: 4px;
  border: 1px solid $color-input-border;
  font-size: 14px;
  background-color: $color-white;
  color: #A3B5BF;

  height: 44px;
  border-color: #EAF1F4;
}

input:focus,
.braintreeElement--focus {
  outline: none;
  border-color: $color-input-border;
}

.braintreeElement--invalid {
  border-color: #fa755a;
}

.braintreeElement--webkit-autofill {
  background-color: #fefde5 !important;
}

</style>
