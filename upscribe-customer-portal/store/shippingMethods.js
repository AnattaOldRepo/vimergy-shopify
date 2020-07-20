import request from '@scripts/axiosRequestWrapper.js'

export const state = () => ({
  shippingMethods: null,
  activeEditShippingMethod: null,
  newSwapShippingMethod: null,
})
export const getters = {
  activeShippingMethod(state, getters, rootState, rootGetters) {
    const activeSubscription =
      rootGetters['activeSubscription/activeSubscription']

    return activeSubscription.shipping_lines
      ? activeSubscription.shipping_lines[0]
      : false
  },
}

export const mutations = {
  SET_SHIPPING_METHODS(state, shippingMethods) {
    state.shippingMethods = shippingMethods
  },

  setActiveEditShippingMethod(state, shippingMethod) {
    state.activeEditShippingMethod = shippingMethod
  },

  setNewSwapShippingMethod(state, shippingMethod) {
    state.newSwapShippingMethod = shippingMethod
  },

  clearShippingMethods(state) {
    state.shippingMethods = null
  },
}

export const actions = {
  async GET_SUBSCRIPTION_SHIPPING_METHODS({ rootState, rootGetters, commit }) {
    const { storeDomain, customerId } = rootState.route
    const { id } = rootGetters['activeSubscription/activeSubscription']
    let url = `/subscription/shipping/${storeDomain}/${customerId}/${id}`
    return new Promise((resolve, reject) => {
      request({
        method: 'get',
        url,
      })
        .then((data) => {
          commit('SET_SHIPPING_METHODS', data)

          resolve(data)
        })
        .catch((error) => {
          reject(error)
        })
    })
  },
}
