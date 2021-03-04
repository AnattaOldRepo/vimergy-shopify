<script>
import { mapActions, mapState } from 'vuex'

import NewAddressForm from '@components/new-address-form.vue'
import AddressItem from '@components/address-item.vue'
import VButton from '@components/v-button.vue'
import Checkbox from '@components/checkbox.vue'

export default {
  components: {
    NewAddressForm,
    AddressItem,
    VButton,
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
      addressName: null,
      addressMonth: null,
      addressYear: null,
      applyToAllActiveSusbscriptions: false,
    }
  },
  computed: {
    ...mapState('translations', ['atc']),

    ...mapState('addresses', ['activeEditAddress']),
  },
  methods: {
    ...mapActions('addresses', ['UPDATE_ADDRESS']),
    ...mapActions('subscriptions', [
      'UPDATE_SUBSCRIPTION',
      'GET_SUBSCRIPTIONS',
    ]),
    ...mapActions('customer', ['GET_CUSTOMER']),

    async updateAddress(address) {
      const { activeEditAddress, editNextOrder, atc } = this

      this.$emit('setDrawerStatus', 'PENDING')

      try {
        if (editNextOrder) {
          // shoppify
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
          if (this.applyToAllActiveSusbscriptions) {
            const updatePayload = {
              requestPayload: {
                shipping_address: address,
              },
              bulkUpdate: this.applyToAllActiveSusbscriptions,
            }
            await this.UPDATE_SUBSCRIPTION(updatePayload)
          }

          this.$toast.info(
            atc['portal.nextShipmentResetFromSubscriptionChange'] || 'Changing Subscription Settings resets your next shipment.',
            { duration: 5000 }
          )
        }
        await this.GET_CUSTOMER()
        await this.GET_SUBSCRIPTIONS()
        this.$emit('setDrawerStatus', 'SUCCESS')
      } catch (e) {
        console.error('address/UPDATE_ADDRESS error: ', e)
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
      <h2 class="c-drawer__title">{{
        atc['portal.editAddressDrawerTitle'] || 'Edit Address'
      }}</h2>

      <address-item no-edit :address="activeEditAddress" />

      <checkbox
        v-model="applyToAllActiveSusbscriptions"
        :label="
          atc['portal.applyToAllActiveSusbscriptions'] ||
            'Apply to all active subscriptions'
        "
      />

      <new-address-form
        class="c-formBlock c-addressForm"
        :form-submit-button-text="
          atc['buttons.updateAddress'] || 'Update Address'
        "
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
