
import countryJSON from '@state/countryJSON.js'

export const getCountryProvinces = function(countryName) {
  if (countryJSON[countryName]) {
    return countryJSON[countryName].provinces
  } else {
    return null
  }
}

export const getAllCountryNames = function() {
  let final = {}
  Object.keys(countryJSON).forEach(name => {
    final[name] = {
      name,
      code: countryJSON[name].code,
    }
  })
  return final
}
