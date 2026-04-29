<template>
  <div class="space-y-4">
    <!-- Loading state -->
    <div v-if="ticketsQuery.isLoading.value" class="flex items-center justify-center rounded-xl border border-dashed border-deep-navy/20 bg-mist-blue/20 py-12">
      <p class="text-sm text-deep-navy/60">Loading tickets...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="ticketsQuery.error.value" class="rounded-xl border border-red-200 bg-red-50 p-4">
      <p class="text-sm font-semibold text-red-900">Unable to load tickets</p>
      <p class="mt-1 text-xs text-red-800">{{ ticketsQuery.error.value.message }}</p>
      <button
        type="button"
        @click="ticketsQuery.refetch()"
        class="mt-2 rounded-lg border border-red-300 bg-red-100 px-2 py-1 text-xs font-semibold text-red-900 hover:bg-red-200"
      >
        Try again
      </button>
    </div>

    <!-- No tickets -->
    <div v-else-if="!formattedTickets.length" class="flex flex-col items-center justify-center rounded-xl border border-dashed border-deep-navy/20 bg-mist-blue/20 py-12 text-center">
      <svg class="h-12 w-12 text-deep-navy/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="mt-3 text-sm font-semibold text-deep-navy/70">No tickets issued yet</p>
      <p class="mt-1 text-xs text-deep-navy/60">Tickets will appear here once your booking is confirmed and payment received.</p>
    </div>

    <!-- Tickets grid -->
    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-1 print:grid-cols-1">
      <article
        v-for="ticket in formattedTickets"
        :key="ticket.ticket_id"
        class="flex flex-col overflow-hidden rounded-2xl border border-deep-navy/10 bg-white shadow-sm transition-shadow hover:shadow-md print:shadow-none print:border-deep-navy/5 print:page-break-inside-avoid print:pb-6"
      >
        <!-- Header with status badge -->
        <div class="flex items-start justify-between gap-3 border-b border-deep-navy/10 bg-white px-5 py-4">
          <div class="min-w-0 flex-1">
            <h3 class="text-sm font-semibold text-deep-navy">
              {{ ticket.attendee_name }}
            </h3>
            <p class="mt-1 truncate font-mono text-[11px] text-deep-navy/60">
              {{ ticket.ticket_code }}
            </p>
          </div>
          <span
            :class="[
              'shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide',
              ticketStatusInfo(ticket.status).badgeClass,
            ]"
          >
            {{ ticketStatusInfo(ticket.status).label }}
          </span>
        </div>

        <!-- QR Code and details -->
        <div class="flex flex-col gap-4 p-5 sm:flex-row sm:gap-5 sm:p-5 print:flex-col print:gap-4">
          <!-- QR Code -->
          <div class="flex-shrink-0">
            <div class="flex h-32 w-32 items-center justify-center rounded-lg border border-deep-navy/20 bg-white print:border-deep-navy/10">
              <Qrcode
                v-if="ticket.qr_value"
                :value="ticket.qr_value"
                :width="128"
                :height="128"
                class="h-32 w-32"
              />
              <div v-else class="flex items-center justify-center text-center text-xs text-deep-navy/40">
                <span>Invalid QR</span>
              </div>
            </div>
            <p class="mt-2 text-center text-[10px] font-semibold uppercase tracking-wider text-deep-navy/60">
              Scan to verify
            </p>
          </div>

          <!-- Details -->
          <div class="flex-1 space-y-3">
            <div>
              <p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/60">Ticket Code</p>
              <p class="mt-1 break-all font-mono text-xs font-semibold text-deep-navy">
                {{ ticket.qr_display_code }}
              </p>
              <button
                v-if="canUseClipboard"
                type="button"
                @click="copyTicketCode(ticket.ticket_code)"
                class="mt-1 rounded px-2 py-0.5 text-[10px] font-semibold text-blue-600 hover:bg-blue-50"
                title="Copy ticket code"
              >
                Copy code
              </button>
            </div>

            <div>
              <p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/60">Status</p>
              <p class="mt-1 text-sm font-semibold text-deep-navy">
                {{ ticketStatusInfo(ticket.status).label }}
              </p>
            </div>

            <div>
              <p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/60">Issued</p>
              <p class="mt-1 text-sm font-semibold text-deep-navy">
                {{ formatDateTime(ticket.issued_at) }}
              </p>
            </div>

            <div v-if="ticket.url" class="pt-2">
              <NuxtLink
                :to="ticket.url"
                external
                target="_blank"
                class="inline-flex items-center gap-1 rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-blue-700 hover:bg-blue-100"
              >
                View ticket details
                <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </NuxtLink>
            </div>
          </div>
        </div>
      </article>
    </div>

    <!-- Print instructions -->
    <div class="hidden print:block rounded-xl border border-dashed border-deep-navy/20 bg-mist-blue/10 p-4 text-center text-sm text-deep-navy/70">
      <p class="font-semibold">Print each ticket separately or as a batch</p>
      <p class="mt-1 text-xs">Use browser print function (Ctrl+P or Cmd+P) to print tickets with QR codes</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAttendeeActiveTickets } from '~/composables/resources/tickets/useAttendeeTickets'
import { useFormattedTicketsForQR, getTicketStatusInfo } from '~/composables/resources/tickets/useTicketQRCode'
import { formatDateTime } from '~/utils/time'

const props = defineProps<{
  selectedAttendeeId: string
}>()

const { $notyf } = useNuxtApp()
const canUseClipboard = computed(() => typeof navigator !== 'undefined' && !!navigator.clipboard)

// Fetch active tickets for selected attendee
const ticketsQuery = useAttendeeActiveTickets(
  computed(() => props.selectedAttendeeId)
)

// Extract tickets from paginated response
const ticketsData = computed(() => ticketsQuery.data.value?.data?.results || [])

// Format tickets with QR code data
const formattedTickets = useFormattedTicketsForQR(
  computed(() => ticketsData.value)
)

function ticketStatusInfo(status: string) {
  return getTicketStatusInfo(status)
}

// Copy ticket code to clipboard
async function copyTicketCode(code: string) {
  if (!code || !canUseClipboard.value) {
    $notyf?.error('Unable to copy ticket code')
    return
  }

  try {
    await navigator.clipboard.writeText(code)
    $notyf?.success('Ticket code copied!')
  } catch (error) {
    console.error('Failed to copy ticket code', error)
    $notyf?.error('Could not copy ticket code')
  }
}
</script>

<style scoped>
@media print {
  .print\:page-break-inside-avoid {
    page-break-inside: avoid;
  }

  .print\:pb-6 {
    padding-bottom: 1.5rem;
  }

  .print\:grid-cols-1 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }

  .print\:shadow-none {
    box-shadow: none;
  }

  .print\:border-deep-navy\/5 {
    border-color: rgba(15, 23, 42, 0.05);
  }
}
</style>
