<script>
import { mapState } from 'vuex'
import { windowSizes } from '@mixins/windowSizes'
import MobileHeaderTablet from '@components/mobile-header-tablet'
import MobileHeaderPhone from '@components/mobile-header-phone'
import MobileHeaderDesktop from '@components/mobile-header-desktop'

export default {
  components: {
    MobileHeaderDesktop,
    MobileHeaderPhone,
    MobileHeaderTablet,
  },

  mixins: [windowSizes],

  props: {
    middleHtml: {
      type: [String, Boolean],
      default: false,
    },

    mode:{
      type: String,
      default: 'default',
    },

    customizedFuncText:{
      type: String,
      default: '',
    },
  },


  computed: {
    ...mapState('translations', ['atc']),

    ...mapState('route', ['storeDomain', 'customerId']),

    ...mapState('shop', ['shopData', 'storeLogo']),
  },
}
</script>

<template>
  <div v-if="windowWidth >= 1024" class="c-header">
    <mobile-header-desktop />
  </div>

  <!-- Tablet DropDown -->

  <div v-else-if ="windowWidth < 1024 && windowWidth >= 768" class="c-headerTablet">
    <mobile-header-tablet />
  </div>

  <!-- Mobile -->

  <div v-else>
    <mobile-header-phone
      :middle-html="middleHtml"
      :mode="mode"
      :customized-func-text="customizedFuncText"
      @headerFunc="$emit('headerAction')"
    />
  </div>
</template>

<style lang="scss">
@import '@design';

.c-header {
  width: 100%;
  //height: 100px;
  margin: 0 auto;
  //background-color: $color-white;
}

.c-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1300px;
  height: 100%;
  padding: 0 20px;
  margin: 0 auto;
}

.c-header__navUp {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  margin-left: -30px;
}

.c-header__navLink {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 25px;
  font-family: $font-primary-medium;
  font-size: 14px;
  font-weight: 500;
  color: $color-black;
  text-decoration: none;
  text-transform: capitalize;
  transition: all 0.1s ease;
  border-bottom: 3px solid transparent;

  &--middle {
    padding: 0;
    padding-bottom: 6px;
    margin: 20px 25px;
  }

  &:hover{
    @include border-focus;
  }
}

.nuxt-link-exact-active {
  font-weight: bold;


  @include bp(tablet){
    @include border-focus;
  }
}

.c-header__navLinkIcon {
  width: 12px;
  height: 11px;
  color: inherit;
  fill: currentColor;

  &--backToAccount {
    margin-right: 5px;
    transform: rotate(180deg);
  }
}

.c-header__navLink-middle {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.c-header__button {
  padding: 12px 20px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.c-headerTablet,
.c-headerMobile{
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.c-headerTablet{
  padding: 13px 32px;
}

.c-headerMobile{
  padding: 18px 24px;
}

.c-headerTablet__inner,
.c-headerMobile__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  max-width: 1280px;
  height: auto;
  margin: 0 auto;
}

.c-headerMobile__image{
    max-width: 200px;
    max-height: 49px;
    object-fit: contain;
}

.c-headerTablet__inner-top{
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.c-headerTablet__backToAccount,
.c-headerMobile__backToAccount {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 11px;
  font-family: $font-primary-medium;
  font-size: 14px;
  font-weight: 500;
  color: $color-black;
  text-decoration: none;
  transition: all 0.1s ease;

  svg {
    margin-right: 8px;
    margin-left: -26px;
  }

  &:visited {
    color: $color-black;
  }

  &.nuxt-link-exact-active,
  &:hover,
  &:focus,
  &:active {
    color: $color-link;
  }
}

.c-headerTablet__navOpener {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 19px 25px 21px;
  font-family: $font-primary-medium;
  font-size: 14px;
  font-weight: 500;
  color: $color-black;
  text-decoration: none;
  font-weight: bold;

  &:visited,
  &:active,
  &:focus {
    color: $color-black;
  }
}

.c-headerTablet__navOpenerIcon {
  width: 12px;
  height: 12px;
  margin-left: 10px;
  color: inherit;
  fill: currentColor;
  transform: rotate(90deg);

  &--open {
    transform: rotate(270deg);
  }
}

.c-headerMobile__nav {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  padding: 8px 0;
  border-top: 1px solid $color-blue-light-border;
}

.c-headerMobile__logout-icon{
  cursor: pointer;
}

.c-headerTablet__navLink,
.c-headerMobile__navLink {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 18px 25px;
  font-family: $font-primary-medium;
  font-size: 14px;
  font-weight: 500;
  color: $color-black;
  text-decoration: none;
  transition: all 0.1s ease;

  &:visited {
    color: $color-black;
  }

  &.nuxt-link-exact-active,
  &:hover,
  &:focus,
  &:active {
    color: $color-link;
    border-bottom: 0px;
  }
}

.c-headerMobile__navLink{
  padding: 0px;
  width: auto;
}

.c-headerMobile__navLinkIcon {
  width: 16px;
  height: 16px;
  color: inherit;
  fill: currentColor;

  &--backToAccount {
    margin-right: 10px;
    transform: rotate(180deg);
  }
}

.c-header__backToAccount{
  &:hover{
    border-bottom: 0px;
  }
}

.c-headerMobile__navLink--mobileIcon{
  width: 15px;
  height: 21px;
  cursor: pointer;
  transform: rotateZ(180deg);

  &:hover{
    border: 0px
  }
}

.c-headerMobile__title{
  font-size: 16px;
  line-height: 21px;
  color: $color-black;
  font-weight: 600;
  text-transform: capitalize;
}

.c-headerMobile__customizedButton{
  border: none;
  color: $color-blue-brand;
  background-color: transparent;
  min-width: 0px;

  &:hover,
  &:focus{
    background-color: transparent
  }
}
</style>
