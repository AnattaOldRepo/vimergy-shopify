export const state = () => {
  return {
    isOpenModalCalendar: false,
    closeAnimation: false,
  }
}

export const mutations = {
  openModalCalendar(state) {
    state.isOpenModalCalendar = true
    state.closeAnimation = false
  },

  closeModalCalendar(state) {
    state.isOpenModalCalendar = false
  },

  setCloseAnimation(state) {
    state.closeAnimation = true
  },
}

export const actions = {
  closeModalCalendar({ state, commit }) {
    commit('setCloseAnimation')
    setTimeout(() => {
      commit('closeModalCalendar')
    }, 500)
  },
}
