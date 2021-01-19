import Vue from 'vue'
import request from '@scripts/axiosRequestWrapper.js'
import {
  getAvailableCollections,
  getDefaultActiveCollection,
  isEmptyObject,
} from '@utils/helpers'

export const state = () => ({
  currentPage: 0,
  totalCount: 0,
  currentCount: 0,
  defaultLimit: 12,

  products: [],
  productImages: null,
  productsLoaded: false,
  productVariantId: '',
  nextOrder: false,
})

export const mutations = {
  SET_PRODUCTS(state, productsPayload) {
    const { currentCount } = state
    const { items, page, total_count, count } = productsPayload

    state.totalCount = total_count
    state.currentPage = parseInt(page)
    state.currentCount = currentCount + count
    state.productsLoaded = true

    Vue.set(state, 'products', [])

    Vue.set(state, 'products', [...items])
  },

  clearAll(state) {
    state.currentPage = 0
    state.totalCount = 0
    state.currentCount = 0
    state.defaultLimit = 12

    state.products = []
    state.productImages = null
    state.productsLoaded = false
  },

  SET_PRODUCT_IMAGES(state, productsResponse) {
    let productImages = {}
    productsResponse.items.forEach((product) => {
      product.images.forEach((image) => {
        const imageSrc = image.src
        productImages[image.product_id] = imageSrc

        image.variant_ids.forEach((variantId) => {
          productImages[variantId] = imageSrc
        })
      })
    })
    state.productImages = productImages
  },

  setProductIdAndSubscriptionId(
    state,
    { productVariantId, nextOrder = false }
  ) {
    state.productVariantId = productVariantId
    state.nextOrder = true
  },
}

export const actions = {
  async GET_PRODUCTS({ state, rootState, commit }, actionPayload = {}) {
    const { storeDomain } = rootState.route
    const { xUpscribeAccessToken } = rootState.auth
    const { editNextOrder } = rootState.editMode
    const { activeCollection, collections } = rootState.collections
    const {
      uiSettings,
      customerPortalSubscriptionProductCollections,
      customerPortalNextOrderProductCollections,
      featuredPortalCollection,
    } = rootState.shop

    const { defaultLimit, currentPage, currentCount, totalCount } = state

    const {
      clear,
      next,
      all,
      limit,
      fields,
      collection_id,
      search,
      search_type,
      page,
      noSetData = false,
      baseStateLoad,
    } = actionPayload

    // returned count limit
    let params = { limit: defaultLimit }

    // check for remaining items
    const retrievedAllItems = totalCount <= currentCount

    if (next) {
      if (retrievedAllItems) return
      params.page = currentPage + 1
    }

    if (collection_id) {
      params.collection_id = collection_id
    }

    if (all || editNextOrder) {
      params.all = true
    }

    // if explicitly set
    if (limit) {
      params.limit = limit
    }

    if (fields) {
      params.fields = fields
    }

    // pass search string
    if (search) {
      params.search = search // ex: {"errored":true}
    }
    if (search_type) params.search_type = search_type
    if (page) params.page = page
    if (limit) params.limit = limit

    if (search || clear || baseStateLoad) commit('clearAll')

    const availableCollections = getAvailableCollections({
      collections,
      editNextOrder,
      customerPortalSubscriptionProductCollections,
      customerPortalNextOrderProductCollections,
      featuredPortalCollection,
    })
    const defaultActiveCollection = getDefaultActiveCollection({
      uiSettings,
      availableCollections,
    })

    commit('collections/setAvailableCollections', availableCollections, {
      root: true,
    })
    commit('collections/setDefaultActiveCollection', defaultActiveCollection, {
      root: true,
    })

    // determine the default products settings
    if (baseStateLoad) {
      if (isEmptyObject(activeCollection)) {
        commit('collections/setActiveCollection', defaultActiveCollection, {
          root: true,
        })
      }

      params = {
        limit: defaultLimit,
        search: {},
        page: 1,
      }
      if (defaultActiveCollection) {
        params.collection_id = defaultActiveCollection.id
      }

      if (editNextOrder) {
        params.all = true
      }
    }

    return new Promise((resolve, reject) => {
      request({
        method: 'get',
        url: `/products/${storeDomain}`,
        params,
        headers: {
          'x-upscribe-access-token': xUpscribeAccessToken,
        },
      })
        .then((response) => {
          if (!noSetData) {
            commit('SET_PRODUCTS', response)
            commit('SET_PRODUCT_IMAGES', response)
          }
          resolve(response)
        })
        .catch((error) => {
          reject(error)
        })
    })
  },
}

export const getters = {
  product(state, getters, rootState, rootGetters) {
    let descriptionHolder = ''
    let firstPTag
    let firstPTagIndex
    let firstPTagLastIndex

    // Find product description
    for (let each of state.products) {
      if (
        each.variants.find((product) => product.id === state.productVariantId)
      ) {
        descriptionHolder = each.body_html
        break
      }
    }

    // Search for first P tag inside the html
    if (descriptionHolder) {
      firstPTagIndex = descriptionHolder.indexOf('<p>')
      firstPTagLastIndex = descriptionHolder.indexOf('</p>')
      if (firstPTagIndex > -1) {
        firstPTag = descriptionHolder.slice(firstPTagIndex, firstPTagLastIndex)
      }
    }

    const activeSubscription =
      rootGetters['activeSubscription/activeSubscription']

    // in case of next order show next items else items
    const productsList = state.nextOrder
      ? activeSubscription.next && activeSubscription.next.items
      : activeSubscription.items

    const activeProduct = productsList.find(
      (each) => each.variant_id === state.productVariantId
    )

    if (activeProduct && firstPTag && firstPTag.length > 100) {
      firstPTag = firstPTag.slice(0, 100) + '...'
      activeProduct['full_description'] = descriptionHolder
    } else if (activeProduct && firstPTag && descriptionHolder.length > 100) {
      firstPTag = firstPTag + '...'
      activeProduct['full_description'] = descriptionHolder
    }

    if (activeProduct) {
      activeProduct['description'] = firstPTag
    }

    return activeProduct
  },
}
