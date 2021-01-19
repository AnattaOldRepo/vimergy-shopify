<script>
import { mapMutations, mapState, mapGetters } from 'vuex'
import DrawerProductBlock from '@components/drawer-product-block.vue'
import VuePagination from '@components/vue-pagination'
import VButton from '@components/v-button.vue'
import LoadingBlock from '@components/loading-block'

export default {
  components: {
    DrawerProductBlock,
    VuePagination,
    VButton,
    LoadingBlock,
  },
  computed: {
    ...mapState('translations', ['atc']),

    ...mapGetters('activeSubscription', ['activeSubscription']),

    ...mapState('products', ['products']),

    ...mapState('editMode', ['editNextOrder']),

    ...mapState('collections', [
      'collections',
      'activeCollection',
      'availableCollections',
    ]),

    ...mapState('shop', ['uiSettings']),

    activeSubscriptionProducts() {
      return this.activeSubscription.items
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
    ...mapMutations('variantSelectProduct', ['setVariantSelectProduct']),

    ...mapMutations('collections', ['setActiveCollection']),

    changeCurrentFilter(collection) {
      const { activeCollection } = this

      if (!collection) {
        // reset to all
        this.setActiveCollection(false)

        this.loadProductsByCollectionId(false)
      } else {
        // same filter ignore
        if (activeCollection && collection.id === activeCollection.id) return

        this.setActiveCollection(collection)
        this.loadProductsByCollectionId(collection)
      }
    },

    loadProductsByCollectionId(collection) {
      let requestParams = {}

      if (collection) {
        requestParams['collection_id'] = collection.id
      }

      this.$nextTick(() => {
        const paginationRef = this.$refs['vue-pagination']

        // load page 1
        if (paginationRef) {
          paginationRef.onLoadMoreItems(1)
        }
      })
    },

    handleVariantSelectProduct(product) {
      this.setVariantSelectProduct(product)
      this.$emit('setMode', 'variant-select')
    },
  },
}
</script>

<template>
  <div>
    <h2 class="c-drawer__title">{{
      atc['portal.addProductsDrawerTitle'] || 'Add Products'
    }}</h2>

    <p
      v-if="activeSubscription.interval && activeSubscription.period"
      class="c-drawer__subtitle"
      >{{
        atc['portal.editProductsDrawerInfoText'] || 'These products ship every'
      }}
      {{ activeSubscription.interval }} {{ intervalUnitDisplay }}</p
    >

    <div v-if="products && products.length" class="c-productsGrid__top">
      <ul
        v-if="!availableCollections || !availableCollections.length"
        class="c-productsGrid__link-contain"
      >
        <li class="c-productsGrid__link c-productsGrid__link--active">
          <button>{{ atc['portal.allProductsLabel'] || 'All' }}</button>
        </li>
      </ul>

      <ul v-else class="c-productsGrid__link-contain">
        <li
          v-if="
            (uiSettings &&
              !uiSettings.disable_customer_portal_default_all_products_tab) ||
              !uiSettings
          "
          class="c-productsGrid__link"
          :class="{
            'c-productsGrid__link--active': isEmptyObject(activeCollection),
          }"
        >
          <button @click="changeCurrentFilter(false)">{{
            atc['portal.allProductsLabel'] || 'All'
          }}</button>
        </li>

        <li
          v-for="collection in availableCollections"
          :key="collection.id"
          class="c-productsGrid__link"
          :class="{
            'c-productsGrid__link--active':
              activeCollection && activeCollection.id === collection.id,
          }"
        >
          <button @click="changeCurrentFilter(collection)">
            {{ collection.title }}
          </button>
        </li>
      </ul>
    </div>

    <loading-block
      v-if="!products || !products.length"
      height="200px"
      min-height="200px"
    />

    <div v-else>
      <div class="c-drawerDeliveryFrequency__options">
        <drawer-product-block
          v-for="product in products"
          :key="product.id"
          :product="product"
          add
          @variantSelectProduct="handleVariantSelectProduct"
        />
      </div>

      <vue-pagination
        key="vue-pagination-add-drawer"
        ref="vue-pagination"
        :collection-id="activeCollection ? activeCollection.id : false"
      />

      <div class="c-drawer__actionButtons">
        <v-button
          class="c-form__submitButton"
          type="submit"
          @onClick="$emit('setMode', 'edit')"
          >{{ atc['buttons.cancel'] || 'Cancel' }}</v-button
        >
      </div>
    </div>
  </div>
</template>
