<template>
	<div
		v-if="isVisible"
		class="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm"
	>
		<div class="w-full max-w-xl overflow-hidden rounded-3xl border border-blue-200 bg-white shadow-2xl">
			<div class="checkout-overlay-top" />
			<div class="space-y-4 px-6 pb-6 pt-5">
				<div class="flex items-start gap-3">
					<span class="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-700">
						<svg class="checkout-orbit h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
							<path d="M12 3a9 9 0 1 0 9 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
						</svg>
					</span>
					<div>
						<p class="text-[10px] font-black uppercase tracking-[0.2em] text-blue-700">Checkout in progress</p>
						<h3 class="mt-1 text-xl font-black text-slate-900">{{ stageLabel }}</h3>
						<p class="mt-1 text-sm text-slate-600">{{ description }}</p>
					</div>
				</div>

				<div class="rounded-xl border border-blue-200 bg-blue-50/70 p-3">
					<div class="checkout-progress-line">
						<span class="checkout-progress-dot" />
					</div>
					<p class="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-800">Please keep this page open</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
defineProps<{
	isVisible: boolean
	stageLabel: string
	description: string
}>()
</script>

<style scoped>
.checkout-overlay-top {
	height: 72px;
	background: linear-gradient(180deg, rgba(219, 234, 254, 0.85) 0%, rgba(255, 255, 255, 0) 100%);
}

.checkout-orbit {
	animation: checkoutOrbit 1.1s linear infinite;
	transform-origin: center;
}

.checkout-progress-line {
	position: relative;
	height: 6px;
	border-radius: 999px;
	background: rgba(59, 130, 246, 0.25);
	overflow: hidden;
}

.checkout-progress-dot {
	position: absolute;
	top: 50%;
	left: 0;
	width: 110px;
	height: 110%;
	border-radius: 999px;
	background: linear-gradient(90deg, rgba(37, 99, 235, 0), rgba(37, 99, 235, 0.95), rgba(37, 99, 235, 0));
	transform: translateY(-50%);
	animation: checkoutProgress 1.4s ease-in-out infinite;
}

@keyframes checkoutOrbit {
	from { transform: rotate(0deg); }
	to { transform: rotate(360deg); }
}

@keyframes checkoutProgress {
	0% { left: -28%; }
	50% { left: 42%; }
	100% { left: 100%; }
}
</style>
