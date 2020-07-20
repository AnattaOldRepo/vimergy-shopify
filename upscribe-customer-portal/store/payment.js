export const state = () => ({
  paymentType: null,
  paymentSource: null,
  savedSourceData: null,
  paymentValidationClientSecret: null,
  paymentValidationSource: null,
  paymentValidationLiveMode: null,
})

export const mutations = {
  setPaymentType(state, val) {
    state.paymentType = val
  },
  setPaymentSource(state, val) {
    state.paymentSource = val
  },
  setSavedPaymentData(state, val) {
    state.savedPaymentData = val
  },
  setPaymentValidationSource(state, val) {
    state.paymentSource = val
  },
  setPaymentValidationClientSecret(state, val) {
    state.paymentClientSecret = val
  },
  setPaymentValidationLiveMode(state, val) {
    state.paymentLiveMode = val
  },
  resetPaymentData(state) {
    state.paymentType = null
    state.paymentSource = null
    state.savedSourceData = null
    state.paymentClientSecret = null
    state.paymentSource = null
    state.paymentLiveMode = null
  },
}

export const actions = {
  /**
   *
   * @param {*} param0
   * @param {*} source
   * {
      type: 'sepa_debit',
      sepa_debit: {
        ideal: 'src_16xhynE8WzK49JbAs9M21jaR',
      },
      currency: 'eur',
      owner: {
        name: 'Jenny Rosen',
      }
   */
  CREATE_SEPA_DEBIT_SOURCE({ commit, dispatch }, { sepaDebitSourcePayload }) {
    const stripe = window.stripe

    stripe.createSource(sepaDebitSourcePayload).then((result) => {
      console.log('create_sepa_debit_source', { result })
    })
  },
}
