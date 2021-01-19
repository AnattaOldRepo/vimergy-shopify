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

export const getAvailableCollections = function({
  collections,
  editNextOrder,
  customerPortalSubscriptionProductCollections,
  customerPortalNextOrderProductCollections,
  featuredPortalCollection,
}) {
  let availableCollections

  // use old method until they empty this out
  if (featuredPortalCollection && featuredPortalCollection.length) {
    availableCollections = collections.filter((collection) => {
      return featuredPortalCollection.includes(collection.handle)
    })
  }

  // new setup
  else {
    if (editNextOrder && !customerPortalNextOrderProductCollections)
      return 'all-upscribe-enabled'
    if (!editNextOrder && !customerPortalSubscriptionProductCollections)
      return 'all-upscribe-enabled'

    if (editNextOrder) {
      availableCollections = collections.filter((collection) => {
        return customerPortalNextOrderProductCollections.includes(
          collection.handle
        )
      })
    } else {
      availableCollections = collections.filter((collection) => {
        return customerPortalSubscriptionProductCollections.includes(
          collection.handle
        )
      })
    }
  }

  if (!availableCollections) return 'all-upscribe-enabled'

  return availableCollections
}

export const getDefaultActiveCollection = function({
  uiSettings,
  availableCollections,
}) {
  // if no custom collection settings are set, then default to no collection, i.e. All - all-upscribe-enabled
  if (!availableCollections || !availableCollections.length) {
    return false
  }

  // use first available from collection settings options
  if (
    uiSettings &&
    uiSettings.disable_customer_portal_default_all_products_tab
  ) {
    return availableCollections[0]
  }

  // if all setting is disabled and we have , always default to all
  else {
    return false
  }
}
