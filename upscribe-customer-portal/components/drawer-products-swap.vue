<script>
import { mapMutations, mapState, mapGetters } from 'vuex'
import DrawerProductBlock from '@components/drawer-product-block.vue'
import VButton from '@components/v-button.vue'

export default {
  components: {
    DrawerProductBlock,
    VButton,
  },
  computed: {
    ...mapState('translations', ['atc']),

    ...mapGetters('activeSubscription', ['activeSubscription']),

    ...mapState('swapProduct', ['swapProduct']),

    ...mapState('products', ['products']),

    ...mapGetters('products', ['hashedCollections']),

    activeSubscriptionProducts() {
      return this.activeSubscription.items
    },

    featuredCollectionProducts() {
      if (this.hashedCollections && this.hashedCollections.all) {
        // this array may have repeat products
        const productsList = this.hashedCollections.all.reduce(
          (finalArr, collection) => {
            return (finalArr = [...finalArr, ...collection.items])
          },
          []
        )

        const uniqueProducts = []
        productsList.forEach((product) => {
          if (!uniqueProducts.find((item) => item.id === product.id)) {
            uniqueProducts.push(product)
          }
        })
        return uniqueProducts
      }
      return []
    },
  },

  methods: {
    ...mapMutations('swapProduct', ['setSwapProduct']),

    ...mapMutations('variantSelectProduct', ['setVariantSelectProduct']),

    async handleSwapProduct(newProduct) {
      this.setVariantSelectProduct(newProduct)
      this.$emit('setMode', 'variant-select-swap')
    },
  },
}
</script>

<template>
  <div>
    <h2 class="c-drawer__title">{{
      atc['portal.swapProductDrawerTitle'] || 'Swap Product'
    }}</h2>

    <p class="c-drawer__subtitle">{{
      atc['portal.swapProductCurrentProductLabel'] || 'Current Product'
    }}</p>

    <div class="c-drawerDeliveryFrequency__options">
      <drawer-product-block :product="swapProduct" existing-product />
    </div>

    <p class="c-drawer__subtitle">{{
      atc['portal.swapProductSelectNewProductPrompt'] ||
        'Select your New Product'
    }}</p>

    <div class="c-drawerDeliveryFrequency__options">
      <drawer-product-block
        v-for="product in featuredCollectionProducts"
        :key="product.id"
        :product="product"
        swap
        @swapProduct="handleSwapProduct"
      />
    </div>

    <div class="c-drawer__actionButtons">
      <v-button
        class="c-form__submitButton"
        type="submit"
        @onClick="$emit('setMode', 'edit')"
        >{{ atc['buttons.cancel'] || 'Cancel' }}</v-button
      >
    </div>
  </div>
</template>
