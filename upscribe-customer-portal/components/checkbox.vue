<template>
  <div class="c-formInput c-checkboxContainer">
    <label class="c-checkboxLabel">
      <p>
        {{ label }}
      </p>
      <input
        type="checkbox"
        v-model="innerValue"
        :disabled="$attrs.disabled"
        :checked="innerValue"
      />
      <span class="checkmark"></span>
    </label>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: '',
    },
  },
  created() {
    if (this.value) {
      this.innerValue = this.value
    }
  },
  data() {
    return {
      innerValue: false,
    }
  },
  watch: {
    innerValue(val) {
      this.$emit('input', val)
    },
    value(val) {
      this.innerValue = val
    },
  },
}
</script>

<style lang="scss" scoped>
@import '@design';

/* The container */
.c-checkboxContainer {
  padding: 12px;
  background-color: $color-white;
  margin-bottom: 15px;
}
.c-checkboxLabel {
  display: block;
  position: relative;
  padding-left: 35px;
  margin: auto 0;
  cursor: pointer;
  font-size: 14px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  p {
    position: absolute;
    top: 0;
  }
}

/* Hide the browser's default checkbox */
.c-checkboxLabel input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

/* Create a custom checkbox */
.checkmark {
  position: absolute;
  left: 0;
  width: 24px;
  height: 24px;
  border: 1px solid #a3b5bf;
  border-radius: 4px;
}

/* When the checkbox is checked, add a blue background */
.c-checkboxLabel input:checked ~ .checkmark {
  background-color: $color-blue-brand;
  border-color: $color-white;
}

/* Create the checkmark/indicator (hidden when not checked) */
.checkmark:after {
  content: '';
  position: absolute;
  display: none;
}

/* Show the checkmark when checked */
.c-checkboxLabel input:checked ~ .checkmark:after {
  display: block;
}

/* Style the checkmark/indicator */
.c-checkboxLabel .checkmark:after {
  left: 7px;
  top: 4px;
  width: 7px;
  height: 12px;
  border: solid $color-white;
  border-width: 0px 3px 3px 0px;
  -webkit-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
}
</style>
