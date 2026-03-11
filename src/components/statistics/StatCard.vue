<template>
  <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
    <div class="flex items-center gap-3">
      <div 
        class="w-10 h-10 rounded-lg flex items-center justify-center"
        :class="iconBackgroundClass"
      >
        <UIcon :name="icon" class="w-5 h-5" :class="iconColorClass" />
      </div>
      <div class="flex-1">
        <div class="text-2xl font-black text-deep-navy">{{ formattedValue }}</div>
        <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">{{ label }}</div>
        <div v-if="subtitle" class="text-xs text-gray-400 mt-0.5">{{ subtitle }}</div>
      </div>
      <div v-if="percentage !== undefined" class="text-right">
        <div 
          class="text-sm font-semibold"
          :class="percentageChange >= 0 ? 'text-green-600' : 'text-red-600'"
        >
          {{ percentageChange >= 0 ? '+' : '' }}{{ percentageChange.toFixed(1) }}%
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  value: number | string
  label: string
  subtitle?: string
  icon: string
  iconColor?: 'blue' | 'green' | 'amber' | 'purple' | 'red' | 'indigo' | 'pink'
  percentage?: number
  percentageChange?: number
  format?: 'number' | 'percentage' | 'currency'
}

const props = withDefaults(defineProps<Props>(), {
  iconColor: 'blue',
  format: 'number',
  percentageChange: 0,
})

const iconColorClass = computed(() => {
  const colorMap = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    amber: 'text-amber-600',
    purple: 'text-purple-600',
    red: 'text-red-600',
    indigo: 'text-indigo-600',
    pink: 'text-pink-600',
  }
  return colorMap[props.iconColor]
})

const iconBackgroundClass = computed(() => {
  const bgMap = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    amber: 'bg-amber-100',
    purple: 'bg-purple-100',
    red: 'bg-red-100',
    indigo: 'bg-indigo-100',
    pink: 'bg-pink-100',
  }
  return bgMap[props.iconColor]
})

const formattedValue = computed(() => {
  if (typeof props.value === 'string') return props.value
  
  switch (props.format) {
    case 'percentage':
      return `${props.value.toFixed(1)}%`
    case 'currency':
      return `£${props.value.toFixed(2)}`
    default:
      return props.value.toLocaleString()
  }
})
</script>
