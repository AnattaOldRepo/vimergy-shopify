<script>
import { mapActions, mapState } from 'vuex'

import CardForm from '@components/card-form.vue'
import CardItem from '@components/card-item.vue'
import VButton from '@components/v-button.vue'

export default {
  components: {
    CardForm,
    CardItem,
    VButton,
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
      cardName: null,
      cardMonth: null,
      cardYear: null,
    }
  },
  computed: {
    ...mapState('translations', ['atc']),

    ...mapState('cards', ['activeEditCard']),

    ...mapState('editMode', ['editNextOrder']),
  },
  mounted() {
    console.log('this', this)
  },
  methods: {
    ...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),

    ...mapActions('cards', ['UPDATE_PAYMENT_METHOD']),

    ...mapActions('subscriptions', ['UPDATE_NEXT_ORDER']),

    async updatePaymentMethod({ cardName, cardMonth, cardYear, cardZipcode }) {
      const { activeEditCard, editNextOrder } = this

      const paymentMethodId = activeEditCard.id
      const updatePayload = {}
      if (cardName) updatePayload.name = cardName
      if (cardMonth) updatePayload.exp_month = cardMonth
      if (cardYear) updatePayload.exp_year = cardYear
      if (cardZipcode) updatePayload.zipcode = cardZipcode

      let updateAction

      let analyticsEventName
      let analyticsPayload = {
        card: { cardName, cardMonth, cardYear, cardZipcode },
      }

      if (editNextOrder) {
        analyticsEventName = 'Upscribe Next Order Payment Update'

        updateAction = (async () => {
          await this.UPDATE_NEXT_ORDER({
            requestPayload: {
              payment_method_id: paymentMethodId,
            },
          })
          await this.UPDATE_PAYMENT_METHOD({ updatePayload, paymentMethodId })
        })()
      }

      // determine if updating both of just one
      else {
        analyticsEventName = 'Upscribe Subscription Payment Update'

        updateAction = (async () => {
          await this.UPDATE_NEXT_ORDER({
            requestPayload: {
              payment_method_id: paymentMethodId,
            },
          })
          await this.UPDATE_PAYMENT_METHOD({ updatePayload, paymentMethodId })
        })()
      }

      try {
        this.$emit('setDrawerStatus', 'PENDING')
        await updateAction
        this.$emit('setDrawerStatus', 'SUCCESS')

        const updateCard = this.activeEditCard

        console.log('updateCard', updateCard)

        this.triggerAnalyticsEvent({
          event: analyticsEventName,
          payload: {
            ...analyticsPayload,
            card: updateCard,
          },
        })
      } catch (e) {
        console.log('card/UPDATE_PAYMENT_METHOD error: message', e.message)

  			this.$emit('setDrawerStatus', { state: 'FAILURE', message: e.message.message ? e.message.message : e.message})
      }
    },

    showRemoveCardPrompt() {
      this.$emit('setMode', 'remove')
    },
  },
}
</script>

<template>
  <!-- <drawer-wrap :show="show" :status="drawerStatus" @close="$emit('close')"> -->
  <div v-if="activeEditCard" class="c-drawer c-drawerEditCard">
    <div class="c-drawer__inner">
      <h2 class="c-drawer__title">{{ atc['portal.editCardDrawerTitle'] || 'Edit Card' }}</h2>

      <card-item no-edit :card="activeEditCard" />

      <card-form
        class="c-formBlock c-cardForm"
        :form-submit-button-text="atc['buttons.updateCard'] || 'Update Card'"
        form-name="update-card"
        update-card
        @onSubmit="updatePaymentMethod"
      />

      <v-button
        class="c-cardCancelButton"
        type="link"
        @onClick="showRemoveCardPrompt"
        >{{ atc['buttons.removeCard'] || 'Remove Card' }}</v-button
      >
    </div>
  </div>
</template>

<style lang="scss">
@import '@design';
.c-cardCancelButton {
  margin-top: 20px;
}
</style>
