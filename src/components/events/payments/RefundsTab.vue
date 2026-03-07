<template>
  <div class="space-y-6">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <span class="material-symbols-outlined text-blue-600">undo</span>
          </div>
          <div>
            <div class="text-2xl font-black text-deep-navy">{{ stats.totalCount }}</div>
            <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Total Refunds</div>
          </div>
        </div>
      </div>

      <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <span class="material-symbols-outlined text-amber-600">pending</span>
          </div>
          <div>
            <div class="text-2xl font-black text-deep-navy">{{ stats.pendingCount }}</div>
            <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">
              Pending ({{ formatCurrency(stats.pendingAmount) }})
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <span class="material-symbols-outlined text-green-600">check_circle</span>
          </div>
          <div>
            <div class="text-2xl font-black text-deep-navy">{{ stats.processedCount }}</div>
            <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">
              Processed ({{ formatCurrency(stats.processedAmount) }})
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <span class="material-symbols-outlined text-red-600">cancel</span>
          </div>
          <div>
            <div class="text-2xl font-black text-deep-navy">{{ stats.rejectedCount }}</div>
            <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Rejected</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Section -->
    <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
      <!-- Header & Toolbar -->
      <div class="px-6 py-4 border-b border-gray-100 space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-primary">undo</span>
            <div>
              <h2 class="text-sm font-black text-primary uppercase tracking-widest">Refund Requests</h2>
              <p class="text-xs text-gray-500">
                Showing {{ ((currentPage - 1) * pageSize) + 1 }} to {{ Math.min(currentPage * pageSize, totalCount) }} of {{ totalCount }} refunds
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              @click="showFilters = !showFilters"
              :class="[
                'px-4 py-2 text-sm font-semibold rounded-xl transition-colors flex items-center gap-2',
                showFilters ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              <span class="material-symbols-outlined text-lg">{{ showFilters ? 'filter_list_off' : 'filter_list' }}</span>
              Filters
            </button>
          </div>
        </div>

        <!-- Search & Filters -->
        <div class="space-y-3">
          <div class="relative">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by tracking reference or reason..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
            />
          </div>

          <div v-if="showFilters" class="grid grid-cols-1 lg:grid-cols-4 gap-4 pt-3 border-t border-gray-100">
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-2">Status</label>
              <select
                v-model="filters.status"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending Review</option>
                <option value="VERIFIED">Verified</option>
                <option value="REJECTED">Rejected</option>
                <option value="PROCESSED">Processed</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-2">From Date</label>
              <input
                v-model="filters.date_from"
                type="date"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-2">To Date</label>
              <input
                v-model="filters.date_to"
                type="date"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div class="flex items-end">
              <button
                @click="clearFilters"
                class="w-full px-4 py-2 text-sm font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Table Content -->
      <div class="overflow-x-auto">
        <table v-if="!isLoading && refunds.length > 0" class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Reference
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Payment
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Amount
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Reason
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Requested By/Date
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="refund in refunds"
              :key="refund.refund_id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-4 py-3">
                <div class="font-mono text-sm font-semibold text-gray-900">
                  {{ refund.tracking_reference }}
                </div>
              </td>
              <td class="px-4 py-3">
                <button
                  @click="viewPayment({ payment_id: refund.payment })"
                  class="text-xs text-blue-600 hover:text-blue-700 hover:underline font-mono"
                >
                  {{ refund.payment_reference || 'N/A' }}
                </button>
              </td>
              <td class="px-4 py-3">
                <div class="text-sm font-semibold text-blue-600">
                  £{{ parseFloat(refund.amount || '0').toFixed(2) }}
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="text-sm text-gray-900 max-w-xs truncate">
                  Refund requested
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="text-sm font-medium text-gray-900">
                  {{ refund.requested_by_name || 'N/A' }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ formatDate(refund.requested_at) }}
                </div>
              </td>
              <td class="px-4 py-3">
                <UBadge
                  :color="(getRefundStatusColor(refund.verification_status || 'pending') as any)"
                  variant="soft"
                  size="sm"
                >
                  {{ getRefundStatusLabel(refund.verification_status || 'pending') }}
                </UBadge>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1">
                  <button
                    v-if="refund.verification_status === 'pending'"
                    @click="openVerifyModal(refund, true)"
                    class="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                    title="Verify & Approve"
                  >
                    <span class="material-symbols-outlined text-lg">check_circle</span>
                  </button>
                  <button
                    v-if="refund.verification_status === 'pending'"
                    @click="openVerifyModal(refund, false)"
                    class="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title="Reject"
                  >
                    <span class="material-symbols-outlined text-lg">cancel</span>
                  </button>
                  <button
                    v-if="refund.verification_status === 'verified'"
                    @click="processRefund(refund)"
                    class="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Process Refund"
                  >
                    <span class="material-symbols-outlined text-lg">play_arrow</span>
                  </button>
                  <button
                    @click="viewRefundDetails(refund)"
                    class="p-1.5 text-gray-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <span class="material-symbols-outlined text-lg">visibility</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Loading State -->
        <div v-if="isLoading" class="p-6 space-y-3">
          <div v-for="i in 5" :key="i" class="h-16 bg-gray-100 rounded-lg animate-pulse" />
        </div>

        <!-- Empty State -->
        <div v-if="!isLoading && refunds.length === 0" class="p-12 text-center">
          <span class="material-symbols-outlined text-6xl text-gray-300 mb-4 block">undo</span>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">No refund requests found</h3>
          <p class="text-sm text-gray-500 mb-4">
            {{ searchQuery || filters.status ? 'Try adjusting your filters' : 'No refund requests have been made yet' }}
          </p>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="!isLoading && refunds.length > 0" class="px-6 py-4 border-t border-gray-100">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <label class="text-xs text-gray-600">Rows per page:</label>
            <select
              v-model="pageSize"
              class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
            </select>
          </div>

          <div class="flex items-center gap-4">
            <span class="text-xs text-gray-500">
              Showing {{ ((currentPage - 1) * pageSize) + 1 }} to {{ Math.min(currentPage * pageSize, totalCount) }} of {{ totalCount }}
            </span>
            <div class="flex items-center gap-1">
              <button
                @click="currentPage--"
                :disabled="currentPage === 1"
                class="p-2 text-gray-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span class="material-symbols-outlined text-lg">chevron_left</span>
              </button>
              <span class="px-4 py-2 text-sm font-medium text-gray-700">
                Page {{ currentPage }} of {{ totalPages }}
              </span>
              <button
                @click="currentPage++"
                :disabled="currentPage >= totalPages"
                class="p-2 text-gray-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span class="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Verify/Reject Modal -->
    <VerifyRefundModal
      v-if="selectedRefund"
      :refund="selectedRefund"
      :approve="isApproving"
      :open="showVerifyModal"
      @close="closeVerifyModal"
      @completed="handleVerifyCompleted"
    />

    <!-- Refund Details Modal -->
    <RefundDetailModal
      v-if="refundForDetails"
      :refund="refundForDetails"
      :open="showDetailModal"
      @close="closeDetailModal"
    />
  </div>
</template>

<script setup lang="ts">
import {
  usePaymentRefunds,
  useProcessPaymentRefund,
} from '~/composables/resources/payments/paymentRefunds'
import {
  getRefundStatusLabel,
  getRefundStatusColor,
} from '~/schemas/events/paymentConstants'
import VerifyRefundModal from './modals/VerifyRefundModal.vue'
import RefundDetailModal from './modals/RefundDetailModal.vue'
import Swal from 'sweetalert2'

interface Props {
  eventId: string
}

const props = defineProps<Props>()

const toast = useToast()

// State
const currentPage = ref(1)
const pageSize = ref(25)
const searchQuery = ref('')
const showFilters = ref(false)
const filters = reactive({
  status: '',
  date_from: '',
  date_to: '',
})

// Modal state
const showVerifyModal = ref(false)
const showDetailModal = ref(false)
const selectedRefund = ref<any>(null)
const refundForDetails = ref<any>(null)
const isApproving = ref(true)

// Query params
const queryParams = computed(() => {
  const params: any = {
    payment__event__event_id: props.eventId,
    page: currentPage.value,
    page_size: pageSize.value,
  }

  if (searchQuery.value) {
    params.search = searchQuery.value
  }

  if (filters.status) {
    params.status = filters.status
  }

  if (filters.date_from) {
    params.requested_at__gte = filters.date_from
  }

  if (filters.date_to) {
    params.requested_at__lte = filters.date_to
  }

  return params
})

// Fetch refunds
const { data: refundsData, isLoading, refetch } = usePaymentRefunds(queryParams)

const refunds = computed(() => refundsData.value?.data?.results || [])
const totalCount = computed(() => refundsData.value?.data?.count || 0)
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))

// Mutations
const processMutation = useProcessPaymentRefund()

// Stats
const stats = computed(() => {
  const allRefunds = refunds.value
  const pending = allRefunds.filter((r: any) => r.status === 'PENDING')
  const processed = allRefunds.filter((r: any) => r.status === 'PROCESSED')
  const rejected = allRefunds.filter((r: any) => r.status === 'REJECTED')

  const pendingAmount = pending.reduce((sum: number, r: any) => {
    return sum + parseFloat(r.amount || '0')
  }, 0)

  const processedAmount = processed.reduce((sum: number, r: any) => {
    return sum + parseFloat(r.amount || '0')
  }, 0)

  return {
    totalCount: allRefunds.length,
    pendingCount: pending.length,
    pendingAmount,
    processedCount: processed.length,
    processedAmount,
    rejectedCount: rejected.length,
  }
})

// Actions
function openVerifyModal(refund: any, approve: boolean) {
  selectedRefund.value = refund
  isApproving.value = approve
  showVerifyModal.value = true
}

function closeVerifyModal() {
  showVerifyModal.value = false
  selectedRefund.value = null
}

function handleVerifyCompleted() {
  closeVerifyModal()
  refetch()
  toast.add({
    title: isApproving.value ? 'Refund Approved' : 'Refund Rejected',
    description: isApproving.value 
      ? 'The refund has been verified and is ready for processing' 
      : 'The refund request has been rejected',
    color: isApproving.value ? 'green' : 'amber',
  })
}

async function processRefund(refund: any) {
  const result = await Swal.fire({
    title: 'Process Refund?',
    text: `Process refund of £${parseFloat(refund.amount || '0').toFixed(2)}? This will initiate the actual refund.`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, process refund',
    cancelButtonText: 'Cancel',
  })

  if (!result.isConfirmed) return

  try {
    await processMutation.mutateAsync({
      refundId: refund.refund_id,
      body: { verification_status: 'processed' }
    })
    toast.add({
      title: 'Refund Processed',
      description: 'The refund has been processed successfully',
      color: 'green',
    })
    refetch()
  } catch (error: any) {
    toast.add({
      title: 'Processing Failed',
      description: error?.message || 'An error occurred while processing the refund',
      color: 'red',
    })
  }
}

function viewRefundDetails(refund: any) {
  refundForDetails.value = refund
  showDetailModal.value = true
}

function closeDetailModal() {
  showDetailModal.value = false
  refundForDetails.value = null
}

function viewPayment(payment: any) {
  if (payment) {
    navigateTo(`/events/${props.eventId}/m/payments/list?payment=${payment.payment_id}`)
  }
}

function clearFilters() {
  filters.status = ''
  filters.date_from = ''
  filters.date_to = ''
}

function formatCurrency(amount: number): string {
  return `£${amount.toFixed(2)}`
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

// Watch page size changes
watch(pageSize, () => {
  currentPage.value = 1
})
</script>
