<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-6">
        <UButton 
          to="/my-dashboard" 
          icon="i-heroicons-arrow-left" 
          variant="ghost" 
          size="sm"
          class="mb-4 hover:bg-white/50"
        >
          Back
        </UButton>
        
        <h1 class="text-3xl font-black text-gray-900 mb-1">Create Event</h1>
        <p class="text-gray-600">Fill in the required details to get started</p>
      </div>

      <!-- Form Card -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200/80 overflow-hidden">
        <form @submit="onSubmit">
          <div class="p-6 sm:p-8 space-y-6">
            <!-- Event Title -->
            <UFormGroup label="Event Title" name="title" required class="space-y-2">
              <UInput
                v-model="title"
                size="lg"
                placeholder="e.g., Annual Youth Conference 2026"
                class="focus:ring-2 focus:ring-primary/20"
              />
              <span v-if="errors.title" class="text-sm text-red-500">{{ errors.title }}</span>
            </UFormGroup>

            <!-- Description -->
            <UFormGroup label="Description" name="short_description" hint="Brief summary of your event" class="space-y-2">
              <UTextarea
                v-model="short_description"
                placeholder="What's this event about?"
                :rows="3"
                :maxlength="255"
                class="focus:ring-2 focus:ring-primary/20"
              />
              <div class="flex justify-between items-center">
                <span v-if="errors.short_description" class="text-sm text-red-500">{{ errors.short_description }}</span>
                <span class="text-xs text-gray-400 ml-auto">{{ short_description?.length || 0 }}/255</span>
              </div>
            </UFormGroup>

            <!-- Organization -->
            <UFormGroup label="Host Organization" name="organisation" required class="space-y-2">
              <USelectMenu
                v-model="organisation"
                :options="organizationOptions"
                placeholder="Select organization"
                value-attribute="value"
                option-attribute="label"
                size="lg"
                :disabled="isLoadingOrganizations"
                class="focus:ring-2 focus:ring-primary/20"
              >
                <template #leading>
                  <UIcon name="i-heroicons-building-office-2" class="text-gray-400" />
                </template>
              </USelectMenu>
              <span v-if="errors.organisation" class="text-sm text-red-500">{{ errors.organisation }}</span>
            </UFormGroup>

            <!-- Event Type and Display Code Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <UFormGroup label="Event Type" name="event_type" required class="space-y-2">
                <USelectMenu
                  v-model="event_type"
                  :options="eventTypeOptions"
                  placeholder="Select type"
                  value-attribute="value"
                  option-attribute="label"
                  size="lg"
                  :disabled="isLoadingEventTypes"
                  class="focus:ring-2 focus:ring-primary/20"
                >
                  <template #leading>
                    <UIcon name="i-heroicons-tag" class="text-gray-400" />
                  </template>
                </USelectMenu>
                <span v-if="errors.event_type" class="text-sm text-red-500">{{ errors.event_type }}</span>
              </UFormGroup>

              <UFormGroup label="Display Code" name="display_code" required hint="Max 10 characters" class="space-y-2">
                <UInput
                  v-model="display_code"
                  size="lg"
                  placeholder="EVT123456"
                  maxlength="10"
                  class="focus:ring-2 focus:ring-primary/20"
                >
                  <template #trailing>
                    <UButton
                      variant="ghost"
                      size="2xs"
                      icon="i-heroicons-arrow-path"
                      @click="display_code = generateDisplayCode()"
                      title="Generate new code"
                    />
                  </template>
                </UInput>
                <span v-if="errors.display_code" class="text-sm text-red-500">{{ errors.display_code }}</span>
              </UFormGroup>
            </div>

            <!-- Date & Time Grid -->
            <div class="space-y-4">
              <h3 class="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <UIcon name="i-heroicons-calendar" class="text-primary" />
                Event Schedule
              </h3>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <UFormGroup label="Start" name="start_datetime" required class="space-y-2">
                  <UInput
                    v-model="start_datetime"
                    type="datetime-local"
                    size="lg"
                    class="focus:ring-2 focus:ring-primary/20"
                  />
                  <span v-if="errors.start_datetime" class="text-xs text-red-500">{{ errors.start_datetime }}</span>
                </UFormGroup>

                <UFormGroup label="End" name="end_datetime" required class="space-y-2">
                  <UInput
                    v-model="end_datetime"
                    type="datetime-local"
                    size="lg"
                    class="focus:ring-2 focus:ring-primary/20"
                  />
                  <span v-if="errors.end_datetime" class="text-xs text-red-500">{{ errors.end_datetime }}</span>
                </UFormGroup>
              </div>

              <UFormGroup label="Timezone" name="timezone" required class="space-y-2">
                <USelectMenu
                  v-model="timezone"
                  :options="timezoneOptions"
                  placeholder="Select timezone"
                  searchable
                  size="lg"
                  class="focus:ring-2 focus:ring-primary/20"
                >
                  <template #leading>
                    <UIcon name="i-heroicons-globe-alt" class="text-gray-400" />
                  </template>
                </USelectMenu>
                <span v-if="errors.timezone" class="text-sm text-red-500">{{ errors.timezone }}</span>
              </UFormGroup>
            </div>

            <!-- Optional: Maximum Capacity -->
            <UFormGroup 
              label="Maximum Capacity" 
              name="maximum_attendance" 
              hint="Optional - leave empty for unlimited"
              class="space-y-2"
            >
              <UInput
                :model-value="maximum_attendance ?? ''"
                @update:model-value="maximum_attendance = $event ? Number($event) : undefined"
                type="number"
                placeholder="e.g., 150"
                size="lg"
                class="focus:ring-2 focus:ring-primary/20"
              >
                <template #leading>
                  <UIcon name="i-heroicons-user-group" class="text-gray-400" />
                </template>
              </UInput>
              <span v-if="errors.maximum_attendance" class="text-sm text-red-500">{{ errors.maximum_attendance }}</span>
            </UFormGroup>

            <!-- Expandable Additional Details -->
            <UAccordion 
              :items="[{ label: 'Additional Details (Optional)', slot: 'additional' }]"
              :ui="{ wrapper: 'space-y-3', item: { base: 'border border-gray-200 rounded-lg' } }"
            >
              <template #additional>
                <div class="space-y-4 p-4 bg-gray-50/50">
                  <UFormGroup label="Event Theme" name="theme" class="space-y-2">
                    <UInput
                      v-model="theme"
                      placeholder="e.g., Unity in Faith"
                    />
                  </UFormGroup>

                  <UFormGroup label="Full Description" name="long_description" class="space-y-2">
                    <UTextarea
                      v-model="long_description"
                      placeholder="Detailed information about the event..."
                      :rows="5"
                    />
                  </UFormGroup>

                  <UFormGroup label="Expected Attendance" name="expected_attendance" class="space-y-2">
                    <UInput
                      :model-value="expected_attendance ?? ''"
                      @update:model-value="expected_attendance = $event ? Number($event) : undefined"
                      type="number"
                      placeholder="e.g., 100"
                    />
                  </UFormGroup>
                </div>
              </template>
            </UAccordion>
          </div>

          <!-- Form Actions - Sticky Footer -->
          <div class="bg-gray-50/80 backdrop-blur-sm border-t border-gray-200 px-6 py-4 sm:px-8 flex items-center justify-between sticky bottom-0">
            <UButton
              type="button"
              variant="ghost"
              color="gray"
              @click="navigateTo('/my-dashboard')"
            >
              Cancel
            </UButton>
            
            <div class="flex gap-2">
              <UButton
                type="submit"
                variant="soft"
                color="gray"
                :loading="isSubmitting"
                :disabled="isSubmitting"
                @click.prevent="saveDraft"
              >
                <UIcon name="i-heroicons-document" class="mr-1" />
                Save Draft
              </UButton>
              <UButton
                type="submit"
                color="primary"
                :loading="isSubmitting"
                :disabled="isSubmitting"
                class="shadow-sm"
              >
                <UIcon name="i-heroicons-check-circle" class="mr-1" />
                Create Event
              </UButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { useCreateEvent } from '~/composables/resources/events/events'
import { useEventTypes } from '~/composables/resources/events/eventTypes'
import { useOrganisationControls } from '~/composables/resources/organisation/organisationControls'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const { $notyf } = useNuxtApp()

// Extended event schema with all fields
const createEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title is too long'),
  short_description: z.string().max(255, 'Description must be 255 characters or less').optional().or(z.literal('')),
  long_description: z.string().optional().or(z.literal('')),
  organisation: z.number({ required_error: 'Please select an organization' }),
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
    label: control.organisation_name || `Organization ${control.organisation}`
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

// Common timezones
const timezoneOptions = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'America/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Rome',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Asia/Singapore',
  'Australia/Sydney',
  'Pacific/Auckland',
]

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

// Create event mutation
const { mutate: createEvent, isPending: isSubmitting } = useCreateEvent()

// Generate short display code (max 10 chars)
const generateDisplayCode = () => {
  const prefix = 'EVT'
  const randomNum = Math.floor(Math.random() * 999999).toString().padStart(6, '0')
  return `${prefix}${randomNum}`
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
    status: 'PUBLISHED',
  }

  createEvent(eventData as any, {
    onSuccess: (response) => {
      $notyf?.success('Event created successfully!')
      navigateTo(`/events/${response?.data?.event_id}`)
    },
    onError: (error: any) => {
      $notyf?.error(error?.message || 'Failed to create event')
    }
  })
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
        navigateTo(`/events/${response?.data?.event_id}`)
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