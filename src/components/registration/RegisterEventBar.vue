<template>
	<section class="sticky top-0 z-20 border-y border-slate-200 bg-white/95 backdrop-blur">
		<div class="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-4 px-6 py-4">
			<div class="flex flex-wrap items-center gap-x-8 gap-y-3">
				<div class="flex items-center gap-2">
					<UIcon name="i-heroicons-calendar-days" class="h-5 w-5 text-slate-400" />
					<div>
						<p class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Date</p>
						<p class="text-sm font-bold text-slate-700">{{ reminderDate }}</p>
					</div>
				</div>
				<div class="flex items-center gap-2">
					<UIcon name="i-heroicons-clock" class="h-5 w-5 text-slate-400" />
					<div>
						<p class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Time</p>
						<p class="text-sm font-bold text-slate-700">{{ reminderTime }}</p>
					</div>
				</div>
				<div class="flex items-center gap-2">
					<UIcon name="i-heroicons-map-pin" class="h-5 w-5 text-slate-400" />
					<div>
						<p class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Location</p>
						<p class="text-sm font-bold text-slate-700">{{ reminderLocation }}</p>
					</div>
				</div>
			</div>
			<div class="flex flex-col items-end gap-2">
				<div class="rounded-full bg-slate-900 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white">
					Editing attendee {{ currentAttendeeNumber }}
				</div>
				<div
					v-if="showIntentCountdown"
					class="flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em]"
					:class="intentTimerToneClass"
				>
					<UIcon name="i-heroicons-clock" class="h-3.5 w-3.5" />
					<span>Session expires in {{ intentCountdownLabel }}</span>
				</div>
				<div
					v-if="isCheckoutUiBusy"
					class="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-blue-800"
				>
					<span class="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
					<span>{{ checkoutProcessingStageLabel }}</span>
				</div>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
defineProps<{
	reminderDate: string
	reminderTime: string
	reminderLocation: string
	currentAttendeeNumber: number
	showIntentCountdown: boolean
	intentCountdownLabel: string
	intentTimerToneClass: string | Record<string, boolean>
	isCheckoutUiBusy: boolean
	checkoutProcessingStageLabel: string
}>()
</script>
