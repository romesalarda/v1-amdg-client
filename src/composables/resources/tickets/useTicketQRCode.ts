/**
 * Composable for formatting ticket data with QR code information
 *
 * Combines ticket details with QR code generation and formatting
 * Used by TicketsTab component to display tickets with QR codes
 */

import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import type { TicketDetail, TicketList } from '~/api/types.gen'
import { formatTicketCode } from '~/composables/qrcode/useQRCode'

type TicketLike = TicketDetail | TicketList

export interface TicketWithQRCode {
  ticket_id: string
  ticket_code: string
  attendee_name: string
  attendee_id: string
  status: 'ACTIVE' | 'CANCELLED' | 'USED'
  issued_at: string
  qr_value: string
  qr_display_code: string
  qr_valid: boolean
  url?: string
}

/**
 * Format a single ticket for QR code display
 *
 * @param ticket - Ticket detail object from API
 * @returns Formatted ticket with QR code information
 *
 * @example
 * const ticket = { ticket_code: 'TKT-...', ticket_id: '...', ... }
 * const formatted = formatTicketForQR(ticket)
 * // Returns: { ...ticket, qr_value: 'TKT-...', qr_display_code: '...' }
 */
export function formatTicketForQR(ticket: TicketLike): TicketWithQRCode {
  const qr_value = ticket.ticket_code || ticket.ticket_id || ''
  const qr_valid = Boolean(qr_value)

  return {
    ticket_id: ticket.ticket_id,
    ticket_code: ticket.ticket_code,
    attendee_name: ticket.attendee_name || '',
    attendee_id: String(ticket.attendee || ''),
    status: ticket.status as 'ACTIVE' | 'CANCELLED' | 'USED',
    issued_at: ticket.issued_at,
    qr_value,
    qr_display_code: formatTicketCode(qr_value, 'readable'),
    qr_valid,
    url: ticket._links?.self,
  }
}

/**
 * Transform a list of tickets into QR-ready format
 *
 * @param tickets - Array of ticket objects from API
 * @returns Array of formatted tickets with QR information
 *
 * @example
 * const response = await bookingsTicketsList(...)
 * const formatted = formatTicketsForQR(response.data?.results || [])
 */
export function formatTicketsForQR(tickets: TicketLike[]): TicketWithQRCode[] {
  if (!Array.isArray(tickets)) return []
  return tickets.map(formatTicketForQR)
}

/**
 * Composable for reactive ticket QR code formatting
 *
 * Takes a reactive ticket and returns formatted ticket data
 * with QR code values and display formatting
 *
 * @param ticket - Computed or ref containing ticket data
 * @returns Computed TicketWithQRCode with all QR fields populated
 *
 * @example
 * const { data: ticketData } = useTicketDetail(ticketId)
 * const qrTicket = useFormattedTicketForQR(ticketData)
 *
 * // In template:
 * <div v-if="qrTicket">
 *   <NuxtQrcode :value="qrTicket.qr_value" />
 *   <p>{{ qrTicket.qr_display_code }}</p>
 * </div>
 */
export function useFormattedTicketForQR(
  ticket: ComputedRef<TicketDetail | undefined>
): ComputedRef<TicketWithQRCode | null> {
  return computed(() => {
    if (!ticket.value) return null
    return formatTicketForQR(ticket.value)
  })
}

/**
 * Composable for reactive list of tickets with QR codes
 *
 * Takes a reactive list of tickets and formats them for QR display
 *
 * @param tickets - Computed or ref containing array of tickets
 * @returns Computed array of TicketWithQRCode objects
 *
 * @example
 * const { data: ticketsData } = useAttendeeTickets(attendeeId)
 * const qrTickets = useFormattedTicketsForQR(
 *   computed(() => ticketsData.value?.data?.results || [])
 * )
 *
 * // In template:
 * <div v-for="ticket in qrTickets" :key="ticket.ticket_id">
 *   <TicketCard :ticket="ticket" />
 * </div>
 */
export function useFormattedTicketsForQR(
  tickets: ComputedRef<TicketLike[] | undefined>
): ComputedRef<TicketWithQRCode[]> {
  return computed(() => {
    if (!tickets.value) return []
    return formatTicketsForQR(tickets.value)
  })
}

/**
 * Get display information for a ticket status badge
 *
 * @param status - Ticket status ('ACTIVE' | 'CANCELLED' | 'USED')
 * @returns Object with badge color classes and label
 *
 * @example
 * const { badgeClass, label } = getTicketStatusInfo('ACTIVE')
 * // Returns: { badgeClass: 'bg-green-100 text-green-700', label: 'Active' }
 */
export function getTicketStatusInfo(status: string): {
  badgeClass: string
  label: string
  icon: string
} {
  const statusMap: Record<string, { badgeClass: string; label: string; icon: string }> = {
    ACTIVE: {
      badgeClass: 'bg-green-100 text-green-700 border border-green-300',
      label: 'Active',
      icon: '✓',
    },
    USED: {
      badgeClass: 'bg-blue-100 text-blue-700 border border-blue-300',
      label: 'Used',
      icon: '✔',
    },
    CANCELLED: {
      badgeClass: 'bg-red-100 text-red-700 border border-red-300',
      label: 'Cancelled',
      icon: '✕',
    },
  }

  return statusMap[status.toUpperCase()] || {
    badgeClass: 'bg-gray-100 text-gray-700 border border-gray-300',
    label: 'Unknown',
    icon: '?',
  }
}

/**
 * Filter and sort tickets for display
 *
 * @param tickets - List of tickets to filter
 * @param options - Filter options
 * @returns Filtered and sorted tickets
 *
 * @example
 * const filtered = filterTicketsForDisplay(tickets, {
 *   status: 'ACTIVE',
 *   sortBy: 'issued_at'
 * })
 */
export function filterTicketsForDisplay(
  tickets: TicketWithQRCode[],
  options?: {
    status?: 'ACTIVE' | 'CANCELLED' | 'USED' | 'ALL'
    sortBy?: 'issued_at' | 'ticket_code'
  }
) {
  let filtered = [...tickets]

  // Filter by status
  if (options?.status && options.status !== 'ALL') {
    filtered = filtered.filter(t => t.status === options.status)
  }

  // Sort
  if (options?.sortBy === 'ticket_code') {
    filtered.sort((a, b) => a.ticket_code.localeCompare(b.ticket_code))
  } else {
    // Default: sort by issued_at descending (newest first)
    filtered.sort((a, b) => new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime())
  }

  return filtered
}
