<template>
  <div>
    <portal to="header">
      <the-header :middle-html="titleHeaderHtml" mode="backwardRoute" />
    </portal>

    <mobile-subscription-template
      v-if="activeSubscription && !edit"
      functional-block-title="Shipping"
    >
      <div
        slot="functionality-block"
        class="c-mobileSubscriptionTemplate__tools"
      >
        <!-- Change Ship Date -->
        <functional-button-block
          :internal-link="{
            query: {
              template: 'edit-calendar',
              storeDomain,
              customerId,
            },
          }"
          title="Change Ship Date"
        >
          <span slot="icon" class="c-functionalButtonBlock__icon">
            <calendar-icon />
          </span>
        </functional-button-block>

        <functional-button-block
          :internal-link="{
            query: {
              template: 'edit-discount',
              storeDomain,
              customerId,
            },
          }"
          :title="
            hasDiscount
              ? atc['portal.editDiscountDrawerTitle'] || 'Edit Discount'
              : atc['portal.addDiscountDrawerTitle'] || 'Add Discount'
          "
        >
          <span
            slot="icon"
            class="c-functionalButtonBlock__icon c-functionalButtonBlock__icon-slot"
          >
          </span>
        </functional-button-block>
      </div>
    </mobile-subscription-template>

    <portal to="float-buttons">
      <mobile-float-buttons />
    </portal>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import TheHeader from '@components/the-header.vue'
import FunctionalButtonBlock from '@components/functional-button-block.vue'
import CalendarIcon from '@components/Icon/calendar-icon'
import MobileSubscriptionTemplate from '@components/mobile-subscription-template'
import MobileFloatButtons from '@components/mobile-float-buttons'
import moment from 'moment'

export default {
  components: {
    TheHeader,
    FunctionalButtonBlock,
    CalendarIcon,
    MobileSubscriptionTemplate,
    MobileFloatButtons,
  },

  computed: {
    ...mapState('route', ['storeDomain', 'customerId']),

    ...mapState('translations', ['atc']),

    ...mapGetters('activeSubscription', [
      'activeSubscription',
      'activeSubscriptionNextDate',
      'activeQueue',
    ]),

    hasDiscount() {
      const { activeQueue } = this
      if (activeQueue.coupon_discount) {
        return true
      } else {
        return false
      }
    },

    edit() {
      const { edit } = this.$route.query
      if (edit === 'date') {
        return 'date'
      }
      return false
    },

    shipmentDate() {
      const { activeSubscriptionNextDate } = this
      if (!activeSubscriptionNextDate) return false
      return moment(activeSubscriptionNextDate, 'YYYYMMDD').format('MMM D')
    },

    titleHeaderHtml() {
      return `Edit Next Shipment <span class="c-nextShipment__date">${
        this.shipmentDate
      }</span>`
    },
  },

  methods: {
    ...mapMutations('modalCalendarGlobal', ['openModalCalendar']),

    ...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),
  },
}
</script>

<style lang="scss">
.c-nextShipment__date {
  color: #888;
}
.c-functionalButtonBlock__icon-slot {
  min-width: 16px;
}
</style>
