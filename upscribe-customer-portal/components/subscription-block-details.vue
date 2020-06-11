<script>
import { mapState, mapGetters } from 'vuex'

import SubscriptionBlock from '@components/subscription-block.vue'
import SubscriptionBlockOptionWrap from '@components/subscription-block-option-wrap.vue'
import SubscriptionBlockOption from '@components/subscription-block-option.vue'
// import VButton from '@components/v-button.vue'

import DrawerBillingAddresses from '@components/drawer-billing-addresses.vue'
import DrawerShippingAddresses from '@components/drawer-shipping-addresses.vue'
import DrawerCards from '@components/drawer-cards.vue'

// import CancelModal from '@components/cancel-modal.vue'

export default {
  components: {
    SubscriptionBlock,
    SubscriptionBlockOptionWrap,
    SubscriptionBlockOption,
    // VButton,
    DrawerShippingAddresses,
    DrawerBillingAddresses,
    DrawerCards,
    // CancelModal,
  },
  data() {
    return {
      drawerShippingAddressesOpen: false,
      drawerBillingAddressesOpen: false,
      drawerCardsOpen: false,
      cancelModalOpen: false,
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

    ...mapGetters('cards', ['activeCard', 'cards']),

    formattedBillingAddress() {
      const address = this.activeBillingAddress

      if (!address || this.isEmptyObject(address)) {
        return false
      }
      let string = ''
      string += address.first_name ? `${address.first_name} ` : ''
      string += address.last_name ? `${address.last_name} ` : ''
      string += address.address1 ? `<br>${address.address1} ` : ''
      string += address.address2 ? `<br>${address.address2} ` : ''
      string += address.company ? `<br>${address.company}, ` : ''
      string += address.city ? `<br>${address.city}, ` : ''
      string += address.province_code ? `${address.province_code}, ` : ''
      string += address.zip ? `${address.zip} ` : ''
      string += address.country ? `<br>${address.country} ` : ''
      string += address.phone ? `${address.phone} ` : ''
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
      string += address.address1 ? `<br>${address.address1} ` : ''
      string += address.address2 ? `<br>${address.address2} ` : ''
      string += address.company ? `<br>${address.company}, ` : ''
      string += address.city ? `<br>${address.city}, ` : ''
      string += address.province_code ? `${address.province_code}, ` : ''
      string += address.zip ? `${address.zip} ` : ''
      string += address.country ? `${address.country} ` : ''
      string += address.phone ? `${address.phone} ` : ''
      return string
    },

    paymentInfo() {
      const { activeCard } = this
      if (!activeCard) return false

			const { last4, exp_month, exp_year, type, bank_code, zipcode } = activeCard


      if (type.includes('card')) {
        return `CARD *${last4} ${exp_month}/${exp_year} ${zipcode ? 'Zip: ' + zipcode : ''}`

      }

      else if (type === 'stripe_sepa_direct_debit') {
        return `Acct *${last4} / Bank ${bank_code}`
      }

      else {
        return false
      }
    },
  },
  methods: {
    async handleCancelSubscription() {
      this.cancelModalOpen = true
      // const { customerId, storeDomain } = this

      // this.$router.push({
      //   name: 'cancel',
      //   query: {
      //     storeDomain,
      //     customerId,
      //   },
      // })
    },
  },
}
</script>

<template>
  <subscription-block
    key="details"
    :title="
      editNextOrder ? (atc['portal.subscriptionDetailsSubscriptionTitle'] || 'Your Next Order Details') : (atc['portal.subscriptionDetailsNextOrderTitle'] || 'Your Subscription Details')
    "
  >
    <subscription-block-option-wrap @onClick="drawerShippingAddressesOpen = true">
      <subscription-block-option
        v-if="formattedShippingAddress"
        style="line-height: 1.88;"
        :title="atc['portal.subscriptionDetailsShippingAddressLabel'] || 'Shipping Address'"
        :html="formattedShippingAddress"
      />

      <content-placeholders v-else>
        <content-placeholders-heading />
      </content-placeholders>

      <!-- Drawer Portal -->
      <portal v-if="drawerShippingAddressesOpen" to="drawers">
        <drawer-shipping-addresses
          :show="drawerShippingAddressesOpen"
          @close="drawerShippingAddressesOpen = false"
        />
      </portal>
    </subscription-block-option-wrap>

    <subscription-block-option-wrap @onClick="drawerBillingAddressesOpen = true">
      <subscription-block-option
        v-if="formattedBillingAddress"
        style="line-height: 1.88;"
        :title="atc['portal.subscriptionDetailsBillingAddressLabel'] || 'Billing Address'"
        :html="formattedBillingAddress"
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

    <subscription-block-option-wrap @onClick="drawerCardsOpen = true">
      <subscription-block-option
        v-if="activeSubscription && paymentInfo"
        :title="atc['portal.subscriptionDetailsPaymentMethodLabel'] || 'Payment Method'"
        @onClick="drawerCardsOpen = true"
      >
        <span v-if="activeCard.type === 'stripe_sepa_direct_debit'" class="c-portalBlockOption__text">SEPA Direct Debit <br></span>
        <span class="c-portalBlockOption__text" style="font-size:14px">{{ paymentInfo }}</span>
      </subscription-block-option>

			<subscription-block-option
				v-else-if="activeSubscription && !activeCard"
				@onClick="drawerCardsOpen = true"
			>
				<span class="c-portalBlockOption__text--small c-portalBlockOption__text">{{ atc['portal.subscriptionDetailsPaymentMethodLabelNoPayment'] ||
						'No Payment Method attached to this Subscription. Click here to add one.' }}</span>
			</subscription-block-option>


      <content-placeholders v-else>
        <content-placeholders-heading />
      </content-placeholders>

      <!-- Drawer Portal -->
      <portal v-if="drawerCardsOpen" to="drawers">
        <drawer-cards :show="drawerCardsOpen" @close="drawerCardsOpen = false" />
      </portal>
    </subscription-block-option-wrap>

    <!-- <v-button
      v-if="!editNextOrder && activeSubscription.active"
      slot="button"
      :text="atc['buttons.cancelSubscription'] || 'Cancel Subscription'"
      @onClick="handleCancelSubscription"
    />-->

    <!-- <portal v-if="cancelModalOpen" to="modals">
      <cancel-modal :show="cancelModalOpen" @close="cancelModalOpen = false" />
    </portal>-->
  </subscription-block>
</template>

<style lang="scss">
@import '@design';

.c-portalBlockOption__text {
  color: $color-font-portal;
}
</style>
