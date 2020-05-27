<template>
  <div class = "c-navigationMobile">
    <div class="c-navigationMobile__middle">
      <nuxt-link
        class="c-navigationMobile__link"
        :class="{'c-navigationMobile__link--active': currentActivePage === 'index'}"
        :to="{
          name: 'index',
          query: {
            storeDomain,
            customerId,
            },
          }">
         <subscription-icon />
      </nuxt-link>

      <nuxt-link
        class="c-navigationMobile__link"
        :class="{'c-navigationMobile__link--active': currentActivePage === 'history'}"
        :to="{
          name: 'history',
          query: {
            storeDomain,
            customerId,
          },
        }">
        <history-icon />
      </nuxt-link>

      <nuxt-link
        class = "c-navigationMobile__link"
        :class="{'c-navigationMobile__link--active': currentActivePage === 'cancelledSubscriptions'}"
        :to="{
          name: 'index',
          query: {
            route: 'cancelledSubscriptions',
            storeDomain,
            customerId,
          },
        }" >
        <pause-icon />
      </nuxt-link>
    </div>
  </div>
</template>

<script>
import HistoryIcon from '../Icon/history-icon'
import PauseIcon from '../Icon/pause-icon'
import SubscriptionIcon from '../Icon/subscription-icon'
import { mapState } from 'vuex'

export default{
  components: {
    HistoryIcon,
    PauseIcon,
    SubscriptionIcon,
  },

  data(){
    return {
      currentActivePage: '',
    }
  },

  computed: {
    ...mapState('route', ['storeDomain', 'customerId']),
  },

  watch: {
    $route(to, from){
      const { query, path } = to
      const { id } = to.params

      if(query.route === 'cancelledSubscriptions' && !id){
        this.currentActivePage = 'cancelledSubscriptions'
      } else if(path === '/history'){
        this.currentActivePage = 'history'
      } else {
        this.currentActivePage = 'index'
      }
    },
  },

  mounted(){
    const { query, path } = this.$route
    const { id } = this.$route.params

    if(query.route === 'cancelledSubscriptions' && !id){
      this.currentActivePage = 'cancelledSubscriptions'
    } else if(path === '/history'){
      this.currentActivePage = 'history'
    } else {
      this.currentActivePage = 'index'
    }
  },
}
</script>
<style lang="scss">
@import '@design';

.c-navigationMobile{
  display: flex;
  justify-content: center;
  height: 56px;
  position: fixed;
  bottom: 0;
  width: 100%;
  background-color: $color-white;
}
.c-navigationMobile__middle{
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  width: 100%;
  padding: 0 30px;
  max-width: 600px;
}

.c-navigationMobile__link{
  margin: 0 35px;
  cursor: pointer;

  &--active{
    svg {
      fill: $color-blue-brand;
    }
  }

  &.nuxt-link-exact-active{
    border-bottom: 0px;
    svg {
      fill: $color-blue-brand;
    }
  }
}
</style>
