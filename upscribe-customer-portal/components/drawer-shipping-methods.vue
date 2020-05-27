<script>
import DrawerShippingMethodList from '@components/drawer-shipping-method-list.vue'
import DrawerWrap from '@components/drawer-wrap.vue'
import DrawerShippingMethodSwap from '@components/drawer-shipping-method-swap.vue'

export default {
  components: {
    DrawerWrap,
    DrawerShippingMethodList,
    DrawerShippingMethodSwap,
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
    oneTime: {
      type: Boolean,
      default: false,
    },
  },
  data: () => {
    return {
      mode: 'default', // default, swap
      status: null,
    }
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
  <drawer-wrap :status="status" :show="show" @close="$emit('close')">
    <drawer-shipping-method-swap
      v-if="mode === 'swap'"
      :one-time="oneTime"
      class="c-defaultDrawer"
      @close="$emit('close')"
      @setMode="handleSetMode"
      @setDrawerStatus="handleDrawerStatus"
    />
    <drawer-shipping-method-list
      v-else
      :one-time="oneTime"
      class="c-defaultDrawer"
      @close="$emit('close')"
      @setMode="handleSetMode"
    />
  </drawer-wrap>
</template>
