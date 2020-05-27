import _ from 'lodash'

const createAsyncMutations = (type) => ({
  SUCCESS: `${type}_SUCCESS`,
  FAILURE: `${type}_FAILURE`,
  PENDING: `${type}_PENDING`,
  loadingKey: _.camelCase(`${type}_PENDING`),
  stateKey: _.camelCase(`${type.split('_')[1]}_DATA`),
})

export const GET_CHECKOUT = createAsyncMutations('GET_CHECKOUT')

export const GET_CART = createAsyncMutations('GET_CART')
export const GET_SHOP = createAsyncMutations('GET_SHOP')

export const LOGIN_ACCOUNT = createAsyncMutations('LOGIN_ACCOUNT')
export const CREATE_ACCOUNT = createAsyncMutations('CREATE_ACCOUNT')
export const LOGOUT_ACCOUNT = createAsyncMutations('LOGOUT_ACCOUNT')

export const UPDATE_CHECKOUT = createAsyncMutations('UPDATE_CHECKOUT')
