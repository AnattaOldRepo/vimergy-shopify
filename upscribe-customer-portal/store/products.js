import request from '@scripts/axiosRequestWrapper.js'

export const state = () => ({
  products: null,
  productsLoaded: false,
  productImages: null,
  productVariantId: '',
  nextOrder: false,
})

export const mutations = {
  SET_PRODUCTS(state, payload) {
    // only subscription enabled products
    state.products = payload.products.filter((product) => {
      let final = {}
      product.metafields.forEach((metafield) => {
        final[metafield.key] = metafield.value
      })
      return final.enable_subscription
    })

    state.productsLoaded = true
  },
  /**
   * Create product images hash for product id and variant id
   */

  SET_PRODUCT_IMAGES(state, payload) {
    let productImages = {}
    payload.products.forEach((product) => {
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
  async GET_PRODUCTS({ rootState, commit, dispatch }, payload) {
    const { storeDomain } = rootState.route
    const lastItem = payload && payload.lastItem ? payload.lastItem : false
    const clear = !!(payload && payload.clear)

    if (clear) {
      commit('SET_PRODUCTS', null)
    }

    let url = null
    if (lastItem) {
      url = `/products/${storeDomain}?last=${lastItem}`
    } else {
      url = `/products/${storeDomain}?limit=100&fields=collections,handle,id,image,images,metafields,title,variants`
    }

    return new Promise((resolve, reject) => {
      request({
        method: 'get',
        url,
      })
        .then((data) => {
          // if additional items
          if (data.last) {
            // get next batch of products
            dispatch('GET_PRODUCTS', {
              lastItem: data.last,
            })
          }

          commit('SET_PRODUCTS', {
            products: data.items,
          })

          commit('SET_PRODUCT_IMAGES', {
            products: data.items,
          })

          resolve(data)
        })
        .catch((error) => {
          reject(error)
        })
    })
  },
}

export const getters = {
  hashedCollections(state, getters, rootState) {
    const hashedCollections = {}
    const filteredCollections = {}
    const inOrderHashedCollections = {}
    let featuredPortalCollection

    if (rootState.shop.featuredPortalCollection) {
      featuredPortalCollection = rootState.shop.featuredPortalCollection
    }

    // Create hashed table handle key with products id
    if (state.products) {
      state.products.forEach((each) => {
        each.collections.forEach((eachCollection) => {
          if (
            eachCollection &&
            eachCollection.handle &&
            hashedCollections[eachCollection.handle]
          ) {
            hashedCollections[eachCollection.handle].items.push(each)
          } else if (eachCollection && eachCollection.handle) {
            hashedCollections[eachCollection.handle] = {
              handle: eachCollection.handle,
              title: eachCollection.title,
              items: [each],
            }
          }
        })
      })
    }

    if (featuredPortalCollection) {
      featuredPortalCollection.forEach((each) => {
        if (hashedCollections[each]) {
          filteredCollections[each] = hashedCollections[each]
        }
      })
    }

    Object.keys(filteredCollections)
      .sort()
      .forEach((each) => {
        inOrderHashedCollections[each] = hashedCollections[each]
      })

    if (
      Object.entries(inOrderHashedCollections).length > 0 &&
      !inOrderHashedCollections.hasOwnProperty('all')
    ) {
      inOrderHashedCollections['all'] = []
      for (let each in inOrderHashedCollections) {
        if (each !== 'all') {
          inOrderHashedCollections['all'].push(inOrderHashedCollections[each])
        }
      }
    }
    return inOrderHashedCollections
  },
  // gives currently selected product
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
