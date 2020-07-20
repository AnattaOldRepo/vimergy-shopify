<script>
import { mapState } from 'vuex'
import braintree from 'braintree-web'

console.log('initial braintree: ', braintree)

export default {
  props: {
    activePaymentType: {
      type: String,
      required: true,
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
   }
  },
  computed: {
    ...mapState('shop', ['braintreeClientToken']),
  },
  mounted() {
    const { braintreeClientToken } = this
    this.authorization = braintreeClientToken
    this.createHostedFields()
  },

  methods: {

    clearErrors() {
      console.log('clearErrors')
      this.$emit('handleError', {type: false, message: false})
      this.error = false
    },

    createHostedFields() {
      // eslint-disable-next-line no-unused-vars
      let checkout
      const vm = this
      const authorization = this.authorization

      console.log('braintree: ', braintree)

      braintree.setup(authorization, 'custom', {
        id: 'braintree-card-form',
        hostedFields: {
          number: {
            selector: '#braintree-card-number',
            placeholder: 'Card number',
          },
          cvv: {
            selector: '#braintree-card-cvv',
            placeholder: 'CVC',
          },
          expirationDate: {
            selector: '#braintree-card-expiration-date',
            placeholder: 'MM / YY',
          },
          postalCode: {
            selector: '#braintree-card-postal-code',
            placeholder: 'ZIP',
          },
          styles: {
            'input': {
              'font-size': '16px',
              'font-weight': 'lighter',
              'color': '#32325d',
            },
            ':focus': {
              'color': '#32325d',
            },
            '.valid': {
              'color': '#32325d',
            },
            'input.invalid': {
              'color': '#ff7777',
            },
            'input.valid': {
              'color': '#32325d',
            },
            '::-webkit-input-placeholder': {
              'color': '#A3B5BF',
            },
            ':-moz-placeholder': {
              'color': '#A3B5BF',
            },
            '::-moz-placeholder': {
            'color': '#A3B5BF',
            },
            ':-ms-input-placeholder': {
              'color': '#A3B5BF',
            },
          },
        },
        onReady: function (integration) {
          checkout = integration
        },
        onPaymentMethodReceived: function (payload) {
          console.log('onPaymentMethodReceived',{payload})
          vm.clearErrors()
          vm.$emit('handleError', {type: false, message: false})

          vm.$emit('createPaymentMethodResponse', {
            fullResponse: payload,
            newPaymentData: {
              id: payload.nonce,
              creditCard: payload.details,
            },
            updatePaymentData: payload.details,
            paymentType: 'braintree_card',
          })
        },
        paymentMethodNonceReceived: function(payload) {
          console.log('paymentMethodNonceReceived', payload)
        },
        onError: function({type, message}) {
          console.log('onError', {type, message})
          vm.error = message
          vm.$emit('handleError', {type, message})
          // this.$emit('handleChange', {type, message})
        },
      })
    },
    // submit Braintree form
    createPaymentMethod() {
      console.log('submit payment method')
      const submitButton = document.getElementById('braintree-card-submit')
      submitButton.click()
    },

    handleChange($event) {
      console.log('braintree payment options: ', {$event})
      this.$emit('handleChange', $event)
    },
    handleCreatebraintreeCardToken(token) {
      console.log({token})
    },
    handlePlaceOrderResponse(response) {
      console.log('handlePlaceOrderResponse: ', response)
      this.$emit('placeOrderResponse', response)
    },
    handleEnablebraintreePaymentRequest(val){
      console.log('handleEnablebraintreePaymentRequest', val)
      this.$emit('enablebraintreePaymentRequest', val)
    },
    handleSubmit() {
      console.log('submit braintree')
      this.$emit('handleError', {type: false, message: false})

    },
  },
}
</script>

<template>
<div>
  <no-ssr>
    <form id="braintree-card-form" ref="active-payment-type-braintree_card" method="post" @submit.prevent="handleSubmit">
      <!-- <label class="hosted-fields--label" for="braintree-card-number">Card Number</label> -->
      <div id="braintree-card-number" class="hosted-field c-braintreeFormInput c-braintreeFormInput--text" style="margin-bottom: 20px;"></div>

      <div class="form-row inline c-braintreeFormSplitGroups">

        <div class="col c-paymentMethodFormGroup">
          <!-- <label class="hosted-fields--label" for="braintree-card-expiration-date">Expiration Date</label> -->
          <div id="braintree-card-expiration-date" class="hosted-field c-braintreeFormInput c-braintreeFormInput--text"></div>
        </div>

        <div class="col c-paymentMethodFormGroup">
          <!-- <label class="hosted-fields--label" for="braintree-card-cvv">CVV</label> -->
          <div id="braintree-card-cvv" class="hosted-field c-braintreeFormInput c-braintreeFormInput--text"></div>
        </div>

        <div class="col c-paymentMethodFormGroup">
          <!-- <label class="hosted-fields--label" for="braintree-card-cvv">Postal Code</label> -->
          <div id="braintree-card-postal-code" class="hosted-field c-braintreeFormInput c-braintreeFormInput--text"></div>
        </div>
      </div>

      <div class="button-container" style="display:none;">
        <input id="braintree-card-submit" ref="active-payment-type-braintree-card-submit-button" type="submit" class="button button--small button--green" value="Purchase"/>
      </div>
    </form>

    <div v-if="error" id="card-errors" role="alert" class="c-paymentMethodErrors">{{ error }}</div>

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

.c-paymentMethodFormGroup {
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

.c-paymentMethodFormGroup {
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
