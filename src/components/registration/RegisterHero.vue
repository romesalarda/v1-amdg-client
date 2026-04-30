<template>
	<header class="relative h-[32vh] min-h-[280px] w-full overflow-hidden">
		<img :src="heroImageSrc" alt="Registration hero" class="absolute inset-0 h-full w-full object-cover" />
		<div class="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/45 to-slate-900/20"></div>

		<div class="absolute inset-x-0 top-0 z-10 p-6 md:p-8">
			<div class="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4">
				<div class="text-2xl font-black tracking-tight text-white md:text-3xl">AMDG</div>
				<div class="flex items-center gap-3">
					<div class="hidden rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/80 md:block">
						Registration flow
					</div>
					<UButton color="white" variant="soft" @click="emit('go-back')">Back to event</UButton>
				</div>
			</div>
		</div>

		<div class="absolute inset-x-0 bottom-0 z-10 px-6 pb-8 md:px-8 md:pb-10">
			<div class="mx-auto w-full max-w-[1200px]">
				<span class="inline-block rounded-full bg-blue-500/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-white">
					Step {{ activeStepIndex + 1 }} of {{ stepsLength }}
				</span>
				<h1 class="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">
					{{ eventTitle }}
				</h1>
				<p class="mt-2 text-sm font-semibold uppercase tracking-wider text-white/80">
					Attendee {{ currentAttendeeNumber }} of {{ ticketCount }}
				</p>
				<div class="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/20 md:max-w-lg">
					<div
						class="h-full rounded-full bg-blue-400 transition-all duration-500 ease-out"
						:style="{ width: `${stepProgressPercent}%` }"
					></div>
				</div>
			</div>
		</div>
	</header>
</template>

<script setup lang="ts">
defineProps<{
	heroImageSrc: string
	activeStepIndex: number
	stepsLength: number
	eventTitle: string
	currentAttendeeNumber: number
	ticketCount: number
	stepProgressPercent: number
}>()

const emit = defineEmits<{
	'go-back': []
}>()
</script>
