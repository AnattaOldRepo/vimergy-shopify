import request from '@scripts/axiosRequestWrapper.js'

export const state = () => ({
  otoProductVariantId: false,
  otoQueueId: false,
  otoSubscriptionId: false,
  otoAddProduct: false,
})

export const mutations = {
  setOtoProductVariantId(state, val) {
    state.otoProductVariantId = val
  },

  setOtoQueueId(state, val) {
    state.otoQueueId = val
  },

  setOtoSubscriptionId(state, val) {
    state.otoSubscriptionId = val
  },

  setOtoAddProduct(state, val) {
    state.otoAddProduct = val
  },

  clearOto(state) {
    state.otoProductVariantId = false
    state.otoQueueId = false
    state.otoSubscriptionId = false
    state.otoAddProduct = false
  },
}

export const actions = {
  async ADD_OTO_PRODUCT_TO_OTO_QUEUE({ commit, state, rootState }) {
    const { otoQueueId, otoSubscriptionId, otoProductVariantId } = state
    const { xUpscribeAccessToken } = rootState.auth

    const requestPayload = {
      items: [
        {
          variant_id: parseInt(otoProductVariantId),
          quantity: 1,
        },
      ],
    }

    return new Promise((resolve, reject) => {
      request({
        method: 'post',
        url: `/subscription/queue/${otoSubscriptionId}/${otoQueueId}`,
        data: JSON.stringify(requestPayload),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-upscribe-access-token': xUpscribeAccessToken,
        },
      })
        .then((data) => {
          commit('subscriptions/SET_UPDATED_NEXT_ORDER', data, { root: true })

          // delay for the subscriptions to finish updating
          setTimeout(() => {
            resolve(data)
          }, 1000)
        })
        .catch((error) => {
          reject(error)
        })
    })
  },
}
