<template>
  <div class="c-addressPayment__formattedComponent">
    <portal to="header">
      <the-header middle-html="Payment Method" mode="customized" />
    </portal>
    <div class="u-mt-3">
      <drawer-payment-method-add
        v-if="mode === 'add'"
        class="c-drawerCards c-drawer"
        :show="show"
        @setMode="handleSetMode"
      />

      <drawer-payment-method-edit
        v-if="mode === 'edit'"
        class="c-drawerCards c-drawer"
        :show="show"
        @setMode="handleSetMode"
        @removePaymentMethod="removePaymentMethod"
      />

      <drawer-card-remove
        v-if="mode === 'remove'"
        class="c-drawerCards c-drawer"
        :show="show"
        @setMode="handleSetMode"
      />

      <drawer-card-swap
        v-if="mode === 'swap'"
        class="c-drawerCards c-drawer"
        :show="show"
        @setMode="handleSetMode"
      />

      <drawer-card-list
        v-if="mode === 'default'"
        class="c-drawerCards c-drawer"
        :show="show"
        @setMode="handleSetMode"
        @removePaymentMethod="removePaymentMethod"
      />
    </div>
  </div>
</template>

<script>
// import CardItem from '@components/card-item.vue'
// import PlusIcon from '@components/Icon/plus-icon'
// import FunctionalButtonBlock from '@components/functional-button-block.vue'
import { mapState, mapMutations, mapGetters, mapActions } from 'vuex'
import TheHeader from '@components/the-header'
import DrawerCardList from '@components/drawer-card-list.vue'
import DrawerCardRemove from '@components/drawer-card-remove.vue'
import DrawerCardSwap from '@components/drawer-card-swap.vue'
import DrawerPaymentMethodAdd from '@components/drawer-payment-method-add.vue'
import DrawerPaymentMethodEdit from '@components/drawer-payment-method-edit.vue'

export default {
  components: {
    // CardItem,
    // PlusIcon,
    // FunctionalButtonBlock,
    DrawerPaymentMethodAdd,
    DrawerPaymentMethodEdit,
    TheHeader,
    DrawerCardList,
    DrawerCardRemove,
    DrawerCardSwap,
  },

  data() {
    return {
      applyToAllActiveSusbscriptions: false,
      isEditingCard: false,
      isRemovingCard: false,
      mode: 'default',
      show: true,
    }
  },

  computed: {
    ...mapState('cards', ['cards', 'newSwapCard']),

    ...mapState('route', ['storeDomain', 'customerId']),

    ...mapGetters('cards', ['activeCard']),

    ...mapGetters('subscriptions', ['subscriptionActive']),

    ...mapState('translations', ['atc']),
  },

  methods: {
    ...mapMutations('mobileGlobalManagement', ['setMessage', 'setStatus']),

    ...mapMutations('cards', ['setActiveEditCard', 'setNewSwapCard']),

    ...mapActions('subscriptions', [
      'UPDATE_SUBSCRIPTION',
      'UPDATE_NEXT_ORDER',
      'GET_SUBSCRIPTIONS',
    ]),

    ...mapMutations('editMode', ['setEditNextOrder']),

    ...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),

    ...mapActions('cards', ['REMOVE_PAYMENT_METHOD']),

    handleSetMode(mode) {
      this.mode = mode
    },
    handleDrawerStatus(status) {
      this.status = status
    },

    handleSelectCard(card) {
      if (card.id === this.activeCard.id) return
      if (this.isRemovingCard) {
        this.removePaymentMethod(card.id, card.type, card.payment_customer_id)
      } else {
        this.setNewSwapCard(card)
        this.swapCards()
      }
    },

    async removePaymentMethod(paymentMethodId, paymentType, paymentCustomerId) {
      let analyticsEventName = 'Upscribe Remove Card'
      let analyticsPayload = {
        card: this.activeEditCard,
      }
      this.setMessage('Removing the Payment Method')
      this.setStatus('updating')

      try {
        await this.REMOVE_PAYMENT_METHOD({
          paymentMethodId,
          paymentType,
          paymentCustomerId,
        })

        this.triggerAnalyticsEvent({
          event: analyticsEventName,
          payload: analyticsPayload,
        })
        this.$toast.success('Removed the Payment Method successfully')
        this.setStatus('success')
      } catch (e) {
        this.$toast.error(e.message)
        console.error('card/REMOVE_PAYMENT_METHOD error: ', e)
        this.setStatus('error')
      }
    },

    async swapCards() {
      const { newSwapCard, editNextOrder, activeCard } = this
      this.setMessage('Swapping Payment Method')
      this.setStatus('updating')
      const updatePayload = {
        requestPayload: {
          payment_method_id: newSwapCard.id,
        },
        bulkUpdate: this.applyToAllActiveSusbscriptions,
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
        await updateAction
        const newCard = this.activeCard

        await this.GET_SUBSCRIPTIONS()
        this.triggerAnalyticsEvent({
          event: analyticsEventName,
          payload: {
            ...analyticsPayload,
            newCard,
          },
        })
        this.setMessage('Swapped Payment Method')
        this.setStatus('success')
        this.setNewSwapCard(null)
      } catch (e) {
        console.error('subscription/UPDATE_SUBSCRIPTION error: ', e)
        this.setMessage(e.message)
        this.setStatus('error')
      }
    },
  },
}
</script>
