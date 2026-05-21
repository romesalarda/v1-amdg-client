<template>
  <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm overflow-hidden">
    <!-- Always-visible collapsed bar -->
    <div class="flex items-center justify-between px-4 py-2.5">
      <!-- Left: active mode pill + filter summary -->
      <div class="flex items-center gap-2">
        <span class="text-xs font-black text-deep-navy uppercase tracking-widest">Check-in Controls</span>
        <UBadge color="primary" variant="soft" size="xs" class="capitalize">
          <UIcon :name="activeMode.icon" class="w-3 h-3 mr-1" />
          {{ activeMode.label }}
        </UBadge>
        <UBadge v-if="activeFilterCount > 0" color="amber" variant="soft" size="xs">
          {{ activeFilterCount }} filter{{ activeFilterCount !== 1 ? 's' : '' }} active
        </UBadge>
        <span
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            :class="
              isLive
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-gray-100 text-gray-500 border border-gray-200'
            "
          >
            <span
              class="inline-block w-1.5 h-1.5 rounded-full"
              :class="isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'"
            />
            {{ isLive ? 'Connected' : 'Disconnected' }}
          </span>
      </div>

      <!-- Right: toggle button -->
      <button
        class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors"
        :class="expanded ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
        @click="expanded = !expanded"
      >
        <UIcon :name="expanded ? 'i-heroicons-chevron-up' : 'i-heroicons-adjustments-horizontal'" class="w-3.5 h-3.5" />
        {{ expanded ? 'Collapse' : 'Settings' }}
      </button>
    </div>

    <!-- Expandable body -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-96"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 max-h-96"
      leave-to-class="opacity-0 max-h-0"
    >
      <div v-if="expanded" class="border-t border-gray-100 px-4 py-4">
        <div class="flex flex-col lg:flex-row gap-5">
          <!-- Mode tabs -->
          <div class="flex-shrink-0">
            <p class="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2">Display Mode</p>
            <div class="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button
                v-for="m in modes"
                :key="m.value"
                class="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all"
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

          <!-- Divider -->
          <div class="hidden lg:block w-px bg-gray-100 self-stretch" />

          <!-- Filters -->
          <div class="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-3">
            <!-- Outstanding payments -->
            <div class="flex items-center justify-between gap-3 col-span-2 lg:col-span-1">
              <label class="text-xs font-semibold text-gray-600">Outstanding payments</label>
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
                size="sm"
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
          </div>

          <!-- Apply button -->
          <div class="flex items-end flex-shrink-0">
            <UButton
              color="primary"
              variant="soft"
              size="sm"
              icon="i-heroicons-funnel"
              @click="handleApply"
            >
              Apply
            </UButton>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { CheckInDisplayMode } from '~/composables/useCheckInModes'
import type { CheckInFilters } from '~/composables/websockets/events/useCheckInSocket'

interface Props {
  currentMode: CheckInDisplayMode
  activeFilters: CheckInFilters
  isLive: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'set-mode': [mode: CheckInDisplayMode]
  'apply-filters': [filters: CheckInFilters]
}>()

// ── Expand / collapse ──────────────────────────────────────────────────────

const expanded = ref(false)

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

function handleApply() {
  emit('apply-filters', { ...localFilters })
}

// ── Derived display ────────────────────────────────────────────────────────

const activeFilterCount = computed(() => {
  let n = 0
  if (localFilters.has_outstanding_payments) n++
  if (localFilters.attendee_status) n++
  if (localFilters.ticket_type) n++
  if (localFilters.area_from) n++
  return n
})

const modes: { value: CheckInDisplayMode; label: string; icon: string }[] = [
  { value: 'auto', label: 'Auto', icon: 'i-heroicons-play' },
  { value: 'priority', label: 'Priority', icon: 'i-heroicons-star' },
  { value: 'manual', label: 'Manual', icon: 'i-heroicons-hand-raised' },
]

const activeMode = computed(() => modes.find((m) => m.value === props.currentMode) ?? modes[0])

const attendeeStatusOptions = [
  { label: 'Registered', value: 'registered' },
  { label: 'Checked In', value: 'checked_in' },
  { label: 'Cancelled', value: 'cancelled' },
]
</script>
