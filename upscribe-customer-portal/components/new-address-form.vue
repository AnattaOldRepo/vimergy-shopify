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
            label="First Name"
            required
          />

          <form-input
            id="lastName"
            key="lastName"
            v-model="form.lastName"
            class="c-formGroup--half"
            name="lastName"
            type="text"
            label="Last Name"
            required
          />
        </div>

        <form-input
          id="company"
          key="company"
          v-model="form.company"
          type="text"
          label="Company"
          name="company"
          optional-label-text="(Optional)"
        />

        <form-input
          id="address1"
          key="address1"
          v-model="form.address1"
          type="text"
          label="Address 1"
          name="address1"
          required
          :emit-focus-event="true"
        />

        <form-input
          id="address2"
          key="address2"
          v-model="form.address2"
          type="text"
          label="Address 2"
          optional-label-text="(Optional)"
          name="address2"
        />

        <form-input
          id="country"
          key="country"
          :value="country"
          label="Country"
          name="country"
          :select-options="countrySelectOptions"
          required
          select
          :special-validate="['country']"
          @updateSelected="handleCountrySelected"
        />

        <div class="c-formGroupWrapper">
          <form-input
            id="zipcode"
            key="zipcode"
            v-model="form.zipcode"
            :class="{'c-formGroup--third': requiresProvince, 'c-formGroup--half': !requiresProvince }"
            type="text"
            label="Zipcode"
            name="zipcode"
            required
          />

          <form-input
            id="city"
            key="city"
            v-model="form.city"
            :class="{'c-formGroup--third': requiresProvince, 'c-formGroup--half': !requiresProvince }"
            type="text"
            label="City"
            name="city"
            required
          />

          <form-input
            v-if="!stateSelectOptions && requiresProvince"
            id="state-no-select-options"
            key="state-no-select-options"
            v-model="form.province"
            class="c-formGroup--third no-select-options"
            type="text"
            :label="(country && country.name !== 'United States') ? 'Province' : 'State'"
            name="state"
            :required="requiresProvince"
          />

          <form-input
            v-if="stateSelectOptions && requiresProvince"
            id="state-select-options-test"
            key="state-select-options"
            class="c-formGroup--third select-options testest"
            :value="state"
            :label="(country && country.name !== 'United States') ? 'Province' : 'State'"
            name="state"
            :select-options="stateSelectOptions"
            :required="requiresProvince"
            select
            @updateSelected="handleStateSelected"
          />
        </div>

        <form-input
          id="phone"
          key="phone"
          v-model="form.phone"
          type="text"
          label="Phone Number"
          :optional-label-text="store.checkout_phone_number_required ? '' : '(Optional)'"
          name="phone"
          :required="store.checkout_phone_number_required ? true : false"
        />

        <form-summary style="display: none" />
      </form>
    </form-wrapper>

    <div class="c-form__submitBox">
      <div v-if="multiButton" class="c-form__submitBox--multiButtonWrap">
        <v-button
          class="c-form__submitButton c-button--auto c-button--link"
          @onClick="cancel"
        >
          {{ formCancelButtonText ? formCancelButtonText : 'Cancel'}}
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
        class="c-form__submitButton c-button--auto"
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
const FormSummary = () => import('@components/form-summary.vue')
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
      addressFields: ['firstName', 'lastName', 'company', 'address1', 'address2', 'city', 'country', 'province', 'zip', 'phone'],
    }
  },
  validations() {
    const { requiresProvince, store } = this

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

    if (requiresProvince)  {
      form.state = { required }
    }

    if (store.checkout_phone_number_required) {
      form.phone = { numeric, required }
    }

    return {
      form,
    }
  },

  computed: {
    ...mapState('googleMaps', ['googleMapsScriptLoaded']),

    ...mapState('countries', {
      shopCountryNames: 'shopCountryNames',
      shippingCountries: 'countries',
    }),

    ...mapState('shop', ['store']),

    requiresProvince() {
      const { addressFields } = this
      // if country shipping requires state option
      return addressFields.includes('province')
    },

    shippingAddressFormSubmitStatus() {
      const { formSubmitStatus} = this
      if (!formSubmitStatus) return false

      if (formSubmitStatus && formSubmitStatus.status === 'ERROR' && formSubmitStatus.message && formSubmitStatus.message.includes('Billing address') && this.formName === 'shipping-address') {
        const errorsArray = formSubmitStatus.message.split('<br>')
        const onlyShippingErrors = errorsArray.filter(error => !error.includes('Billing address')).join('<br>')
        return {
          ...formSubmitStatus,
          message: onlyShippingErrors,
        }
      }

      else {
        return formSubmitStatus
      }
    },

    countrySelectOptions() {
      const { formName, shippingCountries } = this

      console.log({shippingCountries})
      console.log('get all', getAllCountryNames())

      // use any country for billing or
      // use only shippable countries for shipping
      let countries = (formName === 'billing-address') ? getAllCountryNames() : shippingCountries

      if (!countries || this.isEmptyObject(countries)) {
        console.log('no countrySelectOptions', console.log({countries}))
      }

      console.log('countrySelectOptions', countries)

      const countriesArray = Object.keys(countries).map(countryName => {
        let country = countries[countryName]
          return {
            value: countryName,
            name: countryName,
            payload: country,
          }
      })

      return countriesArray.sort(function (a, b) {
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
      const countries = (this.formName === 'billing-address') ? getAllCountryNames() : shippingCountries

      console.log('country builder', {countries})

      const name = this.form.country

      if (this.form.country && countries[this.form.country]) {
        return {
          name,
          value: name,
          code: countries[name] && countries[name] ? countries[name].code : false,
          country: countries[name],
        }
      } else if (name) {
        return {
          name,
          value: name,
          code: countries[name] && countries[name] ? countries[name].code : false,
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
      console.log({finalStates})

      // if (country.country.code === 'US') {
        // finalStates.push('Armed Forces Americas', 'Armed Forces Europe', 'Armed Forces Pacific')
      // }
      return finalStates
    },

    stateSelectOptions() {
      const { countryStates } = this

      if (!countryStates) {
        console.log('no countryStatesOptions')
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

      if (countryStates && countryStates.length && this.form.state && countryStates.includes(name)) {
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

    stateSelectOptions(val) {
      console.log('stateSelectOptions updated')

    },

    billingAddressDataFill: {
      handler: 'updateFullform',
    },

    shippingAddressDataFill: {
      handler: 'updateFullform',
    },

    async country(country) {
      console.log({country})

      if (this.countriesNotWorkingWithAutocomplete.includes(country.name)) {
        this.useGoogleMapsAutocomplete = false
      } else {
        this.useGoogleMapsAutocomplete = true
      }

      let countryCode = country.country && country.country.code ? country.country.code : 'US'

      const addressFields = await getAddressFields('en', countryCode)

      this.setAddressFields(addressFields)
    },
  },

  // fill form data if already saved
  async mounted() {

    console.log('mounted', this.countries)

    if (!this.countries || this.isEmptyObject(this.countries)) {
      console.log('run GET_SHIPPING_ZONES')
      await this.GET_SHIPPING_ZONES()
    }

    const { dataFill } = this

    let preFilledData = {...dataFill}

    if (dataFill && !this.isEmptyObject(preFilledData)) {
      let preFilledForm = Object.assign(this.form, preFilledData)

      console.log({ preFilledForm})

      this.form = {
        firstName: preFilledForm.first_name ? preFilledForm.first_name : preFilledForm.firstName || '',
        lastName: preFilledForm.last_name ? preFilledForm.last_name : preFilledForm.lastName || '',
        company: preFilledForm.company || '',
        address1: preFilledForm.address1 || '',
        address2: preFilledForm.address2 || '',
        city: preFilledForm.city || '',
        country: preFilledForm.country || '',
        state: preFilledForm.province || '',
        province: preFilledForm.province || '',
        provinceCode: preFilledForm.province_code || '',
        zipcode: preFilledForm.zipcode ? preFilledForm.zipcode : preFilledForm.zip || '',
        phone: preFilledForm.phone ?  preFilledForm.phone.replace(/\D/g,'') : '',
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
      }
    }
  },

  methods: {

    ...mapActions('shippingZones', ['GET_SHIPPING_ZONES']),


    setAddressFields(addressFields) {
      this.addressFields = Array.prototype.concat.apply([], addressFields)
      console.log({addressFields})
    },

    updateFullform() {
      const { billingAddressDataFill, shippingAddressDataFill, processingForm } = this
      const copyBillingAddress = { ...billingAddressDataFill }
      const copyShippingAddress = { ...shippingAddressDataFill }
      let preFilledData = {}

      if (processingForm){
        console.log('processing form - ignore data fill update')
        return
      }
      console.log('UPDATEFORM')

      if (this.formName === 'billing-address') {
        preFilledData = copyBillingAddress
      } else {
        preFilledData = copyShippingAddress
      }

      console.log({preFilledData})

      if (!this.isEmptyObject(preFilledData)) {
        let preFilledForm = Object.assign(this.form, preFilledData)

        this.form = {
          firstName: preFilledForm.first_name ? preFilledForm.first_name : preFilledForm.firstName || '',
          lastName: preFilledForm.last_name ? preFilledForm.last_name : preFilledForm.lastName || '',
          company: preFilledForm.company || '',
          address1: preFilledForm.address1 || '',
          address2: preFilledForm.address2 || '',
          city: preFilledForm.city || '',
          country: this.isValidCountryOption(preFilledForm.country) ?  preFilledForm.country : '',
          state: preFilledForm.province || '',
          province: preFilledForm.province || '',
          provinceCode: preFilledForm.province_code || '',
          zipcode: preFilledForm.zipcode ? preFilledForm.zipcode : preFilledForm.zip || '',
          phone: preFilledForm.phone || '',
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
        }
      }
    },

    isValidCountryOption(countryName) {
      console.log('isValidCountryOption', {countryName})
      const { countrySelectOptions } = this
      return countrySelectOptions.some(option => {
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

      console.log({addressData, placeResultData, id})

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
          console.log('check for city/state matching locality to update (EU issue)')
          console.log('stateSelectOptions: ', this.stateSelectOptions)
          console.log('autoaddress', this.autoaddress)
          console.log('auto locality: ', this.autoaddress.locality)

          if (!this.stateSelectOptions) return

          // check if locality is a valid state/province option
          const localityProvinceMatches = this.stateSelectOptions.filter(option => {
            return option.name === this.autoaddress.locality
          })

          if (localityProvinceMatches.length) {
            console.log({ localityProvinceMatches })
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
      // console.log({statePayload})
      if (statePayload.name === 'other' || statePayload.value === 'OTHER') {
        return this.setLocationToManual()
      }

      if (!statePayload || !statePayload.name) {
        console.log('handleState', statePayload)
      }
      this.form.state = statePayload.payload.name
      this.form.province = statePayload.payload.name
      this.form.province_code = statePayload.payload.code
    },

    handleCountrySelected(countryPayload) {
      console.log({countryPayload})

      if (!countryPayload || !countryPayload.name) {
        return console.log('handleCountrySelected error: ', countryPayload)
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
</style>
