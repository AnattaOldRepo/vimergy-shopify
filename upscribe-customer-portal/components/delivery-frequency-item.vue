<template>
  <v-button
    class="c-drawerDeliveryItem"
    @onClick="handleChangeFrequency({ frequency, intervalUnit })"
  >
    <span class="c-drawerDeliveryItem__text">{{
      `${frequency} ${intervalUnitDisplay(frequency > 1)}`
    }}</span>

     <div class="c-option__select" :class="{ 'c-option__select--picked': isSelected }">
        <span class="c-option__inner"></span>
      </div>
  </v-button>
</template>

<script>
import VButton from '@components/v-button'
import { mapGetters } from 'vuex'
export default {
  components: {
    VButton,
  },

  props: {
    frequency: {
      type: String,
      default: '',
    },
    intervalUnit: {
      type: String,
      default: '',
    },
    handleChangeFrequency: {
      type: Function,
      default: () => {},
      required: true,
    },
    intervalUnitDisplay:{
      type: Function,
      default: () => {},
      required: true,
    },
    isSelected: {
      type: Boolean,
      default: false,
    },
  },

  computed:{
    ...mapGetters('activeSubscription', ['activeSubscription']),
  },
}
</script>
<style lang="scss" scoped>
@import '@design';

.c-drawerDeliveryItem {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 16px;
  border: 1px solid $color-blue-light-border;
  border-radius: 5px;
  background-color: $color-white;

  &:hover,
  &:active,
  &:focus,
  &--active {
    border-color: $color-primary;
    outline: none;
  }

  @include bp(tablet){
    margin-bottom: 22px;
  }
}

.c-drawerDeliveryItem__text {
  color: $color-black;
  font-family: $font-primary-medium;
  font-weight: 500;
  font-size: 16px;
  text-transform: capitalize;
  line-height: 21px;
  font-style: normal
}
</style>
