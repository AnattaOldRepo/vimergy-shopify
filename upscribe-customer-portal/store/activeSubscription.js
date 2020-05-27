export const state = () => ({
  activeSubscriptionId: null,
  currentChosenSubscription: null,
  activeSubscriptionSave: null,
})

export const mutations = {
  setActiveSubscriptionId(state, orderId) {
    console.log(orderId)
    state.activeSubscriptionId = orderId
  },

  setActiveSubscriptionSave(state, activeSubscriptionSave) {
    state.activeSubscriptionSave = activeSubscriptionSave
  },

  setCurrentChosenSubscription(state, subscription) {
    state.currentChosenSubscription = subscription
  },
}

export const actions = {
  /**
   * If a fakeActiveSubscriptionUpdate fails, revert back to the saved subscription state, so the UI mataches their actual subscription / next order settings
   */

  revertToActiveSubscriptionSave({ state, commit }) {
    commit(
      'subscriptions/SET_UPDATED_SUBSCRIPTION',
      state.activeSubscriptionSave,
      {
        root: true,
      }
    )
    commit(
      'subscriptions/SET_UPDATED_NEXT_ORDER',
      state.activeSubscriptionSave.next,
      { root: true }
    )
  },

  /**
   * Immediately updates the active subscription data/ui to match what _should_ occur from the update
   *
   * Update active subscription and active subscription next based on if the product update was in nextOrder mode or current subscription settings mode
   */
  fakeActiveSubscriptionUpdate(
    { getters, commit },
    {
      fakeItemsUpdatePayload,
      updateMode, // both, next, subscription
    }
  ) {
    // save current true state - pre update, for a backup if we need to revert fake update
    commit('setActiveSubscriptionSave', getters.activeSubscription)

    const { activeSubscriptionMain, activeSubscriptionNextOrder } = getters

    // merge in fake payload to update UI
    const fakedSubscription = {
      ...activeSubscriptionMain,
      items: fakeItemsUpdatePayload,
    }

    const fakedNext = {
      ...activeSubscriptionNextOrder,
      items: fakeItemsUpdatePayload,
    }

    // set merged subsction in subscriptions array

    // if settings mode but updating both - update both the next order and the main subscription data
    if (updateMode === 'both') {
      commit('subscriptions/SET_UPDATED_SUBSCRIPTION', fakedSubscription, {
        root: true,
      })
      commit('subscriptions/SET_UPDATED_NEXT_ORDER', fakedNext, { root: true })
    }
    // if next order mode, update just the next order
    else if (updateMode === 'next') {
      commit('subscriptions/SET_UPDATED_NEXT_ORDER', fakedNext, { root: true })
    }
    // if settings mode, update just the main subscription
    else if (updateMode === 'subscription') {
      commit('subscriptions/SET_UPDATED_SUBSCRIPTION', fakedSubscription, {
        root: true,
      })
    } else {
      console.log('fakeActiveSubscriptionUpdate - update mode: ', updateMode)
    }
  },
}

export const getters = {
  activeSubscription(state, getters, rootState) {
    const { subscriptions } = rootState.subscriptions
    const { activeSubscriptionId } = state
    if (!subscriptions || !activeSubscriptionId) return false
    let activeSubscription = false
    // Refactored from O(n**) to O(1) run time by using current hashed table

    if (subscriptions[activeSubscriptionId]) {
      activeSubscription = subscriptions[activeSubscriptionId]
    }

    console.log(activeSubscription, '2')
    return activeSubscription
  },

  activeQueue(state, getters, rootState) {
    const { subscriptions } = rootState.subscriptions
    const { activeSubscriptionId } = state

    if (!subscriptions || !activeSubscriptionId) return false

    let activeSubscription = false

    if (subscriptions[activeSubscriptionId]) {
      activeSubscription = subscriptions[activeSubscriptionId].next
    }
    return activeSubscription
  },

  activeSubscriptionMain(state, getters, rootState) {
    const { subscriptions } = rootState.subscriptions
    const { activeSubscriptionId } = state
    if (!subscriptions || !activeSubscriptionId) return false
    let activeSubscription = false
    Object.keys(subscriptions).forEach((subscriptionKey) => {
      let subscription = subscriptions[subscriptionKey]
      if (subscription.id === activeSubscriptionId) {
        activeSubscription = subscription
      }
    })
    return activeSubscription
  },

  activeSubscriptionNextOrder(state, getters, rootState) {
    const { subscriptions } = rootState.subscriptions
    const { activeSubscriptionId } = state
    if (!subscriptions || !activeSubscriptionId) return false
    let activeSubscription = false

    // Refactored from O(n**) to O(1) run time by using current hashed table
    if (subscriptions[activeSubscriptionId]) {
      activeSubscription = subscriptions[activeSubscriptionId]
    }

    return activeSubscription
  },

  activeSubscriptionNextDate(state, getters, rootState) {
    const { activeQueue } = getters

    if (!activeQueue) return false
    return activeQueue.date
  },

  activeBillingAddress(state, getters, rootState, rootGetters) {
    const { editNextOrder } = rootState.editMode
    const { activeSubscription, activeQueue } = getters

    if (editNextOrder) {
      return activeQueue.billing_address
    } else {
      return activeSubscription.billing_address
    }
  },

  activeShippingAddress(state, getters, rootState, rootGetters) {
    const { editNextOrder } = rootState.editMode
    const { activeSubscription, activeQueue } = getters

    if (editNextOrder) {
      return activeQueue.shipping_address
    } else {
      return activeSubscription.shipping_address
    }
  },

  activeTotalPrice(state, getters, rootState, rootGetters) {
    const { editNextOrder } = rootState.editMode
    const { activeSubscription, activeQueue } = getters

    if (editNextOrder) {
      return activeQueue.total_price
    } else {
      return activeSubscription.total_price
    }
  },

  activeSubscriptionIsExpiredTrial(state, getters, rootState) {
    const { subscriptions } = rootState.subscriptions
    const { activeSubscriptionId } = state

    if (!subscriptions || !activeSubscriptionId) return false

    let activeSubscription = false

    Object.keys(subscriptions).forEach((subscriptionKey) => {
      let subscription = subscriptions[subscriptionKey]
      if (subscription.id === activeSubscriptionId) {
        // set active subscription settings to main settings or next order settings depending on current edit mode state
        activeSubscription = subscription
      }
    })

    if (activeSubscription) {
      if (activeSubscription.active) {
        return false // is active
      }
      // trial subscription inactive
      else if (
        !activeSubscription.active &&
        activeSubscription.charge_limit > 1 &&
        activeSubscription.cancellation_reason === 'Trial period has expired'
      ) {
        return true
      }

      // trial onetime subscription inactive
      else if (
        !activeSubscription.active &&
        !activeSubscription.charge_limit &&
        activeSubscription.cancellation_reason === 'Trial period has expired'
      ) {
        return true
      }
    }

    return undefined
  },
}
