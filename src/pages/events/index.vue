<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <div class="bg-gradient-to-br from-primary to-blue-900 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div class="text-center max-w-3xl mx-auto">
          <h1 class="text-4xl md:text-6xl font-black mb-6">
            Discover Events
          </h1>
          <p class="text-xl md:text-2xl text-blue-100 mb-8">
            Join transformative gatherings, conferences, and spiritual experiences
          </p>
          
          <!-- Search Bar -->
          <div class="relative max-w-2xl mx-auto">
            <UInput
              v-model="searchQuery"
              size="xl"
              placeholder="Search events by name, type, or organization..."
              icon="i-heroicons-magnifying-glass"
              :ui="{ icon: { trailing: { pointer: '' } } }"
            >
              <template #trailing>
                <UButton
                  v-if="searchQuery"
                  color="gray"
                  variant="link"
                  icon="i-heroicons-x-mark-20-solid"
                  :padded="false"
                  @click="searchQuery = ''"
                />
              </template>
            </UInput>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Filters and Sort -->
      <div class="flex flex-col sm:flex-row gap-4 mb-8">
        <div class="flex-1">
          <USelectMenu
            v-model="selectedFilter"
            :options="filterOptions"
            placeholder="Filter events"
            size="lg"
          />
        </div>
        <div class="sm:w-64">
          <USelectMenu
            v-model="selectedSort"
            :options="sortOptions"
            placeholder="Sort by"
            size="lg"
          />
        </div>
      </div>

      <!-- My Organizations' Events Section -->
      <div v-if="authStore.isAuthenticated && myOrganizationEvents.length > 0" class="mb-12">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Events from Your Communities</h2>
            <p class="text-gray-600 mt-1">Upcoming events from organizations you're a member of</p>
          </div>
          <UBadge size="lg" color="primary">
            {{ myOrganizationEvents.length }}
          </UBadge>
        </div>
        
        <div v-if="isLoadingMyEvents" class="flex flex-col gap-4">
          <USkeleton v-for="i in 3" :key="i" class="h-48 w-full" />
        </div>
        <div v-else class="flex flex-col gap-4">
          <EventListItem 
            v-for="event in myOrganizationEvents" 
            :key="event.event_id" 
            :event="event" 
          />
        </div>
      </div>

      <!-- All Upcoming Events Section -->
      <div>
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">
              {{ searchQuery ? 'Search Results' : 'All Upcoming Events' }}
            </h2>
            <p class="text-gray-600 mt-1">
              {{ filteredEvents.length }} {{ filteredEvents.length === 1 ? 'event' : 'events' }} available
            </p>
          </div>
        </div>
        
        <!-- Loading State -->
        <div v-if="isLoadingEvents" class="flex flex-col gap-4">
          <USkeleton v-for="i in 6" :key="i" class="h-48 w-full" />
        </div>
        
        <!-- Events Grid -->
        <div v-else-if="filteredEvents.length > 0" class="flex flex-col gap-4">
          <EventListItem 
            v-for="event in paginatedEvents" 
            :key="event.event_id" 
            :event="event" 
          />
        </div>
        
        <!-- Empty State -->
        <div v-else class="text-center py-20">
          <UIcon name="i-heroicons-calendar-days" class="w-20 h-20 mx-auto text-gray-400 mb-4" />
          <h3 class="text-xl font-semibold text-gray-900 mb-2">
            {{ searchQuery ? 'No events found' : 'No upcoming events' }}
          </h3>
          <p class="text-gray-600 mb-6">
            {{ searchQuery ? 'Try adjusting your search terms' : 'Check back later for new events' }}
          </p>
          <UButton v-if="searchQuery" @click="searchQuery = ''">
            Clear Search
          </UButton>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex justify-center mt-12">
          <UPagination
            v-model="currentPage"
            :page-count="itemsPerPage"
            :total="filteredEvents.length"
          />
        </div>
      </div>

      <!-- Call to Action -->
      <div v-if="!authStore.isAuthenticated" class="mt-16 bg-gradient-to-br from-primary/10 to-blue-50 rounded-2xl p-8 md:p-12 text-center">
        <h3 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          Join Your Faith Community
        </h3>
        <p class="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
          Sign in to see personalized events from your organizations and get early access to registration
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <UButton size="lg" to="/login" color="primary">
            Sign In
          </UButton>
          <UButton size="lg" to="/register" variant="outline" color="gray">
            Create Account
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUpcomingEvents } from '~/composables/resources/events/events'
import { useOrganisationMemberships } from '~/composables/resources/organisation/organisationMemberships'
import { useAuthStore } from '~/stores/auth'
import EventListItem from '~/components/events/display/EventListItem.vue'

definePageMeta({
  layout: 'default',
  middleware: ['auth'],
})

const authStore = useAuthStore()

// Search and filter state
const searchQuery = ref('')
const selectedFilter = ref('all')
const selectedSort = ref('date')
const currentPage = ref(1)
const itemsPerPage = 12

// Filter options
const filterOptions = [
  { label: 'All Events', value: 'all' },
  { label: 'Open for Registration', value: 'open' },
  { label: 'Published', value: 'published' },
  { label: 'In Progress', value: 'in_progress' },
]

// Sort options
const sortOptions = [
  { label: 'Date (Earliest First)', value: 'date' },
  { label: 'Date (Latest First)', value: 'date_desc' },
  { label: 'Name (A-Z)', value: 'name' },
  { label: 'Name (Z-A)', value: 'name_desc' },
]

// Fetch upcoming events
const { data: eventsData, isLoading: isLoadingEvents } = useUpcomingEvents()
const allEvents = computed(() => eventsData.value?.data?.results || [])

// Fetch user's organization memberships
const { data: membershipsData, isLoading: isLoadingMyEvents } = useOrganisationMemberships(
  computed(() => authStore.isAuthenticated ? {
    user: authStore.user?.id,
  } : undefined),
)

const userOrganizationIds = computed(() => {
  const memberships = membershipsData.value?.data?.results || []
  return memberships.map(m => m.organisation)
})

// Filter events from user's organizations
const myOrganizationEvents = computed(() => {
  if (!authStore.isAuthenticated) return []
  return allEvents.value.filter(event => 
    event.organisation && userOrganizationIds.value.includes(event.organisation)
  ).slice(0, 6) // Show max 6 events
})

// Filter and sort events
const filteredEvents = computed(() => {
  let events = allEvents.value

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    events = events.filter(event => 
      event.title.toLowerCase().includes(query) ||
      event.short_description?.toLowerCase().includes(query) ||
      event.event_type_name?.toLowerCase().includes(query) ||
      event.organisation_name?.toLowerCase().includes(query)
    )
  }

  // Filter by status
  if (selectedFilter.value !== 'all') {
    const statusMap: Record<string, string> = {
      'open': 'OPEN',
      'published': 'PUBLISHED',
      'in_progress': 'IN_PROGRESS',
    }
    events = events.filter(event => event.status === statusMap[selectedFilter.value])
  }

  // Sort events
  events = [...events].sort((a, b) => {
    switch (selectedSort.value) {
      case 'date':
        return new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime()
      case 'date_desc':
        return new Date(b.start_datetime).getTime() - new Date(a.start_datetime).getTime()
      case 'name':
        return a.title.localeCompare(b.title)
      case 'name_desc':
        return b.title.localeCompare(a.title)
      default:
        return 0
    }
  })

  return events
})

// Pagination
const totalPages = computed(() => Math.ceil(filteredEvents.value.length / itemsPerPage))

const paginatedEvents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredEvents.value.slice(start, end)
})

// Reset to page 1 when filters change
watch([searchQuery, selectedFilter, selectedSort], () => {
  currentPage.value = 1
})

// Set page metadata
useHead({
  title: 'Events - Discover Faith Gatherings',
  meta: [
    { name: 'description', content: 'Browse and join upcoming faith events, conferences, and spiritual gatherings from communities around the world.' }
  ]
})
</script>