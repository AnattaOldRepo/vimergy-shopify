<template>
  <div class="c-cardForm">
    <form-wrapper :validator="$v.form">
      <form novalidate @submit.prevent="submit">
        <form-input
          v-if="newCard"
          id="cardNumber"
          v-model="form.cardNumber"
          name="cardNumber"
          type="number"
          :label="atc['forms.cardNumberLabel'] || 'Card Number'"
          required
        />

        <div class="c-formGroupWrapper">
          <form-input
            id="expiration-month"
            v-model="form.expirationMonth"
            :class="{
              'c-formGroup--third': newCard ? true : false,
              'c-formGroup--half': newCard ? false : true,
            }"
            type="text"
            :label="atc['forms.cardExpirationMonthLabel'] || 'Exp Month'"
            placeholder="XX"
            maxlength="2"
            name="expiration-month"
            required
          />

          <form-input
            id="expiration-year"
            v-model="form.expirationYear"
            :class="{
              'c-formGroup--third': newCard ? true : false,
              'c-formGroup--half': newCard ? false : true,
            }"
            type="text"
            placeholder="XXXX"
            maxlength="4"
            :label="atc['forms.cardExpirationYearLabel'] || 'Exp Year'"
            name="expiration-year"
            required
          />

          <form-input
            v-if="newCard"
            id="css"
            v-model="form.cvv"
            class="c-formGroup--third"
            type="text"
            label="CVV"
            name="cvv"
            required
          />
        </div>

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
          {{ formSubmitButtonText || atc['buttons.submit'] || 'Submit'}}
        </v-button>

        <v-button class="c-form__submitButton c-button--link" @onClick="cancel">
          {{ formCancelButtonText || atc['buttons.cancel'] || 'Cancel'}}
        </v-button>
      </div>

      <v-button
        v-if="!multiButton"
        class="c-form__submitButton"
        type="submit"
        @onClick="submit"
      >
          {{ formSubmitButtonText || atc['buttons.submit'] || 'Submit'}}
      </v-button>

      <form-submit-status
        v-if="formSubmitStatus"
        :form-submit-status="formSubmitStatus"
      />
    </div>
  </div>
</template>

<script>
import VButton from '@components/v-button.vue'

import FormSummary from '@components/form-summary.vue'
import FormInput from '@components/form-input.vue'
import FormSubmitStatus from '@components/form-submit-status.vue'

import Vue from 'vue'
import Vuelidate from 'vuelidate'
import { required, numeric } from 'vuelidate/lib/validators'
import { mapState } from 'vuex'

Vue.use(Vuelidate)

export default {
  components: {
    VButton,
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
      type: [String, Boolean],
      default: false, // use translations if false
    },
    formCancelButtonText: {
      type: [String, Boolean],
      default: false, // use translations if false
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
  },

  data() {
    return {
      form: {
        // fullName: null,
        cardNumber: null,
        expirationMonth: null,
        expirationYear: null,
        cvv: null,
      },
    }
  },
  validations: {
    form: {
      cardNumber: { numeric },
      expirationMonth: { numeric, required },
      expirationYear: { numeric, required },
      cvv: { numeric },
    },
  },

  computed: {
    ...mapState('translations', ['atc']),

    cardData() {
      const { form } = this
      return {
        cardMonth: form.expirationMonth,
        cardYear: form.expirationYear,
      }
    },
  },

  methods: {
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
