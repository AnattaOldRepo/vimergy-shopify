/* eslint-disable */

export const mutations = {
  stateChanged: function (data) {
    window.dataLayer = window.dataLayer || []
    window._rsq = window._rsq || []

    // login customer
    if ('customer/SET_CUSTOMER' === data.mutation.type) {
      const { customer } = data.mutation.payload

      if (!customer) return

      window.dataLayer.push({
        visitorType: 'Logged In',
        visitorId: customer.id,
        CustomerId: customer.id,
        CustomerEmail: customer.email,
        CustomerFirstName: customer.first_name || '',
        CustomerLastName: customer.last_name || '',
        CustomerOrdersCount: customer.orders_count || 0,
        CustomerTotalSpent: customer.total_spent ? customer.total_spent : 0,
      })
    }

    if ('upscribeAnalytics/pushAnalyticsEvent' === data.mutation.type) {
      // console.log('tracking pushAnalyticsEvent', data.mutation)

      const { event, segmentEventName, payload, analytics } = data.mutation
      // const { customerId, subscriptionId, queueId } = payload

      // GTM
      if (window.dataLayer) {
        // remove segmentEventName from sending to GTM
        const { segmentEventName, ...gtmPayload } = payload
        dataLayer.push({
          event: gtmPayload.event,
          payload: gtmPayload.payload,
          analytics: gtmPayload.analytics,
        })
      }

      // console.log('window.analytics', window.analytics)

      //  Segment
      if (window.analytics) {
        // Segment Identify Event
        if (segmentEventName && segmentEventName === 'Identify') {
          const { customer } = window.UpscribeAnalytics
          window.analytics.identify(customer.id, {
            name: customer.name,
            email: customer.email,
          })

          // Customer Segement Event
        } else if (segmentEventName) {
          window.analytics.track(segmentEventName, {
            ...payload,
            ...window.UpscribeAnalytics,
          })

          // Default Segment Event
        } else {
          // console.log('track', { event, segmentEventName, payload, analytics })
          window.analytics.track(payload.event, {
            ...payload.payload,
            analytics: { ...window.UpscribeAnalytics },
          })
        }
      }
    }
  },
}

export default ({ app }) => {
  window.dataLayer = window.dataLayer || []
  window._rsq = window._rsq || []

  app.store.subscribe((mutation, state) => {
    var store = ''

    if (mutation && mutation.type) {
      store = mutation.type.split('/')[0]
    }

    mutations.stateChanged({
      state: state,
      mutation: mutation,
    })
  })
}
