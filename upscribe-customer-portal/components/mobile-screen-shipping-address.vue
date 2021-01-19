<template>
  <div class="c-addressPayment__formattedComponent">
    <portal to="header">
      <the-header
        :middle-html="
          mode === 'add' ? 'Add Shipping Address' : 'Edit Shipping Address'
        "
        mode="customized"
      />
    </portal>

    <checkbox
      v-if="mode !== 'listing'"
      v-model="applyToAllActiveSusbscriptions"
      :label="
        atc['portal.applyToAllActiveSusbscriptions'] ||
          'Apply to all active subscriptions'
      "
    />

    <!-- listing -->
    <div v-if="mode === 'listing'">
      <address-item
        v-for="address in addresses"
        :key="address.id"
        :address="address"
        :is-selected="addressIsSelected(address)"
        class="c-drawerAddressList__item"
        @editAddress="handleEditAddress(address)"
        @selectAddress="selectAddress(address)"
      />

      <v-button
        class="c-form__submitButton c-button--primary c-form__fullWidth c-button--large"
        type="primary"
        @onClick="mode = 'add'"
        >{{ atc['portal.addAddressButton'] || 'Add New Address' }}</v-button
      >
    </div>
    <!-- listing ends -->

    <!-- Swap -->
    <div v-if="mode === 'swap'" class="c-drawerAddressList">
      <h4 class="u-ma-3">Current Address </h4>
      <address-item
        v-if="activeSubscription.shipping_address"
        :key="activeSubscription.shipping_address.id"
        :address="activeSubscription.shipping_address"
        class="c-drawerAddressList__item"
      />
      <h4 class="u-ma-3">New Address </h4>
      <address-item
        v-if="newSwapAddress"
        :key="newSwapAddress.id"
        :address="newSwapAddress"
        class="c-drawerAddressList__item"
      />

      <v-button
        class="c-form__submitButton c-button--primary c-form__fullWidth c-button--large"
        type="primary"
        @onClick="swapAddress"
        >{{ atc['portal.addAddressButton'] || 'Swap Address' }}</v-button
      >
    </div>
    <!-- Swap ends -->

    <!-- Edit Address for subscription starts -->

    <!-- Edit Address Start -->
    <div v-if="mode === 'edit'">
      <new-address-form
        v-if="activeEditAddress"
        ref="edit-shipping-address-form"
        class="c-formBlock--noPadding c-shippingAddressForm"
        :form-submit-button-text="atc['buttons.updateAddress'] || 'Add Address'"
        form-name="shipping-address"
        :data-fill="activeEditAddress"
        @onSubmit="updateShippingAddress"
      />
      <new-address-form
        v-else
        ref="edit-shipping-address-form"
        class="c-formBlock--noPadding c-shippingAddressForm"
        :form-submit-button-text="atc['buttons.updateAddress'] || 'Add Address'"
        form-name="shipping-address"
        :data-fill="activeShippingAddress"
        @onSubmit="updateShippingAddress"
      />
    </div>
    <!-- Edit Address for subscription starts -->

    <!-- Edit Address Start -->
    <div v-if="mode === 'add'">
      <new-address-form
        class="c-formBlock c-addressForm"
        form-submit-button-text="Add Address"
        form-name="update-address"
        no-data-fill
        @onSubmit="addAddress"
      />
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations, mapGetters } from 'vuex'
import NewAddressForm from '@components/new-address-form.vue'
import TheHeader from '@components/the-header'
import Checkbox from '@components/checkbox.vue'
import AddressItem from '@components/address-item.vue'
import VButton from '@components/v-button.vue'

export default {
  components: {
    NewAddressForm,
    TheHeader,
    Checkbox,
    AddressItem,
    VButton,
  },

  computed: {
    ...mapState('translations', ['atc']),

    ...mapGetters('activeSubscription', [
      'activeSubscription',
      'activeShippingAddress',
    ]),

    ...mapState('addresses', [
      'addresses',
      'activeEditAddress',
      'newSwapAddress',
    ]),
  },
  data() {
    return {
      applyToAllActiveSusbscriptions: false,
      mode: 'listing',
    }
  },
  methods: {
    ...mapMutations('mobileGlobalManagement', ['setMessage', 'setStatus']),

    ...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),

    ...mapActions('subscriptions', [
      'UPDATE_SUBSCRIPTION',
      'UPDATE_NEXT_ORDER',
      'UPDATE_ALL_SUBS_ADDRESSES',
      'GET_SUBSCRIPTIONS',
    ]),

    ...mapMutations('addresses', ['setActiveEditAddress', 'setNewSwapAddress']),

    ...mapActions('addresses', ['CREATE_ADDRESS']),
    ...mapActions('customer', ['GET_CUSTOMER']),

    handleEditAddress(address) {
      this.mode = 'edit'
      this.setActiveEditAddress(address)
    },

    handleHeaderAction() {
      this.$refs['edit-shipping-address-form'].fillFormWithDefaultData()
    },

    selectAddress(address) {
      this.mode = 'swap'
      this.setNewSwapAddress(address)
    },

    swapAddress() {
      this.updateShippingAddress(this.newSwapAddress)
    },

    addressIsSelected(address) {
      const { activeSubscription } = this
      const aSubAddress = activeSubscription.shipping_address

      if (!address || !aSubAddress) return false

      return this.activeSubscription.shipping_address.id === address.id
    },

    async updateShippingAddress(address) {
      const { editNextOrder } = this
      this.setMessage('Updating new Shipping Address')
      this.setStatus('updating')
      const updatePayload = {
        requestPayload: {
          shipping_address: address,
        },
        bulkUpdate: this.applyToAllActiveSusbscriptions,
      }

      let updateAction
      let analyticsEventName
      let analyticsPayload = { address }

      if (editNextOrder) {
        updateAction = this.UPDATE_NEXT_ORDER(updatePayload)
        analyticsEventName = 'Upscribe Next Order Shipping Address Update'
      }

      // determine if updating both of just one
      else {
        analyticsEventName = 'Upscribe Subscription Shipping Address Update'
        updateAction = this.UPDATE_SUBSCRIPTION(updatePayload)
      }

      try {
        await updateAction

        this.triggerAnalyticsEvent({
          event: analyticsEventName,
          payload: analyticsPayload,
        })

        await this.GET_SUBSCRIPTIONS()
        this.setMessage('Saved new Shipping Address')
        this.setStatus('success')
      } catch (e) {
        console.error('subscription/UPDATE_SUBSCRIPTION error: ', e)
        this.setMessage(e.message)
        this.setStatus('error')
      }
    },
    async addAddress(address) {
      try {
        await this.CREATE_ADDRESS(address)
        if (this.applyToAllActiveSusbscriptions) {
          const updatePayload = {
            requestPayload: {
              shipping_address: address,
            },
            bulkUpdate: this.applyToAllActiveSusbscriptions,
          }
          await this.UPDATE_SUBSCRIPTION(updatePayload)
        }
        await this.GET_CUSTOMER()
        await this.GET_SUBSCRIPTIONS()
        this.$emit('setDrawerStatus', 'SUCCESS')
        this.$emit('setMode', 'default')
      } catch (e) {
        console.error('address/ADD_ADDRESS error: ', e)
        this.$emit('setDrawerStatus', { state: 'FAILURE', message: e.message })
      }
    },
  },
}
</script>

<style></style>
