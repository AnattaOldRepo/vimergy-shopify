<template>
  <div>
    <form-wrapper :validator="$v.form">
      <form novalidate @submit.prevent="submit">
        <div class="c-formGroupWrapper">
          <form-input
            id="firstName"
            key="firstName"
            v-model="form.firstName"
            class="c-formGroup--half"
            name="firstName"
            type="text"
            :label="atc['forms.firstNameLabel'] || 'First Name'"
            required
          />

          <form-input
            id="lastName"
            key="lastName"
            v-model="form.lastName"
            class="c-formGroup--half"
            name="lastName"
            type="text"
            :label="atc['forms.lastNameLabel'] || 'Last Name'"
            :input-middle="true"
            required
          />
        </div>

        <form-input
          id="company"
          key="company"
          v-model="form.company"
          type="text"
          :label="atc['forms.companyLabel'] || 'Company'"
          name="company"
          :input-middle="true"
          optional-label-text="(Optional)"
        />

        <form-input
          id="address1"
          key="address1"
          v-model="form.address1"
          type="text"
          :label="atc['forms.address1Label'] || 'Address 1'"
          name="address1"
          required
          :input-middle="true"
          :emit-focus-event="true"
        />

        <form-input
          id="address2"
          key="address2"
          v-model="form.address2"
          type="text"
          :label="atc['forms.address2Label'] || 'Address 2'"
          :input-middle="true"
          optional-label-text="(Optional)"
          name="address2"
        />

        <form-input
          id="country"
          key="country"
          :value="country"
          :label="atc['forms.countryLabel'] || 'Country'"
          name="country"
          :select-options="countrySelectOptions"
          required
          select
          :special-validate="['country']"
          :input-middle="true"
          @updateSelected="handleCountrySelected"
        />

        <div class="c-formGroupWrapper">
          <form-input
            id="zipcode"
            key="zipcode"
            v-model="form.zipcode"
            :class="{
              'c-formGroup--third': requiresProvince,
              'c-formGroup--half': !requiresProvince,
            }"
            type="text"
            :label="atc['forms.zipcodeLabel'] || 'Zip'"
            name="zipcode"
            :input-middle="true"
            required
          />

          <form-input
            id="city"
            key="city"
            v-model="form.city"
            :class="{
              'c-formGroup--third': requiresProvince,
              'c-formGroup--half': !requiresProvince,
            }"
            type="text"
            :label="atc['forms.cityLabel'] || 'City'"
            name="city"
            :input-middle="true"
            required
          />

          <form-input
            v-if="!stateSelectOptions && requiresProvince"
            id="state-no-select-options"
            key="state-no-select-options"
            v-model="form.province"
            class="c-formGroup--third no-select-options"
            type="text"
            :label="atc['forms.stateLabel'] || 'State'"
            name="state"
            :input-middle="true"
            :required="requiresProvince"
          />

          <form-input
            v-if="stateSelectOptions && requiresProvince"
            id="state-select-options-test"
            key="state-select-options"
            class="c-formGroup--third select-options testest"
            :value="state"
            :label="atc['forms.stateLabel'] || 'State'"
            name="state"
            :select-options="stateSelectOptions"
            :required="requiresProvince"
            :input-middle="true"
            select
            @updateSelected="handleStateSelected"
          />
        </div>

        <div class="c-formGroupWrapper">
          <form-input
            v-if="
              formName == 'billing-address' &&
                (activePaymentType === 'braintree_card' || !activePaymentType)
            "
            id="phone"
            key="phone"
            v-model="form.phone"
            :class="{ 'c-formGroup--half': requireBraintreeCvvValidation }"
            type="text"
            :label="atc['forms.phoneLabel'] || 'Phone'"
            :optional-label-text="
              store && store.checkout_phone_number_required ? '' : '(Optional)'
            "
            name="phone"
            :required="
              store && store.checkout_phone_number_required ? true : false
            "
          />

          <form-input
            v-if="requireBraintreeCvvValidation"
            id="cvv"
            key="cvv"
            v-model="form.cvv"
            class="c-formGroup--half"
            type="number"
            :label="atc['forms.cvvLabel'] || 'CVV'"
            required
            name="cvv"
          />
        </div>

        <!-- <form-summary style="display: none" /> -->
      </form>
    </form-wrapper>

    <div class="c-form__submitBox u-mt-2">
      <div v-if="multiButton" class="c-form__submitBox--multiButtonWrap">
        <v-button
          class="c-form__submitButton c-button--auto c-button--link"
          @onClick="cancel"
        >
          {{ formCancelButtonText ? formCancelButtonText : 'Cancel' }}
        </v-button>

        <v-button
          class="c-form__submitButton c-button--auto is-info"
          :class="{ 'is-loading': updating }"
          type="submit"
          @onClick="submit"
        >
          {{ formSubmitButtonText }}
        </v-button>
      </div>

      <v-button
        v-if="!multiButton"
        class="c-form__submitButton c-button--auto c-form__fullWidth"
        :class="{ 'is-loading': updating }"
        type="submit"
        @onClick="submit"
      >
        {{ formSubmitButtonText }}
      </v-button>

      <form-submit-status
        v-if="shippingAddressFormSubmitStatus"
        :form-submit-status="shippingAddressFormSubmitStatus"
      />
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import Vue from 'vue'
import Vuelidate from 'vuelidate'
import { required, numeric } from 'vuelidate/lib/validators'

import { getCountryProvinces, getAllCountryNames } from '@utils/getCountryData'

import AddressFormatter from '@shopify/address'

const VButton = () => import('@components/v-button.vue')
// const FormSummary = () => import('@components/form-summary.vue')
const FormInput = () => import('@components/form-input.vue')
const FormSubmitStatus = () => import('@components/form-submit-status.vue')

async function getAddressFields(locale, countryCode) {
  const addressFormatter = new AddressFormatter(locale)
  const addressFields = await addressFormatter.getOrderedFields(countryCode)
  return addressFields
}

Vue.use(Vuelidate)

export default {
  components: {
    VButton,
    // FormSummary,
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
      type: [String, Boolean],
      default: false,
    },
    dataFill: {
      type: [Object, Boolean],
      default: false,
    },
    formName: {
      type: String,
      default: 'shipping-address',
    },
    multiButton: {
      type: Boolean,
      default: false,
    },
    processingForm: {
      type: Boolean,
      default: false,
    },
    updating: {
      type: Boolean,
      default: false,
    },
    activePaymentType: {
      type: [String, Boolean],
      default: false,
    },
  },

  data() {
    return {
      zipcodeResponse: null,

      useGoogleMapsAutocomplete: true,
      countriesNotWorkingWithAutocomplete: [],

      autoaddress: '',
      editAutoAddress: false,

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
      addressFields: [
        'firstName',
        'lastName',
        'company',
        'address1',
        'address2',
        'city',
        'country',
        'province',
        'zip',
        'phone',
        'cvv',
      ],
    }
  },
  validations() {
    const { requiresProvince, requireBraintreeCvvValidation, store } = this

    const form = {
      firstName: { required },
      lastName: { required },
      company: {},
      address1: { required },
      address2: {},
      city: { required },
      country: { required },
      state: {},
      zipcode: { required },
      phone: { numeric },
    }

    if (requiresProvince) {
      form.state = { required }
    }

    if (
      store &&
      store.checkout_phone_number_required &&
      this.formName === 'billing-address'
    ) {
      form.phone = { numeric, required }
    }

    if (requireBraintreeCvvValidation) {
      form.cvv = { numeric, required }
    }

    return {
      form,
    }
  },

  computed: {
    ...mapState('translations', ['atc']),

    ...mapState('googleMaps', ['googleMapsScriptLoaded']),

    ...mapState('countries', {
      shopCountryNames: 'shopCountryNames',
      shippingCountries: 'countries',
    }),

    ...mapState('shop', ['store', 'uiSettings']),

    requireBraintreeCvvValidation() {
      const { uiSettings, activePaymentType, formName } = this
      return (
        uiSettings &&
        uiSettings.require_braintree_cvv_verification_for_updates &&
        formName === 'billing-address' &&
        activePaymentType === 'braintree_card'
      )
    },

    requiresProvince() {
      const { addressFields } = this
      // if country shipping requires state option
      return addressFields.includes('province')
    },

    shippingAddressFormSubmitStatus() {
      const { formSubmitStatus } = this
      if (!formSubmitStatus) return false

      if (
        formSubmitStatus &&
        formSubmitStatus.status === 'ERROR' &&
        formSubmitStatus.message &&
        formSubmitStatus.message.includes('Billing address') &&
        this.formName === 'shipping-address'
      ) {
        const errorsArray = formSubmitStatus.message.split('<br>')
        const onlyShippingErrors = errorsArray
          .filter((error) => !error.includes('Billing address'))
          .join('<br>')
        return {
          ...formSubmitStatus,
          message: onlyShippingErrors,
        }
      } else {
        return formSubmitStatus
      }
    },

    countrySelectOptions() {
      const { formName, shippingCountries } = this

      if (this.isEmptyObject(shippingCountries)) {
        return []
      }
      // use any country for billing or
      // use only shippable countries for shipping
      let countries =
        formName === 'billing-address'
          ? getAllCountryNames()
          : shippingCountries

      if (!countries || this.isEmptyObject(countries)) {
        console.error('no countrySelectOptions')
      }

      const countriesArray = Object.keys(countries).map((countryName) => {
        let country = countries[countryName]
        return {
          value: countryName,
          name: countryName,
          payload: country,
        }
      })

      return countriesArray.sort(function(a, b) {
        if (a.name < b.name) {
          return -1
        } else if (a.name > b.name) {
          return 1
        } else {
          return 0
        }
      })
    },

    cityAndState() {
      const city = this.form.city
      const state = this.form.state
      let cityState = ''
      if (city) {
        cityState += city
      }
      if (city && state) {
        cityState += ', '
      }
      if (state) {
        cityState += state
      }
      return cityState || ''
    },

    initialZipcodeOptions() {
      const { form } = this
      let options = []

      if (form && form.city && form.state) {
        options.push({
          value: `${form.city.toUpperCase()}, ${form.state}`,
          name: `${this.toTitleCase(form.city)}, ${form.state}`,
        })
      }
      options.push({
        value: 'OTHER',
        name: 'Other',
      })
      return options
    },

    prefillZipcodeOptions() {
      const { zipcodeResponse } = this

      if (!zipcodeResponse || !zipcodeResponse.length) {
        return []
      } else {
        let options = []

        if (zipcodeResponse && zipcodeResponse.length) {
          zipcodeResponse.forEach((zipcode) => {
            options.push({
              value: `${zipcode.city}, ${zipcode.state}`,
              name: `${this.toTitleCase(zipcode.city)}, ${zipcode.state}`,
            })
          })
        }

        options.push({
          value: 'OTHER',
          name: 'Other',
        })

        return options
      }
    },

    country() {
      const { shippingCountries } = this
      const countries =
        this.formName === 'billing-address'
          ? getAllCountryNames()
          : shippingCountries

      const name = this.form.country

      if (this.form.country && countries[this.form.country]) {
        return {
          name,
          value: name,
          code:
            countries[name] && countries[name] ? countries[name].code : false,
          country: countries[name],
        }
      } else if (name) {
        return {
          name,
          value: name,
          code:
            countries[name] && countries[name] ? countries[name].code : false,
        }
      } else {
        return ''
      }
    },

    countryStates() {
      const { country } = this
      let finalStates = []

      if (!country || !country.name) return false

      finalStates = getCountryProvinces(country.name)
      return finalStates
    },

    stateSelectOptions() {
      const { countryStates } = this

      if (!countryStates) {
        return false
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
        zipcode: form.zipcode || '',
        phone: form.phone || '',
        province: form.province ? form.province : form.state || '',
        state: form.state || '',
        country: form.country || '',
        cvv: form.cvv || undefined,
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
    editAutoAddress(val) {
      if (val) {
        this.$nextTick(() => {
          this.$refs.autoaddress.$el.children[1].focus()
        })
      }
    },

    stateSelectOptions(val) {},

    dataFill() {
      this.fillFormWithDefaultData()
    },

    billingAddressDataFill: {
      handler: 'updateFullform',
    },

    shippingAddressDataFill: {
      handler: 'updateFullform',
    },

    async country(country) {
      if (this.countriesNotWorkingWithAutocomplete.includes(country.name)) {
        this.useGoogleMapsAutocomplete = false
      } else {
        this.useGoogleMapsAutocomplete = true
      }

      let countryCode =
        country.country && country.country.code ? country.country.code : 'US'

      const addressFields = await getAddressFields('en', countryCode)

      this.setAddressFields(addressFields)
    },
  },

  // fill form data if already saved
  async mounted() {
    if (!this.countries || this.isEmptyObject(this.countries)) {
      await this.GET_SHIPPING_ZONES()
    }

    this.fillFormWithDefaultData()
  },

  methods: {
    ...mapActions('shippingZones', ['GET_SHIPPING_ZONES']),

    fillFormWithDefaultData() {
      const { dataFill } = this

      let preFilledData = { ...dataFill }

      if (dataFill && !this.isEmptyObject(preFilledData)) {
        let preFilledForm = Object.assign(this.form, preFilledData)

        this.form = {
          firstName: preFilledForm.first_name
            ? preFilledForm.first_name
            : preFilledForm.firstName || '',
          lastName: preFilledForm.last_name
            ? preFilledForm.last_name
            : preFilledForm.lastName || '',
          company: preFilledForm.company || '',
          address1: preFilledForm.address1 || '',
          address2: preFilledForm.address2 || '',
          city: preFilledForm.city || '',
          country: preFilledForm.country || '',
          state: preFilledForm.province || '',
          province: preFilledForm.province || '',
          provinceCode: preFilledForm.province_code || '',
          zipcode: preFilledForm.zipcode
            ? preFilledForm.zipcode
            : preFilledForm.zip || '',
          phone: preFilledForm.phone
            ? preFilledForm.phone.replace(/\D/g, '')
            : '',
          cvv: undefined,
        }
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
          cvv: undefined,
        }
      }
    },

    setAddressFields(addressFields) {
      this.addressFields = Array.prototype.concat.apply([], addressFields)
    },

    updateFullform() {
      const {
        billingAddressDataFill,
        shippingAddressDataFill,
        processingForm,
      } = this
      const copyBillingAddress = { ...billingAddressDataFill }
      const copyShippingAddress = { ...shippingAddressDataFill }
      let preFilledData = {}

      if (processingForm) {
        return
      }
      if (this.formName === 'billing-address') {
        preFilledData = copyBillingAddress
      } else {
        preFilledData = copyShippingAddress
      }

      if (!this.isEmptyObject(preFilledData)) {
        let preFilledForm = Object.assign(this.form, preFilledData)

        this.form = {
          firstName: preFilledForm.first_name
            ? preFilledForm.first_name
            : preFilledForm.firstName || '',
          lastName: preFilledForm.last_name
            ? preFilledForm.last_name
            : preFilledForm.lastName || '',
          company: preFilledForm.company || '',
          address1: preFilledForm.address1 || '',
          address2: preFilledForm.address2 || '',
          city: preFilledForm.city || '',
          country: this.isValidCountryOption(preFilledForm.country)
            ? preFilledForm.country
            : '',
          state: preFilledForm.province || '',
          province: preFilledForm.province || '',
          provinceCode: preFilledForm.province_code || '',
          zipcode: preFilledForm.zipcode
            ? preFilledForm.zipcode
            : preFilledForm.zip || '',
          phone: preFilledForm.phone || '',
          cvv: undefined,
        }
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
          cvv: undefined,
        }
      }
    },

    isValidCountryOption(countryName) {
      const { countrySelectOptions } = this
      return countrySelectOptions.some((option) => {
        return option.value === countryName
      })
    },

    handleAutoInputChange(val) {
      this.form.address1 = val
    },

    /**
     * When the google autocompleted location found
     * @param {Object} addressData Data of the found location
     * @param {Object} placeResultData PlaceResult object
     * @param {String} id Input container ID
     */
    handlePlaceChanged(addressData, placeResultData, id) {
      this.autoaddress = addressData

      this.$nextTick(() => {
        let address1 = ''
        if (addressData.street_number) {
          address1 += addressData.street_number
        }
        if (addressData.street_number && addressData.route) {
          address1 += ' '
        }

        if (addressData.route) {
          address1 += addressData.route
        }

        this.form.address1 = address1 || ''

        this.form.address2 = ''

        this.form.city = addressData.locality || ''

        if (addressData.country) {
          // if valid country option
          if (this.isValidCountryOption(addressData.country)) {
            this.form.country = addressData.country || ''
          }
          // this.form.countryCode =
        }

        this.form.state = addressData.administrative_area_level_1 || ''
        this.form.province = addressData.administrative_area_level_1 || ''

        if (addressData.postal_code) {
          this.form.zipcode = addressData.postal_code
        } else {
          this.form.zipcode = ''
        }

        this.editAutoAddress = false

        // check for city/state matching locality to update (EU issue)
        this.$nextTick(() => {
          if (!this.stateSelectOptions) return

          // check if locality is a valid state/province option
          const localityProvinceMatches = this.stateSelectOptions.filter(
            (option) => {
              return option.name === this.autoaddress.locality
            }
          )

          if (localityProvinceMatches.length) {
            this.form.state = localityProvinceMatches[0].name
            this.form.province = localityProvinceMatches[0].name
          }
        })
      })
    },

    handleAddress1InputFocused(val) {
      this.editAutoAddress = true
    },

    handleCityStateSelected(payload) {
      if (!payload || !payload.name) return

      let city = payload.name.split(',')[0].trim()
      let state = payload.name.split(',')[1].trim()
      this.form.city = city
      this.form.state = state
    },

    handleStateSelected(statePayload) {
      if (statePayload.name === 'other' || statePayload.value === 'OTHER') {
        return this.setLocationToManual()
      }

      if (!statePayload || !statePayload.name) {
        console.error('handleState', statePayload)
      }
      this.form.state = statePayload.payload.name
      this.form.province = statePayload.payload.name
      this.form.province_code = statePayload.payload.code
    },

    handleCountrySelected(countryPayload) {
      if (!countryPayload || !countryPayload.name) {
        console.error('handleCountrySelected error: ', countryPayload)
        return
      }

      this.form.country = countryPayload.payload.name
      this.form.countryCode = countryPayload.payload.code
    },

    submit() {
      this.$v.form.$touch()
      if (this.$v.form.$pending || this.$v.form.$error) return

      const { address } = this

      // pass validation, submit payload event
      let payload = {
        first_name: address.firstName,
        last_name: address.lastName,
        company: address.company,

        address1: address.address1,
        address2: address.address2,
        city: address.city,

        zip: address.zipcode,
        cvv: address.cvv,

        province_code: address.province_code,
        province: address.province,
        country: address.country,
        country_code: address.country_code,

        phone: address.phone,
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.c-form__fullWidth {
  width: 100%;
}
</style>
