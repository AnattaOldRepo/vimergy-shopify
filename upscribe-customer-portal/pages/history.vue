<template>
  <div v-if="subscriptionsLoaded || !subscriptions || isEmptyObject(subscriptions)" class="c-history">
    <portal v-if="windowWidth < 768" to="header">
      <the-header
        mode="backwardRoute"
        :middle-html="atc['portal.orderHistoryTitle'] || 'Past Shipments'"
      />
    </portal>

    <h1 class="c-history__title">{{ atc['portal.orderHistoryTitle'] || 'Past Shipments' }}</h1>

    <content-placeholders v-if="!ordersLoaded" class="c-history__list">
      <content-placeholders-img class="c-history__order--placeholder" />
      <content-placeholders-img class="c-history__order--placeholder" />
      <content-placeholders-img class="c-history__order--placeholder" />
      <content-placeholders-img class="c-history__order--placeholder" />
      <content-placeholders-img class="c-history__order--placeholder" />
      <content-placeholders-img class="c-history__order--placeholder" />
    </content-placeholders>

    <transition :name="pageTransition" mode="out-in">
      <div v-if="orders.length && ordersLoaded && !isOpeningOrder" class="c-history__list">
        <!-- eslint-disable -->
        <history-order
          v-for="(charge, index) in sortedOrders"
          :key="charge.id ? charge.id + index : charge.shopify_order_id + index"
          :order="charge"
        />
        <!-- eslint-enable -->
      </div>

        <order
          v-else-if='orders.length && ordersLoaded && isOpeningOrder'
          :order="orderWithDiscount"
        />
    </transition>
  </div>


  <div v-else class="c-noSubscriptions c-history">
    <h1 class="c-history__title">{{ atc['portal.orderHistoryTitle'] || 'Past Shipments' }}</h1>

    <h2 class="c-noSubscriptions__text"
      >{{ atc['portal.noSubscriptionsChargeHistory'] || 'You have no subscription charge history.' }}</h2
    >
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import moment from 'moment'
import Order from '@components/order.vue'
import HistoryOrder from '@components/history-order.vue'
import TheHeader from '@components/the-header'
import { windowSizes } from '@mixins/windowSizes'

export default {
  components: {
    HistoryOrder,
    Order,
    TheHeader,
  },

  mixins: [windowSizes],

  computed: {
    ...mapState('translations', ['atc', 'activeLanguageCode']),
    ...mapState('orders', ['orders', 'ordersLoaded']),
    ...mapState('subscriptions', [
      'noActiveSubscriptions',
      'subscriptions',
      'subscriptionsLoaded',
    ]),
    ...mapState('mobileGlobalManagement', ['pageTransition']),

    ...mapGetters('activeSubscription', ['activeSubscription']),

    isOpeningOrder(){
      return !!this.$route.query.orderId
    },

    orderWithDiscount(){
      const { orders, $route } = this
      const order = orders.find(each => each.id === parseInt($route.query.orderId))
      return order
    },

    sortedOrders() {
      const { orders } = this
      const ordersCopy = [...orders]
      return ordersCopy.sort((a, b) => {
        let dateA = a.shopify_order_id
          ? moment(a.created_at, 'YYYYMMDD')
          : moment(a.processed_at)
        let dateB = b.shopify_order_id
          ? moment(b.created_at, 'YYYYMMDD')
          : moment(b.processed_at)
        return dateB - dateA
      })
    },
  },

  watch: {
    activeLanguageCode: {
      immediate: true,
      handler: function(newVal) {
        moment.locale(newVal)
      },
    },
  },
}
</script>

<style lang="scss">
@import '@design';

.c-history {
  @include clearfix;
  width: 90%;
  margin: 0 auto;
  padding: 24px 0px 0px;
  max-width: 600px;

  @include bp(tablet) {
    max-width: 664px;
    width: 100%;
    padding-top: 32px;
  }
}

.c-history__title {
  margin-bottom: 64px;
  font-family: $font-primary-regular;
  font-size: 22px;
  text-align: center;
  font-weight: bold;
  display: none;

  @include bp(tablet) {
    font-size: 34px;
    display: block;
  }
}

.c-history__order--placeholder {
  height: 48px;
  margin-bottom: 20px;
}
</style>
