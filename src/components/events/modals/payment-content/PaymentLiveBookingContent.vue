<template>
  <div class="space-y-3">
    <div class="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
      <div class="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div class="text-xs text-emerald-700 mb-1">Booking Reference</div>
          <div class="font-mono font-semibold text-emerald-900">{{ booking?.booking_reference?.toUpperCase() || 'N/A' }}</div>
        </div>
        <div>
          <div class="text-xs text-emerald-700 mb-1">Event</div>
          <div class="font-semibold text-emerald-900">{{ booking?.event_name || 'N/A' }}</div>
        </div>
        <div>
          <div class="text-xs text-emerald-700 mb-1">Booked By</div>
          <div class="font-semibold text-emerald-900">{{ booking?.made_by_name || booking?.made_by || 'N/A' }}</div>
        </div>
        <div>
          <div class="text-xs text-emerald-700 mb-1">Booked At</div>
          <div class="font-semibold text-emerald-900">{{ formatDateTime(booking?.booked_at) }}</div>
        </div>
      </div>
      <div class="mt-3 pt-3 border-t border-emerald-200 flex items-center justify-between">
        <span class="text-sm text-emerald-700">Total Attendees</span>
        <span class="text-lg font-black text-emerald-900">{{ attendees.length }}</span>
      </div>
    </div>

    <div v-if="attendees.length > 0" class="bg-white rounded-lg p-4 border border-gray-200">
      <div class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Attendees ({{ attendees.length }})</div>
      <div class="space-y-2">
        <div
          v-for="attendee in attendees"
          :key="attendee.id || attendee.attendee_id"
          class="rounded-lg bg-gray-50 border border-gray-200 p-3 hover:bg-gray-100 transition-colors"
          @click="router.push(`/events/${booking?.event_url_safe_title}/m/participants/editor/${attendee.id}`)" style="cursor: pointer"

        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="text-lg font-semibold font-mono text-gray-900">{{ attendee.name }}</div>
              <div class="text-xs text-gray-600 mt-1">Attendee ID: {{ attendee.id || 'N/A' }}</div>
              
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="tickets.length > 0" class="bg-white rounded-lg p-4 border border-gray-200">
      <div class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Live Tickets ({{ tickets.length }})</div>
      <div class="space-y-2">
        <div
          v-for="ticket in tickets"
          :key="ticket.ticket_id"
          class="rounded-lg bg-gray-50 border border-gray-200 p-3 cursor-pointer hover:bg-gray-100 transition-colors"
          @click="navigateTo(`/events/${booking?.event_url_safe_title}/m/participants/dashboard?view=tickets&ticket_id=${ticket.ticket_id}`)"

        >
          <div class="flex items-center justify-between gap-3">
            <div>
              <div class="text-sm font-semibold text-gray-900">{{ ticket.ticket_code || ticket.ticket_id }}</div>
              <div class="text-xs text-gray-600 mt-1">{{ ticket.attendee_name || 'Unknown attendee' }}</div>
            </div>
            <UBadge :color="ticket.status === 'ACTIVE' ? 'green' : 'gray'" variant="soft" size="xs">
              {{ ticket.status || 'UNKNOWN' }}
            </UBadge>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps<{ booking: any }>()

const attendees = computed<any[]>(() => (Array.isArray(props.booking?.attendees) ? props.booking.attendees : []))
const tickets = computed<any[]>(() => (Array.isArray(props.booking?.tickets) ? props.booking.tickets : []))

function formatDateTime(dateString: string): string {
  if (!dateString) return 'N/A'

  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return 'N/A'

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
</script>
