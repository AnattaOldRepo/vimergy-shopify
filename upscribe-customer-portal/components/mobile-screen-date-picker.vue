<template>
  <div>
    <portal to="header">
      <the-header
        middle-html="Change Ship Date"
        mode="backwardRoute"
      />
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
import { mapActions } from 'vuex'
import TheHeader from '@components/the-header'
export default {
  components: {
    DatePicker,
    TheHeader,

  },

  methods:{
    ...mapActions('subscriptions', ['UPDATE_SUBSCRIPTION_QUEUE']),

    async handleChangeShipmentDate(unformattedNewDate) {
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
      } catch (e) {
        console.log('subscription/UPDATE_SUBSCRIPTION error: ', e)
      }
    },
  },
}
</script>
