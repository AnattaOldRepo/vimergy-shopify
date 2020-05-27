<script>
import { mapState, mapActions } from 'vuex'

import { Card, createToken } from 'vue-stripe-elements-plus'

import VButton from '@components/v-button.vue'

export default {
  components: {
    VButton,
    Card,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  data: () => {
    return {
      loadedStripe: false,
      completeStripeCardInfo: false,
      stripeOptions: {},
    }
  },
  computed: {
    ...mapState('translations', ['atc']),
    ...mapState('shop', ['stripePublicKey']),
  },
  mounted() {
    if (process.browser) {
      let domElement = document.createElement('script')
      domElement.setAttribute('src', 'https://js.stripe.com/v3/')
      domElement.onload = () => {
        this.loadedStripe = true
      }
      document.body.appendChild(domElement)
    }
  },
  methods: {
    ...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),

    ...mapActions('cards', ['CREATE_PAYMENT_METHOD']),

    createCard() {
      const vm = this

      if (!this.completeStripeCardInfo) {
        this.$emit('setDrawerStatus', 'ERROR')
      } else {
        this.$emit('setDrawerStatus', null)
      }

      this.$emit('setDrawerStatus', 'PENDING')

      createToken()
        .then((data) => {
          console.log('create token data', data)
          const card = data.token

          if (data.error) {
            this.$emit('setDrawerStatus', {
              state: 'FAILURE',
              message: data.error.message,
            })
          } else {
            vm.addCard(card)
          }
        })
        .catch((e) => {
          console.log('Create token error: ', e)
          this.$emit('setDrawerStatus', {
            state: 'FAILURE',
            message: e.message,
          })
        })
    },

    async addCard(card) {
      this.$emit('setDrawerStatus', 'PENDING')

      let analyticsEventName = 'Upscribe Create Card'

      let analyticsPayload = {
        card,
      }

      try {
        await this.CREATE_PAYMENT_METHOD(card)
        this.$emit('setDrawerStatus', 'SUCCESS')
        this.$emit('setMode', 'default')
        this.triggerAnalyticsEvent({
          event: analyticsEventName,
          payload: analyticsPayload,
        })
      } catch (e) {
        console.log('card/ADD_CARD error: ', e)
        this.$emit('setDrawerStatus', { state: 'FAILURE', message: e.message })
      }
    },
  },
}
</script>

<template>
  <div class=" c-drawer">
    <div class="c-drawer__inner">
      <h2 class="c-drawer__title">{{ atc['portal.addCardDrawerTitle'] || 'Add Card' }}</h2>

      <no-ssr>
        <card
          v-if="loadedStripe && stripePublicKey"
          class="c-drawerCardAdd__stripeCard"
          :class="{ completeStripeCardInfo }"
          :stripe="stripePublicKey"
          :options="stripeOptions"
          @change="completeStripeCardInfo = $event.complete"
        />

        <content-placeholders-img v-else style="width: 100%; height: 44px;" />
      </no-ssr>

      <div class = "c-drawerCard__button-bottom">
        <v-button
          class="c-drawerCardAdd__addCardButton c-form__submitButton"
          type="submit"
          @onClick="createCard"
          >{{ atc['portal.addCardButton'] || 'Add Card' }}</v-button
        >
      </div>

      <v-button type="link" @onClick="$emit('setMode', 'default')"
        >{{ atc['buttons.cancel'] || 'Cancel' }}</v-button
      >
    </div>
  </div>
</template>

<style lang="scss">
@import '@design';

.c-drawerCardAdd__stripeCard {
  background-color: $color-white;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid $color-blue-light-border;
  color: $color-blue-secondary;
}

</style>
