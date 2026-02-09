<template>
  <EventManagementLayout :event-id="id" :event="event">
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Main Content (3/4) -->
      <div class="lg:col-span-3">
        <div class="bg-navy-accent/60 border border-primary/30">
          <!-- Header -->
          <div class="px-6 py-4 border-b border-primary/20">
            <h2 class="text-lg font-semibold text-white">Event Information</h2>
            <p class="text-sm text-white/70 mt-1">
              Update your event details and information
            </p>
          </div>

          <!-- Form -->
          <form @submit="onSubmit" class="p-6 space-y-6">
            <!-- Basic Information -->
            <div class="space-y-4">
              <h3 class="text-sm font-semibold text-white">Basic Information</h3>
              
              <UFormGroup label="Event Title" name="title" required class="form-group-dark">
                <UInput 
                  v-model="title" 
                  placeholder="Enter event title" 
                  size="lg" 
                  class="input-dark"
                  :ui="{ base: 'bg-background-dark/80 border-primary/30 text-white placeholder-white/50 focus:border-primary/60' }"
                />
                <span v-if="errors.title" class="text-xs text-red-400">{{ errors.title }}</span>
              </UFormGroup>

              <UFormGroup label="Display Code" name="display_code" required class="form-group-dark">
                <UInput 
                  v-model="display_code" 
                  placeholder="e.g., CONF2026" 
                  :ui="{ base: 'bg-background-dark/80 border-primary/30 text-white placeholder-white/50 focus:border-primary/60' }"
                />
                <span v-if="errors.display_code" class="text-xs text-red-400">{{ errors.display_code }}</span>
              </UFormGroup>

              <UFormGroup label="Event Status" name="status" required class="form-group-dark">
                <USelectMenu
                  v-model="status"
                  :options="statusOptions"
                  value-attribute="value"
                  option-attribute="label"
                  class="w-full"
                  :ui="{
                    width: 'w-full',
                    base: 'w-full',
                    trigger: 'bg-background-dark/80 border-primary/30 text-white hover:border-primary/60 w-full',
                    label: 'text-white',
                    // leading: 'text-white',
                    // trailing: 'text-white',
                    placeholder: 'text-white/50'
                  }"
                  :ui-menu="{ 
                    background: 'bg-navy-accent', 
                    ring: 'ring-primary/30',
                    option: { 
                      base: 'text-white',
                      active: 'bg-primary/20 text-white',
                      selected: 'bg-primary/30 text-white',
                      // selectedIcon: 'text-primary'
                    }
                  }"
                />
                <span v-if="errors.status" class="text-xs text-red-400">{{ errors.status }}</span>
              </UFormGroup>

              <UFormGroup label="Short Description" name="short_description" class="form-group-dark">
                <UTextarea
                  v-model="short_description"
                  placeholder="Brief description of your event"
                  :rows="3"
                  :maxlength="255"
                  :ui="{ base: 'bg-background-dark/80 border-primary/30 text-white placeholder-white/50 focus:border-primary/60' }"
                />
                <span v-if="errors.short_description" class="text-xs text-red-400">{{ errors.short_description }}</span>
              </UFormGroup>

              <UFormGroup label="Long Description" name="long_description" class="form-group-dark">
                <UTextarea
                  v-model="long_description"
                  placeholder="Detailed description of your event"
                  :rows="6"
                  :ui="{ base: 'bg-background-dark/80 border-primary/30 text-white placeholder-white/50 focus:border-primary/60' }"
                />
                <span v-if="errors.long_description" class="text-xs text-red-400">{{ errors.long_description }}</span>
              </UFormGroup>
            </div>

            <!-- Event Details -->
            <div class="space-y-4 pt-6 border-t border-primary/20">
              <h3 class="text-sm font-semibold text-white">Event Details</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UFormGroup label="Start Date & Time" name="start_datetime" required class="form-group-dark">
                  <UInput 
                    v-model="start_datetime" 
                    type="datetime-local" 
                    :ui="{ base: 'bg-background-dark/80 border-primary/30 text-white placeholder-white/50 focus:border-primary/60' }"
                  />
                  <span v-if="errors.start_datetime" class="text-xs text-red-400">{{ errors.start_datetime }}</span>
                </UFormGroup>

                <UFormGroup label="End Date & Time" name="end_datetime" required class="form-group-dark">
                  <UInput 
                    v-model="end_datetime" 
                    type="datetime-local" 
                    :ui="{ base: 'bg-background-dark/80 border-primary/30 text-white placeholder-white/50 focus:border-primary/60' }"
                  />
                  <span v-if="errors.end_datetime" class="text-xs text-red-400">{{ errors.end_datetime }}</span>
                </UFormGroup>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UFormGroup label="Expected Attendance" name="expected_attendance" class="form-group-dark">
                  <UInput 
                    :model-value="expected_attendance ?? ''"
                    @update:model-value="expected_attendance = $event ? Number($event) : undefined"
                    type="number" 
                    min="0" 
                    placeholder="0" 
                    :ui="{ base: 'bg-background-dark/80 border-primary/30 text-white placeholder-white/50 focus:border-primary/60' }"
                  />
                  <span v-if="errors.expected_attendance" class="text-xs text-red-400">{{ errors.expected_attendance }}</span>
                </UFormGroup>

                <UFormGroup label="Maximum Attendance" name="maximum_attendance" class="form-group-dark">
                  <UInput 
                    :model-value="maximum_attendance ?? ''"
                    @update:model-value="maximum_attendance = $event ? Number($event) : undefined"
                    type="number" 
                    min="0" 
                    placeholder="0" 
                    :ui="{ base: 'bg-background-dark/80 border-primary/30 text-white placeholder-white/50 focus:border-primary/60' }"
                  />
                  <span v-if="errors.maximum_attendance" class="text-xs text-red-400">{{ errors.maximum_attendance }}</span>
                </UFormGroup>
              </div>

              <UFormGroup label="Timezone" name="timezone" required class="form-group-dark">
                <USelectMenu
                  v-model="timezone"
                  :options="timezoneOptions"
                  searchable
                  placeholder="Select timezone"
                  class="w-full"
                  :ui="{
                    width: 'w-full',
                    base: 'w-full',
                    trigger: 'bg-background-dark/80 border-primary/30 text-white hover:border-primary/60 w-full',
                    label: 'text-white',
                    // leading: 'text-white',
                    // trailing: 'text-white',
                    placeholder: 'text-white/50'
                  }"
                  :ui-menu="{ 
                    background: 'bg-navy-accent', 
                    ring: 'ring-primary/30',
                    option: { 
                      base: 'text-white',
                      active: 'bg-primary/20 text-white',
                      selected: 'bg-primary/30 text-white',
                      // selectedIcon: 'text-primary'
                    }
                  }"
                />
                <span v-if="errors.timezone" class="text-xs text-red-400">{{ errors.timezone }}</span>
              </UFormGroup>
            </div>

            <!-- Additional Information -->
            <div class="space-y-4 pt-6 border-t border-primary/20">
              <h3 class="text-sm font-semibold text-white">Additional Information</h3>
              
              <UFormGroup label="Theme" name="theme" class="form-group-dark">
                <UInput 
                  v-model="theme" 
                  placeholder="Event theme" 
                  :ui="{ base: 'bg-background-dark/80 border-primary/30 text-white placeholder-white/50 focus:border-primary/60' }"
                />
              </UFormGroup>

              <UFormGroup label="Anchor Verse" name="anchor_verse" class="form-group-dark">
                <UTextarea 
                  v-model="anchor_verse" 
                  placeholder="Scripture reference or verse" 
                  :rows="2" 
                  :ui="{ base: 'bg-background-dark/80 border-primary/30 text-white placeholder-white/50 focus:border-primary/60' }"
                />
              </UFormGroup>

              <UFormGroup label="What to Bring" name="what_to_bring" class="form-group-dark">
                <UTextarea 
                  v-model="what_to_bring" 
                  placeholder="List items participants should bring" 
                  :rows="4" 
                  :ui="{ base: 'bg-background-dark/80 border-primary/30 text-white placeholder-white/50 focus:border-primary/60' }"
                />
              </UFormGroup>

              <UFormGroup label="Important Information" name="important_information" class="form-group-dark">
                <UTextarea 
                  v-model="important_information" 
                  placeholder="Critical information for participants" 
                  :rows="4" 
                  :ui="{ base: 'bg-background-dark/80 border-primary/30 text-white placeholder-white/50 focus:border-primary/60' }"
                />
              </UFormGroup>
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-end gap-3 pt-6 border-t border-primary/20">
              <UButton
                type="button"
                @click="resetForm"
                :disabled="isSubmitting"
                :ui="{ base: 'bg-navy-accent border border-primary/40 text-white hover:bg-navy-accent/80 hover:border-primary/60' }"
              >
                Reset
              </UButton>
              <UButton
                type="submit"
                :loading="isSubmitting"
                :disabled="isSubmitting"
                :ui="{ base: 'bg-primary text-background-dark hover:bg-primary/90 font-bold' }"
              >
                Save Changes
              </UButton>
            </div>
          </form>
        </div>
      </div>

      <!-- Sidebar (1/4) -->
      <div class="lg:col-span-1 space-y-6">
        <!-- Quick Info -->
        <div class="bg-navy-accent/60 border border-primary/30 p-6">
          <h3 class="text-sm font-semibold text-white mb-4">Quick Info</h3>
          <div class="space-y-3 text-sm">
            <div>
              <p class="text-white/60">Event ID</p>
              <p class="font-medium text-primary font-mono">{{ event?.event_id || '-' }}</p>
            </div>
            <div>
              <p class="text-white/60">Created</p>
              <p class="font-medium text-white">{{ event?.created_at ? formatCompactDateTime(event.created_at) : '-' }}</p>
            </div>
            <div>
              <p class="text-white/60">Last Updated</p>
              <p class="font-medium text-white">{{ event?.updated_at ? formatCompactDateTime(event.updated_at) : '-' }}</p>
            </div>
            <div>
              <p class="text-white/60">Current Registrations</p>
              <p class="font-medium text-white">{{ event?.number_of_attendees || 0 }}</p>
            </div>
          </div>
        </div>

        <!-- Tips -->
        <div class="bg-primary/10 border border-primary/30 p-6">
          <div class="flex items-start gap-2">
            <UIcon name="i-heroicons-light-bulb" class="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 class="text-sm font-semibold text-primary mb-2">Tips</h3>
              <ul class="text-xs text-white/80 space-y-1.5">
                <li>• Keep your title clear and descriptive</li>
                <li>• Set realistic attendance expectations</li>
                <li>• Update status as your event progresses</li>
                <li>• Add important information early</li>
              </ul>
            </div>
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
