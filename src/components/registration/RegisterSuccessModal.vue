<template>
	<UModal v-model="isOpen" :prevent-close="true" :ui="{ width: 'sm:max-w-5xl' }">
		<div class="success-modal space-y-8 p-8 md:p-14">
			<div class="success-glow"></div>
			<div class="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-center gap-2 pt-4">
				<span class="h-2 w-2 rounded-full bg-emerald-400 animate-bounce" />
				<span class="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
				<span class="h-2 w-2 rounded-full bg-amber-400 animate-bounce" />
			</div>
			<div class="success-pop text-center">
				<div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 ring-8 ring-emerald-100/60 md:h-24 md:w-24">
					<UIcon name="i-heroicons-check" class="h-11 w-11 text-emerald-600 success-check md:h-14 md:w-14" />
				</div>
				<h3 class="mt-5 text-4xl font-black tracking-tight text-slate-900 success-title md:text-5xl">Booking successful</h3>
				<p class="mt-4 text-lg font-semibold text-slate-600 success-event-lead md:text-2xl">You're going to</p>
				<p class="mt-2 text-4xl font-black tracking-tight text-emerald-700 success-event-name md:text-6xl">
					{{ eventTitle }}
				</p>
				<div v-if="bankTransferReference" class="mx-auto mt-6 max-w-xl rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left">
					<p class="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-700">Bank transfer reference</p>
					<p class="mt-1 text-2xl font-black tracking-[0.12em] text-amber-900">{{ bankTransferReference }}</p>
					<p class="mt-2 text-xs text-amber-800">Use this exact reference when making the transfer so your payment can be matched quickly.</p>
					<p v-if="bankTransferInstructions" class="mt-2 text-xs text-amber-800">{{ bankTransferInstructions }}</p>
				</div>
			</div>

			<div class="flex justify-center success-cta-wrap">
				<UButton size="xl" color="primary" @click="emit('view-dashboard')">View your event dashboard</UButton>
			</div>
		</div>
	</UModal>
</template>

<script setup lang="ts">
const isOpen = defineModel<boolean>({ required: true })

defineProps<{
	eventTitle: string
	bankTransferReference: string | null
	bankTransferInstructions: string | null
}>()

const emit = defineEmits<{
	'view-dashboard': []
}>()
</script>

<style scoped>
.success-modal {
	position: relative;
	overflow: hidden;
	background: linear-gradient(180deg, #f8fafc 0%, #ffffff 62%);
}

.success-glow {
	pointer-events: none;
	position: absolute;
	inset: -90px -10% auto;
	height: 210px;
	background: radial-gradient(circle at 50% 30%, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.06) 38%, rgba(255, 255, 255, 0) 70%);
}

.success-pop {
	position: relative;
	animation: successRise 0.75s ease-out;
}

.success-check {
	animation: successPulse 1.2s ease-out;
}

.success-title {
	animation: successFadeIn 0.9s ease-out;
}

.success-event-lead {
	opacity: 0;
	animation: successFadeIn 0.9s ease-out 0.5s forwards;
}

.success-event-name {
	opacity: 0;
	animation: successFadeIn 1s ease-out 0.8s forwards;
}

.success-cta-wrap {
	opacity: 0;
	animation: successFadeIn 0.9s ease-out 1.95s forwards;
}

@keyframes successRise {
	from { opacity: 0; transform: translateY(10px); }
	to { opacity: 1; transform: translateY(0); }
}

@keyframes successPulse {
	0% { transform: scale(0.5) rotate(-12deg); opacity: 0; }
	60% { transform: scale(1.14) rotate(0deg); opacity: 1; }
	100% { transform: scale(1); }
}

@keyframes successFadeIn {
	from { opacity: 0; transform: translateY(8px); }
	to { opacity: 1; transform: translateY(0); }
}
</style>
