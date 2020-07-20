<script>
import { mapState } from 'vuex'
import TrashIcon from '@components/Icon/trash-icon'

export default {
  components: {
    TrashIcon,
  },

  props: {
    discountAmount: {
      type: [String, Boolean],
      required: true,
    },
    discountCode: {
      type: [String, Boolean],
      required: true,
    },
  },

  computed: {
    ...mapState('translations', ['atc']),

    ...mapState('shop', ['currencySymbol']),

    discountText() {
      // if discount show discount
      const { discountAmount, currencySymbol, atc } = this

      if (discountAmount) {
        return `${atc['portal.discountAmountSavedLabel'] || 'Amount Saved'}: (-${currencySymbol}${discountAmount})`
      } else {
        return atc['portal.addDiscountButton'] || 'Add Discount'
      }
    },
  },
  methods: {
    removeDiscount() {
      this.$emit('removeDiscount')
    },
  },
}
</script>

<template>
  <div
    v-if="discountAmount && discountText"
    class="c-discountItem"
  >
    <div class="c-discountItem__inner" @click="$emit('selectCard')">
      <div class="c-discountItem__info">
        <strong v-if="discountCode" class="c-discountItem__name"
          >{{ atc['labels.activeDiscount'] || 'Active Discount' }}: {{ discountCode }}</strong
        >
        <span v-if="discountText" class="c-discountItem__numbers">{{
          discountText
        }}</span>
      </div>
      <!-- eslint-disable -->
      <!-- <div class="c-discountItem__cardIcon" v-if="cardSvg" v-html="cardSvg"></div> -->
      <!-- eslint-enable -->
      <div class="c-discountItem__option-block">
        <div class="c-discountItem__remove" @click="removeDiscount">
          <trash-icon />
          <!-- <span v-else class="c-discountItem__editText">{{ atc['actions.removeActionText'] }}</span> -->
        </div>

        <div class="c-option__select c-option__select--picked">
            <span class="c-option__inner"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import '@design';

.c-discountItem {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 20px;
}

.c-discountItem__remove {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  padding: 0 10px 0 20px;
  cursor: pointer;

  &:hover {
    .c-discountItem__removeIcon {
      fill: $color-text;
    }
    .c-discountItem__removeText {
      color: $color-text;
    }
  }
}

.c-discountItem__editIcon {
  width: 20px;
  height: 20px;
  margin-bottom: 7px;
  fill: $color-text-light;
  transition: all 0.2s ease;
}

.c-discountItem__editText {
  display: block;
  font-size: 11px;
  color: $color-text-light;
  text-align: center;
  transition: all 0.2s ease;
}

.c-discountItem__inner {
  display: flex;
  position: relative;
  width: 100%;
  padding: 20px 18px;
  font-size: 14px;
  color: $color-text;
  background-color: $color-white;
  border: 2px solid transparent;
  justify-content: space-between;

  .c-discountItem--selected & {
    border-color: $color-primary;
  }
}

.c-discountItem__info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
}

.c-discountItem__name {
  display: block;
  margin-bottom: 4px;
  font-size: 16px;
  line-height: 21px;
  font-weight: 500;
  color: $color-black;
}

.c-discountItem__numbers {
  display: block;
  color: $color-blue-secondary;
}

.c-discountItem__cardIcon {
  position: absolute;
  top: 50%;
  right: 30px;
  transform: translateY(-50%);

  svg {
    width: 30px;
  }
}

.c-discountItem__option-block{
  display: flex;
  align-items: center;
}
</style>
