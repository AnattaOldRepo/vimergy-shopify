import request from '@scripts/axiosRequestWrapper.js'

function createUniqueAddressString(originalAddress) {
  if (!originalAddress) return false
  let address = originalAddress

  let addressString =
    address.first_name +
    address.last_name +
    address.company +
    address.address1 +
    address.address2
  let final = addressString.replace(/\s+/g, '')
  return final
}

export const state = () => ({
  addresses: null,
  activeEditAddress: null,
  newSwapAddress: null,
})
export const getters = {
  activeAddress(state, getters, rootState, rootGetters) {
    const aSubAddress =
      rootGetters['activeSubscription/activeSubscription'].shipping_address

    const { addresses } = state

    if (!addresses || !aSubAddress) return false

    const aSubAddressString =
      aSubAddress.first_name +
      aSubAddress.last_name +
      aSubAddress.company +
      aSubAddress.address1 +
      aSubAddress.address2

    const aSubCompare = aSubAddressString.replace(/\s+/g, '')

    return addresses.filter((address) => {
      let addressString =
        address.first_name +
        address.last_name +
        address.company +
        address.address1 +
        address.address2
      let aCompare = addressString.replace(/\s+/g, '')

      // eslint-disable-next-line eqeqeq
      return aCompare == aSubCompare
    })[0]
  },
}

export const mutations = {
  SET_ADDRESSES(state, addresses) {
    state.addresses = addresses
  },

  SET_NEW_ADDRESS(state, address) {
    state.addresses.push(address)
  },

  SET_UPDATED_ADDRESS(state, address) {
    const updatedAddressId = address.id
    const updatedAddressIndex = state.addresses.filter(
      (address) => address.id === updatedAddressId
    )[0]
    const addressesCopy = state.addresses.splice(0)
    addressesCopy[updatedAddressIndex] = address
    state.addresses = addressesCopy
  },

  DELETE_ADDRESS(state, uniqueAddressString) {
    const deletedAddressIndex = state.addresses.filter((address) => {
      // eslint-disable-next-line eqeqeq
      return createUniqueAddressString(address) == uniqueAddressString
    })[0]
    state.addresses.splice(deletedAddressIndex, 1)
  },

  setActiveEditAddress(state, address) {
    state.activeEditAddress = address
  },

  setNewSwapAddress(state, address) {
    state.newSwapAddress = address
  },
}

export const actions = {
  async CREATE_ADDRESS({ rootState, commit, dispatch }, address) {
    const { storeDomain } = rootState.route
    const { customerShopifyId } = rootState.customer

    const url = `/admin/customer/address/${storeDomain}/${customerShopifyId}`

    return new Promise((resolve, reject) => {
      request({
        method: 'post',
        url,
        data: JSON.stringify(address),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
        .then((response) => {
          commit('SET_NEW_ADDRESS', response.data)
          resolve(response)
        })
        .catch((error) => {
          reject(error)
        })
    })
  },

  async UPDATE_ADDRESS(
    { rootState, commit, dispatch },
    { addressId, address }
  ) {
    const { storeDomain } = rootState.route
    const { customerShopifyId } = rootState.customer

    const url = `/admin/customer/address/update/${storeDomain}/${customerShopifyId}/${addressId}`

    return new Promise((resolve, reject) => {
      request({
        method: 'post',
        url,
        data: JSON.stringify(address),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
        .then((response) => {
          if (!response) {
            /* eslint-disable */
            reject('Address not found')
            /* eslint-enable */

            return
          }

          commit('SET_UPDATED_ADDRESS', response.data)
          dispatch(
            'subscriptions/UPDATE_SUBSCRIPTION',
            {
              requestPayload: {
                shipping_address: response.data,
              },
            },
            {
              root: true,
            }
          )

          resolve(response)
        })
        .catch((error) => {
          console.log('error', error)
          reject(error)
        })
    })
  },

  async DELETE_ADDRESS({ rootState, commit, dispatch }, addressId) {
    const { storeDomain } = rootState.route
    const { customerShopifyId } = rootState.customer

    const url = `/admin/customer/address/delete/${storeDomain}/${customerShopifyId}/${addressId}`

    return new Promise((resolve, reject) => {
      request({
        method: 'get',
        url,
      })
        .then((response) => {
          if (!response) {
            /* eslint-disable */
            reject('Address not found')
            /* eslint-enable */
            return
          }

          // Pass id to remove from local addresses list
          commit('DELETE_ADDRESS', addressId)

          resolve(response)
        })
        .catch((error) => {
          reject(error)
        })
    })
  },
}
