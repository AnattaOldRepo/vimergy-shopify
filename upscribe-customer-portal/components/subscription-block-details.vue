<script>
import { mapState, mapMutations, mapGetters } from 'vuex'

import SubscriptionBlock from '@components/subscription-block.vue'
import SubscriptionBlockOptionWrap from '@components/subscription-block-option-wrap.vue'
import SubscriptionBlockOption from '@components/subscription-block-option.vue'
import VButton from '@components/v-button.vue'

import DrawerBillingAddresses from '@components/drawer-billing-addresses.vue'
// import DrawerShippingAddresses from '@components/drawer-shipping-addresses.vue'
import DrawerAddresses from '@components/drawer-addresses.vue'
import DrawerCards from '@components/drawer-cards.vue'

export default {
  components: {
    SubscriptionBlock,
    SubscriptionBlockOptionWrap,
    SubscriptionBlockOption,
    VButton,
    // DrawerShippingAddresses,
    DrawerBillingAddresses,
    DrawerCards,
    DrawerAddresses,
  },
  data() {
    return {
      drawerShippingAddressesOpen: false,
      drawerBillingAddressesOpen: false,
      drawerCardsOpen: false,
    }
  },
  computed: {
    ...mapState('translations', ['atc']),

    ...mapState('route', ['customerId', 'storeDomain']),

    ...mapState('editMode', ['editNextOrder']),

    ...mapGetters('activeSubscription', [
      'activeBillingAddress',
      'activeShippingAddress',
      'activeSubscription',
    ]),

    ...mapState('subscriptions', ['subscriptionsLoaded']),

    ...mapGetters('cards', ['activeCard']),

    formattedBillingAddress() {
      const address = this.activeBillingAddress

      if (!address || this.isEmptyObject(address)) {
        return false
      }
      let string = ''
      string += address.first_name ? `${address.first_name} ` : ''
      string += address.last_name ? `${address.last_name} ` : ''
      string += address.company ? `${address.company}, ` : ''
      string += address.address1 ? `<br>${address.address1} ` : ''
      string += address.address2 ? `, ${address.address2} ` : ''
      string += address.city ? `<br>${address.city}, ` : ''
      string += address.province_code ? `${address.province_code}, ` : ''
      string += address.zip ? `${address.zip} ` : ''
      // string += address.country ? `${address.country} ` : ''
      return string
    },

    formattedShippingAddress() {
      const address = this.activeShippingAddress

      if (!address || this.isEmptyObject(address)) {
        return false
      }
      let string = ''
      string += address.first_name ? `${address.first_name} ` : ''
      string += address.last_name ? `${address.last_name} ` : ''
      string += address.company ? `${address.company}, ` : ''
      string += address.address1 ? `<br>${address.address1} ` : ''
      string += address.address2 ? `, ${address.address2} ` : ''
      string += address.city ? `<br>${address.city}, ` : ''
      string += address.province_code ? `${address.province_code}, ` : ''
      string += address.zip ? `${address.zip} ` : ''
      // string += address.country ? `${address.country} ` : ''
      return string
    },

    paymentInfo() {
      const { activeCard, atc } = this
      if (!activeCard) return false

      const {
        last4,
        exp_month,
        exp_year,
        type,
        bank_code,
        zipcode,
        email,
      } = activeCard

      let string = ''

      if (type.includes('card')) {
        return `*${last4} ${exp_month}/${exp_year} ${
          zipcode ? '<br>' + zipcode : ''
        }`
      } else if (type === 'braintree_paypal') {

        if (email) {
          return atc['portal.paypalAccountEmailDisplay'].replace('<email>', email) || `Account Email: ${email}`
        } else {
          return atc['portal.paypalAccountEmailDisplayUnavailabe'] || `No email available for account`
        }
      } else if (type === 'stripe_sepa_direct_debit') {
        return atc['portal.sepaDebitInfoDisplay'].replace('<last4>', last4).replace('bank-code', bank_code) || `Acct *${last4} / Bank ${bank_code}`
      }
      return string
    },
  },

  watch: {
    subscriptionsLoaded(subscriptionsLoaded) {
      const { $route } = this

      if (subscriptionsLoaded) {
        const loadActionState = $route.query
          ? $route.query
            ? $route.query.loadActionState
            : false
          : false
        if (loadActionState === 'edit-payment-method') {
          this.drawerCardsOpen = true
        }
      }
    },
  },

  mounted() {
    const { $route, subscriptionsLoaded } = this
    const loadActionState = $route.query
      ? $route.query
        ? $route.query.loadActionState
        : false
      : false

    if (loadActionState === 'edit-payment-method' && subscriptionsLoaded) {
      this.drawerCardsOpen = true
    }
  },

  methods: {
    ...mapMutations('cards', ['setActiveEditCard']),

    async handleCancelSubscription() {
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

<template>
  <subscription-block
    key="details"
    :title="
      editNextOrder
        ? atc['portal.subscriptionDetailsNextOrderTitle'] ||
          'Your Next Order Details'
        : atc['portal.subscriptionDetailsSubscriptionTitle'] ||
          'Your Subscription Details'
    "
  >
    <subscription-block-option-wrap
      @onClick="drawerShippingAddressesOpen = true"
    >
      <subscription-block-option
        v-if="formattedShippingAddress"
        :title="
          atc['portal.subscriptionDetailsShippingAddressLabel'] ||
            'Shipping Address'
        "
        :html="formattedShippingAddress"
        :text-med="true"
      />

      <content-placeholders v-else>
        <content-placeholders-heading />
      </content-placeholders>

      <!-- Drawer Portal -->
      <portal v-if="drawerShippingAddressesOpen" to="drawers">
        <!-- <drawer-shipping-addresses
          :show="drawerShippingAddressesOpen"
          @close="drawerShippingAddressesOpen = false"
        /> -->
        <drawer-addresses
          :show="drawerShippingAddressesOpen"
          initial-mode="list"
          @close="drawerShippingAddressesOpen = false"
        />
      </portal>
    </subscription-block-option-wrap>

    <subscription-block-option-wrap
      @onClick="drawerBillingAddressesOpen = true"
    >
      <subscription-block-option
        v-if="formattedBillingAddress"
        :title="
          atc['portal.subscriptionDetailsBillingAddressLabel'] ||
            'Billing Address'
        "
        :html="formattedBillingAddress"
        :text-med="true"
      />

      <content-placeholders v-else>
        <content-placeholders-heading />
      </content-placeholders>

      <!-- Drawer Portal -->
      <portal v-if="drawerBillingAddressesOpen" to="drawers">
        <drawer-billing-addresses
          :show="drawerBillingAddressesOpen"
          @close="drawerBillingAddressesOpen = false"
        />
      </portal>
    </subscription-block-option-wrap>

    <subscription-block-option-wrap
      @onClick="
        setActiveEditCard(activeCard)
        drawerCardsOpen = true
      "
    >
      <subscription-block-option
        v-if="activeSubscription && paymentInfo"
        :title="
          atc['portal.subscriptionDetailsPaymentMethodLabel'] ||
            'Payment Method'
        "
        :text-med="true"
        @onClick="
          setActiveEditCard(activeCard)
          drawerCardsOpen = true
        "
      >
        <span
          v-if="activeCard.type === 'stripe_sepa_direct_debit'"
          class="c-portalBlockOption__text"
          >SEPA Direct Debit <br
        /></span>

        <!-- eslint-disable-next-line vue/no-v-html -->
        <span class="c-portalBlockOption__text" v-html="paymentInfo" />

        <div
          v-if="activeCard.status === 'void' || activeCard.status === 'invalid'"
          class="c-cardTag__voidWarning u-mt-2"
          >{{
            atc['errors.invalidPaymentMethodTag'] || 'Invalid Payment Method'
          }}</div
        >
      </subscription-block-option>

      <subscription-block-option
        v-else-if="activeSubscription && !activeCard"
        @onClick="drawerCardsOpen = true"
      >
        <span class="c-portalBlockOption__text--small">{{
          atc['portal.subscriptionDetailsPaymentMethodLabelNoPayment'] ||
            'No Payment Method attached to this Subscription. Click here to add one.'
        }}</span>
      </subscription-block-option>

      <content-placeholders v-else>
        <content-placeholders-heading />
      </content-placeholders>

      <!-- Drawer Portal -->
      <portal v-if="drawerCardsOpen" to="drawers">
        <drawer-cards
          :show="drawerCardsOpen"
          @close="drawerCardsOpen = false"
        />
      </portal>
    </subscription-block-option-wrap>

    <div class="c-subscriptionBlock__button-contain">
      <v-button
        v-if="activeSubscription.active"
        slot="button"
        class="c-subscriptionBlockDetails__button c-button--danger"
        :text="atc['buttons.cancelSubscription'] || 'Cancel Subscription'"
        @onClick="handleCancelSubscription"
      />
    </div>
  </subscription-block>
</template>

<style lang="scss">
@import '@design';

.c-subscriptionBlock__button-contain {
  padding: 25px 0;
}

.c-subscriptionBlockDetails__button {
  width: auto;
  padding: 12px 20px;
  margin: 0 auto;
  font-size: 12px;
  font-weight: bold;
  line-height: 16px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.c-portalBlockOption__text {
  font-size: 18px;
  line-height: 23px;
}
</style>
