<script>
import { mapGetters } from 'vuex'
import DrawerWrap from '@components/drawer-wrap.vue'

import DrawerProductsSwap from '@components/drawer-products-swap.vue'
import DrawerProductsAdd from '@components/drawer-products-add.vue'
import DrawerProductsEdit from '@components/drawer-products-edit.vue'
import DrawerProductsSelectVariant from '@components/drawer-products-select-variant.vue'
import DrawerProductsSelectVariantSwap from '@components/drawer-products-select-variant-swap.vue'

import DrawerShippingMethodList from '@components/drawer-shipping-method-list.vue'

export default {
  components: {
    DrawerWrap,
    DrawerProductsSwap,
    DrawerProductsAdd,
    DrawerProductsEdit,
    DrawerProductsSelectVariant,
    DrawerProductsSelectVariantSwap,
    DrawerShippingMethodList,
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
      mode: 'edit', // edit, add, swap
      status: false, // PENDING, SUCCESS, FAILURE
    }
  },
  computed: {
    ...mapGetters('activeSubscription', ['activeSubscription']),

    updating() {
      return this.status && this.status === 'PENDING'
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
    v-if="activeSubscription"
    :status="status"
    :show="show"
    @close="$emit('close')"
  >
    <drawer-products-swap
      v-if="mode === 'swap'"
      class="c-drawerProducts c-drawer"
      :updating="updating"
      @setMode="handleSetMode"
      @setDrawerStatus="handleDrawerStatus"
    />

    <drawer-products-add
      v-else-if="mode === 'add'"
      class="c-drawerProducts c-drawer"
      :updating="updating"
      @setMode="handleSetMode"
      @setDrawerStatus="handleDrawerStatus"
    />

    <drawer-products-select-variant
      v-else-if="mode === 'variant-select'"
      class="c-drawerProducts c-drawer"
      :updating="updating"
      @setMode="handleSetMode"
      @setDrawerStatus="handleDrawerStatus"
    />

    <drawer-products-select-variant-swap
      v-else-if="mode === 'variant-select-swap'"
      class="c-drawerProducts c-drawer"
      :updating="updating"
      @setMode="handleSetMode"
      @setDrawerStatus="handleDrawerStatus"
    />

    <drawer-shipping-method-list
      v-else-if="mode === 'shipping-method-list'"
      class="c-drawerShippingMethodList c-drawerProducts c-drawer"
      select-during-product-update
      :updating="updating"
      @setMode="handleSetMode"
      @setDrawerStatus="handleDrawerStatus"
    />

    <drawer-products-edit
      v-else
      class="c-drawerProducts c-drawer"
      :updating="updating"
      @setMode="handleSetMode"
      @setDrawerStatus="handleDrawerStatus"
    />
  </drawer-wrap>
</template>

<style lang="scss">
.control-is-updating {
  pointer-events: none;
  opacity: .5;
  transition: all 0 ease;
}
.c-drawerShippingMethodList{
  max-width: 620px;
}
</style>
