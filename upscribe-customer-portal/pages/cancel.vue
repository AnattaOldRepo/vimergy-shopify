<template>
  <div class="c-cancel">
    <portal v-if="windowWidth < 768" to="header">
      <the-header middle-html="Cancel Subscription" mode="backwardRoute" />
    </portal>

    <h1 class="c-cancel__title">{{
      atc['portal.cancelSubscriptionTitle'] || 'Cancel Subscription'
    }}</h1>

    <h2 v-if="shopData" class="c-cancel__subtitle">{{
      cancelSubscriptionPrompt
    }}</h2>

    <div v-if="nestedCancellationReasonsEnabled" class="c-cancel__inner">
      <div v-if="useTheseReasons" style="width:100%">
        <cancel-subscription-options-ui
          :reasons="useTheseReasons"
          :position="1"
          :position1-id="position1Id"
          :position2-id="position2Id"
          :position3-id="position3Id"
          :position1="position1"
          :position2="position2"
          :position3="position3"
          @setCancellationReason="setCancellationReason"
        />

        <div
          class="c-cancel__comments c-cancel__field c-cancel__field--textArea"
        >
          <label class="c-cancel__label c-cancel__label--textArea"
            >Comments</label
          >
          <textarea
            v-model="comments"
            type="textarea"
            class="c-cancel__textArea"
            rows="4"
          />
        </div>
      </div>

      <!-- <loading-block v-else /> -->
    </div>

    <!-- Old Cancellation Reasons Structure -->

    <div v-else class="c-cancel__inner">
      <div class="c-cancel__list">
        <label
          v-for="(reason, index) in cancellationReasons"
          :key="'cancel-reason-' + index"
          :for="'cancel-reason-' + index"
          class="c-cancel__listItem c-cancel__listItem--old"
          :class="{
            'c-cancel__listItem--active': selectedReasonIndex === index,
          }"
        >
          <div class="c-cancel__listItemIcon"></div>
          <span class="c-cancel__listItemText">{{
            reason.message || reason
          }}</span>
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
        <label class="c-cancel__label c-cancel__label--textArea">{{
          atc['labels.comments'] || 'Comments'
        }}</label>
        <textarea
          v-model="comments"
          type="textarea"
          class="c-cancel__textArea"
        />
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
        v-if="nestedCancellationReasonsEnabled"
        type="alt"
        :text="
          cancelSubscriptionUpdating
            ? atc['notices.cancellingNotice'] || 'Cancelling'
            : atc['buttons.cancelSubscription'] || 'Cancel Subscription'
        "
        :disabled="!allowCancellation"
        size="small"
        @onClick="handleCancelSubscription"
      />

      <v-button
        v-else-if="
          !nestedCancellationReasonsEnabled && activeSubscription.active
        "
        :text="
          cancelSubscriptionUpdating
            ? atc['notices.cancellingNotice'] || 'Cancelling'
            : atc['buttons.cancelSubscription'] || 'Cancel Subscription'
        "
        :disabled="selectedReason === false ? true : false"
        size="small"
        type="alt"
        @onClick="handleCancelSubscriptionOld"
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

import CancelSubscriptionOptionsUi from '@components/cancel-subscription-options-ui'

export default {
  components: {
    VButton,
    CancelSubscriptionOptionsUi,
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

      position1: null,
      position2: null,
      position3: null,

      position1Id: null,
      position2Id: null,
      position3Id: null,
    }
  },
  computed: {
    ...mapState('translations', ['atc']),
    ...mapState('shop', [
      'shopData',
      'cancellationReasons',
      'nestedCancellationReasons',
      'nestedCancellationReasonsEnabled',
    ]),

    ...mapGetters('activeSubscription', ['activeSubscription']),

    cancelSubscriptionPrompt() {
      const { atc, shopData } = this
      if (atc['portal.cancelSubscriptionPrompt']) {
        return atc['portal.cancelSubscriptionPrompt'].replace(
          '<shop-name>',
          shopData.name
        )
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

    allowCancellation() {
      const { position1, position2, position3 } = this
      if (position1) {
        if (position1.children && position1.children.length) {
          if (position2) {
            if (position2.children && position2.children.length) {
              if (position3) {
                return true // only allow 3 deep
              } else {
                return false // only 3, and 3 selected
              }
            } else {
              return true // only 2
            }
          } else {
            return false // need to select 2
          }
        } else {
          return true // only 1
        }
      } else {
        return false // need to select 1
      }
    },

    newFinalReasonPayload() {
      const { position1Id, position2Id, position3Id, comments } = this
      const payload = {
        reasons: [],
        comment: comments || undefined,
      }
      if (position1Id)
        payload.reasons.push({ reason_id: position1Id, position: 1 })
      if (position2Id)
        payload.reasons.push({ reason_id: position2Id, position: 2 })
      if (position3Id)
        payload.reasons.push({ reason_id: position3Id, position: 3 })
      return payload
    },

    useTheseReasons() {
      const {
        cancellationReasons,
        nestedCancellationReasons,
        nestedCancellationReasonsEnabled,
      } = this

      if (nestedCancellationReasonsEnabled && nestedCancellationReasons) {
        const customerPortalReasons = nestedCancellationReasons.filter(
          (reason) => {
            return reason.type === 'CUSTOMER PORTAL' && reason.active
          }
        )
        return customerPortalReasons
      } else {
        // old structure
        // fallback to default reasons if admin cancellation reasons not set
        return cancellationReasons
      }
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

    ...mapActions('subscriptions', [
      'CANCEL_SUBSCRIPTION',
      'GET_SUBSCRIPTIONS',
    ]),

    setCancellationReason(payload) {
      if (!payload) return

      const { reason, position } = payload

      if (!reason || !position) {
        return
      }

      this[`position${position}Id`] = reason.id
      this[`position${position}`] = { ...reason }
    },

    async handleCancelSubscription() {
      const {
        subscriptionId,
        newFinalReasonPayload,
        finalReasonPayload,
        nestedCancellationReasonsEnabled,
      } = this

      let cancelPayload = {
        subscriptionId,
        reason: nestedCancellationReasonsEnabled
          ? newFinalReasonPayload
          : finalReasonPayload,
      }

      let analyticsEventName = 'Upscribe Subscription Cancel'
      let analyticsPayload = {
        reason: nestedCancellationReasonsEnabled
          ? newFinalReasonPayload
          : finalReasonPayload,
      }

      this.cancelSubscriptionUpdating = true
      try {
        await this.CANCEL_SUBSCRIPTION(cancelPayload)
        this.triggerAnalyticsEvent({
          event: analyticsEventName,
          payload: analyticsPayload,
        })
        await this.GET_SUBSCRIPTIONS()
        this.$router.push({ name: 'all', query: { ...this.$route.query } })
      } catch (e) {
        console.error('cancel subscription error: ', e)
        this.triggerAnalyticsEvent({
          event: 'Upscribe Subscription Cancel Attempt',
          payload: analyticsPayload,
        })
      } finally {
        this.cancelSubscriptionUpdating = false
        this.$emit('close')
      }
    },

    async handleCancelSubscriptionOld() {
      const { subscriptionId, finalReasonPayload } = this

      let cancelPayload = {
        subscriptionId,
        reason: { reason: finalReasonPayload },
      }
      let analyticsEventName = 'Upscribe Subscription Cancel'
      let analyticsPayload = {
        reason: { reason: finalReasonPayload },
      }

      this.cancelSubscriptionUpdating = true
      try {
        await this.CANCEL_SUBSCRIPTION(cancelPayload)
        this.triggerAnalyticsEvent({
          event: analyticsEventName,
          payload: analyticsPayload,
        })
        await this.GET_SUBSCRIPTIONS()
        this.$router.push({ name: 'all', query: { ...this.$route.query } })
      } catch (e) {
        console.error('e: ', e)
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

  @include bp(tablet) {
    margin: 0 auto 52px;
    padding: 54px 20px;
  }
}

.c-cancel__list {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  // max-width: 300px;
  width: 100%;
}

.c-cancel__listItem {
  display: flex;
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
  // max-width: 300px;
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

.c-cancel {
  @include clearfix;

  width: 100%;
  // max-width: 400px;
  padding: 50px 20px;
  margin: 0 auto;

  @include bp(tablet) {
    // max-width: 664px;
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
  line-height: 32px;
  color: $color-text;
  text-align: center;

  @include bp(tablet) {
    font-size: 22px;
  }
}

.c-cancel__inner {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  max-width: 527px;
  padding: 54px 20px;
  margin: 0 auto 52px;
  background-color: $color-white;
}

.c-cancel__list {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  // max-width: 300px;
  width: 100%;
}

.c-cancel__listItem {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 20px;
  cursor: pointer;

  &--old {
    flex-direction: row;
  }

  &:last-of-type {
    margin-bottom: 0;
  }
}

.c-cancel__comments {
  margin-top: 20px;
}

.c-cancel__listItem__inner {
  display: flex;
  padding-left: 30px;
  flex-direction: column;
}

.c-cancel__listItemLabel {
  display: flex;
}

.c-cancel__listItemIcon {
  width: 20px;
  min-width: 20px;
  height: 20px;
  min-height: 20px;
  border-radius: 50px;
  margin-right: 10px;
  border: 1px solid $color-black;

  &--active {
    border: 5px solid $color-primary;
  }
}

.c-cancel__listItemText {
  font-family: $font-primary-regular;
  font-size: 14px;
  color: $color-black;
}

.c-cancel__field {
  display: flex;
  width: 100%;
  // max-width: 400px;
  margin-bottom: 15px;
}
.c-cancel__field--textArea {
  display: block;
  width: 100%;
  padding: 10px 12px 8px;
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
</style>
