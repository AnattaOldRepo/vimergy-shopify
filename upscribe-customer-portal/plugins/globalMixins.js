/* eslint-disable no-unused-vars */

import Vue from 'vue'

function replaceDynamicVal(string, replace) {
  return string.replace('%s', replace)
}


Vue.mixin({
  methods: {
    formatMoney(val) {
      if (val > 0) {
        return (val / 100).toFixed(2)
      }
    },


    // ex errorMessage = "('this is a dyanimic value, of %s', '12')"
    // ex errorMessage = "or a static error message"
    formatDynamicValueErrorMessage(errorMessage) {
      let finalMessage = errorMessage
      if (errorMessage.charAt(0) === '(' && errorMessage.charAt(errorMessage.length - 1) === ')') {
        // eslint-disable-next-line no-eval
        finalMessage = eval('replaceDynamicVal' + errorMessage)
      }
      return finalMessage
    },


    isEmptyObject(object) {
      if (!object) {
        return true
      }
      return Object.keys(object).length === 0
    },

    isArray(a) {
      return !!a && a.constructor === Array
    },

    isObject(a) {
      return !!a && a.constructor === Object
    },

    toTitleCase(str) {
      return str.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      })
    },

    handleize(string) {
      return string
        .trim()
        .toLowerCase()
        .replace(/ /g, '-')
    },

    createUniqueAddressString(address) {
      let addressString =
        address.first_name +
        address.last_name +
        address.company +
        address.address1 +
        address.address2
      return addressString.replace(/\s+/g, '')
    },

    titleCase(string) {
      var newstr = string.split(' ')
      for (let i = 0; i < newstr.length; i++) {
        if (
          newstr[i] === '' ||
          newstr[i] === 'of' ||
          newstr[i] === 'and' ||
          newstr[i] === 'the' ||
          newstr[i] === 'a'
        )
          continue
        var copy = newstr[i].substring(1).toLowerCase()
        newstr[i] = newstr[i][0].toUpperCase() + copy
      }
      newstr = newstr.join(' ')
      return newstr
    },

    removeParam(key, sourceURL) {
      let rtn = sourceURL.split('?')[0]
      let param
      let params_arr = []
      let queryString =
        sourceURL.indexOf('?') !== -1 ? sourceURL.split('?')[1] : ''
      if (queryString !== '') {
        params_arr = queryString.split('&')
        for (var i = params_arr.length - 1; i >= 0; i -= 1) {
          param = params_arr[i].split('=')[0]
          if (param === key) {
            params_arr.splice(i, 1)
          }
        }
        rtn = rtn + '?' + params_arr.join('&')
      }
      return rtn
    },
  },
})
