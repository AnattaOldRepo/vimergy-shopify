<template>
  <div class="c-mobileFloatButtons">
    <div class="c-mobileFloatButtons__buttonContain">
      <v-button
        v-if="!isCancelledSubscriptionRoute && chargeNowEnabled"
        key="ship-now-button"
        class="c-button c-button--transparent c-mobileFloatButtons__button"
        @onClick="shipNow"
      >
        {{
          shipmentNowUpdate
            ? shipmentNowUpdate
            : atc['buttons.shipNow'] || 'Ship Now'
        }}
      </v-button>

      <v-button
        v-if="!isCancelledSubscriptionRoute && !chargeNowEnabled"
        key="ship-tomorrow-button"
        class="c-button c-button--transparent c-mobileFloatButtons__button"
        @onClick="shipTomorrow"
      >
        {{
          shipmentNowUpdate
            ? shipmentNowUpdate
            : atc['buttons.shipTomorrow'] || 'Ship Tomorrow'
        }}
      </v-button>

      <v-button
        v-if="!isCancelledSubscriptionRoute"
        class="c-button c-button--transparent c-mobileFloatButtons__button"
        @onClick="skipNextShipment"
      >
        {{
          skipShipmentUpdate
            ? skipShipmentUpdate
            : atc['buttons.skipNextShipment'] || 'Skip Next Shipment'
        }}
      </v-button>

      <v-button
        v-if="isCancelledSubscriptionRoute && isInactiveRegular"
        class="c-button c-button--transparent c-mobileFloatButtons__button"
        :text="
          updating
            ? atc['notices.updatingNotice'] || 'Updating'
            : atc['buttons.reactivateSubscription'] || 'Reactivate Subscription'
        "
        @click.native="handleReactivateSubscription"
      />

      <v-button
        v-if="isCancelledSubscriptionRoute && isTrial && isActive"
        class="c-button c-button--transparent c-mobileFloatButtons__button"
        :text="
          updating
            ? atc['notices.updatingNotice'] || 'Updating'
            : atc['buttons.convertTrialToSubscription'] ||
              'Convert Trial to Subscription'
        "
        @click.native="handleConvertTrialToSubscription"
      />

      <v-button
        v-else-if="isCancelledSubscriptionRoute && validateIsExpiredAndInactive"
        class="c-button c-button--transparent c-mobileFloatButtons__button"
        :text="
          updating
            ? atc['notices.updatingNotice'] || 'Updating'
            : atc['buttons.reactivateAsSubscription'] ||
              'Reactivate as Subscription'
        "
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

  data() {
    return {
      shipmentNowUpdate: '',
      skipShipmentUpdate: '',
      updating: false,
    }
  },

  computed: {
    ...mapState('translations', ['atc']),

    ...mapState('route', ['customerId', 'storeDomain']),

    ...mapState('shop', ['chargeNowEnabled']),

    ...mapGetters('activeSubscription', ['activeSubscription']),

    isCancelledSubscriptionRoute() {
      return this.$route.query.route === 'cancelledSubscriptions'
    },

    isInactiveRegular() {
      const { activeSubscription } = this
      return (
        !activeSubscription.active &&
        activeSubscription.cancellation_reason !== 'Trial period has expired'
      )
    },

    isExpiredTrial() {
      const { activeSubscription } = this
      return (
        !activeSubscription.active &&
        activeSubscription.cancellation_reason === 'Trial period has expired'
      )
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

    validateIsExpiredAndInactive() {
      if (this.isExpiredTrial || this.isInactiveTrial) {
        return true
      }
      return false
    },
  },

  methods: {
    ...mapActions('subscriptions', [
      'SKIP_NEXT_SHIPMENT',
      'SHIP_TOMORROW',
      'SHIP_NOW',
    ]),

    ...mapActions('subscriptions', [
      'UPDATE_SUBSCRIPTION',
      'ACTIVATE_SUBSCRIPTION',
      'GET_SUBSCRIPTIONS',
    ]),

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
        console.error('handleReactivateSubscription error: ', e)
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
        console.error('handleReactivateTrialAsSubscription error: ', e)
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
        console.error('handleConvertTrialToSubscription error: ', e)
      } finally {
        await this.GET_SUBSCRIPTIONS()
        this.updating = false
      }
    },

    async shipNow() {
      this.shipmentNowUpdate = 'Updating'
      try {
        const createdCharge = await this.SHIP_NOW()
        if (createdCharge.charge_error) {
          console.error({
            message: `Charge failed: ${createdCharge.charge_error}`,
          })
          this.$toast.error(`Charge failed: ${createdCharge.charge_error}`)
        } else {
          this.$toast.success(`Order created.`)
          await this.GET_SUBSCRIPTIONS()
        }
      } catch (e) {
        console.error('shipNow e:', e)
        this.$toast.error(`Charge failed: ${e.message}`)
      } finally {
        this.shipmentNowUpdate = ''
      }
    },

    async shipTomorrow() {
      this.shipmentNowUpdate = 'Updating'
      try {
        await this.SHIP_TOMORROW()
      } catch (e) {
        console.error('shipTomorrow e:', e)
      } finally {
        this.shipmentNowUpdate = ''
      }
    },

    async skipNextShipment() {
      this.skipShipmentUpdate = 'Updating'
      try {
        await this.SKIP_NEXT_SHIPMENT()
      } catch (e) {
        console.error('skipNextShipment e:', e)
      } finally {
        this.skipShipmentUpdate = ''
      }
    },
  },
}
</script>

<style lang="scss">
@import '@design/_colors';

.c-mobileFloatButtons {
  background-color: $color-white;
  position: relative;
  margin-bottom: 26px;
  width: 100%;
}

.c-mobileFloatButtons__buttonContain {
  display: flex;
  margin: 0px auto 0;
  justify-content: space-between;
  max-width: 400px;
  padding: 15px 16px;
}

.c-mobileFloatButtons__button {
  text-transform: uppercase;
  letter-spacing: 0.8px;
  font-size: 12px;
  line-height: 16px;
  font-weight: bold;
  font-style: normal;
  background-color: #f7f9fb;
  border: none;

  &:first-child {
    margin-right: 8px;
  }
}
</style>
