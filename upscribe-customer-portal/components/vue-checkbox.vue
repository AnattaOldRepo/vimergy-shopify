<template>
  <div class="c-vueCheckbox">
    <input
      ref="input"
      class="vueCheckbox__trueInput u-visuallyHidden"
      :name="name"
      :checked="checked"
      tabindex="-1"
    />
    <div
      class="c-vueCheckbox__input"
      :class="{ 'is-checked': checked }"
      @click="change"
    >
      <div
        class="c-vueCheckbox__inputBox"
        role="checkbox"
        :aria-checked="checked"
        tabindex="0"
        aria-labelledby="chk1-label"
        @keyup.enter="checked = !checked"
      >
        <svg class="c-vueCheckbox__inputCheck" viewBox="0 0 20 20">
          <path
            d="M7.629,14.566c0.125,0.125,0.291,0.188,0.456,0.188c0.164,0,0.329-0.062,0.456-0.188l8.219-8.221c0.252-0.252,0.252-0.659,0-0.911c-0.252-0.252-0.659-0.252-0.911,0l-7.764,7.763L4.152,9.267c-0.252-0.251-0.66-0.251-0.911,0c-0.252,0.252-0.252,0.66,0,0.911L7.629,14.566z"
          ></path>
        </svg>
      </div>
      <label
        v-if="label"
        :id="checkboxValue + 'checkbox-label'"
        class="c-vueCheckbox__label"
        >{{ label }}</label
      >
    </div>
  </div>
</template>

<script>
export default {
  props: {
    /* eslint-disable */
    name: String,
    /* eslint-enable */
    checkboxValue: {
      type: String,
      default: 'Checkbox',
    },
    label: {
      type: [String, Boolean],
      default: false,
    },
    checked: {
      type: Boolean,
      default: false,
    },
  },

  computed: {},

  watch: {},

  mounted() {},

  methods: {
    change: function() {
      this.$emit('input', this.checked)
    },
  },
}
</script>

<style lang="scss">
@import '@design';

.c-vueCheckbox__input {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  cursor: pointer;
}

.c-vueCheckbox__label {
  color: $color-text;
  font-size: 11px;
  cursor: pointer;
}

.c-vueCheckbox__inputBox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-right: 4px;
  border: 1px solid $color-text;

  .is-checked & {
    background-color: $color-primary;
    border: 1px solid $color-primary;
  }

  &:focus {
    outline: none;
  }

  &:focus,
  &:active {
    border-color: $color-primary;

    .is-checked & {
      border-color: $color-border;
    }
  }
}

.c-vueCheckbox__inputCheck {
  display: none;
  width: 1em;
  height: 1em;
  stroke: $color-white;
  fill: $color-white;

  .is-checked & {
    display: block;
  }
}
</style>
