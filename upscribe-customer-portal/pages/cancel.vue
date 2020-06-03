<template>
  <div class="c-cancel">
    <portal v-if="windowWidth < 768" to="header">
      <the-header
         middle-html="Cancel Subscription"
         mode="backwardRoute"
      />
    </portal>

    <h1 class="c-cancel__title">{{ atc['portal.cancelSubscriptionTitle'] || 'Cancel Subscription' }}</h1>

    <h2 v-if="shopData" class="c-cancel__subtitle"
      >{{ cancelSubscriptionPrompt }}</h2
    >

    <div v-if="cancellationReasons" class="c-cancel__inner">
      <div class="c-cancel__list">
        <label
          v-for="(reason, index) in cancellationReasons"
          :key="'cancel-reason-' + index"
          :for="'cancel-reason-' + index"
          class="c-cancel__listItem"
          :class="{
            'c-cancel__listItem--active': selectedReasonIndex === index,
          }"
        >
          <div class="c-cancel__listItemIcon"></div>
          <span class="c-cancel__listItemText">{{ reason }}</span>
          <input
            :id="'cancel-reason-' + index"
            v-model="selectedReasonIndex"
            class="u-visuallyHidden"
            type="radio"
            :value="index"
          />
        </label>
      </div>

      <div class="c-cancel__field c-cancel__field--textArea">
        <label
          class="c-cancel__label c-cancel__label--textArea"
        >{{ atc['labels.comments'] || 'Comments' }}</label>
        <textarea v-model="comments" type="textarea" class="c-cancel__textArea" />
      </div>
    </div>

    <div class="c-cancel__buttonBox">
      <v-button
        type="alt"
        :text="atc['buttons.delayShipmentDate'] || 'Delay Shipment Date'"
        size="small"
        @onClick="drawerDeliveryDateOpen = true"
      />

      <v-button
        type="alt"
        :text="atc['buttons.swapMyProduct'] || 'Swap My Product'"
        size="small"
        @onClick="drawerProductsOpen = true"
      />

      <v-button
        v-if="activeSubscription.active"
        :text="cancelSubscriptionUpdating ? (atc['notices.cancellingNotice'] || 'Cancelling') : (atc['buttons.cancelSubscription'] || 'Cancel Subscription')"
        :disabled="selectedReason === false ? true : false"
        size="small"
        type="alt"
        @onClick="cancelAttempt"
      />
    </div>

    <!-- Modal Portal Cancel Modal -->
    <portal v-if="cancelModalOpen" to="modals">
      <cancel-modal
        :show="cancelModalOpen"
        :reason="selectedReason"
        @close="cancelModalOpen = false"
      />
    </portal>

    <!-- Drawer Portal Shipment Date-->
    <portal v-if="drawerDeliveryDateOpen" to="drawers">
      <drawer-delivery-date
        :show="drawerDeliveryDateOpen"
        @close="drawerDeliveryDateOpen = false"
      />
    </portal>

    <!-- Drawer Portal Swap -->
    <portal v-if="drawerProductsOpen" to="drawers">
      <drawer-products
        :show="drawerProductsOpen"
        @close="drawerProductsOpen = false"
      />
    </portal>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'

import VButton from '@components/v-button.vue'
import DrawerDeliveryDate from '@components/drawer-delivery-date.vue'
import DrawerProducts from '@components/drawer-products.vue'
import CancelModal from '@components/cancel-modal.vue'
import TheHeader from '@components/the-header'
import { windowSizes } from '@mixins/windowSizes'

export default {
  components: {
    VButton,
    DrawerDeliveryDate,
    DrawerProducts,
    CancelModal,
    TheHeader,
  },

  mixins: [windowSizes],

  data() {
    return {
      selectedReasonIndex: null,
      drawerDeliveryDateOpen: false,
      drawerProductsOpen: false,
      cancelModalOpen: false,
      cancelSubscriptionUpdating: false,
      comments: '',
    }
  },
  computed: {
    ...mapState('translations', ['atc']),
    ...mapState('shop', ['shopData', 'cancellationReasons']),

    ...mapGetters('activeSubscription', ['activeSubscription']),

    cancelSubscriptionPrompt() {
      const { atc, shopData } = this
      if (atc['portal.cancelSubscriptionPrompt']) {
        return atc['portal.cancelSubscriptionPrompt'].replace('<shop-name>', shopData.name)
      } else {
        return `${shopData.name}’s priority is happy customers. Please tell us your
      reason for cancelling.`
      }
    },

    selectedReason() {
      const { cancellationReasons, selectedReasonIndex } = this
      if (selectedReasonIndex === null || selectedReasonIndex === false)
        return false

      return cancellationReasons[selectedReasonIndex]
    },

    finalReasonPayload() {
      let reason = this.selectedReason

      if (this.comments) {
        reason += `. Comment: ${this.comments}`
      }

      return reason
    },
  },

  methods: {
    ...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),

    ...mapActions('subscriptions', ['CANCEL_SUBSCRIPTION', 'GET_SUBSCRIPTIONS']),

    async cancelAttempt() {
      const { finalReasonPayload } = this

      // if denying
      // this.cancelCustomerSupportModalOpen = true
      // else {..}

      let analyticsEventName = 'Upscribe Subscription Cancel'
      let analyticsPayload = {
        reason: this.selectedReason,
      }

      this.cancelSubscriptionUpdating = true
      try {
        await this.CANCEL_SUBSCRIPTION({ reason: finalReasonPayload })
        this.triggerAnalyticsEvent({
          event: analyticsEventName,
          payload: analyticsPayload,
        })
        await this.GET_SUBSCRIPTIONS()
        console.log('finished')
        this.$router.push({ name: 'index', query: { ...this.$route.query } })

      } catch (e) {
        console.log('e: ', e)
        this.triggerAnalyticsEvent({
          event: 'Upscribe Subscription Cancel Attempt',
          payload: analyticsPayload,
        })
      } finally {
        this.cancelSubscriptionUpdating = false
      }
    },
  },
}
</script>

<style lang="scss">
@import '@design';

.c-cancel {
  @include clearfix;

  width: 100%;
  max-width: 400px;
  padding: 50px 20px;
  margin: 0 auto;

  @include bp(tablet) {
    max-width: 664px;
    padding: 94px 20px;
  }
}

.c-cancel__title {
  margin-bottom: 11px;
  font-family: $font-primary-regular;
  font-size: 22px;
  text-align: center;

  @include bp(tablet) {
    font-size: 34px;
  }
}

.c-cancel__subtitle {
  max-width: 600px;
  margin: 0 auto 36px;
  font-family: $font-primary-medium;
  font-size: 18px;
  font-weight: 500;
  line-height: 32px;
  color: $color-text;
  text-align: center;

  @include bp(tablet) {
    font-size: 22px;
  }
}

.c-cancel__inner {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
  flex-direction: column;
  width: 100%;
  max-width: 527px;
  padding: 24px 20px 54px;
  margin: 0 auto;
  background-color: $color-white;

  @include bp(tablet){
    margin: 0 auto 52px;
    padding: 54px 20px;
  }
}

.c-cancel__list {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  max-width: 300px;
  width: 100%;
}

.c-cancel__listItem {
  flex-wrap: wrap;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 19px;
  cursor: pointer;

  &--active {
    .c-cancel__listItemIcon {
      border: 5px solid $color-primary;
    }
  }
}

.c-cancel__listItemIcon {
  width: 20px;
  height: 20px;
  border-radius: 50px;
  margin-right: 10px;
  border: 1px solid $color-black;
}

.c-cancel__listItemText {
  font-family: $font-primary-regular;
  font-size: 13px;
  color: $color-black;
  width:70%;
  font-weight: 700;
}

.c-cancel__field {
  display: flex;
  width: 100%;
  margin-bottom: 15px;
}
.c-cancel__field--textArea {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  max-width: 300px;
  width: 100%;
  font-family: $font-primary-regular;
  font-size: 14px;
  border-radius: 4px;
}
.c-cancel__label--textArea {
  margin-bottom: 5px;
  margin-left: 0;
  display: inline-block;
  font-family: $font-primary-regular;
  font-size: 14px;
  color: $color-black;
}

.c-cancel__textArea {
  width: 100%;
  padding: 10px 12px 8px;
  font-family: $font-primary-regular;
  font-size: 14px;
  border-radius: 4px;
  border: 1px solid;
  outline: none;
}

.c-cancel__buttonBox {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  max-width: 630px;
  margin-top: 20px;

  @include bp(tablet) {
    flex-direction: row;
    margin-top: 0px;
  }

  .c-button {
    max-width: 240px;
    margin-bottom: 12px;
    font-size: 11px;
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
</style>
