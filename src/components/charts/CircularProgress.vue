<template>
  <div class="relative inline-flex items-center justify-center">
    <svg class="transform -rotate-90" :width="size" :height="size">
      <!-- Background circle -->
      <circle
        class="text-gray-100 dark:text-gray-200"
        :cx="center"
        :cy="center"
        :r="radius"
        fill="transparent"
        :stroke="backgroundColor"
        :stroke-width="strokeWidth"
      />
      <!-- Progress circle -->
      <circle
        :class="progressColorClass"
        :cx="center"
        :cy="center"
        :r="radius"
        fill="transparent"
        stroke="currentColor"
        :stroke-width="strokeWidth"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        stroke-linecap="round"
        class="transition-all duration-500 ease-out"
      />
    </svg>
    <!-- Center text -->
    <div class="absolute inset-0 flex items-center justify-center">
      <div class="text-center">
        <!-- ensure to 2.dp -->
        <div class="text-2xl font-black text-gray-900">{{ percentage.toFixed(1) }}%</div>
        <div v-if="subtitle" class="text-xs text-gray-500 font-medium">{{ subtitle }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  percentage: number
  size?: number
  strokeWidth?: number
  color?: 'primary' | 'blue' | 'green' | 'purple' | 'orange' | 'red'
  backgroundColor?: string
  subtitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 120,
  strokeWidth: 8,
  color: 'primary',
  backgroundColor: '#f3f4f6',
})

const center = computed(() => props.size / 2)
const radius = computed(() => (props.size - props.strokeWidth) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const dashOffset = computed(() => {
  const progress = Math.min(Math.max(props.percentage, 0), 100)
  return circumference.value - (progress / 100) * circumference.value
})

const progressColorClass = computed(() => {
  const colors = {
    primary: 'text-[#0a192f]',
    blue: 'text-blue-500',
    green: 'text-green-500',
    purple: 'text-purple-500',
    orange: 'text-orange-500',
    red: 'text-red-500',
  }
  return colors[props.color]
})
</script>
