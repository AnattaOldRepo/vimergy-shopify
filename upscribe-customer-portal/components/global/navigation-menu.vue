<template>
  <div>
    <div class="c-header__menu">
      <div class="c-header__selected" @click="mobileNavOpen = !mobileNavOpen">
        <a>
          {{ selectedNavItem }}
        </a>
        <icon-right
          class="c-menuIcon--open"
          :class="{ 'c-menuIcon--close': mobileNavOpen }"
        />
      </div>
      <nav v-if="mobileNavOpen" class="c-menuSelect__nav">
        <a
          class="c-menuSelect__navLink"
          :class="{ 'c-menuSelect__navLink--active': $route.name == 'all' }"
          @click="goToRoute('all')"
          >{{ atc['portal.headerAllSubscriptions'] || 'All Subscriptions' }}</a
        >

        <a
          class="c-menuSelect__navLink"
          :class="{ 'c-menuSelect__navLink--active': $route.name == 'index' }"
          @click="goToRoute('index')"
          >{{ atc['portal.headerYourSubscription'] || 'Your Subscriptions' }}</a
        >

        <a
          class="c-menuSelect__navLink"
          :class="{
            'c-menuSelect__navLink--active': $route.name == 'history',
          }"
          @click="goToRoute('history')"
          >{{ atc['portal.headerSubscriptionHistory'] || 'Past Shipiments' }}</a
        >
      </nav>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import IconRight from '@components/Icon/angle-right.vue'

export default {
  components: {
    IconRight,
  },
  data() {
    return {
      mobileNavOpen: false,
    }
  },
  computed: {
    ...mapState('translations', ['atc']),
    ...mapState('route', ['storeDomain', 'customerId']),
    selectedNavItem() {
      const { name } = this.$route
      switch (name) {
        case 'all':
          return this.atc['portal.headerAllSubscriptions'] || 'Subscriptions'
        case 'index':
          return (
            this.atc['portal.headerYourSubscription'] || 'Subscriptions Details'
          )
        case 'history':
          return (
            this.atc['portal.headerSubscriptionHistory'] ||
            'Subscription History'
          )
        default:
          return this.atc['portal.headerAllSubscriptions'] || 'Subscriptions'
      }
    },
  },
  methods: {
    goToRoute(type) {
      this.mobileNavOpen = false
      this.$router.push({
        name: type,
        query: {
          template: 'default',
          storeDomain: this.storeDomain,
          customerId: this.customerId,
        },
      })
    },
  },
}
</script>

<style lang="scss" scoped>
@import '@design';

.c-header__menu {
  height: 50px;
  max-width: 280px;
  color: $color-primary;
  border: 1px solid $color-black;
  display: block;
  margin: auto;
  .c-header__selected {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    height: 100%;
    .c-menuIcon--open {
      position: absolute;
      right: 20px;
      top: 20px;
      transform: rotate(-90deg);
    }
    .c-menuIcon--open {
      transform: rotate(90deg);
    }
  }
  .c-menuSelect__nav {
    display: flex;
    flex-direction: column;
    border-top: 1px solid $color-secondary;
    .c-menuSelect__navLink {
      background-color: $color-white;
      font-weight: 700;
      font-size: 14px;
      text-align: center;
      padding: 12px;
      z-index: 2;
      border-left: 1px solid $color-black;
      border-right: 1px solid $color-black;
      border-top: 1px solid $color-gray-300;
    }
    .c-menuSelect__navLink:last-child {
      border-bottom: 1px solid $color-black;
      border-top: none;
    }
    .c-menuSelect__navLink--active {
      font-weight: 700;
      color: $color-white;
      background-color: $color-primary;
      border-top: none;
      border-bottom: none;
    }
  }
}
</style>
