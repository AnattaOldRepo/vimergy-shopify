<script>
import { mapActions, mapGetters, mapState } from 'vuex'

import DrawerWrap from '@components/drawer-wrap.vue'
import SingleFieldForm from '@components/single-field-form.vue'

export default {
  components: {
    DrawerWrap,
    SingleFieldForm,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    subscriptionId: {
      type: Number,
      required: true,
    },
  },
  data: () => {
    return {
      drawerStatus: null,
    }
  },
  computed: {
    ...mapState('translations', ['atc']),

    ...mapState('shop', ['currencySymbol']),

    ...mapGetters('activeSubscription', ['activeSubscription']),
  },

  methods: {
    ...mapActions('subscriptions', ['UPDATE_SUBSCRIPTION']),

    async handleUpdateName(name) {
      const { subscriptionId } = this

      if (!name || !subscriptionId) return

      const updatePayload = {
        requestPayload: {
          name,
        },
        subscriptionId,
      }

      this.drawerStatus = 'PENDING'

      try {
        await this.UPDATE_SUBSCRIPTION(updatePayload)
        this.drawerStatus = 'SUCCESS'
      } catch (e) {
        this.drawerStatus = { state: 'FAILURE', message: e.message }
      }
    },
  },
}
</script>

<template>
  <drawer-wrap :show="show" :status="drawerStatus" @close="$emit('close')">
    <div class="c-drawerEditSubscriptionName c-drawer">
      <h2 class="c-drawer__title">{{
        atc['portal.editSubscriptionNameDrawerTitle'] ||
          'Edit Subscription Name'
      }}</h2>

      <single-field-form
        class="c-formBlock--noPadding c-editSubscriptionName"
        :form-submit-button-text="
          atc['buttons.updateSubscriptionName'] || 'Update Name'
        "
        form-name="edit-subscription-name"
        :input-label="
          atc['labels.subscriptionName'] || 'Subscription Name'
        "
        @onSubmit="handleUpdateName"
      />
    </div>
  </drawer-wrap>
</template>
