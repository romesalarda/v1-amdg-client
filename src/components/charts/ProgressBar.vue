<template>
  <div class="space-y-1">
    <div class="flex justify-between text-xs font-black text-gray-900 uppercase tracking-wider">
      <span>{{ label }}</span>
      <span class="text-gray-500">{{ value }}</span>
    </div>
    <div class="w-full h-2 bg-gray-100 dark:bg-gray-200 rounded-full overflow-hidden">
      <div
        class="h-full rounded-full transition-all duration-500 ease-out"
        :class="barColorClass"
        :style="{ width: `${percentage}%` }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  label: string
  value: string | number
  percentage: number
  color?: 'primary' | 'blue' | 'green' | 'purple' | 'orange' | 'red'
}

const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
})

const barColorClass = computed(() => {
  const colors = {
    primary: 'bg-[#0a192f]',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
  }
  return colors[props.color]
})
</script>
