<template>
  <EventManagementLayout :event-id="eventId" :event="event?.data">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <UButton
            icon="i-heroicons-arrow-left"
            variant="ghost"
            color="gray"
            :to="`/events/${eventId}/m/participants/dashboard`"
          >
            Back to Participants
          </UButton>
          <div class="h-8 w-px bg-gray-300"></div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              {{ isEditMode ? 'Edit Participant' : 'New Participant' }}
            </h1>
            <p class="text-sm text-gray-500">
              {{ isEditMode ? `ID: ${attendeeData?.data?.attendee_display_id}` : 'Add a new participant to this event' }}
            </p>
          </div>
        </div>
        
        <div class="flex items-center gap-2">
          <UBadge v-if="isEditMode && attendeeData?.data" 
            :color="getStatusColor()" 
            variant="soft"
            size="lg"
          >
            {{ getStatusText() }}
          </UBadge>
        </div>
      </div>

      <!-- Main Content -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Left Column - Main Form -->
        <div class="lg:col-span-8 space-y-6">
          
          <!-- Basic Information Card -->
          <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-user" class="w-5 h-5 text-primary" />
                <h2 class="text-sm font-bold text-gray-900 uppercase tracking-wide">Basic Information</h2>
              </div>
            </div>
            
            <form @submit.prevent="handleSubmit" class="p-6 space-y-5">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-2">
                    First Name <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.first_name"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Enter first name"
                  />
                </div>
                
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-2">
                    Last Name <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.last_name"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    v-model="formData.email"
                    type="email"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="email@example.com"
                  />
                </div>
                
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    v-model="formData.phone_number"
                    type="tel"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    v-model="formData.date_of_birth"
                    type="date"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    v-model="formData.gender"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-2">
                    Relationship
                  </label>
                  <select
                    v-model="formData.relationship_to_user"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="">Select relationship</option>
                    <option value="self">Self</option>
                    <option value="spouse">Spouse</option>
                    <option value="child">Child</option>
                    <option value="parent">Parent</option>
                    <option value="sibling">Sibling</option>
                    <option value="friend">Friend</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-2">
                  Area From
                </label>
                <select
                  v-model="formData.area_from"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option :value="null">Select area</option>
                  <option v-for="area in areas" :key="area.id" :value="area.id">
                    {{ area.area_name }}
                  </option>
                </select>
              </div>

              <div class="flex gap-3 pt-4 border-t">
                <UButton
                  type="submit"
                  :loading="isSubmitting"
                  :disabled="isSubmitting"
                  color="primary"
                  size="lg"
                  class="flex-1"
                >
                  {{ isEditMode ? 'Update Participant' : 'Create Participant' }}
                </UButton>
                <UButton
                  type="button"
                  variant="outline"
                  color="gray"
                  :to="`/events/${eventId}/m/participants/dashboard`"
                  size="lg"
                >
                  Cancel
                </UButton>
              </div>
            </form>
          </div>

          <!-- Extended Information (Only in Edit Mode) -->
          <div v-if="isEditMode && attendeeData?.data" class="space-y-6">
            
            <!-- Tabs for Additional Information -->
            <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div class="border-b border-gray-200">
                <nav class="flex" aria-label="Tabs">
                  <button
                    v-for="tab in tabs"
                    :key="tab.id"
                    @click="activeTab = tab.id"
                    :class="[
                      'flex-1 px-4 py-3 text-sm font-semibold border-b-2 transition-colors',
                      activeTab === tab.id
                        ? 'border-primary text-primary bg-primary/5'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    ]"
                  >
                    <div class="flex items-center justify-center gap-2">
                      <UIcon :name="tab.icon" class="w-4 h-4" />
                      <span>{{ tab.label }}</span>
                      <UBadge v-if="tab.count > 0" size="xs" color="primary" variant="soft">
                        {{ tab.count }}
                      </UBadge>
                    </div>
                  </button>
                </nav>
              </div>

              <div class="p-6">
                <!-- Emergency Contacts Tab -->
                <div v-if="activeTab === 'emergency'" class="space-y-4">
                  <div class="flex items-center justify-between mb-4">
                    <p class="text-sm text-gray-600">Manage emergency contact information</p>
                    <UButton
                      size="sm"
                      variant="outline"
                      color="primary"
                      icon="i-heroicons-plus"
                    >
                      Add Contact
                    </UButton>
                  </div>
                  
                  <div class="text-center py-8 text-gray-500">
                    <UIcon name="i-heroicons-phone" class="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p class="text-sm">No emergency contacts added yet</p>
                  </div>
                </div>

                <!-- Dietary Requirements Tab -->
                <div v-if="activeTab === 'dietary'" class="space-y-4">
                  <div class="flex items-center justify-between mb-4">
                    <p class="text-sm text-gray-600">Manage dietary requirements and restrictions</p>
                    <UButton
                      size="sm"
                      variant="outline"
                      color="primary"
                      icon="i-heroicons-plus"
                    >
                      Add Requirement
                    </UButton>
                  </div>
                  
                  <div class="text-center py-8 text-gray-500">
                    <UIcon name="i-heroicons-cake" class="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p class="text-sm">No dietary requirements added yet</p>
                  </div>
                </div>

                <!-- Medical Conditions Tab -->
                <div v-if="activeTab === 'medical'" class="space-y-4">
                  <div class="flex items-center justify-between mb-4">
                    <p class="text-sm text-gray-600">Manage medical conditions and health information</p>
                    <UButton
                      size="sm"
                      variant="outline"
                      color="primary"
                      icon="i-heroicons-plus"
                    >
                      Add Condition
                    </UButton>
                  </div>
                  
                  <div class="text-center py-8 text-gray-500">
                    <UIcon name="i-heroicons-heart" class="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p class="text-sm">No medical conditions added yet</p>
                  </div>
                </div>

                <!-- Accessibility Requirements Tab -->
                <div v-if="activeTab === 'accessibility'" class="space-y-4">
                  <div class="flex items-center justify-between mb-4">
                    <p class="text-sm text-gray-600">Manage accessibility requirements</p>
                    <UButton
                      size="sm"
                      variant="outline"
                      color="primary"
                      icon="i-heroicons-plus"
                    >
                      Add Requirement
                    </UButton>
                  </div>
                  
                  <div class="text-center py-8 text-gray-500">
                    <UIcon name="i-heroicons-user-circle" class="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p class="text-sm">No accessibility requirements added yet</p>
                  </div>
                </div>

                <!-- Actions Tab -->
                <div v-if="activeTab === 'actions'" class="space-y-4">
                  <div class="flex items-center justify-between mb-4">
                    <p class="text-sm text-gray-600">View attendee action history</p>
                  </div>
                  
                  <div class="text-center py-8 text-gray-500">
                    <UIcon name="i-heroicons-clock" class="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p class="text-sm">No actions recorded yet</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - Info & Actions -->
        <div class="lg:col-span-4 space-y-6">
          
          <!-- Quick Stats (Edit Mode Only) -->
          <div v-if="isEditMode && attendeeData?.data" class="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <h3 class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-4">Participant Info</h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Age</span>
                <span class="text-sm font-semibold text-gray-900">{{ attendeeData.data.age }} years</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Minor</span>
                <UBadge :color="attendeeData.data.is_minor ? 'amber' : 'gray'" variant="soft" size="xs">
                  {{ attendeeData.data.is_minor ? 'Yes' : 'No' }}
                </UBadge>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Registered</span>
                <span class="text-xs text-gray-500">{{ formatDate(attendeeData.data.created_at) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Last Updated</span>
                <span class="text-xs text-gray-500">{{ formatDate(attendeeData.data.updated_at) }}</span>
              </div>
            </div>
          </div>

          <!-- Actions Card (Edit Mode Only) -->
          <div v-if="isEditMode" class="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <h3 class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-4">Quick Actions</h3>
            <div class="space-y-2">
              <UButton
                block
                variant="outline"
                color="green"
                icon="i-heroicons-check-circle"
                size="sm"
              >
                Check In
              </UButton>
              <UButton
                block
                variant="outline"
                color="blue"
                icon="i-heroicons-envelope"
                size="sm"
              >
                Send Message
              </UButton>
              <UButton
                block
                variant="outline"
                color="amber"
                icon="i-heroicons-printer"
                size="sm"
              >
                Print Badge
              </UButton>
              <UButton
                block
                variant="outline"
                color="red"
                icon="i-heroicons-trash"
                size="sm"
                @click="handleDelete"
              >
                Delete Participant
              </UButton>
            </div>
          </div>

          <!-- Help Card -->
          <div class="bg-blue-50 border border-blue-200 rounded-xl shadow-sm p-5">
            <div class="flex items-start gap-3">
              <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 class="text-sm font-bold text-blue-900 mb-2">Tips</h3>
                <ul class="text-xs text-blue-800 space-y-1">
                  <li>• Required fields are marked with *</li>
                  <li>• Email is optional but recommended</li>
                  <li>• Add emergency contacts after creating</li>
                  <li>• Medical info is kept confidential</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </EventManagementLayout>
</template>

<script setup lang="ts">
import { useAttendee, useCreateAttendee, useUpdateAttendee, useDeleteAttendee } from '~/composables/resources/attendee/attendees'
import { useEvent } from '~/composables/resources/events/events'
import { useAreas } from '~/composables/resources/locations/locations'
import EventManagementLayout from '~/components/events/EventManagementLayout.vue'
import type { AttendeesCreateData, AttendeesUpdateData } from '~/api/types.gen'

definePageMeta({
  layout: false,
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const eventId = computed(() => route.params.id as string)
const attendeeId = computed(() => route.params.attendee_id as string | undefined)
const isEditMode = computed(() => !!attendeeId.value)

// Fetch event details
const { data: event } = useEvent(eventId)

// Fetch attendee details (if editing)
const { data: attendeeData } = useAttendee(attendeeId.value || '')

// Fetch areas for dropdown
const { data: areasData } = useAreas({ page_size: 100 })
const areas = computed(() => areasData.value?.data?.results || [])

// Mutations
const createMutation = useCreateAttendee()
const updateMutation = useUpdateAttendee()
const deleteMutation = useDeleteAttendee()

// Form state
const formData = ref({
  first_name: '',
  last_name: '',
  email: null as string | null,
  phone_number: null as string | null,
  date_of_birth: null as string | null,
  gender: null as string | null,
  relationship_to_user: null as 'self' | 'spouse' | 'child' | 'friend' | 'parent' | 'sibling' | 'other' | null,
  area_from: null as number | null,
  event: null as number | null,
})

const isSubmitting = ref(false)
const activeTab = ref('emergency')

// Tabs configuration
const tabs = computed(() => [
  { id: 'emergency', label: 'Emergency Contacts', icon: 'i-heroicons-phone', count: 0 },
  { id: 'dietary', label: 'Dietary', icon: 'i-heroicons-cake', count: 0 },
  { id: 'medical', label: 'Medical', icon: 'i-heroicons-heart', count: 0 },
  { id: 'accessibility', label: 'Accessibility', icon: 'i-heroicons-user-circle', count: 0 },
  { id: 'actions', label: 'History', icon: 'i-heroicons-clock', count: 0 },
])

// Watch for attendee data and populate form
watch(() => attendeeData.value?.data, (data) => {
  if (data && isEditMode.value) {
    formData.value = {
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      email: data.email || null,
      phone_number: data.phone_number || null,
      date_of_birth: data.date_of_birth || null,
      gender: data.gender || null,
      relationship_to_user: data.relationship_to_user || null,
      area_from: data.area_from || null,
      event: data.event || null,
    }
  }
}, { immediate: true })

// Set event ID when creating new attendee
watch(() => event.value?.data, (eventData) => {
  if (eventData && !isEditMode.value) {
    formData.value.event = eventData.id
  }
}, { immediate: true })

// Functions
function getStatusColor() {
  const data = attendeeData.value?.data
  if (!data) return 'gray'
  if ((data as any).is_checked_in) return 'green'
  if ((data as any).is_cancelled) return 'red'
  if ((data as any).is_registered) return 'blue'
  return 'gray'
}

function getStatusText() {
  const data = attendeeData.value?.data
  if (!data) return 'Unknown'
  if ((data as any).is_checked_in) return 'Checked In'
  if ((data as any).is_cancelled) return 'Cancelled'
  if ((data as any).is_registered) return 'Registered'
  return 'Pending'
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function handleSubmit() {
  isSubmitting.value = true
  
  try {
    if (isEditMode.value && attendeeId.value) {
      // Update existing attendee
      await updateMutation.mutateAsync({
        attendeeId: attendeeId.value,
        body: formData.value as AttendeesUpdateData['body']
      })
      
      // Show success notification (you can add a toast here)
      alert('Participant updated successfully!')
    } else {
      // Create new attendee
      const result = await createMutation.mutateAsync(formData.value as AttendeesCreateData['body'])
      
      // Show success notification
      alert('Participant created successfully!')
      
      // Redirect to edit mode for the new attendee
      if (result.data) {
        router.push(`/events/${eventId.value}/m/participants/editor/${result.data.attendee_id}`)
      }
    }
  } catch (error) {
    console.error('Error saving attendee:', error)
    alert('Failed to save participant. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}

async function handleDelete() {
  if (!attendeeId.value) return
  
  const confirmed = confirm('Are you sure you want to delete this participant? This action cannot be undone.')
  if (!confirmed) return
  
  try {
    await deleteMutation.mutateAsync(attendeeId.value)
    alert('Participant deleted successfully!')
    router.push(`/events/${eventId.value}/m/participants/dashboard`)
  } catch (error) {
    console.error('Error deleting attendee:', error)
    alert('Failed to delete participant. Please try again.')
  }
}
</script>