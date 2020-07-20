<template>
  <form-group
    :id="id"
    :name="name"
    :type="type"
    :helper-text="helperText"
    :placeholder="placeholder"
    :label="label"
    :required="required"
    :input-focused="inputFocused"
    :input-has-value="inputHasValue"
    :select-options="selectOptions"
    :optional-label-text="optionalLabelText"
  >
    <vue-select
      :id="id"
      v-model="modelValue"
      :name="name"
      :type="type"
      :placeholder="placeholder"
      :disabled="isLocked"
      :items="selectOptions"
      :is-locked="isLocked"
    />
  </form-group>
</template>

<script>
import FormGroup from '@components/form-group.vue'
import VueSelect from '@components/vue-select.vue'

export default {
  components: {
    FormGroup,
    VueSelect,
  },

  props: {
    value: {
      type: [Object, String],
      default: () => {
        return { value: 'United States', name: 'United States' }
      },
    },
    name: {
      type: String,
      required: true,
    },
    id: {
      type: [String, Boolean],
      default: false,
    },
    placeholder: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'text',
    },
    required: {
      type: Boolean,
      default: false,
    },
    label: {
      type: [String, Boolean],
      default: false,
    },
    helperText: {
      type: [String, Boolean],
      default: false,
    },
    optionalLabelText: {
      type: [String, Boolean],
      default: false,
    },
    selectOptions: {
      type: [Array, Boolean],
      default: false,
    },
    // Lock select to current val
    isLocked: {
      type: Boolean,
      default: false,
    },
  },
  data: () => {
    return {
      inputFocused: false,
    }
  },

  computed: {
    modelValue: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      },
    },

    inputHasValue() {
      const { modelValue, isLocked } = this
      if (isLocked) {
        return true
      }
      return !!(modelValue && modelValue.length)
    },

    inputActive() {
      const { inputFocused, inputValueSet } = this
      if (inputFocused || inputValueSet) {
        return true
      } else {
        return false
      }
    },
  },
}
</script>

<style lang="scss">
@import '@design';

.c-formSelect {
  height: 42px;
  background-color: #fff;
  max-width: 300px;
  width: 100%;
  font-size: 16px;
  padding: 10px 8px 8px;
  border: 1px solid gray;
  border-radius: 5px;
}
</style>
