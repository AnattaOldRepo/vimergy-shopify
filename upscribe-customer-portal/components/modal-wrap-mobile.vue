<template>
    <div v-show="show" class="modal-mask modal-mask--mobile" @click="close">
      <div
        class="modal-container--mobile modal-inner-active"
        :class="{'modal-inner-inactive': closeAnimation}"
        @click.stop>
        <div
          v-if="progressBarStatus"
          class="c-modalWrapMobile__updateStatus"
          :class="{
            'c-modalWrapMobile__updateStatus--updating': progressBarStatus === 'updating',
            'c-modalWrapMobile__updateStatus--success': progressBarStatus === 'success',
            'c-modalWrapMobile__updateStatus--rejected': progressBarStatus === 'rejected',
          }"
        >
          {{ progressBarMessage }}
        </div>

        <div class="modal-close__contain">
          <span v-if="withCloseIcon" class="modal-close modal-close--mobile" @click="close">
            <times-icon/>
          </span>
        </div>

        <slot></slot>
      </div>
    </div>
</template>

<script>
import TimesIcon from '@components/Icon/times-icon'
export default {
  components: {
    TimesIcon,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    withCloseIcon: {
      type: Boolean,
      default: true,
    },
    progressBarStatus:{
      type: String,
      default: '',
    },
    progressBarMessage:{
      type: String,
      default: '',
    },
    closeAnimation: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      transitionOut: false,
    }
  },

  mounted() {
    // close modal on escape
    document.addEventListener('keydown', (e) => {
      if (this.show && e.keyCode === 27) {
        this.close()
      }
    })
  },
  methods: {
    close() {
      this.$emit('close')
    },
  },
}
</script>

<style lang="scss">
@import '@design';

.modal-mask--mobile{
  display: flex;
  justify-content: center;
  align-items: flex-end;

  @include bp(mobile-large){
    align-items: center;
  }
}

.modal-container--mobile{
  position: relative;
  max-height: 500px;
  min-height: 225px;
  width: 100%;
  padding: 0px 0px 20px;
  overflow-y: scroll;
  overflow-x: hidden;
  top: 0;
  border-radius: 12px 12px 0px 0px;
  box-shadow: none;
  -webkit-overflow-scrolling: touch;
  -ms-overflow-style: -ms-autohiding-scrollbar;
  height: auto;
  background-color:$color-white;
  margin: 0;
  transition: all 0.5s linear;

  @media(min-width: 600px){
    width: 375px;
    border-radius: 12px;
  }
}

.c-modalWrapMobile__updateStatus{
  position: sticky;
  top: 0px;
  left: 0;
  width: 100%;
  height: auto;
  background-color: $color-white;
  display: flex;
  justify-content: center;
  align-items: center;
  color: $color-white;
  text-transform: capitalize;
  padding: 2px 5px;
  text-align: center;
  font-size: 12px;
  z-index: 100;

  &--updating{
    background-color: $color-blue-brand;
  }

  &--success{
    background-color: $color-success;
  }

  &--rejected{
    background-color: $color-danger;
  }
}

.modal-inner-active{
  animation: upToTop 0.5s ease-out;
}

.modal-inner-inactive{
  animation: downToBottom 0.5s linear;
}


@keyframes upToTop {
  0%{
    transform: translateY(200%)
  }
  100%{
    transform: translateY(0)
  }
}

@keyframes downToBottom{
  0%{
    transform: translateY(0)
  }
  100%{
    transform: translateY(250%)
  }
}

.modal-close__contain{
  position: relative;
  height: 12px;
  margin-top: 15px;
}
</style>
