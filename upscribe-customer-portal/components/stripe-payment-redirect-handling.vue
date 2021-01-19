<script>
import { removeQueryParam } from '@utils/helpers'

import { mapState } from 'vuex'

export default {
  data: () => {
    return {
      stripe: null,
    }
  },
  computed: {
    ...mapState('shop', ['stripePublicKey']),

    ...mapState('payment', ['savedPaymentData', 'paymentType']),
  },
  mounted() {
    this.handlePotentialPaymentVerificationRedirects()
  },
  methods: {
    isValidPaymentRedirectClientSecret(client_secret) {
      const { savedPaymentData } = this
      return savedPaymentData.client_secret === client_secret
    },

    removeRedirectQueryParams() {
      var cleanedQueryParamsUrl = removeQueryParam(
        ['client_secret', 'livemode', 'source'],
        window.location.href
      )

      window.history.replaceState({}, document.title, cleanedQueryParamsUrl)
    },

    handlePotentialPaymentVerificationRedirects() {
      const vm = this
      const { $route, savedPaymentData, paymentType } = this
      const queryParams = $route.query || {}
      const { client_secret, livemode, source } = queryParams
      const stripe = window.Stripe(vm.stripePublicKey)
      this.stripe = stripe

      if (client_secret || livemode || source) {
        // payment validation available, compare values
        if (!this.isValidPaymentRedirectClientSecret(client_secret)) {
          this.error = 'Incorrect client secret. Please try again.'
          return
        }

        this.removeRedirectQueryParams()

        this.$emit('processingRedirectPaymentVerification', true)

        const sepaDebitSourcePayload = {
          type: savedPaymentData.type,
          sepa_debit: {
            [savedPaymentData.type]: savedPaymentData.id,
          },
          currency: savedPaymentData.currency,
          amount: savedPaymentData.amount,
          owner: {
            name: savedPaymentData.name
              ? savedPaymentData.name
              : savedPaymentData.owner.name,
          },
          redirect: {
            return_url: savedPaymentData.redirect.url,
          },
          [savedPaymentData.type]: savedPaymentData[savedPaymentData.type],
        }

        stripe
          .createSource(sepaDebitSourcePayload)
          .then((result) => {
            this.error = result.error ? result.error.message : ''

            // process order
            this.$emit('placeOrderResponseFromRedirect', {
              fullResponse: result,
              paymentData: result.source,
              paymentType,
            })
          })
          .catch((e) => {
            console.error('Create recurring source from redirect error: ', e)
            this.$emit('processingRedirectPaymentVerification', false)
          })
      }
    },
  },
}
</script>

<template>
  <div />
</template>
