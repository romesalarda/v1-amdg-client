<template>
	<div class="mt-6 overflow-hidden pb-2">
		<Transition :name="stepperTransitionName" mode="out-in">
			<ol :key="`step-window-${stepWindowStart}`" class="flex items-center gap-2 md:gap-3">
				<li
					v-for="(step, localIndex) in visibleSteps"
					:key="step.index"
					class="flex flex-1 items-center"
				>
					<div class="flex items-center gap-2">
						<div
							class="flex h-8 w-8 items-center justify-center rounded-full border text-xs font-black transition-all duration-300"
							:class="
								step.index === activeStepIndex
									? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200'
									: step.index < activeStepIndex
										? 'border-emerald-500 bg-emerald-500 text-white'
										: 'border-slate-300 bg-white text-slate-500'
							"
						>
							{{ step.index + 1 }}
						</div>
						<p
							class="text-[11px] font-bold uppercase tracking-[0.14em] transition-colors"
							:class="step.index <= activeStepIndex ? 'text-slate-800' : 'text-slate-400'"
						>
							{{ step.label }}
						</p>
					</div>
					<div
						v-if="localIndex < visibleSteps.length - 1"
						class="mx-2 h-px flex-1"
						:class="step.index < activeStepIndex ? 'bg-emerald-500' : 'bg-slate-300'"
					></div>
				</li>
			</ol>
		</Transition>
	</div>
</template>

<script setup lang="ts">
defineProps<{
	stepperTransitionName: string
	stepWindowStart: number
	visibleSteps: Array<{ index: number; label: string }>
	activeStepIndex: number
}>()
</script>
