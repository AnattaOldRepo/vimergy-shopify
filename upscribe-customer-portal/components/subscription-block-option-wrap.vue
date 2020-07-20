<script>
import IconChevronRight from '@components/icon-chevron-right.vue'
export default {
  components: {
    IconChevronRight,
  },
  props: {
    noAction: {
      type: Boolean,
      default: false,
    },
    textOnly: {
      type: Boolean,
      default: false,
    },
    customClassForIcon:{
      type: String,
      default: '',
    },
  },
  computed: {
    propClasses() {
      return {
        'c-subscriptionBlockOptionWrap--textOnly': this.textOnly,
      }
    },
  },
}
</script>

<template>
  <div
    class="c-subscriptionBlockOptionWrap"
    :class="propClasses"
    @click="$emit('onClick')"
  >
    <slot />
    <icon-chevron-right
      v-if="!noAction"
      class="c-subscriptionBlockOptionWrap__icon"
      :class="customClassForIcon"
    />
  </div>
</template>

<style lang="scss">
@import '@design';

.c-subscriptionBlockOptionWrap {
  position: relative;
  padding: 20px 24px 15px;
  border-bottom: 1px solid $color-blue-light-border;
  cursor: pointer;

  &:nth-last-of-type(2) {
    border-bottom: none;
  }

  &:hover,
  &:active,
  &:focus {
    .c-subscriptionBlockOptionWrap__icon {
      transform: translateY(-50%) translateX(6px);
    }
  }

  &.c-subscriptionBlockOptionWrap--textOnly {
    padding: 20px 26px;
    cursor: auto;
  }
}

.c-subscriptionBlockOptionWrap__icon {
  position: absolute;
  top: 50%;
  right: 22px;
  width: 10px;
  height: 24px;
  transition: all 0.3s ease;
  transform: translateY(-50%);
  fill: $color-blue-secondary;
}

.c-subscriptionBlockOptionWrap__icon--floatTop{
  top: 30%;
  right: 22px;
  @include bp(tablet-large){
    top: 50%;
  }
}
</style>
