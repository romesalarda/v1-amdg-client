<template>
  <EventManagementLayout :event-id="eventIdentifier" :event="event?.data">
    <div class="max-w-7xl mx-auto space-y-4">
      <!-- Page header -->
      <!-- <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-black text-deep-navy">Live Check-in</h1>
          <p class="text-sm text-gray-500 mt-0.5">Real-time scan monitoring</p>
        </div>
        <div class="flex items-center gap-2">
          
        </div>
      </div> -->

      <!-- Collapsible controls top-bar -->
      <CheckInControlsBar
        :current-mode="mode"
        :active-filters="activeFilters"
        :is-live="isConnected"
        @set-mode="setMode"
        @apply-filters="applyFilters"
      />

      <!-- Main layout: left live panel (1/3) + right log (2/3) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <!-- Left column: live scan card only -->
        <CheckInLivePanel
          :current-item="currentItem"
          :is-connected="isConnected"
          :mode="mode"
          :remaining-count="remainingCount"
          @advance="advance"
          @go-back="goBack"
        />

        <!-- Right column: paginated log -->
        <div class="lg:col-span-2 bg-white border border-deep-navy/10 rounded-xl shadow-sm min-h-[500px] flex flex-col">
          <CheckInListView
            :event-id="eventUUID"
            :event-identifier="eventIdentifier"
            :refresh-trigger="refreshTrigger"
            @select-attendee="openAttendeePanel"
          />
        </div>
      </div>
    </div>

    <!-- Attendee side panel -->
    <CheckInAttendeePanel
      :open="!!selectedAttendeeId"
      :attendee-id="selectedAttendeeId"
      :event-id="eventIdentifier"
      @close="selectedAttendeeId = null"
    />
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
import CheckInControlsBar from '~/components/attendees/CheckInControlsBar.vue'
import CheckInListView from '~/components/attendees/CheckInListView.vue'
import CheckInAttendeePanel from '~/components/attendees/CheckInAttendeePanel.vue'

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

// ── Attendee side panel ────────────────────────────────────────────────────

const selectedAttendeeId = ref<string | null>(null)

function openAttendeePanel(payload: { attendee_id: string; attendee_full_name: string }) {
  selectedAttendeeId.value = payload.attendee_id
}
</script>
