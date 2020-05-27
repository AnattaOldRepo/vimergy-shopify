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

    ...mapState('products', ['products']),

    activeSubscriptionProducts() {
      return this.activeSubscription.items
    },
  },
  methods: {
    ...mapMutations('variantSelectProduct', ['setVariantSelectProduct']),

    handleVariantSelectProduct(product) {
      this.setVariantSelectProduct(product)
      this.$emit('setMode', 'variant-select')
    },
  },
}
</script>

<template>
  <div>
    <h2 class="c-drawer__title">{{ atc['portal.addProductsDrawerTitle'] || 'Add Products' }}</h2>

    <p
      v-if="activeSubscription.interval && activeSubscription.period"
      class="c-drawer__subtitle"
      >{{ atc['portal.editProductsDrawerInfoText'] || 'These products ship every'}} {{ activeSubscription.interval }}
      {{ activeSubscription.period }}</p
    >

    <div class="c-drawerDeliveryFrequency__options">
      <drawer-product-block
        v-for="product in products"
        :key="product.id"
        :product="product"
        add
        @variantSelectProduct="handleVariantSelectProduct"
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
