<template>
  <div class="min-h-screen bg-background-dark">
    <!-- Loading State -->
    <div v-if="isLoading" class="w-full">
      <USkeleton class="h-screen w-full" />
    </div>

    <!-- Event Content -->
    <div v-else-if="event">
      <!-- Full-Width Hero Section with Landing Image -->
      <div class="relative h-[400px] md:h-[500px] w-full overflow-hidden">
        <!-- Background Image -->
        <div class="absolute inset-0">
          <img
            v-if="event.main_landing_image?.image"
            :src="resolveImageUrl(event.main_landing_image.image)"
            :alt="event.title"
            class="w-full h-full object-cover"
            @error="(e) => onImageError(e)"
          />
          <!-- Placeholder gradient when no image -->
          <div v-else class="w-full h-full bg-gradient-to-br from-primary/20 to-navy-accent"></div>
        </div>
        
        <!-- Navy overlay with blueprint effect -->
        <div class="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/70 to-transparent"></div>
        
        <!-- Blueprint grid overlay -->
        <div class="absolute inset-0 opacity-30" style="background-image: radial-gradient(rgba(236, 200, 19, 0.15) 1px, transparent 1px); background-size: 30px 30px;"></div>
        
        <!-- Content Overlay -->
        <div class="absolute inset-0 flex items-end">
          <div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            <!-- Technical Header Annotations -->
            <div class="flex items-center gap-4 mb-6 text-[10px] font-mono text-primary/60 uppercase tracking-wider">
              <span>EVENT_ID: {{ event.event_id }}</span>
              <span class="w-px h-3 bg-primary/40"></span>
              <span>TYPE: {{ event.event_type_details?.title || 'General' }}</span>
              <span class="w-px h-3 bg-primary/40"></span>
              <span>STATUS: {{ event.status_display }}</span>
            </div>

            <!-- Main Title -->
            <h1 class="text-5xl md:text-7xl lg:text-8xl font-black text-white drop-shadow-2xl leading-none mb-6 font-display">
              <span class="gold-gradient-text">
                {{ event.title }}
              </span>
            </h1>

            <!-- Description -->
            <p v-if="event.short_description" class="text-xl md:text-2xl text-white/90 font-medium max-w-3xl mb-8">
              {{ event.short_description }}
            </p>

            <!-- Quick Stats Bar -->
            <div class="flex flex-wrap gap-6 text-primary">
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-calendar-days" class="w-5 h-5" />
                <span class="font-bold">{{ formatDate(event.start_datetime, 'MMM d, yyyy') }}</span>
              </div>
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-clock" class="w-5 h-5" />
                <span class="font-bold">{{ formatTime(event.start_datetime, event.timezone) }}</span>
              </div>
              <div v-if="primaryVenue" class="flex items-center gap-2">
                <UIcon name="i-heroicons-map-pin" class="w-5 h-5" />
                <span class="font-bold">{{ primaryVenue.venue_name }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Back button overlay -->
        <div class="absolute top-6 left-6">
          <button
            @click="navigateTo('/events')"
            class="flex items-center gap-2 px-4 py-2 bg-navy-accent/80 backdrop-blur-sm border border-primary/30 rounded-sm text-primary hover:bg-navy-accent hover:border-primary/60 transition-all font-bold text-sm uppercase"
          >
            <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" />
            <span class="hidden sm:inline">Back to Events</span>
          </button>
        </div>
      </div>

      <!-- Sticky Floating Info Bar -->
      <div class="sticky top-20 z-40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-25 mb-16">
        <div class="bg-navy-accent/95 backdrop-blur-xl border border-primary/30 rounded-xl shadow-2xl overflow-hidden">
          <div class="grid grid-cols-2 lg:grid-cols-4 divide-x divide-primary/20">
            <!-- Date -->
            <div class="flex items-center gap-2.5 p-3 lg:p-4">
              <div class="w-9 h-9 rounded-sm bg-primary/20 border border-primary/40 flex items-center justify-center flex-shrink-0">
                <UIcon name="i-heroicons-calendar-days" class="w-4 h-4 text-primary" />
              </div>
              <div class="min-w-0">
                <h3 class="text-[9px] font-black text-primary/50 uppercase tracking-wider mb-0.5">Date</h3>
                <p class="text-white font-bold text-sm lg:text-base truncate">{{ formatDate(event.start_datetime, 'MMM d, yyyy') }}</p>
              </div>
            </div>

            <!-- Time -->
            <div class="flex items-center gap-2.5 p-3 lg:p-4">
              <div class="w-9 h-9 rounded-sm bg-primary/20 border border-primary/40 flex items-center justify-center flex-shrink-0">
                <UIcon name="i-heroicons-clock" class="w-4 h-4 text-primary" />
              </div>
              <div class="min-w-0">
                <h3 class="text-[9px] font-black text-primary/50 uppercase tracking-wider mb-0.5">Time</h3>
                <p class="text-white font-bold text-sm lg:text-base truncate">
                  {{ formatTime(event.start_datetime, event.timezone) }}
                </p>
              </div>
            </div>

            <!-- Location -->
            <div class="flex items-center gap-2.5 p-3 lg:p-4">
              <div class="w-9 h-9 rounded-sm bg-primary/20 border border-primary/40 flex items-center justify-center flex-shrink-0">
                <UIcon name="i-heroicons-map-pin" class="w-4 h-4 text-primary" />
              </div>
              <div class="min-w-0">
                <h3 class="text-[9px] font-black text-primary/50 uppercase tracking-wider mb-0.5">Location</h3>
                <p class="text-white font-bold text-sm lg:text-base truncate">
                  {{ primaryVenue?.venue_name || event.organisation_name || 'TBA' }}
                </p>
              </div>
            </div>

            <!-- Capacity -->
            <div class="flex items-center gap-2.5 p-3 lg:p-4">
              <div class="w-9 h-9 rounded-sm bg-primary/20 border border-primary/40 flex items-center justify-center flex-shrink-0">
                <UIcon name="i-heroicons-users" class="w-4 h-4 text-primary" />
              </div>
              <div class="min-w-0">
                <h3 class="text-[9px] font-black text-primary/50 uppercase tracking-wider mb-0.5">Capacity</h3>
                <p class="text-white font-bold text-sm lg:text-base truncate">
                  {{ event.maximum_attendance ? `${event.maximum_attendance.toLocaleString()}` : 'Unlimited' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Container (max-w-7xl) -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">

        <!-- Content Grid: 2/3 Main + 1/3 Sidebar -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Main Content (2/3) -->
          <div class="lg:col-span-2 space-y-6">
            <!-- About Section -->
            <div class="bg-navy-accent border border-primary/20 rounded-sm p-8">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-1 h-8 bg-primary"></div>
                <h2 class="text-2xl font-bold text-white font-display">About the Event</h2>
              </div>
              <div class="text-white/80 text-base leading-relaxed whitespace-pre-line">
                {{ event.long_description || event.short_description || 'No description available.' }}
              </div>
            </div>

            <!-- Theme & Verse -->
            <div v-if="event.theme || event.anchor_verse" class="bg-gradient-to-br from-primary/10 to-navy-accent/50 border border-primary/30 rounded-sm p-8">
              <h3 v-if="event.theme" class="text-2xl font-bold text-primary mb-4 font-display">
                Theme: {{ event.theme }}
              </h3>
              <blockquote v-if="event.anchor_verse" class="border-l-4 border-primary pl-6 italic text-white/90 text-lg">
                "{{ event.anchor_verse }}"
              </blockquote>
            </div>

            <!-- What to Bring -->
            <div v-if="event.what_to_bring" class="bg-navy-accent/30 border border-primary/20 rounded-sm p-8">
              <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <div class="w-10 h-10 rounded-sm bg-primary flex items-center justify-center">
                  <UIcon name="i-heroicons-backpack" class="w-5 h-5 text-background-dark" />
                </div>
                What to Bring
              </h2>
              <p class="text-white/80 whitespace-pre-line leading-relaxed">{{ event.what_to_bring }}</p>
            </div>

            <!-- Important Information -->
            <div v-if="event.important_information" class="bg-amber-500/10 border border-amber-500/30 rounded-sm p-8">
              <h2 class="text-xl font-bold text-amber-400 mb-4 flex items-center gap-3">
                <div class="w-10 h-10 rounded-sm bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                  <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-amber-400" />
                </div>
                Important Information
              </h2>
              <p class="text-amber-200/90 whitespace-pre-line leading-relaxed">{{ event.important_information }}</p>
            </div>

            <!-- Venue Location -->
            <div v-if="primaryVenue" class="bg-navy-accent border border-primary/20 rounded-sm overflow-hidden">
              <div class="p-8">
                <h2 class="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <div class="w-10 h-10 rounded-sm bg-primary flex items-center justify-center">
                    <UIcon name="i-heroicons-map-pin" class="w-5 h-5 text-background-dark" />
                  </div>
                  Event Location
                </h2>
                <div class="space-y-2">
                  <h3 class="text-xl font-bold text-white">{{ primaryVenue.venue_name }}</h3>
                  <p v-if="primaryVenue.venue_address" class="text-primary/70 font-mono text-sm">{{ primaryVenue.venue_address }}</p>
                  <p v-if="primaryVenue.venue_city" class="text-primary/70 font-mono text-sm">{{ primaryVenue.venue_city }}</p>
                </div>
              </div>
              
              <!-- Map Section -->
              <div v-if="primaryVenue.venue_address" class="h-64 bg-navy-accent relative border-t border-primary/20">
                <iframe
                  :src="`https://maps.google.com/maps?q=${encodeURIComponent(primaryVenue.venue_address + ' ' + (primaryVenue.venue_city || ''))}&output=embed`"
                  class="w-full h-full border-0"
                  loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>

          <!-- Sidebar (1/3) -->
          <div class="space-y-6">
            <!-- Countdown Timer Card -->
            <div class="sticky top-24 space-y-6">
              <div class="rounded-sm bg-navy-accent border border-primary/30 p-8 shadow-2xl relative overflow-hidden">
                <!-- Blueprint grid overlay -->
                <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(rgba(236, 200, 19, 0.15) 1px, transparent 1px); background-size: 20px 20px;"></div>
                
                <!-- Gold accent bar at top -->
                <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
                
                <div class="relative z-10">
                  <div class="flex items-center justify-between mb-2">
                    <h3 class="font-black text-primary/70 uppercase tracking-widest text-[10px]">
                      {{ countdown.isExpired ? 'Event Started' : 'Registration Closing' }}
                    </h3>
                    <span class="bg-primary/20 border border-primary/40 text-[10px] font-black text-primary px-2 py-1 rounded-sm">
                      {{ formatDate(event.start_datetime, 'MMM d').toUpperCase() }}
                    </span>
                  </div>
                  
                  <h2 class="text-3xl font-black mb-8 font-display text-white">
                    {{ countdown.isExpired ? 'Happening Now!' : 'Time Remaining' }}
                  </h2>
                  
                  <!-- Countdown Display -->
                  <div v-if="!countdown.isExpired" class="grid grid-cols-4 gap-3 mb-8">
                    <div class="flex flex-col items-center p-3 bg-background-dark/60 rounded-sm border border-primary/30">
                      <span class="text-3xl font-black text-primary">{{ String(countdown.days).padStart(2, '0') }}</span>
                      <span class="text-[10px] uppercase font-black text-primary/50">Days</span>
                    </div>
                    <div class="flex flex-col items-center p-3 bg-background-dark/60 rounded-sm border border-primary/30">
                      <span class="text-3xl font-black text-primary">{{ String(countdown.hours).padStart(2, '0') }}</span>
                      <span class="text-[10px] uppercase font-black text-primary/50">Hrs</span>
                    </div>
                    <div class="flex flex-col items-center p-3 bg-background-dark/60 rounded-sm border border-primary/30">
                      <span class="text-3xl font-black text-primary">{{ String(countdown.minutes).padStart(2, '0') }}</span>
                      <span class="text-[10px] uppercase font-black text-primary/50">Mins</span>
                    </div>
                    <div class="flex flex-col items-center p-3 bg-background-dark/60 rounded-sm border border-primary/30">
                      <span class="text-3xl font-black text-primary animate-pulse">{{ String(countdown.seconds).padStart(2, '0') }}</span>
                      <span class="text-[10px] uppercase font-black text-primary/50">Secs</span>
                    </div>
                  </div>
                  
                  <!-- Registration Button -->
                  <button
                    :disabled="countdown.isExpired || event.status !== 'OPEN'"
                    class="w-full bg-primary text-background-dark font-black text-sm uppercase py-4 rounded-sm hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                  >
                    {{ countdown.isExpired ? 'Registration Closed' : 'Register Now' }}
                    <UIcon v-if="!countdown.isExpired" name="i-heroicons-arrow-right" class="inline w-5 h-5 ml-2" />
                  </button>
                  
                  <p v-if="event.can_participants_register && !countdown.isExpired" class="mt-4 text-xs text-white/60 text-center font-mono">
                    {{ event.number_of_attendees }} REGISTERED
                    <span v-if="event.maximum_attendance" class="block">
                      {{ event.maximum_attendance - event.number_of_attendees }} SPOTS REMAINING
                    </span>
                  </p>
                </div>
              </div>

              <!-- Status Badge -->
              <div class="bg-navy-accent/30 border border-primary/20 rounded-sm p-5">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-bold text-primary/60 uppercase text-[10px] tracking-wider">Event Status</span>
                  <span 
                    :class="getStatusClass(event.status)" 
                    class="text-[10px] px-3 py-1.5 font-black uppercase"
                  >
                    {{ event.status_display }}
                  </span>
                </div>
              </div>

              <!-- Quick Actions -->
              <div class="bg-navy-accent/30 border border-primary/20 rounded-sm p-5 space-y-3">
                <button class="w-full flex items-center justify-center gap-2 py-3 border border-primary/50 text-primary rounded-sm hover:bg-primary/10 transition-all font-bold text-sm uppercase">
                  <UIcon name="i-heroicons-calendar-plus" class="w-5 h-5" />
                  Add to Calendar
                </button>
                <button class="w-full flex items-center justify-center gap-2 py-3 border border-primary/50 text-primary rounded-sm hover:bg-primary/10 transition-all font-bold text-sm uppercase">
                  <UIcon name="i-heroicons-share" class="w-5 h-5" />
                  Share Event
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="isError" class="min-h-screen flex items-center justify-center bg-background-dark px-4">
      <div class="text-center max-w-md">
        <UIcon name="i-heroicons-exclamation-circle" class="mx-auto w-20 h-20 text-red-400 mb-6" />
        <h3 class="text-2xl font-bold text-white mb-3">Failed to load event</h3>
        <p class="text-white/60 mb-8">Please try again later.</p>
        <button
          @click="navigateTo('/events')"
          class="bg-primary text-background-dark px-8 py-3 rounded-sm font-black uppercase text-sm hover:brightness-110 transition-all"
        >
          Browse Events
        </button>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else class="min-h-screen flex items-center justify-center bg-background-dark px-4">
      <div class="text-center max-w-md">
        <UIcon name="i-heroicons-calendar-x" class="mx-auto w-20 h-20 text-primary/40 mb-6" />
        <h3 class="text-2xl font-bold text-white mb-3">Event not found</h3>
        <p class="text-white/60 mb-8">The event you're looking for doesn't exist or has been removed.</p>
        <button
          @click="navigateTo('/events')"
          class="bg-primary text-background-dark px-8 py-3 rounded-sm font-black uppercase text-sm hover:brightness-110 transition-all"
        >
          Browse Events
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEvent } from '~/composables/resources/events/events'
import { useEventVenues } from '~/composables/resources/events/eventVenues'
import { formatDate, useCountdown, formatTime } from '~/utils/time'
import { resolveImageUrl, onImageError } from '~/utils/image'

definePageMeta({
  middleware: ['auth'],
})

const route = useRoute()
const eventId = computed(() => String(route.params.id))

// Fetch event details
const { data, isLoading, isError } = useEvent(eventId)
const event = computed(() => data.value?.data)

// Fetch event venues
const { data: venuesData } = useEventVenues(computed(() => ({
  event__event_id: eventId.value,
})))
const eventVenues = computed(() => venuesData.value?.data?.results || [])
const primaryVenue = computed(() => eventVenues.value[0])

// Setup countdown timer
const { countdown } = useCountdown(
  computed(() => event.value?.start_datetime),
  computed(() => event.value?.timezone)
)

// Helper function for status class
const getStatusClass = (status?: string) => {
  switch (status?.toUpperCase()) {
    case 'OPEN':
    case 'PUBLISHED':
      return 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/40'
    case 'DRAFTING':
      return 'bg-amber-500/20 text-amber-400 border border-amber-400/40'
    case 'CANCELLED':
    case 'DELETED':
      return 'bg-red-500/20 text-red-400 border border-red-400/40'
    case 'CLOSED':
      return 'bg-orange-500/20 text-orange-400 border border-orange-400/40'
    case 'IN_PROGRESS':
      return 'bg-purple-500/20 text-purple-400 border border-purple-400/40'
    case 'POSTPONED':
      return 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/40'
    default:
      return 'bg-gray-500/20 text-gray-400 border border-gray-400/40'
  }
}

// Set page metadata
useHead({
  title: computed(() => event.value?.title || 'Event'),
  meta: [
    { 
      name: 'description', 
      content: computed(() => event.value?.short_description || event.value?.long_description || 'Event details') 
    }
  ]
})
</script>

<style>
.blueprint-grid {
  background-image: 

    linear-gradient(to right, rgba(236, 200, 19, 0.08) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(236, 200, 19, 0.08) 1px, transparent 1px);
  background-size: 40px 40px;
}
</style>