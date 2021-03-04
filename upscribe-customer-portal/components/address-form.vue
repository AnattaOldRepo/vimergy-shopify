<template>
  <div>
    <form-wrapper :validator="$v.form">
      <form novalidate @submit.prevent="submit">
        <form-input
          id="firstName"
          key="firstName"
          v-model="form.firstName"
          name="firstName"
          type="text"
          :label="atc['forms.firstNameLabel'] || 'First Name'"
          required
          @onFocus="listenToText"
        />

        <form-input
          id="lastName"
          key="lastName"
          v-model="form.lastName"
          name="lastName"
          type="text"
          :label="atc['forms.lastNameLabel'] || 'Last Name'"
          required
          @onFocus="listenToText"
        />

        <form-input
          id="company"
          key="company"
          v-model="form.company"
          type="text"
          :label="atc['forms.companyLabel'] || 'Company'"
          name="company"
          @onFocus="listenToText"
        />

        <form-input
          id="address1"
          key="address1"
          v-model="form.address1"
          type="text"
          :label="atc['forms.address1Label'] || 'Address 1'"
          name="address1"
          required
          @onFocus="listenToText"
        />

        <form-input
          id="address2"
          key="address2"
          v-model="form.address2"
          type="text"
          :label="atc['forms.address2Label'] || 'Address 2'"
          optional-label-text="(Optional)"
          name="address2"
          @onFocus="listenToText"
        />

        <div class="c-formGroupWrapper">
          <form-input
            id="city"
            key="city"
            v-model="form.city"
            class="c-formGroup--half"
            type="text"
            :label="atc['forms.cityLabel'] || 'City'"
            name="city"
            required
            @onFocus="listenToText"
          />

          <form-input
            id="state"
            key="state"
            class="c-formGroup--half"
            :value="state"
            :label="atc['forms.stateLabel'] || 'State'"
            name="state"
            :select-options="stateSelectOptions"
            required
            select
            @updateSelected="handleStateSelected"
            @onFocus="listenToText"
          />
        </div>

        <div class="c-formGroupWrapper">
          <form-input
            id="zipcode"
            key="zipcode"
            v-model="form.zipcode"
            class="c-formGroup--half"
            type="text"
            :label="atc['forms.zipcodeLabel'] || 'Zipcode'"
            name="zipcode"
            required
            @onFocus="listenToText"
          />

          <form-input
            id="country"
            key="country"
            class="c-formGroup--half"
            :value="country"
            :label="atc['forms.countryLabel'] || 'Country'"
            name="country"
            :select-options="countrySelectOptions"
            required
            select
            @updateSelected="handleCountrySelected"
            @onFocus="listenToText"
          />
        </div>

        <form-input
          id="phone"
          key="phone"
          v-model="form.phone"
          type="text"
          :label="atc['forms.phoneNumberLabel'] || 'Phone Number'"
          name="phone"
          @onFocus="listenToText"
        />

        <form-summary style="display: none" />
      </form>
    </form-wrapper>

    <div class="c-form__submitBox c-formBlock">
      <div v-if="multiButton" class="c-form__submitBox--multiButtonWrap">
        <v-button
          class="c-form__submitButton c-button--large"
          type="submit"
          @onClick="submit"
        >
          {{ formSubmitButtonText || atc['buttons.submit'] || 'Submit' }}
        </v-button>

        <v-button class="c-form__submitButton c-button--link" @onClick="cancel">
          {{ formCancelButtonText || atc['buttons.cancel'] || 'Cancel' }}
        </v-button>
      </div>

      <v-button
        v-if="!multiButton"
        class="c-form__submitButton"
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
import axios from 'axios'
import { mapGetters, mapState, mapActions } from 'vuex'
import VButton from '@components/v-button.vue'
import FormSummary from '@components/form-summary.vue'
import FormInput from '@components/form-input.vue'
import FormSubmitStatus from '@components/form-submit-status.vue'
import Vue from 'vue'
import Vuelidate from 'vuelidate'
import { required } from 'vuelidate/lib/validators'

const getCountryState = require('countrycitystatejson')

const API = process.env.API

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
      default: false, // replaced by translation string
    },
    formCancelButtonText: {
      type: [String, Boolean],
      default: false, // replaced by translation string
    },
    formName: {
      type: String,
      default: 'shipping-address',
    },
    multiButton: {
      type: Boolean,
      default: false,
    },
    noDataFill: {
      type: Boolean,
      default: false,
    },
    hasSameAddress: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      form: {
        firstName: '',
        lastName: '',
        company: '',
        address1: '',
        address2: '',
        city: '',
        country: '',
        countryCode: '',
        state: '',
        zipcode: '',
        phone: '',
      },
    }
  },
  validations: {
    form: {
      firstName: { required },
      lastName: { required },
      company: {},
      address1: { required },
      address2: {},
      city: { required },
      country: { required },
      state: { required },
      zipcode: { required },
      phone: {},
    },
  },

  computed: {
    ...mapState('translations', ['atc']),

    ...mapGetters('activeSubscription', [
      'activeBillingAddress',
      'activeShippingAddress',
    ]),

    ...mapState('countries', ['countries', 'shopCountryNames']),

    addressDataFill() {
      const {
        activeBillingAddress,
        activeShippingAddress,
        hasSameAddress,
      } = this
      const copyBillingAddress = { ...activeBillingAddress }
      const copyShippingAddress = { ...activeShippingAddress }

      if (this.formName === 'billing-address') {
        return {
          firstName: hasSameAddress
            ? copyShippingAddress.first_name
              ? copyShippingAddress.first_name
              : ''
            : copyBillingAddress.first_name
            ? copyBillingAddress.first_name
            : '',
          lastName: hasSameAddress
            ? copyShippingAddress.last_name
              ? copyShippingAddress.last_name
              : ''
            : copyBillingAddress.last_name
            ? copyBillingAddress.last_name
            : '',
          company: hasSameAddress
            ? copyShippingAddress.company
              ? copyShippingAddress.company
              : ''
            : copyBillingAddress.company
            ? copyBillingAddress.company
            : '',
          address1: hasSameAddress
            ? copyShippingAddress.address1
              ? copyShippingAddress.address1
              : ''
            : copyBillingAddress.address1
            ? copyBillingAddress.address1
            : '',
          address2: hasSameAddress
            ? copyShippingAddress.address2
              ? copyShippingAddress.address2
              : ''
            : copyBillingAddress.address2
            ? copyBillingAddress.address2
            : '',
          city: hasSameAddress
            ? copyShippingAddress.city
              ? copyShippingAddress.city
              : ''
            : copyBillingAddress.city
            ? copyBillingAddress.city
            : '',
          country: hasSameAddress
            ? copyShippingAddress.country
              ? copyShippingAddress.country
              : ''
            : copyBillingAddress.country
            ? copyBillingAddress.country
            : '',
          state: hasSameAddress
            ? copyShippingAddress.province
              ? copyShippingAddress.province
              : ''
            : copyBillingAddress.province
            ? copyBillingAddress.province
            : '',
          province: hasSameAddress
            ? copyShippingAddress.province
              ? copyShippingAddress.province
              : ''
            : copyBillingAddress.province
            ? copyBillingAddress.province
            : '',
          provinceCode: hasSameAddress
            ? copyShippingAddress.province_code
              ? copyShippingAddress.province_code
              : ''
            : copyBillingAddress.province_code
            ? copyBillingAddress.province_code
            : '',
          zipcode: hasSameAddress
            ? copyShippingAddress.zip
              ? copyShippingAddress.zip
              : ''
            : copyBillingAddress.zip
            ? copyBillingAddress.zip
            : '',
          phone: hasSameAddress
            ? copyShippingAddress.phone
              ? copyShippingAddress.phone
              : ''
            : copyBillingAddress.phone
            ? copyBillingAddress.phone
            : '',
        }
      } else {
        return {
          firstName: copyShippingAddress.first_name || '',
          lastName: copyShippingAddress.last_name || '',
          company: copyShippingAddress.company || '',
          address1: copyShippingAddress.address1 || '',
          address2: copyShippingAddress.address2 || '',
          city: copyShippingAddress.city || '',
          country: copyShippingAddress.country || '',
          state: copyShippingAddress.province || '',
          province: copyShippingAddress.province || '',
          provinceCode: copyShippingAddress.province_code || '',
          zipcode: copyShippingAddress.zip || '',
          phone: copyShippingAddress.phone || '',
        }
      }
    },

    countrySelectOptions() {
      const { countries } = this

      if (!countries || this.isEmptyObject(countries)) {
        console.error('no countrySelectOptions', { countries })
      }

      return Object.keys(countries).map((countryName) => {
        let country = countries[countryName]
        return {
          value: country.name,
          name: country.name,
          payload: country,
        }
      })
    },

    country() {
      const countriesCopy = { ...this.countries }
      const name = this.form.country

      if (this.form.country && countriesCopy[this.form.country]) {
        return { name, value: name, country: countriesCopy[this.form.country] }
      } else if (name) {
        return { name, value: name }
      } else {
        return ''
      }
    },

    countryStates() {
      const { country } = this

      if (!country || !country.country) {
        return false
      }

      return getCountryState.getStatesByShort(country.country.code)
    },

    stateSelectOptions() {
      const { countryStates } = this

      if (!countryStates) {
        return []
      }

      return countryStates.map((stateName) => {
        return {
          value: stateName,
          name: stateName,
          payload: {
            name: stateName,
          },
        }
      })
    },

    state() {
      const { countryStates } = this
      const name = this.form.state || this.form.province

      if (
        countryStates &&
        countryStates.length &&
        this.form.state &&
        countryStates.includes(name)
      ) {
        return { name, value: name, state: { name } }
      } else if (name) {
        return { name, value: name }
      } else {
        return ''
      }
    },

    address() {
      const { form, country, state } = this
      let address = {
        firstName: form.firstName || '',
        lastName: form.lastName || '',
        company: form.company || '',
        address1: form.address1 || '',
        address2: form.address2 || '',
        city: form.city || '',
        state: form.state || '',
        zipcode: form.zipcode || '',
        phone: form.phone || '',
        province: form.state || '',
        country: form.country || '',
      }

      if (country && country.country && country.country.code) {
        address.countryCode = country.country.code
      }

      if (state && state.state && state.state.code) {
        address.provinceCode = state.state.code
      }

      return address
    },
  },

  watch: {
    form(newVal = {}, oldVal = {}) {
      if (
        newVal.country &&
        oldVal.country &&
        newVal.country !== oldVal.country
      ) {
        this.form.state = ''
        this.form.province = ''
      }
    },

    addressDataFill(data) {
      if (!this.isEmptyObject(data)) {
        let preFilledForm = Object.assign(this.form, data)
        this.form = preFilledForm
      } else {
        this.form = {
          firstName: '',
          lastName: '',
          company: '',
          address1: '',
          address2: '',
          city: '',
          country: '',
          countryCode: '',
          state: '',
          zipcode: '',
          phone: '',
        }
      }
    },
  },

  // fill form data if already saved
  async mounted() {
    const { countries } = this

    if (!countries || this.isEmptyObject(countries)) {
      await this.GET_SHIPPING_ZONES()
    }

    this.fillFormWithDefaultData()
  },

  methods: {
    ...mapActions('shippingZones', ['GET_SHIPPING_ZONES']),

    fillFormWithDefaultData() {
      const { noDataFill, addressDataFill, form } = this

      if (!this.isEmptyObject(addressDataFill) && !noDataFill) {
        let dataFill = Object.assign(form, addressDataFill)
        this.form = {
          firstName: dataFill.firstName,
          lastName: dataFill.lastName,
          company: dataFill.company,
          address1: dataFill.address1,
          address2: dataFill.address2,
          city: dataFill.city,
          country: dataFill.country,
          country_code: dataFill.country_code,
          province: dataFill.province,
          state: dataFill.province,
          province_code: dataFill.provinceCode,
          zipcode: dataFill.zipcode,
          phone: dataFill.phone,
        }
      }
    },

    handleStateSelected(statePayload) {
      this.form.state = statePayload.payload.name
      this.form.province = statePayload.payload.name
      this.form.province_code = statePayload.payload.code
    },

    handleCountrySelected(countryPayload) {
      if (!countryPayload || !countryPayload.name) {
        return
      }

      this.form.country = countryPayload.payload.name
      this.form.countryCode = countryPayload.payload.code
    },

    // grabs from global
    setZipcodeResponse(zipcodeResponse) {
      this.zipcodeResponse = zipcodeResponse
    },

    getZipcode(zipcode) {
      const vm = this

      axios(`${API}/zipcode/${zipcode}`)
        .then((res) => {
          if (typeof res.data === 'object') {
            vm.setZipcodeResponse(res.data)
          } else {
            console.error('error get zipcode', res.data)
          }
        })
        .catch((err) => {
          console.error('err', err)
          vm.setZipcodeResponse(false)
        })
    },

    listenToText(e) {
      const { $data } = this

      if (e.target.value.length > 0) {
        this.$emit('setFunc', () => {
          e.target.value = ''
          $data.form[e.target.name] = ''
        })
      }
    },

    submit() {
      this.$v.form.$touch()
      if (this.$v.form.$pending || this.$v.form.$error) return

      // pass validation, submit payload event
      let payload = {
        first_name: this.address.firstName,
        last_name: this.address.lastName,
        company: this.address.company,

        address1: this.address.address1,
        address2: this.address.address2,

        city: this.address.city,
        state: this.address.state,

        zip: this.address.zipcode,

        country: this.address.country,
        country_code: this.address.countryCode,
        province: this.address.province,
        province_code: this.address.provinceCode,

        phone: this.address.phone,
      }
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

.c-form__submitBox--multiButtonWrap {
  width: 100%;
  .c-form__submitButton {
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.1px;
    font-weight: bold;
    @include column(1/2);
  }
}
</style>
