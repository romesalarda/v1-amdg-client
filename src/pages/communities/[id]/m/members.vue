<template>
  <CommunitiesManagementLayout :organisation-id="organisationId" :organisation="organisation">
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-black text-deep-navy uppercase tracking-tight">Members & Invites</h1>
        <p class="text-sm text-deep-navy/60 mt-2 font-medium">Manage organisation members, invitations, and access codes.</p>
      </div>

      <UTabs :items="tabItems" class="w-full">
        <template #item="{ item }">
          <div v-if="item.key === 'members'" class="mt-6">
            <div class="bg-white border-2 border-deep-navy rounded-xl shadow-drawn">
              <div class="px-8 py-6 border-b-2 border-deep-navy/10">
                <h2 class="text-xl font-black text-deep-navy uppercase tracking-tight">Members</h2>
                <p class="text-sm text-deep-navy/60 mt-2 font-medium">View active members and manage verification.</p>
              </div>

              <div v-if="isLoadingMembers" class="p-8 space-y-3">
                <USkeleton class="h-14 w-full" />
                <USkeleton class="h-14 w-full" />
              </div>

              <div v-else-if="memberships.length > 0" class="overflow-x-auto">
                <table class="min-w-full divide-y-2 divide-deep-navy/10">
                  <thead class="bg-deep-navy/5">
                    <tr>
                      <th class="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/60">Member</th>
                      <th class="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/60">Status</th>
                      <th class="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/60">Added</th>
                      <th class="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/60">Verified</th>
                      <th class="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/60">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-deep-navy/5">
                    <tr v-for="member in memberships" :key="member.id" class="hover:bg-deep-navy/5">
                      <td class="px-6 py-4">
                        <p class="text-sm font-black text-deep-navy uppercase tracking-tight">{{ member.user_name }}</p>
                        <p class="text-xs text-deep-navy/60 font-medium mt-1">{{ member.user_email }}</p>
                      </td>
                      <td class="px-6 py-4">
                        <span
                          v-if="member.is_verified"
                          class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-500 text-white"
                        >
                          Verified
                        </span>
                        <span
                          v-else-if="member.requires_verification"
                          class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white"
                        >
                          Needs Verification
                        </span>
                        <span
                          v-else
                          class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gray-500 text-white"
                        >
                          Active
                        </span>
                      </td>
                      <td class="px-6 py-4 text-xs text-deep-navy/60 font-medium">
                        {{ formatDate(member.added_at) }}
                      </td>
                      <td class="px-6 py-4 text-xs text-deep-navy/60 font-medium">
                        {{ member.verified_at ? formatDate(member.verified_at) : 'Not verified' }}
                      </td>
                      <td class="px-6 py-4">
                        <div class="flex items-center justify-end gap-2">
                          <button
                            class="px-4 py-2 border-2 border-deep-navy/20 rounded-xl text-deep-navy font-black text-xs uppercase tracking-wider hover:bg-deep-navy/5"
                            @click="openMembershipModal(member.id)"
                          >
                            View
                          </button>
                          <button
                            v-if="member.requires_verification && !member.is_verified"
                            :disabled="verifyingMembershipId === member.id"
                            class="px-4 py-2 bg-deep-navy hover:bg-deep-navy/90 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                            @click="verifyMember(member.id)"
                          >
                            {{ verifyingMembershipId === member.id ? 'Verifying...' : 'Verify' }}
                          </button>
                          <button
                            :disabled="removingMembershipId === member.id"
                            class="px-4 py-2 border-2 border-red-500 text-red-600 hover:bg-red-500 hover:text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                            @click="removeMembership(member.id, member.user_name)"
                          >
                            {{ removingMembershipId === member.id ? 'Removing...' : 'Remove' }}
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div v-else class="px-8 py-16 text-center">
                <p class="text-sm font-bold text-deep-navy/60">No members found</p>
                <p class="text-xs text-deep-navy/40 mt-2 font-medium">Invite users to start building your community.</p>
              </div>

              <div v-if="!isLoadingMembers && memberships.length > 0" class="px-6 py-4 border-t border-deep-navy/10 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <select
                    v-model="membersPageSize"
                    class="px-3 py-1.5 border-2 border-deep-navy/20 rounded-lg text-xs font-black uppercase tracking-wider text-deep-navy"
                  >
                    <option :value="10">10 per page</option>
                    <option :value="25">25 per page</option>
                    <option :value="50">50 per page</option>
                    <option :value="100">100 per page</option>
                  </select>
                  <span class="text-xs text-deep-navy/60 font-medium">
                    Showing {{ membersFrom }} to {{ membersTo }} of {{ membersTotalCount }}
                  </span>
                </div>
                <UPagination v-model="membersPage" :page-count="membersPageSize" :total="membersTotalCount" :max="7" />
              </div>
            </div>
          </div>

          <div v-if="item.key === 'invites'" class="mt-6 space-y-8">
            <div class="bg-white border-2 border-deep-navy rounded-xl shadow-drawn">
              <div class="px-8 py-6 border-b-2 border-deep-navy/10">
                <h2 class="text-xl font-black text-deep-navy uppercase tracking-tight">Send Invitation</h2>
                <p class="text-sm text-deep-navy/60 mt-2 font-medium">Invite users to join your community.</p>
              </div>

              <div class="p-8">
                <div class="mb-6">
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

                <div v-if="searchQuery && filteredUsers.length > 0" class="space-y-3">
                  <p class="text-[10px] font-black text-deep-navy/50 mb-4 uppercase tracking-[0.2em]">Search Results</p>
                  <div
                    v-for="user in filteredUsers"
                    :key="user.id"
                    class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 bg-white border-2 border-deep-navy/10 rounded-xl hover:border-deep-navy/30 transition-all"
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
                        Invited
                      </span>
                      <span v-else-if="isMember(user.id)" class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-500 text-white">
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

                <div v-else-if="searchQuery && filteredUsers.length === 0 && !isLoadingUsers" class="text-center py-10 bg-deep-navy/5 border-2 border-dashed border-deep-navy/20 rounded-xl">
                  <p class="text-sm font-bold text-deep-navy/60">No users found</p>
                </div>

                <div v-else-if="isLoadingUsers" class="text-center py-8">
                  <USkeleton class="h-16 w-full" />
                </div>
              </div>
            </div>

            <div class="bg-white border-2 border-deep-navy rounded-xl shadow-drawn">
              <div class="px-8 py-6 border-b-2 border-deep-navy/10">
                <h2 class="text-xl font-black text-deep-navy uppercase tracking-tight">Pending Invitations</h2>
                <p class="text-sm text-deep-navy/60 mt-2 font-medium">Invitations awaiting acceptance.</p>
              </div>

              <div v-if="isLoadingInvites" class="p-8 space-y-3">
                <USkeleton class="h-14 w-full" />
                <USkeleton class="h-14 w-full" />
              </div>

              <div v-else-if="pendingInvites.length > 0" class="overflow-x-auto">
                <table class="min-w-full divide-y-2 divide-deep-navy/10">
                  <thead class="bg-deep-navy/5">
                    <tr>
                      <th class="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/60">User</th>
                      <th class="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/60">Sent</th>
                      <th class="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/60">Expires</th>
                      <th class="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/60">Status</th>
                      <th class="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/60">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-deep-navy/5">
                    <tr v-for="invite in pendingInvites" :key="invite.id" class="hover:bg-deep-navy/5">
                      <td class="px-6 py-4">
                        <p class="text-sm font-black text-deep-navy uppercase tracking-tight">
                          {{ invite.target_user_name || 'Invited User' }}
                        </p>
                        <p class="text-xs text-deep-navy/60 font-medium mt-1">{{ invite.target_user_email }}</p>
                      </td>
                      <td class="px-6 py-4 text-xs text-deep-navy/60 font-medium">{{ formatDate(invite.added_at) }}</td>
                      <td class="px-6 py-4 text-xs font-medium" :class="invite.expires_at && isExpiringSoon(invite.expires_at) ? 'text-red-600' : 'text-deep-navy/60'">
                        {{ invite.expires_at ? formatDate(invite.expires_at) : 'No expiry' }}
                      </td>
                      <td class="px-6 py-4">
                        <span :class="inviteStatusClass(invite)" class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                          {{ inviteStatusLabel(invite) }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <div class="flex items-center justify-end gap-2">
                          <button
                            :disabled="removingInviteId === invite.id"
                            @click="removeInvite(invite.id)"
                            class="px-4 py-2 border-2 border-red-500 text-red-600 hover:bg-red-500 hover:text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                          >
                            {{ removingInviteId === invite.id ? 'Cancelling...' : 'Cancel' }}
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div v-else class="px-8 py-16 text-center">
                <p class="text-sm font-bold text-deep-navy/60">No pending invitations</p>
                <p class="text-xs text-deep-navy/40 mt-2 font-medium">Search for users above to send invitations.</p>
              </div>

              <div v-if="!isLoadingInvites && pendingInvites.length > 0" class="px-6 py-4 border-t border-deep-navy/10 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <select
                    v-model="invitesPageSize"
                    class="px-3 py-1.5 border-2 border-deep-navy/20 rounded-lg text-xs font-black uppercase tracking-wider text-deep-navy"
                  >
                    <option :value="10">10 per page</option>
                    <option :value="25">25 per page</option>
                    <option :value="50">50 per page</option>
                    <option :value="100">100 per page</option>
                  </select>
                  <span class="text-xs text-deep-navy/60 font-medium">
                    Showing {{ invitesFrom }} to {{ invitesTo }} of {{ invitesTotalCount }}
                  </span>
                </div>
                <UPagination v-model="invitesPage" :page-count="invitesPageSize" :total="invitesTotalCount" :max="7" />
              </div>
            </div>

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

          <div v-if="item.key === 'access-codes'" class="mt-6">
            <div class="bg-white border-2 border-deep-navy rounded-xl shadow-drawn">
              <div class="px-8 py-6 border-b-2 border-deep-navy/10">
                <h2 class="text-xl font-black text-deep-navy uppercase tracking-tight">Access Codes</h2>
                <p class="text-sm text-deep-navy/60 mt-2 font-medium">Create codes that users can use to join your community.</p>
              </div>

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

              <div v-if="isLoadingCodes" class="p-8 space-y-4">
                <div v-for="i in 2" :key="i" class="flex items-center justify-between">
                  <div class="flex-1 space-y-2">
                    <USkeleton class="h-6 w-48" />
                    <USkeleton class="h-4 w-64" />
                  </div>
                  <USkeleton class="h-10 w-24" />
                </div>
              </div>

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

              <div v-else class="px-8 py-16 text-center">
                <p class="text-sm font-bold text-deep-navy/60">No access codes created</p>
                <p class="text-xs text-deep-navy/40 mt-2 font-medium">Generate a code above to allow users to join with a code.</p>
              </div>
            </div>
          </div>
        </template>
      </UTabs>
    </div>
    <MembershipDetailsModal v-model="isMembershipModalOpen" :membership-id="selectedMembershipId" />
  </CommunitiesManagementLayout>
</template>

<script setup lang="ts">
import { useOrganisation } from '~/composables/resources/organisation/organisations'
import { useOrganisationMemberships, useDeleteOrganisationMembership, useVerifyOrganisationMembershipManually } from '~/composables/resources/organisation/organisationMemberships'
import { useOrganisationInvites, useCreateOrganisationInvite, useDeleteOrganisationInvite } from '~/composables/resources/organisation/organisationInvites'
import { useOrganisationAcceptanceCodes, useCreateOrganisationAcceptanceCode, useDeleteOrganisationAcceptanceCode } from '~/composables/resources/organisation/organisationAcceptanceCodes'
import { useUsers } from '~/composables/resources/user/users'
import MembershipDetailsModal from '~/components/communities/MembershipDetailsModal.vue'
import { formatDate, isExpiringSoon } from '~/utils/time'
import { useDebounceFn } from '@vueuse/core'
import Swal from 'sweetalert2'

definePageMeta({
  middleware: ['auth', 'organisation-controller'],
  layout: 'default',
})

const route = useRoute()
const { $notyf } = useNuxtApp()

const organisationId = computed(() => route.params.id as string)
// Search functionality
const searchQuery = ref('')
const tabItems = [
  { key: 'members', label: 'Members' },
  { key: 'invites', label: 'Invitations' },
  { key: 'access-codes', label: 'Access Codes' },
]
useHead({
  title: 'Members & Invites',
})

// Fetch organization data
const { data: orgData } = useOrganisation(organisationId)
const organisation = computed(() => orgData.value?.data)
const organisationNumericId = computed(() => organisation.value?.id)

// Fetch all users for search
const { data: usersData, isLoading: isLoadingUsers } = useUsers(computed(() => ({
  search: searchQuery.value,
})))

const allUsers = computed(() => usersData.value?.data?.results || [])

const membersPage = ref(1)
const membersPageSize = ref(10)

const { data: membershipsData, isLoading: isLoadingMembers } = useOrganisationMemberships(computed(() => ({
  organisation: organisationId.value,
  page: membersPage.value,
  page_size: membersPageSize.value,
})))

const memberships = computed(() => membershipsData.value?.data?.results || [])
const membersTotalCount = computed(() => membershipsData.value?.data?.count || 0)
const membersFrom = computed(() => membersTotalCount.value === 0 ? 0 : (membersPage.value - 1) * membersPageSize.value + 1)
const membersTo = computed(() => Math.min(membersPage.value * membersPageSize.value, membersTotalCount.value))

const { data: membershipLookupData } = useOrganisationMemberships(computed(() => ({
  organisation: organisationId.value,
  page: 1,
  page_size: 200,
})))

const membershipLookupIds = computed(() => new Set((membershipLookupData.value?.data?.results || []).map(member => member.user)))

const invitesPage = ref(1)
const invitesPageSize = ref(10)

const { data: invitesData, isLoading: isLoadingInvites } = useOrganisationInvites(computed(() => ({
  organisation: organisationId.value,
  page: invitesPage.value,
  page_size: invitesPageSize.value,
  is_valid: true,
  is_active: true,
  accepted: false,
})))

const pendingInvites = computed(() => invitesData.value?.data?.results || [])
const invitesTotalCount = computed(() => invitesData.value?.data?.count || 0)
const invitesFrom = computed(() => invitesTotalCount.value === 0 ? 0 : (invitesPage.value - 1) * invitesPageSize.value + 1)
const invitesTo = computed(() => Math.min(invitesPage.value * invitesPageSize.value, invitesTotalCount.value))

const { data: invitesLookupData } = useOrganisationInvites(computed(() => ({
  organisation: organisationId.value,
  page: 1,
  page_size: 200,
  is_valid: true,
  is_active: true,
  accepted: false,
})))

const inviteLookupIds = computed(() => new Set((invitesLookupData.value?.data?.results || []).map(invite => invite.target_user)))


const filteredUsers = computed(() => {
  if (!searchQuery.value || searchQuery.value.length < 2) return []
  return allUsers.value
})

const debouncedSearch = useDebounceFn(() => {
  // Search is reactive via the query parameter
}, 300)

// Check if user already has an invite
const hasInvite = (userId: number) => inviteLookupIds.value.has(userId)

// Check if user is already a member
const isMember = (userId: number) => membershipLookupIds.value.has(userId)

// Send invite mutation
const { mutate: createInvite } = useCreateOrganisationInvite()
const sendingInviteToUserId = ref<number | null>(null)

const sendInvite = (userId: number) => {
  if (!organisationNumericId.value) {
    $notyf.error('Community information is still loading. Please try again.')
    return
  }

  sendingInviteToUserId.value = userId
  
  createInvite({
    organisation: organisationNumericId.value,
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
const { mutate: deleteInvite } = useDeleteOrganisationInvite()
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
  organisation: organisationId.value,
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
  if (!organisationNumericId.value) {
    $notyf.error('Community information is still loading. Please try again.')
    return
  }

  const body: any = {
    organisation: organisationNumericId.value,
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
const { mutate: deleteCode } = useDeleteOrganisationAcceptanceCode()
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

const { mutate: verifyMembership } = useVerifyOrganisationMembershipManually()
const { mutate: deleteMembership } = useDeleteOrganisationMembership()
const verifyingMembershipId = ref<number | null>(null)
const removingMembershipId = ref<number | null>(null)

const verifyMember = (membershipId: number) => {
  verifyingMembershipId.value = membershipId

  verifyMembership(membershipId, {
    onSuccess: () => {
      $notyf.success('Member verified successfully!')
      verifyingMembershipId.value = null
    },
    onError: (error: any) => {
      $notyf.error(error?.body?.error || error?.message || 'Failed to verify member')
      verifyingMembershipId.value = null
    },
  })
}

const removeMembership = async (membershipId: number, memberName: string) => {
  const result = await Swal.fire({
    title: 'Remove Member?',
    html: `<p style="margin:0">Remove <strong>${memberName}</strong> from this organisation?</p>`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, remove',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#ef4444',
  })

  if (!result.isConfirmed) return

  removingMembershipId.value = membershipId

  deleteMembership(membershipId, {
    onSuccess: () => {
      $notyf.success('Member removed successfully!')
      removingMembershipId.value = null
    },
    onError: (error: any) => {
      $notyf.error(error?.body?.error || error?.message || 'Failed to remove member')
      removingMembershipId.value = null
    },
  })
}

const isMembershipModalOpen = ref(false)
const selectedMembershipId = ref<number | null>(null)

const openMembershipModal = (membershipId: number) => {
  selectedMembershipId.value = membershipId
  isMembershipModalOpen.value = true
}

watch(membersPageSize, () => {
  membersPage.value = 1
})

watch(invitesPageSize, () => {
  invitesPage.value = 1
})

const inviteStatusLabel = (invite: any) => {
  if (invite.accepted) return 'Accepted'
  if (!invite.is_active) return 'Inactive'
  if (!invite.is_valid) return 'Expired'
  return 'Pending'
}

const inviteStatusClass = (invite: any) => {
  if (invite.accepted) return 'bg-green-600 text-white'
  if (!invite.is_active) return 'bg-gray-500 text-white'
  if (!invite.is_valid) return 'bg-red-600 text-white'
  return 'bg-blue-600 text-white'
}
</script>
        
        