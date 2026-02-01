<template>
  <EventsManagementLayout :event-id="eventId" :event="event?.data">
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Availability Windows</h1>
          <p class="text-gray-600 mt-1">
            Manage time-based availability for refunds, registration, merchandise, and more.
          </p>
        </div>
        <UButton
          icon="i-heroicons-plus"
          @click="openCreateModal"
          :disabled="isLoadingEvent || isLoadingWindows"
        >
          Add Window
        </UButton>
      </div>

    <!-- Loading State -->
    <div v-if="isLoadingWindows" class="flex justify-center items-center py-12">
      <div class="flex flex-col items-center gap-3">
        <UIcon name="i-heroicons-arrow-path" class="text-3xl text-primary animate-spin" />
        <p class="text-gray-600">Loading availability windows...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="windowsError" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-start gap-3">
        <UIcon name="i-heroicons-exclamation-circle" class="text-red-600 text-xl mt-0.5" />
        <div>
          <h3 class="font-semibold text-red-900">Failed to load availability windows</h3>
          <p class="text-red-700 text-sm mt-1">{{ windowsError }}</p>
        </div>
      </div>
    </div>

    <!-- Content -->
    <template v-else>
      <!-- Empty State -->
      <div v-if="!windows || windows.length === 0" class="text-center py-12">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <UIcon name="i-heroicons-calendar" class="text-3xl text-gray-400" />
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">No availability windows yet</h3>
        <p class="text-gray-600 mb-6">
          Get started by creating your first availability window to control when features are accessible.
        </p>
        <UButton icon="i-heroicons-plus" @click="openCreateModal">
          Create First Window
        </UButton>
      </div>

      <!-- Windows Content -->
      <template v-else>
        <!-- Template Selector -->
        <AvailabilityTemplateSelector
          :event-id="eventId"
          :has-windows="windows.length > 0"
          :window-count="windows.length"
          @template-applied="handleTemplateApplied"
        />

        <!-- Timeline Visualization -->
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">Timeline View</h2>
          </template>
          <AvailabilityWindowsTimeline
            :windows="windows"
            :timezone="eventTimezone"
            :event-start="event?.data?.start_datetime"
            :event-end="event?.data?.end_datetime"
            :event-title="event?.data?.title"
            @window-click="handleWindowClick"
          />
        </UCard>

        <!-- Windows List -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold">All Windows ({{ windows.length }})</h2>
              <div class="text-sm text-gray-500">
                Sorted by start date
              </div>
            </div>
          </template>

          <div class="divide-y divide-gray-200">
            <div
              v-for="window in sortedWindows"
              :key="window.availability_id"
              class="py-4 first:pt-0 last:pb-0"
            >
              <div class="flex items-start justify-between gap-4">
                <!-- Window Info -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-3 mb-2">
                    <h3 class="font-semibold text-gray-900 truncate">
                      {{ window.name }}
                    </h3>
                    <UBadge
                      :color="(getStatusColor(window) as any)"
                      variant="subtle"
                      size="xs"
                    >
                      {{ getStatusLabel(window) }}
                    </UBadge>
                    <UBadge
                      :color="(getTypeColor(window.availability_type) as any)"
                      variant="subtle"
                      size="xs"
                    >
                      {{ getTypeLabel(window.availability_type) }}
                    </UBadge>
                  </div>

                  <p v-if="window.description" class="text-sm text-gray-600 mb-2">
                    {{ window.description }}
                  </p>

                  <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                    <div class="flex items-center gap-1">
                      <UIcon name="i-heroicons-calendar" class="text-gray-400" />
                      <span>{{ formatDateRange(window.available_from || '', window.available_to || '', eventTimezone) }}</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <UIcon name="i-heroicons-clock" class="text-gray-400" />
                      <span>{{ formatTime(window.available_from, eventTimezone) }} - {{ formatTime(window.available_to, eventTimezone) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-2">
                  <UButton
                    icon="i-heroicons-pencil"
                    color="gray"
                    variant="ghost"
                    size="sm"
                    @click="handleEdit(window)"
                  >
                    Edit
                  </UButton>
                  <UButton
                    icon="i-heroicons-trash"
                    color="red"
                    variant="ghost"
                    size="sm"
                    @click="handleDelete(window)"
                  >
                    Delete
                  </UButton>
                </div>
              </div>
            </div>
          </div>
        </UCard>
      </template>
    </template>

    <!-- Form Modal -->
    <AvailabilityWindowFormModal
      :is-open="isModalOpen"
      :window="selectedWindow"
      :event-id="eventId"
      :event-timezone="eventTimezone"
      :event-start="event?.data?.start_datetime"
      :event-end="event?.data?.end_datetime"
      @close="closeModal"
      @success="handleSuccess"
    />
    </div>
  </EventsManagementLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import type { AvailabilityWindow } from '~/api/types.gen'
import { useEvent } from '~/composables/resources/events/events'
import {
  useAvailabilityWindows,
  useDeleteAvailabilityWindow,
} from '~/composables/resources/events/availability-windows'
import { formatDateRange, formatTime } from '~/utils/time'
import { AVAILABILITY_TYPES } from '~/schemas/events/availability'
import AvailabilityWindowsTimeline from '~/components/events/AvailabilityWindowsTimeline.vue'
import AvailabilityWindowFormModal from '~/components/events/AvailabilityWindowFormModal.vue'
import AvailabilityTemplateSelector from '~/components/events/AvailabilityTemplateSelector.vue'
import EventsManagementLayout from '~/components/events/EventManagementLayout.vue'

const route = useRoute()
const { $notyf } = useNuxtApp()

// Get event ID from route
const eventId = computed(() => String(route.params.id))

// Fetch event details
const { data: event, isLoading: isLoadingEvent } = useEvent(eventId)

// Fetch availability windows
const {
  data: windowsData,
  isLoading: isLoadingWindows,
  error: windowsError,
} = useAvailabilityWindows(eventId)

const windows = computed(() => windowsData.value?.data?.results || [])
const eventTimezone = computed(() => event.value?.data?.timezone || 'UTC')

// Sort windows by start date
const sortedWindows = computed(() => {
  return [...windows.value].sort((a, b) => {
    const dateA = new Date(a.available_from || 0).getTime()
    const dateB = new Date(b.available_from || 0).getTime()
    return dateA - dateB
  })
})

// Modal state
const isModalOpen = ref(false)
const selectedWindow = ref<AvailabilityWindow | undefined>(undefined)

function openCreateModal() {
  selectedWindow.value = undefined
  isModalOpen.value = true
}

function handleEdit(window: AvailabilityWindow) {
  selectedWindow.value = window
  isModalOpen.value = true
}

function handleWindowClick(window: AvailabilityWindow) {
  handleEdit(window)
}

function closeModal() {
  isModalOpen.value = false
  selectedWindow.value = undefined
}

function handleSuccess() {
  closeModal()
}

// Handle template applied
function handleTemplateApplied() {
  $notyf.success('Template applied successfully! Windows have been created.')
}

// Delete mutation
const deleteMutation = useDeleteAvailabilityWindow()

async function handleDelete(window: AvailabilityWindow) {
  const confirmed = confirm(
    `Are you sure you want to delete "${window.name}"?\n\nThis action cannot be undone.`
  )

  if (!confirmed) return

  try {
    await deleteMutation.mutateAsync({
      eventId: eventId.value,
      windowId: window.availability_id,
    })
    $notyf.success('Availability window deleted successfully')
  } catch (error: any) {
    console.error('Failed to delete availability window:', error)
    $notyf.error(error?.message || 'Failed to delete availability window. Please try again.')
  }
}

// Helper functions
function getStatusLabel(window: AvailabilityWindow): string {
  if (window.is_active) return 'Active'
  
  const now = new Date()
  const start = new Date(window.available_from || '')
  const end = new Date(window.available_to || '')
  
  if (now < start) return 'Upcoming'
  if (now > end) return 'Ended'
  
  return 'Active'
}

function getStatusColor(window: AvailabilityWindow): string {
  if (window.is_active) return 'green'
  
  const now = new Date()
  const start = new Date(window.available_from || '')
  const end = new Date(window.available_to || '')
  
  if (now < start) return 'blue'
  if (now > end) return 'gray'
  
  return 'green'
}

function getTypeLabel(type?: string): string {
  const typeOption = AVAILABILITY_TYPES.find(t => t.value === type)
  return typeOption?.label || type || 'Unknown'
}

function getTypeColor(type?: string): string {
  const colorMap: Record<string, string> = {
    'REFUND_WINDOW': 'red',
    'REGISTRATION_WINDOW': 'blue',
    'MERCHANDISE_WINDOW': 'purple',
    'DONATION_WINDOW': 'yellow',
    'PAYMENT_WINDOW': 'green',
    'PRODUCT_WINDOW': 'indigo',
    'DISCOUNT_WINDOW': 'pink',
    'RESOURCE_WINDOW': 'teal',
    'PAYMENT_PACKAGE_WINDOW': 'orange',
  }
  
  return colorMap[type || ''] || 'gray'
}
</script>
