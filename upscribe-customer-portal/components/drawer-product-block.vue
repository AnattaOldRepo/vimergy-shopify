<script>
import { mapState, mapGetters } from 'vuex'
import VButton from '@components/v-button.vue'
// import QuantityChanger from '@components/quantity-changer.vue'
import QuantityChangerManualEntry from '@components/quantity-changer-manual-entry.vue'

export default {
  components: {
    VButton,
    // QuantityChanger,
    QuantityChangerManualEntry,
  },
  props: {
    product: {
      type: Object,
      required: true,
    },
    swap: {
      type: Boolean,
      default: false,
    },
    remove: {
      type: Boolean,
      default: false,
    },
    add: {
      type: Boolean,
      default: false,
    },
    quantity: {
      type: Boolean,
      required: false,
    },
    existingProduct: {
      type: Boolean,
      default: false,
    },
    updating: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapState('translations', ['atc']),

    ...mapState('products', ['productImages', 'products']),

    ...mapState('shop', [
      'currencySymbol',
      'nextOrderProductsSubscriptionPricing',
    ]),

    ...mapState('editMode', ['editNextOrder']),

    ...mapGetters('activeSubscription', ['activeSubscription']),

    productBuiltProperties() {
      const { product } = this
      let finalProps = {}
      if (product.metafields) {
        product.metafields.forEach((metafield) => {
          if (metafield.namespace === 'sf_upscribe') {
            finalProps[metafield.key] = metafield.value
          }
        })
      }
      return finalProps
    },

    oneTimeProduct() {
      const idArray = this.activeSubscription.items.map((item) => item.id)
      return !idArray.includes(this.product.id)
    },

    subscriptionDiscountAmount() {
      const { product, productBuiltProperties } = this
      if (!product && !productBuiltProperties) return false

      const productProperties = product.properties || productBuiltProperties

      if (
        !productProperties['Discount Amount'] &&
        !productProperties['discount_amount']
      )
        return false

      return (
        productProperties['Discount Amount'] ||
        productProperties['discount_amount']
      )
    },

    // if the product is not available in subscripition items that means it is a case of one time product
    // DO NOT TRUST properties['Subscription']
    // check if products id exist in subscription.items
    isSubscriptionProduct() {
      const subscriptionItemProducts = this.activeSubscription.items.map(
        (item) => item.id
      )
      if (subscriptionItemProducts.includes(this.product.id)) {
        return true
      }
      return false
    },

    productOptionDetails() {
      const { product, isSubscriptionProduct, atc } = this
      if (!product.properties) return false

      let discountAmount = product.properties['Discount Amount']
        ? product.properties['Discount Amount']
        : false

      let detail

      if (isSubscriptionProduct) {
        if (parseInt(discountAmount)) {
          detail = `${atc['labels.autoRenew'] || 'Auto Renew'} x${
            product.quantity
          } (-${discountAmount} off)`
        } else {
          detail = `${atc['labels.autoRenew'] || 'Auto Renew'} x${
            product.quantity
          }`
        }
      } else {
        detail = `x${product.quantity}`
      }

      return detail
    },

    subscribeAndSaveText() {
      const discount = this.product.properties['Discount Amount']
      if (discount) {
        if (this.atc['button.subscribeAndSave']) {
          return this.atc['button.subscribeAndSave'].replace('{X}', discount)
        }
        return `Subscribe and save ${discount}`
      }
      return 'Subscribe'
    },

    subscriptionDiscountType() {
      const { subscriptionDiscountAmount } = this
      if (!subscriptionDiscountAmount) return false
      return subscriptionDiscountAmount.indexOf('%') > -1 ? 'percent' : 'fixed'
    },

    productImage() {
      const { productImages, product } = this
      if (!productImages && !product.image_url && !product.image) return false

      const { variant_id } = product

      if (variant_id && productImages) {
        return productImages[variant_id] || product.image_url
      } else {
        return product.image && product.image.src ? product.image.src : false
      }
    },

    productFirstVariantPrice() {
      const { product } = this
      if (
        !product ||
        !product.variants ||
        !product.variants[0] ||
        !product.variants[0].price
      )
        return false
      return product.variants[0].price
    },

    productFirstVariantSubscriptionPrice() {
      const {
        productFirstVariantPrice,
        subscriptionDiscountAmount,
        subscriptionDiscountType,
      } = this
      if (
        !productFirstVariantPrice ||
        !subscriptionDiscountAmount ||
        !subscriptionDiscountType
      )
        return false

      const discountAmount = this.subscriptionDiscountAmount.replace(
        /[^0-9.]/g,
        ''
      )

      let calcDiscountAmount = 0

      if (subscriptionDiscountType === 'percent') {
        // percentage
        calcDiscountAmount = (productFirstVariantPrice * discountAmount) / 100
      } else if (subscriptionDiscountType === 'fixed') {
        // fixed
        calcDiscountAmount = discountAmount
      } else {
        console.error(
          'discount_amount should include % for "percentage" or not for "fixed"'
        )
      }
      return (productFirstVariantPrice - calcDiscountAmount).toFixed(2)
    },
  },
  methods: {
    quantityChangeManual(quantity) {
      const { product } = this

      this.$emit('quantityChangeManual', {
        quantity: quantity,
        id: product.id,
        product,
      })
    },

    quantityChange(type) {
      const { product } = this
      const quantity = product.quantity

      if (type === 'decrease') {
        if (quantity === 1) return this.$emit('removeProduct', product)

        this.$emit('quantityChange', {
          type: 'decrease',
          quantity: quantity - 1,
          id: product.id,
          variant_id: product.variant_id,
        })
      } else if (type === 'increase') {
        this.$emit('quantityChange', {
          type: 'increase',
          quantity: quantity + 1,
          id: product.id,
          variant_id: product.variant_id,
        })
      }
    },
  },
}
</script>

<template>
  <div v-if="product" class="c-drawerProductBlock">
    <div class="c-drawerProductBlock__top">
      <div v-if="productImage" class="c-drawerProductBlock__imageWrap">
        <img
          class="c-drawerProductBlock__image"
          :src="productImage"
          :alt="productImage.alt ? productImage.alt : product.title"
          onerror="this.style.display='none'"
        />
      </div>

      <div class="c-drawerProductblock__infoBlock">
        <div class="c-drawerProductblock__infoInner">
          <h3 v-if="product.title" class="c-drawerProductBlock__title">{{
            product.title
          }}</h3>

          <span
            v-if="existingProduct && product.line_price"
            class="c-drawerProductBlock__price"
            >{{ currencySymbol
            }}{{ parseFloat(product.line_price).toFixed(2) }}</span
          >

          <span
            v-if="
              !existingProduct &&
                productFirstVariantSubscriptionPrice &&
                ((editNextOrder && nextOrderProductsSubscriptionPricing) ||
                  !editNextOrder)
            "
            class="c-drawerProductBlock__price"
            >{{ currencySymbol
            }}{{ productFirstVariantSubscriptionPrice }}</span
          >
        </div>

        <span
          v-if="productOptionDetails"
          class="c-drawerProductBlock__discountInfo"
          >{{ productOptionDetails }}</span
        >

        <span
          v-if="product.quantity_discount_title"
          class="c-drawerProductBlock__discountInfo"
          >{{ atc['labels.quantityDiscount'] || 'Quantity Discount' }} (-{{
            product.quantity_discount_title
          }})</span
        >

        <span
          v-if="product.variant_title"
          class="c-drawerProductBlock__detail"
          >{{ product.variant_title }}</span
        >
      </div>
    </div>
    <!-- eslint-disable -->
    <div class="c-drawerProductBlock__bottom">
      <div class="c-drawerProductBlock__buttonsWrap">
        <v-button
          v-if="remove"
          :class="{ 'control-is-updating': updating }"
          class="c-drawerProductBlock__button c-drawerProductBlock__button--remove c-button--alt"
          html='<svg width="14"  height="16" view-box="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 2.5H10.9062L9.84375 0.75C9.59375 0.34375 9.03125 0 8.5625 0H5.40625C4.9375 0 4.375 0.34375 4.125 0.75L3.0625 2.5H0.5C0.21875 2.5 0 2.75 0 3V3.5C0 3.78125 0.21875 4 0.5 4H1L1.65625 14.5938C1.6875 15.375 2.375 16 3.15625 16H10.8125C11.5938 16 12.2812 15.375 12.3125 14.5938L13 4H13.5C13.75 4 14 3.78125 14 3.5V3C14 2.75 13.75 2.5 13.5 2.5ZM5.40625 1.5H8.5625L9.15625 2.5H4.8125L5.40625 1.5ZM10.8125 14.5H3.15625L2.5 4H11.4688L10.8125 14.5Z" fill="#FF7777"/></svg>'
          @click.native="$emit('removeProduct', product)"
        />

        <v-button
          v-if="swap && products.length > 1"
          :class="{ 'control-is-updating': updating }"
          class="c-drawerProductBlock__button c-button--alt bold"
          size="small"
          :text="atc['buttons.swapProduct'] || 'SWAP'"
          @click.native="$emit('swapProduct', product)"
        />

        <v-button
          v-if="add"
          :class="{ 'control-is-updating': updating }"
          class="c-drawerProductBlock__button c-button--alt c-drawerProductBlock__button--add"
          size="small"
          :text="atc['portal.addProductDrawer'] || 'Add & Subscribe'"
          @click.native="$emit('variantSelectProduct', product)"
        />
      </div>

      <quantity-changer-manual-entry
        v-if="quantity"
        :class="{ 'control-is-updating': updating }"
        class="c-modalProductBlock__quantity"
        :quantity="product.quantity"
        @updateQuantity="quantityChangeManual"
      />
    </div>

    <v-button
      v-if="editNextOrder && oneTimeProduct"
      :class="{ 'control-is-updating': updating }"
      class="c-button--alt c-drawerProductBlock__button--add u-mt-4"
      :text="subscribeAndSaveText"
      @click.native="
        $emit('subscribe', {
          product,
          variantId: product.variant_id,
          addToNextOrder: false,
        })
      "
    />
  </div>
</template>

<style lang="scss">
@import '@design';

.c-drawerProductBlock {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 16px 16px 20px;
  margin-bottom: 22px;
  text-align: center;
  background-color: $color-white;
}

.c-drawerProductBlock__top {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
  margin-bottom: 17px;
}

.c-drawerProductBlock__imageWrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 69px;
  height: 100%;
  margin-right: 12px;
}

.c-drawerProductBlock__image {
  display: block;
  width: 100%;
}

.c-drawerProductblock__infoBlock {
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: flex-start;
}

.c-drawerProductblock__infoInner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.c-drawerProductBlock__title {
  margin-bottom: 6px;
  font-family: $font-primary-medium;
  font-size: 16px;
  font-weight: 500;
  line-height: 21px;
  color: $color-black;
  text-align: left;
  max-width: 160px;
}

.c-drawerProductBlock__discountInfo {
  display: block;
  font-family: $font-primary-regular;
  font-size: 14px;
  line-height: 18px;
  color: $color-blue-secondary;
}

.c-drawerProductBlock__detail {
  display: block;
  margin-bottom: 10px;
  font-family: $font-primary-regular;
  font-size: 14px;
  line-height: 18px;
  color: $color-blue-secondary;
}

.c-drawerProductBlock__price {
  font-family: $font-primary-regular;
  font-size: 16px;
  color: $color-black;
  margin-left: 10px;
}

.c-drawerProductBlock__bottom {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.c-drawerProductBlock__buttonsWrap {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.c-drawerProductBlock__button {
  width: auto;
  min-width: 94px;
  padding: 12px 20px;
  margin-right: 10px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  font-weight: bold;
  border-radius: 4px;
  &:last-of-type {
    margin-right: 0;
  }
  &--remove {
    min-width: 40px;
  }
}

.c-drawerProductBlock__quantity {
  max-width: 120px;
  margin-left: 20px;
}

.bold {
  font-weight: bold;
  letter-spacing: 1px;
}
</style>
