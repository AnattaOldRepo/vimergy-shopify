<template>
  <div v-if="activeSubscription">
    <portal to="header">
        <the-header
          :middle-html="'Subscription ' + activeSubscription.id"
          mode="backwardRoute"
        />
    </portal>

    <mobile-subscription-template functional-block-title="Edit">
      <div slot="functionality-block" class="c-mobileSubscriptionTemplate__tools">
        <!-- Subscription & Details Block -->
        <functional-button-block
          :internal-link="{
              query: {
                template: 'details',
                ...returnCancelledSubscriptionRoute,
                storeDomain,
                customerId,
              },
            }"
          title="Subscription Details"
          class="c-subscriptionMobilePage__tool"
        >
          <span slot="icon" class="c-functionalButtonBlock__icon">
            <subscription-icon />
          </span>
        </functional-button-block>

        <!-- Next Shipment Block -->
        <functional-button-block
          v-if="!isCancelledSubscriptionRoute"
          :internal-link="{
              query: {
                template: 'next-shipment',
                ...returnCancelledSubscriptionRoute,
                storeDomain,
                customerId,
              },
            }"
          title="Next Shipment"
          :second-text="shipmentDate"
          class="c-subscriptionMobilePage__tool"
        >
          <span slot="icon" class="c-functionalButtonBlock__icon">
            <shipping-timed-icon />
          </span>
        </functional-button-block>

        <!-- Last Shipment Block -->
        <functional-button-block
          v-else
          no-arrow-icon
          title="Last Shipment"
          :second-text="deliveredDate"
          class="c-subscriptionMobilePage__tool disabled-click"
        >
          <span slot="icon" class="c-functionalButtonBlock__icon">
            <shipping-timed-icon />
          </span>
        </functional-button-block>

        <!-- Adress & Payment Block -->
        <functional-button-block
          :internal-link="{
            query: {
              template: 'address-payment',
              ...returnCancelledSubscriptionRoute,
              storeDomain,
              customerId,
            },
          }"
          title="Address & Payment"
          class="c-subscriptionMobilePage__tool"
        >
          <span slot="icon" class="c-functionalButtonBlock__icon">
            <credit-card-icon />
          </span>
        </functional-button-block>

        <!-- Past Shipment -->
        <functional-button-block
          :internal-link="{
            query: {
              template: 'history',
              ...returnCancelledSubscriptionRoute,
              storeDomain,
              customerId,
            },
          }"
          title="Past Shipments"
          :second-text="pastShipmentText"
          class="c-subscriptionMobilePage__tool c-subscriptionMobilePage__toolLast"
        >
          <span slot="icon" class="c-functionalButtonBlock__icon">
            <history-icon/>
          </span>
        </functional-button-block>

        <!-- Cancel Subscription -->
        <functional-button-block
          v-if="!isCancelledSubscriptionRoute"
          :internal-link="{
            path: '/cancel',
            query: {
              storeDomain,
              customerId,
            },
          }"
          title="Cancel Subscription"
        >
          <span slot="icon" class="c-functionalButtonBlock__icon">
              <cross-circle-icon />
          </span>
        </functional-button-block>

        <p class="c-subscriptionMobilePage__idText">Subscription ID: {{ activeSubscription.id }}</p>
      </div>
    </mobile-subscription-template>

    <portal v-if="isCancelledSubscriptionRoute" to="float-buttons">
       <mobile-float-buttons />
    </portal>
 </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import FunctionalButtonBlock from '@components/functional-button-block.vue'
import ShippingTimedIcon from '@components/Icon/shipping-timed-icon.vue'
import SubscriptionIcon from '@components/Icon/subscription-icon.vue'
import CreditCardIcon from '@components/Icon/credit-card-icon'
import HistoryIcon from '@components/Icon/history-icon'
import MobileSubscriptionTemplate from '@components/mobile-subscription-template'
import CrossCircleIcon from '@components/Icon/cross-circle-icon'
import MobileFloatButtons from '@components/mobile-float-buttons'
import TheHeader from '@components/the-header'
import moment from 'moment'


export default {
  components: {
    TheHeader,
    FunctionalButtonBlock,
    ShippingTimedIcon,
    SubscriptionIcon,
    CreditCardIcon,
    HistoryIcon,
    MobileSubscriptionTemplate,
    CrossCircleIcon,
    MobileFloatButtons,
  },

  data(){
    return{
      updating: false,
    }
  },

  computed: {
    ...mapState('translations', ['atc']),

    ...mapState('route', ['storeDomain', 'customerId']),

    ...mapState('orders', ['subscriptionOrders']),

    ...mapGetters('activeSubscription', ['activeSubscription', 'activeSubscriptionNextDate']),

    isCancelledSubscriptionRoute(){
      return this.$route.query.route === 'cancelledSubscriptions'
    },

    isInactiveTrial() {
      return !this.isActive && this.isTrial
    },

    isExpiredTrial() {
      const { activeSubscription } = this
      return !activeSubscription.active && activeSubscription.cancellation_reason === 'Trial period has expired'
    },

    isInactiveRegular() {
      const { activeSubscription } = this
      return !activeSubscription.active && activeSubscription.cancellation_reason !== 'Trial period has expired'
    },

    returnCancelledSubscriptionRoute(){
      if(this.isCancelledSubscriptionRoute){
        return {'route': 'cancelledSubscriptions'}
      }
      return {}
    },

    shipmentDate() {
      const { activeSubscriptionNextDate } = this
      if (!activeSubscriptionNextDate) return false
      return moment(activeSubscriptionNextDate, 'YYYYMMDD').format(
        'MMM D'
      )
    },

    isOriginalCharge() {
      if(this.subscriptionOrders && this.subscriptionOrders[0]){
        return !!this.subscriptionOrders[0].shopify_order_id
      }
      return ''
    },

    pastShipmentText(){
      if(this.deliveredDate){
        return `<br/><span class="c-functionalButtonBlock__small-text">Last Shipment Delivered ${this.deliveredDate}</span>`
      }
      return ''
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
  },


  mounted(){
    this.GET_SUBSCRIPTION_ORDERS(this.activeSubscription.shopify_order_id)
  },

  methods: {
    ...mapMutations('activeSubscription', ['setActiveSubscriptionId']),

    ...mapActions('orders', ['GET_SUBSCRIPTION_ORDERS']),

    ...mapActions('subscriptions', ['UPDATE_SUBSCRIPTION', 'ACTIVATE_SUBSCRIPTION', 'GET_SUBSCRIPTIONS']),

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
        console.log('handleReactivateSubscription error: ', e)
      } finally {
        await this.GET_SUBSCRIPTIONS()
        // Set route getting new subscription as current route dynamically
        this.setActiveSubscriptionId(activeSubscription.id)
        this.updating = false
      }
    },

    async handleReactivateTrialAsSubscription() {
      const { activeSubscription} = this

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
        console.log('handleReactivateTrialAsSubscription error: ', e)
      } finally {
        await this.GET_SUBSCRIPTIONS()
        this.updating = false
      }
    },
  },
}
</script>

<style lang="scss">
@import '@design/_colors';
.c-subscriptionMobilePage__idText{
  color: $color-blue-secondary;
  font-size: 14px;
  line-height: 18px;
  text-align: center;
  margin-top: 16px;
  margin-bottom: 22px;
  letter-spacing: 0.2px;
}


.c-subscriptionMobilePage__toolLast{
    margin-top: 24px;
}

.c-subscriptionMobilePage__reactiveBlock{
  margin-top: 16px;
  max-width: 400px;
  display: flex;
  justify-content: center;
}

.c-subscriptionMobilePage__button{
  background-color: $color-white;
  &:hover,
  &:focus{
    background-color:$color-white;
  }
}

</style>
