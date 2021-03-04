<template>
  <div v-if="currentOpen" class="c-headlineBanner">
    <div class="c-headlineBanner__inner">
      <span
        role="button"
        class="c-headlineBanner__close-icon"
        aria-label="Close Icon"
        @click="closeAnnouncement"
      >
        <times-icon />
      </span>

      <h3 class="c-headlineBanner__announcement-text"
        v-html="atc['portal.notification'] || 'Notification Banner'"
      ></h3>
    </div>
  </div>
</template>

<script>
import TimesIcon from '@components/Icon/times-icon'
import { mapState } from 'vuex'
export default {
  components: {
    TimesIcon,
  },

  data() {
    return {
      currentOpen: true,
    }
  },

  computed: {
    ...mapState('translations', ['atc']),
  },

  methods: {
    closeAnnouncement() {
      this.currentOpen = false
    },
  },
}
</script>
<style lang="scss">
@import '@design';

.c-headlineBanner {
  padding: 0 16px;

  @media (min-width: 420px) {
    padding: 0;
  }
}

.c-headlineBanner__inner {
  position: relative;
  width: 100%;
  padding: 24px 32px 24px 16px;
  margin: 0 auto 20px;
  background-color: $color-blue-light-border;

  @include bp(mobile-large) {
    padding: 20px 24px;
  }
}

.c-headlineBanner__close-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
}

.c-headlineBanner__announcement-text {
  margin: 0 auto;
  font-size: 14px;
  font-style: normal;
  font-weight: normal;
  line-height: 21px;
  letter-spacing: 0.1px;
  a {
    font-weight: bold;
    color: $color-primary;
  }

  @include bp($mobile-large) {
    max-width: 100%;
    font-size: 17px;
  }
}
</style>
