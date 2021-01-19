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
  async COMPLETE_SAVED_NEW_CHECKOUT_UPDATE(
    { commit, dispatch, state },
    shippingMethod
  ) {
    return new Promise((resolve, reject) => {
      const { savedNewCheckoutUpdates } = state
      if (!savedNewCheckoutUpdates) {
        reject(new Error('no savedNewCheckoutUpdate'))
      }

      let updatesLength = savedNewCheckoutUpdates.length
      let completedUpdates = 0
      let results = []

      savedNewCheckoutUpdates.forEach(async (update) => {
        const {
          updateActionPayload,
          updateActionStoreName,
          updateActionName,
        } = update
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

        commit('newCheckoutUpdateUpdating', true)

        try {
          const response = await dispatch(
            `${updateActionStoreName}/${updateActionName}`,
            savedNewCheckoutUpdateWithShippingUpdate,
            { root: true }
          )

          results.push(response)
        } catch (e) {
          console.error('subscription/UPDATE_SUBSCRIPTION error: ', e)
          reject(e)
        } finally {
          commit('newCheckoutUpdateUpdating', false)
          completedUpdates += 1
        }

        if (updatesLength === completedUpdates) {
          resolve(results)
          setTimeout(commit('clearUpdates'), 200)
        }
      })
    })
  },
}
