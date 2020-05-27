<template>
  <div>
    <portal to="header">
      <the-header />
    </portal>

    <div
      v-if="activeSubscription"
      class="c-skipShipment"
    >
      <thank-you-block
        v-if="shipmentSkipped"
        :active-subscription="activeSubscription"
        :active-charge="activeSubscription.next"
        class="c-skipShipment__thankYou"
      />

      <div v-else class="c-skipShipment__loading">
        <h2 class="c-skipShipment__loadingText"
          >{{ atc['portal.skippingNextShipmentMessage'] || 'Skipping your next shipment...' }}</h2>

        <loader-icon class="c-skipShipment__loadingIcon" />
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import TheHeader from '@components/the-header.vue'
import ThankYouBlock from '@components/thank-you-block.vue'
import LoaderIcon from '@components/loader-icon.vue'

export default {
  components: {
    TheHeader,
    ThankYouBlock,
    LoaderIcon,
  },
  data: () => {
    return {
      isLoading: false,
      shipmentSkipped: false,
    }
  },
  computed: {
    ...mapGetters('activeSubscription', ['activeSubscription']),

    ...mapState('translations', ['activeLanguageCode']),
  },

  watch: {
    // Skip shipment when activeSubscription available
    activeSubscription: {
      immediate: true,
      handler: function(newVal) {
        console.log('newVal', newVal)

        if (!newVal.next) return

        if (!this.skipped) {
          console.log('!skipped')
          this.skipShipment()
        }
      },
    },
  },

  mounted() {
    const { query } = this.$route
    console.log('mounted', query)

    if (!query) return

    const { skipShipment, skipShipmentSubscriptionId } = query

    if (
      !skipShipment ||
      !skipShipmentSubscriptionId
    ) {
      return this.$nuxt.error({
        statusCode: 404,
        message: `Skip Shipment parameters are missing. skipShipment: ${skipShipment}, skipShipmentSubscriptionId: ${skipShipmentSubscriptionId}`,
      })
    }

    this.setActiveSubscriptionId(parseInt(skipShipmentSubscriptionId))

    console.log({
      skipShipmentSubscriptionId: skipShipmentSubscriptionId,
      skipShipment: skipShipment,
    })
  },

  methods: {
    ...mapActions('subscriptions', ['UPDATE_SUBSCRIPTION_QUEUE']),

    ...mapMutations('activeSubscription', ['setActiveSubscriptionId']),

    ...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),

    async skipShipment() {
      const { activeSubscription } = this

      const { next, interval, period } = activeSubscription

      if (!next) return false
      const currentDate = next.date

      const newDate = moment(currentDate).add(interval, period).format('YYYYMMDDHHmmss')

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
          event: 'Upscribe Skip Shipment',
          payload: analyticsPayload,
        })
        this.shipmentSkipped = true
        // this.removeSkipShipmentUrlParams()

      } catch (e) {
        console.log('subscription/UPDATE_SUBSCRIPTION error: ', e)
      }
    },

    removeSkipShipmentUrlParams() {
      const { removeParam } = this
      let newUrl = window.location.href

      newUrl = removeParam('skipShipment', newUrl)
      newUrl = removeParam('skipShipmentSubscriptionId', newUrl)

      window.history.pushState({}, document.title, '/' + newUrl)
    },
  },
}
</script>

<style lang="scss">
@import '@design';

.c-skipShipment {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.c-skipShipment__thankYou {
  width: 100%;
}

.c-skipShipment__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  margin-top: 40px;
  padding: 20px;
  text-align: center;
}

.c-skipShipment__loadingText {
  line-height: 1.5;
}

.c-skipShipment__loadingIcon {
  margin-top: 40px;
}
</style>
