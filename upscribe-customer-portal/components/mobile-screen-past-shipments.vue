<template>
  <div v-if="activeSubscription">
    <portal to="header">
      <the-header
        :middle-html="'Subscription ' + activeSubscription.id + ' | Past Shipments'"
        mode="backwardRoute"
      />
    </portal>

    <div v-if="orders.length && subscriptionOrders && ordersLoaded && !isOpeningOrder" class="c-pastShipments">
      <history-order
        v-for="order in subscriptionOrders"
        :key="order.id"
        :order="order"
      />
    </div>

    <div v-else>
      <p class="c-pastShipments__notFound">No past shipments Found</p>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
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

    isOpeningOrder(){
      return !!this.$route.query.orderId
    },

    orderList(){
      const { orders, $route } = this
      const order = orders.find(each => each.id === parseInt($route.query.orderId))
      return order
    },
  },

  watch: {
    async activeSubscription(){
      try{
        await this.GET_SUBSCRIPTION_ORDERS(this.activeSubscription.shopify_order_id)
      } catch(e) {
          console.log(e)
      } finally{
        console.log('done')
      }
    },
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

.c-details__buttonContain{
  display: flex;
  margin: 30px auto 0;
  padding: 0 16px;
  @media (min-width: 420px){
    padding: 0;
  }
}

.c-details__button{
  text-transform: uppercase;
  letter-spacing: 0.8px;
  font-size: 12px;
  line-height: 16px;
  font-weight: bold;
  font-style: normal;
}

.c-pastShipments__notFound{
  font-size: 16px;
  text-transform: capitalize;
  text-align: center;
}
</style>
