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

      <!-- Type-specific answer filters — each block shows independently based on selected question types -->
      <template v-if="selectedQuestionsDetails.length > 0">
        <div class="rounded-lg bg-gray-50 border border-gray-200 p-3 space-y-3">
          <p class="text-xs font-semibold text-gray-600">
            <template v-if="selectedQuestion">
              Answer filter for: <span class="text-primary">{{ selectedQuestion.title }}</span>
              <span class="ml-1 text-gray-400 font-normal">({{ selectedQuestion.typeDisplay }})</span>
            </template>
            <template v-else>
              Answer filters for <span class="text-primary">{{ selectedQuestionsDetails.length }} selected questions</span>
            </template>
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

          <!-- Choice types: single_choice, multiple_choice (1 question only — option sets differ per question) -->
          <div v-if="isChoiceType">
            <label class="block text-xs font-semibold text-gray-700 mb-2">Selected Option(s)</label>
            <USelectMenu
              v-model="localFormSelectedOptions"
              :options="selectedQuestion!.options || []"
              :multiple="true"
              placeholder="Any option…"
              value-attribute="id"
              option-attribute="option_text"
              class="w-full"
            />
            <p class="text-xs text-gray-500 mt-1">Finds attendees who selected any of these options</p>
          </div>

          <!-- Range types: slider, rating -->
          <div v-if="isRangeType">
            <label class="block text-xs font-semibold text-gray-700 mb-2">
              Answer Value Range
              <span v-if="selectedQuestion?.minValue != null && selectedQuestion?.maxValue != null" class="text-gray-400 font-normal">
                ({{ selectedQuestion.minValue }}–{{ selectedQuestion.maxValue }})
              </span>
            </label>
            <div class="grid grid-cols-2 gap-2">
              <UInput
                v-model.number="local.formNumericAnswerMin"
                type="number"
                placeholder="Min"
                :min="selectedQuestion?.minValue ?? undefined"
                :max="selectedQuestion?.maxValue ?? undefined"
              />
              <UInput
                v-model.number="local.formNumericAnswerMax"
                type="number"
                placeholder="Max"
                :min="selectedQuestion?.minValue ?? undefined"
                :max="selectedQuestion?.maxValue ?? undefined"
              />
            </div>
          </div>

          <!-- Date type -->
          <div v-if="isDateType">
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
          <div v-if="isTimeType">
            <label class="block text-xs font-semibold text-gray-700 mb-2">Time Answer Range</label>
            <TimeRangePicker
              :model-value-from="local.formAnswerTimeAfter"
              :model-value-to="local.formAnswerTimeBefore"
              @update:model-value-from="local.formAnswerTimeAfter = $event ?? undefined"
              @update:model-value-to="local.formAnswerTimeBefore = $event ?? undefined"
            />
          </div>

          <!-- Upload type -->
          <div v-if="isUploadType">
            <p class="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
              Upload questions can only be filtered by submission date (see below).
            </p>
          </div>
        </div>
      </template>
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
  /** Comma-separated option IDs; e.g. "1,2" — only applicable when exactly one choice question is selected */
  formSelectedOption: string | undefined
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
  // Only clear selected questions and answer filters when ALL forms are removed.
  // Adding or swapping forms should preserve existing question selections so
  // users can accumulate cross-form question filters without losing their work.
  const clearQuestions = forms.length === 0
  local.value = {
    ...local.value,
    formResponseForms: forms,
    ...(clearQuestions ? { formAnsweredQuestions: [], ...clearedAnswerFilters() } : {}),
  }
  if (clearQuestions) selectedQuestionsDetails.value = []
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

// Each flag activates independently — show a filter section whenever ANY selected
// question is of that type, so mixed-type selections show all applicable filters.
const isTextType = computed(() => selectedQuestionsDetails.value.some(q => TEXT_TYPES.has(q.type)))
// Choice requires exactly 1 question — each question has its own distinct option set.
const isChoiceType = computed(() => selectedQuestionsDetails.value.length === 1 && CHOICE_TYPES.has(selectedQuestionsDetails.value[0]?.type ?? ''))
const isRangeType = computed(() => selectedQuestionsDetails.value.some(q => RANGE_TYPES.has(q.type)))
const isDateType = computed(() => selectedQuestionsDetails.value.some(q => DATE_TYPES.has(q.type)))
const isUploadType = computed(() => selectedQuestionsDetails.value.some(q => UPLOAD_TYPES.has(q.type)))
const isTimeType = computed(() => selectedQuestionsDetails.value.some(q => TIME_TYPES.has(q.type)))

// ── Multi-select option helper (choice type) ──────────────────────────────────

// Converts formSelectedOption (comma-separated string) ↔ number[] for USelectMenu.
const localFormSelectedOptions = computed({
  get: (): number[] =>
    local.value.formSelectedOption
      ? String(local.value.formSelectedOption).split(',').map(Number).filter(Number.isFinite)
      : [],
  set: (val: number[]) => {
    local.value = {
      ...local.value,
      formSelectedOption: val.length > 0 ? val.join(',') : undefined,
    }
  },
})
</script>
