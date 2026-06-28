<template>
  <div class="min-h-screen bg-gray-50 text-on-surface">

    <!-- Blue Header Strip -->
    <section class="w-full bg-blue-600 pb-8 pt-6">
      <div class="max-w-[1100px] mx-auto px-6">
        <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p class="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-200 mb-1">Invitation Center</p>
            <h1 class="text-3xl md:text-4xl font-bold text-white tracking-tight">Your Invitations</h1>
            <p class="mt-2 text-sm text-blue-100/80 max-w-xl">
              Review and accept invitations for communities, location leadership, and event staffing.
            </p>
          </div>
          <div class="flex flex-wrap gap-3 shrink-0">
            <NuxtLink to="/communities" class="px-5 py-2.5 bg-white text-deep-navy rounded-lg font-bold text-sm hover:shadow-lg transition-all active:scale-95">
              Browse Communities
            </NuxtLink>
            <NuxtLink to="/events" class="px-5 py-2.5 bg-white/10 text-white rounded-lg font-bold text-sm border border-white/30 hover:border-white/60 transition-colors">
              Browse Events
            </NuxtLink>
          </div>
        </div>

        <!-- Stats Row -->
        <div class="grid grid-cols-3 gap-4 mt-6">
          <div class="bg-white/10 backdrop-blur rounded-lg px-5 py-4 border border-white/20">
            <p class="text-[10px] font-bold uppercase tracking-widest text-blue-200">Community Invites</p>
            <p class="text-2xl font-bold text-white mt-1">{{ orgInvites.length }}</p>
          </div>
          <div class="bg-white/10 backdrop-blur rounded-lg px-5 py-4 border border-white/20">
            <p class="text-[10px] font-bold uppercase tracking-widest text-blue-200">Leader Invites</p>
            <p class="text-2xl font-bold text-white mt-1">{{ leaderInvites.length }}</p>
          </div>
          <div class="bg-white/10 backdrop-blur rounded-lg px-5 py-4 border border-white/20">
            <p class="text-[10px] font-bold uppercase tracking-widest text-blue-200">Staff Invites</p>
            <p class="text-2xl font-bold text-white mt-1">{{ staffInvites.length }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Loading State -->
    <section v-if="isLoading" class="max-w-[1100px] mx-auto px-6 py-10 space-y-4">
      <div v-for="i in 3" :key="i" class="bg-white rounded-lg shadow-sm p-6">
        <USkeleton class="h-5 w-40" />
        <USkeleton class="h-4 w-72 mt-3" />
        <USkeleton class="h-10 w-28 mt-5" />
      </div>
    </section>

    <!-- Invite Lists -->
    <main v-else-if="hasInvites" class="max-w-[1100px] mx-auto px-6 py-10 pb-24 space-y-8">

      <!-- Community Invitations -->
      <div v-if="orgInvites.length > 0">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-deep-navy">Community Invitations</h2>
          <span class="text-sm text-gray-500 font-mono">{{ orgInvites.length }} invite{{ orgInvites.length !== 1 ? 's' : '' }}</span>
        </div>
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
          <div v-for="(invite, idx) in orgInvites" :key="`org-${invite.id}`" :class="idx > 0 ? 'border-t border-gray-100' : ''" class="px-6 py-5 flex items-center justify-between gap-4">
            <div class="min-w-0">
              <p class="text-sm font-bold text-deep-navy leading-snug">{{ invite.organisation_name }}</p>
              <p class="text-xs text-gray-500 mt-0.5">Invited by {{ invite.invited_by_name || 'Unknown user' }}</p>
              <p class="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-1">{{ formatDate(invite.added_at) }}</p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider" :class="statusBadgeClass(invite)">
                {{ statusLabel(invite) }}
              </span>
              <button
                v-if="isInviteAcceptable(invite)"
                :disabled="acceptingOrgInviteId === invite.id"
                @click="handleAcceptOrgInvite(invite.id)"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs transition-colors active:scale-95 disabled:opacity-50"
              >
                {{ acceptingOrgInviteId === invite.id ? 'Accepting...' : 'Accept' }}
              </button>
              <NuxtLink :to="resolveInviteCommunityPath(invite)" class="px-4 py-2 border border-gray-300 text-deep-navy rounded-lg font-bold text-xs hover:border-gray-400 transition-colors">
                View
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Leader Invitations -->
      <div v-if="leaderInvites.length > 0">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-deep-navy">Leader Invitations</h2>
          <span class="text-sm text-gray-500 font-mono">{{ leaderInvites.length }} invite{{ leaderInvites.length !== 1 ? 's' : '' }}</span>
        </div>
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
          <div v-for="(invite, idx) in leaderInvites" :key="`leader-${invite.id}`" :class="idx > 0 ? 'border-t border-gray-100' : ''" class="px-6 py-5 flex items-center justify-between gap-4">
            <div class="min-w-0">
              <p class="text-sm font-bold text-deep-navy leading-snug">{{ invite.organisation_name }}</p>
              <p class="text-xs text-gray-500 mt-0.5">{{ invite.location_name }} · {{ invite.location_type }} #{{ invite.location_id }}</p>
              <p class="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-1">{{ formatDate(invite.added_at) }}</p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider" :class="statusBadgeClass(invite)">
                {{ statusLabel(invite) }}
              </span>
              <button
                v-if="isInviteAcceptable(invite)"
                :disabled="acceptingLeaderInviteId === invite.id"
                @click="handleAcceptLeaderInvite(invite.id, invite)"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs transition-colors active:scale-95 disabled:opacity-50"
              >
                {{ acceptingLeaderInviteId === invite.id ? 'Accepting...' : 'Accept' }}
              </button>
              <NuxtLink :to="resolveInviteCommunityPath(invite)" class="px-4 py-2 border border-gray-300 text-deep-navy rounded-lg font-bold text-xs hover:border-gray-400 transition-colors">
                View
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Event Staff Invitations -->
      <div v-if="staffInvites.length > 0">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-deep-navy">Event Staff Invitations</h2>
          <span class="text-sm text-gray-500 font-mono">{{ staffInvites.length }} invite{{ staffInvites.length !== 1 ? 's' : '' }}</span>
        </div>
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
          <div v-for="(invite, idx) in staffInvites" :key="`staff-${invite.id}`" :class="idx > 0 ? 'border-t border-gray-100' : ''" class="px-6 py-5 flex items-center justify-between gap-4">
            <div class="min-w-0">
              <p class="text-sm font-bold text-deep-navy leading-snug">{{ invite.event_title }}</p>
              <p class="text-xs text-gray-500 mt-0.5">Invited by {{ invite.invited_by_email || 'Unknown user' }}</p>
              <p class="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-1">{{ formatDate(invite.added_at) }}</p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider" :class="statusBadgeClass(invite)">
                {{ statusLabel(invite) }}
              </span>
              <button
                v-if="isInviteAcceptable(invite)"
                :disabled="acceptingStaffInviteId === invite.id"
                @click="handleAcceptStaffInvite(invite)"
                class="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-bold text-xs transition-colors active:scale-95 disabled:opacity-50"
              >
                {{ acceptingStaffInviteId === invite.id ? 'Accepting...' : 'Accept' }}
              </button>
              <NuxtLink :to="`/events/${invite.event}`" class="px-4 py-2 border border-gray-300 text-deep-navy rounded-lg font-bold text-xs hover:border-gray-400 transition-colors">
                View
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

    </main>

    <!-- Empty State -->
    <div v-else-if="!isLoading" class="max-w-[1100px] mx-auto px-6 py-10 pb-24">
      <div class="border border-gray-200 p-12 bg-white max-w-2xl mx-auto rounded-xl shadow-sm text-center">
        <svg class="w-16 h-16 mx-auto text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <h3 class="text-xl font-bold text-deep-navy mb-2">No Pending Invitations</h3>
        <p class="text-gray-500 text-sm">You are all caught up for now.</p>
        <NuxtLink to="/communities" class="inline-block mt-6 bg-deep-navy text-white px-8 py-3 rounded-lg font-bold text-sm hover:bg-deep-navy/90 transition-colors active:scale-95">
          Browse Communities
        </NuxtLink>
      </div>
    </div>

    <!-- Error Banner -->
    <div v-if="isError" class="max-w-[1100px] mx-auto px-6 pb-8">
      <div class="bg-red-50 border border-red-200 rounded-lg px-6 py-4">
        <p class="text-red-700 font-bold text-sm">Failed to load invitations. Please refresh and try again.</p>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { useOrganisationInvites, useAcceptOrganisationInvite } from '~/composables/resources/organisation/organisationInvites'
import { useMyOrganisationLeaderInvites, useAcceptOrganisationLeaderInvite } from '~/composables/resources/organisation/organisationLeaderInvites'
import { useAcceptEventStaffInvite, useMyEventStaffInvites } from '~/composables/resources/events/eventStaffInvites'
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
const acceptingLeaderInviteId = ref<string | null>(null)
const acceptingStaffInviteId = ref<string | null>(null)

type InboxInviteLike = {
  id: string
  organisation?: number | null
  _links?: Record<string, string | undefined>
  accepted?: boolean
  is_valid?: boolean
  is_active?: boolean
  expires_at?: string | null
}

const extractOrganisationIdentifierFromLink = (link?: string | null): string | null => {
  if (!link) return null
  const match = link.match(/\/api\/organisations\/list\/([^/]+)\/?$/)
  return match?.[1] ? decodeURIComponent(match[1]) : null
}

const getInviteOrganisationIdentifier = (invite: InboxInviteLike): string | null => {
  const fromLink = extractOrganisationIdentifierFromLink(invite._links?.organisation)
  if (fromLink) return fromLink
  if (invite.organisation) return String(invite.organisation)
  return null
}

const resolveInviteCommunityPath = (invite: InboxInviteLike): string => {
  const identifier = getInviteOrganisationIdentifier(invite)
  return identifier ? `/communities/${identifier}` : '/communities'
}

// Fetch user's organization invites
const { data: orgData, isLoading: isLoadingOrg, isError: isOrgError } = useOrganisationInvites(computed(() => ({
  target_user: authStore.user?.id,
})))

const orgInvites = computed(() => orgData.value?.data?.results || [])

const { data: leaderInvitesData, isLoading: isLoadingLeader, isError: isLeaderError } = useMyOrganisationLeaderInvites()
const leaderInvites = computed(() => leaderInvitesData.value?.invites || [])

const { data: staffInvitesData, isLoading: isLoadingStaff, isError: isStaffError } = useMyEventStaffInvites(computed(() => ({ is_valid: true, accepted: false })))
const staffInvites = computed(() => staffInvitesData.value?.data?.results || [])

const isLoading = computed(() => isLoadingOrg.value || isLoadingLeader.value || isLoadingStaff.value)
const isError = computed(() => isOrgError.value || isLeaderError.value || isStaffError.value)
const hasInvites = computed(() => {
  return orgInvites.value.length > 0 || leaderInvites.value.length > 0 || staffInvites.value.length > 0
})

const isInviteAcceptable = (invite: InboxInviteLike) => {
  return !invite.accepted && invite.is_valid && invite.is_active
}

const statusLabel = (invite: InboxInviteLike) => {
  if (invite.accepted) return 'Accepted'
  if (!invite.is_valid) return 'Expired'
  if (!invite.is_active) return 'Inactive'
  return 'Pending'
}

const statusBadgeClass = (invite: InboxInviteLike) => {
  if (invite.accepted) return 'bg-green-100 text-green-700 border border-green-200'
  if (!invite.is_valid) return 'bg-red-100 text-red-700 border border-red-200'
  if (!invite.is_active) return 'bg-gray-100 text-gray-700 border border-gray-200'
  if (invite.is_valid && invite.expires_at && isExpiringSoon(invite.expires_at)) {
    return 'bg-amber-100 text-amber-700 border border-amber-200'
  }
  return 'bg-blue-100 text-blue-700 border border-blue-200'
}

// Accept organization invite
const { mutate: acceptOrgInvite } = useAcceptOrganisationInvite()

const handleAcceptOrgInvite = (inviteId: string) => {
  acceptingOrgInviteId.value = inviteId
  
  acceptOrgInvite(inviteId, {
    onSuccess: () => {
      $notyf?.success('Organization invitation accepted successfully!')
      acceptingOrgInviteId.value = null
      
      const invite = orgInvites.value.find(inv => inv.id === inviteId)
      if (invite) {
        setTimeout(() => {
          navigateTo(resolveInviteCommunityPath(invite))
        }, 1500)
      }
    },
    onError: (error: any) => {
      $notyf?.error(error?.body?.error || error?.message || 'Failed to accept invitation')
      acceptingOrgInviteId.value = null
    }
  })
}

const { mutate: acceptLeaderInvite } = useAcceptOrganisationLeaderInvite()

const handleAcceptLeaderInvite = (inviteId: string, invite: InboxInviteLike) => {
  acceptingLeaderInviteId.value = inviteId

  acceptLeaderInvite(inviteId, {
    onSuccess: () => {
      $notyf?.success('Leader invitation accepted successfully!')
      acceptingLeaderInviteId.value = null

      const organisationIdentifier = getInviteOrganisationIdentifier(invite)
      if (organisationIdentifier) {
        setTimeout(() => {
          navigateTo(`/communities/${organisationIdentifier}`)
        }, 1200)
      }
    },
    onError: (error: any) => {
      $notyf?.error(error?.body?.error || error?.message || 'Failed to accept leader invitation')
      acceptingLeaderInviteId.value = null
    }
  })
}

// Accept event staff invite
const { mutate: acceptStaffInvite } = useAcceptEventStaffInvite()

const handleAcceptStaffInvite = (invite: EventStaffInviteList) => {
  acceptingStaffInviteId.value = invite.id
  const eventId = invite.event
  
  acceptStaffInvite({ eventId, inviteId: invite.id }, {
    onSuccess: () => {
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