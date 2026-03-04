<template>
  <CommunitiesManagementLayout :organisation-id="organisationId" :organisation="organisation">
    <div class="space-y-8">
      <!-- Send Invitation Section -->
      <div class="bg-white border-2 border-deep-navy rounded-xl shadow-drawn">
        <div class="px-8 py-6 border-b-2 border-deep-navy/10">
          <h2 class="text-xl font-black text-deep-navy uppercase tracking-tight">Send Invitation</h2>
          <p class="text-sm text-deep-navy/60 mt-2 font-medium">Invite users to join your community</p>
        </div>
        
        <div class="p-8">
          <!-- Search Users -->
          <div class="mb-8">
            <label for="search" class="block text-[10px] font-black text-deep-navy/50 mb-3 uppercase tracking-[0.2em]">
              Search Users
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-deep-navy/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                id="search"
                v-model="searchQuery"
                type="text"
                placeholder="Search by name or email..."
                class="w-full pl-12 pr-4 py-4 border-2 bg-white border-deep-navy rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                @input="debouncedSearch"
              />
            </div>
          </div>

          <!-- Search Results -->
          <div v-if="searchQuery && filteredUsers.length > 0" class="space-y-3 mb-8">
            <p class="text-[10px] font-black text-deep-navy/50 mb-4 uppercase tracking-[0.2em]">Search Results</p>
            <div
              v-for="user in filteredUsers"
              :key="user.id"
              class="flex items-center justify-between p-5 bg-white border-2 border-deep-navy/10 rounded-xl hover:border-deep-navy/30 transition-all"
            >
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border-2 border-blue-500/20">
                  <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-black text-deep-navy uppercase tracking-tight">
                    {{ user.first_name }} {{ user.last_name }}
                  </p>
                  <p class="text-xs text-deep-navy/60 font-medium">{{ user.email }}</p>
                </div>
              </div>
              
              <div class="flex items-center gap-2">
                <span v-if="hasInvite(user.id)" class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500 text-white">
                  <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  Invited
                </span>
                <span v-else-if="isMember(user.id)" class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-500 text-white">
                  <svg class="w-3 h-3 mr-1 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  Member
                </span>
                <button
                  v-else
                  :disabled="sendingInviteToUserId === user.id"
                  @click="sendInvite(user.id)"
                  class="px-5 py-2 bg-deep-navy hover:bg-deep-navy/90 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  {{ sendingInviteToUserId === user.id ? 'Sending...' : 'Send Invite' }}
                </button>
              </div>
            </div>
          </div>

          <!-- No Results -->
          <div v-else-if="searchQuery && filteredUsers.length === 0 && !isLoadingUsers" class="text-center py-12 bg-deep-navy/5 border-2 border-dashed border-deep-navy/20 rounded-xl">
            <svg class="mx-auto h-16 w-16 text-deep-navy/30 mb-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
            <p class="text-sm font-bold text-deep-navy/60">No users found</p>
          </div>

          <!-- Loading -->
          <div v-else-if="isLoadingUsers" class="text-center py-8">
            <USkeleton class="h-16 w-full" />
          </div>
        </div>
      </div>

      <!-- Pending Invitations -->
      <div class="bg-white border-2 border-deep-navy rounded-xl shadow-drawn">
        <div class="px-8 py-6 border-b-2 border-deep-navy/10">
          <h2 class="text-xl font-black text-deep-navy uppercase tracking-tight">Pending Invitations</h2>
          <p class="text-sm text-deep-navy/60 mt-2 font-medium">Invitations sent to users</p>
        </div>

        <!-- Loading State -->
        <div v-if="isLoadingInvites" class="p-8 space-y-4">
          <div v-for="i in 3" :key="i" class="flex items-center gap-4">
            <USkeleton class="h-14 w-14 rounded-xl" />
            <div class="flex-1 space-y-2">
              <USkeleton class="h-5 w-40" />
              <USkeleton class="h-4 w-56" />
            </div>
          </div>
        </div>

        <!-- Invitations List -->
        <div v-else-if="pendingInvites.length > 0" class="divide-y-2 divide-deep-navy/5">
          <div
            v-for="invite in pendingInvites"
            :key="invite.id"
            class="px-8 py-6 flex items-center justify-between hover:bg-deep-navy/5 transition-colors"
          >
            <div class="flex items-center gap-5">
              <div class="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center border-2 border-blue-500/20">
                <svg class="w-7 h-7 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </div>
              <div>
                <p class="text-sm font-black text-deep-navy uppercase tracking-tight">
                  {{ invite?.target_user_name || 'Invited User' }}
                </p>
                <p class="text-xs text-deep-navy/60 font-medium mt-0.5">{{ invite.target_user_email }}</p>
                <div class="flex items-center gap-4 mt-2">
                  <p class="text-[10px] text-deep-navy/50 font-bold uppercase tracking-wider">
                    Sent {{ formatDate(invite.added_at) }}
                  </p>
                  <span v-if="invite.expires_at" class="text-[10px] font-bold uppercase tracking-wider" :class="{
                    'text-red-600': isExpiringSoon(invite.expires_at),
                    'text-deep-navy/50': !isExpiringSoon(invite.expires_at)
                  }">
                    Expires {{ formatDate(invite.expires_at) }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="flex items-center gap-3">
              <span v-if="!invite.is_valid" class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500 text-white">
                Expired
              </span>
              <span v-else-if="!invite.is_active" class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gray-500 text-white">
                Inactive
              </span>
              <button
                :disabled="removingInviteId === invite.id"
                @click="removeInvite(invite.id)"
                class="px-5 py-2 border-2 border-red-500 text-red-600 hover:bg-red-500 hover:text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50"
              >
                {{ removingInviteId === invite.id ? 'Cancelling...' : 'Cancel' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="px-8 py-16 text-center">
          <div class="w-20 h-20 mx-auto bg-deep-navy/5 rounded-xl flex items-center justify-center mb-5 border-2 border-deep-navy/10">
            <svg class="w-10 h-10 text-deep-navy/30" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          </div>
          <p class="text-sm font-bold text-deep-navy/60">No pending invitations</p>
          <p class="text-xs text-deep-navy/40 mt-2 font-medium">Search for users above to send invitations</p>
        </div>
      </div>

      <!-- Access Codes Section -->
      <div class="bg-white border-2 border-deep-navy rounded-xl shadow-drawn">
        <div class="px-8 py-6 border-b-2 border-deep-navy/10">
          <h2 class="text-xl font-black text-deep-navy uppercase tracking-tight">Access Codes</h2>
          <p class="text-sm text-deep-navy/60 mt-2 font-medium">Create codes that users can use to join your community</p>
        </div>

        <!-- Create Access Code Form -->
        <div class="p-8 border-b-2 border-deep-navy/10 bg-deep-navy/5">
          <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="max_uses" class="block text-[10px] font-black text-deep-navy/50 mb-3 uppercase tracking-[0.2em]">
                  Max Uses (optional)
                </label>
                <input
                  id="max_uses"
                  v-model.number="newAccessCode.max_uses"
                  type="number"
                  min="1"
                  placeholder="Unlimited"
                  class="w-full px-4 py-4 bg-white border-2 border-deep-navy rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                />
              </div>
              <div>
                <label for="expires_at" class="block text-[10px] font-black text-deep-navy/50 mb-3 uppercase tracking-[0.2em]">
                  Expires At (optional)
                </label>
                <input
                  id="expires_at"
                  v-model="newAccessCode.expires_at"
                  type="datetime-local"
                  class="w-full px-4 py-4 bg-white border-2 bg-white border-deep-navy rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                />
              </div>
            </div>
            <button
              :disabled="isCreatingCode"
              @click="createAccessCode"
              class="px-6 py-4 bg-deep-navy hover:bg-deep-navy/90 text-white rounded-xl font-black text-sm uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              {{ isCreatingCode ? 'Generating...' : 'Generate Code' }}
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoadingCodes" class="p-8 space-y-4">
          <div v-for="i in 2" :key="i" class="flex items-center justify-between">
            <div class="flex-1 space-y-2">
              <USkeleton class="h-6 w-48" />
              <USkeleton class="h-4 w-64" />
            </div>
            <USkeleton class="h-10 w-24" />
          </div>
        </div>

        <!-- Access Codes List -->
        <div v-else-if="accessCodes.length > 0" class="divide-y-2 divide-deep-navy/5">
          <div
            v-for="code in accessCodes"
            :key="code.id"
            class="px-8 py-6 hover:bg-deep-navy/5 transition-colors"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-3">
                  <code class="px-4 py-2 bg-blue-500/10 border-2 border-blue-500/20 rounded-xl text-lg font-black text-blue-600 tracking-wider">
                    {{ code.code }}
                  </code>
                  <button
                    @click="copyCode(code.code || '')"
                    class="p-2 hover:bg-deep-navy/10 rounded-lg transition-colors"
                    title="Copy code"
                  >
                    <svg class="w-5 h-5 text-deep-navy/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
                
                <div class="flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-wider text-deep-navy/50">
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"></path>
                    </svg>
                    <span>{{ code.uses }} / {{ code.max_uses || '∞' }} uses</span>
                  </div>
                  <div v-if="code.expires_at" class="flex items-center gap-2" :class="{
                    'text-red-600': isExpiringSoon(code.expires_at),
                  }">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"></path>
                    </svg>
                    <span>Expires {{ formatDate(code.expires_at) }}</span>
                  </div>
                  <div v-else class="flex items-center gap-2">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
                    </svg>
                    <span>Never expires</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"></path>
                    </svg>
                    <span>Created {{ formatDate(code.added_at) }}</span>
                  </div>
                </div>
              </div>
              
              <div class="flex items-center gap-3">
                <span v-if="!code.is_valid" class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500 text-white">
                  Invalid
                </span>
                <span v-else-if="!code.is_active" class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gray-500 text-white">
                  Inactive
                </span>
                <span v-else-if="code.is_single_use && code.uses > 0" class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white">
                  Used
                </span>
                <span v-else class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-500 text-white">
                  Active
                </span>
                <button
                  :disabled="removingCodeId === code.id"
                  @click="removeAccessCode(code.id)"
                  class="px-5 py-2 border-2 border-red-500 text-red-600 hover:bg-red-500 hover:text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  {{ removingCodeId === code.id ? 'Deleting...' : 'Delete' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="px-8 py-16 text-center">
          <div class="w-20 h-20 mx-auto bg-deep-navy/5 rounded-xl flex items-center justify-center mb-5 border-2 border-deep-navy/10">
            <svg class="w-10 h-10 text-deep-navy/30" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.65 10C11.7 7.31 8.9 5.5 5.77 6.12c-2.29.46-4.15 2.29-4.63 4.58C.32 14.57 3.26 18 7 18c2.61 0 4.83-1.67 5.65-4H17v2c0 1.1.9 2 2 2s2-.9 2-2v-2c1.1 0 2-.9 2-2s-.9-2-2-2h-8.35zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
            </svg>
          </div>
          <p class="text-sm font-bold text-deep-navy/60">No access codes created</p>
          <p class="text-xs text-deep-navy/40 mt-2 font-medium">Generate a code above to allow users to join with a code</p>
        </div>
      </div>

      <!-- Info Box -->
      <div class="bg-blue-500/10 border-2 border-blue-500/20 rounded-xl p-6">
        <div class="flex gap-4">
          <div class="flex-shrink-0">
            <div class="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
            </div>
          </div>
          <div class="flex-1">
            <h3 class="text-sm font-black text-deep-navy uppercase tracking-tight mb-2">Invitation Methods</h3>
            <ul class="space-y-2 text-xs text-deep-navy/70 font-medium leading-relaxed">
              <li class="flex items-start gap-2">
                <svg class="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                </svg>
                <span><strong class="font-bold text-deep-navy">Email Invitations:</strong> Send direct invitations to specific users by email</span>
              </li>
              <li class="flex items-start gap-2">
                <svg class="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                </svg>
                <span><strong class="font-bold text-deep-navy">Access Codes:</strong> Generate codes that can be shared with multiple users</span>
              </li>
              <li class="flex items-start gap-2">
                <svg class="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                </svg>
                <span><strong class="font-bold text-deep-navy">Expiration:</strong> Set expiration dates and usage limits to maintain security</span>
              </li>
            </ul>
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
        
        