<template>
  <a
    v-if="internalLink"
    class="c-functionalButtonBlock"
    :class="{'c-functionalButtonBlock--hasMessage': $slots['top']}"
    :to="internalLink"
    @click="scrollToTop"
  >
    <slot class="c-functionalButtonBlock__top" name="top"></slot>

    <div class="c-functionalButtonBlock--left">
      <slot name="icon"></slot>

      <!-- eslint-disable vue/no-v-html -->
      <span class="c-functionalButtonBlock__title">
        {{ title }}
        <span
          v-if="secondText"
          class="c-functionalButtonBlock__secondText"
          v-html="secondText"
        >
        </span>
      </span>
    </div>

    <div v-if="!noArrowIcon" class="c-functionalButtonBlock--right">
      <angle-right />
    </div>
  </a>

  <!-- Display block Only -->

  <div
    v-else-if="displayOnly"
    class="c-functionalButtonBlock__contain marginBottomBlock"
  >
    <h2 class="c-functionalButtonBlock__header">{{ header }}</h2>
    <div class="c-functionalButtonBlock">
      <div class="c-functionalButtonBlock--left">
        <slot name="icon"></slot>

        <span
          v-if="secondText"
          class="c-functionalButtonBlock__secondText"
          v-html="secondText"
        >
        </span>
      </div>
    </div>
  </div>

  <!-- Normal Button -->

  <v-button v-else class="c-functionalButtonBlock" @onClick="buttonFunc">
    <div class="c-functionalButtonBlock--left">
      <slot name="icon"></slot>

      <span class="c-functionalButtonBlock__title">
        {{ title }}
        <span
          v-if="secondText"
          class="c-functionalButtonBlock__secondText"
          v-html="secondText"
        >
        </span>
      </span>
    </div>

    <div v-if="!noArrowIcon" class="c-functionalButtonBlock--right">
      <angle-right />
    </div>
  </v-button>
</template>

<script>
import AngleRight from '@components/Icon/angle-right'
import VButton from '@components/v-button'
export default {
  components: {
    AngleRight,
    VButton,
  },

  props: {
    // For Link
    isInternalLink: {
      type: Boolean,
      default: false,
    },
    internalLink: {
      type: Object,
      default: () => {},
    },
    // For Button
    buttonFunc: {
      type: Function,
      default: () => {},
    },
    header: {
      type: String,
      default: '',
    },
    // Default
    displayOnly: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '',
    },
    secondText: {
      type: [String, Boolean],
      default: false,
    },
    noArrowIcon: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    scrollToTop() {
      document.documentElement.scrollTop = 0
      this.$router.push(this.internalLink)
    },
  },
}
</script>

<style lang="scss">
@import '@design';
.c-functionalButtonBlock__contain {
  max-width: 400px;
}

.c-functionalButtonBlock {
  position: relative;
  padding: 17px 26px 17px 15px;
  max-width: 400px;
  background-color: $color-white;
  text-decoration: none;
  border: 1px solid $color-blue-light-border;
  color: $color-black;
  display: flex;
  justify-content: space-between;

  &:hover,
  &:focus {
    background-color: $color-white;
  }

  &--hasMessage {
    padding-top: 40px;
  }
}

.c-functionalButtonBlock__title,
.c-functionalButtonBlock__secondText {
  font-size: 16px;
  line-height: 21px;
  text-transform: capitalize;
  font-weight: 500;
}

.c-functionalButtonBlock__secondText {
  color: #888888;
}

.c-functionalButtonBlock--left {
  display: flex;
  align-items: center;
  width: 100%;
}

.c-functionalButtonBlock--right {
  display: flex;
  justify-content: center;
  align-items: center;
}

.c-functionalButtonBlock__icon {
  margin-right: 12px;
}

.c-functionalButtonBlock__small-text {
  font-size: 12px;
  line-height: 16px;
}

.c-functionalButtonBlock__header {
  margin-bottom: 8px;
  font-style: normal;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: $color-blue-secondary;
  font-size: 13px;
  line-height: 16px;
}

.marginBottomBlock {
  margin-bottom: 24px;
}
</style>
