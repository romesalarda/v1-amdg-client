<template>
  <div class="space-y-4">
    <!-- Operator selector (shown when 2+ conditions) -->
    <div v-if="local.conditions.length > 1" class="flex items-center gap-2">
      <span class="text-xs font-semibold text-gray-600">Match forms with</span>
      <USelectMenu
        :model-value="local.operator ?? 'AND'"
        :options="operatorOptions"
        size="xs"
        value-attribute="value"
        option-attribute="label"
        class="w-28"
        @update:model-value="(v) => updateOperator(v)"
      />
      <span class="text-xs text-gray-400">({{ local.operator === 'OR' ? 'any one form condition' : 'all form conditions' }})</span>
    </div>

    <!-- Form condition cards -->
    <FormConditionCard
      v-for="(condition, idx) in local.conditions"
      :key="idx"
      :model-value="condition"
      :event-slug="eventSlug"
      @update:model-value="updateCondition(idx, $event)"
      @remove="removeCondition(idx)"
    />

    <!-- Empty state -->
    <div v-if="local.conditions.length === 0" class="rounded-xl border-2 border-dashed border-gray-200 p-6 text-center">
      <UIcon name="i-heroicons-document-text" class="w-8 h-8 text-gray-300 mx-auto mb-2" />
      <p class="text-sm text-gray-500">No form filters added yet.</p>
      <p class="text-xs text-gray-400 mt-1">Click below to filter by a specific form and its questions.</p>
    </div>

    <!-- Add form condition button -->
    <UButton
      variant="outline"
      color="gray"
      icon="i-heroicons-plus"
      size="sm"
      block
      @click="addCondition"
    >
      Add form condition
    </UButton>
  </div>
</template>

<script setup lang="ts">
import type { FormsFilterRequest, FormConditionRequest } from '~/api/types.gen'
import FormConditionCard from '~/components/attendees/filters/FormConditionCard.vue'

const props = withDefaults(defineProps<{
  modelValue: FormsFilterRequest
  eventSlug?: string
}>(), {
  eventSlug: undefined,
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: FormsFilterRequest): void
}>()

const local = computed(() => ({
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

function updateCondition(idx: number, updated: FormConditionRequest) {
  const conditions = [...local.value.conditions!]
  conditions[idx] = updated
  emit('update:modelValue', { ...local.value, conditions })
}

function removeCondition(idx: number) {
  const conditions = [...local.value.conditions!]
  conditions.splice(idx, 1)
  emit('update:modelValue', { ...local.value, conditions })
}

function addCondition() {
  const newCondition: FormConditionRequest = {
    form: '',
    has_response: true,
    operator: 'AND',
    questions: [],
  }
  emit('update:modelValue', {
    ...local.value,
    conditions: [...(local.value.conditions ?? []), newCondition],
  })
}
</script>
