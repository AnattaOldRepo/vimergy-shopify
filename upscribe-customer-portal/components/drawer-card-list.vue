<script>
import { mapState, mapGetters, mapMutations } from 'vuex'

import VButton from '@components/v-button.vue'
import CardItem from '@components/card-item.vue'

export default {
  components: {
    VButton,
    CardItem,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  data: () => {
    return {
      drawerStatus: null,
    }
  },
  computed: {
    ...mapState('translations', ['atc']),

    ...mapState('cards', ['cards']),

    ...mapGetters('cards', ['activeCard']),
  },
  methods: {
    ...mapMutations('cards', ['setActiveEditCard', 'setNewSwapCard']),

    handleEditPaymentMethod(paymentMethod) {
      this.setActiveEditCard(paymentMethod)
      this.$emit('setMode', 'edit')
    },

    handleRemovePaymentMethod(paymentMethod) {
      this.setActiveEditCard(paymentMethod)
      this.$emit('setMode', 'remove')
    },

    handleSelectCard(paymentMethod) {
      // ignore if same card
      if (this.activeCard && this.activeCard.id) {
        if (this.activeCard && paymentMethod.id === this.activeCard.id) return
      }
      this.setNewSwapCard(paymentMethod)
      this.$emit('setMode', 'swap')
    },
  },
}
</script>

<template>
  <div class="c-drawerCards c-drawer">
    <h2 class="c-drawer__title">{{
      atc['portal.paymentMethodsDrawerTitle'] || 'Payment Methods'
    }}</h2>

    <p class="c-drawer__subtitle">{{
      atc['portal.paymentMethodsDrawerPrompt'] ||
        'Add new or select existing payment method to transfer subscription billing to that payment method.'
    }}</p>

    <div class="c-drawer__inner">
      <div class="c-drawerCardList">
        <card-item
          v-for="card in cards"
          :key="card.id"
          :card="card"
          :is-selected="activeCard && card.id === activeCard.id"
          class="c-drawerCardList__item"
          @editPaymentMethod="handleEditPaymentMethod(card)"
          @removePaymentMethod="handleRemovePaymentMethod(card)"
          @selectCard="handleSelectCard(card)"
        />
      </div>

      <div class="c-drawerCard__button-bottom">
        <v-button
          class="c-form__submitButton"
          @onClick="$emit('setMode', 'add')"
          >{{ atc['buttons.addCard'] || 'Add New Payment Method' }}</v-button
        >
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import '@design';

.c-drawer__title {
  @include bp(mobile-large-max) {
    display: none;
  }
}

.c-drawerCardList {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  background-color: $color-light;
}

.c-drawerCardList__item {
  cursor: pointer;
  width: 100%;
  .c-cardItem__inner {
    transition: all 0.2s ease;

    &:hover {
      border-color: $color-primary;
    }
  }
}
</style>
