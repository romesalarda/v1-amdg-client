<template>
	<div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-6">
		<UButton color="gray" variant="ghost" :disabled="isCheckoutUiBusy" @click="emit('back')">Back</UButton>
		<div class="flex items-center gap-3">
			<UButton
				v-if="isReviewStep"
				color="primary"
				:loading="isCheckoutUiBusy"
				:disabled="!canContinue || shouldDisableCheckoutButton"
				@click="emit('checkout')"
			>
				{{ checkoutPrimaryButtonLabel }}
			</UButton>
			<UButton
				v-else
				color="primary"
				:loading="isSaving"
				:disabled="!canContinue || isCheckoutUiBusy"
				@click="emit('next')"
			>
				{{ primaryActionLabel }}
			</UButton>
		</div>
	</div>
</template>

<script setup lang="ts">
defineProps<{
	isReviewStep: boolean
	isCheckoutUiBusy: boolean
	isSaving: boolean
	canContinue: boolean
	shouldDisableCheckoutButton: boolean
	checkoutPrimaryButtonLabel: string
	primaryActionLabel: string
}>()

const emit = defineEmits<{
	back: []
	next: []
	checkout: []
}>()
</script>
