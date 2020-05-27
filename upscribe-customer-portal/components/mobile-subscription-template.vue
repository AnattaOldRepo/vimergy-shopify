<template>
  <div v-if="activeSubscription && !isOpeningOrder" class="c-mobileSubscriptionTemplate">
    <div v-if="hasProductRow" class="c-mobileSubscriptionTemplate--top">
      <h2 class="c-mobileSubscriptionTemplate__productTitle">Products | ${{ activeSubscription.total_price}}</h2>

      <product-row
        :products="activeSubscription.items"
        :shopify-order-id="activeSubscription.shopify_order_id"
      />
    </div>

    <div class="c-mobileSubscriptionTemplate--botom">
      <h2 v-if="functionalBlockTitle" class="c-mobileSubscriptionTemplate__productTitle">{{ functionalBlockTitle }}</h2>

      <slot name="functionality-block">
      </slot>
    </div>

    <slot>
    </slot>

    <portal v-if="activeSubscription && isOpenModalCalendar" to="modals">
      <modal-calendar-picker
        :show="isOpenModalCalendar"
      />
    </portal>
  </div>
</template>

<script>
import ProductRow from '@components/product-row.vue'
import { mapMutations, mapGetters, mapState } from 'vuex'
import ModalCalendarPicker from '@components/modal-calendar-picker.vue'

export default {
  components:{
    ProductRow,
     ModalCalendarPicker,
  },

  props:{
    functionalBlockTitle: {
      type: String,
      default: '',
    },
    hasProductRow:{
      type: Boolean,
      default: true,
    },
  },

  data(){
    return{
      isOrderOpen: false,
    }
  },

  computed: {
    ...mapGetters('activeSubscription', ['activeSubscription']),

    ...mapState('modalCalendarGlobal', ['isOpenModalCalendar']),

    ...mapState('tranlations', ['atc']),

    ...mapState('editMode', ['editNextOrder']),

    isOpeningOrder(){
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

.c-mobileSubscriptionTemplate{
  @include bp(tablet){
      padding: 20px 0;
  }
}

.c-mobileSubscriptionTemplate__productTitle{
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin: 0 auto 8px;
  color: $color-blue-secondary;
  padding: 24px 0 0;
}

.c-mobileSubscriptionTemplate--top{
  margin:0 auto 24px;
  max-width: 400px;
  padding: 0 16px;
  @media (min-width: 425px){
    padding: 0;
  }
}

.c-mobileSubscriptionTemplate--botom{
  max-width: 400px;
  padding: 0 16px;
  margin: 0 auto;
  @media (min-width: 425px){
    padding: 0;
  }
}

.c-mobileSubscriptionTemplate__tools{
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}

.c-mobileSubscriptionTemplate__order{
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    padding: 24px 20px 64px;
}

</style>
