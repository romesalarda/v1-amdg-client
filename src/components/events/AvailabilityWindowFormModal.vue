<template>
  <!-- Modal Overlay -->
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="closeModal">
    <!-- Modal Container -->
    <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden max-w-xl w-full max-h-[90vh] flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-3 border-b border-navy-50 bg-white">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-lg">{{ window ? 'edit_calendar' : 'add_circle' }}</span>
          <div>
            <h3 class="text-xs font-black text-primary dark:text-white uppercase tracking-widest leading-tight">
              {{ window ? 'Edit Window' : 'Create Window' }}
            </h3>
            <p class="text-[10px] text-navy-500 mt-0.5">
              {{ window ? 'Update settings' : 'Define availability period' }}
            </p>
          </div>
        </div>
        <button
          @click="closeModal"
          :disabled="isSubmitting"
          class="text-navy-400 hover:text-navy-600 transition-colors disabled:opacity-50"
        >
          <span class="material-symbols-outlined text-xl">close</span>
        </button>
      </div>

      <!-- Form Content - Scrollable -->
      <div class="flex-1 overflow-y-auto">
        <form @submit.prevent="onSubmit" class="p-6 space-y-5">
        <!-- Basic Information Section -->
        <div class="space-y-3">
          <div class="flex items-center gap-1.5 pb-1.5 border-b border-navy-100">
            <span class="material-symbols-outlined text-sm text-primary">info</span>
            <h4 class="text-xs font-black text-navy-900 uppercase tracking-wider">Basic Info</h4>
          </div>

          <!-- Name -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-navy-900" for="window-name">
              Window Name <span class="text-red-500">*</span>
            </label>
            <input
              id="window-name"
              v-model="name"
              type="text"
              placeholder="e.g., Early Bird Registration"
              required
              :disabled="isSubmitting"
              class="w-full rounded-xl border border-primary-500/20 bg-white px-3 py-2 text-sm text-navy-900 placeholder:text-navy-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
            />
            <span v-if="errors.name" class="text-xs text-red-500">{{ errors.name }}</span>
          </div>

          <!-- Availability Type & Description in 2 columns on larger screens -->
          <div class="grid grid-cols-1 md:grid-cols-1 gap-3">
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-navy-900" for="window-type">
                Type <span class="text-red-500">*</span>
              </label>
              <select
                id="window-type"
                v-model="availability_type"
                required
                :disabled="isSubmitting"
                class="w-full rounded-xl border border-primary-500/20 bg-white px-3 py-2 text-sm text-navy-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
              >
                <option value="" disabled>Select type...</option>
                <option v-for="type in REDUCED_AVAILABILITY_TYPES" :key="type.value" :value="type.value">
                  {{ type.label }}
                </option>
              </select>
              <span v-if="errors.availability_type" class="text-xs text-red-500">{{ errors.availability_type }}</span>
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-navy-900" for="window-timezone">
                Timezone
              </label>
              <TimezoneSelect
                :model-value="timezone || 'UTC'"
                :has-error="!!errors.timezone"
                @update:model-value="timezone = $event"
              />
              <span v-if="errors.timezone" class="text-xs text-red-500">{{ errors.timezone }}</span>
            </div>
          </div>

          <!-- Type Description -->
          <p v-if="availability_type" class="text-[10px] text-navy-600 italic px-1">
            {{ getTypeDescription(availability_type) }}
          </p>

          <!-- Description -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-navy-900" for="window-description">
              Description <span class="text-navy-400 font-normal">(Optional)</span>
            </label>
            <textarea
              id="window-description"
              v-model="description"
              placeholder="Additional details..."
              rows="2"
              :disabled="isSubmitting"
              class="w-full rounded-xl border border-primary-500/20 bg-white px-3 py-2 text-sm text-navy-900 placeholder:text-navy-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none disabled:bg-gray-100"
            />
            <span v-if="errors.description" class="text-xs text-red-500">{{ errors.description }}</span>
          </div>
        </div>

        <!-- Date Range Section -->
        <div class="space-y-3" v-if="availability_type">
          <div class="flex items-center gap-1.5 pb-1.5 border-b border-navy-100">
            <span class="material-symbols-outlined text-sm text-primary">calendar_month</span>
            <h4 class="text-xs font-black text-navy-900 uppercase tracking-wider">Date Range</h4>
          </div>

          <!-- Quick Date Presets -->
          <div v-if="eventStart && !window" class="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/30 rounded-xl p-3">
            <div class="flex items-center gap-1.5 mb-2">
              <span class="material-symbols-outlined text-primary text-sm">bolt</span>
              <span class="text-[10px] font-black text-navy-900 uppercase tracking-wider">Quick Presets</span>
            </div>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="preset in datePresets"
                :key="preset.label"
                type="button"
                @click="applyPreset(preset)"
                :disabled="isSubmitting"
                class="px-2.5 py-1 text-[10px] font-bold bg-white hover:bg-primary/10 border border-primary/30 text-primary rounded-lg transition-colors disabled:opacity-50"
              >
                {{ preset.label }}
              </button>
            </div>
          </div>

          <!-- Date Inputs Side by Side -->
          <div class="grid grid-cols-2 gap-3">
            <!-- Available From -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-navy-900" for="window-start">
                Start <span class="text-red-500">*</span>
              </label>
              <input
                id="window-start"
                v-model="available_from"
                type="datetime-local"
                required
                :disabled="isSubmitting"
                class="w-full cursor-pointer rounded-xl border border-primary-500/20 bg-white px-3 py-1.5 text-xs text-navy-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <span v-if="errors.available_from" class="text-xs text-red-500">{{ errors.available_from }}</span>
            </div>

            <!-- Available To -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-navy-900" for="window-end">
                End <span class="text-red-500">*</span>
              </label>
              <input
                id="window-end"
                v-model="available_to"
                type="datetime-local"
                required
                :disabled="isSubmitting"
                class="w-full cursor-pointer rounded-xl border border-primary-500/20 bg-white px-3 py-1.5 text-xs text-navy-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <span v-if="errors.available_to" class="text-xs text-red-500">{{ errors.available_to }}</span>
            </div>
          </div>

          <!-- End Date Quick Adjustments -->
          <div v-if="available_from" class="bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-300 rounded-xl p-3">
            <div class="flex items-center gap-1.5 mb-2">
              <span class="material-symbols-outlined text-teal-700 text-sm">schedule</span>
              <span class="text-[10px] font-black text-navy-900 uppercase tracking-wider">End Date Adjustments</span>
            </div>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="preset in endDatePresets"
                :key="preset.label"
                type="button"
                @click="applyEndDatePreset(preset)"
                :disabled="isSubmitting"
                class="px-2.5 py-1 text-[10px] font-bold bg-white hover:bg-teal-50 border border-teal-400 text-teal-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {{ preset.label }}
              </button>
            </div>
          </div>

          <!-- Smart Default Indicator -->
          <div v-if="availability_type && !window && hasSmartDefault" class="flex items-center gap-1.5 p-2 bg-green-50 border border-green-200 rounded-lg">
            <span class="material-symbols-outlined text-green-600 text-sm">check_circle</span>
            <span class="text-[10px] text-green-800 font-medium">
              Smart defaults applied based on {{ getTypeLabel(availability_type) }}
            </span>
          </div>
        </div>
        </form>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between px-6 py-3 border-t border-navy-50 bg-navy-50/30">
        <div class="flex items-center gap-1 text-[10px] text-navy-500">
          <span class="material-symbols-outlined text-xs">schedule</span>
          <span>{{ timezone || eventTimezone }}</span>
        </div>
        <div class="flex gap-2">
          <button
            type="button"
            @click="closeModal"
            :disabled="isSubmitting"
            class="px-4 py-1.5 border border-navy-200 text-navy-600 text-xs font-bold rounded-lg hover:bg-navy-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            @click="onSubmit"
            :disabled="isSubmitting"
            class="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            <span v-if="isSubmitting" class="material-symbols-outlined text-sm animate-spin">progress_activity</span>
            <span v-else class="material-symbols-outlined text-sm">{{ window ? 'check' : 'add' }}</span>
            {{ window ? 'Update' : 'Create' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { AvailabilityWindowSchema, AVAILABILITY_TYPES, REDUCED_AVAILABILITY_TYPES } from '~/schemas/events/availability'
import type { AvailabilityWindow } from '~/api/types.gen'
import { useCreateAvailabilityWindow, useUpdateAvailabilityWindow } from '~/composables/resources/events/availability-windows'
import { getTypeLabel } from '~/utils/format/availability-windows'
import TimezoneSelect from '~/components/ui/TimezoneSelect.vue'

interface Props {
  isOpen: boolean
  window?: AvailabilityWindow
  eventId: string
  eventTimezone?: string
  eventStart?: string
  eventEnd?: string
  presetStartDate?: string
  presetEndDate?: string
}

const props = withDefaults(defineProps<Props>(), {
  eventTimezone: 'Europe/London',
})

const emit = defineEmits<{
  close: []
  success: []
  redirectRequired: [window: AvailabilityWindow]
}>()

const { $notyf } = useNuxtApp()

const isSubmitting = ref(false)

// Form setup
const { handleSubmit, errors, defineField, setValues, resetForm } = useForm({
  validationSchema: toTypedSchema(AvailabilityWindowSchema),
})

const [name] = defineField('name')
const [description] = defineField('description')
const [availability_type] = defineField('availability_type')
const [available_from] = defineField('available_from')
const [available_to] = defineField('available_to')
const [timezone] = defineField('timezone')

// Mutations
const createMutation = useCreateAvailabilityWindow()
const updateMutation = useUpdateAvailabilityWindow()

// Track if smart defaults have been applied
const hasSmartDefault = ref(false)

// Get type description helper
function getTypeDescription(type: string): string {
  const descriptions: Record<string, string> = {
    REGISTRATION_WINDOW: 'Controls when attendees can register for the event',
    PAYMENT_WINDOW: 'Defines when payments can be made',
    REFUND_WINDOW: 'Sets the period when refunds are available',
    CANCELLATION_WINDOW: 'When attendees can cancel their registration',
    EARLY_BIRD: 'Special early registration period with benefits',
    LATE_REGISTRATION: 'Extended registration after the main window',
    MERCHANDISE_WINDOW: 'When merchandise can be purchased',
    DONATION_WINDOW: 'Period for accepting donations',
    RESOURCE_WINDOW: 'When resources are accessible to attendees',
  }
  return descriptions[type] || 'Select a type to see smart date defaults'
}

// Date presets based on event start
interface DatePreset {
  label: string
  offsetFromDays: number
  offsetToDays: number
}

const datePresets = computed<DatePreset[]>(() => [
  { label: '1 Week Before', offsetFromDays: -7, offsetToDays: -1 },
  { label: '2 Weeks Before', offsetFromDays: -14, offsetToDays: -1 },
  { label: '1 Month Before', offsetFromDays: -30, offsetToDays: -1 },
  { label: 'Until Event Start', offsetFromDays: -30, offsetToDays: 0 },
  { label: '1 Week After', offsetFromDays: 0, offsetToDays: 7 },
  { label: 'During Event', offsetFromDays: 0, offsetToDays: getDurationDays() },
])

// End date presets (only adjust end date, keep start date)
interface EndDatePreset {
  label: string
  offsetDays?: number
  toEventStart?: boolean
  toEventEnd?: boolean
}

const endDatePresets = computed<EndDatePreset[]>(() => [
  { label: '+2 Days', offsetDays: 2 },
  { label: '+1 Week', offsetDays: 7 },
  { label: '+2 Weeks', offsetDays: 14 },
  { label: '+1 Month', offsetDays: 30 },
  { label: 'To Event Start', toEventStart: true },
  { label: 'To Event End', toEventEnd: true },
])

function getDurationDays(): number {
  if (!props.eventStart || !props.eventEnd) return 1
  const start = new Date(props.eventStart)
  const end = new Date(props.eventEnd)
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

function applyPreset(preset: DatePreset) {
  if (!props.eventStart) return
  
  const eventStartDate = new Date(props.eventStart)
  
  // Calculate from date
  const fromDate = new Date(eventStartDate)
  fromDate.setDate(fromDate.getDate() + preset.offsetFromDays)
  
  // Calculate to date
  const toDate = new Date(eventStartDate)
  toDate.setDate(toDate.getDate() + preset.offsetToDays)
  
  // Format for datetime-local input (YYYY-MM-DDTHH:mm)
  available_from.value = formatDateTimeLocal(fromDate.toISOString())
  available_to.value = formatDateTimeLocal(toDate.toISOString())
}

function applyEndDatePreset(preset: EndDatePreset) {
  if (!available_from.value) return
  
  const startDate = new Date(available_from.value)
  let endDate: Date
  
  if (preset.toEventStart && props.eventStart) {
    // Set to event start
    endDate = new Date(props.eventStart)
  } else if (preset.toEventEnd && props.eventEnd) {
    // Set to event end
    endDate = new Date(props.eventEnd)
  } else if (preset.offsetDays !== undefined) {
    // Add offset days to current start date
    endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + preset.offsetDays)
  } else {
    return
  }
  
  available_to.value = formatDateTimeLocal(endDate.toISOString())
}

// Smart defaults based on availability type
function applySmartDefaults(type: string) {
  if (!props.eventStart || props.window) return // Only apply to new windows
  
  const eventStartDate = new Date(props.eventStart)
  const eventEndDate = props.eventEnd ? new Date(props.eventEnd) : new Date(eventStartDate)
  
  let fromOffset = -30 // Default: 30 days before
  let toOffset = -1 // Default: 1 day before event
  
  switch (type) {
    case 'REGISTRATION_WINDOW':
      fromOffset = -30
      toOffset = -1 // Close registration day before event
      break
    case 'PAYMENT_WINDOW':
      fromOffset = -30
      toOffset = 0 // Close payments at event start
      break
    case 'REFUND_WINDOW':
      fromOffset = 0 // Start from event start
      toOffset = 7 // 7 days after event
      break
    case 'MERCHANDISE_WINDOW':
      fromOffset = -14
      toOffset = getDurationDays() // During event
      break
    case 'DONATION_WINDOW':
      fromOffset = -30
      toOffset = getDurationDays() + 30 // Through event and 30 days after
      break
    case 'RESOURCE_WINDOW':
      fromOffset = -7
      toOffset = getDurationDays() + 7 // Week before through week after
      break
  }
  
  const fromDate = new Date(eventStartDate)
  fromDate.setDate(fromDate.getDate() + fromOffset)
  
  const toDate = new Date(eventStartDate)
  toDate.setDate(toDate.getDate() + toOffset)
  
  available_from.value = formatDateTimeLocal(fromDate.toISOString())
  available_to.value = formatDateTimeLocal(toDate.toISOString())
  
  // Set flag to show indicator
  hasSmartDefault.value = true
  setTimeout(() => {
    hasSmartDefault.value = false
  }, 5000) // Hide after 5 seconds
}

// Watch for availability type changes to apply smart defaults
watch(() => availability_type.value, (newType) => {
  if (newType && !props.window) {
    applySmartDefaults(newType)
  }
})

// Watch for window prop changes to populate form
watch(
  () => (props.window),
  (newWindow) => {
    if (newWindow) {
      // Editing existing window
      setValues({
        name: newWindow.name,
        description: newWindow.description || '',
        availability_type: newWindow.availability_type,
        available_from: formatDateTimeLocal(newWindow.available_from),
        available_to: formatDateTimeLocal(newWindow.available_to),
        timezone: newWindow.timezone || props.eventTimezone,
      })
    } else {
      // Creating new window
      resetForm({
        values: {
          name: '',
          description: '',
          availability_type: undefined,
          available_from: props.presetStartDate ? formatDateTimeLocal(props.presetStartDate) : '',
          available_to: props.presetEndDate ? formatDateTimeLocal(props.presetEndDate) : '',
          timezone: props.eventTimezone,
        },
      })
    }
  },
  { immediate: true }
)

// Format datetime for datetime-local input
function formatDateTimeLocal(isoString?: string) {
  if (!isoString) return ''
  // datetime-local expects format: YYYY-MM-DDTHH:mm
  const date = new Date(isoString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

// Convert datetime-local format to ISO string
function toISOString(dateTimeLocal: string) {
  if (!dateTimeLocal) return ''
  return new Date(dateTimeLocal).toISOString()
}

// Submit handler
const onSubmit = handleSubmit(async (values) => {
  isSubmitting.value = true

  try {
    const payload = {
      name: values.name,
      description: values.description || null,
      availability_type: values.availability_type,
      available_from: toISOString(values.available_from),
      available_to: toISOString(values.available_to),
      timezone: values.timezone,
    }

    if (props.window) {
      // Update existing window
      await updateMutation.mutateAsync({
        eventId: props.eventId,
        windowId: props.window.availability_id,
        body: payload,
      })
      $notyf.success('Availability window updated successfully')
    } else {
      // Create new window
      await createMutation.mutateAsync({
        eventId: props.eventId,
        body: payload,
      }).then(() => {
        // Reset form after successful creation to allow creating another window easily
        resetForm({
          values: {
            name: '',
            description: '',
            availability_type: undefined,
            available_from: props.presetStartDate ? formatDateTimeLocal(props.presetStartDate) : '',
            available_to: props.presetEndDate ? formatDateTimeLocal(props.presetEndDate) : '',
            timezone: props.eventTimezone,
          },
        })
        $notyf.success('Availability window created successfully')
      })
    }

    emit('success')
    closeModal()
  } catch (error: any) {
    console.error('Failed to save availability window:', error)
    $notyf.error(
      error?.message || 
      `Failed to ${props.window ? 'update' : 'create'} availability window. Please try again.`
    )
  } finally {
    isSubmitting.value = false
  }
})

function closeModal() {
  if (!isSubmitting.value) {
    resetForm()
    emit('close')
  }
}
</script>
