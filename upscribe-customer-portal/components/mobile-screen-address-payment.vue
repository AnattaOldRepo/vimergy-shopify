<template>
  <div>
    <portal to="header">
      <the-header
        middle-html="Address & Payment"
        mode="backwardRoute"
      />
    </portal>

    <mobile-subscription-template
      v-if="activeSubscription && !isCancelledSubscriptionRoute"
      :has-product-row="false"
    >
      <div slot="functionality-block" class="c-mobileSubscriptionTemplate__tools">
        <!-- Shipping Address Block -->
        <functional-button-block
          :internal-link="{
              query: {
                template: 'edit-shipping-address',
                storeDomain,
                customerId,
              },
          }"
          :title="atc['portal.editShippingAddressDrawerTitle'] || 'Shipping Address'"
          :second-text="formattedShippingAddress"
        >
          <span slot="icon" class="c-functionalButtonBlock__icon">
            <home-icon/>
          </span>
        </functional-button-block>

        <!-- Billing Address Block -->
        <functional-button-block
          :internal-link="{
            query: {
              template: 'edit-billing-address',
              storeDomain,
              customerId,
            },
          }"
          :title="atc['portal.editBillingAddressDrawerTitle'] || 'Billing Address'"
          :second-text="formattedBillingAddress"
        >
          <span slot="icon" class="c-functionalButtonBlock__icon">
              <receipt-icon />
          </span>
        </functional-button-block>

        <!-- Shipping Method Block -->
        <functional-button-block
          :internal-link="{
            query: {
              template: 'edit-payment',
              storeDomain,
              customerId,
            },
          }"
          :title="atc['portal.paymentMethodsDrawerTitle'] || 'Payment Methods'"
          :second-text="cardDisplay"
        >
          <span slot="icon" class="c-functionalButtonBlock__icon">
            <credit-card-icon />
          </span>
        </functional-button-block>
      </div>
    </mobile-subscription-template>

    <mobile-subscription-template
      v-else
      :has-product-row="false"
    >
      <div slot="functionality-block" class="c-mobileSubscriptionTemplate__tools">
        <!-- Cancelled Shipping Block -->
        <functional-button-block
          :display-only="true"
          header="Shipped To"
          :second-text="formattedCancelledShippingAddress"
        >
        </functional-button-block>

        <!-- Cancelled Payment Block -->
        <functional-button-block
          :display-only="true"
          header="Payment Method"
          :second-text="cardDisplayCancelledRoute"
        >
          <span slot="icon" class="c-functionalButtonBlock__icon">
            <credit-card-icon />
          </span>
        </functional-button-block>

        <!-- Cancelled Billing Block -->
        <functional-button-block
          :display-only="true"
          header="Billing Address"
          :second-text="formattedCancelledBillingAddress"
        >
        </functional-button-block>
      </div>
    </mobile-subscription-template>
  </div>
</template>

<script>
import MobileSubscriptionTemplate from '@components/mobile-subscription-template'
import HomeIcon from '@components/Icon/home-icon.vue'
import CreditCardIcon from '@components/Icon/credit-card-icon.vue'
import ReceiptIcon from '@components/Icon/receipt-icon.vue'
import FunctionalButtonBlock from '@components/functional-button-block.vue'
import { mapState, mapGetters } from 'vuex'
import { isEqual } from 'lodash'
import TheHeader from '@components/the-header.vue'


export default {
  components: {
    TheHeader,
    MobileSubscriptionTemplate,
    CreditCardIcon,
    HomeIcon,
    ReceiptIcon,
    FunctionalButtonBlock,
  },

  computed: {
    ...mapState('route', ['storeDomain', 'customerId']),

    ...mapState('translations', ['atc']),

    ...mapState('route', ['storeDomain', 'customerId']),

    ...mapState('editMode', ['editNextOrder']),

    ...mapGetters('cards', ['activeCard']),

    ...mapGetters('activeSubscription', ['activeSubscription', 'activeBillingAddress', 'activeShippingAddress']),

    edit(){
      const { edit } = this.$route.query
      if(edit === 'shippingAddress'){
        return 'shippingAddress'
      } else if(edit === 'billingAddress'){
        return 'billingAddress'
      } else if(edit === 'payment'){
        return 'payment'
      } else if(edit === 'addCard'){
        return 'addCard'
      }
      return false
    },

    formattedShippingAddress() {
      const address = this.activeShippingAddress

      if (!address || this.isEmptyObject(address)) {
        return false
      }
      let string = ''
      string += address.first_name ? `${address.first_name} ` : ''
      string += address.last_name ? `${address.last_name} • ` : ''
      string += address.company ? `${address.company} • ` : ''
      string += address.address1 ? `${address.address1} ` : ''
      string += address.address2 ? `${address.address2} • ` : ''
      string += address.city ? `${address.city} • ` : ''
      string += address.province_code ? `${address.province_code} • ` : ''
      string += address.zip ? `${address.zip} • ` : ''
      // string += address.country ? `${address.country} ` : ''

      return string.length >= 32 ? `<br/><span class="c-addressPayment__formatted">${string.slice(0, 32) + '...'}</span>` :  `<br/><span>${string}</span>`
    },

    formattedCancelledShippingAddress(){
       const address = this.activeShippingAddress

      if (!address || this.isEmptyObject(address)) {
        return false
      }
      let string = ''
      string += address.first_name ? `${address.first_name} ` : ''
      string += address.last_name ? `${address.last_name}  <br/>` : ''
      string += address.company ? `${address.company} <br/>` : ''
      string += address.address1 ? `${address.address1} ${address.address2 ? '' : '<br/>'}` : ''
      string += address.address2 ? `${address.address2} <br/>` : ''
      string += address.city ? `${address.city}, ` : ''
      string += address.province_code ? `${address.province_code}, ` : ''
      string += address.zip ? `${address.zip}` : ''

      return `<span class="c-addressPayment__formatted c-addressPayment__formatted--large">${string}</span>`
    },


    formattedBillingAddress() {
      const address = this.activeBillingAddress

      if(isEqual(this.activeBillingAddress, this.activeShippingAddress)){
        return `<br/><span class="c-addressPayment__formatted">Same As Shipping Address</span>`
      }

      if (!address || this.isEmptyObject(address)) {
        return false
      }
      let string = ''
      string += address.first_name ? `${address.first_name} ` : ''
      string += address.last_name ? `${address.last_name} • ` : ''
      string += address.company ? `${address.company} • ` : ''
      string += address.address1 ? `${address.address1} ` : ''
      string += address.address2 ? `${address.address2} • ` : ''
      string += address.city ? `${address.city} • ` : ''
      string += address.province_code ? `${address.province_code} • ` : ''
      string += address.zip ? `${address.zip} • ` : ''
      // string += address.country ? `${address.country} ` : ''
      return string.length >= 32 ? `<br/><span class="c-addressPayment__formatted">${string.slice(0, 32) + '...'}</span>` :  `<br/><span>${string}</span>`
    },

    formattedCancelledBillingAddress() {
      const address = this.activeBillingAddress
      let billingAddress

      if (!address || this.isEmptyObject(address)) {
        return false
      }
      let string = ''
      if(isEqual(this.activeBillingAddress, this.activeShippingAddress)){
        string += address.first_name ? `${address.first_name} ` : ''
        string += address.last_name ? `${address.last_name} • ` : ''
        string += address.company ? `${address.company} • ` : ''
        string += address.address1 ? `${address.address1} ` : ''
        string += address.address2 ? `${address.address2} • ` : ''
        string += address.city ? `${address.city} • ` : ''
        string += address.province_code ? `${address.province_code} • ` : ''
        string += address.zip ? `${address.zip} • ` : ''
      // string += address.country ? `${address.country} ` : ''
        billingAddress = "<span class='c-addressPayment__formatted c-addressPayment__formatted--large black'>Same As Shipping Address</span>"
        return string.length >= 32 ? billingAddress + `<br/><span class="c-addressPayment__formatted c-addressPayment__formatted--large">${string.slice(0, 32) + '...'}</span>` :  billingAddress + `<br/><span>${string}</span>`
      } else {
        string += address.first_name ? `${address.first_name} ` : ''
        string += address.last_name ? `${address.last_name}  <br/>` : ''
        string += address.company ? `${address.company} <br/>` : ''
        string += address.address1 ? `${address.address1} ${address.address2 ? '' : '<br/>'}` : ''
        string += address.address2 ? `${address.address2} <br/>` : ''
        string += address.city ? `${address.city}, ` : ''
        string += address.province_code ? `${address.province_code}, ` : ''
        string += address.zip ? `${address.zip}` : ''

        return `<span class="c-addressPayment__formatted c-addressPayment__formatted--large">${string}</span>`
      }
    },

    cardDisplay(){
     const { activeCard } = this
      if (!activeCard) return false

      const { last4, exp_month, exp_year, type, bank_code, zipcode } = activeCard

      if (type === 'stripe_card') {
        return `<br/><span class="c-addressPayment__formatted">CARD *${ last4 } ${ exp_month }/${ exp_year } ${zipcode ? 'Zip: ' + zipcode : ''}</span>`
      }

      else if (type === 'stripe_sepa_direct_debit') {
        return `<br/><span class="c-addressPayment__formatted">Acct *${last4} / Bank ${bank_code}</span>`
      }

      else {
        return false
      }
    },

    cardDisplayCancelledRoute(){
      const { activeCard } = this

      return `<span class="c-addressPayment__formatted--large black">CARD *${ activeCard.last4 } ${ activeCard.exp_month }/${ activeCard.exp_year } ${activeCard.zipcode ? 'Zip: ' + activeCard.zipcode : ''}</span>`
    },

    isCancelledSubscriptionRoute(){
      return this.$route.query.route === 'cancelledSubscriptions'
    },
  },
}
</script>

<style lang="scss">
@import '@design/_colors';

.c-addressPayment__formatted{
  font-size: 12px;
  line-height: 16px;
  color: $color-blue-secondary;
  font-style: normal;
  font-weight: 400;
  text-transform: capitalize;

  &--large{
    font-size: 16px;
    line-height: 21px;
  }
}

.black{
  color: $color-black;
  font-weight: 400
}
</style>
