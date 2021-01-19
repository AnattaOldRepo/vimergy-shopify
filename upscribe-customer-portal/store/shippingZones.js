import request from '@scripts/axiosRequestWrapper.js'

export const state = () => ({
  shippingZones: [],
})

export const mutations = {
  SET_SHIPPING_ZONES(state, shippingZones) {
    state.shippingZones = shippingZones
  },
}

export const actions = {
  // Get available shopp shopping zones
  GET_SHIPPING_ZONES({ commit, rootState }) {
    const { storeDomain } = rootState.route
    const { xUpscribeAccessToken } = rootState.auth

    if (!storeDomain) {
      console.error('storeDomain not available')
      return
    }

    return new Promise((resolve, reject) => {
      request({
        method: 'get',
        url: `/shipping/zones/${storeDomain}`,
        headers: {
          'x-upscribe-access-token': xUpscribeAccessToken,
        },
      })
        .then((response) => {
          commit('SET_SHIPPING_ZONES', response)
          commit('countries/SET_COUNTRIES_FROM_SHIPPING_ZONES', response, {
            root: true,
          })
          resolve(response)
        })
        .catch((error) => {
          console.error('error: ', error)
          reject(error)
        })
    })
  },
}
