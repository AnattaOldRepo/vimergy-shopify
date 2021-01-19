export const state = () => ({
  editNextOrder: false,
})

export const mutations = {
  commitSetEditNextOrder(state, val) {
    state.editNextOrder = val
  },
}

export const actions = {
  setEditNextOrder({commit, dispatch}, val) {
    commit('commitSetEditNextOrder', val)

    // reset active collections
    commit('collections/setActiveCollection', false, {root:true})
    dispatch('products/GET_PRODUCTS', {clear: true, baseStateLoad: true}, {root:true})
  },
}
