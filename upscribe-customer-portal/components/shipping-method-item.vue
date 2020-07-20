
<script>
import { mapState } from 'vuex'

export default {
  props: {
    shippingMethod: {
      type: Object,
      required: true,
    },
    isSelected: {
      type: Boolean,
      default: false,
    },
    hasClickOption: {
      type: Boolean,
      default: true,
    },
  },

  computed: {
    ...mapState('shop', ['currencySymbol']),
  },

}
</script>

<template>
  <div
    v-if="shippingMethod"
    class="c-shippingMethodItem"
  >
    <div
      class="c-shippingMethodItem__inner"
      @click="$emit('selectShippingMethod')"
    >
      <div class="c-shippingMethodItem__info">
        <div class="c-shippingMethodItem__left">
          <span class="c-cardItem__name">{{ shippingMethod.title }}</span>
          <span class="c-cardItem__numbers">{{ currencySymbol }}{{ shippingMethod.price }}</span>
        </div>

        <div v-if="hasClickOption" class="c-option__select" :class="{ 'c-option__select--picked': isSelected }">
            <span class="c-option__inner"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import '@design';

.c-shippingMethodItem {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin: 0 auto;
}

.c-shippingMethodItem__inner {
  position: relative;
  width: 100%;
  padding: 7px 18px;
  font-size: 14px;
  color: $color-text;
  cursor: pointer;
  background-color: $color-white;
  border: 1px solid $color-blue-light-border;
  border-radius: 4px;
  transition: border 0.1s linear;

  @include bp(tablet){
    padding: 18px 18px 15px;
  }

  &:hover{
    border-color: #1ebefe;
  }

  &.no-edit {
    cursor: default;
  }
}

.c-shippingMethodItem__info {
  display: flex;
  padding: 19px 16px;
  justify-content: space-between;
  align-items: center;
}
.c-shippingMethodItem__left{
  width: 70%;
  margin-right: 15px;

  .c-cardItem__name, .c-cardItem__numbers{
    font-size: 16px;
    line-height: 21px;
  }

  .c-cardItem__name{
    font-weight: 500;
    color: $color-black;
    text-transform: capitalize;
  }
  .c-cardItem__numbers{
    color: $color-blue-secondary;
  }

}
</style>
