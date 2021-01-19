<script>
import Pagination from 'vue-pagination-2'
import VuePaginationTemplate from '@components/vue-pagination-template'

import { mapMutations, mapState, mapActions } from 'vuex'

export default {
  components: {
    Pagination,
  },
  props: {
    actionOneLoading: {
      type: Boolean,
      default: false,
    },
    actionOneLoadingCheck: {
      type: [Boolean, String, Number],
      default: false,
    },
    actionOneText: {
      type: [Boolean, String],
      default: false,
    },
    addedProductIds: {
      type: [Boolean, Array],
      default: false,
    },
    highlightAddedProducts: {
      type: Boolean,
      default: false,
    },
    customCancelEmit: {
      type: [Boolean, String],
      default: false,
    },
    swap: {
      type: Boolean,
      default: false,
    },
    swapUpdating: {
      type: Boolean,
      required: false,
    },
    remove: {
      type: Boolean,
      default: false,
    },
    removeUpdating: {
      type: Boolean,
      required: false,
    },
    add: {
      type: Boolean,
      default: false,
    },
    addUpdating: {
      type: Boolean,
      required: false,
    },
    quantity: {
      type: Boolean,
      required: false,
    },
    quantityUpdating: {
      type: Boolean,
      required: false,
    },
    existingProduct: {
      type: Boolean,
      default: false,
    },
    highlighted: {
      type: Boolean,
      default: false,
    },
    imageSrc: {
      type: [String, Boolean],
      default: false,
    },
    collectionId: {
      type: [Number, Boolean],
      default: false,
    },
  },
  data: () => {
    return {
      VuePaginationTemplate: VuePaginationTemplate,
      currentPageLocal: 1,

      loadingPaginationData: false,

      sortOrder: [
        {
          field: 'updated_at',
          sortField: 'update_at',
          direction: 'asc',
        },
      ],
      tableDataLoaded: false,

      moreParams: {},
      searchTerm: null,
      searchIsLoading: false,
      searchFields: [
        { text: 'Product Title', value: 'title' },
        { text: 'Product Id', value: 'id' },
        { text: 'Product Handle', value: 'handle' },
      ],
      savedRequest: null,

      savedSearchField: null,
      savedSearchTerm: null,
    }
  },
  computed: {
    ...mapState('activeSubscription', ['activeSubscription']),

    ...mapState('products', ['products', 'totalCount', 'currentPage']),

    ...mapState('translations', ['atc']),

    ...mapState('editMode', ['editNextOrder']),

    textsTranslations() {
      const { atc } = this
      return {
        count:
          atc['portal.paginationMessages'] ||
          'Showing {from} to {to} of {count} products|{count} products|One product',
        first: atc['portal.paginationFirst'] || 'First',
        last: atc['portal.paginationLast'] || 'Last',
      }
    },

    activeSubscriptionProducts() {
      return this.activeSubscription.items
    },

    baseRequestPayload() {
      let payload = { clear: true }
      return payload
    },
  },
  async created() {
    const { currentPage } = this
    if (!currentPage) {
      this.currentPageLocal = 1
    } else {
      this.currentPageLocal = parseInt(currentPage)
    }
  },
  methods: {
    ...mapActions('products', ['GET_PRODUCTS']),

    ...mapMutations('variantSelectProduct', ['setVariantSelectProduct']),

    handleSetPage(page) {
      console.info('setPage: ', page)
    },
    handleNext(payload) {
      console.info('next', payload)
    },
    handlePrev(payload) {
      console.info('prev', payload)
    },
    handleNextChunk(payload) {
      console.info('nextChunk', payload)
    },
    handlePrevChunk(payload) {
      console.info('prevChunk', payload)
    },
    handlePaginate(payload) {
      console.info('paginate', payload)
    },

    handleVariantSelectProduct(product) {
      this.setVariantSelectProduct(product)
      this.$emit('setMode', 'variant-select')
    },

    resetSearch() {
      this.searchTerm = false
      this.savedSearchField = null
      this.savedSearchTerm = null
    },

    onSearchSet(payload) {
      if (!payload || !payload.searchTerm) {
        this.resetSearch()
        this.search({ clear: true })
      } else {
        const { searchTerm, searchField } = payload

        this.savedSearchField = searchField || false
        this.savedSearchTerm = searchTerm || false
        this.searchTerm = searchTerm

        this.search({
          search: {
            [searchField.value]: searchTerm,
          },
        })
      }
    },

    createRequestPayload(mergePayload) {
      const {
        baseRequestPayload,
        savedSearchField,
        savedSearchTerm,
        collectionId,
        editNextOrder,
      } = this

      const mergedRequest = {
        ...baseRequestPayload,
        ...mergePayload,
        search: {
          ...baseRequestPayload.search,
          ...mergePayload.search,
        },
      }

      if (collectionId) {
        mergedRequest.collection_id = collectionId

        // if next order, show all items in collection
        if (editNextOrder) {
          mergedRequest.all = true
        }
      }

      if (savedSearchField && savedSearchField.value && savedSearchTerm) {
        mergedRequest.search[savedSearchField.value] = savedSearchTerm
      }

      // check if multiple search params
      if (
        mergedRequest.search &&
        Object.keys(mergedRequest.search).length > 1
      ) {
        mergedRequest.search_type = 'and'
      }

      this.savedRequest = mergedRequest

      return mergedRequest
    },

    async search(searchPayload) {
      this.searchIsLoading = true
      this.tableDataLoaded = false

      const requestPayload = this.createRequestPayload(searchPayload)

      try {
        await this.GET_PRODUCTS(requestPayload)
      } catch (e) {
        console.error({ e })
      } finally {
        this.searchIsLoading = false
        this.tableDataLoaded = true
      }
    },

    async onLoadMoreItems(pageNumber) {
      const payload = {
        page: pageNumber || this.currentPage,
      }

      this.currentPageLocal = parseInt(pageNumber)

      this.loadingPaginationData = true

      const requestPayload = this.createRequestPayload(payload)

      try {
        await this.GET_PRODUCTS(requestPayload)
      } catch (e) {
        console.error('onLoadMoreItesm, GET_PRODUCTS: ', e)
      }

      this.loadingPaginationData = false
    },
  },
}
</script>

<template>
  <div>
    <div class="container">
      <no-ssr>
        <pagination
          class="c-pagination"
          :options="{
            template: VuePaginationTemplate,
            texts: textsTranslations,
          }"
          :value="currentPageLocal"
          :records="totalCount"
          :per-page="12"
          :set-page="handleSetPage"
          :next="handleNext"
          :prev="handlePrev"
          :next-chunk="handleNextChunk"
          :prev-chunk="handlePrevChunk"
          @input="onLoadMoreItems"
          @paginate="onLoadMoreItems"
        />
      </no-ssr>
    </div>
  </div>
</template>

<style lang="scss">
@import '@design';

.page-link.active {
  font-weight: bold;
  color: $color-black;
}

.VuePagination__pagination-item-prev-chunk.disabled,
.VuePagination__pagination-item-next-chunk.disabled {
  display: none;
}

.pagination-previous,
.pagination-next,
.pagination-link,
.pagination-ellipsis {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  cursor: pointer;
}

.pagination:not(:last-child) {
  margin-bottom: 1.5rem;
}

.pagination-previous,
.pagination-next,
.pagination-link,
.pagination-ellipsis {
  -moz-appearance: none;
  -webkit-appearance: none;
  align-items: center;
  border: 1px solid transparent;
  border-radius: 4px;
  box-shadow: none;
  display: inline-flex;
  font-size: 1rem;
  height: 2.5em;
  justify-content: flex-start;
  line-height: 1.5;
  padding-bottom: calc(0.5em - 1px);
  padding-left: calc(0.75em - 1px);
  padding-right: calc(0.75em - 1px);
  padding-top: calc(0.5em - 1px);
  position: relative;
  vertical-align: top;
}

.pagination-previous:focus,
.pagination-next:focus,
.pagination-link:focus,
.pagination-ellipsis:focus,
.is-focused.button,
.is-focused.pagination-previous,
.is-focused.pagination-next,
.is-focused.pagination-link,
.is-focused.pagination-ellipsis,
.pagination-previous:active,
.pagination-next:active,
.pagination-link:active,
.pagination-ellipsis:active,
.is-active.pagination-previous,
.is-active.pagination-next,
.is-active.pagination-link,
.is-active.pagination-ellipsis {
  outline: none;
}

.button[disabled],
.input[disabled],
.textarea[disabled],
.select select[disabled],
.file-cta[disabled],
.file-name[disabled],
.pagination-previous[disabled],
.pagination-next[disabled],
.pagination-link[disabled],
.pagination-ellipsis[disabled],
fieldset[disabled] .button,
fieldset[disabled] .input,
fieldset[disabled] .textarea,
fieldset[disabled] .select select,
.select fieldset[disabled] select,
fieldset[disabled] .file-cta,
fieldset[disabled] .file-name,
fieldset[disabled] .pagination-previous,
fieldset[disabled] .pagination-next,
fieldset[disabled] .pagination-link,
fieldset[disabled] .pagination-ellipsis {
  cursor: not-allowed;
}

.pagination-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.pagination {
  font-size: 1rem;
  margin: -0.25rem;
}

.pagination.is-small {
  font-size: 0.75rem;
}

.pagination.is-medium {
  font-size: 1.25rem;
}

.pagination.is-large {
  font-size: 1.5rem;
}

.pagination.is-rounded .pagination-previous,
.pagination.is-rounded .pagination-next {
  padding-left: 1em;
  padding-right: 1em;
  border-radius: 290486px;
}

.pagination.is-rounded .pagination-link {
  border-radius: 290486px;
}

.pagination,
.pagination-list {
  align-items: center;
  display: flex;
  justify-content: center;
  text-align: center;
}

.pagination-previous,
.pagination-next,
.pagination-link,
.pagination-ellipsis {
  font-size: 1em;
  justify-content: center;
  margin: 0.25rem;
  padding-left: 0.5em;
  padding-right: 0.5em;
  text-align: center;
}

.pagination-previous,
.pagination-next,
.pagination-link {
  border-color: #dbdbdb;
  color: #363636;
  min-width: 2.5em;
}

.pagination-previous:hover,
.pagination-next:hover,
.pagination-link:hover {
  border-color: #b5b5b5;
  color: #363636;
}

.pagination-previous:focus,
.pagination-next:focus,
.pagination-link:focus {
  border-color: #3273dc;
}

.pagination-previous:active,
.pagination-next:active,
.pagination-link:active {
  box-shadow: inset 0 1px 2px rgba(10, 10, 10, 0.2);
}

.pagination-previous[disabled],
.pagination-next[disabled],
.pagination-link[disabled] {
  background-color: #dbdbdb;
  border-color: #dbdbdb;
  box-shadow: none;
  color: #7a7a7a;
  opacity: 0.5;
}

.pagination-previous,
.pagination-next {
  padding-left: 0.75em;
  padding-right: 0.75em;
  white-space: nowrap;
}

.pagination-link.is-current {
  background-color: #3273dc;
  border-color: #3273dc;
  color: #fff;
}

.pagination-ellipsis {
  color: #b5b5b5;
  pointer-events: none;
}

.pagination-list {
  flex-wrap: wrap;
}

@media screen and (max-width: 768px) {
  .pagination {
    flex-wrap: wrap;
  }
  .pagination-previous,
  .pagination-next {
    flex-grow: 1;
    flex-shrink: 1;
  }
  .pagination-list li {
    flex-grow: 1;
    flex-shrink: 1;
  }
}

@media screen and (min-width: 769px), print {
  .pagination-list {
    flex-grow: 1;
    flex-shrink: 1;
    justify-content: flex-start;
    order: 1;
  }
  .pagination-previous {
    order: 2;
  }
  .pagination-next {
    order: 3;
  }
  .pagination {
    justify-content: space-between;
  }
  .pagination.is-centered .pagination-previous {
    order: 1;
  }
  .pagination.is-centered .pagination-list {
    justify-content: center;
    order: 2;
  }
  .pagination.is-centered .pagination-next {
    order: 3;
  }
  .pagination.is-right .pagination-previous {
    order: 1;
  }
  .pagination.is-right .pagination-next {
    order: 2;
  }
  .pagination.is-right .pagination-list {
    justify-content: flex-end;
    order: 3;
  }
}
</style>
