<template>
	<div
		v-if="isVisible"
		class="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
	>
		<div class="w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
			<div class="space-y-4 px-6 pb-6 pt-6">
				<div class="flex items-start gap-3">
					<span class="mt-0.5 inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
						<svg class="checkout-orbit h-4 w-4 text-slate-500" viewBox="0 0 24 24" fill="none" aria-hidden="true">
							<path d="M12 3a9 9 0 1 0 9 9" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
						</svg>
					</span>
					<div>
						<p class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Processing</p>
						<h3 class="mt-0.5 text-base font-bold text-slate-900">{{ stageLabel }}</h3>
						<p class="mt-0.5 text-sm text-slate-500">{{ description }}</p>
					</div>
				</div>

				<div class="rounded-lg border border-slate-100 bg-slate-50 p-3">
					<div class="checkout-progress-line">
						<span class="checkout-progress-dot" />
					</div>
					<p class="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Please keep this page open</p>
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
.checkout-orbit {
	animation: checkoutOrbit 1.1s linear infinite;
	transform-origin: center;
}

.checkout-progress-line {
	position: relative;
	height: 4px;
	border-radius: 999px;
	background: rgba(148, 163, 184, 0.25);
	overflow: hidden;
}

.checkout-progress-dot {
	position: absolute;
	top: 50%;
	left: 0;
	width: 90px;
	height: 110%;
	border-radius: 999px;
	background: linear-gradient(90deg, rgba(100, 116, 139, 0), rgba(100, 116, 139, 0.7), rgba(100, 116, 139, 0));
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
