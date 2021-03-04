import countryJSON from '@state/countryJSON.js'

export const getCountryProvinces = function(countryName) {
  if (countryJSON[countryName]) {
    return {
      provinces: countryJSON[countryName].provinces,
      province_codes: countryJSON[countryName].province_codes,
    }
  } else {
    return null
  }
}

export const getAllCountryNames = function() {
  let final = {}
  Object.keys(countryJSON).forEach((name) => {
    final[name] = {
      name,
      code: countryJSON[name].code,
    }
  })
  return final
}
