<template>
  <div v-if="activeSubscription && atc" class="c-order__main">
    <portal to="header">
      <the-header :middle-html="currentOpenOrderActive" mode="backwardRoute" />
    </portal>

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
              <h2 class="c-order__lineItemTitle">{{ item.title }}</h2>

              <span class="c-order__lineItemSubtitle">{{
                productOptionDetails(item)
              }}</span>

              <span class="c-order__subText c-order__subTextQuantity is-faded"
                >{{ atc['labels.quantityShort'] || 'QTY' }}:
                {{ item.quantity }}</span
              >
            </div>

            <div class="c-order__priceContain">
              <span class="c-order__subText u-font-bold"
                >{{ currencySymbol
                }}{{ (item.price * item.quantity).toFixed(2) }}</span
              >

              <span
                v-if="!isCancelledSubscriptionRoute"
                class="c-order__subText u-font-bold c-order__openEditQuantity"
                tabindex="0"
                role="button"
                @click="openModal(item.variant_id)"
              >
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
        <span v-if="editNextOrder"
          >{{ currencySymbol }}
          {{ nextOrder.total_line_items_price.toFixed(2) }}</span
        >
        <span v-else
          >{{ currencySymbol
          }}{{ activeSubscription.total_line_items_price.toFixed(2) }}</span
        >
      </div>

      <div class="c-order__pricing">
        <span>{{ atc['labels.shipping'] || 'Shipping' }}</span>
        <span>{{ currencySymbol }}{{ shippingPrice }}</span>
      </div>

      <div class="c-order__pricing">
        <span>{{ atc['labels.tax'] || 'Tax' }}</span>
        <span v-if="activeSubscription.total_tax && editNextOrder"
          >{{ currencySymbol }} {{ nextOrder.total_tax.toFixed(2) }}</span
        >
        <span v-if="activeSubscription.total_tax && !editNextOrder"
          >{{ currencySymbol
          }}{{ activeSubscription.total_tax.toFixed(2) }}</span
        >
        <span v-if="!activeSubscription.total_tax">--</span>
      </div>

      <div class="c-order__pricing">
        <span>{{ atc['portal.discountCode'] || 'Discount Code' }}</span>
        <span v-if="shopifyDiscount">
          {{ shopifyDiscountCode }} ({{ shopifyDiscountAmountDisplay }})</span
        >
        <span v-else>--</span>
      </div>

      <div class="c-order__pricing c-order__pricing--total">
        <span>{{ atc['labels.total'] || 'Total' }}</span>
        <span v-if="editNextOrder">
          {{ currencySymbol }}{{ nextOrder.total_price.toFixed(2) }}
        </span>
        <span v-else
          >{{ currencySymbol
          }}{{ activeSubscription.total_price.toFixed(2) }}</span
        >
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
  components: {
    ModalProduct,
    TheHeader,
    ModalSubscription,
  },

  props: {
    isEditMode: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
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
      const { order: { discount_applications } = {} } = this
      return discount_applications && discount_applications.length
        ? discount_applications[0]
        : false
    },

    currentOpenOrderActive() {
      if (this.isCancelledSubscriptionRoute) {
        return `<span class='c-order__header'>${
          this.prettyDate
        }</span> <span class='c-order__headerDate'>${
          this.currencySymbol
        }${this.activeSubscription.total_price.toFixed(2)}</span>`
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
      const { activeSubscription, isOriginalCharge } = this
      if (isOriginalCharge) {
        return 'Paid'
      }
      return activeSubscription.fulfillment_status
        ? activeSubscription.fulfillment_status
        : activeSubscription.financial_status
    },

    orderLineItems() {
      const { activeSubscription, isOriginalCharge } = this
      if (activeSubscription && this.editNextOrder) {
        return activeSubscription.next.items
      } else if (isOriginalCharge) {
        return activeSubscription.items
      } else {
        return activeSubscription && activeSubscription.line_items
          ? activeSubscription.line_items
          : activeSubscription.items
      }
    },

    shippingPrice() {
      const { activeSubscription, isOriginalCharge } = this
      if (this.editNextOrder) {
        return this.nextOrder.shipping_lines[0].price || 0
      }
      if (isOriginalCharge) {
        return activeSubscription.shipping_lines[0].price
      } else {
        return activeSubscription.total_shipping_price_set
          ? activeSubscription.total_shipping_price_set.shop_money.amount
          : 0
      }
    },

    prettyDate() {
      const { activeSubscription, isOriginalCharge } = this
      const date = isOriginalCharge
        ? moment(activeSubscription.created_at, 'YYYYMMDD').format(
            'MMM D, YYYY'
          )
        : moment(activeSubscription.processed_at).format('MMM D, YYYY')
      return date
    },

    // determin if coming from subscriptions array or shopify order array
    isOriginalCharge() {
      return !!this.activeSubscription.shopify_order_id
    },

    nextShipDate() {
      const { activeSubscriptionNextDate } = this
      if (!activeSubscriptionNextDate) return false
      return moment(activeSubscriptionNextDate, 'YYYYMMDD').format('MM-DD')
    },

    isCancelledSubscriptionRoute() {
      return this.$route.query.route === 'cancelledSubscriptions'
    },
    editNextOrder() {
      return this.$route.query.editNextOrder
    },

    nextOrder() {
      return this.activeSubscription.next
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
        if (item.properties.length) {
          item.properties.forEach((property) => {
            propertyHash[property.name] = property.value
          })
        } else {
          propertyHash = item.properties
        }
      }
      // if the product is not available in subscripition items that means it is a case of one time product
      // DO NOT TRUST properties['Subscription']
      // check if products id exist in subscription.items
      // no auto renew text
      const subscriptionItemProducts = this.activeSubscription.items.map(
        (item) => item.id
      )
      if (!subscriptionItemProducts.includes(item.id)) {
        return ''
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

    openModal(productVariantId) {
      this.setProductIdAndSubscriptionId({
        productVariantId,
        nextOrder: this.editNextOrder,
      })
      this.isProductModalOpen = true
      this.closeAnimation = false
    },

    openAddToSubscriptionModal(payload) {
      this.isOpeningProductSubscription = true
      this.closeAnimation = false

      if (payload && payload.title === 'swap') {
        this.isSwapSubscription = true
        this.setSwapProduct(payload.product)
      } else {
        this.isSwapSubscription = false
      }
    },

    closeModal() {
      this.closeAnimation = true
      setTimeout(() => {
        this.isProductModalOpen = false
        this.isOpeningProductSubscription = false
      }, 500)
    },
  },
}
</script>

<style lang="scss">
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
  color: $color-blue-secondary;
  text-transform: capitalize;
  letter-spacing: 0.2px;
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
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
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
  font-weight: 500;
  line-height: 21px;
  color: $color-black;
}

.c-order__lineItemSubtitle {
  display: block;
  font-family: $font-primary-regular;
  font-size: 14px;
  line-height: 18px;
  color: $color-blue-secondary;
}

.c-order__subText {
  margin-top: 3px;
  font-size: 16px;
  font-style: normal;
  line-height: 18px;
  color: $color-blue-secondary;
  text-transform: capitalize;
}

.c-order__subTextQuantity {
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
    padding: 0 20px;
    margin-top: 18px;
    margin-right: 0;

    @include bp(tablet) {
      display: none;
      width: 210px;
    }
  }

  span {
    font-family: $font-primary-medium;
    font-size: 14px;
    font-weight: 500;
    line-height: 18px;
    color: $color-black;

    &.is-faded {
      font-family: $font-primary-regular;
      color: $color-blue-secondary;
    }
  }
}

.c-order__pricingSection {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 25px 18px 30px;
}

.c-order__pricing {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 80%;
  max-width: 260px;
  margin-bottom: 13px;

  @include bp(tablet) {
    max-width: 200px;
  }

  span {
    font-size: 14px;
    color: $color-black;

    &:first-child {
      color: $color-blue-secondary;
    }
  }

  &.c-order__pricing--total {
    span {
      margin-top: 12px;
      font-family: $font-primary-medium;

      &:nth-child(2) {
        font-weight: bold;
      }
    }
  }
}

.c-order__headline-price {
  margin-left: 12px;
  color: $color-blue-secondary;
}

.c-order__header,
.c-order__headerDate {
  font-weight: 500;
}

.c-order__headerDate {
  color: $color-blue-secondary;
}

.c-order__priceContain {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  height: 100%;
}

.c-order__openEditQuantity {
  font-size: 12px;
  line-height: 16px;
  cursor: pointer;
}
</style>
