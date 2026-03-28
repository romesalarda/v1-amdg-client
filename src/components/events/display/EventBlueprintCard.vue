<template>
  <NuxtLink 
    :to="linkTo" 
    class="group relative block"
  >
    <div class="border border-primary/20 bg-background-dark/80 overflow-hidden hover:border-primary/50 transition-all duration-300">
      <!-- Event Image -->
      <div class="relative aspect-[19/10] overflow-hidden bg-navy-accent/40">
        <img
          v-if="event.main_landing_image?.image"
          :src="resolveImageUrl(event.main_landing_image.image)"
          :alt="event.title"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          @error="onImageError"
        />
        <div v-else class="w-full h-full flex items-center justify-center">
          <UIcon name="i-heroicons-calendar-days" class="w-20 h-20 text-primary/20" />
        </div>
        
        <!-- Gradient Overlay -->
        <div class="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/50 to-transparent opacity-60"></div>
        
        <!-- Status Badge -->
        <!-- <div class="absolute top-2 right-2">
          <span 
            :class="getStatusClass(event.status)" 
            class="text-[9px] px-2 py-1 font-bold uppercase tracking-wide backdrop-blur-sm"
          >
            {{ event.status_display }}
          </span>
        </div> -->

        <!-- Staff Badge -->
        <div v-if="isStaff" class="absolute top-2 left-2">
          <span class="bg-purple-500/30 text-purple-300 border border-purple-400/60 text-[9px] px-2 py-1 font-bold uppercase tracking-wide backdrop-blur-sm flex items-center gap-1">
            <UIcon name="i-heroicons-shield-check" class="w-3 h-3" />
            Staff
          </span>
        </div>

        <!-- Date Badge - Bottom Left -->
        <div class="absolute bottom-2 left-2">
          <div class="bg-background-dark/95 border border-primary/40 px-2 py-1 backdrop-blur-sm">
            <div class="flex items-center gap-1.5">
              <UIcon name="i-heroicons-clock" class="w-3 h-3 text-primary" />
              <span class="text-white text-[10px] font-mono uppercase tracking-wide">
                {{ formatDateShort(event.start_datetime) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Section -->
      <div class="p-3 space-y-2">
        <!-- Title -->
        <h3 class="text-base font-bold text-white group-hover:text-primary transition-colors line-clamp-2 leading-tight">
          {{ event.title }}
        </h3>

        <!-- Meta Information -->
        <div class="flex items-center gap-3 text-[10px] font-mono text-white/50">
          <!-- Organization -->
          <div v-if="event.organisation_name" class="flex items-center gap-1.5 truncate">
            <UIcon name="i-heroicons-building-office" class="w-3 h-3 flex-shrink-0" />
            <span class="truncate">{{ event.organisation_name }}</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div v-if="isStaff || hasPendingInvite" class="pt-2 border-t border-primary/10 flex gap-2">
          <!-- Manage Button (if staff) -->
          <button
            v-if="isStaff"
            @click.prevent.stop="navigateTo(`/events/${event.event_id}/m/dashboard`)"
            class="flex-1 bg-purple-500/20 text-purple-400 border border-purple-400/40 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wide hover:bg-purple-500/30 transition-all"
          >
            Manage
          </button>

          <!-- Accept Invite Button -->
          <button
            v-if="hasPendingInvite"
            @click.prevent.stop="handleAcceptInvite"
            :disabled="isAccepting"
            class="flex-1 bg-primary text-background-dark px-2 py-1.5 text-[10px] font-bold uppercase tracking-wide hover:scale-105 transition-transform disabled:opacity-50"
          >
            {{ isAccepting ? 'Accepting...' : 'Accept' }}
          </button>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { EventList } from '~/api/types.gen'
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

// Format date utilities
const formatDateShort = (dateString: string) => {
  const date = new Date(dateString)
  const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
  const day = date.getDate()
  return `${month} ${day}`
}

const formatDateTime = (dateString: string, timezone?: string) => {
  const date = new Date(dateString)
  const formatted = date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
  return formatted
}

// Check if user is staff member for this event
const { data: staffData } = useEventStaff(
  computed(() => props.showStaffControls !== false ? {
    event: props.event.event_id,
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
    is_valid: true,
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
      },
      onError: (error: any) => {
        $notyf?.error(error?.body?.error || error?.message || 'Failed to accept invitation')
        isAccepting.value = false
      }
    }
  )
}

const getStatusClass = (status?: string) => {
  switch (status?.toUpperCase()) {
    case 'OPEN':
    case 'PUBLISHED':
      return 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/60'
    case 'DRAFTING':
      return 'bg-amber-500/30 text-amber-300 border border-amber-400/60'
    case 'CANCELLED':
    case 'DELETED':
      return 'bg-red-500/30 text-red-300 border border-red-400/60'
    case 'CLOSED':
      return 'bg-orange-500/30 text-orange-300 border border-orange-400/60'
    case 'IN_PROGRESS':
      return 'bg-purple-500/30 text-purple-300 border border-purple-400/60'
    case 'POSTPONED':
      return 'bg-yellow-500/30 text-yellow-300 border border-yellow-400/60'
    default:
      return 'bg-gray-500/30 text-gray-300 border border-gray-400/60'
  }
}
</script>
