<template>
  <p
    class="c-mobileScreenActions__default"
    :class="{
      'c-mobileScreenActions__updating': status === 'updating',
      'c-mobileScreenActions__success': status === 'success',
      'c-mobileScreenActions__error': status === 'error',
    }"
    >{{ message }}
  </p>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
export default {
  computed: {
    ...mapState('mobileGlobalManagement', ['message', 'status']),
  },

  watch: {
    $route(){
      if(this.message && this.status){
        this.setMessage('')
        this.setStatus('')
      }
    },
  },

  methods: {
    ...mapMutations('mobileGlobalManagement', ['setMessage', 'setStatus']),
  },
}
</script>


<style lang="scss">
@import '@design/_colors';
.c-mobileScreenActions__default{
  font-size: 16px;
  line-height: 18px;
  max-width: 400px;
  margin: 20px auto 0;
  padding: 0 16px;
  text-align: center;
}

.c-mobileScreenActions__updating{
  color: $color-blue-brand;
}

.c-mobileScreenActions__success{
  color: $color-success;
}

.c-mobileScreenActions__error{
  color: $color-danger
}
</style>
