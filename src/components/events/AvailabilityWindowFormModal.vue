<template>
  <UModal v-model="isModalOpen" :prevent-close="isSubmitting">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">
            {{ window ? 'Edit Availability Window' : 'Add Availability Window' }}
          </h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark"
            @click="closeModal"
            :disabled="isSubmitting"
          />
        </div>
      </template>

      <form @submit="onSubmit" class="space-y-4">
        <!-- Name -->
        <UFormGroup label="Window Name" name="name" required>
          <UInput
            v-model="name"
            placeholder="e.g., Early Bird Registration"
            :disabled="isSubmitting"
          />
          <span v-if="errors.name" class="text-sm text-red-500">{{ errors.name }}</span>
        </UFormGroup>

        <!-- Description -->
        <UFormGroup label="Description" name="description">
          <UTextarea
            v-model="description"
            placeholder="Optional description of this availability window"
            :rows="3"
            :disabled="isSubmitting"
          />
          <span v-if="errors.description" class="text-sm text-red-500">{{ errors.description }}</span>
        </UFormGroup>

        <!-- Availability Type -->
        <UFormGroup label="Window Type" name="availability_type" required>
          <USelectMenu
            v-model="availability_type"
            :options="AVAILABILITY_TYPES"
            placeholder="Select window type"
            value-attribute="value"
            option-attribute="label"
            :disabled="isSubmitting"
          />
          <span v-if="errors.availability_type" class="text-sm text-red-500">{{ errors.availability_type }}</span>
        </UFormGroup>

        <!-- Date Range -->
        <div class="space-y-3">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Available From -->
            <UFormGroup label="Start Date & Time" name="available_from" required>
              <input
                v-model="available_from"
                type="datetime-local"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                :disabled="isSubmitting"
              />
              <span v-if="errors.available_from" class="text-sm text-red-500">{{ errors.available_from }}</span>
            </UFormGroup>

            <!-- Available To -->
            <UFormGroup label="End Date & Time" name="available_to" required>
              <input
                v-model="available_to"
                type="datetime-local"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                :disabled="isSubmitting"
              />
              <span v-if="errors.available_to" class="text-sm text-red-500">{{ errors.available_to }}</span>
            </UFormGroup>
          </div>

          <!-- Quick Date Presets -->
          <div v-if="eventStart && !window" class="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div class="text-xs font-medium text-blue-900 mb-2 flex items-center gap-1">
              <UIcon name="i-heroicons-light-bulb" class="w-3.5 h-3.5" />
              Quick Presets (relative to event start)
            </div>
            <div class="flex flex-wrap gap-2">
              <UButton
                v-for="preset in datePresets"
                :key="preset.label"
                size="xs"
                variant="soft"
                color="blue"
                @click="applyPreset(preset)"
                :disabled="isSubmitting"
              >
                {{ preset.label }}
              </UButton>
            </div>
          </div>
        </div>

        <!-- Timezone -->
        <UFormGroup label="Timezone" name="timezone">
          <UInput
            v-model="timezone"
            placeholder="e.g., Europe/London"
            :disabled="isSubmitting"
          />
          <span v-if="errors.timezone" class="text-sm text-red-500">{{ errors.timezone }}</span>
          <template #hint>
            <span class="text-xs text-gray-500">Default timezone from event settings</span>
          </template>
        </UFormGroup>
      </form>

      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton
            color="gray"
            variant="ghost"
            @click="closeModal"
            :disabled="isSubmitting"
          >
            Cancel
          </UButton>
          <UButton
            type="submit"
            @click="onSubmit"
            :loading="isSubmitting"
            :disabled="isSubmitting"
          >
            {{ window ? 'Update Window' : 'Create Window' }}
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { AvailabilityWindowSchema, AVAILABILITY_TYPES } from '~/schemas/events/availability'
import type { AvailabilityWindow } from '~/api/types.gen'
import { useCreateAvailabilityWindow, useUpdateAvailabilityWindow } from '~/composables/resources/events/availability-windows'

interface Props {
  isOpen: boolean
  window?: AvailabilityWindow
  eventId: string
  eventTimezone?: string
  eventStart?: string
  eventEnd?: string
}

const props = withDefaults(defineProps<Props>(), {
  eventTimezone: 'Europe/London',
})

const emit = defineEmits<{
  close: []
  success: []
}>()

const { $notyf } = useNuxtApp()

// Modal state
const isModalOpen = computed({
  get: () => props.isOpen,
  set: (value) => {
    if (!value) {
      emit('close')
    }
  },
})

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
}

// Watch for availability type changes to apply smart defaults
watch(() => availability_type.value, (newType) => {
  if (newType && !props.window) {
    applySmartDefaults(newType)
  }
})

// Watch for window prop changes to populate form
watch(
  () => props.window,
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
          available_from: '',
          available_to: '',
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
      })
      $notyf.success('Availability window created successfully')
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
