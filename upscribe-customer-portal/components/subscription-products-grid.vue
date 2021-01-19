<script>
import { mapState, mapMutations } from 'vuex'
import ProductGridItem from '@components/product-grid-item.vue'
import { windowSizes } from '@mixins/windowSizes.js'
import VuePagination from '@components/vue-pagination'
export default {
  components: {
    ProductGridItem,
    VuePagination,
  },
  mixins: [windowSizes],
  computed: {
    ...mapState('translations', ['atc']),
    ...mapState('products', ['products']),
    ...mapState('editMode', ['editNextOrder']),

    ...mapState('collections', [
      'collections',
      'activeCollection',
      'availableCollections',
    ]),

    ...mapState('translations', ['atc']),
    ...mapState('shop', [
      'customerPortalSubscriptionProductCollections',
      'customerPortalNextOrderProductCollections',
      'featuredPortalCollection',
      'uiSettings',
    ]),
  },
  methods: {
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
  },
}
</script>

<template>
  <div class="c-productsGrid">
    <h2 v-if="editNextOrder" class="c-productsGrid__title">{{
      atc['portal.productsGridNextOrderTitle'] || 'Add to Your Next Order'
    }}</h2>
    <h2 v-else class="c-productsGrid__title">{{
      atc['portal.productsGridSubscriptionTitle'] || 'Add to Your Subscription'
    }}</h2>

    <div class="c-productsGrid__inner">
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

      <div v-if="products && products.length">
        <div class="c-productsGrid__grid">
          <product-grid-item
            v-for="(product, index) in products"
            :key="product.id + '-' + index"
            class="c-productsGrid__item"
            :product="product"
          />
        </div>

        <vue-pagination
          key="vue-pagination"
          ref="vue-pagination"
          :collection-id="activeCollection ? activeCollection.id : false"
        />
      </div>

      <div v-else class="c-productsGrid__grid">
        <content-placeholders
          v-for="(item, index) in [1, 2, 3, 4, 5, 6]"
          :key="index"
          :centered="true"
          class="c-productGridItem c-productsGrid__item"
          style="display: block;"
        >
          <div class="c-productGridItem__imageWrap" style="margin-bottom: 10px">
            <content-placeholders-img
              class="c-productGridItem__image"
              style="width: 140px; height: 140px;"
            />
          </div>
          <content-placeholders-text
            style="height: 20px; min-height: auto"
            :lines="1"
            class="c-productGridItem__title"
          />
          <content-placeholders-img
            style="height: 30px;"
            class="c-productGridItem__button"
          />
        </content-placeholders>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import '@design';
.c-productsGrid {
  @include bp(tablet-max) {
    max-width: 500px;
    margin: 0 auto;
  }
}
.c-productsGrid__top {
  overflow-x: auto;
  margin-bottom: 15px;
}
.c-productsGrid__link-contain {
  padding: 10px 0;
  margin: 0 0 30px;
  display: flex;
  .c-productsGrid__link {
    list-style: none;
    white-space: nowrap;
    margin-right: 25px;
    cursor: pointer;
    &--active {
      font-weight: bold;
      padding-bottom: 5px;
      @include border-focus;
    }
    button {
      border: none;
      background-color: transparent;
      padding: 0;
      cursor: pointer;
    }
  }
}
.c-productsGrid__title {
  margin-bottom: 22px;
  font-family: $font-primary-medium;
  font-size: 18px;
  line-height: 23px;
  font-weight: bold;
  letter-spacing: 0.1px;
  color: $color-blue-secondary;
  text-align: left;
}
.c-productsGrid__inner {
  padding: 20px 20px 58px;
  border: 1px solid $color-blue-light-border;
  background-color: $color-white;
  @include bp(tablet-large) {
    padding: 36px 40px 58px;
  }
}
.c-productsGrid__grid {
  @include clearfix;
}
.c-productsGrid__item {
  @include column(1/2, $cycle: 2, $gutter: 6);
  @include bp(tablet-large) {
    @include column(1/3, $cycle: 3);
  }
}
.c-productsGrid__grid-title {
  font-size: 14px;
  line-height: 15px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: normal;
  font-style: normal;
  color: $color-blue-secondary;
}
.pagination {
  width: 100%;
}
</style>
