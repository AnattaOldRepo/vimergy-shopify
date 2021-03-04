<template>
  <div v-if="activeSubscription && ordersLoaded">
    <portal to="header">
      <the-header
        :middle-html="middleHtml"
        mode="backwardRoute"
      />
    </portal>

    <div v-if="sortedOrders.length > 0 && subscriptionOrders" class="c-pastShipments">
      <history-order
        v-for="order in sortedOrders"
        :key="order.id"
        :order="order"
      />
    </div>

    <div v-else>
      <p class="c-pastShipments__notFound">{{ atc['notices.noPastShipmentsFound'] || 'No past shipments Found' }}</p>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import moment from 'moment'
import TheHeader from '@components/the-header.vue'
import HistoryOrder from '@components/history-order.vue'
export default {
  components: {
    TheHeader,
    HistoryOrder,
  },

  computed: {
    ...mapGetters('activeSubscription', ['activeSubscription']),

    ...mapState('orders', ['subscriptionOrders', 'orders', 'ordersLoaded']),

    ...mapState('subscriptions', ['subscriptions']),

    ...mapState('translations', ['atc']),

    middleHtml() {
      const { atc, activeSubscription } = this
      return `${atc['labels.subscription'] || 'Subscription'} ${activeSubscription.id} ${atc['labels.pastShipments'] || 'Past Shipments'}`
    },

    sortedOrders() {
      const { subscriptionOrders } = this
      if(subscriptionOrders.length <= 1){
        return subscriptionOrders
      } else {
          const ordersCopy = [...subscriptionOrders]
          return ordersCopy.sort((a, b) => {
            let dateA = a.shopify_order_id
              ? moment(a.created_at, 'YYYYMMDD')
              : moment(a.processed_at)
            let dateB = b.shopify_order_id
              ? moment(b.created_at, 'YYYYMMDD')
              : moment(b.processed_at)
            return dateB - dateA
      })
      }
    },
  },

  mounted(){
    this.GET_SUBSCRIPTION_ORDERS(this.activeSubscription.shopify_order_id)
  },

  methods: {
    ...mapMutations('activeSubscription', ['setActiveSubscriptionId']),
    ...mapActions('orders', ['GET_SUBSCRIPTION_ORDERS']),
  },

}
</script>

<style lang="scss">
@import "@design";

.c-pastShipments{
  width: 90%;
  color: $color-black;
  background-color: $color-white;
  border: 1px solid $color-blue-light-border;
  margin: 0 auto;

  @media (min-width: 420px){
    width: 100%;
  }

  @include bp(tablet){
    border-radius: 5px;
    margin-bottom: 20px;
  }
}


.c-pastShipments__notFound{
  font-size: 16px;
  text-transform: capitalize;
  text-align: center;
}
</style>
