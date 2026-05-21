<template>
  <div class="flex flex-col gap-4">
    <!-- Connection indicator -->
    <div class="flex items-center gap-2">
      <span
        class="inline-block w-2.5 h-2.5 rounded-full"
        :class="isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-300'"
      />
      <span class="text-xs text-gray-500 font-medium uppercase tracking-wide">
        {{ isConnected ? 'Live' : 'Disconnected' }}
      </span>
    </div>

    <!-- No item state -->
    <div
      v-if="!currentItem"
      class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-8 flex flex-col items-center gap-3 text-center"
    >
      <UIcon name="i-heroicons-qr-code" class="w-12 h-12 text-gray-300" />
      <p class="text-sm text-gray-400 font-medium">Waiting for scan…</p>
    </div>

    <!-- Check-in card -->
    <div
      v-else
      class="bg-white border border-deep-navy/10 rounded-xl shadow-sm overflow-hidden transition-all"
    >
      <!-- Result banner -->
      <div
        class="px-4 py-2 flex items-center gap-2 text-sm font-semibold"
        :class="resultBannerClass"
      >
        <UIcon :name="resultIcon" class="w-4 h-4" />
        {{ resultLabel }}
      </div>

      <!-- Body -->
      <div class="p-5 space-y-4">
        <!-- Attendee -->
        <div>
          <p class="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-0.5">Attendee</p>
          <p class="text-lg font-black text-deep-navy">{{ currentItem.attendee_display_id }}</p>
          <p v-if="currentItem.area_from" class="text-sm text-gray-500 mt-0.5">
            <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5 inline-block mr-1" />
            {{ currentItem.area_from }}
          </p>
        </div>

        <!-- Ticket -->
        <div v-if="currentItem.ticket_code" class="flex items-center gap-2">
          <UIcon name="i-heroicons-ticket" class="w-4 h-4 text-gray-400 flex-shrink-0" />
          <div>
            <span class="text-xs text-gray-400 uppercase tracking-widest font-semibold block">Ticket</span>
            <span class="text-sm font-mono font-semibold text-deep-navy">{{ currentItem.ticket_code }}</span>
            <span v-if="currentItem.ticket_type_code" class="ml-2 text-xs text-gray-500">{{ currentItem.ticket_type_code }}</span>
          </div>
        </div>

        <!-- Method + Action badges -->
        <div class="flex flex-wrap gap-2">
          <UBadge
            :color="currentItem.action === 'CHECK_IN' ? 'green' : 'amber'"
            variant="subtle"
            size="sm"
          >
            {{ currentItem.action === 'CHECK_IN' ? 'Check In' : 'Check Out' }}
          </UBadge>
          <UBadge color="gray" variant="subtle" size="sm">
            {{ methodLabel(currentItem.method) }}
          </UBadge>
          <UBadge v-if="currentItem.matches_priority_filter" color="purple" variant="subtle" size="sm">
            <UIcon name="i-heroicons-star" class="w-3 h-3 mr-1" />
            Priority
          </UBadge>
        </div>

        <!-- Outstanding payments warning -->
        <div
          v-if="currentItem.has_outstanding_payments"
          class="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3"
        >
          <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p class="text-xs text-red-700 font-medium">Outstanding payments on this booking</p>
        </div>

        <!-- Timestamp + performed by -->
        <div class="text-xs text-gray-400 flex items-center gap-1">
          <UIcon name="i-heroicons-clock" class="w-3.5 h-3.5" />
          {{ relativeTime }}
        </div>
      </div>
    </div>

    <!-- Navigation (manual mode) -->
    <div v-if="showNavigation" class="flex items-center gap-2 justify-between">
      <UButton
        color="gray"
        variant="outline"
        size="sm"
        icon="i-heroicons-chevron-left"
        :disabled="!currentItem"
        @click="$emit('go-back')"
      >
        Prev
      </UButton>
      <span v-if="remainingCount > 0" class="text-xs text-gray-400">+{{ remainingCount }} more</span>
      <UButton
        color="gray"
        variant="outline"
        size="sm"
        trailing-icon="i-heroicons-chevron-right"
        :disabled="!currentItem"
        @click="$emit('advance')"
      >
        Next
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CheckInBroadcastPayload } from '~/composables/websockets/events/useCheckInSocket'
import type { CheckInDisplayMode } from '~/composables/useCheckInModes'

interface Props {
  currentItem: CheckInBroadcastPayload | null
  isConnected: boolean
  mode: CheckInDisplayMode
  remainingCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  remainingCount: 0,
})

defineEmits<{
  advance: []
  'go-back': []
}>()

// ── Computed ──────────────────────────────────────────────────────────────

const showNavigation = computed(() => props.mode === 'manual')

const resultBannerClass = computed(() => {
  if (!props.currentItem) return ''
  const r = props.currentItem.scan_result
  if (r === 'SUCCESS') return 'bg-green-50 text-green-700'
  if (r === 'ALREADY_CHECKED_IN' || r === 'ALREADY_CHECKED_OUT') return 'bg-amber-50 text-amber-700'
  if (['CANCELLED_ATTENDEE', 'CANCELLED_TICKET'].includes(r)) return 'bg-red-50 text-red-700'
  if (r === 'OUTSTANDING_PAYMENTS') return 'bg-orange-50 text-orange-700'
  return 'bg-gray-50 text-gray-600'
})

const resultIcon = computed(() => {
  if (!props.currentItem) return 'i-heroicons-question-mark-circle'
  const r = props.currentItem.scan_result
  if (r === 'SUCCESS') return 'i-heroicons-check-circle'
  if (r === 'ALREADY_CHECKED_IN' || r === 'ALREADY_CHECKED_OUT') return 'i-heroicons-arrow-path'
  if (['CANCELLED_ATTENDEE', 'CANCELLED_TICKET'].includes(r)) return 'i-heroicons-x-circle'
  if (r === 'OUTSTANDING_PAYMENTS') return 'i-heroicons-exclamation-triangle'
  return 'i-heroicons-information-circle'
})

const resultLabel = computed(() => {
  if (!props.currentItem) return ''
  const labels: Record<string, string> = {
    SUCCESS: 'Scan successful',
    ALREADY_CHECKED_IN: 'Already checked in',
    ALREADY_CHECKED_OUT: 'Already checked out',
    INVALID_TICKET: 'Invalid ticket',
    CANCELLED_ATTENDEE: 'Attendee cancelled',
    CANCELLED_TICKET: 'Ticket cancelled',
    NOT_FOUND: 'Not found',
    OUTSTANDING_PAYMENTS: 'Outstanding payments',
    ERROR: 'Error',
  }
  return labels[props.currentItem.scan_result] ?? props.currentItem.scan_result
})

const relativeTime = computed(() => {
  if (!props.currentItem) return ''
  const d = new Date(props.currentItem.performed_at)
  const diff = Math.floor((Date.now() - d.getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
})

function methodLabel(method: string) {
  return { QR_CODE: 'QR Code', MANUAL: 'Manual', ADMIN: 'Admin' }[method] ?? method
}
</script>
