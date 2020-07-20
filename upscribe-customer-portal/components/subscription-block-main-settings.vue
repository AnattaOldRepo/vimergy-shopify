<script>
import moment from 'moment'
import { mapState, mapGetters, mapActions } from 'vuex'

import SubscriptionBlock from '@components/subscription-block.vue'
import SubscriptionBlockOptionWrap from '@components/subscription-block-option-wrap.vue'
import SubscriptionBlockOption from '@components/subscription-block-option.vue'
import ProductOption from '@components/product-option.vue'

import DrawerDeliveryDate from '@components/drawer-delivery-date.vue'
import DrawerDeliveryFrequency from '@components/drawer-delivery-frequency.vue'
import DrawerProducts from '@components/drawer-products.vue'
import DrawerShippingMethods from '@components/drawer-shipping-methods.vue'

import VButton from '@components/v-button.vue'


export default {
  components: {
    SubscriptionBlock,
    SubscriptionBlockOptionWrap,
    SubscriptionBlockOption,
    ProductOption,
    DrawerDeliveryDate,
    DrawerDeliveryFrequency,
    DrawerProducts,
    DrawerShippingMethods,
    VButton,
  },
  data() {
    return {
      drawerDeliveryDateOpen: false,
      drawerDeliveryFrequencyOpen: false,
      drawerProductsOpen: false,
      drawerShippingMethodOpen: false,

      migratingTrialToSubscription: false,
      nextShipDate: false,
      shipmentNowUpdate: '',
      skipShipmentUpdate: '',
    }
  },
  computed: {
    ...mapState('translations', ['atc', 'activeLanguageCode']),

    ...mapGetters('activeSubscription', [
      'activeSubscription',
      'activeTotalPrice',
      'activeSubscriptionNextDate',
      'activeQueue',
    ]),

    ...mapState('editMode', ['editNextOrder']),

    ...mapState('shop', ['currencySymbol']),

    atleastOneItemInStock() {
      const { activeSubscription } = this
      let willShip = false
      activeSubscription.items.forEach(item => {
        if (item.in_stock === null || item.in_stock === undefined || item.in_stock) {
          willShip = true
        }
      })
      return willShip
    },

    deliveryEveryText() {
      const { activeSubscription } = this
      if (!activeSubscription) return false
      return `${activeSubscription.interval}`
    },

    intervalUnitDisplay() {
      const { activeSubscription, atc } = this
      let intervalUnit = activeSubscription.period
      let plural = activeSubscription.interval > 1

      let displayUnit = ''
      if (intervalUnit === 'day') {
        if (plural) {
          displayUnit = atc['date-time.days-unit'] || 'days'
        } else {
          displayUnit = atc['date-time.day-unit'] || 'day'
        }
      } else if (intervalUnit === 'week') {
        if (plural) {
          displayUnit = atc['date-time.weeks-unit'] || 'weeks'
        } else {
          displayUnit = atc['date-time.week-unit'] || 'week'
        }
      } else if (intervalUnit === 'month') {
        if (plural) {
          displayUnit = atc['date-time.months-unit'] || 'months'
        } else {
          displayUnit = atc['date-time.month-unit'] || 'month'
        }
      } else {
        displayUnit = atc['date-time.days-unit'] || 'days'
      }
      return displayUnit
    },

    activeSubscriptionProducts() {
      const { activeSubscription } = this
      return activeSubscription.items
    },

    totalPriceText() {
      const { activeTotalPrice, currencySymbol, atc } = this
      if (!activeTotalPrice) return false
      return `<span class ='total__title'>${atc['labels.total'] || 'TOTAL' }</span>: <strong>${currencySymbol}${activeTotalPrice}</strong>`
    },

    shippingMethod() {
      const { activeSubscription, activeQueue, editNextOrder, currencySymbol } = this

      let shippingLines = null

      if (editNextOrder) {
        shippingLines = activeQueue.shipping_lines
      } else {
        shippingLines = activeSubscription.shipping_lines
      }

      if (shippingLines) {
        const shippingMethod = shippingLines[0]
        return `${shippingMethod.title}: ${currencySymbol}${shippingMethod.price}`
      } else {
        return false
      }
    },

    subscriptionActive() {
      return this.activeSubscription.active
    },

    trialSubscription() {
      const { activeSubscription } = this
      return (activeSubscription.charge_limit && activeSubscription.charge_limit > 0)
    },

    trialChargeLength() {
      return this.activeSubscription.charge_limit
    },

    completedOrderCount() {
      return this.activeSubscription.order_count
    },

    trialOrdersRemainingMessage() {
      const { trialChargeLength, completedOrderCount, atc } = this
      let trialOrdersRemaining = trialChargeLength - completedOrderCount

      return atc['portal.trialOrdersRemainingMessage'] ? atc['portal.trialOrdersRemainingMessage'].replace('<trial-orders-remaining>', trialOrdersRemaining) : `Trial: ${trialOrdersRemaining} Orders Remaining`
    },
  },

  watch: {
    activeLanguageCode: {
      immediate: true,
      handler: function(newVal) {
        moment.locale(newVal)
      },
    },
  },

  methods: {
    ...mapActions('shippingMethods', ['GET_SUBSCRIPTION_SHIPPING_METHODS']),

    ...mapActions('subscriptions', ['UPDATE_SUBSCRIPTION']),

    ...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),

    ...mapActions('subscriptions', ['SKIP_NEXT_SHIPMENT', 'SHIP_TOMORROW']),

    refreshNextShipDate() {
      const { activeSubscriptionNextDate } = this
      if (!activeSubscriptionNextDate) return false
      this.nextShipDate = moment(activeSubscriptionNextDate, 'YYYYMMDD').format('MMMM Do')
      return moment(activeSubscriptionNextDate, 'YYYYMMDD').format('MMM Do')
    },

    handleOpenShippingMethodDrawer() {
      this.GET_SUBSCRIPTION_SHIPPING_METHODS()
      this.drawerShippingMethodOpen = true
    },

    async handleMigrateTrialToSubscription() {
      this.migratingTrialToSubscription = true

      const updatePayload = {
        requestPayload: {
          charge_limit: 0,
        },
      }

      try {
        await this.UPDATE_SUBSCRIPTION(updatePayload)

        this.triggerAnalyticsEvent({
          event: 'Migrated Trial to Subscription',
          payload: { charge_limit: 0},
        })
      } catch (e) {
        console.log('reactive subscription error: ', e)

      } finally {

        this.migratingTrialToSubscription = false
      }
    },

    async skipNextShipment() {
      this.skipShipmentUpdate = 'Updating'
      try {
        await this.SKIP_NEXT_SHIPMENT()
      } catch(e) {
        console.log(e)
      } finally{
      this.skipShipmentUpdate = ''
      }
    },

    async shipTomorrow() {
      this.shipmentNowUpdate = 'Updating'
      try {
        await this.SHIP_TOMORROW()
      } catch(e) {
        console.log(e)
      } finally {
        this.shipmentNowUpdate = ''
      }
    },
  },
}
</script>

<template>
  <subscription-block key="setting"
    :title="atc['portal.subscriptionSettingsSubscriptionTitle'] || 'Subscription Settings'"
  >
    <subscription-block-option-wrap
      v-if="activeSubscriptionNextDate"
      custom-class-for-icon="c-subscriptionBlockOptionWrap__icon--floatTop"
      @click.native="drawerDeliveryDateOpen=true"
      >
      <subscription-block-option
        v-if="refreshNextShipDate()"
        :title="atc['portal.subscriptionSettingsShipsOnLabel'] || 'Ships On'"
        :text="refreshNextShipDate()"
        text-large
      />

      <content-placeholders v-else>
        <content-placeholders-heading />
      </content-placeholders>

      <!-- Drawer Portal -->
      <portal v-if="drawerDeliveryDateOpen" to="drawers">
        <drawer-delivery-date
          :show="drawerDeliveryDateOpen"
          @close="drawerDeliveryDateOpen = false"
        />
      </portal>

      <div class = "c-subscriptionBlockMainSetting--firstBlock-contain">
        <v-button
          class="c-button--auto c-subscriptionBlockMainSetting--button c-button--primary"
          @click.native.stop="shipTomorrow">
          {{ shipmentNowUpdate ? shipmentNowUpdate : 'Ship Now'}}
        </v-button>

       <v-button
          class="c-button--auto c-subscriptionBlockMainSetting--button c-button--transparent"
          @click.native.stop="skipNextShipment">
           {{ skipShipmentUpdate ? skipShipmentUpdate : 'Skip Next Shipment'}}
        </v-button>
      </div>
    </subscription-block-option-wrap>

    <subscription-block-option-wrap
      @onClick="drawerDeliveryFrequencyOpen = true"
    >
      <subscription-block-option
        v-if="deliveryEveryText"
        :title="atc['portal.subscriptionSettingsDeliverEveryLabel'] || 'Deliver Every'"
        :text="deliveryEveryText + ' ' + intervalUnitDisplay"
        text-large
      />

      <content-placeholders v-else>
        <content-placeholders-heading />
      </content-placeholders>

      <!-- Drawer Portal -->
      <portal v-if="drawerDeliveryFrequencyOpen" to="drawers">
        <drawer-delivery-frequency
          :show="drawerDeliveryFrequencyOpen"
          @close="drawerDeliveryFrequencyOpen = false"
        />
      </portal>
    </subscription-block-option-wrap>

    <subscription-block-option-wrap @click.native="drawerProductsOpen = true">
      <subscription-block-option
        :title="atc['portal.subscriptionSettingsProductsLabel'] || 'Products'"
      >
        <div v-if="activeSubscriptionProducts">
          <product-option
            v-for="(product, index) in activeSubscriptionProducts"
            :key="product.id + '-' + index"
            :product="product"
          />

          <strong v-if="!atleastOneItemInStock" class="c-outOfStockBlock">
            {{ atc['portal.allItemsOutOfStockMessage'] || 'All items are out of stock. This charge will be skipped and attempted again next cycle.' }}
          </strong>
        </div>

        <content-placeholders v-else>
          <content-placeholders-heading :img="true" />
          <content-placeholders-heading :img="true" />
        </content-placeholders>
      </subscription-block-option>

      <!-- Drawer Portal -->
      <portal v-if="drawerProductsOpen" to="drawers">
        <drawer-products
          :show="drawerProductsOpen"
          @close="drawerProductsOpen = false"
        />
      </portal>
    </subscription-block-option-wrap>

    <subscription-block-option-wrap @click.native="handleOpenShippingMethodDrawer">
      <subscription-block-option
        v-if="shippingMethod"
        :title="atc['portal.subscriptionSettingsShippingMethodLabel'] || 'Shipping Method'"
        :text="shippingMethod"
        text-med
      />

      <content-placeholders v-else>
        <content-placeholders-heading />
      </content-placeholders>

      <!-- Drawer Portal -->
      <portal v-if="drawerShippingMethodOpen" to="drawers">
        <drawer-shipping-methods
          :show="drawerShippingMethodOpen"
          @close="drawerShippingMethodOpen = false"
        />
      </portal>
    </subscription-block-option-wrap>

    <subscription-block-option-wrap no-action text-only>
      <subscription-block-option v-if="totalPriceText" :html = "totalPriceText"/>
      <content-placeholders v-else>
        <!-- <content-placeholders-heading /> -->
        <content-placeholders-text
          :lines="1"
          style="margin-top: 4px; margin-bottom: 4px"
        />
      </content-placeholders>
    </subscription-block-option-wrap>

    <div
      v-if="trialSubscription && subscriptionActive"
      slot="button"
      class="c-trialSubscription"
    >
      <h3 class="c-trialSubscription__title">{{ trialOrdersRemainingMessage }}</h3>

      <v-button
        class="c-trialSubscription__button"
        :text="migratingTrialToSubscription ? (atc['notices.migratingNotice'] || 'Migrating') : (atc['buttons.migrateTrialToSubscription'] || 'Migrate Trial to Subscription')"
        @click.native="handleMigrateTrialToSubscription"
      />
    </div>

  </subscription-block>
</template>

<style lang="scss">
@import '@design/_colors';
@import '@design/_breakpoints';


.c-trialSubscription__title {
  text-align: center;
  margin-bottom: 12px;
}
.c-trialSubscription__button {
}

.c-subscriptionBlockMainSetting--firstBlock-contain{
  display: flex;
  margin-top: 20px;
  flex-direction: column;

  @include bp(tablet-large){
    flex-direction: row;
  }

  button{
    &:nth-child(1){
      margin-bottom: 15px;
      @include bp(tablet-large){
        margin-bottom: 0;
        margin-right: 3px;
      }

      @include bp(desktop){
          margin-right: 6px;
      }
    }
  }
}

.c-subscriptionBlockMainSetting--button{
  padding: 12px 20px;
  text-transform: uppercase;
  font-weight: bold;
  letter-spacing: 0.8px;
  font-size: 12px;
  line-height: 16px;
}

.total__title{
  color: $color-blue-secondary;
  font-weight: 500;
  letter-spacing: 0.08em;
  font-size: 12px;
}
</style>
