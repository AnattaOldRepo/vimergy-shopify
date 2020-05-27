<template>
  <div class="c-mobileScreenLayout__contain">
    <transition :name="pageTransition" mode="out-in">
      <div
        v-if="
          subscriptions &&
            Object.keys(subscriptions).length >= 1 &&
            !templateQuery
        "
        :key="1"
      >
        <portal to="header">
          <the-header mode="default" />
        </portal>

        <subscription-picker
          :class="{
            'u-visuallyHidden': Object.keys(subscriptions).length === 1,
          }"
          :query="isCancelledQueryRoute"
        />
      </div>

      <!-- Next Shipment Block -->
      <mobile-screen-next-shipment
        v-else-if="templateQuery === 'next-shipment'"
        :key="2"
      />

      <mobile-screen-date-picker
        v-else-if="templateQuery === 'edit-calendar'"
        :key="3"
      />
      <!-- Next Shipment Block -->

      <!-- Detail block  -->
      <mobile-screen-details v-else-if="templateQuery === 'details'" :key="4" />

      <mobile-screen-shipping-method
        v-else-if="templateQuery === 'edit-shipping-method'"
        :key="5"
      />

      <mobile-screen-frenquency
        v-else-if="templateQuery === 'edit-shipping-frenquency'"
        :key="6"
      />
      <!-- Detail block  -->

      <!-- History Block -->
      <mobile-screen-past-shipments
        v-else-if="templateQuery === 'history'"
        :key="7"
      />
      <!-- History Block -->

      <!-- Address Payment Block -->
      <mobile-screen-address-payment
        v-else-if="templateQuery === 'address-payment'"
        :key="8"
      />

      <mobile-screen-payment
        v-else-if="templateQuery === 'edit-payment'"
        :key="9"
      />

      <mobile-screen-shipping-address
        v-else-if="templateQuery === 'edit-shipping-address'"
        :key="10"
      />

      <mobile-screen-billing-address
        v-else-if="templateQuery === 'edit-billing-address'"
        :key="11"
      />

      <mobile-screen-add-card
        v-else-if="templateQuery === 'edit-add-card'"
        :key="12"
      />

      <mobile-screen-edit-card
        v-else-if="templateQuery === 'edit-modify-card'"
        :key="13"
      />
      <!-- Address Payment Block -->

      <mobile-screen-default
        v-else-if="templateQuery === 'default'"
        :key="14"
      />

      <!-- Single Order Template -->
      <order
        v-else-if="orders && activeOrder && templateQuery === 'order'"
        :key="15"
        :order="activeOrder"
        :history-order="checkOrderPastShipment"
      />
      <!-- Single Order Template -->
    </transition>

    <mobile-screen-actions />
  </div>
</template>

<script>
import MobileScreenDefault from '@components/mobile-screen-default'
import MobileScreenNextShipment from '@components/mobile-screen-next-shipment'
import MobileScreenDetails from '@components/mobile-screen-details'
import MobileScreenPastShipments from '@components/mobile-screen-past-shipments'
import MobileScreenAddressPayment from '@components/mobile-screen-address-payment'
import MobileScreenShippingMethod from '@components/mobile-screen-shipping-method'
import MobileScreenFrenquency from '@components/mobile-screen-frequency'
import MobileScreenPayment from '@components/mobile-screen-payment'
import MobileScreenShippingAddress from '@components/mobile-screen-shipping-address'
import MobileScreenBillingAddress from '@components/mobile-screen-billing-address'
import MobileScreenAddCard from '@components/mobile-screen-add-card'
import MobileScreenDatePicker from '@components/mobile-screen-date-picker'
import MobileScreenActions from '@components/mobile-screen-actions.vue'
import MobileScreenEditCard from '@components/mobile-screen-edit-card.vue'
import TheHeader from '@components/the-header'
import SubscriptionPicker from '@components/subscription-picker.vue'
import Order from '@components/order.vue'

import { mapState, mapMutations, mapGetters } from 'vuex'

export default {
  components: {
    MobileScreenDefault,
    MobileScreenNextShipment,
    MobileScreenDetails,
    MobileScreenPastShipments,
    MobileScreenAddressPayment,
    MobileScreenShippingMethod,
    MobileScreenFrenquency,
    MobileScreenPayment,
    MobileScreenShippingAddress,
    MobileScreenBillingAddress,
    MobileScreenAddCard,
    MobileScreenDatePicker,
    SubscriptionPicker,
    MobileScreenEditCard,
    Order,
    TheHeader,
    MobileScreenActions,
  },

  computed: {
    ...mapState('subscriptions', ['subscriptions', 'noActiveSubscriptions']),

    ...mapState('activeSubscription', [
      'activeSubscription',
      'activeSubscriptionId',
    ]),

    ...mapState('mobileGlobalManagement', ['pageTransition']),

    ...mapState('orders', ['orders', 'ordersLoaded']),

    ...mapGetters('activeSubscription', ['activeSubscription']),

    templateQuery() {
      if (this.$route.query.template) {
        const { template } = this.$route.query
        return template
      }
      return 'default'
    },

    orderPastShipments() {
      const { orders, $route } = this
      const order = orders.find(
        (each) => each.id === parseInt($route.query.orderId)
      )
      return order
    },

    checkOrderPastShipment() {
      if (this.$route.query.past_shipment) {
        return true
      }
      return false
    },

    activeOrder() {
      if (this.checkOrderPastShipment) {
        return this.orderPastShipments
      }
      return this.activeSubscription
    },

    hasId() {
      if (this.$route.query.id) {
        return this.$route.query.id
      }
      return false
    },

    isCancelledQueryRoute() {
      let routeQuery = ''
      const { route } = this.$route.query

      if (route && route === 'cancelledSubscriptions') {
        routeQuery = route
      } else {
        routeQuery = ''
      }
      return routeQuery
    },
  },

  methods: {
    ...mapMutations('activeSubscription', ['setActiveSubscriptionId']),
  },
}
</script>

<style lang="scss">
.c-mobileScreenLayout__contain {
  position: relative;
  margin: 0 auto;

  @media (max-width: 400px) {
    max-width: 400px;
  }
}
</style>
