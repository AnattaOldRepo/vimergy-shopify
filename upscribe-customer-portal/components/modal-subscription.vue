<template>
	<modal-mobile-wrap
		:show="show"
		:progress-bar-status="status"
		:progress-bar-message="statusText"
		:close-animation="closeAnimation"
		@close="closeModal"
	>
		<div v-if="!showVariantSelector">
			<div v-if="!needUpdating && !swapping" class="c-modalSubscription">
				<h2
					v-if="editNextOrderFallback || $route.query.editNextOrder"
					class="c-modalSubscription__title"
				>
					{{
						atc['portal.productsGridNextOrderTitle'] || 'Add to Your Next Order'
					}}
				</h2>

				<h2 v-else class="c-modalSubscription__title">
					{{
						atc['portal.productsGridSubscriptionTitle'] || 'Add to Subscription'
					}}
				</h2>

				<div class="c-modalSubscription__inner">
					<div v-if="products && products.length" class="c-collectionFilter">
						<ul
							v-if="!availableCollections || !availableCollections.length"
							class="c-collectionFilter__inner"
						>
							<li
								class="c-collectionFilter__headline c-collectionFilter__headline--active"
							>
								<span>{{ atc['portal.allProductsLabel'] || 'All' }}</span>
							</li>
						</ul>

						<ul v-else class="c-collectionFilter__inner">
							<li
								v-if="
									(uiSettings &&
										!uiSettings.disable_customer_portal_default_all_products_tab) ||
									!uiSettings
								"
								class="c-collectionFilter__headline"
								:class="{
									'c-collectionFilter__headline--active': isEmptyObject(
										activeCollection
									),
								}"
							>
								<span
									role="button"
									tabindex="0"
									@click="changeCurrentFilter(false)"
								>
									{{ atc['portal.allProductsLabel'] || 'All' }}
								</span>
							</li>
							<li
								v-for="collection in availableCollections"
								:key="collection.id"
								class="c-collectionFilter__headline"
								:class="{
									'c-collectionFilter__headline--active':
										activeCollection && activeCollection.id === collection.id,
								}"
							>
								<span
									role="button"
									tabindex="0"
									@click="changeCurrentFilter(collection)"
								>
									{{ collection.title }}
								</span>
							</li>
						</ul>
					</div>

					<div v-if="products && products.length">
						<div class="c-modalSubscription__gridContain">
							<div class="c-modalSubscription__grid">
								<product-grid-item
									v-for="(product, index) in products"
									:key="product.id + '-' + index"
									class="c-productsGrid__item"
									:product="product"
									:status="status"
									:is-swap="isSwap"
									@handleAddProductVariantToSubscription="
										handleAddProductVariantToSubscription
									"
									@handleQuantityChange="handleQuantityChange"
									@handleOpenSwapModal="handleOpenSwapModal"
									@handleRemove="handleRemove"
								/>
							</div>

							<vue-pagination
								key="vue-pagination"
								ref="vue-pagination"
								:collection-id="activeCollection ? activeCollection.id : false"
							/>
						</div>
					</div>

					<div
						v-else
						class="c-modalSubscription__grid c-modalSubscription__gridContain"
					>
						<content-placeholders
							v-for="(item, index) in [1, 2, 3, 4, 5, 6]"
							:key="index"
							:centered="true"
							class="c-productGridItem c-productsGrid__item"
							style="display: block"
						>
							<div
								class="c-productGridItem__imageWrap"
								style="margin-bottom: 10px"
							>
								<content-placeholders-img
									class="c-productGridItem__image"
									style="width: 140px; height: 140px"
								/>
							</div>
							<content-placeholders-text
								style="height: 20px; min-height: auto"
								:lines="1"
								class="c-productGridItem__title"
							/>

							<content-placeholders-img
								style="height: 30px"
								class="c-productGridItem__button"
							/>
						</content-placeholders>
					</div>
				</div>
			</div>

			<div v-else-if="swapping" class="c-modalMobile__wrapper">
				<modal-swap
					@handleSwapProductVariant="handleSwapProductVariant"
					@handleCloseSwapModal="handleCloseSwapModal"
				/>
			</div>

			<div v-else class="c-modalMobile__wrapper">
				<modal-shipping-require @updateStatus="updateStatus" />
			</div>
		</div>
		<div v-if="showVariantSelector">
			<a
				@click="
					setVariantSelectProduct(null)
					showVariantSelector = false
				"
				><icon-chevron-right
					class="c-headerMobile__navLink--mobileIcon c-modalSubscription__backButton"
			/></a>

			<variant-select-block
				v-if="variantSelectProduct"
				:product="variantSelectProduct"
				:button-text="
					editNextOrder
						? atc['buttons.addProductToNextOrder'] || 'Add to Next Shipment'
						: atc['buttons.addProductToSubscription'] || 'Add to Subscription'
				"
				:secondary-button-text="
					!editNextOrder
						? atc['buttons.addProductToNextOrder'] || 'Add to Next Shipment'
						: atc['buttons.addProductToSubscription'] || 'Add to Subscription'
				"
				@addProductVariantToSubscription="handleAddProductVariantToSubscription"
			/>

			<!-- <variant-select-block
        v-if="variantSelectProduct"
        :product="variantSelectProduct"
        :button-text="
          editNextOrderFallback
            ? atc['portal.addProductToNextOrder'] || 'Add to Next Shipment'
            : atc['portal.addProductToSubscription'] || 'Add to Subscription'
        "
        @addProductVariantToSubscription="handleAddProductVariantToSubscription"
      /> -->
		</div>
	</modal-mobile-wrap>
</template>

<script>
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'
import { windowSizes } from '@mixins/windowSizes'

import VuePagination from '@components/vue-pagination'
import ModalMobileWrap from '@components/modal-wrap-mobile.vue'
import ProductGridItem from '@components/product-grid-item.vue'
import ModalShippingRequire from '@components/modal-shipping-require.vue'
import ModalSwap from '@components/modal-swap.vue'
import productChangeRequest from '@utils/product-change-request.js'
import { buildNewCheckoutUpdatePayload } from '@utils/newCheckoutUpdateHelpers'
import VariantSelectBlock from '@components/variant-select-block.vue'
import IconChevronRight from '@components/Icon/icon-chevron-right.vue'

export default {
	components: {
		VuePagination,
		ModalMobileWrap,
		ProductGridItem,
		ModalShippingRequire,
		ModalSwap,
		VariantSelectBlock,
		IconChevronRight,
	},

	mixins: [windowSizes],

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
		isSwap: {
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
			swapping: false,
			showVariantSelector: false,
		}
	},

	computed: {
		...mapState('translations', ['atc']),

		...mapState('products', ['products']),

		...mapState('editMode', ['editNextOrder']),

		...mapState('variantSelectProduct', ['variantSelectProduct']),

		...mapState('swapProduct', ['swapProduct']),

		...mapState('collections', ['collections', 'activeCollection']),

		...mapGetters('activeSubscription', [
			'activeSubscription',
			'activeSubscriptionNextOrder',
			'activeQueue',
		]),

		...mapState('shop', [
			'customerPortalSubscriptionProductCollections',
			'customerPortalNextOrderProductCollections',
			'featuredPortalCollection',
			'uiSettings',
		]),

		editNextOrderFallback() {
			const { editNextOrder, $route } = this

			if (
				$route.query &&
				$route.query.template &&
				$route.query.template === 'next-shipment'
			)
				return true

			return editNextOrder
		},

		availableCollections() {
			const {
				collections,
				editNextOrder,
				customerPortalSubscriptionProductCollections,
				customerPortalNextOrderProductCollections,
				featuredPortalCollection,
			} = this

			let availableCollections

			// use old method until they empty this out
			if (featuredPortalCollection && featuredPortalCollection.length) {
				availableCollections = collections.filter((collection) => {
					return featuredPortalCollection.includes(collection.handle)
				})
			}

			// new setup
			else {
				if (editNextOrder && !customerPortalNextOrderProductCollections)
					return 'all'
				if (!editNextOrder && !customerPortalSubscriptionProductCollections)
					return 'all'

				if (editNextOrder) {
					availableCollections = collections.filter((collection) => {
						return customerPortalNextOrderProductCollections.includes(
							collection.handle
						)
					})
				} else {
					availableCollections = collections.filter((collection) => {
						return customerPortalSubscriptionProductCollections.includes(
							collection.handle
						)
					})
				}
			}

			if (!availableCollections) return 'all'

			return availableCollections
		},

		currentCollection() {
			return this.activeCollection
		},
	},

	mounted() {
		const { windowWidth, $route } = this
		document.getElementsByTagName('body')[0].style.overflow = 'hidden'

		// only if in mobile view, since it's completely different state handling..
		if (windowWidth < 768) {
			if (
				($route.query &&
					$route.query.template &&
					$route.query.template === 'next-shipment') ||
				$route.query.editNextOrder
			) {
				this.setEditNextOrder(true)
			} else {
				this.setEditNextOrder(false)
			}
		}
	},

	destroyed() {
		document.getElementsByTagName('body')[0].style.overflow = ''
	},

	methods: {
		...mapMutations('subscriptions', ['setSavedProductUpdatePayload']),

		...mapActions('editMode', ['setEditNextOrder']),

		...mapMutations('shippingMethods', [
			'SET_SHIPPING_METHODS',
			'setActiveEditShippingMethod',
			'setNewSwapShippingMethod',
		]),

		...mapMutations('variantSelectProduct', ['setVariantSelectProduct']),

		...mapMutations('newCheckoutUpdates', ['setSavedNewCheckoutUpdate']),

		...mapActions('subscriptions', [
			'UPDATE_SUBSCRIPTION',
			'UPDATE_NEXT_ORDER',
		]),

		...mapActions('shippingMethods', ['GET_SUBSCRIPTION_SHIPPING_METHODS']),

		...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),

		...mapMutations('collections', ['setActiveCollection']),

		changeCurrentFilter(collection) {
			const { activeCollection } = this

			if (!collection) {
				// reset to all
				this.setActiveCollection(false)
				this.loadProductsByCollectionId(false)
			} else {
				// same filter ignore
				if (activeCollection && collection.id === activeCollection.id) return

				this.setActiveCollection(collection)
				this.loadProductsByCollectionId(collection)
			}
		},

		loadProductsByCollectionId(collection) {
			let requestParams = {}

			if (collection) {
				requestParams['collection_id'] = collection.id
			}

			this.$nextTick(() => {
				const paginationRef = this.$refs['vue-pagination']

				// load page 1
				if (paginationRef) {
					paginationRef.onLoadMoreItems(1)
				}
			})
		},

		updateStatus(payload) {
			const { status, statusText, needUpdating } = payload
			this.status = status
			this.statusText = statusText
			if (needUpdating === 'stop') {
				this.needUpdating = false
			}
		},

		handleOpenSwapModal(product) {
			this.setVariantSelectProduct(product)
			this.swapping = true
		},

		handleCloseSwapModal() {
			this.swapping = false
		},

		handleNewCheckoutUpdate(updateArray) {
			const { atc } = TouchList
			return new Promise((resolve, reject) => {
				let updateCount = updateArray.length
				let updatesFinished = 0
				this.status = 'updating'
				this.statusText = atc['notices.updateSavingNotice'] || 'Saving'
				// for each update
				updateArray.forEach(async (update) => {
					this.updating = true
					try {
						await update.updateAction
						this.status = 'success'
						this.statusText =
							atc['notices.updateSavedSuccessfullyNotice'] ||
							'Saved Succesfully'

						if (this.swapping) {
							setTimeout(() => {
								this.closeModal()
							}, 2000)
						}

						if (this.needUpdating) {
							this.needUpdating = false
						}
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

		async handleQuantityChange({ type, id, quantity, variant_id, product }) {
			const {
				// editNextOrder,
				atc,
				editNextOrderFallback,
				activeSubscription,
			} = this

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

			let handleNewCheckoutUpdatePayload, analyticsEventName
			let analyticsPayload = {
				quantity,
				...product,
			}

			if (editNextOrderFallback) {
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
				// updateMessage = `Quantity updated to ${quantity}.`
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
			const {
				activeSubscription,
				activeQueue,
				editNextOrderFallback,
				atc,
			} = this

			const itemCount = editNextOrderFallback
				? activeQueue.items.length
				: activeSubscription.items.length

			if (itemCount <= 1) {
				this.$router.push({
					name: 'cancel',
				})
			}
			// When data is coming from product item grid we do not have selected variant id
			let selectedVariant

			if (!product.variant_id) {
				if (this.$route.query.template === 'next-shipment') {
					selectedVariant = activeSubscription.next.items.find(
						(item) => item.product_id === product.id
					)
				} else {
					selectedVariant = activeSubscription.items.find(
						(item) => item.product_id === product.id
					)
				}
			}

			const { removePayload: nextRemoveItemPayload } = productChangeRequest({
				variantId:
					product.variant_id || (selectedVariant && selectedVariant.variant_id),
				editNextOrder: true,
				subscription: activeSubscription,
			})

			const {
				removePayload: subscriptionRemoveItemPayload,
			} = productChangeRequest({
				variantId:
					product.variant_id || (selectedVariant && selectedVariant.variant_id),
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

			let itemsToCheck = editNextOrderFallback
				? activeSubscription.next.items
				: activeSubscription.items

			let editItem = [...itemsToCheck].filter((item) => {
				return item.id === product.id
			})[0]

			let handleNewCheckoutUpdatePayload, analyticsEventName
			let analyticsPayload = {
				product: { ...editItem },
			}

			if (editNextOrderFallback) {
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
			await this.handleNewCheckoutUpdate(handleNewCheckoutUpdatePayload)

			this.triggerAnalyticsEvent({
				event: analyticsEventName,
				payload: analyticsPayload,
			})
		},

		async handleAddProductVariantToSubscription({
			variantId,
			product,
			addToNextOrder,
			showVariantSelector,
		}) {
			try {
				this.setVariantSelectProduct(product)

				if (showVariantSelector) {
					this.showVariantSelector = true
					return
				}

				const {
					// editNextOrder,
					atc,
					editNextOrderFallback,
					activeSubscription,
				} = this

				const { addPayload: nextAddItemPayload } = productChangeRequest({
					variantId,
					editNextOrder: true,
					subscription: activeSubscription,
				})

				const { addPayload: subscriptionAddItemPayload } = productChangeRequest(
					{
						variantId,
						editNextOrder: false,
						subscription: activeSubscription,
					}
				)

				const updateSubscriptionPayload = {
					requestPayload: {
						items: subscriptionAddItemPayload
							? [subscriptionAddItemPayload]
							: undefined,
					},
				}

				const nextOrderUpdatePayload = {
					requestPayload: {
						items: nextAddItemPayload ? [nextAddItemPayload] : undefined,
					},
				}

				let analyticsEventName, handleNewCheckoutUpdatePayload
				let analyticsPayload = { product }

				if (editNextOrderFallback) {
					analyticsEventName = 'Upscribe Next Order Product Add'

					handleNewCheckoutUpdatePayload = [
						buildNewCheckoutUpdatePayload(
							this.UPDATE_NEXT_ORDER(nextOrderUpdatePayload),
							nextOrderUpdatePayload,
							'subscriptions',
							'UPDATE_NEXT_ORDER',
							`Product add to next order.`,
							atc['notices.productAddedToNextOrder'] ||
								`Product added to next order.`
						),
					]
				} else {
					analyticsEventName = 'Upscribe Subscription Product Add'

					handleNewCheckoutUpdatePayload = [
						buildNewCheckoutUpdatePayload(
							this.UPDATE_SUBSCRIPTION(updateSubscriptionPayload),
							updateSubscriptionPayload,
							'subscriptions',
							'UPDATE_SUBSCRIPTION',
							`Product added to subscription.`,
							atc['notices.productAddedToSubscription'] ||
								`Product added to subscription`
						),
					]
				}
				// hande everything in handleNewCheckoutUpdate function
				await this.handleNewCheckoutUpdate(handleNewCheckoutUpdatePayload)

				this.triggerAnalyticsEvent({
					event: analyticsEventName,
					payload: analyticsPayload,
				})

				this.closeModal()
			} catch (e) {
				console.error('Error', e)
			}
		},

		async handleSwapProductVariant(variantId, newProduct) {
			const {
				// editNextOrder,
				editNextOrderFallback,
				activeSubscription,
				atc,
			} = this

			const productToReplace = this.swapProduct

			const { addPayload: nextAddSwapItemPayload } = productChangeRequest({
				variantId,
				editNextOrder: true,
				subscription: activeSubscription,
			})

			const {
				removePayload: nextRemoveSwappedItemPayload,
			} = productChangeRequest({
				variantId: productToReplace.variant_id,
				editNextOrder: true,
				subscription: activeSubscription,
			})

			const {
				addPayload: subscriptionAddSwapItemPayload,
			} = productChangeRequest({
				variantId,
				editNextOrder: false,
				subscription: activeSubscription,
			})

			const {
				removePayload: subscriptionRemoveSwappedItemPayload,
			} = productChangeRequest({
				variantId: productToReplace.variant_id,
				editNextOrder: false,
				subscription: activeSubscription,
			})

			// create next swap payload depending on the diff product upday payload options
			let nextItemPayload = []
			if (!nextAddSwapItemPayload && !nextRemoveSwappedItemPayload) {
				nextItemPayload = false
			} else {
				if (nextAddSwapItemPayload) {
					nextItemPayload = [...nextItemPayload, nextAddSwapItemPayload]
				}
				if (nextRemoveSwappedItemPayload) {
					nextItemPayload = [...nextItemPayload, nextRemoveSwappedItemPayload]
				}
			}

			// create sub swap payload depending on the diff product upday payload options
			let subscriptionItemPayload = []
			if (
				!subscriptionAddSwapItemPayload &&
				!subscriptionRemoveSwappedItemPayload
			) {
				subscriptionItemPayload = false
			} else {
				if (subscriptionAddSwapItemPayload) {
					subscriptionItemPayload = [
						...subscriptionItemPayload,
						subscriptionAddSwapItemPayload,
					]
				}
				if (subscriptionRemoveSwappedItemPayload) {
					subscriptionItemPayload = [
						...subscriptionItemPayload,
						subscriptionRemoveSwappedItemPayload,
					]
				}
			}

			const updateSubscriptionPayload = {
				requestPayload: {
					items: subscriptionItemPayload || undefined,
				},
			}

			const nextOrderUpdatePayload = {
				requestPayload: {
					items: nextItemPayload || undefined,
				},
			}

			let analyticsEventName, handleNewCheckoutUpdatePayload
			let analyticsPayload = {
				newProduct: newProduct,
				oldProduct: productToReplace,
			}

			if (editNextOrderFallback) {
				analyticsEventName = 'Upscribe Next Order Product Swap'

				// updateMessage = `Quantity updated to ${quantity} on next order.`
				handleNewCheckoutUpdatePayload = [
					buildNewCheckoutUpdatePayload(
						this.UPDATE_NEXT_ORDER(nextOrderUpdatePayload),
						nextOrderUpdatePayload,
						'subscriptions',
						'UPDATE_NEXT_ORDER',
						atc['notices.productSwappedOnNextOrder'] ||
							`Product swapped on next order`
					),
				]
			} else {
				analyticsEventName = 'Upscribe Subscription Product Swap'

				handleNewCheckoutUpdatePayload = [
					buildNewCheckoutUpdatePayload(
						this.UPDATE_SUBSCRIPTION(updateSubscriptionPayload),
						updateSubscriptionPayload,
						'subscriptions',
						'UPDATE_SUBSCRIPTION',
						atc['notices.productSwappedOnSubscription'] ||
							`Product swapped on subscription`
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
	},
}
</script>

<style lang="scss">
@import '@design';

.c-modalSubscription__title {
	padding-top: 5px;
	padding-bottom: 10px;
	font-size: 16px;
	font-weight: 500;
	line-height: 21px;
	text-align: center;
	text-transform: capitalize;
	border-bottom: 1px solid $color-blue-light-border;
}

.c-modalSubscription__grid {
	@include clearfix;
}

.c-productsGrid__item {
	@include column(1/2, $cycle: 2, $gutter: 6);
}

.c-modalSubscription__gridContain {
	padding: 0 16px;
}

.c-modalSubscription__loadingWrap {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100px;
}

.c-modalSubscription__loadingText {
	font-family: $font-primary-regular;
	font-size: 22px;
	font-weight: 500;
	color: $color-primary;
	text-align: center;
}

.c-modalSubscription__shippingTitle {
	margin-bottom: 10px;
	font-family: $font-primary-regular;
	font-size: 24px;
	font-style: normal;
	font-weight: bold;
	line-height: 32px;
	text-transform: capitalize;
}
.c-modalSubscription__shippingSubtitle {
	margin-bottom: 20px;
	font-family: $font-primary-medium;
	font-size: 14px;
	font-weight: 500;
	line-height: 22px;
	color: $color-blue-secondary;
}
.c-modalSubscription__backButton {
	position: relative;
	bottom: 15px;
	margin-left: 10px;
}

.c-collectionFilter {
	margin-bottom: 15px;
	overflow-x: scroll;
}

.c-collectionFilter__inner {
	display: flex;
	justify-content: flex-start;
	padding: 16px 0 16px 50px;
	border-bottom: 1px solid $color-blue-light-border;
}

.c-collectionFilter__headline {
	margin-right: 15px;
	white-space: nowrap;
	list-style: none;
	cursor: pointer;

	&--active {
		font-weight: bold;
	}
}
</style>
