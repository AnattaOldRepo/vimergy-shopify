<script>
import { mapGetters, mapState } from 'vuex'
import DrawerWrap from '@components/drawer-wrap.vue'

import DrawerAddressList from '@components/drawer-address-list.vue'
import DrawerAddressAdd from '@components/drawer-address-add.vue'
import DrawerAddressEdit from '@components/drawer-address-edit.vue'
import DrawerAddressRemove from '@components/drawer-address-remove.vue'
import DrawerAddressSwap from '@components/drawer-address-swap.vue'

export default {
  components: {
    DrawerWrap,
    DrawerAddressList,
    DrawerAddressAdd,
    DrawerAddressEdit,
    DrawerAddressRemove,
    DrawerAddressSwap,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    initialMode: {
      type: [Boolean, String],
      default: false,
    },
  },
  data: () => {
    return {
      mode: 'default', // default, edit, add, remove, swap
      status: null, // PENDING, SUCCESS, FAILURE
    }
  },
  computed: {
    ...mapState('addresses', ['addresses']),

    ...mapGetters('addresses', ['activeAddress']),
  },
  watch: {
    mode() {
      this.status = null
    },
  },
  mounted() {
    const { initialMode } = this
    if (initialMode) {
      this.mode = initialMode
    }
  },
  methods: {
    handleSetMode(mode) {
      this.mode = mode
    },
    handleDrawerStatus(status) {
      this.status = status
    },
  },
}
</script>

<template>
  <drawer-wrap
    v-if="addresses"
    :status="status"
    :show="show"
    @close="$emit('close')"
  >
    <drawer-address-add
      v-if="mode === 'add'"
      class="c-drawerAddresss c-drawer"
      :show="show"
      @close="$emit('close')"
      @setMode="handleSetMode"
      @setDrawerStatus="handleDrawerStatus"
    />

    <drawer-address-edit
      v-else-if="mode === 'edit'"
      class="c-drawerAddresss c-drawer"
      :show="show"
      @close="$emit('close')"
      @setMode="handleSetMode"
      @setDrawerStatus="handleDrawerStatus"
    />

    <drawer-address-remove
      v-else-if="mode === 'remove'"
      class="c-drawerAddresss c-drawer"
      :show="show"
      @close="$emit('close')"
      @setMode="handleSetMode"
      @setDrawerStatus="handleDrawerStatus"
    />

    <drawer-address-swap
      v-else-if="mode === 'swap'"
      class="c-drawerAddresss c-drawer"
      :show="show"
      @close="$emit('close')"
      @setMode="handleSetMode"
      @setDrawerStatus="handleDrawerStatus"
    />

    <drawer-address-list
      v-else
      class="c-drawerAddresss c-drawer"
      :show="show"
      @close="$emit('close')"
      @setMode="handleSetMode"
      @setDrawerStatus="handleDrawerStatus"
    />
  </drawer-wrap>
</template>

<style lang="scss">
@import '@design';
</style>
