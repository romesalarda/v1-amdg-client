<template>
  <div class="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-50 dark:to-indigo-50 rounded-xl border-2 border-blue-200 dark:border-blue-200 p-6 shadow-lg">
    <!-- Form Header -->
    <div class="mb-6">
      <div class="flex items-center gap-3 mb-2">
        <div class="p-2 bg-blue-600 dark:bg-blue-600 rounded-lg">
          <UIcon name="i-heroicons-shield-check" class="w-6 h-6 text-white dark:text-white" />
        </div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-900">
          {{ existingAuthorization ? 'Update Authorization' : 'Authorize Event' }}
        </h2>
      </div>
      <p class="text-gray-700 dark:text-gray-700 ml-14">
        {{ existingAuthorization 
          ? 'Modify the existing authorization status and details' 
          : 'Review and approve or reject this event' 
        }}
      </p>
    </div>

    <!-- Current Status Badge (if updating) -->
    <div v-if="existingAuthorization" class="mb-6 ml-14 p-4 bg-white dark:bg-white rounded-lg border border-gray-200 dark:border-gray-200">
      <p class="text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">Current Authorization:</p>
      <div class="flex items-center gap-3">
        <UBadge 
          :color="getAuthStatusColor(existingAuthorization.status)" 
          :label="existingAuthorization.status_display"
          size="lg"
        />
        <span class="text-sm text-gray-600">
          by {{ existingAuthorization.reviewed_by_email }}
        </span>
      </div>
    </div>

    <!-- Authorization Form -->
    <form @submit.prevent="onSubmit" class="space-y-6 ml-14">
      <UFormGroup 
        label="Authorization Decision" 
        required 
        :error="errors.status"
        class="bg-white dark:bg-white rounded-lg p-4 border border-gray-200 dark:border-gray-200"
      >
        <USelectMenu 
          v-model="status"
          :options="authStatusOptions"
          placeholder="Select authorization status"
          size="lg"
          class="mt-2"
          value-attribute="value"
        />
      </UFormGroup>

      <UFormGroup 
        label="Reason" 
        :help="'Explain your decision (optional)'" 
        :error="errors.reason"
        class="bg-white dark:bg-white rounded-lg p-4 border border-gray-200 dark:border-gray-200"
      >
        <UTextarea 
          v-model="reason"
          placeholder="Enter reason for this decision..."
          :rows="3"
          class="mt-2"
        />
      </UFormGroup>

      <UFormGroup 
        label="Additional Notes" 
        :help="'Any additional comments or requirements (optional)'" 
        :error="errors.notes"
        class="bg-white dark:bg-white rounded-lg p-4 border border-gray-200 dark:border-gray-200"
      >
        <UTextarea 
          v-model="notes"
          placeholder="Enter any additional notes..."
          :rows="4"
          class="mt-2"
        />
      </UFormGroup>

      <div class="flex gap-3 pt-4">
        <UButton 
          type="submit"
          color="primary"
          size="xl"
          :loading="isSubmitting"
          :disabled="!status"
          icon="i-heroicons-check-circle"
        >
          {{ existingAuthorization ? 'Update Authorization' : 'Submit Authorization' }}
        </UButton>

        <UButton 
          type="button"
          variant="outline"
          size="xl"
          :disabled="isSubmitting"
          @click="onCancel"
        >
          Cancel
        </UButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm, useField } from 'vee-validate'
import { EventApprovalSchema } from '~/schemas/event-approval.schema'
import type { EventAuthorization } from '~/api/types.gen'

const props = defineProps<{
  eventId: number
  existingAuthorization?: EventAuthorization | null
  isSubmitting?: boolean
}>()

const emit = defineEmits<{
  submit: [values: { status: string; reason?: string; notes?: string }]
  cancel: []
}>()

// Setup vee-validate form with zod schema
const { handleSubmit, errors, setValues } = useForm({
  validationSchema: toTypedSchema(EventApprovalSchema),
  initialValues: {
    status: (props.existingAuthorization?.status as any) || 'PENDING',
    reason: props.existingAuthorization?.reason || '',
    notes: props.existingAuthorization?.notes || '',
  },
})

// Define form fields with vee-validate
const { value: status } = useField<'PENDING' | 'APPROVED' | 'REJECTED' | 'POSTPONED' | 'CANCELLED'>('status')
const { value: reason } = useField<string>('reason')
const { value: notes } = useField<string>('notes')

// Watch for changes in existingAuthorization and update form
watch(() => props.existingAuthorization, (newAuth) => {
  if (newAuth) {
    setValues({
      status: newAuth.status as any,
      reason: newAuth.reason || '',
      notes: newAuth.notes || '',
    })
  }
}, { immediate: true })

const authStatusOptions = [
  { label: 'Pending Review', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Postponed', value: 'POSTPONED' },
  { label: 'Cancelled', value: 'CANCELLED' },
]

const onSubmit = handleSubmit((values) => {
  // Extract the value string if it's an object
  const statusValue = typeof values.status === 'object' && values.status !== null 
    ? (values.status as any).value 
    : values.status
  
  emit('submit', {
    status: statusValue,
    reason: values.reason,
    notes: values.notes
  })
})

const onCancel = () => {
  emit('cancel')
}

const getAuthStatusColor = (status?: string): 'yellow' | 'green' | 'red' | 'orange' | 'gray' => {
  const colors: Record<string, 'yellow' | 'green' | 'red' | 'orange' | 'gray'> = {
    'PENDING': 'yellow',
    'APPROVED': 'green',
    'REJECTED': 'red',
    'POSTPONED': 'orange',
    'CANCELLED': 'red',
  }
  return colors[status || ''] || 'gray'
}
</script>
