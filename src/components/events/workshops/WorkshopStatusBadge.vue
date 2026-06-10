<template>
  <span :class="badgeClass" class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide">
    <span class="material-symbols-outlined text-[10px]">{{ icon }}</span>
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WorkshopStatus } from '~/schemas/workshops/workshop.schema'

const props = defineProps<{
  status: WorkshopStatus | string | undefined
}>()

const config = computed(() => {
  switch (props.status) {
    case 'OPEN':
      return { label: 'Open', badgeClass: 'bg-emerald-100 text-emerald-700', icon: 'check_circle' }
    case 'CLOSED':
      return { label: 'Closed', badgeClass: 'bg-blue-100 text-blue-700', icon: 'lock' }
    case 'CANCELLED':
      return { label: 'Cancelled', badgeClass: 'bg-red-100 text-red-700', icon: 'cancel' }
    case 'DRAFT':
    default:
      return { label: 'Draft', badgeClass: 'bg-navy-100 text-navy-500', icon: 'edit_note' }
  }
})

const badgeClass = computed(() => config.value.badgeClass)
const label = computed(() => config.value.label)
const icon = computed(() => config.value.icon)
</script>
