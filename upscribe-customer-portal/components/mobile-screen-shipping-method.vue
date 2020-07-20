<template>
  <div v-if="shippingMethods" class="c-details__shippingOptions">
    <portal to="header">
      <the-header
        middle-html="Change Shipping Method"
        mode="backwardRoute"
      />
    </portal>

    <shipping-method-item
      v-for="(each, index) in shippingMethods"
      :key="each.id"
      :shipping-method="each"
      :is-selected="activeShippingMethod === each.handle"
      :index="index"
      class="c-drawerShippingMethodList__item"
      previous-middle-text="Edit Subscription Details"
      @selectShippingMethod="handleSelectShippingMethod(each)"
    />
  </div>

  <div v-else class="c-details__shippingOptions">
      <span v-if="atc['portal.shippingMethodsLoadingMethods']" class="c-details__loadingText"
        >{{ atc['portal.shippingMethodsLoadingMethods'] }}
     </span>

  </div>
</template>


<script>
import ShippingMethodItem from '@components/shipping-method-item'
import { mapState, mapGetters, mapMutations } from 'vuex'
import TheHeader from '@components/the-header'

export default {
  components:{
    ShippingMethodItem,
    TheHeader,
  },

  computed: {
    ...mapState('shippingMethods', [
      'activeEditShippingMethod',
      'shippingMethods',
    ]),

    ...mapState('translations', ['atc']),

    ...mapGetters('activeSubscription', ['activeSubscription', 'activeSubscriptionNextDate', 'activeQueue']),


    activeShippingMethod() {
      const { activeSubscription, activeQueue, editNextOrder } = this
      console.log(this.shippingMethods)
      let shippingLines = null

      if (editNextOrder) {
        shippingLines = activeQueue.shipping_lines
      } else {
        shippingLines = activeSubscription.shipping_lines
      }

      return shippingLines ? shippingLines[0].handle : false
    },
  },

  methods: {
    ...mapMutations('mobileGlobalManagement', ['setMessage', 'setStatus']),

    ...mapMutations('shippingMethods', [
      'setActiveEditShippingMethod',
      'setNewSwapShippingMethod',
    ]),

    async handleSelectShippingMethod(shippingMethod) {
      const { activeShippingMethod, selectDuringProductUpdate } = this

      // no change if same reate
      if (activeShippingMethod.handle === shippingMethod.handle) {
        console.log('no change, same rate')
        return false
      }
      this.setMessage('Updating Shipping Method')
      this.setStatus('updating')

      if (selectDuringProductUpdate) {
        console.log('selectDuringProductUpdate')
        this.setNewSwapShippingMethod(shippingMethod)

        try {
          this.COMPLETE_SAVED_NEW_CHECKOUT_UPDATE(shippingMethod)
          this.setMessage('Saved new Shipping Method')
          this.setStatus('success')
          this.triggerAnalyticsEvent({
            event: 'Upscribe Subscription Update Shipping Method',
            payload: { shippingMethod },
          })
        }
        catch(e) {
          this.setMessage(e.message)
          this.setStatus('error')
        } finally {
          this.isUpdating = false
        }
      } else {
        this.setNewSwapShippingMethod(shippingMethod)
      }
    },
  },
}
</script>


<style lang="scss">
@import '@design/_colors';
.c-details__delieveryOptions,
.c-details__shippingOptions{
  max-width: 400px;
  margin: 0 auto;
  padding: 0 16px;

  @media (min-width: 420px){
    padding: 0
  }
}

.c-details__loadingText {
  font-size: 22px;
  font-weight: 500;
  color: $color-primary;
  text-align: center;
  display: block;
}
</style>
