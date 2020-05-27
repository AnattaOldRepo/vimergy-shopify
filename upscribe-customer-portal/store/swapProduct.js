export const state = () => ({
  swapProduct: null,
})

export const mutations = {
  setSwapProduct(state, product) {
    state.swapProduct = product
  },
}
