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
          <AvailabilityWindowEditorFields
            v-model:name="name"
            v-model:description="description"
            v-model:availability-type="availability_type"
            v-model:available-from="available_from"
            v-model:available-to="available_to"
            v-model:timezone="timezone"
            :type-options="REDUCED_AVAILABILITY_TYPES"
            :event-timezone="eventTimezone"
            :event-start="eventStart"
            :event-end="eventEnd"
            :conflict-windows="conflictWindows"
            :errors="errors"
            :show-quick-presets="!window"
          />
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
import AvailabilityWindowEditorFields from '~/components/events/AvailabilityWindowEditorFields.vue'
import { formatDateTimeLocal } from '~/utils/format/dates'

interface Props {
  isOpen: boolean
  window?: AvailabilityWindow
  eventId: string
  eventTimezone?: string
  eventStart?: string
  eventEnd?: string
  presetStartDate?: string
  presetEndDate?: string
  conflictWindows?: AvailabilityWindow[]
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
