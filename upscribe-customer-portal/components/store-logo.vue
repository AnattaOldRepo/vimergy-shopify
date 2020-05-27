<script>
import { mapState } from 'vuex'
export default {
  computed: {
    ...mapState('shop', ['shopData', 'storeLogo']),

    storeUrl() {
      return `https://${this.shopData.domain}`
    },
  },
}
</script>

<template>
  <a
    v-if="storeLogo"
    class="c-logo__link"
    :href="storeUrl"
    :class="{ 'c-logo__link--text': shopData }"
  >
    <img
      v-if="storeLogo"
      :alt="shopData.name"
      class="c-logo__image c-logo__image--medium"
      :src="storeLogo"
    />
    <h1 v-else class="c-logo__title">{{ shopData.name }}</h1>
  </a>
</template>

<style lang="scss">
@import '@design';

.c-logo__link {
  display: block;
  width: 112px;
  margin-bottom: 0;
  text-decoration: none;

  @include bp(tablet) {
    width: 185px;
  }

  &--text {
    width: auto;

    @include bp(tablet) {
      width: auto;
    }
  }
}

.c-logo__image {
  display: block;
  width: auto;
  max-width: 150px;
  max-height: 100px;
  height: auto;
}

.c-logo__title {
  color: $color-black;
  text-decoration: none;
  font-size: 2.2em;
}
</style>
