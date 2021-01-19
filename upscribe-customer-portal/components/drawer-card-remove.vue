<script>
import { mapActions, mapState } from 'vuex'

import VButton from '@components/v-button.vue'
import CardItem from '@components/card-item.vue'
import { windowSizes } from '@mixins/windowSizes'

export default {
  components: {
    VButton,
    CardItem,
  },
  mixins: [windowSizes],
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

    ...mapState('cards', ['activeEditCard']),
  },
  methods: {
    ...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),

    ...mapActions('cards', ['REMOVE_PAYMENT_METHOD']),

    async removePaymentMethod() {
      const paymentMethodId = this.activeEditCard.id
      const paymentType = this.activeEditCard.type
      const paymentCustomerId = this.activeEditCard.payment_customer_id

      let analyticsEventName = 'Upscribe Remove Card'

      let analyticsPayload = {
        card: this.activeEditCard,
      }

      this.$emit('setDrawerStatus', 'PENDING')
      try {
        await this.REMOVE_PAYMENT_METHOD({
          paymentMethodId,
          paymentType,
          paymentCustomerId,
        })
        this.$emit('setDrawerStatus', 'SUCCESS')
        this.$emit('setMode', 'default')

        this.triggerAnalyticsEvent({
          event: analyticsEventName,
          payload: analyticsPayload,
        })
        if (this.windowWidth < 767) {
          this.$toast.success('Removed the Payment Method successfully')
        }
      } catch (e) {
        if (this.windowWidth < 767) {
          this.$toast.error(e.message)
        }
        console.error('card/REMOVE_PAYMENT_METHOD error: ', e)
        this.$emit('setDrawerStatus', {
          state: 'FAILURE',
          message: this.formatDynamicValueErrorMessage(e.message),
        })
      }
    },
  },
}
</script>

<template>
  <div v-if="activeEditCard" class="c-drawer">
    <div class="c-drawer__inner">
      <h2 class="c-drawer__title">{{
        atc['portal.removeCardDrawerTitle'] || 'Remove Payment Method'
      }}</h2>

      <p class="c-drawer__subtitle">{{
        atc['portal.removeCardDrawerPrompt'] ||
          'Are you sure you want to remove this payment method?'
      }}</p>

      <card-item
        :card="activeEditCard"
        no-edit
        class="c-drawerCardList__item"
      />

      <v-button
        class="c-drawerCardRemove__removeButton"
        @onClick="removePaymentMethod"
        >{{ atc['buttons.removeCard'] || 'Remove Payment Method' }}</v-button
      >

      <v-button
        class="c-drawerCardRemove__cancelButton"
        type="link"
        @onClick="$emit('setMode', 'default')"
        >{{ atc['buttons.cancel'] || 'Cancel' }}</v-button
      >
    </div>
  </div>
</template>

<style lang="scss">
@import '@design';

.c-drawerCardRemove__cancelButton,
.c-drawerCardRemove__removeButton {
  margin-top: 20px;
}
</style>
