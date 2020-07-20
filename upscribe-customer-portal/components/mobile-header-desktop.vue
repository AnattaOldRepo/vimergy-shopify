<template>
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
              atc['portal.headerSubscriptionHistory'] || 'Past Shipments'
            }}</nuxt-link
          >
           <nuxt-link
             v-if="subscriptionInActive"
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
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import VButton from '@components/v-button.vue'
import IconChevronRight from '@components/icon-chevron-right.vue'

export default {
  components:{
    IconChevronRight,
    VButton,
  },

  computed:{
    ...mapState('translations', ['atc']),

    ...mapGetters('subscriptions', ['subscriptionActive', 'subscriptionInActive']),

    ...mapState('route', ['storeDomain', 'customerId']),

    ...mapState('shop', ['shopData']),

    shopifyAccountUrl() {
      const { shopData } = this
      if (!shopData) return
      return `https://${shopData.domain}/account`
    },
  },

  methods: {
    signOut() {
      window.location = `https://${this.shopData.domain}/account/logout`
    },
  },
}
</script>
