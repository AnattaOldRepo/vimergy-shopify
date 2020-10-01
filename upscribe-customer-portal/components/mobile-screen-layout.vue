<template>
  <div class="c-mobileScreenLayout__contain">
    <portal to="header">
      <the-header mode="default" />
    </portal>

    <div v-if="!subscriptionsLoaded">
      <second-loader-icon />
    </div>

    <transition
      v-else-if="subscriptionsLoaded"
      :name="pageTransition"
      mode="out-in"
    >
      <div
        v-if="!templateQuery && subscriptions && toggleSubscriptions.length > 0"
        :key="1"
      >
        <all />
        <!-- <subscription-picker :query="isCancelledQueryRoute" /> -->
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

      <!-- List view of payments -->
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

      <!-- edit payment -->
      <mobile-screen-add-card
        v-else-if="templateQuery === 'edit-add-card'"
        :key="12"
      />

      <mobile-screen-edit-card
        v-else-if="templateQuery === 'edit-modify-card'"
        :key="13"
      />
      <!-- Address Payment Block -->

      <!-- Past Shipment Order Template -->
      <order
        v-else-if="orders && currentOrderForMobile && templateQuery === 'order'"
        :key="14"
        :order="currentOrderForMobile"
        :history-order="true"
      />
      <!-- Past Shipment Order Template -->

      <!-- Edit Next Shipment-->
      <mobile-order-next-shipment
        v-else-if="orders && templateQuery === 'order-next-shipment'"
        :key="15"
      />
      <!-- Edit Next Shipment-->

      <mobile-screen-default
        v-else-if="templateQuery === 'default'"
        :key="16"
      />

      <mobile-screen-discount
        v-else-if="templateQuery === 'edit-discount'"
        :key="17"
      />

      <div
        v-else-if="
          !templateQuery && Object.keys(toggleSubscriptions).length < 1
        "
        class="c-noSubscriptions"
      >
        <h2 class="c-noSubscriptions__text">{{
          atc['portal.noSubscriptions'] || 'You have no active subscriptions.'
        }}</h2>
        <v-button class="c-noSubscriptions__button" auto @onClick="redirect">
          {{ atc['buttons.shopNow'] || 'Shop Now' }}
        </v-button>
      </div>
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
import MobileScreenDiscount from '@components/mobile-screen-discount.vue'
import MobileOrderNextShipment from '@components/mobile-order-next-shipment.vue'
import TheHeader from '@components/the-header'
// import SubscriptionPicker from '@components/subscription-picker.vue'
import Order from '@components/order.vue'
import SecondLoaderIcon from '@components/second-loader-icon.vue'
import VButton from '@components/v-button'
import All from '../pages/all.vue'
import { mapState, mapMutations, mapGetters, mapActions } from 'vuex'

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
    // SubscriptionPicker,
    MobileScreenEditCard,
    VButton,
    Order,
    TheHeader,
    SecondLoaderIcon,
    MobileScreenActions,
    MobileScreenDiscount,
    MobileOrderNextShipment,
    All,
  },

  computed: {
    ...mapState('subscriptions', [
      'subscriptions',
      'noActiveSubscriptions',
      'subscriptionsLoaded',
    ]),

    ...mapState('translations', ['atc']),

    ...mapState('activeSubscription', [
      'activeSubscription',
      'activeSubscriptionId',
    ]),

    ...mapState('mobileGlobalManagement', ['pageTransition']),

    ...mapState('orders', ['orders', 'ordersLoaded', 'currentOrderForMobile']),

    ...mapState('shop', ['shopData']),

    ...mapGetters('activeSubscription', ['activeSubscription']),

    ...mapGetters('subscriptions', [
      'subscriptionActive',
      'subscriptionInActive',
    ]),

    templateQuery() {
      if (this.$route.query.template) {
        const { template } = this.$route.query
        return template
      }
      return ''
    },

    orderPastShipments() {
      const { orders, $route } = this
      const order = orders.find(
        (each) => each.id === parseInt($route.query.orderId)
      )
      return order
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
    activeSubscription: {
      handler: 'GET_SUBSCRIPTION_SHIPPING_METHODS',
      immediate: true,
    },
  },

  methods: {
    ...mapMutations('activeSubscription', ['setActiveSubscriptionId']),

    ...mapActions('shippingMethods', ['GET_SUBSCRIPTION_SHIPPING_METHODS']),

    redirect() {
      window.location.href = `https://${this.shopData.domain}`
    },
  },
}
</script>

<style lang="scss">
.c-mobileScreenLayout__contain {
  margin: 0 auto;

  @media (max-width: 400px) {
    max-width: 400px;
  }

  .c-editPaymentmethodsBlock-actionButtons {
    display: none !important;
  }
}

.c-noSubscriptions__button {
  margin: 0 auto;
}
</style>
