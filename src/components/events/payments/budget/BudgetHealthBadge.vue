<template>
  <span
    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
    :class="badgeClasses"
  >
    <span class="material-symbols-outlined text-sm leading-none">{{ icon }}</span>
    {{ label }}
  </span>
</template>

<script setup lang="ts">
type HealthStatus = 'SURPLUS' | 'BREAK_EVEN' | 'DEFICIT' | 'UNKNOWN'

const props = defineProps<{
  healthStatus: HealthStatus
}>()

const config: Record<HealthStatus, { label: string; icon: string; classes: string }> = {
  SURPLUS: {
    label: 'Surplus',
    icon: 'trending_up',
    classes: 'bg-green-100 text-green-700',
  },
  BREAK_EVEN: {
    label: 'Break Even',
    icon: 'balance',
    classes: 'bg-blue-100 text-blue-700',
  },
  DEFICIT: {
    label: 'Deficit',
    icon: 'trending_down',
    classes: 'bg-red-100 text-red-700',
  },
  UNKNOWN: {
    label: 'Unknown',
    icon: 'help_outline',
    classes: 'bg-gray-100 text-gray-500',
  },
}

const current = computed(() => config[props.healthStatus] ?? config.UNKNOWN)
const badgeClasses = computed(() => current.value.classes)
const label = computed(() => current.value.label)
const icon = computed(() => current.value.icon)
</script>
