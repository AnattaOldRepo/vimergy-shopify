<script>
import { mapActions, mapMutations, mapGetters, mapState } from 'vuex'

import { buildNewCheckoutUpdatePayload } from '@utils/newCheckoutUpdateHelpers'

import DrawerWrap from '@components/drawer-wrap.vue'
import DiscountForm from '@components/discount-form.vue'
import DiscountItem from '@components/discount-item.vue'

import ShippingMethodListUpdateRequired from '@components/shipping-method-list-update-required.vue'

export default {
  components: {
    DrawerWrap,
    DiscountForm,
    DiscountItem,
    ShippingMethodListUpdateRequired,
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
      showModalShippingUpdateRequired: false,
    }
  },
  computed: {
    ...mapState('translations', ['atc']),

    ...mapState('shop', ['currencySymbol']),

    ...mapGetters('activeSubscription', ['activeSubscription', 'activeQueue']),

    hasDiscount() {
      const { activeQueue } = this
      if (activeQueue.coupon_discount) {
        return true
      } else {
        return false
      }
    },

    discountCode() {
      const { activeQueue } = this
      return activeQueue && activeQueue.discount_code
        ? activeQueue.discount_code
        : false
    },

    discountAmount() {
      const { activeQueue } = this
      if (activeQueue.coupon_discount) {
        return parseFloat(activeQueue.coupon_discount).toFixed(2)
      } else {
        return false
      }
    },

    discountText() {
      const { atc } = this
      // if discount show discount
      const { discountCode, discountAmount, currencySymbol } = this

      if (discountCode && discountAmount) {
        return `${atc['labels.activeDiscount'] || 'Active Discount'}: ${discountCode} (-${currencySymbol}${discountAmount})`
      } else {
        return atc['buttons.addDiscount'] || 'Add Discount'
      }
    },
  },

  methods: {
    ...mapActions('subscriptions', ['UPDATE_NEXT_ORDER']),

    ...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),

    ...mapMutations('newCheckoutUpdates', ['setSavedNewCheckoutUpdate']),

    ...mapMutations('shippingMethods', ['SET_SHIPPING_METHODS']),

    handleNewCheckoutUpdate(updateArray) {
      return new Promise((resolve, reject) => {
        let updateCount = updateArray.length
        let updatesFinished = 0
        let hasErrors = false

        // for each update
        updateArray.forEach(async (update) => {
          try {
            await update.updateAction
          } catch (e) {
            this.handleNewCheckoutUpdateError(e, update)
            hasErrors = true
          } finally {
            updatesFinished += 1
          }

          if (updatesFinished === updateCount) {
            if (!hasErrors) {
              resolve(true)
            }
          }
        })
      })
    },

    handleNewCheckoutUpdateError(e, handleNewCheckoutUpdatePayload) {
      if (e && e.data && e.data.shipping_update_required) {
        this.SET_SHIPPING_METHODS(e.data.rates)
        this.setSavedNewCheckoutUpdate(handleNewCheckoutUpdatePayload)

        this.showModalShippingUpdateRequired = true
      } else {
        console.error('subscription/UPDATE_SUBSCRIPTION error: ', e)
        this.drawerStatus = { state: 'FAILURE', message: e.message }
      }
    },

    async handleRemoveDiscount() {
      const { activeSubscription, atc } = this
      this.drawerStatus = 'PENDING'

      let updatePayload = {
        currentDate: activeSubscription.next.date,
        requestPayload: {
          discount_code: null,
        },
      }
      let handleNewCheckoutUpdatePayload = [
        buildNewCheckoutUpdatePayload(
          this.UPDATE_NEXT_ORDER(updatePayload),
          updatePayload,
          'subscriptions',
          'UPDATE_NEXT_ORDER',
          atc['notices.discountRemovedFromNextOrder'] || 'Discount removed from next order'
        ),
      ]
      let analyticsPayload = {
        discount: {
          removedCode: this.discountCode,
          removedCodeAmount: this.discountAmount,
          code: null,
          amount: 0,
        },
      }

      // hande everything in handleNewCheckoutUpdate function
      await this.handleNewCheckoutUpdate(handleNewCheckoutUpdatePayload)

      this.triggerAnalyticsEvent({
        event: 'Upscribe Next Order Remove Discount',
        payload: analyticsPayload,
      })
      this.drawerStatus = 'SUCCESS'
    },

    async handleDiscountSubmit(discount) {
      const { atc } = this

      const updatePayload = {
        requestPayload: {
          discount_code: discount,
        },
      }

      let analyticsEventName = 'Upscribe Next Order Discount Add'

      this.drawerStatus = 'PENDING'

      // updateMessage = `Quantity updated to ${quantity} on next order.`
      let handleNewCheckoutUpdatePayload = [
        buildNewCheckoutUpdatePayload(
          this.UPDATE_NEXT_ORDER(updatePayload),
          updatePayload,
          'subscriptions',
          'UPDATE_NEXT_ORDER',
          atc['notices.discountAddedToNextOrder'] || 'Discount code added to next order'
        ),
      ]

      // hande everything in handleNewCheckoutUpdate function
      await this.handleNewCheckoutUpdate(handleNewCheckoutUpdatePayload)
      this.drawerStatus = 'SUCCESS'

      this.triggerAnalyticsEvent({
        event: analyticsEventName,
        payload: {
          discount: {
            code: this.discountCode,
            // amount: updatedSubscription.coupon_discount
            // ? parseFloat(updatedSubscription.coupon_discount).toFixed(2)
            // : false,
          },
        },
      })
    },
  },
}
</script>

<template>
  <drawer-wrap
    :show="show"
    :status="drawerStatus"
    :manual-drawer-warning="
      atc['portal.discountDrawerInfoText'] ||
        'Discount will only affect your next order.'
    "
    @close="$emit('close')"
  >
    <div
      v-if="showModalShippingUpdateRequired"
      class="c-drawerDiscount c-drawer"
    >
      <shipping-method-list-update-required
        @close="
          showModalShippingUpdateRequired = false
          drawerStatus = null
        "
        @cancel="
          showModalShippingUpdateRequired = false
          drawerStatus = null
        "
      />
    </div>

    <div v-else class="c-drawerDiscount c-drawer">
      <h2 class="c-drawer__title">{{
        hasDiscount
          ? atc['portal.editDiscountDrawerTitle'] || 'Edit Discount'
          : atc['portal.addDiscountDrawerTitle'] || 'Add Discount'
      }}</h2>

      <div class="c-drawerDiscount__inner">
        <discount-item
          v-if="discountCode && discountAmount"
          :discount-code="discountCode"
          :discount-amount="discountAmount"
          @removeDiscount="handleRemoveDiscount"
        />
      </div>

      <discount-form
        v-if="!discountCode && !discountAmount"
        class="c-formBlock--noPadding
      c-discountForm"
        :form-submit-button-text="
          hasDiscount
            ? atc['portal.changeDiscountButton'] || 'Change Discount'
            : atc['portal.addDiscountButton'] || 'Add Discount'
        "
        form-name="discount"
        :discount-input-label="
          hasDiscount
            ? atc['portal.discountInputLabelWithDiscount'] ||
              'New Discount Code'
            : atc['portal.discountInputLabel'] || 'Discount Code'
        "
        @onSubmit="handleDiscountSubmit"
      />
    </div>
  </drawer-wrap>
</template>
