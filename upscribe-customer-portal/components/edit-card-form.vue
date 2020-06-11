<template>
  <div class="c-cardForm">
    <form-wrapper :validator="$v.form">
      <form novalidate @submit.prevent="submit">

        <div v-if="paymentMethodType.includes('card')"
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

        <div v-else class="notification">
          <p>SEPA Direct Debit details can only be edited through the customer's bank account.</p>
        </div>

        <vue-checkbox
          style="margin-bottom:20px;"
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
  validations: {
    form: {
      // cardNumber: { numeric },
      expirationMonth: { numeric, required },
      expirationYear: { numeric, required },
      zipcode: { required },
    },
  },

  computed: {
    ...mapState('translations', ['atc']),

    cardData() {
      const { form, makeDefault } = this
      return {
        cardMonth: form.expirationMonth,
        cardYear: form.expirationYear,
        cardZipcode: form.zipcode,
        cardDefault: makeDefault,
      }
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
}
</style>
