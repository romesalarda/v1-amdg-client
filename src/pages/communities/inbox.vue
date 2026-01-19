<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Community Invitations</h1>
            <p class="mt-2 text-gray-600">
              View and manage your organization invitations
            </p>
          </div>
          <UButton to="/communities" variant="outline">
            Browse Communities
          </UButton>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="space-y-4">
        <div v-for="i in 3" :key="i" class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center gap-4">
            <USkeleton class="h-16 w-16 rounded-lg" />
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
    <div v-else-if="invites && invites.length > 0" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="space-y-4">
        <div
          v-for="invite in invites"
          :key="invite.id"
          class="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div class="p-6">
            <div class="flex items-start gap-4">
              <!-- Organization Logo -->
              <div class="w-16 h-16 bg-gray-100 rounded-lg p-2 flex-shrink-0">
                <UIcon name="i-heroicons-building-office" class="w-full h-full text-gray-400" />
              </div>

              <!-- Invitation Details -->
              <div class="flex-1 min-w-0">
                <h3 class="text-lg font-semibold text-gray-900 mb-1">
                  {{ invite.organisation_name }}
                </h3>
                
                <div class="space-y-2 text-sm text-gray-600">
                  <p v-if="invite.invited_by_name" class="flex items-center gap-1">
                    <UIcon name="i-heroicons-user" class="w-4 h-4" />
                    Invited by {{ invite.invited_by_name }}
                  </p>
                  <p class="flex items-center gap-1">
                    <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
                    Received {{ formatDate(invite.added_at) }}
                  </p>
                  <p v-if="invite.expires_at" class="flex items-center gap-1" :class="{
                    'text-red-600': isExpiringSoon(invite.expires_at),
                    'text-amber-600': !isExpiringSoon(invite.expires_at) && !invite.is_valid
                  }">
                    <UIcon name="i-heroicons-clock" class="w-4 h-4" />
                    {{ invite.is_valid ? `Expires ${formatDate(invite.expires_at)}` : 'Expired' }}
                  </p>
                </div>

                <!-- Status Badges -->
                <div class="mt-3 flex items-center gap-2">
                  <span v-if="invite.accepted" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <UIcon name="i-heroicons-check-circle" class="w-3 h-3 mr-1" />
                    Accepted
                  </span>
                  <span v-else-if="!invite.is_valid" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <UIcon name="i-heroicons-x-circle" class="w-3 h-3 mr-1" />
                    Invalid
                  </span>
                  <span v-else-if="!invite.is_active" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Inactive
                  </span>
                  <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <UIcon name="i-heroicons-envelope" class="w-3 h-3 mr-1" />
                    Pending
                  </span>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex flex-col gap-2 flex-shrink-0">
                <UButton
                  v-if="!invite.accepted && invite.is_valid && invite.is_active"
                  color="primary"
                  size="sm"
                  :loading="acceptingInviteId === invite.id"
                  @click="handleAcceptInvite(invite.id)"
                >
                  Accept
                </UButton>
                <UButton
                  variant="outline"
                  size="sm"
                  :to="`/communities/${invite.organisation}`"
                >
                  View Community
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!isLoading" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div class="text-center">
        <div class="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <UIcon name="i-heroicons-inbox" class="w-8 h-8 text-gray-400" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No invitations</h3>
        <p class="text-gray-500 mb-6">
          You don't have any pending organization invitations.
        </p>
        <UButton to="/communities">
          Browse Communities
        </UButton>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="isError" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <ErrorBar message="Failed to load invitations. Please try again later." />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOrganisationInvites, useAcceptOrganisationInvite } from '~/composables/resources/organisation/organisationInvites'
import { useAuthStore } from '~/stores/auth'
import { formatDate, isExpiringSoon } from '~/utils/time'

definePageMeta({
  middleware: ['auth'],
  layout: 'default',
})

useHead({
  title: 'Community Invitations',
  meta: [
    { name: 'description', content: 'View and manage your organization invitations' }
  ]
})

const authStore = useAuthStore()
const { $notyf } = useNuxtApp()

const acceptingInviteId = ref<string | null>(null)

// Fetch user's invites
const { data, isLoading, isError } = useOrganisationInvites(computed(() => ({
  target_user: authStore.user?.id,
})))

const invites = computed(() => data.value?.data?.results || [])

// Accept invite mutation
const { mutate: acceptInvite } = useAcceptOrganisationInvite()

const handleAcceptInvite = (inviteId: string) => {
  acceptingInviteId.value = inviteId
  
  acceptInvite(inviteId, {
    onSuccess: (response) => {
      $notyf?.success('Invitation accepted successfully!')
      acceptingInviteId.value = null
      
      // Navigate to the organization page
      const invite = invites.value.find(inv => inv.id === inviteId)
      if (invite) {
        setTimeout(() => {
          navigateTo(`/communities/${invite.organisation}`)
        }, 1500)
      }
    },
    onError: (error: any) => {
      $notyf?.error(error?.body?.error || error?.message || 'Failed to accept invitation')
      acceptingInviteId.value = null
    }
  })
}
</script>