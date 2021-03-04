<template>
  <div>
    <div
      v-for="(product, index) in products"
      :key="index"
      class="c-product"
      @click="goToFullProductDetails"
    >
      <img
        class="c-product__image"
        :class="{
          'c-product__image--disabled': isCancelledSubscriptionRoute,
        }"
        :src="
          product.image_url
            .replace('.png', '_320x.png')
            .replace('.jpg', '_320x.jpg')
        "
        alt=""
        onerror="this.style.display='none'"
      />

      <div class="c-product__description">
        <h4>
          {{ product.title }}
          {{ product.quantity > 1 ? ' X ' + product.quantity : '' }}
        </h4>
        <p class="c-product__variantDescription">{{ product.variant_title }}</p>
        <p v-if="oneTimeProduct(product)" class="c-product__shipment">
          Ships One-Time in Next Shipment Only
        </p>
        <p v-else class="c-product__shipment">
          {{
            atc['portal.subscriptionSettingsDeliverEveryLabel'] || 'Ships every'
          }}
          {{ activeSubscription.interval + ' ' + intervalUnitDisplay }}
        </p>
      </div>

      <div class="c-productRow__buttonContainer">
        <a class="c-productRow__rightButton">
          <angle-right />
        </a>
      </div>
    </div>

    <v-button
      v-if="editNextOrder"
      class="c-product_button"
      @onClick="openAddToSubscriptionModal"
    >
      {{
        atc['buttons.addProductToNextOrder'] || 'Add products to next shipment'
      }}
    </v-button>
    <v-button
      v-else
      class="c-product_button"
      @onClick="openAddToSubscriptionModal"
    >
      {{
        atc['buttons.addProductToSubscription'] ||
          'Add products to subscription'
      }}
    </v-button>
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
import { windowSizes } from '@mixins/windowSizes'
import VButton from '@components/v-button.vue'
import AngleRight from '@components/Icon/angle-right'
import ModalProduct from '@components/modal-product.vue'
import ModalSubscription from '@components/modal-subscription'
import { mapGetters, mapMutations, mapState } from 'vuex'

export default {
  components: {
    VButton,
    AngleRight,
    ModalProduct,
    ModalSubscription,
  },

  mixins: [windowSizes],

  props: {
    products: {
      type: Array,
      required: true,
      default: () => [],
    },
    shopifyOrderId: {
      type: Number,
      default: 0,
    },
  },

  data() {
    return {
      productEndNumber: 4,
      isProductModalOpen: false,
      isOpeningProductSubscription: false,
      closeAnimation: false,
      isSwapSubscription: false,
    }
  },

  computed: {
    ...mapState('translations', ['atc']),

    ...mapState('route', ['storeDomain', 'customerId']),

    ...mapState('editMode', ['editNextOrder']),

    ...mapGetters('activeSubscription', ['activeSubscription']),

    isCancelledSubscriptionRoute() {
      return this.$route.query.route === 'cancelledSubscriptions'
    },

    returnCancelledSubscriptionRoute() {
      if (this.isCancelledSubscriptionRoute) {
        return { route: 'cancelledSubscriptions' }
      }
      return {}
    },

    calculateProductEndNumber() {
      const { windowWidth, products, productEndNumber } = this

      if (windowWidth >= 400 && products.length - 1 >= 4) {
        return productEndNumber
      } else if (windowWidth < 400 && products.length - 1 >= 3) {
        return 3
      } else {
        return products.length
      }
    },

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
  },

  methods: {
    ...mapMutations('products', ['setProductIdAndSubscriptionId']),

    ...mapMutations('swapProduct', ['setSwapProduct']),

    openModal(productVariantId) {
      if (this.isCancelledSubscriptionRoute) return
      if (!productVariantId) return

      this.setProductIdAndSubscriptionId({ productVariantId })
      this.isProductModalOpen = true
      this.closeAnimation = false
    },

    goToFullProductDetails() {
      const { returnCancelledSubscriptionRoute } = this
      this.$router.push({
        query: {
          template: 'order-next-shipment',
          ...returnCancelledSubscriptionRoute,
          storeDomain: this.storeDomain,
          customerId: this.customerId,
          ...(this.$route.query.editNextOrder ? { editNextOrder: true } : {}),
        },
      })
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

    oneTimeProduct(product) {
      const variantIdArray = this.activeSubscription.items.map(
        (item) => item.variant_id
      )
      if (!variantIdArray.includes(product.variant_id)) {
        return true
      }

      const subscriptionProduct = this.activeSubscription.items.find(
        (subscriptionProduct) =>
          subscriptionProduct.variant_id === product.variant_id
      )
      if (subscriptionProduct.quantity !== product.quantity) {
        return true
      }
      return false
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
.c-product {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 400px;
  min-height: 70px;
  padding: 8px 24px 8px 16px;
  margin: 0 auto;
  margin-bottom: 15px;
  background-color: $color-white;
  border: 1px solid $color-blue-light-border;
  border-radius: 4px;

  @media (min-width: 425px) {
    padding: 8px 16px 8px 16px;
  }
  .c-product__image {
    width: 50px;
    height: auto;
    cursor: pointer;
    object-fit: cover;
  }
  .c-product__description {
    flex: 1;
    padding: 0 10px;
    h4 {
      font-size: 16px;
      font-weight: 700;
    }
    .c-product__variantDescription {
      margin: 0;
      font-size: 12px;
      font-weight: 500;
      color: $color-secondary;
    }
    .c-product__shipment {
      margin: 0;
      font-size: 12px;
      font-weight: 700;
      color: $color-secondary;
    }
  }
}

.c-product_button {
  width: 90%;
  margin: auto;
}

.c-productRow__imageContain {
  position: relative;
  width: 48px;
  height: 48px;
  margin-right: 8px;

  &:last-child {
    margin-right: 13px;
  }
}

.c-productRow__quanity {
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  font-size: 12px;
  background-color: $color-white;
  border-radius: 50%;
}

.c-productRow__button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  min-width: 40px;
  height: 40px;
  padding: 0;
}

.c-productRow__buttonContainer {
  position: absolute;
  right: 20px;
  display: flex;
  align-items: center;
}
.c-productRow__rightButton {
  min-width: auto;
  padding: 1px 7px 2px;
  background-color: transparent;
  border: 0;

  &:hover,
  &:focus {
    background-color: transparent;
  }
}

.c-productRow__image--disabled {
  pointer-events: none;
  cursor: none;
}
</style>
