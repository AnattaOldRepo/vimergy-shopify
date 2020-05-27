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
    console.log('shippingZones', shippingZones)
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

// Need endpoint eventually, currently getting from shipping zones
// export const actions = {
//   // Get available shopp shopping zones
//   GET_COUNTRIES({ commit, rootState }) {
//     const { storeDomain } = rootState.route

//     if (!storeDomain) {
//       return console.log('storeDomain not available')
//     }

//     return new Promise((resolve, reject) => {
//       request({
//         method: 'get',
//         url: `/countries/${storeDomain}`,
//       })
//         .then((response) => {
//           console.log('response', response)
//           commit('SET_SHIPPING_ZONES', response.data)
//           resolve(response)
//         })
//         .catch((error) => {
//           console.log('error: ', error)
//           reject(error)
//         })
//     })
//   },
// }
