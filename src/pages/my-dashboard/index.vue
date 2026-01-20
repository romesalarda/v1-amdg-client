<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-[1440px] mx-auto flex flex-col lg:flex-row min-h-screen">
      <!-- Sidebar -->
      <aside class="w-full lg:w-80 border-r border-gray-200 p-6 flex flex-col gap-8 bg-white/50">
        <!-- Profile Summary -->
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10">
            <div class="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl shadow-md">
              {{ userInitials }}
            </div>
            <div class="flex flex-col">
              <h3 class="font-bold text-gray-900">{{ authStore.user?.first_name }} {{ authStore.user?.last_name }}</h3>
              <p class="text-xs text-primary font-medium">{{ authStore.user?.email }}</p>
            </div>
          </div>
          
          <nav class="flex flex-col gap-1">
            <NuxtLink 
              to="/my-dashboard"
              class="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary text-white shadow-lg shadow-primary/20"
            >
              <UIcon name="i-heroicons-squares-2x2" class="text-xl" />
              <span class="text-sm font-semibold">My Dashboard</span>
            </NuxtLink>
            <NuxtLink 
              to="/events"
              class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <UIcon name="i-heroicons-magnifying-glass" class="text-xl text-gray-600" />
              <span class="text-sm font-medium">Find Events</span>
            </NuxtLink>
            <NuxtLink 
              to="/communities"
              class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <UIcon name="i-heroicons-user-group" class="text-xl text-gray-600" />
              <span class="text-sm font-medium">Faith Communities</span>
            </NuxtLink>
          </nav>
        </div>

        <!-- Mini Calendar Widget -->
        <div class="flex flex-col gap-4 p-4 rounded-2xl border border-gray-200 bg-white">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-bold">{{ currentMonthYear }}</h4>
            <div class="flex gap-1">
              <UButton
                size="xs"
                variant="ghost"
                icon="i-heroicons-chevron-left"
                @click="previousMonth"
              />
              <UButton
                size="xs"
                variant="ghost"
                icon="i-heroicons-chevron-right"
                @click="nextMonth"
              />
            </div>
          </div>
          
          <!-- Calendar Grid -->
          <div class="grid grid-cols-7 text-[10px] text-center font-bold text-gray-600 mb-2">
            <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
          </div>
          <div class="grid grid-cols-7 text-xs text-center gap-y-2">
            <div 
              v-for="day in calendarDays" 
              :key="day.key"
              :class="[
                'p-1 relative',
                day.isCurrentMonth ? '' : 'text-gray-300',
                day.isToday ? 'font-bold' : ''
              ]"
            >
              <span 
                :class="[
                  'flex items-center justify-center mx-auto',
                  day.isToday ? 'bg-primary text-white rounded-full w-5 h-5' : ''
                ]"
              >
                {{ day.day }}
              </span>
              <div 
                v-if="day.hasEvent" 
                class="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-yellow-500 rounded-full"
              ></div>
            </div>
          </div>
        </div>

        <!-- Create Event Button (Only for Controllers) -->
        <div v-if="isController" class="mt-auto">
          <UButton
            block
            size="lg"
            color="primary"
            icon="i-heroicons-plus-circle"
            class="shadow-lg shadow-primary/30"
            @click="navigateTo('/events/create')"
          >
            Post an Event
          </UButton>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 p-6 lg:p-10 flex flex-col gap-10">
        <!-- Hero Welcome Banner -->
        <section class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-blue-900 p-8 lg:p-12 text-white shadow-2xl">
          <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div class="absolute bottom-0 left-0 w-32 h-32 bg-yellow-500/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>
          
          <div class="relative z-10 max-w-2xl">
            <span class="inline-block px-3 py-1 bg-yellow-500/30 text-yellow-300 border border-yellow-400/50 rounded-full text-[10px] font-bold tracking-widest uppercase mb-4">
              Daily Inspiration
            </span>
            <h1 class="text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-4">
              Hello, {{ authStore.user?.first_name }}
            </h1>
            <p class="text-lg opacity-90 font-medium leading-relaxed">
              You have <span class="text-yellow-300 font-bold">{{ upcomingEventsCount }} upcoming {{ upcomingEventsCount === 1 ? 'event' : 'events' }}</span> this week. 
              "Ad maiorem Dei gloriam"—all for the greater glory of God.
            </p>
          </div>
        </section>

        <!-- My Upcoming Events Section -->
        <section v-if="myUpcomingEvents.length > 0">
          <div class="flex items-center justify-between mb-6 px-2">
            <h2 class="text-2xl font-bold tracking-tight border-l-4 border-yellow-500 pl-4">My Upcoming Events</h2>
            <NuxtLink to="/events" class="text-sm font-bold text-primary flex items-center gap-1">
              See all <UIcon name="i-heroicons-arrow-right" class="text-sm" />
            </NuxtLink>
          </div>
          
          <div v-if="isLoadingEvents" class="space-y-4">
            <USkeleton v-for="i in 3" :key="i" class="h-32 w-full" />
          </div>
          
          <div v-else class="space-y-4">
            <EventListItem 
              v-for="event in myUpcomingEvents" 
              :key="event.event_id" 
              :event="event" 
            />
          </div>
        </section>

        <!-- Recommended Events Section -->
        <section>
          <div class="flex items-center justify-between mb-8 px-2">
            <div class="flex flex-col">
              <h2 class="text-2xl font-bold tracking-tight border-l-4 border-yellow-500 pl-4">
                {{ recommendedTitle }}
              </h2>
              <p class="text-sm text-gray-600 pl-5 mt-1">Based on your community preferences</p>
            </div>
          </div>
          
          <div v-if="isLoadingRecommended" class="space-y-4">
            <USkeleton v-for="i in 6" :key="i" class="h-32 w-full" />
          </div>
          
          <div v-else-if="recommendedEvents.length > 0" class="space-y-4">
            <EventListItem
              v-for="event in recommendedEvents"
              :key="event.event_id"
              :event="event"
            />
          </div>
          
          <div v-else class="text-center py-20">
            <UIcon name="i-heroicons-calendar-days" class="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 class="text-xl font-semibold text-gray-900 mb-2">No events available</h3>
            <p class="text-gray-600">Check back later for new events</p>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useUpcomingEvents } from '~/composables/resources/events/events'
import { useOrganisationMemberships } from '~/composables/resources/organisation/organisationMemberships'
import { useOrganisationControls } from '~/composables/resources/organisation/organisationControls'
import { useAuthStore } from '~/stores/auth'
import { DateTime } from 'luxon'
import EventListItem from '~/components/events/display/EventListItem.vue'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()

// User initials for avatar
const userInitials = computed(() => {
  const first = authStore.user?.first_name?.[0] || ''
  const last = authStore.user?.last_name?.[0] || ''
  return (first + last).toUpperCase() || 'U'
})

// Check if user is a controller of any organization
const { data: controlsData } = useOrganisationControls(computed(() => ({
  user: authStore.user?.id,
})))
const isController = computed(() => {
  const controls = controlsData.value?.data?.results || []
  return controls.length > 0
})

// Fetch user's organization memberships
const { data: membershipsData } = useOrganisationMemberships(computed(() => ({
  user: authStore.user?.id,
})))
const userOrganizationIds = computed(() => {
  const memberships = membershipsData.value?.data?.results || []
  return memberships.map(m => m.organisation)
})

// Fetch upcoming events
const { data: eventsData, isLoading: isLoadingEvents } = useUpcomingEvents()
const allEvents = computed(() => eventsData.value?.data?.results || [])

// Filter user's upcoming events (from their organizations)
const myUpcomingEvents = computed(() => {
  return allEvents.value
    .filter(event => event.organisation && userOrganizationIds.value.includes(event.organisation))
    .slice(0, 6)
})

// Count events this week
const upcomingEventsCount = computed(() => {
  const now = DateTime.now()
  const weekFromNow = now.plus({ days: 7 })
  return myUpcomingEvents.value.filter(event => {
    const eventDate = DateTime.fromISO(event.start_datetime)
    return eventDate >= now && eventDate <= weekFromNow
  }).length
})

// Recommended events (events from other organizations)
const recommendedEvents = computed(() => {
  return allEvents.value
    .filter(event => !event.organisation || !userOrganizationIds.value.includes(event.organisation))
    .slice(0, 6)
})

const isLoadingRecommended = isLoadingEvents

const recommendedTitle = computed(() => {
  return myUpcomingEvents.value.length > 0 ? 'Discover More Events' : 'Upcoming Events'
})

// Calendar state
const currentMonth = ref(DateTime.now())

const currentMonthYear = computed(() => {
  return currentMonth.value.toFormat('MMMM yyyy')
})

const calendarDays = computed(() => {
  const start = currentMonth.value.startOf('month').startOf('week')
  const end = currentMonth.value.endOf('month').endOf('week')
  const days = []
  let current = start

  while (current <= end) {
    const eventDates = new Set(
      myUpcomingEvents.value.map(e => DateTime.fromISO(e.start_datetime).toISODate())
    )
    
    days.push({
      day: current.day,
      key: current.toISO(),
      isCurrentMonth: current.month === currentMonth.value.month,
      isToday: current.hasSame(DateTime.now(), 'day'),
      hasEvent: eventDates.has(current.toISODate())
    })
    current = current.plus({ days: 1 })
  }
  
  return days
})

const previousMonth = () => {
  currentMonth.value = currentMonth.value.minus({ months: 1 })
}

const nextMonth = () => {
  currentMonth.value = currentMonth.value.plus({ months: 1 })
}

// Set page metadata
useHead({
  title: 'My Dashboard',
  meta: [
    { name: 'description', content: 'Your personal event dashboard' }
  ]
})
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
