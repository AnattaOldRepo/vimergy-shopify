export const state = () => ({
  customerId: null,
  storeDomain: null,
})

export const mutations = {
  setCustomerId(state, val) {
    state.customerId = val
  },

  setStoreDomain(state, val) {
    state.storeDomain = val
  },
}
