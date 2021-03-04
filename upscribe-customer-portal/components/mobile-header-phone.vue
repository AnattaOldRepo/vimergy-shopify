<template>
  <div>
    <!-- Default header mobile with Logo -->
    <div class="c-headerTop">
      <div class="c-headerActions">
        <a
          :href="shopifyAccountUrl"
          aria-label="Back to account"
          class="c-headerAccount"
        >
          <icon-chevron-right
            class="c-headerMobile__navLink--white c-headerMobile__navLink--mobileIcon u-mr-3"
          />
          {{ atc['labels.account'] || 'Account' }}
        </a>
        <span
          class="c-headerMobile__logout-icon"
          role="button"
          aria-label="Logout icon"
          tabindex="0"
          @click="signOut"
        >
          {{ atc['portal.headerSignOut'] || 'Sign Out' }}
        </span>
      </div>
      <!-- <div class="c-headerLogo">
        <img
          v-if="storeLogo"
          :src="storeLogo"
          alt=""
          class="c-headerMobile__image"
        />
      </div> -->
    </div>

    <navigation-menu class="u-mt-4" />

    <!-- Header backward and signout  -->
    <div v-if="mode !== 'noBackButton'">
      <div v-if="mode === 'backwardRoute'" class="c-headerMobile">
        <a
          class="c-headerMobile__navLink"
          aria-label="Back to previous page"
          @click="goBackRoute"
        >
          <icon-chevron-right class="c-headerMobile__navLink--mobileIcon" />
        </a>
        <!-- eslint-disable -->
        <h2 v-if="middleHtml" class="c-headerMobile__title" v-html="middleHtml">
        </h2>

        <span
          class="c-headerMobile__logout-icon"
          role="button"
          v-show="false"
          aria-label="Logout icon"
          tabindex="0"
          @click="signOut"
        >
          <!-- <logout-icon /> -->
        </span>
      </div>

      <div v-else class="c-headerMobile">
        <a
          class="c-headerMobile__navLink"
          aria-label="Back to previous page"
          @click="goBackRoute"
        >
          <icon-chevron-right class="c-headerMobile__navLink--mobileIcon" />
        </a>

        <!-- eslint-disable -->
        <h2 v-if="middleHtml" class="c-headerMobile__title" v-html="middleHtml">
        </h2>

        <v-button
          class="c-headerMobile__navLink c-headerMobile__customizedButton"
          role="button"
          tabindex="0"
          @onClick="$emit('headerFunc')"
        >
          {{ customizedFuncText }}
        </v-button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex'
import VButton from '@components/v-button.vue'
import IconChevronRight from '@components/Icon/icon-chevron-right.vue'
import NavigationMenu from '@components/global/navigation-menu.vue'

export default {
  components: {
    VButton,
    IconChevronRight,
    NavigationMenu,
  },
  props: {
    middleHtml: {
      type: [String, Boolean],
      default: false,
    },

    mode: {
      type: String,
      default: '',
    },

    customizedFuncText: {
      type: String,
      default: '',
    },
  },

  computed: {
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

    goBackRoute() {
      this.swapPageTransitionDynamic('page')
      this.$router.go(-1)
    },
  },
}
</script>

<style lang="scss" scoped>
@import '@design';
.c-headerTop {
  display: flex;
  flex-direction: column;
  .c-headerActions {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    height: 50px;
    padding: 10px 20px;
    color: $color-white;
    background-color: $color-primary;
    a {
      display: flex;
      color: $color-white;
      text-decoration: none;
    }
  }
  .c-headerLogo {
    min-height: 40px;
    .c-headerMobile__image {
      display: block;
      width: auto;
      margin: 10px auto;
    }
  }
}
</style>
