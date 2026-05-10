<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-xs font-black text-primary uppercase tracking-widest">Emergency Contacts</h3>
      <UButton
        @click="$emit('set-show-add-emergency-form', true)"
        size="sm"
        color="primary"
        icon="i-heroicons-plus"
      >
        Add Contact
      </UButton>
    </div>

    <!-- Add Form -->
    <div v-if="showAddEmergencyForm && !editingEmergencyId" class="bg-gray-50/50 rounded-xl p-4 mb-4 border border-gray-200">
      <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">New Emergency Contact</h4>
      <form @submit.prevent="$emit('add-emergency-contact')" class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">First Name *</label>
            <input
              v-model="newEmergencyContact.first_name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Last Name *</label>
            <input
              v-model="newEmergencyContact.last_name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Relationship *</label>
          <select
            v-model="newEmergencyContact.relationship"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">Select relationship...</option>
            <option value="parent">Parent</option>
            <option value="sibling">Sibling</option>
            <option value="child">Child</option>
            <option value="spouse">Spouse</option>
            <option value="friend">Friend</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Phone Number *</label>
          <input
            v-model="newEmergencyContact.phone_number"
            type="tel"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Email</label>
          <input
            v-model="newEmergencyContact.email"
            type="email"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div class="flex items-center">
          <input
            v-model="newEmergencyContact.primary_contact"
            type="checkbox"
            id="primary-new"
            class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary/20"
          />
          <label for="primary-new" class="ml-2 text-xs font-medium text-gray-700">Primary Contact</label>
        </div>
        <div class="flex gap-2 pt-2">
          <UButton
            type="submit"
            :disabled="createEmergencyPending"
            size="sm"
            color="green"
          >
            {{ createEmergencyPending ? 'Adding...' : 'Add' }}
          </UButton>
          <UButton
            type="button"
            @click="$emit('cancel-add-emergency-contact')"
            size="sm"
            variant="ghost"
            color="gray"
          >
            Cancel
          </UButton>
        </div>
      </form>
    </div>

    <!-- List -->
    <div v-if="emergencyContactsLoading" class="text-center py-8 text-gray-500 text-sm">
      Loading emergency contacts...
    </div>
    <div v-else-if="!emergencyContacts.length" class="text-center py-8 text-gray-500 text-sm">
      <div class="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-600">
          <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-slate-500">
            <UIcon name="i-heroicons-user" class="h-7 w-7" />
          </div>
          <p class="mt-4 text-base font-black uppercase tracking-[0.22em] text-slate-500">No emergency contacts</p>
          <p class="mt-2 text-sm text-slate-500">Press the "Add" button to create a new emergency contact.</p>
      </div>
    </div>
    <div v-else class="space-y-3">
      <div
        v-for="contact in emergencyContacts"
        :key="contact.id"
        class="p-4 border border-gray-200 rounded-lg hover:border-primary/30 transition-colors bg-gray-50/30"
      >
        <!-- Edit Form -->
        <div v-if="editingEmergencyId === contact.id">
          <form @submit.prevent="$emit('update-emergency-contact')" class="space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">First Name *</label>
                <input
                  v-model="newEmergencyContact.first_name"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Last Name *</label>
                <input
                  v-model="newEmergencyContact.last_name"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Relationship *</label>
              <select
                v-model="newEmergencyContact.relationship"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Select relationship...</option>
                <option value="parent">Parent</option>
                <option value="sibling">Sibling</option>
                <option value="child">Child</option>
                <option value="spouse">Spouse</option>
                <option value="friend">Friend</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Phone Number *</label>
              <input
                v-model="newEmergencyContact.phone_number"
                type="tel"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Email</label>
              <input
                v-model="newEmergencyContact.email"
                type="email"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div class="flex items-center">
              <input
                v-model="newEmergencyContact.primary_contact"
                type="checkbox"
                id="primary-edit"
                class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary/20"
              />
              <label for="primary-edit" class="ml-2 text-xs font-medium text-gray-700">Primary Contact</label>
            </div>
            <div class="flex gap-2 pt-2">
              <UButton
                type="submit"
                :disabled="updateEmergencyPending"
                size="sm"
                color="green"
              >
                {{ updateEmergencyPending ? 'Updating...' : 'Update' }}
              </UButton>
              <UButton
                type="button"
                @click="$emit('cancel-edit-emergency-contact')"
                size="sm"
                variant="ghost"
                color="gray"
              >
                Cancel
              </UButton>
            </div>
          </form>
        </div>

        <!-- Display Mode -->
        <div v-else class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <h4 class="font-semibold text-gray-900 text-sm">{{ contact.full_name }}</h4>
              <UBadge v-if="contact.primary_contact" color="primary" size="xs">
                Primary
              </UBadge>
            </div>
            <div class="mt-2 space-y-1">
              <p class="text-xs text-gray-600">
                <span class="font-bold uppercase tracking-wide">Relationship:</span> {{ contact.relationship_display }}
              </p>
              <p class="text-xs text-gray-600">
                <span class="font-bold uppercase tracking-wide">Phone:</span> {{ contact.phone_number }}
              </p>
              <p v-if="contact.email" class="text-xs text-gray-600">
                <span class="font-bold uppercase tracking-wide">Email:</span> {{ contact.email }}
              </p>
            </div>
          </div>
          <div class="flex gap-1">
            <UButton
              @click="$emit('edit-emergency-contact', contact)"
              size="xs"
              color="primary"
              variant="ghost"
              icon="i-heroicons-pencil-square"
            />
            <UButton
              @click="$emit('delete-emergency-contact', contact.id)"
              size="xs"
              color="red"
              variant="ghost"
              icon="i-heroicons-trash"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  showAddEmergencyForm: boolean
  editingEmergencyId: number | null
  newEmergencyContact: { first_name: string; last_name: string; relationship: string; phone_number: string; email: string; primary_contact: boolean }
  createEmergencyPending: boolean
  updateEmergencyPending: boolean
  emergencyContactsLoading: boolean
  emergencyContacts: any[]
}>()

defineEmits<{
  (event: 'set-show-add-emergency-form', value: boolean): void
  (event: 'add-emergency-contact'): void
  (event: 'cancel-add-emergency-contact'): void
  (event: 'update-emergency-contact'): void
  (event: 'cancel-edit-emergency-contact'): void
  (event: 'edit-emergency-contact', contact: any): void
  (event: 'delete-emergency-contact', id: number): void
}>()
</script>
