<script>
import { mapMutations, mapState } from 'vuex'

export default {
  data() {
    return {
      drawerDeliveryDateOpen: false,
      drawerProductsOpen: false,
      skippingShipment: false,
    }
  },

  computed: {
    ...mapState('translations', ['atc']),
    ...mapState('editMode', ['editNextOrder']),

    toggleWidth() {
      const { atc, editNextOrder } = this
      let label = ''
      if (editNextOrder) {
        label = atc['portal.editModeNextOrder'] || 'Next Order'
      } else {
        label =  atc['portal.editModeSubscription'] || 'Subscription'
      }

      return 50 + (label.length * 10)
    },
  },

  methods: {
    ...mapMutations('editMode', ['setEditNextOrder']),

    handleToggleEditNextOrder(event) {
      this.setEditNextOrder(event.value)
    },
  },
}
</script>

<template>
  <div class="c-subscriptionBlock__section">
    <h2 class="c-subscriptionBlock__sectionTitle">
      {{ atc['portal.editModeLabel'] || 'Edit Mode' }}
    </h2>
    <div class="c-toggleButtonWrap">
      <no-ssr>
        <toggle-button
          v-if="atc"
          :value="editNextOrder"
          :sync="true"
          :color="{
            checked: '#2d96db',
            unchecked: '#1d80c1',
            disabled: '#CCCCCC',
          }"
          :switch-color="{
            checked: '#fff',
            unchecked: '#fff',
          }"
          :width="toggleWidth"
          :height="40"
          :margin="5"
          :font-size="18"
          :labels="{
            checked: atc['portal.editModeNextOrder'] || 'Next Order',
            unchecked: atc['portal.editModeSubscription'] || 'Subscription',
          }"
          @change="handleToggleEditNextOrder"
        />
      </no-ssr>
    </div>
  </div>
</template>

<style lang="scss">
@import '@design';

.c-toggleButtonWrap {
  text-align: center;

  @include bp(tablet-large) {
    text-align: left;
  }
}
</style>
