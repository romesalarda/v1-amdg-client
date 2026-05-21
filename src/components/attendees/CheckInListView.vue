<template>
  <div class="flex flex-col h-full">
    <!-- Header row -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-semibold text-deep-navy uppercase tracking-widest">Check-in Log</h3>
      <UButton
        color="gray"
        variant="ghost"
        size="xs"
        icon="i-heroicons-arrow-path"
        :loading="pending"
        @click="refresh"
      >
        Refresh
      </UButton>
    </div>

    <!-- Table -->
    <div class="flex-1 overflow-auto">
      <UTable
        :rows="rows"
        :columns="columns"
        :loading="pending"
        :empty-state="{ icon: 'i-heroicons-clipboard-document-list', label: 'No check-ins yet' }"
        class="text-sm"
      >
        <!-- Attendee column -->
        <template #attendee_display_id-data="{ row }">
          <div>
            <p class="font-semibold text-deep-navy">{{ row.attendee_display_id }}</p>
            <p class="text-xs text-gray-400">{{ row.attendee_full_name }}</p>
          </div>
        </template>

        <!-- Ticket column -->
        <template #ticket_code-data="{ row }">
          <span v-if="row.ticket_code" class="font-mono text-xs">{{ row.ticket_code }}</span>
          <span v-else class="text-gray-300">—</span>
        </template>

        <!-- Action column -->
        <template #action-data="{ row }">
          <UBadge
            :color="row.action === 'CHECK_IN' ? 'green' : 'amber'"
            variant="subtle"
            size="xs"
          >
            {{ row.action === 'CHECK_IN' ? 'In' : 'Out' }}
          </UBadge>
        </template>

        <!-- Result column -->
        <template #scan_result-data="{ row }">
          <UBadge
            :color="resultColor(row.scan_result)"
            variant="subtle"
            size="xs"
          >
            {{ resultShort(row.scan_result) }}
          </UBadge>
        </template>

        <!-- Method column -->
        <template #method-data="{ row }">
          <span class="text-xs text-gray-500">{{ methodLabel(row.method) }}</span>
        </template>

        <!-- Payments flag -->
        <template #has_outstanding_payments-data="{ row }">
          <UIcon
            v-if="row.has_outstanding_payments"
            name="i-heroicons-exclamation-triangle"
            class="w-4 h-4 text-red-500"
          />
          <span v-else class="text-gray-300">—</span>
        </template>

        <!-- Time -->
        <template #performed_at-data="{ row }">
          <span class="text-xs text-gray-400">{{ formatTime(row.performed_at) }}</span>
        </template>
      </UTable>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="mt-4 flex items-center justify-between">
      <p class="text-xs text-gray-400">
        Page {{ page }} of {{ totalPages }} &middot; {{ totalCount }} records
      </p>
      <UPagination
        v-model="page"
        :total="totalCount"
        :page-count="pageSize"
        size="xs"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CheckInResponse } from '~/api/types.gen'
import { checkinsList } from '~/api/sdk.gen'

interface Props {
  /** Filter by event UUID */
  eventId?: string
  /** Auto-refresh when new WS broadcasts arrive */
  refreshTrigger?: number
}

const props = defineProps<Props>()

// ── State ─────────────────────────────────────────────────────────────────

const page = ref(1)
const pageSize = 25
const totalCount = ref(0)
const rows = ref<CheckInResponse[]>([])
const pending = ref(false)
const error = ref<Error | null>(null)

const totalPages = computed(() => Math.ceil(totalCount.value / pageSize))

// ── Table columns ─────────────────────────────────────────────────────────

const columns = [
  { key: 'attendee_display_id', label: 'Attendee' },
  { key: 'ticket_code', label: 'Ticket' },
  { key: 'action', label: 'Action' },
  { key: 'scan_result', label: 'Result' },
  { key: 'method', label: 'Method' },
  { key: 'has_outstanding_payments', label: 'Payments' },
  { key: 'performed_at', label: 'Time' },
]

// ── Data fetching ─────────────────────────────────────────────────────────

async function refresh() {
  pending.value = true
  error.value = null
  try {
    const res = await checkinsList({
      query: {
        event: props.eventId,
        page: page.value,
        page_size: pageSize,
        ordering: '-performed_at',
      },
    })
    if (res.data) {
      rows.value = res.data.results
      totalCount.value = res.data.count
    }
  } catch (e) {
    error.value = e instanceof Error ? e : new Error('Failed to load check-ins')
  } finally {
    pending.value = false
  }
}

// Refetch on page change
watch(page, refresh)

// Refetch when WS trigger fires (new broadcast arrived)
watch(() => props.refreshTrigger, refresh)

// Refetch when event changes
watch(() => props.eventId, () => {
  page.value = 1
  refresh()
}, { immediate: true })

// ── Helpers ───────────────────────────────────────────────────────────────

function resultColor(result: string) {
  if (result === 'SUCCESS') return 'green'
  if (result === 'ALREADY_CHECKED_IN' || result === 'ALREADY_CHECKED_OUT') return 'amber'
  if (['CANCELLED_ATTENDEE', 'CANCELLED_TICKET', 'INVALID_TICKET', 'NOT_FOUND', 'ERROR'].includes(result)) return 'red'
  if (result === 'OUTSTANDING_PAYMENTS') return 'orange'
  return 'gray'
}

function resultShort(result: string) {
  const map: Record<string, string> = {
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
  return map[result] ?? result
}

function methodLabel(method: string) {
  return { QR_CODE: 'QR', MANUAL: 'Manual', ADMIN: 'Admin' }[method] ?? method
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
</script>
