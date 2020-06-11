<script>
import { mapMutations, mapState, mapActions } from 'vuex'

// import DrawerWrap from '@components/drawer-wrap.vue'
import CardItem from '@components/card-item.vue'
import EditPaymentMethodsBlock from '@components/edit-payment-methods-block.vue'

// import VButton from '@components/v-button.vue'

import detectBrowser from '@utils/detectBrowser.js'

export default {
	components: {
		// Card,
		CardItem,
		// DrawerWrap,
		EditPaymentMethodsBlock,
		// VButton,
	},
	props: {
		show: {
			type: Boolean,
			default: false,
		},
		editNextOrder: {
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

			// what
			updating: false,
		}
	},

	computed: {
    ...mapState('customer', ['paymentCards', 'customerShopifyId']),

		...mapState('cards', ['activeEditCard']),

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

	methods: {
		setBrowser() {
			const result = detectBrowser()
			this.browser = result
			console.log(result)
    },

    ...mapActions('customer', ['GET_CUSTOMER']),

		...mapActions('cards', ['UPDATE_PAYMENT_METHOD']),

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
				console.log({ type })
				displayPaymentType = true
			}

			return paymentTypeEnabled && displayPaymentType
		},

		handleFinalPaymentPayloadResponse({
			fullResponse,
			newPaymentData,
			updatePaymentData,
      paymentType,
      paymentCustomerId,
		}) {
      this.updatePaymentMethod(updatePaymentData, paymentType, paymentCustomerId)
		},

    async updatePaymentMethod(updatePaymentData, paymentType, customerPaymentId, paymentCustomerId) {
      const { customerShopifyId } = this
			console.log('updatePaymentMethod', { updatePaymentData })
			const paymentMethodId = this.activeEditCard.id
			const updatePayload = updatePaymentData

      this.$emit('setDrawerStatus', 'PENDING')
			this.updating = true
			try {
        await this.UPDATE_PAYMENT_METHOD({updatePayload, paymentMethodId, paymentCustomerId})
        await this.GET_CUSTOMER(customerShopifyId)

				this.$emit('setDrawerStatus', 'SUCCESS')
				// this.$emit('setMode', 'default')
			} catch (e) {
				console.log('card/UPDATE_PAYMENT_METHOD edit error: ', e)
  			this.$emit('setDrawerStatus', { state: 'FAILURE', message: e.message.message ? e.message.message : e.message})

			} finally {
				this.updating = false
			}
		},

		handleStripeElementChange(payload) {
			console.log('handleStripeElementChangePayloads: ', payload)
			this.completeStripeCardInfo = payload.complete
			if (payload.error) {
				console.log({ error: payload.error })
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
			console.log({ stripePaymentOptions })

			const activePaymentTypeEl =
				stripePaymentOptions.$refs[
					'active-payment-type-' + this.activePaymentType
				]
			console.log({ activePaymentTypeEl })

			this.creatingPaymentMethodPending = true
			activePaymentTypeEl.createPaymentMethod()
		},

		handlePlaceOrderResponseFromRedirect({
			fullResponse,
			paymentData,
			paymentType,
		}) {
			console.log('handlePlaceOrderResponseFromRedirect', {
				fullResponse,
				paymentData,
				paymentType,
			})
		},

		handleCreatePaymentMethodResponse({
			fullResponse,
			paymentData,
			paymentType,
		}) {
			console.log('handleCreatePaymentMethodResponse', {
				fullResponse,
				paymentData,
				paymentType,
			})
			this.addPaymentMethod(fullResponse)
		},

		handleEnableStripePaymentRequest(val) {
			console.log('enableStripePaymentRequest top level', val)
			this.stripePaymentRequestEnabled = true
		},

		handleProcessingRedirectPaymentVerification(val) {
			this.processingRedirectPaymentVerification = val
		},

		showRemoveCardPrompt() {
			this.$emit('setMode', 'remove')
		},
	},
}
</script>

<template>
	<!-- <drawer-wrap v-if="activeEditCard" :show="show" @close="$emit('close')"> -->
		<div
			v-if="activeEditCard"
			class="c-drawer c-drawerEditCard"
			:class="{ 'c-drawer--paddingDefault': !editNextOrder }"
		>
			<div class="c-drawer__inner" style="padding:0;">
				<h2 class="c-drawer__title">{{
					atc['portal.editCardDrawerTitle'] || 'Edit Payment Method'
				}}</h2>
				<div style="padding: 0 20px;">
					<card-item no-edit :card="activeEditCard" />

          <edit-payment-methods-block
						:updating="updating"
						:submit-button-text="
							atc['buttons.updateCard'] || 'Save Updated Payment Method'
						"
						edit-payment-method-mode
						@cancel="$emit('setMode', 'default')"
            @remove="showRemoveCardPrompt"
						@finalPaymentPayloadResponse="handleFinalPaymentPayloadResponse"
					/>

					<!-- <div class="c-defaultModal__main">
            <div v-if="removeableCard" class="mt-15 has-text-right">
              <a
                class="button is-danger c-removeCardButton "
                @click.prevent="$emit('setMode', 'remove')"
                >Remove Card</a
              >
            </div>
          </div> -->

					<!-- <v-button
						class="c-cardCancelButton"
						style="margin-top:30px;"
						type="link"
						@onClick="showRemoveCardPrompt"
						>{{
							atc['buttons.removeCard'] || 'Remove Payment Method'
						}}</v-button
					> -->
				</div>
			</div>
		</div>
	<!-- </drawer-wrap> -->
</template>

<style lang="scss">
@import '@design';

#card-element {
	margin-bottom: 0 !important;
}

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
