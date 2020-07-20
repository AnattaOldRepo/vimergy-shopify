<script>
/* eslint-disable vue/no-v-html */
import { mapState } from 'vuex'
import ErrorIcon from '@components/error-icon'

export default {
  components: {
    ErrorIcon,
  },
  props: {
    formSubmitStatus: {
      type: [Object, Boolean, Error],
      default: false,
    },
  },
  computed:{
    ...mapState('checkout', [
      'secondary_text_color',
    ]),
  },
}
</script>

<template>
  <div
    v-if="formSubmitStatus && !isEmptyObject(formSubmitStatus)"
    class="c-formSubmitStatus"
    :class="{
      'c-formSubmitStatus--pending': formSubmitStatus.status === 'PENDING',
      'c-formSubmitStatus--success': formSubmitStatus.status === 'SUCCESS',
      'c-formSubmitStatus--error': formSubmitStatus.status === 'ERROR',
    }"
  >
    <p v-if="formSubmitStatus.status === 'PENDING'"
      class="c-formSubmitStatus__message"
      :style="{color: secondary_text_color}"
    >
      <error-icon v-if="formSubmitStatus.status === 'ERROR'" class="c-formSubmitStatus__icon"/>
      <span v-html="formSubmitStatus.message ? formSubmitStatus.message : 'Loading'"></span>
    </p>

    <p v-else-if="formSubmitStatus.status !== 'PENDING' && formSubmitStatus.message"
      class="c-formSubmitStatus__message"
    >
      <error-icon v-if="formSubmitStatus.status === 'ERROR'" class="c-formSubmitStatus__icon"/>
      <span v-html="formSubmitStatus.message"></span>
    </p>

  </div>
</template>

<style lang="scss">
@import '@design';

.c-formSubmitStatus {
  padding: 12px;
  color: black;
  margin: 0 auto;
  align-items: center;
  text-align: center;
  margin-top: 20px;
  border-radius: 5px;
  font-size: 14px;

  &--pending {
    color: $color-pending;
    border-color: $color-pending;

    // background-color: blue;
  }

  &--success {
    color: $color-success;
    border-color: $color-success;

    // background-color: green;
  }

  &--error {
    color: $color-error;
    border-color: $color-error;

    // background-color: #e40000;
  }
}

.c-formSubmitStatus__icon {
  margin-right: 6px;
}

.c-formSubmitStatus__message {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  color: inherit;
  line-height: 1.2;
}
</style>
