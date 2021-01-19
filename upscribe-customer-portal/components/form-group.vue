<script>
import { mapState } from 'vuex'
import { singleErrorExtractorMixin } from 'vuelidate-error-extractor'
import errorIcon from '@components/error-icon.vue'

export default {

  components: {
    errorIcon,
  },
  mixins: [singleErrorExtractorMixin],

  props: {
    id: {
      type: [String, Boolean],
      default: false,
    },
    placeholder: {
      type: String,
      default: '',
    },
    maxlength: {
      type: [Number, String, Boolean],
      default: '',
    },
    select: {
      type: [Boolean],
      default: false,
    },
    type: {
      type: String,
      default: 'text',
    },
    label: {
      type: [String, Boolean],
      default: false,
    },
    name: {
      type: String,
      required: true,
    },
    helperText: {
      type: [String, Boolean],
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    required: {
      type: Boolean,
      default: false,
    },
    hideRequired: {
      type: Boolean,
      default: false,
    },
    inputFocused: {
      type: Boolean,
      default: false,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    inputHasValue: {
      type: Boolean,
      default: false,
    },
    optionalLabelText: {
      type: [String, Boolean],
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
    autoCompleteValue: {
      type: [Boolean, String, Number, Object, Array],
      default: false,
    },
    autoSelectFirstOnChange: {
      type: Boolean,
      default: false,
    },
    specialValidate: {
      type: [Boolean, Array],
      default: false,
    },
    iconName: {
      type: [String, Boolean],
      default: false,
    },
    hasIcon: {
      type: Boolean,
      default: false,
    },
    isLight: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    ...mapState('translations', ['atc']),

    specialValidateErrors() {
      const { formValidator, specialValidate, label } = this
      if (!specialValidate) return false

      const specialErrors = specialValidate.map(field => {

        if (!formValidator[field].required && formValidator[field].$dirty) {
          return `${label} <checkout.formValidationIsRequired>.`
        }
      })
      return [specialErrors[0]]
    },
  },

  methods: {
    focusInput() {
      if (!this.isLocked && !this.disabled) {
        this.$emit('focusInput')
      }
    },

    translateError(error) {
      const { atc } = this
      if (!error) return false
      return error
        .replace(
          '<forms.validationIsRequired>',
          atc['forms.validationIsRequired'] || 'is required'
        )
        .replace(
          '<forms.validationIsNotAValidEmail>',
          atc['forms.validationIsNotAValidEmail'] ||
            'is not a valid email address'
        )
        .replace(
          '<forms.validationIsNotANumber',
          atc['forms.validationIsNotANumber'] || 'is not a number'
        )
    },
  },
}
</script>

<template>
  <div
    class="c-formGroup form-group"
    :class="{
      hasError: hasErrors,
      hasSuccess: isValid,
      'c-formGroup--focused': inputFocused,
      'c-formGroup--hasValue': inputHasValue,
    }"
  >
    <slot name="icon" />

    <label
      v-if="label"
      class="c-formGroup__label"
      :class="{
        'c-formGroup__label--required': required && !hideRequired,
        'c-formGroup__label--withIcon': hasIcon,
        'c-formGroup__label--isLight': isLight,
      }"
      :for="id ? id : false"
      @click="focusInput"
      >{{ label
      }}<span
        v-if="optionalLabelText"
        class="c-formGroup__label--optionalText"
        >{{ optionalLabelText }}</span
      ></label
    >
    <slot name="input" :validator="preferredValidator" />

    <slot name="select" :validator="preferredValidator" />

    <slot
      name="autocomplete"
      :validator="preferredValidator"
      :autoCompleteValue="autoCompleteValue"
    />

    <p v-if="helperText" class="c-formGroup__helper">{{ helperText }}</p>

    <div v-if="hasErrors" class="c-formGroup__errors">
      <p
        v-for="error in activeErrorMessages"
        :key="error"
        class="c-formGroup__inputError"
        ><span v-if="error"><error-icon v-if="error" class="c-formGroup__inputErrorIcon"/> {{ translateError(error) }}</span></p
      >
    </div>

    <div v-else-if="specialValidateErrors" class="">
      <p
        v-for="error in specialValidateErrors"
        :key="error"
        class="c-formGroup__inputError"
        ><span v-if="error"><error-icon v-if="error" class="c-formGroup__inputErrorIcon"/> {{ translateError(error) }}</span></p
      >
    </div>

  </div>
</template>

<style lang="scss">
@import '@design';

.c-formGroup {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  max-height: 46px;

  &:last-of-type {
    margin-bottom: 0px;
  }

  &:last-child{
    margin-bottom: 0px;
  }

  @include bp(tablet){
    margin-bottom: 15px;
  }

  &--error {
  }

  &.c-formGroup--focused,
  &.c-formGroup--hasValue {
    .c-formGroup__label {
      position: absolute;
      pointer-events: none;
      top: 7px;
      left: 12px;
      padding: 0;
      font-family: $font-primary-regular;
      font-size: 11px;

      @include bp(mobile-large-max) {
        font-size: 12px;
      }
    }
  }

  &--half {
    width: calc(50% - 10px);
    @include column(1/2);
  }

  &--third {
    @include bp(tablet) {
      @include column(1/2);
    }

    @include bp(tablet-large) {
      @include column(1/3);
    }

    &:last-of-type {
      margin-right: 0;
    }
  }

  &--fourth {
    @include bp(tablet) {
      @include column(1/2);
    }

    @include bp(tablet-large) {
      @include column(1/4);
    }

    &:last-of-type {
      margin-right: 0;
    }
  }

  &--twoThird {
    @include bp(tablet) {
      @include column(1/2);
    }

    @include bp(tablet-large) {
      @include column(2/3);
    }
  }
}

.c-formGroup__label {
  z-index: 1;
  pointer-events: none;
  color: $color-blue-secondary;
  padding-left: 5px;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  position: absolute;
  top: 15px;
  left: 8px;

  @include bp(tablet){
    color: $color-placeholder;
  }

  &--required {
    &:after {
      content: '*';
    }
  }

  &--optionalText {
    font-size: 12px;
    margin-left: 4px;
    color: $color-placeholder;
  }

  &--withIcon {
    margin-left: 28px;
  }

  &--isLight {
    color: $color-placeholder;
  }
}

.c-formGroup__helper {
  color: gray;
  font-size: 12px;
  padding-left: 5px;
  padding-top: 3px;
  margin: 0;
}

.c-formGroup__input {
  width: 100%;
  font-size: 16px;
  padding: 10px 8px 8px;
  border: 1px solid $color-input-border;
  border-radius: 5px;
}

.c-formGroup__icon {
  position: absolute;
  top: 17px;
  left: 16px;
}

.c-formGroup__select {
  height: 42px;
  background-color: #fff;
  max-width: 300px;
  width: 100%;
  font-size: 16px;
  padding: 10px 8px 8px;
  border: 1px solid $color-input-border;
  border-radius: 5px;
}

.c-formGroup__inputError {
  margin: 0;
  padding-top: 8px;
  font-size: 12px;
  color: $color-error;
  // display: none;

  @include bp(tablet){
    display: block;
  }
}

.c-formGroup__inputErrorIcon {
  margin-right: 2px;
  transform: translateY(3px);
}

.c-formGroupWrapper {
  @include bp(tablet) {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }

  .c-formGroup {
    @include bp(mobile-large-max) {
      &--half {
        width: 100%;
      }
    }
  }
}
</style>
