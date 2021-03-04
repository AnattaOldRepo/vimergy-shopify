<template>
  <!-- Mobile Template -->
  <div v-if="windowWidth < 768" class="c-subscription">
    <headline-banner
      v-if="
        atc['portal.notification'] &&
          store &&
          store.portal_notification_banner_enabled
      "
      class="u-mt-4"
    />

    <mobile-screen-layout />
  </div>

  <!-- Desktop Template -->
  <div v-else>
    <!-- Loader template for Desktop -->
    <div v-if="!subscriptionsLoaded">
      <div class="c-subscription__inner">
        <div class="c-subscription__blocks">
          <subscription-block-next-settings
            v-if="editNextOrder"
            key="block1"
            :class="{ 'u-disableExpiredChanges': !activeSubscription.active }"
          />

          <subscription-block-main-settings
            v-if="!editNextOrder"
            key="block2"
            :class="{ 'u-disableExpiredChanges': !activeSubscription.active }"
          />

          <subscription-block-details
            key="block3"
            :class="{ 'u-disableExpiredChanges': !activeSubscription.active }"
          />
        </div>

        <subscription-products-grid
          class="c-subscription__productsGrid"
          :class="{ 'u-disableExpiredChanges': !activeSubscription.active }"
        />
      </div>
    </div>

    <!-- Main Setting -->
    <div
      v-else-if="
        subscriptions &&
          Object.keys(toggleSubscriptions).length > 0 &&
          subscriptionsLoaded
      "
      class="c-subscription"
    >
      <div class="c-subscription__outer">
        <subscription-picker
          v-if="
            subscriptions &&
              Object.keys(toggleSubscriptions).length >= 1 &&
              windowWidth >= 768
          "
          :class="{
            'u-visuallyHidden': Object.keys(toggleSubscriptions).length === 1,
          }"
          :query="routeQuery"
        />

        <div class="c-subscription__inner">
          <subscription-headline />
          <div class="c-subscription__blocks">
            <!--  -->
            <!-- <reactivate-upgrade-block v-if="subscriptions && !isEmptyObject(subscriptions) && (!activeSubscription.active || activeSubscription.charge_limit > 0)" key="reactivate-upgrade-block"/> -->

            <!-- Edit Next Order or Subscription Settings -->
            <!-- <toggle-edit-mode-block v-if="isStandardActiveSubscription" key="edit-mode-block"/> -->

            <!-- Next Order -->
            <subscription-block-next-settings
              v-if="editNextOrder"
              key="block1"
              :class="{ 'u-disableExpiredChanges': !activeSubscription.active }"
            />

            <!-- Subscription Settings -->
            <subscription-block-main-settings
              v-if="!editNextOrder"
              key="block2"
              :class="{ 'u-disableExpiredChanges': !activeSubscription.active }"
            />

            <!-- Details -->
            <subscription-block-details
              key="block3"
              :class="{ 'u-disableExpiredChanges': !activeSubscription.active }"
            />
          </div>

          <subscription-products-grid
            class="c-subscription__productsGrid"
            :class="{ 'u-disableExpiredChanges': !activeSubscription.active }"
          />
        </div>
      </div>
    </div>

    <!-- No Subscriptions -->
    <div v-else class="c-noSubscriptions">
      <h2 class="c-noSubscriptions__text">{{
        atc['portal.noSubscriptions'] || 'You have no active subscriptions.'
      }}</h2>
      <v-button class="c-noSubscriptions__button" auto @onClick="redirect">
        {{ atc['buttons.shopNow'] || 'Shop Now' }}
      </v-button>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'

import MobileScreenLayout from '@components/mobile-screen-layout.vue'
// import TheHeader from '@components/the-header.vue'

import VButton from '@components/v-button.vue'
import SubscriptionPicker from '@components/subscription-picker.vue'
// import ReactivateUpgradeBlock from '@components/reactivate-upgrade-block.vue'
import HeadlineBanner from '@components/headline-banner.vue'
import SubscriptionBlockNextSettings from '@components/subscription-block-next-settings.vue'
import SubscriptionBlockMainSettings from '@components/subscription-block-main-settings.vue'
import SubscriptionBlockDetails from '@components/subscription-block-details.vue'
// import ToggleEditModeBlock from '@components/toggle-edit-mode-block.vue'
import { windowSizes } from '@mixins/windowSizes'
import SubscriptionHeadline from '@components/subscription-headline.vue'
import SubscriptionProductsGrid from '@components/subscription-products-grid.vue'

export default {
  components: {
    SubscriptionPicker,
    // ReactivateUpgradeBlock,
    SubscriptionBlockNextSettings,
    SubscriptionBlockMainSettings,
    SubscriptionBlockDetails,
    // ToggleEditModeBlock,
    HeadlineBanner,
    SubscriptionProductsGrid,
    VButton,
    SubscriptionHeadline,
    MobileScreenLayout,
  },

  mixins: [windowSizes],

  computed: {
    ...mapState('translations', ['atc']),

    ...mapState('subscriptions', [
      'subscriptions',
      'noActiveSubscriptions',
      'subscriptionsLoaded',
    ]),

    ...mapState('shop', ['shopData', 'store']),

    ...mapState('editMode', ['editNextOrder']),

    ...mapGetters('activeSubscription', [
      'activeSubscription',
      'activeSubscriptionIsExpiredTrial',
    ]),

    ...mapGetters('subscriptions', [
      'subscriptionActive',
      'subscriptionInActive',
    ]),

    // Only show toggle if active subscription
    // isStandardActiveSubscription() {
    //   const { activeSubscription } = this
    //   return activeSubscription && activeSubscription.active
    // },

    routeQuery() {
      let routeQuery = ''
      const { route } = this.$route.query

      if (route && route === 'cancelledSubscriptions') {
        routeQuery = route
      } else {
        routeQuery = ''
      }
      return routeQuery
    },

    toggleSubscriptions() {
      let currentSubscriptions
      const { route } = this.$route.query

      if (route && route === 'cancelledSubscriptions') {
        currentSubscriptions = this.subscriptionInActive
      } else {
        currentSubscriptions = this.subscriptionActive
      }
      return currentSubscriptions
    },
  },

  watch: {
    toggleSubscriptions: {
      immediate: true,
      handler: function(newVal) {
        if (!newVal || !newVal.length) return
        // this prevents subscripition from changing in mobile while changing pages
        if (this.$route.query.template) return
        // in case there is no susbscription, no sub id in Url
        if (this.$route.query.subscriptionId) {
          this.setActiveSubscriptionId(this.$route.query.subscriptionId)
        } else {
          this.setActiveSubscriptionId(newVal[0].id)
        }
      },
    },
    subscriptionsLoaded() {
      this.getSubscriptionOrders()
    },
  },

  mounted() {
    if (this.$route.query.editNextOrder) {
      this.setEditNextOrder(true)
    }
  },

  methods: {
    ...mapMutations('activeSubscription', ['setActiveSubscriptionId']),

    ...mapActions('orders', ['GET_SUBSCRIPTION_ORDERS']),

    ...mapActions('editMode', ['setEditNextOrder']),

    redirect() {
      window.location.href = `https://${this.shopData.domain}`
    },

    async getSubscriptionOrders() {
      try {
        if (this.windowWidth > 768) {
          const { subscriptions, routeQuery } = this
          let activeSubs
          let inactiveSubs
          if (routeQuery === 'cancelledSubscriptions') {
            inactiveSubs = Object.keys(subscriptions).filter((subKey) => {
              let sub = subscriptions[subKey]
              return !sub.active
            })
            this.setActiveSubscriptionId(parseInt(inactiveSubs[0]))
            await this.GET_SUBSCRIPTION_ORDERS(
              this.activeSubscription.shopify_order_id
            )
          } else {
            activeSubs = Object.keys(subscriptions).filter((subKey) => {
              let sub = subscriptions[subKey]
              return sub.active
            })
            this.setActiveSubscriptionId(parseInt(activeSubs[0]))
            await this.GET_SUBSCRIPTION_ORDERS(
              this.activeSubscription.shopify_order_id
            )
          }
        }
      } catch (err) {
        console.error(err)
      }
    },
  },
}
</script>

<style lang="scss">
@import '@design';
.c-subscription {
  margin: 0 auto;
  width: 100%;
  @media (min-width: 420px) {
    width: 400px;
  }

  @include bp(tablet) {
    width: 100%;
  }
}

.c-subscription__outer {
  background-color: #f7f9fb;
}
.c-subscription__inner {
  @include clearfix;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 20px 20px;

  @include bp(tablet) {
    padding: 20px 32px;
  }

  @include bp(desktop) {
    padding: 20px 0px;
  }
}

.c-subscription__blocks {
  min-width: 264px;
  @include bp(tablet) {
    @include column(35/100, $gutter: 2);
  }

  @include bp(tablet-large) {
    @include column(35/100, $gutter: 8);
  }

  @include bp(desktop) {
    @include column(35/100, $gutter: 5);
  }
}

.c-subscription__productsGrid {
  @include bp(tablet) {
    @include column(61/100);
  }

  @include bp(tablet-large) {
    @include column(65/100, $gutter: 8);
  }
}

.u-disableExpiredChanges {
  pointer-events: none;
  opacity: 0.5;
}
</style>
