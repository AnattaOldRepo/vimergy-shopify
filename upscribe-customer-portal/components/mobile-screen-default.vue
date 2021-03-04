<template>
  <div v-if="activeSubscription">
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

    <!-- subscription info starts  -->
    <div class="u-mt-3 c-mobileSubscriptionInfo">
      <p v-if="editNextOrder">
        <strong>
        {{ editingNextShipDateOnlyText }}</strong>
        <br />
        {{ atc['portal.toEditFullSubscription'] || 'To edit your full subscription' }}
        <a @click="changeMode(false)"><strong> {{ atc['buttons.clickHere'] || 'CLICK HERE' }}</strong></a>
      </p>

      <p v-else>
        <strong> {{ atc['portal.editingFullSubscription'] || 'You are editing your full subscription' }}</strong>
        <br />
        {{ nextOrderOnlyText }}

        <a @click="changeMode(true)"> <strong>{{ atc['buttons.clickHere'] || 'CLICK HERE' }}</strong></a>
      </p>
    </div>

    <!-- subscription info ends  -->

    <mobile-screen-details class="u-mt-3" />

    <mobile-screen-address-payment class="u-mt-3" />
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import MobileScreenDetails from '@components/mobile-screen-details'
import MobileScreenAddressPayment from '@components/mobile-screen-address-payment'
import TheHeader from '@components/the-header'
import moment from 'moment'

export default {
  components: {
    TheHeader,
    MobileScreenDetails,
    MobileScreenAddressPayment,
  },

  data() {
    return {
      updating: false,
    }
  },

  computed: {
    ...mapState('translations', ['atc']),

    ...mapState('route', ['storeDomain', 'customerId']),

    ...mapState('orders', ['subscriptionOrders']),

    ...mapGetters('activeSubscription', [
      'activeSubscription',
      'activeSubscriptionNextDate',
    ]),

    ...mapState('editMode', ['editNextOrder']),

    editingNextShipDateOnlyText() {
      const { atc, nextShipDate } = this

      return atc['portal.editingNextShipDateOnly'] ? atc['portal.editingNextShipDateOnly'].replace('<next-ship-date>', nextShipDate) : `You are editing your ${nextShipDate} order`
    },

    nextOrderOnlyText() {
      const { atc, nextShipDate } = this
      return atc['portal.toEditNextOrderOnly'] ? atc['portal.toEditNextOrderOnly'].replace('<next-ship-date>', nextShipDate) : 'To edit your <next-ship-date> order only'.replace('<next-ship-date>', nextShipDate)
    },

    rderOnlyText() {
      const { atc, nextShipDate } = this
      return atc['portal.toEditNextOrderOnly'] ? atc['portal.toEditNextOrderOnly'].replace('<next-ship-date>', nextShipDate) : 'To edit your <next-ship-date> order only'.replace('<next-ship-date>', nextShipDate)
    },


    isCancelledSubscriptionRoute() {
      return this.$route.query.route === 'cancelledSubscriptions'
    },

    isInactiveTrial() {
      return !this.isActive && this.isTrial
    },

    nextShipDate() {
      const { activeSubscription } = this
      if (
        activeSubscription &&
        activeSubscription.next &&
        activeSubscription.next.date
      ) {
        return moment(activeSubscription.next.date, 'YYYYMMDD').format('MMMM Do')
      }

      return false
    },

    isExpiredTrial() {
      const { activeSubscription } = this
      return (
        !activeSubscription.active &&
        activeSubscription.cancellation_reason === 'Trial period has expired'
      )
    },

    isInactiveRegular() {
      const { activeSubscription } = this
      return (
        !activeSubscription.active &&
        activeSubscription.cancellation_reason !== 'Trial period has expired'
      )
    },

    returnCancelledSubscriptionRoute() {
      if (this.isCancelledSubscriptionRoute) {
        return { route: 'cancelledSubscriptions' }
      }
      return {}
    },

    shipmentDate() {
      const { activeSubscriptionNextDate } = this
      if (!activeSubscriptionNextDate) return false
      return moment(activeSubscriptionNextDate, 'YYYYMMDD').format('MMM D')
    },

    isOriginalCharge() {
      if (this.subscriptionOrders && this.subscriptionOrders[0]) {
        return !!this.subscriptionOrders[0].shopify_order_id
      }
      return ''
    },

    pastShipmentText() {
      const { atc } = this
      if (this.deliveredDate) {
        return `<br/><span class="c-functionalButtonBlock__small-text">${atc['portal.lastShipmentDelivered' || 'Last shipment delivered']} ${this.deliveredDate}</span>`
      }
      return ''
    },

    deliveredDate() {
      const { subscriptionOrders, isOriginalCharge } = this
      let fullFillmentText
      let date

      if (subscriptionOrders.length > 0) {
        fullFillmentText = subscriptionOrders[0].fulfillment_status
          ? subscriptionOrders[0].fulfillment_status
          : subscriptionOrders[0].financial_status
        date = isOriginalCharge
          ? moment(subscriptionOrders[0].created_at, 'YYYYMMDD').format('MMM D')
          : moment(subscriptionOrders[0].processed_at).format('MMM D')
      }

      if (fullFillmentText && fullFillmentText.includes('_')) {
        fullFillmentText = fullFillmentText.split('_').join(' ')
      }

      return date || '---'
    },
  },

  mounted() {
    this.GET_SUBSCRIPTION_ORDERS(this.activeSubscription.shopify_order_id)
  },

  methods: {
    ...mapMutations('activeSubscription', ['setActiveSubscriptionId']),

    ...mapActions('orders', ['GET_SUBSCRIPTION_ORDERS']),

    ...mapActions('subscriptions', [
      'UPDATE_SUBSCRIPTION',
      'ACTIVATE_SUBSCRIPTION',
      'GET_SUBSCRIPTIONS',
    ]),
    ...mapActions('editMode', ['setEditNextOrder']),

    ...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),

    async handleReactivateSubscription() {
      const { activeSubscription } = this

      let analyticsEventName = 'Upscribe Reactivate Subscription'
      let analyticsPayload = {
        subscription: activeSubscription,
      }

      this.updating = true

      try {
        await this.ACTIVATE_SUBSCRIPTION()
        this.triggerAnalyticsEvent({
          event: analyticsEventName,
          payload: analyticsPayload,
        })
      } catch (e) {
        console.error('handleReactivateSubscription error: ', e)
      } finally {
        await this.GET_SUBSCRIPTIONS()
        // Set route getting new subscription as current route dynamically
        this.setActiveSubscriptionId(activeSubscription.id)
        this.updating = false
      }
    },

    async handleReactivateTrialAsSubscription() {
      const { activeSubscription } = this

      let analyticsEventName = 'Upscribe Reactivate Trial as Subscription'
      let analyticsPayload = {
        subscription: activeSubscription,
      }

      this.updating = true

      try {
        await this.ACTIVATE_SUBSCRIPTION()
        this.triggerAnalyticsEvent({
          event: analyticsEventName,
          payload: analyticsPayload,
        })
      } catch (e) {
        console.error('handleReactivateTrialAsSubscription error: ', e)
      } finally {
        await this.GET_SUBSCRIPTIONS()
        this.updating = false
      }
    },
    changeMode(goToNextorder) {
      const { fullPath } = this.$route
      const query = goToNextorder
        ? { editNextOrder: true }
        : { editNextOrder: '' }
      this.$router.push({ path: fullPath, query })
    },
  },
  watch: {
    '$route.query.editNextOrder'(value) {
      if (value) {
        this.setEditNextOrder(true)
      } else {
        this.setEditNextOrder(false)
      }
    },
  },
}
</script>

<style lang="scss">
@import '@design/_colors';
.c-subscriptionMobilePage__idText {
  color: $color-blue-secondary;
  font-size: 14px;
  line-height: 18px;
  text-align: center;
  margin-top: 16px;
  margin-bottom: 22px;
  letter-spacing: 0.2px;
}
.c-mobileSubscriptionInfo {
  text-align: center;
  font-weight: normal;
  line-height: 1.5em;
  strong {
    font-weight: bold;
  }
  a {
    text-decoration: underline;
    color: $color-primary;
  }
}

.c-subscriptionMobilePage__toolLast {
  margin-top: 24px;
}

.c-subscriptionMobilePage__reactiveBlock {
  margin-top: 16px;
  max-width: 400px;
  display: flex;
  justify-content: center;
}

.c-subscriptionMobilePage__button {
  background-color: $color-white;
  &:hover,
  &:focus {
    background-color: $color-white;
  }
}
</style>
