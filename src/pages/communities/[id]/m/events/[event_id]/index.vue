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
    <div v-if="isLoading" class="space-y-6">
      <USkeleton class="h-12 w-3/4" />
      <USkeleton class="h-64 w-full" />
    </div>

    <!-- Error State -->
    <UAlert 
      v-else-if="error" 
      color="red" 
      icon="i-heroicons-exclamation-triangle"
      title="Error loading event"
      :description="error.message"
    />

    <!-- Main Content -->
    <div v-else-if="event" class="space-y-6">
      <!-- Page Header with Actions -->
      <div class="bg-white rounded-lg border border-gray-300 p-6 shadow-sm">
        <div class="flex items-start justify-between gap-6 mb-4">
          <div class="flex-1">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ event.title }}</h1>
            <p class="text-gray-700 mb-4 font-medium">{{ event.display_code }}</p>
            <div class="flex flex-wrap gap-2">
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
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-2">
            <UButton 
              :to="`/communities/${organisationId}/m/events/${eventId}/authorise`"
              icon="i-heroicons-check-circle"
              color="primary"
            >
              Authorize Event
            </UButton>
            <UButton 
              icon="i-heroicons-pencil"
              variant="outline"
            >
              Edit
            </UButton>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <UCard class="shadow-sm !bg-white dark:!bg-white">
          <div class="flex items-center gap-3">
            <div class="p-3 bg-blue-100 dark:bg-blue-100 rounded-lg">
              <UIcon name="i-heroicons-users" class="w-6 h-6 text-blue-600 dark:text-blue-600" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-700">Attendees</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-gray-900">{{ event.number_of_attendees }}</p>
            </div>
          </div>
        </UCard>

        <UCard class="shadow-sm !bg-white dark:!bg-white">
          <div class="flex items-center gap-3">
            <div class="p-3 bg-green-100 dark:bg-green-100 rounded-lg">
              <UIcon name="i-heroicons-calendar" class="w-6 h-6 text-green-600 dark:text-green-600" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-700">Duration</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-gray-900">{{ event.duration_days }} day(s)</p>
            </div>
          </div>
        </UCard>

        <UCard class="shadow-sm !bg-white dark:!bg-white">
          <div class="flex items-center gap-3">
            <div class="p-3 bg-purple-100 dark:bg-purple-100 rounded-lg">
              <UIcon name="i-heroicons-user-group" class="w-6 h-6 text-purple-600 dark:text-purple-600" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-700">Max Capacity</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-gray-900">{{ event.maximum_attendance || '∞' }}</p>
            </div>
          </div>
        </UCard>

        <UCard class="shadow-sm !bg-white dark:!bg-white">
          <div class="flex items-center gap-3">
            <div class="p-3 bg-orange-100 dark:bg-orange-100 rounded-lg">
              <UIcon name="i-heroicons-clipboard-document-check" class="w-6 h-6 text-orange-600 dark:text-orange-600" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-700">Registration</p>
              <p class="text-lg font-bold text-gray-900 dark:text-gray-900">
                {{ event.can_participants_register ? 'Open' : 'Closed' }}
              </p>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Main Information Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Event Details -->
        <UCard class="shadow-sm !bg-white dark:!bg-white">
          <template #header>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-900">Event Details</h2>
          </template>

          <div class="space-y-4">
            <div class="flex items-start gap-3">
              <UIcon name="i-heroicons-tag" class="w-5 h-5 text-gray-400 mt-0.5" />
              <div class="flex-1">
                <label class="text-sm font-semibold text-gray-900">Event Type</label>
                <p class="mt-1 text-gray-700">{{ event.event_type_details?.title || 'N/A' }}</p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <UIcon name="i-heroicons-building-office" class="w-5 h-5 text-gray-400 mt-0.5" />
              <div class="flex-1">
                <label class="text-sm font-semibold text-gray-900">Organization</label>
                <p class="mt-1 text-gray-700">{{ event.organisation_name }}</p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <UIcon name="i-heroicons-calendar" class="w-5 h-5 text-gray-400 mt-0.5" />
              <div class="flex-1">
                <label class="text-sm font-semibold text-gray-900">Start Date & Time</label>
                <p class="mt-1 text-gray-700">{{ formatEventDateTime(event.start_datetime) }}</p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <UIcon name="i-heroicons-calendar" class="w-5 h-5 text-gray-400 mt-0.5" />
              <div class="flex-1">
                <label class="text-sm font-semibold text-gray-900">End Date & Time</label>
                <p class="mt-1 text-gray-700">{{ formatEventDateTime(event.end_datetime) }}</p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <UIcon name="i-heroicons-globe-alt" class="w-5 h-5 text-gray-400 mt-0.5" />
              <div class="flex-1">
                <label class="text-sm font-semibold text-gray-900">Timezone</label>
                <p class="mt-1 text-gray-700">{{ event.timezone }}</p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <UIcon name="i-heroicons-user" class="w-5 h-5 text-gray-400 mt-0.5" />
              <div class="flex-1">
                <label class="text-sm font-semibold text-gray-900">Created By</label>
                <p class="mt-1 text-gray-700">{{ event.created_by_email }}</p>
                <p class="text-sm text-gray-600">{{ formatEventDateTime(event.created_at) }}</p>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Status Information -->
        <UCard class="shadow-sm !bg-white dark:!bg-white">
          <template #header>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-900">Status Information</h2>
          </template>

          <div class="space-y-4">
            <div>
              <label class="text-sm font-semibold text-gray-900">Current Status</label>
              <div class="mt-2">
                <UBadge 
                  :color="getStatusColor(event.status)" 
                  :label="event.status_display"
                  size="lg"
                />
              </div>
            </div>

            <div>
              <label class="text-sm font-semibold text-gray-900">Authorization Status</label>
              <div class="mt-2">
                <UBadge 
                  :color="event.is_approved ? 'green' : 'yellow'" 
                  :label="event.is_approved ? 'Authorized' : 'Pending Authorization'"
                  size="lg"
                />
              </div>
            </div>

            <div>
              <label class="text-sm font-semibold text-gray-900">Registration</label>
              <p class="mt-1 text-gray-700">
                {{ event.can_participants_register ? 'Open for registration' : 'Registration closed' }}
              </p>
            </div>

            <div>
              <label class="text-sm font-semibold text-gray-900">Ongoing Status</label>
              <p class="mt-1 text-gray-700">
                {{ event.is_ongoing ? 'Event is currently in progress' : 'Event not started or ended' }}
              </p>
            </div>

            <div v-if="event.deleted_at">
              <label class="text-sm font-semibold text-gray-900">Deleted</label>
              <p class="mt-1 text-red-700 font-medium">
                Deleted on {{ formatEventDateTime(event.deleted_at) }}
              </p>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Descriptions -->
      <UCard v-if="event.short_description || event.long_description" class="shadow-sm !bg-white dark:!bg-white">
        <template #header>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-900">Description</h2>
        </template>

        <div class="space-y-4">
          <div v-if="event.short_description">
            <label class="text-sm font-semibold text-gray-900">Short Description</label>
            <p class="mt-1 text-gray-700">{{ event.short_description }}</p>
          </div>

          <div v-if="event.long_description" class="border-t pt-4">
            <label class="text-sm font-semibold text-gray-900 mb-2 block">Full Description</label>
            <div class="prose prose-sm max-w-none text-gray-700">
              <p class="whitespace-pre-wrap">{{ event.long_description }}</p>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Additional Information -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        <UCard v-if="event.important_information || event.what_to_bring" class="shadow-sm !bg-white dark:!bg-white">
          <template #header>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-900">Important Details</h2>
          </template>

          <div class="space-y-4">
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
      </div>
    </div>
  </ManagementLayout>
</template>

<script setup lang="ts">
import { useEvent } from '~/composables/resources/events/events'
import { useOrganisation } from '~/composables/resources/organisation/organisations'
import { formatDateTime } from '~/utils/time'
import ManagementLayout from '~/components/communities/ManagementLayout.vue'

const route = useRoute()

const organisationId = computed(() => route.params.id as string)
const eventId = computed(() => route.params.event_id as string)

// Fetch organisation for the layout
const { data: orgData } = useOrganisation(Number(organisationId.value))
const organisation = computed(() => orgData.value?.data)

// Fetch event details
const { data, isLoading, error } = useEvent(eventId)
const event = computed(() => data.value?.data)

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
</script>
