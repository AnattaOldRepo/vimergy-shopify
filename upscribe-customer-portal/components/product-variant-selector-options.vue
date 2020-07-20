<script>
export default {
  props: {
    optionGroup: {
      type: [Array, Boolean],
      default: false,
    },
    selectedOption: {
      type: [Boolean, String],
      default: false,
    },
    optionsName: {
      type: [Boolean, String],
      default: false,
    },
    optionPosition: {
      type: [Number, Boolean ],
      default: false,
    },
  },

  data() {
    return {
      isOpen: false,
      selectedindex: -1,
      hoverIndex: -1,
    }
  },

  methods: {
    toggle() {
      this.isOpen = !this.isOpen
      this.hoverIndex = this.selectedindex
    },
    select(value) {
      this.$emit('select', {value, position: this.optionPosition})
    },
    moveUp() {
      this.hoverIndex =
        this.hoverIndex === 0
          ? this.optionGroup.length - 1
          : this.hoverIndex - 1
      this.hoverValue = this.optionGroup[this.hoverIndex]
    },
    moveDown() {
      this.hoverIndex = (this.hoverIndex + 1) % this.optionGroup.length
      this.hoverValue = this.optionGroup[this.hoverIndex]
    },
    selectFromKeyboard() {
      this.select(this.hoverValue)
      this.toggle()
    },
    handleBlur() {
      if (this.isOpen) {
        this.toggle()
      }
    },
  },
}
</script>

<template>
  <div
    v-if="optionGroup && selectedOption"
    class="c-productVariantSelector"
  >
    <span class="c-productVariantSelector__label">
      {{ optionsName }}
    </span>
    <div
      class="c-productVariantSelector__selector"
      :aria-expanded="[isOpen ? 'true' : 'false']"
      :aria-owns="'lbox_' + _uid"
      aria-autocomplete="none"
      role="combobox"
      tabindex="0"
      :class="[
        'c-vueSelect__dropdown',
        isOpen ? 'c-vueSelect__dropdown--open' : 'c-vueSelect__dropdown--close',
      ]"
      @blur="handleBlur"
      @click="toggle"
      @keyup.space="toggle"
      @keyup.up="moveUp"
      @keyup.down="moveDown"
      @keyup.enter="selectFromKeyboard"
    >
      <span class="c-vueSelect__value">{{ selectedOption }}</span>
      <ul
        :id="'lbox_' + _uid"
        :class="[
          'c-vueSelect__optionlist',
          isOpen ? '' : 'c-vueSelect__optionlist--close',
        ]"
        role="listbox"
      >
        <li
          v-for="(option, index) in optionGroup"
          :key="index"
          :aria-selected="[
            option === selectedOption ? 'true' : 'false',
          ]"
          :class="[
            'c-vueSelect__option',
            option === selectedOption
              ? 'c-vueSelect__option--selected'
              : '',
            hoverIndex === index ? 'c-vueSelect__optionlist--hover' : '',
          ]"
          role="option"
          @click="select(option)"
          >{{ option ? titleCase(option) : 'nah' }}</li
        >
      </ul>
    </div>
  </div>
</template>

<style lang="scss">
@import '@design';

.c-productVariantSelector {
  width: 100%;
  text-align: left;
  margin-right: 10px;

  &:last-of-type {
    margin-right: 0;
  }
}

.c-productVariantSelector__label {
}

.c-productVariantSelector__selector {
  width: 100%;
}

.c-vueSelect__dropdown {
  font-size: 16px;
  outline: none;
  position: relative;
  text-align: left;
  width: 100%;
  cursor: pointer;
}
.c-vueSelect__dropdown--close {
  &::after {
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid $color-border-dark;
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
    border-bottom: 6px solid $color-border-dark;
    border-left: 6px solid transparent;
  }
}
.c-vueSelect__value {
  display: block;
  height: 45px;
  padding: 10px 16px;
  border: 1px solid $color-border-dark;
  border-radius: 5px;
  outline: none;
  &:focus {
    border-color: $color-primary;
  }

  .c-formGroup--focused &,
  .c-formGroup--hasValue & {
    padding: 22px 13px 0px;
    font-size: 14px;
  }
}
.c-vueSelect__optionlist {
  position: absolute;
  background-color: $color-white;
  border: 1px solid $color-border-dark;
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
