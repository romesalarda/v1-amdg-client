<template>
  <EventManagementLayout :event-id="id" :event="event?.data">
    <div class="grid grid-cols-1 gap-6" :class="showFilters ? 'lg:grid-cols-12' : 'lg:grid-cols-1'">
      <!-- Main Content -->
      <div :class="showFilters ? 'lg:col-span-9' : 'lg:col-span-12'" class="space-y-6">
        
        <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <!-- Statistics Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 border-b border-gray-100 bg-gray-50">
            <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-shopping-bag" class="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div class="text-2xl font-black text-deep-navy">{{ totalOrders }}</div>
                  <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Total Orders</div>
                </div>
              </div>
            </div>

            <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-currency-pound" class="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div class="text-2xl font-black text-deep-navy">{{ formatMoney(totalRevenue, 'GBP') }}</div>
                  <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Total Revenue</div>
                </div>
              </div>
            </div>

            <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-clock" class="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <div class="text-2xl font-black text-deep-navy">{{ pendingOrdersCount }}</div>
                  <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Pending Orders</div>
                </div>
              </div>
            </div>

            <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div class="text-2xl font-black text-deep-navy">{{ completedTodayCount }}</div>
                  <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Completed Today</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Table Header -->
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <UIcon name="i-heroicons-shopping-bag" class="w-5 h-5 text-primary" />
              <div>
                <h2 class="text-sm font-black text-primary uppercase tracking-widest">Orders</h2>
                <p class="text-xs text-gray-500">Showing {{ orders.length }} of {{ totalOrders }} orders</p>
              </div>
            </div>
            
            <div class="flex items-center gap-2">
              <UButton
                size="sm"
                variant="ghost"
                color="gray"
                :icon="showFilters ? 'i-heroicons-chevron-right' : 'i-heroicons-funnel'"
                @click="showFilters = !showFilters"
                class="hidden lg:flex"
              >
                {{ showFilters ? 'Hide' : 'Show' }} Filters
              </UButton>
              <UButton
                size="sm"
                variant="outline"
                color="gray"
                icon="i-heroicons-arrow-down-tray"
                @click="exportOrdersToCSV"
              >
                Export CSV
              </UButton>
            </div>
          </div>

          <!-- Search Bar -->
          <div class="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <div class="flex items-center gap-3">
              <div class="flex-1">
                <div class="relative">
                  <UIcon name="i-heroicons-magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search by order ID, customer name, attendee name..."
                    class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
              
              <div v-if="activeFilterCount > 0" class="flex items-center gap-2">
                <UBadge color="primary" variant="soft">
                  {{ activeFilterCount }} filter{{ activeFilterCount > 1 ? 's' : '' }} active
                </UBadge>
                <UButton
                  size="xs"
                  variant="ghost"
                  color="gray"
                  @click="clearAllFilters"
                >
                  Clear all
                </UButton>
              </div>
              
              <UButton
                size="sm"
                variant="outline"
                color="gray"
                icon="i-heroicons-funnel"
                @click="showFilters = !showFilters"
                class="lg:hidden"
              >
                Filters
              </UButton>
            </div>
          </div>

          <!-- Bulk Actions Bar -->
          <div v-if="selectedOrders.length > 0" class="px-6 py-3 bg-primary/5 border-b border-primary/10">
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold text-primary">
                {{ selectedOrders.length }} order{{ selectedOrders.length > 1 ? 's' : '' }} selected
              </span>
              <div class="flex items-center gap-2">
                <UButton
                  size="xs"
                  variant="soft"
                  color="gray"
                  @click="selectedOrders = []"
                >
                  Clear selection
                </UButton>
                <UButton
                  size="xs"
                  variant="soft"
                  color="red"
                  icon="i-heroicons-x-mark"
                  @click="bulkCancelOrders"
                >
                  Cancel selected
                </UButton>
                <UButton
                  size="xs"
                  variant="soft"
                  color="gray"
                  icon="i-heroicons-arrow-down-tray"
                  @click="exportSelectedOrders"
                >
                  Export selected
                </UButton>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="isLoading" class="p-6 space-y-3">
            <div v-for="i in 10" :key="i" class="h-16 bg-gray-100 rounded-lg animate-pulse" />
          </div>

          <!-- Empty State -->
          <div v-else-if="orders.length === 0" class="p-12 text-center">
            <UIcon name="i-heroicons-shopping-bag" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 class="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
            <p class="text-sm text-gray-500 mb-4">
              {{ searchQuery || activeFilterCount > 0 
                ? 'Try adjusting your filters or search query' 
                : 'No orders have been created for this event yet' 
              }}
            </p>
            <UButton
              v-if="searchQuery || activeFilterCount > 0"
              variant="soft"
              color="gray"
              @click="clearAllFilters"
            >
              Clear filters
            </UButton>
          </div>

          <!-- Orders Table -->
          <div v-else class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead>
                <tr class="border-b border-gray-200 bg-gray-50">
                  <th class="py-3 px-4">
                    <input
                      v-model="selectAll"
                      type="checkbox"
                      @change="toggleSelectAll"
                      class="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </th>
                  <th 
                    class="py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    @click="setSorting('order_reference_id')"
                  >
                    <div class="flex items-center gap-1">
                      Order ID
                      <UIcon 
                        v-if="currentSort === 'order_reference_id'" 
                        :name="sortDirection === 'asc' ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" 
                        class="w-4 h-4"
                      />
                    </div>
                  </th>
                  <th class="py-3 px-4 font-semibold text-gray-700">Customer / Attendee</th>
                  <th class="py-3 px-4 font-semibold text-gray-700">Items</th>
                  <th 
                    class="py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    @click="setSorting('total_amount')"
                  >
                    <div class="flex items-center gap-1">
                      Total
                      <UIcon 
                        v-if="currentSort === 'total_amount'" 
                        :name="sortDirection === 'asc' ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" 
                        class="w-4 h-4"
                      />
                    </div>
                  </th>
                  <th 
                    class="py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    @click="setSorting('status')"
                  >
                    <div class="flex items-center gap-1">
                      Status
                      <UIcon 
                        v-if="currentSort === 'status'" 
                        :name="sortDirection === 'asc' ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" 
                        class="w-4 h-4"
                      />
                    </div>
                  </th>
                  <th 
                    class="py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    @click="setSorting('created_at')"
                  >
                    <div class="flex items-center gap-1">
                      Created
                      <UIcon 
                        v-if="currentSort === 'created_at'" 
                        :name="sortDirection === 'asc' ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" 
                        class="w-4 h-4"
                      />
                    </div>
                  </th>
                  <th class="py-3 px-4 font-semibold text-gray-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="order in orders"
                  :key="order.order_id"
                  class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td class="py-3 px-4">
                    <input
                      v-model="selectedOrders"
                      type="checkbox"
                      :value="order.order_id"
                      class="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </td>
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-2">
                      <div>
                        <div class="font-mono text-xs font-semibold text-gray-900">{{ order.order_reference_id }}</div>
                        <div class="font-mono text-xs text-gray-400">{{ order.order_id.slice(0, 8) }}...</div>
                      </div>
                      <button
                        @click="copyToClipboard(order.order_reference_id)"
                        class="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Copy order ID"
                      >
                        <UIcon name="i-heroicons-clipboard-document" class="w-3 h-3 text-gray-400" />
                      </button>
                    </div>
                  </td>
                  <td class="py-3 px-4">
                    <div>
                      <div class="font-semibold text-gray-900">
                        {{ order.customer_name || 'N/A' }}
                      </div>
                      <div v-if="order.attendee_name" class="text-xs text-gray-500 flex items-center gap-1">
                        <UIcon name="i-heroicons-user" class="w-3 h-3" />
                        {{ order.attendee_name }}
                      </div>
                    </div>
                  </td>
                  <td class="py-3 px-4">
                    <UBadge color="gray" variant="soft" size="xs">
                      {{ order.item_count }} item{{ order.item_count !== 1 ? 's' : '' }}
                    </UBadge>
                  </td>
                  <td class="py-3 px-4 font-semibold text-gray-900">
                    {{ formatMoney(order.total_amount, 'GBP') }}
                  </td>
                  <td class="py-3 px-4">
                    <UBadge 
                      :color="getOrderStatusColor(order.status!) as any"
                      variant="soft"
                      size="xs"
                    >
                      {{ order.status_display }}
                    </UBadge>
                  </td>
                  <td class="py-3 px-4 text-xs text-gray-500">
                    <div>{{ formatRelativeTime(order.created_at) }}</div>
                    <div class="text-gray-400">{{ formatDate(order.created_at, 'MMM d, yyyy') }}</div>
                  </td>
                  <td class="py-3 px-4">
                    <div class="flex items-center justify-end gap-1">
                      <UButton
                        size="xs"
                        variant="ghost"
                        color="gray"
                        icon="i-heroicons-eye"
                        @click="viewOrderDetail(order)"
                        title="View details"
                      />
                      
                      <!-- Status Transition Dropdown -->
                      <UDropdown 
                        v-if="getAvailableTransitions(order.status!).length > 0"
                        :items="[getAvailableTransitions(order.status!)]"
                        :popper="{ placement: 'bottom-end' }"
                      >
                        <UButton
                          size="xs"
                          variant="ghost"
                          color="blue"
                          icon="i-heroicons-arrow-path"
                          title="Change status"
                        />
                      </UDropdown>

                      <UButton
                        v-if="canCancelOrder(order.status!)"
                        size="xs"
                        variant="ghost"
                        color="red"
                        icon="i-heroicons-x-mark"
                        @click="cancelOrder(order)"
                        title="Cancel order"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="!isLoading && orders.length > 0" class="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <select
                v-model="pageSize"
                class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option :value="10">10 per page</option>
                <option :value="25">25 per page</option>
                <option :value="50">50 per page</option>
                <option :value="100">100 per page</option>
              </select>
              <span class="text-xs text-gray-500">
                Showing {{ ((currentPage - 1) * pageSize) + 1 }} to {{ Math.min(currentPage * pageSize, totalOrders) }} of {{ totalOrders }}
              </span>
            </div>

            <UPagination
              v-model="currentPage"
              :page-count="pageSize"
              :total="totalOrders"
              :max="7"
            />
          </div>
        </div>
      </div>

      <!-- Filters Sidebar -->
      <div v-if="showFilters" class="lg:col-span-3 space-y-4">
        <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn p-6 sticky top-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-sm font-black text-deep-navy uppercase tracking-widest">Filters</h3>
            <UButton
              size="xs"
              variant="ghost"
              color="gray"
              @click="clearAllFilters"
            >
              Clear all
            </UButton>
          </div>

          <div class="space-y-6">
            <!-- Status Filter -->
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Order Status</label>
              <div class="space-y-2">
                <label v-for="status in availableStatuses" :key="status.value" class="flex items-center gap-2">
                  <input
                    v-model="filters.statuses"
                    type="checkbox"
                    :value="status.value"
                    class="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <UBadge :color="getOrderStatusColor(status.value) as any" variant="soft" size="xs">
                    {{ status.label }}
                  </UBadge>
                </label>
              </div>
            </div>

            <!-- Date Range Filter -->
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Date Range</label>
              <div class="space-y-2">
                <input
                  v-model="filters.createdAfter"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="From"
                />
                <input
                  v-model="filters.createdBefore"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="To"
                />
              </div>
            </div>

            <!-- Amount Range Filter -->
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Amount Range</label>
              <div class="grid grid-cols-2 gap-2">
                <input
                  v-model.number="filters.minAmount"
                  type="number"
                  placeholder="Min"
                  class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <input
                  v-model.number="filters.maxAmount"
                  type="number"
                  placeholder="Max"
                  class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <!-- Payment Filter -->
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Payment</label>
              <div class="space-y-2">
                <label class="flex items-center gap-2">
                  <input
                    v-model="filters.hasPayment"
                    type="checkbox"
                    class="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span class="text-sm text-gray-700">Has payment linked</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </EventManagementLayout>
</template>

<script setup lang="ts">
import { DateTime } from 'luxon'
import type { OrderList } from '~/api/types.gen'
import { useEvent } from '~/composables/resources/events/events'
import { useProductOrders, useCancelProductOrder } from '~/composables/resources/products/productOrders'
import EventManagementLayout from '~/components/events/EventManagementLayout.vue'
import { orderStatusColors } from '~/schemas/events/productConstants'
import { formatMoney } from '~/utils/money'
import { formatDate } from '~/utils/time'

definePageMeta({
  layout: false,
  middleware: 'auth',
})

const route = useRoute()
const id = computed(() => route.params.id as string)
const toast = useToast()

// Event Data
const { data: event } = useEvent(id)

// Pagination
const currentPage = ref(1)
const pageSize = ref(25)
const searchQuery = ref('')

// Debounced search
const debouncedSearch = ref(searchQuery.value)
let searchTimeout: ReturnType<typeof setTimeout>
watch(searchQuery, (newValue) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    debouncedSearch.value = newValue
    currentPage.value = 1
  }, 300)
})

// Filters
const showFilters = ref(false)
const filters = reactive({
  statuses: ['pending', 'processing', 'completed'] as string[], // Exclude 'draft' by default
  createdAfter: null as string | null,
  createdBefore: null as string | null,
  minAmount: null as number | null,
  maxAmount: null as number | null,
  hasPayment: false,
})

const availableStatuses = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'pending_refund', label: 'Pending Refund' },
  { value: 'refunded', label: 'Refunded' },
]

// Sorting
const currentSort = ref<string | null>('created_at')
const sortDirection = ref<'asc' | 'desc'>('desc')

function setSorting(field: string) {
  if (currentSort.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    currentSort.value = field
    sortDirection.value = 'asc'
  }
}

// Computed query parameters for API
const queryParams = computed(() => {
  const params: any = {
    event: event.value?.data?.id,
    page: currentPage.value,
    page_size: pageSize.value,
  }

  // Search
  if (debouncedSearch.value) {
    params.search = debouncedSearch.value
  }

  // Sorting
  if (currentSort.value) {
    params.ordering = sortDirection.value === 'desc' ? `-${currentSort.value}` : currentSort.value
  }

  // Status filters
  // if (filters.statuses.length > 0) {
  //   params.status__in = filters.statuses.join(',')
  // }

  // Date filters
  if (filters.createdAfter) {
    params.created_after = filters.createdAfter
  }
  if (filters.createdBefore) {
    params.created_before = filters.createdBefore
  }

  // Amount filters
  if (filters.minAmount !== null && filters.minAmount !== undefined) {
    params.min_amount = filters.minAmount
  }
  if (filters.maxAmount !== null && filters.maxAmount !== undefined) {
    params.max_amount = filters.maxAmount
  }

  // Payment filter
  if (filters.hasPayment) {
    params.has_payment = true
  }

  return params
})

// Orders Data
const { data: ordersData, isLoading, refetch } = useProductOrders(queryParams)
const orders = computed(() => ordersData.value?.data?.results || [])
const totalOrders = computed(() => ordersData.value?.data?.count || 0)

// Statistics
const pendingOrdersCount = computed(() => 
  orders.value.filter((o: OrderList) => o.status === 'pending').length
)

const completedTodayCount = computed(() => {
  const today = DateTime.now().startOf('day')
  return orders.value.filter((o: OrderList) => {
    if (o.status !== 'completed') return false
    const createdAt = DateTime.fromISO(o.created_at)
    return createdAt >= today
  }).length
})

const totalRevenue = computed(() => {
  return orders.value
    .filter((o: OrderList) => o.status === 'completed')
    .reduce((sum: number, o: OrderList) => sum + parseFloat(o.total_amount), 0)
})

const activeFilterCount = computed(() => {
  let count = 0
  if (filters.statuses.length !== 3) count++ // Not default
  if (filters.createdAfter) count++
  if (filters.createdBefore) count++
  if (filters.minAmount !== null) count++
  if (filters.maxAmount !== null) count++
  if (filters.hasPayment) count++
  return count
})

function clearAllFilters() {
  searchQuery.value = ''
  filters.statuses = ['pending', 'processing', 'completed']
  filters.createdAfter = null
  filters.createdBefore = null
  filters.minAmount = null
  filters.maxAmount = null
  filters.hasPayment = false
  currentPage.value = 1
}

// Watch filters and reset page when they change
watch(filters, () => {
  currentPage.value = 1
}, { deep: true })

// Table Selection
const selectAll = ref(false)
const selectedOrders = ref<string[]>([])

function toggleSelectAll() {
  if (selectAll.value) {
    selectedOrders.value = orders.value.map((o: OrderList) => o.order_id!)
  } else {
    selectedOrders.value = []
  }
}

watch(selectedOrders, (newVal) => {
  selectAll.value = newVal.length === orders.value.length && orders.value.length > 0
})

// Actions
function viewOrderDetail(order: OrderList) {
  navigateTo(`/events/${id.value}/m/shop/orders/${order.order_id}/detail`)
}

function canTransitionStatus(status: string): boolean {
  return ['pending', 'processing'].includes(status)
}

function canCancelOrder(status: string): boolean {
  return ['draft', 'pending', 'processing'].includes(status)
}

function getAvailableTransitions(status: string) {
  const transitions: any[] = []

  if (status === 'pending') {
    transitions.push({
      label: 'Mark as Processing',
      icon: 'i-heroicons-arrow-path',
      click: () => toast.add({
        title: 'Feature in development',
        description: 'Status transitions will be available in the next update.',
        color: 'blue',
      })
    })
  }

  if (status === 'processing') {
    transitions.push({
      label: 'Mark as Completed',
      icon: 'i-heroicons-check-circle',
      click: () => toast.add({
        title: 'Feature in development',
        description: 'Status transitions will be available in the next update.',
        color: 'blue',
      })
    })
  }

  return transitions
}

const { mutateAsync: cancelOrderMutation } = useCancelProductOrder()

async function cancelOrder(order: OrderList) {
  if (!confirm(`Are you sure you want to cancel order ${order.order_reference_id}?`)) {
    return
  }

  try {
    await cancelOrderMutation(Number(order.id))
    toast.add({
      title: 'Order cancelled',
      description: `Order ${order.order_reference_id} has been cancelled.`,
      color: 'green',
    })
    refetch()
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to cancel order. Please try again.',
      color: 'red',
    })
  }
}

function bulkCancelOrders() {
  if (selectedOrders.value.length === 0) return

  const confirmed = confirm(
    `Are you sure you want to cancel ${selectedOrders.value.length} order${selectedOrders.value.length > 1 ? 's' : ''}? This action cannot be undone.`
  )
  
  if (!confirmed) return

  // Cancel each selected order
  const cancelPromises = selectedOrders.value.map(async (orderId) => {
    const order = orders.value.find((o: OrderList) => o.order_id === orderId)
    if (!order) return
    
    try {
      await cancelOrderMutation(Number(order.id))
      return { success: true, orderId }
    } catch (error) {
      return { success: false, orderId, error }
    }
  })

  Promise.all(cancelPromises).then((results) => {
    const successCount = results.filter(r => r?.success).length
    const failCount = results.filter(r => !r?.success).length

    if (successCount > 0) {
      toast.add({
        title: 'Orders cancelled',
        description: `Successfully cancelled ${successCount} order${successCount > 1 ? 's' : ''}.${failCount > 0 ? ` Failed to cancel ${failCount} order${failCount > 1 ? 's' : ''}.` : ''}`,
        color: failCount > 0 ? 'amber' : 'green',
      })
    } else {
      toast.add({
        title: 'Error',
        description: 'Failed to cancel orders. Please try again.',
        color: 'red',
      })
    }

    selectedOrders.value = []
    refetch()
  })
}

function exportOrdersToCSV() {
  const dataToExport = orders.value

  if (dataToExport.length === 0) {
    toast.add({
      title: 'No data',
      description: 'There are no orders to export.',
      color: 'amber',
    })
    return
  }

  // Prepare CSV content
  const headers = [
    'Order ID',
    'Reference ID',
    'Customer Name',
    'Attendee Name',
    'Status',
    'Items',
    'Total Amount (GBP)',
    'Created At',
  ]

  const rows = dataToExport.map((order: OrderList) => [
    order.order_id,
    order.order_reference_id,
    order.customer_name || 'N/A',
    order.attendee_name || 'N/A',
    order.status_display,
    order.item_count,
    order.total_amount,
    order.created_at,
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => {
      // Escape commas and quotes in cell content
      const cellStr = String(cell)
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`
      }
      return cellStr
    }).join(','))
  ].join('\n')

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `orders_${event.value?.data?.display_code || 'export'}_${DateTime.now().toFormat('yyyy-MM-dd')}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  toast.add({
    title: 'Export successful',
    description: `Exported ${dataToExport.length} order${dataToExport.length > 1 ? 's' : ''} to CSV.`,
    color: 'green',
  })
}

function exportSelectedOrders() {
  if (selectedOrders.value.length === 0) {
    toast.add({
      title: 'No selection',
      description: 'Please select orders to export.',
      color: 'amber',
    })
    return
  }

  const dataToExport = orders.value.filter((o: OrderList) => 
    selectedOrders.value.includes(o.order_id!)
  )

  // Prepare CSV content
  const headers = [
    'Order ID',
    'Reference ID',
    'Customer Name',
    'Attendee Name',
    'Status',
    'Items',
    'Total Amount (GBP)',
    'Created At',
  ]

  const rows = dataToExport.map((order: OrderList) => [
    order.order_id,
    order.order_reference_id,
    order.customer_name || 'N/A',
    order.attendee_name || 'N/A',
    order.status_display,
    order.item_count,
    order.total_amount,
    order.created_at,
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => {
      const cellStr = String(cell)
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`
      }
      return cellStr
    }).join(','))
  ].join('\n')

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `orders_selected_${DateTime.now().toFormat('yyyy-MM-dd')}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  toast.add({
    title: 'Export successful',
    description: `Exported ${dataToExport.length} selected order${dataToExport.length > 1 ? 's' : ''} to CSV.`,
    color: 'green',
  })
}

// Helpers
function getOrderStatusColor(status: string): string {
  return orderStatusColors[status as keyof typeof orderStatusColors] || 'gray'
}

function formatRelativeTime(dateString: string): string {
  const dt = DateTime.fromISO(dateString)
  const now = DateTime.now()
  const diff = now.diff(dt, ['days', 'hours', 'minutes']).toObject()

  if (diff.days! >= 1) {
    return `${Math.floor(diff.days!)} day${Math.floor(diff.days!) !== 1 ? 's' : ''} ago`
  } else if (diff.hours! >= 1) {
    return `${Math.floor(diff.hours!)} hour${Math.floor(diff.hours!) !== 1 ? 's' : ''} ago`
  } else {
    return `${Math.floor(diff.minutes!)} minute${Math.floor(diff.minutes!) !== 1 ? 's' : ''} ago`
  }
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.add({
      title: 'Copied',
      description: 'Order ID copied to clipboard',
      color: 'green',
    })
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}
</script>
