<template>
   <div class="c-mobileFloatButtons">
      <div class="c-mobileFloatButtons__buttonContain">
        <v-button
          v-if="!isCancelledSubscriptionRoute"
          class="c-button c-button--transparent c-mobileFloatButtons__button"
          @onClick="shipTomorrow"
        >
          {{shipmentNowUpdate ?  shipmentNowUpdate : 'Ship Now'}}
        </v-button>

        <v-button
          v-if="!isCancelledSubscriptionRoute"
          class="c-button c-button--transparent c-mobileFloatButtons__button"
          @onClick="skipNextShipment"
        >
          {{skipShipmentUpdate ?  skipShipmentUpdate : 'Skip Next Shipment'}}
        </v-button>

        <v-button
          v-if="isCancelledSubscriptionRoute && isInactiveRegular"
          class="c-button c-button--transparent c-mobileFloatButtons__button"
          :text="updating ? (atc['notices.updatingNotice'] || 'Updating') : (atc['buttons.reactivateSubscription'] || 'Reactivate Subscription')"
          @click.native="handleReactivateSubscription"
        />

        <v-button
          v-if="isCancelledSubscriptionRoute && isTrial && isActive"
          class="c-button c-button--transparent c-mobileFloatButtons__button"
          :text="updating ? (atc['notices.updatingNotice'] || 'Updating') : (atc['buttons.convertTrialToSubscription'] || 'Convert Trial to Subscription')"
          @click.native="handleConvertTrialToSubscription"
    />

        <v-button
          v-else-if="isCancelledSubscriptionRoute && validateIsExpiredAndInactive"
          class="c-button c-button--transparent c-mobileFloatButtons__button"
          :text="updating ? (atc['notices.updatingNotice'] || 'Updating') : (atc['buttons.reactivateAsSubscription'] || 'Reactivate as Subscription')"
          @click.native="handleReactivateTrialAsSubscription"
        />
      </div>
    </div>
</template>

<script>
import VButton from '@components/v-button'
import { mapActions, mapGetters, mapState } from 'vuex'
export default {
  components: {
    VButton,
  },

  data(){
    return {
      shipmentNowUpdate: '',
      skipShipmentUpdate: '',
      updating: false,
    }
  },

  computed:{
    ...mapState('translations', ['atc']),

    ...mapState('route', ['customerId', 'storeDomain']),

    ...mapGetters('activeSubscription', ['activeSubscription']),

    isCancelledSubscriptionRoute(){
      return this.$route.query.route === 'cancelledSubscriptions'
    },

    isInactiveRegular() {
      const { activeSubscription } = this
      return !activeSubscription.active && activeSubscription.cancellation_reason !== 'Trial period has expired'
    },

    isExpiredTrial() {
      const { activeSubscription } = this
      return !activeSubscription.active && activeSubscription.cancellation_reason === 'Trial period has expired'
    },

    isActive() {
      return this.activeSubscription.active
    },

    isTrial() {
      return this.activeSubscription.charge_limit > 0
    },

    isInactiveTrial() {
      return !this.isActive && this.isTrial
    },

    validateIsExpiredAndInactive(){
      if(this.isExpiredTrial || this.isInactiveTrial){
        return true
      }
      return false
    },
  },

  methods: {
    ...mapActions('subscriptions', ['SKIP_NEXT_SHIPMENT', 'SHIP_TOMORROW']),

    ...mapActions('subscriptions', ['UPDATE_SUBSCRIPTION', 'ACTIVATE_SUBSCRIPTION', 'GET_SUBSCRIPTIONS']),

    ...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),

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
        this.$router.push({ name: 'index', query: { storeDomain, customerId } })
      } catch (e) {
        console.log('handleReactivateSubscription error: ', e)
      } finally {
        await this.GET_SUBSCRIPTIONS()
        this.updating = false
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
        this.$router.push({ name: 'index', query: { storeDomain, customerId } })
      } finally {
        await this.GET_SUBSCRIPTIONS()
        this.updating = false
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
        this.$router.push({ name: 'index', query: { storeDomain, customerId } })
      } catch (e) {
        console.log('handleConvertTrialToSubscription error: ', e)
      } finally {
        await this.GET_SUBSCRIPTIONS()
        this.updating = false
      }

    },

    async shipTomorrow() {
      this.shipmentNowUpdate = 'Updating'
      try {
        await this.SHIP_TOMORROW()
      } catch(e) {
        console.log(e)
      } finally{
        this.shipmentNowUpdate = ''
      }
    },

    async skipNextShipment() {
      this.skipShipmentUpdate = 'Updating'
      try {
        await this.SKIP_NEXT_SHIPMENT()
      } catch(e) {
        console.log(e)
      } finally{
        this.skipShipmentUpdate = ''
      }
    },
  },
}
</script>

<style lang="scss">
@import '@design/_colors';

.c-mobileFloatButtons{
  background-color: $color-white;
  position: relative;
  margin-bottom: 56px;
  width: 100%;
}

.c-mobileFloatButtons__buttonContain{
  display: flex;
  margin: 0px auto 0;
  justify-content: space-between;
  max-width: 400px;
  padding: 15px 16px;
}

.c-mobileFloatButtons__button{
  text-transform: uppercase;
  letter-spacing: 0.8px;
  font-size: 12px;
  line-height: 16px;
  font-weight: bold;
  font-style: normal;
  background-color: #F7F9FB;
  border: none;

  &:first-child{
    margin-right: 8px;
  }
}

</style>
