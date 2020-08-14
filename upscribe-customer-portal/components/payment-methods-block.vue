<script>
import { mapMutations, mapState } from 'vuex'

import VueCheckbox from '@components/vue-checkbox.vue'
import BraintreePaymentOptions from '@components/braintree-payment-options.vue'
import StripePaymentOptions from '@components/stripe-payment-options.vue'
import StripePaymentRedirectHandling from '@components/stripe-payment-redirect-handling.vue'
import VButton from '@components/v-button.vue'
import EditCardForm from '@components/edit-card-form.vue'


import detectBrowser from '@utils/detectBrowser.js'

export default {
  components: {
    StripePaymentOptions,
    BraintreePaymentOptions,
    StripePaymentRedirectHandling,
    VButton,
    VueCheckbox,
    EditCardForm,
  },
  props: {
    updating: {
      type: Boolean,
      default: true,
    },
    submitButtonText: {
      type: String,
      required: true,
    },
    editPaymentMethodMode: {
      type: Boolean,
      default: false,
    },
  },
  data: () => {
    return {
      makeDefault: false,

      browser: null,

      loadedStripe: false,
      completeStripeCardInfo: false,
      activeExistingCard: null,
      useNewPaymentState: true,

      orderSuccessfullyPlaced: false,
      placeOrderPending: null,
      placeOrderError: null,

      activePaymentType: null,

      stripePaymentRequestEnabled: false,
      processingRedirectPaymentVerification: false,
    }
  },

  computed: {
   ...mapState('customer', ['paymentCards']),

    ...mapState('cards', ['activeEditCard']),

    ...mapState('translations', ['atc']),

    ...mapState('shop', [
      'stripePublicKey',
      'payment_type',
    ]),

    ...mapState('payment', [
      'paymentType',
      'paymentSource',
      'savedSourceData',
    ]),

		isCustomerDefaultPaymentMethod() {
			const { customerDefaultPaymentId, activeEditCard } = this
			return customerDefaultPaymentId === activeEditCard.id
		},

    paymentRequestText() {
      const { browser } = this
      if (!browser) return 'Payment Request'

      const {
        // isFirefox,
        isChrome,
        isSafari,
        // isOpera,
        isIE,
        isEdge,
        // isBlink,
      } = browser

      if (isChrome) return 'Google Pay'
      if (isSafari) return 'Apple Pay'
      if (isIE || isEdge) return 'Microsoft Pay'

      return 'Payment Request'
    },

    paymentTypes() {
      const { payment_type } = this
      return payment_type || []
    },
  },

  watch: {
    useNewPaymentState: {
      immediate: true,
      handler: function(useNewPayment) {
        if (!useNewPayment) {
          this.activePaymentType = null
        }

        else if (useNewPayment === true && this.paymentCards && this.paymentCards.length) {
          this.activeExistingCard = this.paymentCards[0]
        }
      },
    },
  },

  mounted() {
    const { paymentCards, editPaymentMethodMode, activeEditCard, stripePublicKey} = this

    if (editPaymentMethodMode) {
      this.activePaymentType = activeEditCard.type
    }

    this.setBrowser()

    // this.resetCheckoutUiState()
    // reset on new load
    this.orderSuccessfullyPlaced = false

    if (process.browser && stripePublicKey) {
      let domElement = document.createElement('script')
      domElement.setAttribute('src', 'https://js.stripe.com/v3/')
      domElement.onload = () => {
        this.loadedStripe = true
      }
      document.body.appendChild(domElement)
    }

    if (paymentCards && paymentCards.length) {
      this.activeExistingCard = paymentCards[0]
      this.useNewPaymentState = false
    } else {
      this.useNewPaymentState = true
    }

    this.handlePotentialPaymentVerificationRedirects()

  },

  methods: {
    setBrowser() {
      const result = detectBrowser()
      this.browser = result
    },

    ...mapMutations('payment', [
      'setPaymentValidationClientSecret',
      'setPaymentValidationSource',
      'setPaymentValidationLiveMode',
    ]),

    handleMakeDefault() {
      this.makeDefault = !this.makeDefault
    },

    handlePotentialPaymentVerificationRedirects() {
      const { $route, paymentType } = this
      const queryParams = $route.query || {}
      const { client_secret, livemode, source } = queryParams

      if (client_secret || livemode || source) {
          this.setPaymentValidationClientSecret(client_secret)
          this.setPaymentValidationSource(source)
          this.setPaymentValidationLiveMode(livemode)

        // not using existing card
        this.useNewPayment()
      }

      // set payment type selection
      if (paymentType) {
        this.setActivePaymentType(paymentType)
      }
    },

    handleClear(){
      if (!this.$refs['stripe-payment-options']) return
      this.$refs['stripe-payment-options'].handleClear()
    },

    toggleActivePaymentType(type) {
      const { activePaymentType } = this
      if (activePaymentType === type) {
        this.activePaymentType = null
      } else {
        this.activePaymentType = type
      }
    },

    displayPaymentType(type) {
      const { paymentTypes, activePaymentType } = this
      let paymentTypeEnabled = false
      let displayPaymentType = false

      if (paymentTypes.includes(type)) {
        paymentTypeEnabled = true
      }
      if (!activePaymentType || activePaymentType === type) {
        displayPaymentType = true
      }

      return paymentTypeEnabled && displayPaymentType
    },

    handleStripeElementChange(payload) {
      this.completeStripeCardInfo = payload.complete
      if (payload.error) {
        console.log({error: payload.error})
      }
    },

    handleSubmitPaymentForm() {
      // console.log('handleSubmitPaymentForm')
    },

    createPaymentMethodHandler() {
      const { activePaymentType } = this

      if (!activePaymentType) {
        this.placeOrderError = {
          status: 'ERROR',
          message: 'Please select payment type',
        }
        return
      }

      if (!this.completeStripeCardInfo && activePaymentType.includes('stripe') ) {
        this.placeOrderError = {
          status: 'ERROR',
          message: 'Please complete the payment form',
        }
        return

      } else {
        this.creatingPaymentMethodPendingError = false
        this.creatingPaymentMethodPending = false
      }

      const stripePaymentOptions = this.$refs['stripe-payment-options']
      const braintreePaymentOptions = this.$refs['braintree-payment-options']

      this.creatingPaymentMethodPending = true

      if (activePaymentType.includes('stripe')) {
        let activeStripePaymentTypeEl = stripePaymentOptions.$refs['active-payment-type-' + activePaymentType]
        activeStripePaymentTypeEl.createPaymentMethod()
      } else {
        let activeBraintreePaymentTypeEl = braintreePaymentOptions.$refs['active-payment-type-' + activePaymentType]
        activeBraintreePaymentTypeEl.createPaymentMethod()
      }
    },

		async updateCard({
			cardName,
			cardMonth,
			cardYear,
			cardZipcode,
			cardDefault,
		}) {
      const { activePaymentType } = this


			const updatePayload = {}
			if (cardName) updatePayload.name = cardName
			if (cardMonth) updatePayload.exp_month = cardMonth
			if (cardYear) updatePayload.exp_year = cardYear
			if (cardZipcode) updatePayload.address_zip = cardZipcode
			if (cardDefault) updatePayload.default = cardDefault ? 1 : 0

      this.$emit('finalPaymentPayloadResponse', {updatePaymentData: updatePayload, paymentType: activePaymentType})
		},

    handlePlaceOrderResponseFromRedirect({fullResponse, paymentData, paymentType}) {
      // console.log('handlePlaceOrderResponseFromRedirect', {fullResponse, paymentData, paymentType})
    },

    handleCreatePaymentMethodResponse({fullResponse, newPaymentData, updatePaymentData, paymentType}) {
      const { makeDefault } = this
      // console.log('handleCreatePaymentMethodResponse', {fullResponse, newPaymentData, updatePaymentData, paymentType})

      this.$emit('finalPaymentPayloadResponse', {
        fullResponse,
        newPaymentData: {
          ...newPaymentData,
          default: makeDefault ? 1 : undefined,
        },
        updatePaymentData,
        paymentType,
      })

    },

    handleEnableStripePaymentRequest(val) {
      this.stripePaymentRequestEnabled = true
    },

    handleProcessingRedirectPaymentVerification(val) {
      this.processingRedirectPaymentVerification = val
    },
  },
}
</script>

<template>
<div v-if="loadedStripe && stripePublicKey" class="c-defaultModal__main">
  <div v-if="useNewPaymentState || (!paymentCards || !paymentCards.length) || editPaymentMethodMode"
  :class="{'c-paymentMethods__innerBlock c-paymentMethods__innerBlock--color': !editPaymentMethodMode}">

    <div v-if="!editPaymentMethodMode" class="c-paymentMethods__innerOptions c-paymentMethods__innerOptions--add" style="padding: 0">
      <a
        v-if="displayPaymentType('stripe_card')"
        href=""
        class="c-newPaymentOptions__option c-heading4"
        :class="{ 'c-newPaymentOptions__option--selected': activePaymentType === 'stripe_card' }"
        @click.prevent="toggleActivePaymentType('stripe_card')"
        >
        <span class="c-newPaymentOptions__optionText">Card</span>
        <svg class="c-newPaymentOptions__optionIcon" width="15" height="8" xmlns="http://www.w3.org/2000/svg"><path d="M7.2 8c-.258 0-.516-.096-.713-.288L.295 1.678a.965.965 0 0 1 0-1.39 1.027 1.027 0 0 1 1.426 0L7.2 5.628l5.478-5.34a1.027 1.027 0 0 1 1.426 0 .965.965 0 0 1 0 1.39L7.913 7.712A1.019 1.019 0 0 1 7.2 8z" fill="#666"/></svg>
      </a>

      <a
        v-if="displayPaymentType('stripe_sepa_direct_debit')"
        href
        class="c-newPaymentOptions__option c-heading4"
        :class="{ 'c-newPaymentOptions__option--selected': activePaymentType === 'stripe_sepa_direct_debit' }"
        @click.prevent="toggleActivePaymentType('stripe_sepa_direct_debit')"
        >
        <span class="c-newPaymentOptions__optionText">SEPA Direct Debit</span>
        <svg class="c-newPaymentOptions__optionIcon" width="15" height="8" xmlns="http://www.w3.org/2000/svg"><path d="M7.2 8c-.258 0-.516-.096-.713-.288L.295 1.678a.965.965 0 0 1 0-1.39 1.027 1.027 0 0 1 1.426 0L7.2 5.628l5.478-5.34a1.027 1.027 0 0 1 1.426 0 .965.965 0 0 1 0 1.39L7.913 7.712A1.019 1.019 0 0 1 7.2 8z" fill="#666"/></svg>
        </a
      >

      <a
        v-if="displayPaymentType('stripe_ideal')"
        href
        class="c-newPaymentOptions__option c-heading4"
        :class="{ 'c-newPaymentOptions__option--selected': activePaymentType === 'stripe_ideal' }"
        @click.prevent="toggleActivePaymentType('stripe_ideal')"
        >
        <span class="c-newPaymentOptions__optionText">iDEAL</span>
        <svg class="c-newPaymentOptions__optionIcon" width="15" height="8" xmlns="http://www.w3.org/2000/svg"><path d="M7.2 8c-.258 0-.516-.096-.713-.288L.295 1.678a.965.965 0 0 1 0-1.39 1.027 1.027 0 0 1 1.426 0L7.2 5.628l5.478-5.34a1.027 1.027 0 0 1 1.426 0 .965.965 0 0 1 0 1.39L7.913 7.712A1.019 1.019 0 0 1 7.2 8z" fill="#666"/></svg>
        </a
      >

      <a
        v-if="displayPaymentType('stripe_bancontact')"
        href
        class="c-newPaymentOptions__option c-heading4"
        :class="{ 'c-newPaymentOptions__option--selected': activePaymentType === 'stripe_bancontact' }"
        @click.prevent="toggleActivePaymentType('stripe_bancontact')"
        >
        <span class="c-newPaymentOptions__optionText">Bancontact</span>
        <svg class="c-newPaymentOptions__optionIcon" width="15" height="8" xmlns="http://www.w3.org/2000/svg"><path d="M7.2 8c-.258 0-.516-.096-.713-.288L.295 1.678a.965.965 0 0 1 0-1.39 1.027 1.027 0 0 1 1.426 0L7.2 5.628l5.478-5.34a1.027 1.027 0 0 1 1.426 0 .965.965 0 0 1 0 1.39L7.913 7.712A1.019 1.019 0 0 1 7.2 8z" fill="#666"/></svg>
        </a
      >

      <a
        v-if="displayPaymentType('stripe_sofort')"
        href
        class="c-newPaymentOptions__option c-heading4"
        :class="{ 'c-newPaymentOptions__option--selected': activePaymentType === 'stripe_sofort' }"
        @click.prevent="toggleActivePaymentType('stripe_sofort')"
        >
        <span class="c-newPaymentOptions__optionText">Sofort</span>
        <svg class="c-newPaymentOptions__optionIcon" width="15" height="8" xmlns="http://www.w3.org/2000/svg"><path d="M7.2 8c-.258 0-.516-.096-.713-.288L.295 1.678a.965.965 0 0 1 0-1.39 1.027 1.027 0 0 1 1.426 0L7.2 5.628l5.478-5.34a1.027 1.027 0 0 1 1.426 0 .965.965 0 0 1 0 1.39L7.913 7.712A1.019 1.019 0 0 1 7.2 8z" fill="#666"/></svg>
      </a>

        <a
          v-if="displayPaymentType('braintree_card')"
          href
          class="c-newPaymentOptions__option c-heading4"
          :class="{ 'c-newPaymentOptions__option--selected': activePaymentType === 'braintree_card' }"
          @click.prevent="toggleActivePaymentType('braintree_card')"
          >
          <span class="c-newPaymentOptions__optionText">Braintree Card</span>
          <svg class="c-newPaymentOptions__optionIcon" width="15" height="8" xmlns="http://www.w3.org/2000/svg"><path d="M7.2 8c-.258 0-.516-.096-.713-.288L.295 1.678a.965.965 0 0 1 0-1.39 1.027 1.027 0 0 1 1.426 0L7.2 5.628l5.478-5.34a1.027 1.027 0 0 1 1.426 0 .965.965 0 0 1 0 1.39L7.913 7.712A1.019 1.019 0 0 1 7.2 8z" fill="#666"/></svg>
          </a>

        <a
          v-if="displayPaymentType('braintree_paypal')"
          href
          class="c-newPaymentOptions__option c-heading4"
          :class="{ 'c-newPaymentOptions__option--selected': activePaymentType === 'braintree_paypal' }"
          @click.prevent="toggleActivePaymentType('braintree_paypal')"
          >
          <span class="c-newPaymentOptions__optionText">Braintree Paypal</span>
          <svg class="c-newPaymentOptions__optionIcon" width="15" height="8" xmlns="http://www.w3.org/2000/svg"><path d="M7.2 8c-.258 0-.516-.096-.713-.288L.295 1.678a.965.965 0 0 1 0-1.39 1.027 1.027 0 0 1 1.426 0L7.2 5.628l5.478-5.34a1.027 1.027 0 0 1 1.426 0 .965.965 0 0 1 0 1.39L7.913 7.712A1.019 1.019 0 0 1 7.2 8z" fill="#666"/></svg>
          </a>

      </div>
    </div>

  <div v-if="editPaymentMethodMode">
    <div
      class="c-paymentMethods__options c-paymentMethods__options--edit"
      :class="{
        'c-paymentMethods__options--visible': activePaymentType,
      }"
    >
      <edit-card-form
        class="c-formBlock c-cardForm"
        form-submit-button-text="Update Payment Method"
        form-name="update-card"
        update-card
        :payment-method-type="activePaymentType"
        :is-customer-default-payment-method="isCustomerDefaultPaymentMethod"
        @onSubmit="updateCard"
      />
    </div>

    <div class="mt-30" style="display: flex; justify-content: space-between">
      <v-button
        class="c-cardCancelButton"
        style="margin-top:30px;"
        type="link"
        @onClick="$emit('remove')"
        >{{ atc['buttons.removeCard'] || 'Remove Payment Method' }}</v-button
      >

      <div>
        <!-- <a
        class="button is-info"
        :class="{ 'is-loading': updating }"
        @click.prevent="createPaymentMethodHandler"
        >{{ submitButtonText }}</a
      > -->

        <v-button
          class="c-cardCancelButton"
          style="margin-top:30px;"
          type="link"
          @onClick="$emit('cancel')"
          >{{ atc['buttons.cancel'] || 'Cancel' }}</v-button
        >
      </div>
    </div>
  </div>


  <div v-else class="c-paymentMethods__options c-paymentMethods__options--add "
    :class="{ 'c-paymentMethods__options--visible': activePaymentType && loadedStripe }"
  >
    <braintree-payment-options
      v-if="displayPaymentType('braintree_card') || displayPaymentType('braintree_paypal')"
      v-show="activePaymentType && activePaymentType.includes('braintree')"
      ref="braintree-payment-options"
      :active-payment-type="activePaymentType"
      :place-order-pending="placeOrderPending"
      @submitPaymentForm="handleSubmitPaymentForm"
      @createPaymentMethodResponse="handleCreatePaymentMethodResponse"
    />

    <stripe-payment-options
      v-if="loadedStripe && stripePublicKey"
      ref="stripe-payment-options"
      :active-payment-type="activePaymentType"
      :stripe-payment-request-enabled="stripePaymentRequestEnabled"
      :stripe-public-key="stripePublicKey"
      @enableStripePaymentRequest="handleEnableStripePaymentRequest"
      @handleChange="handleStripeElementChange"
      @submitPaymentForm="handleSubmitPaymentForm"
      @createPaymentMethodResponse="handleCreatePaymentMethodResponse"
    />

    <vue-checkbox
      style="margin-top:20px; margin-top: 20px"
      name="accepts-marketing"
      label="Make default payment method"
      :checked="makeDefault"
      @input="handleMakeDefault"
    />

    <div style="display:flex; margin-top:20px;">
      <v-button
        :text="atc['buttons.cancel'] || 'Cancel'"
        type="link"
        class="c-paymentMethodsBlock__button--white c-paymentMethodsBlock__buttonCancel"
        @onClick="$emit('cancel')"
      />

      <v-button
        :class="{ 'is-loading': updating }"
        :text="submitButtonText"
        @onClick="createPaymentMethodHandler"
      />
    </div>

    <stripe-payment-redirect-handling
      v-if="loadedStripe"
      @processingRedirectPaymentVerification="handleProcessingRedirectPaymentVerification"
      @enableStripePaymentRequest="handleEnableStripePaymentRequest($event)"
      @handleChange="handleStripeElementChange"
      @submitPaymentForm="handleSubmitPaymentForm"
      @placeOrderResponseFromRedirect="handlePlaceOrderResponseFromRedirect"
    />
  </div>

</div>
</template>


<style lang="scss">
@import '@design';

.c-defaultModal__main{
  background-color: $color-white;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #eaf1f4;
}

.c-block--payment {
  margin-bottom: 22px;
}

.c-billing__cardOptionTitleWrap {
  @include clearfix;
  margin-bottom: 20px;
}

.c-billing__cardOptionTitle {
  @include column(1/2);
  display: block;
  margin-top: 20px;
  margin-bottom: 10px;
  text-decoration: none;
  cursor: pointer;
  text-align: center;
  border: 1px solid $color-gray-300;
  padding: 20px;
  border-radius: 5px;
  color: $color-text-light;
  font-size: 17px;
  transition: all 0.1s ease;

  &:visited {
    color: $color-gray-300;
  }

  &:hover,
  &:focus,
  &:active {
    color: $color-primary;
    border-color: $color-primary;
  }

  &--selected,
  &--selected:visited {
    border-color: $color-primary;
    color: $color-primary;


  }
}

.c-checkoutStepThree__button {
  margin-top: 20px;
  // margin-bottom: 66px;
}

.c-billing__stripeCard {
  display: block;
  padding: 13px;
  margin-bottom: 16px;
  background-color: $color-gray-100 !important;
  background-color: #fafafa !important;
}

.c-form__submitStatusWrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

.c-newPaymentOptions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-column-gap: 20px;
  margin-bottom: 20px;
  width: 100%;
}


.c-newPaymentOptions__option {
  display: block;
  text-decoration: none;
  cursor: pointer;
  border-bottom: 1px solid #EAF1F4;
  padding: 14px;
  padding-left: 54px;
  color: #171725;
  font-size: 18px;
  transition: all 0.1s ease;
  font-family: $font-primary-bold;
  font-weight: 700;
  position: relative;
  text-decoration: none;
  transition: .3s ease all;
  &:visited {
    color: #171725;
  }

  &:hover {
    background-color: #EAF1F4;
  }

  &:hover,
  &:focus,
  &:active {
    color: #171725;
    border-color: #EAF1F4;
  }

  &:last-of-type {
    border-bottom: none;
  }

  &--selected,
  &--selected:visited {
    color: #171725;

    &:last-of-type {
      border-bottom: 1px solid #EAF1F4;
    }
  }
}

.c-newPaymentOptions__optionText {

}

.c-newPaymentOptions__optionIcon {
  position: absolute;
  right: 12px;
  top: 22px;
  transform: translate(-50%) rotate(-90deg);

  .c-newPaymentOptions__option--selected & {
    right: auto;
    left: 26px;
    transform: translate(-50%) rotate(90deg);
  }
}

.c-paymentMethods {
  background: #F7F9FB;
  border: 1px solid #EAF1F4;
  border-radius: 4px;
}

.c-paymentMethods__block {
  border-bottom: 1px solid #EAF1F4;
  &:last-of-type {
    border-bottom: none;
  }
}

.c-paymentMethods__blockMain {
  background-color: $color-white;
}


.c-paymentMethod__option {
  display: block;
  padding: 16px;
  border-bottom: 1px solid $color-border;
  cursor: pointer;

  &:last-of-type {
    border: none;
  }
}

.c-paymentMethod__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.c-paymentMethod__block1 {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
}

.c-paymentMethod__pseudoRadio {
  width: 22px;
  height: 22px;
  margin-right: 18px;
  background-color: #A3B5BF;
  border: 1px solid #A3B5BF;
  border-radius: 50px;

  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #A3B5BF;
  border-color: #A3B5BF;

  &::after {
    position: absolute;
    width: 18px;
    height: 18px;
    content: '';
    background-color: $color-white;
    border-radius: 20px;
  }

  .c-paymentMethod__option--active & {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #A3B5BF;
    border-color: #A3B5BF;

    &::after {
      position: absolute;
      width: 8px;
      height: 8px;
      content: '';
      background-color: $color-white;
      border-radius: 20px;
    }
  }
}

.c-paymentMethods__optionInfo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;
  width: 100%;

}

.c-paymentMethods__optionLeft {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
}

.c-paymentMethods__optionRight {

}

.c-paymentMethods__optionName {
  font-size: 18px;
  font-family: $font-primary-regular;
}

.c-paymentMethods__optionPrice {
  font-size: 16px;
  font-family: $font-primary-medium;
  font-weight: 500;
}

.c-paymentMethods__optionDiscountName {
  font-size: 14px;
  color: $color-text;
}

.c-paymentMethods__innerBlock--color {
  background: #F7F9FB;
  border: 1px solid #EAF1F4;
}

.c-paymentMethods__innerOptions{
  padding-left: 44px;
}


.c-paymentMethods__innerOption {
  border-bottom: 1px solid #EAF1F4;
  &:last-of-type {
    border-bottom: none;
  }
}

.c-paymentMethods__options {
  display: none;

  &--add {
    margin-top: 20px;
  }

  &--visible {
    display: block;
  }
}

.c-paymentMethodsBlock__button--white{
  background-color: $color-white;
  border-color: $color-white;
}

.c-paymentMethodsBlock__buttonCancel{
  display: none;
  @include bp(tablet){
    display: block;
  }
}


</style>
