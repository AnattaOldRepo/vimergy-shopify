<template>
  <modal-wrap :show="show" @close="closeContactModal">
    <div class="c-cancelModal__intro">
      <h2 class="c-cancelModal__introTitle"
        >Please contact customer support to cancel your subscription.</h2
      >

      <a class="c-cancelModal__supportLink" :href="supportLink"
        >Contact Support Email</a
      >
    </div>
  </modal-wrap>
</template>

<script>
import ModalWrap from '@components/modal-wrap.vue'
import { mapState } from 'vuex'

export default {
  components: {
    ModalWrap,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    reason: {
      type: [Boolean, String],
      default: false,
    },
  },
  computed: {
    ...mapState('shop', ['shopData']),

    ...mapState('activeSubscription', ['activeSubscriptionId']),

    supportLink() {
      const { reason, activeSubscriptionId } = this
      let link = `mailto:${this.shopData.email}`
      if (reason) {
        link += `?body=Hello, I would like to cancel subscription order number ${activeSubscriptionId}. Reason: ${reason}.`
      }
      return link
    },
  },
  methods: {
    closeContactModal() {
      this.$emit('close')
    },
  },
}
</script>

<style lang="scss">
@import '@design';

.c-cancelModal__intro {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.c-cancelModal__introTitle {
  margin-bottom: 10px;
  font-size: 18px;
  text-align: center;
}

.c-cancelModal {
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

.c-cancelModal__head {
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

.c-cancelModal__infoBlock {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.c-cancelModal__title {
  font-size: 24px;
}

.c-cancelModal__subtitle {
  font-size: 18px;
}

.c-cancelModal__supportLink {
  font-size: 18px;
  text-decoration: none;
}
</style>
