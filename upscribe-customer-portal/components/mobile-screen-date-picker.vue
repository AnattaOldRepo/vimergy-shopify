<template>
  <div>
    <portal to="header">
      <the-header middle-html="Change Ship Date" mode="backwardRoute" />
    </portal>

    <date-picker
      class="c-mobileScreenDatePicker__calendar"
      :is-in-page="true"
      @changeShipmentDate="handleChangeShipmentDate"
    />
  </div>
</template>

<script>
import DatePicker from '@components/date-picker'
import moment from 'moment'
import { mapMutations, mapActions, mapGetters } from 'vuex'
import TheHeader from '@components/the-header'
export default {
  components: {
    DatePicker,
    TheHeader,
  },

  computed: {
    ...mapGetters('activeSubscription', [
      'activeSubscription',
      'activeSubscriptionNextDate',
    ]),
  },

  methods: {
    ...mapMutations('mobileGlobalManagement', ['setMessage', 'setStatus']),

    ...mapActions('subscriptions', ['UPDATE_SUBSCRIPTION_QUEUE']),

    ...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),

    async handleChangeShipmentDate(unformattedNewDate) {
      this.setMessage('Updating new Shipment Date')
      this.setStatus('updating')

      const { activeSubscriptionNextDate } = this
      if (!activeSubscriptionNextDate) return false
      let currentDate = activeSubscriptionNextDate

      const newDate = moment(unformattedNewDate).format('YYYYMMDDHHmmss')

      let requestPayload = {
        newDate,
        currentDate,
      }
      let analyticsPayload = {
        newDate,
        oldDate: currentDate,
      }

      try {
        await this.UPDATE_SUBSCRIPTION_QUEUE(requestPayload)
        this.triggerAnalyticsEvent({
          event: 'Upscribe Change Shipment Date',
          payload: analyticsPayload,
        })
        this.setMessage('Saved new Shipment Date')
        this.setStatus('success')
      } catch (e) {
        console.error('subscription/UPDATE_SUBSCRIPTION error: ', e)
        this.setMessage(e.message)
        this.setStatus('error')
      }
    },
  },
}
</script>
