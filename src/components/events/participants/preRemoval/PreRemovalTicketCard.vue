<template>
  <div class="rounded-xl border border-gray-200 bg-white p-4">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-ticket" class="h-4 w-4 text-blue-600" />
          <p class="truncate text-sm font-semibold text-gray-900">
            {{ resolvedTicketCode }}
          </p>
        </div>
        <p class="mt-1 text-xs text-gray-500">
          {{ resolvedTicketType }}
        </p>
      </div>

      <UBadge :color="ticketStatusColor" variant="soft" size="xs">
        {{ resolvedTicketStatus }}
      </UBadge>
    </div>

    <div class="mt-3 grid gap-3 md:grid-cols-[auto_1fr]">
      <div class="rounded-lg border border-gray-200 bg-white p-2">
        <div class="flex h-[88px] w-[88px] items-center justify-center">
          <Qrcode
            v-if="qrTicket?.qr_value"
            :value="qrTicket.qr_value"
            :width="84"
            :height="84"
            class="h-[84px] w-[84px]"
          />
          <div v-else class="text-[10px] text-gray-400">No QR</div>
        </div>
        <div class="mt-2 flex items-center justify-center gap-1 text-[10px] uppercase tracking-wide text-gray-500">
          <UIcon name="i-heroicons-qr-code" class="h-3 w-3" />
          QR
        </div>
      </div>

      <div class="space-y-2">
        <div class="text-xs text-gray-600">
          <span class="font-semibold text-gray-700">Ticket ID:</span>
          {{ item.ticket_id || 'N/A' }}
        </div>

        <div v-if="resolvedPackageName" class="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-700">
          <UIcon name="i-heroicons-cube-transparent" class="h-3.5 w-3.5" />
          Package: {{ resolvedPackageName }}
        </div>

        <div class="text-xs text-gray-600">
          <span class="font-semibold text-gray-700">Payment:</span>
          {{ item.payment_reference || 'Not linked' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBookingTicket } from '~/composables/resources/booking/bookingTickets'
import { useFormattedTicketForQR } from '~/composables/resources/tickets/useTicketQRCode'
import type { AttendeePreRemovalBlockerItem } from '~/composables/resources/attendee/attendees'

const props = defineProps<{
  item: AttendeePreRemovalBlockerItem
}>()

const ticketId = computed(() => props.item.ticket_id || '')
const ticketQuery = useBookingTicket(ticketId)

const qrTicket = useFormattedTicketForQR(computed(() => ticketQuery.data.value?.data))

const resolvedTicketCode = computed(() => props.item.ticket_code || qrTicket.value?.ticket_code || 'Unknown ticket')
const resolvedTicketType = computed(() => props.item.ticket_type || ticketQuery.data.value?.data?.ticket_type_title || 'Ticket')
const resolvedTicketStatus = computed(() => props.item.status || ticketQuery.data.value?.data?.status || 'UNKNOWN')
const resolvedPackageName = computed(() => ticketQuery.data.value?.data?.package_name || null)

const ticketStatusColor = computed(() => {
  const status = resolvedTicketStatus.value.toUpperCase()
  if (status === 'ACTIVE') return 'green'
  if (status === 'USED') return 'gray'
  if (status === 'CANCELLED') return 'red'
  return 'gray'
})
</script>
