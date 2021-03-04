<script>
import { mapActions, mapState, mapMutations, mapGetters } from 'vuex'
import VariantSelectBlock from '@components/variant-select-block.vue'
import VButton from '@components/v-button.vue'
import DrawerProductBlock from '@components/drawer-product-block.vue'

export default {
  components: {
    VariantSelectBlock,
    VButton,
    DrawerProductBlock,
  },
  props: {
    updating: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapState('translations', ['atc']),

    ...mapGetters('activeSubscription', [
      'activeSubscription',
      'activeSubscriptionNextOrder',
    ]),

    ...mapState('products', ['products', 'productImages']),

    ...mapState('swapProduct', ['swapProduct']),

    ...mapState('variantSelectProduct', ['variantSelectProduct']),

    ...mapState('editMode', ['editNextOrder']),

    intervalUnitDisplay() {
      const { activeSubscription, atc } = this
      let intervalUnit = activeSubscription.period
      let plural = activeSubscription.interval > 1

      let displayUnit = ''
      if (intervalUnit.indexOf('day') > -1) {
        if (plural) {
          displayUnit = atc['date-time.days-unit'] || 'days'
        } else {
          displayUnit = atc['date-time.day-unit'] || 'day'
        }
      } else if (intervalUnit.indexOf('week') > -1) {
        if (plural) {
          displayUnit = atc['date-time.weeks-unit'] || 'weeks'
        } else {
          displayUnit = atc['date-time.week-unit'] || 'week'
        }
      } else if (intervalUnit.indexOf('month') > -1) {
        if (plural) {
          displayUnit = atc['date-time.months-unit'] || 'months'
        } else {
          displayUnit = atc['date-time.month-unit'] || 'month'
        }
      } else {
        displayUnit = intervalUnit
      }
      return displayUnit
    },

    activeSubscriptionProducts() {
      return this.activeSubscription.items
    },
  },
  methods: {
    ...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),

    ...mapMutations('subscriptions', ['setSavedProductUpdatePayload']),

    ...mapMutations('shippingMethods', ['SET_SHIPPING_METHODS']),

    handleEmittingSwapProduct(payload) {
      const { variantId, product } = payload
      this.$emit('handleSwapProductVariant', variantId, product)
    },
  },
}
</script>

<template>
  <div class="c-modalSwwap">
    <p class="c-drawer__subtitle">{{
      atc['portal.selectVariantCurrentProductLabel'] || 'Current Product'
    }}</p>

    <div class="c-modalSwap__options">
      <drawer-product-block :product="swapProduct" existing-product />
    </div>

    <p class="c-drawer__subtitle">{{
      atc['portal.selectVariantSwapProductLabel'] || 'Swap Product'
    }}</p>

    <p
      v-if="activeSubscription.interval && activeSubscription.period"
      class="c-drawer__subtitle"
      >{{
        atc['portal.editProductsDrawerInfoText'] ||
          'These products will ship every'
      }}
      {{ activeSubscription.interval }} {{ intervalUnitDisplay }}</p
    >

    <div class="c-modalSwap__options">
      <variant-select-block
        v-if="variantSelectProduct"
        :product="variantSelectProduct"
        :button-text="atc['buttons.swapProduct'] || 'Swap'"
        variant-action="swap"
        :updating="updating"
        @swapProductVariant="handleEmittingSwapProduct"
      />
    </div>

    <div class="c-drawer__actionButtons">
      <v-button
        class="c-form__submitButton"
        type="alt"
        @onClick="$emit('handleCloseSwapModal')"
        >{{ atc['buttons.cancel'] || 'Cancel' }}</v-button
      >
    </div>
  </div>
</template>

<style lang="scss">
.c-modalSwap__options {
  background-color: #f7f9fb;
}
</style>
