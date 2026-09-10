<template>
  <div class="min-h-screen bg-mist-blue pb-32 flex flex-col gap-8 items-center justify-center">
    <!-- Back to Dashboard - Fixed Left -->
    <NuxtLink 
      to="/my-dashboard" 
      class="
        fixed z-50 inline-flex items-center gap-1.5
        bg-white/90 backdrop-blur-sm rounded-lg border border-primary/10 shadow-sm
        text-xs text-navy-600 transition-all group

        px-2.5 py-1.5 top-16 left-3
        sm:px-4 sm:py-2.5 sm:top-20 sm:left-6 sm:text-sm
      "
    >
      <span class="material-symbols-outlined text-base sm:text-lg group-hover:-translate-x-1 transition-transform">
        arrow_back
      </span>
      <span class="font-semibold hidden xs:inline sm:inline">Dashboard</span>
    </NuxtLink>


    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8 w-full">
      <!-- Compact Header -->
      <div class="mb-4 text-center">
        <h1 class="text-4xl font-barbara text-navy-900 uppercase tracking-widest">Create an Event</h1>
      </div>

      <!-- Form Content -->
      <div class="bg-white rounded-2xl shadow-lg border border-primary/10 p-6">
        <form @submit.prevent="handleStepSubmit">
          <!-- Step 1: Event Details -->
          <div v-show="currentStep === 0" class="animate-fadeIn justify-center items-center flex flex-col">
            <div class="border-b border-primary/10 pb-3 mb-4">
              <h2 class="text-lg font-bold text-navy-900">Event Name</h2>
              <p class="text-xs text-navy-500">Name your event</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div class="md:col-span-2 space-y-2">
                <label class="block text-sm font-semibold text-navy-900" for="event-title">
                  Event Title <span class="text-red-500">*</span>
                </label>
                <input
                  id="event-title"
                  v-model="title"
                  type="text"
                  placeholder="e.g., Annual Youth Conference 2026"
                  class="w-full rounded-xl border border-primary/20 bg-white px-4 py-2.5 text-sm text-navy-900 placeholder:text-navy-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <p v-if="errors.title" class="text-xs text-red-500">{{ errors.title }}</p>
                <p v-else-if="titleExists && !isCheckingTitle" class="text-xs text-amber-500 flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">warning</span>
                  An event with this title already exists
                </p>
                <p v-else-if="isCheckingTitle && (title?.length ?? 0) >= 3" class="text-xs text-navy-400 flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                  Checking title…
                </p>
              </div>

              <!-- <div class="space-y-2">
                <label class="block text-sm font-semibold text-navy-900" for="theme">
                  Theme <span class="text-navy-400 text-xs font-normal">(Optional)</span>
                </label>
                <input
                  id="theme"
                  v-model="theme"
                  type="text"
                  placeholder="e.g., Unity in Faith"
                  class="w-full rounded-xl border border-primary/20 bg-white px-4 py-2.5 text-sm text-navy-900 placeholder:text-navy-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-semibold text-navy-900" for="short-desc">
                  Short Description
                </label>
                <textarea
                  id="short-desc"
                  v-model="short_description"
                  placeholder="Brief summary..."
                  rows="2"
                  maxlength="255"
                  class="w-full rounded-xl border border-primary/20 bg-white px-4 py-2.5 text-sm text-navy-900 placeholder:text-navy-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                ></textarea>
                <div class="flex justify-between items-center">
                  <p v-if="errors.short_description" class="text-xs text-red-500">{{ errors.short_description }}</p>
                  <span class="text-xs text-navy-400 ml-auto">{{ short_description?.length || 0 }}/255</span>
                </div>
              </div>

              <div class="md:col-span-2 space-y-2">
                <label class="block text-sm font-semibold text-navy-900" for="long-description">
                  Full Description <span class="text-navy-400 text-xs font-normal">(Optional)</span>
                </label>
                <textarea
                  id="long-description"
                  v-model="long_description"
                  placeholder="Detailed information about the event..."
                  rows="3"
                  class="w-full rounded-xl border border-primary/20 bg-white px-4 py-2.5 text-sm text-navy-900 placeholder:text-navy-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                ></textarea>
              </div> -->
            </div>
          </div>

          <!-- Step 2: Organization & Type -->
          <div v-show="currentStep === 1" class="space-y-4 animate-fadeIn">
            <div class="border-b border-primary/10 pb-3 mb-4">
              <h2 class="text-lg font-bold text-navy-900">Organisation & Type</h2>
              <p class="text-xs text-navy-500">Select the host organisation and event type</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 justify-center items-center w-full">
                <!-- <label class="block text-sm font-semibold text-navy-900" for="organisation">
                  Host Organization <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-navy-400 text-xl pointer-events-none">
                    business
                  </span>
                  <select
                    id="organisation"
                    v-model="organisation"
                    :disabled="isLoadingOrganizations"
                    class="w-full rounded-xl border border-primary/20 bg-white pl-12 pr-4 py-2.5 text-sm text-navy-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select organization</option>
                    <option v-for="org in organizationOptions" :key="org.value" :value="org.value">
                      {{ org.label }}
                    </option>
                  </select>
                  <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none">
                    expand_more
                  </span>
                </div>
                <p v-if="errors.organisation" class="text-xs text-red-500">{{ errors.organisation }}</p> -->
              <div class="space-y-2">
                <label class="block text-sm font-semibold text-navy-900" for="event-type">
                  Organisation <span class="text-red-500">*</span>
                </label>
                <OrganisationSelect
                  :model-value="organisation"
                  @update:model-value="(value) => { organisation = typeof value === 'number' ? value : undefined }"
                />
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-semibold text-navy-900" for="event-type">
                  Event Type <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-navy-400 text-xl pointer-events-none">
                    label
                  </span>
                  <select
                    id="event-type"
                    v-model="event_type"
                    :disabled="isLoadingEventTypes"
                    class="w-full rounded-xl border border-primary/20 bg-white pl-12 pr-4 py-2.5 text-sm text-navy-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select type</option>
                    <option v-for="type in eventTypeOptions" :key="type.value" :value="type.value">
                      {{ type.label }}
                    </option>
                  </select>
                  <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none">
                    expand_more
                  </span>
                </div>
                <p v-if="errors.event_type" class="text-xs text-red-500">{{ errors.event_type }}</p>
              </div>

              <div class="md:col-span-2 space-y-2">
                <label class="block text-sm font-semibold text-navy-900" for="display-code">
                  Display Code <span class="text-red-500">*</span>
                </label>
                <p class="text-xs text-navy-500">Unique identifier for your event (max 10 characters)</p>
                <div class="relative max-w-md">
                  <input
                    id="display-code"
                    v-model="display_code"
                    type="text"
                    placeholder="EVT123456"
                    maxlength="10"
                    class="w-full rounded-xl border border-primary/20 bg-white px-4 py-2.5 pr-12 text-sm text-navy-900 placeholder:text-navy-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <button
                    type="button"
                    @click="display_code = generateDisplayCode()"
                    title="Generate new code"
                    class="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-primary/10 transition-colors"
                  >
                    <span class="material-symbols-outlined text-primary text-lg">refresh</span>
                  </button>
                </div>
                <p v-if="errors.display_code" class="text-xs text-red-500">{{ errors.display_code }}</p>
                <p v-else-if="codeExists && !isCheckingCode" class="text-xs text-amber-500 flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">warning</span>
                  This display code is already in use
                </p>
                <p v-else-if="isCheckingCode && (display_code?.length ?? 0) >= 1" class="text-xs text-navy-400 flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                  Checking code…
                </p>
              </div>
            </div>
          </div>

          <!-- Step 3: Schedule -->
          <div v-show="currentStep === 2" class="space-y-4 animate-fadeIn">
            <div class="border-b border-primary/10 pb-3 mb-4">
              <h2 class="text-lg font-bold text-navy-900">Event Schedule</h2>
              <p class="text-xs text-navy-500">Set the date, time, and timezone</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2 space-y-3">
                <label class="block text-sm font-semibold text-navy-900">
                  Event Dates <span class="text-red-500">*</span>
                </label>
                <DateRangePicker
                  :model-value-start="startDate"
                  :model-value-end="endDate"
                  @update:model-value-start="startDate = $event"
                  @update:model-value-end="endDate = $event"
                >
                  <template #default="{ label, active }">
                    <div
                      class="w-full rounded-xl border px-4 py-2.5 text-sm flex items-center gap-2 cursor-pointer transition-all"
                      :class="[
                        active ? 'border-primary text-navy-900' : 'border-primary/20 text-navy-400',
                        (errors.start_datetime || errors.end_datetime) ? 'border-red-400' : ''
                      ]"
                    >
                      <span class="material-symbols-outlined text-primary text-base shrink-0">date_range</span>
                      <span :class="active ? 'text-navy-900 font-medium' : 'text-navy-400'">
                        {{ active ? label : 'Select date range' }}
                      </span>
                    </div>
                  </template>
                </DateRangePicker>

                <!-- Time inputs -->
                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-1.5">
                    <label class="block text-xs font-semibold text-navy-600" for="start-time">Start Time</label>
                    <input
                      id="start-time"
                      v-model="startTime"
                      type="time"
                      :disabled="!startDate"
                      class="w-full rounded-xl border border-primary/20 bg-white px-4 py-2.5 text-sm text-navy-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div class="space-y-1.5">
                    <label class="block text-xs font-semibold text-navy-600" for="end-time">End Time</label>
                    <input
                      id="end-time"
                      v-model="endTime"
                      type="time"
                      :disabled="!endDate"
                      class="w-full rounded-xl border border-primary/20 bg-white px-4 py-2.5 text-sm text-navy-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <p v-if="errors.start_datetime || errors.end_datetime" class="text-xs text-red-500">
                  {{ errors.start_datetime || errors.end_datetime }}
                </p>
              </div>

              <div class="md:col-span-2 space-y-2">
                <label class="block text-sm font-semibold text-navy-900" for="timezone">
                  Timezone <span class="text-red-500">*</span>
                </label>
                <div class="relative max-w-md">

                  <TimezoneSelect
                    :model-value="timezone || 'UTC'"
                    :has-error="!!errors.timezone"
                    @update:model-value="timezone = $event"
                  />
                </div>
                <p v-if="errors.timezone" class="text-xs text-red-500">{{ errors.timezone }}</p>
              </div>
            </div>
          </div>

          <!-- Step 4: Summary -->
          <div v-show="currentStep === 3" class="space-y-4 animate-fadeIn">
            <div class="border-b border-primary/10 pb-3 mb-4">
              <h2 class="text-lg font-bold text-navy-900">Review & Confirm</h2>
              <p class="text-xs text-navy-500">Please review your event details before creating</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Event Details -->
              <div class="bg-mist-blue/30 rounded-xl p-4 border border-primary/10 space-y-2">
                <h3 class="text-xs font-bold text-navy-900 uppercase tracking-wide flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary text-base">info</span>
                  Event Details
                </h3>
                <div class="space-y-1.5 text-sm">
                  <div class="flex justify-between">
                    <span class="text-navy-600">Title:</span>
                    <span class="font-semibold text-navy-900">{{ title || '-' }}</span>
                  </div>
                  <div v-if="short_description" class="flex justify-between">
                    <span class="text-navy-600">Description:</span>
                    <span class="font-medium text-navy-900 text-right max-w-xs">{{ short_description }}</span>
                  </div>
                  <div v-if="theme" class="flex justify-between">
                    <span class="text-navy-600">Theme:</span>
                    <span class="font-medium text-navy-900">{{ theme }}</span>
                  </div>
                </div>
              </div>

              <!-- Organization & Type -->
              <div class="bg-mist-blue/30 rounded-xl p-4 border border-primary/10 space-y-2">
                <h3 class="text-xs font-bold text-navy-900 uppercase tracking-wide flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary text-base">business</span>
                  Organisation & Type
                </h3>
                <div class="space-y-1.5 text-sm">
                  <div class="flex justify-between">
                    <span class="text-navy-600">Organisation:</span>
                    <span class="font-semibold text-navy-900">{{ organizationOptions.find(o => o.value === organisation)?.label || '-' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-navy-600">Event Type:</span>
                    <span class="font-semibold text-navy-900">{{ eventTypeOptions.find(t => t.value === event_type)?.label || '-' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-navy-600">Display Code:</span>
                    <span class="font-mono font-semibold text-navy-900">{{ display_code || '-' }}</span>
                  </div>
                </div>
              </div>

              <!-- Schedule -->
              <div class="bg-mist-blue/30 rounded-xl p-4 border border-primary/10 space-y-2">
                <h3 class="text-xs font-bold text-navy-900 uppercase tracking-wide flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary text-base">event</span>
                  Schedule
                </h3>
                <div class="space-y-1.5 text-sm">
                  <div class="flex justify-between">
                    <span class="text-navy-600">Start:</span>
                    <span class="font-semibold text-navy-900">{{ start_datetime ? new Date(start_datetime).toLocaleString() : '-' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-navy-600">End:</span>
                    <span class="font-semibold text-navy-900">{{ end_datetime ? new Date(end_datetime).toLocaleString() : '-' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-navy-600">Timezone:</span>
                    <span class="font-semibold text-navy-900">{{ timezone || '-' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Fixed Bottom Stepper Bar -->
    <div class="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-primary/10 shadow-lg">
      <!-- Progress Bar -->
      <div class="h-1 bg-navy-100">
        <div 
          class="h-full bg-primary transition-all duration-300 ease-out"
          :style="{ width: `${((currentStep + 1) / steps.length) * 100}%` }"
        ></div>
      </div>
      
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <!-- Stepper -->
        <div class="flex items-center justify-between mb-4">
          <div 
            v-for="(step, index) in steps" 
            :key="index"
            class="flex items-center"
            :class="{ 'flex-1': index < steps.length - 1 }"
          >
            <!-- Step Circle -->
            <div class="flex flex-col items-center">
              <div 
                class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all"
                :class="[
                  currentStep > index ? 'bg-primary text-white' : 
                  currentStep === index ? 'bg-primary text-white ring-4 ring-primary/20' : 
                  'bg-navy-100 text-navy-400'
                ]"
              >
                <span v-if="currentStep > index" class="material-symbols-outlined text-sm">check</span>
                <span v-else>{{ index + 1 }}</span>
              </div>
              <span 
                class="text-[10px] font-semibold mt-1 text-center max-w-[70px] leading-tight"
                :class="currentStep >= index ? 'text-navy-900' : 'text-navy-400'"
              >
                {{ step.title }}
              </span>
            </div>

            <!-- Connector Line -->
            <div 
              v-if="index < steps.length - 1"
              class="flex-1 h-0.5 mx-2 transition-all"
              :class="currentStep > index ? 'bg-primary' : 'bg-navy-200'"
            ></div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-between">
          <button
            v-if="currentStep > 0"
            type="button"
            @click="previousStep"
            class="rounded-xl border border-navy-300 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-navy-700 transition-all hover:bg-navy-50 flex items-center gap-1.5"
          >
            <span class="material-symbols-outlined text-sm">arrow_back</span>
            Previous
          </button>
          <button
            v-else
            type="button"
            @click="navigateTo('/my-dashboard')"
            class="rounded-xl border border-primary/30 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary transition-all hover:bg-primary hover:text-white hover:border-primary"
          >
            Cancel
          </button>
          
          <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              v-if="currentStep < steps.length - 1"
              type="button"
              @click="saveDraft"
              :disabled="isSubmitting"
              class="
                rounded-xl border border-navy-300 bg-white px-4 py-2
                text-[11px] sm:text-[10px]
                font-black uppercase tracking-wide sm:tracking-widest
                text-navy-700 transition-all hover:bg-navy-50
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-1.5
              "
            >
              <span class="material-symbols-outlined text-sm">draft</span>
              Save Draft
            </button>

            <button
              v-if="currentStep < steps.length - 1"
              type="button"
              @click="nextStep"
              class="
                rounded-xl bg-primary px-5 py-2
                text-[11px] sm:text-[10px]
                font-black uppercase tracking-wide sm:tracking-widest
                text-white transition-all hover:bg-navy-600
                shadow-lg shadow-primary/20
                flex items-center justify-center gap-1.5
              "
            >
              Next
              <span class="material-symbols-outlined text-sm">arrow_forward</span>
            </button>

            <button
              v-else
              type="button"
              @click="handleStepSubmit"
              :disabled="isSubmitting"
              class="
                rounded-xl bg-primary px-5 py-2
                text-[11px] sm:text-[10px]
                font-black uppercase tracking-wide sm:tracking-widest
                text-white transition-all hover:bg-navy-600
                disabled:opacity-50 disabled:cursor-not-allowed
                shadow-lg shadow-primary/20
                flex items-center justify-center gap-1.5
              "
            >
              <span v-if="isSubmitting" class="material-symbols-outlined text-sm animate-spin">
                progress_activity
              </span>
              <span v-else class="material-symbols-outlined text-sm">
                check_circle
              </span>
              {{ isSubmitting ? 'Creating...' : 'Create Event' }}
            </button>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { useCreateEvent, useEvents } from '~/composables/resources/events/events'
import { useEventTypes } from '~/composables/resources/events/eventTypes'
import { useOrganisationControls } from '~/composables/resources/organisation/organisationControls'
import { useAuthStore } from '~/stores/auth'
import TimezoneSelect from '~/components/ui/TimezoneSelect.vue'
import OrganisationSelect from '~/components/ui/OrganisationSelect.vue'
import DateRangePicker from '~/components/ui/DateRangePicker.vue'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const { $notyf } = useNuxtApp()

// Stepper state
const currentStep = ref(0)
const steps = [
  { title: 'Details', icon: 'info' },
  { title: 'Organisation', icon: 'business' },
  { title: 'Schedule', icon: 'event' },
  { title: 'Review', icon: 'check_circle' }
]

// Extended event schema with all fields
const createEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title is too long'),
  short_description: z.string().max(255, 'Description must be 255 characters or less').optional().or(z.literal('')),
  long_description: z.string().optional().or(z.literal('')),
  organisation: z.number({ required_error: 'Please select an organisation' }),
  event_type: z.number({ required_error: 'Please select an event type' }),
  display_code: z.string().min(1, 'Display code is required').max(10, 'Display code must be 10 characters or less'),
  timezone: z.string().min(1, 'Please select a timezone'),
  start_datetime: z.string().min(1, 'Start date and time is required'),
  end_datetime: z.string().min(1, 'End date and time is required'),
  theme: z.string().optional().or(z.literal('')),
  anchor_verse: z.string().optional().or(z.literal('')),
  expected_attendance: z.number().int().positive().nullable().transform(val => val ?? undefined).optional(),
  maximum_attendance: z.number().int().positive().nullable().transform(val => val ?? undefined).optional(),
  what_to_bring: z.string().optional().or(z.literal('')),
  important_information: z.string().optional().or(z.literal('')),
}).refine(data => {
  if (data.start_datetime && data.end_datetime) {
    return new Date(data.start_datetime) < new Date(data.end_datetime)
  }
  return true
}, {
  message: 'End date must be after start date',
  path: ['end_datetime']
})

// Fetch organizations user controls
const { data: controlsData, isLoading: isLoadingOrganizations } = useOrganisationControls(computed(() => ({
  user: authStore.user?.id,
})))

const controlledOrganizations = computed(() => controlsData.value?.data?.results || [])

const organizationOptions = computed(() => {
  return controlledOrganizations.value.map(control => ({
    value: control.organisation,
    label: control.organisation_name || `Organisation ${control.organisation}`
  }))
})

// Fetch event types
const { data: eventTypesData, isLoading: isLoadingEventTypes } = useEventTypes()

const eventTypeOptions = computed(() => {
  return (eventTypesData.value?.data?.results || []).map(type => ({
    value: type.id,
    label: type.title
  }))
})

const route = useRoute()

// Common timezones

// Form setup
const { handleSubmit, errors, defineField, setFieldValue, resetForm } = useForm({
  validationSchema: toTypedSchema(createEventSchema),
  initialValues: {
    title: '',
    short_description: '',
    long_description: '',
    timezone: 'UTC',
    start_datetime: '',
    end_datetime: '',
    theme: '',
    anchor_verse: '',
    what_to_bring: '',
    important_information: '',
    expected_attendance: undefined,
    maximum_attendance: undefined,
    display_code: '',
  },
  validateOnMount: false,
})

// Define fields
const [title] = defineField('title')
const [short_description] = defineField('short_description')
const [long_description] = defineField('long_description')
const [organisation] = defineField('organisation')
const [event_type] = defineField('event_type')
const [display_code] = defineField('display_code')
const [timezone] = defineField('timezone')
const [start_datetime] = defineField('start_datetime')
const [end_datetime] = defineField('end_datetime')
const [theme] = defineField('theme')
const [expected_attendance] = defineField('expected_attendance')
const [maximum_attendance] = defineField('maximum_attendance')

// Set default organization if only one is controlled
watch(organizationOptions, (options) => {
  if (options.length === 1 && !organisation.value) {
    organisation.value = options[0].value
  }
}, { immediate: true })

// Initialize display code
onMounted(() => {
  if (!display_code.value) {
    display_code.value = generateDisplayCode()
  }
})

// --- Title collision check ---
const titleCheckRef = ref('')
let titleCheckTimer: ReturnType<typeof setTimeout> | null = null
watch(title, (val) => {
  if (titleCheckTimer) clearTimeout(titleCheckTimer)
  titleCheckTimer = setTimeout(() => { titleCheckRef.value = val || '' }, 600)
})
const { data: titleCheckData, isFetching: isCheckingTitle } = useEvents(
  computed(() => titleCheckRef.value ? { title: titleCheckRef.value } : undefined)
)
const titleExists = computed(() => (titleCheckData.value?.data?.count || 0) > 0 &&  titleCheckRef.value.length > 0)

// --- Display code collision check ---
const codeCheckRef = ref('')
let codeCheckTimer: ReturnType<typeof setTimeout> | null = null
watch(display_code, (val) => {
  if (codeCheckTimer) clearTimeout(codeCheckTimer)
  codeCheckTimer = setTimeout(() => { codeCheckRef.value = val || '' }, 600)
})
const { data: codeCheckData, isFetching: isCheckingCode } = useEvents(
  computed(() => codeCheckRef.value ? { display_code: codeCheckRef.value } : undefined)
)
const codeExists = computed(() => (codeCheckData.value?.data?.count || 0) > 0 && codeCheckRef.value.length > 0)

// --- DateRangePicker state ---
const startDate = ref('')
const startTime = ref('09:00')
const endDate = ref('')
const endTime = ref('17:00')

// Sync date+time parts → form fields
watch([startDate, startTime], ([date, time]) => {
  start_datetime.value = date ? `${date}T${time}` : ''
})
watch([endDate, endTime], ([date, time]) => {
  end_datetime.value = date ? `${date}T${time}` : ''
})

// Sync form fields → date/time parts (for sdt query param initialisation)
watch(start_datetime, (val) => {
  if (val && val.includes('T')) {
    const [d, t] = val.split('T')
    if (d !== startDate.value) startDate.value = d
    const hhmm = t.slice(0, 5)
    if (hhmm !== startTime.value) startTime.value = hhmm
  }
}, { immediate: true })
watch(end_datetime, (val) => {
  if (val && val.includes('T')) {
    const [d, t] = val.split('T')
    if (d !== endDate.value) endDate.value = d
    const hhmm = t.slice(0, 5)
    if (hhmm !== endTime.value) endTime.value = hhmm
  }
}, { immediate: true })

// Create event mutation
const { mutate: createEvent, isPending: isSubmitting } = useCreateEvent()

// Generate short display code (max 10 chars)
const generateDisplayCode = () => {
  const prefix = 'EVT'
  const randomNum = Math.floor(Math.random() * 999999).toString().padStart(6, '0')
  return `${prefix}${randomNum}`
}

// Step navigation
const nextStep = () => {
  // Validate current step before proceeding
  if (currentStep.value === 0) {
    if (!title.value) {
      $notyf?.error('Please enter an event title')
      return
    }
    if (isCheckingTitle.value) {
      $notyf?.error('Please wait while we check title availability')
      return
    }
    if (titleExists.value) {
      $notyf?.error('An event with this title already exists — please choose a different title')
      return
    }
  } else if (currentStep.value === 1) {
    if (!organisation.value || !event_type.value || !display_code.value) {
      $notyf?.error('Please complete all required fields')
      console.log('Validation errors:', {
        organisation: !organisation.value,
        event_type: !event_type.value,
        display_code: !display_code.value,
      })
      return
    }
    if (isCheckingCode.value) {
      $notyf?.error('Please wait while we check display code availability')
      return
    }
    if (codeExists.value) {
      $notyf?.error('This display code is already in use — please choose a different code')
      return
    }
  } else if (currentStep.value === 2) {
    if (!start_datetime.value || !end_datetime.value || !timezone.value) {
      $notyf?.error('Please complete the schedule details')
      return
    }
    if (new Date(start_datetime.value) >= new Date(end_datetime.value)) {
      $notyf?.error('End date must be after start date')
      return
    }
  }
  
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const handleStepSubmit = () => {
  if (currentStep.value === steps.length - 1) {
    onSubmit()
  }
}

const onSubmit = handleSubmit((formValues) => {
  // Convert datetime-local to ISO format
  const startISO = new Date(formValues.start_datetime).toISOString()
  const endISO = new Date(formValues.end_datetime).toISOString()

  const eventData = {
    title: formValues.title,
    short_description: formValues.short_description || undefined,
    long_description: formValues.long_description || undefined,
    organisation: formValues.organisation,
    event_type: formValues.event_type,
    display_code: formValues.display_code,
    timezone: formValues.timezone,
    start_datetime: startISO,
    end_datetime: endISO,
    theme: formValues.theme || undefined,
    anchor_verse: formValues.anchor_verse || undefined,
    expected_attendance: formValues.expected_attendance || undefined,
    maximum_attendance: formValues.maximum_attendance || undefined,
    what_to_bring: formValues.what_to_bring || undefined,
    important_information: formValues.important_information || undefined,
    status: 'DRAFTING',
  }

  createEvent(eventData as any, {
    onSuccess: (response) => {
      $notyf?.success('Event created successfully!')
      console.log('Created event:', response?.data)
      navigateTo(`/events/${response?.data?.url_safe_title}/m/dashboard`)
    },
    onError: (error: any) => {
      $notyf?.error(error?.message || 'Failed to create event')
    }
  })
})

// set start date if sdt=2026-01-01 is provided in query params
onMounted(() => {
  const sdt = route.query.sdt as string
  if (sdt) {
    const parsedDate = new Date(sdt)
    if (!isNaN(parsedDate.getTime())) {
      start_datetime.value = parsedDate.toISOString().slice(0, 16)
      end_datetime.value = new Date(parsedDate.getTime() + 3600000).toISOString().slice(0, 16) // default to 1 hour later
    }
  }
})

const saveDraft = () => {
  handleSubmit((formValues) => {
    const startISO = formValues.start_datetime ? new Date(formValues.start_datetime).toISOString() : new Date().toISOString()
    const endISO = formValues.end_datetime ? new Date(formValues.end_datetime).toISOString() : new Date(Date.now() + 3600000).toISOString()

    const eventData = {
      title: formValues.title || 'Untitled Event',
      short_description: formValues.short_description || undefined,
      long_description: formValues.long_description || undefined,
      organisation: formValues.organisation,
      event_type: formValues.event_type,
      display_code: formValues.display_code || generateDisplayCode(),
      timezone: formValues.timezone || 'UTC',
      start_datetime: startISO,
      end_datetime: endISO,
      theme: formValues.theme || undefined,
      anchor_verse: formValues.anchor_verse || undefined,
      expected_attendance: formValues.expected_attendance || undefined,
      maximum_attendance: formValues.maximum_attendance || undefined,
      what_to_bring: formValues.what_to_bring || undefined,
      important_information: formValues.important_information || undefined,
      status: 'DRAFTING',
    }

    createEvent(eventData as any, {
      onSuccess: (response) => {
        $notyf?.success('Draft saved successfully!')
        navigateTo(`/events/${response?.data?.url_safe_title}`)
      },
      onError: (error: any) => {
        $notyf?.error(error?.message || 'Failed to save draft')
      }
    })
  })()
}

// Page metadata
useHead({
  title: 'Create Event',
  meta: [
    { name: 'description', content: 'Create a new event for your community' }
  ]
})
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
</style>