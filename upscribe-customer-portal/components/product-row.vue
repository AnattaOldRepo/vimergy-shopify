<template>
  <div class="c-productRow">
    <div v-if="products" class="c-productRow__imageWrap">
      <div
        v-for="(each, index) in products
          .slice()
          .splice(0, calculateProductEndNumber)"
        :key="index"
        class="c-productRow__imageContain"
        @click="openModal(each.variant_id)"
      >
        <img
          class="c-productRow__image"
          :class="{
            'c-productRow__image--disabled': isCancelledSubscriptionRoute,
          }"
          :src="
            each.image_url
              .replace('.png', '_320x.png')
              .replace('.jpg', '_320x.jpg')
          "
          alt=""
        />

        <span v-if="each.quantity > 1" class="c-productRow__quanity">
          {{ each.quantity }}
        </span>
      </div>

      <nuxt-link
        v-if="products.length - calculateProductEndNumber >= 1"
        class="c-button c-button--transparent c-productRow__button"
        :to="{
          query: {
            template: 'order-next-shipment',
            ...returnCancelledSubscriptionRoute,
            storeDomain,
            customerId,
          },
        }"
      >
        + {{ products.length - calculateProductEndNumber }}
      </nuxt-link>

      <div class="c-productRow__buttonContainer">
        <v-button
          :disabled="isCancelledSubscriptionRoute"
          class="c-productRow__rightButton"
          @onClick="openAddToSubscriptionModal"
        >
          <plus-circle />
        </v-button>

        <nuxt-link
          class="c-productRow__rightButton"
          :to="{
            query: {
              template: 'order-next-shipment',
              ...returnCancelledSubscriptionRoute,
              storeDomain,
              customerId,
              editNextOrder: this.$route.query.template == 'next-shipment',
            },
          }"
        >
          <angle-right />
        </nuxt-link>
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
import { windowSizes } from '@mixins/windowSizes'
import VButton from '@components/v-button.vue'
import PlusCircle from '@components/Icon/plus-cicrle'
import AngleRight from '@components/Icon/angle-right'
import ModalProduct from '@components/modal-product.vue'
import ModalSubscription from '@components/modal-subscription'
import { mapGetters, mapMutations, mapState } from 'vuex'
export default {
  components: {
    VButton,
    PlusCircle,
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
    ...mapState('route', ['storeDomain', 'customerId']),

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
  },

  methods: {
    ...mapMutations('products', ['setProductIdAndSubscriptionId']),

    ...mapMutations('swapProduct', ['setSwapProduct']),

    openModal(productVariantId) {
      if (this.isCancelledSubscriptionRoute) return
      if (!productVariantId) return

      this.setProductIdAndSubscriptionId(productVariantId)
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
.c-productRow__imageWrap {
  position: relative;
  display: flex;
  align-items: center;
  max-width: 400px;
  padding: 8px 24px 8px 16px;
  margin: 0 auto;
  background-color: $color-white;
  border: 1px solid $color-blue-light-border;
  border-radius: 4px;

  @media (min-width: 425px) {
    padding: 8px 16px 8px 16px;
  }
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

.c-productRow__image {
  width: 100%;
  height: 100%;
  cursor: pointer;
  object-fit: cover;
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
