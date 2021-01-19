<template>
  <div class="c-mobileScreenDiscount">
    <portal to="header">
      <the-header
        :middle-html="
          atc['portal.editSubscriptionNameDrawerTitle'] ||
            'Edit Subscription Name'
        "
        mode="backwardRoute"
      />
    </portal>

    <div class="c-mobileScreenDiscount__contain">
      <div>
        <single-field-form
          class="c-formBlock--noPadding c-discountForm"
          :form-submit-button-text="
            atc['portal.updateSubscriptionNameButton'] || 'Update Name'
          "
          form-name="edit-subscription-name"
          :input-label="
            atc['portal.subscriptionNameInputLabel'] || 'Subscription Name'
          "
          @onSubmit="handleUpdateName"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapGetters, mapState } from 'vuex'

import TheHeader from '@components/the-header.vue'
import SingleFieldForm from '@components/single-field-form.vue'

export default {
  components: {
    TheHeader,
    SingleFieldForm,
  },

  computed: {
    ...mapState('translations', ['atc']),

    ...mapState('shop', ['currencySymbol']),

    ...mapState('route', ['customerId', 'storeDomain']),

    ...mapGetters('activeSubscription', ['activeSubscription']),
  },

  methods: {
    ...mapMutations('mobileGlobalManagement', ['setMessage', 'setStatus']),

    ...mapActions('mobileGlobalManagement', ['swapPageTransitionDynamic']),

    ...mapActions('subscriptions', ['UPDATE_SUBSCRIPTION']),

    async handleUpdateName(name) {
      const { customerId, storeDomain } = this

      if (!name) return

      const updatePayload = {
        requestPayload: {
          name,
        },
      }

      this.setMessage('Updating subscription name')
      this.setStatus('updating')

      try {
        await this.UPDATE_SUBSCRIPTION(updatePayload)

        this.$router.push({
          query: {
            customerId,
            storeDomain,
          },
        })

        this.setMessage(
          `Subscription name updated to ${updatePayload.requestPayload.name}`
        )
        this.setStatus('success')
      } catch (e) {
        this.setMessage(e.message)
        this.setStatus('error')
      }
    },
  },
}
</script>

<style lang="scss">
.c-mobileScreenDiscount__contain {
  @media (max-width: 425px) {
    padding: 0 16px;
  }
}
</style>
