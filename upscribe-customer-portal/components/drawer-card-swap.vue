<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'

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

    ...mapState('cards', ['cards', 'newSwapCard']),

    ...mapGetters('cards', ['activeCard']),

    ...mapGetters('activeSubscription', ['activeTotalPrice']),

    ...mapState('editMode', ['editNextOrder']),
  },
  methods: {
    ...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),

    ...mapMutations('cards', ['setActiveEditCard', 'setNewSwapCard']),

    ...mapActions('subscriptions', [
      'UPDATE_SUBSCRIPTION',
      'UPDATE_NEXT_ORDER',
    ]),

    async swapCards() {
      const { newSwapCard, editNextOrder, activeCard } = this

      const updatePayload = {
        requestPayload: {
          payment_method_id: newSwapCard.id,
        },
      }

      let updateAction
      let analyticsEventName
      let analyticsPayload = { oldCard: activeCard }
      if (editNextOrder) {
        updateAction = this.UPDATE_NEXT_ORDER(updatePayload)

        analyticsEventName = 'Upscribe Next Order Payment Swap'
      }

      // determine if updating both of just one
      else {
        updateAction = this.UPDATE_SUBSCRIPTION(updatePayload)
        analyticsEventName = 'Upscribe Subscription Payment Swap'
      }

      try {
        this.$emit('setDrawerStatus', 'PENDING')
        await updateAction

        const newCard = this.activeCard

        this.triggerAnalyticsEvent({
          event: analyticsEventName,
          payload: {
            ...analyticsPayload,
            newCard,
          },
        })

        this.$emit('setDrawerStatus', 'SUCCESS')

        this.setNewSwapCard(null)
        this.$emit('setMode', 'default')
      } catch (e) {
        console.log('subscription/UPDATE_SUBSCRIPTION error: ', e)
        this.$emit('setDrawerStatus', { state: 'FAILURE', message: e.message })
      }
    },
  },
}
</script>

<template>
  <div class="c-drawerCards c-drawer">
    <h2 class="c-drawer__title">{{ atc['portal.swapPaymentMethodsDrawerTitle'] || 'Payment Methods' }}</h2>

    <div>
      <p v-if="activeCard" class="c-drawer__subtitle" style="margin-top:20px;">{{ atc['portal.swapCurrentCardLabel'] || 'Current Card' }}</p>
      <div v-if="activeCard" class="c-drawerCardSwap">
        <card-item
          :key="activeCard ? activeCard.id : 'swap'"
          :card="activeCard || {}"
          class="c-drawerCardSwap__item"
          no-edit
        />
      </div>

      <p class="c-drawer__subtitle" style="margin-top:20px;">{{ atc['portal.swapSelectNewCardLavel'] || 'New Card' }}</p>
      <div class="c-drawerCardList">
        <card-item
          :key="newSwapCard.id"
          :card="newSwapCard"
          class="c-drawerSwapList__item"
          no-edit
        />
      </div>

      <p class="c-drawer__subtitle" style="margin-top:20px;"
        >{{ atc['portal.swapPaymentMethodNote'] || 'Recurring subscription will move from current to new card.' }}</p
      >

      <v-button class="c-form__submitButton" @onClick="swapCards"
        >{{ atc['portal.moveToNewCardButton'] || 'Move to New Card' }}</v-button
      >

      <v-button
        class="c-drawerCardSwap__cancelButton"
        type="link"
        @onClick="$emit('setMode', 'default')"
        >{{ atc['buttons.cancel'] || 'Cancel' }}</v-button
      >
    </div>
  </div>
</template>

<style lang="scss">
@import '@design';

.c-drawerCardSwap {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  background-color: $color-light;
}

.c-drawerCardSwap__cancelButton {
  margin-top: 20px;
}
</style>
