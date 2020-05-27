// import Vue from 'vue'

// import request from '@utils/axiosRequestWrapper.js'

export const state = () => ({
  savedNewCheckoutUpdates: [],
  newCheckoutUpdateUpdating: false,
})

export const mutations = {
  setSavedNewCheckoutUpdate(state, updatePayload) {
    state.savedNewCheckoutUpdates.push(updatePayload)
  },

  newCheckoutUpdateUpdating(state, val) {
    state.newCheckoutUpdateUpdating = val
  },

  clearUpdates(state) {
    state.savedNewCheckoutUpdates = []
  },
}

export const actions = {
  /**
   *
   * @param {*} shippingMethods - shipping method update to pass along with origina update
   */
  async COMPLETE_SAVED_NEW_CHECKOUT_UPDATE({ commit, dispatch, state }, shippingMethod) {
    return new Promise((resolve, reject) => {

      const { savedNewCheckoutUpdates } = state
      if (!savedNewCheckoutUpdates) {
        console.log('savedNewCheckoutUpdate')
        reject(new Error('no savedNewCheckoutUpdate'))
      }

      let updatesLength = savedNewCheckoutUpdates.length
      let completedUpdates = 0
      let results = []


      savedNewCheckoutUpdates.forEach( async update => {
        const { updateActionPayload, updateActionStoreName, updateActionName,
          // successMessage
        } = update
        console.log('completeSavedNewCheckoutUpdate update', { shippingMethod },{ update } )

        const savedNewCheckoutUpdateWithShippingUpdate = {
          requestPayload: {
            ...updateActionPayload.requestPayload,
            shipping_rate: {
              handle: shippingMethod.handle,
              price: shippingMethod.price,
              title: shippingMethod.title,
            },
          },
        }

        console.log(
          'savedNewCheckoutUpdateWithShippingUpdate',
          savedNewCheckoutUpdateWithShippingUpdate
        )

        commit('newCheckoutUpdateUpdating', true)

        try {
          const response = await dispatch(`${updateActionStoreName}/${updateActionName}`, savedNewCheckoutUpdateWithShippingUpdate, { root: true })

          // Vue.toasted.global.success({
          //   message: successMessage || 'Updated',
          // })

          results.push(response)
        } catch (e) {
          console.log('subscription/UPDATE_SUBSCRIPTION error: ', e)
          reject(e)

          // Vue.toasted.global.error({
          //   message: e,
          // })
        } finally {
          commit('newCheckoutUpdateUpdating', false)
          completedUpdates += 1
        }

        console.log('check if finished all updates')
        if (updatesLength === completedUpdates) {
          console.log('finished all updates - results: ', { results })
          resolve(results)
          setTimeout(commit('clearUpdates'), 200)
        }
      })
    })
  },
}
