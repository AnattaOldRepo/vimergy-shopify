<template>
  <form-group
    :id="id"
    :name="name"
    :type="type"
    :helper-text="helperText"
    :placeholder="placeholder"
    :label="label"
    :required="required"
    :maxlength="maxlength"
    :hide-required="hideRequired"
    :input-focused="inputFocused"
    :input-has-value="inputHasValue"
    :select-options="selectOptions"
    :optional-label-text="optionalLabelText"
    :is-locked="isLocked"
    :disabled="disabled"
    :default-value-index="defaultValueIndex"
    :default-value="defaultValue"
    :auto-select-first-on-change="autoSelectFirstOnChange"
    :special-validate="specialValidate"
    :icon-name="iconName"
    :has-icon="!!iconName"
    :is-light="isLight"
    @focusInput="inputFocused = true"
  >
    <discount-tag-outline-icon
      v-if="iconName === 'discountTagOutlineIcon'"
      slot="icon"
      class="c-formGroup__icon"
    />

    <input
      v-if="!select"
      :id="id"
      slot="input"
      v-model="modelValue"
      slot-scope="{ validator }"
      :name="name"
      class="c-formInput"
      :class="{
        isLocked: isLocked,
        isDisabled: disabled,
        isLight: isLight,
        'input--middle': inputMiddle,
      }"
      :required="required"
      :type="type"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :is-locked="isLocked"
      :disabled="disabled"
      :default-value="defaultValue"
      @input="validateInput(validator)"
      @focus="inputFocused = true"
      @blur="inputFocused = false"
      @setLocationToManual="$emit('setLocationToManual')"
      @updateSelected="updateSelected"
    />

    <div
      v-if="select"
      slot="select"
      slot-scope="{ validator }"
      style="width: 100%"
    >
      <v-select
        v-model="modelValue"
        :options="selectOptions"
        :clearable="false"
        label="name"
        @search:focus="inputFocused = true"
        @search:blur="inputFocused = false"
        @input="updateSelected"
      />

      <vue-select
        :id="id"
        v-model="modelValue"
        style=" display: none;margin-top:30px;"
        :class="{ isLocked: isLocked, isDisabled: disabled }"
        :name="name"
        :type="type"
        :placeholder="placeholder"
        :disabled="isLocked"
        :items="selectOptions"
        :is-locked="isLocked"
        :default-value-index="defaultValueIndex"
        :input-focused="inputFocused"
        :auto-select-first-on-change="autoSelectFirstOnChange"
        @handleFocus="inputFocused = true"
        @handleBlur="inputFocused = false"
        @setLocationToManual="$emit('setLocationToManual')"
        @updateSelected="updateSelected($event, validator)"
      />
    </div>
  </form-group>
</template>

<script>
import Vue from 'vue'
import vSelect from 'vue-select'
import FormGroup from '@components/form-group'
import VueSelect from '@components/vue-select'
import discountTagOutlineIcon from '@components/discount-tag-outline-icon'

Vue.component('v-select', vSelect)

export default {
  components: {
    FormGroup,
    VueSelect,
    vSelect,
    discountTagOutlineIcon,
  },

  props: {
    value: {
      type: [String, Object],
      default: '',
    },
    specialValidate: {
      type: [Boolean, Array],
      default: false,
    },
    emitFocusEvent: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    id: {
      type: [String, Boolean],
      default: false,
    },
    name: {
      type: String,
      required: true,
    },
    placeholder: {
      type: String,
      default: '',
    },
    maxlength: {
      type: [Number, String, Boolean],
      default: '',
    },
    required: {
      type: Boolean,
      default: false,
    },
    hideRequired: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: 'text',
    },
    select: {
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
      type: [Array],
      default: () => [],
    },
    // Lock select to current val
    isLocked: {
      type: Boolean,
      default: false,
    },
    isLight: {
      type: Boolean,
      default: false,
    },
    defaultValue: {
      type: [Boolean, String, Number, Object, Array],
      default: false,
    },
    defaultValueIndex: {
      type: [Boolean, Number],
      default: false,
    },
    autoSelectFirstOnChange: {
      type: Boolean,
      default: false,
    },
    iconName: {
      type: [String, Boolean],
      default: false,
    },
    inputMiddle: {
      type: [String, Boolean],
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
        if (this.name === 'phone') {
          this.$emit('input', value.replace(/\D/g, ''))
        } else {
          this.$emit('input', value)
        }
      },
    },

    inputHasValue() {
      const { modelValue, isLocked, value } = this
      if (isLocked || value) {
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

  watch: {
    inputFocused(val) {
      if (this.emitFocusEvent) {
        this.$emit('onInputFocus', val)
      }
    },
  },

  methods: {
    updateSelected(payload) {
      this.$emit('updateSelected', payload)
    },

    validateInput(validator) {
      const vm = this

      if (validator && validator.$touch && this.type !== 'email')
        validator.$touch()

      this.$nextTick(() => {
        vm.$emit('updateInput', this.value)
      })
    },
  },
}
</script>

<style lang="scss">
@import '@design';

.c-formInput {
  width: 100%;
  height: 47px;
  padding: 25px 11px 6px;
  font-family: $font-primary-regular;
  font-size: 14px;
  border: 1px solid $color-blue-light-background;
  border-radius: 5px;

  &.isLocked,
  &.isDisabled {
    background-color: $color-placeholder;
  }

  &.isLight {
    padding-left: 40px;
    border-color: $color-border;
  }

  @include bp(tablet) {
    padding: 21px 15px 6px;
  }

  &:focus {
    z-index: 10;
    background: transparent;
    outline: none;
  }

  .c-formGroup--focused & {
    border-color: $color-black;
  }

  .hasError & {
    z-index: 10;
    // @include bp(tablet) {
    //   margin-bottom: 35px;
    // }
  }

  &::placeholder {
    color: $color-placeholder;
  }
}

.c-formSelect {
  width: 100%;
  max-width: 300px;
  height: 42px;
  padding: 10px 8px 8px;
  font-size: 16px;
  background-color: #fff;
  border: 1px solid gray;
  border-radius: 5px;
}

.v-select {
  position: relative;
  font-family: $font-primary-regular;
  background-color: $color-white;
}

.v-select,
.v-select * {
  box-sizing: border-box;
}

@-webkit-keyframes vSelectSpinner {
  0% {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(1turn);
  }
}

@keyframes vSelectSpinner {
  0% {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(1turn);
  }
}

.vs__fade-enter-active,
.vs__fade-leave-active {
  transition: opacity 0.15s cubic-bezier(1, 0.5, 0.8, 1);
}

.vs__fade-enter,
.vs__fade-leave-to {
  opacity: 0;
}

.vs--disabled .vs__clear,
.vs--disabled .vs__dropdown-toggle,
.vs--disabled .vs__open-indicator,
.vs--disabled .vs__search,
.vs--disabled .vs__selected {
  cursor: not-allowed;
  background-color: #f8f8f8;
}

.v-select[dir='rtl'] .vs__actions {
  padding: 0 3px 0 6px;
}

.v-select[dir='rtl'] .vs__clear {
  margin-right: 0;
  margin-left: 6px;
}

.v-select[dir='rtl'] .vs__deselect {
  margin-right: 2px;
  margin-left: 0;
}

.v-select[dir='rtl'] .vs__dropdown-menu {
  text-align: right;
}

.vs__dropdown-toggle {
  position: relative;
  display: flex;
  width: 100%;
  height: 46px;
  padding: 0 0 4px;
  padding: 16px;
  font-size: 16px;
  text-align: left;
  white-space: normal;
  white-space: nowrap;
  cursor: pointer;
  background: none;
  border: 1px solid $color-blue-light-background;
  border-radius: 4px;
  border-radius: 5px;
  outline: none;
  outline: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

.vs__selected-options {
  position: relative;
  display: flex;
  flex-basis: 100%;
  flex-grow: 1;
  flex-wrap: wrap;
  padding: 0 2px;
}

.vs__actions {
  display: flex;
  align-items: center;
  padding: 4px 6px 0 3px;
}

.vs--searchable .vs__dropdown-toggle {
  cursor: text;
}

.vs--unsearchable .vs__dropdown-toggle {
  cursor: pointer;
}

.vs--open .vs__dropdown-toggle {
  border-color: $color-black;
  border-bottom-color: transparent;
  border-bottom-left-radius: 0;
}

.hasError .vs__dropdown-toggle {
  border-color: $color-error;
}

.vs__open-indicator {
  fill: rgba(60, 60, 60, 0.5);
  transition: transform 0.15s cubic-bezier(1, -0.115, 0.975, 0.855);
  transition-timing-function: cubic-bezier(1, -0.115, 0.975, 0.855);
  transform: scale(0.8);
}

.vs--open .vs__open-indicator {
  transform: rotate(180deg) scale(0.8);
}

.vs--loading .vs__open-indicator {
  opacity: 0;
}

.vs__clear {
  padding: 0;
  margin-right: 8px;
  cursor: pointer;
  background-color: transparent;
  border: 0;
  fill: rgba(60, 60, 60, 0.5);
}

.vs__dropdown-menu {
  position: absolute;
  top: calc(100% - 1px);
  left: 0;
  z-index: 1000;
  display: block;
  width: 100%;
  min-width: 200px;
  max-height: 350px;
  padding: 5px 0;
  margin: 0;
  overflow-x: visible;
  overflow-y: auto;
  text-align: left;
  list-style: none;
  background: #fff;
  border: 1px solid rgba(60, 60, 60, 0.26);
  border-top-style: none;
  border-radius: 0 0 4px 4px;
  box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.15);
}

.vs__no-options {
  text-align: center;
}

.vs__dropdown-option {
  display: block;
  width: 100%;
  padding: 3px 20px;
  clear: both;
  line-height: 1.42857143;
  color: #333;
  white-space: nowrap;
}

.vs__dropdown-option:hover {
  cursor: pointer;
}

.vs__dropdown-option--highlight {
  color: #fff;
  background: #5897fb;
}

.vs__dropdown-option--disabled {
  color: rgba(60, 60, 60, 0.5);
  background: inherit;
}

.vs__dropdown-option--disabled:hover {
  cursor: inherit;
}

.vs__selected {
  display: flex;
  margin: 4px 2px 0;
  margin-left: -5px;
  // padding: 0 .25em;
  font-size: 14px;
  line-height: 1.4;
  color: #333;
  // align-items: center;
  background-color: #f0f0f0;
  border: 1px solid rgba(60, 60, 60, 0.26);
  border-radius: 4px;
}

.vs__deselect {
  display: inline-flex;
  padding: 0;
  margin-left: 4px;
  text-shadow: 0 1px 0 #fff;
  cursor: pointer;
  background: none;
  border: 0;
  fill: rgba(60, 60, 60, 0.5);
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

.vs--single .vs__selected {
  background-color: transparent;
  border-color: transparent;
}

.c-formGroup {
  .vs--single.vs--open .vs__selected {
    position: absolute;
    opacity: 0;
  }

  &.hasError {
    margin-bottom: 35px;
  }
}

.vs--single.vs--searching .vs__selected {
  display: none;
}

.vs__search::-webkit-search-cancel-button {
  display: none;
}

.vs__search::-ms-clear,
.vs__search::-webkit-search-decoration,
.vs__search::-webkit-search-results-button,
.vs__search::-webkit-search-results-decoration {
  display: none;
}

.vs__search,
.vs__search:focus {
  flex-grow: 1;
  width: 0;
  max-width: 100%;
  padding: 0 7px;
  margin: 4px 0 0;
  font-size: 1em;
  line-height: 1.4;
  background: none;
  border: 1px solid transparent;
  border-left: none;
  outline: none;
  box-shadow: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

.vs__search::-webkit-input-placeholder {
  color: $color-placeholder;
}

.vs__search::-moz-placeholder {
  color: $color-placeholder;
}

.vs__search:-ms-input-placeholder {
  color: $color-placeholder;
}

.vs__search::-ms-input-placeholder {
  color: $color-placeholder;
}

.vs__search::placeholder {
  color: $color-placeholder;
}

.vs--unsearchable .vs__search {
  opacity: 1;
}

.vs--unsearchable .vs__search:hover {
  cursor: pointer;
}

.vs--single.vs--searching:not(.vs--open):not(.vs--loading) .vs__search {
  opacity: 0.2;
}

.vs__spinner {
  align-self: center;
  overflow: hidden;
  font-size: 5px;
  text-indent: -9999em;
  border: 0.9em solid hsla(0, 0%, 39.2%, 0.1);
  border-left-color: rgba(60, 60, 60, 0.45);
  opacity: 0;
  transition: opacity 0.1s;
  transform: translateZ(0);
  -webkit-animation: vSelectSpinner 1.1s linear infinite;
  animation: vSelectSpinner 1.1s linear infinite;
}

.vs__spinner,
.vs__spinner::after {
  width: 5em;
  height: 5em;
  border-radius: 50%;
}

.vs--loading .vs__spinner {
  opacity: 1;
}

.input--middle {
  border-radius: 0;

  @include bp(tablet) {
    border-radius: 5px;
  }
}

/*# sourceMappingURL=vue-select.css.map*/
</style>
