<script>
export default {
  props: {
    title: {
      type: [String, Boolean],
      default: false,
    },
  },
}
</script>

<template functional>
  <div class="c-subscriptionBlock__section">
    <h2 v-if="props.title" class="c-subscriptionBlock__sectionTitle">
      {{ props.title }}
    </h2>

    <div class="c-subscriptionBlock__inner">
      <slot />

      <div class="c-subscriptionBlock__status">
        <slot name="status" />
      </div>
    </div>

    <div class="c-subscriptionBlock__button">
      <slot name="button" />
    </div>
  </div>
</template>

<style lang="scss">
@import '@design';

.c-subscriptionBlock__section {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  border-radius: 4px;

  @include bp(tablet-large) {
    max-width: 100%;
  }
}

.c-subscriptionBlock__sectionTitle {
  margin-bottom: 22px;
  font-family: $font-primary-medium;
  font-size: 18px;
  line-height: 23px;
  text-align: left;
  color: $color-blue-secondary;
  font-weight: bold;
  letter-spacing: 0.1px;

  @include bp(tablet-large) {
    text-align: left;
  }
}

.c-subscriptionBlock__inner {
  margin-bottom: 28px;
  background-color: $color-white;
  border: 1px solid $color-blue-light-border;
}

.c-subscriptionBlock__status {
}

.c-subscriptionBlock__button {
  @include bp(tablet-max) {
    .c-button {
      width: 100%;
      max-width: 334px;
      padding: 12px 0;
      margin: 0 auto;
    }
  }
}
</style>
