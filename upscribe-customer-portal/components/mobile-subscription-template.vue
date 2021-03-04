<template>
  <div
    v-if="activeSubscription && !isOpeningOrder"
    class="c-mobileSubscriptionTemplate"
  >
    <div v-if="hasProductRow" class="c-mobileSubscriptionTemplate--top">
      <h2 class="c-mobileSubscriptionTemplate__productTitle"
        >{{
          editNextOrder
            ? atc['labels.productsInYourNextOrder'] || 'Products in your next order'
            : atc['labels.productsInYourSubscription'] || 'Products in your subscription'
        }}
        | {{ currencySymbol
        }}{{
          editNextOrder
            ? activeSubscription.next.total_price.toFixed(2)
            : activeSubscription.total_price.toFixed(2)
        }}</h2
      >
      <product-row
        v-if="
          $route.query.template === 'next-shipment' ||
            $route.query.editNextOrder
        "
        :products="activeSubscription.next.items"
        :shopify-order-id="activeSubscription.shopify_order_id"
      />
      <product-row
        v-else
        :products="activeSubscription.items"
        :shopify-order-id="activeSubscription.shopify_order_id"
      />
    </div>

    <div class="c-mobileSubscriptionTemplate--botom">
      <h2
        v-if="functionalBlockTitle"
        class="c-mobileSubscriptionTemplate__productTitle"
        >{{ functionalBlockTitle }}</h2
      >

      <slot name="functionality-block"> </slot>
    </div>

    <slot> </slot>

    <portal v-if="activeSubscription && isOpenModalCalendar" to="modals">
      <modal-calendar-picker :show="isOpenModalCalendar" />
    </portal>
  </div>
</template>

<script>
import ProductRow from '@components/product-row.vue'
import { mapMutations, mapGetters, mapState } from 'vuex'
import ModalCalendarPicker from '@components/modal-calendar-picker.vue'
// import SubscriptionHeadline from '@components/subscription-headline.vue'

export default {
  components: {
    ProductRow,
    ModalCalendarPicker,
    // SubscriptionHeadline,
  },

  props: {
    functionalBlockTitle: {
      type: String,
      default: '',
    },
    hasProductRow: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      isOrderOpen: false,
    }
  },

  computed: {
    ...mapGetters('activeSubscription', ['activeSubscription']),

    ...mapState('modalCalendarGlobal', ['isOpenModalCalendar']),

    ...mapState('translations', ['atc']),

    ...mapState('editMode', ['editNextOrder']),

    ...mapState('shop', ['currencySymbol']),

    isOpeningOrder() {
      return !!this.$route.query.orderId
    },
  },

  methods: {
    ...mapMutations('activeSubscription', ['setActiveSubscriptionId']),
  },
}
</script>

<style lang="scss">
@import '@design';

.c-mobileSubscriptionTemplate {
  @include bp(tablet) {
    padding: 20px 0;
  }
}

.c-mobileSubscriptionTemplate__productTitle {
  padding: 24px 0 0;
  margin: 0 auto 8px;
  font-size: 12px;
  line-height: 16px;
  color: $color-blue-secondary;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.c-mobileSubscriptionTemplate--top {
  max-width: 400px;
  padding: 0 16px;
  margin: 0 auto 24px;

  @media (min-width: 425px) {
    padding: 0;
  }
}

.c-mobileSubscriptionTemplate--botom {
  max-width: 400px;
  padding: 0 16px;
  margin: 0 auto;

  @media (min-width: 425px) {
    padding: 0;
  }
}

.c-mobileSubscriptionTemplate__tools {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 0 auto;
}

.c-mobileSubscriptionTemplate__order {
  width: 100%;
  max-width: 600px;
  padding: 24px 20px 64px;
  margin: 0 auto;
}
</style>
