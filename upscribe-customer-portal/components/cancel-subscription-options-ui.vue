<template>
  <div v-if="reasons && reasons.length" class="c-cancel__list">
    <label
      v-for="(reason, index) in reasons"
      :key="'cancel-reason-' + index"
      :for="'cancel-reason-' + index"
      class="c-cancel__listItem"
    >
      <!-- <span>Active: {{ isActiveSelectionClass({
          reason,
          position
        })}}</span>
       {{ position === 1 && position1Id === reason.id }}
      {{ position === 2 && position2Id === reason.id }}
      {{ position === 3 && position3Id === reason.id }} -->
      <div class="c-cancel__listItem__inner">
        <label
          class="c-cancel__listItemLabel"
          :for="'position-' + position + '-cancel-reason-' + index"
          @click.stop="$emit('setCancellationReason', { reason, position })"
        >
          <div
            class="c-cancel__listItemIcon"
            :class="{
              'c-cancel__listItemIcon--active': isActiveSelectionClass({
                reason,
                position,
              }),
            }"
          ></div>
          <span class="c-cancel__listItemText">{{ reason.message }}</span>
          <input
            :id="'cancel-reason-' + index"
            :value="reason.id"
            class="u-visuallyHidden"
            type="radio"
          />
        </label>

        <cancel-subscription-options-ui
          v-if="
            useTheseReasons &&
              isActiveSelection({
                reason,
                position,
              })
          "
          style="padding-left: 20px;margin-top:20px;"
          :reasons="useTheseReasons"
          :position="position + 1"
          :position1-id="position1Id"
          :position2-id="position2Id"
          :position3-id="position3Id"
          :position1="position1"
          :position2="position2"
          :position3="position3"
          @setCancellationReason="handleSetCancellationReason"
        />
        <!-- @setCancellationReason="handleSetCancellationReason({ reason, position})" -->
      </div>
    </label>
  </div>
</template>

<script>
/* eslint-disable no-unreachable */

import CancelSubscriptionOptionsUi from '@components/cancel-subscription-options-ui'

export default {
  name: 'CancelSubscriptionOptionsUi',
  components: {
    CancelSubscriptionOptionsUi,
  },
  props: {
    reasons: {
      type: Array,
      required: true,
    },
    position: {
      type: Number,
      required: true,
    },
    position1Id: {
      type: [Boolean, Number],
      default: false,
    },
    position2Id: {
      type: [Boolean, Number],
      default: false,
    },
    position3Id: {
      type: [Boolean, Number],
      default: false,
    },
    position1: {
      type: [Boolean, Object],
      default: false,
    },
    position2: {
      type: [Boolean, Object],
      default: false,
    },
    position3: {
      type: [Boolean, Object],
      default: false,
    },
  },
  computed: {
    useTheseReasons() {
      const { position, position1, position2, position3 } = this
      if (position === 1 && position1) {
        return position1.children
          ? position1.children.filter((reason) => reason.active)
          : false
      } else if (position === 2 && position2) {
        return position2.children
          ? position2.children.filter((reason) => reason.active)
          : false
      } else if (position === 3 && position3) {
        return position3.children
          ? position3.children.filter((reason) => reason.active)
          : false
      } else {
        return false
      }
    },
  },
  methods: {
    handleSetCancellationReason(payload) {
      if (!payload) return
      if (!payload.reason || !payload.position) return
      const { reason, position } = payload

      let newPosition = position
      this.$emit('setCancellationReason', { reason, position: newPosition })
    },

    isActiveSelectionClass({ reason, position }) {
      const { position1Id, position2Id, position3Id } = this
      const activePosition = this.position

      if (!activePosition) return false

      const activePositionId = this[`position${activePosition}Id`]

      if (!activePositionId) return false

      if (activePosition === position && position === 1) {
        return position1Id === reason.id
      } else if (activePosition === position && position === 2) {
        return position2Id === reason.id
      } else if (activePosition === position && position === 3) {
        return position3Id === reason.id
      } else {
        return false
      }
      // return (position === 1 && position1Id === reason.id) || (position === 2 && position2Id === reason.id) || (position === 3 && position3Id === reason.id)
    },
    isActiveSelection({ reason, position }) {
      const { position1Id, position2Id, position3Id } = this
      const activePosition = this.position

      if (!activePosition) return false
      const activePositionId = this[`position${activePosition}Id`]

      if (!activePositionId) return false

      if (activePosition === position && position === 1) {
        return position1Id === reason.id
      } else if (activePosition === position && position === 2) {
        return position2Id === reason.id
      } else if (activePosition === position && position === 3) {
        return position3Id === reason.id
      } else {
        return false
      }
      // return (position === 1 && position1Id === reason.id) || (position === 2 && position2Id === reason.id) || (position === 3 && position3Id === reason.id)
    },
  },
}
</script>
