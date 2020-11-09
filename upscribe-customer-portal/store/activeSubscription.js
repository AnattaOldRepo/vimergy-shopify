export const state = () => ({
  activeSubscriptionId: null,
  currentChosenSubscription: null,
  activeSubscriptionSave: null,
})

export const mutations = {
  setActiveSubscriptionId(state, orderId) {
    console.log(orderId, 1212123)
    state.activeSubscriptionId = orderId
  },

  setActiveSubscriptionSave(state, activeSubscriptionSave) {
    state.activeSubscriptionSave = activeSubscriptionSave
  },

  setCurrentChosenSubscription(state, subscription) {
    state.currentChosenSubscription = subscription
  },
}

export const getters = {
  activeSubscription(state, getters, rootState) {
    const { subscriptions } = rootState.subscriptions
    const { activeSubscriptionId } = state
    if (!subscriptions || !activeSubscriptionId) return false
    let activeSubscription = false

    if (subscriptions[activeSubscriptionId]) {
      activeSubscription = subscriptions[activeSubscriptionId]
    }
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
    let val
    if (editNextOrder) {
      val = activeQueue.total_price
    } else {
      val = activeSubscription.total_price
    }
    if (val) {
      return val.toFixed(2)
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
