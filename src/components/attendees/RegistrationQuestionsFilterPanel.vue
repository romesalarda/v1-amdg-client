<template>
  <div class="space-y-4">
    <p class="text-sm text-gray-600">
      Filter attendees by their answers to event registration questions.
    </p>

    <!-- Operator selector (shown when 2+ conditions) -->
    <div v-if="local.conditions.length > 1" class="flex items-center gap-2">
      <span class="text-xs font-semibold text-gray-600">Match questions with</span>
      <USelectMenu
        :model-value="local.operator ?? 'AND'"
        :options="operatorOptions"
        size="xs"
        value-attribute="value"
        option-attribute="label"
        class="w-28"
        @update:model-value="updateOperator"
      />
    </div>

    <!-- Condition rows -->
    <div
      v-for="(cond, idx) in local.conditions"
      :key="idx"
      class="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden"
    >
      <div class="flex items-start gap-2 p-3">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-2">
            <UBadge color="gray" size="xs" class="shrink-0 capitalize">
              {{ getQuestionTypeDisplay(String(cond.question_id)) }}
            </UBadge>
            <span class="text-xs font-medium text-gray-700 truncate">
              {{ getQuestionTitle(String(cond.question_id)) }}
            </span>
          </div>

          <!-- Text: short_answer, long_answer -->
          <div v-if="cond.type === 'short_answer' || cond.type === 'long_answer'">
            <UInput
              :model-value="cond.contains"
              size="sm"
              placeholder="Contains…"
              icon="i-heroicons-magnifying-glass"
              @update:model-value="updateCond(idx, 'contains', $event || undefined)"
            />
          </div>

          <!-- Choice: single_choice, multiple_choice -->
          <div v-else-if="cond.type === 'single_choice' || cond.type === 'multiple_choice'">
            <USelectMenu
              :model-value="cond.selected_options ?? []"
              :options="getQuestionOptions(String(cond.question_id))"
              multiple
              placeholder="Any option…"
              value-attribute="id"
              option-attribute="label"
              size="sm"
              class="w-full"
              @update:model-value="(v: number[]) => updateCond(idx, 'selected_options', v.length > 0 ? v : undefined)"
            />
          </div>

          <!-- Slider -->
          <div v-else-if="cond.type === 'slider'" class="grid grid-cols-2 gap-2">
            <UInput
              :model-value="cond.min"
              type="number"
              size="sm"
              placeholder="Min"
              @update:model-value="updateCond(idx, 'min', $event != null && $event !== '' ? Number($event) : undefined)"
            />
            <UInput
              :model-value="cond.max"
              type="number"
              size="sm"
              placeholder="Max"
              @update:model-value="updateCond(idx, 'max', $event != null && $event !== '' ? Number($event) : undefined)"
            />
          </div>

          <!-- Upload -->
          <div v-else-if="cond.type === 'upload'" class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs text-gray-500 mb-1">Submitted after</label>
              <UInput
                :model-value="cond.submitted_after"
                type="datetime-local"
                size="sm"
                @update:model-value="updateCond(idx, 'submitted_after', $event || undefined)"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Submitted before</label>
              <UInput
                :model-value="cond.submitted_before"
                type="datetime-local"
                size="sm"
                @update:model-value="updateCond(idx, 'submitted_before', $event || undefined)"
              />
            </div>
          </div>
        </div>

        <UButton
          color="gray"
          variant="ghost"
          size="xs"
          icon="i-heroicons-x-mark"
          class="shrink-0 mt-0.5"
          @click="removeCondition(idx)"
        />
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="local.conditions.length === 0" class="rounded-xl border-2 border-dashed border-gray-200 p-6 text-center">
      <UIcon name="i-heroicons-question-mark-circle" class="w-8 h-8 text-gray-300 mx-auto mb-2" />
      <p class="text-sm text-gray-500">No registration question filters added.</p>
    </div>

    <!-- Add question -->
    <div>
      <label class="block text-xs font-semibold text-gray-700 mb-1">Add question filter</label>
      <EventQuestionSelect
        :model-value="null"
        :event-slug="eventSlug"
        @update:model-value="onQuestionSelect"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RegistrationQuestionsFilterRequest, RegQuestionConditionRequest } from '~/api/types.gen'
import EventQuestionSelect from '~/components/ui/EventQuestionSelect.vue'
import { useEventQuestions } from '~/composables/resources/events/eventQuestions'

const props = withDefaults(defineProps<{
  modelValue: RegistrationQuestionsFilterRequest
  eventSlug?: string
}>(), {
  eventSlug: undefined,
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: RegistrationQuestionsFilterRequest): void
}>()

// Fetch all questions for the event so we can show titles + types
const questionsQuery = useEventQuestions(
  computed(() => ({ event: props.eventSlug || undefined, page_size: 100 })),
  { enabled: computed(() => !!props.eventSlug) },
)

const allQuestions = computed(() => questionsQuery.data.value?.data?.results ?? [])

function getQuestionTitle(questionId: string): string {
  const q = allQuestions.value.find((q: any) => String(q.id) === questionId)
  return q?.question_title || `Question ${questionId}`
}

function getQuestionTypeDisplay(questionId: string): string {
  const q = allQuestions.value.find((q: any) => String(q.id) === questionId)
  return q?.question_type_display || q?.question_type || 'question'
}

function getQuestionType(questionId: string): string {
  const q = allQuestions.value.find((q: any) => String(q.id) === questionId)
  return q?.question_type || 'short_answer'
}

function getQuestionOptions(questionId: string): { id: number; label: string }[] {
  const q = allQuestions.value.find((q: any) => String(q.id) === questionId)
  return (q?.options ?? []).map((o: any) => ({ id: o.id, label: o.option_text || o.label || String(o.id) }))
}

const local = computed<Required<RegistrationQuestionsFilterRequest>>(() => ({
  operator: props.modelValue.operator ?? 'AND',
  conditions: props.modelValue.conditions ?? [],
}))

const operatorOptions = [
  { value: 'AND', label: 'AND (all)' },
  { value: 'OR', label: 'OR (any)' },
]

function updateOperator(op: 'AND' | 'OR') {
  emit('update:modelValue', { ...local.value, operator: op })
}

function updateCond<K extends keyof RegQuestionConditionRequest>(
  idx: number,
  field: K,
  value: RegQuestionConditionRequest[K],
) {
  const conditions = [...(local.value.conditions ?? [])]
  conditions[idx] = { ...conditions[idx], [field]: value }
  emit('update:modelValue', { ...local.value, conditions })
}

function removeCondition(idx: number) {
  const conditions = [...(local.value.conditions ?? [])]
  conditions.splice(idx, 1)
  emit('update:modelValue', { ...local.value, conditions })
}

function onQuestionSelect(questionId: string | null) {
  if (!questionId) return

  // Don't add duplicate
  if ((local.value.conditions ?? []).some((c) => c.question_id === questionId)) return

  const qType = getQuestionType(questionId)
  const validTypes = ['short_answer', 'long_answer', 'upload', 'single_choice', 'multiple_choice', 'slider'] as const
  const condType = (validTypes as readonly string[]).includes(qType)
    ? (qType as RegQuestionConditionRequest['type'])
    : 'short_answer'

  const newCond: RegQuestionConditionRequest = {
    question_id: questionId,
    type: condType,
  }

  emit('update:modelValue', {
    ...local.value,
    conditions: [...(local.value.conditions ?? []), newCond],
  })
}
</script>
