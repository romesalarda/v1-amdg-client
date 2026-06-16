<template>
  <div class="flex items-start gap-2 p-3 rounded-lg bg-white border border-gray-200">
    <!-- Question label -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 mb-2">
        <UBadge color="gray" size="xs" class="shrink-0 capitalize">{{ typeDisplay }}</UBadge>
        <span class="text-xs font-medium text-gray-700 truncate">{{ question.title }}</span>
      </div>

      <!-- Text: short_answer, long_answer, email, phone -->
      <div v-if="isTextType">
        <UInput
          :model-value="localCond.contains"
          size="sm"
          placeholder="Contains…"
          icon="i-heroicons-magnifying-glass"
          @update:model-value="update('contains', $event || undefined)"
        />
      </div>

      <!-- Choice: single_choice, multiple_choice -->
      <div v-else-if="isChoiceType">
        <USelectMenu
          :model-value="selectedOptionIds"
          :options="question.options || []"
          multiple
          placeholder="Any option…"
          value-attribute="id"
          option-attribute="option_text"
          size="sm"
          class="w-full"
          @update:model-value="onOptionsChange"
        />
        <p class="text-xs text-gray-400 mt-1">Matches attendees who selected any of these</p>
      </div>

      <!-- Range: slider, rating -->
      <div v-else-if="isRangeType" class="grid grid-cols-2 gap-2">
        <UInput
          :model-value="localCond.min"
          type="number"
          size="sm"
          placeholder="Min"
          :min="question.minValue ?? undefined"
          :max="question.maxValue ?? undefined"
          @update:model-value="update('min', $event != null && $event !== '' ? Number($event) : undefined)"
        />
        <UInput
          :model-value="localCond.max"
          type="number"
          size="sm"
          placeholder="Max"
          :min="question.minValue ?? undefined"
          :max="question.maxValue ?? undefined"
          @update:model-value="update('max', $event != null && $event !== '' ? Number($event) : undefined)"
        />
        <p v-if="question.minValue != null && question.maxValue != null" class="col-span-2 text-xs text-gray-400">
          Range: {{ question.minValue }}–{{ question.maxValue }}
        </p>
      </div>

      <!-- Date -->
      <div v-else-if="isDateType" class="grid grid-cols-2 gap-2">
        <!-- <div>
          <label class="block text-xs text-gray-500 mb-1">From</label>
          <UInput
            :model-value="localCond.date_after"
            type="date"
            size="sm"
            @update:model-value="update('date_after', $event || undefined)"
          />
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">To</label>
          <UInput
            :model-value="localCond.date_before"
            type="date"
            size="sm"
            @update:model-value="update('date_before', $event || undefined)"
          />
        </div> -->
        <DateRangePicker
          :model-value-start="localCond.date_after"
          :model-value-end="localCond.date_before"
          @update:model-value-start="update('date_after', $event || undefined); localCond.date_after = $event || undefined"
          @update:model-value-end="update('date_before', $event || undefined); localCond.date_before = $event || undefined"
        >
        <template #default="{ label }">
          <div class="w-full rounded-xl border border-navy-200 bg-white px-4 py-3 text-sm font-medium text-navy-900 transition-colors hover:border-primary/60">
            {{ label }}
          </div>
        </template>
      </DateRangePicker>

      </div>

      <!-- Time -->
      <div v-else-if="isTimeType" class="grid grid-cols-2 gap-2">
        <!-- <div>
          <label class="block text-xs text-gray-500 mb-1">From</label>
          <UInput
            :model-value="localCond.time_after"
            type="time"
            size="sm"
            @update:model-value="update('time_after', $event || undefined)"
          />
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">To</label>
          <UInput
            :model-value="localCond.time_before"
            type="time"
            size="sm"
            @update:model-value="update('time_before', $event || undefined)"
          />
        </div> -->
        <TimeRangePicker
          :model-value-from="localCond.time_after"
          :model-value-to="localCond.time_before"
          @update:model-value-from="update('time_after', $event || undefined); localCond.time_after = $event || undefined"
          @update:model-value-to="update('time_before', $event || undefined); localCond.time_before = $event || undefined"
        />
      </div>

      <!-- Upload: only submission date range -->
      <div v-else-if="isUploadType" class="grid grid-cols-2 gap-2">
        <!-- <div>
          <label class="block text-xs text-gray-500 mb-1">Submitted after</label>
          <UInput
            :model-value="localCond.submitted_after"
            type="datetime-local"
            size="sm"
            @update:model-value="update('submitted_after', $event || undefined)"
          />
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">Submitted before</label>
          <UInput
            :model-value="localCond.submitted_before"
            type="datetime-local"
            size="sm"
            @update:model-value="update('submitted_before', $event || undefined)"
          />
        </div> -->
        <!-- <TimeRangePicker
          :model-value-from="localCond.submitted_after"
          :model-value-to="localCond.submitted_before"
          @update:model-value-from="update('submitted_after', $event || undefined)"
          @update:model-value-to="update('submitted_before', $event || undefined)"
        /> -->
        <TimeRangePicker
          :model-value-from="localCond.submitted_after"
          :model-value-to="localCond.submitted_before"
          @update:model-value-from="update('submitted_after', $event || undefined)"
          @update:model-value-to="update('submitted_before', $event || undefined)"
        />
      </div>
    </div>

    <!-- Remove button -->
    <UButton
      color="gray"
      variant="ghost"
      size="xs"
      icon="i-heroicons-x-mark"
      class="shrink-0 mt-0.5"
      @click="$emit('remove')"
    />
  </div>
</template>

<script setup lang="ts">
import type { FormQuestionConditionRequest } from '~/api/types.gen'
import DateRangePicker from '~/components/ui/DateRangePicker.vue'
import TimeRangePicker from '~/components/ui/timerange/TimeRangePicker.vue'

export interface QuestionDetail {
  id: number
  title: string
  type: string
  typeDisplay: string
  minValue: number | null
  maxValue: number | null
  options: { id: number; option_text: string }[]
}

const props = defineProps<{
  modelValue: FormQuestionConditionRequest
  question: QuestionDetail
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: FormQuestionConditionRequest): void
  (e: 'remove'): void
}>()

const localCond = computed(() => props.modelValue)

const TEXT_TYPES = new Set(['short_answer', 'long_answer', 'email', 'phone'])
const CHOICE_TYPES = new Set(['single_choice', 'multiple_choice'])
const RANGE_TYPES = new Set(['slider', 'rating'])
const DATE_TYPES = new Set(['date'])
const TIME_TYPES = new Set(['time'])
const UPLOAD_TYPES = new Set(['upload'])

const isTextType = computed(() => TEXT_TYPES.has(props.question.type))
const isChoiceType = computed(() => CHOICE_TYPES.has(props.question.type))
const isRangeType = computed(() => RANGE_TYPES.has(props.question.type))
const isDateType = computed(() => DATE_TYPES.has(props.question.type))
const isTimeType = computed(() => TIME_TYPES.has(props.question.type))
const isUploadType = computed(() => UPLOAD_TYPES.has(props.question.type))

const typeDisplay = computed(() => props.question.typeDisplay || props.question.type.replace('_', ' '))

function update<K extends keyof FormQuestionConditionRequest>(
  field: K,
  value: FormQuestionConditionRequest[K],
) {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}

// Choice: selected_options is number[]
const selectedOptionIds = computed(() => props.modelValue.selected_options ?? [])

function onOptionsChange(ids: number[]) {
  update('selected_options', ids.length > 0 ? ids : undefined)
}
</script>
