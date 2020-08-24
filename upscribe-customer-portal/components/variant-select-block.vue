<script>
/* eslint-disable eqeqeq */

import { mapState } from 'vuex'
import VButton from '@components/v-button.vue'

import ProductVariantSelector from '@components/product-variant-selector.vue'

export default {
  components: {
    VButton,
    ProductVariantSelector,
  },
  props: {
    product: {
      type: Object,
      required: true,
    },
    buttonText: {
      type: String,
      default: 'Add to Subscription',
    },
    variantAction: {
      type: String,
      default: 'addToSubscription',
    },
    updating: {
      type: Boolean,
      default: false,
    },
  },

  data: () => {
    return {
      selectedVariantId: null,
      unavailable: false,
      activeOption1: false,
      activeOption2: false,
      activeOption3: false,
    }
  },

  computed: {
    ...mapState('translations', ['atc']),

    ...mapState('products', ['productImages']),

    ...mapState('shop', ['currencySymbol', 'nextOrderProductsSubscriptionPricing']),

    ...mapState('editMode', ['editNextOrder']),

    productBuiltProperties() {
      const { product } = this
      let finalProps = {}
      if (product.metafields) {
        product.metafields.forEach(metafield => {
          if (metafield.namespace === 'sf_upscribe' ) {
            finalProps[metafield.key] = metafield.value
          }
        })
      }
      return finalProps
    },

    allApplicableVariants() {
      // we don't care if the variants are applicable or not if it's a onetime add
      if (this.editNextOrder) return true

      if (!this.productBuiltProperties.applicable_variants) {
        return true
      } else {
        return false
      }
    },

    applicableVariantsArray() {
      const { productBuiltProperties } = this
      if (productBuiltProperties && productBuiltProperties.applicable_variants) {
        return productBuiltProperties.applicable_variants.split(',')
      } else {
        return []
      }
    },

    subscriptionDiscountAmount() {
      const { product, productBuiltProperties, nextOrderProductsSubscriptionPricing, editNextOrder } = this

      if (!nextOrderProductsSubscriptionPricing && editNextOrder) return false

      const productProperties = product.properties || productBuiltProperties

      if (!product || !productProperties || (!productProperties['discount_amount'] && !productProperties['discount_amount'])) return false

      return productProperties['Discount Amount'] || productProperties['discount_amount']
    },

    subscriptionDiscountType() {
      const { subscriptionDiscountAmount } = this
      if (!subscriptionDiscountAmount) return false
      return subscriptionDiscountAmount.indexOf('%') > -1 ? 'percent' : 'fixed'
    },

    productImage() {
      const { productImages, product } = this
      if (!productImages || !product) return false

      if (product.image) return product.image

      const productId = parseInt(product.product_id)

      if (productImages[productId]) {
        return productImages[productId]
      } else {
        return false
      }
    },

    variantImage() {
      const { selectedVariant } = this
      if (!selectedVariant.image_id) return this.productImage

      const { images } = this.product
      return images.filter((image) => {
        return selectedVariant.image_id === image.id
      })[0]
    },

    variantsObj() {
      const { variants } = this.product
      const { applicableVariantsArray, allApplicableVariants } = this
      let variantsObj = {}
      variants.forEach((variant) => {
        if (allApplicableVariants) {
          variantsObj[variant.id] = variant
        }

        // check against applicable variants array
        else {
          if (applicableVariantsArray.includes(variant.id.toString())) {
            variantsObj[variant.id] = variant
          }
        }
      })
      return variantsObj
    },

    selectedVariant() {
      const { variantsObj, selectedVariantId, unavailable, activeOption1, activeOption2, activeOption3 } = this
      if (unavailable) {
        // face variant to show unavailable
        return {
          title: 'Unavailable',
          price: '',
          option1: activeOption1,
          option2: activeOption2,
          option3: activeOption3,
        }

      } else {
        return variantsObj[selectedVariantId]
      }
    },

    variantPrice() {
      const { selectedVariant } = this
      return selectedVariant.price
    },

    variantSubscriptionPrice() {
      const { variantPrice, subscriptionDiscountAmount, subscriptionDiscountType } = this
      if (!variantPrice || !subscriptionDiscountAmount ||  !subscriptionDiscountType) return false

      const discountAmount = this.subscriptionDiscountAmount.replace(/\D/g,'')

      let calcDiscountAmount = 0

      if (subscriptionDiscountType === 'percent') { // percentage
          calcDiscountAmount = (variantPrice * discountAmount) / 100

      } else if (subscriptionDiscountType === 'fixed') { // fixed
          calcDiscountAmount = discountAmount

      } else {
          console.log('discount_amount should include % for "percentage" not for "fixed"')
      }
      return (variantPrice - calcDiscountAmount).toFixed(2)
    },

    selectedVariantPrice() {
      const { variantSubscriptionPrice, variantPrice } = this
      return variantSubscriptionPrice || variantPrice
    },

    inStock() {
      const { selectedVariant, unavailable } = this
      if (unavailable) {
        return false
      }

      return (
        selectedVariant.inventory_policy === 'continue' ||
        selectedVariant.inventory_quantity > 0 ||
        !selectedVariant.inventory_management
      )
    },
  },

  watch: {
    selectedVariant(val) {
      if (val.option1) this.activeOption1 = val.option1
      if (val.option2) this.activeOption2 = val.option2
      if (val.option3) this.activeOption3 = val.option3
    },
  },


  mounted() {
    const { variantsObj } = this

    if (!this.isEmptyObject(variantsObj)) {
      this.selectedVariantId = variantsObj[Object.keys(variantsObj)[0]].id
    }
  },

  methods: {
    variantButtonAction() {
      const { variantAction } = this

      if (variantAction === 'swap') {
        this.$emit('swapProductVariant', {variantId: this.selectedVariantId, product: this.product})
      } else {
        this.$emit('addProductVariantToSubscription', this.selectedVariantId, this.product)
      }
    },

    // update selected variant by new selection
    handleSelectOption({ value, position }) {
      if (this.updating) return

      const { selectedVariant, variantsObj } = this

      // set for if unavailable to display
      this[`activeOption${position}`] = value

      // keep same options as current selected variant
      const checkOptions = {
        option1: selectedVariant.option1,
        option2: selectedVariant.option2,
        option3: selectedVariant.option3,
      }

      // replace the option check with the one selected in variant select option
      checkOptions[`option${position}`] = value

      let matchingVariants = []

      Object.keys(variantsObj).forEach((key) => {
        let variant = variantsObj[key]

        let match1 = true
        let match2 = true
        let match3 = true

        if (variant.option1) {
          // console.log({ 'var1':variant.option1 , 'new1':checkOptions.option1})
          if (variant.option1 != checkOptions.option1) {
            match1 = false
          }
        }

        if (variant.option2) {
          // console.log({ 'var2':variant.option2 , 'new2':checkOptions.option2})

          if (variant.option2 != checkOptions.option2) {
            match2 = false
          }
        }

        if (variant.option3) {
          // console.log({ 'var3':variant.option3 , 'new3':checkOptions.option3})

          if (variant.option3 != checkOptions.option3) {
            match3 = false
          }
        }

        // console.log({match1, match2, match3})

        if (match1 && match2 && match3) {
          matchingVariants.push(variant)
        }
      })

      if (matchingVariants[0]) {
        this.selectedVariantId = matchingVariants[0].id
        this.unavailable = false
      } else {
        this.unavailable = true
      }
    },
  },
}
</script>

<template>
  <div
    v-if="product && variantsObj && selectedVariant"
    class="c-variantSelectBlock"
  >
    <div v-if="productImage" class="c-variantSelectBlock__imageWrap">
      <img
        class="c-variantSelectBlock__image"
        :src="variantImage.src ? variantImage.src : ''"
        :alt="variantImage.alt ? variantImage.alt : product.title"
      />
    </div>

    <div class="c-variantSelectBlock__infoBlock">
      <h3 v-if="product.title" class="c-variantSelectBlock__title">{{
        product.title
      }}</h3>

        <span v-if="subscriptionDiscountAmount" class="c-variantSelectBlock__discountInfo">{{ atc['labels.autoRenew'] || 'Auto Renew' }} ({{ subscriptionDiscountAmount }})</span
        >

      <span v-if="selectedVariant && selectedVariantPrice" class="c-variantSelectBlock__price"
        >{{ currencySymbol }}{{ selectedVariantPrice }}</span
      >

      <span v-else class="c-variantSelectBlock__price"
        >{{ atc['labels.unavailable'] || 'Unavailable' }}</span>

      <div
        v-if="product && (product.options > 1 || (product.variants && product.variants.length > 1))"
        class="c-variantSelectBlock__optionSelectors"
      >
        <product-variant-selector
          :product="product"
          :variants-obj="variantsObj"
          :selected-variant="selectedVariant"
          :updating="updating"
          @selectOption="handleSelectOption"
        />
      </div>
    </div>

    <v-button
      v-if="inStock"
      class="c-variantSelectBlock__button c-variantSelectBlock__button--add"
      size="small"
      :text="buttonText"
      @onClick="variantButtonAction"
    />

    <v-button
      v-else
      class="c-variantSelectBlock__button c-variantSelectBlock__button--add"
      size="small"
      :text="atc['labels.soldOut'] || 'Sold Out'"
      disabled
    />

    <div class="c-variantSelectBlock__bottom">
      <div class="c-variantSelectBlock__buttonsWrap"> </div>
    </div>
  </div>
</template>

<style lang="scss">
@import '@design';

.c-variantSelectBlock {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 16px 16px 20px;
  margin-bottom: 22px;
  text-align: center;
  background-color: $color-white;

  &:last-of-type {
    margin-bottom: 0;
  }
}

.c-variantSelectBlock__top {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
  margin-bottom: 17px;
}

.c-variantSelectBlock__imageWrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 200px;
  height: 100%;
  margin-bottom: 16px;
}

.c-variantSelectBlock__image {
  display: block;
  width: 100%;
}

.c-variantSelectBlock__infoBlock {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  text-align: center;
}

.c-variantSelectBlock__title {
  margin-bottom: 10px;
  font-family: $font-primary-medium;
  font-size: 18px;
  font-weight: 500;
  line-height: 18px;
  color: $color-black;
}

.c-variantSelectBlock__discountInfo {
  display: block;
  min-height: 28px;
  font-family: $font-primary-regular;
  font-size: 11px;
  line-height: 16px;
  color: $color-text-light;
}

.c-variantSelectBlock__price {
  margin-bottom: 20px;
  font-family: $font-primary-regular;
  font-size: 16px;
  color: $color-black;
}

.c-variantSelectBlock__optionSelectors {
  display: flex;
  width: 100%;
  margin-bottom: 20px;
}

.c-variantSelectBlock__buttonsWrap {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.c-variantSelectBlock__button {
  width: auto;
  min-width: 94px;
  padding: 9px 0;
  margin-right: 10px;

  &--add {
    padding: 9px 20px;
  }

  &:last-of-type {
    margin-right: 0;
  }
}

.c-variantSelectBlock__quantity {
  max-width: 86px;
  margin-left: 20px;
}
</style>
