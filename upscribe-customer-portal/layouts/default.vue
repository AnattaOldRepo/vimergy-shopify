<template>
	<section class="c-portal">
		<the-header v-if="windowWidth >= 768" />

		<portal-target v-else name="header" class="header-portal" />

		<div class="c-portalBar">
		    If you would like to break up the subscription and have multiple ship dates for the same subscription... please contact <a href="mailto:help@vimergy.com">help@vimergy.com</a> or call <a hfre="tel:(904) 335-3254">(904) 335-3254</a>.
		</div>

		<div class="c-portal__main">
			<loading-block
				v-if="newCheckoutSubscriptionProcessing"
				:text="
					atc['portal.accountSubscriptionsUpdatingMessage'] ||
						'Please wait a moment as we update your account with your new subscription.'
				"
				height="500px"
				min-height="500px"
			/>

			<nuxt v-else :key="activeLanguageCode" />
		</div>

		<portal-target name="drawers" />

		<portal-target name="modals" />

		<portal-target name="confirm" />

		<portal-target name="float-buttons" />

		<navigation-mobile v-if="windowWidth < 768" />
	</section>
</template>

<script>
/* eslint-disable no-unused-vars */

import { mapState, mapActions, mapMutations, mapGetters } from 'vuex'
import { removeQueryParam } from '@utils/helpers'
import NavigationMobile from '@components/global/navigation-mobile'
import { windowSizes } from '@mixins/windowSizes'
import TheHeader from '@components/the-header.vue'
// import LanguagePicker from '@components/language-picker.vue'
import LoadingBlock from '@components/loading-block.vue'

export default {
	components: {
		// LanguagePicker,
		NavigationMobile,
		LoadingBlock,
		TheHeader,
	},
	mixins: [windowSizes],

	data: () => {
		return {
			customerId: null,
      storeDomain: null,
      accessToken: null,
      tokenChecked: false,
			newCheckoutSubscriptionProcessing: false,
		}
	},

	computed: {
		// ...mapState('translations', ['translationList']),

		...mapState('shop', ['shopData']),

		...mapState('oneTimeOrder', [
			'otoProductVariantId',
			'otoQueueId',
			'otoSubscriptionId',
			'otoAddProduct',
			'otoSkipShipment',
		]),

		...mapState('subscriptions', [
			'noActiveSubscriptions',
			'updateSubscriptionPromptOpen',
		]),

		...mapState('products', ['products']),

		...mapState('translations', [
			'translationList',
			'translations',
			'activeLanguageCode',
			'atc',
		]),

		...mapGetters('translations', [
			'activeLanguageName',
			'activeLanguageNativeName',
		]),

		...mapState('customer', ['customerShopify']),
	},

	async created() {
    const query = this.$route.query

    const isAccessTokenRequiredRoute = window.location.href.indexOf('account-subscriptions') >= 0

		let customerId = false
    let storeDomain = false
    let accessToken = false

		// set from liquid account profile
		if (window.upscribeCustomerId) {
			customerId = window.upscribeCustomerId
		}

		// set from liquid account profile
		if (window.upscribeStoreDomain) {
			storeDomain = window.upscribeStoreDomain
		}

		// set from query params
		if (query && query.customerId) {
			customerId = query.customerId
		}

		// set from query params
		if (query && query.storeDomain) {
			storeDomain = query.storeDomain
    }

		// set from query params
		if (query && query.token) {
			accessToken = query.token
		}

		this.customerId = customerId
    this.storeDomain = storeDomain
    this.accessToken = accessToken

    // if page-account only load if access token is valid


		if (!storeDomain || !customerId) {
			return this.$nuxt.error({
				statusCode: 404,
				message: `Error Loading Portal. ${
					!storeDomain ? 'Invalid store domain.' : 'Invalid customer ID.'
				}`,
			})
    }

    this.setStoreDomain(storeDomain)
    this.setCustomerId(customerId)


    if (isAccessTokenRequiredRoute) {
      console.log('accesstokenrequired route')
      let validToken
      try {
        validToken = await this.VALIDATE_ACCESS_TOKEN({
          customerId,
          accessToken,
        })
      } catch(e) {
        console.log(e)
      } finally {
        this.tokenChecked = true
      }

      if (!validToken && this.tokenChecked) {
        // redirect to account login page
        this.validToken = false
        console.log('invalide access token')
        window.location = `https://${storeDomain}/account/login`
      } else {
        await this.initialDataLoad()
        this.$loadStoreSegment()
        this.$loadStoreGtm()
      }
    }

    // continue load
    else {
			await this.initialDataLoad()
			this.$loadStoreSegment()
			this.$loadStoreGtm()
		}
  },

  mounted() {
    console.log('mounted default layout')
  },

	methods: {
    ...mapActions('accessToken', ['VALIDATE_ACCESS_TOKEN']),

		...mapActions('shop', ['GET_SHOP']),

		...mapActions('translations', ['GET_TRANSLATION', 'GET_TRANSLATION_LIST']),

		...mapMutations('translations', ['setActiveLanguageCode']),

		...mapMutations('activeSubscription', ['setActiveSubscriptionId']),

		...mapMutations('subscriptions', [
			'setUpdateSubscriptionPromptOpen',
			'setNoActiveSubscriptions',
		]),

		...mapActions('subscriptions', ['GET_SUBSCRIPTIONS']),

		...mapActions('customer', ['GET_CUSTOMER']),

		...mapActions('products', ['GET_PRODUCTS']),

		...mapActions('orders', ['CHECK_FOR_PROCESSING_SUBS']),

		// ...mapActions('cards', ['GET_CARDS']),

		...mapMutations('route', ['setCustomerId', 'setStoreDomain']),

		...mapMutations('editMode', ['setEditNextOrder']),

		async initialDataLoad() {
      const vm = this
			const { $route } = this
			const { query } = $route
      const { customerId, direct_from_checkout } = query

      // Direct from checkout logic
      if (query.direct_from_checkout && !vm.directFromCheckoutCheckCompleted) {
        vm.newCheckoutSubscriptionProcessing = true
        vm.processingChecks = 0
        vm.directFromCheckoutCheckCompleted = true

        setTimeout(vm.pollForNewCheckoutSubscriptionProcessing, 5000)
      } else {
        try {
          // eslint-disable-next-line no-unused-vars
          const [
            customer,
            subscriptions,
            products,
            shop,
            translationList,
          ] = await Promise.all([
            this.GET_CUSTOMER(),
            this.GET_SUBSCRIPTIONS(customerId),
            this.GET_PRODUCTS(),
            this.GET_SHOP(),
            this.GET_TRANSLATION_LIST(),
            // this.GET_CARDS(),
          ])

          await this.setupIntialTranslations(customer)

          // console.log(customer,
          //   subscriptions,
          //   products,
          //   shop,
          //   translationList)

          // console.log({ subscriptions })

          if (
            subscriptions &&
            subscriptions.items &&
            subscriptions.items.length
          ) {
            const activeSubs = subscriptions.items.filter((sub) => {
              // if active subscription
              if (sub.active) {
                return true
              }
              // trial subscription
              else if (
                !sub.active &&
                sub.charge_limit > 1 &&
                sub.cancellation_reason === 'Trial period has expired'
              ) {
                return true
              }

              // trial onetime subscription
              else if (
                !sub.active &&
                !sub.charge_limit &&
                sub.cancellation_reason === 'Trial period has expired'
              ) {
                return true
              }
            })

            // console.log({ activeSubs })

            if (activeSubs.length) {
              this.setNoActiveSubscriptions(false)
            } else {
              this.setNoActiveSubscriptions(true)
              return
            }
          }
        } catch (error) {
          console.log('initialDataLoad error: ', error)
          this.$nextTick(() => {
            if (this.noActiveSubscriptions) {
              console.log('no active subscriptions')
            } else {
              let errorMessage = false

              if (error.status === 404) {
                errorMessage =
                  'There were no subscriptions found with this account.'
              }
              return this.$nuxt.error({
                statusCode: 404,
                message:
                  errorMessage || 'Error Loading Portal. Please reload the page.',
              })
            }
          })
        }
      }
		},

		// Setup Intial Translation
		async setupIntialTranslations(customer) {
			const preferredLanguage =
				customer && customer.shopify && customer.shopify.language
					? customer.shopify.language
					: 'en'
			// first get avilable languages
			await this.GET_TRANSLATION_LIST()

			if (!this.shopData) {
				const checkoutStoreDomain = this.$route.query.store
				const shopResponse = await this.GET_SHOP({ checkoutStoreDomain })

				this.SET_SHOP_DATA(shopResponse.data)
			}

			if (this.initialLanguageSet) {
				return
			}

			if (!this.translationList) {
				return
			}

			let defaultLanguage = 'en'

			// use preferred lanuage from customer's checkout if available
			if (
				preferredLanguage &&
				this.translationList.includes(preferredLanguage)
			) {
				defaultLanguage = preferredLanguage
			}

			await this.GET_TRANSLATION({ language: defaultLanguage })
			this.setActiveLanguageCode(defaultLanguage)
			this.initialLanguageSet = true
		},

		async pollForNewCheckoutSubscriptionProcessing() {
      const vm = this
      return new Promise(async (resolve, reject) => {
        if (vm.newCheckoutSubscriptionProcessing) {
          const processingSubsResponse = await vm.CHECK_FOR_PROCESSING_SUBS()
          // check if finished processing
          if (!processingSubsResponse.count || vm.processingChecks > 30) {
            vm.newCheckoutSubscriptionProcessing = false

            let noDirectFromCheckoutUrl = removeQueryParam(
              'direct_from_checkout',
              window.location.href
            )
            window.history.replaceState(
              {},
              document.title,
              noDirectFromCheckoutUrl
            )
            vm.initialDataLoad()
            resolve()
          } else {
            vm.processingChecks += 1
            setTimeout(vm.pollForNewCheckoutSubscriptionProcessing, 5000)
          }
        } else {
          vm.newCheckoutSubscriptionProcessing = false
          // replace history state to prevent direct from checkout flow on reload
          let noDirectFromCheckoutUrl = removeQueryParam(
            'direct_from_checkout',
            window.location.href
          )
          window.history.replaceState(
            {},
            document.title,
            noDirectFromCheckoutUrl
          )
          vm.initialDataLoad()
          resolve()
        }
      })
    },
	},
}
</script>

<style lang="scss">
@import '@design';

/* stylelint-disable-next-line selector-max-type */
html,
body,
input,
textarea,
button,
select {
	font-size: unset;
	font-family: unset;
	font-style: unset;
	font-weight: unset;
	color: unset;
	line-height: unset;
	box-sizing: border-box;
	font-family: $font-primary-regular, 'Helvetica Neue', Arial, sans-serif;
	font-size: 16px;
	word-spacing: 1px;
	-ms-text-size-adjust: 100%;
	-webkit-text-size-adjust: 100%;
	-moz-osx-font-smoothing: grayscale;
	-webkit-font-smoothing: antialiased;
}

*,
*::before,
*::after {
	box-sizing: border-box;
	margin: 0;
}

h2,
.h2 {
	letter-spacing: 0.1px;
}

.c-portal {
	min-height: 100vh;
	position: relative;
	background-color: #f7f9fb;

	@include bp(tablet) {
		background-color: transparent;
	}
}

.c-portalBar {
  width:100%;
  background-color: #EFEAE5;
  padding:10px 10px;
  font-size: 14px;
  line-height: normal;
  text-align: center;
  text-transform: initial;
}

.c-portal__main {
	padding: 25px 0 58px;
	display: flex;
	flex-direction: column;
	min-height: 100%;

	@include bp(tablet) {
		min-height: calc(100vh - 100px);
		background-color: #f7f9fb;
		padding: 0 0 25px;
	}

	@include bp(tablet-large) {
		padding: 0;
	}

	&--center {
		display: flex;
		align-content: center;
		justify-content: center;
		height: 100%;
	}
}

.c-noSubscriptions {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 15px 0 10px;
}

.c-noSubscriptions__text {
	margin-bottom: 25px;
}

.c-addressPayment__formattedComponent {
	max-width: 400px;
	margin: 0 auto;
	padding: 0 16px;
	@media (min-width: 420px) {
		padding: 0;
	}
}

.c-portal__languagePickerWrap {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	padding: 36px 20px 0;
	width: 100%;
}

.c-modalMobile__wrapper {
	padding: 0 16px;
}

.page-enter-active {
	animation: acrossIn 0.5s linear both;

	@include bp(tablet){
		animation: empty 0;
	}
}

.page-leave-active {
	animation: acrossOut 0.5s linear both;

	@include bp(tablet){
		animation: empty 0;
	}
}

@-webkit-keyframes acrossIn {
	0% {
		-webkit-transform: translate3d(-100%, 0, 0);
	}
	100% {
		-webkit-transform: translate3d(0, 0, 0);
	}
}

@keyframes acrossIn {
	0% {
		transform: translate3d(-100%, 0, 0);
	}
	100% {
		transform: translate3d(0, 0, 0);
	}
}

@-webkit-keyframes acrossOut {
	0% {
		-webkit-transform: translate3d(0, 0, 0);
	}
	100% {
		-webkit-transform: translate3d(100%, 0, 0);
	}
}

@keyframes acrossOut {
	0% {
		transform: translate3d(0, 0, 0);
	}
	100% {
		transform: translate3d(100%, 0, 0);
	}
}

.slideOutIn-enter-active {
	width: 100%;
	animation: moveIn 0.5s linear both;

	@include bp(tablet){
		animation: empty 0;
	}
}

.slideOutIn-leave-active {
	width: 100%;
	animation: leaveOut 0.5s linear both;

	@include bp(tablet){
		animation: empty 0;
	}
}

@-webkit-keyframes moveIn {
	0% {
		-webkit-transform: translate3d(100%, 0, 0);
	}
	100% {
		-webkit-transform: translate3d(0, 0, 0);
	}
}

@keyframes moveIn {
	0% {
		transform: translate3d(100%, 0, 0);
	}
	100% {
		transform: translate3d(0, 0, 0);
	}
}

@-webkit-keyframes leaveOut {
	0% {
		-webkit-transform: translate3d(0, 0, 0);
	}
	100% {
		-webkit-transform: translate3d(-100%, 0, 0);
	}
}

@keyframes leaveOut {
	0% {
		transform: translate3d(0, 0, 0);
	}
	100% {
		transform: translate3d(-100%, 0, 0);
	}
}

.disabled-click {
	pointer-events: none;
}

.header-portal {
	min-height: 60px;
	background-color: $color-white;
}

.loading-text {
	font-family: $font-primary-regular;
	font-size: 22px;
	font-weight: 500;
	color: $color-primary;
	text-align: center;
}
</style>
