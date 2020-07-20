<script>
export default {
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    text: {
      type: [String, Boolean],
      default: false,
    },
    size: {
      type: String,
      default: 'normal',
    },
    auto: {
      type: Boolean,
      default: false,
    },
    html: {
      type: String,
      default: '',
    },
    type: {
      type: [String, Boolean],
      default: false,
    },
  },
  computed: {
    buttonClasses() {
      return {
        'c-button--small': this.size === 'small',
        'c-button--large': this.size === 'large',
        'c-button--auto': this.auto,
        'c-button--alt': this.type === 'alt',
        'c-button--link': this.type === 'link',
      }
    },
  },
  methods: {
    onClick() {
      this.$emit('onClick')
    },
  },
}
</script>

<template>
  <button
    class="c-button"
    :disabled="disabled"
    :class="buttonClasses"
    @click.prevent="onClick"
  >
    <slot />
    <span v-if="text">{{ text }}</span>
    <!-- eslint-disable -->
    <span v-if="html" v-html="html"></span>
  </button>
</template>

<style lang="scss">
@import '@globalCSS';
@import '@design';

.c-button {
  display: flex;
  justify-content: center;
  width: 100%;
  min-width: 90px;
  height: auto;
  padding: 13px 0 12px;
  font-family: $font-primary-medium;
  font-size: 14px;
  font-weight: 500;
  color: $color-white;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  background-color: $color-button;
  border: 2px solid $color-button;
  transition: all 0.3s ease;

  &:hover,
  &:active,
  &:focus {
    background-color: $color-button-hover;
    border-color: $color-button-hover;
    outline: none;
  }

  &--half {
    width: 50%;
  }

  &--large {
    padding: 18px 0;
  }

  &--small {
    padding: 8px 0;
  }

  &--auto {
    width: auto;
    padding-right: 50px;
    padding-left: 50px;
  }

  &--alt {
    color: $color-primary;
    background-color: transparent;
    border-color: $color-primary;
    border-width: 1px;

    &:hover,
    &:active,
    &:focus {
      color: $color-white;
      background-color: $color-primary;
      border-color: $color-primary;
      outline: none;
    }
  }

  &--link {
    color: $color-primary;
    background-color: transparent;
    border-color: transparent;
    border-width: 2px;

    &:hover,
    &:active,
    &:focus {
      color: $color-primary;
      background-color: transparent;
      border-color: transparent;
      outline: none;
    }
  }

  &--primary{
    color: $color-white;
    background-color: $color-blue-brand;
    border: none;
    border-radius: 0;

    &:hover,
    &:active,
    &:focus {
      background-color: lighten($color-blue-brand, 10%);
    }
  }

  &--transparent {
    color: $color-black;
    background-color: transparent;
    border: 1px solid $color-blue-light-border;
    border-radius: 0;

    &:hover,
    &:active,
    &:focus {
      background-color: transparent;
    }
  }

  &--danger{
    color: $color-black;
    background-color: transparent;
    border: 1px solid $color-danger;
    border-radius: 0;

    &:hover,
    &:active,
    &:focus {
      background-color: transparent;
      border-color: lighten($color-danger, 10%);
    }
  }


  &:disabled {
    color: $color-white;
    cursor: default;
    background-color: $color-gray-250;
    border-color: $color-gray-250;
    outline: none;
  }

}
</style>
