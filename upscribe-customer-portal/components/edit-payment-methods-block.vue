<script>
import { mapState } from 'vuex'

import EditCardForm from '@components/edit-card-form.vue'

export default {
  components: {
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
  },
  data: () => {
    return {
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

    ...mapState('shop', ['stripePublicKey', 'store']),

    ...mapState('customer', ['customerDefaultPaymentId']),

    ...mapState('payment', ['paymentType', 'paymentSource', 'savedSourceData']),

    isCustomerDefaultPaymentMethod() {
      const { customerDefaultPaymentId, activeEditCard } = this
      return customerDefaultPaymentId === activeEditCard.id
    },

    paymentRequestText() {
      const { browser, atc } = this
      if (!browser) return atc['labels.paymentRequest'] || 'Payment Request'

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

      return atc['labels.paymentRequest'] || 'Payment Request'
    },

    paymentTypes() {
      const { store } = this
      return store.payment_type || []
    },
  },

  watch: {
    useNewPaymentState: {
      immediate: true,
      handler: function(useNewPayment) {
        if (!useNewPayment) {
          this.activePaymentType = null
        } else if (
          useNewPayment === true &&
          this.paymentCards &&
          this.paymentCards.length
        ) {
          this.activeExistingCard = this.paymentCards[0]
        }
      },
    },
  },

  mounted() {
    const { paymentCards, activeEditCard } = this

    this.activePaymentType = activeEditCard.type

    // this.resetCheckoutUiState()
    // reset on new load
    this.orderSuccessfullyPlaced = false

    if (process.browser && this.stripePublicKey) {
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
  },

  methods: {
    async updateCard({
      cardName,
      cardMonth,
      cardYear,
      cardZipcode,
      cardDefault,
      cardCvv,
    }) {
      const { activePaymentType } = this

      const updatePayload = {}
      if (cardName) updatePayload.name = cardName
      if (cardMonth) updatePayload.exp_month = cardMonth
      if (cardYear) updatePayload.exp_year = cardYear
      if (cardZipcode) updatePayload.address_zip = cardZipcode
      if (cardDefault) updatePayload.default = cardDefault ? 1 : 0
      if (cardCvv) updatePayload.cvv = parseInt(cardCvv)

      this.$emit('finalPaymentPayloadResponse', {
        updatePaymentData: updatePayload,
        paymentType: activePaymentType,
      })
    },

    handleCardRemove() {
      this.$emit('remove')
    },

    handleCreatePaymentMethodResponse({
      fullResponse,
      newPaymentData,
      updatePaymentData,
      paymentType,
    }) {
      this.$emit('finalPaymentPayloadResponse', {
        fullResponse,
        newPaymentData,
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
  <div v-if="activePaymentType" class="c-defaultModal__main">
    <div
      class="c-paymentMethods__options"
      :class="{
        'c-paymentMethods__options--visible': activePaymentType,
      }"
    >
      <edit-card-form
        v-if="
          activePaymentType &&
            activeEditCard &&
            activeEditCard.status !== 'void'
        "
        class="c-formBlock c-cardForm"
        :form-submit-button-text="atc['buttons.updatePaymentMethod'] || 'Update Payment Method'"
        form-name="update-card"
        update-card
        :payment-method-type="activePaymentType"
        :is-customer-default-payment-method="isCustomerDefaultPaymentMethod"
        @onSubmit="updateCard"
        @onRemove="handleCardRemove"
      />

      <!-- eslint-disable-next-line vue/no-v-html -->
      <div
        v-else
        class="c-cardForm__invalidPaymentMethod"
        v-html="
          atc['errors.invalidPaymentMethodMessage'] ||
            '<p>Your bank is no longer accepting payment from this stored card.</p><p>To prevent interruptions to you future orders, please add a new payment method. You can re-enter the same credit card details.</p><p>Then delete this stored card.</p>'
        "
      />
    </div>

    <!-- <div
      class="c-editPaymentmethodsBlock-actionButtons mt-30"
      style="display: flex; justify-content: space-between"
    >
      <div>
        <a
          class="button is-info"
          :class="{ 'is-loading': updating }"
          @click.prevent="createPaymentMethodHandler"
          >{{ submitButtonText }}</a
        >

        <v-button
          class="c-cardCancelButton"
          style="margin-top:30px;"
          type="link"
          @onClick="$emit('cancel')"
          >{{ atc['buttons.cancel'] || 'Cancel' }}</v-button
        >
      </div>
    </div> -->
  </div>
</template>

<style lang="scss">
@import '@design';

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
  border-bottom: 1px solid #eaf1f4;
  padding: 14px;
  padding-left: 54px;
  color: #171725;
  font-size: 18px;
  transition: all 0.1s ease;
  font-family: $font-primary-bold;
  font-weight: 700;
  position: relative;
  text-decoration: none;
  transition: 0.3s ease all;
  &:visited {
    color: #171725;
  }

  &:hover {
    background-color: #eaf1f4;
  }

  &:hover,
  &:focus,
  &:active {
    color: #171725;
    border-color: #eaf1f4;
  }

  &:last-of-type {
    border-bottom: none;
  }

  &--selected,
  &--selected:visited {
    color: #171725;

    &:last-of-type {
      border-bottom: 1px solid #eaf1f4;
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
  background: #f7f9fb;
  border: 1px solid #eaf1f4;
  border-radius: 4px;
}

.c-paymentMethods__block {
  border-bottom: 1px solid #eaf1f4;
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
  background-color: #a3b5bf;
  border: 1px solid #a3b5bf;
  border-radius: 50px;

  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #a3b5bf;
  border-color: #a3b5bf;

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
    background-color: #a3b5bf;
    border-color: #a3b5bf;

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

.c-paymentMethods__innerBlock {
  // border: 1px solid $color-border;
  // background: #F7F9FB;
  // border: 1px solid #EAF1F4;
}
.c-paymentMethods__innerOptions {
  padding-left: 44px;
}

.c-paymentMethods__innerOption {
  border-bottom: 1px solid #eaf1f4;
  &:last-of-type {
    border-bottom: none;
  }
}

.c-paymentMethods__options {
  display: none;
  // padding: 16px;
  // background: #F7F9FB;
  // border: 1px solid #EAF1F4;

  &--visible {
    display: block;
  }
}
.c-defaultModal__main {
  .c-cardCancelButton {
    border: 1px solid $color-red;
  }
  .c-cardcancelbutton::hover {
    border: 1px solid $color-red;
  }
}

iframe#braintree-hosted-field-number { padding: 0 }

</style>
