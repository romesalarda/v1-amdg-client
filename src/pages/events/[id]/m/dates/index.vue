<template>
  <EventManagementLayout :event-id="eventId" :event="event?.data">
    <div class="space-y-6">
      <!-- Page Header -->
      <section class="bg-gradient-to-br from-white via-mist-blue/20 to-white dark:from-navy-900 dark:via-navy-800 dark:to-navy-900 rounded-2xl shadow-drawn dark:shadow-navy-900/20 overflow-hidden border border-deep-navy/10">
        <div class="flex items-start justify-between gap-4 px-8 py-6">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <span class="material-symbols-outlined text-primary text-2xl">calendar_clock</span>
              <h1 class="text-[13px] font-black text-primary dark:text-white uppercase tracking-widest">Availability Windows</h1>
            </div>
            <p class="text-sm text-navy-600 dark:text-navy-300">
              Manage time-based availability for refunds, registration, merchandise, and more.
            </p>
          </div>
          <button
            @click="openCreateModal"
            :disabled="isLoadingEvent || isLoadingWindows"
            class="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
          >
            <span class="material-symbols-outlined text-lg">add</span>
            Add Window
          </button>
        </div>
      </section>

    <!-- Loading State -->
    <div v-if="isLoadingWindows" class="flex justify-center items-center py-12">
      <div class="flex flex-col items-center gap-3">
        <span class="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
        <p class="text-sm text-navy-600 font-medium">Loading availability windows...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="windowsError" class="bg-red-50 border border-red-200 rounded-xl p-5">
      <div class="flex items-start gap-3">
        <span class="material-symbols-outlined text-red-600 text-2xl">error</span>
        <div>
          <h3 class="font-bold text-red-900 text-sm">Failed to load availability windows</h3>
          <p class="text-red-700 text-sm mt-1">{{ windowsError }}</p>
        </div>
      </div>
    </div>

    <!-- Content -->
    <template v-else>
      <!-- Empty State -->
      <div v-if="!windows || windows.length === 0" class="space-y-6">
        <!-- Empty State Card -->
        <section class="bg-white dark:bg-navy-900 border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="text-center py-12 px-8">
            <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full mb-6">
              <span class="material-symbols-outlined text-5xl text-primary">calendar_month</span>
            </div>
            <h3 class="text-xl font-bold text-navy-900 dark:text-white mb-2">No availability windows yet</h3>
            <p class="text-navy-600 dark:text-navy-300 mb-8 max-w-md mx-auto text-sm">
              Get started by creating your first availability window or applying a template to control when features are accessible.
            </p>
            <div class="flex items-center justify-center gap-3">
              <button 
                @click="openCreateModal"
                class="px-6 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <span class="material-symbols-outlined text-lg">add</span>
                Create Window
              </button>
              <button 
                @click="showTemplateSelector = !showTemplateSelector"
                class="px-6 py-3 border-2 border-primary text-primary text-sm font-bold rounded-xl hover:bg-primary/5 transition-colors flex items-center gap-2"
              >
                <span class="material-symbols-outlined text-lg">dashboard</span>
                {{ showTemplateSelector ? 'Hide' : 'Use' }} Template
              </button>
            </div>
          </div>
        </section>
        
        <!-- Template Selector (Collapsible) -->
        <section v-if="showTemplateSelector" class="bg-white dark:bg-navy-900 border-2 border-primary/30 rounded-2xl shadow-drawn overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-navy-50">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">dashboard</span>
              <h3 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest">Apply Template</h3>
            </div>
            <button 
              @click="showTemplateSelector = false"
              class="text-navy-400 hover:text-navy-600 transition-colors"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="p-6">
            <AvailabilityTemplateSelector
              :event-id="eventId"
              :has-windows="windows.length > 0"
              :window-count="windows.length"
              @template-applied="handleTemplateApplied"
            />
          </div>
        </section>
      </div>

      <!-- Windows Content -->
      <template v-else>
        <!-- Template Selector (Collapsible) -->
        <section class="bg-white dark:bg-navy-900 border-2 rounded-2xl shadow-drawn overflow-hidden transition-colors" :class="showTemplateSelector ? 'border-primary/30 bg-primary/5' : 'border-navy-100'">
          <button
            @click="showTemplateSelector = !showTemplateSelector"
            class="w-full flex items-center justify-between px-6 py-4 hover:bg-navy-50/50 transition-colors"
          >
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined transition-colors" :class="showTemplateSelector ? 'text-primary' : 'text-navy-400'">dashboard</span>
              <h3 class="text-sm font-bold text-navy-900">Apply Template</h3>
              <span class="text-[10px] font-bold text-navy-400 uppercase tracking-wider px-2 py-0.5 bg-navy-100 rounded-full">Optional</span>
            </div>
            <span class="material-symbols-outlined text-navy-400 transition-transform" :class="showTemplateSelector ? 'rotate-180' : ''">expand_more</span>
          </button>
          <div v-show="showTemplateSelector" class="px-6 pb-6 pt-2 border-t border-navy-50">
            <AvailabilityTemplateSelector
              :event-id="eventId"
              :has-windows="windows.length > 0"
              :window-count="windows.length"
              @template-applied="handleTemplateApplied"
            />
          </div>
        </section>

        <!-- Timeline/Calendar Visualization -->
        <section class="bg-white dark:bg-navy-900 border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-navy-50">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">show_chart</span>
              <h2 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest">Visualization</h2>
            </div>
            <div class="flex items-center gap-2 bg-navy-50 rounded-lg p-1">
              <button
                @click="viewMode = 'timeline'"
                :class="viewMode === 'timeline' ? 'bg-white shadow-sm text-primary' : 'text-navy-600 hover:text-navy-900'"
                class="px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5"
              >
                <span class="material-symbols-outlined text-sm">timeline</span>
                Timeline
              </button>
              <button
                @click="viewMode = 'calendar'"
                :class="viewMode === 'calendar' ? 'bg-white shadow-sm text-primary' : 'text-navy-600 hover:text-navy-900'"
                class="px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5"
              >
                <span class="material-symbols-outlined text-sm">calendar_month</span>
                Calendar
              </button>
            </div>
          </div>
          <div class="p-6">
          <AvailabilityWindowsTimeline
            v-if="viewMode === 'timeline'"
            :windows="windows"
            :timezone="eventTimezone"
            :event-start="event?.data?.start_datetime"
            :event-end="event?.data?.end_datetime"
            :event-title="event?.data?.title"
            @window-click="handleWindowClick"
          />
          <AvailabilityWindowsCalendar
            v-else
            :windows="windows"
            :timezone="eventTimezone"
            :event-start="event?.data?.start_datetime"
            :event-end="event?.data?.end_datetime"
            :event-title="event?.data?.title"
            @window-click="handleWindowClick"
            @date-click="handleDateClick"
          />
          </div>
        </section>

        <!-- Windows List -->
        <section class="bg-white dark:bg-navy-900 border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-navy-50">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">list</span>
              <h2 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest">All Windows</h2>
              <span class="text-[10px] font-bold text-navy-500 px-2 py-0.5 bg-navy-100 rounded-full">{{ windows.length }}</span>
            </div>
            <div class="text-xs text-navy-500 font-medium">
              Sorted by start date
            </div>
          </div>

          <div class="divide-y divide-navy-50 px-6">
            <div
              v-for="window in sortedWindows"
              :key="window.availability_id"
              class="py-5 first:pt-5 last:pb-5"
            >
              <div class="flex items-start justify-between gap-4">
                <!-- Window Info -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 class="font-bold text-navy-700 truncate text-sm">
                      {{ window.name }}
                    </h3>
                    <span
                      :class="getStatusColor(window) === 'green' ? 'bg-green-100 text-green-700' : getStatusColor(window) === 'yellow' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'"
                      class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    >
                      {{ getStatusLabel(window) }}
                    </span>
                    <span
                      :class="getTypeBadgeColor(window.availability_type) === 'blue' ? 'bg-blue-100 text-blue-700' : getTypeBadgeColor(window.availability_type) === 'green' ? 'bg-green-100 text-green-700' : getTypeBadgeColor(window.availability_type) === 'purple' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'"
                      class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    >
                      {{ getTypeLabel(window.availability_type) }}
                    </span>
                  </div>

                  <p v-if="window.description" class="text-sm text-navy-600 dark:text-navy-300 mb-2">
                    {{ window.description }}
                  </p>

                  <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-navy-500">
                    <div class="flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-sm text-navy-400">calendar_month</span>
                      <span>{{ formatDateRange(window.available_from || '', window.available_to || '', eventTimezone) }}</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-sm text-navy-400">schedule</span>
                      <span>{{ formatTime(window.available_from, eventTimezone) }} - {{ formatTime(window.available_to, eventTimezone) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-2">
                  <button
                    @click="handleEdit(window)"
                    class="px-3 py-1.5 text-xs font-bold text-navy-600 hover:text-primary hover:bg-navy-50 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <span class="material-symbols-outlined text-sm">edit</span>
                    Edit
                  </button>
                  <button
                    @click="handleDelete(window)"
                    class="px-3 py-1.5 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <span class="material-symbols-outlined text-sm">delete</span>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
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
      :preset-start-date="presetStartDate"
      :preset-end-date="presetEndDate"
      @close="closeModal"
      @success="handleSuccess"
    />
    </div>
  </EventManagementLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { AvailabilityWindow } from '~/api/types.gen'
import { useEvent } from '~/composables/resources/events/events'
import {
  useAvailabilityWindows,
  useDeleteAvailabilityWindow,
} from '~/composables/resources/events/availability-windows'
import { formatDateRange, formatTime } from '~/utils/time'
import { 
  getStatusLabel, 
  getStatusColor, 
  getTypeLabel, 
  getTypeBadgeColor 
} from '~/utils/format/availability-windows'
import AvailabilityWindowsTimeline from '~/components/events/AvailabilityWindowsTimeline.vue'
import AvailabilityWindowsCalendar from '~/components/events/AvailabilityWindowsCalendar.vue'
import AvailabilityWindowFormModal from '~/components/events/AvailabilityWindowFormModal.vue'
import AvailabilityTemplateSelector from '~/components/events/AvailabilityTemplateSelector.vue'
import EventManagementLayout from '~/components/events/EventManagementLayout.vue'

definePageMeta({
  layout: false,
})

const route = useRoute()
const { $notyf } = useNuxtApp()

// View mode toggle
const viewMode = ref<'timeline' | 'calendar'>('calendar')

// Template selector visibility
const showTemplateSelector = ref(false)

// Get event ID from route
const eventId = computed(() => String(route.params.id))

// Fetch event details
const { data: event, isLoading: isLoadingEvent } = useEvent(eventId)

// Fetch availability windows
const {
  data: windowsData,
  isLoading: isLoadingWindows,
  error: windowsError,
  refetch: refetchWindows,
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
const presetStartDate = ref<string | undefined>(undefined)
const presetEndDate = ref<string | undefined>(undefined)

function openCreateModal() {
  selectedWindow.value = undefined
  presetStartDate.value = undefined
  presetEndDate.value = undefined
  isModalOpen.value = true
}

function handleEdit(window: AvailabilityWindow) {
  selectedWindow.value = window
  presetStartDate.value = undefined
  presetEndDate.value = undefined
  isModalOpen.value = true
}

function handleWindowClick(window: AvailabilityWindow) {
  handleEdit(window)
}

function handleDateClick(date: Date) {
  // Set preset dates: clicked date at 00:00 to 23:59

  console.log('Date clicked:', date)
  const startDate = new Date(date)
  startDate.setHours(0, 0, 0, 0)
  
  const endDate = new Date(date)
  endDate.setHours(23, 59, 59, 999)
  // Set type to Refund Window for quick creation
  selectedWindow.value = undefined
  presetStartDate.value = startDate.toISOString()
  presetEndDate.value = endDate.toISOString()
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  selectedWindow.value = undefined
  presetStartDate.value = undefined
  presetEndDate.value = undefined
}

function handleSuccess() {
  closeModal()
}

// Handle template applied
function handleTemplateApplied() {
  $notyf.success('Template applied successfully! Windows have been created.')
  // Refetch windows to show the newly created ones
  refetchWindows()
  // Hide template selector after successful application
  showTemplateSelector.value = false
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
</script>
