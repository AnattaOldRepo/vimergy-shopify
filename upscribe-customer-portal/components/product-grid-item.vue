<script>
import { mapMutations, mapState,
// mapGetters
} from 'vuex'
import { windowSizes } from '@mixins/windowSizes'
import DrawerProducts from '@components/drawer-products.vue'
import VButton from '@components/v-button.vue'
import PlusCircle from '@components/Icon/plus-cicrle'
import MinusIcon from '@components/Icon/minus-icon'
import PlusIcon from '@components/Icon/plus-icon'
import TrashIcon from '@components/Icon/trash-icon'

export default {
  components: {
    VButton,
    DrawerProducts,
    PlusCircle,
    MinusIcon,
    TrashIcon,
    PlusIcon,
  },

  mixins: [windowSizes],

  props: {
    product: {
      type: Object,
      required: true,
    },
    status: {
      type: String,
      default: '',
    },
    isSwap: {
      type: Boolean,
      default: false,
    },
  },
  data: () => {
    return {
      drawerProductsOpen: false,
      quantityControlIsOpen: false,
    }
  },


  computed: {
    ...mapState('translations', ['atc']),

    ...mapState('shop', ['currencySymbol']),

    disabled(){
      if(this.status === 'updating') return true
      return false
    },
  },

  methods: {
    ...mapMutations('variantSelectProduct', ['setVariantSelectProduct']),

    handleAddProduct() {
      this.setVariantSelectProduct(this.product)
      this.drawerProductsOpen = true
    },

    openQuantityControl(){
      this.quantityControlIsOpen = true
    },

    closeQuantityControl(){
      this.quantityControlIsOpen = false
    },

    quantityChange(type) {
      const { product } = this
      const quantity = product.quantity
      if (type === 'decrease') {
        if (quantity === 1) return this.$emit('handleRemove', product)

        this.$emit('handleQuantityChange', {
          quantity: quantity - 1,
          id: product.id,
          variant_id: product.variants[0].id,
        })
      } else if (type === 'increase') {
        this.$emit('handleQuantityChange', {
          quantity: quantity + 1,
          id: product.id,
          variant_id: product.variants[0].id,
        })
      }
      this.closeQuantityControl()
    },
  },
}
</script>

<template>
  <div v-if="product && windowWidth >= 768" class="c-productGridItem">

    <!-- <span v-if="activeSubscriptionProduct">{{ activeSubscriptionProduct.quantity }}</span> -->
    <div v-if="product.image" class="c-productGridItem__imageWrap">
      <img
        class="c-productGridItem__image"
        :src="
          product.image.src
            .replace('.png', '_320x.png')
            .replace('.jpg', '_320x.jpg')
        "
        :alt="product.image.alt ? product.image.alt : ''"
      />
    </div>

    <h3 v-if="product.title" class="c-productGridItem__title">{{
      product.title
    }}</h3>

    <span v-if="product.price" class="c-productGridItem__price"
      >{{ currencySymbol }}{{ product.price }}</span
    >

    <v-button
      class="c-productGridItem__button c-button--transparent"
      size="small"
      :text="atc['buttons.addProductGridItem'] || 'Add'"
      @onClick="handleAddProduct"
    />

    <!-- Drawer Portal Variants -->
    <portal v-if="drawerProductsOpen" to="drawers">
      <drawer-products
        initial-mode="variant-select"
        :show="drawerProductsOpen"
        @close="drawerProductsOpen = false"
      />
    </portal>
  </div>

  <!-- Mobile -->

  <div v-else class="c-productGridItem" >
    <div v-if="product.image" class="c-productGridItem__imageWrap">
      <img
        class="c-productGridItem__image"
        :src="
          product.image.src
            .replace('.png', '_320x.png')
            .replace('.jpg', '_320x.jpg')
        "
        :alt="product.image.alt ? product.image.alt : ''"
      />
    </div>

    <h3 v-if="product.title" class="c-productGridItem__title">{{
      product.title
    }}</h3>

    <span v-if="product.price" class="c-productGridItem__price"
      >{{ currencySymbol }}{{ product.price }}</span
    >

     <v-button
        v-if="product.quantity && !isSwap"
        class="c-productGridItem__button--secondary c-button--transparent c-productGridItem__buttonQuantity"
        size="small"
        :disabled="disabled"
        @onClick="openQuantityControl"
        >
        {{ product.quantity }}
     </v-button>

     <v-button
        v-else-if="!product.quantity && !isSwap"
        class="c-productGridItem__button--secondary c-button--transparent"
        size="small"
        :disabled="disabled"
        @onClick="$emit('handleAddProductVariantToSubscription', product.variants[0].id, product, true)"
      >
       <plus-circle
          width='24'
          height='24'
          fill-color='#A3B5BF'
        />
      </v-button>

      <v-button
        v-else
        class="c-button--transparent c-productGridItem__buttonSwap"
        size="small"
        :disabled="disabled"
        @onClick="$emit('handleOpenSwapModal', product)"
      >
        SWAP
      </v-button>

      <div v-if="quantityControlIsOpen" class="c-productGridItem__quantityControl">
        <v-button
          v-if="product.quantity > 1"
          class="c-productGridItem__quantityBox"
          aria-label="minus icon"
          :disabled="disabled"
          @onClick="quantityChange('decrease')"
          >
          <minus-icon />
        </v-button>

        <v-button
          v-else
          class="c-productGridItem__quantityBox"
          aria-label="trash icon"
          :disabled="disabled"
          @onClick="quantityChange('decrease')"
          >
          <trash-icon/>
        </v-button>

        <span class="c-productGridItem__quantityBox c-productGridItem__quantity" >{{  product.quantity }}</span>

        <v-button
          class="c-productGridItem__quantityBox"
          aria-label="plus icon"
          :disabled="disabled"
          @onClick="quantityChange('increase')"
          >
          <plus-icon />
        </v-button>
      </div>
  </div>
</template>

<style lang="scss">
@import '@design';

.c-productGridItem {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 42px;
  text-align: center;
  position: relative;

  @include bp(tablet-large) {
    padding: 20px;
    margin-bottom: 22px;
  }
}

.c-productGridItem__imageWrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 160px;
  height: 100%;
  margin-bottom: 6px;
}

.c-productGridItem__image {
  display: block;
  width: 100%;
  min-height: 160px;
}

.c-productGridItem__title {
  min-height: 32px;
  margin-bottom: 10px;
  font-family: $font-primary-medium;
  font-size: 14px;
  font-weight: 400;
  text-align: center;
  line-height: 17px;
}

.c-productGridItem__price {
  margin-bottom: 8px;
  font-size: 12px;
  line-height: 16px;
  color: $color-blue-secondary;
}

.c-productGridItem__button {
  text-transform: uppercase;
  width: auto;
  padding: 12px 20px;
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0.8px;
  font-weight: bold;
}

.c-productGridItem__button--secondary{
  position: absolute;
  border: 0px;
  top: 0px;
  right: 0px;
  width: auto;
  min-width: 0px;
  padding: 0px;
}

.c-productGridItem__buttonQuantity{
  background-color: $color-black;
  color: $color-white;
  min-width: 24px;
  height: 24px;
  border-radius: 50%;

  &:hover,
  &:focus{
    background-color: $color-black;
    color: $color-white
  }
}

.c-productGridItem__quantityControl{
  position: absolute;
  top: 0;
  z-index: 70;
  background-color: $color-white;
  height: 48px;
  width: auto;
  box-shadow: 0px 2px 1px 2px rgba(1, 1, 1, 0.1);
  display: inline-flex;
  border-radius: 4px;
}

.c-productGridItem__quantityBox{
  width: 48px;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: $color-white;
  min-width: 0;
  border: 0px;

  &:hover,
  &:focus{
    background-color: $color-white;
  }
}

.c-productGridItem__quantity{
  font-weight: bold;
}

.c-productGridItem__buttonSwap{
  font-weight: bold;
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0.8px;
  padding: 12px 20px;
  width: auto;
}
</style>
