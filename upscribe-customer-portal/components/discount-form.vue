<template>
  <div class="c-discountForm">
    <form-wrapper :validator="$v.form">
      <form novalidate @submit.prevent="submit">
        <form-input
          id="discount"
          v-model="form.discount"
          class="c-discountForm__input"
          name="discount"
          type="text"
          :label="discountInputLabel || atc['labels.discountCode'] || 'Discount Code'"
          required
        />
      </form>
    </form-wrapper>

    <div class="c-form__submitBox c-discountForm__submitBox">
      <!-- <div v-if="multiButton" class="c-form__submitBox--multiButtonWrap">
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
      </div> -->
      <!-- v-if="!multiButton" -->

      <v-button
        class="c-form__submitButton c-discountForm__submitButton"
        type="submit"
        @onClick="submit"
      >
        {{ formSubmitButtonText || atc['buttons.submit'] || 'Submit' }}
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
import FormInput from '@components/form-input.vue'
import FormSubmitStatus from '@components/form-submit-status.vue'

import Vue from 'vue'
import Vuelidate from 'vuelidate'
import { required } from 'vuelidate/lib/validators'

import { mapState } from 'vuex'

Vue.use(Vuelidate)

export default {
  components: {
    VButton,
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
      default: false, // use translation
    },
    formCancelButtonText: {
      type: [String, Boolean],
      default: false, // use translation
    },
    formName: {
      type: String,
      default: 'shipping-address',
    },
    multiButton: {
      type: Boolean,
      default: false,
    },
    discountInputLabel: {
      type: [String, Boolean],
      default: false, // use translation
    },
  },

  data() {
    return {
      form: {
        discount: '',
      },
    }
  },
  validations: {
    form: {
      discount: { required },
    },
  },

  computed: {
    ...mapState('translations', ['atc']),

    formPayload() {
      return {
        discount: this.form.discount,
      }
    },
  },

  methods: {
    submit() {
      this.$v.form.$touch()
      if (this.$v.form.$pending || this.$v.form.$error) {
        return
      }

      // pass validation, submit payload event
      let payload = this.formPayload.discount
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

.c-discountForm {
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
}

.c-discountForm__submitBox {
  margin: 0;
  margin-left: 10px;
  border-radius: 10px;
  flex: 1;
}

.c-discountForm__submitButton {
  flex: 1;
}

.c-discountForm__input {
  .c-formInput {
    border-radius: 0;
  }
}

.c-form__submitBox--multiButtonWrap {
  width: 100%;
  .c-form__submitButton {
    @include column(1/2);
  }
}
</style>
