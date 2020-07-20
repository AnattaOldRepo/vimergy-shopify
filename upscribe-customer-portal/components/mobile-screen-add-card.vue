<template>
  <div class="c-addressPayment__formattedComponent">
    <portal to="header">
      <the-header
        middle-html="Add Payment Methods"
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
import AddPaymentMethodMobile from '@components/add-payment-method-mobile'
import TheHeader from '@components/the-header'

export default {
  components:{
   AddPaymentMethodMobile,
   TheHeader,
  },

  methods: {
    handleHeaderAction(){
      this.$refs['add-payment-method-mobile'].handleClear()
    },
  },
}
</script>
