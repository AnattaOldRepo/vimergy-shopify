<template>
  <div class="c-singleFieldForm">
    <form-wrapper :validator="$v.form">
      <form novalidate @submit.prevent="submit">
        <form-input
          id="single-field"
          v-model="form.value"
          class="c-singleFieldForm__input"
          name="single-field"
          type="text"
          :label="inputLabel"
          required
        />
      </form>
    </form-wrapper>

    <div class="c-form__submitBox c-singleFieldForm__submitBox">
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
        class="c-form__submitButton c-singleFieldForm__submitButton"
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
import VButton from '@components/v-button.vue'
import FormInput from '@components/form-input.vue'
import FormSubmitStatus from '@components/form-submit-status.vue'

import Vue from 'vue'
import Vuelidate from 'vuelidate'
import { required } from 'vuelidate/lib/validators'

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
    inputLabel: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      form: {
        value: '',
      },
    }
  },
  validations: {
    form: {
      value: { required },
    },
  },

  computed: {
    formPayload() {
      return {
        value: this.form.value,
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
      let payload = this.formPayload.value
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

.c-singleFieldForm {
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
}

.c-singleFieldForm__submitBox {
  margin-top: 20px;
  margin: 0;
  margin-left: 10px;
  border-radius: 10px;
  flex: 1;
}

.c-singleFieldForm__submitButton {
  flex: 1;
}

.c-singleFieldForm__input {
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
