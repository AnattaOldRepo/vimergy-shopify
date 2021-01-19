<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'

import VButton from '@components/v-button.vue'
import AddressItem from '@components/address-item.vue'
import Checkbox from '@components/checkbox.vue'

export default {
  components: {
    VButton,
    AddressItem,
    Checkbox,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  data: () => {
    return {
      drawerStatus: null,
      applyToAllActiveSusbscriptions: false,
    }
  },
  computed: {
    ...mapState('translations', ['atc']),

    ...mapState('addresses', ['addresses', 'newSwapAddress']),

    ...mapGetters('addresses', ['activeAddress']),

    ...mapGetters('activeSubscription', ['activeSubscription']),
  },
  methods: {
    ...mapMutations('addresses', ['setActiveEditAddress', 'setNewSwapAddress']),

    ...mapActions('subscriptions', [
      'UPDATE_SUBSCRIPTION',
      'GET_SUBSCRIPTIONS',
    ]),

    addressIsSelected(address) {
      const { activeSubscription } = this
      const aSubAddress = activeSubscription.shipping_address

      if (!address || !aSubAddress) return false

      const aSubAddressString =
        aSubAddress.first_name +
        aSubAddress.last_name +
        aSubAddress.company +
        aSubAddress.address1 +
        aSubAddress.address2

      const aSubCompare = aSubAddressString.replace(/\s+/g, '')

      const addressString =
        address.first_name +
        address.last_name +
        address.company +
        address.address1 +
        address.address2
      let aCompare = addressString.replace(/\s+/g, '')

      // eslint-disable-next-line eqeqeq
      return aCompare == aSubCompare
    },

    handleEditAddress(addresses) {
      this.setActiveEditAddress(addresses)
      this.$emit('setMode', 'edit')
    },

    // handleSelectAddress(addresses) {
    //   const { activeAddress } = this

    //   if (!addresses || !activeAddress || !activeAddress.shipping_address) {
    //     this.setNewSwapAddress(addresses)
    //     this.$emit('setMode', 'swap')
    //     return
    //   }

    //   const aSubAddress = activeAddress.shipping_address

    //   const aSubAddressString =
    //     aSubAddress.first_name +
    //     aSubAddress.last_name +
    //     aSubAddress.company +
    //     aSubAddress.address1 +
    //     aSubAddress.address2

    //   const aSubCompare = aSubAddressString.replace(/\s+/g, '')

    //   let sameAddress = false

    //   addresses.forEach((address) => {
    //     let addressString =
    //       address.first_name +
    //       address.last_name +
    //       address.company +
    //       address.address1 +
    //       address.address2
    //     let aCompare = addressString.replace(/\s+/g, '')

    //     if (aCompare === aSubCompare) {
    //       sameAddress = true
    //     }
    //   })

    //   // ignore if same addresses
    //   if (sameAddress) return
    //   this.setNewSwapAddress(addresses)
    //   this.$emit('setMode', 'swap')
    // },
    async swapAddress() {
      const updatePayload = {
        requestPayload: {
          shipping_address: this.newSwapAddress,
        },
        bulkUpdate: this.applyToAllActiveSusbscriptions,
      }
      await this.UPDATE_SUBSCRIPTION(updatePayload)
      await this.GET_SUBSCRIPTIONS()
      this.$emit('close')
    },
  },
}
</script>

<template>
  <div class="c-drawerAddresss c-drawer">
    <h2 class="c-drawer__title">{{
      atc['portal.shippingAddressesDrawerTitle'] || 'Shipping Addresses'
    }}</h2>

    <p class="c-drawer__subtitle c-drawer__subtitle--info">{{
      atc['portal.shippingAddressesDrawerPrompt'] ||
        "Add new or select existing address to transfer the current subscription's shipping address."
    }}</p>

    <checkbox
      v-model="applyToAllActiveSusbscriptions"
      :label="
        atc['portal.applyToAllActiveSusbscriptions'] ||
          'Apply to all active subscriptions'
      "
    />

    <div v-if="addresses" class="c-drawer__inner">
      <div class="c-drawerAddressList">
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
      </div>

      <v-button class="c-form__submitButton" @onClick="swapAddress">{{
        atc['buttons.swapAddress'] || 'Swap Address'
      }}</v-button>
    </div>
  </div>
</template>

<style lang="scss">
@import '@design';

.c-drawerAddressList {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  background-color: $color-light;
  margin-bottom: 40px;
}

.c-drawerAddressList__item {
  cursor: pointer;
  .c-addressesItem__inner {
    transition: all 0.2s ease;

    &:hover {
      border-color: $color-primary;
    }
  }
}
</style>
