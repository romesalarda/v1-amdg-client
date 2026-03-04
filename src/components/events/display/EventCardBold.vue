<template>
  <div 
    @click="navigateTo(`/events/${event.event_id}`)"
    class="group bg-white border-2 border-deep-navy rounded-xl overflow-hidden shadow-drawn flex flex-col cursor-pointer hover:translate-y-[-4px] transition-all duration-200"
  >
    <!-- Event Image -->
    <div class="relative h-48">
      <img
        v-if="event.main_landing_image?.image"
        :src="resolveImageUrl(event.main_landing_image.image)"
        :alt="event.title"
        class="w-full h-full object-cover"
        @error="(e) => onImageError(e)"
      />
      <!-- Placeholder gradient when no image -->
      <div v-else class="w-full h-full bg-gradient-to-br from-blue-400/30 to-deep-navy/80"></div>
      
      <!-- Status Badge -->
      <div class="absolute top-4 left-4">
        <span 
          :class="getStatusBadgeClass(event.status)"
          class="px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest flex items-center gap-1 shadow-lg"
        >
          <svg v-if="event.status === 'OPEN'" class="w-3 h-3 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <svg v-else-if="event.status === 'IN_PROGRESS'" class="w-3 h-3 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <svg v-else class="w-3 h-3" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          {{ getStatusLabel(event.status) }}
        </span>
      </div>

      <!-- Date Badge -->
      <div class="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 text-center shadow-lg border border-deep-navy/10">
        <p class="text-lg font-black leading-none text-deep-navy">{{ formatMonth(event.start_datetime) }}</p>
        <p class="text-sm font-bold text-deep-navy/60">{{ formatDay(event.start_datetime) }}</p>
      </div>
    </div>

    <!-- Event Content -->
    <div class="p-6 flex-1 flex flex-col">
      <div class="flex justify-between items-start mb-4">
        <div class="flex-1 min-w-0">
          <p class="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2">
            {{ event.event_type_details?.title || 'Event' }}
          </p>
          <h4 class="font-black text-xl leading-tight text-deep-navy line-clamp-2 uppercase tracking-tight">
            {{ event.title }}
          </h4>
        </div>
      </div>
      
      <p class="text-sm text-deep-navy/70 mb-6 flex-1 line-clamp-2 leading-relaxed">
        {{ event.short_description || event.long_description?.substring(0, 100) || 'No description available.' }}
      </p>

      <!-- Footer Info -->
      <div class="pt-6 border-t-2 border-deep-navy/5 flex items-center justify-between">
        <span class="text-xs font-bold flex items-center gap-1.5 text-deep-navy/60">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          {{ getPrimaryVenueName(event) || 'TBA' }}
        </span>
        <button class="font-black text-sm text-blue-500 flex items-center gap-1 group-hover:gap-2 transition-all uppercase tracking-wider">
          View Event
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { resolveImageUrl, onImageError } from '~/utils/image'
import { formatDate } from '~/utils/time'

interface Props {
  event: any
}

const props = defineProps<Props>()

const formatMonth = (dateString: string) => {
  return formatDate(dateString, 'MMM').toUpperCase()
}

const formatDay = (dateString: string) => {
  return formatDate(dateString, 'd')
}

const getStatusLabel = (status?: string) => {
  switch (status?.toUpperCase()) {
    case 'OPEN':
    case 'PUBLISHED':
      return 'Open'
    case 'IN_PROGRESS':
      return 'Happening Now'
    case 'CLOSED':
      return 'Closed'
    case 'CANCELLED':
      return 'Cancelled'
    case 'DRAFTING':
      return 'Draft'
    case 'POSTPONED':
      return 'Postponed'
    default:
      return 'Event'
  }
}

const getStatusBadgeClass = (status?: string) => {
  switch (status?.toUpperCase()) {
    case 'OPEN':
    case 'PUBLISHED':
      return 'bg-green-500 text-white'
    case 'IN_PROGRESS':
      return 'bg-purple-500 text-white'
    case 'CLOSED':
      return 'bg-orange-500 text-white'
    case 'CANCELLED':
      return 'bg-red-500 text-white'
    case 'DRAFTING':
      return 'bg-amber-500 text-white'
    case 'POSTPONED':
      return 'bg-yellow-500 text-white'
    default:
      return 'bg-deep-navy text-white'
  }
}

const getPrimaryVenueName = (event: any) => {
  // Try to get venue from event_venues if available
  if (event.event_venues && event.event_venues.length > 0) {
    return event.event_venues[0].venue_name
  }
  // Fallback to organization name or location info
  return event.organisation_name || event.location || null
}
</script>

<style scoped>
.shadow-drawn {
  box-shadow: 6px 6px 0px 0px rgba(10, 25, 47, 0.25);
}
</style>
