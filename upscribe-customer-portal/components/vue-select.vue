<template>
  <!-- eslint-disable vue/no-use-v-if-with-v-for -->
  <div
    :aria-expanded="[isOpen ? 'true' : 'false']"
    :aria-owns="'lbox_' + uuid"
    aria-autocomplete="none"
    role="combobox"
    :tabindex="isLocked ? -1 : 0"
    :class="[
      'c-vueSelect__dropdown',
      isOpen ? 'c-vueSelect__dropdown--open' : 'c-vueSelect__dropdown--close',
      isLocked ? 'isLocked' : '',
    ]"
    @focus="handleFocus"
    @blur="handleBlur"
    @click="toggle"
    @keydown.space="handleKeypress"
    @keydown.up="handleKeypress"
    @keydown.down="handleKeypress"
    @keydown.enter="selectFromKeyboard"
  >
    <span class="c-vueSelect__value">{{ mutableValueDisplay ? mutableValueDisplay : '' }}</span>

    <ul
      v-if="items && items.length"
      :id="'lbox_' + uuid"
      :ref="'lbox_' + uuid"
      :class="[
        'c-vueSelect__optionlist',
        isOpen ? '' : 'c-vueSelect__optionlist--close',
      ]"
      role="listbox"
    >
      <li
        v-for="(opt, index) in items"
        v-if="items"
        :key="index"
        :aria-selected="[isItemSelected(index) ? 'true' : 'false']"
        :class="[
          'c-vueSelect__option',
          isItemSelected(index) ? 'c-vueSelect__option--selected' : '',
          hoverIndex === index ? 'c-vueSelect__optionlist--hover' : '',
        ]"
        role="option"
        @click="select(index)"
        >{{ opt.name }}</li
      >
    </ul>
  </div>
</template>

<script>

export default {
  name: 'VueSelect',
  props: {
    items: {
      type: Array,
      default() {
        return []
      },
    },
    defaultValueIndex: {
      type: [Number, Boolean],
      default: false,
    },
    value: {
      type: [String, Object],
      default: null,
    },
    itemObjectArray: {
      type: Boolean,
      default: true,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    inputFocused: {
      type: Boolean,
      default: false,
    },
    autoSelectFirstOnChange: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isOpen: false,
      mutableValue: null,
      selectedindex: -1,
      hoverIndex: -1,
      uuid: 0,
    }
  },
  computed: {
    inputHasValue() {
      const { mutableValue, isLocked } = this
      if (isLocked) {
        return true
      }
      return !!(mutableValue && !this.isEmptyObject(mutableValue))
    },

    inputActive() {
      const { selectedindex } = this
      return selectedindex >= 0
    },
    mutableValueDisplay() {
      const { mutableValue } = this
      if (mutableValue && mutableValue.name) {
        return mutableValue.name
      } else {
        // return mutableValue
        return false
      }
    },
  },
  watch: {
    value(val) {
      // when the parent changes the value, update the internal state

      if (!val) {
        this.mutableValue = null
      } else if (val && val.name && val.value) {
        this.mutableValue = { ...val}
      } else {
        this.mutableValue = null
      }
    },

    items() {
      if (!this.items) return

      if (this.autoSelectFirstOnChange) {
        if (this.items.length && this.items[0] && this.items[0].name && this.items[0].value) {

          this.selectedindex = 0
          this.mutableValue = this.items[0]
        }
      }
    },
  },
  created() {
    this.uuid = Math.random()

    // initialize the mutable value to what is sent from the parent
    if (typeof this.defaultValueIndex === 'number') {
      this.mutableValue = this.value
      this.selectedindex = this.items.indexOf(this.value)
      this.select(this.defaultValueIndex)
    }
  },
  methods: {
    handleKeypress($event) {
      $event.preventDefault()

      let key = $event.keyCode
      let dropdown = this.$refs['lbox_' + this.uuid]
      let dropdownHeight = dropdown.clientHeight
      let optionHeight = dropdown.children[0].clientHeight

      // up
      if (key === 38) {
        this.moveUp()
        dropdown.scrollTop = dropdown.children[this.hoverIndex].offsetTop - dropdownHeight / 2 + optionHeight / 2
      }

      // down
      else if (key === 40) {
        this.moveDown()
        dropdown.scrollTop = dropdown.children[this.hoverIndex].offsetTop - dropdownHeight / 2 + optionHeight / 2
      }

      // space
      else if (key === 32) {
        this.toggle()
        if (this.hoverIndex < 0) return

        this.$nextTick(() => {
          dropdown.scrollTop = dropdown.children[this.hoverIndex].offsetTop
        })
      }
    },
    toggle() {
      if (this.isLocked) return
      this.isOpen = !this.isOpen
      this.hoverIndex = this.selectedindex
    },
    select(index) {
      let { items, mutableValue } = this
      if (
        items &&
        items[index] &&
        items[index].value &&
        items[index].value === 'OTHER'
      ) {
        this.$emit('setLocationToManual')
      } else {
        mutableValue = items[index]
        this.selectedindex = index
        this.$emit('input', mutableValue)
        this.$emit('updateSelected', mutableValue)
      }
    },
    isItemSelected(index) {
      return this.selectedindex === index
    },
    moveUp() {
      this.hoverIndex =
        this.hoverIndex === 0 ? this.items.length - 1 : this.hoverIndex - 1
    },
    moveDown() {
      this.hoverIndex = (this.hoverIndex + 1) % this.items.length
    },
    selectFromKeyboard() {
      this.select(this.hoverIndex)
      this.toggle()
    },
    handleBlur() {
      this.isOpen = false
      this.$emit('handleBlur')
    },
    handleFocus() {
      this.$emit('handleFocus')
    },
  },
}
</script>

<style lang="scss" scoped>
@import '@design';

.c-vueSelect__dropdown {
  font-size: 16px;
  outline: none;
  position: relative;
  text-align: left;
  width: 100%;
  cursor: pointer;
  background-color: $color-white;

  &.isLocked {
    background-color: $color-light;
    cursor: default;
    &::after {
      display: none;
    }
  }

  &:focus {
    outline: none;
  }
}
.c-vueSelect__dropdown--close {
  &::after {
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid $color-blue-light-border;
    content: '';
    height: 0;
    position: absolute;
    right: 8px;
    top: 20px;
    width: 0;
  }
}
.c-vueSelect__dropdown--open {
  &::after {
    position: absolute;
    top: 20px;
    right: 8px;
    width: 0;
    height: 0;
    content: '';
    border-right: 6px solid transparent;
    border-bottom: 6px solid $color-blue-light-border;
    border-left: 6px solid transparent;
  }
}
.c-vueSelect__value {
  display: block;
  height: 45px;
  padding: 16px;
  border: 1px solid $color-blue-light-border;
  outline: none;
  &:focus {
    border-color: $color-primary;
  }

  .c-formGroup--focused &,
  .c-formGroup--hasValue & {
    padding: 22px 13px 0px;
    font-size: 14px;
  }

  .c-formGroup--focused & {
    position: relative;
    border-color: $color-primary;
    z-index: 2001;
  }
}
.c-vueSelect__optionlist {
  position: absolute;
  background-color: $color-white;
  border: 1px solid $color-blue-light-border;
  border-radius: 0 0 5px 5px;
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 150px;
  top: 44px;
  z-index: 2000;
  width: 100%;
  overflow: scroll;
}
.c-vueSelect__optionlist--close {
  visibility: hidden;
}
.c-vueSelect__option {
  line-height: 2;
  text-align: left;
  vertical-align: middle;
  padding: 6px 16px;
  cursor: pointer;
}
.c-vueSelect__optionlist--hover,
.c-vueSelect__option:hover {
  background-color: $color-gray-100;
}
</style>
