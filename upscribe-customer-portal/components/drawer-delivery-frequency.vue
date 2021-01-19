<script>
import { mapGetters, mapState, mapActions } from 'vuex'
import DrawerWrap from '@components/drawer-wrap.vue'
import DeliveryFrequencyItem from '@components/delivery-frequency-item'

export default {
  components: {
    DrawerWrap,
    DeliveryFrequencyItem,
  },

  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      drawerStatus: null,
    }
  },

  computed: {
    ...mapState('translations', ['atc']),

    ...mapGetters('activeSubscription', ['activeSubscription']),

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

    intervalUnit() {
      const { activeSubscription } = this
      const intervalUnitInner =
        activeSubscription.items[0].properties['Interval Unit']
      return intervalUnitInner || 'day'
    },
  },
  methods: {
    ...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),

    ...mapActions('subscriptions', ['UPDATE_SUBSCRIPTION']),

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

    frequencyActive(interval) {
      const { activeSubscription } = this
      return parseInt(interval) === parseInt(activeSubscription.interval)
    },

    async handleChangeFrequency(payload) {
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

      this.drawerStatus = 'PENDING'
      try {
        await this.UPDATE_SUBSCRIPTION(updatePayload)

        this.triggerAnalyticsEvent({
          event: 'Upscribe Change Shipping Frequency',
          payload: analyticsPayload,
        })
        this.drawerStatus = 'SUCCESS'
      } catch (e) {
        console.error('subscription/UPDATE_SUBSCRIPTION error: ', e)
        this.drawerStatus = { state: 'FAILURE', message: e.message }
      }
    },
  },
}
</script>

<template>
  <drawer-wrap :show="show" :status="drawerStatus" @close="$emit('close')">
    <div class="c-drawer c-drawerDeliveryFrequency">
      <h2 class="c-drawer__title">{{
        atc['portal.deliveryFrequencyDrawerTitle'] || 'Deliver Every'
      }}</h2>

      <div class="c-drawerDeliveryFrequency__options">
        <delivery-frequency-item
          v-for="(frequency, index) in deliveryFrequencies"
          :key="index"
          :frequency="frequency"
          :is-selected="frequencyActive(frequency)"
          :interval-unit="intervalUnit"
          :handle-change-frequency="handleChangeFrequency"
          :interval-unit-display="intervalUnitDisplay"
        />
      </div>
    </div>
  </drawer-wrap>
</template>

<style lang="scss" scoped>
@import '@design';
</style>
