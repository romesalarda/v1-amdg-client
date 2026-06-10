<template>
  <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
    <!-- Landing image banner -->
    <div v-if="landingImage" class="h-24 bg-mist-blue/20 overflow-hidden">
      <img :src="landingImage" :alt="workshop.title" class="w-full h-full object-cover" />
    </div>

    <!-- Header row -->
    <div class="flex items-start gap-4 p-5">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap mb-1">
          <h3 class="text-sm font-black text-navy-900 truncate">{{ workshop.title }}</h3>
          <WorkshopStatusBadge :status="workshop.status" />
          <span
            class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-indigo-50 text-indigo-700"
          >
            <span class="material-symbols-outlined text-[10px]">tune</span>
            {{ allocationLabel }}
          </span>
        </div>

        <div class="flex items-center gap-4 text-xs text-navy-400 flex-wrap mt-1">
          <span class="flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">calendar_today</span>
            {{ formattedDate }}
          </span>
          <span v-if="workshop.duration_minutes" class="flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">schedule</span>
            {{ workshop.duration_minutes }} min
          </span>
          <span class="flex items-center gap-1" :class="workshop.is_full ? 'text-red-500 font-semibold' : ''">
            <span class="material-symbols-outlined text-sm">group</span>
            {{ workshop.registration_count }}{{ workshop.capacity != null ? ` / ${workshop.capacity}` : '' }}
            <span v-if="workshop.is_full" class="text-[10px] font-black uppercase ml-1">Full</span>
          </span>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="flex items-center gap-1 flex-shrink-0">
        <!-- Run Allocation (shown for CLOSED workshops or INTEREST_RANKING mode) -->
        <button
          v-if="showAllocationButton"
          @click.stop="emit('run-allocation', workshop.id)"
          title="Run Allocation"
          class="flex items-center gap-1 px-2.5 py-1.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg text-[11px] font-bold transition-colors"
        >
          <span class="material-symbols-outlined text-sm">auto_awesome</span>
          Allocate
        </button>
        <button
          v-if="workshop.status === 'DRAFT' || workshop.status === 'CLOSED'"
          @click.stop="emit('open-registrations', workshop.id)"
          title="Open Registrations"
          class="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
        >
          <span class="material-symbols-outlined text-base">lock_open</span>
        </button>
        <button
          v-if="workshop.status === 'OPEN'"
          @click.stop="emit('close-registrations', workshop.id)"
          title="Close Registrations"
          class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <span class="material-symbols-outlined text-base">lock</span>
        </button>
        <button
          @click.stop="emit('edit', workshop)"
          title="Edit"
          class="p-1.5 text-navy-400 hover:text-primary hover:bg-mist-blue rounded-lg transition-colors"
        >
          <span class="material-symbols-outlined text-base">edit</span>
        </button>
        <button
          @click.stop="emit('delete', workshop.id)"
          title="Delete"
          class="p-1.5 text-navy-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <span class="material-symbols-outlined text-base">delete</span>
        </button>
        <button
          @click.stop="emit('toggle-registrations', workshop.id)"
          title="View Registrations"
          class="p-1.5 text-navy-400 hover:text-primary hover:bg-mist-blue rounded-lg transition-colors"
          :class="expanded ? 'text-primary bg-mist-blue' : ''"
        >
          <span class="material-symbols-outlined text-base">{{ expanded ? 'expand_less' : 'expand_more' }}</span>
        </button>
      </div>
    </div>

    <!-- Capacity bar -->
    <div v-if="workshop.capacity != null" class="px-5 pb-3">
      <div class="h-1.5 bg-navy-50 rounded-full overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-300"
          :class="workshop.is_full ? 'bg-red-400' : 'bg-emerald-400'"
          :style="{ width: `${Math.min(100, (workshop.registration_count / workshop.capacity!) * 100)}%` }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WorkshopList } from '~/api/types.gen'
import WorkshopStatusBadge from './WorkshopStatusBadge.vue'

const props = defineProps<{
  workshop: WorkshopList
  expanded?: boolean
}>()

const emit = defineEmits<{
  edit: [workshop: WorkshopList]
  delete: [id: number]
  'open-registrations': [id: number]
  'close-registrations': [id: number]
  'toggle-registrations': [id: number]
  'run-allocation': [id: number]
}>()

const allocationLabelMap: Record<string, string> = {
  FCFS: 'First Come First Served',
  INTEREST_RANKING: 'Interest Ranking',
  RANDOM: 'Random',
  MANUAL: 'Manual',
}

const allocationLabel = computed(
  () => allocationLabelMap[props.workshop.allocation_mode ?? ''] ?? props.workshop.allocation_mode ?? 'Unknown',
)

// landing_image is returned by the API but not yet in the TS types
const landingImage = computed(() => (props.workshop as any).landing_image as string | null | undefined)

const showAllocationButton = computed(
  () => props.workshop.status === 'CLOSED' || props.workshop.allocation_mode === 'INTEREST_RANKING',
)

const formattedDate = computed(() => {
  if (!props.workshop.date) return '—'
  const d = new Date(props.workshop.date)
  if (Number.isNaN(d.getTime())) return props.workshop.date
  return d.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
})
</script>
