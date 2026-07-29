<template>
  <EventManagementLayout
    :event-id="eventIdentifier"
    :event="event?.data"
  >
    <div class="max-w-7xl mx-auto space-y-6">

      <!-- Header -->
      <div class="flex items-center justify-between flex-wrap gap-4">

        <div class="flex items-center gap-4">
          <div
            class="w-11 h-11 rounded-2xl
                   bg-indigo-50
                   border border-indigo-100
                   flex items-center justify-center"
          >
            <UIcon
              name="i-heroicons-qr-code"
              class="w-5 h-5 text-indigo-600"
            />
          </div>

          <div>
            <h1 class="text-2xl font-bold text-slate-900">
              Access Control
            </h1>

            <p class="text-sm text-slate-500">
              QR check-in scanner
            </p>
          </div>
        </div>

        <NuxtLink
          :to="`/events/${eventIdentifier}/live/dashboard`"
          class="inline-flex items-center gap-2
                 rounded-xl
                 border border-slate-200
                 bg-white
                 px-4 py-2
                 text-sm font-semibold
                 text-slate-700
                 hover:bg-slate-50
                 transition"
        >
          <UIcon
            name="i-heroicons-chart-bar"
            class="w-4 h-4 text-indigo-600"
          />
          Live Dashboard
        </NuxtLink>

      </div>

      <!-- Content -->
      <div class="grid lg:grid-cols-5 gap-6">

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
            @clear-last="clearLast"
          />
        </div>

        <!-- Recent Scan Card -->
        <div
          class="lg:col-span-3
                 rounded-3xl
                 bg-white
                 border border-slate-200
                 shadow-sm
                 overflow-hidden"
        >

          <!-- Header -->
          <div
            class="flex items-center justify-between
                   px-6 py-5
                   border-b border-slate-100"
          >

            <div class="flex items-center gap-3">
              <h3
                class="text-xs
                       uppercase
                       tracking-[0.25em]
                       text-slate-500
                       font-bold"
              >
                Recent Scans
              </h3>

              <span
                v-if="recentResults.length"
                class="rounded-full
                       bg-slate-100
                       px-2.5 py-1
                       text-xs
                       font-semibold
                       text-slate-600"
              >
                {{ recentResults.length }}
              </span>
            </div>

            <div class="flex items-center gap-2">
              <span
                class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"
              />

              <span
                class="text-xs font-semibold text-emerald-600"
              >
                Live
              </span>
            </div>

          </div>

          <!-- Empty -->
          <div
            v-if="!recentResults.length"
            class="py-24 flex flex-col items-center"
          >
            <div
              class="w-16 h-16 rounded-2xl
                     bg-slate-100
                     flex items-center justify-center"
            >
              <UIcon
                name="i-heroicons-qr-code"
                class="w-8 h-8 text-slate-400"
              />
            </div>

            <p class="mt-4 font-semibold text-slate-700">
              Awaiting first scan
            </p>

            <p class="text-sm text-slate-500 mt-1">
              Scan results will appear here automatically.
            </p>
          </div>

          <!-- List -->
          <TransitionGroup
            tag="ul"
            name="list"
            class="divide-y divide-slate-100 max-h-[650px] overflow-y-auto"
          >

            <li
              v-for="item in recentResults"
              :key="item.id"
              class="flex gap-4 px-6 py-4 hover:bg-slate-50 transition"
            >

              <!-- Status -->
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center"
                :class="{
                  'bg-emerald-50': item.response.scan_result==='SUCCESS',
                  'bg-amber-50':
                    item.response.scan_result==='ALREADY_CHECKED_IN' ||
                    item.response.scan_result==='ALREADY_CHECKED_OUT',
                  'bg-rose-50':
                    item.response.scan_result!=='SUCCESS' &&
                    item.response.scan_result!=='ALREADY_CHECKED_IN' &&
                    item.response.scan_result!=='ALREADY_CHECKED_OUT'
                }"
              >
                <UIcon
                  :name="
                    item.response.scan_result==='SUCCESS'
                      ? 'i-heroicons-check'
                      : item.response.scan_result==='ALREADY_CHECKED_IN' ||
                        item.response.scan_result==='ALREADY_CHECKED_OUT'
                      ? 'i-heroicons-arrow-path'
                      : 'i-heroicons-x-mark'
                  "
                  class="w-5 h-5"
                  :class="{
                    'text-emerald-600': item.response.scan_result==='SUCCESS',
                    'text-amber-600':
                      item.response.scan_result==='ALREADY_CHECKED_IN' ||
                      item.response.scan_result==='ALREADY_CHECKED_OUT',
                    'text-rose-600':
                      item.response.scan_result!=='SUCCESS' &&
                      item.response.scan_result!=='ALREADY_CHECKED_IN' &&
                      item.response.scan_result!=='ALREADY_CHECKED_OUT'
                  }"
                />
              </div>

              <!-- Info -->
              <div class="flex-1">

                <div class="flex justify-between items-center">

                  <h4 class="font-semibold text-slate-900">
                    {{ item.response.attendee_display_id }}
                  </h4>

                  <span class="text-xs text-slate-400">
                    {{ relativeTime(item.scanned_at) }}
                  </span>

                </div>

                <p class="text-sm text-slate-500 mt-1">
                  {{ item.response.attendee_full_name }}
                </p>

                <div class="flex gap-2 flex-wrap mt-3">

                  <span
                    class="rounded-lg px-2.5 py-1 text-xs font-semibold"
                    :class="{
                      'bg-emerald-100 text-emerald-700':
                        item.response.scan_result==='SUCCESS',
                      'bg-amber-100 text-amber-700':
                        item.response.scan_result==='ALREADY_CHECKED_IN' ||
                        item.response.scan_result==='ALREADY_CHECKED_OUT',
                      'bg-rose-100 text-rose-700':
                        item.response.scan_result!=='SUCCESS' &&
                        item.response.scan_result!=='ALREADY_CHECKED_IN' &&
                        item.response.scan_result!=='ALREADY_CHECKED_OUT'
                    }"
                  >
                    {{ scanResultLabel(item.response.scan_result) }}
                  </span>

                  <span
                    v-if="item.response.ticket_code"
                    class="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600 font-mono"
                  >
                    {{ item.response.ticket_code }}
                  </span>

                  <span
                    v-if="item.response.has_outstanding_payments"
                    class="rounded-lg bg-rose-100 text-rose-700 px-2.5 py-1 text-xs font-semibold"
                  >
                    Unpaid
                  </span>

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
  clearLast,
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
.list-enter-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.list-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
