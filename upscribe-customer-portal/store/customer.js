import request from '@scripts/axiosRequestWrapper.js'

export const state = () => ({
  customer: null,
  customerCards: null,
  customerStripe: null,
  customerShopify: null,
  customerStripeId: null,
  customerShopifyId: null,
  customerDefaultPaymentId: null,
  paymentCustomers: null,
})

export const mutations = {
  SET_CUSTOMER(state, payload) {
    state.customer = payload
    state.paymentCustomers = payload.payment_customers


    if (payload.payment_customers && payload.payment_customers.length) {
      state.customerStripeId = payload.payment_customers[0].id
      state.customerStripe = payload.payment_customers[0]
      state.customerDefaultPaymentId = payload.payment_customers[0].default_source
    }

    state.customerShopify = payload.shopify

    if (payload.payment_customer && payload.payment_customer.id) {
      state.customerStripeId = payload.payment_customer.id
    }

    if (payload.shopify && payload.shopify.id) {
      state.customerShopifyId = payload.shopify.id
    }
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
          const payment_methods = data.payment_methods

          // set cards in cards store
          commit('cards/SET_CARDS', payment_methods, { root: true })

          resolve(data)
        })
        .catch((error) => {
          reject(error)
        })
    })
  },
}
