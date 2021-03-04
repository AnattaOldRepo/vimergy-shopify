<script>
import braintree from 'braintree-web'
import paypal from 'paypal-checkout'
import { mapGetters, mapState } from 'vuex'
import LoaderIcon from '@components/Icon/loader-icon'

export default {
  components: {
    LoaderIcon,
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
    braintreeClientToken: {
      type: String,
      required: true,
    },
    braintreePaymentRequestEnabled: {
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
      paypalLoaded: false,
    }
  },
  computed: {
    ...mapGetters('activeSubscription', [
      'activeShippingAddress',
      'activeTotalPrice',
    ]),

    ...mapState('shop', ['currency', 'store']),

    ...mapState('customer', ['customerShopify']),

    ...mapState('translations', ['atc']),

    languageCode() {
      return this.customerShopify.preferred_language || false
    },

    locale() {
      const { languageCode } = this
      const locales = [
        'en_US',
        'da_DK',
        'fr_FR',
        'de_DE',
        'zh_HK',
        'it_IT',
        'nl_NL',
        'no_NO',
        'pl_PL',
        'es_ES',
        'sv_SE',
        'tr_TR',
        'pt_BR',
        'ja_JP',
        'id_ID',
        'ko_KR',
        'pt_PT',
        'ru_RU',
        'th_TH',
      ]

      const match = locales.filter((locale) => locale.indexOf(languageCode) > 0)

      return match ? match[0] : null
    },
  },
  mounted() {
    const { braintreeClientToken } = this
    this.authorization = braintreeClientToken
    this.braintree = braintree
    this.createPaypalFields()
  },
  methods: {
    clearErrors() {
      this.$emit('handleError', { type: false, message: false })
      this.error = false
    },

    createPaypalFields() {
      // eslint-disable-next-line no-unused-vars
      let checkout
      const vm = this
      const authorization = this.authorization
      const {
        activeShippingAddress,
        currency,
        activeTotalPrice,
        store,
        locale,
        braintree,
        atc,
      } = this

      const sandboxMode = authorization.indexOf('sandbox') > -1

      braintree.client.create(
        {
          authorization,
        },
        function(clientErr, clientInstance) {
          // Stop if there was a problem creating the client.
          // This could happen if there is a network error or if the authorization
          // is invalid.
          if (clientErr) {
            console.error('Error creating client:', clientErr)
            vm.error = clientErr
            vm.$emit('handleError', { clientErr })
            return
          }

          // Create a PayPal Checkout component.
          braintree.paypalCheckout.create(
            {
              client: clientInstance,
            },
            function(paypalCheckoutErr, paypalCheckoutInstance) {
              // Stop if there was a problem creating PayPal Checkout.
              // This could happen if there was a network error or if it's incorrectly
              // configured.
              if (paypalCheckoutErr) {
                console.error(
                  'Error creating PayPal Checkout:',
                  paypalCheckoutErr
                )
                return
              }

              // Set up PayPal with the checkout.js library
              paypal.Button.render(
                {
                  env: sandboxMode ? 'sandbox' : null,

                  locale,

                  style: {
                    size: 'responsive',
                    color: 'gold',
                    shape: 'pill',
                    label: 'paypal',
                    tagline: 'false',
                  },

                  payment: function() {
                    return paypalCheckoutInstance.createPayment({
                      flow: 'vault',
                      billingAgreementDescription: atc['labels.paypalAgreementDescription'] || 'Your agreement description',
                      enableShippingAddress: true,
                      shippingAddressEditable: false,

                      singleUse: true,
                      enableBillingAddress: true,
                      amount: activeTotalPrice,
                      currency,
                      displayName: store.name,

                      shippingAddressOverride: {
                        recipientName:
                          `${activeShippingAddress.first_name} ${activeShippingAddress.last_name}` ||
                          '',
                        line1: activeShippingAddress.address1 || '',
                        line2: activeShippingAddress.address2 || '',
                        city: activeShippingAddress.city || '',
                        countryCode: activeShippingAddress.country_code || '',
                        postalCode: activeShippingAddress.zip || '',
                        state: activeShippingAddress.province_code || '',
                        phone: activeShippingAddress.phone || '',
                      },
                    })
                  },

                  onAuthorize: function(data, actions) {
                    return paypalCheckoutInstance.tokenizePayment(
                      data,
                      function(err, payload) {
                        if (err) {
                          vm.$emit('handleError', { type: false, message: err })
                          return
                        }

                        // Submit `payload.nonce` to your server.
                        vm.clearErrors()
                        vm.$emit('handleError', { type: false, message: false })

                        vm.$emit('createPaymentMethodResponse', {
                          fullResponse: payload,
                          newPaymentData: {
                            id: payload.nonce,
                            email: payload.details.email,
                          },
                          updatePaymentData: payload.details,
                          paymentType: 'braintree_paypal',
                        })
                      }
                    )
                  },

                  onCancel: function(data) {
                    console.error(
                      'checkout.js payment cancelled',
                      JSON.stringify(data, 0, 2)
                    )
                  },

                  onError: function(err) {
                    console.error('checkout.js error', err)
                  },
                },
                '#paypal-button'
              ).then(function() {
                vm.paypalLoaded = true
              })
            }
          )
        }
      )
    },

    // submit Braintree form
    createPaymentMethod() {
      const submitButton = document.getElementById('braintree-paypal-submit')
      submitButton.click()
    },

    handleChange($event) {
      if ($event.error) {
        this.error = $event.error.message
      } else {
        this.error = ''
      }
      this.$emit('handleChange', $event)
    },
  },
}
</script>

<template>
  <div class="c-braintreePaypal__wrapper">
    <form
      v-if="braintreeClientToken"
      v-show="paypalLoaded"
      class="c-braintreePaypal__form"
    >
      <div id="paypal-button"></div>
    </form>

    <loader-icon v-if="!paypalLoaded" />
  </div>
</template>

<style lang="scss">
@import '@design';

.c-braintreePaypal__wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0 12px 0;
}

.c-braintreePaypal__form {
  flex: 1;
}

// #braintree-paypal-container {
//   display: flex;
//   align-items: center;
//   justify-content: center;

//   .paypal-button.paypal-style-checkout.paypal-size-small {
//     max-width: 100% !important;
//   }

//   .paypal-button.paypal-style-checkout.paypal-size-small .paypal-button-tag-content {
//     margin: 16px 0;
//     color: #171725;
//     font-size: 14px;
//   }
// }

.c-braintreeErrors {
  padding: 20px;
  margin: 20px 0;
  line-height: 1.3;
  color: $color-error;
  background-color: lighten($color-error, 55%);
  border-radius: 4px;
}

.c-braintreeInfo {
  padding: 20px;
  margin: 16px 0;
  font-size: 14px;
  line-height: 18px;
  color: #171725;
  background-color: #eaf1f4;
  border-radius: 4px;
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
  margin-bottom: 2px;
  font-size: 13px;
  color: $color-text;
}

.c-braintreeFormInput {
  &::placeholder {
    font-size: 14px;
    color: #a3b5bf;
  }
  &:focus {
    border-color: $color-border;
    outline: none;
  }
}

.c-braintreeFormInput--select {
  .vs__dropdown-toggle {
    position: relative;
    display: flex;
    width: 100%;
    height: 42px;
    padding: 0 0 4px;
    padding: 0 16px 0 4px;
    font-size: 16px;
    text-align: left;
    white-space: normal;
    white-space: nowrap;
    cursor: pointer;
    background: none;
    border: 1px solid $color-border;
    border-radius: 4px;
    outline: none;
    outline: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
  }

  .vs__search {
    font-size: 14px;
    &::placeholder {
      font-size: 14px;
      color: $color-border;
    }
  }
}

.c-braintreeFormInput--text,
.braintreeElement {
  height: 40px;
  padding: 10px 12px;
  font-size: 14px;
  background-color: $color-white;
  border: 1px solid $color-border;
  border-radius: 4px;

  &::placeholder {
    color: $color-border;
  }
}

.braintreeElement--focus {
  border-color: $color-black;
  outline: none;
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
  grid-row-gap: 20px;
  grid-column-gap: 20px;
  width: 100%;
}

.c-braintreeBankName {
  margin-top: 4px;
  font-size: 14px;
  color: $color-black;
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
  margin-bottom: 2px;
  font-size: 13px;
  color: $color-text;
}

.c-braintreeFormInput {
  &:focus {
    border-color: $color-input-border;
    outline: none;
  }
  &::placeholder {
    color: #a3b5bf;
  }
}

// input,
.braintreeElement {
  height: 40px;
  height: 44px;
  padding: 10px 12px;
  font-size: 14px;
  color: #a3b5bf;
  background-color: $color-white;
  border: 1px solid $color-input-border;
  border-color: #eaf1f4;
  border-radius: 4px;
}

input:focus,
.braintreeElement--focus {
  border-color: $color-input-border;
  outline: none;
}

.braintreeElement--invalid {
  border-color: #fa755a;
}

.braintreeElement--webkit-autofill {
  background-color: #fefde5 !important;
}
</style>
