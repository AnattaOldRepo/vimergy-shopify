<template>
	<modal-mobile-wrap
		:show="show"
		:with-close-icon="false"
		:progress-bar-status="status"
		:progress-bar-message="statusText"
		:close-animation="closeAnimation"
		@close="closeModal"
	>
		<div v-if="product && !needUpdating">
			<transition :name="transitionComp" mode="out-in">
				<div v-if="!wantToLearnMore" :key="1">
					<div class="c-modalProduct c-modalMobile__wrapper">
						<img
							:src="
								product.image_url
									.replace('.png', '_320x.png')
									.replace('.jpg', '_320x.jpg')
							"
							alt=""
							class="c-modalProduct__image"
						/>

						<div class="c-modalProduct__info">
							<h2 class="c-modalProduct__title">{{ product.title }}</h2>
							<!-- eslint-disable -->
							<p
								v-if="product.description"
								class="c-modalProduct__description"
								v-html="product.description"
							></p>

							<v-button
								v-if="product.full_description"
								class="c-modalProduct__learnMoreButton c-button--transparent"
								@onClick="handleLearnMore"
								>Learn more
							</v-button>
						</div>
					</div>

					<div class="c-modalProduct__buttonContain">
						<v-button
							v-if="canRemoveProduct"
							:disabled="status === 'updating'"
							:class="{ 'control-is-updating': updating }"
							class="c-modalProduct__removeButton c-button--transparent"
							html='<svg width="14"  height="16" view-box="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 2.5H10.9062L9.84375 0.75C9.59375 0.34375 9.03125 0 8.5625 0H5.40625C4.9375 0 4.375 0.34375 4.125 0.75L3.0625 2.5H0.5C0.21875 2.5 0 2.75 0 3V3.5C0 3.78125 0.21875 4 0.5 4H1L1.65625 14.5938C1.6875 15.375 2.375 16 3.15625 16H10.8125C11.5938 16 12.2812 15.375 12.3125 14.5938L13 4H13.5C13.75 4 14 3.78125 14 3.5V3C14 2.75 13.75 2.5 13.5 2.5ZM5.40625 1.5H8.5625L9.15625 2.5H4.8125L5.40625 1.5ZM10.8125 14.5H3.15625L2.5 4H11.4688L10.8125 14.5Z" fill="#FF7777"/></svg>'
							@onClick="handleRemove(product)"
						/>

						<v-button
							class="c-modalProduct__swapButton c-button--transparent"
							:disabled="status === 'updating'"
							@onClick="
								$emit('swapSubscription', { title: 'swap', product: product })
							"
						>
							Swap
						</v-button>

						<div class="c-modalProduct__quantityControl">
							<!-- <v-button
                v-if="product.quantity > 1"
                class="c-modalProduct__quantityBox"
                aria-label="minus icon"
                :disabled="status === 'updating'"
                @onClick="quantityChange('decrease')"
                >
                <minus-icon />
              </v-button> -->

							<quantity-changer-manual-entry
								v-if="product.quantity"
								:class="{ 'control-is-updating': updating }"
								:disabled="status === 'updating'"
								class="c-modalProductBlock__quantity c-quantityChangerManual--mobile"
								:quantity="product.quantity"
								@updateQuantity="quantityChangeManual"
							/>

							<!-- <v-button
                v-else
                class="c-modalProduct__quantityBox"
                aria-label="trash icon"
                :disabled="status === 'updating'"
                @onClick="quantityChange('decrease')"
                >
                <trash-icon/>
              </v-button>

              <span class="c-modalProduct__quantityBox c-modalProduct__quantity" >{{ product.quantity }}</span>

              <v-button
                class="c-modalProduct__quantityBox"
                aria-label="plus icon"
                :disabled="status === 'updating'"
                @onClick="quantityChange('increase')"
                >
                <plus-icon />
              </v-button> -->
						</div>
					</div>
				</div>

				<div v-else class="c-modalProduct__fullDescriptionContainer" :key="2">
					<div class="c-modalProduct__fullDescription--top">
						<h2 class="c-modalProduct__fullDescriptionTitle">{{
							product.title
						}}</h2>
						<span
							class="c-modalProduct__fullDescriptionBackArrow"
							@click="handleLearnMore"
						>
							<IconChevronRight
								class="c-modalProduct__fullDescriptionBackArrowIcon"
							/>
						</span>
					</div>

					<div
						class="c-modalProduct__fullDescription--bottom"
						v-html="product.full_description"
					>
					</div>
				</div>
			</transition>
		</div>

		<div v-else-if="needUpdating" class="c-modalProduct__shippingRequire">
			<modal-shipping-require @updateStatus="updateStatus" />
		</div>
	</modal-mobile-wrap>
</template>

<script>
import ModalMobileWrap from '@components/modal-wrap-mobile.vue'
import VButton from '@components/v-button'
import { mapActions, mapState, mapGetters, mapMutations } from 'vuex'
// import MinusIcon from '@components/Icon/minus-icon'
// import PlusIcon from '@components/Icon/plus-icon'
// import TrashIcon from '@components/Icon/trash-icon'
import productChangeRequest from '@utils/product-change-request.js'
import { buildNewCheckoutUpdatePayload } from '@utils/newCheckoutUpdateHelpers'
import ModalShippingRequire from '@components/modal-shipping-require.vue'
import IconChevronRight from '@components/Icon/icon-chevron-right.vue'
import QuantityChangerManualEntry from '@components/quantity-changer-manual-entry.vue'

export default {
	components: {
		ModalMobileWrap,
		// MinusIcon,
		// PlusIcon,
		// TrashIcon,
		ModalShippingRequire,
		VButton,
		IconChevronRight,
		QuantityChangerManualEntry,
	},

	props: {
		show: {
			type: Boolean,
			default: false,
		},
		closeModal: {
			type: Function,
			default: () => 1,
		},
		closeAnimation: {
			type: Boolean,
			default: false,
		},
	},

	data() {
		return {
			status: '',
			statusText: '',
			needUpdating: false,
			updating: false,
			wantToLearnMore: false,
			transitionComp: 'modal-slideOutIn',
		}
	},

	computed: {
		...mapState('editMode', ['editNextOrder']),

		...mapState('translations', ['atc']),

		...mapGetters('activeSubscription', [
			'activeSubscription',
			'activeSubscriptionNextOrder',
			'activeQueue',
		]),

		...mapGetters('products', ['product']),

		canRemoveProduct() {
			const { editNextOrder, activeSubscription, activeQueue } = this

			if (editNextOrder) {
				return activeQueue && activeQueue.items.length > 1
			} else {
				return activeSubscription && activeSubscription.items.length > 1
			}
		},
	},

	methods: {
		...mapMutations('subscriptions', ['setSavedProductUpdatePayload']),

		...mapMutations('shippingMethods', ['SET_SHIPPING_METHODS']),

		...mapMutations('newCheckoutUpdates', ['setSavedNewCheckoutUpdate']),

		...mapActions('subscriptions', [
			'UPDATE_SUBSCRIPTION',
			'UPDATE_NEXT_ORDER',
		]),

		...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),

		quantityChangeManual(quantity) {
			const { product } = this

			this.handleQuantityChangeManual({
				quantity: quantity,
				id: product.id,
				product,
			})
		},

		async handleQuantityChangeManual({ quantity, id, product }) {
			if (this.updating) return

			if (parseInt(quantity) === 0) return this.handleRemove(product)

			const { editNextOrder, atc } = this

			const finalPayload = {
				requestPayload: {
					items: [{ quantity, id }],
				},
			}

			this.updatingId = id
			this.quantityUpdating = true

			let handleNewCheckoutUpdatePayload, analyticsEventName
			let analyticsPayload = {
				quantity,
				...product,
			}

			if (editNextOrder) {
				// updateMessage = `Quantity updated to ${quantity} on next order.`
				analyticsEventName = 'Upscribe Next Order Product Quantity Change'

				handleNewCheckoutUpdatePayload = [
					buildNewCheckoutUpdatePayload(
						this.UPDATE_NEXT_ORDER(finalPayload),
						finalPayload,
						'subscriptions',
						'UPDATE_NEXT_ORDER',
						atc['notices.quantityUpdatedToXOnNextOrder']
							? atc['notices.quantityUpdatedToXOnNextOrder'].replace(
									'<quantity>',
									quantity
							  )
							: `Quantity updated to ${quantity} on next order.`
					),
				]
			} else {
				// updateMessage = `Quantity updated to ${quantity}.`
				analyticsEventName = 'Upscribe Subscription Product Quantity Change'

				handleNewCheckoutUpdatePayload = [
					buildNewCheckoutUpdatePayload(
						this.UPDATE_SUBSCRIPTION(finalPayload),
						finalPayload,
						'subscriptions',
						'UPDATE_SUBSCRIPTION',
						atc['notices.quantityUpdatedToXOnSubscription']
							? atc['notices.quantityUpdatedToXOnSubscription'].replace(
									'<quantity>',
									quantity
							  )
							: `Quantity updated to ${quantity} on subscription.`
					),
				]
			}
			// hande everything in handleNewCheckoutUpdate function
			await this.handleNewCheckoutUpdate(handleNewCheckoutUpdatePayload)

			this.triggerAnalyticsEvent({
				event: analyticsEventName,
				payload: analyticsPayload,
			})
		},

		handleLearnMore() {
			this.wantToLearnMore = !this.wantToLearnMore
			if (this.wantToLearnMore) {
				this.transitionComp = 'modal-slideOutIn'
			} else {
				this.transitionComp = 'modal-slideInOut'
			}
		},

		updateStatus(payload) {
			const { status, statusText, needUpdating } = payload
			this.status = status
			this.statusText = statusText
			if (needUpdating === 'stop') {
				this.needUpdating = false
			}
		},

		handleNewCheckoutUpdate(updateArray) {
			const { atc } = this
			this.status = 'updating'
			this.statusText = atc['notices.updateSavingNotice'] || 'Saving'
			return new Promise((resolve, reject) => {
				let updateCount = updateArray.length
				let updatesFinished = 0

				// for each update
				updateArray.forEach(async (update) => {
					this.updating = true
					try {
						await update.updateAction
						this.status = 'success'
						this.statusText =
							atc['notices.updateSavedSuccessfullyNotice'] ||
							'Saved Successfully'
					} catch (e) {
						this.handleNewCheckoutUpdateError(e, update)
					} finally {
						updatesFinished += 1
						this.updating = false
					}

					if (updatesFinished === updateCount) {
						resolve(true)
					}
				})
			})
		},

		handleNewCheckoutUpdateError(e, handleNewCheckoutUpdatePayload) {
			if (e && e.data && e.data.shipping_update_required) {
				this.SET_SHIPPING_METHODS(e.data.rates)
				this.setSavedNewCheckoutUpdate(handleNewCheckoutUpdatePayload)
				this.needUpdating = true
			} else {
				console.error('subscription/UPDATE_SUBSCRIPTION error: ', e)
			}
			this.status = 'rejected'
			this.statusText = e.message
		},

		quantityChange(type) {
			const { product } = this
			const quantity = product.quantity

			if (type === 'decrease') {
				if (quantity === 1) return this.handleRemove(product)

				this.handleQuantityChange({
					type: 'decrease',
					quantity: quantity - 1,
					id: product.id,
					variant_id: product.variant_id,
					product,
				})
			} else if (type === 'increase') {
				this.handleQuantityChange({
					type: 'increase',
					quantity: quantity + 1,
					id: product.id,
					variant_id: product.variant_id,
					product,
				})
			}
		},

		async handleQuantityChange({ type, id, quantity, variant_id, product }) {
			if (this.updating) return

			const { editNextOrder, activeSubscription, atc } = this

			const {
				increasePayload: nextIncreaseItemPayload,
				decreasePayload: nextDecreaseItemPayload,
			} = productChangeRequest({
				variantId: variant_id,
				editNextOrder: true,
				subscription: activeSubscription,
			})

			const {
				increasePayload: subscriptionIncreaseItemPayload,
				decreasePayload: subscriptionDecreaseItemPayload,
			} = productChangeRequest({
				variantId: variant_id,
				editNextOrder: false,
				subscription: activeSubscription,
			})

			// determine increase or decrease payload by the type param
			// coming from the quantity change event
			const subscriptionItemPayload =
				type === 'increase'
					? subscriptionIncreaseItemPayload
					: subscriptionDecreaseItemPayload
			const nextItemPayload =
				type === 'increase' ? nextIncreaseItemPayload : nextDecreaseItemPayload

			const updateSubscriptionPayload = {
				requestPayload: {
					items: subscriptionItemPayload
						? [subscriptionItemPayload]
						: undefined,
				},
			}

			const nextOrderUpdatePayload = {
				requestPayload: {
					items: nextItemPayload ? [nextItemPayload] : undefined,
				},
			}

			let analyticsEventName, handleNewCheckoutUpdatePayload
			let analyticsPayload = {
				quantity,
				...product,
			}

			if (analyticsPayload.product) {
				analyticsPayload.product.quantity = quantity
			}

			if (editNextOrder) {
				analyticsEventName = 'Upscribe Next Order Product Quantity Change'

				handleNewCheckoutUpdatePayload = [
					buildNewCheckoutUpdatePayload(
						this.UPDATE_NEXT_ORDER(nextOrderUpdatePayload),
						nextOrderUpdatePayload,
						'subscriptions',
						'UPDATE_NEXT_ORDER',
						atc['notices.quantityUpdatedToXOnNextOrder']
							? atc['notices.quantityUpdatedToXOnNextOrder'].replace(
									'<quantity>',
									quantity
							  )
							: `Quantity updated to ${quantity} on next order.`
					),
				]
			} else {
				analyticsEventName = 'Upscribe Subscription Product Quantity Change'

				handleNewCheckoutUpdatePayload = [
					buildNewCheckoutUpdatePayload(
						this.UPDATE_SUBSCRIPTION(updateSubscriptionPayload),
						updateSubscriptionPayload,
						'subscriptions',
						'UPDATE_SUBSCRIPTION',
						atc['notices.quantityUpdatedToXOnSubscription']
							? atc['notices.quantityUpdatedToXOnSubscription'].replace(
									'<quantity>',
									quantity
							  )
							: `Quantity updated to ${quantity} on subscription.`
					),
				]
			}

			// hande everything in handleNewCheckoutUpdate function
			await this.handleNewCheckoutUpdate(handleNewCheckoutUpdatePayload)
			this.triggerAnalyticsEvent({
				event: analyticsEventName,
				payload: analyticsPayload,
			})
		},

		async handleRemove(product) {
			if (this.updating) return
			const {
				activeSubscription,
				activeQueue,
				// products,
				editNextOrder,
				atc,
			} = this

			const itemCount = editNextOrder
				? activeQueue.items.length
				: activeSubscription.items.length

			if (itemCount <= 1) {
				this.$router.push({
					name: 'cancel',
				})
			}

			const { removePayload: nextRemoveItemPayload } = productChangeRequest({
				variantId: product.variant_id,
				editNextOrder: true,
				subscription: activeSubscription,
			})

			const {
				removePayload: subscriptionRemoveItemPayload,
			} = productChangeRequest({
				variantId: product.variant_id,
				editNextOrder: false,
				subscription: activeSubscription,
			})

			const updateSubscriptionPayload = {
				requestPayload: {
					items: subscriptionRemoveItemPayload
						? [subscriptionRemoveItemPayload]
						: undefined,
				},
			}

			const nextOrderUpdatePayload = {
				requestPayload: {
					items: nextRemoveItemPayload ? [nextRemoveItemPayload] : undefined,
				},
			}

			let analyticsEventName, handleNewCheckoutUpdatePayload

			let itemsToCheck = editNextOrder
				? activeSubscription.next.items
				: activeSubscription.items

			let editItem = [...itemsToCheck].filter((item) => {
				return item.id === product.id
			})[0]

			let analyticsPayload = {
				product: { ...editItem },
			}

			if (editNextOrder) {
				analyticsEventName = 'Upscribe Next Order Product Remove'

				handleNewCheckoutUpdatePayload = [
					buildNewCheckoutUpdatePayload(
						this.UPDATE_NEXT_ORDER(nextOrderUpdatePayload),
						nextOrderUpdatePayload,
						'subscriptions',
						'UPDATE_NEXT_ORDER',
						atc['notices.productRemovedFromNextOrder'] ||
							`Product removed from next order.`
					),
				]
			} else {
				analyticsEventName = 'Upscribe Subscription Product Remove'

				handleNewCheckoutUpdatePayload = [
					buildNewCheckoutUpdatePayload(
						this.UPDATE_SUBSCRIPTION(updateSubscriptionPayload),
						updateSubscriptionPayload,
						'subscriptions',
						'UPDATE_SUBSCRIPTION',
						atc['notices.productRemovedFromSubscription'] ||
							`Product removed from subscription`
					),
				]
			}

			// hande everything in handleNewCheckoutUpdate function
			try {
				await this.handleNewCheckoutUpdate(handleNewCheckoutUpdatePayload)
				this.closeModal()
			} catch (e) {
				console.error(e)
			}

			this.triggerAnalyticsEvent({
				event: analyticsEventName,
				payload: analyticsPayload,
			})
		},
	},
}
</script>

<style lang="scss">
@import '@design/_colors';
.c-modalProduct__fullDescription--top {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0 16px 17px;
	border-bottom: 1px solid $color-blue-light-border;
}

.c-modalProduct__fullDescription--bottom {
	padding: 17px 16px;
}

.c-modalProduct {
	display: flex;
	margin-bottom: 10px;
}

.c-modalProduct__image {
	width: 50%;
	min-width: 105px;
	height: 105px;
	margin-right: 12px;
	object-fit: contain;

	@media (min-width: 425px) {
		min-width: 125px;
		height: 125px;
	}
}

.c-modalProduct__info {
	width: 100%;
	padding-top: 10px;
}

.c-modalProduct__title,
.c-modalProduct__description {
	font-style: normal;
	text-transform: capitalize;
}

.c-modalProduct__title {
	font-size: 16px;
	font-weight: 500;
	line-height: 21px;
}

.c-modalProduct__description {
	margin-bottom: 0;
	font-size: 14px;
	line-height: 18px;
	color: $color-blue-secondary;
	p {
		margin-bottom: 0;
	}
}

.c-modalProduct__quantityControl {
	// box-shadow: 0px 2px 1px 2px rgba(1, 1, 1, 0.1);
	display: inline-flex;
	// height: 48px;
	width: auto;
	// border-radius: 4px;
}

.c-modalProduct__quantityBox {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 48px;
	min-width: 0;
	height: 100%;
	background-color: $color-white;
	border: 0;

	&:hover,
	&:focus {
		background-color: $color-white;
	}
}

.c-modalProduct__quantity {
	font-weight: bold;
}

.c-modalProduct__swapButton {
	display: inline-block;
	width: 158px;
	text-align: center;
}

.c-modalProduct__removeButton {
	display: inline-block;
	width: 60px;
	min-width: 60px;
	margin-right: 25px;
	font-size: 12px;
	font-weight: bold;
	line-height: 16px;
	color: $color-black;
	text-align: center;
	text-align: center;
	text-transform: uppercase;
	letter-spacing: 0.8px;
	background-color: $color-white;
	border: none;
	border-radius: 4px;
	box-shadow: 0 2px 1px 2px rgba(1, 1, 1, 0.1);
}

.c-modalProduct__buttonContain {
	display: flex;
	justify-content: center;
	padding: 0 10px;
}

.c-modalProduct__swapButton {
	margin-right: 25px;
	font-size: 12px;
	font-weight: bold;
	line-height: 16px;
	color: $color-black;
	text-align: center;
	text-transform: uppercase;
	letter-spacing: 0.8px;
	background-color: $color-white;
	border: none;
	border-radius: 4px;
	box-shadow: 0 2px 1px 2px rgba(1, 1, 1, 0.1);
}

.c-modalProduct__shippingRequire {
	padding: 0 16px;
}

.c-modalProduct__learnMoreButton {
	width: auto;
	min-width: none;
	padding: 0;
	margin: 5px 0 5px;
	font-size: 13px;
	font-style: normal;
	font-weight: bold;
	line-height: 19px;
	color: $color-primary;
	text-transform: uppercase;
	letter-spacing: 0.5px;
	border: none;
}

.c-modalProduct__fullDescriptionTitle {
	max-width: 150px;
	font-size: 16px;
	font-weight: 500;
	line-height: 21px;
	color: #171725;
	text-align: center;
	text-transform: capitalize;
}

.c-modalProduct__fullDescriptionBackArrow {
	position: absolute;
	left: 16px;
}

.c-modalProduct__fullDescriptionBackArrowIcon {
	width: 16px;
	height: 16px;
	transform: rotateZ(180deg);
}

.modal-slideOutIn-enter-active {
	width: 100%;
	animation: moveIn 0.5s linear both;
}

.modal-slideOutIn-leave-active {
	width: 100%;
	animation: leaveOut 0.5s linear both;
}

@-webkit-keyframes moveIn {
	0% {
		-webkit-transform: translate3d(100%, 0, 0);
	}
	100% {
		-webkit-transform: translate3d(0, 0, 0);
	}
}

@keyframes moveIn {
	0% {
		transform: translate3d(100%, 0, 0);
	}
	100% {
		transform: translate3d(0, 0, 0);
	}
}

@-webkit-keyframes leaveOut {
	0% {
		-webkit-transform: translate3d(0, 0, 0);
	}
	100% {
		-webkit-transform: translate3d(-100%, 0, 0);
	}
}

@keyframes leaveOut {
	0% {
		transform: translate3d(0, 0, 0);
	}
	100% {
		transform: translate3d(-100%, 0, 0);
	}
}

.modal-slideInOut-enter-active {
	animation: acrossIn 0.5s linear both;
}

.modal-slideInOut-leave-active {
	animation: acrossOut 0.5s linear both;
}

@-webkit-keyframes acrossIn {
	0% {
		-webkit-transform: translate3d(-100%, 0, 0);
	}
	100% {
		-webkit-transform: translate3d(0, 0, 0);
	}
}

@keyframes acrossIn {
	0% {
		transform: translate3d(-100%, 0, 0);
	}
	100% {
		transform: translate3d(0, 0, 0);
	}
}

@-webkit-keyframes acrossOut {
	0% {
		-webkit-transform: translate3d(0, 0, 0);
	}
	100% {
		-webkit-transform: translate3d(100%, 0, 0);
	}
}

@keyframes acrossOut {
	0% {
		transform: translate3d(0, 0, 0);
	}
	100% {
		transform: translate3d(100%, 0, 0);
	}
}
</style>
