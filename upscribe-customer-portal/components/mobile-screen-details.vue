<template>
  <div v-if="activeSubscription">
    <portal to="header">
      <the-header
        middle-html="Edit Subscription Details"
        mode="backwardRoute"
      />
    </portal>

    <mobile-subscription-template v-if="!edit" functional-block-title="Shipping">
      <div slot="functionality-block" class="c-mobileSubscriptionTemplate__tools">
          <!-- Ships Block -->
          <functional-button-block
            v-if="!isCancelledSubscriptionRoute"
            :title="atc['portal.subscriptionSettingsShipsOnLabel'] || 'Ships'"
            :second-text="shipmentDate"
            :button-func="openModalCalendar"
          >
            <span slot="icon" class="c-functionalButtonBlock__icon">
              <calendar-icon />
            </span>
          </functional-button-block>

          <functional-button-block
            v-else
            class="disabled-click"
            title="Last Shipment"
            :second-text="deliveredDate"
            no-arrow-icon
          >
            <span slot="icon" class="c-functionalButtonBlock__icon">
              <calendar-icon />
            </span>
          </functional-button-block>

          <!-- Delievers Every Block -->
          <functional-button-block
            v-if="!isCancelledSubscriptionRoute"
            :internal-link="{
              query: {
                template: 'edit-shipping-frenquency',
                storeDomain,
                customerId,
              },
            }"
            :title="atc['portal.subscriptionSettingsDeliverEveryLabel'] || 'Deliver Every'"
            :second-text="activeSubscription.interval + ' ' + intervalUnitDisplay"
          >
            <span slot="icon" class="c-functionalButtonBlock__icon">
                <repeat-icon />
            </span>
          </functional-button-block>

          <functional-button-block
            v-else
            class="disabled-click"
            no-arrow-icon
            :title="atc['portal.subscriptionSettingsDeliverEveryLabel'] || 'Deliver Every'"
            :second-text="activeSubscription.interval + ' ' + intervalUnitDisplay"
          >
            <span slot="icon" class="c-functionalButtonBlock__icon">
                <repeat-icon />
            </span>
          </functional-button-block>

          <!-- Shipping Method Block -->
          <functional-button-block
            v-if="!isCancelledSubscriptionRoute"
            :internal-link="{
              query: {
                template: 'edit-shipping-method',
                storeDomain,
                customerId,
              },
            }"
            :title="atc['portal.subscriptionSettingsShippingMethodLabel'] || 'Shipping Method'"
            :second-text="shippingMethod"
          >
            <span slot="icon" class="c-functionalButtonBlock__icon">
              <shipping-fast-icon />
            </span>
          </functional-button-block>

          <functional-button-block
            v-else
            class="disabled-click"
            no-arrow-icon
            :title="atc['portal.subscriptionSettingsShippingMethodLabel'] || 'Shipping Method'"
            :second-text="shippingMethod"
          >
            <span slot="icon" class="c-functionalButtonBlock__icon">
              <shipping-fast-icon />
            </span>
          </functional-button-block>
        </div>
    </mobile-subscription-template>

    <portal to="float-buttons">
       <mobile-float-buttons />
    </portal>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import FunctionalButtonBlock from '@components/functional-button-block.vue'
import RepeatIcon from '@components/Icon/repeat-icon.vue'
import ShippingFastIcon from '@components/Icon/shipping-fast-icon.vue'
import CalendarIcon from '@components/Icon/calendar-icon'
import MobileSubscriptionTemplate from '@components/mobile-subscription-template'
import TheHeader from '@components/the-header.vue'
import MobileFloatButtons from '@components/mobile-float-buttons'
import moment from 'moment'

export default {
  components: {
    TheHeader,
    FunctionalButtonBlock,
    CalendarIcon,
    ShippingFastIcon,
    RepeatIcon,
    MobileSubscriptionTemplate,
    MobileFloatButtons,
  },



  computed: {
    ...mapState('route', ['storeDomain', 'customerId']),

    ...mapState('translations', ['atc']),

    ...mapState('editMode', ['editNextOrder']),

    ...mapState('shippingMethods', [
      'activeEditShippingMethod',
      'shippingMethods',
    ]),

    ...mapState('orders', ['subscriptionOrders']),

    ...mapGetters('activeSubscription', ['activeSubscription', 'activeSubscriptionNextDate', 'activeQueue']),

    isCancelledSubscriptionRoute(){
      return this.$route.query.route === 'cancelledSubscriptions'
    },

    shippingMethod() {
      const { activeSubscription, activeQueue, editNextOrder } = this

      let shippingLines = null

      if (editNextOrder) {
        shippingLines = activeQueue.shipping_lines
      } else {
        shippingLines = activeSubscription.shipping_lines
      }

      if (shippingLines) {
        const shippingMethod = shippingLines[0]
        return `${shippingMethod.title}`
      } else {
        return false
      }
    },

    intervalUnitDisplay() {
      const { activeSubscription, atc } = this
      let intervalUnit = activeSubscription.period
      let plural = activeSubscription.interval > 1

      let displayUnit = ''
      if (intervalUnit === 'day') {
        if (plural) {
          displayUnit = atc['date-time.days-unit'] || 'days'
        } else {
          displayUnit = atc['date-time.day-unit'] || 'day'
        }
      } else if (intervalUnit === 'week') {
        if (plural) {
          displayUnit = atc['date-time.weeks-unit'] || 'weeks'
        } else {
          displayUnit = atc['date-time.week-unit'] || 'week'
        }
      } else if (intervalUnit === 'month') {
        if (plural) {
          displayUnit = atc['date-time.months-unit'] || 'months'
        } else {
          displayUnit = atc['date-time.month-unit'] || 'month'
        }
      } else {
        displayUnit = atc['date-time.days-unit'] || 'days'
      }
      return displayUnit
    },


    shipmentDate() {
      const { activeSubscriptionNextDate } = this
      if (!activeSubscriptionNextDate) return false
      return moment(activeSubscriptionNextDate, 'YYYYMMDD').format(
        'MMM D'
      )
    },

    deliveredDate(){
      const { subscriptionOrders, isOriginalCharge } = this
      let fullFillmentText
      let date

      if(subscriptionOrders.length > 0){
        fullFillmentText = subscriptionOrders[0].fulfillment_status ? subscriptionOrders[0].fulfillment_status : subscriptionOrders[0].financial_status
        date = isOriginalCharge
          ? moment(subscriptionOrders[0].created_at, 'YYYYMMDD').format('MMM D')
          : moment(subscriptionOrders[0].processed_at).format('MMM D')
      }

      if(fullFillmentText && fullFillmentText.includes('_')){
          fullFillmentText = fullFillmentText.split('_').join(' ')
      }

      return date || '---'
    },

    nextShipmentDates() {
      const { activeSubscription, shipmentDate } = this
      const { interval, period } = activeSubscription

      return [
        moment(shipmentDate)
          .add(interval, period)
          .format('MMM D, YYYY'),
        moment(shipmentDate)
          .add(interval * 2, period)
          .format('MMM D, YYYY'),
      ]
    },


    edit(){
      const { edit } = this.$route.query
      if(edit === 'deliverDays'){
        return 'deliverDays'
      } else if(edit === 'shipping'){
        return 'shipping'
      }
      return false
    },
  },

  mounted(){
    this.GET_SUBSCRIPTION_ORDERS(this.activeSubscription.shopify_order_id)
  },


  methods: {
    ...mapMutations('modalCalendarGlobal',  ['openModalCalendar']),

    ...mapMutations('shippingMethods', [
      'setActiveEditShippingMethod',
      'setNewSwapShippingMethod',
    ]),

    ...mapActions('subscriptions', ['UPDATE_SUBSCRIPTION']),

    ...mapActions('orders', ['GET_SUBSCRIPTION_ORDERS']),

    ...mapActions('shippingMethods', ['GET_SUBSCRIPTION_SHIPPING_METHODS']),

    ...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),

    ...mapActions('subscriptions', ['SKIP_NEXT_SHIPMENT', 'SHIP_TOMORROW']),

    ...mapActions('newCheckoutUpdates', ['COMPLETE_SAVED_NEW_CHECKOUT_UPDATE']),
  },

}
</script>

<style lang="scss">
@import '@design/_colors';
.c-details__buttonCTA{
  background-color: $color-white;
  position: absolute;
  bottom: 56px;
  width: 100%;
}

.c-details__buttonContain{
  display: flex;
  margin: 0px auto 0;
  justify-content: space-between;
  max-width: 400px;
  padding: 15px 16px;

  @media (min-width: 420px){
    padding: 0px;
  }
}

.c-details__button{
  text-transform: uppercase;
  letter-spacing: 0.8px;
  font-size: 12px;
  line-height: 16px;
  font-weight: bold;
  font-style: normal;
  max-width: 167px;
  background-color: #F7F9FB;

  &:first-child{
    margin-right: 8px;
  }
}


</style>
