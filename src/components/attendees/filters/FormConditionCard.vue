<template>
  <div class="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
    <!-- Card header -->
    <div class="flex items-start gap-3 p-3 bg-white border-b border-gray-200">
      <div class="flex-1 min-w-0">
        <label class="block text-xs font-semibold text-gray-700 mb-1">Form</label>
        <EventFormSelect
          :model-value="local.form"
          :event-slug="eventSlug"
          :multiple="false"
          placeholder="Select a form…"
          class="w-full"
          @update:model-value="onFormChange"
        />
      </div>
      <UButton
        color="gray"
        variant="ghost"
        size="xs"
        icon="i-heroicons-x-mark"
        class="shrink-0 mt-5"
        @click="$emit('remove')"
      />
    </div>

    <!-- Response-level toggles -->
    <div class="px-3 py-2 border-b border-gray-100 flex flex-wrap gap-4">
      <UCheckbox
        :model-value="local.has_response === true"
        label="Has response"
        size="sm"
        @update:model-value="onHasResponseChange"
      />
      <UCheckbox
        :model-value="local.response_complete === true"
        label="Response complete"
        size="sm"
        :disabled="local.has_response === false"
        @update:model-value="onResponseCompleteChange"
      />
    </div>

    <!-- Question conditions -->
    <div class="p-3 space-y-2">
      <!-- Operator selector (shown only when 2+ questions) -->
      <div v-if="(local.questions ?? []).length > 1" class="flex items-center gap-2 mb-2">
        <span class="text-xs text-gray-500">Match questions with</span>
        <USelectMenu
          :model-value="local.operator ?? 'AND'"
          :options="operatorOptions"
          size="xs"
          value-attribute="value"
          option-attribute="label"
          class="w-24"
          @update:model-value="(v) => updateField('operator', v)"
        />
      </div>

      <!-- Condition rows -->
      <QuestionConditionRow
        v-for="(qCond, idx) in local.questions ?? []"
        :key="idx"
        :model-value="qCond"
        :question="getQuestionDetail(qCond.question_id)"
        @update:model-value="updateQuestion(idx, $event)"
        @remove="removeQuestion(idx)"
      />

      <!-- Add question button -->
      <div v-if="local.form">
        <label class="block text-xs font-semibold text-gray-700 mb-1 mt-2">Add question filter</label>
        <EventFormQuestionSelect
          :model-value="null"
          :form-id="local.form"
          :multiple="false"
          placeholder="Pick a question to add…"
          @select="onQuestionSelect"
        />
      </div>
      <p v-else class="text-xs text-gray-400 italic">Select a form above to add question filters.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FormConditionRequest, FormQuestionConditionRequest } from '~/api/types.gen'
import QuestionConditionRow from './QuestionConditionRow.vue'
import type { QuestionDetail } from './QuestionConditionRow.vue'
import EventFormSelect from '~/components/ui/EventFormSelect.vue'
import EventFormQuestionSelect from '~/components/ui/EventFormQuestionSelect.vue'
import { useEventFormQuestions } from '~/composables/resources/events/eventForms'

const props = withDefaults(defineProps<{
  modelValue: FormConditionRequest
  eventSlug?: string
}>(), {
  eventSlug: undefined,
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: FormConditionRequest): void
  (e: 'remove'): void
}>()

const local = computed(() => props.modelValue)

const operatorOptions = [
  { value: 'AND', label: 'AND (all)' },
  { value: 'OR', label: 'OR (any)' },
]

// Fetch all questions for the current form — needed to restore labels when filters
// come from URL state rather than being freshly selected via the dropdown.
const currentFormId = computed(() => props.modelValue.form || '')
const { data: formQuestionsData } = useEventFormQuestions(
  computed(() => currentFormId.value ? { form: currentFormId.value, page_size: 200, ordering: 'order' } : undefined),
  { enabled: computed(() => !!currentFormId.value) },
)

// Map of question ID → QuestionDetail built from the API response
const fetchedQuestionsMap = computed<Map<number, QuestionDetail>>(() => {
  const map = new Map<number, QuestionDetail>()
  const results = (formQuestionsData.value as any)?.data?.results || []
  for (const r of results) {
    const id = Number(r.id)
    if (!Number.isFinite(id)) continue
    map.set(id, {
      id,
      title: String(r.question_title || '').trim(),
      type: String(r.question_type || ''),
      typeDisplay: String(r.question_type_display || r.question_type || '').trim(),
      minValue: r.min_value ?? null,
      maxValue: r.max_value ?? null,
      options: (r.options || []) as { id: number; option_text: string }[],
    })
  }
  return map
})

// Cache of question details resolved from @select events so we can render condition rows
const questionDetailsCache = ref<Map<number, QuestionDetail>>(new Map())

function getQuestionDetail(questionId: number): QuestionDetail {
  // Local cache (from @select) takes priority — most up-to-date
  if (questionDetailsCache.value.has(questionId)) {
    return questionDetailsCache.value.get(questionId)!
  }
  // Fall back to API-fetched data (restores labels when loading from URL state)
  if (fetchedQuestionsMap.value.has(questionId)) {
    return fetchedQuestionsMap.value.get(questionId)!
  }
  return {
    id: questionId,
    title: `Question ${questionId}`,
    type: 'short_answer',
    typeDisplay: 'Short Answer',
    minValue: null,
    maxValue: null,
    options: [],
  }
}

function updateField<K extends keyof FormConditionRequest>(field: K, value: FormConditionRequest[K]) {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}

function onFormChange(formId: string | string[] | null) {
  const id = Array.isArray(formId) ? formId[0] : formId
  emit('update:modelValue', {
    ...props.modelValue,
    form: id ?? '',
    // Clear question conditions when form changes
    questions: [],
  })
  questionDetailsCache.value = new Map()
}

function onHasResponseChange(checked: boolean) {
  updateField('has_response', checked ? true : undefined)
}

function onResponseCompleteChange(checked: boolean) {
  updateField('response_complete', checked ? true : undefined)
}

type QuestionSelectOption = {
  id: number
  title: string
  type: string
  typeDisplay: string
  minValue: number | null
  maxValue: number | null
  options: { id: number; option_text: string }[]
}

function onQuestionSelect(option: QuestionSelectOption | null) {
  if (!option) return

  // Cache the detail so the row can render type-appropriate UI
  const detail: QuestionDetail = {
    id: option.id,
    title: option.title,
    type: option.type,
    typeDisplay: option.typeDisplay,
    minValue: option.minValue,
    maxValue: option.maxValue,
    options: option.options ?? [],
  }
  questionDetailsCache.value = new Map([...questionDetailsCache.value, [option.id, detail]])

  // Don't add duplicates
  if ((props.modelValue.questions ?? []).some((q) => q.question_id === option.id)) return

  const newCondition: FormQuestionConditionRequest = {
    question_id: option.id,
    type: option.type as FormQuestionConditionRequest['type'],
  }

  emit('update:modelValue', {
    ...props.modelValue,
    questions: [...(props.modelValue.questions ?? []), newCondition],
  })
}

function updateQuestion(idx: number, updated: FormQuestionConditionRequest) {
  const questions = [...(props.modelValue.questions ?? [])]
  questions[idx] = updated
  emit('update:modelValue', { ...props.modelValue, questions })
}

function removeQuestion(idx: number) {
  const questions = [...(props.modelValue.questions ?? [])]
  questions.splice(idx, 1)
  emit('update:modelValue', { ...props.modelValue, questions })
}
</script>
