<template>
  <div v-if="currentOpen" class="c-headlineBanner">
      <div class="c-headlineBanner__inner">
        <span
          role = "button"
          class="c-headlineBanner__close-icon"
          aria-label="Close Icon"
          @click = "closeAnnouncement">
          <times-icon />
        </span>

        <h3 class="c-headlineBanner__announcement-text">{{ atc['portal.notification'] || 'Notification Banner'}}</h3>
      </div>
  </div>
</template>

<script>
import TimesIcon from '@components/Icon/times-icon'
import { mapState } from 'vuex'
export default {

  components:{
    TimesIcon,
  },

  data(){
    return{
      currentOpen: true,
    }
  },

  computed: {
   ...mapState('translations', ['atc']),
  },

  methods:{
    closeAnnouncement(){
      this.currentOpen = false
    },
  },
}
</script>
<style lang="scss">
@import '@design';

.c-headlineBanner{
  padding: 0 16px;
  @media (min-width: 420px){
    padding: 0
  }
}

.c-headlineBanner__inner{
  padding: 24px 32px 24px 16px;
  background-color: $color-blue-light-border;
  position: relative;
  width: 100%;
  margin: 0 auto 20px;

  @include bp(mobile-large){
      padding: 20px 24px;
  }
}

.c-headlineBanner__close-icon{
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
}

.c-headlineBanner__announcement-text{
  font-size: 14px;
  line-height: 21px;
  letter-spacing: 0.1px;
  font-weight: normal;
  font-style: normal;
  margin: 0 auto;

  @include bp($mobile-large){
    font-size: 17px;
    max-width: 100%;
  }
}
</style>
