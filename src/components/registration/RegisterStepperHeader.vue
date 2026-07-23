<template>
	<div class="mt-6 overflow-x-hidden px-1 pb-2 pt-1">
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
									? 'border-blue-500 bg-blue-500 text-white shadow-md shadow-blue-500/30'
									: step.index < activeStepIndex
										? 'border-emerald-500 bg-emerald-500 text-white'
										: 'border-deep-navy/20 bg-white text-deep-navy/40'
							"
						>
							{{ step.index + 1 }}
						</div>
						<p
							class="text-[11px] font-bold uppercase tracking-[0.14em] transition-colors"
							:class="step.index <= activeStepIndex ? 'text-deep-navy' : 'text-deep-navy/40'"
						>
							{{ step.label }}
						</p>
					</div>
					<div
						v-if="localIndex < visibleSteps.length - 1"
						class="mx-2 hidden h-px flex-1 sm:block"
						:class="step.index < activeStepIndex ? 'bg-emerald-500' : 'bg-deep-navy/15'"
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
