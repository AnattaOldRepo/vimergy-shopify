<template>
  <div v-if="order && windowWidth >= 768" class="c-historyOrder">
    <div
      class="c-historyOrder__head"
      :class="{ 'is-open': orderOpen }"
      @click="toggleOrder"
    >
      <span class="c-historyOrder__title"
        >{{ prettyDate }}
        <span class="c-historyOrder__headline-price"
          >{{ currencySymbol }}{{ order.total_price.toFixed(2) }}</span
        ></span
      >

      <icon-chevron-right class="c-historyOrder__icon" />
    </div>

    <div v-if="orderOpen && atc" class="c-historyOrder__main">
      <div class="c-historyOrder__info">
        <span class="c-historyOrder__infoStatus"
          >{{ atc['labels.orderStatus'] || 'Order Status' }}:
          {{ orderStatus }}</span
        >
        <span class="c-historyOrder__infoOrderNumber"
          >{{ atc['labels.order'] || 'Order' }} #:
          {{ order.id || order.shopify_order_id }}</span
        >

        <!-- <div v-if="shopifyDiscount" class="c-historyOrder__infoDiscount">
          <span
            >{{ atc['portal.discountCode'] || 'Discount Code' }}:
            {{ shopifyDiscountCode }} ({{ shopifyDiscountAmountDisplay }})</span
          >
        </div> -->
      </div>

      <div class="c-historyOrder__lineItems">
        <div
          v-for="(item, index) in orderLineItems"
          :key="index"
          class="c-historyOrder__lineItem"
        >
          <div class="c-historyOrder__topItemWrap">
            <div v-if="productImage(item)" class="c-historyOrder__imageWrap">
              <!-- v-if="productImages" -->
              <!-- <img class="c-historyOrder__image" :src="productImages[item.shopify_product_id]"/> -->
              <img
                class="c-historyOrder__image"
                :src="productImage(item)"
                onerror="this.style.display='none'"
              />
            </div>

            <div class="c-historyOrder__lineItemContentBox">
              <div class="c-historyOrder__lineItemTitleBox">
                <h2 class="c-historyOrder__lineItemTitle">{{ item.title }}</h2>
                <span class="c-historyOrder__lineItemSubtitle">{{
                  productOptionDetails(item)
                }}</span>
              </div>

              <div
                class="c-historyOrder__itemItemPricingBox c-historyOrder__itemItemPricingBox--desktop"
              >
                <span class="is-faded"
                  >{{ atc['labels.quantityShort'] || 'QTY' }}:
                  {{ item.quantity }}</span
                >
                <span class="is-faded" v-if="item.quantity > 1"
                  >{{ currencySymbol }}{{ item.price }}</span
                >

                <span class="u-font-bold"
                  >{{ currencySymbol
                  }}{{ (item.price * item.quantity).toFixed(2) }}</span
                >
              </div>
            </div>
          </div>

          <div
            class="c-historyOrder__itemItemPricingBox c-historyOrder__itemItemPricingBox--mobile"
          >
            <span class="is-faded"
              >{{ atc['labels.quantityShort'] || 'QTY' }}:
              {{ item.quantity }}</span
            >
            <span class="is-faded" v-if="item.quantity > 1"
              >{{ currencySymbol }}{{ item.price }}</span
            >
            <span class="u-font-bold"
              >{{ currencySymbol
              }}{{ (item.price * item.quantity).toFixed(2) }}</span
            >
          </div>
        </div>
      </div>

      <div class="c-historyOrder__pricingSection u-font-bold">
        <div class="c-historyOrder__pricing">
          <span>{{ atc['labels.subtotal'] || 'Subtotal' }}</span>
          <span
            >{{ currencySymbol
            }}{{ order.total_line_items_price.toFixed(2) }}</span
          >
        </div>

        <div class="c-historyOrder__pricing">
          <span>{{ atc['labels.shipping'] || 'Shipping' }}</span>
          <span>{{ currencySymbol }}{{ shippingPrice }}</span>
        </div>

        <div class="c-historyOrder__pricing">
          <span>{{ atc['labels.tax'] || 'Tax' }}</span>
          <span v-if="order.total_tax"
            >{{ currencySymbol }}{{ order.total_tax.toFixed(2) }}</span
          >
          <span v-else>--</span>
        </div>

        <div class="c-historyOrder__pricing c-historyOrder__pricing--total">
          <span>{{ atc['labels.total'] || 'Total' }}</span>
          <span>{{ currencySymbol }}{{ order.total_price.toFixed(2) }}</span>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="c-historyOrder">
    <nuxt-link
      class="c-historyOrder__head c-historyOrder__head--link"
      :to="{
        query: {
          template: 'order',
          orderId: order.id,
          storeDomain,
          customerId,
        },
      }"
      @click="setOrderForMobileLayout"
    >
      <span class="c-historyOrder__title"
        >{{ prettyDate }}
        <span class="c-historyOrder__headline-price"
          >{{ currencySymbol }}{{ order.total_price.toFixed(2) }}</span
        ></span
      >

      <icon-chevron-right
        class="c-historyOrder__icon c-historyOrder__icon--right"
      />
    </nuxt-link>
  </div>
</template>

<script>
import moment from 'moment'
import { windowSizes } from '@mixins/windowSizes'
import IconChevronRight from '@components/icon-chevron-right.vue'
import { mapState, mapMutations } from 'vuex'

export default {
  components: {
    IconChevronRight,
  },
  mixins: [windowSizes],
  props: {
    order: {
      type: Object,
      required: true,
    },
  },

  data: function() {
    return {
      orderOpen: false,
    }
  },

  computed: {
    ...mapState('translations', ['atc', 'activeLanguageCode']),

    ...mapState('shop', ['currencySymbol']),

    ...mapState('route', ['storeDomain', 'customerId']),

    ...mapState('products', ['productImages']),

    shopifyDiscount() {
      const { order: { discount_applications } = {} } = this
      return discount_applications && discount_applications.length
        ? discount_applications[0]
        : false
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
      const { order, isOriginalCharge } = this
      let fullFillmentText = order.fulfillment_status
        ? order.fulfillment_status
        : order.financial_status
      if (isOriginalCharge) {
        return 'Paid'
      }

      if (fullFillmentText && fullFillmentText.includes('_')) {
        fullFillmentText = fullFillmentText.split('_').join(' ')
      }

      return fullFillmentText
    },

    orderLineItems() {
      const { order, isOriginalCharge } = this
      if (isOriginalCharge) {
        return order.items
      } else {
        return order.line_items
      }
    },

    shippingPrice() {
      const { order, isOriginalCharge } = this
      if (isOriginalCharge) {
        return order.shipping_lines[0].price
      } else {
        return order.total_shipping_price_set
          ? order.total_shipping_price_set.shop_money.amount
          : 0
      }
    },

    prettyDate() {
      const { order, isOriginalCharge } = this
      const date = isOriginalCharge
        ? moment(order.created_at, 'YYYYMMDD').format('MMM D, YYYY')
        : moment(order.processed_at).format('MMM D, YYYY')
      return date
    },

    // determin if coming from subscriptions array or shopify order array
    isOriginalCharge() {
      return !!this.order.shopify_order_id
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
    ...mapMutations('orders', ['setCurrentOrderForMobile']),

    setOrderForMobileLayout() {
      this.setCurrentOrderForMobile(this.order)
    },

    toggleOrder() {
      this.orderOpen = !this.orderOpen
    },

    productOptionDetails(item) {
      const { isOriginalCharge, atc } = this
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
      let detail = `${atc['labels.autoRenew'] || 'Auto Renew'} x${
        item.quantity
      }`
      if (discountAmount) {
        detail += ` (${discountAmount} ${atc['labels.off'] || 'OFF'})`
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
  },
}
</script>

<style lang="scss">
@import '@design';

.c-historyOrder {
  width: 100%;
  color: $color-black;
  background-color: $color-white;
  border: 1px solid $color-blue-light-border;

  @include bp(tablet) {
    border-radius: 5px;
    margin-bottom: 20px;
  }
}

.c-historyOrder__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 17px 24px;
  cursor: pointer;

  &--link {
    text-decoration: none;
  }
}

.c-historyOrder__title {
  font-family: $font-primary-regular;
  font-size: 16px;
  color: $color-black;
}

.c-historyOrder__icon {
  width: 9px;
  height: 23px;
  transform: rotate(90deg);
  fill: $color-blue-secondary;

  .is-open & {
    transform: rotate(270deg);
  }

  &--right {
    transform: none;
  }
}

.c-historyOrder {
}

.c-historyOrder__info {
  padding: 21px 24px;
  border-top: 1px solid $color-blue-light-border;
  border-bottom: 1px solid $color-blue-light-border;
}

.c-historyOrder__infoStatus {
  display: block;
  margin-bottom: 13px;
  font-family: $font-primary-medium;
  font-size: 20px;
  line-height: 26px;
  font-weight: bold;
  text-transform: capitalize;
}

.c-historyOrder__infoOrderNumber {
  display: block;
  margin-bottom: 7px;
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  color: $color-blue-secondary;
}

.c-historyOrder__infoDiscount {
  display: block;
  margin-bottom: 7px;
  font-size: 13px;
  font-weight: 400;
  line-height: 16px;
}

.c-historyOrder__infoTrackingNumber {
  display: block;
  margin-bottom: 9px;
  font-size: 13px;
  font-weight: 400;
  line-height: 16px;
}

.c-historyOrder__lineItem {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  margin-bottom: 20px;
  border-bottom: 1px solid $color-border;
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

.c-historyOrder__imageWrap {
  width: 48px;
  min-width: 48px;
  margin-right: 9px;
}

.c-historyOrder__image {
  display: block;
  width: 100%;
  max-width: 100px;
}

.c-historyOrder__topItemWrap {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  width: 100%;
  padding: 12px 0;
  border-bottom: 1px solid $color-blue-light-border;
}

.c-historyOrder__lineItemContentBox {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
  width: 100%;
}

.c-historyOrder__lineItemTitleBox {
  @include bp(tablet) {
    max-width: 50%;
  }
}

.c-historyOrder__lineItemTitle {
  display: block;
  margin-bottom: 3px;
  font-family: $font-primary-medium;
  font-size: 16px;
  line-height: 21px;
  font-weight: 500;
  color: $color-black;
}

.c-historyOrder__lineItemSubtitle {
  display: block;
  font-family: $font-primary-regular;
  font-size: 14px;
  line-height: 18px;
  color: $color-blue-secondary;
}

.c-historyOrder__itemItemPricingBox {
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

.c-historyOrder__pricingSection {
  padding: 25px 18px 30px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-start;
}

.c-historyOrder__pricing {
  width: 100%;
  max-width: 100%;
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

    &:first-child {
      color: $color-blue-secondary;
    }
  }

  &.c-historyOrder__pricing--total {
    span {
      margin-top: 12px;
      font-family: $font-primary-medium;
      font-weight: 500;
      color: $color-black;

      &:nth-child(2) {
        font-weight: bold;
      }
    }
  }
}

.c-historyOrder__headline-price {
  color: $color-blue-secondary;
  margin-left: 12px;
}
</style>
