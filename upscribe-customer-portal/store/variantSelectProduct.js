export const state = () => ({
  variantSelectProduct: null,
})

export const mutations = {
  setVariantSelectProduct(state, product) {
    state.variantSelectProduct = product
  },
}
