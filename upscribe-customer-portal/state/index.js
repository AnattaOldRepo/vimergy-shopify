import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'

// Following is example code.

/**
 * @typedef {object} User
 * @property {string} name
 */

/**
 * @typedef {object} UserComputed
 * @property {{(): User}} currentUser
 * @property {{(): boolean}} isUserLoggedIn
 */

/** @type {UserComputed} */
export const userComputed = {
  ...mapState('auth', ['currentUser']),
  ...mapGetters('auth', ['isUserLoggedIn']),
}

/**
 * @typedef {object} UserMethods
 * @property {{(payload: { username: string, password: string }): Promise<User>}} logIn
 * @property {{(): Promise<void>}} logOut
 */

/** @type {UserMethods} */
export const userMethods = {
  ...mapActions('auth', ['logIn']),
  ...mapMutations('auth', ['logOut']),
}

// TODO: Add documentation note!
