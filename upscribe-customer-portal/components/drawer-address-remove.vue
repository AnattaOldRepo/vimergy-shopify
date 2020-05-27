<script>
import { mapActions, mapState } from 'vuex'

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

    ...mapState('addresses', ['activeEditAddress']),
  },
  methods: {
    ...mapActions('addresses', ['DELETE_ADDRESS']),

    async removeAddress() {
      const uniqueAddressString = this.createUniqueAddressString(
        this.activeEditAddress
      )

      this.$emit('setDrawerStatus', 'PENDING')
      try {
        await this.DELETE_ADDRESS(uniqueAddressString)
        this.$emit('setDrawerStatus', 'SUCCESS')
        this.$emit('setMode', 'default')
      } catch (e) {
        console.log('address/ADD_ADDRESS error: ', e)
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
  <div v-if="activeEditAddress" class="c-drawer">
    <div class="c-drawer__inner">
      <h2 class="c-drawer__title">{{ atc['removeAddressDrawerTitle'] || 'Remove Address' }}</h2>

      <p class="c-drawer__subtitle"
        >{{ atc['portal.removeAddressDrawerPrompt'] || 'Are you sure you want to remove this address?' }}</p
      >

      <address-item
        :address="activeEditAddress"
        no-edit
        class="c-drawerAddressList__item"
      />

      <v-button class="c-form__submitButton" @onClick="removeAddress"
        >{{ atc['buttons.removeAddress'] || 'Remove Address' }}</v-button
      >

      <v-button
        class="c-drawerAddressRemove__cancelButton"
        type="link"
        @onClick="$emit('setMode', 'default')"
        >{{ atc['buttons.cancel'] || 'Cancel' }}</v-button
      >
    </div>
  </div>
</template>

<style lang="scss">
@import '@design';

.c-drawerAddressRemove__cancelButton {
  margin-top: 20px;
}
</style>
