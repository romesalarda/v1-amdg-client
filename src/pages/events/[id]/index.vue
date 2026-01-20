<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading State -->
    <div v-if="isLoading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <USkeleton class="h-8 w-32 mb-6" />
      <USkeleton class="h-96 w-full mb-8" />
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-6">
          <USkeleton class="h-64 w-full" />
        </div>
        <div>
          <USkeleton class="h-96 w-full" />
        </div>
      </div>
    </div>

    <!-- Event Content -->
    <div v-else-if="event" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Back Button -->
      <UButton 
        to="/events" 
        icon="i-heroicons-arrow-left" 
        variant="ghost" 
        color="gray"
        class="mb-6"
      >
        Back to Events
      </UButton>

      <!-- Hero Section with Landing Image -->
      <div class="relative h-80 md:h-[500px] rounded-lg overflow-hidden shadow-lg mb-8">
        <!-- Background Image or Placeholder -->
        <div class="absolute inset-0">
          <img
            v-if="event.main_landing_image?.image"
            :src="resolveImageUrl(event.main_landing_image.image)"
            :alt="event.title"
            class="w-full h-full object-cover"
            @error="(e) => onImageError(e)"
          />
          <!-- Placeholder gradient when no image -->
          <div v-else class="w-full h-full bg-gradient-to-br from-primary/30 via-blue-600/20 to-blue-900/30"></div>
        </div>
        
        <!-- Dark overlay for text contrast -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20"></div>
        
        <!-- Title Overlay -->
        <div class="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div class="max-w-4xl">
            <div v-if="event.event_type_details?.title" class="inline-flex items-center rounded-full bg-primary/90 backdrop-blur-sm px-4 py-1.5 text-sm font-bold text-white ring-1 ring-inset ring-white/30 mb-4">
              Official {{ event.event_type_details.title }}
            </div>
            <h1 class="text-4xl md:text-6xl lg:text-7xl font-black text-white drop-shadow-2xl leading-tight mb-3">
              {{ event.title }}
            </h1>
            <p v-if="event.short_description" class="text-lg md:text-xl text-white/90 font-medium max-w-2xl">
              {{ event.short_description }}
            </p>
          </div>
        </div>
      </div>

      <!-- Quick Info Cards -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="flex items-start gap-4">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white">
              <UIcon name="i-heroicons-calendar-days" class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-xs font-semibold text-gray-500 uppercase mb-1">Date</h3>
              <p class="text-sm font-bold text-gray-900">{{ formatDate(event.start_datetime, 'MMMM d, yyyy') }}</p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white">
              <UIcon name="i-heroicons-clock" class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-xs font-semibold text-gray-500 uppercase mb-1">Time</h3>
              <p class="text-sm font-bold text-gray-900">
                {{ formatTime(event.start_datetime, event.timezone) }} - {{ formatTime(event.end_datetime, event.timezone) }}
              </p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white">
              <UIcon name="i-heroicons-map-pin" class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-xs font-semibold text-gray-500 uppercase mb-1">Location</h3>
              <p class="text-sm font-bold text-gray-900">
                {{ primaryVenue?.venue_name || event.organisation_name || 'TBA' }}
              </p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white">
              <UIcon name="i-heroicons-users" class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-xs font-semibold text-gray-500 uppercase mb-1">Capacity</h3>
              <p class="text-sm font-bold text-gray-900">
                {{ event.maximum_attendance ? `${event.maximum_attendance.toLocaleString()} Attendees` : 'Unlimited' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Grid: 2/3 Main + 1/3 Sidebar -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content (2/3) -->
        <div class="lg:col-span-2 space-y-8">
          <!-- About Section -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">About the Event</h2>
            <div class="prose prose-lg max-w-none text-gray-700">
              <p class="whitespace-pre-line">
                {{ event.long_description || event.short_description || 'No description available.' }}
              </p>
            </div>
          </div>

          <!-- Theme & Verse -->
          <div v-if="event.theme || event.anchor_verse" class="bg-gradient-to-br from-primary/5 to-blue-50 rounded-xl border border-primary/20 p-6">
            <h3 v-if="event.theme" class="text-xl font-bold text-gray-900 mb-2">
              Theme: {{ event.theme }}
            </h3>
            <blockquote v-if="event.anchor_verse" class="mt-4 border-l-4 border-primary pl-4 italic text-gray-700">
              "{{ event.anchor_verse }}"
            </blockquote>
          </div>

          <!-- What to Bring -->
          <div v-if="event.what_to_bring" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <UIcon name="i-heroicons-backpack" class="w-5 h-5" />
              What to Bring
            </h2>
            <p class="text-gray-700 whitespace-pre-line">{{ event.what_to_bring }}</p>
          </div>

          <!-- Important Information -->
          <div v-if="event.important_information" class="bg-amber-50 rounded-xl border border-amber-200 p-6">
            <h2 class="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5" />
              Important Information
            </h2>
            <p class="text-amber-800 whitespace-pre-line">{{ event.important_information }}</p>
          </div>

          <!-- Venue Location -->
          <div v-if="primaryVenue" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <UIcon name="i-heroicons-map-pin" class="w-5 h-5" />
                Event Location
              </h2>
              <div class="space-y-2">
                <h3 class="text-lg font-semibold text-gray-900">{{ primaryVenue.venue_name }}</h3>
                <p v-if="primaryVenue.venue_address" class="text-gray-700">{{ primaryVenue.venue_address }}</p>
                <p v-if="primaryVenue.venue_city" class="text-gray-700">{{ primaryVenue.venue_city }}</p>
              </div>
            </div>
            
            <!-- Map Section -->
            <div v-if="primaryVenue.venue_address" class="h-64 bg-gray-100 relative">
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
            <div class="rounded-2xl bg-gradient-to-br from-primary to-blue-900 p-6 shadow-xl text-white relative overflow-hidden">
              <div class="relative z-10">
                <div class="flex items-center justify-between mb-1">
                  <h3 class="font-bold text-yellow-300 uppercase tracking-widest text-xs">
                    {{ countdown.isExpired ? 'Event Started' : 'Registration Closing' }}
                  </h3>
                  <span class="bg-yellow-300 text-[10px] font-bold text-blue-900 px-1.5 py-0.5 rounded">
                    {{ formatDate(event.start_datetime, 'MMM d').toUpperCase() }}
                  </span>
                </div>
                
                <h2 class="text-2xl font-bold mb-6">
                  {{ countdown.isExpired ? 'Happening Now!' : 'Time Remaining' }}
                </h2>
                
                <!-- Countdown Display -->
                <div v-if="!countdown.isExpired" class="grid grid-cols-4 gap-2 mb-8">
                  <div class="flex flex-col items-center p-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10">
                    <span class="text-2xl font-black text-white">{{ String(countdown.days).padStart(2, '0') }}</span>
                    <span class="text-[10px] uppercase font-bold text-blue-200">Days</span>
                  </div>
                  <div class="flex flex-col items-center p-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10">
                    <span class="text-2xl font-black text-white">{{ String(countdown.hours).padStart(2, '0') }}</span>
                    <span class="text-[10px] uppercase font-bold text-blue-200">Hrs</span>
                  </div>
                  <div class="flex flex-col items-center p-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10">
                    <span class="text-2xl font-black text-white">{{ String(countdown.minutes).padStart(2, '0') }}</span>
                    <span class="text-[10px] uppercase font-bold text-blue-200">Mins</span>
                  </div>
                  <div class="flex flex-col items-center p-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10">
                    <span class="text-2xl font-black text-yellow-300 animate-pulse">{{ String(countdown.seconds).padStart(2, '0') }}</span>
                    <span class="text-[10px] uppercase font-bold text-blue-200">Secs</span>
                  </div>
                </div>
                
                <!-- Registration Button -->
                <UButton
                  size="lg"
                  block
                  class="bg-yellow-300 hover:bg-yellow-400 text-blue-900 font-bold shadow-lg shadow-black/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                  :disabled="countdown.isExpired || event.status !== 'OPEN'"
                >
                  <span>{{ countdown.isExpired ? 'Registration Closed' : 'Register Now' }}</span>
                  <UIcon v-if="!countdown.isExpired" name="i-heroicons-arrow-right" class="w-5 h-5 ml-2" />
                </UButton>
                
                <p v-if="event.can_participants_register && !countdown.isExpired" class="mt-3 text-xs text-blue-100 text-center">
                  {{ event.number_of_attendees }} registered
                  <span v-if="event.maximum_attendance">
                    • {{ event.maximum_attendance - event.number_of_attendees }} spots left
                  </span>
                </p>
              </div>
            </div>

            <!-- Status Badge -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">Event Status</span>
                <UBadge 
                  :color="getStatusColor(event.status)" 
                  :label="event.status_display"
                  size="lg"
                />
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
              <UButton
                block
                variant="outline"
                color="gray"
                icon="i-heroicons-calendar-plus"
              >
                Add to Calendar
              </UButton>
              <UButton
                block
                variant="outline"
                color="gray"
                icon="i-heroicons-share"
              >
                Share Event
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="isError" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div class="text-center">
        <UIcon name="i-heroicons-exclamation-circle" class="mx-auto w-16 h-16 text-red-400" />
        <h3 class="mt-4 text-lg font-medium text-gray-900">Failed to load event</h3>
        <p class="mt-2 text-gray-500">Please try again later.</p>
        <UButton to="/events" class="mt-6">
          Browse Events
        </UButton>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div class="text-center">
        <UIcon name="i-heroicons-calendar-x" class="mx-auto w-16 h-16 text-gray-400" />
        <h3 class="mt-4 text-lg font-medium text-gray-900">Event not found</h3>
        <p class="mt-2 text-gray-500">The event you're looking for doesn't exist or has been removed.</p>
        <UButton to="/events" class="mt-6">
          Browse Events
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEvent } from '~/composables/resources/events/events'
import { useEventVenues } from '~/composables/resources/events/eventVenues'
import { formatDate, useCountdown, formatTime } from '~/utils/time'
import { resolveImageUrl, onImageError } from '~/utils/image'
import { DateTime } from 'luxon'

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

// Helper function to format time

// Helper function for status colors
const getStatusColor = (status?: string): 'gray' | 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'yellow' => {
  const colors = {
    'DRAFTING': 'gray',
    'PUBLISHED': 'blue',
    'OPEN': 'green',
    'CLOSED': 'orange',
    'IN_PROGRESS': 'purple',
    'COMPLETED': 'gray',
    'DELETED': 'red',
    'CANCELLED': 'red',
    'POSTPONED': 'yellow',
    'ARCHIVED': 'gray',
  } as const
  return (colors[status as keyof typeof colors] || 'gray') as 'gray' | 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'yellow'
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
