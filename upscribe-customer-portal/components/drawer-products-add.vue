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

    intervalUnitDisplay() {
      const { activeSubscription, atc } = this
      let intervalUnit = activeSubscription.period
      let plural = activeSubscription.interval > 1

      let displayUnit = ''
      if (intervalUnit === 'day') {
        if (plural) {
          displayUnit = atc['date-time.days-unit'] || 'days'
        } else {
          displayUnit = atc['date-time.day-unit'] || 'day'
        }
      } else if (intervalUnit === 'week') {
        if (plural) {
          displayUnit = atc['date-time.weeks-unit'] || 'weeks'
        } else {
          displayUnit = atc['date-time.week-unit'] || 'week'
        }
      } else if (intervalUnit === 'month') {
        if (plural) {
          displayUnit = atc['date-time.months-unit'] || 'months'
        } else {
          displayUnit = atc['date-time.month-unit'] || 'month'
        }
      } else {
        displayUnit = atc['date-time.days-unit'] || 'days'
      }
      return displayUnit
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
      {{ intervalUnitDisplay }}</p
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
