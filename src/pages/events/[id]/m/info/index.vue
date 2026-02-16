<template>
  <EventManagementLayout :event-id="id" :event="event">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Main Content (8/12) -->
      <div class="lg:col-span-8 space-y-8">
        <form @submit="onSubmit" class="space-y-8">
          <!-- Basic Details Section -->
          <section class="bg-white dark:bg-navy-900 border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden p-8" :class="{ 'hover:border-blue-500/20 transition-all': !isEditMode }">
            <div class="flex items-center gap-2 mb-8 pb-4 border-b border-navy-50">
              <span class="material-symbols-outlined text-primary">edit_square</span>
              <h2 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest">Basic Details</h2>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Event Title -->
              <div class="space-y-2">
                <label class="block text-xs font-black text-primary uppercase tracking-wider">Event Title <span class="text-red-500">*</span></label>
                <input 
                  v-if="isEditMode"
                  v-model="title" 
                  type="text"
                  placeholder="Enter event title" 
                  class="w-full px-4 py-3 bg-mist-blue border-transparent focus:border-primary focus:ring-0 rounded-xl text-sm font-medium text-navy-900 transition-all"
                  required
                />
                <p v-else class="w-full px-4 py-3 bg-mist-blue/50 rounded-xl text-sm font-medium text-navy-900">{{ title || '-' }}</p>
                <span v-if="errors.title" class="text-xs text-red-500 font-medium">{{ errors.title }}</span>
              </div>

              <!-- Display Code -->
              <div class="space-y-2">
                <label class="block text-xs font-black text-primary uppercase tracking-wider">Display Code <span class="text-red-500">*</span></label>
                <input 
                  v-if="isEditMode"
                  v-model="display_code" 
                  type="text"
                  placeholder="e.g., CONF2026" 
                  class="w-full px-4 py-3 bg-mist-blue border-transparent focus:border-primary focus:ring-0 rounded-xl text-sm font-medium text-navy-900 transition-all"
                  required
                />
                <p v-else class="w-full px-4 py-3 bg-mist-blue/50 rounded-xl text-sm font-medium text-navy-900">{{ display_code || '-' }}</p>
                <span v-if="errors.display_code" class="text-xs text-red-500 font-medium">{{ errors.display_code }}</span>
              </div>

              <!-- Event Status -->
              <div class="space-y-2">
                <label class="block text-xs font-black text-primary uppercase tracking-wider">Event Status <span class="text-red-500">*</span></label>
                <select
                  v-if="isEditMode"
                  v-model="status"
                  class="w-full px-4 py-3 bg-mist-blue border-transparent focus:border-primary focus:ring-0 rounded-xl text-sm font-medium text-navy-900 transition-all appearance-none"
                  required
                >
                  <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
                <p v-else class="w-full px-4 py-3 bg-mist-blue/50 rounded-xl text-sm font-medium text-navy-900">{{ statusOptions.find(o => o.value === status)?.label || '-' }}</p>
                <span v-if="errors.status" class="text-xs text-red-500 font-medium">{{ errors.status }}</span>
              </div>

              <!-- Short Description -->
              <div class="space-y-2">
                <label class="block text-xs font-black text-primary uppercase tracking-wider">Short Description</label>
                <input
                  v-if="isEditMode"
                  v-model="short_description"
                  type="text"
                  maxlength="255"
                  placeholder="Brief description of your event"
                  class="w-full px-4 py-3 bg-mist-blue border-transparent focus:border-primary focus:ring-0 rounded-xl text-sm font-medium text-navy-900 transition-all"
                />
                <p v-else class="w-full px-4 py-3 bg-mist-blue/50 rounded-xl text-sm font-medium text-navy-900">{{ short_description || '-' }}</p>
                <span v-if="errors.short_description" class="text-xs text-red-500 font-medium">{{ errors.short_description }}</span>
              </div>
            </div>
          </section>

          <!-- Description & Theme Section -->
          <section class="bg-white dark:bg-navy-900 border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden p-8" :class="{ 'hover:border-blue-500/20 transition-all': !isEditMode }">
            <div class="flex items-center gap-2 mb-8 pb-4 border-b border-navy-50">
              <span class="material-symbols-outlined text-primary">description</span>
              <h2 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest">Description & Theme</h2>
            </div>
            
            <div class="space-y-6">
              <!-- Long Description -->
              <div class="space-y-2">
                <label class="block text-xs font-black text-primary uppercase tracking-wider">Long Description</label>
                <textarea
                  v-if="isEditMode"
                  v-model="long_description"
                  rows="6"
                  placeholder="Detailed description of your event"
                  class="w-full px-4 py-3 bg-mist-blue border-transparent focus:border-primary focus:ring-0 rounded-xl text-sm text-navy-700 leading-relaxed resize-none"
                ></textarea>
                <p v-else class="w-full px-4 py-3 bg-mist-blue/50 rounded-xl text-sm text-navy-700 leading-relaxed min-h-[120px] whitespace-pre-wrap">{{ long_description || '-' }}</p>
                <span v-if="errors.long_description" class="text-xs text-red-500 font-medium">{{ errors.long_description }}</span>
              </div>

              <!-- Theme -->
              <div class="space-y-2">
                <label class="block text-xs font-black text-primary uppercase tracking-wider">Theme</label>
                <input 
                  v-if="isEditMode"
                  v-model="theme" 
                  type="text"
                  placeholder="Event theme or tagline" 
                  class="w-full px-4 py-3 bg-mist-blue border-transparent focus:border-primary focus:ring-0 rounded-xl text-sm font-medium text-navy-900 transition-all"
                />
                <p v-else class="w-full px-4 py-3 bg-mist-blue/50 rounded-xl text-sm font-medium text-navy-900">{{ theme || '-' }}</p>
                <span v-if="errors.theme" class="text-xs text-red-500 font-medium">{{ errors.theme }}</span>
              </div>

              <!-- Anchor Verse -->
              <div class="space-y-2">
                <label class="block text-xs font-black text-primary uppercase tracking-wider">Anchor Verse</label>
                <input 
                  v-if="isEditMode"
                  v-model="anchor_verse" 
                  type="text"
                  placeholder="Scripture reference or verse" 
                  class="w-full px-4 py-3 bg-mist-blue border-transparent focus:border-primary focus:ring-0 rounded-xl text-sm font-medium text-navy-900 transition-all"
                />
                <p v-else class="w-full px-4 py-3 bg-mist-blue/50 rounded-xl text-sm font-medium text-navy-900">{{ anchor_verse || '-' }}</p>
                <span v-if="errors.anchor_verse" class="text-xs text-red-500 font-medium">{{ errors.anchor_verse }}</span>
              </div>
            </div>
          </section>

          <!-- Event Timing Section -->
          <section class="bg-white dark:bg-navy-900 border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden p-8" :class="{ 'hover:border-blue-500/20 transition-all': !isEditMode }">
            <div class="flex items-center gap-2 mb-8 pb-4 border-b border-navy-50">
              <span class="material-symbols-outlined text-primary">calendar_today</span>
              <h2 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest">Event Timing</h2>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="block text-xs font-black text-primary uppercase tracking-wider">
                  Start Date & Time <span class="text-red-500">*</span>
                </label>
                <input 
                  v-if="isEditMode"
                  v-model="start_datetime" 
                  type="datetime-local" 
                  class="w-full px-4 py-3 bg-mist-blue border-transparent focus:border-primary focus:ring-0 rounded-xl text-sm font-medium text-navy-900 transition-all"
                  required
                />
                <p v-else class="w-full px-4 py-3 bg-mist-blue/50 rounded-xl text-sm font-medium text-navy-900">{{ start_datetime ? new Date(start_datetime).toLocaleString() : '-' }}</p>
                <span v-if="errors.start_datetime" class="text-xs text-red-500 font-medium">{{ errors.start_datetime }}</span>
              </div>

              <div class="space-y-2">
                <label class="block text-xs font-black text-primary uppercase tracking-wider">
                  End Date & Time <span class="text-red-500">*</span>
                </label>
                <input 
                  v-if="isEditMode"
                  v-model="end_datetime" 
                  type="datetime-local" 
                  class="w-full px-4 py-3 bg-mist-blue border-transparent focus:border-primary focus:ring-0 rounded-xl text-sm font-medium text-navy-900 transition-all"
                  required
                />
                <p v-else class="w-full px-4 py-3 bg-mist-blue/50 rounded-xl text-sm font-medium text-navy-900">{{ end_datetime ? new Date(end_datetime).toLocaleString() : '-' }}</p>
                <span v-if="errors.end_datetime" class="text-xs text-red-500 font-medium">{{ errors.end_datetime }}</span>
              </div>

              <div class="space-y-2">
                <label class="block text-xs font-black text-primary uppercase tracking-wider">
                  Timezone <span class="text-red-500">*</span>
                </label>
                <select
                  v-if="isEditMode"
                  v-model="timezone"
                  class="w-full px-4 py-3 bg-mist-blue border-transparent focus:border-primary focus:ring-0 rounded-xl text-sm font-medium text-navy-900 transition-all appearance-none"
                  required
                >
                  <option v-for="tz in timezoneOptions" :key="tz" :value="tz">
                    {{ tz }}
                  </option>
                </select>
                <p v-else class="w-full px-4 py-3 bg-mist-blue/50 rounded-xl text-sm font-medium text-navy-900">{{ timezone || '-' }}</p>
                <span v-if="errors.timezone" class="text-xs text-red-500 font-medium">{{ errors.timezone }}</span>
              </div>
            </div>
          </section>

          <!-- Capacity & Attendance Section -->
          <section class="bg-white dark:bg-navy-900 border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden p-8" :class="{ 'hover:border-blue-500/20 transition-all': !isEditMode }">
            <div class="flex items-center gap-2 mb-8 pb-4 border-b border-navy-50">
              <span class="material-symbols-outlined text-primary">group</span>
              <h2 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest">Capacity & Attendance</h2>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="block text-xs font-black text-primary uppercase tracking-wider">
                  Expected Attendance
                </label>
                <input 
                  :disabled="!isEditMode"

                  v-model="expected_attendance"
                  type="number" 
                  min="0" 
                  placeholder="0" 
                  class="w-full px-4 py-3 bg-mist-blue border-transparent focus:border-primary focus:ring-0 rounded-xl text-sm font-medium text-navy-900 transition-all"
                />
                <span v-if="errors.expected_attendance" class="text-xs text-red-500 font-medium">{{ errors.expected_attendance }}</span>
              </div>

              <div class="space-y-2">
                <label class="block text-xs font-black text-primary uppercase tracking-wider">
                  Maximum Attendance
                </label>
                <input 
                  :disabled="!isEditMode"
                  v-model="maximum_attendance"
                  type="number" 
                  min="0" 
                  placeholder="0" 
                  class="w-full px-4 py-3 bg-mist-blue border-transparent focus:border-primary focus:ring-0 rounded-xl text-sm font-medium text-navy-900 transition-all"
                />
                <span v-if="errors.maximum_attendance" class="text-xs text-red-500 font-medium">{{ errors.maximum_attendance }}</span>
              </div>
            </div>
          </section>

          <!-- Additional Information Section -->
          <section class="bg-white dark:bg-navy-900 border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden p-8" :class="{ 'hover:border-blue-500/20 transition-all': !isEditMode }">
            <div class="flex items-center gap-2 mb-8 pb-4 border-b border-navy-50">
              <span class="material-symbols-outlined text-primary">info</span>
              <h2 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest">Additional Information</h2>
            </div>
            
            <div class="space-y-6">
              <div class="space-y-2">
                <label class="block text-xs font-black text-primary uppercase tracking-wider">
                  What to Bring
                </label>
                <textarea 
                  v-if="isEditMode"
                  v-model="what_to_bring" 
                  placeholder="List items participants should bring" 
                  rows="4" 
                  class="w-full px-4 py-3 bg-mist-blue border-transparent focus:border-primary focus:ring-0 rounded-xl text-sm text-navy-700 leading-relaxed resize-none"
                ></textarea>
                <p v-else class="w-full px-4 py-3 bg-mist-blue/50 rounded-xl text-sm text-navy-700 leading-relaxed min-h-[80px] whitespace-pre-wrap">{{ what_to_bring || '-' }}</p>
              </div>

              <div class="space-y-2">
                <label class="block text-xs font-black text-primary uppercase tracking-wider">
                  Important Information
                </label>
                <textarea 
                  v-if="isEditMode"
                  v-model="important_information" 
                  placeholder="Critical information for participants" 
                  rows="4" 
                  class="w-full px-4 py-3 bg-mist-blue border-transparent focus:border-primary focus:ring-0 rounded-xl text-sm text-navy-700 leading-relaxed resize-none"
                ></textarea>
                <p v-else class="w-full px-4 py-3 bg-mist-blue/50 rounded-xl text-sm text-navy-700 leading-relaxed min-h-[80px] whitespace-pre-wrap">{{ important_information || '-' }}</p>
              </div>
            </div>
          </section>

          <!-- Spacing for floating bar -->
          <div class="h-24"></div>
        </form>
      </div>

      <!-- Sidebar (4/12) -->
      <div class="lg:col-span-4 space-y-8">
        <!-- Quick Info -->
        <section class="bg-white dark:bg-navy-900 border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="bg-primary px-6 py-4">
            <h2 class="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
              <span class="material-symbols-outlined text-base">info</span>
              Quick Info
            </h2>
          </div>
          <div class="p-6 space-y-6">
            <div class="space-y-1">
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Event ID</p>
              <p class="text-[11px] font-bold text-primary break-all bg-mist-blue p-2 rounded-lg border border-navy-100/50">
                {{ event?.event_id || '-' }}
              </p>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Created</p>
                <p class="text-xs font-bold text-primary">
                  {{ event?.created_at ? formatCompactDateTime(event.created_at) : '-' }}
                </p>
              </div>
              <div class="space-y-1 text-right">
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Updated</p>
                <p class="text-xs font-bold text-primary">
                  {{ event?.updated_at ? formatCompactDateTime(event.updated_at) : '-' }}
                </p>
              </div>
            </div>
            <div class="pt-4 border-t border-navy-50">
              <div class="flex justify-between items-center">
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Registrations</p>
                <span class="bg-navy-500 text-white px-3 py-1 rounded text-[11px] font-black">
                  {{ event?.number_of_attendees || 0 }}
                </span>
              </div>
            </div>
          </div>
        </section>

        <!-- Editor Tips -->
        <section class="bg-white dark:bg-navy-900 border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="px-6 py-4 border-b border-navy-50 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-xl">lightbulb</span>
            <h2 class="text-[11px] font-black text-primary uppercase tracking-widest">Editor Tips</h2>
          </div>
          <div class="p-6">
            <ul class="space-y-4">
              <li class="flex gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></span>
                <p class="text-xs text-navy-600 font-medium">Keep your title clear and descriptive for public listings.</p>
              </li>
              <li class="flex gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></span>
                <p class="text-xs text-navy-600 font-medium">Set realistic attendance expectations in your description.</p>
              </li>
              <li class="flex gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></span>
                <p class="text-xs text-navy-600 font-medium">Update event status as your planning progresses.</p>
              </li>
              <li class="flex gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></span>
                <p class="text-xs text-navy-600 font-medium">Add important registration information early in the text.</p>
              </li>
            </ul>
          </div>
        </section>

        <!-- Preview Actions -->
        <div class="bg-mist-blue rounded-2xl p-6 border border-dashed border-navy-200">
          <p class="text-[10px] font-black text-navy-400 uppercase tracking-[0.2em] mb-4 text-center">
            Preview Changes
          </p>
          <div class="flex flex-col gap-3">
            <a
              :href="`/events/${id}`"
              class="w-full py-3 bg-white border border-primary text-primary text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all text-center"
            >
              View Public Page
            </a>
            <a
              :href="`/events/${id}/preview`"
              class="w-full py-3 bg-white border border-primary text-primary text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all text-center"
            >
              Admin Preview
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating Action Bar -->
    <div class="fixed bottom-0 left-64 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-deep-navy/10 shadow-2xl">
      <div class="max-w-screen-xl mx-auto px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-primary text-xl">info</span>
            <div>
              <p class="text-xs font-black text-primary uppercase tracking-widest">{{ isEditMode ? 'Edit Mode' : 'Preview Mode' }}</p>
              <p class="text-[10px] text-deep-navy/60 font-medium">{{ isEditMode ? 'Make changes to event information' : 'Viewing event details' }}</p>
            </div>
          </div>
          
          <div class="flex items-center gap-3">
            <button
              v-if="isEditMode"
              type="button"
              @click="cancelEdit"
              :disabled="isSubmitting"
              class="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all text-sm font-bold uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              v-if="!isEditMode"
              type="button"
              @click="isEditMode = true"
              class="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-navy-600 transition-all text-sm font-bold uppercase tracking-wide shadow-lg shadow-primary/20"
            >
              <span class="material-symbols-outlined text-lg">edit</span>
              Edit Event
            </button>
            <button
              v-if="isEditMode"
              type="button"
              @click="saveChanges"
              :disabled="isSubmitting"
              class="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-navy-600 transition-all text-sm font-bold uppercase tracking-wide shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span class="material-symbols-outlined text-lg" v-if="!isSubmitting">save</span>
              <span class="material-symbols-outlined text-lg animate-spin" v-else>progress_activity</span>
              {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </EventManagementLayout>
</template>

<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { useEvent, useUpdateEvent } from '~/composables/resources/events/events'
import { formatCompactDateTime } from '~/utils/time'
import EventManagementLayout from '~/components/events/EventManagementLayout.vue'

definePageMeta({
  layout: false,
  middleware: 'auth',
})
const route = useRoute()
const id = computed(() => route.params.id as string)

// Edit mode state
const isEditMode = ref(false)

// Fetch event data
const { data: eventData } = useEvent(id)
const event = computed(() => eventData.value?.data)

// Form schema
const eventInfoSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  display_code: z.string().min(1, 'Display code is required'),
  status: z.enum(['DRAFTING', 'PUBLISHED', 'OPEN', 'CLOSED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED', 'ARCHIVED', 'DELETED']),
  short_description: z.string().max(255).optional(),
  long_description: z.string().optional(),
  start_datetime: z.string().min(1, 'Start date is required'),
  end_datetime: z.string().min(1, 'End date is required'),
  expected_attendance: z.number().int().positive().optional().nullable(),
  maximum_attendance: z.number().int().positive().optional().nullable(),
  timezone: z.string().min(1, 'Timezone is required'),
  theme: z.string().optional(),
  anchor_verse: z.string().optional(),
  what_to_bring: z.string().optional(),
  important_information: z.string().optional(),
})

const { handleSubmit, errors, defineField, resetForm: resetFormValues, setValues } = useForm({
  validationSchema: toTypedSchema(eventInfoSchema),
})

const [title] = defineField('title')
const [display_code] = defineField('display_code')
const [status] = defineField('status')
const [short_description] = defineField('short_description')
const [long_description] = defineField('long_description')
const [start_datetime] = defineField('start_datetime')
const [end_datetime] = defineField('end_datetime')
const [expected_attendance] = defineField('expected_attendance')
const [maximum_attendance] = defineField('maximum_attendance')
const [timezone] = defineField('timezone')
const [theme] = defineField('theme')
const [anchor_verse] = defineField('anchor_verse')
const [what_to_bring] = defineField('what_to_bring')
const [important_information] = defineField('important_information')

// Status options
const statusOptions = [
  { value: 'DRAFTING', label: 'Drafting' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'OPEN', label: 'Open for Registration' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'POSTPONED', label: 'Postponed' },
  { value: 'ARCHIVED', label: 'Archived' },
]

// Common timezones
const timezoneOptions = [
  'UTC',
  'Europe/London',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Africa/Lagos',
  'Africa/Accra',
  'Africa/Nairobi',
]

// Initialize form with event data
watch(event, (newEvent) => {
  if (newEvent) {
    setValues({
      title: newEvent.title,
      display_code: newEvent.display_code,
      status: newEvent.status || 'DRAFTING',
      short_description: newEvent.short_description || '',
      long_description: newEvent.long_description || '',
      start_datetime: newEvent.start_datetime ? new Date(newEvent.start_datetime).toISOString().slice(0, 16) : '',
      end_datetime: newEvent.end_datetime ? new Date(newEvent.end_datetime).toISOString().slice(0, 16) : '',
      expected_attendance: newEvent.expected_attendance,
      maximum_attendance: newEvent.maximum_attendance,
      timezone: newEvent.timezone || 'UTC',
      theme: newEvent.theme || '',
      anchor_verse: newEvent.anchor_verse || '',
      what_to_bring: newEvent.what_to_bring || '',
      important_information: newEvent.important_information || '',
    })
  }
}, { immediate: true })

const updateMutation = useUpdateEvent()

const saveChanges = async () => {
  const values = {
    title: title.value || '',
    display_code: display_code.value || '',
    status: status.value || 'DRAFTING',
    short_description: short_description.value || '',
    long_description: long_description.value || '',
    start_datetime: start_datetime.value || '',
    end_datetime: end_datetime.value || '',
    expected_attendance: expected_attendance.value ?? null,
    maximum_attendance: maximum_attendance.value ?? null,
    timezone: timezone.value || 'UTC',
    theme: theme.value || '',
    anchor_verse: anchor_verse.value || '',
    what_to_bring: what_to_bring.value || '',
    important_information: important_information.value || '',
  }

  try {
    await updateMutation.mutateAsync({
      eventId: id.value,
      body: {
        ...values,
        start_datetime: values.start_datetime ? new Date(values.start_datetime).toISOString() : new Date().toISOString(),
        end_datetime: values.end_datetime ? new Date(values.end_datetime).toISOString() : new Date().toISOString(),
      },
    })
    
    // Show success notification
    const toast = useToast()
    toast.add({
      title: 'Success',
      description: 'Event information updated successfully',
      color: 'green',
    })
    
    // Exit edit mode
    isEditMode.value = false
  } catch (error: any) {
    const toast = useToast()
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to update event information',
      color: 'red',
    })
  }
}

const onSubmit = handleSubmit(async (values) => {
  try {
    await updateMutation.mutateAsync({
      eventId: id.value,
      body: {
        ...values,
        start_datetime: new Date(values.start_datetime).toISOString(),
        end_datetime: new Date(values.end_datetime).toISOString(),
      },
    })
    
    // Show success notification
    const toast = useToast()
    toast.add({
      title: 'Success',
      description: 'Event information updated successfully',
      color: 'green',
    })
  } catch (error: any) {
    const toast = useToast()
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to update event information',
      color: 'red',
    })
  }
})

const cancelEdit = () => {
  if (event.value) {
    setValues({
      title: event.value.title,
      display_code: event.value.display_code,
      status: event.value.status || 'DRAFTING',
      short_description: event.value.short_description || '',
      long_description: event.value.long_description || '',
      start_datetime: event.value.start_datetime ? new Date(event.value.start_datetime).toISOString().slice(0, 16) : '',
      end_datetime: event.value.end_datetime ? new Date(event.value.end_datetime).toISOString().slice(0, 16) : '',
      expected_attendance: event.value.expected_attendance,
      maximum_attendance: event.value.maximum_attendance,
      timezone: event.value.timezone || 'UTC',
      theme: event.value.theme || '',
      anchor_verse: event.value.anchor_verse || '',
      what_to_bring: event.value.what_to_bring || '',
      important_information: event.value.important_information || '',
    })
  }
  isEditMode.value = false
}

const resetForm = () => {
  if (event.value) {
    setValues({
      title: event.value.title,
      display_code: event.value.display_code,
      status: event.value.status || 'DRAFTING',
      short_description: event.value.short_description || '',
      long_description: event.value.long_description || '',
      start_datetime: event.value.start_datetime ? new Date(event.value.start_datetime).toISOString().slice(0, 16) : '',
      end_datetime: event.value.end_datetime ? new Date(event.value.end_datetime).toISOString().slice(0, 16) : '',
      expected_attendance: event.value.expected_attendance,
      maximum_attendance: event.value.maximum_attendance,
      timezone: event.value.timezone || 'UTC',
      theme: event.value.theme || '',
      anchor_verse: event.value.anchor_verse || '',
      what_to_bring: event.value.what_to_bring || '',
      important_information: event.value.important_information || '',
    })
  }
}

const isSubmitting = computed(() => updateMutation.isPending.value)
</script>
