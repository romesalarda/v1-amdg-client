<template>
  <EventManagementLayout :event-id="eventIdentifier" :event="event?.data">
    <div class="max-w-7xl mx-auto space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 class="text-2xl font-black text-deep-navy">QR Check-in Scanner</h1>
          <p class="text-sm text-gray-500 mt-0.5">Point camera at attendee ticket QR code</p>
        </div>
        <NuxtLink
          :to="`/events/${eventIdentifier}/live/dashboard`"
          class="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          <UIcon name="i-heroicons-chart-bar" class="w-4 h-4" />
          Live dashboard
        </NuxtLink>
      </div>

      <!-- Two-column layout: scanner (left) + recent log (right) -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        <!-- Scanner column (2/5) -->
        <div class="lg:col-span-2">
          <CheckInScanner
            :is-processing="isProcessing"
            :is-paused="isPaused"
            :last-result="lastResult"
            :last-error="lastError"
            :scan-count="scanCount"
            :success-count="successCount"
            :failure-count="failureCount"
            :current-action="currentAction"
            @detect="onDetect"
            @manual-submit="submitManual"
            @update:action="currentAction = $event"
          />
        </div>

        <!-- Recent scans log (3/5) -->
        <div class="lg:col-span-3 bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5 space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-deep-navy uppercase tracking-widest">Recent Scans</h3>
            <UBadge v-if="recentResults.length" color="gray" variant="subtle" size="xs">
              {{ recentResults.length }}
            </UBadge>
          </div>

          <!-- Empty state -->
          <div
            v-if="!recentResults.length"
            class="flex flex-col items-center justify-center py-16 gap-3 text-gray-300"
          >
            <UIcon name="i-heroicons-qr-code" class="w-14 h-14" />
            <p class="text-sm text-gray-400 font-medium">No scans yet</p>
          </div>

          <!-- Scan entries -->
          <TransitionGroup name="list" tag="ul" class="space-y-2">
            <li
              v-for="item in recentResults"
              :key="item.id"
              class="flex items-start gap-3 p-3 rounded-xl border transition-colors"
              :class="
                item.response.scan_result === 'SUCCESS'
                  ? 'border-green-200 bg-green-50'
                  : item.response.scan_result === 'ALREADY_CHECKED_IN' || item.response.scan_result === 'ALREADY_CHECKED_OUT'
                  ? 'border-amber-200 bg-amber-50'
                  : 'border-red-200 bg-red-50'
              "
            >
              <!-- Icon -->
              <div
                class="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                :class="
                  item.response.scan_result === 'SUCCESS'
                    ? 'bg-green-100'
                    : item.response.scan_result === 'ALREADY_CHECKED_IN' || item.response.scan_result === 'ALREADY_CHECKED_OUT'
                    ? 'bg-amber-100'
                    : 'bg-red-100'
                "
              >
                <UIcon
                  :name="
                    item.response.scan_result === 'SUCCESS'
                      ? 'i-heroicons-check'
                      : item.response.scan_result === 'ALREADY_CHECKED_IN' || item.response.scan_result === 'ALREADY_CHECKED_OUT'
                      ? 'i-heroicons-arrow-path'
                      : 'i-heroicons-x-mark'
                  "
                  class="w-4 h-4"
                  :class="
                    item.response.scan_result === 'SUCCESS'
                      ? 'text-green-600'
                      : item.response.scan_result === 'ALREADY_CHECKED_IN' || item.response.scan_result === 'ALREADY_CHECKED_OUT'
                      ? 'text-amber-600'
                      : 'text-red-600'
                  "
                />
              </div>

              <!-- Detail -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <p class="text-sm font-bold text-deep-navy truncate">
                    {{ item.response.attendee_display_id }}
                  </p>
                  <span class="text-xs text-gray-400 flex-shrink-0">
                    {{ relativeTime(item.scanned_at) }}
                  </span>
                </div>
                <p class="text-xs text-gray-500 mt-0.5">
                  {{ item.response.attendee_full_name }}
                </p>
                <div class="flex items-center gap-1.5 mt-1 flex-wrap">
                  <UBadge
                    :color="item.response.scan_result === 'SUCCESS' ? 'green' : item.response.scan_result === 'ALREADY_CHECKED_IN' || item.response.scan_result === 'ALREADY_CHECKED_OUT' ? 'amber' : 'red'"
                    variant="subtle"
                    size="xs"
                  >
                    {{ scanResultLabel(item.response.scan_result) }}
                  </UBadge>
                  <UBadge v-if="item.response.ticket_code" color="gray" variant="subtle" size="xs" class="font-mono">
                    {{ item.response.ticket_code }}
                  </UBadge>
                  <UBadge v-if="item.response.has_outstanding_payments" color="red" variant="subtle" size="xs">
                    <UIcon name="i-heroicons-exclamation-triangle" class="w-3 h-3 mr-0.5" />
                    Unpaid
                  </UBadge>
                </div>
              </div>
            </li>
          </TransitionGroup>
        </div>
      </div>
    </div>
  </EventManagementLayout>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useEvent } from '~/composables/resources/events/events'
import { useCheckInScanner } from '~/composables/attendee/useCheckInScanner'
import type { ScanAction } from '~/composables/attendee/useCheckInScanner'
import EventManagementLayout from '~/components/events/EventManagementLayout.vue'
import CheckInScanner from '~/components/attendees/CheckInScanner.vue'

definePageMeta({
  layout: false,
  middleware: ['auth', 'event-permission'],
})

// ── Route + event ──────────────────────────────────────────────────────────

const route = useRoute()
const eventIdentifier = computed(() => String(route.params.id))

const { data: event } = useEvent(eventIdentifier)
const eventUUID = computed(() => event.value?.data?.event_id || eventIdentifier.value)

// ── Scanner ────────────────────────────────────────────────────────────────

const currentAction = ref<ScanAction>('CHECK_IN')

const {
  isProcessing,
  isPaused,
  lastResult,
  lastError,
  recentResults,
  scanCount,
  successCount,
  failureCount,
  onDetect,
  submitManual,
} = useCheckInScanner({
  eventIdentifier,
  action: currentAction,
})

// ── Helpers ────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function scanResultLabel(result: string): string {
  const labels: Record<string, string> = {
    SUCCESS: 'OK',
    ALREADY_CHECKED_IN: 'Dup In',
    ALREADY_CHECKED_OUT: 'Dup Out',
    INVALID_TICKET: 'Invalid',
    CANCELLED_ATTENDEE: 'Cancelled',
    CANCELLED_TICKET: 'Cancelled',
    NOT_FOUND: '404',
    OUTSTANDING_PAYMENTS: 'Unpaid',
    ERROR: 'Error',
  }
  return labels[result] ?? result
}
</script>

<style scoped>
/* Recent scan list entrance animation */
.list-enter-active {
  transition: all 0.2s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
