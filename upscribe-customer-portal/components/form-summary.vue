<script>
import { templates } from 'vuelidate-error-extractor'
export default {
  components: {
    baseErrors: templates.multiErrorExtractor.baseMultiErrorExtractor,
  },
  inheritAttrs: false,
}
</script>

<template>
  <base-errors v-bind="$attrs" class="c-formErrors">
    <div slot-scope="{ errorMessage }">{{ errorMessage }}</div>
  </base-errors>
</template>

<style lang="scss">
@import '@design';

.c-formErrors {
  padding: 12px;
  background-color: #fff;
  color: black;
  width: auto;
  margin: 0 auto;
  align-items: center;
  text-align: center;
  margin-top: 20px;
  margin: 20px 0;
  border-radius: 5px;

  &--pending {
    color: blue;
    // background-color: blue;
  }

  &--success {
    color: green;
    // background-color: green;
  }

  &--error {
    color: #e40000;
    // background-color: #e40000;
  }
}
.c-form__message {
  margin: 0;
  color: inherit;
}
</style>
