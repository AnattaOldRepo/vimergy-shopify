<template>
  <div v-if="activeSubscription" class="c-subscriptionHeadline">
    <h2 class="c-subscriptionHeadline__title"><strong>Subscription</strong> <span> {{ activeSubscription.id }}</span></h2>

    <div
      v-if="activeSubscription.active"
      class="c-subscriptionHeadline__button-contain"
      @click="pickingEdit($event)">
      <v-button
        data-id="button-edit-subscription"
        data-next-order="false"
        class="c-subscriptionHeadline__button"
        :class="{'c-subscriptionHeadline__button--active': buttonActive === 'button-edit-subscription'}">
        Edit Subscription Details
      </v-button>

      <v-button
        data-id="button-edit-next-order"
        data-next-order="true"
        class="c-subscriptionHeadline__button c-subscriptionHeadline__button--secondary"
        :class="{'c-subscriptionHeadline__button--active': buttonActive === 'button-edit-next-order'}">
        Edit Next Shipment
      </v-button>

      <p
        v-if="deliveredDate"
        class="c-subscriptionHeadline__button c-subscriptionHeadline__button--text displayOnly">
        Previous Shipment <span>({{ deliveredDate }})</span>
      </p>

      <v-button
        v-if="windowWidth > 1024 && (subscriptionOrders && subscriptionOrders.length)"
        data-id="button-subscription-history"
        class="c-subscriptionHeadline__button"
        :class="{'c-subscriptionHeadline__button--active': buttonActive === 'button-subscription-history'}">
        Subscription History
      </v-button>

      <span v-else-if="windowWidth <= 1024 && (subscriptionOrders && subscriptionOrders.length)" role = "button" tabindex="0" aria-label="history">
        <history-icon
          data-id="button-subscription-history"
          class="c-subscriptionHeadline__button c-subscriptionHeadline__button--icon"
          width="14"
          height="14"
          fill="#000000"
        />
      </span>


      <!-- Drawer Portal Variants -->
      <portal v-if="drawerSubscriptionHistoryOpen" to="drawers">
        <drawer-subscription-history
          :show="drawerSubscriptionHistoryOpen"
          :active-subscription="activeSubscription"
          @close="drawerSubscriptionHistoryOpen = false"
        />
      </portal>
    </div>

    <div v-else class="c-subscriptionHeadline__reactiveBlock">
      <v-button
        v-if="isTrial && isActive"
        slot="button"
        class="c-button--primary c-subscriptionHeadline__button--mobile bold"
        :text="updating ? (atc['notices.updatingNotice'] || 'Updating') : (atc['buttons.convertTrialToSubscription'] || 'Convert Trial to Subscription')"
        @click.native="handleConvertTrialToSubscription"
      />

      <v-button
        v-else-if="isExpiredTrial || isInactiveTrial"
        slot="button"
        class="c-button--primary c-subscriptionHeadline__button--mobile bold"
        :text="updating ? (atc['notices.updatingNotice'] || 'Updating') : (atc['buttons.reactivateAsSubscription'] || 'Reactivate as Subscription')"
        @click.native="handleReactivateTrialAsSubscription"
      />

      <v-button
        v-else-if="isInactiveRegular"
        slot="button"
        class="c-button--primary c-subscriptionHeadline__button--mobile bold"
        :text="updating ? (atc['notices.updatingNotice'] || 'Updating') : (atc['buttons.reactivateSubscription'] || 'Reactivate Subscription')"
        @click.native="handleReactivateSubscription"
      />
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import moment from 'moment'
import VButton from '@components/v-button.vue'
import DrawerSubscriptionHistory from '@components/drawer-subscription-history.vue'
import HistoryIcon from '@components/Icon/history-icon'
import { windowSizes } from '@mixins/windowSizes'

export default {
  components:{
    VButton,
    DrawerSubscriptionHistory,
    HistoryIcon,
  },

  mixins: [windowSizes],

  data(){
    return{
      buttonActive: 'button-edit-subscription',
      drawerSubscriptionHistoryOpen: false,
      updating: false,
    }
  },

  computed:{
    ...mapState('subscriptions', ['subscriptions']),

    ...mapState('orders', ['subscriptionOrders']),

    ...mapState('activeSubscription', ['activeSubscriptionId']),

    ...mapState('translations', ['atc']),

    ...mapState('route', ['customerId', 'storeDomain']),

    ...mapState('editMode', ['editNextOrder']),

    ...mapGetters('activeSubscription', ['activeSubscription']),

    ...mapGetters('subscriptions', ['subscriptionInActive']),

    ...mapGetters('activeSubscription', ['activeSubscription']),

    isActive() {
      return this.activeSubscription.active
    },

    isTrial() {
      return this.activeSubscription.charge_limit > 0
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

    remainingShipmentCount() {
      return this.activeSubscription.charge_limit - this.activeSubscription.order_count
    },

    isOriginalCharge() {
      if(this.subscriptionOrders && this.subscriptionOrders[0]){
        return !!this.subscriptionOrders[0].shopify_order_id
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
      } else {
        return false
      }

      if(fullFillmentText && fullFillmentText.includes('_')){
          fullFillmentText = fullFillmentText.split('_').join(' ')
      }

      return `${fullFillmentText} ${date}`
    },
  },

  methods: {
    ...mapMutations('editMode', ['setEditNextOrder']),

    ...mapMutations('activeSubscription', ['setActiveSubscriptionId']),

    ...mapActions('orders', ['GET_SUBSCRIPTION_ORDERS']),

    ...mapActions('subscriptions', ['UPDATE_SUBSCRIPTION', 'ACTIVATE_SUBSCRIPTION', 'GET_SUBSCRIPTIONS']),

    ...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),

    pickingEdit(e){
      const { id, nextOrder } = e.target.dataset
      if(id === 'button-subscription-history'){
        this.drawerSubscriptionHistoryOpen = true
      } else if (id) {
          this.buttonActive = id
      }

      if(nextOrder){
        this.setEditNextOrder(nextOrder === 'true')
      }
    },

    async handleReactivateSubscription() {
      const { activeSubscription, storeDomain, customerId } = this

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

        this.$router.push({ name: 'index', query: { storeDomain, customerId } })
      }
    },

    async handleReactivateTrialAsSubscription() {
      const { activeSubscription, storeDomain, customerId } = this

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
        this.setActiveSubscriptionId(activeSubscription.id)
        this.updating = false

        this.$router.push({ name: 'index', query: { storeDomain, customerId } })
      }
    },

    async handleConvertTrialToSubscription() {
      const { activeSubscription, storeDomain, customerId } = this

      const updatePayload = {
        requestPayload: {
          charge_limit: 0,
        },
      }

      let analyticsEventName = 'Upscribe Convert Trial to Subscription'

      let analyticsPayload = {
        subscription: activeSubscription,
      }

      this.updating = true
      try {
        await this.UPDATE_SUBSCRIPTION(updatePayload)
        this.triggerAnalyticsEvent({
          event: analyticsEventName,
          payload: analyticsPayload,
        })
      } catch (e) {
        console.log('handleConvertTrialToSubscription error: ', e)
      } finally {
        await this.GET_SUBSCRIPTIONS()
        this.setActiveSubscriptionId(activeSubscription.id)
        this.updating = false

        this.$router.push({ name: 'index', query: { storeDomain, customerId } })
      }
    },
  },
}
</script>

<style lang="scss">
@import '@design';
$color-id: #A3B5BF;

.c-subscriptionHeadline{
  margin: 20px 0 60px;

  @include bp(tablet-large){
    padding: 0
  }
}

.c-subscriptionHeadline__title{
  font-size: 32px;
  line-height: 42px;
  font-style: normal;
  text-transform: capitalize;

  span {
    color: $color-id
  }
}

.c-subscriptionHeadline__button-contain{
  display: flex;
  margin-top: 10px;
  width: auto;
  align-items: center;
}

.c-subscriptionHeadline__button{
  margin-right: 20px;
  font-size: 14px;
  line-height: 18px;
  background-color: transparent;
  cursor: pointer;
  border: none;
  padding: 10px 0px;
  position: relative;
  display: inline-block;
  width: auto;
  color: $color-black;
  font-weight: 400;
  transition: none;
  border-bottom: 3px solid transparent;

  &:hover{
    @include border-focus;
    background-color: transparent;
  }

  &:focus{
    @include border-focus;
    background-color: transparent;
  }

  &--secondary{
    margin-right: 40px;

    &:before{
      content: '';
      background-color: $color-gray-400;
      height: 50%;
      width: 1px;
      position: absolute;
      right: -20px;
    }
  }

  &--active{
    font-weight: bold;
    @include border-focus
  }

  &--text{
    margin: 0 20px 0 0;
  }
}

.displayOnly{
  pointer-events: none;
  span{
    text-transform: capitalize;
  }
}

.c-subscriptionHeadline__button--icon{
  padding: 0px;
  fill: $color-black
}

.c-subscriptionHeadline__reactiveBlock{
  margin-top: 16px;
  max-width: 400px;
}

.bold{
  text-transform: uppercase;
  letter-spacing: 0.8px;
  font-weight: bold;
}

.c-subscriptionHeadline__button--mobile{
  width: auto;
  padding: 12px 24px;
}
</style>
