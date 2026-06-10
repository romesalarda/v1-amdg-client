<template>
  <span :class="badgeClass" class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide">
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status: string | undefined
}>()

const config = computed(() => {
  switch (props.status) {
    case 'CONFIRMED':
      return { label: 'Confirmed', badgeClass: 'bg-emerald-100 text-emerald-700' }
    case 'WAITLISTED':
      return { label: 'Waitlisted', badgeClass: 'bg-amber-100 text-amber-700' }
    case 'CANCELLED':
      return { label: 'Cancelled', badgeClass: 'bg-red-100 text-red-600' }
    case 'PENDING_ALLOCATION':
    default:
      return { label: 'Pending', badgeClass: 'bg-navy-100 text-navy-500' }
  }
})

const badgeClass = computed(() => config.value.badgeClass)
const label = computed(() => config.value.label)
</script>
