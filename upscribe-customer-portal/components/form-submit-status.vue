<script>
/* eslint-disable vue/no-v-html */
import { mapState } from 'vuex'
import ErrorIcon from '@components/Icon/error-icon'

export default {
	components: {
		ErrorIcon,
	},
	props: {
		formSubmitStatus: {
			type: [Object, Boolean, Error],
			default: false,
		},
	},
	computed: {
		...mapState('translations', ['atc']),
	},
}
</script>

<template>
	<div
		v-if="formSubmitStatus && !isEmptyObject(formSubmitStatus)"
		class="c-formSubmitStatus"
		:class="{
			'c-formSubmitStatus--pending': formSubmitStatus.status === 'PENDING',
			'c-formSubmitStatus--success': formSubmitStatus.status === 'SUCCESS',
			'c-formSubmitStatus--error': formSubmitStatus.status === 'ERROR',
		}"
	>
		<p
			v-if="formSubmitStatus.status === 'PENDING'"
			class="c-formSubmitStatus__message"
		>
			<error-icon
				v-if="formSubmitStatus.status === 'ERROR'"
				class="c-formSubmitStatus__icon"
			/>
			<span
				v-html="
					formSubmitStatus.message
						? formSubmitStatus.message
						: act['notices.loadingNotice'] || 'Loading'
				"
			></span>
		</p>

		<p
			v-else-if="
				formSubmitStatus.status !== 'PENDING' && formSubmitStatus.message
			"
			class="c-formSubmitStatus__message"
		>
			<error-icon
				v-if="formSubmitStatus.status === 'ERROR'"
				class="c-formSubmitStatus__icon"
			/>
			<span v-html="formSubmitStatus.message"></span>
		</p>
	</div>
</template>

<style lang="scss">
@import '@design';

.c-formSubmitStatus {
	align-items: center;
	padding: 12px;
	margin: 0 auto;
	margin-top: 20px;
	font-size: 14px;
	color: black;
	text-align: center;
	border-radius: 5px;

	&--pending {
		color: $color-pending;
		border-color: $color-pending;

		// background-color: blue;
	}

	&--success {
		color: $color-success;
		border-color: $color-success;

		// background-color: green;
	}

	&--error {
		color: $color-error;
		border-color: $color-error;

		// background-color: #e40000;
	}
}

.c-formSubmitStatus__icon {
	margin-right: 6px;
}

.c-formSubmitStatus__message {
	display: flex;
	align-items: center;
	justify-content: center;
	margin: 0;
	line-height: 1.2;
	color: inherit;
}
</style>
