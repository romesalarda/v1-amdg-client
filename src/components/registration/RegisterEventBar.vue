<template>
	<section class="sticky top-12 z-20 border-y border-slate-200 bg-white/95 backdrop-blur">
		<div class="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-3 px-4 py-3 md:gap-4 md:px-6 md:py-4">
			<div class="flex flex-wrap items-center gap-x-6 gap-y-2 md:gap-x-8 md:gap-y-3">
				<div class="flex items-center gap-2">
					<UIcon name="i-heroicons-calendar-days" class="h-4 w-4 text-slate-400 md:h-5 md:w-5" />
					<div>
						<p class="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400 md:text-[10px] md:tracking-[0.2em]">Date</p>
						<p class="text-xs font-bold text-slate-700 md:text-sm">{{ reminderDate }}</p>
					</div>
				</div>
				<div class="flex items-center gap-2">
					<UIcon name="i-heroicons-clock" class="h-4 w-4 text-slate-400 md:h-5 md:w-5" />
					<div>
						<p class="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400 md:text-[10px] md:tracking-[0.2em]">Time</p>
						<p class="text-xs font-bold text-slate-700 md:text-sm">{{ reminderTime }}</p>
					</div>
				</div>
				<div class="flex items-center gap-2">
					<UIcon name="i-heroicons-map-pin" class="h-4 w-4 text-slate-400 md:h-5 md:w-5" />
					<div>
						<p class="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400 md:text-[10px] md:tracking-[0.2em]">Location</p>
						<p class="text-xs font-bold text-slate-700 md:text-sm">{{ reminderLocation }}</p>
					</div>
				</div>
			</div>

			<div class="flex flex-row flex-wrap items-center justify-end gap-1.5 md:flex-col md:items-end md:gap-2">
				<div class="rounded-full bg-slate-900 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white md:px-4 md:py-2 md:text-[11px] md:tracking-[0.2em]">
					<span class="md:hidden">Attendee {{ currentAttendeeNumber }}</span>
					<span class="hidden md:inline">Editing attendee {{ currentAttendeeNumber }}</span>
				</div>
				<div
					v-if="showIntentCountdown"
					class="flex items-center gap-1.5 rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] md:gap-2 md:px-3 md:py-1.5 md:text-[10px] md:tracking-[0.16em]"
					:class="intentTimerToneClass"
				>
					<UIcon name="i-heroicons-clock" class="h-3 w-3 md:h-3.5 md:w-3.5" />
					<span class="md:hidden">{{ intentCountdownLabel }}</span>
					<span class="hidden md:inline">Session expires in {{ intentCountdownLabel }}</span>
				</div>
				<div
					v-if="isCheckoutUiBusy"
					class="flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-blue-800 md:gap-2 md:px-3 md:py-1.5 md:text-[10px] md:tracking-[0.16em]"
				>
					<span class="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500 animate-pulse" />
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