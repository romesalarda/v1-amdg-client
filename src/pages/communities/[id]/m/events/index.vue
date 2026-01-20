<template>
  <ManagementLayout :organisation-id="organisationId" :organisation="organisation">
    <!-- Page Header -->
    <div class="mb-8">
    <div class="flex items-center justify-between">
        <div>
        <h1 class="text-3xl font-bold text-gray-900">Events</h1>
        <p class="mt-1 text-sm font-medium text-gray-700">
            Manage and view all events in this community
        </p>
        </div>
    </div>
    </div>

    <!-- Filters and Search -->
    <div class="mb-6 flex flex-wrap gap-4">
      <div class="flex-1 min-w-64">
        <UInput 
          v-model="searchQuery"
          icon="i-heroicons-magnifying-glass"
          placeholder="Search events..."
          size="lg"
        />
      </div>
      <USelectMenu 
        v-model="statusFilter"
        :options="statusOptions"
        placeholder="Filter by status"
        size="lg"
      />
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-4">
      <USkeleton class="h-32 w-full" v-for="i in 3" :key="i" />
    </div>

    <!-- Error State -->
    <UAlert 
      v-else-if="error" 
      color="red" 
      icon="i-heroicons-exclamation-triangle"
      title="Error loading events"
      :description="error.message"
    />

    <!-- Empty State -->
    <div 
      v-else-if="!filteredEvents?.length" 
      class="text-center py-16 bg-white rounded-lg border border-gray-300 shadow-sm"
    >
      <UIcon name="i-heroicons-calendar" class="w-16 h-16 mx-auto text-gray-400 mb-4" />
      <h3 class="text-lg font-semibold text-gray-900 mb-2">No events found</h3>
      <p class="text-gray-700 mb-6">
        {{ searchQuery || statusFilter ? 'Try adjusting your filters' : 'Get started by creating your first event' }}
      </p>
      <UButton 
        v-if="!searchQuery && !statusFilter"
        icon="i-heroicons-plus"
        color="primary"
      >
        Create Event
      </UButton>
    </div>

    <!-- Events List -->
    <div v-else class="space-y-4">
      <EventListItem 
        v-for="event in filteredEvents" 
        :key="event.event_id"
        :event="event"
        :link-to="`/communities/${organisationId}/m/events/${event.event_id}`"
      />
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="mt-8 flex justify-center">
      <UPagination 
        v-model="currentPage"
        :total="totalPages"
        :page-count="pageSize"
      />
    </div>
  </ManagementLayout>
</template>

<script setup lang="ts">
import { useEvents } from '~/composables/resources/events/events'
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
const statusFilter = ref<string | undefined>(undefined)
const currentPage = ref(1)
const pageSize = ref(10)

// Status options for filter
const statusOptions = [
  { label: 'All Statuses', value: undefined },
  { label: 'Drafting', value: 'DRAFTING' },
  { label: 'Published', value: 'PUBLISHED' },
  { label: 'Open', value: 'OPEN' },
  { label: 'Closed', value: 'CLOSED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
  { label: 'Postponed', value: 'POSTPONED' },
  { label: 'Archived', value: 'ARCHIVED' },
]

// Query params for API
const queryParams = computed(() => ({
  organisation: Number(organisationId.value),
  page: currentPage.value,
  page_size: pageSize.value,
  ...(statusFilter.value && { status: statusFilter.value }),
  ...(searchQuery.value && { search: searchQuery.value }),
}))

// Fetch events
const { data, isLoading, error } = useEvents(queryParams)

const events = computed(() => data.value?.data?.results || [])
const totalPages = computed(() => {
  if (!data.value?.data) return 1
  const total = data.value.data.count || 0
  return Math.ceil(total / pageSize.value)
})

// Client-side filtering (in addition to API filtering)
const filteredEvents = computed(() => {
  let result = events.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(event => 
      event.title?.toLowerCase().includes(query) ||
      event.short_description?.toLowerCase().includes(query) ||
      event.event_type_name?.toLowerCase().includes(query)
    )
  }

  return result
})

// Reset page when filters change
watch([searchQuery, statusFilter], () => {
  currentPage.value = 1
})
</script>