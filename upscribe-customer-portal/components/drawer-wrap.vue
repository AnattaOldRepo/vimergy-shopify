<script>
import { mapState, mapMutations} from 'vuex'
// import { Linear } from 'gsap';

/* eslint-disable vue/no-v-html */

// import ConfirmModal from '@components/confirm-modal.vue'

export default {
  components: {
    // ConfirmModal,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    // confirmModalOpen: {
    //   type: Boolean,
    //   default: false,
    // },
    status: {
      type: [Boolean, String, Object],
      default: false,
    },
    manualDrawerWarning: {
      type: [Boolean, String],
      default: false,
    },
  },
  data() {
    return {
      transitionOut: false,
      transitionShow: false,
      scrollMagicInitiated: false,
    }
  },
  computed: {
    ...mapState('translations', ['atc']),

    ...mapState('editMode', ['editNextOrder']),

    ...mapState('orders', ['drawerSubscriptionHistoryOpen']),

    drawerStatusClass() {
      const { status } = this

      if (status === 'PENDING' || status.state === 'PENDING') {
        return 'c-drawerLogic__status--pending'
      } else if (status === 'FAILURE' || status.state === 'FAILURE') {
        return 'c-drawerLogic__status--failure'
      } else if (status === 'SUCCESS' || status.state === 'SUCCESS') {
        return 'c-drawerLogic__status--success'
      } else {
        console.log('drawerStatusClass', status.state)
        return false
      }
    },
    drawerStatusMessageClass() {
      const { status } = this

      if (status === 'PENDING' || status.state === 'PENDING') {
        return 'c-drawerLogic__statusMessage--pending'
      } else if (status === 'FAILURE' || status.state === 'FAILURE') {
        return 'c-drawerLogic__statusMessage--failure'
      } else if (status === 'SUCCESS' || status.state === 'SUCCESS') {
        return 'c-drawerLogic__statusMessage--success'
      } else {
        console.log('drawerStatusClass', status.state)
        return false
      }
    },
    drawerStatusText() {
      const { status, atc } = this

      if (status === 'PENDING' || status.state === 'PENDING') {
        return atc['notices.updateSavingNotice'] || 'Saving'
      } else if (status === 'FAILURE' || status.state === 'FAILURE') {
        return atc['notices.updateErrorNotice'] || 'Error Saving'
      } else if (status === 'SUCCESS' || status.state === 'SUCCESS') {
        return atc['notices.updateSavedSuccessfullyNotice'] || 'Saved Successfully'
      } else {
        return status
      }
    },
    drawerStatusMessage() {
      const { status } = this
      if (status && status.message) {
        return status.message
      } else {
        return false
      }
    },
  },
  destroyed() {
    if (this.scrollMagicInitiated) {
      this.$ksvuescr.$emit('destroy')
      this.scrollMagicInitiated = false
      this.SET_DRAWER_SUBSCRIPTION_HISTORY_OPEN(false)
    }
  },
  mounted() {
    // close drawer on escape
    document.addEventListener('keydown', (e) => {
      if (this.show && e.keyCode === 27) {
        this.close()
      }
    })

    this.$nextTick(() => {
      this.transitionShow = true
    })
  },
  methods: {
    ...mapMutations('orders', ['SET_DRAWER_SUBSCRIPTION_HISTORY_OPEN']),

    close() {
      if (this.show) {
        this.transitionOut = true
        setTimeout(() => {
          this.$emit('close')
          this.transitionOut = false
          this.SET_DRAWER_SUBSCRIPTION_HISTORY_OPEN(false)
        }, 300)
      }
    },
  },
}
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <transition name="drawer">
    <div
      v-show="show && transitionShow"
      :aria-hidden="show ? 'true' : 'false'"
      class="drawer-transition"
      :class="{ 'drawer-transition-out': transitionOut }"
    >
      <div
        v-show="show && transitionShow"
        class="c-overlayMask drawer-transition-overlay"
        @click="close"
      ></div>

      <div
        ref="drawer"
        class="js-upscribe-drawer c-drawerLogic drawer-transition-container c-drawerLogic--fromLeft"
      >
        <div
          v-if="status"
          class="c-drawerLogic__status"
          :class="drawerStatusClass"
        >
          <span class="c-drawerLogic__statusText">{{ drawerStatusText }}</span>
        </div>
        <svg
          class="c-drawerLogic__close"
          :class="{ 'c-drawerLogic__close--status': status }"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          width="15"
          height="15"
          viewBox="0 0 15 15"
          @click="close"
        >
          <defs>
            <polygon
              id="close-a"
              points="14.515 2.141 12.333 0 7.258 4.987 2.181 0 0 2.141 5.077 7.128 0 12.115 2.181 14.257 7.258 9.271 12.333 14.257 14.515 12.115 9.438 7.128"
            />
          </defs>
          <use fill-rule="evenodd" xlink:href="#close-a" />
        </svg>

        <div
          class="c-drawer__wrapper"
          :class="{ 'c-drawer__wrapper--nextOrderWarning': editNextOrder }"
        >
          <p
            v-if="editNextOrder && !manualDrawerWarning && !drawerSubscriptionHistoryOpen"
            class="c-drawerLogic__nextOrderWarning"
            >{{ atc['portal.portal.editModeNextOrderInfoText'] || 'Changes made will only affect your next order. To affect all shipments, toggle the Edit Mode.' }}</p
          >

          <p
            v-else-if="manualDrawerWarning"
            class="c-drawerLogic__nextOrderWarning"
          >
            {{ manualDrawerWarning }}
          </p>
          <slot slot />

          <!-- Confirm Portal
          <portal to="confirm">
            <confirm-modal
              ref="confirm"
              :show="confirmModalOpen"
              title="Would you like these changes to reflect in your next order along with your global subscription settings?"
              confirm-button="Update Settings and Next Order"
              deny-button="Update Base Settings Only"
              @close="$emit('closeConfirmModal')"
            />
          </portal> -->

          <slot name="status-message">
            <div class="c-drawerLogic__statusMessageWrap">
              <p
                v-if="drawerStatusMessage"
                class="c-drawerLogic__statusMessage"
                :class="drawerStatusMessageClass"
                v-html="drawerStatusMessage"
              />
            </div>
          </slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<style lang="scss">
@import '@design';
.c-overlayMask {
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  transition: opacity 300ms ease;
}

.c-drawerLogic {
  position: fixed;
  top: 0;
  right: 0;
  left: auto;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  min-width: 392px;
  max-width: 100%;
  height: 100vh;
  max-height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  z-index: 2422271;
  background-color: #F7F9FB;
  backface-visibility: hidden;
  transition: transform 300ms ease;
  -webkit-overflow-scrolling: touch;
  -ms-overflow-style: -ms-autohiding-scrollbar;
  transform: translateX(0);

  &:focus {
    outline: none;
  }
}

.c-drawerLogic__status {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 20px;
  background-color: $color-dark;
  z-index: 10000;

  &--pending {
    background-color: $color-info;
  }

  &--failure {
    background-color: $color-error;
  }

  &--success {
    background-color: $color-success;
  }
}

.c-drawerLogic__statusMessageWrap {
  flex: 1;
  width: 100%;
  padding: 0 20px;
  background-color: #F7F9FB;
}

.c-drawerLogic__nextOrderWarning {
  width: 100%;
  text-align: center;
  font-family: $font-primary-regular;
  font-size: 14px;
  color: $color-primary;
  background-color: transparent;
  padding: 10px 20px 20px;
  line-height: 1.5;
  max-width: 400px;
}

.c-drawerLogic__statusMessage {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 20px;
  font-size: 14px;
  color: $color-text;
  text-align: center;
  background-color: transparent;

  &--pending {
    color: $color-info;
  }

  &--failure {
    color: $color-error;
  }

  &--success {
    color: $color-text;
  }
}

.c-drawerLogic__statusText {
  font-family: $font-primary-regular;
  font-size: 14px;
  color: $color-white;
  text-align: center;
}

.c-drawerLogic__close {
  position: absolute;
  top: 32px;
  right: 32px;
  z-index: 1000;
  cursor: pointer;
  border: 1px solid #A3B5BF;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  padding: 6px;
  fill: #A3B5BF;

  &--status {
    top: 40px;
  }

  svg {
    width: 100%;
    height: 100%;
  }
}

.drawer-transition .drawer-enter .drawer-transition-overlay {
  opacity: 0;
}

.drawer-leave-active .drawer-transition-overlay {
  opacity: 0;
}

.drawer-enter .drawer-transition-container,
.drawer-leave-active .drawer-transition-container {
  transform: translateX(100%);
}

.drawer-transition.drawer-transition-out {
  .drawer-transition-container {
    transition: 300ms transform ease;
    transform: translateX(100%);
  }

  .drawer-transition-overlay {
    opacity: 0;
    transition: 500ms opacity ease;
  }
}
</style>
