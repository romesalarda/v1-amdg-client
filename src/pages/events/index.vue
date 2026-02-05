<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <section class="max-w-8xl mx-auto px-6 lg:px-10 py-8">
      <div class="text-center mb-6">
        <div class="mb-3 flex justify-center items-center gap-4 opacity-40">
          <div class="h-[1px] w-12 bg-primary"></div>
          <span class="text-[10px] uppercase tracking-[0.5em] text-primary">Event Registry</span>
          <div class="h-[1px] w-12 bg-primary"></div>
        </div>

        <h1 class="text-white font-light text-3xl md:text-5xl leading-tight">
          Discover <span class="gold-gradient-text italic font-black glow-gold">Events</span>
        </h1>
      </div>
      
      <!-- Partial width 50% -->
      <div class="flex gap-2 w-10/12 mx-auto mb-8">
        <div class="flex-1 relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search events..."
            class="w-full h-10 px-4 pl-10 bg-navy-accent/60 border border-primary/30 text-white placeholder-white/60 focus:outline-none focus:border-primary/60 transition-colors"
          />
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="w-48">
          <select
            v-model="selectedFilter"
            class="w-full h-10 px-4 bg-navy-accent/60 border border-primary/30 text-white focus:outline-none focus:border-primary/60 transition-colors"
          >
            <option value="all">All Events</option>
            <option value="open">Open for Registration</option>
            <option value="published">Published</option>
            <option value="in_progress">In Progress</option>
          </select>
        </div>
        <div class="w-48">
          <select
            v-model="selectedSort"
            class="w-full h-10 px-4 bg-navy-accent/60 border border-primary/30 text-white focus:outline-none focus:border-primary/60 transition-colors"
          >
            <option value="date">Date (Earliest First)</option>
            <option value="date_desc">Date (Latest First)</option>
            <option value="name">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
          </select>
        </div>
        <div class="flex items-center px-3">
          <span class="text-xs text-primary/60 font-mono uppercase tracking-wider whitespace-nowrap">
            {{ filteredEvents.length }} {{ filteredEvents.length === 1 ? 'event' : 'events' }}
          </span>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <div class="max-w-8xl mx-auto px-6 lg:px-10 py-4">

      <!-- All Events Section -->
      <div>
        <!-- Loading State -->
        <div v-if="isLoadingEvents" class="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-3">
          <USkeleton v-for="i in 6" :key="i" class="h-80 w-full" />
        </div>
        
        <!-- Events Grid -->
        <div v-else-if="filteredEvents.length > 0" class="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-3">
          <EventBlueprintCard 
            v-for="event in paginatedEvents" 
            :key="event.event_id" 
            :event="event" 
          />
        </div>
        
        <!-- Empty State -->
        <div v-else class="text-center py-20">
          <div class="architectural-border p-12 bg-background-dark/40 max-w-2xl mx-auto">
            <UIcon name="i-heroicons-calendar-days" class="w-20 h-20 mx-auto text-primary/40 mb-6" />
            <h3 class="text-2xl font-bold text-white mb-3 uppercase tracking-wide">
              {{ searchQuery ? 'No events found' : 'No upcoming events' }}
            </h3>
            <p class="text-white/60 mb-8">
              {{ searchQuery ? 'Try adjusting your search terms' : 'Check back later for new events' }}
            </p>
            <UButton 
              v-if="searchQuery" 
              @click="searchQuery = ''"
              class="bg-primary text-background-dark px-8 py-3 font-bold uppercase tracking-widest text-sm"
            >
              Clear Search
            </UButton>
          </div>
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
      <div v-if="!authStore.isAuthenticated" class="mt-16">
        <div class="architectural-border p-12 bg-background-dark/60 text-center max-w-3xl mx-auto">
          <div class="mb-6 inline-block border border-primary/60 px-4 py-2">
            <span class="text-[10px] uppercase tracking-[0.3em] text-primary font-mono">Access Required</span>
          </div>
          <h3 class="text-3xl font-bold text-white mb-4 uppercase tracking-wide">
            Join Your Faith Community
          </h3>
          <p class="text-lg text-white/60 mb-8 max-w-2xl mx-auto leading-relaxed">
            Sign in to see personalized events from your organizations and get early access to registration
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <UButton 
              size="lg" 
              to="/login"
              class="bg-primary text-background-dark px-10 py-4 font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform"
            >
              Sign In
            </UButton>
            <UButton 
              size="lg" 
              to="/register"
              class="border border-primary/20 text-white px-10 py-4 font-bold uppercase tracking-widest text-sm hover:border-primary transition-colors"
            >
              Create Account
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUpcomingEvents } from '~/composables/resources/events/events'
import { useOrganisationMemberships } from '~/composables/resources/organisation/organisationMemberships'
import { useAuthStore } from '~/stores/auth'
import EventBlueprintCard from '~/components/events/display/EventBlueprintCard.vue'

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
<style scoped>
.gold-gradient-text {
  background: linear-gradient(to bottom, #fceabb 0%, #ecc813 50%, #c49300 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
