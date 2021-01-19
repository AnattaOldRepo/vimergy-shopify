import request from '@scripts/axiosRequestWrapper.js'

export const state = () => ({
  accessTokenValid: null,
  xUpscribeAccessToken: null,
})
export const mutations = {
  setAccessTokenValid(state, val) {
    state.accessTokenValid = val
  },
  setXUpscribeAccessToken(state, val) {
    state.xUpscribeAccessToken = val
  },
}

export const actions = {
  async VALIDATE_CUSTOMER_METAFIELD_ACCESS_TOKEN({ commit, rootState }, {customerId, accessToken}) {
    const { storeDomain } = rootState.route


    return new Promise((resolve, reject) => {
      request({
        method: 'get',
        // url: `/validate_user_token`, // eventually get a real validation endpiont, for now just
        // use the only endpoint that is actually secured
        url: `/customer/${storeDomain}/${customerId}?validate=true`,
        // data: JSON.stringify(requestPayload),
        headers: {
          'x-upscribe-access-token': accessToken,
        },
      })
        .then((data) => {
          commit('setAccessTokenValid', true)
          commit('setXUpscribeAccessToken', accessToken)
          resolve(accessToken)
        })
        .catch((error) => {
          reject(error)
        })
    })
  },


  async VALIDATE_ACCESS_TOKEN({ commit }, {customerId, accessToken}) {

    const requestPayload = {
      customer_id: customerId,
      token: accessToken,
    }


    return new Promise((resolve, reject) => {
      request({
        method: 'post',
        url: `/validate_user_token`,
        data: JSON.stringify(requestPayload),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
        .then((data) => {
          commit('setAccessTokenValid', data.success)
          commit('setXUpscribeAccessToken', accessToken)
          resolve(data.success)
        })
        .catch((error) => {
          reject(error)
        })
    })
  },

  async GENERATE_CUSTOMER_METAFIELD_ACCESS_TOKEN({ rootState }, {customerId}) {
    const { storeDomain } = rootState.route

    return new Promise((resolve, reject) => {
      request({
        method: 'post',
        url: `/customer/token/generate/${storeDomain}/${customerId}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
        .then((data) => {
          resolve(true)
        })
        .catch((error) => {
          reject(error)
        })
    })
  },
}
