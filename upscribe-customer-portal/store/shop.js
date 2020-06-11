import axios from 'axios'
const API = process.env.API

export const state = () => ({
  store: null,
  shopData: null,
  shopLoaded: false,
  stripePublicKey: null,
  braintreeClientToken: null,
  storeLogo: null,
  shopifyStorefrontAccessToken: null,
  cancellationReasons: null,
  currencySymbol: null,
})

export const mutations = {
  SET_SHOP_DATA(state, data) {
    console.log('SET_SHOP_DATA data.shop', data.shop)
    state.store = data

    state.shopData = data.shop

    state.stripePublicKey = data.stripe_public_key
    state.braintreeClientToken = data.braintree_client_token

    state.storeLogo = data.logo_url
    state.shopifyStorefrontAccessToken = data.shopify_storefront_access_token
    state.cancellationReasons = data.cancellation_reasons

    state.cname = data.cname
    state.google_analytics_id = data.google_analytics_id
    state.google_tag_manager_id = data.google_tag_manager_id
    state.klaviyo_key = data.klaviyo_key
    state.logo_url = data.logo_url
    state.payment_type = data.payment_type
    state.refersion_public_key = data.refersion_public_key
    state.refersion_secret_key = data.refersion_secret_key
    state.segment_analytics_id = data.segment_analytics_id
    state.shopify_storefront_access_token = data.shopify_storefront_access_token
    state.stripe_public_key = data.stripe_public_key

    // Set shop currency
    let currencyCode = data.shop.currency
    if (!currencyCode) {
      console.log('No currency code available on store, using USD default')
      currencyCode = 'USD'
    }
    let zeroAmount = 0
    let currencySymbol = zeroAmount
      .toLocaleString('en', { style: 'currency', currency: currencyCode })
      .replace(/\d+([,.]\d+)?/g, '')
    state.currencySymbol = currencySymbol

    state.shopLoaded = true
  },
}

export const actions = {
  /**
   * Make request to Upscribe backend for store info
   * @param {object} store - vuex store
   * @param {object} payload - contains info for checkout request
   * @param {string} payload.shopifyDomain - the shopify store domain
   *
   */
  GET_SHOP({ commit, rootState }) {
    const { storeDomain } = rootState.route

    return new Promise((resolve, reject) => {
      axios
        .get(`${API}/store/${storeDomain}`)
        .then((response) => {
          commit('SET_SHOP_DATA', response.data)
          resolve(response)
        })
        .catch((error) => {
          console.log('GET_SHOP error: ', error)
          reject(error)
        })
    })
  },
}
