<script>
import { mapState, mapGetters, mapMutations } from 'vuex'

import VButton from '@components/v-button.vue'
import AddressItem from '@components/address-item.vue'

export default {
  components: {
    VButton,
    AddressItem,
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
    }
  },
  computed: {
    ...mapState('translations', ['atc']),

    ...mapState('addresses', ['addresses']),

    ...mapGetters('addresses', ['activeAddress']),

    ...mapGetters('activeSubscription', ['activeSubscription']),
  },
  methods: {
    ...mapMutations('addresses', ['setActiveEditAddress', 'setNewSwapAddress']),

    addressIsSelected(address) {
      const { activeSubscription } = this
      const aSubAddress = activeSubscription.shipping_address

      if (!address || !aSubAddress) return false

      return this.activeSubscription.shipping_address.id === address.id
    },

    handleEditAddress(addresses) {
      this.setActiveEditAddress(addresses)
      this.$emit('setMode', 'edit')
    },

    handleSelectAddress(addresses) {
      const { activeAddress } = this

      if (
        !addresses ||
        !activeAddress ||
        (!activeAddress.shipping_address &&
          activeAddress.shipping_address.id !== addresses.id)
      ) {
        this.setNewSwapAddress(addresses)
        this.$emit('setMode', 'swap')
        return
      }

      const aSubAddress = activeAddress.shipping_address

      const aSubAddressString =
        aSubAddress.first_name +
        aSubAddress.last_name +
        aSubAddress.company +
        aSubAddress.address1 +
        aSubAddress.address2

      const aSubCompare = aSubAddressString.replace(/\s+/g, '')

      let sameAddress = false

      addresses.forEach((address) => {
        let addressString =
          address.first_name +
          address.last_name +
          address.company +
          address.address1 +
          address.address2
        let aCompare = addressString.replace(/\s+/g, '')

        if (aCompare === aSubCompare) {
          sameAddress = true
        }
      })

      // ignore if same addresses
      if (sameAddress) return
      this.setNewSwapAddress(addresses)
      this.$emit('setMode', 'swap')
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

    <div v-if="addresses" class="c-drawer__inner">
      <div class="c-drawerAddressList">
        <address-item
          v-for="address in addresses"
          :key="address.id"
          :address="address"
          :is-selected="addressIsSelected(address)"
          class="c-drawerAddressList__item"
          @editAddress="handleEditAddress"
          @selectAddress="handleSelectAddress(address)"
        />
      </div>

      <v-button
        class="c-form__submitButton"
        @onClick="$emit('setMode', 'add')"
        >{{ atc['portal.addAddressButton'] || 'Add Address' }}</v-button
      >
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
