<script>
/* eslint-disable */

import { mapState, mapActions, mapGetters, mapMutations } from 'vuex'

import languageCodes from '@state/languageCodes.js'

export default {
  components: {},

  props: [
      'translationList',
      'translations',
      'activeLanguageCode',
      'activeLanguageName',
      'activeLanguageNativeName',
  ],

  data: () => {
    return {
      dropdownOpen: false,
      languageCodes,
    }
  },

  // computed: {
  //   ...mapState('translations', [
  //     'translationList',
  //     'translations',
  //     'activeLanguageCode',
  //   ]),

  //   ...mapGetters('translations', [
  //     'activeLanguageName',
  //     'activeLanguageNativeName',
  //   ]),
  // },

  methods: {
    ...mapMutations('translations', ['setActiveLanguageCode']),

    ...mapActions('translations', ['GET_TRANSLATION']),

    async switchLanguage(event) {
      const { translations } = this
      const languageCode = event.target.value

      // if language not already loaded, load
      if (!translations[languageCode]) {
        await this.GET_TRANSLATION({ language: languageCode })
      }

      // then set active language
      this.$nextTick(() => {
        this.setActiveLanguageCode(languageCode)
      })
    },
  },
}
</script>

<template>
  <select
    v-if="translationList && translationList.length > 1"
    class="c-langSwitch"
    @change="switchLanguage($event)"
  >
    <option
      v-for="languageCode in translationList"
      :key="languageCode"
      :selected="languageCode === activeLanguageCode"
      class="c-langSwitch__link"
      :value="languageCode"
      >{{ languageCodes[languageCode].nativeName }}
    </option></select
  >
</template>

<style lang="scss">
@import '@design';

.c-langSwitch {
  // width: 100px;
}

.c-langSwitch__current {
  color: $color-black;
}

.c-langSwitch__dropdown {
}

.c-langSwitch__link {
  display: block;
  padding-top: 10px;
  color: $color-black;
}
</style>
