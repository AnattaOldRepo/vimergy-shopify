<script>
export default {
  props: {
    stripePublicKey: {
      type: [Boolean, String],
      required: true,
    },
  },
  data: () => {
    return {
      card: null,
      stripe: null,
      error: '',
      style: {
        base: {
          color: '#32325d',
          fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
          fontSmoothing: 'antialiased',
          fontSize: '16px',
          '::placeholder': {
            color: '#aab7c4',
          },
        },
        invalid: {
          color: '#fa755a',
          iconColor: '#fa755a',
        },
      },
    }
  },
  mounted() {
    const vm = this
    const { style } = this
    const stripe = window.Stripe(vm.stripePublicKey)
    const elements = stripe.elements()

    // Create an instance of the card Element.
    var card = elements.create('card', {style})

    this.stripe = stripe
    this.card = card

    // Add an instance of the card Element into the `card-element` <div>.
    card.mount('#card-element')
    card.addEventListener('change', function(event) {
      vm.handleChange(event)
    })
  },
  methods: {
    handleChange($event) {
      console.log({$event})
      if ($event.error) {
        this.error = $event.error.message
      } else {
        this.error = ''
      }
      this.$emit('handleChange', $event)
    },

    handleClear(){
      this.card.clear()
    },

    createPaymentMethod() {
      console.log('createPaymentMethod')
      const vm = this
      this.stripe.createToken(vm.card).then((result) => {
        if (result.error) {

          vm.error = result.error.message
        } else {
          // Send the token to your server.
          console.log('success place order in type', {token: result.token})
          // stripeTokenHandler(result.token);
          vm.$emit('createPaymentMethodResponse', {
            fullResponse: result,
            newPaymentData: result.token,
            updatePaymentData: result.token.card,
            paymentType: 'stripe_card',
          })
        }
      })
    },
    createToken() {
      const vm = this
      this.stripe.createToken(vm.card).then((result) => {
        if (result.error) {

          vm.error = result.error.message
        } else {
          // Send the token to your server.
          console.log({token: result.token})
          // stripeTokenHandler(result.token);
          this.$emit('createStripeCardToken', result.token)
        }
      })
    },
  },
}
</script>

<template>
  <form class="c-stripeCard" @submit.prevent="$emit('submitPaymentForm')">
    <div class="form-row">
      <div id="card-element">
        <!-- A Stripe Element will be inserted here. -->
      </div>

      <div v-if="error" id="card-errors" role="alert" class="c-stripeErrors">{{ error }}</div>
    </div>
  </form>
</template>

<style lang="scss" scoped>
@import '@design';

#card-element {
  display: block;
  width: 100%;
  margin-bottom: 36px;
  font-size: 14px;
  border: 1px solid #d8d8d8;
  border-radius: 5px;
  padding: 13px;
  margin-bottom: 16px;
  // background-color: #fafafa!important;
}

.c-stripeCard {
  width: 100%;
}

// .StripeElement {
//   box-sizing: border-box;

//   height: 40px;

//   padding: 10px 12px;

//   border: 1px solid transparent;
//   border-radius: 4px;
//   background-color: white;

//   box-shadow: 0 1px 3px 0 #e6ebf1;
//   -webkit-transition: box-shadow 150ms ease;
//   transition: box-shadow 150ms ease;
// }

// .StripeElement--focus {
//   box-shadow: 0 1px 3px 0 #cfd7df;
// }

// .StripeElement--invalid {
//   border-color: #fa755a;
// }

// .StripeElement--webkit-autofill {
//   background-color: #fefde5 !important;
// }
</style>
