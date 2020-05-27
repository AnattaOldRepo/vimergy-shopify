<script>
export default {
  props: {
    text: {
      type: [String, Boolean],
      default: false,
    },
    height: {
      type: [String, Boolean],
      default: false,
    },
    width: {
      type: [String, Boolean],
      default: false,
    },
    minHeight: {
      type: [String, Boolean],
      default: false,
    },
    minWidth: {
      type: [String, Boolean],
      default: false,
    },
  },
  computed: {
    style() {
      const { height, minHeight, width, minWidth } = this
      let style = {}

      if (width) { style.width = width }
      if (minWidth) { style.minWidth = minWidth }
      if (height) { style.height = height }
      if (minHeight) { style.minHeight = minHeight }


      return style
    },
  },
}
</script>

<template>
  <div class="c-loadingScreen" :style="style" :class="{'c-loadingScreen--withText': text}">
    <p v-if="text" class="c-loadingScreen__text">{{ text }}</p>
    <div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
  </div>
</template>

<style lang="scss">
@import '@design';
.c-loadingScreen {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;

  &--withText {
    flex-direction: column;
  }
}

.c-loadingScreen__text {
  font-size: 20px;
  line-height: 1.5;
  text-align: center;
  padding: 20px;
  max-width: 400px;
  font-family: $font-primary-regular;
  margin-bottom: 30px;
}

.lds-spinner {
  color: $color-black;
  display: inline-block;
  position: relative;
  width: 40px;
  height: 40px;
}
.lds-spinner div {
transform-origin: 40px 40px;
  animation: lds-spinner 1.2s linear infinite;
}
.lds-spinner div:after {
  content: " ";
  display: block;
  position: absolute;
  top: 3px;
  left: 37px;
  width: 6px;
  height: 18px;
  border-radius: 5px;
  background: $color-black;
}
.lds-spinner div:nth-child(1) {
  transform: rotate(0deg) translateX(1px);
  animation-delay: -1.1s;
  &:after {
    width: 5px;
  }
}
.lds-spinner div:nth-child(2) {
  transform: rotate(30deg);
  animation-delay: -1s;
}
.lds-spinner div:nth-child(3) {
  transform: rotate(60deg);
  animation-delay: -0.9s;
}
.lds-spinner div:nth-child(4) {
  transform: rotate(90deg);
  animation-delay: -0.8s;
}
.lds-spinner div:nth-child(5) {
  transform: rotate(120deg);
  animation-delay: -0.7s;
}
.lds-spinner div:nth-child(6) {
  transform: rotate(150deg);
  animation-delay: -0.6s;
}
.lds-spinner div:nth-child(7) {
  transform: rotate(180deg);
  animation-delay: -0.5s;
}
.lds-spinner div:nth-child(8) {
  transform: rotate(210deg);
  animation-delay: -0.4s;
}
.lds-spinner div:nth-child(9) {
  transform: rotate(240deg);
  animation-delay: -0.3s;
}
.lds-spinner div:nth-child(10) {
  transform: rotate(270deg);
  animation-delay: -0.2s;
}
.lds-spinner div:nth-child(11) {
  transform: rotate(300deg);
  animation-delay: -0.1s;
}
.lds-spinner div:nth-child(12) {
  transform: rotate(330deg);
  animation-delay: 0s;
}
@keyframes lds-spinner {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
