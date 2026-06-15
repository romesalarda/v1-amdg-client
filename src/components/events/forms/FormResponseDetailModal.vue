<template>
  <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-2xl' }">
    <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100' }">
      <!-- Header -->
      <template #header>
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-3 min-w-0">
            <!-- Avatar -->
            <div
              class="h-10 w-10 rounded-full flex items-center justify-center shrink-0 text-sm font-black uppercase text-white select-none"
              :class="response?.is_complete ? 'bg-emerald-500' : 'bg-amber-400'"
            >
              {{ initials(response?.attendee_display) }}
            </div>
            <div class="min-w-0">
              <h2 class="text-base font-bold text-deep-navy truncate">
                {{ response?.attendee_display || 'Unknown Attendee' }}
              </h2>
              <p class="text-[11px] font-mono text-gray-400 mt-0.5">
                {{ response?.attendee }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <!-- Status badge -->
            <span
              class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide"
              :class="
                response?.is_complete
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              "
            >
              <UIcon
                :name="response?.is_complete ? 'i-heroicons-check-circle' : 'i-heroicons-pencil-square'"
                class="w-3 h-3"
              />
              {{ response?.is_complete ? 'Submitted' : 'In Progress' }}
            </span>

            <UButton
              icon="i-heroicons-x-mark"
              size="sm"
              variant="ghost"
              color="gray"
              @click="$emit('close')"
            />
          </div>
        </div>

        <!-- Meta row -->
        <div class="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
          <span v-if="response?.submitted_at" class="flex items-center gap-1">
            <UIcon name="i-heroicons-clock" class="w-3.5 h-3.5" />
            Submitted {{ formatDate(response.submitted_at) }}
          </span>
          <span v-if="response?.updated_at" class="flex items-center gap-1">
            <UIcon name="i-heroicons-arrow-path" class="w-3.5 h-3.5" />
            Updated {{ formatDate(response.updated_at) }}
          </span>
        </div>
      </template>

      <!-- Body -->
      <div class="max-h-[60vh] overflow-y-auto">
        <!-- Loading answers -->
        <div v-if="isLoadingAnswers" class="flex items-center justify-center gap-2 py-12 text-sm text-gray-500">
          <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin" />
          Loading answers…
        </div>

        <!-- No questions on form detail -->
        <div
          v-else-if="!formQuestions.length"
          class="flex flex-col items-center justify-center gap-2 py-12 text-center"
        >
          <UIcon name="i-heroicons-document-text" class="w-10 h-10 text-gray-300" />
          <p class="text-sm text-gray-500">No questions found for this form.</p>
        </div>

        <!-- Questions list -->
        <div v-else class="divide-y divide-deep-navy/8">
          <div
            v-for="(question, idx) in formQuestions"
            :key="question.id"
            class="px-5 py-4"
          >
            <!-- Question label -->
            <div class="mb-3 flex flex-wrap items-start gap-2">
              <span class="text-xs font-black text-gray-400 w-5 text-right shrink-0 pt-0.5">
                {{ idx + 1 }}.
              </span>
              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="text-sm font-bold text-deep-navy">{{ question.question_title }}</span>
                  <span
                    v-if="question.required"
                    class="text-red-500 font-black text-[11px]"
                  >*</span>
                  <span class="inline-flex items-center rounded-full bg-deep-navy/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-deep-navy/60">
                    {{ question.question_type_display ?? question.question_type }}
                  </span>
                </div>
                <p v-if="question.question_body" class="mt-1 text-xs text-deep-navy/60">
                  {{ question.question_body }}
                </p>
              </div>
            </div>

            <!-- Answer display -->
            <div class="ml-7">
              <template v-if="answerForQuestion(question.id)">
                <div class="rounded-lg bg-deep-navy/4 p-3">
                  <!-- Rating -->
                  <div
                    v-if="question.question_type === 'rating'"
                    class="flex gap-0.5"
                  >
                    <span
                      v-for="star in 5"
                      :key="star"
                      class="text-xl leading-none"
                      :class="Number(answerForQuestion(question.id)?.answer_text || 0) >= star ? 'text-amber-400' : 'text-deep-navy/20'"
                    >★</span>
                    <span class="ml-2 text-sm text-deep-navy/60 self-center">
                      {{ answerForQuestion(question.id)?.answer_text }} / 5
                    </span>
                  </div>

                  <!-- Text / slider / date / time / email / phone -->
                  <p
                    v-else-if="isTextOrSliderType(question.question_type)"
                    class="text-sm text-deep-navy whitespace-pre-wrap"
                  >
                    {{ answerForQuestion(question.id)?.answer_text || '—' }}
                  </p>

                  <!-- Choice answer -->
                  <div
                    v-else-if="isChoiceType(question.question_type)"
                    class="flex flex-wrap gap-2"
                  >
                    <span
                      v-for="choice in answerForQuestion(question.id)?.selected_options"
                      :key="choice.id"
                      class="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary"
                    >
                      {{ choice.option_text }}
                    </span>
                    <span
                      v-if="!answerForQuestion(question.id)?.selected_options?.length"
                      class="text-sm text-deep-navy/40 italic"
                    >
                      No option selected
                    </span>
                  </div>

                  <!-- Upload -->
                  <div v-else-if="question.question_type === 'upload'">
                    <a
                      v-if="answerForQuestion(question.id)?.answer_file_url"
                      :href="answerForQuestion(question.id)!.answer_file_url ?? '#'"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center gap-1.5 text-primary text-sm font-medium hover:underline"
                    >
                      <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4" />
                      View uploaded file
                    </a>
                    <p v-else class="text-sm text-deep-navy/40 italic">No file uploaded</p>
                  </div>
                </div>
              </template>

              <!-- Unanswered -->
              <template v-else>
                <div class="rounded-lg border border-dashed border-deep-navy/15 px-3 py-2">
                  <p class="text-xs text-deep-navy/40 italic">
                    {{ question.required ? 'Required — not answered' : 'Not answered' }}
                  </p>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <template #footer>
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-500">
            {{ answeredCount }} of {{ formQuestions.length }} question{{ formQuestions.length !== 1 ? 's' : '' }} answered
            <span v-if="unansweredRequired > 0" class="ml-1 font-semibold text-red-500">
              · {{ unansweredRequired }} required unanswered
            </span>
          </span>
          <UButton label="Close" size="sm" variant="soft" color="gray" @click="$emit('close')" />
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EventFormResponse, EventFormResponseAnswer, EventFormQuestion } from '~/api/types.gen'

const props = defineProps<{
  modelValue: boolean
  response: EventFormResponse | null
  answers: EventFormResponseAnswer[]
  formQuestions: EventFormQuestion[]
  isLoadingAnswers: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

// ── Answer lookup ─────────────────────────────────────────────────────────────
function answerForQuestion(questionId: number): EventFormResponseAnswer | undefined {
  return props.answers.find((a) => a.question === questionId)
}

const answeredCount = computed(() =>
  props.formQuestions.filter((q) => {
    const a = answerForQuestion(q.id)
    if (!a) return false
    if (a.answer_text?.trim()) return true
    if (a.answer_file_url) return true
    if (a.selected_options?.length) return true
    return false
  }).length,
)

const unansweredRequired = computed(() =>
  props.formQuestions.filter((q) => {
    if (!q.required) return false
    const a = answerForQuestion(q.id)
    if (!a) return true
    if (a.answer_text?.trim()) return false
    if (a.answer_file_url) return false
    if (a.selected_options?.length) return false
    return true
  }).length,
)

// ── Type helpers ──────────────────────────────────────────────────────────────
function isChoiceType(type: string | null | undefined): boolean {
  return type === 'single_choice' || type === 'multiple_choice'
}

function isTextOrSliderType(type: string | null | undefined): boolean {
  return [
    'short_answer', 'long_answer', 'email', 'phone',
    'date', 'time', 'slider',
  ].includes(type ?? '')
}

// ── Display helpers ───────────────────────────────────────────────────────────
function initials(name: string | null | undefined): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase()
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase()
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
