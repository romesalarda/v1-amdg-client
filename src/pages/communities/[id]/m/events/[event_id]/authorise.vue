<template>
  <ManagementLayout :organisation-id="organisationId" :organisation="organisation">
    <!-- Back Button -->
    <UButton 
    :to="`/communities/${organisationId}/m/events`"
    icon="i-heroicons-arrow-left"
    variant="ghost"
    color="gray"
    class="mb-6"
    >
    Back to Events
    </UButton>

    <!-- Loading State -->
    <div v-if="isLoadingEvent" class="space-y-6">
      <USkeleton class="h-12 w-3/4" />
      <USkeleton class="h-64 w-full" />
    </div>

    <!-- Error State -->
    <UAlert 
      v-else-if="eventError" 
      color="red" 
      icon="i-heroicons-exclamation-triangle"
      title="Error loading event"
      :description="eventError.message"
    />

    <!-- Main Content -->
    <div v-else-if="event" class="space-y-8">
      <!-- Authorization Form - Prominent Section -->
      <EventAuthorizationForm 
        :event-id="Number(event.event_id)"
        :existing-authorization="currentAuthorization"
        :is-submitting="isSubmitting"
        @submit="handleAuthorizationSubmit"
        @cancel="handleCancel"
      />

      <!-- Event Details - Below Form -->
      <div class="space-y-6">
        <!-- Page Header -->
        <div class="bg-white rounded-lg border border-gray-300 p-6 shadow-sm">
          <div class="flex items-start justify-between gap-6">
            <div class="flex-1">
              <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ event.title }}</h1>
              <p class="text-gray-700 mb-4 font-medium">{{ event.display_code }}</p>
              <div class="flex flex-wrap gap-3">
                <UBadge 
                  :color="getStatusColor(event.status)" 
                  :label="event.status_display"
                  size="lg"
                />
                <UBadge 
                  v-if="event.is_approved"
                  color="green" 
                  label="Authorized"
                  size="lg"
                />
                <UBadge 
                  v-else
                  color="yellow" 
                  label="Pending Authorization"
                  size="lg"
                />
              </div>
            </div>
          </div>
        </div>

      <!-- Event Details Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Basic Information -->
        <UCard class="shadow-sm !bg-white dark:!bg-white">
          <template #header>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-900">Event Information</h2>
          </template>

          <div class="space-y-4">
            <div>
              <label class="text-sm font-semibold text-gray-900">Event Type</label>
              <p class="mt-1 text-gray-700">{{ event.event_type_details?.title || 'N/A' }}</p>
            </div>

            <div>
              <label class="text-sm font-semibold text-gray-900">Organization</label>
              <p class="mt-1 text-gray-700">{{ event.organisation_name || 'N/A' }}</p>
            </div>

            <div>
              <label class="text-sm font-semibold text-gray-900">Start Date & Time</label>
              <p class="mt-1 text-gray-700">{{ formatEventDateTime(event.start_datetime) }}</p>
            </div>

            <div>
              <label class="text-sm font-semibold text-gray-900">End Date & Time</label>
              <p class="mt-1 text-gray-700">{{ formatEventDateTime(event.end_datetime) }}</p>
            </div>

            <div>
              <label class="text-sm font-semibold text-gray-900">Duration</label>
              <p class="mt-1 text-gray-700">{{ event.duration_days }} day(s)</p>
            </div>

            <div>
              <label class="text-sm font-semibold text-gray-900">Timezone</label>
              <p class="mt-1 text-gray-700">{{ event.timezone }}</p>
            </div>
          </div>
        </UCard>

        <!-- Capacity & Attendance -->
        <UCard class="shadow-sm !bg-white dark:!bg-white">
          <template #header>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-900">Capacity & Attendance</h2>
          </template>

          <div class="space-y-4">
            <div>
              <label class="text-sm font-semibold text-gray-900">Expected Attendance</label>
              <p class="mt-1 text-gray-700">{{ event.expected_attendance || 'Not specified' }}</p>
            </div>

            <div>
              <label class="text-sm font-semibold text-gray-900">Maximum Attendance</label>
              <p class="mt-1 text-gray-700">{{ event.maximum_attendance || 'Unlimited' }}</p>
            </div>

            <div>
              <label class="text-sm font-semibold text-gray-900">Current Attendees</label>
              <p class="mt-1 text-gray-700">{{ event.number_of_attendees }}</p>
            </div>

            <div>
              <label class="text-sm font-semibold text-gray-900">Registration Status</label>
              <p class="mt-1 text-gray-700">
                {{ event.can_participants_register ? 'Open for registration' : 'Registration closed' }}
              </p>
            </div>
          </div>
        </UCard>
      </div>

        <!-- Description -->
        <UCard v-if="event.short_description || event.long_description" class="shadow-sm !bg-white dark:!bg-white">
          <template #header>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-900">Description</h2>
          </template>

          <div class="space-y-4">
            <div v-if="event.short_description">
              <label class="text-sm font-semibold text-gray-900">Short Description</label>
              <p class="mt-1 text-gray-700">{{ event.short_description }}</p>
            </div>

            <div v-if="event.long_description">
              <label class="text-sm font-semibold text-gray-900">Full Description</label>
              <p class="mt-1 text-gray-700 whitespace-pre-wrap">{{ event.long_description }}</p>
            </div>

            <div v-if="event.important_information">
              <label class="text-sm font-semibold text-gray-900">Important Information</label>
              <p class="mt-1 text-gray-700 whitespace-pre-wrap">{{ event.important_information }}</p>
            </div>

            <div v-if="event.what_to_bring">
              <label class="text-sm font-semibold text-gray-900">What to Bring</label>
              <p class="mt-1 text-gray-700 whitespace-pre-wrap">{{ event.what_to_bring }}</p>
            </div>
          </div>
        </UCard>

        <!-- Theme & Spiritual Details -->
        <UCard v-if="event.theme || event.anchor_verse" class="shadow-sm !bg-white dark:!bg-white">
          <template #header>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-900">Theme & Spiritual Focus</h2>
          </template>

          <div class="space-y-4">
            <div v-if="event.theme">
              <label class="text-sm font-semibold text-gray-900">Theme</label>
              <p class="mt-1 text-gray-700">{{ event.theme }}</p>
            </div>

            <div v-if="event.anchor_verse">
              <label class="text-sm font-semibold text-gray-900">Anchor Verse</label>
              <p class="mt-1 text-gray-700 italic">"{{ event.anchor_verse }}"</p>
            </div>
          </div>
        </UCard>

        <!-- Authorization History -->
        <UCard v-if="existingAuthorizations?.length > 1" class="shadow-sm !bg-white dark:!bg-white">
          <template #header>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-900">Authorization History</h2>
          </template>

          <div class="space-y-4">
            <div 
              v-for="(auth, index) in existingAuthorizations.slice(1)" 
              :key="auth.id"
              class="border border-gray-300 rounded-lg p-4 bg-gray-50"
            >
              <div class="flex items-start justify-between mb-2">
                <UBadge 
                  :color="getAuthStatusColor(auth.status)" 
                  :label="auth.status_display"
                />
                <span class="text-sm font-medium text-gray-700">{{ formatEventDateTime(auth.reviewed_at) }}</span>
              </div>
              <p class="text-sm text-gray-800 mb-1">
                <span class="font-semibold">Reviewed by:</span> {{ auth.reviewed_by_email }}
              </p>
              <p v-if="auth.reason" class="text-sm text-gray-800 mb-1">
                <span class="font-semibold">Reason:</span> {{ auth.reason }}
              </p>
              <p v-if="auth.notes" class="text-sm text-gray-700">
                <span class="font-semibold">Notes:</span> {{ auth.notes }}
              </p>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </ManagementLayout>
</template>

<script setup lang="ts">
import { useEvent } from '~/composables/resources/events/events'
import { useOrganisation } from '~/composables/resources/organisation/organisations'
import { 
  useEventAuthorizations, 
  useCreateEventAuthorization,
  usePartialUpdateEventAuthorization 
} from '~/composables/resources/events/eventAuthorizations'
import type { EventAuthorizationRequest } from '~/api/types.gen'
import { formatDateTime } from '~/utils/time'
import ManagementLayout from '~/components/communities/ManagementLayout.vue'
import EventAuthorizationForm from '~/components/events/forms/EventAuthorizationForm.vue'

definePageMeta({
  middleware: ['auth', 'organisation-controller'],
  layout: 'default',
})

const route = useRoute()
const router = useRouter()
const toast = useToast()

const organisationId = computed(() => route.params.id as string)
const eventId = computed(() => route.params.event_id as string)

// Fetch organisation for the layout
const { data: orgData } = useOrganisation(organisationId)
const organisation = computed(() => orgData.value?.data)

// Fetch event details
const { data: eventData, isLoading: isLoadingEvent, error: eventError } = useEvent(eventId)
const event = computed(() => eventData.value?.data)

// Fetch existing authorizations for this event
const { data: authData } = useEventAuthorizations(computed(() => ({ event: event.value?.url_safe_title || '' })))
const existingAuthorizations = computed(() => authData.value?.data?.results || [])

// Get the most recent authorization (if any)
const currentAuthorization = computed(() => existingAuthorizations.value?.[0])

const createMutation = useCreateEventAuthorization()
const updateMutation = usePartialUpdateEventAuthorization()
const isSubmitting = computed(() => createMutation.isPending.value || updateMutation.isPending.value)

const handleAuthorizationSubmit = async (values: { status: string; reason?: string; notes?: string }) => {
  if (!event.value) return

  try {
    if (currentAuthorization.value) {
      // Update existing authorization
      await updateMutation.mutateAsync({
        authorizationId: currentAuthorization.value.id,
        body: {
          status: values.status as any,
          reason: values.reason || undefined,
          notes: values.notes || undefined,
        }
      })
      
      toast.add({
        title: 'Authorization Updated',
        description: 'Event authorization has been updated successfully.',
        color: 'green',
      })
    } else {
      // Create new authorization
      const authData: EventAuthorizationRequest = {
        event: event.value.event_id,
        status: values.status as any,
        reason: values.reason || undefined,
        notes: values.notes || undefined,
      }

      await createMutation.mutateAsync(authData)
      
      toast.add({
        title: 'Authorization Submitted',
        description: 'Event authorization has been recorded successfully.',
        color: 'green',
      })
    }
    
    // Navigate back to events list
    router.push(`/communities/${organisationId.value}/m/events`)
  } catch (error: any) {
    toast.add({
      title: 'Authorization Failed',
      description: error.message || 'Failed to submit authorization. Please try again.',
      color: 'red',
    })
  }
}

const handleCancel = () => {
  router.push(`/communities/${organisationId.value}/m/events/${eventId.value}`)
}

const formatEventDateTime = (dateString?: string) => {
  if (!dateString) return 'N/A'
  return formatDateTime(dateString, event.value?.timezone || 'UTC', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getStatusColor = (status?: string): 'gray' | 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'yellow' => {
  const colors: Record<string, 'gray' | 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'yellow'> = {
    'DRAFTING': 'gray',
    'PUBLISHED': 'blue',
    'OPEN': 'green',
    'CLOSED': 'orange',
    'IN_PROGRESS': 'purple',
    'COMPLETED': 'gray',
    'DELETED': 'red',
    'CANCELLED': 'red',
    'POSTPONED': 'yellow',
    'ARCHIVED': 'gray',
  }
  return colors[status || ''] || 'gray'
}

const getAuthStatusColor = (status?: string): 'yellow' | 'green' | 'red' | 'orange' | 'gray' => {
  const colors: Record<string, 'yellow' | 'green' | 'red' | 'orange' | 'gray'> = {
    'PENDING': 'yellow',
    'APPROVED': 'green',
    'REJECTED': 'red',
    'POSTPONED': 'orange',
    'CANCELLED': 'red',
  }
  return colors[status || ''] || 'gray'
}
</script>
