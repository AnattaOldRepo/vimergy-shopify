<template>
  <div v-if="activeSubscription && initedSkipAction" class="c-skipShipment">
    <thank-you-block
      v-if="shipmentSkipped"
      :active-subscription="activeSubscription"
      :active-charge="activeSubscription.next"
      class="c-skipShipment__thankYou"
    />

    <div v-else class="c-skipShipment__loading">
      <h2 v-if="error" class="c-skipShipment__loadingText">{{ error.message === 'NETWORK ERROR' ? 'Network Error, please wait a moment and then refresh the page.' : error.message }}</h2>

      <h2
        v-else
        class="c-skipShipment__loadingText"
      >{{ atc['portal.skippingNextShipmentMessage'] || 'Skipping your next shipment...' }}</h2>

      <loader-icon class="c-skipShipment__loadingIcon" />
    </div>
  </div>

  <div v-else class="c-skipShipment">
    <div v-if="allDataLoaded && !shipmentSkipped" class="c-skipShipment__loading">
      <h3 class="c-skipShipment__loadingText">{{ atc['portal.skipNextShipmentMessage'] || 'Skip your next shipment' }}</h3>
      <v-button :text="atc['buttons.skipShipment'] || 'Skip Shipment'" auto @click.native="skipShipment" />
    </div>

    <div v-else class="c-skipShipment__loading">
      <loader-icon class="c-skipShipment__loadingIcon" />
    </div>

  </div>
</template>

<script>
import moment from 'moment'
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import ThankYouBlock from '@components/thank-you-block.vue'
import LoaderIcon from '@components/loader-icon.vue'
import VButton from '@components/v-button.vue'

export default {
  components: {
    ThankYouBlock,
    LoaderIcon,
    VButton,
  },
  data: () => {
    return {
      isLoading: false,
      shipmentSkipped: false,
      error: null,
      initedSkipAction: false,
    }
  },
  computed: {
    ...mapGetters('activeSubscription', ['activeSubscription']),

    ...mapState('translations', ['activeLanguageCode', 'atc']),

    allDataLoaded() {
      if (this.activeSubscription && this.activeSubscription.id) {
        return true
      } else {
        return false
      }
    },
  },
  mounted() {
    const { query } = this.$route
    this.error = null

    if (!query) return

    const { skipShipment, skipShipmentSubscriptionId } = query

    if (!skipShipment || !skipShipmentSubscriptionId) {
      return this.$nuxt.error({
        statusCode: 404,
        message: `Skip Shipment parameters are missing. skipShipment: ${skipShipment}, skipShipmentSubscriptionId: ${skipShipmentSubscriptionId}`,
      })
    }

    this.setActiveSubscriptionId(parseInt(skipShipmentSubscriptionId))
  },

  methods: {
    ...mapActions('subscriptions', ['UPDATE_SUBSCRIPTION_QUEUE']),

    ...mapMutations('activeSubscription', ['setActiveSubscriptionId']),

    ...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),

    async skipShipment() {
      const { activeSubscription } = this

      const { next, interval, period } = activeSubscription

      if (!next) return false

      this.initedSkipAction = true

      const currentDate = next.date

      const newDate = moment(currentDate)
        .add(interval, period)
        .format('YYYYMMDDHHmmss')

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
        this.error = { state: 'FAILURE', message: this.stripHtml(e.message) }
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
  max-width: 500px;
}

.c-skipShipment__loadingText {
  line-height: 1.5;
  margin-bottom: 30px;
}
</style>
