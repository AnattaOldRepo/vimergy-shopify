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
import { windowSizes } from '@mixins/windowSizes'

import detectBrowser from '@utils/detectBrowser.js'

export default {
	components: {
		// Card,
		PaymentMethodsBlock,
  },

  mixins: [windowSizes],

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
			'payment_type',
		]),

		...mapState('account', ['accountData', 'guestCheckout']),

		...mapState('payment', ['paymentType', 'paymentSource', 'savedSourceData']),

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

	methods: {
		...mapMutations('mobileGlobalManagement', ['setMessage', 'setStatus']),

		...mapActions('mobileGlobalManagement', ['swapPageTransitionDynamic']),


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

		goBackRoute() {
			this.swapPageTransitionDynamic('page')
			this.$router.go(-1)
		},

		setBrowser() {
			const result = detectBrowser()
			this.browser = result
    },

		handleClear() {
      if (!this.$refs['payment-methods-block']) return
			this.$refs['payment-methods-block'].handleClear()
		},

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

      this.setMessage('Adding Payment Method')
      this.setStatus('updating')

			try {
        const allPaymentMethodsResponse = await this.CREATE_PAYMENT_METHOD({paymentMethod, paymentType})

        const allPaymentMethods = allPaymentMethodsResponse

        // get newest updated payment method - that's how we know that's the one we
        // need to update on the active subscription (and potentially queue)
        // get newest updated payment method - that's how we know that's the one we
        // need to update on the active subscription (and potentially queue)
        const sortedPaymentMethods = allPaymentMethods.slice().sort((a, b) => a.updated_at - b.updated_at)

        const newPaymentMethodId = sortedPaymentMethods[sortedPaymentMethods.length -1].id

				const updatePayload = {
					requestPayload: {
            payment_method_id: newPaymentMethodId,
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
          this.setMessage('Added Payment Method')
          this.setStatus('success')
          this.updating = false

          if (this.windowWidth < 768) {
            this.goBackRoute()
          }

				} catch (e) {
					console.log('`New payment method added to subscription: ', e)
					this.$emit('setDrawerStatus', {
						state: 'FAILURE',
						message: e.message.message ? e.message.message : e.message,
					})
				}
			} catch (e) {
				console.log('CREATE_PAYMENT_METHOD error: ', e)
				this.$emit('setDrawerStatus', {
					state: 'FAILURE',
					message: e.message.message ? e.message.message : e.message,
        })
        this.setMessage(e.message)
        this.setStatus('error')
			}
		},

		handleStripeElementChange(payload) {
			this.completeStripeCardInfo = payload.complete
			if (payload.error) {
				console.log({ error: payload.error })
			}
		},

		handleSubmitPaymentForm() {
			console.log('handleSubmitPaymentForm')
		},

		createPaymentMethodHandler() {
			console.log('createPaymentMethod top')

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
	},
}
</script>


<style lang="scss">
.c-cardAdd__addCardButton {
	margin-top: 16px;
}
</style>
