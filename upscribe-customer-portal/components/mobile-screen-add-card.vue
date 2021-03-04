<template>
  <div class="c-addressPayment__formattedComponent">
    <portal to="header">
      <the-header
        :middle-html="atc['portal.addPaymentMethodsDrawerTitle'] || 'Add Payment Methods'"
        mode="customized"
        customized-func-text="Cancel"
        @headerAction="handleHeaderAction"
      />
    </portal>

    <no-ssr>
      <add-payment-method-mobile
        ref="add-payment-method-mobile"
      />
    </no-ssr>
  </div>
</template>


<script>
import { mapActions } from 'vuex'
import AddPaymentMethodMobile from '@components/add-payment-method-mobile'
import TheHeader from '@components/the-header'

export default {
  components:{
   AddPaymentMethodMobile,
   TheHeader,
  },

  methods: {
    ...mapActions('mobileGlobalManagement', ['swapPageTransitionDynamic']),

    handleHeaderAction(){
      if (this.$refs['add-payment-method-mobile']) {
        this.$refs['add-payment-method-mobile'].handleClear()
      }
      this.goBackRoute()
    },

    goBackRoute(){
      this.swapPageTransitionDynamic('page')
      this.$router.go(-1)
    },
  },
}
</script>
