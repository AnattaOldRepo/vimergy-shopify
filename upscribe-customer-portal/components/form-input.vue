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
    <discount-tag-outline-icon v-if="iconName === 'discountTagOutlineIcon'" slot="icon" class="c-formGroup__icon"/>

    <input
      v-if="!select"
      :id="id"
      slot="input"
      v-model="modelValue"
      slot-scope="{ validator }"
      :name="name"
      class="c-formInput"
      :class="{ isLocked: isLocked, isDisabled: disabled, isLight: isLight, 'input--middle': inputMiddle }"
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
        style="margin-top:30px; display: none;"
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
          this.$emit('input', value.replace(/\D/g,''))
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
      console.log({payload})
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
  padding: 25px 11px 6px;

  font-size: 14px;
  font-family: $font-primary-regular;
  border: 1px solid $color-blue-light-background;
  border-radius: 5px;
  height: 47px;

  &.isLocked,
  &.isDisabled {
    background-color: $color-placeholder;
  }

  &.isLight {
    border-color: $color-border;
    padding-left: 40px;
  }

  @include bp(tablet) {
    padding: 21px 15px 6px;
  }

  &:focus {
    outline: none;
    background: transparent;
    z-index: 10;
  }

  .c-formGroup--focused & {
    border-color: $color-black;
  }

  .hasError & {
    border-color: $color-error;
    background: transparent;
    z-index: 10;
  }

  &::placeholder{
    color: $color-placeholder;
  }
}

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




.v-select {
	position: relative;
  font-family: $font-primary-regular;
  background-color: $color-white;
}

.v-select,
.v-select * {
	box-sizing: border-box
}

@-webkit-keyframes vSelectSpinner {
	0% {
		transform: rotate(0deg)
	}
	to {
		transform: rotate(1turn)
	}
}

@keyframes vSelectSpinner {
	0% {
		transform: rotate(0deg)
	}
	to {
		transform: rotate(1turn)
	}
}

.vs__fade-enter-active,
.vs__fade-leave-active {
	transition: opacity .15s cubic-bezier(1, .5, .8, 1)
}

.vs__fade-enter,
.vs__fade-leave-to {
	opacity: 0
}

.vs--disabled .vs__clear,
.vs--disabled .vs__dropdown-toggle,
.vs--disabled .vs__open-indicator,
.vs--disabled .vs__search,
.vs--disabled .vs__selected {
	cursor: not-allowed;
	background-color: #f8f8f8
}

.v-select[dir=rtl] .vs__actions {
	padding: 0 3px 0 6px
}

.v-select[dir=rtl] .vs__clear {
	margin-left: 6px;
	margin-right: 0
}

.v-select[dir=rtl] .vs__deselect {
	margin-left: 0;
	margin-right: 2px
}

.v-select[dir=rtl] .vs__dropdown-menu {
	text-align: right
}

.vs__dropdown-toggle {
	-webkit-appearance: none;
	-moz-appearance: none;
	appearance: none;
	display: flex;
	padding: 0 0 4px;
	background: none;
	border-radius: 4px;
  white-space: normal;

  font-size: 16px;
  outline: none;
  position: relative;
  text-align: left;
  width: 100%;
  cursor: pointer;
  height: 46px;
  padding: 16px;
  border: 1px solid $color-blue-light-background;
  border-radius: 5px;
  outline: none;
  white-space: nowrap;
}

.vs__selected-options {
	display: flex;
	flex-basis: 100%;
	flex-grow: 1;
	flex-wrap: wrap;
	padding: 0 2px;
	position: relative
}

.vs__actions {
	display: flex;
	align-items: center;
	padding: 4px 6px 0 3px
}

.vs--searchable .vs__dropdown-toggle {
	cursor: text
}

.vs--unsearchable .vs__dropdown-toggle {
	cursor: pointer
}

.vs--open .vs__dropdown-toggle {
	border-bottom-color: transparent;
	border-bottom-left-radius: 0;
  border-color: $color-black;
}

.hasError .vs__dropdown-toggle {
  border-color: $color-error;
}

.vs__open-indicator {
	fill: rgba(60, 60, 60, .5);
	transform: scale(.8);
	transition: transform .15s cubic-bezier(1, -.115, .975, .855);
	transition-timing-function: cubic-bezier(1, -.115, .975, .855)
}

.vs--open .vs__open-indicator {
	transform: rotate(180deg) scale(.8)
}

.vs--loading .vs__open-indicator {
	opacity: 0
}

.vs__clear {
	fill: rgba(60, 60, 60, .5);
	padding: 0;
	border: 0;
	background-color: transparent;
	cursor: pointer;
	margin-right: 8px
}

.vs__dropdown-menu {
	display: block;
	position: absolute;
	top: calc(100% - 1px);
	left: 0;
	z-index: 1000;
	padding: 5px 0;
	margin: 0;
	width: 100%;
	max-height: 350px;
	min-width: 200px;
	overflow-y: auto;
  overflow-x: visible;
	box-shadow: 0 3px 6px 0 rgba(0, 0, 0, .15);
	border: 1px solid rgba(60, 60, 60, .26);
	border-top-style: none;
	border-radius: 0 0 4px 4px;
	text-align: left;
	list-style: none;
	background: #fff
}

.vs__no-options {
	text-align: center
}

.vs__dropdown-option {
	line-height: 1.42857143;
	display: block;
	padding: 3px 20px;
  width: 100%;
	clear: both;
	color: #333;
	white-space: nowrap
}

.vs__dropdown-option:hover {
	cursor: pointer
}

.vs__dropdown-option--highlight {
	background: #5897fb;
	color: #fff
}

.vs__dropdown-option--disabled {
	background: inherit;
	color: rgba(60, 60, 60, .5)
}

.vs__dropdown-option--disabled:hover {
	cursor: inherit
}

.vs__selected {
	display: flex;
	align-items: center;
	background-color: #f0f0f0;
	border: 1px solid rgba(60, 60, 60, .26);
	border-radius: 4px;
	color: #333;
	line-height: 1.4;
	margin: 4px 2px 0;
  padding: 0 .25em;

  padding: 0;
  margin: 0;
  font-size: 14px;
  margin-left: -5px;
}

.vs__deselect {
	display: inline-flex;
	-webkit-appearance: none;
	-moz-appearance: none;
	appearance: none;
	margin-left: 4px;
	padding: 0;
	border: 0;
	cursor: pointer;
	background: none;
	fill: rgba(60, 60, 60, .5);
	text-shadow: 0 1px 0 #fff
}

.vs--single .vs__selected {
	background-color: transparent;
	border-color: transparent
}

.c-formGroup {
  .vs--single.vs--open .vs__selected {
    position: absolute;
    opacity: 0;
  }
}

.vs--single.vs--searching .vs__selected {
	display: none
}

.vs__search::-webkit-search-cancel-button {
	display: none
}

.vs__search::-ms-clear,
.vs__search::-webkit-search-decoration,
.vs__search::-webkit-search-results-button,
.vs__search::-webkit-search-results-decoration {
	display: none
}

.vs__search,
.vs__search:focus {
	-webkit-appearance: none;
	-moz-appearance: none;
	appearance: none;
	line-height: 1.4;
	font-size: 1em;
	border: 1px solid transparent;
	border-left: none;
	outline: none;
	margin: 4px 0 0;
	padding: 0 7px;
	background: none;
	box-shadow: none;
	width: 0;
	max-width: 100%;
	flex-grow: 1
}

.vs__search::-webkit-input-placeholder {
	color: $color-placeholder
}

.vs__search::-moz-placeholder {
	color: $color-placeholder
}

.vs__search:-ms-input-placeholder {
	color: $color-placeholder
}

.vs__search::-ms-input-placeholder {
	color: $color-placeholder
}

.vs__search::placeholder {
	color: $color-placeholder
}

.vs--unsearchable .vs__search {
	opacity: 1
}

.vs--unsearchable .vs__search:hover {
	cursor: pointer
}

.vs--single.vs--searching:not(.vs--open):not(.vs--loading) .vs__search {
	opacity: .2
}

.vs__spinner {
	align-self: center;
	opacity: 0;
	font-size: 5px;
	text-indent: -9999em;
	overflow: hidden;
	border: .9em solid hsla(0, 0%, 39.2%, .1);
	border-left-color: rgba(60, 60, 60, .45);
	transform: translateZ(0);
	-webkit-animation: vSelectSpinner 1.1s linear infinite;
	animation: vSelectSpinner 1.1s linear infinite;
	transition: opacity .1s
}

.vs__spinner,
.vs__spinner:after {
	border-radius: 50%;
	width: 5em;
	height: 5em
}

.vs--loading .vs__spinner {
	opacity: 1
}

.input--middle{
  border-radius: 0px;
  @include bp(tablet){
    border-radius: 5px;
  }
}
/*# sourceMappingURL=vue-select.css.map*/







</style>
