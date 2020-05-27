<script>
import moment from 'moment'
import { mapGetters, mapActions, mapState } from 'vuex'

import DrawerWrap from '@components/drawer-wrap.vue'
import DatePicker from '@components/date-picker.vue'
import BoxIcon from '@components/Icon/box-icon.vue'

export default {
  components: {
    DrawerWrap,
    DatePicker,
    BoxIcon,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  data: () => {
    return {
      now: null,
      drawerStatus: null,
    }
  },
  computed: {
    ...mapState('translations', ['atc', 'activeLanguageCode']),

    ...mapGetters('activeSubscription', [
      'activeSubscription',
      'activeSubscriptionNextDate',
    ]),

    ...mapState('editMode', ['editNextOrder']),

    shipmentDate() {
      const { activeSubscriptionNextDate } = this
      if (!activeSubscriptionNextDate) return false
      return moment(activeSubscriptionNextDate, 'YYYYMMDD').format(
        'MMM D'
      )
    },

    shipmentDateWithYear(){
      const { activeSubscriptionNextDate } = this
      if (!activeSubscriptionNextDate) return false
      return moment(activeSubscriptionNextDate, 'YYYYMMDD').format(
        'MMM D YYYY'
      )
    },

    nextShipmentDates() {
      const { activeSubscription, shipmentDateWithYear } = this
      const { interval, period } = activeSubscription

      return [
        moment(shipmentDateWithYear)
          .add(interval, period)
          .format('MMM D, YYYY'),
        moment(shipmentDateWithYear)
          .add(interval * 2, period)
          .format('MMM D, YYYY'),
      ]
    },
  },

  watch: {
    activeLanguageCode: {
      immediate: true,
      handler: function(newVal) {
        moment.locale(newVal)
      },
    },
  },

  methods: {
    ...mapActions('subscriptions', ['UPDATE_SUBSCRIPTION_QUEUE']),

    ...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),

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

      this.drawerStatus = 'PENDING'
      try {
        await this.UPDATE_SUBSCRIPTION_QUEUE(requestPayload)
        this.triggerAnalyticsEvent({
          event: 'Upscribe Change Shipment Date',
          payload: analyticsPayload,
        })
        this.drawerStatus = 'SUCCESS'
      } catch (e) {
        console.log('subscription/UPDATE_SUBSCRIPTION error: ', e)
        this.drawerStatus = { state: 'FAILURE', message: e.message }
      }
    },
  },
}
</script>

<template>
  <drawer-wrap :show="show" :status="drawerStatus" @close="$emit('close')">
    <div class="c-drawer c-drawerDeliveryDate">
      <h2 class="c-drawer__title c-drawerDeliveryDate__title">{{ atc['portal.shipsOnDrawerTitle'] || 'Ships On' }} {{ shipmentDate ? shipmentDate : ''}}</h2>

      <div class="c-drawerDeliveryDate__intro">
        <span class="c-drawerDeliveryDate__prompt"
          >{{ atc['portal.shipsOnDrawerPrompt'] || 'Want to schedule a new shipment?' }}</span
        >
      </div>

      <no-ssr>
        <date-picker
          class="c-drawerDelieryDate__calendar"
          @changeShipmentDate="handleChangeShipmentDate"
        />
      </no-ssr>

      <div
        v-if="nextShipmentDates && !editNextOrder"
        class="c-drawerNextShipments"
      >
        <h3 class="c-drawerNextShipments__title">{{ atc['portal.shipsOnDrawerNextShipmentsLabel'] || 'Next Shipments' }}</h3>
        <div
          v-for="(date, index) in nextShipmentDates"
          :key="index"
          class="c-drawerNextShipments__contain"
        >
          <span> <box-icon /> </span>
          <span class="c-drawerNextShipments__date">{{ date }}</span>
        </div>
      </div>
    </div>
  </drawer-wrap>
</template>

<style lang="scss">
@import '@design';

.c-drawerDeliveryDate__intro {
  margin-bottom: 16px;
  color: $color-blue-secondary;
  text-align: center;
}

.c-drawerDeliveryDate__currentDate {
  margin-bottom: 18px;
  font-family: $font-primary-medium;
  font-weight: 500;
  font-size: 22px;
  text-transform: uppercase;
}

.c-drawerDeliveryDate__prompt {
  font-family: $font-primary-regular;
  font-size: 14px;
}

.c-drawerDelieryDate__calendar {
  height: auto;
  margin-bottom: 20px;
}

.c-drawerNextShipments {
  padding: 10px 0px;
}

.c-drawerNextShipments__title {
  margin-bottom: 22px;
  font-family: $font-primary-medium;
  font-weight: bold;
  font-size: 18px;
  line-height: 23px;
  letter-spacing: 0.2px;
}

.c-drawerNextShipments__date {
  display: block;
  margin-bottom: 14px;
  margin-left: 10px;
  font-family: $font-primary-regular;
  font-size: 18px;
  line-height: 23px;
  color: #171725;
  font-weight: normal
}

.c-drawerNextShipments__contain{
  display: flex;
}
</style>
