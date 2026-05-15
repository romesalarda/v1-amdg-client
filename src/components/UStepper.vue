<template>
  <div class="w-full">
    <div class="flex items-start justify-center">
      <template v-for="(item, index) in items" :key="item.key">

        <!-- Step node -->
        <div
          class="flex flex-col items-center"
          :class="index < items.length - 1 ? 'flex-shrink-0' : 'flex-shrink-0'"
        >
          <!-- Circle button -->
          <button
            type="button"
            :aria-label="`Go to step ${index + 1}: ${item.label}`"
            :aria-current="index === modelValue ? 'step' : undefined"
            :disabled="linear ? index > modelValue : false"
            class="relative flex h-10 w-10 items-center justify-center rounded-full border-2 font-black text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
            :class="stepCircleClasses(index)"
            @click="canNavigate(index) && $emit('update:modelValue', index)"
          >
            <!-- Completed: checkmark -->
            <svg
              v-if="index < modelValue"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="3"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <!-- Active / pending: number -->
            <span v-else>{{ index + 1 }}</span>

            <!-- Pulse ring on active step -->
            <span
              v-if="index === modelValue"
              class="absolute inset-0 rounded-full animate-ping opacity-20 bg-primary"
              style="animation-duration: 2.5s"
            />
          </button>

          <!-- Label + description -->
          <div class="mt-2 flex flex-col items-center text-center max-w-[90px]">
            <span
              class="text-[11px] font-black uppercase tracking-[0.1em] leading-tight"
              :class="index === modelValue
                ? 'text-deep-navy'
                : index < modelValue
                  ? 'text-emerald-700'
                  : 'text-gray-400'"
            >
              {{ item.label }}
            </span>
            <span
              v-if="item.description"
              class="mt-0.5 text-[10px] font-medium leading-tight"
              :class="index === modelValue ? 'text-deep-navy/50' : 'text-gray-400'"
            >
              {{ item.description }}
            </span>
          </div>
        </div>

        <!-- Connector line (not after last step) -->
        <div
          v-if="index < items.length - 1"
          class="flex-shrink-0 self-start mt-5 mx-1.5 h-0.5 rounded-full transition-colors duration-300"
          :class="index < modelValue ? 'bg-emerald-500' : 'bg-gray-200'"
          :style="{ width: `${connectorWidth}px` }"
        />

      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
export type StepperItem = {
  key: string
  label: string
  description?: string
  icon?: string
  count?: number
}

const props = withDefaults(defineProps<{
  modelValue: number
  items: StepperItem[]
  /** When true (default), steps must be visited sequentially. When false, any step can be jumped to. */
  linear?: boolean
  /** Width of the connector line between steps in pixels. Default 48. */
  connectorWidth?: number
}>(), {
  linear: true,
  connectorWidth: 48,
})

defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

function canNavigate(index: number): boolean {
  if (index === props.modelValue) return false // already here
  if (!props.linear) return true               // free navigation
  return index < props.modelValue              // linear: only go back
}

function stepCircleClasses(index: number): string {
  if (index < props.modelValue) {
    // Completed
    return 'border-emerald-500 bg-emerald-500 text-white cursor-pointer hover:bg-emerald-600 hover:border-emerald-600'
  }
  if (index === props.modelValue) {
    // Active
    return 'border-primary bg-primary text-white cursor-default shadow-lg shadow-primary/30'
  }
  // Pending
  if (!props.linear) {
    return 'border-gray-300 bg-white text-gray-400 cursor-pointer hover:border-primary hover:text-primary'
  }
  return 'border-gray-300 bg-white text-gray-400 cursor-not-allowed'
}
</script>
