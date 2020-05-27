<template>
  <div class="c-addCard">
    <payment-methods-block
      ref="payment-methods-block"
      :updating="updating"
      :submit-button-text="atc['buttons.addCard'] || 'Add New Payment Method'"
      @cancel="goBackRoute"
      @finalPaymentPayloadResponse="handleFinalPaymentPayloadResponse"
    />
  </div>
</template>


<script>
import { mapMutations, mapState, mapActions } from 'vuex'
import PaymentMethodsBlock from '@components/payment-methods-block.vue'

import detectBrowser from '@utils/detectBrowser.js'

export default {
  components: {
    // Card,
    PaymentMethodsBlock,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },

  },
  data: () => {
    return {
      browser: null,

      loadedStripe: false,
      completeStripeCardInfo: false,
      activeExistingCard: null,
      useNewPaymentState: true,

      orderSuccessfullyPlaced: false,
      placeOrderPending: null,
      placeOrderError: null,

      activePaymentType: null,

      stripePaymentRequestEnabled: false,
      processingRedirectPaymentVerification: false,

      updating: false,
    }
  },

  computed: {
   ...mapState('customer', ['paymentCards']),

    ...mapState('translations', ['atc']),

    ...mapState('shop', [
      'stripePublicKey',
      // 'checkoutStoreDomain',
      // 'updateBillingAddressPending',
      // 'updateBillingAddressError',
      // 'checkoutData',
      'payment_type',
      // 'cta_color',
    ]),

    ...mapState('account', ['accountData', 'guestCheckout']),

    // ...mapGetters('checkout', ['checkoutBillingAddress']),

    ...mapState('payment', [
      'paymentType',
      'paymentSource',
      'savedSourceData',
    ]),

    paymentRequestText() {
      const { browser } = this
      if (!browser) return 'Payment Request'

      const {
        // isFirefox,
        isChrome,
        isSafari,
        // isOpera,
        isIE,
        isEdge,
        // isBlink,
      } = browser

      if (isChrome) return 'Google Pay'
      if (isSafari) return 'Apple Pay'
      if (isIE || isEdge) return 'Microsoft Pay'

      return 'Payment Request'
    },

    paymentTypes() {
      const { payment_type } = this
      return payment_type || []
    },
  },

  watch: {
    useNewPaymentState: {
      immediate: true,
      handler: function(useNewPayment) {
        if (!useNewPayment) {
          this.activePaymentType = null
        }

        else if (useNewPayment === true && this.paymentCards && this.paymentCards.length) {
          this.activeExistingCard = this.paymentCards[0]
        }
      },
    },
  },


  // mounted() {
  //   if (process.browser) {
  //     let domElement = document.createElement('script')
  //     domElement.setAttribute('src', 'https://js.stripe.com/v3/')
  //     domElement.onload = () => {
  //       this.loadedStripe = true
  //     }
  //     document.body.appendChild(domElement)
  //   }
  // },


  mounted() {
    const { paymentCards } = this

    this.setBrowser()

    // this.resetCheckoutUiState()
    // reset on new load
    this.orderSuccessfullyPlaced = false

    if (process.browser) {
      let domElement = document.createElement('script')
      domElement.setAttribute('src', 'https://js.stripe.com/v3/')
      domElement.onload = () => {
        this.loadedStripe = true
      }
      document.body.appendChild(domElement)
    }

    if (paymentCards && paymentCards.length) {
      this.activeExistingCard = paymentCards[0]
      this.useNewPaymentState = false
    } else {
      this.useNewPaymentState = true
    }

    this.handlePotentialPaymentVerificationRedirects()

  },

  methods: {
    ...mapMutations('mobileGlobalManagement', ['setMessage', 'setStatus']),

    ...mapActions('mobileGlobalManagement', ['swapPageTransitionDynamic']),

    goBackRoute(){
      this.swapPageTransitionDynamic('page')
      this.$router.go(-1)
    },

    setBrowser() {
      const result = detectBrowser()
      this.browser = result
    },

    ...mapActions('cards', ['CREATE_PAYMENT_METHOD']),

    ...mapMutations('payment', [
      'setPaymentValidationClientSecret',
      'setPaymentValidationSource',
      'setPaymentValidationLiveMode',
    ]),

    handleClear(){
      this.$refs['payment-methods-block'].handleClear()
    },

    handlePotentialPaymentVerificationRedirects() {
      const { $route, paymentType } = this
      const queryParams = $route.query || {}
      const { client_secret, livemode, source } = queryParams

      console.log({ queryParams })

      if (client_secret || livemode || source) {
          this.setPaymentValidationClientSecret(client_secret)
          this.setPaymentValidationSource(source)
          this.setPaymentValidationLiveMode(livemode)

        // not using existing card
        this.useNewPayment()
        console.log('use new payment')
      }

      // set payment type selection
      if (paymentType) {
        this.setActivePaymentType(paymentType)
      }
    },

    toggleActivePaymentType(type) {
      const { activePaymentType } = this
      if (activePaymentType === type) {
        this.activePaymentType = null
      } else {
        this.activePaymentType = type
      }
    },

    displayPaymentType(type) {
      const { paymentTypes, activePaymentType } = this
      let paymentTypeEnabled = false
      let displayPaymentType = false

      if (paymentTypes.includes(type)) {
        paymentTypeEnabled = true
      }
      if (!activePaymentType || activePaymentType === type) {
        console.log({type })
        displayPaymentType = true
      }

      return paymentTypeEnabled && displayPaymentType
    },

    handleFinalPaymentPayloadResponse({fullResponse, newPaymentData, updatePaymentData, paymentType}) {
      console.log({fullResponse, newPaymentData, updatePaymentData, paymentType})
      this.addPaymentMethod(newPaymentData)
    },

    async addPaymentMethod(newPaymentData) {
      console.log('addPaymentMethod', {newPaymentData})
      this.updating = true
      this.setMessage('Adding new Payment Method')
      this.setStatus('updating')
      try {
        await this.CREATE_PAYMENT_METHOD(newPaymentData)

        this.setMessage('Saved new Payment method')
        this.setStatus('success')
      } catch (e) {
        console.log('card/ADD_CARD error: ', e)
        this.setMessage(e.message)
        this.setStatus('error')
      } finally {
        this.updating = false
      }
    },

    handleStripeElementChange(payload) {
      console.log('handleStripeElementChangePayload: ', payload)
      this.completeStripeCardInfo = payload.complete
      if (payload.error) {
        console.log({error: payload.error})
      } else {
        console.log('no error')
      }
    },

    handleSubmitPaymentForm() {
      console.log('handleSubmitPaymentForm')
    },

    createPaymentMethodHandler() {
      console.log('createPaymentMethod top')
      // const vm = this

      if (!this.activePaymentType) {
        console.log('not complete')
        this.placeOrderError = {
          status: 'ERROR',
          message: 'Please select payment type',
        }
        return
      }

      if (!this.completeStripeCardInfo) {
        console.log('not complete')
        this.placeOrderError = {
          status: 'ERROR',
          message: 'Please complete the payment form',
        }
        return

      } else {
        this.creatingPaymentMethodPendingError = false
        this.creatingPaymentMethodPending = false
      }

      const stripePaymentOptions = this.$refs['stripe-payment-options']
      console.log({stripePaymentOptions})

      const activePaymentTypeEl = stripePaymentOptions.$refs['active-payment-type-' + this.activePaymentType]
      console.log({activePaymentTypeEl})

      this.creatingPaymentMethodPending = true
      activePaymentTypeEl.createPaymentMethod()
    },

    handlePlaceOrderResponseFromRedirect({fullResponse, paymentData, paymentType}) {
      console.log('handlePlaceOrderResponseFromRedirect', {fullResponse, paymentData, paymentType})
    },

    handleCreatePaymentMethodResponse({fullResponse, paymentData, paymentType}) {
      console.log('handleCreatePaymentMethodResponse', {fullResponse, paymentData, paymentType})
      this.addPaymentMethod(fullResponse)
    },

    handleEnableStripePaymentRequest(val) {
      console.log('enableStripePaymentRequest top level', val)
      this.stripePaymentRequestEnabled = true
    },

    handleProcessingRedirectPaymentVerification(val) {
      this.processingRedirectPaymentVerification = val
    },
  },
}
</script>


<style lang="scss">
.c-cardAdd__addCardButton{
  margin-top: 16px;
}
</style>
