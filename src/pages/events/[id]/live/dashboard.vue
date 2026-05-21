<template>
  <EventManagementLayout :event-id="eventUUID" :event="event?.data">
    <div class="max-w-7xl mx-auto space-y-4">
      <!-- Page header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-black text-deep-navy">Live Check-in</h1>
          <p class="text-sm text-gray-500 mt-0.5">Real-time scan monitoring</p>
        </div>
        <div class="flex items-center gap-2">
          <span
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            :class="
              isConnected
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-gray-100 text-gray-500 border border-gray-200'
            "
          >
            <span
              class="inline-block w-1.5 h-1.5 rounded-full"
              :class="isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'"
            />
            {{ isConnected ? 'Connected' : 'Disconnected' }}
          </span>
        </div>
      </div>

      <!-- Main layout: left controls (1/3) + right list (2/3) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <!-- Left column: live panel + mode controls -->
        <div class="space-y-4">
          <!-- Mode controls -->
          <CheckInModeControls
            :current-mode="mode"
            :active-filters="activeFilters"
            @set-mode="setMode"
            @apply-filters="applyFilters"
          />

          <!-- Live scan card -->
          <CheckInLivePanel
            :current-item="currentItem"
            :is-connected="isConnected"
            :mode="mode"
            :remaining-count="remainingCount"
            @advance="advance"
            @go-back="goBack"
          />
        </div>

        <!-- Right column: paginated log -->
        <div class="lg:col-span-2 bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5 min-h-[500px] flex flex-col">
          <CheckInListView
            :event-id="eventUUID"
            :refresh-trigger="refreshTrigger"
          />
        </div>
      </div>
    </div>
  </EventManagementLayout>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useEvent } from '~/composables/resources/events/events'
import { useCheckInSocket } from '~/composables/websockets/events/useCheckInSocket'
import { useCheckInModes } from '~/composables/useCheckInModes'
import type { CheckInFilters } from '~/composables/websockets/events/useCheckInSocket'
import EventManagementLayout from '~/components/events/EventManagementLayout.vue'
import CheckInLivePanel from '~/components/attendees/CheckInLivePanel.vue'
import CheckInModeControls from '~/components/attendees/CheckInModeControls.vue'
import CheckInListView from '~/components/attendees/CheckInListView.vue'

definePageMeta({
  layout: false,
  middleware: ['auth', 'event-permission'],
})

// ── Route ──────────────────────────────────────────────────────────────────

const route = useRoute()
const eventIdentifier = computed(() => String(route.params.id))

// ── Event data ─────────────────────────────────────────────────────────────

const { data: event } = useEvent(eventIdentifier)
// UUID used for API list calls; falls back to route param during loading
const eventUUID = computed(() => event.value?.data?.event_id || eventIdentifier.value)

// ── WebSocket ──────────────────────────────────────────────────────────────

const ws = useCheckInSocket(eventIdentifier)

const { isConnected, recentCheckIns, priorityQueue, activeFilters } = ws

// Counter incremented on each new broadcast to trigger list refresh
const refreshTrigger = ref(0)
ws.onCheckIn(() => {
  refreshTrigger.value++
})

// ── Display modes ──────────────────────────────────────────────────────────

const { currentItem, mode, remainingCount, advance, goBack, setMode } = useCheckInModes({
  recentCheckIns,
  priorityQueue,
  autoAdvanceInterval: 10_000,
})

// ── Actions ────────────────────────────────────────────────────────────────

function applyFilters(filters: CheckInFilters) {
  ws.setFilters(filters)
  // Auto-switch to priority mode when filters applied
  if (mode.value !== 'priority') {
    setMode('priority')
  }
}
</script>
