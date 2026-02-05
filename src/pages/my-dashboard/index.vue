<template>
  <div class="min-h-screen bg-background-dark">
    <div class="flex flex-col lg:flex-row min-h-screen">
      <!-- Sidebar -->
      <aside class="w-full lg:w-80 border-r border-primary/20 p-6 flex flex-col gap-8 bg-background-dark">
        <!-- Brand -->
        <div class="flex items-center gap-4">
          <div class="bg-primary flex items-center justify-center rounded-sm size-12 shadow-lg shadow-primary/20">
            <UIcon name="i-heroicons-building-office-2" class="text-background-dark text-3xl" />
          </div>
          <div class="flex flex-col">
            <h1 class="text-white text-lg font-bold leading-none tracking-tight font-display">AMDG BLUEPRINT</h1>
            <p class="text-primary text-[10px] font-medium tracking-[0.2em] uppercase">Dashboard V1.0</p>
          </div>
        </div>

        <!-- Profile Summary -->
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-4 p-4 rounded-sm bg-navy-accent/50 border border-primary/20">
            <!-- <div class="w-14 h-14 rounded-full bg-navy-accent flex items-center justify-center font-bold text-xl shadow-md">
              {{ userInitials }}
            </div> -->
            <div class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              <img
                v-if="profileData?.profile_picture_url"
                :src="resolveImageUrl(profileData.profile_picture_url)"
                :alt="`${userData?.display_name}'s profile`"
                class="w-full h-full object-cover"
                @error="(e) => onImageError(e)"
              />
              <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-yellow-600 text-background-dark font-semibold text-sm">
                {{ getInitials(userData?.display_name) }}
              </div>
            </div>
            <div class="flex flex-col">
              <h3 class="font-bold text-white">{{ authStore.user?.first_name }} {{ authStore.user?.last_name }}</h3>
              <p class="text-xs text-primary font-medium">{{ authStore.user?.email }}</p>
            </div>
          </div>
          
          <nav class="flex flex-col gap-2">
            <NuxtLink 
              to="/my-dashboard"
              class="flex items-center gap-4 px-4 py-3 rounded-sm bg-primary text-background-dark font-bold group transition-all"
            >
              <UIcon name="i-heroicons-squares-2x2" class="text-xl" />
              <span class="text-sm">Dashboard</span>
            </NuxtLink>
            <NuxtLink 
              to="/events"
              class="flex items-center gap-4 px-4 py-3 rounded-sm hover:bg-white/5 text-white/70 hover:text-primary transition-all"
            >
              <UIcon name="i-heroicons-magnifying-glass" class="text-xl" />
              <span class="text-sm font-medium">Find Events</span>
            </NuxtLink>
            <NuxtLink 
              to="/communities"
              class="flex items-center gap-4 px-4 py-3 rounded-sm hover:bg-white/5 text-white/70 hover:text-primary transition-all"
            >
              <UIcon name="i-heroicons-user-group" class="text-xl" />
              <span class="text-sm font-medium">Communities</span>
            </NuxtLink>
            <NuxtLink 
              to="/settings"
              class="flex items-center gap-4 px-4 py-3 rounded-sm hover:bg-white/5 text-white/70 hover:text-primary transition-all"
            >
              <UIcon name="i-heroicons-cog-6-tooth" class="text-xl" />
              <span class="text-sm font-medium">Settings</span>
            </NuxtLink>
            <div class="my-4 border-t border-primary/10"></div>

            <div v-if="isController">
              <button
                @click="navigateTo('/events/create')"
                class="w-full py-4 bg-primary text-background-dark text-xs font-black tracking-widest uppercase rounded-sm hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                <UIcon name="i-heroicons-plus-circle" class="text-sm" />
                Create Event
              </button>
            </div>
          </nav>
        </div>

        <!-- Mini Calendar Widget -->
        <div class="flex flex-col gap-4 p-4 rounded-sm border border-primary/20 bg-navy-accent/30">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold text-white uppercase tracking-[0.2em]">{{ currentMonthYear }}</h4>
            <div class="flex gap-1">
              <button
                @click="previousMonth"
                class="p-1 hover:bg-primary/10 rounded text-primary transition-colors"
              >
                <UIcon name="i-heroicons-chevron-left" class="text-sm" />
              </button>
              <button
                @click="nextMonth"
                class="p-1 hover:bg-primary/10 rounded text-primary transition-colors"
              >
                <UIcon name="i-heroicons-chevron-right" class="text-sm" />
              </button>
            </div>
          </div>
          
          <!-- Calendar Grid -->
          <div class="grid grid-cols-7 text-[10px] text-center font-bold text-primary/60 mb-2 uppercase tracking-wider">
            <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
          </div>
          <div class="grid grid-cols-7 text-xs text-center gap-y-2">
            <div 
              v-for="day in calendarDays" 
              :key="day.key"
              :class="[
                'p-1 relative',
                day.isCurrentMonth ? 'text-white/70' : 'text-white/20',
                day.isToday ? 'font-bold' : ''
              ]"
            >
              <span 
                :class="[
                  'flex items-center justify-center mx-auto',
                  day.isToday ? 'bg-primary text-background-dark rounded-full w-5 h-5 font-black' : ''
                ]"
              >
                {{ day.day }}
              </span>
              <div 
                v-if="day.hasEvent" 
                class="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
              ></div>
            </div>
          </div>
        </div>

        <!-- Create Event Button (Only for Controllers) -->
        
      </aside>

      <!-- Main Content -->
      <main class="flex-1 blueprint-grid">
        <div class="px-12">
          <!-- Hero Section with Technical Annotations -->
          <div class="relative max-w-6xl mx-auto mt-4">
            <!-- Technical Header Info -->
            <div class="flex justify-between items-end mb-4 border-b border-primary/20 pb-2">
              <div class="text-[10px] text-primary/60 font-mono">DASHBOARD_ID: {{ authStore.user?.id }} // SCALE: 1:100</div>
              <div class="text-[10px] text-primary/60 font-mono uppercase tracking-widest">Revision: {{ currentDate }}</div>
            </div>

            <div class="relative group">
              <div class="aspect-[30/9] w-full bg-cover bg-center rounded-sm overflow-hidden border border-primary/30 relative" 
                   style="background-image: linear-gradient(rgba(10, 25, 47, 0.7), rgba(10, 25, 47, 0.7)), url('https://images.unsplash.com/photo-1520069853743-c3b52c6c8dcb?w=1200');">
                <!-- Hero Content -->
                <div class="absolute inset-0 flex flex-col justify-center px-20">
                  <span class="text-primary text-xs font-bold tracking-[0.4em] uppercase mb-4 opacity-80">[USER_ID:{{ authStore.user?.id }}] INITIALIZING_SEQUENCE</span>
                  <h1 class="text-white text-6xl font-black leading-tight tracking-tighter mb-6 max-w-2xl font-display">
                    Welcome, <span class="text-primary italic">{{ authStore.user?.first_name }}</span>
                  </h1>
                  <p class="text-white/60 text-lg max-w-xl font-light leading-relaxed mb-2">
                    You have <span class="text-primary font-bold">{{ upcomingEventsCount }} upcoming {{ upcomingEventsCount === 1 ? 'event' : 'events' }}</span> this week. 
                    "Ad maiorem Dei gloriam"—all for the greater glory of God.
                  </p>
                </div>

                <!-- Decorative Blueprint Lines -->
                <div class="absolute top-10 right-10 flex flex-col items-end gap-1 opacity-40">
                  <div class="w-32 h-px bg-primary"></div>
                  <div class="w-24 h-px bg-primary"></div>
                  <span class="text-[8px] text-primary font-mono mt-1">AXIS_REF_01</span>
                </div>
              </div>

              <!-- Dimension Annotations -->
              <div class="absolute -left-6 top-1/2 -translate-y-1/2 [writing-mode:vertical-lr] text-[10px] text-primary/50 font-mono tracking-widest hidden lg:block">
                HEIGHT: 580.00px
              </div>
            </div>
          </div>

          <!-- My Upcoming Events Section -->
          <section v-if="myUpcomingEvents.length > 0" class="max-w-6xl mx-auto mt-10">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="text-white text-3xl font-bold tracking-tight mb-1 font-display">Upcoming events // <span class="text-primary">Stage: Incoming</span></h2>
                <p class="text-primary/60 text-xs font-mono tracking-wider">ACTIVE_RESOURCES_ALLOCATED: {{ myUpcomingEvents.length.toString().padStart(2, '0') }}</p>
              </div>
              <div class="flex gap-2 items-center">
                <div class="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
                <span class="text-[10px] text-white/50 font-bold uppercase tracking-widest">System Operational</span>
              </div>
            </div>
            
            <div v-if="isLoadingEvents" class="space-y-4">
              <USkeleton v-for="i in 3" :key="i" class="h-32 w-full" />
            </div>
            
            <div v-else class="space-y-4">
              <div 
                v-for="(event, index) in myUpcomingEvents" 
                :key="event.event_id"
                class="group cursor-pointer"
                @click="router.push(`/events/${event.event_id}/`)"
              >
                <div class="relative rounded-sm border border-primary/20 bg-navy-accent/30 overflow-hidden transition-all hover:border-primary/60 p-6">
                  <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center gap-3">
                      <span class="bg-primary text-background-dark text-[10px] px-2 py-0.5 font-black uppercase">UPCOMING</span>
                      <span class="text-primary/40 font-mono text-[10px]">#{{ (index + 1).toString().padStart(3, '0') }}-2024</span>
                    </div>
                    <div class="flex items-center gap-2 text-[10px] text-primary/60 font-mono">
                      <UIcon name="i-heroicons-calendar" class="text-xs" />
                      {{ formatEventDate(event.start_datetime) }}
                    </div>
                  </div>
                  
                  <h3 class="text-white font-bold text-xl mb-2 leading-tight group-hover:text-primary transition-colors">{{ event.title }}</h3>
                  
                  <div class="flex items-center gap-4 text-[10px] text-primary/60 font-mono">
                    <div class="flex items-center gap-1" v-if="event.organisation_name">
                      <UIcon name="i-heroicons-building-office" class="text-xs" />
                      {{ event.organisation_name }}
                    </div>
                    <!-- <div class="flex items-center gap-1" v-if="event.location">
                      <UIcon name="i-heroicons-map-pin" class="text-xs" />
                      {{ event.location }}
                    </div> -->
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Staff Events Section -->
          <section v-if="staffEvents.length > 0" class="max-w-6xl mx-auto mt-16">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="text-white text-3xl font-bold tracking-tight mb-1 font-display">Staffing Assignments // <span class="text-primary">Stage: Operational</span></h2>
                <p class="text-primary/60 text-xs font-mono tracking-wider">ASSIGNED_PROJECTS: {{ staffEvents.length.toString().padStart(2, '0') }}</p>
              </div>
            </div>
            
            <div v-if="isLoadingStaff" class="space-y-4">
              <USkeleton v-for="i in 3" :key="i" class="h-32 w-full" />
            </div>
            
            <div v-else class="space-y-4">
              <div 
                v-for="(event, index) in staffEvents" 
                :key="'staff-' + event.event_id"
                class="group cursor-pointer"
                @click="router.push(`/events/${event.event_id}/m/dashboard`)"
              >
                <div class="relative rounded-sm border border-primary/20 bg-navy-accent/30 overflow-hidden transition-all hover:border-primary/60 p-6">
                  <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center gap-3">
                      <span class="bg-purple-500/20 text-purple-400 text-[10px] px-2 py-0.5 font-black uppercase border border-purple-400/40">STAFF</span>
                      <span class="text-primary/40 font-mono text-[10px]">#S{{ (index + 1).toString().padStart(3, '0') }}-2024</span>
                    </div>
                    <div class="flex items-center gap-2 text-[10px] text-primary/60 font-mono">
                      <UIcon name="i-heroicons-calendar" class="text-xs" />
                      {{ formatEventDate(event.start_datetime) }}
                    </div>
                  </div>
                  
                  <h3 class="text-white font-bold text-xl mb-2 leading-tight group-hover:text-primary transition-colors">{{ event.title }}</h3>
                  
                  <div class="flex items-center gap-4 text-[10px] text-primary/60 font-mono">
                    <div class="flex items-center gap-1">
                      <UIcon name="i-heroicons-shield-check" class="text-xs" />
                      Staff Member
                    </div>
                    <div class="flex items-center gap-1" v-if="event.organisation_name">
                      <UIcon name="i-heroicons-building-office" class="text-xs" />
                      {{ event.organisation_name }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Recommended Events Section -->
          <section class="max-w-6xl mx-auto mt-16 mb-20">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="text-white text-3xl font-bold tracking-tight mb-1 font-display">{{ recommendedTitle }} // <span class="text-primary">Stage: Discovery</span></h2>
                <p class="text-primary/60 text-xs font-mono tracking-wider">AVAILABLE_OPPORTUNITIES: {{ recommendedEvents.length.toString().padStart(2, '0') }}</p>
              </div>
            </div>
            
            <div v-if="isLoadingRecommended" class="space-y-4">
              <USkeleton v-for="i in 6" :key="i" class="h-32 w-full" />
            </div>
            
            <div v-else-if="recommendedEvents.length > 0" class="space-y-4">
              <div 
                v-for="(event, index) in recommendedEvents" 
                :key="event.event_id"
                @click="router.push(`/events/${event.event_id}`)"
                class="group cursor-pointer"
              >
                <div class="relative rounded-sm border border-primary/20 bg-navy-accent/30 overflow-hidden transition-all hover:border-primary/60 p-6">
                  <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center gap-3">
                      <span class="bg-primary/20 text-primary text-[10px] px-2 py-0.5 font-black uppercase border border-primary/40">DISCOVER</span>
                      <span class="text-primary/40 font-mono text-[10px]">#D{{ (index + 1).toString().padStart(3, '0') }}-2024</span>
                    </div>
                    <div class="flex items-center gap-2 text-[10px] text-primary/60 font-mono">
                      <UIcon name="i-heroicons-calendar" class="text-xs" />
                      {{ formatEventDate(event.start_datetime) }}
                    </div>
                  </div>
                  
                  <h3 class="text-white font-bold text-xl mb-2 leading-tight group-hover:text-primary transition-colors">{{ event.title }}</h3>
                  
                  <div class="flex items-center gap-4 text-[10px] text-primary/60 font-mono">
                    <div class="flex items-center gap-1" v-if="event.organisation_name">
                      <UIcon name="i-heroicons-building-office" class="text-xs" />
                      {{ event.organisation_name }}
                    </div>
                    <!-- <div class="flex items-center gap-1" v-if="event.location">
                      <UIcon name="i-heroicons-map-pin" class="text-xs" />
                      {{ event.location }}
                    </div> -->
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else class="text-center py-20 bg-navy-accent/20 border border-primary/10 rounded-sm">
              <UIcon name="i-heroicons-calendar-days" class="w-16 h-16 mx-auto text-primary/40 mb-4" />
              <h3 class="text-xl font-semibold text-white mb-2">No events available</h3>
              <p class="text-white/50">Check back later for new events</p>
            </div>
          </section>

          <!-- Designer's Notes -->
          <div class="max-w-6xl mx-auto mb-20">
            <div class="bg-white/5 border border-primary/10 rounded-sm p-8 relative overflow-hidden">
              <div class="absolute top-0 right-0 p-4 opacity-10">
                <UIcon name="i-heroicons-pencil-square" class="text-8xl text-primary" />
              </div>
              <h3 class="text-primary text-sm font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <span class="w-8 h-px bg-primary"></span>
                Designer's Notes
              </h3>
              <blockquote class="text-2xl font-light italic text-white/90 max-w-3xl leading-relaxed font-display">
                "The architect must be a person of prayer. For we do not build just for the eyes of men, but to create a space where the soul can meet its Creator in the silence of beauty."
              </blockquote>
              <div class="mt-6 flex items-center gap-4">
                <div class="w-12 h-px bg-primary/40"></div>
                <p class="text-primary/60 text-xs font-mono uppercase tracking-widest">A. Gaudí [Ref. Transmitted 1926]</p>
              </div>
            </div>
          </div>

          <!-- Footer Stats / Tech Specs -->
          <footer class="max-w-6xl mx-auto pb-12">
            <div class="flex flex-wrap gap-8 justify-between items-center py-6 border-t border-primary/20">
              <div class="flex gap-12">
                <div class="flex flex-col">
                  <span class="text-[10px] text-primary/40 font-mono uppercase">Version</span>
                  <span class="text-xs font-bold text-white/70 tracking-widest">3.0.0-PROD</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-[10px] text-primary/40 font-mono uppercase">Last Login</span>
                  <span class="text-xs font-bold text-white/70 tracking-widest">{{ formatCurrentDate }}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-[10px] text-primary/40 font-mono uppercase">User Status</span>
                  <span class="text-xs font-bold text-white/70 tracking-widest">{{ isController ? 'CONTROLLER' : 'MEMBER' }}</span>
                </div>
              </div>
              <div class="flex items-center gap-6">
                <span class="text-[10px] text-primary font-bold uppercase tracking-tighter">Ad Maiorem Dei Gloriam</span>
                <div class="flex gap-4">
                  <UIcon name="i-heroicons-command-line" class="text-primary/40 hover:text-primary cursor-pointer transition-colors" />
                  <UIcon name="i-heroicons-squares-2x2" class="text-primary/40 hover:text-primary cursor-pointer transition-colors" />
                  <UIcon name="i-heroicons-question-mark-circle" class="text-primary/40 hover:text-primary cursor-pointer transition-colors" />
                </div>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useUpcomingEvents } from '~/composables/resources/events/events'
import { useOrganisationMemberships } from '~/composables/resources/organisation/organisationMemberships'
import { useOrganisationControls } from '~/composables/resources/organisation/organisationControls'
import { useEventStaff } from '~/composables/resources/events/eventStaff'
import { useAuthStore } from '~/stores/auth'
import { DateTime } from 'luxon'
import { resolveImageUrl, onImageError } from '~/utils/image'

definePageMeta({
  middleware: 'auth'
})

const router = useRouter()

const authStore = useAuthStore()

const userData = computed(() => authStore.user)
const profileData = computed(() => authStore.user?.profile)

// User initials for avatar
const userInitials = computed(() => {
  const first = authStore.user?.first_name?.[0] || ''
  const last = authStore.user?.last_name?.[0] || ''
  return (first + last).toUpperCase() || 'U'
})

// Current date for technical header
const currentDate = computed(() => {
  return DateTime.now().toFormat('yyyy.MM.dd')
})

const formatCurrentDate = computed(() => {
  return DateTime.now().toFormat('MMM_dd_yyyy').toUpperCase()
})

// Format event date
const formatEventDate = (dateString: string) => {
  return DateTime.fromISO(dateString).toFormat('MMM dd, yyyy').toUpperCase()
}

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

// Fetch staff assignments for current user
const { data: staffData, isLoading: isLoadingStaff } = useEventStaff(computed(() => ({
  user: authStore.user?.id,
})))
const staffAssignments = computed(() => staffData.value?.data?.results || [])

// Get event IDs where user is staff
const staffEventIds = computed(() => {
  return new Set(staffAssignments.value.map(s => s.event))
})

// Filter user's upcoming events (from their organizations, excluding staff events)
const myUpcomingEvents = computed(() => {
  return allEvents.value
    .filter(event => 
      event.organisation && 
      userOrganizationIds.value.includes(event.organisation) &&
      !staffEventIds.value.has(event.id)
    )
    .slice(0, 6)
})

// Events where user is staff
const staffEvents = computed(() => {
  return allEvents.value
    .filter(event => staffEventIds.value.has(event.id))
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

// Recommended events (events from other organizations, excluding staff events)
const recommendedEvents = computed(() => {
  return allEvents.value
    .filter(event => 
      (!event.organisation || !userOrganizationIds.value.includes(event.organisation)) &&
      !staffEventIds.value.has(event.id)
    )
    .slice(0, 6)
})

const isLoadingRecommended = isLoadingEvents

const recommendedTitle = computed(() => {
  return myUpcomingEvents.value.length > 0 ? 'Discover More Events' : 'Upcoming Events'
})

// Calendar state
const currentMonth = ref(DateTime.now())

const currentMonthYear = computed(() => {
  return currentMonth.value.toFormat('MMM yyyy').toUpperCase()
})

const calendarDays = computed(() => {
  const start = currentMonth.value.startOf('month').startOf('week')
  const end = currentMonth.value.endOf('month').endOf('week')
  const days = []
  let current = start

  while (current <= end) {
    const eventDates = new Set([
      ...myUpcomingEvents.value.map(e => DateTime.fromISO(e.start_datetime).toISODate()),
      ...staffEvents.value.map(e => DateTime.fromISO(e.start_datetime).toISODate())
    ])
    
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
  title: 'My Dashboard - AMDG Blueprint',
  meta: [
    { name: 'description', content: 'Your personal event dashboard' }
  ]
})
</script>

<style scoped>
.blueprint-grid {
  background-image: radial-gradient(rgba(236, 200, 19, 0.1) 1px, transparent 1px);
  background-size: 30px 30px;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
