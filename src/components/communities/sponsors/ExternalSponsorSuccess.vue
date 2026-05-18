<template>
	<div class="flex flex-col items-center justify-center py-12 space-y-6 text-center">
		<div class="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
			<span class="material-symbols-outlined text-4xl text-emerald-600">check_circle</span>
		</div>

		<div class="space-y-2">
			<h2 class="text-2xl font-black uppercase tracking-tight text-deep-navy">Checkout Complete</h2>
			<p class="text-sm text-deep-navy/60 font-medium max-w-sm">
				Thank you for your sponsorship. Details are recorded below.
			</p>
		</div>

		<div class="w-full max-w-sm rounded-2xl border-2 border-deep-navy/10 divide-y-2 divide-deep-navy/10 overflow-hidden text-left">
			<div v-if="result.payment_reference" class="flex items-start justify-between px-5 py-4">
				<span class="text-[11px] font-black uppercase tracking-wider text-deep-navy/40">Reference</span>
				<span class="text-sm font-black text-deep-navy font-mono">{{ result.payment_reference }}</span>
			</div>
			<div v-if="result.payment_status" class="flex items-start justify-between px-5 py-4">
				<span class="text-[11px] font-black uppercase tracking-wider text-deep-navy/40">Status</span>
				<span class="text-sm font-black uppercase tracking-wider text-deep-navy">{{ result.payment_status }}</span>
			</div>
		</div>

		<!-- Bank transfer instructions -->
		<div
			v-if="result.payment_instructions"
			class="w-full max-w-sm rounded-xl bg-amber-50 border-2 border-amber-200 p-4 space-y-2 text-left"
		>
			<p class="text-[11px] font-black uppercase tracking-wider text-amber-700">Payment Instructions</p>
			<p class="text-sm text-amber-800 font-medium whitespace-pre-line">{{ result.payment_instructions }}</p>
		</div>

		<button
			type="button"
			class="mt-4 px-8 py-3 rounded-xl bg-deep-navy text-white text-sm font-black uppercase tracking-widest hover:bg-deep-navy/80 transition-colors"
			@click="emit('done')"
		>
			Done
		</button>
	</div>
</template>

<script lang="ts" setup>
import type { SponsorCheckoutResponse } from '~/composables/resources/organisation/organisationSponsorInvites'

defineProps<{
	result: SponsorCheckoutResponse
}>()

const emit = defineEmits<{
	(e: 'done'): void
}>()
</script>
