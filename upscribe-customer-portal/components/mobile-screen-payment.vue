<template>
  <div class="c-addressPayment__formattedComponent">
    <portal to="header">
      <the-header
        middle-html="Payment Method"
        mode="customized"
        :customized-func-text="!isRemovingCard ? 'Edit' : 'Cancel'"
        @headerAction="handleRemoveCard"
      />
    </portal>

    <card-item
        v-for="card in cards"
        :key="card.id"
        :card="card"
        :is-selected="activeCard && card.id === activeCard.id"
        class="c-drawerCardList__item"
        previous-middle-text="Address & Payment"
        :is-editing-card="isRemovingCard"
        @selectCard="handleSelectCard(card)"
    />

    <functional-button-block
      :internal-link="{
        query: {
          template: 'edit-add-card',
          storeDomain,
          customerId,
        },
      }"
      title="Add Payment Methods"
    >
      <span slot="icon" class="c-functionalButtonBlock__icon">
        <plus-icon fill="#A3B5BF"/>
      </span>
    </functional-button-block>
  </div>
</template>

<script>
import CardItem from '@components/card-item.vue'
import PlusIcon from '@components/Icon/plus-icon'
import FunctionalButtonBlock from '@components/functional-button-block.vue'
import { mapState, mapMutations, mapGetters, mapActions } from 'vuex'
import TheHeader from '@components/the-header'

export default {
  components: {
    CardItem,
    PlusIcon,
    FunctionalButtonBlock,
    TheHeader,
  },

  data(){
    return{
      isEditingCard: false,
      isRemovingCard: false,
    }
  },

  computed: {
    ...mapState('cards', ['cards', 'newSwapCard']),

    ...mapState('route', ['storeDomain', 'customerId']),

    ...mapGetters('cards', ['activeCard']),
  },

  methods: {
    ...mapMutations('mobileGlobalManagement', ['setMessage', 'setStatus']),

    ...mapMutations('cards', ['setActiveEditCard', 'setNewSwapCard']),

    ...mapActions('subscriptions', [
      'UPDATE_SUBSCRIPTION',
      'UPDATE_NEXT_ORDER',
    ]),

    ...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),

    ...mapActions('cards', ['REMOVE_PAYMENT_METHOD']),

    handleRemoveCard(){
      this.isRemovingCard = !this.isRemovingCard
    },


    handleSelectCard(card) {
      if (card.id === this.activeCard.id) return
      if(this.isRemovingCard){
        this.removePaymentMethod(card.id)
      } else {
        this.setNewSwapCard(card)
        this.swapCards()
      }
    },

    async removePaymentMethod(id) {
      const paymentMethodId = id
      let analyticsEventName = 'Upscribe Remove Card'
      let analyticsPayload = {
        card: this.activeEditCard,
      }
      this.setMessage('Removing the Payment Method')
      this.setStatus('updating')

      try {
        await this.REMOVE_PAYMENT_METHOD(paymentMethodId)

        this.triggerAnalyticsEvent({
          event: analyticsEventName,
          payload: analyticsPayload,
        })
        this.setMessage('Removed the Payment Method successfully')
        this.setStatus('success')
      } catch (e) {
        console.log('card/REMOVE_PAYMENT_METHOD error: ', e)
        this.setMessage(e.message)
        this.setStatus('error')
      }
    },

    async swapCards() {
      const { newSwapCard, editNextOrder, activeCard } = this
      this.setMessage('Updating new Payment Method')
      this.setStatus('updating')
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
        updateAction = (async () => {
          await this.UPDATE_NEXT_ORDER(updatePayload)
          await this.UPDATE_SUBSCRIPTION(updatePayload)
        })()

        analyticsEventName = 'Upscribe Subscription Payment Swap'
      }

      try {
        await updateAction

        const newCard = this.activeCard

        this.triggerAnalyticsEvent({
          event: analyticsEventName,
          payload: {
            ...analyticsPayload,
            newCard,
          },
        })
        this.setMessage('Saved new Payment Method')
        this.setStatus('success')
        this.setNewSwapCard(null)
      } catch (e) {
        console.log('subscription/UPDATE_SUBSCRIPTION error: ', e)
        this.setMessage(e.message)
        this.setStatus('error')
      }
    },
  },
}
</script>
