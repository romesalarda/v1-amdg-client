<template>
  <EventManagementLayout :event-id="id" :event="event?.data">
    <div class="space-y-6">
      <!-- Tab Navigation -->
      <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-1.5">
        <div class="flex gap-1">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'flex-1 px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-200',
              activeTab === tab.id
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            ]"
          >
            <div class="flex items-center justify-center gap-2">
              <span class="material-symbols-outlined text-lg">{{ tab.icon }}</span>
              <span>{{ tab.label }}</span>
              <UBadge
                v-if="tab.count !== undefined"
                :color="activeTab === tab.id ? 'white' : 'primary'"
                variant="soft"
                size="xs"
              >
                {{ tab.count }}
              </UBadge>
            </div>
          </button>
        </div>
      </div>

      <!-- Payments Tab -->
      <div v-if="activeTab === 'payments'" class="space-y-6">
        <!-- Statistics Cards -->
        <div class="grid grid-cols-5 gap-4">
          <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span class="material-symbols-outlined text-green-600">payments</span>
              </div>
              <div>
                <div class="text-2xl font-black text-deep-navy">
                  {{ formatCurrency(stats.totalRevenue) }}
                </div>
                <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Total Revenue</div>
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
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span class="material-symbols-outlined text-blue-600">undo</span>
              </div>
              <div>
                <div class="text-2xl font-black text-deep-navy">{{ stats.refundedCount }}</div>
                <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                  Refunded ({{ formatCurrency(stats.refundedAmount) }})
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <span class="material-symbols-outlined text-red-600">error</span>
              </div>
              <div>
                <div class="text-2xl font-black text-deep-navy">{{ stats.failedCount }}</div>
                <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Failed/Cancelled</div>
              </div>
            </div>
          </div>

          <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <span class="material-symbols-outlined text-purple-600">account_balance</span>
              </div>
              <div>
                <div class="text-xs text-gray-500 mb-1">Payment Methods</div>
                <div class="text-xs space-y-0.5">
                  <div class="flex justify-between">
                    <span>Stripe:</span>
                    <span class="font-semibold">{{ stats.methodBreakdown.stripe }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Bank:</span>
                    <span class="font-semibold">{{ stats.methodBreakdown.bank }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Cash:</span>
                    <span class="font-semibold">{{ stats.methodBreakdown.cash }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Table Section -->
        <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <!-- Table Header & Toolbar -->
          <div class="px-6 py-4 border-b border-gray-100 space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-primary">payments</span>
                <div>
                  <h2 class="text-sm font-black text-primary uppercase tracking-widest">Payment Transactions</h2>
                  <p class="text-xs text-gray-500">
                    Showing {{ ((paymentsCurrentPage - 1) * paymentsPageSize) + 1 }} to {{ Math.min(paymentsCurrentPage * paymentsPageSize, paymentsTotalCount) }} of {{ paymentsTotalCount }} payments
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <button
                  @click="showPaymentFilters = !showPaymentFilters"
                  :class="[
                    'px-4 py-2 text-sm font-semibold rounded-xl transition-colors flex items-center gap-2',
                    showPaymentFilters || activeFiltersCount > 0 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  ]"
                >
                  <span class="material-symbols-outlined text-lg">{{ showPaymentFilters ? 'filter_list_off' : 'filter_list' }}</span>
                  Filters
                  <UBadge v-if="activeFiltersCount > 0" color="white" variant="solid" size="xs">
                    {{ activeFiltersCount }}
                  </UBadge>
                </button>
                <button
                  @click="exportPaymentsCSV"
                  class="px-4 py-2 text-sm font-semibold rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <span class="material-symbols-outlined text-lg">download</span>
                  Export CSV
                </button>
              </div>
            </div>

            <!-- Bulk Actions Toolbar -->
            <div v-if="selectedPayments.size > 0" class="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div class="flex items-center justify-between">
                <span class="text-sm font-semibold text-blue-900">
                  {{ selectedPayments.size }} payment(s) selected
                </span>
                <div class="flex items-center gap-2">
                  <button
                    @click="bulkMarkCompleted"
                    :disabled="bulkActionLoading"
                    class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-1"
                  >
                    <span class="material-symbols-outlined text-sm">check_circle</span>
                    Mark Completed
                  </button>
                  <button
                    @click="bulkMarkFailed"
                    :disabled="bulkActionLoading"
                    class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-1"
                  >
                    <span class="material-symbols-outlined text-sm">error</span>
                    Mark Failed
                  </button>
                  <button
                    @click="bulkCancel"
                    :disabled="bulkActionLoading"
                    class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50 transition-colors flex items-center gap-1"
                  >
                    <span class="material-symbols-outlined text-sm">cancel</span>
                    Cancel
                  </button>
                  <button
                    @click="clearSelection"
                    class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            </div>

            <!-- Search & Quick Filters -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div class="relative">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                <input
                  v-model="paymentsSearchQuery"
                  type="text"
                  placeholder="Search by reference, user email, or payment ID..."
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                />
              </div>

              <div class="flex gap-2">
                <button
                  @click="toggleQuickFilter('pending_verification')"
                  :class="[
                    'px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5',
                    quickFilters.pending_verification
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  ]"
                >
                  <span class="material-symbols-outlined text-sm">pending_actions</span>
                  Pending Verification
                  <UBadge v-if="stats.pendingVerificationCount" color="amber" variant="soft" size="xs">
                    {{ stats.pendingVerificationCount }}
                  </UBadge>
                </button>

                <button
                  @click="toggleQuickFilter('has_refunds')"
                  :class="[
                    'px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5',
                    quickFilters.has_refunds
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  ]"
                >
                  <span class="material-symbols-outlined text-sm">undo</span>
                  Has Refunds
                </button>
              </div>
            </div>

            <!-- Advanced Filters Panel -->
            <div v-if="showPaymentFilters" class="pt-4 border-t border-gray-100">
              <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <!-- Status Filter -->
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-2">Status</label>
                  <select
                    v-model="paymentFilters.status"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="">All Statuses</option>
                    <option value="DRAFTING">Drafting</option>
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="FAILED">Failed</option>
                    <option value="PENDING_REFUND">Pending Refund</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                </div>

                <!-- Payment Method Filter -->
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-2">Payment Method</label>
                  <select
                    v-model="paymentFilters.method_type"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="">All Methods</option>
                    <option value="STRIPE">Stripe</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CASH">Cash</option>
                  </select>
                </div>

                <!-- Date Range -->
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-2">From Date</label>
                  <input
                    v-model="paymentFilters.date_from"
                    type="date"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-2">To Date</label>
                  <input
                    v-model="paymentFilters.date_to"
                    type="date"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <!-- Amount Range -->
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-2">Min Amount (£)</label>
                  <input
                    v-model.number="paymentFilters.amount_min"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-2">Max Amount (£)</label>
                  <input
                    v-model.number="paymentFilters.amount_max"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="999999.99"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <!-- Has Refunds Filter -->
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-2">Refund Status</label>
                  <select
                    v-model="paymentFilters.has_refunds"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="">All</option>
                    <option value="true">Has Refunds</option>
                    <option value="false">No Refunds</option>
                  </select>
                </div>

                <!-- Filter Actions -->
                <div class="flex items-end gap-2">
                  <button
                    @click="clearPaymentFilters"
                    class="flex-1 px-4 py-2 text-sm font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Table Content -->
          <div class="overflow-x-auto">
            <table v-if="!paymentsLoading && payments.length > 0" class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      :checked="isAllSelected"
                      @change="toggleSelectAll"
                      class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Reference
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    User
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Amount
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Method
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
                  v-for="payment in payments"
                  :key="payment.payment_id"
                  class="hover:bg-gray-50 transition-colors"
                >
                  <td class="px-4 py-3">
                    <input
                      type="checkbox"
                      :checked="selectedPayments.has(payment.payment_id)"
                      @change="togglePaymentSelection(payment.payment_id)"
                      class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                  </td>
                  <td class="px-4 py-3">
                    <div class="font-mono text-sm font-semibold text-gray-900">
                      {{ payment.payment_reference }}
                    </div>
                  </td>
                  <td class="px-4 py-3">
                    <div class="text-sm text-gray-900">
                      {{ formatDate(payment.created_at) }}
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ formatTime(payment.created_at) }}
                    </div>
                  </td>
                  <td class="px-4 py-3">
                    <div class="text-sm font-medium text-gray-900">
                      {{ payment.user_name || 'N/A' }}
                    </div>
                  </td>
                  <td class="px-4 py-3">
                    <div class="text-sm font-semibold text-gray-900">
                      {{ payment.amount }}
                    </div>
                  </td>
                  <td class="px-4 py-3">
                    <div class="text-sm text-gray-900">
                      {{ payment.method_title ||  'N/A' }}
                    </div>
                  </td>
                  <td class="px-4 py-3">
                    <UBadge
                      :color="(getPaymentStatusColor(payment.status || 'PENDING') as any)"
                      variant="soft"
                      size="sm"
                    >
                      {{ getPaymentStatusLabel(payment.status || 'PENDING') }}
                    </UBadge>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center justify-end gap-1">
                      <button
                        @click="viewPaymentDetails(payment)"
                        class="p-1.5 text-gray-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <span class="material-symbols-outlined text-lg">visibility</span>
                      </button>
                      <button
                        v-if="payment.status === 'PENDING' && payment.method_title?.toLowerCase().includes('bank')"
                        @click="openVerifyBankTransfer(payment)"
                        class="p-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Verify Bank Transfer"
                      >
                        <span class="material-symbols-outlined text-lg">verified</span>
                      </button>
                      <button
                        v-if="payment.status === 'COMPLETED'"
                        @click="initiateRefund(payment)"
                        class="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Initiate Refund"
                      >
                        <span class="material-symbols-outlined text-lg">undo</span>
                      </button>
                      <button
                        @click="viewPaymentTickets(payment)"
                        class="p-1.5 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                        title="View Tickets"
                      >
                        <span class="material-symbols-outlined text-lg">confirmation_number</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Loading State -->
            <div v-if="paymentsLoading" class="p-6 space-y-3">
              <div v-for="i in 10" :key="i" class="h-16 bg-gray-100 rounded-lg animate-pulse" />
            </div>

            <!-- Empty State -->
            <div v-if="!paymentsLoading && payments.length === 0" class="p-12 text-center">
              <span class="material-symbols-outlined text-6xl text-gray-300 mb-4 block">payments</span>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">No payments found</h3>
              <p class="text-sm text-gray-500 mb-4">
                {{ paymentsSearchQuery || activeFiltersCount > 0 ? 'Try adjusting your filters or search query' : 'No payment transactions recorded yet' }}
              </p>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="!paymentsLoading && payments.length > 0" class="px-6 py-4 border-t border-gray-100">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <label class="text-xs text-gray-600">Rows per page:</label>
                <select
                  v-model="paymentsPageSize"
                  class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option :value="10">10</option>
                  <option :value="25">25</option>
                  <option :value="50">50</option>
                  <option :value="100">100</option>
                </select>
              </div>

              <div class="flex items-center gap-4">
                <span class="text-xs text-gray-500">
                  Showing {{ ((paymentsCurrentPage - 1) * paymentsPageSize) + 1 }} to {{ Math.min(paymentsCurrentPage * paymentsPageSize, paymentsTotalCount) }} of {{ paymentsTotalCount }}
                </span>
                <div class="flex items-center gap-1">
                  <button
                    @click="paymentsCurrentPage = 1"
                    :disabled="paymentsCurrentPage === 1"
                    class="p-2 text-gray-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span class="material-symbols-outlined text-lg">first_page</span>
                  </button>
                  <button
                    @click="paymentsCurrentPage--"
                    :disabled="paymentsCurrentPage === 1"
                    class="p-2 text-gray-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span class="material-symbols-outlined text-lg">chevron_left</span>
                  </button>
                  <span class="px-4 py-2 text-sm font-medium text-gray-700">
                    Page {{ paymentsCurrentPage }} of {{ totalPages }}
                  </span>
                  <button
                    @click="paymentsCurrentPage++"
                    :disabled="paymentsCurrentPage >= totalPages"
                    class="p-2 text-gray-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span class="material-symbols-outlined text-lg">chevron_right</span>
                  </button>
                  <button
                    @click="paymentsCurrentPage = totalPages"
                    :disabled="paymentsCurrentPage >= totalPages"
                    class="p-2 text-gray-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span class="material-symbols-outlined text-lg">last_page</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Donations Tab -->
      <div v-if="activeTab === 'donations'">
        <DonationsTab :event-id="id" />
      </div>

      <!-- Refunds Tab -->
      <div v-if="activeTab === 'refunds'">
        <RefundsTab :event-id="id" />
      </div>

      <!-- Statistics Tab -->
      <div v-if="activeTab === 'statistics'">
        <StatisticsIndex />
      </div>
    </div>

    <!-- Payment Detail Modal -->
    <PaymentDetailModal
      v-if="selectedPayment"
      :payment="selectedPayment"
      :open="showPaymentDetailModal"
      @close="closePaymentDetailModal"
      @refund="initiateRefund"
      @verify="openVerifyBankTransfer"
    />

    <!-- Bank Transfer Verification Modal -->
    <BankTransferVerifyModal
      v-if="paymentToVerify"
      :payment="paymentToVerify"
      :open="showVerifyModal"
      @close="closeVerifyModal"
      @verified="handleVerificationComplete"
    />

    <!-- Refund Request Modal -->
    <RefundRequestModal
      v-if="paymentToRefund"
      :payment="paymentToRefund"
      :open="showRefundModal"
      @close="closeRefundModal"
      @created="handleRefundCreated"
    />
  </EventManagementLayout>
</template>

<script setup lang="ts">
import { useEvent } from '~/composables/resources/events/events'
import {
  usePayments,
  useCancelPayment,
  useMarkPaymentCompleted,
  useMarkPaymentFailed,
} from '~/composables/resources/payments/payments'
import { usePaymentMethods } from '~/composables/resources/payments/paymentMethods'
import {
  getPaymentStatusLabel,
  getPaymentStatusColor,
} from '~/schemas/events/paymentConstants'
import { paymentMethodTypeLabels } from '~/schemas/events/paymentConfig'
import EventManagementLayout from '~/components/events/EventManagementLayout.vue'
import PaymentDetailModal from '~/components/events/modals/PaymentDetailModal.vue'
import BankTransferVerifyModal from '~/components/events/modals/BankTransferVerifyModal.vue'
import RefundRequestModal from '~/components/events/modals/RefundRequestModal.vue'
import DonationsTab from '~/components/events/payments/DonationsTab.vue'
import RefundsTab from '~/components/events/payments/RefundsTab.vue'
import Swal from 'sweetalert2'

// Lazy load statistics component
const StatisticsIndex = defineAsyncComponent(() => import('./statistics/index.vue'))

definePageMeta({
  layout: false,
})

const route = useRoute()
const toast = useToast()
const id = computed(() => String(route.params.id))

// Fetch event data
const { data: event } = useEvent(id)

// Tab state
const activeTab = ref('payments')
const tabs = computed(() => [
  {
    id: 'payments',
    label: 'Payments',
    icon: 'payments',
    count: paymentsTotalCount.value,
  },
  {
    id: 'donations',
    label: 'Donations',
    icon: 'favorite',
    count: undefined,
  },
  {
    id: 'refunds',
    label: 'Refunds',
    icon: 'undo',
    count: undefined,
  },
  {
    id: 'statistics',
    label: 'Statistics',
    icon: 'bar_chart',
    count: undefined,
  },
])

// Payments state
const paymentsCurrentPage = ref(1)
const paymentsPageSize = ref(25)
const paymentsSearchQuery = ref('')
const showPaymentFilters = ref(false)
const selectedPayments = ref<Set<string>>(new Set())
const bulkActionLoading = ref(false)

// Quick filters
const quickFilters = reactive({
  pending_verification: false,
  has_refunds: false,
})

// Advanced filters
const paymentFilters = reactive({
  status: '',
  method_type: '',
  date_from: '',
  date_to: '',
  amount_min: null as number | null,
  amount_max: null as number | null,
  has_refunds: '',
})

// Computed query params for API
const paymentsQueryParams = computed(() => {
  const params: any = {
    event__event_id: route.params.id as string,
    page: paymentsCurrentPage.value,
    page_size: paymentsPageSize.value,
  }

  if (paymentsSearchQuery.value) {
    params.search = paymentsSearchQuery.value
  }

  if (paymentFilters.status) {
    params.status = paymentFilters.status
  }

  if (paymentFilters.method_type) {
    params.method__method_type = paymentFilters.method_type
  }

  if (paymentFilters.date_from) {
    params.created_at__gte = paymentFilters.date_from
  }

  if (paymentFilters.date_to) {
    params.created_at__lte = paymentFilters.date_to
  }

  if (paymentFilters.amount_min !== null) {
    params.modified_amount__gte = paymentFilters.amount_min
  }

  if (paymentFilters.amount_max !== null) {
    params.modified_amount__lte = paymentFilters.amount_max
  }

  if (paymentFilters.has_refunds) {
    params.has_refunds = paymentFilters.has_refunds === 'true'
  }

  // Quick filters
  if (quickFilters.pending_verification) {
    params.status = 'PENDING'
    params.method__method_type = 'BANK_TRANSFER'
  }

  if (quickFilters.has_refunds) {
    params.has_refunds = true
  }

  return params
})

// Fetch payments
const { data: paymentsData, isLoading: paymentsLoading, refetch: refetchPayments } = usePayments(paymentsQueryParams)

const payments = computed(() => paymentsData.value?.data?.results || [])
const paymentsTotalCount = computed(() => paymentsData.value?.data?.count || 0)
const totalPages = computed(() => Math.ceil(paymentsTotalCount.value / paymentsPageSize.value))

// Mutations
const cancelPaymentMutation = useCancelPayment()
const markCompletedMutation = useMarkPaymentCompleted()
const markFailedMutation = useMarkPaymentFailed()

// Stats calculations
const stats = computed(() => {
  const allPayments = payments.value

  const completed = allPayments.filter((p: any) => p.status === 'COMPLETED')
  const pending = allPayments.filter((p: any) => p.status === 'PENDING')
  const refunded = allPayments.filter((p: any) => p.status === 'REFUNDED' || p.status === 'PENDING_REFUND')
  const failed = allPayments.filter((p: any) => p.status === 'FAILED' || p.status === 'CANCELLED')

  const pendingVerification = allPayments.filter(
    (p: any) => p.status === 'PENDING' && p.method?.method_type === 'BANK_TRANSFER'
  )

  const totalRevenue = completed.reduce((sum: number, p: any) => {
    return sum + parseFloat(p.modified_amount || '0')
  }, 0)

  const pendingAmount = pending.reduce((sum: number, p: any) => {
    return sum + parseFloat(p.modified_amount || '0')
  }, 0)

  const refundedAmount = refunded.reduce((sum: number, p: any) => {
    return sum + parseFloat(p.modified_amount || '0')
  }, 0)

  // Method breakdown
  const methodBreakdown = {
    stripe: allPayments.filter((p: any) => p.method?.method_type === 'STRIPE').length,
    bank: allPayments.filter((p: any) => p.method?.method_type === 'BANK_TRANSFER').length,
    cash: allPayments.filter((p: any) => p.method?.method_type === 'CASH').length,
  }

  return {
    totalRevenue,
    pendingCount: pending.length,
    pendingAmount,
    refundedCount: refunded.length,
    refundedAmount,
    failedCount: failed.length,
    pendingVerificationCount: pendingVerification.length,
    methodBreakdown,
  }
})

// Active filters count
const activeFiltersCount = computed(() => {
  let count = 0
  if (paymentFilters.status) count++
  if (paymentFilters.method_type) count++
  if (paymentFilters.date_from) count++
  if (paymentFilters.date_to) count++
  if (paymentFilters.amount_min !== null) count++
  if (paymentFilters.amount_max !== null) count++
  if (paymentFilters.has_refunds) count++
  return count
})

// Selection helpers
const isAllSelected = computed(() => {
  return payments.value.length > 0 && payments.value.every((p: any) => selectedPayments.value.has(p.payment_id))
})

function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedPayments.value.clear()
  } else {
    payments.value.forEach((p: any) => selectedPayments.value.add(p.payment_id))
  }
}

function togglePaymentSelection(paymentId: string) {
  if (selectedPayments.value.has(paymentId)) {
    selectedPayments.value.delete(paymentId)
  } else {
    selectedPayments.value.add(paymentId)
  }
}

function clearSelection() {
  selectedPayments.value.clear()
}

// Quick filter toggle
function toggleQuickFilter(filter: keyof typeof quickFilters) {
  quickFilters[filter] = !quickFilters[filter]
}

// Clear filters
function clearPaymentFilters() {
  paymentFilters.status = ''
  paymentFilters.method_type = ''
  paymentFilters.date_from = ''
  paymentFilters.date_to = ''
  paymentFilters.amount_min = null
  paymentFilters.amount_max = null
  paymentFilters.has_refunds = ''
  quickFilters.pending_verification = false
  quickFilters.has_refunds = false
}

// Bulk actions
async function bulkMarkCompleted() {
  const result = await Swal.fire({
    title: 'Mark as Completed?',
    text: `Mark ${selectedPayments.value.size} payment(s) as completed?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, mark completed',
    cancelButtonText: 'Cancel',
  })

  if (!result.isConfirmed) return

  bulkActionLoading.value = true
  let successCount = 0
  let failCount = 0

  for (const paymentId of selectedPayments.value) {
    try {
      await markCompletedMutation.mutateAsync(paymentId)
      successCount++
    } catch (error) {
      failCount++
    }
  }

  bulkActionLoading.value = false
  clearSelection()
  refetchPayments()

  toast.add({
    title: 'Bulk Action Complete',
    description: `${successCount} succeeded, ${failCount} failed`,
    color: failCount > 0 ? 'amber' : 'green',
  })
}

async function bulkMarkFailed() {
  const result = await Swal.fire({
    title: 'Mark as Failed?',
    text: `Mark ${selectedPayments.value.size} payment(s) as failed?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, mark failed',
    cancelButtonText: 'Cancel',
  })

  if (!result.isConfirmed) return

  bulkActionLoading.value = true
  let successCount = 0
  let failCount = 0

  for (const paymentId of selectedPayments.value) {
    try {
      await markFailedMutation.mutateAsync(paymentId)
      successCount++
    } catch (error) {
      failCount++
    }
  }

  bulkActionLoading.value = false
  clearSelection()
  refetchPayments()

  toast.add({
    title: 'Bulk Action Complete',
    description: `${successCount} succeeded, ${failCount} failed`,
    color: failCount > 0 ? 'amber' : 'green',
  })
}

async function bulkCancel() {
  const result = await Swal.fire({
    title: 'Cancel Payments?',
    text: `Cancel ${selectedPayments.value.size} payment(s)?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, cancel',
    cancelButtonText: 'No',
  })

  if (!result.isConfirmed) return

  bulkActionLoading.value = true
  let successCount = 0
  let failCount = 0

  for (const paymentId of selectedPayments.value) {
    try {
      await cancelPaymentMutation.mutateAsync(paymentId)
      successCount++
    } catch (error) {
      failCount++
    }
  }

  bulkActionLoading.value = false
  clearSelection()
  refetchPayments()

  toast.add({
    title: 'Bulk Action Complete',
    description: `${successCount} succeeded, ${failCount} failed`,
    color: failCount > 0 ? 'amber' : 'green',
  })
}

// Modal state
const showPaymentDetailModal = ref(false)
const selectedPayment = ref<any>(null)
const showVerifyModal = ref(false)
const paymentToVerify = ref<any>(null)
const showRefundModal = ref(false)
const paymentToRefund = ref<any>(null)

function viewPaymentDetails(payment: any) {
  selectedPayment.value = payment
  showPaymentDetailModal.value = true
}

function closePaymentDetailModal() {
  showPaymentDetailModal.value = false
  selectedPayment.value = null
}

function openVerifyBankTransfer(payment: any) {
  paymentToVerify.value = payment
  showVerifyModal.value = true
}

function closeVerifyModal() {
  showVerifyModal.value = false
  paymentToVerify.value = null
}

function handleVerificationComplete() {
  closeVerifyModal()
  refetchPayments()
  toast.add({
    title: 'Bank transfer verified',
    description: 'Payment has been verified and tickets created',
    color: 'green',
  })
}

function initiateRefund(payment: any) {
  paymentToRefund.value = payment
  showRefundModal.value = true
}

function closeRefundModal() {
  showRefundModal.value = false
  paymentToRefund.value = null
}

function handleRefundCreated() {
  closeRefundModal()
  refetchPayments()
  toast.add({
    title: 'Refund request created',
    description: 'Refund request has been submitted for review',
    color: 'green',
  })
}

function viewPaymentTickets(payment: any) {
  // Navigate to tickets page with filter for this payment
  navigateTo(`/events/${id.value}/m/participants/dashboard?payment=${payment.payment_id}`)
}

// Export CSV
function exportPaymentsCSV() {
  const csvData = payments.value.map((p: any) => ({
    Reference: p.payment_reference,
    Date: formatDate(p.created_at),
    Time: formatTime(p.created_at),
    User: p.user?.username || 'N/A',
    Email: p.user?.email || 'N/A',
    Amount: parseFloat(p.modified_amount || '0').toFixed(2),
    Method: getMethodTypeLabel(p.method?.method_type),
    Status: getPaymentStatusLabel(p.status),
    'Bank Reference': p.bank_transfer_reference || '',
    'Stripe Intent': p.stripe_payment_intent || '',
  }))

  const csv = [
    Object.keys(csvData[0] || {}).join(','),
    ...csvData.map((row) => Object.values(row).join(',')),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `payments-${event.value?.data?.display_code || 'export'}-${new Date().toISOString()}.csv`
  a.click()
  URL.revokeObjectURL(url)

  toast.add({
    title: 'CSV Downloaded',
    description: `Exported ${csvData.length} payment records`,
    color: 'green',
  })
}

// Utility functions
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

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function getMethodTypeLabel(methodType: string): string {
  return paymentMethodTypeLabels[methodType as keyof typeof paymentMethodTypeLabels] || methodType
}

// Watch page size changes to reset to page 1
watch(paymentsPageSize, () => {
  paymentsCurrentPage.value = 1
})

// Watch search query with debounce
watch(paymentsSearchQuery, () => {
  paymentsCurrentPage.value = 1
})
</script>