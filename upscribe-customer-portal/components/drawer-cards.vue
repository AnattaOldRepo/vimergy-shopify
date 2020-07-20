<script>
import { mapGetters, mapState } from 'vuex'
import DrawerWrap from '@components/drawer-wrap.vue'

import DrawerCardList from '@components/drawer-card-list.vue'
import DrawerCardRemove from '@components/drawer-card-remove.vue'
import DrawerCardSwap from '@components/drawer-card-swap.vue'

import DrawerPaymentMethodAdd from '@components/drawer-payment-method-add.vue'
import DrawerPaymentMethodEdit from '@components/drawer-payment-method-edit.vue'

export default {
	components: {
		DrawerWrap,
		DrawerCardList,
		DrawerCardRemove,
		DrawerCardSwap,
		DrawerPaymentMethodAdd,
		DrawerPaymentMethodEdit,
	},
	props: {
		show: {
			type: Boolean,
			default: false,
		},
		initialMode: {
			type: [Boolean, String],
			default: false,
		},
	},
	data: () => {
		return {
			mode: 'default', // default, edit, add, remove, swap
			status: null, // PENDING, SUCCESS, FAILURE
		}
	},
	computed: {
		...mapState('cards', ['cards']),

		...mapGetters('cards', ['activeCard']),
	},
	watch: {
		mode() {
			this.status = null
		},
	},
	mounted() {
		const { initialMode } = this
		if (initialMode) {
			this.mode = initialMode
		}
		// console.log(this.cards, 222)
	},
	methods: {
		handleSetMode(mode) {
			this.mode = mode
		},
		handleDrawerStatus(status) {
			// console.log(status)
			this.status = status
			// console.log(this.status)
		},
	},
}
</script>

<template>
	<drawer-wrap
		v-if="cards"
		:status="status"
		:show="show"
		@close="$emit('close')"
	>
		<drawer-payment-method-add
			v-if="mode === 'add'"
			class="c-drawerCards c-drawer"
			:show="show"
			@close="$emit('close')"
			@setMode="handleSetMode"
			@setDrawerStatus="handleDrawerStatus"
		/>

		<drawer-payment-method-edit
			v-else-if="mode === 'edit'"
			class="c-drawerCards c-drawer"
			:show="show"
			@close="$emit('close')"
			@setMode="handleSetMode"
			@setDrawerStatus="handleDrawerStatus"
		/>

		<drawer-card-remove
			v-else-if="mode === 'remove'"
			class="c-drawerCards c-drawer"
			:show="show"
			@close="$emit('close')"
			@setMode="handleSetMode"
			@setDrawerStatus="handleDrawerStatus"
		/>

		<drawer-card-swap
			v-else-if="mode === 'swap'"
			class="c-drawerCards c-drawer"
			:show="show"
			@close="$emit('close')"
			@setMode="handleSetMode"
			@setDrawerStatus="handleDrawerStatus"
		/>

		<drawer-card-list
			v-else
			class="c-drawerCards c-drawer"
			:show="show"
			@close="$emit('close')"
			@setMode="handleSetMode"
			@setDrawerStatus="handleDrawerStatus"
		/>
	</drawer-wrap>
</template>

<style lang="scss">
@import '@design';
</style>
