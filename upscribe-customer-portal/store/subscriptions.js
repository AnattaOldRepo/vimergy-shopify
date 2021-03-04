import request from '@scripts/axiosRequestWrapper.js'
import Vue from 'vue'
import moment from 'moment'

export const state = () => ({
  subscriptions: {},
  subscriptionsLoaded: false,
  noActiveSubscriptions: false,
  savedProductUpdatePayload: null,
  updateSubscriptionPromptOpen: true,
  subscriptionArr: [],
})

export const mutations = {
  setUpdateSubscriptionPromptOpen(state, val) {
    state.updateSubscriptionPromptOpen = val
  },

  setSavedProductUpdatePayload(state, updatePayload) {
    state.savedProductUpdatePayload = updatePayload
  },

  setNoActiveSubscriptions(state, val) {
    state.noActiveSubscriptions = val
  },

  setSubscriptionsLoaded(state, val) {
    state.subscriptionsLoaded = val
  },

  SET_UPDATED_NEXT_ORDER(state, updatedNext) {
    let subscriptionId = updatedNext.subscription_id
    let subscription = state.subscriptions[subscriptionId]

    if (subscription) {
      Vue.set(state.subscriptions, subscriptionId, {
        ...subscription,
        next: updatedNext,
      })
    }
  },

  SET_SUBSCRIPTIONS(state, payload) {
    let subIdHash = {}
    state.subscriptionArr = payload
    state.noActiveSubscriptions = true
    state.subscriptionArr = payload

    if (!payload || !payload.length) {
      state.noActiveSubscriptions = true
      return
    }

    let hasActiveSubscription = false

    payload.forEach((subscription) => {
      subIdHash[subscription.id] = subscription
      if (subscription.active) {
        hasActiveSubscription = true
      }
    })
    state.subscriptions = Object.assign({}, state.subscription, subIdHash)

    state.noActiveSubscriptions = hasActiveSubscription
  },

  SET_CANCELED_SUBSCRIPTION(state, payload) {
    const subscriptionId = payload.id
    state.subscriptions[subscriptionId] = payload

    let hasActiveSubscription = false
    Object.keys(state.subscriptions).forEach((subscriptionKey) => {
      let subscription = state.subscriptions[subscriptionKey]
      if (subscription.active) {
        hasActiveSubscription = true
      }
    })
    if (!hasActiveSubscription) {
      state.noActiveSubscriptions = true
    }
  },

  SET_ACTIVATED_SUBSCRIPTION(state, payload) {
    const subscriptionId = payload.id
    state.subscriptions[subscriptionId] = payload
    state.noActiveSubscriptions = false
  },

  SET_UPDATED_SUBSCRIPTION(state, payload) {
    const subscriptionId = payload.id
    state.subscriptions[subscriptionId] = payload
  },

  SET_UPDATED_SUBSCRIPTION_QUEUE(state, payload) {
    const subscriptionId = payload.subscription_id
    const subscription = state.subscriptions[subscriptionId]
    const next = subscription.next
    next.updated_at = payload.update_at
    next.date = payload.date
  },
}

export const actions = {
  async GET_SUBSCRIPTIONS(
    { rootState, commit, dispatch },
    customerPayloadId = null
  ) {
    const { storeDomain, customerId } = rootState.route
    const usedPayloadId = customerPayloadId || customerId
    const { xUpscribeAccessToken } = rootState.auth

    return new Promise((resolve, reject) => {
      request({
        method: 'get',
        url: `/subscriptions/${storeDomain}/${usedPayloadId}`,
        headers: {
          'x-upscribe-access-token': xUpscribeAccessToken,
        },
      })
        .then((data) => {
          const subscriptions = data.items
          commit('SET_SUBSCRIPTIONS', subscriptions)
          commit('setSubscriptionsLoaded', true)
          dispatch('orders/GET_ORDERS', {}, { root: true })
          resolve(data)
        })
        .catch((error) => {
          if (error.status >= 400) {
            commit('setNoActiveSubscriptions', true)
            commit('setSubscriptionsLoaded', true)
          }
          reject(error)
        })
    })
  },

  //* ** note this is using stripe customer id instead of shopify order id as orderId */
  // Paylod has bulkUpdate == true then add ?massUpdate=1 in query
  async UPDATE_SUBSCRIPTION({ rootState, rootGetters, commit }, payload) {
    const { storeDomain } = rootState.route
    const activeSubscription =
      rootGetters['activeSubscription/activeSubscription']
    const { xUpscribeAccessToken } = rootState.auth

    const shopifyCustomerId = activeSubscription.shopify_customer_id
    const { requestPayload, subscriptionId = false } = payload

    const requestSubscriptionId = subscriptionId || activeSubscription.id

    let url = `/subscription/update/${storeDomain}/${shopifyCustomerId}/${requestSubscriptionId}`

    if (payload.bulkUpdate) {
      url = `/subscription/update/${storeDomain}/${shopifyCustomerId}/${requestSubscriptionId}?massUpdate=1`
    }

    return new Promise((resolve, reject) => {
      request({
        method: 'post',
        url,
        data: JSON.stringify(requestPayload),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-upscribe-access-token': xUpscribeAccessToken,
        },
      })
        .then((data) => {
          commit('SET_UPDATED_SUBSCRIPTION', data)
          resolve(data)
        })
        .catch((error) => {
          reject(error)
        })
    })
  },

  async UPDATE_SUBSCRIPTION_QUEUE(
    { rootGetters, commit, rootState },
    { newDate, skip, subscriptionId, queueId }
  ) {
    const activeSubscription =
      rootGetters['activeSubscription/activeSubscription']
    const { xUpscribeAccessToken } = rootState.auth

    // used manual passed values or fallback on active subscription
    let finalSubscriptionId = subscriptionId || activeSubscription.id
    let finalQueueId = queueId || activeSubscription.next.id

    const requestPayload = {}

    if (newDate) {
      requestPayload.date = newDate
    }

    return new Promise((resolve, reject) => {
      request({
        method: 'post',
        url: `/subscription/queue/${finalSubscriptionId}/${finalQueueId}`,
        data: JSON.stringify(requestPayload),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-upscribe-access-token': xUpscribeAccessToken,
        },
      })
        .then((data) => {
          commit('SET_UPDATED_SUBSCRIPTION_QUEUE', data)
          resolve(data)
        })
        .catch((error) => {
          reject(error)
        })
    })
  },

  async SKIP_NEXT_SHIPMENT({ dispatch, rootGetters }) {
    const activeSubscription =
      rootGetters['activeSubscription/activeSubscription']
    const { next, interval, period } = activeSubscription

    if (!next) return false
    const currentDate = next.date

    const newDate = moment(currentDate)
      .add(interval, period)
      .format('YYYYMMDDHHmmss')

    let requestPayload = {
      newDate,
      currentDate,
    }
    let analyticsPayload = {
      newDate,
      oldDate: currentDate,
    }

    try {
      const skipResponse = await dispatch(
        'UPDATE_SUBSCRIPTION_QUEUE',
        requestPayload
      )
      dispatch(
        'upscribeAnalytics/triggerAnalyticsEvent',
        {
          event: 'Upscribe Skip Shipment',
          payload: analyticsPayload,
        },
        { root: true }
      )
      return skipResponse
    } catch (e) {
      console.error('subscription/UPDATE_SUBSCRIPTION error: ', e)
      return false
    }
  },

  async SHIP_TOMORROW({ dispatch, rootGetters }) {
    const activeSubscription =
      rootGetters['activeSubscription/activeSubscription']
    const { next } = activeSubscription

    if (!next) return false
    const currentDate = next.date

    const newDate = moment()
      .add(1, 'day')
      .format('YYYYMMDDHHmmss')

    let requestPayload = {
      newDate,
      currentDate,
    }
    let analyticsPayload = {
      newDate,
      oldDate: currentDate,
    }

    try {
      const skipResponse = await dispatch(
        'UPDATE_SUBSCRIPTION_QUEUE',
        requestPayload
      )
      dispatch(
        'upscribeAnalytics/triggerAnalyticsEvent',
        {
          event: 'Upscribe Ship Tomorrow',
          payload: analyticsPayload,
        },
        { root: true }
      )
      return skipResponse
    } catch (e) {
      console.error('subscription/UPDATE_SUBSCRIPTION error: ', e)
      return false
    }
  },

  async SHIP_NOW({ rootState, dispatch, rootGetters, commit }) {
    const activeSubscription =
      rootGetters['activeSubscription/activeSubscription']
    const { next } = activeSubscription
    const { xUpscribeAccessToken } = rootState.auth
    const { storeDomain } = rootState.route

    if (!next) return false
    const subscriptionId = activeSubscription.id
    const queueId = next.id

    return new Promise((resolve, reject) => {
      request({
        method: 'get',
        url: `/subscription/queue/charge/${storeDomain}/${subscriptionId}/${queueId}`,
        headers: { 'x-upscribe-access-token': xUpscribeAccessToken },
      })
        .then((response) => {
          // commit('SET_UPDATED_NEXT_ORDER', response)
          // commit('SET_UPDATED_SUBSCRIPTION_QUEUE', response)
          dispatch(
            'upscribeAnalytics/triggerAnalyticsEvent',
            {
              event: 'Upscribe Charge Now',
              payload: { subscriptionId, queueId },
            },
            { root: true }
          )
          resolve(response)
        })
        .catch((error) => {
          reject(error)
        })
    })
  },

  async UPDATE_NEXT_ORDER({ rootGetters, commit, rootState }, updatePayload) {
    const activeSubscription =
      rootGetters['activeSubscription/activeSubscription']
    const { xUpscribeAccessToken } = rootState.auth

    const subscriptionId = activeSubscription.id
    const queueId = activeSubscription.next.id

    const { newDate, requestPayload } = updatePayload

    if (newDate) {
      requestPayload.date = newDate
    }

    let url = `/subscription/queue/${subscriptionId}/${queueId}`
    if (requestPayload.bulkUpdate) {
      url = `/subscription/queue/${subscriptionId}/${queueId}?massUpdate=1`
    }

    return new Promise((resolve, reject) => {
      request({
        method: 'post',
        url,
        data: JSON.stringify(requestPayload),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-upscribe-access-token': xUpscribeAccessToken,
        },
      })
        .then((data) => {
          commit('SET_UPDATED_NEXT_ORDER', data)

          // delay for the subscriptions to finish updating
          setTimeout(() => {
            resolve(data)
          }, 1000)
        })
        .catch((error) => {
          reject(error)
        })
    })
  },

  async CANCEL_SUBSCRIPTION({ rootGetters, rootState, commit }, payload) {
    const activeSubscription =
      rootGetters['activeSubscription/activeSubscription']
    const { customerId, storeDomain } = rootState.route
    const { xUpscribeAccessToken } = rootState.auth
    const subscriptionId = activeSubscription.id

    return new Promise((resolve, reject) => {
      request({
        method: 'post',
        url: `/subscription/cancel/${storeDomain}/${customerId}/${subscriptionId}`,
        data: JSON.stringify(payload),
        headers: {
          'x-upscribe-access-token': xUpscribeAccessToken,
        },
      })
        .then((data) => {
          commit('SET_CANCELED_SUBSCRIPTION', data)

          resolve(data)
        })
        .catch((error) => {
          reject(error)
        })
    })
  },

  async ACTIVATE_SUBSCRIPTION(
    { rootGetters, rootState, commit },
    manualSubscriptionId = false
  ) {
    const activeSubscription =
      rootGetters['activeSubscription/activeSubscription']
    const { customerId, storeDomain } = rootState.route
    const { xUpscribeAccessToken } = rootState.auth

    const subscriptionId = manualSubscriptionId || activeSubscription.id

    return new Promise((resolve, reject) => {
      request({
        method: 'get',
        url: `/subscription/activate/${storeDomain}/${customerId}/${subscriptionId}`,
        headers: {
          'x-upscribe-access-token': xUpscribeAccessToken,
        },
      })
        .then((data) => {
          commit('SET_ACTIVATED_SUBSCRIPTION', data)

          resolve(data)
        })
        .catch((error) => {
          reject(error)
        })
    })
  },
}

export const getters = {
  subscriptionInActive(state) {
    return state.subscriptionArr
      .filter((each) => !each.active)
      .sort((a, b) => a.id - b.id)
  },
  subscriptionActive(state) {
    return state.subscriptionArr
      .filter((each) => each.active)
      .sort((a, b) => a.id - b.id)
  },
}
