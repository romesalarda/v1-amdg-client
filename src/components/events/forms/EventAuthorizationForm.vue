<template>
  <div class="bg-white border-2 border-deep-navy rounded-xl shadow-drawn">
    <!-- Form Header -->
    <div class="px-8 py-6 border-b-2 border-deep-navy/10">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
          <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
          </svg>
        </div>
        <div>
          <h2 class="text-2xl font-black text-deep-navy uppercase tracking-tight">
            {{ existingAuthorization ? 'Update Authorization' : 'Authorize Event' }}
          </h2>
          <p class="text-sm text-deep-navy/60 font-medium mt-1">
            {{ existingAuthorization 
              ? 'Modify the existing authorization status and details' 
              : 'Review and approve or reject this event' 
            }}
          </p>
        </div>
      </div>
    </div>

    <!-- Current Status Badge (if updating) -->
    <div v-if="existingAuthorization" class="px-8 py-6 bg-blue-500/5 border-b-2 border-deep-navy/10">
      <p class="text-[10px] font-black text-deep-navy/50 uppercase tracking-[0.2em] mb-3">Current Authorization:</p>
      <div class="flex items-center gap-4">
        <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider" :class="getAuthStatusClasses(existingAuthorization.status)">
          {{ existingAuthorization.status_display }}
        </span>
        <span class="text-sm text-deep-navy/60 font-medium">
          by {{ existingAuthorization.reviewed_by_email }}
        </span>
      </div>
    </div>

    <!-- Authorization Form -->
    <form @submit.prevent="onSubmit" class="p-8 space-y-6">
      <div>
        <label for="status" class="block text-[10px] font-black text-deep-navy/50 mb-3 uppercase tracking-[0.2em]">
          Authorization Decision <span class="text-red-500">*</span>
        </label>
        <div class="relative">
          <USelectMenu
            v-model="status"
            value-attribute="value"
            :options="authStatusOptions"
            placeholder="Select authorization status..."
            class="w-full"
          />
        </div>
        <p v-if="errors.status" class="mt-2 text-xs text-red-600 font-bold">{{ errors.status }}</p>
      </div>

      <div>
        <label for="reason" class="block text-[10px] font-black text-deep-navy/50 mb-3 uppercase tracking-[0.2em]">
          Reason
        </label>
        <UTextarea 
          v-model="reason"
          placeholder="Enter reason for this decision..."
          :rows="3"
          class="mt-2"
        />
        <p class="mt-2 text-xs text-deep-navy/50 font-medium">Explain your decision (optional)</p>
        <p v-if="errors.reason" class="mt-2 text-xs text-red-600 font-bold">{{ errors.reason }}</p>
      </div>

      <div>
        <label for="notes" class="block text-[10px] font-black text-deep-navy/50 mb-3 uppercase tracking-[0.2em]">
          Additional Notes
        </label>
        <UTextarea 
          v-model="notes"
          placeholder="Enter any additional notes..."
          :rows="4"
          class="mt-2"
        />
        <p class="mt-2 text-xs text-deep-navy/50 font-medium">Any additional comments or requirements (optional)</p>
        <p v-if="errors.notes" class="mt-2 text-xs text-red-600 font-bold">{{ errors.notes }}</p>

        <!-- Compiled flagged issues preview (appended on submit) -->
        <div v-if="prefilledNotes" class="mt-3 border-2 border-amber-200 rounded-xl bg-amber-50 overflow-hidden">
          <div class="px-4 py-2 border-b border-amber-200 flex items-center gap-2">
            <svg class="w-3.5 h-3.5 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
            <span class="text-[10px] font-black text-amber-700 uppercase tracking-wider">Flagged Issues — will be appended to notes on submit</span>
          </div>
          <pre class="px-4 py-3 text-xs text-amber-900 font-medium whitespace-pre-wrap">{{ prefilledNotes }}</pre>
        </div>
      </div>

      <div class="flex gap-3 pt-4">
        <button
          type="submit"
          :disabled="!status || isSubmitting"
          class="px-8 py-3 bg-deep-navy hover:bg-deep-navy/90 text-white rounded-xl font-black text-sm uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-2"
        >
          <svg v-if="isSubmitting" class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          {{ existingAuthorization ? 'Update Authorization' : 'Submit Authorization' }}
        </button>

        <button
          type="button"
          :disabled="isSubmitting"
          @click="onCancel"
          class="px-8 py-3 border-2 border-deep-navy/20 text-deep-navy hover:bg-deep-navy/5 rounded-xl font-black text-sm uppercase tracking-wider transition-all disabled:opacity-50"
        >
          Cancel
        </button>
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
  prefilledNotes?: string
}>()

const emit = defineEmits<{
  submit: [values: { status: string; reason?: string; notes?: string }]
  cancel: []
}>()

// Setup vee-validate form with zod schema
const { handleSubmit, errors, setValues, setFieldValue } = useForm({
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

// prefilledNotes are shown as a preview and appended on submit — do not overwrite the notes field

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

  // Append compiled flagged issues to notes (append-only — never overwrites user text)
  let combinedNotes = values.notes || ''
  if (props.prefilledNotes) {
    combinedNotes = combinedNotes
      ? `${combinedNotes}\n\n${props.prefilledNotes}`
      : props.prefilledNotes
  }

  emit('submit', {
    status: statusValue,
    reason: values.reason,
    notes: combinedNotes || undefined,
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

const getAuthStatusClasses = (status?: string): string => {
  const classes: Record<string, string> = {
    'PENDING': 'bg-amber-500 text-white',
    'APPROVED': 'bg-green-500 text-white',
    'REJECTED': 'bg-red-500 text-white',
    'POSTPONED': 'bg-orange-500 text-white',
    'CANCELLED': 'bg-red-500 text-white',
  }
  return classes[status || ''] || 'bg-gray-500 text-white'
}
</script>
