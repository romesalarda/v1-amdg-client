<template>
  <div class="min-h-screen">
    <!-- Header -->
    <section class="max-w-8xl mx-auto px-6 lg:px-10 py-8">
      <div class="text-center mb-8">
        <div class="mb-3 flex justify-center items-center gap-4 opacity-40">
          <div class="h-[1px] w-12 bg-primary"></div>
          <span class="text-[10px] uppercase tracking-[0.5em] text-primary">Invitation Registry</span>
          <div class="h-[1px] w-12 bg-primary"></div>
        </div>

        <h1 class="text-white font-light text-3xl md:text-5xl leading-tight mb-4">
          Your <span class="gold-gradient-text italic font-black glow-gold">Invitations</span>
        </h1>
        <p class="text-white/70 max-w-2xl mx-auto">
          View and manage your organization and event staff invitations
        </p>
      </div>

      <div class="flex justify-center">
        <NuxtLink to="/communities" class="px-6 py-2 bg-navy-accent/60 border border-primary/30 text-white hover:border-primary/60 transition-colors font-mono uppercase tracking-wider text-sm">
          Browse Communities
        </NuxtLink>
      </div>
    </section>

    <!-- Loading State -->
    <div v-if="isLoadingOrg" class="max-w-5xl mx-auto px-6 lg:px-10 py-12">
      <div class="space-y-4">
        <div v-for="i in 3" :key="i" class="bg-navy-accent/40 border border-primary/30 p-4">
          <div class="flex items-center gap-4">
            <USkeleton class="h-16 w-16" />
            <div class="flex-1 space-y-2">
              <USkeleton class="h-6 w-1/2" />
              <USkeleton class="h-4 w-3/4" />
            </div>
            <USkeleton class="h-10 w-24" />
          </div>
        </div>
      </div>
    </div>

    <!-- Invitations List -->
    <div v-else-if="hasInvites" class="max-w-5xl mx-auto px-6 lg:px-10 py-12">
      <div class="space-y-8">
        <!-- Organization Invites Section -->
        <section v-if="orgInvites.length > 0">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-8 h-8 bg-primary/20 border border-primary/40 flex items-center justify-center">
              <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-bold text-white uppercase tracking-wider">Organization Invitations</h2>
              <p class="text-xs text-primary/60 font-mono">{{ orgInvites.length }} pending</p>
            </div>
          </div>
          
          <div class="space-y-4">
            <div
              v-for="invite in orgInvites"
              :key="'org-' + invite.id"
              class="bg-navy-accent/40 border border-primary/30 hover:border-primary/60 transition-all architectural-border"
            >
              <div class="p-4">
                <div class="flex items-start gap-4">
                  <!-- Organization Logo -->
                  <div class="w-16 h-16 bg-primary/10 border border-primary/30 p-2 flex-shrink-0">
                    <svg class="w-full h-full text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>

                  <!-- Invitation Details -->
                  <div class="flex-1 min-w-0">
                    <h3 class="text-lg font-semibold text-white mb-1 uppercase tracking-wider">
                      {{ invite.organisation_name }}
                    </h3>
                    
                    <div class="space-y-2 text-xs text-white/60 font-mono">
                      <p v-if="invite.invited_by_name" class="flex items-center gap-1">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Invited by {{ invite.invited_by_name }}
                      </p>
                      <p class="flex items-center gap-1">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Received {{ formatDate(invite.added_at) }}
                      </p>
                      <p v-if="invite.expires_at" class="flex items-center gap-1" :class="{
                        'text-red-400': isExpiringSoon(invite.expires_at),
                        'text-amber-400': !isExpiringSoon(invite.expires_at) && !invite.is_valid
                      }">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {{ invite.is_valid ? `Expires ${formatDate(invite.expires_at)}` : 'Expired' }}
                      </p>
                    </div>

                    <!-- Status Badges -->
                    <div class="mt-3 flex items-center gap-2">
                      <span v-if="invite.accepted" class="inline-flex items-center px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-green-900/40 text-green-400 border border-green-500/40">
                        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Accepted
                      </span>
                      <span v-else-if="!invite.is_valid" class="inline-flex items-center px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-red-900/40 text-red-400 border border-red-500/40">
                        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Invalid
                      </span>
                      <span v-else-if="!invite.is_active" class="inline-flex items-center px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-gray-800/40 text-gray-400 border border-gray-600/40">
                        Inactive
                      </span>
                      <span v-else class="inline-flex items-center px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-primary/20 text-primary border border-primary/40">
                        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Pending
                      </span>
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex flex-col gap-2 flex-shrink-0">
                    <button
                      v-if="!invite.accepted && invite.is_valid && invite.is_active"
                      @click="handleAcceptOrgInvite(invite.id)"
                      :disabled="acceptingOrgInviteId === invite.id"
                      class="px-4 py-2 bg-primary text-[#0a192f] border border-primary hover:bg-primary/90 transition-colors font-mono uppercase tracking-wider text-xs disabled:opacity-50"
                    >
                      {{ acceptingOrgInviteId === invite.id ? 'Accepting...' : 'Accept' }}
                    </button>
                    <NuxtLink
                      :to="`/communities/${invite.organisation}`"
                      class="px-4 py-2 bg-navy-accent/60 border border-primary/30 text-white hover:border-primary/60 transition-colors font-mono uppercase tracking-wider text-xs text-center"
                    >
                      View
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Event Staff Invites Section -->
        <!-- Note: Currently requires backend endpoint for global staff invites.
             The API is event-scoped (/api/event/list/{event_id}/staff-invites/)
             so we need a new endpoint like /api/event/staff-invites/my-invites/
             to fetch all staff invites for the current user across all events.
             For now, this section is prepared but won't show invites until backend support is added. -->
        <section v-if="staffInvites.length > 0">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-8 h-8 bg-purple-900/40 border border-purple-500/40 flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-bold text-white uppercase tracking-wider">Event Staff Invitations</h2>
              <p class="text-xs text-purple-400/60 font-mono">{{ staffInvites.length }} pending</p>
            </div>
          </div>
          
          <div class="space-y-4">
            <div
              v-for="invite in staffInvites"
              :key="'staff-' + invite.id"
              class="bg-navy-accent/40 border border-purple-500/30 hover:border-purple-500/60 transition-all architectural-border"
            >
              <div class="p-4">
                <div class="flex items-start gap-4">
                  <!-- Event Icon -->
                  <div class="w-16 h-16 bg-purple-900/20 border border-purple-500/30 p-2 flex-shrink-0">
                    <svg class="w-full h-full text-purple-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>

                  <!-- Invitation Details -->
                  <div class="flex-1 min-w-0">
                    <h3 class="text-lg font-semibold text-white mb-1 uppercase tracking-wider">
                      {{ invite.event_title }}
                    </h3>
                    <p class="text-xs text-purple-400 font-mono font-medium mb-2 uppercase tracking-wider">
                      Staff Member Invitation
                    </p>
                    
                    <div class="space-y-2 text-xs text-white/60 font-mono">
                      <p v-if="invite.invited_by_email" class="flex items-center gap-1">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Invited by {{ invite.invited_by_email }}
                      </p>
                      <p class="flex items-center gap-1">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Received {{ formatDate(invite.added_at) }}
                      </p>
                      <p v-if="invite.expires_at" class="flex items-center gap-1" :class="{
                        'text-red-400': isExpiringSoon(invite.expires_at),
                        'text-amber-400': !isExpiringSoon(invite.expires_at) && !invite.is_valid
                      }">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {{ invite.is_valid ? `Expires ${formatDate(invite.expires_at)}` : 'Expired' }}
                      </p>
                    </div>

                    <!-- Status Badges -->
                    <div class="mt-3 flex items-center gap-2">
                      <span v-if="invite.accepted" class="inline-flex items-center px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-green-900/40 text-green-400 border border-green-500/40">
                        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Accepted
                      </span>
                      <span v-else-if="!invite.is_valid" class="inline-flex items-center px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-red-900/40 text-red-400 border border-red-500/40">
                        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Invalid
                      </span>
                      <span v-else-if="!invite.is_active" class="inline-flex items-center px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-gray-800/40 text-gray-400 border border-gray-600/40">
                        Inactive
                      </span>
                      <span v-else class="inline-flex items-center px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-purple-900/40 text-purple-400 border border-purple-500/40">
                        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Pending
                      </span>
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex flex-col gap-2 flex-shrink-0">
                    <button
                      v-if="!invite.accepted && invite.is_valid && invite.is_active"
                      @click="handleAcceptStaffInvite(invite)"
                      :disabled="acceptingStaffInviteId === invite.id"
                      class="px-4 py-2 bg-purple-600 text-white border border-purple-500 hover:bg-purple-700 transition-colors font-mono uppercase tracking-wider text-xs disabled:opacity-50"
                    >
                      {{ acceptingStaffInviteId === invite.id ? 'Accepting...' : 'Accept' }}
                    </button>
                    <NuxtLink
                      :to="`/events/${invite.event}/`"
                      class="px-4 py-2 bg-navy-accent/60 border border-purple-500/30 text-white hover:border-purple-500/60 transition-colors font-mono uppercase tracking-wider text-xs text-center"
                    >
                      View
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!isLoading" class="max-w-5xl mx-auto px-6 lg:px-10 py-20">
      <div class="text-center">
        <div class="w-16 h-16 mx-auto bg-navy-accent/60 border border-primary/30 flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-white mb-2 uppercase tracking-wider">No invitations</h3>
        <p class="text-white/60 mb-6">
          You don't have any pending invitations.
        </p>
        <div class="flex items-center justify-center gap-4">
          <NuxtLink to="/communities" class="px-6 py-2 bg-primary text-[#0a192f] border border-primary hover:bg-primary/90 transition-colors font-mono uppercase tracking-wider text-sm">
            Browse Communities
          </NuxtLink>
          <NuxtLink to="/events" class="px-6 py-2 bg-navy-accent/60 border border-primary/30 text-white hover:border-primary/60 transition-colors font-mono uppercase tracking-wider text-sm">
            Browse Events
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="isError" class="max-w-5xl mx-auto px-6 lg:px-10 py-12">
      <div class="bg-red-900/20 border border-red-500/50 p-6 text-center">
        <svg class="mx-auto w-12 h-12 text-red-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p class="text-red-400">Failed to load invitations. Please try again later.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOrganisationInvites, useAcceptOrganisationInvite } from '~/composables/resources/organisation/organisationInvites'
import { useAcceptEventStaffInvite } from '~/composables/resources/events/eventStaffInvites'
import { useAuthStore } from '~/stores/auth'
import { formatDate, isExpiringSoon } from '~/utils/time'
import type { EventStaffInviteList } from '~/api/types.gen'

definePageMeta({
  middleware: ['auth'],
  layout: 'default',
})

useHead({
  title: 'Invitations',
  meta: [
    { name: 'description', content: 'View and manage your organization and event staff invitations' }
  ]
})

const authStore = useAuthStore()
const { $notyf } = useNuxtApp()

const acceptingOrgInviteId = ref<string | null>(null)
const acceptingStaffInviteId = ref<string | null>(null)

// Fetch user's organization invites
const { data: orgData, isLoading: isLoadingOrg, isError } = useOrganisationInvites(computed(() => ({
  target_user: authStore.user?.id,
})))

const orgInvites = computed(() => orgData.value?.data?.results || [])

// Event staff invites
// After regenerating the API, uncomment this to fetch global staff invites:
import { useMyEventStaffInvites } from '~/composables/resources/events/eventStaffInvites'
const { data: staffInvitesData } = useMyEventStaffInvites(computed(() => ({ is_valid: true, accepted: false })))
const staffInvites = computed(() => staffInvitesData.value?.data?.results || [])

// Temporary: Empty array until API is regenerated with global endpoint
// const staffInvites = ref<EventStaffInviteList[]>([])

const isLoading = computed(() => isLoadingOrg)
const hasInvites = computed(() => orgInvites.value.length > 0 || staffInvites.value.length > 0)

// Accept organization invite
const { mutate: acceptOrgInvite } = useAcceptOrganisationInvite()

const handleAcceptOrgInvite = (inviteId: string) => {
  acceptingOrgInviteId.value = inviteId
  
  acceptOrgInvite(inviteId, {
    onSuccess: (response) => {
      $notyf?.success('Organization invitation accepted successfully!')
      acceptingOrgInviteId.value = null
      
      const invite = orgInvites.value.find(inv => inv.id === inviteId)
      if (invite) {
        setTimeout(() => {
          navigateTo(`/communities/${invite.organisation}`)
        }, 1500)
      }
    },
    onError: (error: any) => {
      $notyf?.error(error?.body?.error || error?.message || 'Failed to accept invitation')
      acceptingOrgInviteId.value = null
    }
  })
}

// Accept event staff invite
const { mutate: acceptStaffInvite } = useAcceptEventStaffInvite()

const handleAcceptStaffInvite = (invite: EventStaffInviteList) => {
  acceptingStaffInviteId.value = invite.id
  const eventId = invite.event
  
  acceptStaffInvite({ eventId, inviteId: invite.id }, {
    onSuccess: (response) => {
      $notyf?.success('Event staff invitation accepted! You are now a staff member.')
      acceptingStaffInviteId.value = null
      
      setTimeout(() => {
        navigateTo(`/events/${eventId}/m/dashboard`)
      }, 1500)
    },
    onError: (error: any) => {
      $notyf?.error(error?.body?.error || error?.message || 'Failed to accept staff invitation')
      acceptingStaffInviteId.value = null
    }
  })
}
</script>