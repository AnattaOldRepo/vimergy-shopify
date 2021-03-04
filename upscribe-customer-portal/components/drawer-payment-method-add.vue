<script>
import { mapMutations, mapGetters, mapState, mapActions } from 'vuex'

// import DrawerWrap from '@components/drawer-wrap.vue'
import PaymentMethodsBlock from '@components/payment-methods-block.vue'
import Checkbox from '@components/checkbox.vue'
import detectBrowser from '@utils/detectBrowser.js'

export default {
  components: {
    // Card,
    PaymentMethodsBlock,
    // DrawerWrap,
    Checkbox,
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
      applyToAllActiveSubscriptions: false,
      updating: false,
    }
  },

  computed: {
    ...mapState('customer', ['paymentCards', 'customerShopifyId']),

    ...mapState('translations', ['atc']),

    ...mapState('editMode', ['editNextOrder']),

    ...mapState('shop', ['stripePublicKey', 'payment_type']),

    ...mapState('payment', ['paymentType', 'paymentSource', 'savedSourceData']),

    ...mapGetters('cards', ['activeCard']),

    ...mapGetters('subscriptions', ['subscriptionActive']),

    paymentRequestText() {
      const { browser, atc } = this
      if (!browser) return atc['labels.paymentRequest'] || 'Payment Request'


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

      return atc['labels.paymentRequest'] || 'Payment Request'

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
        } else if (
          useNewPayment === true &&
          this.paymentCards &&
          this.paymentCards.length
        ) {
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
    },

    ...mapActions('customer', ['GET_CUSTOMER']),

    ...mapActions('subscriptions', [
      'UPDATE_SUBSCRIPTION',
      'UPDATE_NEXT_ORDER',
      'GET_SUBSCRIPTIONS',
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

      if (client_secret || livemode || source) {
        this.setPaymentValidationClientSecret(client_secret)
        this.setPaymentValidationSource(source)
        this.setPaymentValidationLiveMode(livemode)

        // not using existing card
        this.useNewPayment()
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
        displayPaymentType = true
      }

      return paymentTypeEnabled && displayPaymentType
    },

    handleFinalPaymentPayloadResponse({
      fullResponse,
      newPaymentData,
      updatePaymentData,
      paymentType,
    }) {
      this.addPaymentMethod(newPaymentData, paymentType)
    },

    async addPaymentMethod(paymentMethod, paymentType) {
      const { editNextOrder, customerShopifyId } = this

      this.$emit('setDrawerStatus', 'PENDING')
      this.updating = true

      try {
        const allPaymentMethodsResponse = await this.CREATE_PAYMENT_METHOD({
          paymentMethod,
          paymentType,
        })

        const allPaymentMethods = allPaymentMethodsResponse

        // get newest updated payment method - that's how we know that's the one we
        // need to update on the active subscription (and potentially queue)
        const sortedPaymentMethods = [...allPaymentMethods].sort(
          (a, b) => new Date(a.updated_at) - new Date(b.updated_at)
        )

        const newPaymentMethodId =
          sortedPaymentMethods[sortedPaymentMethods.length - 1].id

        const updatePayload = {
          requestPayload: {
            payment_method_id: newPaymentMethodId,
          },
          bulkUpdate: this.applyToAllActiveSubscriptions,
        }

        let updateAction
        if (editNextOrder) {
          updateAction = this.UPDATE_NEXT_ORDER(updatePayload)
        }

        // determine if updating both of just one
        else {
          updateAction = this.UPDATE_SUBSCRIPTION(updatePayload)
        }

        try {
          await updateAction
          await this.GET_CUSTOMER(customerShopifyId)
          await this.GET_SUBSCRIPTIONS()

          this.$emit('setDrawerStatus', 'SUCCESS')
          this.$emit('setMode', 'default')
          this.updating = false
        } catch (e) {
          console.error('`New payment method added to subscription: ', e)
          this.$emit('setDrawerStatus', {
            state: 'FAILURE',
            message: e.message.message ? e.message.message : e.message,
          })
        }
      } catch (e) {
        console.error('card/ADD_CARD error: ', e)
        this.$emit('setDrawerStatus', {
          state: 'FAILURE',
          message: e.message.message ? e.message.message : e.message,
        })
      }
    },

    handleStripeElementChange(payload) {
      this.completeStripeCardInfo = payload.complete
      if (payload.error) {
        console.error({ error: payload.error })
      }
    },

    handleSubmitPaymentForm() {},

    createPaymentMethodHandler() {
      const { atc } = this

      if (!this.activePaymentType) {
        this.placeOrderError = {
          status: 'ERROR',
          message: atc['errors.selectPaymentType'] || 'Please select payment type',
        }
        return
      }

      if (!this.completeStripeCardInfo) {
        this.placeOrderError = {
          status: 'ERROR',
          message: atc['errors.completePaymentForm'] || 'Please complete the payment form',
        }
        return
      } else {
        this.creatingPaymentMethodPendingError = false
        this.creatingPaymentMethodPending = false
      }

      const stripePaymentOptions = this.$refs['stripe-payment-options']

      const activePaymentTypeEl =
        stripePaymentOptions.$refs[
          'active-payment-type-' + this.activePaymentType
        ]

      this.creatingPaymentMethodPending = true
      activePaymentTypeEl.createPaymentMethod()
    },

    handlePlaceOrderResponseFromRedirect({
      fullResponse,
      paymentData,
      paymentType,
    }) {},

    handleCreatePaymentMethodResponse({
      fullResponse,
      paymentData,
      paymentType,
    }) {
      this.addPaymentMethod(fullResponse)
    },

    handleEnableStripePaymentRequest(val) {
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
      <h2 class="c-drawer__title">{{
        atc['portal.addPaymentMethodDrawerTitle'] || 'Add Payment Method'
      }}</h2>

      <checkbox
        v-model="applyToAllActiveSubscriptions"
        :label="
          atc['portal.applyToAllActiveSubscriptions'] ||
            'Apply to all active subscriptions'
        "
      />

      <payment-methods-block
        :updating="updating"
        :submit-button-text="atc['buttons.addNewPaymentMethod'] || 'Add New Payment Method'"
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
