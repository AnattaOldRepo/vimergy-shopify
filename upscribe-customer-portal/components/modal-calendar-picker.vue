<template>
	<modal-mobile-wrap
		:show="show"
		:progress-bar-status="status"
		:progress-bar-message="statusText"
		:close-animation="closeAnimation"
		@close="closeModalCalendar"
	>
		<date-picker
			class="c-modalCalendarPicker"
			@changeShipmentDate="handleChangeShipmentDate"
		/>
	</modal-mobile-wrap>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import ModalMobileWrap from '@components/modal-wrap-mobile.vue'
import DatePicker from '@components/date-picker.vue'
import moment from 'moment'

export default {
	components: {
		ModalMobileWrap,
		DatePicker,
	},

	props: {
		show: {
			type: Boolean,
			default: false,
		},
	},

	data() {
		return {
			status: '',
			statusText: '',
		}
	},

	computed: {
		...mapGetters('activeSubscription', [
			'activeSubscription',
			'activeSubscriptionNextDate',
		]),

		...mapState('modalCalendarGlobal', ['closeAnimation']),

		shipmentDate() {
			const { activeSubscriptionNextDate } = this
			if (!activeSubscriptionNextDate) return false
			return moment(activeSubscriptionNextDate, 'YYYYMMDD').format('MMM D')
		},

		nextShipmentDates() {
			const { activeSubscription, shipmentDate } = this
			const { interval, period } = activeSubscription

			return [
				moment(shipmentDate)
					.add(interval, period)
					.format('MMM D, YYYY'),
				moment(shipmentDate)
					.add(interval * 2, period)
					.format('MMM D, YYYY'),
			]
		},
	},

	methods: {
		...mapActions('modalCalendarGlobal', ['closeModalCalendar']),

		...mapActions('subscriptions', ['UPDATE_SUBSCRIPTION_QUEUE']),

		...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),

		async handleChangeShipmentDate(unformattedNewDate) {
			const { activeSubscriptionNextDate } = this
			// console.log(activeSubscriptionNextDate)
			if (!activeSubscriptionNextDate) return false
			let currentDate = activeSubscriptionNextDate

			const newDate = moment(unformattedNewDate).format('YYYYMMDDHHmmss')

			let requestPayload = {
				newDate,
				currentDate,
			}
			let analyticsPayload = {
				newDate,
				oldDate: currentDate,
			}

			this.status = 'updating'
			this.statusText = 'Saving'
			try {
				await this.UPDATE_SUBSCRIPTION_QUEUE(requestPayload)
				this.triggerAnalyticsEvent({
					event: 'Upscribe Change Shipment Date',
					payload: analyticsPayload,
				})
				this.status = 'success'
				this.statusText = 'saved successfully'
			} catch (e) {
				console.log('subscription/UPDATE_SUBSCRIPTION error: ', e)
				this.status = 'rejected'
				this.statusText = e.message
			}
		},
	},
}
</script>

<style lang="scss">
.c-modalCalendarPicker {
	height: auto;
}
</style>
