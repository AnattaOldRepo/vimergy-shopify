<template>
  <div class="c-cardForm">
    <form-wrapper v-if="$v.form" :validator="$v.form">
      <form novalidate @submit.prevent="submit">
        <div
          v-if="
            paymentMethodType === 'braintree_card' &&
              requireBraintreeCvvValidation
          "
          class="c-cardFormWrapper"
        >
          <div class="c-formGroupWrapper">
            <form-input
              id="expirationMonth"
              v-model="form.expirationMonth"
              class="c-formGroup--half"
              type="text"
              :label="atc['forms.cardExpirationMonthLabel'] || 'Exp Month'"
              maxlength="2"
              name="expirationMonth"
              required
            />

            <form-input
              id="expirationYear"
              v-model="form.expirationYear"
              class="c-formGroup--half"
              type="text"
              maxlength="4"
              :label="atc['forms.cardExpirationYearLabel'] || 'Exp Year'"
              name="expirationYear"
              required
            />
          </div>
          <div class="c-formGroupWrapper">
            <form-input
              id="zipcode"
              v-model="form.zipcode"
              class="c-formGroup--half"
              type="text"
              :label="atc['forms.cardZipcodeLabel'] || 'Zipcode'"
              name="zipcode"
              required
            />

            <form-input
              id="cvv"
              v-model="form.cvv"
              class="c-formGroup--half"
              type="number"
              label="CVV"
              name="cvv"
              required
            />
          </div>
        </div>

        <div
          v-else-if="paymentMethodType.includes('card')"
          class="c-formGroupWrapper"
        >
          <form-input
            id="expirationMonth"
            v-model="form.expirationMonth"
            class="c-formGroup--half"
            type="text"
            :label="atc['forms.cardExpirationMonthLabel'] || 'Exp Month'"
            maxlength="2"
            name="expirationMonth"
            required
          />

          <form-input
            id="expirationYear"
            v-model="form.expirationYear"
            class="c-formGroup--half"
            type="text"
            maxlength="4"
            :label="atc['forms.cardExpirationYearLabel'] || 'Exp Year'"
            name="expirationYear"
            required
          />

          <form-input
            id="zipcode"
            v-model="form.zipcode"
            class="c-formGroup--third"
            type="text"
            :label="atc['forms.cardZipcodeLabel'] || 'Zipcode'"
            name="zipcode"
            required
          />
        </div>

        <div
          v-else-if="paymentMethodType == 'braintree_paypal'"
          class="notification"
        >
          <p>{{
            atc['portal.paypalEditPaymentMethodMessage'] ||
              "Paypal account details can only be edited through the customer's PayPal account."
          }}</p>
        </div>

        <div v-else class="notification">
          <p>{{
            atc['portal.sepaEditPaymentMethodMessage'] ||
              "SEPA Direct Debit details can only be edited through the customer's bank account."
          }}</p>
        </div>

        <vue-checkbox
          style="margin-bottom:20px; margin-top: 12px;"
          name="accepts-marketing"
          label="Make default payment method"
          :checked="makeDefault"
          @input="handleMakeDefault"
        />

        <form-summary style="display: none" />
      </form>
    </form-wrapper>

    <div class="c-form__submitBox">
      <div v-if="multiButton" class="c-form__submitBox--multiButtonWrap">
        <v-button
          class="c-form__submitButton c-button--large"
          type="submit"
          @onClick="submit"
        >
          {{ formSubmitButtonText }}
        </v-button>

        <v-button class="c-form__submitButton c-button--link" @onClick="cancel">
          {{ formCancelButtonText }}
        </v-button>
      </div>

      <v-button
        v-if="!multiButton"
        class="c-form__submitButton is-info"
        type="submit"
        @onClick="submit"
      >
        {{ formSubmitButtonText }}
      </v-button>

      <v-button
        class="c-form__submitButton is-info c-cardCancelButton"
        type="link"
        @onClick="$emit('onRemove')"
      >
        {{ atc['buttons.removeCard'] || 'Remove Payment Method' }}
      </v-button>

      <form-submit-status
        v-if="formSubmitStatus"
        :form-submit-status="formSubmitStatus"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import VButton from '@components/v-button.vue'

import FormSummary from '@components/form-summary.vue'
import FormInput from '@components/form-input.vue'
import FormSubmitStatus from '@components/form-submit-status.vue'
import VueCheckbox from '@components/vue-checkbox.vue'

import Vue from 'vue'
import Vuelidate from 'vuelidate'
import { required, numeric } from 'vuelidate/lib/validators'

Vue.use(Vuelidate)

export default {
  components: {
    VButton,
    VueCheckbox,
    FormSummary,
    FormInput,
    FormSubmitStatus,
  },

  props: {
    formSubmitStatus: {
      type: [Object, Boolean],
      default: false,
    },
    formSubmitButtonText: {
      type: String,
      default: 'Submit',
    },
    formCancelButtonText: {
      type: String,
      default: 'Cancel',
    },
    formName: {
      type: String,
      default: 'shipping-address',
    },
    multiButton: {
      type: Boolean,
      default: false,
    },
    newCard: {
      type: Boolean,
      default: false,
    },
    isCustomerDefaultPaymentMethod: {
      type: Boolean,
      default: false,
    },
    paymentMethodType: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      makeDefault: false,

      form: {
        // fullName: null,
        // cardNumber: null,
        expirationMonth: null,
        expirationYear: null,
        zipcode: null,
      },
    }
  },
  validations() {
    const { requireBraintreeCvvValidation } = this

    let final = {
      form: {},
      makeDefault: { required },
    }

    if (this.paymentMethodType.includes('card')) {
      final.form.expirationMonth = { numeric, required }
      final.form.expirationYear = { numeric, required }
      final.form.zipcode = { required }

      if (
        this.paymentMethodType === 'braintree_card' &&
        requireBraintreeCvvValidation
      ) {
        final.form.cvv = { numeric, required }
      }
    }

    return final
  },

  computed: {
    ...mapState('translations', ['atc']),

    ...mapState('shop', ['store', 'uiSettings']),

    requireBraintreeCvvValidation() {
      const { store, uiSettings } = this
      return (
        store &&
        uiSettings &&
        uiSettings.require_braintree_cvv_verification_for_updates
      )
    },

    cardData() {
      const {
        form,
        makeDefault,
        paymentMethodType,
        requireBraintreeCvvValidation,
      } = this
      let cardData = {
        cardMonth: form.expirationMonth,
        cardYear: form.expirationYear,
        cardZipcode: form.zipcode,
        cardDefault: makeDefault,
      }

      if (
        paymentMethodType === 'braintree_card' &&
        requireBraintreeCvvValidation
      ) {
        cardData.cardCvv = form.cvv
      }
      return cardData
    },
  },

  mounted() {
    if (this.isCustomerDefaultPaymentMethod) {
      this.makeDefault = true
    }
  },

  methods: {
    handleMakeDefault() {
      this.makeDefault = !this.makeDefault
    },
    submit() {
      const { atc } = this
      this.$v.form.$touch()

      if (this.$v.form.$pending || this.$v.form.$error) {
        this.$parent.$emit('setDrawerStatus', {
          state: 'FAILURE',
          message: atc['forms.validationInvalidInput'] || 'Invalid input',
        })
        return
      }
      // pass validation, submit payload event
      let payload = this.cardData
      this.$emit('onSubmit', payload)
    },

    cancel() {
      this.$emit('onCancel')
    },
  },
}
</script>

<style lang="scss">
@import '@design';

.c-cardForm {
  padding: 0;

  .c-cardCancelButton {
    margin-top: 10px;
    border: 1px solid $color-red;
  }
  .c-cardcancelbutton::hover {
    border: 1px solid $color-red;
  }
}

.c-cardFormWrapper {
  display: flex;
  flex-direction: column;

  @include bp(tablet) {
    display: block;
  }
}
</style>
