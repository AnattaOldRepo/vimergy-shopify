export const state = () => ({
  loadActionState: null,
})

export const mutations = {
  setLoadActionState(state, val) {
    state.loadActionState = val
  },
}
