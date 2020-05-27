<script>
import { mapState, mapGetters } from 'vuex'
import ProductGridItem from '@components/product-grid-item.vue'
import VButton from '@components/v-button.vue'
// import { dummyProduct } from '@scripts/dummies.js'
import { windowSizes } from '@mixins/windowSizes.js'

export default {
  components: {
    ProductGridItem,
    VButton,
  },
  mixins: [windowSizes],
  data: function() {
    return {
      currentActiveText: 'all',
      visibleCollectionCount: 3,
      visibleProductCount: 9,
    }
  },

  computed: {
    ...mapGetters('products', ['hashedCollections']),

    ...mapState('translations', ['atc']),
    ...mapState('products', ['products']),
    ...mapState('editMode', ['editNextOrder']),

    collectionOfTitle(){
      let collectionOfTitleArr = []
      // Check if we have collections
      if(Object.entries(this.hashedCollections).length > 0){
        for(let each in this.hashedCollections){
          if(each.toLowerCase() === 'all'){
            collectionOfTitleArr.unshift({title: 'All', handle: each.toLowerCase()})
          } else {
            collectionOfTitleArr.push({title: this.hashedCollections[each].title, handle: each.toLowerCase()})
          }
        }
      } else {
        collectionOfTitleArr.push({title: 'All', handle: 'all'})
      }

      return collectionOfTitleArr
    },

    currentCollection(){
      return this.hashedCollections[this.currentActiveText]
    },


    visibleCollections() {
      const { currentCollection, visibleCollectionCount, currentActiveText } = this
      if(currentCollection && currentActiveText === 'all'){
        return currentCollection.slice().splice(0, visibleCollectionCount)
      }
      return undefined
    },
  },

  methods: {
    showMoreProducts() {
      // Don't use hashedCollection length here. Why? Because we added all collection manually, so it's going to cause problem!!!!
      this.visibleCollectionCount = this.products.length

      this.visibleProductCount = this.products.length
    },

    changeCurrentFilter(handle){
      this.currentActiveText = handle
    },
  },
}
</script>

<template>
  <div class="c-productsGrid">
    <h2 v-if="editNextOrder" class="c-productsGrid__title"
      >{{ atc['portal.productsGridNextOrderTitle'] || 'Add to Your Next Order' }}</h2
    >
    <h2 v-else class="c-productsGrid__title">{{ atc['portal.productsGridSubscriptionTitle'] || 'Add to Your Subscription' }}</h2>

    <div class="c-productsGrid__inner">
      <div v-if = "collectionOfTitle" class="c-productsGrid__top">
        <ul class="c-productsGrid__link-contain">
          <li v-for = "(each, index) in collectionOfTitle"
              :key="index"
              :data-id="each.handle"
              class="c-productsGrid__link"
              :class="{'c-productsGrid__link--active': currentActiveText === each.handle}"
              >
              <button @click="changeCurrentFilter(each.handle)">
                {{ each.title }}
              </button>
          </li>
        </ul>
      </div>

      <div v-if="products && currentActiveText === 'all' && currentCollection">
        <div
          v-for = "(each, index) in visibleCollections"
          :key = "index">
            <h2 class = "c-productsGrid__grid-title">{{ each.title }}</h2>
            <div class="c-productsGrid__grid">
              <product-grid-item
                v-for="(product, index2) in each.items"
                :key="product.id + index2"
                class="c-productsGrid__item"
                :product="product"
              />
            </div>
        </div>

        <v-button
            v-if="visibleCollectionCount < visibleCollections.length"
            :centered="true"
            class="c-productsGrid__showAllButton c-button--transparent"
            :text="atc['portal.buttonBrowseAllButton'] || 'Show More'"
            auto
            size="small"
            @onClick="showMoreProducts"
          />
      </div>

      <div
        v-else-if="products && currentActiveText !== 'all' && currentCollection"
        class="c-productsGrid__grid">
          <h2 class = "c-productsGrid__grid-title"> {{ currentCollection.title }}</h2>
          <div class="c-productsGrid__grid">
            <product-grid-item
              v-for="(product, index) in currentCollection.items"
              :key="product.id + index"
              class="c-productsGrid__item"
              :product="product"
            />
          </div>
      </div>

      <div
        v-else-if="products && currentActiveText === 'all' && !currentCollection"
        class="c-productsGrid__grid">
          <div class="c-productsGrid__grid">
            <product-grid-item
              v-for="(product, index) in products.slice().splice(0, visibleProductCount)"
              :key="product.id + index"
              class="c-productsGrid__item"
              :product="product"
            />
          </div>

          <v-button
            v-if="visibleProductCount < products.length"
            :centered="true"
            class="c-productsGrid__showAllButton c-button--transparent"
            :text="atc['portal.buttonBrowseAllButton'] || 'Show More'"
            auto
            size="small"
            @onClick="showMoreProducts"
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
          <!-- <content-placeholders-text
            style="height: 20px;"
            :lines="1"
            class="c-productGridItem__price"
          /> -->

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

.c-productsGrid__top{
  overflow-x: auto;
  margin-bottom: 15px;
}

.c-productsGrid__link-contain{
  padding: 10px 0;
  margin: 0 0 30px;
  display: flex;

  .c-productsGrid__link{
    list-style: none;
    white-space: nowrap;
    margin-right: 25px;
    cursor: pointer;

    &--active{
      font-weight: bold;
      padding-bottom: 5px;
      @include border-focus
    }

    button{
      border: none;
      background-color: transparent;
      padding: 0;
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

.c-productsGrid__showAllButton {
  margin: 8px auto 0;
  padding: 12px 20px;
  font-size: 12px;
  line-height: 16px;
  text-transform: uppercase;
  font-weight: bold;
  @include bp(tablet-large) {
    margin: 45px auto 0;
  }
}

.c-productsGrid__grid-title{
  font-size: 14px;
  line-height: 15px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: normal;
  font-style: normal;
  color: $color-blue-secondary;
}

</style>
