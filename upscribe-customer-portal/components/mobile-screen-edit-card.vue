<template>
  <div class="c-addressPayment__formattedComponent">
    <portal to="header">
      <the-header
        middle-html="Edit Payment Method"
        mode="customized"
        customized-func-text="Cancel"
        @headerAction="handleHeaderAction"
      />
    </portal>

    <div v-if="activeEditCard">
			<card-item no-edit :card="activeEditCard" />

			<edit-payment-methods-block
        ref="edit-payment-methods-block"
				:updating="updating"
				:submit-button-text="
					atc['buttons.updateCard'] || 'Save Updated Payment Method'
				"
				edit-payment-method-mode
				@cancel="$emit('setMode', 'default')"
				@remove="showRemoveCardPrompt"
				@finalPaymentPayloadResponse="handleFinalPaymentPayloadResponse"
			/>
    </div>

    <div v-else>
      <p class="c-modalSubscription__loadingText">Loading Current Card...</p>
    </div>
  </div>
</template>


<script>
import TheHeader from '@components/the-header'
import CardItem from '@components/card-item.vue'
// import PaymentMethodsBlock from '@components/payment-methods-block.vue'
import EditPaymentMethodsBlock from '@components/edit-payment-methods-block.vue'
import detectBrowser from '@utils/detectBrowser.js'

import { windowSizes } from '@mixins/windowSizes'
import { mapState, mapActions, mapMutations } from 'vuex'

export default {
  components: {
    TheHeader,
    // PaymentMethodsBlock,
		EditPaymentMethodsBlock,
    CardItem,
  },

  mixins: [windowSizes],

	props: {
		show: {
			type: Boolean,
			default: false,
		},
		updateCardOnlyModal: {
			type: Boolean,
			default: false,
		},
		removeableCard: {
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

			stripePaymentRequestEnabled: false,
			processingRedirectPaymentVerification: false,

			updating: false,
		}
	},

  computed:{
      ...mapState('editMode', ['editNextOrder']),

  	...mapState('customer', ['paymentCards', 'customerShopifyId']),

		...mapState('cards', ['activeEditCard']),

		...mapState('translations', ['atc']),

		...mapState('shop', ['stripePublicKey', 'payment_type']),

		...mapState('account', ['accountData', 'guestCheckout']),

		...mapState('payment', ['paymentType', 'paymentSource', 'savedSourceData']),

		...mapState('activeSubscription', ['activeSubscription']),

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

  methods:{
    ...mapMutations('mobileGlobalManagement', ['setMessage', 'setStatus']),

    ...mapActions('mobileGlobalManagement', ['swapPageTransitionDynamic']),

    ...mapActions('subscriptions', ['UPDATE_NEXT_ORDER']),

    ...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),

    ...mapActions('cards', ['UPDATE_PAYMENT_METHOD']),

  	setBrowser() {
			const result = detectBrowser()
			this.browser = result
		},

		...mapActions('customer', ['GET_CUSTOMER']),

		...mapActions('cards', ['UPDATE_PAYMENT_METHOD']),

		...mapMutations('payment', [
			'setPaymentValidationClientSecret',
			'setPaymentValidationSource',
			'setPaymentValidationLiveMode',
    ]),

 		...mapActions('subscriptions', [
			'UPDATE_SUBSCRIPTION',
			'UPDATE_NEXT_ORDER',
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

      // console.log({fullResponse,
			// newPaymentData,
			// updatePaymentData,
			// paymentType})

      this.updatePaymentMethod(updatePaymentData, paymentType)
		},

		async updatePaymentMethod(updatePaymentData, paymentType) {
			const { customerShopifyId, editNextOrder } = this

      const paymentMethodId = this.activeEditCard.id
      const paymentCustomerId = this.activeEditCard.payment_customer_id
      this.$emit('setDrawerStatus', 'PENDING')

      this.setMessage('Updating Payment Method')
      this.setStatus('updating')

			try {
        const updatedPayment = await this.UPDATE_PAYMENT_METHOD({updatePayload: updatePaymentData, paymentMethodId, paymentType, paymentCustomerId})

        const updatedPaymentId = updatedPayment.id

				const updatePayload = {
					requestPayload: {
            payment_method_id: updatedPaymentId,
					},
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

          this.$emit('setDrawerStatus', 'SUCCESS')
          this.$emit('setMode', 'default')

          this.setMessage('Updated Payment Method')
          this.setStatus('success')
					this.updating = false

          if (this.windowWidth < 768) {
            this.goBackRoute()
          }
				} catch (e) {
					console.log('`New payment method added to subscription: ', e)
          this.setMessage(e.message)
          this.setStatus('error')
				}



			} catch (e) {
				console.log('card/UPDATE_PAYMENT_METHOD error: ', e)
				this.$emit('setDrawerStatus', {
					state: 'FAILURE',
					message: e.message.message ? e.message.message : e.message,
        })
        this.setMessage(e.message)
        this.setStatus('error')

			} finally {
				this.updating = false
			}
		},

		handleStripeElementChange(payload) {
			this.completeStripeCardInfo = payload.complete
			if (payload.error) {
				console.log({ error: payload.error })
			}
		},

		handleSubmitPaymentForm() {
			// console.log('handleSubmitPaymentForm')
		},

		createPaymentMethodHandler() {
			if (!this.activePaymentType) {
				this.placeOrderError = {
					status: 'ERROR',
					message: 'Please select payment type',
				}
				return
			}

			if (!this.completeStripeCardInfo) {
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
		}) {
			// console.log('handlePlaceOrderResponseFromRedirect', {
			// 	fullResponse,
			// 	paymentData,
			// 	paymentType,
			// })
		},

		handleCreatePaymentMethodResponse({
			fullResponse,
			paymentData,
			paymentType,
		}) {
			// console.log('handleCreatePaymentMethodResponse', {
			// 	fullResponse,
			// 	paymentData,
			// 	paymentType,
			// })
			this.addPaymentMethod(fullResponse)
		},

		handleEnableStripePaymentRequest(val) {
			this.stripePaymentRequestEnabled = true
		},

		handleProcessingRedirectPaymentVerification(val) {
			this.processingRedirectPaymentVerification = val
		},

		showRemoveCardPrompt() {
			this.$emit('setMode', 'remove')
		},

    handleHeaderAction(){
      if (this.$refs['payment-methods-block']) {
        this.$refs['payment-methods-block'].handleClear()
      }
      this.goBackRoute()
    },

    goBackRoute(){
      this.swapPageTransitionDynamic('page')
      this.$router.go(-1)
    },
  },
}
</script>
