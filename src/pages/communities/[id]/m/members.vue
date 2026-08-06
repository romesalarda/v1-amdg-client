<template>
  <CommunitiesManagementLayout :organisation-id="organisationId" :organisation="organisation">
    <div class="space-y-5">

      <UTabs
          :items="tabItems"
          class="w-full"
          :ui="{
            list: {
              base: 'z-40 flex items-center gap-8 bg-[#026CDF]',
              background: '',
              tab: {
                active: 'border-white text-black hover:text-black',
                inactive: 'text-white hover:text-white/80',
              },
              // disable rounded
              rounded: 'rounded-none',
            },
          }"
        >
        <template #item="{ item }">
          <div v-if="item.key === 'members'" class="">
            <section class="overflow-hidden border-b-2 border-deep-navy bg-white shadow-drawn">
              <div class="border-b border-gray-100 px-6 py-5 sm:px-8 bg-[#026CDF]">
                <div class="flex items-center gap-3">
                  <UIcon name="i-heroicons-user-group" class="h-5 w-5 text-white" />
                  <h2 class="text-sm font-black uppercase tracking-widest text-white">Members</h2>
                </div>
                <p class="mt-1 text-xs text-white/60">View active members and manage verification.</p>

                <div class="mt-4">
                  <label for="member-search" class="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-white/60">
                    Search Members
                  </label>
                  <div class="relative">
                    <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg class="h-4 w-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      id="member-search"
                      v-model="membersSearchInput"
                      type="text"
                      placeholder="Search by username, name, or email..."
                      class="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm font-medium text-gray-700 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>

              <div v-if="isLoadingMembers" class="p-8 space-y-3">
                <USkeleton class="h-14 w-full" />
                <USkeleton class="h-14 w-full" />
              </div>

              <div v-else-if="memberships.length > 0" class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-100 text-left text-sm">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-4 text-[10px] font-black uppercase tracking-[0.18em] text-gray-600">
                        <input
                          type="checkbox"
                          class="rounded border-gray-300 text-primary focus:ring-primary"
                          :checked="selectAll"
                          @change="toggleSelectAll"
                        />
                      </th>
                      <th class="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-600">User</th>
                      <th class="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-600">Username</th>
                      <th class="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-600">Email</th>
                      <th class="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-600">Status</th>
                      <th class="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-600">Area</th>
                      <th class="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-600">Added</th>
                      <th class="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-600">Verified</th>
                      <th class="px-6 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    <tr v-for="member in memberships" :key="member.id" class="transition-colors hover:bg-gray-50">
                      <td class="py-3 px-4">
                        <div class="flex items-center justify-center">
                          <input
                            v-model="selectedAttendees"
                            type="checkbox"
                            :value="member.id"
                            class="rounded border-gray-300 text-primary focus:ring-primary justify-center"
                          />
                        </div>
                        
                      </td>
                      <td class="px-6 py-4">
                        <img
                          v-if="member?.profile_image"
                          :src="member?.profile_image"
                          alt="Profile image"
                          class="w-10 h-10 rounded-full object-cover"
                        />
                        <img
                          v-else
                          :src="`https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${member.id }`"
                          alt="Default profile image"
                          class="w-10 h-10 rounded-full object-cover"
                        />
                      </td>
                      <td class="py-3 px-4">
                        <p class="text-sm font-semibold text-gray-900">{{ member.user_name }}</p>
                      </td>
                      <td class="py-3 px-4">
                        <p class="text-sm text-gray-900">{{ member.user_email }}</p>
                      </td>
                      <td class="py-3 px-4">
                        <div class="flex items-center justify-center gap-2 ">
                          <span
                          v-if="member.is_verified"
                          class="inline-flex items-center rounded-md bg-green-100 px-2.5 py-1 font-mono text-sm text-green-700"
                        >
                          <!-- <UIcon
                            name="i-heroicons-check-badge"
                            class="h-6 w-6 text-green-700 mr-1"
                          >
                          </UIcon> -->
                          Verified
                        </span>
                        <span
                          v-else-if="member.requires_verification"
                          class="inline-flex items-center rounded-md bg-amber-100 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-amber-700"
                        >
                          Needs Verification
                        </span>
                        <span
                          v-else
                          class="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 font-semibold text-[10px] uppercase tracking-[0.12em] text-gray-600 bg-green-100 text-green-700"
                        >
                          Active
                        </span>
                        </div>
                      </td>
                      <td class="py-3 px-4 text-xs font-medium text-gray-500">
                        {{ member.area_from || 'N/A' }}
                      </td>
                      <td class="py-3 px-4 text-xs font-medium text-gray-500">
                        {{ formatDate(member.added_at) }}
                      </td>
                      <td class="py-3 px-4 text-xs font-medium text-gray-500">
                        {{ member.verified_at ? formatDate(member.verified_at) : 'Not verified' }}
                      </td>
                      <td class="py-3 px-4">
                        <div class="flex items-center justify-end gap-2">
                          <UButton
                            size="xs"
                            variant="ghost"
                            color="gray"
                            icon="i-heroicons-eye"
                            @click="openMembershipModal(member.id)"
                            title="Quick view"
                          />
                          <UButton
                            v-if="member.requires_verification && !member.is_verified"
                            size="xs"
                            color="green"
                            :disabled="verifyingMembershipId === member.id"
                            @click="verifyMember(member.id)"
                            title="Verify member"
                            icon="i-heroicons-check-badge"
                          />
                          <UButton
                            size="xs"
                            color="red"
                            :disabled="removingMembershipId === member.id"
                            @click="removeMembership(member.id, member.user_name)"
                            title="Remove member"
                            icon="i-heroicons-trash"
                            />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div v-else class="px-8 py-16 text-center">
                <p class="text-sm font-semibold text-gray-600">
                  {{ membersSearchQuery ? 'No members matched your search' : 'No members found' }}
                </p>
                <p class="mt-2 text-xs font-medium text-gray-500">
                  {{ membersSearchQuery ? 'Try a different name or email.' : 'Invite users to start building your community.' }}
                </p>
              </div>

              <div v-if="!isLoadingMembers && memberships.length > 0" class="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-4">
                <div class="flex items-center gap-3">
                  <select
                    v-model="membersPageSize"
                    class="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-slate-700"
                  >
                    <option :value="10">10 per page</option>
                    <option :value="25">25 per page</option>
                    <option :value="50">50 per page</option>
                    <option :value="100">100 per page</option>
                  </select>
                  <span class="text-xs font-medium text-gray-500">
                    Showing {{ membersFrom }} to {{ membersTo }} of {{ membersTotalCount }}
                  </span>
                </div>
                <UPagination v-model="membersPage" :page-count="membersPageSize" :total="membersTotalCount" :max="7" />
              </div>
            </section>

            <div
              :class="[
                'fixed bottom-0 left-64 right-0 z-50 transition-transform duration-300 ease-in-out',
                isCollapsed ? 'translate-y-[calc(100%-48px)]' : 'translate-y-0'
              ]"
            >
              <!-- Toggle Handle -->
              <div class="flex justify-center">
                <button
                  @click="isCollapsed = !isCollapsed"
                  class="flex h-12 items-center gap-2 rounded-t-xl border border-b-0 border-gray-200 bg-blue-600 px-5 text-sm font-medium text-white shadow-lg hover:bg-blue-700 transition"
                >
                  <UIcon
                    :name="isCollapsed ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                    class="h-4 w-4"
                  />
                  {{ isCollapsed ? 'Show Membership Settings' : 'Hide Membership Settings' }}
                </button>
              </div>

              <!-- Bottom Bar -->
              <div
                class="border-t border-gray-200 bg-blue-600 backdrop-blur-xl shadow-[0_-8px_30px_rgba(0,0,0,0.08)]"
              >
                <div class="px-4 py-3 sm:px-6 lg:px-8">
                  <div
                    class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <!-- Left -->
                    <div class="min-w-0">
                      <h2 class="text-sm font-semibold text-white">
                        Membership Access
                      </h2>
                      <p class="mt-1 text-xs text-white">
                        Configure how new members are admitted to your organisation.
                      </p>
                    </div>

                    <!-- Right -->
                    <div class="grid gap-3 sm:grid-cols-2 lg:w-auto">
                      <!-- Verification -->
                      <div
                        class="flex min-w-[320px] items-start justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"
                      >
                        <div>
                          <h3 class="text-sm font-medium text-deep-navy">
                            Require verification
                          </h3>
                          <p class="mt-1 text-xs leading-5 text-gray-500">
                            New members must be manually approved before they can access the
                            community.
                          </p>
                        </div>

                        <UToggle
                          v-model="requiresVerification"
                          :disabled="isUpdatingMembership"
                          @change="toggleUserRequiresVerification(requiresVerification)"
                        />
                      </div>

                      <!-- Acceptance Code -->
                      <div
                        class="flex min-w-[320px] items-start justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"
                      >
                        <div>
                          <h3 class="text-sm font-medium text-deep-navy">
                            Require acceptance code
                          </h3>
                          <p class="mt-1 text-xs leading-5 text-gray-500">
                            Members must enter a valid invitation code before joining the
                            organisation.
                          </p>
                        </div>

                        <UToggle
                          v-model="requireAcceptanceCode"
                          :disabled="isUpdatingMembership"
                          @change="toggleRequireAcceptanceCode(requireAcceptanceCode)"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="item.key === 'invites'" class="mt-6 space-y-8">
            <div class="overflow-hidden border-t-2 border-b-2 border-deep-navy bg-white shadow-drawn">
              <div class="border-b border-gray-100 px-6 py-5 sm:px-8">
                <div class="flex items-center gap-3">
                  <UIcon name="i-heroicons-user-plus" class="h-5 w-5 text-primary" />
                  <h2 class="text-sm font-black uppercase tracking-widest text-primary">Send Invitation</h2>
                </div>
                <p class="mt-1 text-xs text-gray-500">Invite users to join your community.</p>
              </div>

              <div class="p-6 sm:p-8">
                <div class="mb-6">
                  <label for="search" class="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500">
                    Search Users
                  </label>
                  <div class="relative">
                    <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      id="search"
                      v-model="searchQuery"
                      type="text"
                      placeholder="Search by name or email..."
                      class="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm font-medium text-gray-700 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      @input="debouncedSearch"
                    />
                  </div>
                </div>

                <div v-if="searchQuery && filteredUsers.length > 0" class="space-y-2">
                  <p class="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-gray-500">Search Results</p>
                  <div
                    v-for="user in filteredUsers"
                    :key="user.id"
                    class="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-5 transition hover:border-gray-200 hover:bg-gray-50 md:flex-row md:items-center md:justify-between"
                  >
                    <div class="flex items-center gap-4">
                      <div class="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-100">
                        <UIcon name="i-heroicons-user" class="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p class="text-sm font-semibold text-gray-900">
                          {{ user.first_name }} {{ user.last_name }}
                        </p>
                        <p class="text-xs font-medium text-gray-500">{{ user.email }}</p>
                      </div>
                    </div>

                    <div class="flex items-center gap-2">
                      <span v-if="hasInvite(user.id)" class="inline-flex items-center rounded-md bg-blue-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-blue-700">
                        Invited
                      </span>
                      <span v-else-if="isMember(user.id)" class="inline-flex items-center rounded-md bg-green-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-green-700">
                        Member
                      </span>
                      <button
                        v-else
                        :disabled="sendingInviteToUserId === user.id"
                        @click="sendInvite(user.id)"
                        class="inline-flex items-center gap-1 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-slate-700 disabled:opacity-50"
                      >
                        <UIcon name="i-heroicons-paper-airplane" class="h-3.5 w-3.5" />
                        {{ sendingInviteToUserId === user.id ? 'Sending...' : 'Send Invite' }}
                      </button>
                    </div>
                  </div>
                </div>

                <div v-else-if="searchQuery && filteredUsers.length === 0 && !isLoadingUsers" class="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-10 text-center">
                  <p class="text-sm font-semibold text-gray-600">No users found</p>
                </div>

                <div v-else-if="isLoadingUsers" class="text-center py-8">
                  <USkeleton class="h-16 w-full" />
                </div>
              </div>
            </div>

            <div class="overflow-hidden border-t-2 border-b-2 border-deep-navy bg-white shadow-drawn">
              <div class="border-b border-gray-100 px-6 py-5 sm:px-8">
                <div class="flex items-center gap-3">
                  <UIcon name="i-heroicons-envelope" class="h-5 w-5 text-primary" />
                  <h2 class="text-sm font-black uppercase tracking-widest text-primary">Pending Invitations</h2>
                </div>
                <p class="mt-1 text-xs text-gray-500">Invitations awaiting acceptance.</p>
              </div>

              <div v-if="isLoadingInvites" class="p-8 space-y-3">
                <USkeleton class="h-14 w-full" />
                <USkeleton class="h-14 w-full" />
              </div>

              <div v-else-if="pendingInvites.length > 0" class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-100 text-left text-sm">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-gray-500">User</th>
                      <th class="px-6 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-gray-500">Sent</th>
                      <th class="px-6 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-gray-500">Expires</th>
                      <th class="px-6 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-gray-500">Status</th>
                      <th class="px-6 py-3 text-right text-[10px] font-black uppercase tracking-[0.18em] text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    <tr v-for="invite in pendingInvites" :key="invite.id" class="transition-colors hover:bg-gray-50">
                      <td class="px-6 py-4">
                        <p class="text-sm font-semibold text-gray-900">
                          {{ invite.target_user_name || 'Invited User' }}
                        </p>
                        <p class="mt-1 text-xs font-medium text-gray-500">{{ invite.target_user_email }}</p>
                      </td>
                      <td class="px-6 py-4 text-xs font-medium text-gray-500">{{ formatDate(invite.added_at) }}</td>
                      <td class="px-6 py-4 text-xs font-medium" :class="invite.expires_at && isExpiringSoon(invite.expires_at) ? 'text-red-600' : 'text-gray-500'">
                        {{ invite.expires_at ? formatDate(invite.expires_at) : 'No expiry' }}
                      </td>
                      <td class="px-6 py-4">
                        <span :class="inviteStatusClass(invite)" class="inline-flex items-center rounded-md px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em]">
                          {{ inviteStatusLabel(invite) }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <div class="flex items-center justify-end gap-2">
                          <button
                            :disabled="removingInviteId === invite.id"
                            @click="removeInvite(invite.id)"
                            class="inline-flex items-center gap-1 rounded-md border border-red-300 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            <UIcon name="i-heroicons-x-mark" class="h-3.5 w-3.5" />
                            {{ removingInviteId === invite.id ? 'Cancelling...' : 'Cancel' }}
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div v-else class="px-8 py-16 text-center">
                <p class="text-sm font-semibold text-gray-600">No pending invitations</p>
                <p class="mt-2 text-xs font-medium text-gray-500">Search for users above to send invitations.</p>
              </div>

              <div v-if="!isLoadingInvites && pendingInvites.length > 0" class="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-4">
                <div class="flex items-center gap-3">
                  <select
                    v-model="invitesPageSize"
                    class="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-slate-700"
                  >
                    <option :value="10">10 per page</option>
                    <option :value="25">25 per page</option>
                    <option :value="50">50 per page</option>
                    <option :value="100">100 per page</option>
                  </select>
                  <span class="text-xs font-medium text-gray-500">
                    Showing {{ invitesFrom }} to {{ invitesTo }} of {{ invitesTotalCount }}
                  </span>
                </div>
                <UPagination v-model="invitesPage" :page-count="invitesPageSize" :total="invitesTotalCount" :max="7" />
              </div>
            </div>

            <div class="bg-blue-500/10 border-2 border-blue-500/20 p-6">
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

          <div v-if="item.key === 'access-codes'">
            <div class="bg-white border-b-2 border-deep-navy shadow-drawn">
              <div class="px-8 py-6 border-b-2 border-deep-navy/10 bg-[#026CDF]">
                <div class="flex items-center gap-3">
                  <UIcon name="i-heroicons-key" class="h-5 w-5 text-white" />
                  <h2 class="text-sm font-black uppercase tracking-widest text-white">Access Codes</h2>
                </div>
                <p class="text-sm text-white/60 mt-2 font-medium">Create codes that users can use to join your community.</p>
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
                        <button
                          @click="copyInviteLink(code.code || '')"
                          class="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Copy invite link"
                        >
                          <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
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
import { useUpdateOrganisation } from '~/composables/resources/organisation/organisations'
import { useUsers } from '~/composables/resources/user/users'
import MembershipDetailsModal from '~/components/communities/MembershipDetailsModal.vue'
import { formatDate, isExpiringSoon } from '~/utils/time'
import { useDebounceFn } from '@vueuse/core'
import Swal from 'sweetalert2'

definePageMeta({
  middleware: ['auth', 'organisation-controller', 'leader-permission'],
  layout: false,
  leaderPermission: { 
    code: 'allow_membership_access' 
  },
})
const selectedAttendees = ref<number[]>([])
const isCollapsed = ref(true)

const route = useRoute()
const { $notyf } = useNuxtApp()

const organisationId = computed(() => route.params.id as string)
// Search functionality
const searchQuery = ref('')
const membersSearchInput = ref('')
const membersSearchQuery = ref('')
const tabItems = [
  { key: 'members', label: 'Members', icons: 'i-heroicons-users' },
  { key: 'invites', label: 'Invitations', icons: 'i-heroicons-mail' },
  { key: 'access-codes', label: 'Access Codes', icons: 'i-heroicons-key' },
]
useHead({
  title: 'Members & Invites',
})

// Fetch organization data
const { data: orgData } = useOrganisation(organisationId)
const organisation = computed(() => orgData.value?.data)
const organisationNumericId = computed(() => organisation.value?.id)

const requiresVerification = ref(false)
const requireAcceptanceCode = ref(false)

watchEffect(() => {
  requiresVerification.value = organisation.value?.requires_manual_verification ?? false
  requireAcceptanceCode.value = organisation.value?.required_acceptance_code ?? false
})
// Fetch all users for search
const { data: usersData, isLoading: isLoadingUsers } = useUsers(computed(() => ({
  search: searchQuery.value,
})))

const allUsers = computed(() => usersData.value?.data?.results || [])

const membersPage = ref(1)
const membersPageSize = ref(10)

const { data: membershipsData, isLoading: isLoadingMembers } = useOrganisationMemberships(computed(() => ({
  organisation: organisationId.value,
  search: membersSearchQuery.value || undefined,
  page: membersPage.value,
  page_size: membersPageSize.value,
})))

const { mutate: updateMembership, isPending: isUpdatingMembership } = useUpdateOrganisation()

const toggleUserRequiresVerification = (requiresVerification: boolean | undefined) => {
  if (!organisationNumericId.value) {
    $notyf.error('Community information is still loading. Please try again.')
    return
  }

  try {
    updateMembership({
      organisationId: organisationNumericId.value,
      body: {
        title: organisation.value?.title || '',
        requires_manual_verification: requiresVerification,
      }
    })
    $notyf.success(`Membership verification requirement updated successfully!`)
  } catch (error: any) {
    $notyf.error(error?.body?.error || error?.message || 'Failed to update membership verification requirement')
  }
}

const toggleRequireAcceptanceCode = (requireAcceptanceCode: boolean | undefined) => {
  if (!organisationNumericId.value) {
    $notyf.error('Community information is still loading. Please try again.')
    return
  }

  try {
    updateMembership({
      organisationId: organisationNumericId.value,
      body: {
        title: organisation.value?.title || '',
        required_acceptance_code: requireAcceptanceCode,
      }
    })
    $notyf.success(`Membership acceptance code requirement updated successfully!`)
  } catch (error: any) {
    $notyf.error(error?.body?.error || error?.message || 'Failed to update membership acceptance code requirement')
  }
}

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
const selectAll = ref(false)

function toggleSelectAll() {
  if (selectAll.value) {
    selectedAttendees.value = memberships.value.map(member => member.id)
  } else {
    selectedAttendees.value = []
  }
}
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

const debouncedMembersSearch = useDebounceFn(() => {
  membersSearchQuery.value = membersSearchInput.value.trim()
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

// Copy shareable invite link (code pre-filled, works for new and existing users)
const copyInviteLink = async (code: string) => {
  try {
    const link = `${window.location.origin}/communities/${organisationId.value}/invite?code=${encodeURIComponent(code)}`
    await navigator.clipboard.writeText(link)
    $notyf.success('Invite link copied to clipboard!')
  } catch (error) {
    $notyf.error('Failed to copy invite link')
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

watch(membersSearchInput, () => {
  membersPage.value = 1
  debouncedMembersSearch()
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
        
        