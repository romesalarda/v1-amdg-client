<template>
  <UModal :model-value="modelValue" :ui="{ width: 'sm:max-w-2xl' }" @update:model-value="emit('update:modelValue', $event)">
    <div class="p-6">
      <div class="flex items-start justify-between mb-6">
        <div>
          <h3 class="text-xl font-bold text-gray-900">Add New Participant</h3>
          <p class="text-sm text-gray-500 mt-1">Fill in the details to create a new attendee for this event</p>
        </div>
        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-x-mark"
          @click="emit('update:modelValue', false)"
        />
      </div>

      <form @submit.prevent="handleCreateAttendee" class="space-y-6">
        <!-- Personal Information Section -->
        <div class="space-y-4">
          <h4 class="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
            <UIcon name="i-heroicons-user-circle" class="w-4 h-4" />
            Personal Information
          </h4>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 block">
                First Name <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.first_name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                :class="{ 'border-red-500': formErrors.first_name }"
              />
              <p v-if="formErrors.first_name" class="text-xs text-red-500 mt-1">{{ formErrors.first_name }}</p>
            </div>

            <div>
              <label class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 block">
                Last Name <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.last_name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                :class="{ 'border-red-500': formErrors.last_name }"
              />
              <p v-if="formErrors.last_name" class="text-xs text-red-500 mt-1">{{ formErrors.last_name }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 block">
                Email
              </label>
              <input
                v-model="form.email"
                type="email"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                :class="{ 'border-red-500': formErrors.email }"
              />
              <p v-if="formErrors.email" class="text-xs text-red-500 mt-1">{{ formErrors.email }}</p>
            </div>

            <div>
              <label class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 block">
                Phone Number
              </label>
              <input
                v-model="form.phone_number"
                type="tel"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 block">
                Date of Birth <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.date_of_birth"
                type="date"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                :class="{ 'border-red-500': formErrors.date_of_birth }"
              />
              <p v-if="formErrors.date_of_birth" class="text-xs text-red-500 mt-1">{{ formErrors.date_of_birth }}</p>
              <p v-if="previewAge !== null" class="text-xs text-gray-500 mt-1">Age: {{ previewAge }} years old</p>
            </div>

            <div>
              <label class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 block">
                Gender
              </label>
              <select
                v-model="form.gender"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option :value="null">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Booking Association Section -->
        <div class="space-y-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <h4 class="text-xs font-black text-amber-900 uppercase tracking-widest flex items-center gap-2">
            <UIcon name="i-heroicons-ticket" class="w-4 h-4" />
            Booking Association <span class="text-amber-600">*</span>
          </h4>
          <p class="text-xs text-amber-800">
            Attendees should be linked to a booking for proper event management and payment tracking.
          </p>

          <div>
            <label class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 block">
              Search &amp; Select Booking
            </label>
            <input
              v-model="bookingSearchQuery"
              type="text"
              placeholder="Search by booking reference or attendee name..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary mb-2"
            />

            <select
              v-model="form.booking"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              :class="{ 'border-amber-400': formErrors.booking }"
            >
              <option :value="null">Select a booking</option>
              <option
                v-for="booking in filteredBookings"
                :key="booking.id"
                :value="booking.id"
              >
                {{ booking.booking_reference }} - {{ booking.made_by_name || 'N/A' }} ({{ booking.attendee_count }} attendee{{ booking.attendee_count !== 1 ? 's' : '' }})
                <template v-if="booking.attendees && booking.attendees.length > 0">
                  - {{ booking.attendees.map((a: any) => a.full_name || '').filter(Boolean).join(', ') }}
                </template>
              </option>
            </select>
            <p v-if="formErrors.booking" class="text-xs text-amber-600 mt-1">{{ formErrors.booking }}</p>
            <p v-if="filteredBookings.length === 0" class="text-xs text-gray-500 mt-2">
              No bookings found. <NuxtLink :to="`/events/${eventId}/m/bookings`" class="text-primary underline">Create a booking first</NuxtLink>
            </p>
          </div>
        </div>

        <!-- Additional Details Section -->
        <div class="space-y-4">
          <h4 class="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
            <UIcon name="i-heroicons-map-pin" class="w-4 h-4" />
            Additional Details
          </h4>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 block">
                Relationship to User
              </label>
              <select
                v-model="form.relationship_to_user"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="self">Self</option>
                <option value="spouse">Spouse</option>
                <option value="child">Child</option>
                <option value="friend">Friend</option>
                <option value="parent">Parent</option>
                <option value="sibling">Sibling</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 block">
                Area From
              </label>
              <select
                v-model="form.area_from"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option :value="null">Select area</option>
                <option v-for="area in areas" :key="area.id" :value="area.id">
                  {{ area.area_name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex gap-3 pt-4 border-t">
          <UButton
            type="button"
            variant="outline"
            color="gray"
            @click="emit('update:modelValue', false)"
            class="flex-1"
          >
            Cancel
          </UButton>
          <UButton
            type="submit"
            variant="solid"
            color="primary"
            :loading="createAttendeeMutation.isPending.value"
            :disabled="createAttendeeMutation.isPending.value"
            class="flex-1"
          >
            Create Attendee
          </UButton>
        </div>
      </form>
    </div>
  </UModal>
</template>

<script setup lang="ts">
import { useCreateAttendee } from '~/composables/resources/attendee/attendees'
import type { AttendeeCreateRequest } from '~/api/types.gen'
import type { ExtendedBookingList } from '~/composables/participants/useParticipantsDashboardData'

const props = defineProps<{
  modelValue: boolean
  eventId: string
  areas: any[]
  eventBookings: ExtendedBookingList[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'created'): void
}>()

const toast = useToast()
const createAttendeeMutation = useCreateAttendee()

const form = ref<AttendeeCreateRequest>({
  first_name: '',
  last_name: '',
  email: null,
  phone_number: null,
  date_of_birth: null,
  gender: null,
  relationship_to_user: 'self',
  event: null,
  user: null,
  area_from: null,
  booking: null,
})

const bookingSearchQuery = ref('')
const formErrors = ref<Record<string, string>>({})

const previewAge = computed(() => {
  if (!form.value.date_of_birth) return null
  const today = new Date()
  const birthDate = new Date(form.value.date_of_birth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
})

const filteredBookings = computed(() => {
  if (!bookingSearchQuery.value.trim()) return props.eventBookings

  const query = bookingSearchQuery.value.toLowerCase().trim()
  return props.eventBookings.filter(booking => {
    if (booking.booking_reference.toLowerCase().includes(query)) return true
    if (booking.made_by_name?.toLowerCase().includes(query)) return true
    if (booking.attendees && Array.isArray(booking.attendees)) {
      return booking.attendees.some((attendee: any) => attendee.full_name?.toLowerCase().includes(query))
    }
    return false
  })
})

function resetForm() {
  form.value = {
    first_name: '',
    last_name: '',
    email: null,
    phone_number: null,
    date_of_birth: null,
    gender: null,
    relationship_to_user: 'self',
    event: Number(props.eventId) || null,
    user: null,
    area_from: null,
    booking: null,
  }
  bookingSearchQuery.value = ''
  formErrors.value = {}
}

function validateForm(): boolean {
  formErrors.value = {}

  if (!form.value.first_name?.trim()) formErrors.value.first_name = 'First name is required'
  if (!form.value.last_name?.trim()) formErrors.value.last_name = 'Last name is required'
  if (!form.value.date_of_birth) formErrors.value.date_of_birth = 'Date of birth is required'
  if (form.value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    formErrors.value.email = 'Invalid email format'
  }
  if (!form.value.booking) {
    formErrors.value.booking = 'Booking selection is strongly recommended for proper attendee management'
  }

  return Object.keys(formErrors.value).length === 0
}

async function handleCreateAttendee() {
  if (!validateForm()) return

  try {
    form.value.event = Number(props.eventId) || null
    await createAttendeeMutation.mutateAsync(form.value)
    toast.add({ title: 'Success', description: 'Attendee created successfully', color: 'green' })
    emit('update:modelValue', false)
    emit('created')
    resetForm()
  } catch (error: any) {
    console.error('Error creating attendee:', error)
    toast.add({
      title: 'Error',
      description: error?.message || 'Failed to create attendee. Please try again.',
      color: 'red',
    })
    if (error?.body) {
      Object.keys(error.body).forEach(key => {
        formErrors.value[key] = Array.isArray(error.body[key]) ? error.body[key][0] : error.body[key]
      })
    }
  }
}

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    form.value.event = Number(props.eventId) || null
  } else {
    resetForm()
  }
})
</script>
