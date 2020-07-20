export const state = () => ({
  editNextOrder: false,
})

export const mutations = {
  setEditNextOrder(state, val) {
    state.editNextOrder = val
  },
}
