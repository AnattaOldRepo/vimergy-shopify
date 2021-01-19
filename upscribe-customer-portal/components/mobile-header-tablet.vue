<template>
  <div class="c-headerTablet__inner">
    <div class="c-headerTablet__inner-top">
      <a class="c-headerTablet__backToAccount" :href="shopifyAccountUrl">
        <icon-chevron-right
          class="c-header__navLinkIcon c-header__navLinkIcon--backToAccount"
        />
        {{ atc['portal.headerBackToAccount'] || 'Back to account' }}
      </a>

      <!-- <a
        class="c-headerTablet__navOpener"
        @click.prevent="mobileNavOpen = !mobileNavOpen"
        >{{ activePageName }}
        <icon-chevron-right
          class="c-headerTablet__navOpenerIcon"
          :class="{ 'c-headerTablet__navOpenerIcon--open': mobileNavOpen }"
        />
      </a> -->
      <!--
      <div class="c-header__logo">
        <img :src="storeLogo" />
      </div> -->
      <navigation-menu class="c-headerTablet__menu" />

      <v-button
        class="c-button--auto c-header__button c-button--transparent"
        size="small"
        @onClick="signOut"
      >
        {{ atc['portal.headerSignOut'] || 'Sign Out' }}
      </v-button>
    </div>

    <!-- <nav v-if="mobileNavOpen" class="c-headerTablet__nav">
      <nuxt-link
        class="c-headerTablet__navLink"
        :to="{
          name: 'all',
          query: {
            storeDomain,
            customerId,
          },
        }"
        @click.native="mobileNavOpen = false"
        >{{
          atc['portal.headerAllSubscriptions'] || 'All Subscriptions'
        }}</nuxt-link
      >

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
        v-if="subscriptionInActive.length"
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
        >{{ atc['portal.cancelledSubscriptions'] || 'Cancelled Subscriptions' }}
      </nuxt-link>
    </nav> -->
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import IconChevronRight from '@components/icon-chevron-right.vue'
import VButton from '@components/v-button.vue'
import NavigationMenu from '@components/global/navigation-menu.vue'

export default {
  components: {
    IconChevronRight,
    VButton,
    NavigationMenu,
  },

  data() {
    return {
      mobileNavOpen: false,
    }
  },

  computed: {
    ...mapState('translations', ['atc']),

    ...mapGetters('subscriptions', [
      'subscriptionActive',
      'subscriptionInActive',
    ]),

    ...mapState('shop', ['shopData', 'storeLogo']),

    ...mapState('route', ['storeDomain', 'customerId']),

    ...mapState('shop', ['shopData']),

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
        if (this.$route.query.route === 'cancelledSubscriptions') {
          return (
            atc['portal.cancelledSubscriptions'] || 'Cancelled Subscriptions'
          )
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
  },
}
</script>
