<template>
  <div class="space-y-4">
    <p class="text-sm text-gray-600">
      Filter attendees by their responses to event forms (separate from registration questions).
    </p>

    <!-- Boolean toggles row -->
    <div class="grid grid-cols-2 gap-3">
      <UCheckbox
        v-model="local.hasFormResponses"
        label="Has any form responses"
      />
      <UCheckbox
        v-model="local.formResponseComplete"
        :disabled="local.hasFormResponses === false"
        label="Response is complete"
      />
      <UCheckbox
        v-model="local.formHasUnansweredRequired"
        label="Has unanswered required questions"
      />
    </div>

    <!-- Form selector -->
    <div>
      <label class="block text-xs font-semibold text-gray-700 mb-2">Filter by Form</label>
      <EventFormSelect
        v-model="local.formResponseForm"
        :event-slug="eventSlug"
        placeholder="Select a form…"
        @update:model-value="onFormChange"
      />
    </div>

    <!-- Question selector (visible once a form is selected) -->
    <template v-if="local.formResponseForm">
      <div>
        <label class="block text-xs font-semibold text-gray-700 mb-2">Filter by Question</label>
        <EventFormQuestionSelect
          v-model="local.formAnsweredQuestion"
          :form-id="local.formResponseForm"
          placeholder="Select a question…"
          @select="onQuestionSelect"
        />
      </div>

      <!-- Type-specific answer filters -->
      <template v-if="selectedQuestion">
        <!-- Text types: short_answer, long_answer, email, phone -->
        <div v-if="isTextType">
          <label class="block text-xs font-semibold text-gray-700 mb-2">Search in Answer Text</label>
          <UInput
            v-model="local.formAnswerSearch"
            placeholder="Contains…"
            icon="i-heroicons-magnifying-glass"
          />
          <p class="text-xs text-gray-500 mt-1">Finds attendees whose answer contains this text</p>
        </div>

        <!-- Choice types: single_choice, multiple_choice -->
        <div v-else-if="isChoiceType">
          <label class="block text-xs font-semibold text-gray-700 mb-2">Selected Option</label>
          <USelectMenu
            v-model="local.formSelectedOption"
            :options="selectedQuestion.options || []"
            placeholder="Any option"
            value-attribute="id"
            option-attribute="option_text"
            class="w-full"
          />
          <p class="text-xs text-gray-500 mt-1">Finds attendees who selected this option</p>
        </div>

        <!-- Range types: slider, rating -->
        <div v-else-if="isRangeType">
          <label class="block text-xs font-semibold text-gray-700 mb-2">
            Answer Value Range
            <span v-if="selectedQuestion.minValue != null && selectedQuestion.maxValue != null" class="text-gray-400 font-normal">
              ({{ selectedQuestion.minValue }}–{{ selectedQuestion.maxValue }})
            </span>
          </label>
          <div class="grid grid-cols-2 gap-2">
            <UInput
              v-model.number="local.formNumericAnswerMin"
              type="number"
              placeholder="Min"
              :min="selectedQuestion.minValue ?? undefined"
              :max="selectedQuestion.maxValue ?? undefined"
            />
            <UInput
              v-model.number="local.formNumericAnswerMax"
              type="number"
              placeholder="Max"
              :min="selectedQuestion.minValue ?? undefined"
              :max="selectedQuestion.maxValue ?? undefined"
            />
          </div>
        </div>

        <!-- Date type -->
        <div v-else-if="isDateType">
          <label class="block text-xs font-semibold text-gray-700 mb-2">Date Answer Range</label>
          <!-- <div class="grid grid-cols-2 gap-2"> -->
            <!-- <UInput v-model="local.formAnswerDateAfter" type="date" placeholder="On or after" />
            <UInput v-model="local.formAnswerDateBefore" type="date" placeholder="On or before" /> -->
            <DateRangePicker
              :model-value-start="local.formAnswerDateAfter"
              :model-value-end="local.formAnswerDateBefore"
              @update:model-value-start="local.formAnswerDateAfter = $event"
              @update:model-value-end="local.formAnswerDateBefore = $event"
            >
              <template #default="{ label }">
                <div class="w-full rounded-xl border border-navy-200 bg-white px-4 py-3 text-sm font-medium text-navy-900 transition-colors hover:border-primary/60">
                  {{ label }}
                </div>
              </template>
          </DateRangePicker>
          <!-- </div> -->
        </div>

        <!-- Time type -->
        <div v-else-if="isTimeType">
          <label class="block text-xs font-semibold text-gray-700 mb-2">Time Answer Range</label>
          <TimeRangePicker
            :model-value-from="local.formAnswerTimeAfter"
            :model-value-to="local.formAnswerTimeBefore"
            @update:model-value-from="local.formAnswerTimeAfter = $event ?? undefined"
            @update:model-value-to="local.formAnswerTimeBefore = $event ?? undefined"
          />
        </div>

        <!-- Upload type -->
        <div v-else-if="isUploadType">
          <p class="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
            Upload questions can only be filtered by submission date (see below).
          </p>
        </div>
      </template>
    </template>

    <!-- Answer submission date range (visible when any question context active) -->
    <div v-if="local.formResponseForm || local.hasFormResponses">
      <label class="block text-xs font-semibold text-gray-700 mb-2">Answer Submitted Date Range</label>
      <div class="grid grid-cols-2 gap-2">
        <DateRangePicker
          :model-value-start="local.formAnswerSubmittedAfter"
          :model-value-end="local.formAnswerSubmittedBefore"
          @update:model-value-start="local.formAnswerSubmittedAfter = $event"
          @update:model-value-end="local.formAnswerSubmittedBefore = $event"
        >
          <template #default="{ label }">
            <div class="w-full rounded-xl border border-navy-200 bg-white px-4 py-3 text-sm font-medium text-navy-900 transition-colors hover:border-primary/60">
              {{ label }}
            </div>
          </template>
        </DateRangePicker>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import EventFormSelect from '~/components/ui/EventFormSelect.vue'
import EventFormQuestionSelect from '~/components/ui/EventFormQuestionSelect.vue'
import DateRangePicker from '~/components/ui/DateRangePicker.vue'
import TimeRangePicker from '~/components/ui/timerange/TimeRangePicker.vue'
/** Shape of the filter values this panel manages */
export interface EventFormFilters {
  hasFormResponses: boolean | undefined
  formResponseForm: string | undefined
  formResponseComplete: boolean | undefined
  formAnswerSearch: string | undefined
  formAnsweredQuestion: number | undefined
  formHasUnansweredRequired: boolean | undefined
  formSelectedOption: number | undefined
  formAnswerSubmittedAfter: string | undefined
  formAnswerSubmittedBefore: string | undefined
  formNumericAnswerMin: number | undefined
  formNumericAnswerMax: number | undefined
  formAnswerDateAfter: string | undefined
  formAnswerDateBefore: string | undefined
  formAnswerTimeAfter: string | undefined
  formAnswerTimeBefore: string | undefined
}

interface QuestionDetail {
  id: number
  title: string
  type: string
  typeDisplay: string
  minValue: number | null
  maxValue: number | null
  options: { id: number; option_text: string }[]
}

const props = withDefaults(defineProps<{
  modelValue: EventFormFilters
  eventSlug?: string
}>(), {
  eventSlug: undefined,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: EventFormFilters): void
}>()

// ── Local reactive copy ───────────────────────────────────────────────────────

const local = ref<EventFormFilters>({ ...props.modelValue })

// Sync parent → local
watch(() => props.modelValue, (v) => {
  local.value = { ...v }
}, { deep: true })

// Sync local → parent
watch(local, (v) => {
  emit('update:modelValue', { ...v })
}, { deep: true })

// ── Selected question detail ──────────────────────────────────────────────────

const selectedQuestion = ref<QuestionDetail | null>(null)

function onFormChange() {
  // Clear question-specific filters when form changes
  local.value.formAnsweredQuestion = undefined
  local.value.formAnswerSearch = undefined
  local.value.formSelectedOption = undefined
  local.value.formNumericAnswerMin = undefined
  local.value.formNumericAnswerMax = undefined
  local.value.formAnswerDateAfter = undefined
  local.value.formAnswerDateBefore = undefined
  local.value.formAnswerTimeAfter = undefined
  local.value.formAnswerTimeBefore = undefined
  selectedQuestion.value = null
}

function onQuestionSelect(question: QuestionDetail | null) {
  selectedQuestion.value = question
  // Clear answer-type-specific values when question changes
  local.value.formAnswerSearch = undefined
  local.value.formSelectedOption = undefined
  local.value.formNumericAnswerMin = undefined
  local.value.formNumericAnswerMax = undefined
  local.value.formAnswerDateAfter = undefined
  local.value.formAnswerDateBefore = undefined
  local.value.formAnswerTimeAfter = undefined
  local.value.formAnswerTimeBefore = undefined
  if (question) {
    local.value.formAnsweredQuestion = question.id
  } else {
    local.value.formAnsweredQuestion = undefined
  }
}

// ── Question type helpers ─────────────────────────────────────────────────────

const TEXT_TYPES = new Set(['short_answer', 'long_answer', 'email', 'phone'])
const CHOICE_TYPES = new Set(['single_choice', 'multiple_choice'])
const RANGE_TYPES = new Set(['slider', 'rating'])
const DATE_TYPES = new Set(['date'])
const UPLOAD_TYPES = new Set(['upload'])
const TIME_TYPES = new Set(['time'])

const isTextType = computed(() => !!selectedQuestion.value && TEXT_TYPES.has(selectedQuestion.value.type))
const isChoiceType = computed(() => !!selectedQuestion.value && CHOICE_TYPES.has(selectedQuestion.value.type))
const isRangeType = computed(() => !!selectedQuestion.value && RANGE_TYPES.has(selectedQuestion.value.type))
const isDateType = computed(() => !!selectedQuestion.value && DATE_TYPES.has(selectedQuestion.value.type))
const isUploadType = computed(() => !!selectedQuestion.value && UPLOAD_TYPES.has(selectedQuestion.value.type))
const isTimeType = computed(() => !!selectedQuestion.value && TIME_TYPES.has(selectedQuestion.value.type))
</script>
