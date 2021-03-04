<script>
export default {
  props: {
    title: {
      type: [String, Boolean],
      default: false,
    },
    text: {
      type: [String, Boolean],
      default: false,
    },
    html: {
      type: [String, Boolean],
      default: false,
    },
    textLarge: {
      type: Boolean,
      default: false,
    },
    textMed: {
      type: Boolean,
      default: false,
    },
    titleLight: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<template>
  <div class="c-subscriptionBlockOption">
    <h3
      v-if="title"
      class="c-subscriptionBlockOption__title"
      :class="{ 'c-subscriptionBlockOption__title--light': titleLight }"
      >{{ title }}</h3
    >
    <span
      v-if="text"
      class="c-subscriptionBlockOption__text"
      :class="{
        'c-subscriptionBlockOption__text--large': textLarge,
        'c-subscriptionBlockOption__text--med': textMed,
      }"
      >{{ text }}</span
    >
    <!-- eslint-disable -->
    <p
      v-if="html"
      class="c-subscriptionBlockOption__text"
      v-html="html"
      :class="{
        'c-subscriptionBlockOption__text--large': textLarge,
        'c-subscriptionBlockOption__text--med': textMed,
      }"
    ></p>
    <!-- eslint-enable -->

    <div v-if="$slots.default" class="c-subscriptionBlockOption__inner">
      <slot />
    </div>
  </div>
</template>

<style lang="scss">
@import '@design';

.c-subscriptionBlockOption {
  max-width: 80%;

  &.c-subscriptionBlockOption--textOnly {
    padding: 10px;
  }
}

.c-subscriptionBlockOption__inner {
  display: flex;
  flex-direction: column;
}

.c-subscriptionBlockOption__title {
  margin-bottom: 4px;
  font-family: $font-primary-medium;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  letter-spacing: 0.08em;
  color: $color-blue-secondary;
  text-transform: uppercase;

  &--light {
    color: $color-text-light;
  }
}

.c-subscriptionBlockOption__text {
  font-size: 14px;
  color: $color-black;
  margin-bottom: 0;

  &--large {
    font-size: 34px;
    text-transform: capitalize;
  }

  &--med {
    font-size: 18px;
    line-height: 23px;
  }
}
</style>
