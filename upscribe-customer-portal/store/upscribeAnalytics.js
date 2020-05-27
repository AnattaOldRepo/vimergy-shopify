// import { isEmptyObject } from '@utils/helpers.js'

// function logAnalyticsEvent(event) {
//   console.log(
//     'Upscribe Analytics Event Triggered: ',
//     event.type,
//     window.UpscribeAnalytics
//   )
// }

export const state = () => ({
  store: null, // {}
  customer: null, // || {}
  activeSubscription: null,
  events: [],
})

export const mutations = {
  setAnalytics(state, payload) {
    state.analytics = payload
  },

  resetAnalytics(state) {
    console.log('resetAnalytics')
    state.store = null
    state.checkout = null
    state.customer = null
    state.events = []
  },

  pushAnalyticsEvent(state, { event, payload }) {
    console.log('pushAnalyticsEvent')

    state.events.push({
      event,
      detail: payload,
    })
  },
}

export const getters = {
  analyticsData(state) {
    const { store, customer, activeSubscription } = state

    return {
      store,
      customer,
      activeSubscription,
    }
  },
}

export const actions = {
  /**
   * Update global analytics variable on changes
   */
  updateWindowUpscribeAnalytics({ commit, state, rootState }) {
    // console.log('rootState', rootState)
    const { customer = false } = rootState.customer
    const { shopData = false } = rootState.shop

    console.log('updateWindowUpscribeAnalytics')

    const analytics = {
      store: shopData,
      customer: customer,

      events: state.events,
    }

    window.UpscribeAnalytics = analytics

    commit('setAnalytics', analytics)
  },

  setWindowUpscribeAnalytics({ state, getters, dispatch }) {
    if (!process.browser) return

    dispatch('setUpscribeEventListeners')

    window.UpscribeAnalytics = {
      store: state.store,
      customer: state.customer,
      events: state.events,
    }
  },

  /**
   * Log events for debugging
   */
  setUpscribeEventListeners() {
    // window.addEventListener('Checkout Started', logAnalyticsEvent)
    // window.addEventListener('Customer Logged In', logAnalyticsEvent)
    // window.addEventListener('Customer Registered', logAnalyticsEvent)

    // window.addEventListener('Discount Applied Success', logAnalyticsEvent)
    // window.addEventListener('Discount Applied Failure', logAnalyticsEvent)
    // window.addEventListener('Discount Removed', logAnalyticsEvent)

    // window.addEventListener(
    //   'Shipping Address Step Completed',
    //   logAnalyticsEvent
    // )
    // window.addEventListener('Shipping Method Step Completed', logAnalyticsEvent)

    // window.addEventListener('Clicked Place Order Button', logAnalyticsEvent)
    // window.addEventListener('Payment Step Completed', logAnalyticsEvent)
    // window.addEventListener('Order Completed', logAnalyticsEvent)
    // window.addEventListener('Upsell Product Added', logAnalyticsEvent)

    console.log('Upscribe Analytics Events Set')
  },

  /**
   * Triggers when checkout is fully loaded and loading screen is gone
   */
  analyticsCheckoutStarted({ dispatch }) {
    dispatch('triggerAnalyticsEvent', {
      event: 'Checkout Started',
    })
  },

  /**
   * Triggers on discount add or remove
   * @param {string} event - SUCCESS || FAILURE || REMOVE
   */
  analyticsDiscount({ state, dispatch, commit }, { event, payload }) {
    let passedEvent
    switch (event) {
      case 'SUCCESS':
        passedEvent = 'Discount Applied Success'
        break
      case 'FAILURE':
        passedEvent = 'Discount Applied Failure'
        break
      case 'REMOVE':
        passedEvent = 'Discount Removed'
        break
      default:
        console.log('analyticsDiscount Error: ', event)
    }

    dispatch('triggerAnalyticsEvent', {
      event: passedEvent,
      payload,
    })
  },

  /**
   * After successfully completing shipping address step
   */
  analyticsShippingAddressStepCompleted({ dispatch }) {
    dispatch('triggerAnalyticsEvent', {
      event: 'Shipping Address Step Completed',
      segmentEventName: 'Checkout Step Completed',
    })
  },

  /**
   * After successfully completing shipping method step
   */
  analyticsShippingMethodStepCompleted({ dispatch }) {
    dispatch('triggerAnalyticsEvent', {
      event: 'Shipping Method Step Completed',
      segmentEventName: 'Checkout Step Completed',
    })
  },

  /**
   * On click of place order button
   */
  analyticsClickedPlaceOrderButton({ state, dispatch, commit }, payload) {
    dispatch('triggerAnalyticsEvent', {
      event: 'Clicked Place Order Button',
    })
  },

  /**
   * After successful order placement step
   */
  analyticsPaymentStepCompleted({ state, dispatch, commit }, payload) {
    // commit

    dispatch('triggerAnalyticsEvent', {
      event: 'Payment Step Completed',
      segmentEventName: 'Payment Info Entered',
    })
  },

  /**
   * After loading the order completed/thank you page
   */
  analyticsOrderCompleted({ state, dispatch, commit }, payload) {
    console.log('analyticsOrderCompleted')

    dispatch('triggerAnalyticsEvent', {
      event: 'Order Completed',
      payload,
    })
  },

  /**
   *  After adding an upsell product to the cart
   */
  analyticsUpsellProductAdded({ state, dispatch, commit }, payload) {
    dispatch('triggerAnalyticsEvent', {
      event: 'Upsell Product Added',
    })
  },

  /**
   * Store all analytics events in events array
   * @param {*} eventPayload
   */
  triggerAnalyticsEvent(
    { commit, dispatch, rootState, rootGetters },
    { event, segmentEventName = false, payload }
  ) {
    const { customer } = rootState.customer
    const activeSubscription =
      rootGetters['activeSubscription/activeSubscription']

    let finalSegmentEventName = segmentEventName || event

    if (window) {
      dispatch('updateWindowUpscribeAnalytics')
    }

    // console.log('triggerAnalyticsEvent: ', { event, segmentEventName, payload })

    // used in plugins/analytics.js
    commit('pushAnalyticsEvent', {
      event,
      payload: {
        ...payload,
        customerId: customer.shopify.id,
        subscriptionId:
          event && event.indexOf('Subscription') >= 0
            ? activeSubscription.id
            : false,
        queueId:
          event && event.indexOf('Next Order') >= 0
            ? activeSubscription.next.id
            : false,
      },
      analytics: window.UpscribeAnalytics,
      segmentEventName: finalSegmentEventName,
    })

    const customEvent = new CustomEvent(event, payload)
    if (process.browser) {
      window.dispatchEvent(customEvent)
    }
  },

  // Customer Portal Events
}
