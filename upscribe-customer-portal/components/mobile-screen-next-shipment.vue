<template>
<div>
  <portal to="header">
      <the-header
        :middle-html="titleHeaderHtml"
        mode="backwardRoute"
      />
    </portal>

  <mobile-subscription-template v-if="activeSubscription && !edit" functional-block-title="Shipping">
    <div slot="functionality-block" class="c-mobileSubscriptionTemplate__tools">
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
      </div>

      <div class="c-nextShipment__buttonContain">
        <v-button
          class="c-button c-button--transparent c-nextShipment__button"
          @onClick="openModalCalendar"
        >
          Ship Now
        </v-button>

        <v-button
          class="c-button c-button--transparent c-nextShipment__button"
          @onClick="openModalCalendar"
        >
          Skip Next Shipment
        </v-button>
      </div>

      <div>

      </div>
  </mobile-subscription-template>

  <div v-else>

  </div>
</div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import TheHeader from '@components/the-header.vue'
import FunctionalButtonBlock from '@components/functional-button-block.vue'
import CalendarIcon from '@components/Icon/calendar-icon'
import MobileSubscriptionTemplate from '@components/mobile-subscription-template'
import VButton from '@components/v-button'
import moment from 'moment'

export default {
  components: {
    TheHeader,
    FunctionalButtonBlock,
    CalendarIcon,
    MobileSubscriptionTemplate,
    VButton,
  },

  computed: {
    ...mapState('route', ['storeDomain', 'customerId']),

    ...mapState('translations', ['atc']),

    ...mapGetters('activeSubscription', ['activeSubscription', 'activeSubscriptionNextDate']),

    edit(){
      const { edit } = this.$route.query
      if(edit === 'date'){
        return 'date'
      }
      return false
    },

    shipmentDate() {
      const { activeSubscriptionNextDate } = this
      if (!activeSubscriptionNextDate) return false
      return moment(activeSubscriptionNextDate, 'YYYYMMDD').format(
        'MMM D'
      )
    },

    titleHeaderHtml(){
      return `Edit Next Shipment <span class="c-nextShipment__date">${this.shipmentDate}</span>`
    },
  },


  methods: {
    ...mapMutations('modalCalendarGlobal',  ['openModalCalendar']),

    ...mapActions('subscriptions', ['UPDATE_SUBSCRIPTION_QUEUE']),

    ...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),
  },
}
</script>

<style lang="scss">
@import '@design/_colors';

.c-nextShipment__buttonContain{
  display: flex;
  margin: 30px auto 0;
  justify-content: space-between;
  max-width: 400px;
  padding: 0 16px;

  @media (min-width: 425px){
    padding: 0;
  }
}

.c-nextShipment__button{
  text-transform: uppercase;
  letter-spacing: 0.8px;
  font-size: 12px;
  line-height: 16px;
  font-weight: bold;
  font-style: normal;
  max-width: 167px;
  background-color: $color-white;

  &:first-child{
    margin-right: 8px;
  }
}



.c-nextShipment__date{
  color: #888888;
}
</style>
