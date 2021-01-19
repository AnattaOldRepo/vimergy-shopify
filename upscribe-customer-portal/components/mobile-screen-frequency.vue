<template>
  <div v-if="activeSubscription" class="c-details__delieveryOptions">
    <portal to="header">
      <the-header
        :middle-html="
          activeSubscription.name
            ? `${atc['labels.subscription'] || 'Subscription'} ${
                activeSubscription.name
              }`
            : `${atc['labels.subscription'] || 'Subscription'} ${
                activeSubscription.id
              }`
        "
        mode="backwardRoute"
      />
    </portal>

    <delivery-frequency-item
      v-for="(frequency, index) in deliveryFrequencies"
      :key="index"
      :frequency="frequency"
      :is-selected="frequencyActive(frequency)"
      :handle-change-frequency="handleChangeFrequency"
      :interval-unit="intervalUnit"
      :interval-unit-display="intervalUnitDisplay"
      :previous-middle-text="
        atc['labels.editSubscriptionDetails'] || 'Edit Subscription Details'
      "
    />
  </div>
</template>

<script>
import DeliveryFrequencyItem from '@components/delivery-frequency-item.vue'
import { mapGetters, mapState, mapActions, mapMutations } from 'vuex'
import TheHeader from '@components/the-header'

export default {
  components: {
    DeliveryFrequencyItem,
    TheHeader,
  },

  computed: {
    ...mapState('translations', ['atc']),

    ...mapGetters('activeSubscription', [
      'activeSubscription',
      'activeSubscriptionNextDate',
      'activeQueue',
    ]),

    intervalUnit() {
      const { activeSubscription } = this
      const intervalUnitInner =
        activeSubscription.items[0].properties['Interval Unit']
      return intervalUnitInner || 'day'
    },

    deliveryFrequencies() {
      const { activeSubscription } = this
      const intervalFrequencies =
        activeSubscription.items[0].properties['Interval Frequency']

      if (intervalFrequencies) {
        return intervalFrequencies.split(',').map((item) => item.trim())
      } else {
        return [15, 20, 30, 45]
      }
    },
  },

  methods: {
    ...mapMutations('mobileGlobalManagement', ['setMessage', 'setStatus']),

    ...mapActions('subscriptions', ['UPDATE_SUBSCRIPTION']),

    ...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),

    frequencyActive(interval) {
      const { activeSubscription } = this
      return parseInt(interval) === parseInt(activeSubscription.interval)
    },

    async handleChangeFrequency(payload) {
      this.setMessage('Updating new Delivery Frequency')
      this.setStatus('updating')
      const { intervalUnit, frequency } = payload
      const updatePayload = {
        requestPayload: {
          period: intervalUnit,
          interval: frequency,
        },
      }

      const analyticsPayload = {
        frequency: `${frequency} ${intervalUnit}`,
      }

      try {
        await this.UPDATE_SUBSCRIPTION(updatePayload)

        this.triggerAnalyticsEvent({
          event: 'Upscribe Change Shipping Frequency',
          payload: analyticsPayload,
        })
        this.setMessage('Saved new Delivery Frequency')
        this.setStatus('success')
      } catch (e) {
        console.error('subscription/UPDATE_SUBSCRIPTION error: ', e)
        this.setMessage(e.message)
        this.setStatus('error')
      }
    },

    intervalUnitDisplay(plural) {
      const { intervalUnit, atc } = this
      let displayUnit = ''
      if (intervalUnit.indexOf('day') > -1) {
        if (plural) {
          displayUnit = atc['date-time.days-unit'] || 'days'
        } else {
          displayUnit = atc['date-time.day-unit'] || 'day'
        }
      } else if (intervalUnit.indexOf('week') > -1) {
        if (plural) {
          displayUnit = atc['date-time.weeks-unit'] || 'weeks'
        } else {
          displayUnit = atc['date-time.week-unit'] || 'week'
        }
      } else if (intervalUnit.indexOf('month') > -1) {
        if (plural) {
          displayUnit = atc['date-time.months-unit'] || 'months'
        } else {
          displayUnit = atc['date-time.month-unit'] || 'month'
        }
      } else {
        displayUnit = intervalUnit
      }
      return displayUnit
    },
  },
}
</script>
