import request from '@scripts/axiosRequestWrapper.js'

export const state = () => ({
  orders: [],
  ordersLoaded: false,
  subscriptionOrders: [],
  currentOrderForMobile: {},
  drawerSubscriptionHistoryOpen: false,
})

export const mutations = {
  SET_ORDER_BY_INDEX(state, { order, index }) {
    state.orders.splice(index, 0, order)
  },

  SET_ORDERS(state, orders) {
    state.orders = orders
  },

  setOrdersLoaded(state, val) {
    state.ordersLoaded = val
  },

  setSubscriptionOrder(state, val) {
    state.subscriptionOrders = val
  },

  SET_DRAWER_SUBSCRIPTION_HISTORY_OPEN(state, bool) {
    state.drawerSubscriptionHistoryOpen = bool
  },

  setCurrentOrderForMobile(state, val) {
    state.currentOrderForMobile = val
  },
}

export const actions = {
  async GET_ORDERS({ rootState, commit }) {
    const { storeDomain, customerId } = rootState.route
    const { xUpscribeAccessToken } = rootState.auth

    return new Promise((resolve, reject) => {
      request({
        method: 'get',
        url: `/orders/${storeDomain}/${customerId}`,
        headers: {
          'x-upscribe-access-token': xUpscribeAccessToken,
        },
      })
        .then((data) => {
          const orders = data.items
          orders.sort((a, b) => a.processed_at - b.processed_at)

          commit('SET_ORDERS', orders)
          commit('setOrdersLoaded', true)
          resolve(data)
        })
        .catch((error) => {
          console.error('GET_ORDERS error: ', error)
          commit('setOrdersLoaded', false)
          reject(error)
        })
    })
  },

  async CHECK_FOR_PROCESSING_SUBS({ rootState }) {
    const { storeDomain, customerId } = rootState.route
    const { xUpscribeAccessToken } = rootState.auth

    let params = {
      limit: 10,
      search: {
        create_subscription: true,
      },
    }

    return new Promise((resolve, reject) => {
      request({
        method: 'get',
        url: `/orders/${storeDomain}/${customerId}?limit=100`,
        params,
        headers: {
          'x-upscribe-access-token': xUpscribeAccessToken,
        },
      })
        .then((data) => {
          resolve(data)
        })
        .catch((error) => {
          console.error('CHECK_FOR_PROCESSING_SUBS error: ', error)
          reject(error)
        })
    })
  },

  async GET_SUBSCRIPTION_ORDERS(
    { rootState, commit },
    subscriptionShopifyOrderId
  ) {
    const { storeDomain, customerId } = rootState.route
    const { xUpscribeAccessToken } = rootState.auth

    let params = {
      limit: 20,
      search: {
        id: subscriptionShopifyOrderId,
      },
    }

    return new Promise((resolve, reject) => {
      request({
        method: 'get',
        url: `/orders/${storeDomain}/${customerId}`,
        params,
        headers: {
          'x-upscribe-access-token': xUpscribeAccessToken,
        },
      })
        .then((data) => {
          resolve(data)
          commit('setSubscriptionOrder', data.items)
        })
        .catch((error) => {
          console.error('CHECK_FOR_PROCESSING_SUBS error: ', error)
          reject(error)
        })
    })
  },
}
