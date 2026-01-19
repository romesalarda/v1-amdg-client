<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex items-start justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Communities</h1>
            <p class="mt-2 text-gray-600">
              Join communities to connect with others and see exclusive events
            </p>
          </div>
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
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="bg-white rounded-lg shadow overflow-hidden">
          <USkeleton class="h-48 w-full" />
          <div class="p-6 space-y-3">
            <USkeleton class="h-6 w-3/4" />
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-4 w-2/3" />
          </div>
        </div>
      </div>
    </div>

    <!-- Organizations Grid -->
    <div v-else-if="organisations && organisations.length > 0" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <NuxtLink
          v-for="org in organisations"
          :key="org.id"
          :to="`/communities/${org.id}`"
          class="group bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 overflow-hidden"
        >
          <!-- Image -->
          <div class="relative h-48 bg-gray-200 overflow-hidden">
            <img
              v-if="org.landing_image"
              :src="resolveImageUrl(org.landing_image)"
              :alt="org.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              @error="(e) => onImageError(e)"
            />
            <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
              <UIcon name="i-heroicons-building-office" class="w-16 h-16 text-white opacity-50" />
            </div>
            
            <!-- Logo Overlay (if available) -->
            <div v-if="org.logo" class="absolute bottom-3 left-3 w-16 h-16 bg-white rounded-lg shadow-md p-2">
              <img
                :src="resolveImageUrl(org.logo)"
                :alt="`${org.title} logo`"
                class="w-full h-full object-contain"
                @error="(e) => onImageError(e)"
              />
            </div>
          </div>

          <!-- Content -->
          <div class="p-6">
            <h3 class="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {{ org.title }}
            </h3>
            
            <p v-if="org.description" class="mt-2 text-gray-600 line-clamp-2">
              {{ org.description }}
            </p>
            
            <div class="mt-4 flex items-center justify-between text-sm">
              <div class="flex items-center gap-4 text-gray-500">
                <span v-if="org.requires_manual_verification" class="flex items-center gap-1">
                  <UIcon name="i-heroicons-shield-check" class="w-4 h-4" />
                  Verified Only
                </span>
                <span v-if="org.required_acceptance_code" class="flex items-center gap-1">
                  <UIcon name="i-heroicons-lock-closed" class="w-4 h-4" />
                  Invite Required
                </span>
              </div>
              
              <UIcon name="i-heroicons-arrow-right" class="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </NuxtLink>
      </div>

      <!-- Pagination (if needed in future) -->
      <!-- Add pagination controls here if API supports it -->
    </div>

    <!-- Empty State -->
    <div v-else-if="!isLoading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div class="text-center">
        <UIcon name="i-heroicons-building-office" class="mx-auto w-16 h-16 text-gray-400" />
        <h3 class="mt-4 text-lg font-medium text-gray-900">No communities found</h3>
        <p class="mt-2 text-gray-500">Check back later for new communities to join.</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="isError" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <ErrorBar message="Failed to load communities. Please try again later." />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOrganisations } from '~/composables/resources/organisation/organisations'
import { resolveImageUrl, onImageError } from '~/utils/image'

definePageMeta({
  layout: 'default',
})

useHead({
  title: 'Communities',
  meta: [
    { name: 'description', content: 'Browse and join communities to connect with others and discover exclusive events.' }
  ]
})

// Fetch all organizations
const { data, isLoading, isError } = useOrganisations()
const organisations = computed(() => data.value?.data?.results || [])

// Fetch pending invites count for notification badge
import { useOrganisationInvites } from '~/composables/resources/organisation/organisationInvites'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const { data: invitesData } = useOrganisationInvites(computed(() => ({
  target_user: authStore.user?.id,
})))

const pendingInvitesCount = computed(() => {
  const invites = invitesData.value?.data?.results || []
  return invites.filter(inv => !inv.accepted && inv.is_valid && inv.is_active).length
})
</script>