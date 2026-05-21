<template>
  <div class="flex flex-col h-full">
    <!-- Toolbar -->
    <div class="p-5 border-b border-gray-100">
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <div class="flex items-center gap-2.5">
          <UIcon name="i-heroicons-users" class="w-5 h-5 text-primary" />
          <div>
            <h2 class="text-sm font-black text-primary uppercase tracking-widest">Attendee Roster</h2>
            <p class="text-xs text-gray-500">
              <template v-if="totalCount > 0">
                {{ checkedInCount }} checked in · {{ totalCount - checkedInCount }} remaining
              </template>
              <template v-else-if="!isLoading">No attendees</template>
              <template v-else>Loading…</template>
            </p>
          </div>
        </div>

        <!-- Search -->
        <div class="flex items-center gap-2">
          <div class="relative">
            <UIcon
              name="i-heroicons-magnifying-glass"
              class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
            />
            <input
              v-model="searchInput"
              type="text"
              placeholder="Search name or ID…"
              class="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-48"
              @input="debouncedSearch"
            />
          </div>

          <!-- is_checked_in quick filter -->
          <select
            v-model="checkedInFilter"
            class="px-2 py-1.5 border border-gray-200 rounded-lg text-xs bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            @change="loadPage(1)"
          >
            <option :value="null">All attendees</option>
            <option :value="true">Checked in</option>
            <option :value="false">Not checked in</option>
          </select>

          <!-- More filters button -->
          <button
            class="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            :class="
              showFiltersModal || activeModalFilterCount > 0
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            "
            @click="showFiltersModal = true"
          >
            <UIcon name="i-heroicons-adjustments-horizontal" class="w-3.5 h-3.5" />
            Filters
            <UBadge v-if="activeModalFilterCount > 0" color="white" variant="solid" size="xs">
              {{ activeModalFilterCount }}
            </UBadge>
          </button>
        </div>
      </div>

      <!-- Day filter pills -->
      <div v-if="dayPills.length > 0" class="mt-3 flex flex-wrap gap-1.5">
        <button
          class="px-2.5 py-1 text-xs font-semibold rounded-full transition-colors"
          :class="
            activeDay === null
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          "
          @click="selectDay(null)"
        >
          All Days
        </button>
        <button
          v-for="day in dayPills"
          :key="day"
          class="px-2.5 py-1 text-xs font-semibold rounded-full transition-colors"
          :class="
            activeDay === day
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          "
          @click="selectDay(day)"
        >
          Day {{ day }}
        </button>
      </div>
    </div>

    <!-- Connection status banner -->
    <div
      v-if="!isConnected"
      class="px-5 py-2 bg-amber-50 border-b border-amber-100 flex items-center gap-2"
    >
      <UIcon name="i-heroicons-signal-slash" class="w-4 h-4 text-amber-500" />
      <span class="text-xs text-amber-700">Live updates paused — reconnecting…</span>
    </div>

    <!-- Table -->
    <div class="flex-1 overflow-auto">
      <UTable
        :rows="attendees"
        :columns="columns"
        :loading="isLoading"
        :empty-state="{ icon: 'i-heroicons-users', label: 'No attendees found' }"
        class="text-sm"
        :ui="{ tr: { base: 'hover:bg-primary/5 transition-colors' } }"
      >
        <!-- Attendee -->
        <template #attendee_display_id-data="{ row }">
          <div>
            <p class="font-semibold text-deep-navy">{{ row.full_name }}</p>
            <p class="text-xs text-gray-400 font-mono">{{ row.attendee_display_id }}</p>
          </div>
        </template>

        <!-- Area -->
        <template #area_from_name-data="{ row }">
          <span class="text-xs text-gray-600">{{ row.area_from_name ?? '—' }}</span>
        </template>

        <!-- Ticket type -->
        <template #ticket_type_code-data="{ row }">
          <span v-if="row.ticket_type_code" class="font-mono text-xs text-gray-600">{{ row.ticket_type_code }}</span>
          <span v-else class="text-gray-300">—</span>
        </template>

        <!-- Check-in status badge -->
        <template #is_checked_in-data="{ row }">
          <UBadge
            :color="row.is_checked_in ? 'green' : 'amber'"
            variant="subtle"
            size="xs"
          >
            {{ row.is_checked_in ? 'Checked In' : 'Pending' }}
          </UBadge>
        </template>

        <!-- Last check-in time -->
        <template #last_check_in_at-data="{ row }">
          <span v-if="row.last_check_in_at" class="text-xs text-gray-400">
            {{ formatTime(row.last_check_in_at) }}
          </span>
          <span v-else class="text-gray-300">—</span>
        </template>

        <!-- Day -->
        <template #event_day_last_seen-data="{ row }">
          <span v-if="row.event_day_last_seen != null" class="text-xs text-gray-500">
            Day {{ row.event_day_last_seen }}
          </span>
          <span v-else class="text-gray-300">—</span>
        </template>

        <!-- Payments flag -->
        <template #has_outstanding_payments-data="{ row }">
          <UIcon
            v-if="row.has_outstanding_payments"
            name="i-heroicons-exclamation-triangle"
            class="w-4 h-4 text-red-500"
          />
          <span v-else class="text-gray-300">—</span>
        </template>
      </UTable>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="p-4 border-t border-gray-100 flex items-center justify-between">
      <p class="text-xs text-gray-400">
        Page {{ currentPage }} of {{ totalPages }} · {{ totalCount }} attendees
      </p>
      <UPagination
        v-model="currentPage"
        :total="totalCount"
        :page-count="PAGE_SIZE"
        size="xs"
      />
    </div>

    <!-- Advanced filters modal -->
    <AttendeeFiltersModal
      v-model="showFiltersModal"
      :filters="modalFilters"
      :organisations="[]"
      :areas="[]"
      :dietary-requirements="[]"
      :medical-conditions="[]"
      :accessibility-requirements="[]"
      :event-questions="[]"
      @apply="applyRosterFilters"
      @clear="clearRosterFilters"
      @question-search-input="() => {}"
    />
  </div>
</template>

<script setup lang="ts">
import AttendeeFiltersModal from '~/components/attendees/AttendeeFiltersModal.vue'
import { useAttendeeRosterSocket } from '~/composables/websockets/events/useAttendeeRosterSocket'
import type { AttendeeRosterItem, AttendeeRosterListResponse, AttendeeUpdatedPayload } from '~/composables/websockets/events/useAttendeeRosterSocket'

// ── Props ─────────────────────────────────────────────────────────────────

interface Props {
  /** URL-safe event identifier (slug or UUID) for the WS connection */
  eventIdentifier: string
  /** Number of event days — used to pre-populate day pills. Auto-detected if omitted. */
  eventDaysCount?: number
}

const props = defineProps<Props>()

// ── Constants ─────────────────────────────────────────────────────────────

const PAGE_SIZE = 5

// ── State ─────────────────────────────────────────────────────────────────

const attendees = ref<AttendeeRosterItem[]>([])
const totalCount = ref(0)
const currentPage = ref(1)
const isLoading = ref(true)

const activeDay = ref<number | null>(null)
const checkedInFilter = ref<boolean | null>(null)
const searchInput = ref('')

/** Advanced filter state (camelCase keys matching AttendeeFiltersModal expectations) */
const showFiltersModal = ref(false)
const modalFilters = ref<Record<string, any>>({
  organisation: undefined,
  areaFrom: undefined,
  gender: undefined,
  ageMin: undefined,
  ageMax: undefined,
  isMinor: undefined,
  isCheckedIn: undefined,
  isRegistered: undefined,
  isCancelled: undefined,
  isStaff: undefined,
  hasDietaryRequirements: undefined,
  hasMedicalConditions: undefined,
  hasAccessibilityRequirements: undefined,
  hasEmergencyContacts: undefined,
  relationshipToUser: undefined,
})

const activeModalFilterCount = computed(() =>
  Object.values(modalFilters.value).filter((v) => v !== undefined && v !== null && v !== '').length,
)

/** Days discovered from returned data (filled on first response) */
const discoveredDays = ref<number[]>([])

const checkedInCount = computed(() => attendees.value.filter((a) => a.is_checked_in).length)

const dayPills = computed<number[]>(() => {
  if (props.eventDaysCount) {
    return Array.from({ length: props.eventDaysCount }, (_, i) => i + 1)
  }
  return [...discoveredDays.value].sort((a, b) => a - b)
})

const totalPages = computed(() => Math.ceil(totalCount.value / PAGE_SIZE))

// ── Columns ───────────────────────────────────────────────────────────────

const columns = [
  { key: 'attendee_display_id', label: 'Attendee' },
  { key: 'area_from_name', label: 'Area' },
  { key: 'ticket_type_code', label: 'Ticket' },
  { key: 'is_checked_in', label: 'Status' },
  { key: 'last_check_in_at', label: 'Last Check-in' },
  { key: 'event_day_last_seen', label: 'Day' },
  { key: 'has_outstanding_payments', label: 'Payments' },
]

// ── WebSocket ─────────────────────────────────────────────────────────────

const ws = useAttendeeRosterSocket(computed(() => props.eventIdentifier))
const isConnected = ws.isConnected

// Handle paginated list response
ws.onPageReceived((resp: AttendeeRosterListResponse) => {
  attendees.value = resp.attendees
  totalCount.value = resp.total_count
  isLoading.value = false

  // Discover event days from returned data
  const days = resp.attendees
    .map((a) => a.event_day_last_seen)
    .filter((d): d is number => d != null)
  const unique = [...new Set([...discoveredDays.value, ...days])]
  discoveredDays.value = unique
})

// Handle real-time single-attendee updates
ws.onAttendeeUpdated((payload: AttendeeUpdatedPayload) => {
  const idx = attendees.value.findIndex(
    (a) => a.attendee_id === payload.attendee.attendee_id,
  )
  if (idx !== -1) {
    attendees.value[idx] = payload.attendee
    // Update discovered days
    const day = payload.attendee.event_day_last_seen
    if (day != null && !discoveredDays.value.includes(day)) {
      discoveredDays.value = [...discoveredDays.value, day].sort((a, b) => a - b)
    }
  }
})

// Reload after bulk check-in/out operations
ws.onBulkUpdated(() => {
  loadPage(currentPage.value)
})

// Load page when WS connects
watch(isConnected, (connected) => {
  if (connected) {
    loadPage(1)
  }
})

// ── Pagination ────────────────────────────────────────────────────────────

watch(currentPage, (page) => {
  loadPage(page)
})

// ── Filter helpers ────────────────────────────────────────────────────────

function selectDay(day: number | null) {
  activeDay.value = day
  currentPage.value = 1
  loadPage(1)
}

// Debounced search
let searchTimer: ReturnType<typeof setTimeout> | null = null
function debouncedSearch() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    currentPage.value = 1
    loadPage(1)
  }, 300)
}

// ── Load ──────────────────────────────────────────────────────────────────

/** Map camelCase modal filters → snake_case WS filter keys */
function buildWsFilters() {
  const f = modalFilters.value
  return {
    day: activeDay.value ?? undefined,
    search: searchInput.value || undefined,
    is_checked_in: checkedInFilter.value ?? f.isCheckedIn,
    is_cancelled: f.isCancelled,
    is_registered: f.isRegistered,
    is_event_staff: f.isStaff,
    is_minor: f.isMinor,
    gender: f.gender || undefined,
    age_min: f.ageMin,
    age_max: f.ageMax,
    area_from: f.areaFrom,
    organisation: f.organisation,
    has_dietary_requirements: f.hasDietaryRequirements,
    has_medical_conditions: f.hasMedicalConditions,
    has_accessibility_requirements: f.hasAccessibilityRequirements,
    has_emergency_contacts: f.hasEmergencyContacts,
    relationship_to_user: f.relationshipToUser || undefined,
  }
}

function loadPage(page: number) {
  isLoading.value = true
  ws.requestPage(page, PAGE_SIZE, buildWsFilters())
}

function applyRosterFilters(updatedFilters: Record<string, any>) {
  modalFilters.value = { ...updatedFilters }
  showFiltersModal.value = false
  currentPage.value = 1
  loadPage(1)
}

function clearRosterFilters() {
  modalFilters.value = {
    organisation: undefined,
    areaFrom: undefined,
    gender: undefined,
    ageMin: undefined,
    ageMax: undefined,
    isMinor: undefined,
    isCheckedIn: undefined,
    isRegistered: undefined,
    isCancelled: undefined,
    isStaff: undefined,
    hasDietaryRequirements: undefined,
    hasMedicalConditions: undefined,
    hasAccessibilityRequirements: undefined,
    hasEmergencyContacts: undefined,
    relationshipToUser: undefined,
  }
  showFiltersModal.value = false
  currentPage.value = 1
  loadPage(1)
}

// ── Helpers ───────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
</script>
