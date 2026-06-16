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

    <!-- Form selector (multi-select) -->
    <div>
      <label class="block text-xs font-semibold text-gray-700 mb-2">Filter by Form(s)</label>
      <EventFormSelect
        :model-value="local.formResponseForms"
        :event-slug="eventSlug"
        :multiple="true"
        placeholder="Select one or more forms…"
        @update:model-value="onFormsChange"
      />
      <p v-if="local.formResponseForms.length > 1" class="text-xs text-gray-500 mt-1">
        Attendees must have a response to any of the selected forms
      </p>
    </div>

    <!-- Question selector (visible once at least one form is selected) -->
    <template v-if="local.formResponseForms.length > 0">
      <div>
        <label class="block text-xs font-semibold text-gray-700 mb-2">
          Filter by Question(s)
          <span v-if="local.formResponseForms.length > 1" class="text-gray-400 font-normal">(across all selected forms)</span>
        </label>
        <EventFormQuestionSelect
          :model-value="local.formAnsweredQuestions"
          :form-ids="local.formResponseForms"
          :multiple="true"
          placeholder="Select one or more questions…"
          @update:model-value="(v) => local.formAnsweredQuestions = Array.isArray(v) ? (v as number[]) : []"
          @selections="onQuestionsSelections"
        />
      </div>

      <!-- Type-specific answer filters — only shown when exactly 1 question is selected -->
      <template v-if="selectedQuestion">
        <div class="rounded-lg bg-gray-50 border border-gray-200 p-3 space-y-3">
          <p class="text-xs font-semibold text-gray-600">
            Answer filter for: <span class="text-primary">{{ selectedQuestion.title }}</span>
            <span class="ml-1 text-gray-400 font-normal">({{ selectedQuestion.typeDisplay }})</span>
          </p>

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
        </div>
      </template>

      <!-- Info when multiple questions selected: no per-question answer filters -->
      <div v-else-if="local.formAnsweredQuestions.length > 1" class="rounded-lg bg-blue-50 border border-blue-200 p-3">
        <p class="text-xs text-blue-700">
          <span class="font-semibold">{{ local.formAnsweredQuestions.length }} questions selected.</span>
          Select a single question to apply answer-type-specific filters (text search, option matching, etc).
          The text search below applies across all selected questions.
        </p>
      </div>

      <!-- General text search (applies when 1+ questions selected) -->
      <div v-if="local.formAnsweredQuestions.length > 0 && (local.formAnsweredQuestions.length > 1 || isTextType || isUploadType)">
        <label class="block text-xs font-semibold text-gray-700 mb-2">Search Across Answers</label>
        <UInput
          v-model="local.formAnswerSearch"
          placeholder="Contains…"
          icon="i-heroicons-magnifying-glass"
        />
      </div>
    </template>

    <!-- Answer submission date range (visible when any form context active) -->
    <div v-if="local.formResponseForms.length > 0 || local.hasFormResponses">
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
  /** Array of selected form IDs */
  formResponseForms: string[]
  formResponseComplete: boolean | undefined
  formAnswerSearch: string | undefined
  /** Array of selected question IDs */
  formAnsweredQuestions: number[]
  formHasUnansweredRequired: boolean | undefined
  /** Only applicable when exactly one question is selected */
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
// The panel uses v-if in the parent (tab switch), so it re-mounts fresh each
// time the Forms tab is opened. Initialising from modelValue on creation is
// sufficient — no prop→local watcher is needed.

const local = ref<EventFormFilters>({ ...props.modelValue })

// Sync local → parent (user edits inside the panel).
watch(local, (v) => { emit('update:modelValue', { ...v }) }, { deep: true })

// ── Selected question details (for type-specific filters) ─────────────────────

/** Tracks full details of currently selected questions (populated via @selections emit) */
const selectedQuestionsDetails = ref<QuestionDetail[]>([])

/** The single selected question — only truthy when exactly 1 question is chosen */
const selectedQuestion = computed<QuestionDetail | null>(() =>
  selectedQuestionsDetails.value.length === 1 ? selectedQuestionsDetails.value[0] : null,
)

// Returns a plain object with all answer-type-specific fields cleared.
function clearedAnswerFilters(): Partial<EventFormFilters> {
  return {
    formAnswerSearch: undefined,
    formSelectedOption: undefined,
    formNumericAnswerMin: undefined,
    formNumericAnswerMax: undefined,
    formAnswerDateAfter: undefined,
    formAnswerDateBefore: undefined,
    formAnswerTimeAfter: undefined,
    formAnswerTimeBefore: undefined,
  }
}

function onFormsChange(newForms: string | string[] | null) {
  const forms = Array.isArray(newForms) ? newForms : (newForms ? [newForms] : [])
  // Batch all mutations into one assignment so the watcher emits only once.
  local.value = {
    ...local.value,
    formResponseForms: forms,
    formAnsweredQuestions: [],
    ...clearedAnswerFilters(),
  }
  selectedQuestionsDetails.value = []
}

function onQuestionsSelections(selections: QuestionDetail[]) {
  const newIds = selections.map(q => q.id).sort((a, b) => a - b).join(',')
  const oldIds = selectedQuestionsDetails.value.map(q => q.id).sort((a, b) => a - b).join(',')
  selectedQuestionsDetails.value = selections
  // Only clear type-specific answer filters when the question selection changes.
  // This prevents spurious clears when @selections fires due to allOptions
  // recomputing but the selected IDs haven't actually changed.
  if (newIds !== oldIds) {
    local.value = { ...local.value, ...clearedAnswerFilters() }
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
