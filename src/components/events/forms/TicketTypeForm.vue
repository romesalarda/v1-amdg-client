<template>
  <form @submit="onSubmit" class="space-y-4 text-background-dark-600">
    <div class="bg-blue-50 border-2 border-blue-400 rounded-2xl p-6 shadow-lg">
      <div class="flex items-start gap-4">
        <div class="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full flex-shrink-0">
          <span class="material-symbols-outlined text-blue-700 text-2xl">info</span>
        </div>
        <div class="flex-1">
          <h3 class="text-sm font-black text-blue-900 uppercase tracking-wider mb-2">Ticket Type</h3>
          <p class="text-sm text-blue-800 leading-relaxed">Tickets define scopes of what participants can access during the event.</p>
        </div>
      </div>
    </div>
    <div class="space-y-2">
      <label class="block text-sm font-medium text-background-dark-600" for="ticket-title">
        Title <span class="text-red-500">*</span>
      </label>
      <input
        id="ticket-title"
        v-model="title"
        v-bind="titleAttrs"
        type="text"
        placeholder="e.g. Full pass, Day pass, Workshop only"
        class="w-full rounded-xl border border-primary-500/20 bg-white px-4 py-2 text-sm text-background-dark-600 placeholder:text-background-dark-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      <p v-if="errors.title" class="text-xs text-red-500">{{ errors.title }}</p>
    </div>

    <div class="space-y-2">
      <label class="block text-sm font-medium text-background-dark-600">
        Scope <span class="text-red-500">*</span>
      </label>
      <div class="space-y-3">
        <label class="flex items-start gap-3 rounded-xl border border-navy-200 bg-white p-3 hover:border-primary">
          <input
            v-model="scope"
            v-bind="scopeAttrs"
            type="radio"
            value="FULL_EVENT"
            class="mt-1 h-4 w-4 border border-navy-300 bg-white accent-[rgb(0,33,71)]"
          />
          <span>
            <span class="block font-medium text-primary">Full Event</span>
            <span class="block text-sm text-primary-500/60">Valid for entire event duration</span>
          </span>
        </label>

        <label class="flex items-start gap-3 rounded-xl border border-navy-200 bg-white p-3 hover:border-primary">
          <input
            v-model="scope"
            v-bind="scopeAttrs"
            type="radio"
            value="SINGLE_DAY"
            class="mt-1 h-4 w-4 border border-navy-300 bg-white accent-[rgb(0,33,71)]"
          />
          <span>
            <span class="block font-medium text-primary">Single Day</span>
            <span class="block text-sm text-primary-500/60">Valid for a single day only</span>
          </span>
        </label>

        <label class="flex items-start gap-3 rounded-xl border border-navy-200 bg-white p-3 hover:border-primary">
          <input
            v-model="scope"
            v-bind="scopeAttrs"
            type="radio"
            value="CUSTOM_RANGE"
            class="mt-1 h-4 w-4 border border-navy-300 bg-white accent-[rgb(0,33,71)]"
          />
          <span>
            <span class="block font-medium text-primary">Custom Range</span>
            <span class="block text-sm text-primary-500/60">Custom date range</span>
          </span>
        </label>
      </div>
      <p v-if="errors.scope" class="text-xs text-red-500">{{ errors.scope }}</p>
    </div>

    <div v-if="eventDays.length > 1" class="space-y-2">
      <label class="block text-sm font-medium text-background-dark-600">Quick Date Presets</label>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="(day, index) in eventDays"
          :key="index"
          type="button"
          class="rounded-lg border border-primary bg-white px-3 py-1 text-[11px] font-black uppercase tracking-widest text-primary transition-all hover:bg-primary hover:text-white"
          @click="setDatePreset(index)"
        >
          Day {{ index + 1 }} ({{ formatDateShort(day) }})
        </button>
        <button
          type="button"
          class="rounded-lg bg-primary px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-navy-600"
          @click="setFullEventDates"
        >
          Full Event
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="space-y-2">
        <label class="block text-sm font-medium text-background-dark-600" for="valid-from">Valid From</label>
        <input
          id="valid-from"
          v-model="valid_from"
          v-bind="valid_fromAttrs"
          type="datetime-local"
          :min="minDate"
          :max="maxDate"
          class="w-full rounded-xl border border-primary-500/20 bg-white px-4 py-2 text-sm text-background-dark-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <p v-if="errors.valid_from" class="text-xs text-red-500">{{ errors.valid_from }}</p>
      </div>

      <div class="space-y-2">
        <label class="block text-sm font-medium text-background-dark-600" for="valid-until">Valid Until</label>
        <input
          id="valid-until"
          v-model="valid_until"
          v-bind="valid_untilAttrs"
          type="datetime-local"
          :min="minDate"
          :max="maxDate"
          class="w-full rounded-xl border border-primary-500/20 bg-white px-4 py-2 text-sm text-background-dark-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <p v-if="errors.valid_until" class="text-xs text-red-500">{{ errors.valid_until }}</p>
      </div>
    </div>

    <div class="space-y-2">
      <label class="block text-sm font-medium text-background-dark-600" for="max-entries">Max Entries</label>
      <input
        id="max-entries"
        v-model="max_entries"
        v-bind="max_entriesAttrs"
        type="number"
        min="1"
        placeholder="Leave empty for unlimited"
        class="w-full rounded-xl border border-primary-500/20 bg-white px-4 py-2 text-sm text-background-dark-600 placeholder:text-background-dark-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      <p v-if="errors.max_entries" class="text-xs text-red-500">{{ errors.max_entries }}</p>
    </div>

    <label class="flex items-center justify-between rounded-xl border border-primary-500/20 bg-white px-4 py-3">
      <span class="text-sm font-medium text-background-dark-600">Active</span>
      <span class="relative inline-flex h-6 w-11 items-center">
        <input
          v-model="is_active"
          v-bind="is_activeAttrs"
          type="checkbox"
          class="peer sr-only"
        />
        <span class="h-6 w-11 rounded-full bg-primary-500/20 transition peer-checked:bg-primary"></span>
        <span class="absolute left-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5"></span>
      </span>
    </label>

    <div class="flex justify-end gap-2 pt-4">
      <button
        type="button"
        class="rounded-xl border border-primary bg-white px-4 py-2 text-[11px] font-black uppercase tracking-widest text-primary transition-all hover:bg-primary hover:text-white"
        @click="emit('cancel')"
      >
        Cancel
      </button>
      <button
        type="submit"
        :disabled="isSubmitting"
        class="rounded-xl bg-primary px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-navy-600 disabled:opacity-70"
      >
        {{ modelValue ? 'Update Ticket Type' : 'Create Ticket Type' }}
      </button>
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
