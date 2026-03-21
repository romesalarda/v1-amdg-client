<template>
  <div class="p-6 space-y-6">
    <section class="bg-gray-50 border border-gray-200 rounded-xl p-4">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 class="text-sm font-black text-primary uppercase tracking-widest">Issued Tickets</h3>
          <p class="text-xs text-gray-500 mt-1">List of tickets for this event only</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <div class="md:col-span-2 relative">
          <UIcon name="i-heroicons-magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            v-model="ticketSearch"
            type="text"
            placeholder="Search by ticket code, attendee, booking ref"
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <select
          v-model="statusFilter"
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="USED">Used</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <select
          v-model="ticketPageSize"
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option :value="10">10 per page</option>
          <option :value="25">25 per page</option>
          <option :value="50">50 per page</option>
          <option :value="100">100 per page</option>
        </select>
      </div>

      <div v-if="ticketsLoading" class="space-y-2">
        <div v-for="i in 8" :key="`t-skeleton-${i}`" class="h-12 bg-gray-100 rounded-lg animate-pulse" />
      </div>

      <div v-else-if="tickets.length === 0" class="text-center py-8">
        <UIcon name="i-heroicons-ticket" class="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p class="text-sm font-semibold text-gray-700">No tickets found</p>
        <p class="text-xs text-gray-500 mt-1">Try adjusting search filters or wait for new bookings.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-gray-200 bg-white">
              <th class="py-2 px-3 font-semibold text-gray-700">Code</th>
              <th class="py-2 px-3 font-semibold text-gray-700">Attendee</th>
              <th class="py-2 px-3 font-semibold text-gray-700">Type</th>
              <th class="py-2 px-3 font-semibold text-gray-700">Status</th>
              <th class="py-2 px-3 font-semibold text-gray-700">Usage</th>
              <th class="py-2 px-3 font-semibold text-gray-700">Issued</th>
              <th class="py-2 px-3 font-semibold text-gray-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="ticket in tickets"
              :key="ticket.ticket_id"
              class="border-b border-gray-100 bg-white"
            >
              <td class="py-2 px-3 font-mono text-xs text-gray-900">{{ ticket.ticket_code }}</td>
              <td class="py-2 px-3 text-gray-700">{{ ticket.attendee_name }}</td>
              <td class="py-2 px-3 text-gray-600">{{ ticket.ticket_type_title }}</td>
              <td class="py-2 px-3">
                <UBadge :color="statusBadgeColor(ticket.status)" variant="soft" size="xs">
                  {{ ticket.status_display }}
                </UBadge>
              </td>
              <td class="py-2 px-3 text-gray-600">{{ ticket.uses ?? 0 }}</td>
              <td class="py-2 px-3 text-gray-600 text-xs">{{ formatDateTime(ticket.issued_at) }}</td>
              <td class="py-2 px-3">
                <div class="flex items-center justify-end gap-1">
                  <UButton
                    size="xs"
                    variant="ghost"
                    color="gray"
                    icon="i-heroicons-eye"
                    @click="openTicketDetail(ticket.ticket_id)"
                  >
                    View
                  </UButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="ticketsTotal > 0" class="mt-4 flex flex-wrap items-center justify-between gap-3">
        <span class="text-xs text-gray-500">
          Showing {{ rangeStart }} to {{ rangeEnd }} of {{ ticketsTotal }} tickets
        </span>
        <UPagination
          v-model="ticketPage"
          :page-count="ticketPageSize"
          :total="ticketsTotal"
          :max="7"
        />
      </div>
    </section>

    <UModal v-model="showTicketDetailModal" :ui="{ width: 'sm:max-w-3xl' }">
      <div class="p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-sm font-black text-primary uppercase tracking-widest">Ticket Detail</h3>
            <p class="text-xs text-gray-500 mt-1">Detailed ticket information and management</p>
          </div>
          <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" @click="showTicketDetailModal = false" />
        </div>

        <div v-if="selectedTicketLoading" class="space-y-3">
          <div v-for="i in 5" :key="`detail-skeleton-${i}`" class="h-10 bg-gray-100 rounded-lg animate-pulse" />
        </div>

        <div v-else-if="selectedTicket" class="space-y-4 text-sm">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="p-3 rounded-lg bg-gray-50 border border-gray-200">
              <p class="text-xs text-gray-500 uppercase font-semibold">Status</p>
              <div class="mt-1">
                <UBadge :color="statusBadgeColor(selectedTicket.status)" variant="soft" size="sm">
                  {{ selectedTicket.status_display }}
                </UBadge>
              </div>
            </div>
            <div class="p-3 rounded-lg bg-gray-50 border border-gray-200">
              <p class="text-xs text-gray-500 uppercase font-semibold">Issued At</p>
              <p class="font-semibold text-gray-900 mt-1">{{ formatDateTime(selectedTicket.issued_at) }}</p>
            </div>
          </div>

          <div class="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <div class="flex items-center justify-between gap-2">
              <p class="text-xs text-slate-300 uppercase font-semibold">Ticket Code</p>
              <UButton
                size="2xs"
                variant="ghost"
                class="bg-white"
                color="gray"
                icon="i-heroicons-clipboard"
                @click="copyToClipboard(selectedTicket.ticket_code, 'Ticket code copied')"
              >
                Copy
              </UButton>
            </div>
            <p class="font-mono text-xs text-slate-100 mt-2 break-all leading-relaxed">{{ selectedTicket.ticket_code }}</p>
          </div>

          <div class="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <div class="flex items-center justify-between gap-2">
              <p class="text-xs text-slate-300 uppercase font-semibold">Booking Reference</p>
              <UButton
                size="2xs"
                variant="ghost"
                color="gray"
                class="bg-white"
                icon="i-heroicons-clipboard"
                :disabled="!selectedTicket.booking_reference"
                @click="copyToClipboard(selectedTicket.booking_reference || '', 'Booking reference copied')"
              >
                Copy
              </UButton>
            </div>
            <p class="font-mono text-xs text-slate-100 mt-2 break-all leading-relaxed">{{ selectedTicket.booking_reference || 'N/A' }}</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="p-3 rounded-lg bg-gray-50 border border-gray-200">
              <p class="text-xs text-gray-500 uppercase font-semibold">Attendee</p>
              <p class="font-semibold text-gray-900 mt-1">{{ selectedTicket.attendee_name }}</p>
              <p class="text-xs text-gray-500 mt-1">ID: {{ selectedTicket.attendee }}</p>
              <NuxtLink
                :to="attendeeLink"
                class="inline-flex mt-2 text-xs font-semibold text-primary hover:text-primary/80"
              >
                Open attendee in participants view
              </NuxtLink>
            </div>
            <div class="p-3 rounded-lg bg-gray-50 border border-gray-200">
              <p class="text-xs text-gray-500 uppercase font-semibold">Ticket Type</p>
              <p class="font-semibold text-gray-900 mt-1">{{ selectedTicket.ticket_type_title }}</p>
              <NuxtLink
                :to="`/events/${props.eventId}/m/booking?ticket-id=${selectedTicket.ticket_type}`"
                class="inline-flex mt-2 text-xs font-semibold text-primary hover:text-primary/80"
              >
                View ticket type
              </NuxtLink>
            </div>
            <div class="p-3 rounded-lg bg-gray-50 border border-gray-200">
              <p class="text-xs text-gray-500 uppercase font-semibold">Usage Count</p>
              <p class="font-semibold text-gray-900 mt-1">{{ selectedTicket.uses ?? 0 }}</p>
            </div>
            <div class="p-3 rounded-lg bg-gray-50 border border-gray-200">
              <p class="text-xs text-gray-500 uppercase font-semibold">Package</p>
              <p class="font-semibold text-gray-900 mt-1">{{ selectedTicket.package_name || 'N/A' }}</p>
            </div>
          </div>
        </div>

        <div v-if="selectedTicket" class="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
          <span class="text-xs text-gray-500">Ticket management</span>
          <UButton
            size="sm"
            color="red"
            icon="i-heroicons-no-symbol"
            :disabled="selectedTicket.status !== 'ACTIVE' || disableTicketMutation.isPending.value"
            @click="disableSelectedTicket"
          >
            Disable Ticket
          </UButton>
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import Swal from 'sweetalert2'
import type { TicketDetail, TicketList } from '~/api/types.gen'
import { useBookingTickets, useBookingTicket, usePartialUpdateBookingTicket } from '~/composables/resources/booking/bookingTickets'

const router = useRouter()

const props = defineProps<{
  eventId: string
}>()

const toast = useToast()

const ticketSearch = ref('')
const statusFilter = ref<'ACTIVE' | 'USED' | 'CANCELLED' | ''>('')
const ticketPage = ref(1)
const ticketPageSize = ref(25)

const showTicketDetailModal = ref(false)
const selectedTicketId = ref('')

const ticketQuery = computed(() => ({
  event: props.eventId,
  page: ticketPage.value,
  page_size: ticketPageSize.value,
  search: ticketSearch.value || undefined,
  status: statusFilter.value ? [statusFilter.value] : undefined,
}))

const { data: ticketsData, isLoading: ticketsLoading, refetch: refetchTickets } = useBookingTickets(ticketQuery)
const { data: selectedTicketData, isLoading: selectedTicketLoading, refetch: refetchSelectedTicket } = useBookingTicket(computed(() => selectedTicketId.value))
const disableTicketMutation = usePartialUpdateBookingTicket()

const tickets = computed(() => (ticketsData.value?.data?.results || []) as TicketList[])
const ticketsTotal = computed(() => ticketsData.value?.data?.count || 0)
const selectedTicket = computed(() => selectedTicketData.value?.data as TicketDetail | undefined)
const rangeStart = computed(() => (ticketsTotal.value === 0 ? 0 : ((ticketPage.value - 1) * ticketPageSize.value) + 1))
const rangeEnd = computed(() => Math.min(ticketPage.value * ticketPageSize.value, ticketsTotal.value))
const attendeeLink = computed(() => {
  const name = selectedTicket.value?.attendee_name || ''
  const search = encodeURIComponent(name)
  return `/events/${props.eventId}/m/participants/dashboard?view=attendees&search=${search}`
})

watch(ticketSearch, () => {
  ticketPage.value = 1
})

watch(statusFilter, () => {
  ticketPage.value = 1
})

watch(ticketPageSize, () => {
  ticketPage.value = 1
})

function formatDateTime(value?: string | null): string {
  if (!value) return 'N/A'
  return new Date(value).toLocaleString()
}

function statusBadgeColor(status: TicketList['status']) {
  if (status === 'ACTIVE') return 'green'
  if (status === 'USED') return 'blue'
  return 'gray'
}

function openTicketDetail(ticketId: string) {
  selectedTicketId.value = ticketId
  showTicketDetailModal.value = true
}

async function copyToClipboard(value: string, successTitle: string) {
  if (!value) {
    return
  }

  try {
    await navigator.clipboard.writeText(value)
    toast.add({
      title: successTitle,
      color: 'green',
    })
  } catch {
    toast.add({
      title: 'Could not copy value',
      color: 'red',
    })
  }
}

async function disableSelectedTicket() {
  if (!selectedTicket.value) {
    return
  }

  const result = await Swal.fire({
    title: 'Disable this ticket?',
    text: 'The ticket status will be changed to cancelled.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Disable',
    cancelButtonText: 'Keep Active',
  })

  if (!result.isConfirmed) {
    return
  }

  try {
    await disableTicketMutation.mutateAsync({
      ticketId: selectedTicket.value.ticket_id,
      body: { status: 'CANCELLED' },
    })

    toast.add({
      title: 'Ticket disabled',
      color: 'green',
    })

    await Promise.all([refetchTickets(), refetchSelectedTicket()])
  } catch (error) {
    toast.add({
      title: 'Unable to disable ticket',
      description: error instanceof Error ? error.message : 'Ticket update endpoint is not available for this environment.',
      color: 'red',
    })
  }
}
</script>
