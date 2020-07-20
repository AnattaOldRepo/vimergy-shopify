
<template>
    <!-- Default header mobile with Logo -->
    <div v-if="mode === 'default'"
      class="c-headerMobile">
        <a :href="shopifyAccountUrl" aria-label="Back to account"><account-icon /></a>

        <div>
            <img v-if="storeLogo"
              :src="storeLogo"
              alt=""
              class='c-headerMobile__image'
            />
            <!-- eslint-disable -->

            <h2 v-else> Upscribe </h2>
        </div>

        <span
            class="c-headerMobile__logout-icon"
            role="button"
            aria-label="Logout icon"
            tabindex="0"
            @click="signOut">
            <logout-icon />
        </span>
    </div>

    <!-- Header backward and signout  -->

    <div v-else-if="mode === 'backwardRoute'"
      class="c-headerMobile">
        <a
          class="c-headerMobile__navLink"
          aria-label="Back to previous page"
          @click='goBackRoute'>
            <icon-chevron-right class='c-headerMobile__navLink--mobileIcon'/>
        </a>
        <!-- eslint-disable -->
        <h2 v-if="middleHtml" class='c-headerMobile__title' v-html="middleHtml">
        </h2>

        <span
            class = "c-headerMobile__logout-icon"
            role= "button"
            aria-label="Logout icon"
            tabindex="0"
            @click="signOut">
            <logout-icon />
        </span>
    </div>

    <div
      v-else
      class="c-headerMobile">
        <a
            class="c-headerMobile__navLink"
            aria-label="Back to previous page"
            @click='goBackRoute'>
            <icon-chevron-right class='c-headerMobile__navLink--mobileIcon'/>
        </a>

        <!-- eslint-disable -->
        <h2 v-if="middleHtml" class='c-headerMobile__title' v-html="middleHtml">
        </h2>

        <v-button
            class="c-headerMobile__navLink c-headerMobile__customizedButton"
            role="button"
            tabindex="0"
            @onClick="$emit('headerFunc')">
            {{ customizedFuncText }}
        </v-button>
    </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex'
import VButton from '@components/v-button.vue'
import LogoutIcon from '@components/Icon/logout-icon.vue'
import AccountIcon from '@components/Icon/account-icon.vue'
import IconChevronRight from '@components/icon-chevron-right.vue'

export default {

  components:{
    VButton,
    LogoutIcon,
    AccountIcon,
    IconChevronRight,
  },
  props:{
    middleHtml: {
      type: [String, Boolean],
      default: false,
    },

    mode:{
      type: String,
      default: '',
    },

    customizedFuncText:{
      type: String,
      default: '',
    },
  },

  computed:{
    ...mapState('translations', ['atc']),

    ...mapState('route', ['storeDomain', 'customerId']),

    ...mapState('shop', ['shopData', 'storeLogo']),

    shopifyAccountUrl() {
      const { shopData } = this
      if (!shopData) return
      return `https://${shopData.domain}/account`
    },
  },

  methods: {
    ...mapMutations('mobileGlobalManagement', ['setMessage', 'setStatus']),

    ...mapActions('mobileGlobalManagement', ['swapPageTransitionDynamic']),

    signOut() {
      window.location = `https://${this.shopData.domain}/account/logout`
    },

    goBackRoute(){
      this.swapPageTransitionDynamic('page')
      this.$router.go(-1)
    },
  },
}
</script>

<style lang="scss" scoped>
@import '@design';
</style>
