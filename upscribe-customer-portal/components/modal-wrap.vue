<template>
  <transition name="modal">
    <div v-show="show" class="modal-mask" @click="close">
      <div class="modal-container" @click.stop>
        <span class="modal-close" @click="close">×</span>
        <slot></slot>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  components: {},
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      transitionOut: false,
    }
  },
  computed: {},
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

.c-overlayMask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  transition: all 300ms ease;
}

.c-modalLogic {
  position: fixed;
  opacity: 0;
  width: 100%;
  padding: 20px;
  left: 50%;
  top: 50%;
  text-align: center;
  transform: translate(-50%, calc(-50% + 30px));
  z-index: 99997;
  transition: all 0.3s ease-in-out;
  padding: 20px;
  max-width: 640px;
  display: block;
  transition: all 0.3s ease-in-out;
  opacity: 1;
  transform: translate(-50%, calc(-50% - 0px));

  &:focus {
    outline: none;
  }
}

.c-modalLogic__close {
  position: absolute;
  width: 13px;
  height: 13px;
  top: 50px;
  right: 36px;
  cursor: pointer;
  z-index: 1000;

  svg {
    height: 100%;
    width: 100%;
  }
}

.modal-close {
  position: absolute;
  right: 18px;
  cursor: pointer;
}

.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  transition: opacity 0.3s ease;
}

.modal-container {
  top: 50%;
  position: relative;
  max-width: 600px;
  margin: 40px auto 0;
  width: 100%;
  border-radius: 5px;
  padding: 50px 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
  font-family: Helvetica, Arial, sans-serif;
  overflow: scroll;
  max-height: calc(100% - 60px);
  transform: translateY(calc(-50% - 30px));

  @media (max-width: 600px) {
    height: 100vh;
    margin: 0;
  }
}

.modal-header h3 {
  margin-top: 0;
  color: #42b983;
}

.modal-body {
  margin: 20px 0;
}

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>
