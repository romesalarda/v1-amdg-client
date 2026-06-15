<template>
  <EventManagementLayout :event-id="id" :event="event?.data">
    <div class="space-y-6">

      <!-- Statistics Cards -->
      <ParticipantsStatCards
        :current-view="currentView"
        :total-attendees="totalAttendees"
        :checked-in-count="checkedInCount"
        :minor-count="minorCount"
        :staff-count="staffCount"
        :total-bookings="totalBookings"
        :total-family-groups="totalFamilyGroups"
        :family-groups-page-count="familyGroups.length"
        :families-with-members="familiesWithMembers"
        :visible-family-members="visibleFamilyMembers"
        :total-issued-tickets="totalIssuedTickets"
        :active-issued-tickets="activeIssuedTickets"
        :used-issued-tickets="usedIssuedTickets"
        :cancelled-issued-tickets="cancelledIssuedTickets"
      />

      <!-- Main Table Section -->
      <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">

        <!-- Table Header -->
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <UIcon :name="viewIcon" class="w-5 h-5 text-primary" />
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-1">
                <h2 class="text-sm font-black text-primary uppercase tracking-widest">{{ viewTitle }}</h2>

                <!-- View Toggle -->
                <div class="flex bg-gray-100 rounded-lg p-0.5">
                  <button
                    v-for="tab in viewTabs"
                    :key="tab.value"
                    :class="[
                      'px-3 py-1 text-xs font-semibold rounded-md transition-colors',
                      currentView === tab.value ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    ]"
                    @click="changeView(tab.value)"
                  >
                    {{ tab.label }}
                  </button>
                </div>
              </div>

              <p class="text-xs text-gray-500">
                <template v-if="currentView === 'attendees'">Showing {{ attendees.length }} of {{ totalAttendees }} participants</template>
                <template v-else-if="currentView === 'bookings'">Showing {{ bookings.length }} of {{ totalBookings }} bookings</template>
                <template v-else-if="currentView === 'families'">Showing {{ familyGroups.length }} of {{ totalFamilyGroups }} families</template>
                <template v-else-if="currentView === 'tickets'">Manage ticket types and issued tickets for this event</template>
                <template v-else>Statistics and analytics for event participants</template>
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <UButton
              v-if="currentView === 'attendees'"
              size="sm"
              variant="ghost"
              color="gray"
              icon="i-heroicons-funnel"
              @click="showFiltersModal = true"
            >
              Filters
              <UBadge v-if="activeFilterCount > 0" color="primary" size="xs" class="ml-1">{{ activeFilterCount }}</UBadge>
            </UButton>
            <UButton
              v-if="currentView === 'attendees'"
              size="sm"
              variant="outline"
              color="gray"
              icon="i-heroicons-arrow-down-tray"
              @click="exportToCSV"
            >
              Export CSV
            </UButton>
            <UButton
              v-if="currentView === 'attendees'"
              size="sm"
              variant="solid"
              color="primary"
              icon="i-heroicons-plus"
              @click="showCreateModal = true"
            >
              Add Attendee
            </UButton>
          </div>
        </div>

        <!-- Search Bar -->
        <div v-if="currentView !== 'tickets' && currentView !== 'statistics'" class="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div class="flex items-center gap-3">
            <div class="flex-1 relative">
              <UIcon name="i-heroicons-magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="searchPlaceholder"
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <template v-if="currentView === 'attendees' && activeFilterCount > 0">
              <UBadge color="primary" variant="soft">{{ activeFilterCount }} filter{{ activeFilterCount > 1 ? 's' : '' }} active</UBadge>
              <UButton size="xs" variant="ghost" color="gray" @click="clearAllFilters">Clear all</UButton>
            </template>
            <UButton
              v-if="currentView === 'attendees'"
              size="sm"
              variant="outline"
              color="gray"
              icon="i-heroicons-funnel"
              class="lg:hidden"
              @click="showFilters = !showFilters"
            >
              Filters
            </UButton>
          </div>
        </div>

        <!-- Active Filter Chips -->
        <div v-if="currentView === 'attendees' && activeFilterChips.length > 0" class="px-6 py-3 border-b border-gray-100 bg-white">
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="chip in activeFilterChips"
              :key="chip.key"
              color="primary"
              variant="soft"
              class="flex items-center gap-1.5 px-2.5 py-1"
            >
              <span class="text-xs">{{ chip.label }}: {{ chip.value }}</span>
              <button
                class="hover:bg-primary/10 rounded-full p-0.5 transition-colors"
                @click="removeFilter(chip.key)"
              >
                <UIcon name="i-heroicons-x-mark" class="w-3 h-3" />
              </button>
            </UBadge>
          </div>
        </div>

        <!-- Tickets Tab -->
        <div v-if="currentView === 'tickets'">
          <TicketsTab
            :event-id="id"
            :event-pk="event?.data?.id"
            :event-start-date="event?.data?.start_datetime"
            :event-end-date="event?.data?.end_datetime"
          />
        </div>

        <!-- Loading Skeleton -->
        <div v-else-if="isViewLoading" class="p-6 space-y-3">
          <div v-for="i in 10" :key="i" class="h-16 bg-gray-100 rounded-lg animate-pulse" />
        </div>

        <!-- Empty State -->
        <div v-else-if="isViewEmpty" class="p-12 text-center">
          <UIcon :name="emptyIcon" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ emptyTitle }}</h3>
          <p class="text-sm text-gray-500 mb-4">
            {{ searchQuery || (currentView === 'attendees' && activeFilterCount > 0)
              ? 'Try adjusting your filters or search query'
              : emptyDescription }}
          </p>
          <UButton
            v-if="searchQuery || (currentView === 'attendees' && activeFilterCount > 0)"
            variant="soft"
            color="gray"
            @click="clearAllFilters"
          >
            Clear filters
          </UButton>
          <UButton
            v-else-if="currentView === 'attendees'"
            color="primary"
            @click="showCreateModal = true"
          >
            Add First Attendee
          </UButton>
        </div>

        <!-- Attendees Table -->
        <AttendeesTable
          v-else-if="currentView === 'attendees'"
          :attendees="attendees"
          :current-sort="currentSort"
          :sort-direction="sortDirection"
          :selected-attendees="selectedAttendees"
          :select-all="selectAll"
          :event-id="id"
          @set-sorting="setSorting"
          @toggle-select-all="toggleSelectAll"
          @update:selected-attendees="selectedAttendees = $event"
          @view-details="viewAttendeeDetails"
          @open-removal="openPreRemovalModal"
        />

        <!-- Bookings Table -->
        <BookingsTable
          v-else-if="currentView === 'bookings'"
          :bookings="bookings"
          :current-sort="currentSort"
          :sort-direction="sortDirection"
          @set-sorting="setSorting"
          @view-booking="viewBookingDetails"
        />

        <!-- Families Table -->
        <FamiliesTable
          v-else-if="currentView === 'families'"
          :family-groups="familyGroups"
          :current-sort="currentSort"
          :sort-direction="sortDirection"
          @set-sorting="setSorting"
          @open-family="openFamilyMembersModal"
        />

        <!-- Statistics View -->
        <div v-else-if="currentView === 'statistics'">
          <StatisticsIndex />
        </div>

        <!-- Pagination -->
        <div
          v-if="showPagination"
          class="px-6 py-4 border-t border-gray-100 flex items-center justify-between"
        >
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
              Showing {{ ((currentPage - 1) * pageSize) + 1 }} to {{ Math.min(currentPage * pageSize, paginationTotal) }} of {{ paginationTotal }}
            </span>
          </div>
          <UPagination v-model="currentPage" :page-count="pageSize" :total="paginationTotal" :max="7" />
        </div>
      </section>
    </div>

    <!-- ─── Modals ───────────────────────────────────────────────────────────── -->

    <AttendeeFiltersModal
      v-model="showFiltersModal"
      :filters="filters"
      :event-slug="id"
      :organisations="organisations"
      :areas="areas"
      :dietary-requirements="dietaryRequirements"
      :medical-conditions="medicalConditions"
      :accessibility-requirements="accessibilityRequirements"
      :event-questions="eventQuestions"
      @apply="applyFilters"
      @clear="clearAllFilters"
      @question-search-input="handleQuestionSearchInput"
    />

    <AttendeeDetailsModal
      v-model="showDetailsModal"
      :attendee="selectedAttendeeDetails"
      :event-id="id"
    />

    <BookingDetailsModal
      v-model="showBookingDetailsModal"
      :booking-id="selectedBookingId"
      :event-id="id"
      @go-to-payment="goToPaymentListFromBooking"
    />

    <FamilyMembersModal
      v-model="showFamilyMembersModal"
      :family-group="selectedFamilyGroup"
      @updated="refetchFamilyGroups"
    />

    <CreateAttendeeModal
      v-model="showCreateModal"
      :event-id="id"
      :areas="areas"
      :event-bookings="eventBookings"
    />

    <!-- Pre-removal Summary Modal -->
    <UModal v-model="showPreRemovalModal" :ui="{ width: 'sm:max-w-5xl' }">
      <PreRemovalSummaryStepper
        :summary="preRemovalSummary"
        :loading="preRemovalSummaryLoading"
        :error="preRemovalSummaryError"
        :deleting="deleteAttendeeMutation.isPending.value"
        :cancelling="cancelAttendeeMutation.isPending.value"
        :attendee-name="selectedDeleteAttendee?.full_name"
        :attendee-display-id="selectedDeleteAttendee?.attendee_display_id"
        :is-cancelled="selectedDeleteAttendee?.is_cancelled"
        :event-query-value="orderEventQueryValue"
        @close="showPreRemovalModal = false"
        @confirm-delete="confirmDeleteAttendee"
        @confirm-cancel="confirmCancelAttendee"
        @request-refund="openAttendeeRefundModalFromBlockerItem"
        @page-change="handlePreRemovalPageChange"
      />
    </UModal>

    <RefundRequestModal
      v-if="selectedDeleteAttendee && selectedRefundPaymentId"
      :open="showRefundModal"
      mode="attendee"
      :attendee="selectedDeleteAttendee"
      :payment-id="selectedRefundPaymentId"
      :is-booking-payment="isSelectedRefundBookingPayment"
      :booking-attendees="selectedRefundBookingAttendees"
      :event-detail="event?.data"
      @close="showRefundModal = false"
      @created="handleAttendeeRefundCreated"
    />
  </EventManagementLayout>
</template>

<script setup lang="ts">
import { useParticipantsUrlState } from '~/composables/participants/useParticipantsUrlState.js'
import { useParticipantsDashboardData } from '~/composables/participants/useParticipantsDashboardData'
import {
  useDeleteAttendee,
  useCancelAttendee,
  useAttendeePreRemovalSummary,
  type AttendeePreRemovalSummary,
  type AttendeePreRemovalBlockerItem,
} from '~/composables/resources/attendee/attendees'
import ParticipantsStatCards from '~/components/events/participants/ParticipantsStatCards.vue'
import AttendeesTable from '~/components/events/participants/AttendeesTable.vue'
import BookingsTable from '~/components/events/participants/BookingsTable.vue'
import FamiliesTable from '~/components/events/participants/FamiliesTable.vue'
import AttendeeDetailsModal from '~/components/events/participants/modals/AttendeeDetailsModal.vue'
import BookingDetailsModal from '~/components/events/participants/modals/BookingDetailsModal.vue'
import FamilyMembersModal from '~/components/events/participants/modals/FamilyMembersModal.vue'
import CreateAttendeeModal from '~/components/events/participants/modals/CreateAttendeeModal.vue'
import EventManagementLayout from '~/components/events/EventManagementLayout.vue'
import AttendeeFiltersModal from '~/components/attendees/AttendeeFiltersModal.vue'
import RefundRequestModal from '~/components/events/modals/RefundRequestModal.vue'
import TicketsTab from '~/components/events/participants/TicketsTab.vue'
import PreRemovalSummaryStepper from '~/components/events/participants/preRemoval/PreRemovalSummaryStepper.vue'
import StatisticsIndex from './statistics/index.vue'
import type { BookingList, FamilyGroupList } from '~/api/types.gen'
import type { ExtendedAttendeeList } from '~/composables/participants/useParticipantsDashboardData'

definePageMeta({
  layout: false,
  middleware: ['auth', 'event-permission'],
  eventPermission: {
    category: 'BOOKING_MANAGEMENT',
    action: 'read',
    deniedRedirect: '/403',
  },
})

const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.id as string)

// ─── URL state ───────────────────────────────────────────────────────────────

const {
  currentView,
  changeView,
  searchQuery,
  currentPage,
  pageSize,
  currentSort,
  sortDirection,
  setSorting,
  filters,
  activeFilterCount,
  buildActiveFilterChips,
  clearAllFilters,
  removeFilter,
  applyFilters,
  handleQuestionSearchInput,
  showFilters,
  showFiltersModal,
  queryParams,
  bookingsQueryParams,
  familyGroupsQueryParams,
  eventBookingsQueryParams,
} = useParticipantsUrlState(id)

// ─── Dashboard data ───────────────────────────────────────────────────────────

const {
  event,
  attendees,
  totalAttendees,
  isLoading,
  bookings,
  totalBookings,
  bookingsLoading,
  familyGroups,
  totalFamilyGroups,
  familyGroupsLoading,
  refetchFamilyGroups,
  familiesWithMembers,
  visibleFamilyMembers,
  eventBookings,
  organisations,
  areas,
  eventQuestions,
  dietaryRequirements,
  medicalConditions,
  accessibilityRequirements,
  checkedInCount,
  minorCount,
  staffCount,
  totalIssuedTickets,
  activeIssuedTickets,
  usedIssuedTickets,
  cancelledIssuedTickets,
  orderEventQueryValue,
} = useParticipantsDashboardData(id, queryParams, bookingsQueryParams, familyGroupsQueryParams, eventBookingsQueryParams)

// ─── Active filter chips ──────────────────────────────────────────────────────
// buildActiveFilterChips takes plain arrays and returns a computed; wrapping in
// an outer computed ensures the lookup arrays re-flow when data arrives.

const activeFilterChips = computed(() =>
  buildActiveFilterChips(
    organisations.value,
    areas.value,
    eventQuestions.value,
    dietaryRequirements.value,
    medicalConditions.value,
    accessibilityRequirements.value,
  ).value,
)

// ─── Selection state ──────────────────────────────────────────────────────────

const selectedAttendees = ref<string[]>([])
const selectAll = ref(false)

watch(selectedAttendees, (newVal) => {
  selectAll.value = newVal.length === attendees.value.length && attendees.value.length > 0
})

watch(currentPage, () => {
  selectedAttendees.value = []
  selectAll.value = false
})

function toggleSelectAll() {
  if (selectAll.value) {
    selectedAttendees.value = attendees.value.map(a => a.attendee_id)
  } else {
    selectedAttendees.value = []
  }
}

// ─── Modal state ──────────────────────────────────────────────────────────────

const showDetailsModal = ref(false)
const selectedAttendeeDetails = ref<ExtendedAttendeeList | null>(null)

const showBookingDetailsModal = ref(false)
const selectedBookingId = ref<number | null>(null)

const showFamilyMembersModal = ref(false)
const selectedFamilyGroup = ref<FamilyGroupList | null>(null)

const showCreateModal = ref(false)

// ─── Pre-removal / refund state ───────────────────────────────────────────────

const showPreRemovalModal = ref(false)
const selectedDeleteAttendee = ref<ExtendedAttendeeList | null>(null)
const preRemovalPage = ref(1)
const preRemovalPageSize = ref(10)
const showRefundModal = ref(false)
const selectedRefundPaymentId = ref<string | null>(null)
const isSelectedRefundBookingPayment = ref(false)
const selectedRefundBookingAttendees = ref<Array<{ id: string; full_name: string }> | null>(null)

const deleteAttendeeMutation = useDeleteAttendee()
const cancelAttendeeMutation = useCancelAttendee()
const toast = useToast()

const selectedDeleteAttendeeId = computed(() => selectedDeleteAttendee.value?.attendee_id || '')
const preRemovalSummaryQueryParams = computed(() => ({
  page: preRemovalPage.value,
  page_size: preRemovalPageSize.value,
}))

const {
  data: preRemovalSummaryData,
  isLoading: preRemovalSummaryLoading,
  error: preRemovalSummaryError,
} = useAttendeePreRemovalSummary(selectedDeleteAttendeeId, preRemovalSummaryQueryParams)

const preRemovalSummary = computed(() => preRemovalSummaryData.value?.data as AttendeePreRemovalSummary | undefined)

// ─── View helper computeds ────────────────────────────────────────────────────

const viewTabs = [
  { value: 'attendees' as const, label: 'Attendees' },
  { value: 'bookings' as const, label: 'Bookings' },
  { value: 'statistics' as const, label: 'Statistics' },
  { value: 'tickets' as const, label: 'Tickets' },
  { value: 'families' as const, label: 'Families' },
]

const viewIcon = computed(() => ({
  attendees: 'i-heroicons-user-group',
  bookings: 'i-heroicons-ticket',
  families: 'i-heroicons-home-modern',
  tickets: 'i-heroicons-tag',
  statistics: 'i-heroicons-chart-bar',
}[currentView.value] || 'i-heroicons-user-group'))

const viewTitle = computed(() => ({
  attendees: 'Event Participants',
  bookings: 'Event Bookings',
  families: 'Event Families',
  tickets: 'Event Tickets',
  statistics: 'Event Statistics',
}[currentView.value] || 'Participants'))

const searchPlaceholder = computed(() => ({
  attendees: 'Search by name, email, phone, or ID...',
  bookings: 'Search by booking reference...',
  families: 'Search family name...',
  statistics: 'Search statistics...',
  tickets: '',
}[currentView.value] || 'Search...'))

const isViewLoading = computed(() =>
  (currentView.value === 'attendees' && isLoading.value)
  || (currentView.value === 'bookings' && bookingsLoading.value)
  || (currentView.value === 'families' && familyGroupsLoading.value),
)

const isViewEmpty = computed(() =>
  (currentView.value === 'attendees' && attendees.value.length === 0)
  || (currentView.value === 'bookings' && bookings.value.length === 0)
  || (currentView.value === 'families' && familyGroups.value.length === 0),
)

const emptyIcon = computed(() => {
  const icons: Record<string, string> = {
    attendees: 'i-heroicons-user-group',
    bookings: 'i-heroicons-ticket',
    families: 'i-heroicons-home-modern',
  }
  return icons[currentView.value] || 'i-heroicons-user-group'
})

const emptyTitle = computed(() => {
  const titles: Record<string, string> = {
    attendees: 'No participants found',
    bookings: 'No bookings found',
    families: 'No families found',
  }
  return titles[currentView.value] || 'No results'
})

const emptyDescription = computed(() => {
  const descs: Record<string, string> = {
    attendees: 'No attendees have been registered for this event yet',
    bookings: 'No bookings have been made for this event yet',
    families: 'No family groups have been created for this event yet',
  }
  return descs[currentView.value] || ''
})

const showPagination = computed(() =>
  (currentView.value === 'attendees' && !isLoading.value && attendees.value.length > 0)
  || (currentView.value === 'bookings' && !bookingsLoading.value && bookings.value.length > 0)
  || (currentView.value === 'families' && !familyGroupsLoading.value && familyGroups.value.length > 0),
)

const paginationTotal = computed(() => {
  if (currentView.value === 'attendees') return totalAttendees.value
  if (currentView.value === 'bookings') return totalBookings.value
  return totalFamilyGroups.value
})

// ─── Modal handlers ───────────────────────────────────────────────────────────

function viewAttendeeDetails(attendee: ExtendedAttendeeList) {
  selectedAttendeeDetails.value = attendee
  showDetailsModal.value = true
}

function viewBookingDetails(booking: BookingList) {
  selectedBookingId.value = booking.id
  showBookingDetailsModal.value = true
}

function openFamilyMembersModal(group: FamilyGroupList) {
  selectedFamilyGroup.value = group
  showFamilyMembersModal.value = true
}

function goToPaymentListFromBooking(paymentReference?: string) {
  if (!paymentReference) return
  showBookingDetailsModal.value = false
  router.push({ path: `/events/${id.value}/m/payments/list`, query: { search: paymentReference } })
}

watch(showBookingDetailsModal, (isOpen) => {
  if (!isOpen) selectedBookingId.value = null
})

watch(showFamilyMembersModal, (isOpen) => {
  if (!isOpen) selectedFamilyGroup.value = null
})

// ─── Pre-removal handlers ─────────────────────────────────────────────────────

function openPreRemovalModal(attendee: ExtendedAttendeeList) {
  selectedDeleteAttendee.value = attendee
  preRemovalPage.value = 1
  selectedRefundPaymentId.value = null
  isSelectedRefundBookingPayment.value = false
  selectedRefundBookingAttendees.value = null
  showPreRemovalModal.value = true
}

function handlePreRemovalPageChange(page: number) {
  if (page < 1) return
  preRemovalPage.value = page
}

async function confirmDeleteAttendee() {
  if (!selectedDeleteAttendee.value) return
  const summary = preRemovalSummary.value
  if (!summary?.can_delete) {
    toast.add({ title: 'Deletion blocked', description: 'Resolve blockers before deleting this attendee.', color: 'orange' })
    return
  }
  try {
    await deleteAttendeeMutation.mutateAsync(selectedDeleteAttendee.value.attendee_id)
    toast.add({ title: 'Attendee removed', description: 'The attendee has been removed successfully.', color: 'green' })
    showPreRemovalModal.value = false
    selectedDeleteAttendee.value = null
  } catch (error: any) {
    toast.add({ title: 'Delete failed', description: error?.message || 'Unable to remove attendee.', color: 'red' })
  }
}

async function confirmCancelAttendee() {
  if (!selectedDeleteAttendee.value) return
  try {
    await cancelAttendeeMutation.mutateAsync({
      attendeeId: selectedDeleteAttendee.value.attendee_id,
      body: { invalidate: false },
    })
    toast.add({ title: 'Attendee cancelled', description: 'The attendee status has been set to CANCELLED.', color: 'green' })
    showPreRemovalModal.value = false
    selectedDeleteAttendee.value = null
  } catch (error: any) {
    toast.add({ title: 'Cancel failed', description: error?.message || 'Unable to cancel attendee.', color: 'red' })
  }
}

function openAttendeeRefundModalFromBlockerItem(item: AttendeePreRemovalBlockerItem) {
  if (!selectedDeleteAttendee.value) return
  if (!item.payment_id) {
    toast.add({ title: 'Payment unavailable', description: 'This blocker item does not include a payment reference.', color: 'orange' })
    return
  }
  if (item.can_request_refund === false) {
    toast.add({ title: 'Refund unavailable', description: item.refund_block_reason || 'Refund cannot be requested for this payment.', color: 'orange' })
    return
  }
  selectedRefundPaymentId.value = item.payment_id
  isSelectedRefundBookingPayment.value = item.payment_type === 'booking'
  selectedRefundBookingAttendees.value = null
  showRefundModal.value = true
}

function handleAttendeeRefundCreated() {
  showRefundModal.value = false
}

watch(showPreRemovalModal, (isOpen) => {
  if (!isOpen) {
    preRemovalPage.value = 1
    selectedRefundPaymentId.value = null
    isSelectedRefundBookingPayment.value = false
    selectedRefundBookingAttendees.value = null
    showRefundModal.value = false
  }
})

// ─── Export CSV ───────────────────────────────────────────────────────────────

function exportToCSV() {
  const headers = ['ID', 'Name', 'Email', 'Phone', 'Age', 'Gender', 'Area', 'Status', 'Minor', 'Staff']
  const rows = attendees.value.map(a => [
    a.attendee_display_id,
    a.full_name,
    a.email || '',
    a.phone_number || '',
    a.age,
    a.gender || '',
    a.area_from_name || '',
    a.is_checked_in ? 'Checked In' : 'Not Checked In',
    a.is_minor ? 'Yes' : 'No',
    a.is_event_staff ? 'Yes' : 'No',
  ])
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `attendees-${event.value?.data?.title || 'export'}-${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>
