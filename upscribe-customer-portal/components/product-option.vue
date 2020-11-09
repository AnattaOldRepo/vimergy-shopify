<script>
import { mapState, mapGetters } from 'vuex'
export default {
  props: {
    product: {
      type: [Object, Boolean],
      required: true,
    },
    showPrice: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapState('products', ['productImages']),

    ...mapState('shop', ['currencySymbol']),

    ...mapState('translations', ['atc']),

    ...mapGetters('activeSubscription', ['activeSubscription']),

    // productImage() {
    //   const { product } = this
    //   if (!product.image_url) return false

    //   return {
    //     src: product.image_url ? product.image_url : false,
    //     alt: product.title,
    //   }
    // },
    productImage() {
      const { productImages, product } = this
      if (
        !productImages &&
        !product.image_url &&
        !product.image &&
        !product.image_url
      )
        return false

      const { variant_id } = product

      if (variant_id && productImages) {
        return productImages && productImages[variant_id]
          ? productImages[variant_id]
          : product.image_url
      } else {
        return product.image && product.image.src
          ? product.image.src
          : product.image_url
      }
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
  },
}
</script>

<template>
  <div class="c-productOption">
    <div v-if="productImage" class="c-productOption__imageWrap">
      <img
        v-if="productImage"
        class="c-productOption__image"
        :src="
          productImage.replace('.jpg', '_96x.jpg').replace('.png', '_96x.png')
        "
        :alt="product.title"
      />
    </div>
    <div class="c-productOption__info">
      <span v-if="product.title" class="c-productOption__title">{{
        product.title
      }}</span>
      <span v-if="productOptionDetails" class="c-productOption__detail">{{
        productOptionDetails
      }}</span>
      <span
        v-if="product.quantity_discount_title"
        class="c-productOption__detail"
      >
        {{ atc['labels.quantityDiscount'] || 'Quantity Discount' }} (-{{
          product.quantity_discount_title
        }})
      </span>

      <span v-if="product.variant_title" class="c-productOption__detail">{{
        product.variant_title
      }}</span>

      <strong
        v-if="
          product.in_stock !== null &&
            product.in_stock !== undefined &&
            !product.in_stock
        "
        class="c-productOption__detail"
      >
        {{
          atc['portal.itemOutOfStock'] || '(Out of stock. Excluded from total)'
        }}
      </strong>

      <span
        v-if="showPrice && product && product.price"
        class="c-productOption__price"
        >{{ currencySymbol }}{{ product.price.toFixed(2) }}</span
      >
    </div>
  </div>
</template>

<style lang="scss">
@import '@design';

.c-productOption {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  margin-bottom: 16px;

  &:last-of-type {
    margin-bottom: 0;
  }
}

.c-productOption__imageWrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  min-width: 48px;
  height: 100%;
  margin-right: 10px;
}
.c-productOption__image {
  display: block;
  width: 100%;
  max-width: 100%;
}

.c-productOption__info {
  color: $color-text-light;
  font-size: 11px;
  flex: 1;
}

.c-productOption__title {
  display: block;
  margin-bottom: 3px;
  font-weight: normal;
  color: $color-black;
}

.c-productOption__detail {
  display: block;
  // white-space: nowrap;
  margin-bottom: 3px;
  color: $color-blue-secondary;
}
</style>
