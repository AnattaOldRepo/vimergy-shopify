<template>
<div>
  <portal to="header">
    <the-header />
  </portal>

  <div
      class="c-reactivateSubscriptionByLink"
    >
      <email-update-thank-you
        v-if="reactivationCompleted && activeSubscription"
        :active-subscription="activeSubscription"
        :active-charge="activeSubscription.next"
        class="c-reactivateSubscriptionByLink__thankYou"
      />

      <div v-else class="c-reactivateSubscriptionByLink__loading">
        <h2 class="c-reactivateSubscriptionByLink__loadingText"
          >{{ atc['portal.reactivateSubscriptionByLinkLoadingMessage'] || 'Reactivating Subscription' }}</h2
        >
        <loader-icon class="c-reactivateSubscriptionByLink__loadingIcon" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState, mapActions, mapGetters } from 'vuex'
import EmailUpdateThankYou from '@components/email-update-thank-you.vue'
import LoaderIcon from '@components/loader-icon.vue'
import TheHeader from '@components/the-header.vue'

export default {
  components: {
    TheHeader,
    EmailUpdateThankYou,
    LoaderIcon,
  },
  data: () => {
    return {
      isLoading: false,
      reactivationCompleted: false,
    }
  },
  computed: {
    ...mapState('translations', ['atc']),

    ...mapState('shop', ['shopData']),

    ...mapGetters('activeSubscription', ['activeSubscription']),
  },
  async mounted() {
    const { query } = this.$route
    console.log({query})
    if (!query) return

    if (!query.storeDomain || !query.customerId) {
      return this.$nuxt.error({
        statusCode: 404,
        message: `Error Loading Portal. ${
          !query.storeDomain ? 'Invalid store domain.' : 'Invalid customer ID.'
        }`,
      })
    }

    this.customerId = query.customerId
    this.storeDomain = query.storeDomain

    this.setStoreDomain(query.storeDomain)
    this.setCustomerId(query.customerId)

    // https://shop.foursigmatic.com/pages/account-subscriptions#/reactivate-subscription-by-link?storeDomain=foursigmastore-us.myshopify.com&customerId=2715671265316&subscriptionId=13346

    const {
      subscriptionId,
    } = query

    if (!subscriptionId) {
      return this.$nuxt.error({
        statusCode: 404,
        message: `Reactivate subscription parameters are missing. subscription Id: ${subscriptionId}`,
      })
    }

    try {

      await this.ACTIVATE_SUBSCRIPTION(subscriptionId)
      this.setActiveSubscriptionId(subscriptionId)
      this.reactivationCompleted = true
      this.removeActivateUrlParams()
    }
    catch(e) {
      console.log(e)
    }
  },

  methods: {
    ...mapMutations('route', ['setStoreDomain', 'setCustomerId']),
    ...mapActions('subscriptions', ['ACTIVATE_SUBSCRIPTION']),
    ...mapMutations('activeSubscription', ['setActiveSubscriptionId']),

    ...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),

    removeActivateUrlParams() {
      // const { removeParam } = this
      // let newUrl = window.location.href

      // newUrl = removeParam('subscriptionId', newUrl)

      // window.history.pushState({}, document.title, '/' + newUrl)
    },
  },
}
</script>

<style lang="scss">
@import '@design';

.c-reactivateSubscriptionByLink {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.c-reactivateSubscriptionByLink__thankYou {
  width: 100%;
}

.c-reactivateSubscriptionByLink__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  margin-top: 40px;
  padding: 20px;
  text-align: center;
}

.c-reactivateSubscriptionByLink__loadingText {
  line-height: 1.5;
}

.c-reactivateSubscriptionByLink__loadingIcon {
  margin-top: 40px;
}
</style>
