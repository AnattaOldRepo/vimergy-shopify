<template>
	<drawer-wrap :show="show" @close="$emit('close')">
		<div class="c-drawerSubscriptionHistory c-drawer">
			<h2 class="c-drawer__title">{{
				atc['portal.subscriptionHistoryDrawerTitle'] || 'Subscription History'
			}}</h2>

			<div v-if="subscriptionOrders">
				<history-order
					v-for="order in subscriptionOrders"
					:key="order.id"
					class="c-historyOrder__subscription-history"
					:order="order"
				/>
			</div>

			<second-loader-icon v-else />
		</div>
	</drawer-wrap>
</template>

<script>
import { mapState } from 'vuex'
import DrawerWrap from '@components/drawer-wrap'
import HistoryOrder from '@components/history-order.vue'
import SecondLoaderIcon from '@components/Icon/second-loader-icon.vue'

export default {
	components: {
		DrawerWrap,
		HistoryOrder,
		SecondLoaderIcon,
	},

	props: {
		activeSubscription: {
			type: [Boolean, Object],
			default: false,
		},

		show: {
			type: Boolean,
			default: false,
		},
	},

	computed: {
		...mapState('orders', ['subscriptionOrders']),

		...mapState('translations', ['atc']),
	},
}
</script>


<style lang="scss">
.c-historyOrder__subscription-history {
	// min-width: 680px;
}
</style>
