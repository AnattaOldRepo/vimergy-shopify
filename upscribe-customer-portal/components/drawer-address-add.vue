<script>
import { mapState, mapActions } from 'vuex'
import VButton from '@components/v-button.vue'
import NewAddressForm from '@components/new-address-form.vue'
import Checkbox from '@components/checkbox.vue'

export default {
  components: {
    VButton,
    NewAddressForm,
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
      loadedStripe: false,
      completeStripeAddressInfo: false,
      stripeOptions: {},
      applyToAllActiveSusbscriptions: false,
    }
  },
  computed: {
    ...mapState('shop', ['stripePublicKey']),

    ...mapState('translations', ['atc']),
  },
  methods: {
    ...mapActions('addresses', ['CREATE_ADDRESS']),
    ...mapActions('subscriptions', [
      'UPDATE_SUBSCRIPTION',
      'GET_SUBSCRIPTIONS',
    ]),
    ...mapActions('customer', ['GET_CUSTOMER']),

    async addAddress(address) {
      this.$emit('setDrawerStatus', 'PENDING')
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

<template>
  <div class=" c-drawer">
    <div class="c-drawer__inner">
      <h2 class="c-drawer__title">{{
        atc['portal.addAddressDrawerTitle'] || 'Add Address'
      }}</h2>

      <checkbox
        v-model="applyToAllActiveSusbscriptions"
        :label="
          atc['portal.applyToAllActiveSusbscriptions'] ||
            'Apply to all active subscriptions'
        "
      />

      <new-address-form
        class="c-formBlock c-addressForm"
        :form-submit-button-text="atc['buttons.addAddress'] || 'Add Address'"
        form-name="update-address"
        no-data-fill
        @onSubmit="addAddress"
      />

      <v-button
        class="c-addressCancelButton"
        type="link"
        @onClick="$emit('setMode', 'default')"
        >{{ atc['buttons.cancel'] || 'Cancel' }}</v-button
      >
    </div>
  </div>
</template>

<style lang="scss">
@import '@design';

.c-drawerAddressAdd__stripeAddress {
  background-color: $color-white;
  padding: 10px;
  border-radius: 5px;
}

.c-drawerAddressAdd__addAddressButton {
  margin-top: 40px;
  margin-bottom: 20px;
}
</style>
