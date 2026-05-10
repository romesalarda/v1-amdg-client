<template>
  <div class="space-y-6">
    <div class="bg-white border border-gray-200 rounded-xl p-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
          <UIcon name="i-heroicons-users" class="w-4 h-4" />
          Guardians
        </h3>
        <UButton @click="$emit('set-show-add-guardian-form', true)" size="xs" color="primary" icon="i-heroicons-plus">Add</UButton>
      </div>

      <div v-if="showAddGuardianForm" class="bg-gray-50/50 rounded-xl p-4 mb-3 border border-gray-200">
        <form @submit.prevent="$emit('add-guardian')" class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Search Attendee in Event *</label>
            <input
              :value="guardianSearchQuery"
              @input="$emit('update-guardian-search-query', ($event.target as HTMLInputElement).value || '')"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Search by name, email, or attendee ID"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Guardian Attendee *</label>
            <select
              :value="selectedGuardianAttendeeId"
              @change="$emit('update-selected-guardian-attendee-id', (() => { const value = ($event.target as HTMLSelectElement).value; return value === 'null' || value === '' ? null : value })())"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option :value="null">Select attendee...</option>
              <option
                v-for="candidate in filteredGuardianAttendees"
                :key="candidate.attendee_id"
                :value="candidate.attendee_id"
              >
                {{ candidate.full_name }} ({{ candidate.attendee_display_id }})
              </option>
            </select>
            <p v-if="guardianAttendeesLoading" class="mt-1 text-xs text-gray-500">Loading attendees...</p>
            <p v-else-if="guardianSearchQuery && !filteredGuardianAttendees.length" class="mt-1 text-xs text-gray-500">No attendees match your search in this event.</p>
            <p v-if="selectedGuardianCandidate && !selectedGuardianHasLinkedUser" class="mt-1 text-xs text-amber-700">
              Selected attendee has no linked user account and cannot be added as a guardian.
            </p>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Relationship *</label>
            <select
              :value="newGuardian.relationship"
              @change="$emit('update-new-guardian-relationship', (($event.target as HTMLSelectElement).value || 'parent'))"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="parent">Parent</option>
              <option value="sibling">Sibling</option>
              <option value="child">Child</option>
              <option value="spouse">Spouse</option>
              <option value="friend">Friend</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="flex gap-2">
            <UButton type="submit" :disabled="createGuardianPending" size="sm" color="green">
              {{ createGuardianPending ? 'Adding...' : 'Add Guardian' }}
            </UButton>
            <UButton type="button" @click="$emit('cancel-add-guardian')" size="sm" variant="ghost" color="gray">Cancel</UButton>
          </div>
        </form>
      </div>

      <div v-if="guardiansLoading" class="text-center py-4 text-gray-500 text-sm">Loading guardians...</div>
      <div v-else-if="!guardians.length" class="text-center py-4 text-gray-500 text-sm">
        <div class="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-600">
          <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-slate-500">
            <UIcon name="i-heroicons-lock-closed" class="h-7 w-7" />
          </div>
          <p class="mt-4 text-base font-black uppercase tracking-[0.22em] text-slate-500">No Guardians</p>
          <p class="mt-2 text-sm text-slate-500">Press the "Add" button to create a new guardian.</p>
        </div>
      </div>
      <div v-else class="space-y-2">
        <div
          v-for="guardian in guardians"
          :key="guardian.id"
          class="p-3 border border-gray-200 rounded-lg bg-gray-50/30 flex items-center justify-between"
        >
          <div>
            <p class="text-sm font-semibold text-gray-900">{{ guardian.user_name || guardian.user_email || 'Unlinked Guardian' }}</p>
            <p class="text-xs text-gray-600">Relationship: {{ guardian.relationship_display }}</p>
          </div>
          <UButton @click="$emit('delete-guardian', guardian.id)" size="xs" color="red" variant="ghost" icon="i-heroicons-trash" />
        </div>
      </div>
    </div>

    <div class="bg-white border border-gray-200 rounded-xl p-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
          <UIcon name="i-heroicons-user-group" class="w-4 h-4" />
          Family Memberships
        </h3>
        <div class="flex items-center gap-2">
          <UButton @click="$emit('set-show-create-family-group-form', true)" size="xs" color="gray" variant="outline" icon="i-heroicons-user-group">New Group</UButton>
          <UButton @click="$emit('set-show-add-family-membership-form', true)" size="xs" color="primary" icon="i-heroicons-plus">Add</UButton>
        </div>
      </div>

      <div v-if="showCreateFamilyGroupForm" class="bg-gray-50/50 rounded-xl p-4 mb-3 border border-gray-200">
        <form @submit.prevent="$emit('create-family-group')" class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Family Group Name *</label>
            <input
              :value="newFamilyGroupName"
              @input="$emit('update-new-family-group-name', ($event.target as HTMLInputElement).value || '')"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="e.g. Smith Family"
            />
          </div>
          <div class="flex gap-2">
            <UButton type="submit" :disabled="createFamilyGroupPending" size="sm" color="green">
              {{ createFamilyGroupPending ? 'Creating...' : 'Create Group' }}
            </UButton>
            <UButton type="button" @click="$emit('cancel-create-family-group')" size="sm" variant="ghost" color="gray">Cancel</UButton>
          </div>
        </form>
      </div>

      <div v-if="showAddFamilyMembershipForm" class="bg-gray-50/50 rounded-xl p-4 mb-3 border border-gray-200">
        <form @submit.prevent="$emit('add-family-membership')" class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Family Group *</label>
            <select
              :value="newFamilyMembership.family_group"
              @change="$emit('update-new-family-membership-family-group', (() => { const value = ($event.target as HTMLSelectElement).value; return value === 'null' || value === '' ? null : Number(value) })())"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option :value="null">Select group...</option>
              <option v-for="group in familyGroups" :key="group.id" :value="group.id">
                {{ group.family_name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Relationship *</label>
            <select
              :value="newFamilyMembership.relationship"
              @change="$emit('update-new-family-membership-relationship', (($event.target as HTMLSelectElement).value || 'sibling'))"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="parent">Parent</option>
              <option value="sibling">Sibling</option>
              <option value="child">Child</option>
              <option value="spouse">Spouse</option>
              <option value="friend">Friend</option>
              <option value="other">Other</option>
            </select>
          </div>
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              :checked="newFamilyMembership.is_primary_guardian"
              @change="$emit('update-new-family-membership-primary-guardian', ($event.target as HTMLInputElement).checked)"
              type="checkbox"
              class="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span class="text-xs text-gray-700">Primary Guardian in Family</span>
          </label>
          <div class="flex gap-2">
            <UButton type="submit" :disabled="createFamilyMembershipPending" size="sm" color="green">
              {{ createFamilyMembershipPending ? 'Adding...' : 'Add Membership' }}
            </UButton>
            <UButton type="button" @click="$emit('cancel-add-family-membership')" size="sm" variant="ghost" color="gray">Cancel</UButton>
          </div>
        </form>
      </div>

      <div v-if="familyMembershipsLoading" class="text-center py-4 text-gray-500 text-sm">Loading family memberships...</div>
      <div v-else-if="!familyMemberships.length" class="text-center py-4 text-gray-500 text-sm">
        <div class="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-600">
            <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-slate-500">
              <UIcon name="i-heroicons-user" class="h-7 w-7" />
            </div>
            <p class="mt-4 text-base font-black uppercase tracking-[0.22em] text-slate-500">No family memberships</p>
            <p class="mt-2 text-sm text-slate-500">Press the "Add" button to create a new family membership.</p>
        </div>
      </div>
      <div v-else class="space-y-2">
        <div
          v-for="membership in familyMemberships"
          :key="membership.id"
          class="p-3 border border-gray-200 rounded-lg bg-gray-50/30 flex items-center justify-between"
        >
          <div>
            <p class="text-sm font-semibold text-gray-900">{{ membership.family_name }}</p>
            <p class="text-xs text-gray-600">{{ membership.relationship_display }}<span v-if="membership.is_primary_guardian"> -+ Primary Guardian</span></p>
          </div>
          <UButton @click="$emit('delete-family-membership', membership.id)" size="xs" color="red" variant="ghost" icon="i-heroicons-trash" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  showAddGuardianForm: boolean
  guardianSearchQuery: string
  selectedGuardianAttendeeId: string | null
  filteredGuardianAttendees: any[]
  guardianAttendeesLoading: boolean
  selectedGuardianCandidate: any
  selectedGuardianHasLinkedUser: boolean
  newGuardian: { relationship: string }
  createGuardianPending: boolean
  guardiansLoading: boolean
  guardians: any[]
  showCreateFamilyGroupForm: boolean
  newFamilyGroupName: string
  createFamilyGroupPending: boolean
  showAddFamilyMembershipForm: boolean
  familyGroups: any[]
  newFamilyMembership: { family_group: number | null; relationship: string; is_primary_guardian: boolean }
  createFamilyMembershipPending: boolean
  familyMembershipsLoading: boolean
  familyMemberships: any[]
}>()

defineEmits<{
  (event: 'set-show-add-guardian-form', value: boolean): void
  (event: 'update-guardian-search-query', value: string): void
  (event: 'update-selected-guardian-attendee-id', value: string | null): void
  (event: 'update-new-guardian-relationship', value: string): void
  (event: 'add-guardian'): void
  (event: 'cancel-add-guardian'): void
  (event: 'delete-guardian', guardianId: number): void
  (event: 'set-show-create-family-group-form', value: boolean): void
  (event: 'update-new-family-group-name', value: string): void
  (event: 'create-family-group'): void
  (event: 'cancel-create-family-group'): void
  (event: 'set-show-add-family-membership-form', value: boolean): void
  (event: 'update-new-family-membership-family-group', value: number | null): void
  (event: 'update-new-family-membership-relationship', value: string): void
  (event: 'update-new-family-membership-primary-guardian', value: boolean): void
  (event: 'add-family-membership'): void
  (event: 'cancel-add-family-membership'): void
  (event: 'delete-family-membership', membershipId: number): void
}>()
</script>
