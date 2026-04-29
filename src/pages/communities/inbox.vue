<template>
  <div class="min-h-screen bg-gray-50">
    <section class="max-w-6xl mx-auto px-6 lg:px-10 py-10">
      <div class="bg-white border-2 border-deep-navy rounded-xl shadow-drawn overflow-hidden">
        <div class="px-8 py-8 bg-gradient-to-r from-deep-navy to-deep-navy/80 text-white">
          <p class="text-[10px] font-black uppercase tracking-[0.25em] text-blue-200">Invitation Center</p>
          <h1 class="mt-3 text-3xl md:text-4xl font-black uppercase tracking-tight">Your Invitations</h1>
          <p class="mt-3 text-sm text-blue-100/90 max-w-2xl">
            Review and accept invitations for communities, location leadership, and event staffing.
          </p>
          <div class="mt-5 flex flex-wrap gap-3">
            <NuxtLink to="/communities" class="px-5 py-2 bg-white text-deep-navy rounded-lg font-black text-xs uppercase tracking-wider border-2 border-white hover:bg-blue-50 transition-colors">
              Browse Communities
            </NuxtLink>
            <NuxtLink to="/events" class="px-5 py-2 bg-transparent text-white rounded-lg font-black text-xs uppercase tracking-wider border-2 border-white/60 hover:border-white transition-colors">
              Browse Events
            </NuxtLink>
          </div>
        </div>

        <div class="px-8 py-6 border-t-2 border-deep-navy/10 bg-deep-navy/5">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-white border-2 border-deep-navy/10 rounded-xl p-4">
              <p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/50">Community Invites</p>
              <p class="text-2xl font-black text-deep-navy mt-2">{{ orgInvites.length }}</p>
            </div>
            <div class="bg-white border-2 border-deep-navy/10 rounded-xl p-4">
              <p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/50">Leader Invites</p>
              <p class="text-2xl font-black text-deep-navy mt-2">{{ leaderInvites.length }}</p>
            </div>
            <div class="bg-white border-2 border-deep-navy/10 rounded-xl p-4">
              <p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/50">Event Staff Invites</p>
              <p class="text-2xl font-black text-deep-navy mt-2">{{ staffInvites.length }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-if="isLoading" class="max-w-6xl mx-auto px-6 lg:px-10 pb-12 space-y-4">
      <div v-for="i in 3" :key="i" class="bg-white border-2 border-deep-navy/10 rounded-xl p-5">
        <USkeleton class="h-5 w-40" />
        <USkeleton class="h-4 w-72 mt-3" />
        <USkeleton class="h-10 w-28 mt-5" />
      </div>
    </section>

    <section v-else-if="hasInvites" class="max-w-6xl mx-auto px-6 lg:px-10 pb-12 space-y-8">
      <div v-if="orgInvites.length > 0" class="bg-white border-2 border-deep-navy rounded-xl shadow-drawn overflow-hidden">
        <div class="px-8 py-5 border-b-2 border-deep-navy/10">
          <h2 class="text-lg font-black text-deep-navy uppercase tracking-tight">Community Invitations</h2>
        </div>
        <div class="divide-y-2 divide-deep-navy/5">
          <div v-for="invite in orgInvites" :key="`org-${invite.id}`" class="px-8 py-5 flex items-start justify-between gap-4">
            <div>
              <p class="text-sm font-black text-deep-navy uppercase tracking-tight">{{ invite.organisation_name }}</p>
              <p class="text-xs text-deep-navy/60 font-medium mt-1">Invited by {{ invite.invited_by_name || 'Unknown user' }}</p>
              <p class="text-[10px] text-deep-navy/50 font-bold uppercase tracking-wider mt-2">Received {{ formatDate(invite.added_at) }}</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider" :class="statusBadgeClass(invite)">
                {{ statusLabel(invite) }}
              </span>
              <button
                v-if="isInviteAcceptable(invite)"
                :disabled="acceptingOrgInviteId === invite.id"
                @click="handleAcceptOrgInvite(invite.id)"
                class="px-4 py-2 bg-deep-navy text-white rounded-lg font-black text-xs uppercase tracking-wider hover:bg-deep-navy/90 transition-colors disabled:opacity-50"
              >
                {{ acceptingOrgInviteId === invite.id ? 'Accepting...' : 'Accept' }}
              </button>
              <NuxtLink :to="resolveInviteCommunityPath(invite)" class="px-4 py-2 border-2 border-deep-navy/20 text-deep-navy rounded-lg font-black text-xs uppercase tracking-wider hover:border-deep-navy/50 transition-colors">
                View
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <div v-if="leaderInvites.length > 0" class="bg-white border-2 border-deep-navy rounded-xl shadow-drawn overflow-hidden">
        <div class="px-8 py-5 border-b-2 border-deep-navy/10">
          <h2 class="text-lg font-black text-deep-navy uppercase tracking-tight">Leader Invitations</h2>
        </div>
        <div class="divide-y-2 divide-deep-navy/5">
          <div v-for="invite in leaderInvites" :key="`leader-${invite.id}`" class="px-8 py-5 flex items-start justify-between gap-4">
            <div>
              <p class="text-sm font-black text-deep-navy uppercase tracking-tight">{{ invite.organisation_name }}</p>
              <p class="text-xs text-deep-navy/60 font-medium mt-1">{{ invite.location_name }} · {{ invite.location_type }} #{{ invite.location_id }}</p>
              <p class="text-[10px] text-deep-navy/50 font-bold uppercase tracking-wider mt-2">Received {{ formatDate(invite.added_at) }}</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider" :class="statusBadgeClass(invite)">
                {{ statusLabel(invite) }}
              </span>
              <button
                v-if="isInviteAcceptable(invite)"
                :disabled="acceptingLeaderInviteId === invite.id"
                @click="handleAcceptLeaderInvite(invite.id, invite)"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg font-black text-xs uppercase tracking-wider hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {{ acceptingLeaderInviteId === invite.id ? 'Accepting...' : 'Accept' }}
              </button>
              <NuxtLink :to="resolveInviteCommunityPath(invite)" class="px-4 py-2 border-2 border-blue-200 text-blue-700 rounded-lg font-black text-xs uppercase tracking-wider hover:border-blue-400 transition-colors">
                View
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <div v-if="staffInvites.length > 0" class="bg-white border-2 border-deep-navy rounded-xl shadow-drawn overflow-hidden">
        <div class="px-8 py-5 border-b-2 border-deep-navy/10">
          <h2 class="text-lg font-black text-deep-navy uppercase tracking-tight">Event Staff Invitations</h2>
        </div>
        <div class="divide-y-2 divide-deep-navy/5">
          <div v-for="invite in staffInvites" :key="`staff-${invite.id}`" class="px-8 py-5 flex items-start justify-between gap-4">
            <div>
              <p class="text-sm font-black text-deep-navy uppercase tracking-tight">{{ invite.event_title }}</p>
              <p class="text-xs text-deep-navy/60 font-medium mt-1">Invited by {{ invite.invited_by_email || 'Unknown user' }}</p>
              <p class="text-[10px] text-deep-navy/50 font-bold uppercase tracking-wider mt-2">Received {{ formatDate(invite.added_at) }}</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider" :class="statusBadgeClass(invite)">
                {{ statusLabel(invite) }}
              </span>
              <button
                v-if="isInviteAcceptable(invite)"
                :disabled="acceptingStaffInviteId === invite.id"
                @click="handleAcceptStaffInvite(invite)"
                class="px-4 py-2 bg-violet-600 text-white rounded-lg font-black text-xs uppercase tracking-wider hover:bg-violet-700 transition-colors disabled:opacity-50"
              >
                {{ acceptingStaffInviteId === invite.id ? 'Accepting...' : 'Accept' }}
              </button>
              <NuxtLink :to="`/events/${invite.event}`" class="px-4 py-2 border-2 border-violet-200 text-violet-700 rounded-lg font-black text-xs uppercase tracking-wider hover:border-violet-400 transition-colors">
                View
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-else class="max-w-6xl mx-auto px-6 lg:px-10 pb-12">
      <div class="bg-white border-2 border-deep-navy/20 rounded-xl p-12 text-center">
        <h3 class="text-lg font-black text-deep-navy uppercase tracking-tight">No Pending Invitations</h3>
        <p class="text-sm text-deep-navy/60 font-medium mt-2">You are all caught up for now.</p>
      </div>
    </section>

    <section v-if="isError" class="max-w-6xl mx-auto px-6 lg:px-10 pb-12">
      <div class="bg-red-50 border-2 border-red-200 rounded-xl px-8 py-6">
        <p class="text-red-700 font-bold text-sm">Failed to load invitations. Please refresh and try again.</p>
      </div>
    </section>
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