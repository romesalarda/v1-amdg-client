<template>
  <ManagementLayout :organisation-id="organisationId" :organisation="organisation">
    <!-- Page Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-black text-deep-navy uppercase tracking-tight">Events</h1>
          <p class="mt-2 text-sm text-deep-navy/60 font-medium">
            Manage and view all events in this community
          </p>
        </div>
      </div>
    </div>

    <!-- Compact Search Bar -->
    <div class="mb-8 bg-white border-2 border-deep-navy rounded-xl shadow-drawn p-4 space-y-4">
      <div class="flex items-center gap-0">
        <div class="relative flex-grow min-w-0">
          <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-deep-navy/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            v-model="searchQuery"
            class="w-full h-12 pl-12 pr-4 bg-transparent border-none text-sm font-medium text-deep-navy placeholder:text-deep-navy/40 focus:ring-0 outline-none" 
            placeholder="Search events..." 
            type="text"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute right-4 top-1/2 -translate-y-1/2 text-deep-navy/40 hover:text-deep-navy transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="h-8 w-px bg-deep-navy/10"></div>

        <div class="relative w-56">
          <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-deep-navy/40" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 4h18v2H3V4zm0 7h12v2H3v-2zm0 7h18v2H3v-2z"/>
          </svg>
          <select
            v-model="statusFilter"
            class="w-full h-12 pl-12 pr-10 bg-transparent border-none text-[11px] font-black uppercase tracking-wider text-deep-navy focus:ring-0 appearance-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="DRAFTING">Drafting</option>
            <option value="PUBLISHED">Published</option>
            <option value="OPEN">Open</option>
            <option value="CLOSED">Closed</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="POSTPONED">Postponed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <svg class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-deep-navy/40 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <div class="flex flex-wrap gap-3 items-center">
        <div class="relative w-52">
          <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-deep-navy/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <select
            v-model="eventTypeFilter"
            class="w-full h-11 pl-12 pr-10 bg-transparent border-2 border-deep-navy/10 rounded-lg text-[11px] font-black uppercase tracking-wider text-deep-navy focus:ring-0 appearance-none cursor-pointer"
          >
            <option value="">All Types</option>
            <option v-for="type in eventTypeOptions" :key="type.value" :value="type.value">
              {{ type.label }}
            </option>
          </select>
          <svg class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-deep-navy/40 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <div class="relative w-52">
          <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-deep-navy/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h18M3 12h12M3 20h8" />
          </svg>
          <select
            v-model="orderingFilter"
            class="w-full h-11 pl-12 pr-10 bg-transparent border-2 border-deep-navy/10 rounded-lg text-[11px] font-black uppercase tracking-wider text-deep-navy focus:ring-0 appearance-none cursor-pointer"
          >
            <option value="">Sort: Default</option>
            <option value="start_datetime">Date (Earliest)</option>
            <option value="-start_datetime">Date (Latest)</option>
            <option value="title">Name (A-Z)</option>
            <option value="-title">Name (Z-A)</option>
          </select>
          <svg class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-deep-navy/40 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <div class="relative w-48">
          <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-deep-navy/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4h10M7 8h10M7 12h10M7 16h10M7 20h10" />
          </svg>
          <select
            v-model="pageSize"
            class="w-full h-11 pl-12 pr-10 bg-transparent border-2 border-deep-navy/10 rounded-lg text-[11px] font-black uppercase tracking-wider text-deep-navy focus:ring-0 appearance-none cursor-pointer"
          >
            <option :value="10">10 per page</option>
            <option :value="25">25 per page</option>
            <option :value="50">50 per page</option>
            <option :value="100">100 per page</option>
          </select>
          <svg class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-deep-navy/40 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <div class="ml-auto text-xs text-deep-navy/60 font-medium">
          Showing {{ showingFrom }} to {{ showingTo }} of {{ totalCount }}
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="bg-white border-2 border-deep-navy rounded-xl shadow-drawn p-6">
        <USkeleton class="h-6 w-3/4 mb-3 rounded-lg" />
        <USkeleton class="h-4 w-1/2 rounded-lg" />
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-500/10 border-2 border-red-500/20 rounded-xl p-6">
      <div class="flex gap-4">
        <div class="flex-shrink-0">
          <div class="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
          </div>
        </div>
        <div class="flex-1">
          <h3 class="text-sm font-black text-deep-navy uppercase tracking-tight mb-1">Error loading events</h3>
          <p class="text-xs text-deep-navy/70 font-medium">{{ error.message }}</p>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div 
      v-else-if="!events?.length" 
      class="text-center py-16 bg-white border-2 border-deep-navy rounded-xl shadow-drawn"
    >
      <div class="w-20 h-20 mx-auto bg-deep-navy/5 rounded-xl flex items-center justify-center mb-5 border-2 border-deep-navy/10">
        <svg class="w-10 h-10 text-deep-navy/30" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
        </svg>
      </div>
      <h3 class="text-lg font-black text-deep-navy uppercase tracking-tight mb-2">No events found</h3>
      <p class="text-sm text-deep-navy/60 font-medium mb-6">
        {{ hasActiveFilters ? 'Try adjusting your filters' : 'Get started by creating your first event' }}
      </p>
      <button 
        v-if="!hasActiveFilters"
        class="inline-flex items-center gap-2 px-6 py-3 bg-deep-navy hover:bg-deep-navy/90 text-white rounded-xl font-black text-sm uppercase tracking-wider transition-all"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Create Event
      </button>
    </div>

    <!-- Events List -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <EventListItem 
        v-for="event in events" 
        :key="event.event_id"
        :event="event"
        :link-to="`/communities/${organisationId}/m/events/${event.event_id}`"
      />
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="mt-8 flex justify-center">
      <UPagination 
        v-model="currentPage"
        :total="totalCount"
        :page-count="pageSize"
        :max="7"
      />
    </div>
  </ManagementLayout>
</template>

<script setup lang="ts">
import { useEvents } from '~/composables/resources/events/events'
import { useEventTypes } from '~/composables/resources/events/eventTypes'
import { useOrganisation } from '~/composables/resources/organisation/organisations'
import EventListItem from '~/components/events/display/EventListItem.vue'
import ManagementLayout from '~/components/communities/ManagementLayout.vue'

const route = useRoute()
const organisationId = computed(() => route.params.id as string)

// Fetch organisation for the layout
const { data: orgData } = useOrganisation(Number(organisationId.value))
const organisation = computed(() => orgData.value?.data)

// State
const searchQuery = ref('')
const statusFilter = ref('')
const eventTypeFilter = ref('')
const orderingFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// Query params for API
const selectedEventTypeId = computed(() => (
  eventTypeFilter.value ? Number(eventTypeFilter.value) : undefined
))

const queryParams = computed(() => ({
  organisation: Number(organisationId.value),
  page: currentPage.value,
  page_size: pageSize.value,
  ...(statusFilter.value && { status: statusFilter.value }),
  ...(selectedEventTypeId.value && { event_type: selectedEventTypeId.value }),
  ...(orderingFilter.value && { ordering: orderingFilter.value }),
  ...(searchQuery.value && { search: searchQuery.value }),
}))

// Fetch events
const { data, isLoading, error } = useEvents(queryParams)

const events = computed(() => data.value?.data?.results || [])
const totalCount = computed(() => data.value?.data?.count || 0)
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / pageSize.value)))
const showingFrom = computed(() => (totalCount.value === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1))
const showingTo = computed(() => Math.min(currentPage.value * pageSize.value, totalCount.value))
const hasActiveFilters = computed(() => !!(searchQuery.value || statusFilter.value || eventTypeFilter.value || orderingFilter.value))

const { data: eventTypesData } = useEventTypes({ page_size: 200, ordering: 'title' })
const eventTypeOptions = computed(() =>
  (eventTypesData.value?.data?.results || []).map((type: { id: number; title?: string; name?: string }) => ({
    value: String(type.id),
    label: type.title || type.name || `Type ${type.id}`,
  }))
)

// Reset page when filters change
watch([searchQuery, statusFilter, eventTypeFilter, orderingFilter, pageSize], () => {
  currentPage.value = 1
})

definePageMeta({
  middleware: ['auth', 'organisation-controller'],
  layout: 'default',
})

</script>