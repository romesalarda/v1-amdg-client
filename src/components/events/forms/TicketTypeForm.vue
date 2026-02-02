<template>
  <form @submit="onSubmit" class="space-y-4">
    <UFormGroup label="Title" name="title" required :error="errors.title">
      <UInput
        v-model="title"
        v-bind="titleAttrs"
        placeholder="e.g. General Admission, VIP, Early Bird"
      />
    </UFormGroup>

    <UFormGroup label="Scope" name="scope" required :error="errors.scope">
      <div class="space-y-2">
        <URadio
          v-model="scope"
          v-bind="scopeAttrs"
          value="FULL_EVENT"
          label="Full Event"
          :ui="{ wrapper: 'flex items-start' }"
        >
          <template #label>
            <div>
              <div class="font-medium">Full Event</div>
              <div class="text-sm text-gray-500">Valid for entire event duration</div>
            </div>
          </template>
        </URadio>
        
        <URadio
          v-model="scope"
          v-bind="scopeAttrs"
          value="SINGLE_DAY"
          label="Single Day"
          :ui="{ wrapper: 'flex items-start' }"
        >
          <template #label>
            <div>
              <div class="font-medium">Single Day</div>
              <div class="text-sm text-gray-500">Valid for a single day only</div>
            </div>
          </template>
        </URadio>
        
        <URadio
          v-model="scope"
          v-bind="scopeAttrs"
          value="CUSTOM_RANGE"
          label="Custom Range"
          :ui="{ wrapper: 'flex items-start' }"
        >
          <template #label>
            <div>
              <div class="font-medium">Custom Range</div>
              <div class="text-sm text-gray-500">Custom date range</div>
            </div>
          </template>
        </URadio>
      </div>
    </UFormGroup>

    <div v-if="eventDays.length > 1" class="space-y-2">
      <label class="block text-sm font-medium text-gray-700">Quick Date Presets</label>
      <div class="flex flex-wrap gap-2">
        <UButton
          v-for="(day, index) in eventDays"
          :key="index"
          size="xs"
          variant="soft"
          color="gray"
          @click="setDatePreset(index)"
          type="button"
        >
          Day {{ index + 1 }} ({{ formatDateShort(day) }})
        </UButton>
        <UButton
          size="xs"
          variant="soft"
          color="primary"
          @click="setFullEventDates"
          type="button"
        >
          Full Event
        </UButton>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <UFormGroup label="Valid From" name="valid_from" :error="errors.valid_from">
        <UInput
          v-model="valid_from"
          v-bind="valid_fromAttrs"
          type="datetime-local"
          :min="minDate"
          :max="maxDate"
        />
      </UFormGroup>

      <UFormGroup label="Valid Until" name="valid_until" :error="errors.valid_until">
        <UInput
          v-model="valid_until"
          v-bind="valid_untilAttrs"
          type="datetime-local"
          :min="minDate"
          :max="maxDate"
        />
      </UFormGroup>
    </div>

    <UFormGroup label="Max Entries" name="max_entries" :error="errors.max_entries">
      <UInput
        v-model="max_entries"
        v-bind="max_entriesAttrs"
        type="number"
        min="1"
        placeholder="Leave empty for unlimited"
      />
    </UFormGroup>

    <UFormGroup name="is_active">
      <UToggle
        v-model="is_active"
        v-bind="is_activeAttrs"
      >
        <template #label>
          <span class="text-sm font-medium text-gray-700">Active</span>
        </template>
      </UToggle>
    </UFormGroup>

    <div class="flex justify-end gap-2 pt-4">
      <UButton
        label="Cancel"
        variant="ghost"
        color="gray"
        @click="emit('cancel')"
        type="button"
      />
      <UButton
        :label="modelValue ? 'Update Ticket Type' : 'Create Ticket Type'"
        type="submit"
        :loading="isSubmitting"
      />
    </div>
  </form>
</template>

<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { ticketTypeSchema } from '~/schemas/events/bookingConfig'
import { formatDateTimeLocal, parseDateTimeLocal } from '~/utils/format/dates'
import type { TicketTypeDetail, TicketTypeList } from '~/api/types.gen'

const props = defineProps<{
  modelValue?: TicketTypeDetail | TicketTypeList | null
  eventStartDate?: string
  eventEndDate?: string
}>()

const emit = defineEmits<{
  submit: [data: any]
  cancel: []
}>()

const isSubmitting = ref(false)

// Compute min and max dates for datetime-local inputs
const minDate = computed(() => 
  props.eventStartDate ? formatDateTimeLocal(props.eventStartDate) : undefined
)

const maxDate = computed(() => 
  props.eventEndDate ? formatDateTimeLocal(props.eventEndDate) : undefined
)

const { handleSubmit, errors, defineField, setValues } = useForm({
  validationSchema: toTypedSchema(ticketTypeSchema),
  initialValues: {
    title: '',
    scope: 'FULL_EVENT' as const,
    valid_from: props.eventStartDate ? formatDateTimeLocal(props.eventStartDate) : '',
    valid_until: props.eventEndDate ? formatDateTimeLocal(props.eventEndDate) : '',
    is_active: true,
    max_entries: '',
  },
  validateOnMount: false,
})

// Calculate event days for presets
const eventDays = computed(() => {
  if (!props.eventStartDate || !props.eventEndDate) return []
  
  const days: string[] = []
  const start = new Date(props.eventStartDate)
  const end = new Date(props.eventEndDate)
  
  let current = new Date(start)
  while (current <= end) {
    days.push(current.toISOString())
    current.setDate(current.getDate() + 1)
  }
  
  return days
})

// Format date for display in preset buttons
const formatDateShort = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
}

// Set date preset for specific day
const setDatePreset = (dayIndex: number) => {
  if (dayIndex >= 0 && dayIndex < eventDays.value.length) {
    const dayStart = eventDays.value[dayIndex]
    const dayEnd = new Date(dayStart)
    dayEnd.setHours(23, 59, 59, 999)
    
    setValues({
      ...{ title: title.value, scope: scope.value, is_active: is_active.value, max_entries: max_entries.value },
      valid_from: formatDateTimeLocal(dayStart),
      valid_until: formatDateTimeLocal(dayEnd.toISOString()),
    })
  }
}

// Set full event dates
const setFullEventDates = () => {
  setValues({
    ...{ title: title.value, scope: scope.value, is_active: is_active.value, max_entries: max_entries.value },
    valid_from: props.eventStartDate ? formatDateTimeLocal(props.eventStartDate) : '',
    valid_until: props.eventEndDate ? formatDateTimeLocal(props.eventEndDate) : '',
  })
}

const [title, titleAttrs] = defineField('title')
const [scope, scopeAttrs] = defineField('scope')
const [valid_from, valid_fromAttrs] = defineField('valid_from')
const [valid_until, valid_untilAttrs] = defineField('valid_until')
const [is_active, is_activeAttrs] = defineField('is_active')
const [max_entries, max_entriesAttrs] = defineField('max_entries')

// Watch for modelValue changes and populate form
watch(() => props.modelValue, (ticketType) => {
  if (ticketType) {
    // Map WORKSHOP_ONLY to CUSTOM_RANGE for compatibility
    const mappedScope = ticketType.scope === 'WORKSHOP_ONLY' ? 'CUSTOM_RANGE' : ticketType.scope || 'FULL_EVENT'
    
    setValues({
      title: ticketType.title || '',
      scope: mappedScope as 'FULL_EVENT' | 'SINGLE_DAY' | 'CUSTOM_RANGE',
      valid_from: formatDateTimeLocal(ticketType.valid_from) || '',
      valid_until: formatDateTimeLocal(ticketType.valid_until) || '',
      is_active: ticketType.is_active ?? true,
      max_entries: ('max_entries' in ticketType && ticketType.max_entries) ? String(ticketType.max_entries) : '',
    })
  }
}, { immediate: true })

const onSubmit = handleSubmit(async (values) => {
  isSubmitting.value = true
  try {
    // Convert datetime-local values to ISO strings for submission
    const submitData = {
      ...values,
      valid_from: parseDateTimeLocal(values.valid_from as string),
      valid_until: parseDateTimeLocal(values.valid_until as string),
      max_entries: values.max_entries ? Number(values.max_entries) : null,
    }
    
    emit('submit', submitData)
  } finally {
    isSubmitting.value = false
  }
})
</script>
