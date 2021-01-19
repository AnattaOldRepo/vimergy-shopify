import request from '@scripts/axiosRequestWrapper.js'

export const state = () => ({
  activeCollection: false,

  collectionsLoaded: false,
  collectionImages: null,

  collectionsPage: 0,
  collectionsTotalCount: 0,
  collectionsCurrentCount: 0,

  collections: [],
  collectionsLimit: 100,

  availableCollections: null,
  defaultActiveCollection: null,
})

export const mutations = {
  setActiveCollection(state, val) {
    if (val) {
      state.activeCollection = { ...val }
    } else {
      state.activeCollection = false
    }
  },

  setAvailableCollections(state, availableCollections) {
    state.availableCollections = availableCollections
  },
  setDefaultActiveCollection(state, defaultActiveCollection) {
    state.defaultActiveCollection = defaultActiveCollection
  },

  SET_COLLECTIONS(state, collectionsPayload) {
    const { collectionsCurrentCount } = this
    const { items, page, total_count, count } = collectionsPayload
    if (!items) return

    items.forEach((item) => state.collections.push(item))

    state.collectionsTotalCount = total_count
    state.collectionsPage = page
    state.collectionsCurrentCount = collectionsCurrentCount + count
    state.collectionsLoaded = true
  },

  clearCollections(state) {
    state.collectionsPage = 0
    state.collectionsTotalCount = 0
    state.collectionsCurrentCount = 0
    state.collections = []
  },
}

export const actions = {
  async GET_COLLECTIONS({ state, rootState, commit }, actionPayload) {
    const { storeDomain } = rootState.route
    // const { xUpscribeAccessToken  } = rootState.auth

    const {
      collectionsPage,
      collectionsTotalCount,
      collectionsCurrentCount,
      collectionsLimit,
    } = state

    const payload = actionPayload || {}
    const { clear, next } = payload

    // returned count limit
    let params = { limit: collectionsLimit }

    // check for remaining items
    const retrievedAllItems = collectionsTotalCount <= collectionsCurrentCount

    if (next) {
      if (retrievedAllItems) return
      params.page = collectionsPage + 1
    }

    if (clear) commit('clearCollections')

    return new Promise((resolve, reject) => {
      request({
        method: 'get',
        url: `/collections/${storeDomain}`,
        // headers: { 'x-upscribe-access-token': xUpscribeAccessToken  },
      })
        .then((response) => {
          commit('SET_COLLECTIONS', response)
          resolve(response)
        })
        .catch((error) => {
          reject(error)
        })
    })
  },
}
