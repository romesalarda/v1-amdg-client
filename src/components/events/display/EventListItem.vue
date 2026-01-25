<template>
  <div class="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-blue-400 transition-all duration-200 shadow-sm">
    <div class="flex gap-0">
      <!-- Event Image -->
      <NuxtLink 
        :to="linkTo" 
        class="relative w-32 sm:w-40 flex-shrink-0 group overflow-hidden"
      >
        <div class="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-600/20">
          <img
            v-if="event.main_landing_image?.image"
            :src="resolveImageUrl(event.main_landing_image.image)"
            :alt="event.title"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            @error="onImageError"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <UIcon name="i-heroicons-calendar-days" class="w-12 h-12 text-white/60" />
          </div>
        </div>
        <!-- Overlay for better text contrast -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </NuxtLink>

      <!-- Content Area -->
      <div class="flex-1 min-w-0 flex items-center">
        <NuxtLink 
          :to="linkTo" 
          class="flex-1 group p-4 sm:p-5"
        >
          <div class="space-y-2.5">
            <!-- Title Row with Status and Badges -->
            <div class="flex items-start gap-2 flex-wrap">
              <h3 class="text-base sm:text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors flex-1 min-w-0 line-clamp-2">
                {{ event.title }}
              </h3>
              <div class="flex items-center gap-1.5 flex-shrink-0">
                <UBadge 
                  v-if="isStaff"
                  color="purple"
                  size="xs"
                  class="flex items-center gap-1"
                >
                  <UIcon name="i-heroicons-shield-check" class="w-3 h-3" />
                  <span class="hidden sm:inline">Staff</span>
                </UBadge>
                <UBadge 
                  :color="getStatusColor(event.status)" 
                  :label="event.status_display"
                  size="xs"
                />
              </div>
            </div>

            <!-- Meta Information -->
            <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm text-gray-600">
              <!-- Date -->
              <div class="flex items-center gap-1.5 font-medium">
                <UIcon name="i-heroicons-clock" class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                <span>{{ formatDateTimeCompact(event.start_datetime, event.timezone) }}</span>
              </div>
              
              <!-- Event Type -->
              <div v-if="event.event_type_name" class="flex items-center gap-1.5">
                <UIcon name="i-heroicons-tag" class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                <span>{{ event.event_type_name }}</span>
              </div>
              
              <!-- Organization -->
              <div v-if="event.organisation_name" class="flex items-center gap-1.5">
                <UIcon name="i-heroicons-building-office" class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                <span class="truncate">{{ event.organisation_name }}</span>
              </div>
            </div>

            <!-- Description -->
            <p v-if="event.short_description" class="text-sm text-gray-600 line-clamp-3 leading-relaxed">
              {{ event.short_description }}
            </p>
          </div>
        </NuxtLink>

        <!-- Action Buttons -->
        <div class="flex flex-col gap-2 px-3 sm:px-4 py-4 sm:py-5 border-l border-gray-100">
          <!-- Manage Event Button (if staff) -->
          <UButton
            v-if="isStaff"
            size="sm"
            color="purple"
            icon="i-heroicons-cog-6-tooth"
            :to="`/events/${event.event_id}/m/dashboard`"
            @click.stop
            class="whitespace-nowrap"
          >
            <span class="hidden sm:inline">Manage</span>
            <span class="sm:hidden">Edit</span>
          </UButton>

          <!-- Accept Invite Button (if pending invite) -->
          <UButton
            v-if="hasPendingInvite"
            size="sm"
            color="primary"
            icon="i-heroicons-user-plus"
            :loading="isAccepting"
            @click.stop="handleAcceptInvite"
            class="whitespace-nowrap"
          >
            <span class="hidden sm:inline">Accept</span>
            <UIcon v-if="!isAccepting" name="i-heroicons-check" class="sm:hidden w-4 h-4" />
          </UButton>

          <!-- View Event Button -->
          <UButton
            v-if="!isStaff && !hasPendingInvite"
            size="sm"
            variant="outline"
            icon="i-heroicons-arrow-right"
            :to="linkTo"
            @click.stop
            class="whitespace-nowrap"
          >
            <span class="hidden sm:inline">View</span>
            <UIcon name="i-heroicons-eye" class="sm:hidden w-4 h-4" />
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EventList } from '~/api/types.gen'
import { formatDateTimeCompact } from '~/utils/time'
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
</script>
