<template>
  <modal-wrap v-if="otoProduct" :show="show" @close="declineOto">
    <div class="c-otoModal__intro">
      <h2 class="c-otoModal__introTitle">Add Product</h2>

      <p v-if="otoProduct" class="c-otoModal__text"
        >Are you sure you want to add
        <strong>{{ otoProduct.title }} ({{ otoVariant.title }})</strong><br />
        as a one time add-on to your next shipment?</p
      >

      <div v-if="otoProduct" class="c-otoModal__product">
        <div v-if="productImage" class="c-otoModal__productImageWrap">
          <img
            class="c-otoModal__productImage"
            :src="productImage"
            :alt="productImage.alt ? productImage.alt : otoProduct.title"
          />
        </div>

        <p v-if="otoVariant && otoProduct"
          >{{ otoProduct.title }} {{ otoVariant.title }}</p
        >
        <p>{{ currencySymbol }}{{ otoVariant.price }}</p>

        <v-button
          class="c-form__submitButton"
          type="submit"
          :class="{ 'is-loading': isLoading }"
          @onClick="addOtoProduct"
          >{{ isLoading ? 'Updating' : 'Add Product' }}</v-button
        >

        <v-button
          class="c-form__submitButton c-button--link"
          @onClick="declineOto"
        >
          Nevermind
        </v-button>
      </div>
    </div>
  </modal-wrap>
</template>

<script>
import ModalWrap from '@components/modal-wrap.vue'
import VButton from '@components/v-button.vue'

import { mapState, mapActions, mapMutations, mapGetters } from 'vuex'

export default {
  components: {
    ModalWrap,
    VButton,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  data: () => {
    return {
      isLoading: false,
    }
  },
  computed: {
    ...mapState('shop', ['shopData', 'currencySymbol']),

    ...mapGetters('activeSubscription', ['activeSubscription']),

    ...mapState('oneTimeOrder', [
      'otoAddProduct',
      'otoSubscriptionId',
      'otoQueueId',
      'otoProductVariantId',
    ]),

    ...mapState('products', ['products', 'productImages']),

    otoProduct() {
      const { products, otoProductVariantId } = this

      let finalProduct = products.filter((product) => {
        let match = false
        product.variants.forEach((variant) => {
          // eslint-disable-next-line eqeqeq
          if (variant.id == otoProductVariantId) match = true
        })
        return match
      })

      return finalProduct.length ? finalProduct[0] : false
    },

    otoVariant() {
      const { products, otoProductVariantId } = this

      let finalVariant = false

      products.forEach((product) => {
        product.variants.forEach((variant) => {
          // eslint-disable-next-line eqeqeq
          if (variant.id == otoProductVariantId) {
            finalVariant = variant
          }
        })
      })

      return finalVariant
    },

    productImage() {
      const { productImages, product, otoProductVariantId } = this
      if (!productImages && !product.image_url && !product.image) return false

      if (otoProductVariantId && productImages) {
        return productImages[otoProductVariantId] || product.image_url
      } else {
        return product.image && product.image.src ? product.image.src : false
      }
    },
  },
  methods: {
    ...mapActions('oneTimeOrder', ['ADD_OTO_PRODUCT_TO_OTO_QUEUE']),

    ...mapActions('subscriptions', ['UPDATE_NEXT_ORDER']),

    ...mapActions('activeSubscription', ['fakeActiveSubscriptionUpdate']),

    ...mapActions('editMode', ['setEditNextOrder']),

    async addOtoProduct() {
      const vm = this
      const {
        otoProductVariantId,
      } = this

      const updatePayload = {
        requestPayload: {
          items: [
            {
              variant_id: otoProductVariantId,
              quantity: 1,
            },
          ],
        },
      }

      let updateAction = this.UPDATE_NEXT_ORDER(updatePayload)

      this.isLoading = true

      try {
        await updateAction
      } catch (e) {
        this.handleUpdateError(e, {
          ...updatePayload,
          successMessage: 'Product Added',
        })
      } finally {
        this.isLoading = false
        this.removeOtoUrlParams()

        this.setEditNextOrder(true)

        this.$nextTick(() => {
          vm.$emit('close')
        })
      }
    },

    async declineOto() {
      this.removeOtoUrlParams()
      this.$emit('close')
    },

    removeOtoUrlParams() {
      const { removeParam } = this
      let newUrl = window.location.href

      newUrl = removeParam('otoAddProduct', newUrl)
      newUrl = removeParam('otoProductVariantId', newUrl)
      newUrl = removeParam('otoQueueId', newUrl)
      newUrl = removeParam('otoSubscriptionId', newUrl)

      window.history.pushState({}, document.title, '/' + newUrl)
    },

    closeModal() {
      this.$emit('close')
    },
  },
}
</script>

<style lang="scss">
@import '@design';

.c-otoModal__intro {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.c-otoModal__introTitle {
  margin-bottom: 10px;
  font-size: 22px;
  text-align: center;
}

.c-otoModal {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 1440px;
  padding: 4px;
  margin: 0 auto;
  overflow: scroll;
  text-align: center;
}

.c-otoModal__head {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 30px;

  @media (min-width: 500px) {
    flex-direction: row;
    margin: 0;
  }
}

.c-otoModal__infoBlock {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.c-otoModal__title {
  font-size: 24px;
}

.c-otoModal__text {
  margin-top: 20px;
  text-align: center;
}

.c-otoModal__subtitle {
  font-size: 18px;
}

.c-otoModal__supportLink {
  font-size: 18px;
  text-decoration: none;
}

.c-otoModal__product {
  text-align: center;
}

.c-otoModal__productImageWrap {
  max-width: 200px;
  margin: 0 auto;
}

.c-otoModal__productImage {
  width: 100%;
  max-width: 100%;
}
</style>
