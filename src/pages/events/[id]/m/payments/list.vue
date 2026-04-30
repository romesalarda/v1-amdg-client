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
                  {{ revenueOverviewLoading ? '...' : formatCurrency(eventTotalRevenue) }}
                </div>
                <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Event Total Revenue</div>
                <div class="text-xs text-gray-500 mt-1">
                  Current list: <span class="font-semibold text-deep-navy">{{ formatCurrency(stats.listRevenue) }}</span>
                </div>
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
                <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                  Failed/Cancelled ({{ formatCurrency(stats.failedAmount) }})
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                <span class="material-symbols-outlined text-violet-600">currency_exchange</span>
              </div>
              <div>
                <div class="text-2xl font-black text-deep-navy">{{ stats.partiallyRefundedCount }}</div>
                <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                  Partially Refunded ({{ formatCurrency(stats.partiallyRefundedAmount) }})
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
                  @click="showCreatePaymentModal = true"
                  class="px-4 py-2 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  <span class="material-symbols-outlined text-lg">add</span>
                  Create Payment
                </button>
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
                    @click="bulkDelete"
                    :disabled="!canBulkDelete || bulkActionLoading"
                    :title="bulkDeleteDisabledReason"
                    class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                  >
                    <span class="material-symbols-outlined text-sm">delete</span>
                    Delete (max 5)
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
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-2">Description</label>
                  <select
                    v-model="paymentFilters.descriptor"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="">All</option>
                    <option value="sponsorship">Sponsorship</option>
                    <option value="booking">Booking</option>
                    <option value="donation">Donation</option>
                    <option value="ticket">Ticket</option>
                    <option value="order">Order</option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-2">Payment ID</label>
                  <input
                    v-model="paymentFilters.payment_id"
                    type="text"
                    placeholder="pay_123"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-2">Payment Reference</label>
                  <input
                    v-model="paymentFilters.payment_reference"
                    type="text"
                    placeholder="REF-001"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
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
                    Descriptor
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
                      {{ payment.descriptor }}
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
                      {{ payment.final_amount }}
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
                        v-if="payment.status === 'DRAFTING'"
                        @click="promoteDraftToPending(payment)"
                        class="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Promote to Pending"
                      >
                        <span class="material-symbols-outlined text-lg">publish</span>
                      </button>
                      <button
                        v-if="payment.status === 'PENDING'"
                        @click="demotePendingToDrafting(payment)"
                        class="p-1.5 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Demote to Drafting"
                      >
                        <span class="material-symbols-outlined text-lg">vertical_align_bottom</span>
                      </button>
                      <button
                        v-if="payment.status === 'PENDING' && !payment.outstanding_bank_transfer_evidence"
                        @click="handlePendingVerification(payment)"
                        class="p-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                        :title="isBankTransferPayment(payment) ? 'Verify Bank Transfer' : 'Mark as Verified'"
                      >
                        <span class="material-symbols-outlined text-lg">verified</span>
                      </button>
                      <button
                        v-if="payment.status === 'COMPLETED' || payment.status == 'PARTIALLY_REFUNDED'"
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
                      <button
                        v-if="canDeletePayment(payment)"
                        @click="deleteRefundedPayment(payment)"
                        class="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Refunded Payment"
                      >
                        <span class="material-symbols-outlined text-lg">delete</span>
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
      :event-detail="event?.data"
      :open="showRefundModal"
      @close="closeRefundModal"
      @created="handleRefundCreated"
    />

    <CreatePaymentModal
      :open="showCreatePaymentModal"
      :event-id="id"
      :event-pk="event?.data?.id ?? null"
      @close="showCreatePaymentModal = false"
      @created="handlePaymentCreated"
    />
  </EventManagementLayout>
</template>

<script setup lang="ts">
import { useEvent } from '~/composables/resources/events/events'
import {
  usePayments,
  useCancelPayment,
  useDeletePayment,
  useMarkPaymentCompleted,
  useMarkPaymentFailed,
  usePartialUpdatePayment,
} from '~/composables/resources/payments/payments'
import { usePaymentOverview, useRevenueOverview } from '~/composables/statistics/payments/payment-statistics'
import {
  getPaymentStatusLabel,
  getPaymentStatusColor,
} from '~/schemas/events/paymentConstants'
import { paymentMethodTypeLabels } from '~/schemas/events/paymentConfig'
import EventManagementLayout from '~/components/events/EventManagementLayout.vue'
import PaymentDetailModal from '~/components/events/modals/PaymentDetailModal.vue'
import BankTransferVerifyModal from '~/components/events/modals/BankTransferVerifyModal.vue'
import RefundRequestModal from '~/components/events/modals/RefundRequestModal.vue'
import CreatePaymentModal from '~/components/events/payments/modals/CreatePaymentModal.vue'
import DonationsTab from '~/components/events/payments/DonationsTab.vue'
import RefundsTab from '~/components/events/payments/RefundsTab.vue'
import Swal from 'sweetalert2'

// Lazy load statistics component
const StatisticsIndex = defineAsyncComponent(() => import('./statistics/index.vue'))

definePageMeta({
  layout: false,
})

const route = useRoute()
const router = useRouter()
const toast = useToast()
const id = computed(() => String(route.params.id))

// Fetch event data
const { data: event } = useEvent(id)

// Tab state
const activeTab = ref('payments')
const validTabs = ['payments', 'donations', 'refunds', 'statistics'] as const
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
  descriptor: '',
  payment_id: '',
  payment_reference: '',
})

const syncingQuery = ref(false)
const managedQueryKeys = [
  'tab',
  'page',
  'page_size',
  'search',
  'status',
  'method_type',
  'date_from',
  'date_to',
  'amount_min',
  'amount_max',
  'has_refunds',
  'descriptor',
  'pending_verification',
  'has_refunds_quick',
  'payment_id',
  'payment_reference',
] as const

function readQueryString(value: unknown): string {
  if (Array.isArray(value)) return typeof value[0] === 'string' ? value[0] : ''
  return typeof value === 'string' ? value : ''
}

function readQueryNumber(value: unknown): number | null {
  const raw = readQueryString(value)
  if (!raw) return null
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : null
}

function normalizeQuery(query: Record<string, unknown>): Record<string, string> {
  const normalized: Record<string, string> = {}
  for (const [key, value] of Object.entries(query)) {
    if (value == null) continue
    if (Array.isArray(value)) {
      if (typeof value[0] === 'string' && value[0]) normalized[key] = value[0]
      continue
    }
    if (typeof value === 'string' && value) normalized[key] = value
  }
  return normalized
}

function applyQueryToState() {
  const tabQuery = readQueryString(route.query.tab)
  if (validTabs.includes(tabQuery as (typeof validTabs)[number])) {
    activeTab.value = tabQuery
  }

  const page = readQueryNumber(route.query.page)
  paymentsCurrentPage.value = page && page > 0 ? Math.floor(page) : 1

  const pageSize = readQueryNumber(route.query.page_size)
  paymentsPageSize.value = pageSize && pageSize > 0 ? Math.floor(pageSize) : 25

  paymentsSearchQuery.value = readQueryString(route.query.search)

  paymentFilters.status = readQueryString(route.query.status)
  paymentFilters.method_type = readQueryString(route.query.method_type)
  paymentFilters.date_from = readQueryString(route.query.date_from)
  paymentFilters.date_to = readQueryString(route.query.date_to)
  paymentFilters.has_refunds = readQueryString(route.query.has_refunds)
  paymentFilters.descriptor = readQueryString(route.query.descriptor)
  paymentFilters.payment_id = readQueryString(route.query.payment_id)
  paymentFilters.payment_reference = readQueryString(route.query.payment_reference)

  const amountMin = readQueryNumber(route.query.amount_min)
  const amountMax = readQueryNumber(route.query.amount_max)
  paymentFilters.amount_min = amountMin
  paymentFilters.amount_max = amountMax

  quickFilters.pending_verification = readQueryString(route.query.pending_verification) === 'true'
  quickFilters.has_refunds = readQueryString(route.query.has_refunds_quick) === 'true'
}

function buildManagedQueryFromState(): Record<string, string> {
  const query: Record<string, string> = {}

  if (activeTab.value && activeTab.value !== 'payments') query.tab = activeTab.value

  if (paymentsCurrentPage.value > 1) query.page = String(paymentsCurrentPage.value)
  if (paymentsPageSize.value !== 25) query.page_size = String(paymentsPageSize.value)
  if (paymentsSearchQuery.value) query.search = paymentsSearchQuery.value

  if (paymentFilters.status) query.status = paymentFilters.status
  if (paymentFilters.method_type) query.method_type = paymentFilters.method_type
  if (paymentFilters.date_from) query.date_from = paymentFilters.date_from
  if (paymentFilters.date_to) query.date_to = paymentFilters.date_to
  if (paymentFilters.amount_min !== null) query.amount_min = String(paymentFilters.amount_min)
  if (paymentFilters.amount_max !== null) query.amount_max = String(paymentFilters.amount_max)
  if (paymentFilters.has_refunds) query.has_refunds = paymentFilters.has_refunds
  if (paymentFilters.descriptor) query.descriptor = paymentFilters.descriptor
  if (paymentFilters.payment_id) query.payment_id = paymentFilters.payment_id
  if (paymentFilters.payment_reference) query.payment_reference = paymentFilters.payment_reference

  if (quickFilters.pending_verification) query.pending_verification = 'true'
  if (quickFilters.has_refunds) query.has_refunds_quick = 'true'

  return query
}

async function syncStateToQuery() {
  if (syncingQuery.value) return

  const currentQuery = normalizeQuery(route.query as Record<string, unknown>)
  const nextQuery = { ...currentQuery }

  for (const key of managedQueryKeys) {
    delete nextQuery[key]
  }

  Object.assign(nextQuery, buildManagedQueryFromState())

  const currentSerialized = JSON.stringify(Object.entries(currentQuery).sort())
  const nextSerialized = JSON.stringify(Object.entries(nextQuery).sort())
  if (currentSerialized === nextSerialized) return

  syncingQuery.value = true
  try {
    await router.replace({ query: nextQuery })
  } finally {
    syncingQuery.value = false
  }
}

// Computed query params for API
const paymentsQueryParams = computed(() => {
  const params: any = {
    event: route.params.id as string,
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

  if (paymentFilters.payment_id) {
    params.payment_id = paymentFilters.payment_id
  }

  if (paymentFilters.payment_reference) {
    params.payment_reference = paymentFilters.payment_reference
  }

  // Quick filters
  if (quickFilters.pending_verification) {
    params.status = 'PENDING'
    params.method__method_type = 'BANK_TRANSFER'
  }

  if (quickFilters.has_refunds) {
    params.has_refunds = true
  }

  if (paymentFilters.descriptor) {
    params.descriptor = paymentFilters.descriptor
  }

  return params
})

const revenueOverviewQueryParams = computed(() => ({
  event_id: id.value,
  format: 'raw' as const,
  include_deleted: false,
}))

const paymentOverviewQueryParams = computed(() => ({
  event_id: id.value,
  format: 'raw' as const,
  include_deleted: false,
}))

// Fetch payments
const { data: paymentsData, isLoading: paymentsLoading, refetch: refetchPayments } = usePayments(paymentsQueryParams)
const { data: revenueOverviewData, isLoading: revenueOverviewLoading } = useRevenueOverview(revenueOverviewQueryParams)
const { data: paymentOverviewData } = usePaymentOverview(paymentOverviewQueryParams)

const payments = computed(() => paymentsData.value?.data?.results || [])
const paymentsTotalCount = computed(() => paymentsData.value?.data?.count || 0)
const totalPages = computed(() => Math.ceil(paymentsTotalCount.value / paymentsPageSize.value))
const eventTotalRevenue = computed(() => revenueOverviewData.value?.data?.total_revenue ?? 0)
const paymentStatusBreakdown = computed<Record<string, any>>(
  () => paymentOverviewData.value?.data?.status_breakdown || {}
)

// Mutations
const cancelPaymentMutation = useCancelPayment()
const deletePaymentMutation = useDeletePayment()
const markCompletedMutation = useMarkPaymentCompleted()
const markFailedMutation = useMarkPaymentFailed()
const partialUpdatePaymentMutation = usePartialUpdatePayment()

const hasEventEnded = computed(() => {
  const eventData = event.value?.data as any
  const endDateValue = eventData?.end_datetime || eventData?.end_date
  if (!endDateValue) return false
  const timestamp = new Date(endDateValue).getTime()
  return !Number.isNaN(timestamp) && timestamp < Date.now()
})

function parseMoneyLike(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.-]/g, '')
    const parsed = parseFloat(cleaned)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

function statusCount(status: string): number {
  return Number(paymentStatusBreakdown.value?.[status]?.count || 0)
}

function statusAmount(status: string): number {
  return parseMoneyLike(paymentStatusBreakdown.value?.[status]?.amount)
}

// Stats calculations
const stats = computed(() => {
  const allPayments = payments.value

  const pendingVerification = allPayments.filter(
    (p: any) => p.status === 'PENDING' && p.method?.method_type === 'BANK_TRANSFER'
  )

  const listRevenue = allPayments.reduce((sum: number, p: any) => {
    return sum + parseMoneyLike(p.final_amount ?? p.amount ?? p.modified_amount)
  }, 0)

  const pendingCount = statusCount('PENDING')
  const pendingAmount = statusAmount('PENDING')

  const refundedCount = statusCount('REFUNDED') + statusCount('PENDING_REFUND')
  const refundedAmount = statusAmount('REFUNDED') + statusAmount('PENDING_REFUND')

  const partiallyRefundedCount = statusCount('PARTIALLY_REFUNDED')
  const partiallyRefundedAmount = statusAmount('PARTIALLY_REFUNDED')

  const failedCount = statusCount('FAILED') + statusCount('CANCELLED')
  const failedAmount = statusAmount('FAILED') + statusAmount('CANCELLED')

  return {
    listRevenue,
    pendingCount,
    pendingAmount,
    refundedCount,
    refundedAmount,
    failedCount,
    failedAmount,
    partiallyRefundedCount,
    partiallyRefundedAmount,
    pendingVerificationCount: pendingVerification.length,
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
  if (paymentFilters.descriptor) count++
  if (paymentFilters.payment_id) count++
  if (paymentFilters.payment_reference) count++
  return count
})

// Selection helpers
const isAllSelected = computed(() => {
  return payments.value.length > 0 && payments.value.every((p: any) => selectedPayments.value.has(p.payment_id))
})

const selectedPaymentRecords = computed(() => {
  return payments.value.filter((p: any) => selectedPayments.value.has(p.payment_id))
})

const bulkDeleteValidation = computed(() => {
  const selectedCount = selectedPayments.value.size
  if (selectedCount === 0) {
    return {
      valid: false,
      reason: 'Select at least one payment to delete.',
      deletablePayments: [] as any[],
    }
  }

  if (selectedCount > 5) {
    return {
      valid: false,
      reason: 'You can delete at most 5 payments at a time.',
      deletablePayments: [] as any[],
    }
  }

  if (selectedPaymentRecords.value.length !== selectedCount) {
    return {
      valid: false,
      reason: 'Some selected payments are not available in the current list.',
      deletablePayments: [] as any[],
    }
  }

  const nonDeletable = selectedPaymentRecords.value.filter((payment: any) => !canDeletePayment(payment))
  if (nonDeletable.length > 0) {
    return {
      valid: false,
      reason: 'Only FAILED, DRAFTING, or REFUNDED payments after event end can be deleted.',
      deletablePayments: [] as any[],
    }
  }

  return {
    valid: true,
    reason: '',
    deletablePayments: selectedPaymentRecords.value,
  }
})

const canBulkDelete = computed(() => bulkDeleteValidation.value.valid)
const bulkDeleteDisabledReason = computed(() => bulkDeleteValidation.value.reason)

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
  paymentFilters.descriptor = ''
  paymentFilters.payment_id = ''
  paymentFilters.payment_reference = ''
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

async function bulkDelete() {
  if (!canBulkDelete.value) {
    toast.add({
      title: 'Bulk delete unavailable',
      description: bulkDeleteDisabledReason.value || 'Selected payments are not eligible for deletion.',
      color: 'amber',
    })
    return
  }

  const deletablePayments = bulkDeleteValidation.value.deletablePayments

  const result = await Swal.fire({
    title: 'Delete selected payments?',
    text: `Permanently delete ${deletablePayments.length} payment(s)? This cannot be undone.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#dc2626',
  })

  if (!result.isConfirmed) return

  bulkActionLoading.value = true
  let successCount = 0
  let failCount = 0

  for (const payment of deletablePayments) {
    try {
      await deletePaymentMutation.mutateAsync(payment.payment_id)
      successCount++
    } catch (error) {
      failCount++
    }
  }

  bulkActionLoading.value = false
  clearSelection()
  refetchPayments()

  toast.add({
    title: 'Bulk Delete Complete',
    description: `${successCount} deleted, ${failCount} failed`,
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
const showCreatePaymentModal = ref(false)

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

function isBankTransferPayment(payment: any): boolean {
  return (payment.method_title || '').toLowerCase().includes('bank')
}

async function handlePendingVerification(payment: any) {
  if (isBankTransferPayment(payment)) {
    openVerifyBankTransfer(payment)
    return
  }

  const result = await Swal.fire({
    title: 'Mark payment as verified?',
    text: `${payment.payment_reference} has no method. Promote it to completed?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, mark verified',
    cancelButtonText: 'Cancel',
  })

  if (!result.isConfirmed) return

  try {
    await markCompletedMutation.mutateAsync(payment.payment_id)
    refetchPayments()
    toast.add({
      title: 'Payment verified',
      description: `${payment.payment_reference} is now completed.`,
      color: 'green',
    })
  } catch (error: any) {
    toast.add({
      title: 'Verification failed',
      description: error?.message || 'Could not verify this payment.',
      color: 'red',
    })
  }
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

function handlePaymentCreated() {
  showCreatePaymentModal.value = false
  refetchPayments()
  toast.add({
    title: 'Payment created',
    description: 'The payment record has been created successfully.',
    color: 'green',
  })
}

function canDeletePayment(payment: any): boolean {
  if (payment.status === 'DRAFTING' || payment.status === 'FAILED') return true
  return hasEventEnded.value && payment.status === 'REFUNDED'
}

async function demotePendingToDrafting(payment: any) {
  const result = await Swal.fire({
    title: 'Demote payment to draft?',
    text: `Move ${payment.payment_reference} from PENDING to DRAFTING?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, demote',
    cancelButtonText: 'Cancel',
  })

  if (!result.isConfirmed) return

  try {
    await partialUpdatePaymentMutation.mutateAsync({
      paymentId: payment.payment_id,
      body: { status: 'DRAFTING' },
    })
    refetchPayments()
    toast.add({
      title: 'Payment demoted',
      description: `${payment.payment_reference} is now drafting.`,
      color: 'green',
    })
  } catch (error: any) {
    toast.add({
      title: 'Demotion failed',
      description: error?.message || 'Could not demote this payment to drafting.',
      color: 'red',
    })
  }
}

async function promoteDraftToPending(payment: any) {
  const result = await Swal.fire({
    title: 'Promote draft payment?',
    text: `Move ${payment.payment_reference} from DRAFTING to PENDING?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, promote',
    cancelButtonText: 'Cancel',
  })

  if (!result.isConfirmed) return

  try {
    await partialUpdatePaymentMutation.mutateAsync({
      paymentId: payment.payment_id,
      body: { status: 'PENDING' },
    })
    refetchPayments()
    toast.add({
      title: 'Payment promoted',
      description: `${payment.payment_reference} is now pending.`,
      color: 'green',
    })
  } catch (error: any) {
    toast.add({
      title: 'Promotion failed',
      description: error?.message || 'Could not promote this payment to pending.',
      color: 'red',
    })
  }
}

async function deleteRefundedPayment(payment: any) {
  if (!canDeletePayment(payment)) {
    toast.add({
      title: 'Delete blocked',
      description: 'Payments can only be deleted when drafting, or refunded after the event has ended.',
      color: 'amber',
    })
    return
  }

  const isDrafting = payment.status === 'DRAFTING'

  const result = await Swal.fire({
    title: isDrafting ? 'Delete drafting payment?' : 'Delete refunded payment?',
    text: `${payment.payment_reference} will be permanently deleted.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#dc2626',
  })

  if (!result.isConfirmed) return

  try {
    await deletePaymentMutation.mutateAsync(payment.payment_id)
    refetchPayments()
    toast.add({
      title: 'Payment deleted',
      description: `${payment.payment_reference} was deleted.`,
      color: 'green',
    })
  } catch (error: any) {
    toast.add({
      title: 'Delete failed',
      description: error?.message || 'Could not delete this payment.',
      color: 'red',
    })
  }
}

function viewPaymentTickets(payment: any) {
  // Navigate to tickets page with filter for this payment
  navigateTo(`/events/${id.value}/m/participants/dashboard?payment_id=${payment.payment_id}`)
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

watch(
  () => route.query,
  () => {
    if (syncingQuery.value) return
    applyQueryToState()
  },
  { immediate: true }
)

watch(
  [
    activeTab,
    paymentsCurrentPage,
    paymentsPageSize,
    paymentsSearchQuery,
    () => paymentFilters.status,
    () => paymentFilters.method_type,
    () => paymentFilters.date_from,
    () => paymentFilters.date_to,
    () => paymentFilters.amount_min,
    () => paymentFilters.amount_max,
    () => paymentFilters.has_refunds,
    () => paymentFilters.descriptor,
    () => paymentFilters.payment_id,
    () => paymentFilters.payment_reference,
    () => quickFilters.pending_verification,
    () => quickFilters.has_refunds,
  ],
  () => {
    syncStateToQuery()
  },
  { deep: false }
)
</script>