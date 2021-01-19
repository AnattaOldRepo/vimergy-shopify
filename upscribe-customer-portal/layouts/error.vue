<template>
  <section class="c-errorOne">
    <svg
      class="c-errorOne__icon"
      width="40px"
      height="40px"
      viewBox="0 0 40 40"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
    >
      <defs>
        <path
          id="error-path-1"
          d="M24.0005,44.0005 C23.4885,44.0005 22.9765,43.8045 22.5865,43.4145 L4.5865,25.4145 C3.8045,24.6325 3.8045,23.3685 4.5865,22.5865 L22.5865,4.5865 C23.3685,3.8045 24.6325,3.8045 25.4145,4.5865 L43.4145,22.5865 C44.1965,23.3665 44.1965,24.6325 43.4145,25.4145 L25.4145,43.4145 C25.0245,43.8065 24.5125,44.0005 24.0005,44.0005 Z M8.8285,24.0005 L24.0005,8.8305 L39.1725,24.0005 L24.0005,39.1725 L8.8285,24.0005 Z M22.0005,16.0005 L22.0005,28.0005 L26.0005,28.0005 L26.0005,16.0005 L22.0005,16.0005 Z M24.0005,34.5005 C25.3812119,34.5005 26.5005,33.3812119 26.5005,32.0005 C26.5005,30.6197881 25.3812119,29.5005 24.0005,29.5005 C22.6197881,29.5005 21.5005,30.6197881 21.5005,32.0005 C21.5005,33.3812119 22.6197881,34.5005 24.0005,34.5005 Z"
        ></path>
      </defs>
      <g
        id="Modules"
        stroke="none"
        stroke-width="1"
        fill="none"
        fill-rule="evenodd"
      >
        <g id="ERROR-1" transform="translate(-700.000000, -113.000000)">
          <g id="Icon/Error" transform="translate(696.000000, 109.000000)">
            <rect id="Bounding-Box" x="0" y="0" width="48" height="48"></rect>
            <mask id="error-mask-2" fill="white">
              <use xlink:href="#error-path-1"></use>
            </mask>
            <g id="Mask"></g>
            <g
              id="Mixin/Fill/Active"
              mask="url(#error-mask-2)"
              fill="#EE2E2D"
              fill-rule="evenodd"
            >
              <rect id="Box" x="0" y="0" width="48" height="48"></rect>
            </g>
          </g>
        </g>
      </g>
    </svg>

    <h1 v-if="shopData && shopData.name">{{ shopData.name }}</h1>

    <!-- eslint-disable-next-line vue/no-v-html -->
    <p v-if="error.message" class="c-errorOne__text" v-html="error.message"/>
    <p v-else class="c-errorOne__text"
      >Error loading account portal. Please login and try again.</p
    >
  </section>
</template>

<script>
import { mapState } from 'vuex'
export default {
  props: {
    error: {
      type: Object,
      default: () => {},
    },
  },

  computed: {
    ...mapState('shop', ['shopData']),
  },
}
</script>

<style lang="scss">
.c-errorOne {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 0 20px 100px;
}

.c-errorOne__icon {
  margin-bottom: 20px;
}

.c-errorOne__text {
  text-align: center;
  text-decoration: none;
}
</style>
