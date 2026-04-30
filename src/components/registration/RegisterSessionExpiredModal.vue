<template>
	<UModal v-if="!showCheckoutSuccessModal" v-model="isOpen" :prevent-close="true" :ui="{ width: 'sm:max-w-xl' }">
		<div class="space-y-4 p-6 md:p-8">
			<div class="flex items-start gap-3">
				<div class="mt-0.5 rounded-full bg-amber-100 p-2">
					<UIcon name="i-heroicons-exclamation-triangle" class="h-5 w-5 text-amber-700" />
				</div>
				<div>
					<h3 class="text-lg font-bold text-slate-900">Registration session expired</h3>
					<p class="mt-1 text-sm text-slate-600">
						Your booking intent is no longer active. To protect checkout integrity, you'll be redirected to the event page.
					</p>
				</div>
			</div>
			<div class="flex justify-end">
				<UButton color="primary" @click="emit('return-to-event')">Return to event</UButton>
			</div>
		</div>
	</UModal>
</template>

<script setup lang="ts">
const isOpen = defineModel<boolean>({ required: true })

defineProps<{
	showCheckoutSuccessModal: boolean
}>()

const emit = defineEmits<{
	'return-to-event': []
}>()
</script>
