import request from '@scripts/axiosRequestWrapper.js'

export const state = () => ({
  customer: null,
  customerCards: null,
  customerStripe: null,
  customerShopify: null,
  customerStripeId: null,
  customerShopifyId: null,
  customerDefaultPaymentId: null,
})

export const mutations = {
  SET_CUSTOMER(state, payload) {
    state.customer = payload
    state.customerCards = payload.payment_methods
    state.customerStripe = payload.payment_customer
    state.customerShopify = payload.shopify
    state.customerStripeId = payload.payment_customer.id
    state.customerShopifyId = payload.shopify.id
    state.customerDefaultPaymentId = payload.payment_customer.default_source
  },
}

export const actions = {
  async GET_CUSTOMER({ rootState, commit }, payload) {
    const { storeDomain, customerId } = rootState.route

    return new Promise((resolve, reject) => {
      request({
        method: 'get',
        url: `/customer/${storeDomain}/${customerId}`,
      })
        .then((data) => {
          commit('SET_CUSTOMER', data)
          const cards = data.payment_methods

          // set cards in cards store
          commit('cards/SET_CARDS', cards, { root: true })

          resolve(data)
        })
        .catch((error) => {
          reject(error)
        })
    })
  },
}
