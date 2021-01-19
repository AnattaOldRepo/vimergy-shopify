import languageCodes from '@state/languageCodes.js'
import request from '@scripts/axiosRequestWrapper'

export const state = () => ({
  translations: {},
  translationList: null,
  activeLanguageCode: 'en',
  languageCodes,
  atc: {}, // activeTranslationContent
})

export const getters = {
  activeLanguageName({ activeLanguageCode }) {
    return languageCodes[activeLanguageCode]
      ? languageCodes[activeLanguageCode].name
      : false
  },
  activeLanguageNativeName({ activeLanguageCode }) {
    return languageCodes[activeLanguageCode]
      ? languageCodes[activeLanguageCode].nativeName
      : false
  },
}

export const mutations = {
  setActiveLanguageCode(state, activeLanguageCode) {
    state.activeLanguageCode = activeLanguageCode
    state.atc = state.translations[activeLanguageCode].content
  },
  SET_TRANSLATION(state, translation) {
    state.translations = state.translations || {}
    state.translations[translation.language] = translation
  },

  SET_TRANSLATION_LIST(state, translationList) {
    if (!translationList || !translationList.length) {
      return
    }

    state.translationList = translationList.map(
      (translation) => translation.language
    )
  },

  SET_ALL_TRANSLATIONS(state, allTranslations) {
    let finalObject = {}
    allTranslations.forEach((translation) => {
      finalObject[translation.language] = translation
    })
    state.translations = finalObject
  },

  CLEAR_TRANSLATIONS(state) {
    state.translations = null
  },
}

export const actions = {
  GET_TRANSLATION_LIST({ rootState, commit }) {
    const { storeDomain } = rootState.route
    const { xUpscribeAccessToken } = rootState.auth

    if (!storeDomain) return

    return new Promise((resolve, reject) => {
      request({
        method: 'get',
        url: `/i18n/${storeDomain}`,
        headers: {
          'x-upscribe-access-token': xUpscribeAccessToken,
        },
      })
        .then((response) => {
          commit('SET_TRANSLATION_LIST', response)
          resolve(response)
        })
        .catch((error) => {
          reject(error)
        })
    })
  },

  GET_ALL_TRANSLATIONS({ rootState, commit }) {
    const { storeDomain } = rootState.route
    const { xUpscribeAccessToken } = rootState.auth

    if (!storeDomain) return

    return new Promise((resolve, reject) => {
      request({
        method: 'get',
        url: `/i18n/${storeDomain}`,
        params: {
          all: true,
        },
        headers: {
          'x-upscribe-access-token': xUpscribeAccessToken,
        },
      })
        .then((response) => {
          commit('SET_ALL_TRANSLATIONS', response)
          resolve(response)
        })
        .catch((error) => {
          reject(error)
        })
    })
  },

  GET_TRANSLATION({ rootState, commit }, { language }) {
    const { storeDomain } = rootState.route
    const { xUpscribeAccessToken } = rootState.auth

    if (!storeDomain) return

    return new Promise((resolve, reject) => {
      request({
        method: 'get',
        url: `/i18n/${storeDomain}`,
        params: {
          language,
        },
        headers: {
          'x-upscribe-access-token': xUpscribeAccessToken,
        },
      })
        .then((response) => {
          commit('SET_TRANSLATION', response)
          resolve(response)
        })
        .catch((error) => {
          reject(error)
        })
    })
  },
}
