<template>
  <div v-if="orders && atc" class="c-order__main">
    <portal to="header">
      <the-header
        :middle-html="currentOpenOrderActive"
        mode="backwardRoute"
      />
    </portal>

    <div v-if="historyOrder" class="c-order__info">
      <span class="c-order__infoStatus"
        >{{ atc['labels.orderStatus'] || 'Status' }}: {{ orderStatus }}</span
      >
      <span class="c-order__infoOrderNumber"
        >{{ atc['labels.order'] || 'Order' }} #: {{ orderAlternativeForRefreshingPage.id || orderAlternativeForRefreshingPage.shopify_order_id }}</span
      >
    </div>

    <div class="c-order__lineItems">
      <div
        v-for="(item, index) in orderLineItems"
        :key="index"
        class="c-order__lineItem"
      >
        <div class="c-order__topItemWrap">
          <div v-if="productImage(item)" class="c-order__imageWrap">
            <!-- v-if="productImages" -->
            <!-- <img class="c-order__image" :src="productImages[item.shopify_product_id]"/> -->
            <img class="c-order__image" :src="productImage(item)" />
          </div>

          <div class="c-order__lineItemContentBox">
            <div class="c-order__lineItemTitleBox">
              <h2 class="c-order__lineItemTitle">{{
                item.title
              }}</h2>

              <span class="c-order__lineItemSubtitle">{{
                productOptionDetails(item)
              }}</span>

              <span class="c-order__subText c-order__subTextQuantity is-faded">{{ atc['labels.quantityShort'] || 'QTY' }}: {{ item.quantity }}</span>
            </div>

            <span v-if="historyOrder" class="c-order__subText u-font-bold">{{ currencySymbol }}{{
              (item.price * item.quantity).toFixed(2)
            }}</span>

            <div v-else-if="!historyOrder" class="c-order__priceContain">
              <span class="c-order__subText u-font-bold">{{ currencySymbol }}{{
              (item.price * item.quantity).toFixed(2)
              }}</span>

              <span
                class="c-order__subText u-font-bold c-order__openEditQuantity"
                tabindex="0"
                role="button"
                @click="openModal(item.variant_id)">
                Edit
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="c-order__pricingSection u-font-bold">
      <div class="c-order__pricing">
        <span>{{ atc['labels.subtotal'] || 'Subtotal' }}</span>
        <span>{{ currencySymbol }}{{ orderAlternativeForRefreshingPage.total_line_items_price.toFixed(2) }}</span>
      </div>

      <div class="c-order__pricing">
        <span>{{ atc['labels.shipping'] || 'Shipping' }}</span>
        <span>{{ currencySymbol }}{{ shippingPrice }}</span>
      </div>

      <div v-if="historyOrder" class="c-order__pricing">
        <span>{{ atc['labels.tax'] || 'Tax' }}</span>
        <span v-if="orderAlternativeForRefreshingPage.total_tax">{{ currencySymbol }}{{ orderAlternativeForRefreshingPage.total_tax.toFixed(2) }}</span>
        <span v-else>--</span>
      </div>

      <div v-if="historyOrder" class="c-order__pricing">
        <span>{{ atc['portal.discountCode'] || 'Discount Code' }}</span>
        <span  v-if="shopifyDiscount"> {{ shopifyDiscountCode }} ({{ shopifyDiscountAmountDisplay }})</span>
        <span v-else>--</span>
      </div>

      <div class="c-order__pricing c-order__pricing--total">
        <span>{{ atc['labels.total'] || 'Total' }}</span>
        <span>{{ currencySymbol }}{{ orderAlternativeForRefreshingPage.total_price.toFixed(2) }}</span>
      </div>
    </div>

    <portal v-if="isProductModalOpen" to="modals">
      <modal-product
        :show="isProductModalOpen"
        :close-modal="closeModal"
        :close-animation="closeAnimation"
        @swapSubscription="openAddToSubscriptionModal"
        />
    </portal>

    <portal v-if="isOpeningProductSubscription" to="modals">
      <modal-subscription
        :show="isOpeningProductSubscription"
        :close-modal="closeModal"
        :close-animation="closeAnimation"
        :is-swap="isSwapSubscription"
        />
    </portal>
  </div>
</template>

<script>
import { mapState, mapMutations, mapGetters } from 'vuex'
import ModalProduct from '@components/modal-product'
import moment from 'moment'
import TheHeader from '@components/the-header'
import ModalSubscription from '@components/modal-subscription'
export default {
  components:{
    ModalProduct,
    TheHeader,
    ModalSubscription,
  },

  props: {
    isEditMode: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Object,
      default: () => {},
    },
    historyOrder: {
      type: Boolean,
      default: true,
    },
  },

  data(){
    return{
      isProductModalOpen: false,
      closeAnimation: false,
      isSwapSubscription: false,
      isOpeningProductSubscription: false,
    }
  },

  computed: {
    ...mapState('translations', ['atc', 'activeLanguageCode']),

    ...mapState('products', ['productImages']),

    ...mapState('shop', ['currencySymbol']),

    ...mapState('orders', ['orders']),

     ...mapGetters('activeSubscription', [
      'activeSubscriptionNextDate',
      'activeSubscription',
    ]),

    shopifyDiscount() {
      const { order: { discount_applications} = {} } = this
      return (discount_applications && discount_applications.length) ? discount_applications[0] : false
    },

    currentOpenOrderActive(){
      if(this.historyOrder){
        return `<span class='c-order__header'>${this.prettyDate}</span> <span class='c-order__headerDate'>${this.currencySymbol}${this.orderAlternativeForRefreshingPage.total_price.toFixed(2)}</span>`
      } else if(this.isCancelledSubscriptionRoute){
        return `<span class='c-order__header'>Subscription ${this.activeSubscription.id}</span>`
    } else {
        return `<span class='c-order__header'>Next Shipment</span> <span class='c-order__headerDate'>${this.nextShipDate}</span>`
      }
    },

    shopifyDiscountCode() {
      const { shopifyDiscount } = this
      if (!shopifyDiscount) return false
      return shopifyDiscount.code
    },

    shopifyDiscountAmountDisplay() {
      const { shopifyDiscount, currencySymbol } = this

      if (shopifyDiscount.value_type === 'percentage') {
        return `-${parseInt(shopifyDiscount.value)}%`
      } else {
        return `-${currencySymbol}${shopifyDiscount.value}`
      }
    },

    orderStatus() {
      const { orderAlternativeForRefreshingPage, isOriginalCharge } = this
      if (isOriginalCharge) {
        return 'Paid'
      }
      return orderAlternativeForRefreshingPage.fulfillment_status
        ? orderAlternativeForRefreshingPage.fulfillment_status
        : orderAlternativeForRefreshingPage.financial_status
    },

    orderLineItems() {
      const { orderAlternativeForRefreshingPage, isOriginalCharge } = this
      if (isOriginalCharge) {
        return orderAlternativeForRefreshingPage.items
      } else {
        return orderAlternativeForRefreshingPage.line_items
      }
    },

    shippingPrice() {
      const { orderAlternativeForRefreshingPage, isOriginalCharge } = this
      if (isOriginalCharge) {
        return orderAlternativeForRefreshingPage.shipping_lines[0].price
      } else {
        return orderAlternativeForRefreshingPage.total_shipping_price_set
          ? orderAlternativeForRefreshingPage.total_shipping_price_set.shop_money.amount
          : 0
      }
    },

    prettyDate() {
      const { orderAlternativeForRefreshingPage, isOriginalCharge } = this
      const date = isOriginalCharge
        ? moment(orderAlternativeForRefreshingPage.created_at, 'YYYYMMDD').format('MMM D, YYYY')
        : moment(orderAlternativeForRefreshingPage.processed_at).format('MMM D, YYYY')
      return date
    },

    // determin if coming from subscriptions array or shopify order array
    isOriginalCharge() {
      return !!this.orderAlternativeForRefreshingPage.shopify_order_id
    },

    nextShipDate() {
      const { activeSubscriptionNextDate } = this
      if (!activeSubscriptionNextDate) return false
      return moment(activeSubscriptionNextDate, 'YYYYMMDD').format('MM-DD')
    },

    orderAlternative(){
      const { orders, $route } = this
      let order
      if(orders){
        order = orders.find(each => each.id === parseInt($route.query.orderId))
      }
      return order
    },

    isCancelledSubscriptionRoute(){
      return this.$route.query.route === 'cancelledSubscriptions'
    },

    orderAlternativeForRefreshingPage(){
      const { order, orderAlternative, historyOrder } = this
      if(historyOrder){
        if(order && order.shopify_order_id){
          return order
        }
      } else {
        if(order && order.shopify_order_id){
          return order
        }
      }
      return orderAlternative
    },
  },

  watch: {
    activeLanguageCode: {
      immediate: true,
      handler: function(newVal) {
        moment.locale(newVal)
      },
    },
  },

  methods: {
    ...mapMutations('products', ['setProductIdAndSubscriptionId']),

    ...mapMutations('swapProduct', ['setSwapProduct']),

    productOptionDetails(item) {
      const { isOriginalCharge } = this
      if (!item.properties) return false

      let propertyHash = {}

      if (isOriginalCharge) {
        propertyHash = item.properties
      } else {
        item.properties.forEach((property) => {
          propertyHash[property.name] = property.value
        })
      }

      let discountAmount = propertyHash['Discount Amount']
        ? propertyHash['Discount Amount']
        : false
      let detail = `Auto Renew x${item.quantity}`
      if (discountAmount) {
        detail += ` (${discountAmount} OFF)`
      }
      return detail
    },

    productImage(item) {
      const { productImages } = this

      if (item.image_url) {
        return item.image_url
      }

      if (!productImages) return false

      const { variant_id, product_id } = item

      return productImages[variant_id]
        ? productImages[variant_id]
        : productImages[product_id]
        ? productImages[product_id]
        : false
    },

    formatMoney(money) {
      var price = parseFloat(money)
      var priceWithDecimal = (price / 100.0).toFixed(2)

      return '$' + String(priceWithDecimal)
    },

    openModal(productVariantId){
      this.setProductIdAndSubscriptionId(productVariantId)
      this.isProductModalOpen = true
      this.closeAnimation = false
    },

    openAddToSubscriptionModal(payload){
      this.isOpeningProductSubscription = true
      this.closeAnimation = false

      if(payload && payload.title === 'swap') {
        this.isSwapSubscription = true
        this.setSwapProduct(payload.product)
      } else {
        this.isSwapSubscription = false
      }
    },

    closeModal(){
      this.closeAnimation = true
      setTimeout(() => {
        this.isProductModalOpen = false
        this.isOpeningProductSubscription = false
      }, 500)
    },
  },
}
</script>

<style lang='scss'>
@import '@design';
.c-order__info {
  display: flex;
  justify-content: space-between;
}

.c-order__infoStatus {
  margin-bottom: 13px;
  font-family: $font-primary-medium;
  font-size: 14px;
  line-height: 18px;
  letter-spacing: 0.2px;
  text-transform: capitalize;
  color: $color-blue-secondary;
}

.c-order__infoOrderNumber {
  margin-bottom: 7px;
  font-size: 14px;
  font-weight: 400;
  line-height: 16px;
  color: $color-blue-secondary;
}


.c-order__infoTrackingNumber {
  display: block;
  margin-bottom: 9px;
  font-size: 13px;
  font-weight: 400;
  line-height: 16px;
}


.c-order__lineItem {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: $color-white;

  &:last-of-type {
    padding-bottom: 0;
    margin-bottom: 0;
    border-bottom: none;
  }

  @include bp(tablet) {
    flex-direction: row;
    padding-bottom: 0;
    margin-bottom: 0;
    border: none;
  }
}

.c-order__imageWrap {
  width: 48px;
  min-width: 48px;
  margin-right: 9px;
}

.c-order__image {
  display: block;
  width: 100%;
  max-width: 100px;
}

.c-order__topItemWrap {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  width: 100%;
  padding: 12px 0;
  border-bottom: 1px solid $color-blue-light-border;
}

.c-order__lineItemContentBox {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-direction: row;
  width: 100%;
}

.c-order__lineItemTitleBox {
  @include bp(tablet) {
    max-width: 50%;
  }
}

.c-order__lineItemTitle {
  display: block;
  margin-bottom: 3px;
  font-family: $font-primary-medium;
  font-size: 16px;
  line-height: 21px;
  font-weight: 500;
  color: $color-black;
}

.c-order__lineItemSubtitle {
  display: block;
  font-family: $font-primary-regular;
  font-size: 14px;
  line-height: 18px;
  color: $color-blue-secondary;
}

.c-order__subText{
  font-size: 16px;
  line-height: 18px;
  text-transform: capitalize;
  font-style: normal;
  margin-top: 3px;
  color: $color-blue-secondary;
}

.c-order__subTextQuantity{
  font-size: 14px;
}

.c-order__itemItemPricingBox {
  display: flex;
  align-items: center;
  justify-content: center;

  @include bp(tablet) {
    flex: 1;
    justify-content: space-between;
    max-width: 200px;
  }

  &--desktop {
    display: none;

    @include bp(tablet) {
      display: flex;
    }
  }

  &--mobile {
    display: flex;
    align-self: flex-end;
    justify-content: space-between;
    width: 100%;
    margin-top: 18px;
    margin-right: 0;
    padding: 0 20px;

    @include bp(tablet) {
      display: none;
      width: 210px;
    }
  }

  span {
    font-family: $font-primary-medium;
    font-size: 14px;
    line-height: 18px;
    font-weight: 500;
    color: $color-black;

    &.is-faded {
      font-family: $font-primary-regular;
      color: $color-blue-secondary;
    }
  }
}

.c-order__pricingSection {
  padding: 25px 18px 30px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-end;
}

.c-order__pricing {
  width: 80%;
  max-width: 260px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 13px;

  @include bp(tablet) {
    max-width: 200px;
  }

  span {
    font-size: 14px;
    color: $color-black;

    &:first-child{
      color: $color-blue-secondary;
    }
  }

  &.c-order__pricing--total {
    span {
      margin-top: 12px;
      font-family: $font-primary-medium;

      &:nth-child(2){
        font-weight: bold;
      }
    }
  }
}

.c-order__headline-price{
  color: $color-blue-secondary;
  margin-left: 12px;
}

.c-order__header,
.c-order__headerDate{
  font-weight: 500;
}

.c-order__headerDate{
  color: $color-blue-secondary;
}

.c-order__priceContain{
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  height: 100%;
}

.c-order__openEditQuantity{
  cursor: pointer;
  font-size: 12px;
  line-height: 16px;
}

.c-order__main{
  padding: 0 16px;
  @media (min-width: 420px){
    padding: 0;
  }
}
</style>
