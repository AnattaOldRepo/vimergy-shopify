<script>

import ProductVariantSelectorOptions from '@components/product-variant-selector-options'

export default {
  components: {
    ProductVariantSelectorOptions,
  },

  props: {
    product: {
      type: Object,
      required: true,
    },
    selectedVariant: {
      type: Object,
      required: true,
    },
    variantsObj: {
      type: Object,
      required: true,
    },
    editNextOrder: {
      type: Boolean,
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

  computed: {
    optionOneValue() {
      return this.selectedVariant.option1
    },
    optionTwoValue() {
      return this.selectedVariant.option2
    },
    optionThreeValue() {
      return this.selectedVariant.option3
    },
    optionOneOptions() {
      const { product, variantsObj } = this
      const initialOptions = product.options[0]
      if (!initialOptions) return false

      return this.buildOptionOptions(product, variantsObj, initialOptions)
    },

    optionTwoOptions() {
      const { product, variantsObj } = this
      const initialOptions = product.options[1]
      if (!initialOptions) return false

      return this.buildOptionOptions(product, variantsObj, initialOptions)
    },

    optionThreeOptions() {
      const { product, variantsObj } = this
      const initialOptions = product.options[2]
      if (!initialOptions) return false

      return this.buildOptionOptions(product, variantsObj, initialOptions)
    },
  },

  methods: {
    buildOptionOptions(product, variantsObj, initialOptions) {
      let final = []

      Object.keys(variantsObj).forEach(key => {
        let variant = variantsObj[key]
        if (!final.includes(variant[`option${initialOptions.position}`])) {
          final.unshift(variant[`option${initialOptions.position}`])
        }
      })

      return final
    },
    toggle() {
      this.isOpen = !this.isOpen
      this.hoverIndex = this.selectedindex
    },
    select({value, position}) {
      this.$emit('selectOption', {
        value,
        position,
      })
    },
  },
}
</script>

<template>
<div v-if="product && variantsObj && selectedVariant" class="c-productVariantSelectorWrapper"
  :class="{
    'c-productVariantSelectorWrapper--two': optionOneOptions && optionTwoOptions && !optionThreeOptions,
    'c-productVariantSelectorWrapper--three': optionOneOptions && optionTwoOptions && optionThreeOptions
  }"
>

  <product-variant-selector-options
    v-if="optionOneOptions"
    :option-group="optionOneOptions"
    :selected-option="optionOneValue"
    :options-name="product.options[0].name"
    :option-position="1"
    @select="select"
  />

  <product-variant-selector-options
    v-if="optionTwoOptions"
    :option-group="optionTwoOptions"
    :selected-option="optionTwoValue"
    :options-name="product.options[1].name"
    :option-position="2"
    @select="select"
  />

  <product-variant-selector-options
    v-if="optionThreeOptions"
    :option-group="optionThreeOptions"
    :selected-option="optionThreeValue"
    :options-name="product.options[2].name"
    :option-position="3"
    @select="select"
  />
</div>
</template>

<style lang="scss">
@import '@design';

.c-productVariantSelectorWrapper {
  display: grid;
  grid-template-columns: 1fr;
  width: 100%;

  &--two {
    grid-row-gap: 20px;
  }

  &--three {
    grid-template-columns: 1fr;
  }
}

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
