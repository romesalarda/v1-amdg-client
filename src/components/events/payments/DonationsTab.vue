<template>
  <div class="space-y-6">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
            <span class="material-symbols-outlined text-pink-600">favorite</span>
          </div>
          <div>
            <div class="text-2xl font-black text-deep-navy">
              {{ formatCurrency(stats.totalDonations) }}
            </div>
            <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Total Donations</div>
          </div>
        </div>
      </div>

      <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <span class="material-symbols-outlined text-green-600">check_circle</span>
          </div>
          <div>
            <div class="text-2xl font-black text-deep-navy">{{ stats.verifiedCount }}</div>
            <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Verified</div>
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
            <span class="material-symbols-outlined text-blue-600">payments</span>
          </div>
          <div>
            <div class="text-2xl font-black text-deep-navy">{{ stats.linkedPaymentsCount }}</div>
            <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Linked to Payments</div>
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
            <span class="material-symbols-outlined text-primary">favorite</span>
            <div>
              <h2 class="text-sm font-black text-primary uppercase tracking-widest">Donations</h2>
              <p class="text-xs text-gray-500">
                Showing {{ ((currentPage - 1) * pageSize) + 1 }} to {{ Math.min(currentPage * pageSize, totalCount) }} of {{ totalCount }} donations
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
            <button
              @click="openCreateModal"
              class="px-4 py-2 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <span class="material-symbols-outlined text-lg">add</span>
              Record Donation
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
              placeholder="Search by donor name, email, or tracking reference..."
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
                <option value="PENDING">Pending</option>
                <option value="VERIFIED">Verified</option>
                <option value="REJECTED">Rejected</option>
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
        <table v-if="!isLoading && donations.length > 0" class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Reference
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Date
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Donor
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Amount
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Payment
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
              v-for="donation in donations"
              :key="donation.donation_id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-4 py-3">
                <div class="font-mono text-sm font-semibold text-gray-900">
                  {{ donation.tracking_reference }}
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="text-sm text-gray-900">
                  {{ formatDate(donation.donated_at) }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ formatTime(donation.donated_at) }}
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="text-sm font-medium text-gray-900">
                  {{ donation.donated_by_name || 'Anonymous' }}
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="text-sm font-semibold text-pink-600">
                  £{{ parseFloat(donation.amount || '0').toFixed(2) }}
                </div>
              </td>
              <td class="px-4 py-3">
                <div v-if="donation.payment" class="text-xs">
                  <button
                    @click="viewPayment({ payment_id: donation.payment })"
                    class="text-blue-600 hover:text-blue-700 hover:underline font-mono"
                  >
                    {{ donation.payment_reference }}
                  </button>
                </div>
                <div v-else class="text-xs text-gray-400">
                  No payment
                </div>
              </td>
              <td class="px-4 py-3">
                <UBadge
                  :color="(getDonationStatusColor(donation.verification_status || 'pending') as any)"
                  variant="soft"
                  size="sm"
                >
                  {{ getDonationStatusLabel(donation.verification_status || 'pending') }}
                </UBadge>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1">
                  <button
                    v-if="donation.verification_status === 'pending'"
                    @click="verifyDonation(donation)"
                    class="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                    title="Verify Donation"
                  >
                    <span class="material-symbols-outlined text-lg">check_circle</span>
                  </button>
                  <button
                    @click="viewDonationDetails(donation)"
                    class="p-1.5 text-gray-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <span class="material-symbols-outlined text-lg">visibility</span>
                  </button>
                  <button
                    @click="deleteDonation(donation)"
                    class="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <span class="material-symbols-outlined text-lg">delete</span>
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
        <div v-if="!isLoading && donations.length === 0" class="p-12 text-center">
          <span class="material-symbols-outlined text-6xl text-gray-300 mb-4 block">favorite</span>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">No donations found</h3>
          <p class="text-sm text-gray-500 mb-4">
            {{ searchQuery || filters.status ? 'Try adjusting your filters' : 'No donations recorded yet' }}
          </p>
          <button
            @click="openCreateModal"
            class="px-6 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
          >
            <span class="material-symbols-outlined">add</span>
            Record First Donation
          </button>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="!isLoading && donations.length > 0" class="px-6 py-4 border-t border-gray-100">
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

    <!-- Create/Edit Donation Modal -->
    <CreateDonationModal
      v-if="showCreateModal"
      :open="showCreateModal"
      :event-id="eventId"
      @close="closeCreateModal"
      @created="handleDonationCreated"
    />

    <!-- Donation Details Modal -->
    <DonationDetailModal
      v-if="selectedDonation"
      :donation="selectedDonation"
      :open="showDetailModal"
      @close="closeDetailModal"
    />
  </div>
</template>

<script setup lang="ts">
import {
  usePaymentDonations,
  useVerifyPaymentDonation,
  useDeletePaymentDonation,
} from '~/composables/resources/payments/paymentDonations'
import {
  getDonationStatusLabel,
  getDonationStatusColor,
} from '~/schemas/events/paymentConstants'
import CreateDonationModal from './modals/CreateDonationModal.vue'
import DonationDetailModal from './modals/DonationDetailModal.vue'
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
const showCreateModal = ref(false)
const showDetailModal = ref(false)
const selectedDonation = ref<any>(null)

// Query params
const queryParams = computed(() => {
  const params: any = {
    event__event_id: props.eventId,
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
    params.donated_at__gte = filters.date_from
  }

  if (filters.date_to) {
    params.donated_at__lte = filters.date_to
  }

  return params
})

// Fetch donations
const { data: donationsData, isLoading, refetch } = usePaymentDonations(queryParams)

const donations = computed(() => donationsData.value?.data?.results || [])
const totalCount = computed(() => donationsData.value?.data?.count || 0)
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))

// Mutations
const verifyMutation = useVerifyPaymentDonation()
const deleteMutation = useDeletePaymentDonation()

// Stats
const stats = computed(() => {
  const allDonations = donations.value
  const verified = allDonations.filter((d: any) => d.status === 'VERIFIED')
  const pending = allDonations.filter((d: any) => d.status === 'PENDING')
  const linkedPayments = allDonations.filter((d: any) => d.payment !== null)

  const totalDonations = allDonations.reduce((sum: number, d: any) => {
    if (d.status === 'VERIFIED') {
      return sum + parseFloat(d.amount || '0')
    }
    return sum
  }, 0)

  const pendingAmount = pending.reduce((sum: number, d: any) => {
    return sum + parseFloat(d.amount || '0')
  }, 0)

  return {
    totalDonations,
    verifiedCount: verified.length,
    pendingCount: pending.length,
    pendingAmount,
    linkedPaymentsCount: linkedPayments.length,
  }
})

// Actions
function openCreateModal() {
  showCreateModal.value = true
}

function closeCreateModal() {
  showCreateModal.value = false
}

function handleDonationCreated() {
  closeCreateModal()
  refetch()
  toast.add({
    title: 'Donation Created',
    description: 'Donation has been recorded successfully',
    color: 'green',
  })
}

function viewDonationDetails(donation: any) {
  selectedDonation.value = donation
  showDetailModal.value = true
}

function closeDetailModal() {
  showDetailModal.value = false
  selectedDonation.value = null
}

async function verifyDonation(donation: any) {
  const result = await Swal.fire({
    title: 'Verify Donation?',
    text: `Verify donation of £${parseFloat(donation.amount || '0').toFixed(2)}?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, verify',
    cancelButtonText: 'Cancel',
  })

  if (!result.isConfirmed) return

  try {
    await verifyMutation.mutateAsync({
      donationId: donation.donation_id,
      body: { verified: true, notes: 'Verified by admin' }
    })
    toast.add({
      title: 'Donation Verified',
      description: 'The donation has been verified',
      color: 'green',
    })
    refetch()
  } catch (error: any) {
    toast.add({
      title: 'Verification Failed',
      description: error?.message || 'An error occurred',
      color: 'red',
    })
  }
}

async function deleteDonation(donation: any) {
  const result = await Swal.fire({
    title: 'Delete Donation?',
    text: 'This action cannot be undone.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#ef4444',
  })

  if (!result.isConfirmed) return

  try {
    await deleteMutation.mutateAsync(donation.donation_id)
    toast.add({
      title: 'Donation Deleted',
      description: 'The donation has been removed',
      color: 'green',
    })
    refetch()
  } catch (error: any) {
    toast.add({
      title: 'Delete Failed',
      description: error?.message || 'An error occurred',
      color: 'red',
    })
  }
}

function viewPayment(payment: any) {
  // Navigate to payments tab with this payment ID
  navigateTo(`/events/${props.eventId}/m/payments/list?payment=${payment.payment_id}`)
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

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

// Watch page size changes
watch(pageSize, () => {
  currentPage.value = 1
})
</script>
