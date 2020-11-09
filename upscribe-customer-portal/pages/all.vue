<template>
  <div class="o-container o-container--mobile">
    <h1 v-if="subscriptions" class="c-all__title u-mt-3 u-ml-1">
      {{ atc['portal.headerAllSubscriptions'] || 'All Subscriptions' }}</h1
    >
    <h1 v-else class="c-all__title u-mt-3 u-ml-1"
      >No Subscriptions Available</h1
    >
    <div
      v-for="subscription in sortedSubscriptions"
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
            <h3 class="u-color--secondary u-mb-2">Subscription ID</h3>
            <p class="u-color--secondary">{{ subscription.id }}</p>
          </div>
          <div>
            <h3 class="u-color--secondary u-mb-2">Created At</h3>
            <p class="u-color--secondary">{{
              subscription.created_at | prettyDate
            }}</p>
          </div>
          <div>
            <h3 class="u-color--secondary u-mb-2">Next Order</h3>
            <p class="u-color--secondary">{{
              subscription.next && subscription.next.date | prettyDate
            }}</p>
          </div>
          <div>
            <h3 class="u-color--secondary u-mb-2">Order Total</h3>
            <p class="u-color--secondary"
              >{{ currencySymbol }} {{ subscription.total_price }}</p
            >
          </div>
        </div>
        <div v-if="subscription.active" class="c-subscription__ctaContainer">
          <button @click="goToSubscription(subscription.id)">
            {{
              atc['portal.subscriptionDetailsSubscriptionTitle'] ||
                'Subscription Details'
            }}
          </button>
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
          />
          <div class="c-orderItem__info">
            <h4 class="u-color--secondary u-mb-2 u-font-bold">
              {{ item.title }} - {{ item.variant_title }}
            </h4>
            <p>Subscription: {{ item.quantity }}</p>
            <p
              >Ships every {{ subscription.interval }}
              {{ subscription.period }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import { windowSizes } from '@mixins/windowSizes'

export default {
  mixins: [windowSizes],
  scrollToTop: true,
  computed: {
    ...mapState('translations', ['atc']),
    ...mapState('subscriptions', [
      'noActiveSubscriptions',
      'subscriptions',
      'subscriptionsLoaded',
    ]),
    ...mapState('route', ['storeDomain', 'customerId']),
    ...mapState('shop', ['currencySymbol']),
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
    goToSubscription(subscriptionId) {
      if (this.windowWidth > 767) {
        this.$router.push({
          name: 'index',
          query: {
            storeDomain: this.storeDomain,
            customerId: this.customerId,
            subscriptionId: subscriptionId,
          },
        })
      } else {
        // scrolls the screen to the top
        document.documentElement.scrollTop = 0
        this.$router.push({
          query: {
            template: 'default',
            storeDomain: this.storeDomain,
            customerId: this.customerId,
            subscriptionId: subscriptionId,
          },
        })
      }
      this.setActiveSubscriptionId(subscriptionId)
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
      background-color: $color-secondary;
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

  .c-subscription__container {
    display: grid;
    grid-template-columns: 50% 50%;

    @include bp(mobile-large-max) {
      grid-template-columns: 1fr;
    }
    .c-subscription__details {
      display: flex;
      justify-content: space-between;

      @include bp(mobile-large-max) {
        display: grid;
        grid-template-columns: 1fr 1fr;
      }
      h3 {
        font-size: 16px;
        font-weight: bold;

        @include bp(mobile-large-max) {
          font-size: 15px;
          text-align: center;
        }
      }
      p {
        @include bp(mobile-large-max) {
          font-size: 14px;
          text-align: center;
        }
      }
    }
    .c-subscription__ctaContainer {
      button {
        display: block;
        width: 230px;
        height: 60px;
        margin-left: auto;
        font: $font-primary-medium;
        font-weight: bold;
        color: $color-white;
        cursor: pointer;
        background-color: $color-primary;
        border: none;
        font-size: 11px;

        @include bp(mobile-large-max) {
          width: 200px;
          height: 45px;
          margin: 10px auto 0 auto;
          padding-top:0;
          padding-bottom:0;
        }
      }
    }
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
    }

    @include bp(mobile-large-max) {
      grid-template-columns: 1fr;
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
.c-subscriptions--inactive {
  opacity: 0.7;
}
</style>
