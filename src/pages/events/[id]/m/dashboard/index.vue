<template>
  <EventsManagementLayout :event-id="id" :event="event">
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Main Content (3/4) -->
      <div class="lg:col-span-3 space-y-6">
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Total Registrations -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Total Registrations</p>
                <p class="text-3xl font-bold text-gray-900 mt-2">
                  {{ event?.number_of_attendees || 0 }}
                </p>
                <p v-if="event?.maximum_attendance" class="text-xs text-gray-500 mt-1">
                  of {{ event.maximum_attendance }} capacity
                </p>
              </div>
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <UIcon name="i-heroicons-user-group" class="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div v-if="event?.maximum_attendance" class="mt-4">
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-blue-600 h-2 rounded-full transition-all"
                  :style="{ width: `${attendancePercentage}%` }"
                />
              </div>
            </div>
          </div>

          <!-- Event Staff -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Event Staff</p>
                <p class="text-3xl font-bold text-gray-900 mt-2">
                  {{ staffList?.count || 0 }}
                </p>
                <p class="text-xs text-gray-500 mt-1">Team members</p>
              </div>
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <UIcon name="i-heroicons-identification" class="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <!-- Questions/Forms -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Form Questions</p>
                <p class="text-3xl font-bold text-gray-900 mt-2">
                  {{ questionsList?.count || 0 }}
                </p>
                <p class="text-xs text-gray-500 mt-1">Registration fields</p>
              </div>
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UIcon name="i-heroicons-clipboard-document-list" class="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <UButton
              :to="`/events/${id}/m/info`"
              variant="outline"
              color="gray"
              block
              icon="i-heroicons-pencil-square"
            >
              Edit Event Info
            </UButton>
            <UButton
              :to="`/events/${id}/m/staff`"
              variant="outline"
              color="gray"
              block
              icon="i-heroicons-user-plus"
            >
              Add Staff
            </UButton>
            <UButton
              :to="`/events/${id}/m/registration`"
              variant="outline"
              color="gray"
              block
              icon="i-heroicons-plus-circle"
            >
              Add Question
            </UButton>
            <UButton
              :to="`/events/${id}/m/landing`"
              variant="outline"
              color="gray"
              block
              icon="i-heroicons-photo"
            >
              Update Landing Page
            </UButton>
            <UButton
              :to="`/events/${id}/m/resources`"
              variant="outline"
              color="gray"
              block
              icon="i-heroicons-arrow-up-tray"
            >
              Upload Resources
            </UButton>
            <UButton
              :to="`/events/${id}/preview`"
              variant="outline"
              color="blue"
              block
              icon="i-heroicons-eye"
            >
              Preview Event Page
            </UButton>
          </div>
        </div>

        <!-- Recent Activity / Latest Registrations -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900">Latest Registrations</h2>
            <UButton
              :to="`/events/${id}/m/participants/dashboard`"
              variant="ghost"
              color="gray"
              size="sm"
              trailing-icon="i-heroicons-arrow-right"
            >
              View All
            </UButton>
          </div>
          
          <div v-if="isAttendeesPending" class="space-y-3">
            <div v-for="i in 5" :key="i" class="animate-pulse flex items-center gap-3">
              <div class="w-10 h-10 bg-gray-200 rounded-full" />
              <div class="flex-1">
                <div class="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                <div class="h-3 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          </div>

          <div v-else-if="attendeesResults.length" class="space-y-3">
            <div
              v-for="attendee in attendeesResults.slice(0, 5)"
              :key="attendee.attendee_id"
              class="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {{ attendee.first_name[0] }}{{ attendee.last_name[0] }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">
                  {{ attendee.full_name }}
                </p>
                <p class="text-xs text-gray-500">
                  {{ attendee.email || 'No email' }}
                </p>
              </div>
              <div class="text-xs text-gray-400">
                {{ formatCompactDateTime(attendee.created_at) }}
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8 text-gray-500">
            <UIcon name="i-heroicons-user-group" class="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p class="text-sm">No registrations yet</p>
          </div>
        </div>
      </div>

      <!-- Sidebar (1/4) -->
      <div class="lg:col-span-1 space-y-6">
        <!-- Event Status -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-sm font-semibold text-gray-900 mb-4">Event Status</h3>
          <div class="space-y-3">
            <div>
              <p class="text-xs text-gray-600 mb-1">Current Status</p>
              <UBadge
                v-if="event?.status"
                :color="getStatusColor(event.status)"
                variant="subtle"
                size="md"
              >
                {{ event.status_display }}
              </UBadge>
            </div>
            <div v-if="event?.start_datetime">
              <p class="text-xs text-gray-600 mb-1">Start Date</p>
              <p class="text-sm font-medium text-gray-900">
                {{ formatDate(event.start_datetime) }}
              </p>
            </div>
            <div v-if="event?.end_datetime">
              <p class="text-xs text-gray-600 mb-1">End Date</p>
              <p class="text-sm font-medium text-gray-900">
                {{ formatDate(event.end_datetime) }}
              </p>
            </div>
            <div v-if="event?.created_at">
              <p class="text-xs text-gray-600 mb-1">Created</p>
              <p class="text-sm font-medium text-gray-900">
                {{ formatCompactDateTime(event.created_at) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Event Settings -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-sm font-semibold text-gray-900 mb-4">Features Enabled</h3>
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">Payments</span>
              <UIcon
                :name="settings?.payment_enabled ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
                :class="settings?.payment_enabled ? 'text-green-600' : 'text-gray-400'"
                class="w-5 h-5"
              />
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">Product Shop</span>
              <UIcon
                :name="settings?.product_selling_enabled ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
                :class="settings?.product_selling_enabled ? 'text-green-600' : 'text-gray-400'"
                class="w-5 h-5"
              />
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">Donations</span>
              <UIcon
                :name="settings?.donation_enabled ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
                :class="settings?.donation_enabled ? 'text-green-600' : 'text-gray-400'"
                class="w-5 h-5"
              />
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">Sponsors</span>
              <UIcon
                :name="settings?.accepting_sponsorships_enabled ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
                :class="settings?.accepting_sponsorships_enabled ? 'text-green-600' : 'text-gray-400'"
                class="w-5 h-5"
              />
            </div>
          </div>
          <UButton
            :to="`/events/${id}/m/payments`"
            variant="ghost"
            color="gray"
            size="xs"
            block
            class="mt-4"
          >
            Manage Settings
          </UButton>
        </div>

        <!-- Quick Stats -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-sm font-semibold text-gray-900 mb-4">Overview</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">Resources</span>
              <span class="font-medium text-gray-900">
                {{ resourcesList?.count || 0 }}
              </span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">Landing Images</span>
              <span class="font-medium text-gray-900">
                {{ landingImages?.count || 0 }}
              </span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">Staff Roles</span>
              <span class="font-medium text-gray-900">
                {{ rolesList?.count || 0 }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </EventsManagementLayout>
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { attendeesList } from '~/api/sdk.gen'
import { useEvent } from '~/composables/resources/events/events'
import { useEventSettings } from '~/composables/resources/events/eventSettings'
import { useEventStaff } from '~/composables/resources/events/eventStaff'
import { useEventQuestions } from '~/composables/resources/events/eventQuestions'
import { useEventRoles } from '~/composables/resources/events/eventRoles'
import { useEventResources } from '~/composables/resources/events/eventResources'
import { useEventLandingImages } from '~/composables/resources/events/eventLandingImages'
import { formatDate, formatCompactDateTime } from '~/utils/time'
import EventsManagementLayout from '~/components/events/EventManagementLayout.vue'

definePageMeta({
  layout: false,
  middleware: 'auth',
})

const route = useRoute()
const id = computed(() => route.params.id as string)

// Fetch event data
const { data: eventData, isPending: isEventPending } = useEvent(id)
const event = computed(() => eventData.value?.data)

const { data: settingsData } = useEventSettings(id)
const settings = computed(() => settingsData.value?.data)

const { data: staffData } = useEventStaff({ event__event_id: id.value })
const staffList = computed(() => staffData.value?.data)

const { data: questionsData } = useEventQuestions({ event__event_id: id.value })
const questionsList = computed(() => questionsData.value?.data)

const { data: rolesData } = useEventRoles()
const rolesList = computed(() => rolesData.value?.data)

const { data: resourcesData } = useEventResources(id, { page_size: 1 })
const resourcesList = computed(() => resourcesData.value?.data)

const { data: landingImagesData } = useEventLandingImages(id, { page_size: 1 })
const landingImages = computed(() => landingImagesData.value?.data)

// Fetch attendees list for recent registrations
const { data: attendeesData, isPending: isAttendeesPending } = useQuery({
  queryKey: ['attendees', 'list', id],
  queryFn: () => {
    return attendeesList({
      query: {
        event: id.value,
        page_size: 10,
        ordering: '-created_at',
      },
    })
  },
  enabled: () => !!id.value,
})

const attendeesResults = computed(() => attendeesData.value?.data?.results || [])

const attendancePercentage = computed(() => {
  if (!event.value?.maximum_attendance) return 0
  const current = event.value.number_of_attendees || 0
  return Math.min((current / event.value.maximum_attendance) * 100, 100)
})

const getStatusColor = (status: string): 'gray' | 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange' => {
  const colors: Record<string, 'gray' | 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange'> = {
    DRAFTING: 'gray',
    PUBLISHED: 'blue',
    OPEN: 'green',
    CLOSED: 'red',
    IN_PROGRESS: 'yellow',
    COMPLETED: 'purple',
    CANCELLED: 'red',
    POSTPONED: 'orange',
    ARCHIVED: 'gray',
  }
  return colors[status] || 'gray'
}
</script>