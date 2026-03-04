<template>
  <div 
    @click="navigateTo(linkTo)"
    class="group bg-white border-2 border-deep-navy rounded-xl overflow-hidden shadow-drawn flex flex-col cursor-pointer hover:translate-y-[-4px] transition-all duration-200"
  >
    <!-- Event Image -->
    <div class="relative h-48">
      <img
        v-if="event.main_landing_image?.image"
        :src="resolveImageUrl(event.main_landing_image.image)"
        :alt="event.title"
        class="w-full h-full object-cover"
        @error="onImageError"
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
          <svg v-else-if="isStaff" class="w-3 h-3 fill-current" viewBox="0 0 24 24">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
          </svg>
          <svg v-else class="w-3 h-3" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          {{ isStaff ? 'Staff' : (event.status_display || getStatusLabel(event.status)) }}
        </span>
      </div>

      <!-- Staff Badge (separate if needed) -->
      <div v-if="isStaff" class="absolute top-4 right-4">
        <span class="px-3 py-1 bg-purple-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest flex items-center gap-1 shadow-lg">
          <svg class="w-3 h-3 fill-current" viewBox="0 0 24 24">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
          </svg>
          Staff
        </span>
      </div>

      <!-- Date Badge -->
      <div v-if="!isStaff" class="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 text-center shadow-lg border border-deep-navy/10">
        <p class="text-lg font-black leading-none text-deep-navy">{{ formatMonth(event.start_datetime) }}</p>
        <p class="text-sm font-bold text-deep-navy/60">{{ formatDay(event.start_datetime) }}</p>
      </div>
    </div>

    <!-- Event Content -->
    <div class="p-6 flex-1 flex flex-col">
      <div class="flex justify-between items-start mb-4">
        <div class="flex-1 min-w-0">
          <p class="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2">
            {{ event.event_type_name || 'Event' }}
          </p>
          <h4 class="font-black text-xl leading-tight text-deep-navy line-clamp-2 uppercase tracking-tight">
            {{ event.title }}
          </h4>
        </div>
      </div>
      
      <p class="text-sm text-deep-navy/70 mb-6 flex-1 line-clamp-2 leading-relaxed">
        {{ event.short_description || 'No description available.' }}
      </p>

      <!-- Footer Info -->
      <div class="pt-6 border-t-2 border-deep-navy/5 space-y-3">
        <!-- Location & Organization -->
        <div class="flex items-center justify-between text-xs font-bold text-deep-navy/60">
          <span v-if="getPrimaryVenueName(event)" class="flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            {{ getPrimaryVenueName(event) }}
          </span>
          <span v-if="event.organisation_name" class="flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {{ event.organisation_name }}
          </span>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-2">
          <!-- Manage Button (if staff) -->
          <button
            v-if="isStaff"
            @click.stop="navigateTo(`/events/${event.event_id}/m/dashboard`)"
            class="flex-1 bg-deep-navy hover:bg-deep-navy/90 text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all"
          >
            Manage
          </button>

          <!-- Accept Invite Button (if pending invite) -->
          <button
            v-if="hasPendingInvite"
            @click.stop="handleAcceptInvite"
            :disabled="isAccepting"
            class="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50"
          >
            {{ isAccepting ? 'Accepting...' : 'Accept Invite' }}
          </button>

          <!-- View Event Button -->
          <button
            @click.stop="navigateTo(linkTo)"
            class="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-deep-navy text-deep-navy rounded-xl hover:bg-deep-navy hover:text-white transition-all font-black text-xs uppercase tracking-wider"
          >
            <span>{{ isStaff ? 'View' : 'View Event' }}</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EventList } from '~/api/types.gen'
import { formatDateTimeCompact, formatDate } from '~/utils/time'
import { resolveImageUrl, onImageError } from '~/utils/image'
import { useEventStaff } from '~/composables/resources/events/eventStaff'
import { useMyEventStaffInvitesForEvent, useAcceptEventStaffInvite } from '~/composables/resources/events/eventStaffInvites'
import { useAuthStore } from '~/stores/auth'

const props = defineProps<{
  event: EventList
  linkTo?: string
  showStaffControls?: boolean
}>()

const authStore = useAuthStore()
const { $notyf } = useNuxtApp()

const linkTo = computed(() => {
  if (props.linkTo) return props.linkTo
  return `/events/${props.event.event_id}`
})

// Check if user is staff member for this event
const { data: staffData } = useEventStaff(
  computed(() => props.showStaffControls !== false ? {
    event: props.event.id,
    user: authStore.user?.id,
  } : undefined)
)

const isStaff = computed(() => {
  if (props.showStaffControls === false) return false
  const staffMembers = staffData.value?.data?.results || []
  return staffMembers.length > 0
})

// Check if user has pending invites for this event
const { data: invitesData } = useMyEventStaffInvitesForEvent(
  computed(() => props.event.event_id),
  computed(() => props.showStaffControls !== false ? {
    is_valid: true, // Only get valid (pending) invites
    accepted: false,
  } : undefined)
)

const hasPendingInvite = computed(() => {
  if (props.showStaffControls === false) return false
  const invites = invitesData.value?.data?.results || []
  return invites.length > 0
})

const pendingInvite = computed(() => {
  const invites = invitesData.value?.data?.results || []
  return invites[0]
})

// Accept invite
const isAccepting = ref(false)
const { mutate: acceptInvite } = useAcceptEventStaffInvite()

const handleAcceptInvite = () => {
  if (!pendingInvite.value) return
  
  isAccepting.value = true
  
  acceptInvite(
    { 
      eventId: props.event.event_id, 
      inviteId: pendingInvite.value.id 
    },
    {
      onSuccess: () => {
        $notyf?.success('Staff invitation accepted! You are now a staff member.')
        isAccepting.value = false
        // The query will automatically refetch and update the UI
      },
      onError: (error: any) => {
        $notyf?.error(error?.body?.error || error?.message || 'Failed to accept invitation')
        isAccepting.value = false
      }
    }
  )
}

// Date formatting helpers
const formatMonth = (dateString: string) => {
  return formatDate(dateString, 'MMM').toUpperCase()
}

const formatDay = (dateString: string) => {
  return formatDate(dateString, 'd')
}

// Status helpers
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
  return event.location || null
}

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
</script>

<style scoped>
.shadow-drawn {
  box-shadow: 6px 6px 0px 0px rgba(10, 25, 47, 0.25);
}
</style>
