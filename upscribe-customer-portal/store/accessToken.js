import request from '@scripts/axiosRequestWrapper.js'

export const state = () => ({
  accessTokenValid: null,
})
export const mutations = {
  setAccessTokenValid(state, val) {
    state.accessTokenValid = val
  },
}

export const actions = {
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
          resolve(data.success)
        })
        .catch((error) => {
          reject(error)
        })
    })
  },
}
