export const state = () => {
  return {
    pageTransition: 'slideOutIn',
    // For mobile screen Actions
    message: '',
    status: '',
  }
}

export const mutations = {
  setPageTransition(state, transition) {
    state.pageTransition = transition
  },

  setMessage(state, action) {
    state.message = action
  },

  setStatus(state, status) {
    state.status = status
  },
}

export const actions = {
  swapPageTransitionDynamic({ commit }, transition) {
    commit('setPageTransition', transition)
    setTimeout(() => {
      commit('setPageTransition', 'slideOutIn')
    }, 1000)
  },
}
