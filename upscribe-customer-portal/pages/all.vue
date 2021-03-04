<template>
  <div>
    <portal v-if="windowWidth < 768" to="header">
      <the-header mode="noBackButton" />
    </portal>

    <div class="o-container o-container--mobile u-mt-4">
      <headline-banner
        v-if="
          windowWidth > 640 &&
            $route.name === 'all' &&
            atc['portal.notification'] &&
            store &&
            store.portal_notification_banner_enabled
        "
        class="u-mt-4"
      />

      <h1 v-if="subscriptions" class="c-all__title u-mt-4 u-ml-1">
        {{ atc['portal.headerAllSubscriptions'] || 'Subscriptions' }}
      </h1>
      <h1 v-else class="c-all__title u-mt-4 u-ml-1 u-mb-5">
        No Subscriptions Available
      </h1>
      <div
        v-for="(subscription, index) in sortedSubscriptions"
        :key="subscription.id"
        class="c-subscriptions u-bgColor--white"
        :class="{ 'c-subscriptions--inactive': !subscription.active }"
      >
        <div v-if="!subscription.active" class="c-subscription__tag">
          <span> INACTIVE</span></div
        >
        <div class="c-subscription__container">
          <div class="c-subscription__details">
            <div>
              <h3 class="u-color--secondary u-mb-2">{{ atc['labels.subscription'] || 'Subscription' }}</h3>
              <p class="u-color--secondary c-subscription__nameWrap">
                <span class="c-subscription__name">{{
                  subscription.name
                }}</span>
                <a
                  class="c-subscription__nameLink u-color--primary"
                  href=""
                  @click.prevent="editSubscriptionName(subscription.id)"
                  >{{ atc['buttons.rename'] || 'Rename' }}</a>
              </p>

              <!-- Drawer Edit Subscription Name -->
              <portal v-if="drawerEditSubscriptionNameOpen" to="drawers">
                <drawer-edit-subscription-name
                  :show="drawerEditSubscriptionNameOpen"
                  :subscription-id="selectedSubscriptionId"
                  @close="drawerEditSubscriptionNameOpen = false"
                />
              </portal>
            </div>
            <div>
              <h3 class="u-color--secondary u-mb-2">{{ atc['labels.subscriptionId'] || 'Subscription ID' }}</h3>
              <p class="u-color--secondary">{{ subscription.id }}</p>
            </div>
            <div>
              <h3 class="u-color--secondary u-mb-2">{{ atc['labels.createdAt'] || 'Created At' }}</h3>
              <p class="u-color--secondary">{{
                subscription.created_at | prettyDate
              }}</p>
            </div>
            <div>
              <h3 class="u-color--secondary u-mb-2">{{ atc['labels.nextOrder'] || 'Next Order' }}</h3>
              <p class="u-color--secondary">{{
                subscription.next && subscription.next.date | prettyDate
              }}</p>
            </div>
            <div>
              <h3 class="u-color--secondary u-mb-2">{{ atc['labels.orderTotal'] || 'Order Total' }}</h3>
              <p class="u-color--secondary"
                >{{ currencySymbol }} {{ subscription.total_price }}</p
              >
            </div>
          </div>
          <div
            v-if="index == 0 && atc['portal.editSubscriptionHelperText']"
            class="c-subscription__helperInfo"
          >
            <p>
              {{ atc['portal.editSubscriptionHelperText'] }}
            </p>
          </div>
        </div>
        <hr class="c-subscription__divider" />
        <div class="c-subscriptionItem__container">
          <div
            v-for="item in subscription.items"
            :key="item.id"
            class="c-subscription__item"
          >
            <img
              class="c-orderItem__thumbnail u-ma-2"
              :src="item.image_url"
              :alt="item.title"
              onerror="this.style.display='none'"
            />
            <div class="c-orderItem__info">
              <h4 class="u-color--secondary u-mb-2 u-font-bold">
                {{ item.title }} - {{ item.variant_title }}
              </h4>
              <p>{{ atc['labels.subscription']}}: {{ item.quantity }}</p>
              <p>
                {{
                  atc['portal.subscriptionSettingsDeliverEveryLabel'] || 'Ships every'
                }}
                {{ subscription.interval + ' ' + subscription.period }}
              </p>
            </div>
          </div>
          <div
            class="c-subscription__ctaContainer"
            :style="{
              'grid-row': getRowProperty(subscription.items),
            }"
          >
            <v-button
              v-if="subscription.active"
              @onClick="goToSubscription(subscription.id)"
            >
              {{ atc['buttons.editSubscription'] || 'Edit subscription' }}
            </v-button>

            <v-button
              v-if="subscription.active"
              class="c-button c-button--alt"
              @onClick="goToSubscription(subscription.id, true)"
            >
              {{ atc['buttons.editNextOrder'] || 'Edit next order only' }}
            </v-button>

            <v-button
              v-if="!subscription.active"
              :disabled="loading"
              @onClick="reactivateSubscription(subscription)"
            >
              {{
                atc['buttons.reactivateSubscription'] ||
                  'Reactivate Subscription'
              }}
            </v-button>

            <a
              v-if="subscription.active"
              class="u-mt-2"
              @click="cancelSubscription(subscription.id)"
              >{{
                atc['buttons.cancelSubscription'] || 'Cancel Subscription'
              }}</a
            >

            <div
              v-if="index == 0 && atc['portal.editSubscriptionHelperText']"
              class="c-subscription__helperInfo u-mt-4"
            >
              <p>
                {{ atc['portal.editSubscriptionHelperText'] }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import { windowSizes } from '@mixins/windowSizes'
import DrawerEditSubscriptionName from '@components/drawer-edit-subscription-name.vue'
import headlineBanner from '@components/headline-banner.vue'
import VButton from '@components/v-button.vue'
import TheHeader from '@components/the-header'

export default {
  components: {
    DrawerEditSubscriptionName,
    headlineBanner,
    VButton,
    TheHeader,
  },
  mixins: [windowSizes],
  scrollToTop: true,
  data: () => {
    return {
      drawerEditSubscriptionNameOpen: false,
      selectedSubscriptionId: null,
      loading: false,
    }
  },
  computed: {
    ...mapState('translations', ['atc']),
    ...mapState('subscriptions', [
      'noActiveSubscriptions',
      'subscriptions',
      'subscriptionsLoaded',
    ]),
    ...mapState('route', ['storeDomain', 'customerId']),
    ...mapState('shop', ['shopData', 'store', 'currencySymbol']),

    sortedSubscriptions() {
      // changing object to array
      const arr = Object.keys(this.subscriptions).map(
        (key) => this.subscriptions[key]
      )
      // active subscriptions comes first
      const sortedSubs = [...arr].sort((a, b) =>
        a.active === b.active ? 0 : a.active ? -1 : 1
      )
      return sortedSubs
    },
  },
  methods: {
    ...mapMutations('activeSubscription', ['setActiveSubscriptionId']),
    ...mapActions('subscriptions', [
      'UPDATE_SUBSCRIPTION',
      'ACTIVATE_SUBSCRIPTION',
      'GET_SUBSCRIPTIONS',
    ]),
    ...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),

    getRowProperty(items) {
      if (this.windowWidth < 1024 && this.windowWidth > 600) {
        return '4'
      } else if (this.windowWidth < 600) {
        return 'unset'
      } else {
        if (items.length === 4) {
          return '2/2'
        }
        return `${Math.ceil(items.length / 4)} / ${Math.ceil(items.length / 4)}`
      }
    },

    goToSubscription(subscriptionId, editNextOrder) {
      if (this.windowWidth > 767) {
        this.$router.push({
          name: 'index',
          query: {
            storeDomain: this.storeDomain,
            customerId: this.customerId,
            subscriptionId: subscriptionId,
            ...(editNextOrder ? { editNextOrder } : {}),
          },
        })
      } else {
        // scrolls the screen to the top
        document.documentElement.scrollTop = 0
        this.$router.push({
          name: 'index',
          query: {
            template: 'default',
            storeDomain: this.storeDomain,
            customerId: this.customerId,
            subscriptionId: subscriptionId,
            ...(editNextOrder ? { editNextOrder } : {}),
          },
        })
      }
      this.setActiveSubscriptionId(subscriptionId)
    },

    editSubscriptionName(subscriptionId) {
      const { storeDomain, customerId } = this
      this.selectedSubscriptionId = subscriptionId
      if (this.windowWidth > 767) {
        this.drawerEditSubscriptionNameOpen = true
      } else {
        this.$router.push({
          name: 'index',
          query: {
            template: 'edit-subscription-name',
            storeDomain,
            customerId,
          },
        })
      }
    },

    async reactivateSubscription(subscription) {
      let analyticsEventName = 'Upscribe Reactivate Subscription'
      let analyticsPayload = {
        subscription,
      }
      this.loading = true
      try {
        await this.ACTIVATE_SUBSCRIPTION(subscription.id)
        this.triggerAnalyticsEvent({
          event: analyticsEventName,
          payload: analyticsPayload,
        })
        this.$toast.success('Subscription reactivated.')
        document.documentElement.scrollTop = 0
      } catch (e) {
        this.$toast.error('Oops! Some error occurred.')
      } finally {
        await this.GET_SUBSCRIPTIONS()
        this.loading = false
      }
    },
    async cancelSubscription(subscriptionId) {
      this.setActiveSubscriptionId(subscriptionId)
      const { customerId, storeDomain } = this

      this.$router.push({
        name: 'cancel',
        query: {
          storeDomain,
          customerId,
        },
      })
    },
  },
}
</script>

<style lang="scss" scoped>
@import '@design';

.o-container{
  width: 100%;
}

.c-all__title{
  margin-top: 50px;
  @include bp(mobile-large-max) {
    padding: 0 20px;
    margin-top: 0;
  }
}

.c-subscriptions {
  position: relative;
  padding: 20px;
  margin: 20px 0;
  .c-subscription__tag {
    position: absolute;
    top: 0;
    right: 0;
    width: 120px;
    height: 120px;
    overflow: hidden;
    span {
      position: absolute;
      top: 25px;
      left: -25px;
      display: block;
      width: 205px;
      padding: 13px 0;
      font-size: 15px;
      font-weight: bold;
      color: #fff;
      text-align: center;
      background-color: #9c9d9e;
      transform: rotate(45deg);

      @include bp(mobile-large-max) {
        width: 220px;
        padding: 5px 0;
        font-size: 12px;
      }
    }
  }
  .c-subscription__tag::before {
    top: 0;
    left: 0;
  }
  .c-subscription__tag::after {
    right: 0;
    bottom: 0;
  }

  .c-subscription__helperInfo {
    margin-left: auto;
    font-size: 14px;
    max-width: 440px;
    font-weight: 300;
    padding: 5px;
    border: 1px solid $color-secondary;
    border-radius: 2px;
    color: $color-secondary;
    p {
      margin: 0;
    }
  }

  .c-subscription__container {
    display: grid;
    grid-template-columns: 70% 30%;
    @include bp(tablet-max) {
      grid-template-columns: 1fr;
    }

    @include bp(mobile-large-max) {
      grid-template-columns: 1fr;
    }
    .c-subscription__details {
      display: flex;
      justify-content: space-around;

      @include bp(mobile-large-max) {
        display: grid;
        grid-template-columns: 1fr 1fr;
      }
      h3 {
        font-size: 16px;
        font-weight: bold;

        @include bp(mobile-large-max) {
          font-size: 15px;
        }
      }
      p {
        @include bp(mobile-large-max) {
          font-size: 14px;
        }
      }
    }

    .c-subscription__helperInfo {
      display: block;
      @include bp(tablet-max) {
        display: none;
      }
    }
  }
  .c-subscription__nameWrap {
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: 200px;
    @include bp(tablet-max) {
      justify-content: flex-start;
    }
  }
  .c-subscription__name {
    @include bp(tablet) {
      flex: 1;
    }
  }
  .c-subscription__nameLink {
    margin-left: 5px;
    font-family: $font-primary-bold;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
  }
  .c-subscription__divider {
    display: block;
    height: 1px;
    margin: 30px 0;
    border: 0;
    border-top: 1px solid $color-light;
  }
  .c-subscriptionItem__container {
    display: grid;
    grid-template-columns: 25% 25% 25% 25%;
    row-gap: 20px;

    @include bp(tablet-max) {
      grid-template-columns: 1fr 1fr;
      grid-template-areas: none;
    }

    @include bp(mobile-large-max) {
      grid-template-columns: 1fr;
    }

    .c-subscription__ctaContainer {
      position: relative;
      z-index: 1;
      grid-column: 4 / 4;
      grid-row: 1 / 1;

      @include bp(tablet-max) {
        grid-template-areas: none;
        grid-column: 2;
        grid-row: 4;
        grid-auto-flow: row;
      }

      @include bp(mobile-large-max) {
        margin: auto;
        grid-column: unset;
        grid-row: unset;
      }

      button {
        margin-bottom: 10px;
        @include bp(mobile-large-max) {
          width: 200px;
          height: 45px;
          margin: auto;
          margin-bottom: 10px;
        }
      }
      .c-subscription_btn--outline {
        color: $color-primary;
        border: 1px solid $color-primary;
        background-color: transparent;
      }
      a {
        color: $color-error;
        display: none;
        @include bp(mobile-large-max) {
          display: block;
          text-align: center;
        }
      }
      .c-subscription__helperInfo {
        display: none;
        @include bp(tablet-max) {
          display: block;
        }
      }
    }

    .c-subscription__item {
      display: flex;
      .c-orderItem__thumbnail {
        width: auto;
        height: 90px;
      }
      .c-orderItem__info {
        h4 {
          font-size: 16px;
          font-weight: normal;
        }
        p {
          margin: 4px 0;
          font-size: 13px;
          color: $color-secondary;
        }
      }
    }
  }
}
.c-subscriptions--inactive::before {
  content: '';
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0.5;
  background-color: $color-white;
}
</style>
