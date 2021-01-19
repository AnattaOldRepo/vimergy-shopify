<script>
// import VButton from '@components/v-button'
export default {
  components: {
    // VButton,
  },
  props: {
    quantity: {
      type: Number,
      required: true,
    },
    isUpdating: {
      type: Boolean,
      default: false,
    },
  },
  data: () => {
    return {
      quantityLocal: null,
    }
  },
  watch: {
    quantity(newVal) {
      this.quantityLocal = newVal
    },
  },
  mounted() {
    this.quantityLocal = this.quantity
  },
  methods: {
    saveQuantity() {
      if (this.isUpdating) return
      if (!this.quantityLocal) return
      this.$emit('updateQuantity', this.quantityLocal)
    },
  },
}
</script>

<template>
  <div v-if="!isUpdating" class="c-quantityChangerManual__quantityBox">
    <input
      v-model="quantityLocal"
      type="number"
      class="c-quantityChangerManual__quantity"
    />

    <a
      href=""
      class="is-info c-button c-drawerProductBlock__button c-button--alt bold c-button--small"
      @click.prevent="saveQuantity"
      >Save QTY</a
    >
  </div>

  <div v-else class="button is-loading control-is-updating">Updating</div>
</template>

<style lang="scss">
@import '@design';

.c-quantityChangerManual--mobile {
  .c-quantityChangerManual__quantity,
  a {
    box-shadow: 0px 2px 1px 2px rgba(1, 1, 1, 0.1);
    font-size: 12px;
    border: none;
    height: 41px;
  }

  a {
    font-size: 14px;
  }
}

.c-quantityChangerManual__quantityBox {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  // border: 1px solid $color-text-light;
}

.c-quantityChangerManual__quantityControl {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 14px;
  color: $color-text-light;
  cursor: pointer;

  svg {
    width: 10px;
    height: 10px;
    fill: $color-text-light;
    stroke: $color-text-light;
  }
}

.c-quantityChangerManual__quantity {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: $font-primary-regular;
  font-size: 14px;
  color: $color-black;
  width: 55px;
  border: 1px solid #eaf1f4;
  padding: 10px;
  border-radius: 5px;
  margin-right: 10px;
  margin-bottom: 0;
}
</style>
