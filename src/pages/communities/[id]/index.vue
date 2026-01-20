<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading State -->
    <div v-if="isLoading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <USkeleton class="h-8 w-32 mb-6" />
      <USkeleton class="h-64 w-full mb-8" />
      <div class="space-y-4">
        <USkeleton class="h-12 w-3/4" />
        <USkeleton class="h-4 w-full" />
        <USkeleton class="h-4 w-5/6" />
      </div>
    </div>

    <!-- Organization Content -->
    <div v-else-if="organisation" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Navigation Buttons -->
      <div class="flex items-center justify-between mb-6">
        <UButton 
          to="/communities" 
          icon="i-heroicons-arrow-left" 
          variant="ghost" 
          color="gray"
        >
          Back to Communities
        </UButton>
        <div class="flex items-center gap-3">
          <UButton 
            v-if="isController"
            :to="`/communities/${organisationId}/m/dashboard`" 
            color="primary"
            variant="outline"
          >
            <UIcon name="i-heroicons-cog-6-tooth" class="w-5 h-5 mr-2" />
            Manage Community
          </UButton>
          <UButton 
            to="/communities/inbox" 
            color="gray"
            variant="outline"
            class="relative"
          >
            <UIcon name="i-heroicons-inbox" class="w-5 h-5 mr-2" />
            Invitations
            <span 
              v-if="pendingInvitesCount > 0" 
              class="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
            >
              {{ pendingInvitesCount > 9 ? '9+' : pendingInvitesCount }}
            </span>
          </UButton>
        </div>
      </div>

      <!-- Hero Section with Landing Image -->
      <div v-if="organisation.landing_image" class="relative h-64 md:h-96 rounded-lg overflow-hidden shadow-lg mb-8">
        <img
          :src="resolveImageUrl(organisation.landing_image)"
          :alt="organisation.title"
          class="w-full h-full object-cover"
          @error="(e) => onImageError(e)"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        <!-- Logo and Title Overlay -->
        <div class="absolute bottom-0 left-0 right-0 p-8">
          <div class="flex items-end gap-4">
            <div v-if="organisation.logo" class="w-20 h-20 md:w-24 md:h-24 bg-white rounded-lg shadow-lg p-2 flex-shrink-0">
              <img
                :src="resolveImageUrl(organisation.logo)"
                :alt="`${organisation.title} logo`"
                class="w-full h-full object-contain"
                @error="(e) => onImageError(e)"
              />
            </div>
            <div>
              <h1 class="text-3xl md:text-4xl font-bold text-white">{{ organisation.title }}</h1>
            </div>
          </div>
        </div>
      </div>

      <!-- Simple Header (if no landing image) -->
      <div v-else class="mb-8">
        <div class="flex items-center gap-4 mb-4">
          <div v-if="organisation.logo" class="w-16 h-16 md:w-20 md:h-20 bg-white rounded-lg shadow p-2 flex-shrink-0">
            <img
              :src="resolveImageUrl(organisation.logo)"
              :alt="`${organisation.title} logo`"
              class="w-full h-full object-contain"
              @error="(e) => onImageError(e)"
            />
          </div>
          <h1 class="text-3xl md:text-4xl font-bold text-gray-900">{{ organisation.title }}</h1>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Description -->
          <div v-if="organisation.description" class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">About</h2>
            <div class="prose prose-gray max-w-none">
              <p class="text-gray-700 whitespace-pre-line">{{ organisation.description }}</p>
            </div>
          </div>

          <!-- Events Section (if member or organization has involved events) -->
          <div v-if="isMember || canViewEvents" class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <UIcon name="i-heroicons-calendar" class="w-5 h-5" />
              Events
            </h2>
            <!-- Display organization events -->
            <div v-if="isLoadingEvents" class="space-y-4">
              <USkeleton class="h-32 w-full" />
              <USkeleton class="h-32 w-full" />
            </div>
            <div v-else-if="organizationEvents && organizationEvents.length > 0" class="space-y-4">
              <EventListItem 
                v-for="event in organizationEvents" 
                :key="event.event_id" 
                :event="event" 
              />
            </div>
            <div v-else class="text-center py-8 text-gray-500">
              <UIcon name="i-heroicons-calendar-days" class="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No events available yet.</p>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Membership Status Card -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Membership</h3>
            
            <!-- Already a Member -->
            <div v-if="isMember" class="space-y-4">
              <div class="flex items-center gap-2 text-green-600">
                <UIcon name="i-heroicons-check-circle" class="w-5 h-5" />
                <span class="font-medium">You're a member</span>
              </div>
              <p class="text-sm text-gray-600">
                You have access to all member-exclusive events and content.
              </p>
            </div>

            <!-- Not a Member - Show Join Options -->
            <div v-else class="space-y-4">
              <div v-if="organisation.required_acceptance_code" class="text-sm text-gray-600">
                <div class="flex items-center gap-2 mb-2">
                  <UIcon name="i-heroicons-lock-closed" class="w-4 h-4 text-amber-500" />
                  <span class="font-medium text-amber-700">Invite Required</span>
                </div>
                <p>This community requires an invitation code to join.</p>
              </div>

              <div v-if="organisation.requires_manual_verification" class="text-sm text-gray-600">
                <div class="flex items-center gap-2 mb-2">
                  <UIcon name="i-heroicons-shield-check" class="w-4 h-4 text-blue-500" />
                  <span class="font-medium text-blue-700">Manual Verification</span>
                </div>
                <p>Membership requests are reviewed manually by administrators.</p>
              </div>

              <!-- Request Membership Button -->
              <UButton 
                block
                color="primary"
                :disabled="joiningOrganisation || (organisation.required_acceptance_code && !organisation.requires_manual_verification)"
                @click="requestMembership"
              >
                {{ organisation.required_acceptance_code && !organisation.requires_manual_verification 
                  ? 'Invite Code Required' 
                  : 'Request to Join' 
                }}
              </UButton>

              <!-- If requires code, show link to invite page -->
              <UButton 
                v-if="organisation.required_acceptance_code"
                block
                variant="outline"
                :to="`/communities/${organisationId}/invite`"
              >
                I have an invite code
              </UButton>
            </div>
          </div>

          <!-- Stats Card -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Members</span>
                <span class="font-semibold text-gray-900">{{ organisation.memberships_count || 0 }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Controllers</span>
                <span class="font-semibold text-gray-900">{{ organisation.controllers_count || 0 }}</span>
              </div>
            </div>
          </div>

          <!-- External Website -->
          <div v-if="organisation.external_website" class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Links</h3>
            <UButton
              :to="organisation.external_website"
              target="_blank"
              block
              variant="outline"
              trailing-icon="i-heroicons-arrow-top-right-on-square"
            >
              Visit Website
            </UButton>
          </div>

          <!-- Contacts (if available and member) -->
          <div v-if="isMember && organisation.contacts && organisation.contacts.length > 0" class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Contacts</h3>
            <div class="space-y-2 text-sm text-gray-600">
              <!-- Display contact information here -->
              <p>Contact information available to members.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="isError" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <ErrorBar message="Failed to load community details. Please try again later." />
    </div>

    <!-- Not Found -->
    <div v-if="!isLoading && !organisation && !isError" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div class="text-center">
        <UIcon name="i-heroicons-building-office" class="mx-auto w-16 h-16 text-gray-400" />
        <h3 class="mt-4 text-lg font-medium text-gray-900">Community not found</h3>
        <p class="mt-2 text-gray-500">The community you're looking for doesn't exist or has been removed.</p>
        <UButton to="/communities" class="mt-6">
          Browse Communities
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOrganisation } from '~/composables/resources/organisation/organisations'
import { useOrganisationMemberships, useCreateOrganisationMembership } from '~/composables/resources/organisation/organisationMemberships'
import { useOrganisationControls } from '~/composables/resources/organisation/organisationControls'
import { useOrganisationInvolvedEvents } from '~/composables/resources/organisation/organisationInvolvedEvents'
import { useEvents } from '~/composables/resources/events/events'
import { resolveImageUrl, onImageError } from '~/utils/image'
import { useAuthStore } from '~/stores/auth'
import EventListItem from '~/components/events/display/EventListItem.vue'

definePageMeta({
  layout: 'default',
})

const route = useRoute()
const authStore = useAuthStore()
const {$notyf} = useNuxtApp()

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
import { useOrganisationInvites } from '~/composables/resources/organisation/organisationInvites'

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