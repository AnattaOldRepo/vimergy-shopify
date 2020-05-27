<template>
<div>
  <portal to="header">
    <the-header />
  </portal>

  <div
    v-if="products && productImages && activeSubscription"
      class="c-oneTimeProductAdd"
    >
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
      />

      <div v-else class="c-oneTimeProductAdd__loading">
        <h2 class="c-oneTimeProductAdd__loadingText"
          >{{ oneTimeOrderAddingMessage }}</h2
        >
        <loader-icon class="c-oneTimeProductAdd__loadingIcon" />
      </div>
    </div>

    <div v-else class="c-oneTimeProductAdd">
      <div class="c-oneTimeProductAdd__loading">
        <h2 class="c-oneTimeProductAdd__loadingText"
          >{{ atc['portal.oneTimeOrderLoadingMessage'] || 'Fetching your one-time product...' }}</h2
        >
        <loader-icon class="c-oneTimeProductAdd__loadingIcon" />
      </div>

      <!-- <drawer-shipping-method-list
        class="c-drawerShippingMethodList c-drawerProducts c-drawer"
        select-during-product-update
        :updating=""
        @setMode="handleSetMode"
        @setDrawerStatus="handleDrawerStatus"
      />     -->
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations, mapGetters } from 'vuex'
import OneTimeThankYou from '@components/one-time-thank-you.vue'
import LoaderIcon from '@components/loader-icon.vue'
import productChangeRequest from '@utils/product-change-request.js'
import DrawerShippingMethodList from '@components/drawer-shipping-method-list.vue'
import TheHeader from '@components/the-header.vue'

export default {
  components: {
    TheHeader,
    OneTimeThankYou,
    LoaderIcon,
    DrawerShippingMethodList,
  },
  data: () => {
    return {
      isLoading: false,
      oneTimeAdded: false,
      otoVariablesSet: false,
      showShippingMethodUpdateModal: false,
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

    oneTimeOrderAddingMessage() {
      const { atc, otoProduct, otoVariant} = this
      if (atc['portal.oneTimeOrderAddingMessage']) {
        return atc['portal.oneTimeOrderAddingMessage'].replace('<oto-product-title>', otoProduct.title).replace('<oto-variant-title>', otoVariant.title)
      } else {
       return `Adding ${ otoProduct.title } (${ otoVariant.title }) to your next shipment...`
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

  watch: {

    // Add OTO when products available
    products: {
      immediate: true,
      handler: function(newVal) {
        console.log('watch products', this.newVal)

        if (!this.oneTimeAdded && this.otoVariablesSet) {
          console.log('products and !oneTimeAdded')
          this.addOtoProduct()
        }
      },
    },

    otoVariablesSet: {
      handler: function(set) {
        if (set && this.products && !this.oneTimeAdded) {
          this.addOtoProduct()
        }
      },
    },
  },

  mounted() {
    const { query } = this.$route
    console.log({query})
    if (!query) return

    this.showShippingMethodUpdateModal = false

    // https://shop.foursigmatic.com/pages/account-subscriptions#/one-time-product-add?storeDomain=foursigmastore-us.myshopify.com&customerId=2715671265316&otoSubscriptionId=13346&otoQueueId=13851&otoAddProduct=true&otoProductVariantId=1033588909

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

    console.log({
      otoProductVariantId: this.otoProductVariantId,
      otoQueueId: this.otoQueueId,
      otoSubscriptionId: this.otoSubscriptionId,
      otoAddProduct: this.otoAddProduct,
    })

    this.$nextTick(() => {
      this.otoVariablesSet = true
    })
  },

  methods: {
    ...mapActions('oneTimeOrder', ['ADD_OTO_PRODUCT_TO_OTO_QUEUE']),

    ...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),

    ...mapMutations('oneTimeOrder', [
      'setOtoProductVariantId',
      'setOtoQueueId',
      'setOtoSubscriptionId',
      'setOtoAddProduct',
    ]),

    ...mapActions('subscriptions', ['UPDATE_NEXT_ORDER']),

    ...mapMutations('subscriptions', ['setSavedProductUpdatePayload']),

    ...mapMutations('shippingMethods', ['SET_SHIPPING_METHODS']),

    ...mapMutations('editMode', ['setEditNextOrder']),

    handleCompletedOtoAdd() {
      this.showShippingMethodUpdateModal = false
      this.oneTimeAdded = true
    },

    handleUpdateError(e, updatePayload) {
      console.log('e.response', e)
      if (e && e.data && e.data.shipping_update_required) {
        this.SET_SHIPPING_METHODS(e.data.rates)
        this.setSavedProductUpdatePayload(updatePayload)
        this.showShippingMethodUpdateModal = true
      } else {
        console.log('subscription/UPDATE_SUBSCRIPTION error: ', e)
        this.$emit('setDrawerStatus', { state: 'FAILURE', message: e.message })
      }
    },

    async addOtoProduct() {
      const vm = this
      const {
        otoProductVariantId,
        activeSubscription,
      } = this

      console.log('addOtoProduct')

      console.log(        {otoProductVariantId},
        {activeSubscription})

      const { addPayload: nextAddItemPayload} = productChangeRequest({
        variantId: otoProductVariantId,
        editNextOrder: true,
        subscription: activeSubscription,
      })

      const nextOrderUpdatePayload = {
        requestPayload: {
          items: nextAddItemPayload ? [nextAddItemPayload] : undefined,
        },
      }

      // let analyticsEventName

      console.log('addOtoProduct', otoProductVariantId)

      let updateAction = this.ADD_OTO_PRODUCT_TO_OTO_QUEUE(nextOrderUpdatePayload)

      this.isLoading = true

      try {
        await updateAction
        this.oneTimeAdded = true

        // this.triggerAnalyticsEvent({
        //   event: analyticsEventName,
        //   payload: { product: variantSelectProduct },
        // })

      } catch (e) {
        console.log('addOtoProduct error: ', e)
        this.handleUpdateError(e, {
          ...nextOrderUpdatePayload,
          successMessage: 'Product Added',
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
}

.c-oneTimeProductAdd__loadingText {
  line-height: 1.5;
}

.c-oneTimeProductAdd__loadingIcon {
  margin-top: 40px;
}
</style>
