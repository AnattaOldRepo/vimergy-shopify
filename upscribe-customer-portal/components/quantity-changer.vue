<script>
export default {
  props: {
    quantity: {
      type: Number,
      required: true,
    },
  },
}
</script>

<template>
  <div class="c-quantityChanger__quantityBox">
    <a
      href="#"
      class="c-quantityChanger__quantityControl"
      @click.prevent="$emit('decreaseQuantity')"
    >
      <svg
        v-if = "quantity > 1"
        id="Capa_1"
        class = "smooth-transition"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        x="0px"
        y="0px"
        viewBox="0 0 491.858 491.858"
        xml:space="preserve"
      >
        <g>
          <g>
            <path
              d="M465.167,211.613H240.21H26.69c-8.424,0-26.69,11.439-26.69,34.316s18.267,34.316,26.69,34.316h213.52h224.959 c8.421,0,26.689-11.439,26.689-34.316S473.59,211.613,465.167,211.613z"
            ></path>
          </g>
        </g>
      </svg>

      <svg v-else class = "trash-icon smooth-transition" width="14"  height="16" view-box="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 2.5H10.9062L9.84375 0.75C9.59375 0.34375 9.03125 0 8.5625 0H5.40625C4.9375 0 4.375 0.34375 4.125 0.75L3.0625 2.5H0.5C0.21875 2.5 0 2.75 0 3V3.5C0 3.78125 0.21875 4 0.5 4H1L1.65625 14.5938C1.6875 15.375 2.375 16 3.15625 16H10.8125C11.5938 16 12.2812 15.375 12.3125 14.5938L13 4H13.5C13.75 4 14 3.78125 14 3.5V3C14 2.75 13.75 2.5 13.5 2.5ZM5.40625 1.5H8.5625L9.15625 2.5H4.8125L5.40625 1.5ZM10.8125 14.5H3.15625L2.5 4H11.4688L10.8125 14.5Z" fill="#FF7777"/></svg>
    </a>

    <span class="c-quantityChanger__quantity">{{ quantity }}</span>

    <a
      href=""
      class="c-quantityChanger__quantityControl"
      @click.prevent="$emit('increaseQuantity')"
    >
      <svg
        id="Capa_1"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        x="0px"
        y="0px"
        viewBox="0 0 491.86 491.86"
        xml:space="preserve"
      >
        <g>
          <g>
            <path
              d="M465.167,211.614H280.245V26.691c0-8.424-11.439-26.69-34.316-26.69s-34.316,18.267-34.316,26.69v184.924H26.69
      C18.267,211.614,0,223.053,0,245.929s18.267,34.316,26.69,34.316h184.924v184.924c0,8.422,11.438,26.69,34.316,26.69
      s34.316-18.268,34.316-26.69V280.245H465.17c8.422,0,26.69-11.438,26.69-34.316S473.59,211.614,465.167,211.614z"
            ></path>
          </g>
        </g>
      </svg>
    </a>
  </div>
</template>

<style lang="scss">
@import '@design';

.c-quantityChanger__quantityBox {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  border: 1px solid $color-blue-light-border;
  border-radius: 4px;
}

.c-quantityChanger__quantityControl {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 14px;
  color: $color-black;
  font-weight: bold;
  cursor: pointer;

  svg {
    width: 12px;
    height: 12px;
    fill: $color-black;
    stroke: $color-black;
  }

  .trash-icon{
    width: 14px;
    height: 16px;
    fill: #FF7777;
    stroke: #FF7777;
  }
}

.c-quantityChanger__quantity {
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: $font-primary-regular;
  font-size: 16px;
  color: $color-black;
  font-weight: bold;
}

.smooth-transition{
  transition: all 0.5s linear;
}
</style>
