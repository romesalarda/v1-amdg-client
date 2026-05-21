<template>
  <div class="flex flex-col h-full">
    <!-- Toolbar header (payment-table style) -->
    <div class="p-5 border-b border-gray-100 mb-0">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <UIcon name="i-heroicons-clipboard-document-list" class="w-5 h-5 text-primary" />
          <div>
            <h2 class="text-sm font-black text-primary uppercase tracking-widest">Check-in Log</h2>
            <p class="text-xs text-gray-500">
              <template v-if="totalCount > 0">
                Showing {{ (page - 1) * pageSize + 1 }}–{{ Math.min(page * pageSize, totalCount) }} of {{ totalCount }}
              </template>
              <template v-else>No records</template>
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button
            class="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            :class="
              showFilters || activeTableFilterCount > 0
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            "
            @click="showFilters = !showFilters"
          >
            <UIcon name="i-heroicons-funnel" class="w-3.5 h-3.5" />
            Filters
            <UBadge v-if="activeTableFilterCount > 0" color="white" variant="solid" size="xs">
              {{ activeTableFilterCount }}
            </UBadge>
          </button>
          <button
            class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-1.5"
            :class="{ 'opacity-60': pending }"
            :disabled="pending"
            @click="refresh"
          >
            <UIcon name="i-heroicons-arrow-path" class="w-3.5 h-3.5" :class="{ 'animate-spin': pending }" />
            Refresh
          </button>
        </div>
      </div>

      <!-- Collapsible filter drawer -->
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 max-h-0"
        enter-to-class="opacity-100 max-h-40"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 max-h-40"
        leave-to-class="opacity-0 max-h-0"
      >
        <div v-if="showFilters" class="mt-3 flex flex-wrap items-end gap-3 overflow-hidden">
          <!-- Action filter -->
          <div>
            <label class="text-xs font-semibold text-gray-600 mb-1 block">Action</label>
            <select
              v-model="tableFilters.action"
              class="px-2 py-1.5 border border-gray-300 rounded-lg text-xs bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">All actions</option>
              <option value="CHECK_IN">Check In</option>
              <option value="CHECK_OUT">Check Out</option>
            </select>
          </div>

          <!-- Scan result filter -->
          <div>
            <label class="text-xs font-semibold text-gray-600 mb-1 block">Result</label>
            <select
              v-model="tableFilters.scan_result"
              class="px-2 py-1.5 border border-gray-300 rounded-lg text-xs bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">All results</option>
              <option value="SUCCESS">Success</option>
              <option value="ALREADY_CHECKED_IN">Already In</option>
              <option value="ALREADY_CHECKED_OUT">Already Out</option>
              <option value="INVALID_TICKET">Invalid</option>
              <option value="CANCELLED_ATTENDEE">Cancelled</option>
              <option value="OUTSTANDING_PAYMENTS">Unpaid</option>
              <option value="NOT_FOUND">Not Found</option>
            </select>
          </div>

          <!-- Method filter -->
          <div>
            <label class="text-xs font-semibold text-gray-600 mb-1 block">Method</label>
            <select
              v-model="tableFilters.method"
              class="px-2 py-1.5 border border-gray-300 rounded-lg text-xs bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">All methods</option>
              <option value="QR_CODE">QR Code</option>
              <option value="MANUAL">Manual</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <button
            v-if="activeTableFilterCount > 0"
            class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            @click="clearTableFilters"
          >
            Clear
          </button>
        </div>
      </Transition>
    </div>

    <!-- Table -->
    <div class="flex-1 overflow-auto">
      <UTable
        :rows="rows"
        :columns="columns"
        :loading="pending"
        :empty-state="{ icon: 'i-heroicons-clipboard-document-list', label: 'No check-ins yet' }"
        class="text-sm"
        :ui="{ tr: { base: 'cursor-pointer hover:bg-primary/5 transition-colors' } }"
        @select="handleRowSelect"
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
          <span v-if="row.ticket_code" class="font-mono text-xs">{{ row.ticket_code.slice(row.ticket_code.length-8, row.ticket_code.length) }}</span>
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

const emit = defineEmits<{
  'select-attendee': [payload: { attendee_id: string; attendee_full_name: string }]
}>()

// ── State ─────────────────────────────────────────────────────────────────

const page = ref(1)
const pageSize = 25
const totalCount = ref(0)
const rows = ref<CheckInResponse[]>([])
const pending = ref(false)
const error = ref<Error | null>(null)

const totalPages = computed(() => Math.ceil(totalCount.value / pageSize))

// ── Filter / UI state ──────────────────────────────────────────────────────

const showFilters = ref(false)

const tableFilters = reactive({
  action: '',
  scan_result: '',
  method: '',
})

const activeTableFilterCount = computed(
  () => [tableFilters.action, tableFilters.scan_result, tableFilters.method].filter(Boolean).length,
)

function clearTableFilters() {
  tableFilters.action = ''
  tableFilters.scan_result = ''
  tableFilters.method = ''
}

// Re-fetch when filters change (reset to page 1)
watch(tableFilters, () => {
  page.value = 1
  refresh()
})

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

// ── Row click ──────────────────────────────────────────────────────────────

function handleRowSelect(row: CheckInResponse) {
  const uuid = (row as any).attendee_uuid as string | undefined
  if (!uuid) return
  emit('select-attendee', {
    attendee_id: uuid,
    attendee_full_name: row.attendee_full_name ?? '',
  })
}

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
        ...(tableFilters.action ? { action: tableFilters.action } : {}),
        ...(tableFilters.scan_result ? { scan_result: tableFilters.scan_result } : {}),
        ...(tableFilters.method ? { method: tableFilters.method } : {}),
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
