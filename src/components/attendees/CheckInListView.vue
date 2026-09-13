<template>
  <div class="flex flex-col h-full">

    <!-- ── Tab Switcher ──────────────────────────────────────────────── -->
    <div v-if="eventIdentifier" class="px-5 pt-4 pb-0 flex items-center gap-1">
      <button
        class="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors"
        :class="activeTab === 'log' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
        @click="activeTab = 'log'"
      >
        <UIcon name="i-heroicons-clipboard-document-list" class="w-3.5 h-3.5 inline -mt-0.5 mr-1" />
        Log
      </button>
      <button
        class="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors"
        :class="activeTab === 'roster' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
        @click="activeTab = 'roster'"
      >
        <UIcon name="i-heroicons-users" class="w-3.5 h-3.5 inline -mt-0.5 mr-1" />
        Attendees
      </button>
      <button
        class="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors"
        :class="activeTab === 'statistics' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
        @click="activeTab = 'statistics'"
      >
        <UIcon name="i-heroicons-chart-bar" class="w-3.5 h-3.5 inline -mt-0.5 mr-1" />
        Statistics
      </button>
    </div>

    <!-- ── Roster view ────────────────────────────────────────────────── -->
    <div v-if="activeTab === 'roster' && eventIdentifier" class="flex flex-col flex-1 min-h-0">
      <!-- Bulk action toolbar for roster -->
      <div v-if="eventId" class="px-5 py-2 border-b border-gray-100 flex items-center gap-2 flex-wrap">
        <span class="text-xs font-semibold text-gray-500 mr-1">Bulk Actions:</span>
        <button
          class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors flex items-center gap-1.5"
          @click="openBulkAction('check_in')"
        >
          <UIcon name="i-heroicons-arrow-right-circle" class="w-3.5 h-3.5" />
          Check In All
        </button>
        <button
          class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors flex items-center gap-1.5"
          @click="openBulkAction('check_out')"
        >
          <UIcon name="i-heroicons-arrow-left-circle" class="w-3.5 h-3.5" />
          Check Out All
        </button>
      </div>
      <AttendeeRosterTable
        ref="rosterTableRef"
        :event-identifier="eventIdentifier"
        class="flex-1 min-h-0"
        @select-attendee="(p) => emit('select-attendee', p)"
      />
    </div>

    <!-- ── Statistics view ───────────────────────────────────────────── -->
    <div v-if="activeTab === 'statistics' && eventId" class="flex-1 overflow-auto p-4">
      <AttendanceStatsView :query-params="{ event_id: eventId }" />
    </div>

    <!-- ── Log view (original content) ──────────────────────────────── -->
    <template v-if="activeTab === 'log'">

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
          <button
            v-if="eventId"
            class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center gap-1.5"
            @click="openBulkAction('delete_logs')"
          >
            <UIcon name="i-heroicons-trash" class="w-3.5 h-3.5" />
            Delete Logs
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
    <div v-if="totalPages > 1" class="mt-4 flex items-center justify-between p-5">
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

    </template><!-- end log tab -->
  </div>

  <!-- Bulk action confirmation modal -->
  <UModal v-model="showBulkConfirmModal">
    <div class="p-6 space-y-4">
      <div class="flex items-start gap-3">
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          :class="{
            'bg-green-100': pendingBulkAction === 'check_in',
            'bg-amber-100': pendingBulkAction === 'check_out',
            'bg-red-100': pendingBulkAction === 'delete_logs',
          }"
        >
          <UIcon
            :name="
              pendingBulkAction === 'check_in'
                ? 'i-heroicons-arrow-right-circle'
                : pendingBulkAction === 'check_out'
                  ? 'i-heroicons-arrow-left-circle'
                  : 'i-heroicons-trash'
            "
            class="w-5 h-5"
            :class="{
              'text-green-600': pendingBulkAction === 'check_in',
              'text-amber-600': pendingBulkAction === 'check_out',
              'text-red-600': pendingBulkAction === 'delete_logs',
            }"
          />
        </div>
        <div>
          <h3 class="text-sm font-bold text-gray-900">
            <template v-if="pendingBulkAction === 'check_in'">Bulk Check In All Attendees</template>
            <template v-else-if="pendingBulkAction === 'check_out'">Bulk Check Out All Attendees</template>
            <template v-else>Delete Check-in Logs</template>
          </h3>
          <p class="text-xs text-gray-500 mt-1">
            <template v-if="pendingBulkAction === 'check_in'">
              This will mark all non-cancelled attendees as checked in. An audit record will be created for each.
            </template>
            <template v-else-if="pendingBulkAction === 'check_out'">
              This will mark all non-cancelled attendees as checked out. An audit record will be created for each.
            </template>
            <template v-else>
              Permanently delete check-in log records for this event. This cannot be undone.
            </template>
          </p>
        </div>
      </div>

      <div v-if="pendingBulkAction === 'delete_logs'" class="space-y-3">
        <div>
          <label class="text-xs font-semibold text-gray-700 block mb-2">Deletion scope</label>
          <div class="flex flex-wrap gap-2">
            <button
              class="px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors"
              :class="deleteLogsMode === 'specific' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'"
              @click="deleteLogsMode = 'specific'"
            >
              Specific Date
            </button>
            <button
              class="px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors"
              :class="deleteLogsMode === 'range' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'"
              @click="deleteLogsMode = 'range'"
            >
              Date Range
            </button>
            <button
              class="px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors"
              :class="deleteLogsMode === 'all' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-red-600 border-red-200 hover:bg-red-50'"
              @click="deleteLogsMode = 'all'"
            >
              Delete All
            </button>
          </div>
        </div>

        <div v-if="deleteLogsMode === 'specific'" class="space-y-2">
          <label class="text-xs font-semibold text-gray-700 block">Choose a date with logs</label>
          <select
            v-model="deleteSpecificDate"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">Select date...</option>
            <option v-for="date in logDates" :key="date" :value="date">
              {{ formatDateLabel(date) }}
            </option>
          </select>
          <div class="flex items-center justify-between">
            <p class="text-xs text-gray-400">
              Loaded {{ logDates.length }} of {{ logDatesTotal }} distinct log dates.
            </p>
            <button
              v-if="canLoadMoreLogDates"
              class="px-2 py-1 text-[11px] font-semibold rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              :disabled="isLogDatesLoading"
              @click="loadMoreLogDates"
            >
              <template v-if="isLogDatesLoading">Loading...</template>
              <template v-else>Load more</template>
            </button>
          </div>
        </div>

        <div v-else-if="deleteLogsMode === 'range'" class="space-y-2">
          <label class="text-xs font-semibold text-gray-700 block">Choose date range</label>
          <DateRangePicker
            v-model:model-value-start="deleteRangeStart"
            v-model:model-value-end="deleteRangeEnd"
          >
            <template #default="{ label, active }">
              <button
                type="button"
                class="w-full px-3 py-2 text-sm border rounded-lg text-left transition-colors"
                :class="active ? 'border-primary text-primary bg-primary/5' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'"
              >
                {{ label }}
              </button>
            </template>
          </DateRangePicker>
          <p class="text-xs text-gray-400">
            Tip: set only an end date to delete all past logs up to that date.
          </p>
        </div>

        <p v-else class="text-xs text-gray-500">
          This will permanently remove all check-in logs for the current event.
        </p>
      </div>

      <div class="flex justify-end gap-3 pt-2">
        <button
          class="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          :disabled="bulkActionLoading"
          @click="showBulkConfirmModal = false"
        >
          Cancel
        </button>
        <button
          class="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors flex items-center gap-2"
          :class="{
            'bg-green-600 hover:bg-green-700': pendingBulkAction === 'check_in',
            'bg-amber-600 hover:bg-amber-700': pendingBulkAction === 'check_out',
            'bg-red-600 hover:bg-red-700': pendingBulkAction === 'delete_logs',
            'opacity-60 cursor-not-allowed': bulkActionLoading,
          }"
          :disabled="bulkActionLoading || isDeleteActionInvalid"
          @click="executeBulkAction"
        >
          <UIcon v-if="bulkActionLoading" name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
          <template v-if="pendingBulkAction === 'check_in'">Check In All</template>
          <template v-else-if="pendingBulkAction === 'check_out'">Check Out All</template>
          <template v-else>Delete Logs</template>
        </button>
      </div>
    </div>
  </UModal>
</template>

<script setup lang="ts">
import type { CheckInResponse } from '~/api/types.gen'
import { checkinsBulkStatusCreate, checkinsList } from '~/api/sdk.gen'
import AttendeeRosterTable from '~/components/attendees/AttendeeRosterTable.vue'
import DateRangePicker from '~/components/ui/DateRangePicker.vue'
import { useBulkDeleteCheckInLogs, type BulkDeleteMode } from '~/composables/attendee/useBulkDeleteCheckInLogs'
import { useCheckInLogDates } from '~/composables/attendee/useCheckInLogDates'
import AttendanceStatsView from '~/pages/events/[id]/m/participants/statistics/attendance.vue'

interface Props {
  /** Filter by event UUID */
  eventId?: string
  /** URL-safe event identifier (slug) for the attendee roster WebSocket */
  eventIdentifier?: string
  /** Auto-refresh when new WS broadcasts arrive */
  refreshTrigger?: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'select-attendee': [payload: { attendee_id: string; attendee_full_name: string }]
}>()

// ── Tab state ─────────────────────────────────────────────────────────────

const activeTab = ref<'log' | 'roster' | 'statistics'>('log')
const rosterTableRef = ref<InstanceType<typeof AttendeeRosterTable> | null>(null)

// ── State ─────────────────────────────────────────────────────────────────

const page = ref(1)
const pageSize = 5
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

// ── Bulk actions ──────────────────────────────────────────────────────────

const pendingBulkAction = ref<'check_in' | 'check_out' | 'delete_logs' | null>(null)
const showBulkConfirmModal = ref(false)
const deleteLogsMode = ref<BulkDeleteMode>('specific')
const deleteSpecificDate = ref('')
const deleteRangeStart = ref('')
const deleteRangeEnd = ref('')
const bulkActionLoading = ref(false)

const toast = useToast()
const bulkDeleteLogs = useBulkDeleteCheckInLogs()
const {
  dates: logDates,
  total: logDatesTotal,
  isLoading: isLogDatesLoading,
  canLoadMore: canLoadMoreLogDates,
  refresh: refreshLogDates,
  loadMore: loadMoreLogDates,
} = useCheckInLogDates(() => props.eventId)

const isDeleteActionInvalid = computed(() => {
  if (pendingBulkAction.value !== 'delete_logs') return false
  if (deleteLogsMode.value === 'specific') return !deleteSpecificDate.value
  if (deleteLogsMode.value === 'range') return !deleteRangeStart.value && !deleteRangeEnd.value
  return false
})

function formatDateLabel(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function openBulkAction(action: 'check_in' | 'check_out' | 'delete_logs') {
  pendingBulkAction.value = action
  deleteLogsMode.value = 'specific'
  deleteSpecificDate.value = ''
  deleteRangeStart.value = ''
  deleteRangeEnd.value = ''

  if (action === 'delete_logs') {
    refreshLogDates()
  }

  showBulkConfirmModal.value = true
}

async function executeBulkAction() {
  if (!pendingBulkAction.value || !props.eventId) return
  bulkActionLoading.value = true
  try {
    if (pendingBulkAction.value === 'check_in' || pendingBulkAction.value === 'check_out') {
      await checkinsBulkStatusCreate({
        body: {
          event: props.eventId,
          action: pendingBulkAction.value === 'check_in' ? 'CHECK_IN' : 'CHECK_OUT',
        },
        throwOnError: true,
      })
      toast.add({
        title: pendingBulkAction.value === 'check_in' ? 'Bulk check-in complete' : 'Bulk check-out complete',
        description: 'Attendee statuses have been updated.',
        color: 'green',
      })

      // Force the roster table to reflect the new statuses immediately
      await rosterTableRef.value?.refetch()
      page.value = 1
      refresh()
    } else {
      if (isDeleteActionInvalid.value) return

      const result = await bulkDeleteLogs.execute(props.eventId, {
        mode: deleteLogsMode.value,
        date: deleteSpecificDate.value || undefined,
        date_from: deleteRangeStart.value || undefined,
        date_to: deleteRangeEnd.value || undefined,
      })

      toast.add({
        title: 'Logs deleted',
        description: `${result.deleted} check-in log${result.deleted === 1 ? '' : 's'} removed.`,
        color: 'green',
      })

      await refreshLogDates()
      // Refresh the log tab
      page.value = 1
      refresh()
    }
    showBulkConfirmModal.value = false
  } catch (err: any) {
    toast.add({
      title: 'Action failed',
      description: err?.data?.detail ?? 'An error occurred. Please try again.',
      color: 'red',
    })
  } finally {
    bulkActionLoading.value = false
  }
}
</script>
