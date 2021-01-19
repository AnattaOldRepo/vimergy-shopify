<script>
import moment from 'moment'
import { mapState, mapGetters, mapActions } from 'vuex'

import SubscriptionBlock from '@components/subscription-block.vue'
import SubscriptionBlockOptionWrap from '@components/subscription-block-option-wrap.vue'
import SubscriptionBlockOption from '@components/subscription-block-option.vue'
import ProductOption from '@components/product-option.vue'

import DrawerDeliveryDate from '@components/drawer-delivery-date.vue'
import DrawerProducts from '@components/drawer-products.vue'
import DrawerShippingMethods from '@components/drawer-shipping-methods.vue'
import DrawerDiscount from '@components/drawer-discount.vue'
import VButton from '@components/v-button.vue'

export default {
  components: {
    SubscriptionBlock,
    SubscriptionBlockOptionWrap,
    SubscriptionBlockOption,
    ProductOption,
    DrawerDeliveryDate,
    DrawerProducts,
    DrawerShippingMethods,
    DrawerDiscount,
    VButton,
  },
  data() {
    return {
      drawerDeliveryDateOpen: false,
      drawerProductsOpen: false,
      skipShipmentUpdating: false,
      shipTomorrowUpdating: false,
      drawerShippingMethodOpen: false,
      drawerDiscountOpen: false,
      shipmentNowUpdate: '',
      skipShipmentUpdate: '',
      nextShipDate: false,
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

    ...mapState('shop', ['currencySymbol', 'chargeNowEnabled']),

    atleastOneItemInStock() {
      const { activeQueue } = this
      let willShip = false
      activeQueue.items.forEach((item) => {
        if (
          item.in_stock === null ||
          item.in_stock === undefined ||
          item.in_stock
        ) {
          willShip = true
        }
      })
      return willShip
    },

    // nextShipDate() {
    //   const { activeSubscriptionNextDate } = this
    //   if (!activeSubscriptionNextDate) return false
    //   return moment(activeSubscriptionNextDate, 'YYYYMMDD').format('MMMM Do')
    // },

    activeSubscriptionProducts() {
      const { activeQueue } = this
      return activeQueue.items
    },

    totalPriceText() {
      const { atc, activeTotalPrice, currencySymbol } = this
      if (!activeTotalPrice) return false
      return `${atc['labels.total'] ||
        'Total'}: ${currencySymbol}${activeTotalPrice}`
    },

    shippingMethod() {
      const {
        activeSubscription,
        activeQueue,
        editNextOrder,
        currencySymbol,
      } = this

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

    discountAmount() {
      const { activeQueue } = this
      if (activeQueue.coupon_discount) {
        return parseFloat(activeQueue.coupon_discount).toFixed(2)
      } else {
        return false
      }
    },

    discountText() {
      // if discount show discount
      const { activeQueue, discountAmount, currencySymbol } = this
      const { discount_code } = activeQueue

      if (discount_code && discountAmount) {
        return `${discount_code} (-${currencySymbol}${discountAmount})`
      } else {
        return 'Add Discount'
      }
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

    ...mapActions('subscriptions', [
      'GET_SUBSCRIPTIONS',
      'SKIP_NEXT_SHIPMENT',
      'SHIP_TOMORROW',
      'SHIP_NOW',
    ]),

    handleOpenShippingMethodDrawer() {
      this.GET_SUBSCRIPTION_SHIPPING_METHODS()
      this.drawerShippingMethodOpen = true
    },

    refreshNextShipDate() {
      const { activeSubscriptionNextDate } = this
      if (!activeSubscriptionNextDate) return false
      this.nextShipDate = moment(activeSubscriptionNextDate, 'YYYYMMDD').format(
        'MMMM Do'
      )
      return moment(activeSubscriptionNextDate, 'YYYYMMDD').format('MMM Do')
    },

    async skipNextShipment() {
      this.skipShipmentUpdate = 'Updating'
      try {
        await this.SKIP_NEXT_SHIPMENT()
      } catch (e) {
        console.error('skipNextShipment e: ', e)
      } finally {
        this.skipShipmentUpdate = ''
      }
    },

    async shipNow() {
      this.shipmentNowUpdate = 'Updating'
      try {
        const createdCharge = await this.SHIP_NOW()
        if (createdCharge.charge_error) {
          console.error({
            message: `Charge failed: ${createdCharge.charge_error}`,
          })
          this.$toast.error(`Charge failed: ${createdCharge.charge_error}`)
        } else {
          this.$toast.success(`Order created.`)
          await this.GET_SUBSCRIPTIONS()
        }
      } catch (e) {
        console.error('shipNow e:', e)
        this.$toast.error(`Charge failed: ${e.message}`)
      } finally {
        this.shipmentNowUpdate = ''
      }
    },

    async shipTomorrow() {
      this.shipmentNowUpdate = 'Updating'
      try {
        await this.SHIP_TOMORROW()
      } catch (e) {
        console.error('shipTomorrow e: ', e)
      } finally {
        this.shipmentNowUpdate = ''
      }
    },
  },
}
</script>

<template>
  <subscription-block key="next" title="Your Next Order Settings">
    <!-- <button @click.prevent="skipNextShipment">{{ skippingShipment ? 'Skipping' : 'Skip' }}</button>

  <button @click.prevent="shipTomorrow">{{ shipTomorrowUpdating ? 'Updating' : 'Ship Tomorrow' }}</button> -->

    <subscription-block-option-wrap
      v-if="activeSubscriptionNextDate"
      custom-class-for-icon="c-subscriptionBlockOptionWrap__icon--floatTop"
    >
      <subscription-block-option
        v-if="refreshNextShipDate()"
        :title="atc['portal.subscriptionSettingsShipsOnLabel'] || 'Ships On'"
        :text="refreshNextShipDate()"
        text-large
        @click.native="drawerDeliveryDateOpen = true"
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

      <div class="c-subscriptionBlockMainSetting--firstBlock-contain">
        <v-button
          v-if="chargeNowEnabled"
          key="ship-now-button"
          class="c-button--auto c-subscriptionBlockMainSetting--button c-button--primary"
          @click.native.stop="shipNow"
        >
          {{
            shipmentNowUpdate
              ? shipmentNowUpdate
              : atc['buttons.shipNow'] || 'Ship Now'
          }}
        </v-button>

        <v-button
          v-else
          key="ship-tomorrow-button"
          class="c-button--auto c-subscriptionBlockMainSetting--button c-button--primary"
          @click.native.stop="shipTomorrow"
        >
          {{
            shipmentNowUpdate
              ? shipmentNowUpdate
              : atc['buttons.shipTomorrow'] || 'Ship Tomorrow'
          }}
        </v-button>

        <v-button
          class="c-button--auto c-subscriptionBlockMainSetting--button c-button--transparent"
          @click.native.stop="skipNextShipment"
        >
          {{
            skipShipmentUpdate
              ? skipShipmentUpdate
              : atc['buttons.skipNextShipment'] || 'Skip Next Shipment'
          }}
        </v-button>
      </div>
    </subscription-block-option-wrap>

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

    <subscription-block-option-wrap @onClick="drawerProductsOpen = true">
      <subscription-block-option
        v-if="activeSubscriptionProducts"
        :title="atc['subscriptionSettingsProductsLabel'] || 'Products'"
      >
        <product-option
          v-for="(product, index) in activeSubscriptionProducts"
          :key="product.id + '-' + index"
          :product="product"
        />

        <strong v-if="!atleastOneItemInStock" class="c-outOfStockBlock">
          {{
            atc['portal.allItemsOutOfStockMessage'] ||
              'All items are out of stock. This charge will be skipped and attempted again next cycle.'
          }}
        </strong>
      </subscription-block-option>

      <content-placeholders v-else>
        <content-placeholders-heading :img="true" />
        <content-placeholders-heading :img="true" />
      </content-placeholders>
      <!-- Drawer Portal -->
      <portal v-if="drawerProductsOpen" to="drawers">
        <drawer-products
          :show="drawerProductsOpen"
          @close="drawerProductsOpen = false"
        />
      </portal>
    </subscription-block-option-wrap>

    <subscription-block-option-wrap @onClick="drawerDiscountOpen = true">
      <subscription-block-option
        v-if="discountText"
        :title="
          discountAmount
            ? atc['labels.activeDiscount'] || 'Active Discount'
            : atc['labels.discount'] || 'Discount'
        "
        :text="discountText"
        :text-med="!discountAmount"
      />

      <content-placeholders v-else>
        <content-placeholders-heading />
      </content-placeholders>

      <!-- Drawer Portal -->
      <portal v-if="drawerDiscountOpen" to="drawers">
        <drawer-discount
          :show="drawerDiscountOpen"
          @close="drawerDiscountOpen = false"
        />
      </portal>
    </subscription-block-option-wrap>

    <subscription-block-option-wrap @onClick="handleOpenShippingMethodDrawer">
      <subscription-block-option
        v-if="shippingMethod"
        :title="
          atc['portal.subscriptionSettingsShippingMethodLabel'] ||
            'Shipping Method'
        "
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
      <subscription-block-option v-if="totalPriceText" :text="totalPriceText" />
      <content-placeholders v-else>
        <!-- <content-placeholders-heading /> -->
        <content-placeholders-text
          :lines="1"
          style="margin-top: 4px; margin-bottom: 4px"
        />
      </content-placeholders>
    </subscription-block-option-wrap>
  </subscription-block>
</template>
