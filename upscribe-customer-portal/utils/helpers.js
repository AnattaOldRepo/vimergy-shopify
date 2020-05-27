export const isEmptyObject = function(object) {
  if (!object) {
    return true
  }
  return Object.keys(object).length === 0
}

export const removeQueryParam = function(key, sourceURL) {
  let rtn = sourceURL.split('?')[0]
  let param
  let params_arr = []
  let queryString = sourceURL.indexOf('?') !== -1 ? sourceURL.split('?')[1] : ''
  if (queryString !== '') {
    params_arr = queryString.split('&')
    for (let i = params_arr.length - 1; i >= 0; i -= 1) {
      param = params_arr[i].split('=')[0]
      if (param === key) {
        params_arr.splice(i, 1)
      }
    }
    rtn = rtn + '?' + params_arr.join('&')
  }
  return rtn
}
