<template>
  <modal-wrap :show="show" style="z-index: 999999999" @close="$emit('close')">
    <div class="c-confirmModal__intro">
      <h2 class="c-confirmModal__introTitle">{{ title }}</h2>
      <div class="c-confirmModal__buttonBox">
        <v-button :text="confirmButton || atc['buttons.confirm'] || 'Confirm'" size="small" auto @onClick="confirm" />

        <v-button
          type="alt"
          :text="denyButton"
          size="small"
          auto
          @onClick="deny"
        />
      </div>
    </div>
  </modal-wrap>
</template>

<script>
// import { mapMutations } from 'vuex'
import ModalWrap from '@components/modal-wrap.vue'
import VButton from '@components/v-button.vue'

export default {
  components: {
    ModalWrap,
    VButton,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    confirmButton: {
      type: [String, Boolean],
      default: false, // use translation
    },
    denyButton: {
      type: [String, Boolean],
      default: false,
    },
    title: {
      type: [String, Boolean],
      default: false,
    },
  },
  data: () => ({
    resolve: null,
    reject: null,
  }),
  mounted() {
    this.open()
  },
  methods: {
    open() {
      return new Promise((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject
      })
    },
    confirm() {
      this.resolve(true)
      this.$emit('close')
    },
    deny() {
      this.resolve(false)
      this.$emit('close')
    },
  },
}
</script>

<style lang="scss">
@import '@design';

.c-confirmModal__buttonBox {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  max-width: 630px;
  width: 100%;

  @include bp(tablet) {
    flex-direction: row;
  }

  .c-button {
    max-width: 240px;
    margin-bottom: 12px;

    @include bp(tablet) {
      max-width: none;
      margin-right: 26px;
      margin-bottom: 0;

      &:last-of-type {
        margin-right: 0;
      }
    }
  }
}

.c-confirmModal__intro {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.c-confirmModal__introTitle {
  margin-bottom: 20px;
  font-size: 18px;
  text-align: center;
}

.c-confirmModal {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 1440px;
  padding: 4px;
  margin: 0 auto;
  overflow: scroll;
  text-align: center;
}

.c-confirmModal__head {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 30px;

  @media (min-width: 500px) {
    flex-direction: row;
    margin: 0;
  }
}

.c-confirmModal__infoBlock {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.c-confirmModal__title {
  font-size: 24px;
}

.c-confirmModal__subtitle {
  font-size: 18px;
}

.c-confirmModal__supportLink {
  font-size: 18px;
  text-decoration: none;
}
</style>
