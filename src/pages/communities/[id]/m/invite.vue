<template>
  <CommunitiesManagementLayout :organisation-id="organisationId" :organisation="organisation">
    <div class="space-y-6">
      <!-- Send Invitation Section -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Send Invitation</h2>
          <p class="text-sm text-gray-600 mt-1">Invite users to join your community</p>
        </div>
        
        <div class="p-6">
          <!-- Search Users -->
          <div class="mb-6">
            <label for="search" class="block text-sm font-medium text-gray-700 mb-2">
              Search Users
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UIcon name="i-heroicons-magnifying-glass" class="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="search"
                v-model="searchQuery"
                type="text"
                placeholder="Search by name or email..."
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                @input="debouncedSearch"
              />
            </div>
          </div>

          <!-- Search Results -->
          <div v-if="searchQuery && filteredUsers.length > 0" class="space-y-2 mb-6">
            <p class="text-sm font-medium text-gray-700 mb-3">Search Results</p>
            <div
              v-for="user in filteredUsers"
              :key="user.id"
              class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <UIcon name="i-heroicons-user" class="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">
                    {{ user.first_name }} {{ user.last_name }}
                  </p>
                  <p class="text-xs text-gray-600">{{ user.email }}</p>
                </div>
              </div>
              
              <div class="flex items-center gap-2">
                <span v-if="hasInvite(user.id)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <UIcon name="i-heroicons-envelope" class="w-3 h-3 mr-1" />
                  Invited
                </span>
                <span v-else-if="isMember(user.id)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <UIcon name="i-heroicons-check-circle" class="w-3 h-3 mr-1" />
                  Member
                </span>
                <UButton
                  v-else
                  size="sm"
                  :loading="sendingInviteToUserId === user.id"
                  @click="sendInvite(user.id)"
                >
                  Send Invite
                </UButton>
              </div>
            </div>
          </div>

          <!-- No Results -->
          <div v-else-if="searchQuery && filteredUsers.length === 0 && !isLoadingUsers" class="text-center py-8">
            <UIcon name="i-heroicons-user-group" class="mx-auto h-12 w-12 text-gray-400" />
            <p class="mt-2 text-sm text-gray-600">No users found</p>
          </div>

          <!-- Loading -->
          <div v-else-if="isLoadingUsers" class="text-center py-8">
            <USkeleton class="h-12 w-full" />
          </div>
        </div>
      </div>

      <!-- Pending Invitations -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Pending Invitations</h2>
          <p class="text-sm text-gray-600 mt-1">Invitations sent to users</p>
        </div>

        <!-- Loading State -->
        <div v-if="isLoadingInvites" class="p-6 space-y-4">
          <div v-for="i in 3" :key="i" class="flex items-center gap-3">
            <USkeleton class="h-12 w-12 rounded-full" />
            <div class="flex-1 space-y-2">
              <USkeleton class="h-4 w-32" />
              <USkeleton class="h-3 w-48" />
            </div>
          </div>
        </div>

        <!-- Invitations List -->
        <div v-else-if="pendingInvites.length > 0" class="divide-y divide-gray-200">
          <div
            v-for="invite in pendingInvites"
            :key="invite.id"
            class="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <UIcon name="i-heroicons-envelope" class="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">
                  {{ invite?.target_user_name || 'Invited User' }}
                </p>
                <p class="text-xs text-gray-600">{{ invite.target_user_email }}</p>
                <div class="flex items-center gap-3 mt-1">
                  <p class="text-xs text-gray-500">
                    Sent {{ formatDate(invite.added_at) }}
                  </p>
                  <span v-if="invite.expires_at" class="text-xs" :class="{
                    'text-red-600': isExpiringSoon(invite.expires_at),
                    'text-gray-500': !isExpiringSoon(invite.expires_at)
                  }">
                    Expires {{ formatDate(invite.expires_at) }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="flex items-center gap-2">
              <span v-if="!invite.is_valid" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Expired
              </span>
              <span v-else-if="!invite.is_active" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Inactive
              </span>
              <UButton
                size="sm"
                color="red"
                variant="ghost"
                :loading="removingInviteId === invite.id"
                @click="removeInvite(invite.id)"
              >
                Cancel
              </UButton>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="px-6 py-12 text-center">
          <div class="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <UIcon name="i-heroicons-envelope" class="w-8 h-8 text-gray-400" />
          </div>
          <p class="text-sm text-gray-600">No pending invitations</p>
          <p class="text-xs text-gray-500 mt-1">Search for users above to send invitations</p>
        </div>
      </div>

      <!-- Access Codes Section -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Access Codes</h2>
          <p class="text-sm text-gray-600 mt-1">Create codes that users can use to join your community</p>
        </div>

        <!-- Create Access Code Form -->
        <div class="p-6 border-b border-gray-200 bg-gray-50">
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="max_uses" class="block text-sm font-medium text-gray-700 mb-2">
                  Max Uses (optional)
                </label>
                <input
                  id="max_uses"
                  v-model.number="newAccessCode.max_uses"
                  type="number"
                  min="1"
                  placeholder="Unlimited"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label for="expires_at" class="block text-sm font-medium text-gray-700 mb-2">
                  Expires At (optional)
                </label>
                <input
                  id="expires_at"
                  v-model="newAccessCode.expires_at"
                  type="datetime-local"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <UButton
              :loading="isCreatingCode"
              @click="createAccessCode"
            >
              <UIcon name="i-heroicons-plus" class="w-4 h-4 mr-2" />
              Generate Code
            </UButton>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoadingCodes" class="p-6 space-y-4">
          <div v-for="i in 2" :key="i" class="flex items-center gap-3">
            <USkeleton class="h-12 w-full" />
          </div>
        </div>

        <!-- Access Codes List -->
        <div v-else-if="accessCodes.length > 0" class="divide-y divide-gray-200">
          <div
            v-for="code in accessCodes"
            :key="code.id"
            class="px-6 py-4 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <code class="text-lg font-mono font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded">
                    {{ code.code }}
                  </code>
                  <button
                    @click="copyCode(code.code || '')"
                    class="text-gray-500 hover:text-gray-700"
                    title="Copy code"
                  >
                    <UIcon name="i-heroicons-clipboard-document" class="w-5 h-5" />
                  </button>
                </div>
                <div class="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <span class="flex items-center gap-1">
                    <UIcon name="i-heroicons-user-group" class="w-3 h-3" />
                    {{ code.uses }} / {{ code.max_uses || '∞' }} uses
                  </span>
                  <span v-if="code.expires_at" class="flex items-center gap-1" :class="{
                    'text-red-600': isExpiringSoon(code.expires_at),
                  }">
                    <UIcon name="i-heroicons-clock" class="w-3 h-3" />
                    Expires {{ formatDate(code.expires_at) }}
                  </span>
                  <span v-else class="flex items-center gap-1">
                    <UIcon name="i-heroicons-infinity" class="w-3 h-3" />
                    No expiration
                  </span>
                  <span class="flex items-center gap-1">
                    <UIcon name="i-heroicons-calendar" class="w-3 h-3" />
                    Created {{ formatDate(code.added_at) }}
                  </span>
                </div>
              </div>
              
              <div class="flex items-center gap-2">
                <span v-if="!code.is_valid" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Invalid
                </span>
                <span v-else-if="!code.is_active" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Inactive
                </span>
                <span v-else-if="code.is_single_use && code.uses > 0" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  Used
                </span>
                <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
                <UButton
                  size="sm"
                  color="red"
                  variant="ghost"
                  :loading="removingCodeId === code.id"
                  @click="removeAccessCode(code.id)"
                >
                  Delete
                </UButton>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="px-6 py-12 text-center">
          <div class="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <UIcon name="i-heroicons-key" class="w-8 h-8 text-gray-400" />
          </div>
          <p class="text-sm text-gray-600">No access codes created</p>
          <p class="text-xs text-gray-500 mt-1">Generate a code above to allow users to join with a code</p>
        </div>
      </div>

      <!-- Info Box -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div class="flex gap-3">
          <UIcon name="i-heroicons-information-circle" class="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div class="text-sm text-blue-900">
            <p class="font-medium mb-1">About Invitations & Access Codes</p>
            <p class="text-blue-800">
              Send invitations to specific users or create access codes that anyone can use. Invited users will receive a notification,
              while access codes can be shared freely. Both can have expiration dates and usage limits.
            </p>
          </div>
        </div>
      </div>
    </div>
  </CommunitiesManagementLayout>
</template>

<script setup lang="ts">
import { useOrganisation } from '~/composables/resources/organisation/organisations'
import { useOrganisationMemberships } from '~/composables/resources/organisation/organisationMemberships'
import { useOrganisationInvites, useCreateOrganisationInvite, useDeleteOrganisationInvite } from '~/composables/resources/organisation/organisationInvites'
import { useOrganisationAcceptanceCodes, useCreateOrganisationAcceptanceCode, useDeleteOrganisationAcceptanceCode } from '~/composables/resources/organisation/organisationAcceptanceCodes'
import { useUsers } from '~/composables/resources/user/users'
import { formatDate, isExpiringSoon } from '~/utils/time'
import { useDebounceFn } from '@vueuse/core'

definePageMeta({
  middleware: ['auth', 'organisation-controller'],
  layout: 'default',
})

const route = useRoute()
const { $notyf } = useNuxtApp()

const organisationId = computed(() => route.params.id as string)
// Search functionality
const searchQuery = ref('')
useHead({
  title: 'Send Invitations',
})

// Fetch organization data
const { data: orgData } = useOrganisation(computed(() => Number(organisationId.value)))
const organisation = computed(() => orgData.value?.data)

// Fetch all users for search
const { data: usersData, isLoading: isLoadingUsers } = useUsers(computed(() => ({
  search: searchQuery.value,
})))

const allUsers = computed(() => usersData.value?.data?.results || [])

// Fetch organization members
const { data: membershipsData } = useOrganisationMemberships(computed(() => ({
  organisation: Number(organisationId.value),
})))

const members = computed(() => membershipsData.value?.data?.results || [])

// Fetch pending invites
const { data: invitesData, isLoading: isLoadingInvites } = useOrganisationInvites(computed(() => ({
  organisation: Number(organisationId.value),
})))

const allInvites = computed(() => invitesData.value?.data?.results || [])
const pendingInvites = computed(() => allInvites.value.filter(inv => !inv.accepted && inv.is_valid))


const filteredUsers = computed(() => {
  if (!searchQuery.value || searchQuery.value.length < 2) return []
  return allUsers.value
})

const debouncedSearch = useDebounceFn(() => {
  // Search is reactive via the query parameter
}, 300)

// Check if user already has an invite
const hasInvite = (userId: number) => {
  return allInvites.value.some(inv => inv.target_user === userId && !inv.accepted)
}

// Check if user is already a member
const isMember = (userId: number) => {
  return members.value.some(m => m.user === userId)
}

// Send invite mutation
const { mutate: createInvite, isPending: isSendingInvite } = useCreateOrganisationInvite()
const sendingInviteToUserId = ref<number | null>(null)

const sendInvite = (userId: number) => {
  sendingInviteToUserId.value = userId
  
  createInvite({
    organisation: Number(organisationId.value),
    target_user: userId,
  }, {
    onSuccess: () => {
      $notyf.success('Invitation sent successfully!')
      sendingInviteToUserId.value = null
      searchQuery.value = '' // Clear search
    },
    onError: (error: any) => {
      $notyf.error(error?.body?.error || error?.message || 'Failed to send invitation')
      sendingInviteToUserId.value = null
    }
  })
}

// Remove invite mutation
const { mutate: deleteInvite, isPending: isRemovingInvite } = useDeleteOrganisationInvite()
const removingInviteId = ref<string | null>(null)

const removeInvite = (inviteId: string) => {
  if (!confirm('Are you sure you want to cancel this invitation?')) {
    return
  }
  
  removingInviteId.value = inviteId
  
  deleteInvite(inviteId, {
    onSuccess: () => {
      $notyf.success('Invitation cancelled successfully!')
      removingInviteId.value = null
    },
    onError: (error: any) => {
      $notyf.error(error?.body?.error || error?.message || 'Failed to cancel invitation')
      removingInviteId.value = null
    }
  })
}

// Access Codes Management
const { data: codesData, isLoading: isLoadingCodes } = useOrganisationAcceptanceCodes(computed(() => ({
  organisation: Number(organisationId.value),
})))

const accessCodes = computed(() => codesData.value?.data?.results || [])

// New access code form
const newAccessCode = ref({
  max_uses: undefined as number | undefined,
  expires_at: '',
})

// Create access code mutation
const { mutate: createCode, isPending: isCreatingCode } = useCreateOrganisationAcceptanceCode()

const createAccessCode = () => {
  const body: any = {
    organisation: Number(organisationId.value),
  }

  if (newAccessCode.value.max_uses) {
    body.max_uses = newAccessCode.value.max_uses
  }

  if (newAccessCode.value.expires_at) {
    body.expires_at = new Date(newAccessCode.value.expires_at).toISOString()
  }

  createCode(body, {
    onSuccess: () => {
      $notyf.success('Access code created successfully!')
      // Reset form
      newAccessCode.value = {
        max_uses: undefined,
        expires_at: '',
      }
    },
    onError: (error: any) => {
      $notyf.error(error?.body?.error || error?.message || 'Failed to create access code')
    }
  })
}

// Delete access code mutation
const { mutate: deleteCode, isPending: isRemovingCode } = useDeleteOrganisationAcceptanceCode()
const removingCodeId = ref<number | null>(null)

const removeAccessCode = (codeId: number) => {
  if (!confirm('Are you sure you want to delete this access code?')) {
    return
  }
  
  removingCodeId.value = codeId
  
  deleteCode(codeId, {
    onSuccess: () => {
      $notyf.success('Access code deleted successfully!')
      removingCodeId.value = null
    },
    onError: (error: any) => {
      $notyf.error(error?.body?.error || error?.message || 'Failed to delete access code')
      removingCodeId.value = null
    }
  })
}

// Copy code to clipboard
const copyCode = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code)
    $notyf.success('Code copied to clipboard!')
  } catch (error) {
    $notyf.error('Failed to copy code')
  }
}
</script>
        
        