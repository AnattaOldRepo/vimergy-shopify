<script>
import { isEqual } from 'lodash'

import { mapActions, mapGetters, mapState } from 'vuex'

import DrawerWrap from '@components/drawer-wrap.vue'
import { windowSizes } from '@mixins/windowSizes'
import NewAddressForm from '@components/new-address-form.vue'

export default {
	components: {
		DrawerWrap,
		NewAddressForm,
	},
	mixins: [windowSizes],

	props: {
		show: {
			type: Boolean,
			default: false,
		},
	},
	data: () => {
		return {
			drawerStatus: null,
			hasSameAddress: true,
			initialHasSameAddressState: null,
		}
	},
	computed: {
		...mapState('translations', ['atc']),

		...mapState('editMode', ['editNextOrder']),

		...mapGetters('activeSubscription', ['activeSubscription']),

		...mapGetters('activeSubscription', ['activeBillingAddress']),

		billingAddress() {
			const { activeSubscription } = this
			return activeSubscription.billing_address
		},

		shippingAddress() {
			const { activeSubscription } = this
			return activeSubscription.shipping_address
		},
	},
	mounted() {
		const initialHasSameAddress = this.isSameAsSubscription()
		this.hasSameAddress = initialHasSameAddress
		this.initialHasSameAddressState = initialHasSameAddress
	},
	methods: {
		...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),

		...mapActions('subscriptions', [
			'UPDATE_SUBSCRIPTION',
			'UPDATE_NEXT_ORDER',
		]),

		isSameAsSubscription() {
			const { shippingAddress, billingAddress } = this

			const cleanedShippingAddress = {
				address1: shippingAddress.address1 || undefined,
				address2: shippingAddress.address2 || undefined,
				city: shippingAddress.city || undefined,
				company: shippingAddress.company || undefined,
				country: shippingAddress.country || undefined,
				country_code: shippingAddress.country_code || undefined,
				first_name: shippingAddress.first_name || undefined,
				last_name: shippingAddress.last_name || undefined,
				latitude: shippingAddress.latitude || undefined,
				longitude: shippingAddress.longitude || undefined,
				name: shippingAddress.name || undefined,
				phone: shippingAddress.phone || undefined,
				province: shippingAddress.province || undefined,
				province_code: shippingAddress.province_code || undefined,
				zip: shippingAddress.zip || undefined,
			}

			const cleanedBillingAddress = {
				address1: billingAddress.address1 || undefined,
				address2: billingAddress.address2 || undefined,
				city: billingAddress.city || undefined,
				company: billingAddress.company || undefined,
				country: billingAddress.country || undefined,
				country_code: billingAddress.country_code || undefined,
				first_name: billingAddress.first_name || undefined,
				last_name: billingAddress.last_name || undefined,
				latitude: billingAddress.latitude || undefined,
				longitude: billingAddress.longitude || undefined,
				name: billingAddress.name || undefined,
				phone: billingAddress.phone || undefined,
				province: billingAddress.province || undefined,
				province_code: billingAddress.province_code || undefined,
				zip: billingAddress.zip || undefined,
			}

			return isEqual(cleanedShippingAddress, cleanedBillingAddress)
		},

		toggleAddress() {
			this.hasSameAddress = !this.hasSameAddress

			// check to true
			if (this.hasSameAddress) {
				// current state of saved subscription is not matching shipping / billing
				// so we do an update when checking the same as shipping option
				if (!this.initialHasSameAddressState) {
					// console.log('initial state was NOT matching, apply auto update when checking "same as shipping box"')

					this.updateBillingAddressToMatchShipping()
				}

				// initial state was matching, so only do an update after they "Update Billing" action
				// from within the address-form component
				else {
					// console.log("initial state was matching, don't auto update")
				}
			}
		},

		updateBillingAddressToMatchShipping() {
			const { shippingAddress } = this
			this.updateBillingAddress(shippingAddress)
		},

		async updateBillingAddress(address) {
			const { editNextOrder } = this
			const updatePayload = {
				requestPayload: {
					billing_address: address,
				},
			}

			let updateAction
			let analyticsEventName
			let analyticsPayload = { address }

			if (editNextOrder) {
				updateAction = this.UPDATE_NEXT_ORDER(updatePayload)
				analyticsEventName = 'Upscribe Next Order Billing Address Update'
			}

			// determine if updating both of just one
			else {
				updateAction = (async () => {
					await this.UPDATE_SUBSCRIPTION(updatePayload)
					await this.UPDATE_NEXT_ORDER(updatePayload)
				})()
				analyticsEventName = 'Upscribe Subscription Billing Address Update'
			}

			try {
				this.drawerStatus = 'PENDING'
				await updateAction
				this.triggerAnalyticsEvent({
					event: analyticsEventName,
					payload: analyticsPayload,
				})
				this.drawerStatus = 'SUCCESS'
			} catch (e) {
				console.log('subscription/UPDATE_SUBSCRIPTION error: ', e)
				this.drawerStatus = { state: 'FAILURE', message: e.message }
			}
		},
	},
}
</script>

<template>
	<drawer-wrap
		class="c-darwer__edittingAddress"
		:show="show"
		:status="drawerStatus"
		@close="$emit('close')"
	>
		<div class="c-drawerBillingAddresses c-drawer">
			<h2 class="c-drawer__title">{{
				atc['portal.editBillingAddressDrawerTitle'] || 'Edit Billing Address'
			}}</h2>

			<p class="c-drawer__subtitle">
				{{
					atc['portal.editBillingAddressDrawerPrompt'] ||
						'These products ship every 15 days'
				}}
			</p>

			<div class="c-drawer__checkBox c-formInput">
				<p>Same as shipping address</p><p> </p

				><div
					class="c-drawer__customedCheckbox"
					:class="{ 'c-drawer__customedCheckbox--active': hasSameAddress }"
					@click="toggleAddress"
				>
					<span
						class="c-drawer__customedCheckboxLine"
						:class="{
							'c-drawer__customedCheckboxLine--active': hasSameAddress,
						}"
					>
					</span>
				</div>
			</div>

			<new-address-form
				class="c-formBlock--noPadding c-billingAddressForm"
				:class="{ 'c-billingAddressForm--inactive': hasSameAddress }"
				:form-submit-button-text="
					atc['buttons.updateAddress'] || 'Update Address'
				"
				form-name="billing-address"
				:data-fill="activeBillingAddress"
				:has-same-address="hasSameAddress"
				@onSubmit="updateBillingAddress"
			/>
		</div>
	</drawer-wrap>
</template>

<style lang="scss">
@import '@design';

.c-drawer__checkBox {
	background-color: $color-white;
	margin-bottom: 16px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding-top: 11px;

	p {
		margin: 0;
	}
}

.c-drawer__customedCheckbox {
	width: 24px;
	height: 24px;
	border: 2px solid #a3b5bf;
	border-radius: 4px;
	display: flex;
	justify-content: center;
	align-items: center;
	cursor: pointer;

	&--active {
		background-color: $color-blue-brand;
		border-color: $color-white;
	}
}

.c-drawer__customedCheckboxLine {
	&--active {
		position: relative;
		&:before {
			display: block;
			position: absolute;
			content: '';
			width: 13px;
			height: 3px;
			transform: rotateZ(132deg);
			background-color: $color-white;
			left: -3px;
			top: -1px;
		}

		&:after {
			display: block;
			position: absolute;
			content: '';
			width: 7px;
			height: 3px;
			transform: rotateZ(-144deg);
			background-color: $color-white;
			left: -8px;
		}
	}
}

.c-billingAddressForm--inactive {
	visibility: hidden;
	opacity: 0;
}

.c-billingAddressForm {
	padding: 0;
	background-color: transparent;

	@include bp(tablet) {
		padding: 24px 24px 0;
		background-color: $color-white;
	}
}
</style>
