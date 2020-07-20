// import request from '@scripts/axiosRequestWrapper.js'

export const state = () => ({
  countries: {},
  shopCountryCodes: [],
  shopCountryNames: [],
})

export const mutations = {
  SET_COUNTRIES(state, countries) {
    state.countries = { ...state.countries, ...countries }
    state.shopCountryCodes = countries.map((country) => country.code)
  },

  SET_COUNTRIES_FROM_SHIPPING_ZONES(state, shippingZones) {
    let finalCountries = {}
    shippingZones.forEach((zone) => {
      const zoneCountries = zone.countries
      zoneCountries.forEach((country) => {
        finalCountries = {
          ...finalCountries,
          [country.name]: country,
        }
      })
    })

    state.countries = { ...finalCountries }
    state.shopCountryCodes = Object.keys(finalCountries).map(
      (key) => finalCountries[key].code
    )
    state.shopCountryNames = Object.keys(finalCountries).map(
      (key) => finalCountries[key].name
    )
  },
}
