<script>
import { mapMutations, mapGetters, mapState, mapActions } from 'vuex'

// import DrawerWrap from '@components/drawer-wrap.vue'
import PaymentMethodsBlock from '@components/payment-methods-block.vue'

import detectBrowser from '@utils/detectBrowser.js'

export default {
  components: {
    // Card,
    PaymentMethodsBlock,
    // DrawerWrap,
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


      // what
      updating: false,
    }
  },

  computed: {
    ...mapState('customer', ['paymentCards', 'customerShopifyId']),

    ...mapState('translations', ['atc']),

    ...mapState('editMode', ['editNextOrder']),

    ...mapState('shop', [
      'stripePublicKey',
      'payment_type',
    ]),

    ...mapState('payment', [
      'paymentType',
      'paymentSource',
      'savedSourceData',
    ]),

    ...mapGetters('cards', ['activeCard']),

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
    setBrowser() {
      const result = detectBrowser()
      this.browser = result
      console.log(result)
    },

    ...mapActions('customer', ['GET_CUSTOMER']),


		...mapActions('subscriptions', [
			'UPDATE_SUBSCRIPTION',
			'UPDATE_NEXT_ORDER',
		]),

    ...mapActions('cards', ['CREATE_PAYMENT_METHOD']),

    ...mapMutations('cards', ['setActiveEditCard', 'setNewSwapCard']),

    ...mapMutations('payment', [
      'setPaymentValidationClientSecret',
      'setPaymentValidationSource',
      'setPaymentValidationLiveMode',
    ]),

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
      const {editNextOrder, customerShopifyId } = this

			console.log('addPaymentMethod', { newPaymentData })
      this.$emit('setDrawerStatus', 'PENDING')
			this.updating = true

			try {
        const newPaymentMethodId = newPaymentData.card ? newPaymentData.card.id : newPaymentData.id
        const allPaymentMethods = await this.CREATE_PAYMENT_METHOD(newPaymentData)

        console.log({allPaymentMethods})
        console.log({newPaymentMethodId})

        const newPaymentMethodReturned = allPaymentMethods.items.filter(method => method.id === newPaymentMethodId)[0]

        console.log({newPaymentMethodReturned})

        const updatePayload = {
          requestPayload: {
            payment_method_id: newPaymentMethodReturned.id,
          },
        }

        let updateAction
        if (editNextOrder) {
          updateAction = this.UPDATE_NEXT_ORDER(updatePayload)
        }

        // determine if updating both of just one
        else {
          updateAction = (async () => {
            await this.UPDATE_NEXT_ORDER(updatePayload)
            await this.UPDATE_SUBSCRIPTION(updatePayload)
          })()
        }

        try {
          await updateAction
          await this.GET_CUSTOMER(customerShopifyId)

          this.$emit('setDrawerStatus', 'SUCCESS')
          this.$emit('setMode', 'default')
  				this.updating = false

        } catch (e) {
          console.log('`New payment method added to subscription: ', e)
  				this.$emit('setDrawerStatus', { state: 'FAILURE', message: e.message.message ? e.message.message : e.message})

        }

			} catch (e) {
				console.log('card/ADD_CARD error: ', e)
				this.$emit('setDrawerStatus', { state: 'FAILURE', message: e.message.message ? e.message.message : e.message})

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

<template>
  <!-- <drawer-wrap class="c-drawer" :show="show" @close="$emit('close')"> -->
    <div class=" c-drawer">
      <div class="c-drawer__inner">
        <h2 class="c-drawer__title">{{ atc['portal.addCardDrawerTitle'] || 'Add Payment Method' }}</h2>

        <payment-methods-block
          :updating="updating"
          :submit-button-text="atc['buttons.addCard'] || 'Add New Payment Method'"
          @cancel="$emit('setMode', 'default')"
          @finalPaymentPayloadResponse="handleFinalPaymentPayloadResponse"
        />
      </div>
    </div>
  <!-- </drawer-wrap> -->
</template>

<style lang="scss">
@import '@design';

.c-modalCardAdd__stripeCard {
  background-color: $color-gray-100;
  padding: 10px;
  border-radius: 5px;
}

.c-modalCardAdd__addCardButton {
  margin-top: 40px;
  margin-bottom: 20px;
}
</style>
