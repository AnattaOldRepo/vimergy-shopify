import Vue from 'vue'
import Vuelidate from 'vuelidate'
import VuelidateErrorExtractor, { templates } from 'vuelidate-error-extractor'

Vue.use(Vuelidate)
Vue.use(VuelidateErrorExtractor, {
  // Define common validation messages.
  messages: {
    required: `{label} <forms.validationIsRequired>.`,
    email: `{label} <forms.validationIsNotAValidEmail>.`,
    numeric: `{label} <forms.validationIsNotANumber>.`,
  },
  attributes: {
    name: 'Name',
    email: 'Email',
  },
})

Vue.component('form-wrapper', templates.FormWrapper)
