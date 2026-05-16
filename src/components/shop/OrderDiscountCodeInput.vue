<template>
	<div class="rounded-2xl border border-deep-navy/10 bg-white p-4">
		<p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/55">Discount code</p>

		<!-- Applied state -->
		<div v-if="appliedCode && validationState === 'valid'" class="mt-3">
			<div class="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-3 py-3">
				<div class="flex items-center gap-2">
					<UIcon name="i-heroicons-tag" class="h-4 w-4 shrink-0 text-green-700" />
					<div>
						<p class="text-xs font-black text-green-800">{{ appliedCode }}</p>
						<p v-if="discountAmount" class="text-[11px] text-green-700">
							Saving {{ currencySymbol }}{{ discountAmount.raw }}
						</p>
						<p v-else-if="isPreviewLoading" class="text-[11px] text-green-700/70">Calculating savings…</p>
						<p v-else class="text-[11px] text-green-700/70">No discount applied for this order</p>
					</div>
				</div>
				<button
					type="button"
					class="ml-2 shrink-0 rounded-lg border border-green-300 bg-white px-2 py-1 text-[10px] font-black uppercase tracking-wide text-green-700 hover:bg-green-100"
					@click="$emit('clear')"
				>
					Remove
				</button>
			</div>
		</div>

		<!-- Input state -->
		<div v-else class="mt-3">
			<div class="flex gap-2">
				<input
					v-model="localInput"
					type="text"
					maxlength="100"
					placeholder="Enter code"
					class="min-w-0 flex-1 rounded-xl border border-deep-navy/20 px-3 py-2 text-sm text-deep-navy placeholder-deep-navy/35 focus:border-deep-navy focus:outline-none focus:ring-1 focus:ring-deep-navy"
					:class="{ 'border-red-400 focus:border-red-500 focus:ring-red-400': validationState === 'invalid' }"
					:disabled="isValidating || isPreviewLoading"
					@keydown.enter.prevent="$emit('apply', localInput)"
				>
				<button
					type="button"
					class="shrink-0 rounded-xl border border-deep-navy/20 px-4 py-2 text-xs font-black uppercase tracking-wide text-deep-navy hover:border-deep-navy hover:bg-mist-blue disabled:cursor-not-allowed disabled:opacity-50"
					:disabled="!localInput.trim() || isValidating || isPreviewLoading"
					@click="$emit('apply', localInput)"
				>
					<span v-if="isValidating || isPreviewLoading">
						<span class="inline-block h-3 w-3 animate-spin rounded-full border-2 border-deep-navy/30 border-t-deep-navy" />
					</span>
					<span v-else>Apply</span>
				</button>
			</div>

			<p v-if="validationState === 'invalid' && validationError" class="mt-2 text-[11px] font-semibold text-red-600">
				{{ validationError }}
			</p>
		</div>
	</div>
</template>

<script setup lang="ts">
type ValidationState = 'idle' | 'valid' | 'invalid'

const props = defineProps<{
	modelValue: string
	appliedCode: string | null
	validationState: ValidationState
	validationError: string
	isValidating: boolean
	isPreviewLoading: boolean
	discountAmount: { raw: string; amount: number } | null
	currencySymbol?: string
}>()

const emit = defineEmits<{
	(e: 'update:modelValue', value: string): void
	(e: 'apply', code: string): void
	(e: 'clear'): void
}>()

const localInput = computed({
	get: () => props.modelValue,
	set: (val: string) => emit('update:modelValue', val),
})
</script>
