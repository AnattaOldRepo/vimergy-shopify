<template>
<div>
  <portal to="header">
    <the-header />
  </portal>

  <div v-if="products && productImages && initedAddAction" class="c-oneTimeProductAdd">
    <one-time-thank-you
      v-if="oneTimeAdded"
      :active-subscription="activeSubscription"
      :active-charge="activeSubscription.next"
      :oto-product="otoProduct"
      :oto-variant="otoVariant"
      class="c-oneTimeProductAdd__thankYou"
    />

    <drawer-shipping-method-list
      v-else-if="showShippingMethodUpdateModal"
      class="c-drawerShippingMethodList c-drawerProducts c-drawer"
      select-during-product-update
      :oto-shipping-update-add="showShippingMethodUpdateModal"
      @completedSavedUpdated="handleCompletedOtoAdd"
      @error="handleOtoAddShippingUpdateError"
    />

    <div v-else class="c-oneTimeProductAdd__loading">
      <h2 v-if="error" class="c-oneTimeProductAdd__loadingText">{{ error.message === 'NETWORK ERROR' ? 'Network Error, please wait a moment and then refresh the page.' : error.message }}</h2>
      <h2 v-else class="c-oneTimeProductAdd__loadingText">{{ oneTimeOrderAddingMessage }}</h2>
      <second-loader-icon class="c-oneTimeProductAdd__loadingIcon" />
    </div>
  </div>

  <div v-else class="c-oneTimeProductAdd">
    <div  v-if="allDataLoaded && !oneTimeAdded" class="c-oneTimeProductAdd__loading">
      <h3 class="c-oneTimeProductAdd__loadingText">{{ addOtoProductToNextOrderMessage }}</h3>
      <v-button :text="atc['buttons.addProductGridItem'] || 'Add'" auto @click.native="addOtoProduct" />

    </div>

    <div v-else class="c-oneTimeProductAdd__loading">
      <h2
        class="c-oneTimeProductAdd__loadingText"
      >{{ atc['portal.oneTimeOrderLoadingMessage'] || 'Fetching your one-time product...' }}</h2>
      <second-loader-icon class="c-oneTimeProductAdd__loadingIcon" />
    </div>
  </div>
</div>
</template>

<script>
import { mapState, mapActions, mapMutations, mapGetters } from 'vuex'
import OneTimeThankYou from '@components/one-time-thank-you.vue'
import SecondLoaderIcon from '@components/second-loader-icon.vue'
import productChangeRequest from '@utils/product-change-request.js'
import DrawerShippingMethodList from '@components/drawer-shipping-method-list.vue'
import { buildNewCheckoutUpdatePayload } from '@utils/newCheckoutUpdateHelpers'
import VButton from '@components/v-button.vue'
import TheHeader from '@components/the-header.vue'

export default {
  components: {
    TheHeader,
    OneTimeThankYou,
    DrawerShippingMethodList,
    VButton,
    SecondLoaderIcon,
  },
  data: () => {
    return {
      initedAddAction: false,
      isLoading: false,
      oneTimeAdded: false,
      otoVariablesSet: false,
      showShippingMethodUpdateModal: false,
      error: null,
      customerId: null,
      storeDomain: null,
    }
  },
  computed: {
    ...mapState('translations', ['atc']),

    ...mapState('shop', ['shopData']),

    ...mapGetters('activeSubscription', ['activeSubscription']),

    ...mapState('oneTimeOrder', [
      'otoAddProduct',
      'otoSubscriptionId',
      'otoQueueId',
      'otoProductVariantId',
    ]),

    ...mapState('products', ['products', 'productImages']),

    allDataLoaded() {
      if (this.otoVariablesSet && this.activeSubscription && this.activeSubscription.id && this.products) {
        return true
      } else {
        return false
      }
    },

    addOtoProductToNextOrderMessage() {
      const { atc, otoProduct, otoVariant } = this
      if (atc['portal.oneTimeOrderAddMessage']) {
        return atc['portal.oneTimeOrderAddMessage']
          .replace('<oto-product-title>', otoProduct.title)
          .replace('<oto-variant-title>', otoVariant.title)
      } else {
        return `Add ${otoProduct.title} (${
          otoVariant.title
        }) to your next shipment`
      }
    },

    oneTimeOrderAddingMessage() {
      const { atc, otoProduct, otoVariant } = this
      if (atc['portal.oneTimeOrderAddingMessage']) {
        return atc['portal.oneTimeOrderAddingMessage']
          .replace('<oto-product-title>', otoProduct.title)
          .replace('<oto-variant-title>', otoVariant.title)
      } else {
        return `Adding ${otoProduct.title} (${
          otoVariant.title
        }) to your next shipment...`
      }
    },

    otoProduct() {
      const { products, otoProductVariantId } = this

      let finalProduct = products.filter((product) => {
        let match = false
        product.variants.forEach((variant) => {
          // eslint-disable-next-line eqeqeq
          if (variant.id == otoProductVariantId) match = true
        })
        return match
      })

      return finalProduct.length ? finalProduct[0] : false
    },

    otoVariant() {
      const { products, otoProductVariantId } = this

      let finalVariant = false

      products.forEach((product) => {
        product.variants.forEach((variant) => {
          // eslint-disable-next-line eqeqeq
          if (variant.id == otoProductVariantId) {
            finalVariant = variant
          }
        })
      })

      return finalVariant
    },

    productImage() {
      const { productImages, product, otoProductVariantId } = this
      if (!productImages && !product.image_url && !product.image) return false

      if (
        otoProductVariantId &&
        productImages &&
        productImages[otoProductVariantId]
      ) {
        return productImages[otoProductVariantId]
      } else {
        return product && product.image && product.image.src
          ? product.image.src
          : false
      }
    },
  },

	async beforeMount() {
		const query = this.$route.query

		let customerId = false
		let storeDomain = false

		// set from liquid account profile
		if (window.upscribeCustomerId) {
			customerId = window.upscribeCustomerId
		}

		// set from liquid account profile
		if (window.upscribeStoreDomain) {
			storeDomain = window.upscribeStoreDomain
		}

		// set from query params
		if (query && query.customerId) {
			customerId = query.customerId
		}

		// set from query params
		if (query && query.storeDomain) {
			storeDomain = query.storeDomain
		}

		this.customerId = customerId
		this.storeDomain = storeDomain
	},

  async mounted() {
    const { query } = this.$route

    if (!query) return

		const { storeDomain, customerId } = this

		if (!storeDomain || !customerId) {
			return this.$nuxt.error({
				statusCode: 404,
				message: `Error Loading Portal. ${
					!storeDomain ? 'Invalid store domain.' : 'Invalid customer ID.'
				}`,
			})
		} else {
			this.setStoreDomain(storeDomain)
			this.setCustomerId(customerId)

			this.$loadStoreSegment()
			this.$loadStoreGtm()
		}

    this.showShippingMethodUpdateModal = false
    this.error = null

    const {
      otoProductVariantId,
      otoQueueId,
      otoSubscriptionId,
      otoAddProduct,
    } = query

    if (
      !otoAddProduct ||
      !otoSubscriptionId ||
      !otoQueueId ||
      !otoProductVariantId
    ) {
      return this.$nuxt.error({
        statusCode: 404,
        message: `One-time Product Add parameters are missing. otoAddProduct: ${otoAddProduct}, otoSubscriptionId: ${otoSubscriptionId}, otoQueueId: ${otoQueueId}, otoProductVariantId: ${otoProductVariantId}`,
      })
    }

    this.setOtoProductVariantId(otoProductVariantId)
    this.setOtoQueueId(otoQueueId)
    this.setOtoSubscriptionId(otoSubscriptionId)
    this.setOtoAddProduct(true)

    this.setActiveSubscriptionId(parseInt(otoSubscriptionId))

    console.log({
      otoProductVariantId: this.otoProductVariantId,
      otoQueueId: this.otoQueueId,
      otoSubscriptionId: this.otoSubscriptionId,
      otoAddProduct: this.otoAddProduct,
    })

    this.$nextTick(() => {
      this.otoVariablesSet = true
    })

			try {
				await Promise.all([
					this.GET_CUSTOMER(),
					this.GET_SUBSCRIPTIONS(),
          this.GET_PRODUCTS(),
					this.GET_SHOP(),
        ])
      } catch(e) {
        console.log(e)
      }
  },

  methods: {
    ...mapActions('shop', ['GET_SHOP']),

		...mapActions('customer', ['GET_CUSTOMER']),

    ...mapMutations('route', ['setCustomerId', 'setStoreDomain']),

    ...mapMutations('activeSubscription', ['setActiveSubscriptionId']),

		...mapActions('subscriptions', ['GET_SUBSCRIPTIONS']),

    ...mapActions('products', ['GET_PRODUCTS']),

    ...mapActions('oneTimeOrder', ['ADD_OTO_PRODUCT_TO_OTO_QUEUE']),

    ...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),

    ...mapMutations('oneTimeOrder', [
      'setOtoProductVariantId',
      'setOtoQueueId',
      'setOtoSubscriptionId',
      'setOtoAddProduct',
    ]),

    ...mapMutations('newCheckoutUpdates', ['setSavedNewCheckoutUpdate']),

    ...mapMutations('subscriptions', ['setSavedProductUpdatePayload']),

    ...mapMutations('shippingMethods', ['SET_SHIPPING_METHODS']),

    ...mapActions('subscriptions', ['UPDATE_NEXT_ORDER']),

    ...mapMutations('editMode', ['setEditNextOrder']),

    handleCompletedOtoAdd() {
      this.showShippingMethodUpdateModal = false
      this.oneTimeAdded = true
    },

    handleOtoAddShippingUpdateError(error) {
      this.error = error
    },

    handleNewCheckoutUpdateError(e, handleNewCheckoutUpdatePayload) {
      console.log('e', e)
      if (
        e &&
        e.data &&
        e.data.shipping_update_required
      ) {
        this.SET_SHIPPING_METHODS(e.data.rates)
        this.setSavedNewCheckoutUpdate(handleNewCheckoutUpdatePayload)

        this.showShippingMethodUpdateModal = true
      } else {
        console.log('subscription/OTO_ADD_PRODUCT error: ', e)
        this.error = { state: 'FAILURE', message: this.stripHtml(e.message) }
      }
    },

    handleNewCheckoutUpdate(updateArray) {
      return new Promise((resolve, reject) => {

        let updateCount = updateArray.length
        let successes = 0

          // for each update
          updateArray.forEach(async (update) => {
            try {
              await update.updateAction
              successes += 1

            } catch (e) {
              this.handleNewCheckoutUpdateError(e, update)
            }

            if (successes === updateCount) {
              this.$emit('setDrawerStatus', 'SUCCESS')
              this.$emit('setMode', 'edit')
              resolve(true)
            }
          })
      })
    },

    async addOtoProduct() {
      const vm = this
      const {
        otoProductVariantId,
        activeSubscription,
        otoProduct,
      } = this
      this.initedAddAction = true

      const productChangeRequestResponse = productChangeRequest({
        variantId: otoProductVariantId,
        editNextOrder: true,
        subscription: activeSubscription,
      })

      const nextAddItemPayload = productChangeRequestResponse.addPayload

      const nextOrderUpdatePayload = {
        requestPayload: {
          items: nextAddItemPayload ? [nextAddItemPayload] : undefined,
        },
      }

      const handleNewCheckoutUpdatePayload = [
        buildNewCheckoutUpdatePayload(
          this.ADD_OTO_PRODUCT_TO_OTO_QUEUE(nextOrderUpdatePayload),
          nextOrderUpdatePayload,
          'subscriptions',
          'UPDATE_NEXT_ORDER',
          `${otoProduct.title} added to next order.`
        ),
      ]

      this.isLoading = true

      try {
        await this.handleNewCheckoutUpdate(handleNewCheckoutUpdatePayload)
        this.oneTimeAdded = true
      } catch (e) {
        console.log('addOtoProduct error: ', e)
        this.handleUpdateError(e, {
          ...handleNewCheckoutUpdatePayload,
        })
      } finally {
        this.isLoading = false
        // this.removeOtoUrlParams()

        this.setEditNextOrder(true)

        this.$nextTick(() => {
          vm.$emit('close')
        })
      }
    },

    removeOtoUrlParams() {
      const { removeParam } = this
      let newUrl = window.location.href

      newUrl = removeParam('otoAddProduct', newUrl)
      newUrl = removeParam('otoProductVariantId', newUrl)
      newUrl = removeParam('otoQueueId', newUrl)
      newUrl = removeParam('otoSubscriptionId', newUrl)

      window.history.pushState({}, document.title, '/' + newUrl)
    },
  },
}
</script>

<style lang="scss">
@import '@design';

.c-oneTimeProductAdd {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.c-oneTimeProductAdd__thankYou {
  width: 100%;
}

.c-oneTimeProductAdd__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  margin-top: 40px;
  padding: 20px;
  text-align: center;
  max-width: 500px;
  margin: 0 auto;
}

.c-oneTimeProductAdd__loadingText {
  line-height: 1.5;
  margin-bottom: 30px;
}
</style>
