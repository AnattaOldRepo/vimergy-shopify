<template>
  <modal-mobile-wrap
    :show="show"
    :progress-bar-status="status"
    :progress-bar-message="statusText"
    :close-animation="closeAnimation"
    @close="closeModal"
  >
    <div v-if="!needUpdating" class="c-modalSubscription">
      <h2 v-if="editNextOrder"
        class="c-modalSubscription__title">
        {{ atc['portal.productsGridNextOrderTitle'] || 'Add to Your Next Order' }}
      </h2>

      <h2 v-else
        class="c-modalSubscription__title">
        {{ atc['portal.productsGridSubscriptionTitle'] || 'Add to Subscription' }}
      </h2>

      <div class="c-modalSubscription__inner">
        <collection-filter
          v-if="collectionOptions"
          :collection-option="collectionOptions"
          :active-collection-handle="activeCollectionHandle"
          @selectCollection="changeCurrentFilter"
        />

        <div v-if="products && activeCollectionHandle === 'all' && currentCollection">
          <div
            v-for="(each, index) in quantityProductCollection"
            :key="index"
            class="c-modalSubscription__gridContain"
            >
              <div class="c-modalSubscription__grid">
                <product-grid-item
                  v-for="(product, index2) in each.items"
                  :key="product.id + index2"
                  class="c-productsGrid__item"
                  :product="product"
                  :status="status"
                  :is-swap="isSwap"
                  @handleAddProductVariantToSubscription="handleAddProductVariantToSubscription"
                  @handleQuantityChange="handleQuantityChange"
                  @handleSwapProductVariant="handleSwapProductVariant"
                  @handleRemove="handleRemove"
                />
              </div>
          </div>
        </div>

        <div
          v-else-if="products && activeCollectionHandle !== 'all' && currentCollection"
          class="c-modalSubscription__gridContain"
          >
            <div class="c-modalSubscription__grid">
              <product-grid-item
                v-for="(product, index) in quantityProductCollection.items"
                :key="product.id + index"
                class="c-productsGrid__item"
                :product="product"
                :status="status"
                :is-swap="isSwap"
                @handleAddProductVariantToSubscription="handleAddProductVariantToSubscription"
                @handleQuantityChange="handleQuantityChange"
                @handleSwapProductVariant="handleSwapProductVariant"
                @handleRemove="handleRemove"
              />
            </div>
        </div>

        <div v-else-if="products && activeCollectionHandle === 'all' && !currentCollection" class="c-modalSubscription__gridContain">
          <div class="c-modalSubscription__grid">
            <product-grid-item
              v-for="(product, index2) in withProductQuantity"
              :key="product.id + index2"
              class="c-productsGrid__item"
              :product="product"
              :status="status"
              :is-swap="isSwap"
              @handleAddProductVariantToSubscription="handleAddProductVariantToSubscription"
              @handleQuantityChange="handleQuantityChange"
              @handleSwapProductVariant="handleSwapProductVariant"
              @handleRemove="handleRemove"
            />
          </div>
        </div>

        <div v-else class="c-modalSubscription__grid c-modalSubscription__gridContain">
          <content-placeholders
            v-for="(item, index) in [1, 2, 3, 4, 5, 6]"
            :key="index"
            :centered="true"
            class="c-productGridItem c-productsGrid__item"
            style="display: block;"
          >
            <div class="c-productGridItem__imageWrap" style="margin-bottom: 10px">
              <content-placeholders-img
                class="c-productGridItem__image"
                style="width: 140px; height: 140px;"
              />
            </div>
            <content-placeholders-text
              style="height: 20px; min-height: auto"
              :lines="1"
              class="c-productGridItem__title"
            />
            <!-- <content-placeholders-text
              style="height: 20px;"
              :lines="1"
              class="c-productGridItem__price"
            /> -->

            <content-placeholders-img
              style="height: 30px;"
              class="c-productGridItem__button"
            />
          </content-placeholders>
        </div>
      </div>
    </div>

    <div v-else class="c-modalMobile__wrapper">
      <modal-shipping-require
        @updateStatus="updateStatus"
      />
    </div>
  </modal-mobile-wrap>
</template>

<script>
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'

import ModalMobileWrap from '@components/modal-wrap-mobile.vue'
import ProductGridItem from '@components/product-grid-item.vue'
import CollectionFilter from '@components/collection-filter.vue'
import ModalShippingRequire from '@components/modal-shipping-require.vue'
import productChangeRequest from '@utils/product-change-request.js'
import { buildNewCheckoutUpdatePayload } from '@utils/newCheckoutUpdateHelpers'

export default {
  components: {
    ModalMobileWrap,
    ProductGridItem,
    CollectionFilter,
    ModalShippingRequire,
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
    isSwap: {
      type: Boolean,
      default: false,
    },
  },

  data(){
    return {
      status: '',
      statusText: '',
      activeCollectionHandle: 'all',
      needUpdating: false,
      updating: false,
    }
  },


  computed:{
    ...mapState('translations', ['atc']),

    ...mapState('products', ['products']),

    ...mapState('editMode', ['editNextOrder']),

    ...mapState('variantSelectProduct', ['variantSelectProduct']),

    ...mapState('swapProduct', ['swapProduct']),

    ...mapGetters('activeSubscription', [
      'activeSubscription',
      'activeSubscriptionNextOrder',
      'activeQueue',
    ]),

    ...mapGetters('products', ['hashedCollections', 'product']),

    collectionOptions(){
      let collectionOptionsArr = []
       // Check if we have collections
      if(Object.entries(this.hashedCollections).length > 0){
        for(let each in this.hashedCollections){
          if(each.toLowerCase() === 'all'){
            collectionOptionsArr.unshift({title: 'All', handle: each.toLowerCase()})
          } else {
            collectionOptionsArr.push({title: this.hashedCollections[each].title, handle: each.toLowerCase()})
          }
        }
      } else {
        collectionOptionsArr.push({title: 'All', handle: 'all'})
      }
      return collectionOptionsArr
    },

    currentCollection(){
      return this.hashedCollections[this.activeCollectionHandle]
    },

    quantityProductCollection() {
      const {
        activeSubscription,
        currentCollection,
        activeCollectionHandle,
      } = this

      let variantItems = {}
      let updatedCollection = []

      // Hashed the value to use DP
      for(let i = 0; i < activeSubscription.items.length; i++){
         if(!variantItems[activeSubscription.items[i].variant_id]){
           variantItems[activeSubscription.items[i].variant_id] = {id: activeSubscription.items[i].variant_id, quantity: activeSubscription.items[i].quantity}
         } else {
           variantItems[activeSubscription.items[i].variant_id].quantity += activeSubscription.items[i].quantity
         }
      }

      // Add Quantity to product
      if(activeCollectionHandle === 'all'){
        for(let i = 0; i < currentCollection.length; i++){
          let objectHolder = {}
          objectHolder['handle'] = currentCollection[i].handle
          objectHolder['title'] = currentCollection[i].title
          objectHolder['items'] = currentCollection[i].items.map(each => variantItems[each.variants[0].id] ? {...each, quantity: variantItems[each.variants[0].id].quantity} : each)
          updatedCollection.push(objectHolder)
        }
      } else {
        updatedCollection['title'] = currentCollection.title
        updatedCollection['handle'] = currentCollection.handle
        updatedCollection['items'] = currentCollection.items.map(each => variantItems[each.variants[0].id] ? {...each, quantity: variantItems[each.variants[0].id].quantity} : each)
      }
      return updatedCollection
    },

    withProductQuantity(){
      const { products } = this
      let variantItems = {}
      let productArray = products.slice()

      for(let i = 0; i < this.activeSubscription.items.length; i++){
        if(!variantItems[this.activeSubscription.items[i].variant_id]){
           variantItems[this.activeSubscription.items[i].variant_id] = {id: this.activeSubscription.items[i].variant_id, quantity: this.activeSubscription.items[i].quantity}
        } else {
           variantItems[this.activeSubscription.items[i].variant_id].quantity += this.activeSubscription.items[i].quantity
        }
      }

      productArray = productArray.map(each => variantItems[each.variants[0].id] ? {...each, quantity: variantItems[each.variants[0].id].quantity} : each)

      return productArray
    },
  },

  watch: {
    activeSubscription: {
      handler: 'GET_SUBSCRIPTION_SHIPPING_METHODS',
      immediate: true,
    },
  },

  methods:{
    ...mapMutations('subscriptions', ['setSavedProductUpdatePayload']),

    ...mapMutations('shippingMethods', ['SET_SHIPPING_METHODS', 'setActiveEditShippingMethod', 'setNewSwapShippingMethod']),

    ...mapMutations('variantSelectProduct', ['setVariantSelectProduct']),

    ...mapMutations('newCheckoutUpdates', ['setSavedNewCheckoutUpdate']),

    ...mapActions('subscriptions', [
      'UPDATE_SUBSCRIPTION',
      'UPDATE_NEXT_ORDER',
    ]),

    ...mapActions('shippingMethods', ['GET_SUBSCRIPTION_SHIPPING_METHODS']),

    ...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),

    changeCurrentFilter(collection){
      this.activeCollectionHandle = collection.handle
    },

    updateStatus(payload){
      const { status, statusText, needUpdating } = payload
      this.status = status
      this.statusText = statusText
      if(needUpdating === 'stop'){
        this.needUpdating = false
      }
    },

    handleNewCheckoutUpdate(updateArray) {
      console.log('handleNewCheckoutUpdate')

      return new Promise((resolve, reject) => {

        let updateCount = updateArray.length
        let updatesFinished = 0
        this.status = 'updating'
        this.statusText = 'Saving'
          // for each update
          updateArray.forEach(async (update) => {
            console.log({update})
            this.updating = true
            try {
              await update.updateAction
              this.status = 'success'
              this.statusText = 'saved successfully'
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
      console.log('e', e)
      console.log(handleNewCheckoutUpdatePayload)
      if (
        e &&
        e.data &&
        e.data.shipping_update_required
      ) {
        this.SET_SHIPPING_METHODS(e.data.rates)
        this.setSavedNewCheckoutUpdate(handleNewCheckoutUpdatePayload)
        this.needUpdating = true
        this.status = 'rejected'
        this.statusText = e.message
      } else {
        console.log('subscription/UPDATE_SUBSCRIPTION error: ', e)
      }
    },

    // handleUpdateError(e, updatePayload) {
    //   console.log('e.response', e)
    //   if (e && e.data && e.data.shipping_update_required) {
    //     // this.SET_SHIPPING_METHODS(e.data.rates)
    //     this.setSavedProductUpdatePayload(updatePayload)
    //   } else {
    //     console.log('subscription/UPDATE_SUBSCRIPTION error: ', e)
    //   }
    // },

    async handleQuantityChange({ type, id, quantity, variant_id, product }) {


      const {
        editNextOrder,
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
      const subscriptionItemPayload = type === 'increase' ? subscriptionIncreaseItemPayload : subscriptionDecreaseItemPayload
      const nextItemPayload = type === 'increase' ? nextIncreaseItemPayload : nextDecreaseItemPayload


      const updateSubscriptionPayload = {
        requestPayload: {
          items: subscriptionItemPayload ? [subscriptionItemPayload] : undefined,
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

      if (editNextOrder) {
        // updateMessage = `Quantity updated to ${quantity} on next order.`
        analyticsEventName = 'Upscribe Next Order Product Quantity Change'

        handleNewCheckoutUpdatePayload = [
          buildNewCheckoutUpdatePayload(
            this.UPDATE_NEXT_ORDER(nextOrderUpdatePayload),
            nextOrderUpdatePayload,
            'subscriptions',
            'UPDATE_NEXT_ORDER',
            `Quantity updated to ${quantity} on next order.`
          ),
        ]

      } else {
        // updateMessage = `Quantity updated to ${quantity}.`
        analyticsEventName = 'Upscribe Subscription Product Quantity Change'

        handleNewCheckoutUpdatePayload = [
          buildNewCheckoutUpdatePayload(
            this.UPDATE_NEXT_ORDER(nextOrderUpdatePayload),
            nextOrderUpdatePayload,
            'subscriptions',
            'UPDATE_NEXT_ORDER',
            `Quantity updated to ${quantity} on next order.`
          ),
          buildNewCheckoutUpdatePayload(
            this.UPDATE_SUBSCRIPTION(updateSubscriptionPayload),
            updateSubscriptionPayload,
            'subscriptions',
            'UPDATE_SUBSCRIPTION',
            `Quantity updated to ${quantity} on subscription.`,
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

      console.log('Triggering me')
      const {
        activeSubscription,
        activeQueue,
        editNextOrder,
      } = this

      const itemCount = editNextOrder
        ? activeQueue.items.length
        : activeSubscription.items.length

      if (itemCount <= 1) {
        this.$router.push({
          name: 'cancel',
        })
      }
      const {
        removePayload: nextRemoveItemPayload,
      } = productChangeRequest({
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

      // console.log({nextRemoveItemPayload})
      // console.log({subscriptionRemoveItemPayload})

      const updateSubscriptionPayload = {
        requestPayload: {
          items: subscriptionRemoveItemPayload ? [subscriptionRemoveItemPayload] : undefined,
        },
      }

      const nextOrderUpdatePayload = {
        requestPayload: {
          items: nextRemoveItemPayload ? [nextRemoveItemPayload] : undefined,
        },
      }

      let itemsToCheck = editNextOrder
        ? activeSubscription.next.items
        : activeSubscription.items

      let editItem = [...itemsToCheck].filter((item) => {
        return item.id === product.id
      })[0]

      let handleNewCheckoutUpdatePayload, analyticsEventName
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
            `Product removed from next order.`
          ),
        ]
      } else {
        analyticsEventName = 'Upscribe Subscription Product Remove'

        handleNewCheckoutUpdatePayload = [
          buildNewCheckoutUpdatePayload(
            this.UPDATE_NEXT_ORDER(nextOrderUpdatePayload),
            nextOrderUpdatePayload,
            'subscriptions',
            'UPDATE_NEXT_ORDER',
            `Product removed from next order.`
          ),
          buildNewCheckoutUpdatePayload(
            this.UPDATE_SUBSCRIPTION(updateSubscriptionPayload),
            updateSubscriptionPayload,
            'subscriptions',
            'UPDATE_SUBSCRIPTION',
            `Product removed from subscription`,
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

    async handleAddProductVariantToSubscription(variantId, product) {
      console.log('handleAddProductVariantToSubscription', variantId)
      this.setVariantSelectProduct(product)
      const {
        editNextOrder,
        activeSubscription,
      } = this

      const { addPayload: nextAddItemPayload} = productChangeRequest({
        variantId,
        editNextOrder: true,
        subscription: activeSubscription,
      })

      const { addPayload: subscriptionAddItemPayload } = productChangeRequest({
        variantId,
        editNextOrder: false,
        subscription: activeSubscription,
      })

      const updateSubscriptionPayload = {
        requestPayload: {
          items: subscriptionAddItemPayload ? [subscriptionAddItemPayload] : undefined,
        },
      }

      const nextOrderUpdatePayload = {
        requestPayload: {
          items: nextAddItemPayload ? [nextAddItemPayload] : undefined,
        },
      }

      let analyticsEventName, handleNewCheckoutUpdatePayload
      let analyticsPayload = { product }

      if (editNextOrder) {
        analyticsEventName = 'Upscribe Next Order Product Add'

        handleNewCheckoutUpdatePayload = [
          buildNewCheckoutUpdatePayload(
            this.UPDATE_NEXT_ORDER(nextOrderUpdatePayload),
            nextOrderUpdatePayload,
            'subscriptions',
            'UPDATE_NEXT_ORDER',
            `Product add to next order.`
          ),
        ]

      } else {
        analyticsEventName = 'Upscribe Subscription Product Add'

        handleNewCheckoutUpdatePayload = [
          buildNewCheckoutUpdatePayload(
            this.UPDATE_NEXT_ORDER(nextOrderUpdatePayload),
            nextOrderUpdatePayload,
            'subscriptions',
            'UPDATE_NEXT_ORDER',
            `Product added to next order.`
          ),
          buildNewCheckoutUpdatePayload(
            this.UPDATE_SUBSCRIPTION(updateSubscriptionPayload),
            updateSubscriptionPayload,
            'subscriptions',
            'UPDATE_SUBSCRIPTION',
            `Product added to subscription.`,
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

    async handleSwapProductVariant(variantId, newProduct) {

      const {
        editNextOrder,
        activeSubscription,
      } = this

      const productToReplace = this.swapProduct

      const { addPayload: nextAddSwapItemPayload } = productChangeRequest({
        variantId,
        editNextOrder: true,
        subscription: activeSubscription,
      })

      const { removePayload: nextRemoveSwappedItemPayload } = productChangeRequest({
        variantId: productToReplace.variant_id,
        editNextOrder: true,
        subscription: activeSubscription,
      })

      const { addPayload: subscriptionAddSwapItemPayload } = productChangeRequest({
        variantId,
        editNextOrder: false,
        subscription: activeSubscription,
      })

      const { removePayload: subscriptionRemoveSwappedItemPayload } = productChangeRequest({
        variantId: productToReplace.variant_id,
        editNextOrder: false,
        subscription: activeSubscription,
      })

      console.log({nextAddSwapItemPayload, nextRemoveSwappedItemPayload})
      console.log({subscriptionAddSwapItemPayload, subscriptionRemoveSwappedItemPayload})

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
      if (!subscriptionAddSwapItemPayload && !subscriptionRemoveSwappedItemPayload) {
        subscriptionItemPayload = false
      } else {
        if (subscriptionAddSwapItemPayload) {
          subscriptionItemPayload = [...subscriptionItemPayload, subscriptionAddSwapItemPayload]
        }
        if (subscriptionRemoveSwappedItemPayload) {
          subscriptionItemPayload = [...subscriptionItemPayload, subscriptionRemoveSwappedItemPayload]
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

      if (editNextOrder) {
        analyticsEventName = 'Upscribe Next Order Product Swap'

        // updateMessage = `Quantity updated to ${quantity} on next order.`
        handleNewCheckoutUpdatePayload = [
          buildNewCheckoutUpdatePayload(
            this.UPDATE_NEXT_ORDER(nextOrderUpdatePayload),
            nextOrderUpdatePayload,
            'subscriptions',
            'UPDATE_NEXT_ORDER',
            `Product swapped on next order.`
          ),
        ]

      } else {

        analyticsEventName = 'Upscribe Subscription Product Swap'

        handleNewCheckoutUpdatePayload = [
          buildNewCheckoutUpdatePayload(
            this.UPDATE_NEXT_ORDER(nextOrderUpdatePayload),
            nextOrderUpdatePayload,
            'subscriptions',
            'UPDATE_NEXT_ORDER',
            `Product swapped on next order.`
          ),
          buildNewCheckoutUpdatePayload(
            this.UPDATE_SUBSCRIPTION(updateSubscriptionPayload),
            updateSubscriptionPayload,
            'subscriptions',
            'UPDATE_SUBSCRIPTION',
            `Product swapped on subscription.`,
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


.c-modalSubscription__title{
  font-weight: 500;
  font-size: 16px;
  line-height: 21px;
  text-align: center;
  text-transform: capitalize;
  padding-bottom: 10px;
  padding-top: 5px;
  border-bottom: 1px solid $color-blue-light-border;
}

.c-modalSubscription__grid {
  @include clearfix;
}

.c-productsGrid__item {
  @include column(1/2, $cycle: 2, $gutter: 6);
}

.c-modalSubscription__gridContain{
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

.c-modalSubscription__shippingTitle{
  margin-bottom: 10px;
  font-family: $font-primary-regular;
  font-weight: bold;
  text-transform: capitalize;
  font-style: normal;
  font-size: 24px;
  line-height: 32px;
}
.c-modalSubscription__shippingSubtitle{
  margin-bottom: 20px;
  font-family: $font-primary-medium;
  font-weight: 500;
  font-size: 14px;
  line-height: 22px;
  color: $color-blue-secondary;
}
</style>
