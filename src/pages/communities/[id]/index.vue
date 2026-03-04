<template>
  <div class="min-h-screen bg-white">
    <!-- Loading State -->
    <div v-if="isLoading" class="w-full">
      <USkeleton class="h-screen w-full" />
    </div>

    <!-- Organization Content -->
    <div v-else-if="organisation">
      <!-- Full-Width Hero Section with Landing Image -->
      <div class="relative h-[450px] md:h-[550px] w-full overflow-hidden">
        <!-- Background Image -->
        <div class="absolute inset-0">
          <img
            v-if="organisation.landing_image"
            :src="resolveImageUrl(organisation.landing_image)"
            :alt="organisation.title"
            class="w-full h-full object-cover"
            @error="(e) => onImageError(e)"
          />
          <!-- Placeholder gradient when no image -->
          <div v-else class="w-full h-full bg-gradient-to-br from-blue-400/20 to-deep-navy"></div>
        </div>
        
        <!-- Navy overlay -->
        <div class="absolute inset-0 bg-gradient-to-t from-deep-navy via-deep-navy/30 to-transparent"></div>
        
        <!-- Content Overlay -->
        <div class="absolute inset-0 flex items-end">
          <div class="w-full max-w-7xl mx-auto px-6 pb-16">
            <!-- Logo & Title -->
            <div class="flex items-end gap-6 mb-6">
              <div v-if="organisation.logo" class="w-24 h-24 md:w-32 md:h-32 rounded-xl border-2 border-white overflow-hidden bg-white shadow-drawn p-2 flex-shrink-0">
                <img
                  :src="resolveImageUrl(organisation.logo)"
                  :alt="`${organisation.title} logo`"
                  class="w-full h-full object-contain"
                  @error="(e) => onImageError(e)"
                />
              </div>
              <div>
                <h1 class="text-4xl md:text-5xl font-black text-white drop-shadow-2xl leading-tight tracking-tight uppercase">
                  {{ organisation.title }}
                </h1>
                <p v-if="organisation.description" class="text-lg md:text-xl text-white/90 font-medium max-w-3xl leading-relaxed mt-2">
                  {{ organisation.description?.substring(0, 150) }}{{ organisation.description?.length > 150 ? '...' : '' }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Back & Action Buttons Overlay -->
        <div class="absolute top-6 left-0 right-0 w-full max-w-7xl mx-auto px-6 flex items-start justify-between">
          <button
            @click="navigateTo('/communities')"
            class="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white hover:bg-white/20 transition-all font-black text-[10px] uppercase tracking-widest"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span class="hidden sm:inline">Back</span>
          </button>

          <div class="flex items-center gap-3">
            <button 
              v-if="isController"
              @click="navigateTo(`/communities/${organisationId}/m/dashboard`)"
              class="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white hover:bg-white/20 transition-all font-black text-[10px] uppercase tracking-widest"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span class="hidden sm:inline">Manage</span>
            </button>
            
            <button 
              @click="navigateTo('/communities/inbox')"
              class="relative flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white hover:bg-white/20 transition-all font-black text-[10px] uppercase tracking-widest"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <span class="hidden sm:inline">Invites</span>
              <span 
                v-if="pendingInvitesCount > 0" 
                class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white"
              >
                {{ pendingInvitesCount > 9 ? '9+' : pendingInvitesCount }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Bar
      <div class="relative z-20 bg-white border-b-2 border-deep-navy/10">
        <div class="max-w-7xl mx-auto px-6">
          <div class="flex items-center justify-center gap-12 py-8">
            <div class="text-center">
              <p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/50 mb-2">Members</p>
              <p class="text-3xl font-black text-deep-navy">{{ organisation.memberships_count || 0 }}</p>
            </div>
            <div class="w-px h-12 bg-deep-navy/10"></div>
            <div class="text-center">
              <p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/50 mb-2">Controllers</p>
              <p class="text-3xl font-black text-deep-navy">{{ organisation.controllers_count || 0 }}</p>
            </div>
            <div v-if="organizationEvents.length > 0" class="w-px h-12 bg-deep-navy/10"></div>
            <div v-if="organizationEvents.length > 0" class="text-center">
              <p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/50 mb-2">Events</p>
              <p class="text-3xl font-black text-deep-navy">{{ organizationEvents.length }}</p>
            </div>
          </div>
        </div>
      </div> -->

      <!-- Main Content Container -->
      <div class="max-w-7xl mx-auto px-6 py-12">
        <!-- Content Grid: 3/4 Main + 1/4 Sidebar -->
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <!-- Main Content (3/4) -->
          <div class="lg:col-span-3 space-y-8">
            <!-- Description -->
            <div v-if="organisation.description" class="bg-white border-2 border-deep-navy rounded-xl p-8 shadow-drawn">
              <h2 class="text-2xl font-black text-deep-navy mb-6 flex items-center gap-3 uppercase tracking-tight">
                <div class="w-1.5 h-8 bg-blue-500 rounded-full"></div>
                About This Community
              </h2>
              <div class="text-deep-navy/80 text-base leading-relaxed whitespace-pre-line">
                {{ organisation.description }}
              </div>
            </div>

            <!-- Events Section -->
            <div v-if="isMember || canViewEvents">
              <div class="flex items-center justify-between mb-8">
                <h2 class="text-2xl font-black text-deep-navy flex items-center gap-3 uppercase tracking-tight">
                  Upcoming Events
                  <span v-if="organizationEvents.length > 0" class="text-sm font-bold bg-deep-navy text-white px-3 py-1 rounded-full">
                    {{ organizationEvents.length }}
                  </span>
                </h2>
                
                <!-- View Toggle (Optional future feature) -->
                <div class="hidden sm:flex gap-2">
                  <button class="p-2 border-2 border-deep-navy rounded hover:bg-deep-navy hover:text-white transition-all">
                    <svg class="w-5 h-5"  viewBox="0 0 24 24">
                      <path d="M4 11h6a1 1 0 001-1V4a1 1 0 00-1-1H4a1 1 0 00-1 1v6a1 1 0 001 1zm10 0h6a1 1 0 001-1V4a1 1 0 00-1-1h-6a1 1 0 00-1 1v6a1 1 0 001 1zM4 21h6a1 1 0 001-1v-6a1 1 0 00-1-1H4a1 1 0 00-1 1v6a1 1 0 001 1zm10 0h6a1 1 0 001-1v-6a1 1 0 00-1-1h-6a1 1 0 00-1 1v6a1 1 0 001 1z"/>
                    </svg>
                  </button>
                  <button class="p-2 border-2 border-deep-navy/20 rounded opacity-50">
                    <svg class="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Loading Events -->
              <div v-if="isLoadingEvents" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <USkeleton class="h-96 w-full" />
                <USkeleton class="h-96 w-full" />
              </div>

              <!-- Display Events -->
              <div v-else-if="organizationEvents && organizationEvents.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EventCardBold 
                  v-for="event in organizationEvents" 
                  :key="event.event_id" 
                  :event="event" 
                />
              </div>

              <!-- No Events -->
              <div v-else class="bg-white border-2 border-deep-navy rounded-xl p-12 shadow-drawn text-center">
                <svg class="mx-auto w-16 h-16 text-deep-navy/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p class="text-deep-navy/60 font-bold">No events available yet.</p>
                <p class="text-deep-navy/40 text-sm mt-2">Check back soon for upcoming events from this community.</p>
              </div>
            </div>
          </div>

          <!-- Sidebar (1/4) -->
          <div class="space-y-6">
            <!-- Membership Status Card -->
            <div class="bg-white border-2 border-deep-navy rounded-xl p-6 shadow-drawn">
              <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/50 mb-6">Membership</h3>
              
              <!-- Already a Member -->
              <div v-if="isMember" class="space-y-4">
                <div class="flex items-center justify-center gap-2 px-4 py-3 bg-green-500/10 border-2 border-green-500 rounded-xl">
                  <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span class="font-black text-sm text-green-600 uppercase tracking-wider">Active Member</span>
                </div>
                <p class="text-xs text-deep-navy/60 text-center leading-relaxed">
                  You have access to all member-exclusive events and content.
                </p>
              </div>

              <!-- Not a Member - Show Join Options -->
              <div v-else class="space-y-4">
                <!-- Invite Required Notice -->
                <div v-if="organisation.required_acceptance_code" class="flex items-start gap-3 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
                  <svg class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                  </svg>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-black text-amber-700 uppercase tracking-wider mb-1">Invite Required</p>
                    <p class="text-xs text-amber-900/80">This community requires an invitation code.</p>
                  </div>
                </div>

                <!-- Manual Verification Notice -->
                <div v-if="organisation.requires_manual_verification" class="flex items-start gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                  <svg class="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
                  </svg>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-black text-blue-700 uppercase tracking-wider mb-1">Manual Review</p>
                    <p class="text-xs text-blue-900/80">Requests are reviewed by administrators.</p>
                  </div>
                </div>

                <!-- Request Membership Button -->
                <button
                  :disabled="joiningOrganisation || (organisation.required_acceptance_code && !organisation.requires_manual_verification)"
                  @click="requestMembership"
                  class="w-full bg-deep-navy hover:bg-deep-navy/90 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-deep-navy"
                >
                  {{ organisation.required_acceptance_code && !organisation.requires_manual_verification 
                    ? 'Invite Required' 
                    : 'Request to Join' 
                  }}
                </button>

                <!-- I have an invite code button -->
                <button 
                  v-if="organisation.required_acceptance_code"
                  @click="navigateTo(`/communities/${organisationId}/invite`)"
                  class="w-full flex items-center justify-center gap-2 py-4 border-2 border-deep-navy text-deep-navy rounded-xl hover:bg-deep-navy hover:text-white transition-all font-black text-sm uppercase tracking-wider"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Enter Code
                </button>
              </div>
            </div>

            <!-- External Website -->
            <div v-if="organisation.external_website" class="bg-white border-2 border-deep-navy rounded-xl p-6 shadow-drawn">
              <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/50 mb-4">External Link</h3>
              <a
                :href="organisation.external_website"
                target="_blank"
                class="w-full flex items-center justify-center gap-2 py-4 border-2 border-deep-navy text-deep-navy rounded-xl hover:bg-deep-navy hover:text-white transition-all font-black text-sm uppercase tracking-wider"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Visit Website
              </a>
            </div>

            <!-- Contacts (if available and member) -->
            <div v-if="isMember && organisation.contacts && organisation.contacts.length > 0" class="bg-white border-2 border-deep-navy rounded-xl p-6 shadow-drawn">
              <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/50 mb-4">Contacts</h3>
              <div class="space-y-2 text-sm text-deep-navy/70">
                <p>Contact information available to members.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="isError" class="min-h-screen flex items-center justify-center bg-white px-4">
      <div class="text-center max-w-md">
        <svg class="mx-auto w-20 h-20 text-red-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-2xl font-black text-deep-navy mb-3 uppercase tracking-tight">Failed to Load</h3>
        <p class="text-deep-navy/60 mb-8">Unable to load community details. Please try again later.</p>
        <button
          @click="navigateTo('/communities')"
          class="bg-deep-navy text-white px-8 py-3 rounded-xl font-black uppercase text-sm hover:bg-deep-navy/90 transition-all"
        >
          Browse Communities
        </button>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else-if="!isLoading && !organisation" class="min-h-screen flex items-center justify-center bg-white px-4">
      <div class="text-center max-w-md">
        <svg class="mx-auto w-20 h-20 text-deep-navy/40 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <h3 class="text-2xl font-black text-deep-navy mb-3 uppercase tracking-tight">Community Not Found</h3>
        <p class="text-deep-navy/60 mb-8">The community you're looking for doesn't exist or has been removed.</p>
        <button
          @click="navigateTo('/communities')"
          class="bg-deep-navy text-white px-8 py-3 rounded-xl font-black uppercase text-sm hover:bg-deep-navy/90 transition-all"
        >
          Browse Communities
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOrganisation } from '~/composables/resources/organisation/organisations'
import { useOrganisationMemberships, useCreateOrganisationMembership } from '~/composables/resources/organisation/organisationMemberships'
import { useOrganisationControls } from '~/composables/resources/organisation/organisationControls'
import { useOrganisationInvolvedEvents } from '~/composables/resources/organisation/organisationInvolvedEvents'
import { useOrganisationInvites } from '~/composables/resources/organisation/organisationInvites'
import { useEvents } from '~/composables/resources/events/events'
import { resolveImageUrl, onImageError } from '~/utils/image'
import { useAuthStore } from '~/stores/auth'
import EventCardBold from '~/components/events/display/EventCardBold.vue'

definePageMeta({
  layout: 'default',
})

const route = useRoute()
const authStore = useAuthStore()
const { $notyf } = useNuxtApp()

const organisationId = computed(() => Number(route.params.id))

// Fetch organisation details
const { data: orgData, isLoading, isError } = useOrganisation(organisationId)
const organisation = computed(() => orgData.value?.data)

// Check if user is a member
const { data: membershipsData } = useOrganisationMemberships(computed(() => ({
  organisation: organisationId.value,
  user: authStore.user?.id,
})))
const isMember = computed(() => {
  const memberships = membershipsData.value?.data?.results || []
  return memberships.some(m => m.user === authStore.user?.id)
})

// Check if user is a controller
const { data: controlsData } = useOrganisationControls(computed(() => ({
  organisation: organisationId.value,
  user: authStore.user?.id,
})))
const isController = computed(() => {
  const controls = controlsData.value?.data?.results || []
  return controls.length > 0
})

// Check if user can view events (workaround: check involved events)
const { data: involvedEventsData } = useOrganisationInvolvedEvents(computed(() => ({
  organisation: organisationId.value,
})))
const canViewEvents = computed(() => {
  // Can view if member or if there are public involved events
  return isMember.value || (involvedEventsData.value?.data?.results?.length || 0) > 0
})

// Fetch events for this organization
const { data: eventsData, isLoading: isLoadingEvents } = useEvents(computed(() => ({
  organisation: organisationId.value,
})))
const organizationEvents = computed(() => eventsData.value?.data?.results || [])

// Request membership mutation
const { mutate: createMembership, isPending: joiningOrganisation } = useCreateOrganisationMembership()

const requestMembership = () => {
  if (!authStore.isAuthenticated) {
    $notyf?.error('Please log in to join this community')
    navigateTo('/login')
    return
  }

  createMembership({
    organisation: organisationId.value,
    user: authStore.user!.id,
  }, {
    onSuccess: () => {
      $notyf?.success(organisation.value?.requires_manual_verification 
        ? 'Membership request submitted for review' 
        : 'Successfully joined the community!')
    },
    onError: (error: any) => {
      $notyf?.error(error?.message || 'Failed to join community')
    }
  })
}

// Fetch pending invites count for notification badge
const { data: invitesData } = useOrganisationInvites(computed(() => ({
  target_user: authStore.user?.id,
})))

const pendingInvitesCount = computed(() => {
  const invites = invitesData.value?.data?.results || []
  return invites.filter(inv => !inv.accepted && inv.is_valid && inv.is_active).length
})

// Set page title
useHead({
  title: computed(() => organisation.value?.title || 'Community'),
  meta: [
    { name: 'description', content: computed(() => organisation.value?.description || 'Community details') }
  ]
})
</script>

<style scoped>
.shadow-drawn {
  box-shadow: 6px 6px 0px 0px rgba(10, 25, 47, 0.25);
}
</style>