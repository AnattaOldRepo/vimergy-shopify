<script>
import { mapState, mapActions, mapGetters } from 'vuex'

import SubscriptionBlock from '@components/subscription-block.vue'
import VButton from '@components/v-button.vue'

export default {
  components: {
    SubscriptionBlock,
    VButton,
  },
  data: () => {
    return {
      updating: false,
    }
  },
  computed: {
    ...mapState('translations', ['atc']),

    ...mapState('route', ['customerId', 'storeDomain']),

    ...mapState('editMode', ['editNextOrder']),

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

    title() {
      const { activeSubscription, isTrial, remainingShipmentCount, atc } = this
      if (activeSubscription.active && isTrial) {
        if (remainingShipmentCount > 1) {
          return atc['portal.reactivateUpgradeTrialRemainingPlural'] ? atc['portal.reactivateUpgradeTrialRemainingPlural'].replace('<remaining-shipment-count>', remainingShipmentCount) : `Your Trial Has ${remainingShipmentCount} Remaining Shipments`
        } else {
          return atc['portal.reactivateUpgradeTrialRemainingSingular'] ? atc['portal.reactivateUpgradeTrialRemainingSingular'].replace('<remaining-shipment-count>', remainingShipmentCount) : `Your Trial Has ${remainingShipmentCount} Remaining Shipment`
        }
      } else if (!activeSubscription.active && isTrial) {
        return atc['portal.reactivateUpgradeTrialEnded'] || 'Your Trial Has Ended'
      } else {
        return atc['portal.reactivateUpgradeSubscriptionInactive'] || 'Your Subscription Is Inactive'
      }
    },
  },

  methods: {
    ...mapActions('subscriptions', ['UPDATE_SUBSCRIPTION', 'ACTIVATE_SUBSCRIPTION']),

    ...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),

    async handleReactivateSubscription() {
      const { activeSubscription} = this

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
        this.updating = false
      }
    },

    async handleConvertTrialToSubscription() {
      const { activeSubscription} = this

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
        this.updating = false
      }

    },
  },
}
</script>

<template>
  <subscription-block
    key="trial-expired-sub-block"
    :title="title"
  >
    <v-button
      v-if="isTrial && isActive"
      slot="button"
      :text="updating ? (atc['notices.updatingNotice'] || 'Updating') : (atc['buttons.convertTrialToSubscription'] || 'Convert Trial to Subscription')"
      @click.native="handleConvertTrialToSubscription"
    />

    <v-button
      v-else-if="isExpiredTrial || isInactiveTrial"
      slot="button"
      :text="updating ? (atc['notices.updatingNotice'] || 'Updating') : (atc['buttons.reactivateAsSubscription'] || 'Reactivate as Subscription')"
      @click.native="handleReactivateTrialAsSubscription"
    />

    <v-button
      v-else-if="isInactiveRegular"
      slot="button"
      :text="updating ? (atc['notices.updatingNotice'] || 'Updating') : (atc['buttons.reactivateSubscription'] || 'Reactivate Subscription')"
      @click.native="handleReactivateSubscription"
    />
  </subscription-block>
</template>
