<script>
import { mapState } from 'vuex'
import VButton from '@components/v-button.vue'
import IconChevronRight from '@components/icon-chevron-right.vue'
import LogoutIcon from '@components/Icon/logout-icon.vue'
import AccountIcon from '@components/Icon/account-icon.vue'
import { windowSizes } from '@mixins/windowSizes'

export default {
  components: {
    VButton,
    IconChevronRight,
    LogoutIcon,
    AccountIcon,
  },

  mixins: [windowSizes],

  props: {
    middleHtml: {
      type: [String, Boolean],
      default: false,
    },

  },

  data() {
    return {
      mobileNavOpen: false,
    }
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

    activePageName() {
      const { atc } = this
      if (this.$route.name === 'history') {
        return atc['portal.headerSubscriptionHistory'] || 'Subscription History'
      } else {
        if(this.$route.query.route === 'cancelledSubscriptions'){
          return atc['portal.cancelledSubscriptions'] || 'Cancelled Subscriptions'
        }
        return atc['portal.headerYourSubscription'] || 'Your Subscriptions'
      }
    },

  },
  mounted() {
    this.mobileNavOpen = false
  },
  methods: {
    signOut() {
      window.location = `https://${this.shopData.domain}/account/logout`
    },

    goBackRoute(){
      this.$router.go(-1)
    },
  },
}
</script>

<template>
  <div v-if="windowWidth >= 1024" class="c-header">
    <div class="c-header__inner">
      <nav class="c-header__nav">
        <a class="c-header__navLink c-header__backToAccount" :href="shopifyAccountUrl">
          <icon-chevron-right
            class="c-header__navLinkIcon c-header__navLinkIcon--backToAccount"
          />
          {{ atc['portal.headerBackToAccount'] || 'Back to account' }}
        </a>

        <div class="c-header__navLink-middle">
          <nuxt-link
            class="c-header__navLink c-header__navLink--middle"
            :to="{
              name: 'index',
              query: {
                storeDomain,
                customerId,
              },
            }"
            >{{
              atc['portal.headerYourSubscription'] || 'Your Subscriptions'
            }}</nuxt-link
          >
          <nuxt-link
            class="c-header__navLink c-header__navLink--middle"
            :to="{
              name: 'history',
              query: {
                storeDomain,
                customerId,
              },
            }"
            >{{
              atc['portal.headerSubscriptionHistory'] || 'Past Shipiments'
            }}</nuxt-link
          >
           <nuxt-link
            class="c-header__navLink c-header__navLink--middle"
            :to="{
              name: 'index',
              query: {
                route: 'cancelledSubscriptions',
                storeDomain,
                customerId,
              },
            }"
            >{{
              atc['portal.cancelledSubscriptions'] || 'Cancelled Subscriptions'
            }}</nuxt-link
          >
        </div>
      </nav>

      <v-button
        class="c-button--auto c-header__button c-button--transparent"
        size="small"
        @onClick="signOut"
        >{{ atc['portal.headerSignOut'] || 'Sign Out' }}</v-button
      >
    </div>
  </div>

  <!-- Tablet DropDown -->

  <div v-else-if ="windowWidth < 1024 && windowWidth >= 768" class="c-headerTablet">
    <div class="c-headerTablet__inner">
      <div class="c-headerTablet__inner-top">
        <a class="c-headerTablet__backToAccount" :href="shopifyAccountUrl">
          <icon-chevron-right
            class="c-header__navLinkIcon c-header__navLinkIcon--backToAccount"
          />
          {{ atc['portal.headerBackToAccount'] || 'Back to account' }}
        </a>

        <a
          class="c-headerTablet__navOpener"
          href=""
          @click.prevent="mobileNavOpen = !mobileNavOpen"
          >{{ activePageName }}
          <icon-chevron-right
            class="c-headerTablet__navOpenerIcon"
            :class="{ 'c-headerTablet__navOpenerIcon--open': mobileNavOpen }"
          />
        </a>

        <v-button
          class="c-button--auto c-header__button c-button--transparent"
          size="small"
          @onClick="signOut">
          {{ atc['portal.headerSignOut'] || 'Sign Out' }}
        </v-button>
      </div>

      <nav v-if="mobileNavOpen" class="c-headerTablet__nav">
        <nuxt-link
          class="c-headerTablet__navLink"
          :to="{
            name: 'index',
            query: {
              storeDomain,
              customerId,
            },
          }"
          @click.native="mobileNavOpen = false"
          >{{
            atc['portal.headerYourSubscription'] || 'Your Subscriptions'
          }}</nuxt-link
        >

        <nuxt-link
          class="c-headerTablet__navLink"
          :to="{
            name: 'history',
            query: {
              storeDomain,
              customerId,
            },
          }"
          @click.native="mobileNavOpen = false"
          >{{
            atc['portal.headerSubscriptionHistory'] || 'Past Shipiments'
          }}</nuxt-link
        >

         <nuxt-link
            class="c-headerTablet__navLink"
            :to="{
              name: 'index',
              query: {
                route: 'cancelledSubscriptions',
                storeDomain,
                customerId,
              },
            }"
            @click.native="mobileNavOpen = false"
            >{{
              atc['portal.cancelledSubscriptions'] || 'Cancelled Subscriptions'
            }}</nuxt-link
          >
      </nav>
    </div>
  </div>

  <!-- Msobile -->

    <nav v-else>
      <!-- Default header mobile with Logo -->
      <div v-if="mobileHeader === 'default'"
        class="c-headerMobile">
          <a :href="shopifyAccountUrl" aria-label="Back to account"><account-icon /></a>

          <div>
              <img v-if = "storeLogo && !middleText"
                :src = "storeLogo"
                alt = ""
                class='c-headerMobile__image'
              />
              <!-- eslint-disable -->
              <h2 v-else-if="middleText" class='c-headerMobile__title' v-html="middleText">
              </h2>

              <h2 v-else> Upscribe </h2>
          </div>

          <span
              class = "c-headerMobile__logout-icon"
              role= "button"
              aria-label="Logout icon"
              tabindex="0"
              @click="signOut">
              <logout-icon />
          </span>
      </div>

      <!-- Header backward and signout  -->

      <div v-else-if="mobileHeader === 'backwardRoute'"
        class="c-headerMobile">
          <a
            class="c-headerMobile__navLink"
            aria-label="Back to previous page"
            @click='goBackRoute'>
              <icon-chevron-right class='c-headerMobile__navLink--mobileIcon'/>
          </a>
          <!-- eslint-disable -->
          <h2 v-if="middleText" class='c-headerMobile__title' v-html="middleText">
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
          <h2 v-if="middleText" class='c-headerMobile__title' v-html="middleText">
          </h2>

          <v-button
              class="c-headerMobile__navLink c-headerMobile__customizedButton"
              role="button"
              tabindex="0"
              @onClick="customizedFunction">
              {{ customizedFunctionText }}
          </v-button>
      </div>
    </nav>
</template>
