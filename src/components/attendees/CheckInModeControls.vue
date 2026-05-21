<template>
  <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-4 space-y-4">
    <!-- Mode tabs -->
    <div>
      <p class="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2">Display Mode</p>
      <div class="flex gap-1 bg-gray-100 rounded-lg p-1">
        <button
          v-for="m in modes"
          :key="m.value"
          class="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all"
          :class="
            currentMode === m.value
              ? 'bg-white shadow text-deep-navy'
              : 'text-gray-500 hover:text-gray-700'
          "
          @click="$emit('set-mode', m.value)"
        >
          <UIcon :name="m.icon" class="w-3.5 h-3.5" />
          {{ m.label }}
        </button>
      </div>
    </div>

    <!-- Priority filters (shown when mode is 'priority') -->
    <div v-if="currentMode === 'priority'" class="space-y-3">
      <p class="text-xs text-gray-400 uppercase tracking-widest font-semibold">Priority Filters</p>

      <!-- Outstanding payments -->
      <div class="flex items-center justify-between">
        <label class="text-sm text-gray-700 font-medium">Outstanding payments</label>
        <UToggle
          :model-value="localFilters.has_outstanding_payments ?? false"
          @update:model-value="update('has_outstanding_payments', $event || null)"
        />
      </div>

      <!-- Attendee status -->
      <div>
        <label class="text-xs font-semibold text-gray-600 mb-1 block">Attendee status</label>
        <USelectMenu
          :model-value="localFilters.attendee_status ?? undefined"
          :options="attendeeStatusOptions"
          value-attribute="value"
          option-attribute="label"
          placeholder="Any status"
          @update:model-value="update('attendee_status', $event)"
          class="w-full"
        />
      </div>

      <!-- Ticket type -->
      <div>
        <label class="text-xs font-semibold text-gray-600 mb-1 block">Ticket type code</label>
        <UInput
          :model-value="localFilters.ticket_type ?? ''"
          placeholder="e.g. FULL_EVENT"
          size="sm"
          @update:model-value="update('ticket_type', $event || null)"
        />
      </div>

      <!-- Area from -->
      <div>
        <label class="text-xs font-semibold text-gray-600 mb-1 block">Area from</label>
        <UInput
          :model-value="localFilters.area_from ?? ''"
          placeholder="e.g. London"
          size="sm"
          @update:model-value="update('area_from', $event || null)"
        />
      </div>

      <UButton
        block
        color="primary"
        variant="soft"
        size="sm"
        icon="i-heroicons-funnel"
        @click="$emit('apply-filters', localFilters)"
      >
        Apply filters
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CheckInDisplayMode } from '~/composables/useCheckInModes'
import type { CheckInFilters } from '~/composables/websockets/events/useCheckInSocket'

interface Props {
  currentMode: CheckInDisplayMode
  activeFilters: CheckInFilters
}

const props = defineProps<Props>()

defineEmits<{
  'set-mode': [mode: CheckInDisplayMode]
  'apply-filters': [filters: CheckInFilters]
}>()

// ── Local filter state ─────────────────────────────────────────────────────

const localFilters = reactive<CheckInFilters>({ ...props.activeFilters })

watch(
  () => props.activeFilters,
  (f) => Object.assign(localFilters, f),
  { deep: true },
)

function update<K extends keyof CheckInFilters>(key: K, value: CheckInFilters[K]) {
  localFilters[key] = value
}

// ── Static data ────────────────────────────────────────────────────────────

const modes: { value: CheckInDisplayMode; label: string; icon: string }[] = [
  { value: 'auto', label: 'Auto', icon: 'i-heroicons-play' },
  { value: 'manual', label: 'Manual', icon: 'i-heroicons-hand-raised' },
  { value: 'priority', label: 'Priority', icon: 'i-heroicons-star' },
]

const attendeeStatusOptions = [
  { label: 'Any status', value: null },
  { label: 'Registered', value: 'registered' },
  { label: 'Checked in', value: 'checked_in' },
  { label: 'Checked out', value: 'checked_out' },
  { label: 'Cancelled', value: 'cancelled' },
]
</script>
