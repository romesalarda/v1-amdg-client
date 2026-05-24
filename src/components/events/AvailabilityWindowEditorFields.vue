<template>
  <div class="space-y-6">
    <div class="space-y-4">
      <div class="flex items-center gap-2 pb-2 border-b border-navy-100">
        <span class="material-symbols-outlined text-sm text-primary">info</span>
        <h4 class="text-xs font-black text-navy-900 uppercase tracking-wider">Basic Info</h4>
      </div>

      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-navy-900" for="window-name">
          Window Name <span class="text-red-500">*</span>
        </label>
        <input
          id="window-name"
          v-model="nameModel"
          type="text"
          placeholder="e.g., Early Bird Registration"
          required
          class="w-full rounded-xl border border-primary-500/20 bg-white px-3 py-2 text-sm text-navy-900 placeholder:text-navy-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
        />
        <span v-if="errors?.name" class="text-xs text-red-500">{{ errors.name }}</span>
      </div>

      <div class="grid grid-cols-1 gap-3 md:grid-cols-1">
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-navy-900" for="window-type">
            Type <span class="text-red-500">*</span>
          </label>
          <select
            id="window-type"
            v-model="availabilityTypeModel"
            required
            class="w-full rounded-xl border border-primary-500/20 bg-white px-3 py-2 text-sm text-navy-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
          >
            <option value="" disabled>Select type...</option>
            <option v-for="type in typeOptions" :key="type.value" :value="type.value">
              {{ type.label }}
            </option>
          </select>
          <span v-if="errors?.availability_type" class="text-xs text-red-500">{{ errors.availability_type }}</span>
        </div>

        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-navy-900" for="window-timezone">
            Timezone
          </label>
          <TimezoneSelect
            :model-value="timezoneModel || eventTimezone || 'UTC'"
            @update:model-value="timezoneModel = $event"
          />
          <span v-if="errors?.timezone" class="text-xs text-red-500">{{ errors.timezone }}</span>
        </div>
      </div>

      <p v-if="selectedTypeDescription" class="px-1 text-[10px] italic text-navy-600">
        {{ selectedTypeDescription }}
      </p>

      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-navy-900" for="window-description">
          Description <span class="text-navy-400 font-normal">(Optional)</span>
        </label>
        <textarea
          id="window-description"
          v-model="descriptionModel"
          placeholder="Additional details..."
          rows="2"
          class="w-full rounded-xl border border-primary-500/20 bg-white px-3 py-2 text-sm text-navy-900 placeholder:text-navy-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none disabled:bg-gray-100"
        />
        <span v-if="errors?.description" class="text-xs text-red-500">{{ errors.description }}</span>
      </div>
    </div>

    <div class="space-y-3">
      <div class="flex items-center gap-2 pb-2 border-b border-navy-100">
        <span class="material-symbols-outlined text-sm text-primary">calendar_month</span>
        <h4 class="text-xs font-black text-navy-900 uppercase tracking-wider">Date Range</h4>
      </div>

      <div v-if="showQuickPresets" class="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 p-3">
        <div class="mb-2 flex items-center gap-1.5">
          <span class="material-symbols-outlined text-sm text-primary">bolt</span>
          <span class="text-[10px] font-black uppercase tracking-wider text-navy-900">Quick Presets</span>
        </div>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="preset in quickPresets"
            :key="preset.label"
            type="button"
            class="rounded-lg border border-primary/30 bg-white px-2.5 py-1 text-[10px] font-bold text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
            @click="applyPreset(preset)"
          >
            {{ preset.label }}
          </button>
        </div>
      </div>

      <DateRangePicker
        :model-value-start="dateStartModel"
        :model-value-end="dateEndModel"
        :conflict-windows="conflictWindows"
        @update:model-value-start="dateStartModel = $event"
        @update:model-value-end="dateEndModel = $event"
      >
        <template #default="{ label }">
          <div class="w-full rounded-xl border border-navy-200 bg-white px-4 py-3 text-sm font-medium text-navy-900 transition-colors hover:border-primary/60">
            {{ label }}
          </div>
        </template>
      </DateRangePicker>

      <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-navy-900" for="window-start-time">Start Time</label>
          <input
            id="window-start-time"
            v-model="startTimeModel"
            type="time"
            class="w-full rounded-xl border border-primary-500/20 bg-white px-3 py-2 text-sm text-navy-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
          />
          <span v-if="errors?.available_from" class="text-xs text-red-500">{{ errors.available_from }}</span>
        </div>

        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-navy-900" for="window-end-time">End Time</label>
          <input
            id="window-end-time"
            v-model="endTimeModel"
            type="time"
            class="w-full rounded-xl border border-primary-500/20 bg-white px-3 py-2 text-sm text-navy-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
          />
          <span v-if="errors?.available_to" class="text-xs text-red-500">{{ errors.available_to }}</span>
        </div>
      </div>

      <div class="rounded-xl border border-navy-100 bg-navy-50/50 p-3">
        <div class="flex items-center gap-1.5">
          <span class="material-symbols-outlined text-sm text-navy-500">schedule</span>
          <span class="text-[10px] font-black uppercase tracking-wider text-navy-700">Selected Window</span>
        </div>
        <p class="mt-1 text-xs text-navy-600">
          Conflict days are highlighted directly on the calendar. Existing windows are also shown as markers.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AvailabilityWindow } from '~/api/types.gen'
import DateRangePicker from '~/components/ui/DateRangePicker.vue'
import TimezoneSelect from '~/components/ui/TimezoneSelect.vue'

type AvailabilityTypeOption = {
  value: string
  label: string
  description?: string
}

type QuickPreset = {
  label: string
  start: Date
  end: Date
}

const props = defineProps<{
  name?: string
  description?: string
  availabilityType?: string
  availableFrom?: string
  availableTo?: string
  timezone?: string
  typeOptions: readonly AvailabilityTypeOption[]
  eventTimezone?: string
  eventStart?: string
  eventEnd?: string
  conflictWindows?: AvailabilityWindow[]
  showQuickPresets?: boolean
  errors?: Partial<Record<'name' | 'description' | 'availability_type' | 'available_from' | 'available_to' | 'timezone', string>>
}>()

const emit = defineEmits<{
  'update:name': [value: string]
  'update:description': [value: string]
  'update:availabilityType': [value: string]
  'update:availableFrom': [value: string]
  'update:availableTo': [value: string]
  'update:timezone': [value: string]
}>()

const nameModel = computed({
  get: () => props.name || '',
  set: value => emit('update:name', value),
})

const descriptionModel = computed({
  get: () => props.description || '',
  set: value => emit('update:description', value),
})

const availabilityTypeModel = computed({
  get: () => props.availabilityType || '',
  set: value => emit('update:availabilityType', value),
})

const timezoneModel = computed({
  get: () => props.timezone || '',
  set: value => emit('update:timezone', value),
})

const dateStartModel = computed({
  get: () => formatDateOnly(props.availableFrom),
  set: value => emit('update:availableFrom', mergeDateTime(value, startTimeModel.value || '00:00')),
})

const dateEndModel = computed({
  get: () => formatDateOnly(props.availableTo),
  set: value => emit('update:availableTo', mergeDateTime(value, endTimeModel.value || '23:59')),
})

const startTimeModel = computed({
  get: () => formatTimeOnly(props.availableFrom) || '00:00',
  set: value => emit('update:availableFrom', mergeDateTime(dateStartModel.value, value || '00:00')),
})

const endTimeModel = computed({
  get: () => formatTimeOnly(props.availableTo) || '23:59',
  set: value => emit('update:availableTo', mergeDateTime(dateEndModel.value, value || '23:59')),
})

const selectedTypeDescription = computed(() => {
  return props.typeOptions.find(option => option.value === props.availabilityType)?.description || ''
})

const quickPresets = computed<QuickPreset[]>(() => {
  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)

  const eventStart = props.eventStart ? startOfDay(new Date(props.eventStart)) : todayStart
  const eventEnd = props.eventEnd ? endOfDay(new Date(props.eventEnd)) : endOfDay(eventStart)

  return [
    { label: '1 week from today', start: addDays(todayStart, 0), end: addDays(todayEnd, 7) },
    { label: '2 weeks from today', start: addDays(todayStart, 0), end: addDays(todayEnd, 14) },
    { label: '1 month from today', start: addDays(todayStart, 0), end: addDays(todayEnd, 30) },
    { label: '1 week before event', start: addDays(eventStart, -7), end: addDays(eventEnd, -1) },
    { label: '2 weeks before event', start: addDays(eventStart, -14), end: addDays(eventEnd, -1) },
    { label: '1 month before event', start: addDays(eventStart, -30), end: addDays(eventEnd, -1) },
    { label: 'During event', start: eventStart, end: eventEnd },
    { label: 'Now until event', start: todayStart, end: eventStart },
  ]
})

function applyPreset(preset: QuickPreset) {
  emit('update:availableFrom', mergeDateTime(formatDateOnly(preset.start.toISOString()), '00:00'))
  emit('update:availableTo', mergeDateTime(formatDateOnly(preset.end.toISOString()), '23:59'))
}

function formatDateOnly(dateString?: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatTimeOnly(dateString?: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ''
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

function mergeDateTime(dateValue: string, timeValue: string): string {
  if (!dateValue) return ''
  return `${dateValue}T${timeValue || '00:00'}`
}

function startOfDay(date: Date): Date {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

function endOfDay(date: Date): Date {
  const result = new Date(date)
  result.setHours(23, 59, 0, 0)
  return result
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}
</script>