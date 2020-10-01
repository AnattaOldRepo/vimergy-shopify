<script>
import { mapActions, mapState } from 'vuex'

import NewAddressForm from '@components/new-address-form.vue'
import AddressItem from '@components/address-item.vue'
import VButton from '@components/v-button.vue'

export default {
  components: {
    NewAddressForm,
    AddressItem,
    VButton,
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
      addressName: null,
      addressMonth: null,
      addressYear: null,
    }
  },
  computed: {
    ...mapState('translations', ['atc']),

    ...mapState('addresses', ['activeEditAddress']),
  },
  methods: {
    ...mapActions('addresses', ['UPDATE_ADDRESS']),

    async updateAddress(address) {
      const { activeEditAddress, editNextOrder } = this

      this.$emit('setDrawerStatus', 'PENDING')

      try {
        if (editNextOrder) {
          await this.UPDATE_ADDRESS({
            address,
            addressId: activeEditAddress.id,
            updateSub: false,
          })
          await this.UPDATE_NEXT_ORDER({
            requestPayload: {
              shipping_address: address,
            },
          })
        } else {
          await this.UPDATE_ADDRESS({
            address,
            addressId: activeEditAddress.id,
            updateSub: true,
          })
        }

        this.$emit('setDrawerStatus', 'SUCCESS')
      } catch (e) {
        console.log('address/UPDATE_ADDRESS error: ', e)
        this.$emit('setDrawerStatus', { state: 'FAILURE', message: e.message })
      }
    },

    showRemoveAddressPrompt() {
      this.$emit('setMode', 'remove')
    },
  },
}
</script>

<template>
  <div v-if="activeEditAddress" class="c-drawer c-drawerEditAddress">
    <div class="c-drawer__inner">
      <h2 class="c-drawer__title">{{ atc['portal.editAddressDrawerTitle'] || 'Edit Address' }}</h2>

      <address-item no-edit :address="activeEditAddress" />

      <new-address-form
        class="c-formBlock c-addressForm"
        form-submit-button-text="Update Address"
        form-name="update-address"
        update-address
        :data-fill="activeEditAddress"
        @onSubmit="updateAddress"
      />

      <v-button
        class="c-addressCancelButton"
        type="link"
        @onClick="showRemoveAddressPrompt"
        >{{ atc['buttons.removeAddress'] || 'Remove Address' }}</v-button
      >
    </div>
  </div>
</template>

<style lang="scss">
@import '@design';
.c-addressCancelButton {
  margin-top: 20px;
}
</style>
