import request from '@scripts/axiosRequestWrapper.js'

export const state = () => ({
  cards: null,
  activeEditCard: null,
  newSwapCard: null,
})
export const getters = {
  activeCardId(state, getters, rootState, rootGetters) {
    const activeSubscription =
      rootGetters['activeSubscription/activeSubscription']
    const activeQueue = rootGetters['activeSubscription/activeQueue']
    const { editNextOrder } = rootState.editMode
    return editNextOrder
      ? activeQueue.payment_method_id
      : activeSubscription.payment_method_id
  },
  activeCard(state, getters, rootState, rootGetters) {

    const { activeCardId } = getters

    const { cards } = state

    if (!cards || !activeCardId) return false

    return cards.filter((card) => {
      return card.id === activeCardId
    })[0]
  },
}

export const mutations = {
  SET_CARDS(state, cards) {
    if (cards) {
      state.cards = cards
    } else {
      console.log('No cards available customer.')
    }
  },

  SET_UPDATED_CARD(state, updatedCard) {
    const updateIndex = state.cards.findIndex(
      (card) => card.id === updatedCard.id
    )
    if (updateIndex !== -1) state.cards.splice(updateIndex, 1, updatedCard)
  },

  setActiveEditCard(state, card) {
    state.activeEditCard = card
  },

  setNewSwapCard(state, card) {
    state.newSwapCard = card
  },
}

export const actions = {
  async GET_CARDS({ rootState, commit, dispatch }, payload) {
    const { storeDomain } = rootState.route
    const { customerShopifyId } = rootState.customer

    const lastItem = payload && payload.lastItem ? payload.lastItem : false

    let url = null
    if (lastItem) {
      url = `/paymentmethods/${storeDomain}/${customerShopifyId}?last=${lastItem}`
    } else {
      url = `/paymentmethods/${storeDomain}/${customerShopifyId}`
    }

    return new Promise((resolve, reject) => {
      request({
        method: 'get',
        url,
      })
        .then((data) => {
          // if additional items
          if (data.last) {
            // get next batch of products
            dispatch('GET_CARDS', {
              lastItem: data.last,
            })
          }


          commit('SET_CARDS', data.items)

          resolve(data)
        })
        .catch((error) => {
          reject(error)
        })
    })
  },

  async CREATE_PAYMENT_METHOD({ rootState, commit, dispatch }, {paymentMethod, paymentType}) {
    const { storeDomain } = rootState.route
    const { customerShopifyId } = rootState.customer

    if (!paymentType) {
      console.log('paymentType required in CREATE_PAYMENT_METHOD')
      return
    }

    if (!customerShopifyId) {
      console.log('no matching customerPaymentId')
      return
    }

    const url = `/paymentmethod/${storeDomain}/${customerShopifyId}?type=${paymentType}`


    return new Promise((resolve, reject) => {
      request({
        method: 'post',
        url,
        data: JSON.stringify(paymentMethod),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
        .then((response) => {
          commit('SET_CARDS', response.items)
          resolve(response.items)
        })
        .catch((error) => {
          reject(error)
        })
    })
  },

  /**
   *
   * @param {*} stripeCardId
   * @param {*} updatePayload - any items listed here: https://stripe.com/docs/api/cards/update
   */
  async UPDATE_PAYMENT_METHOD(
    { rootState, commit, dispatch },
    { paymentMethodId, updatePayload, paymentCustomerId, paymentType }
  ) {
    const { storeDomain } = rootState.route

    const { paymentCustomers } = rootState.customer

    console.log('updste_payment_method', { paymentMethodId, updatePayload, paymentType })

    console.log({paymentCustomers})

    if (!paymentCustomers) {
      console.log('paymentCustomers required')
      return
    }

    if (!paymentType) {
      console.log('paymentType required in UPDATE_PAYMENT_METHOD')
      return
    }

    const newPaymentMethodGatewayType = paymentType.includes('stripe') ? 'stripe' : 'braintree'
    console.log({newPaymentMethodGatewayType})

    let customerPaymentId = false

    paymentCustomers.forEach(paymentCustomer => {
      if (paymentCustomer.type.includes(newPaymentMethodGatewayType)) {
        customerPaymentId = paymentCustomer.id
      }
    })

    if (!customerPaymentId) {
      console.log('no matching customerPaymentId: ', {newPaymentMethodGatewayType}, )
      return
    }

    const url = `/paymentmethod/update/${storeDomain}/${paymentCustomerId}/${paymentMethodId}`

    return new Promise((resolve, reject) => {
      request({
        method: 'post',
        url,
        data: JSON.stringify(updatePayload),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
        .then((data) => {
          commit('SET_UPDATED_CARD', data)
          commit('setActiveEditCard', data)

          resolve(data)
        })
        .catch((error) => {
          reject(error)
        })
    })
  },

  async REMOVE_PAYMENT_METHOD({ rootState, commit, dispatch }, {paymentMethodId, paymentCustomerId}) {
    const { storeDomain } = rootState.route

    if (!paymentCustomerId) {
      console.log('no matching customerPaymentId')
      return
    }

    const url = `/paymentmethod/delete/${storeDomain}/${paymentCustomerId}/${paymentMethodId}`


    return new Promise((resolve, reject) => {
      request({
        method: 'get',
        url,
      })
        .then((response) => {
          commit('SET_CARDS', response.items)
          resolve(response)
        })
        .catch((error) => {
          reject(error)
        })
    })
  },
}
