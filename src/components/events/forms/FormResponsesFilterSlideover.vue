<template>
  <!-- Overlay -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 bg-black/30 z-40"
        @click="$emit('update:modelValue', false)"
      />
    </Transition>

    <!-- Panel -->
    <Transition
      enter-active-class="transition-transform duration-250 ease-out"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <aside
        v-if="modelValue"
        class="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
          <div>
            <h2 class="text-base font-bold text-gray-900">Advanced Filter</h2>
            <p class="text-xs text-gray-500 mt-0.5">Filter responses by demographics and question answers</p>
          </div>
          <UButton
            icon="i-heroicons-x-mark"
            variant="ghost"
            color="gray"
            size="sm"
            @click="$emit('update:modelValue', false)"
          />
        </div>

        <!-- Tab Navigation -->
        <div class="flex border-b border-gray-200 shrink-0 overflow-x-auto">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            type="button"
            class="flex items-center gap-1.5 px-4 py-3 text-xs font-semibold transition-colors relative whitespace-nowrap shrink-0"
            :class="[
              activeTab === tab.value
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-800'
            ]"
            @click="activeTab = tab.value"
          >
            <UIcon :name="tab.icon" class="w-3.5 h-3.5" />
            {{ tab.label }}
            <UBadge
              v-if="tabCounts[tab.value] > 0"
              :label="String(tabCounts[tab.value])"
              size="xs"
              color="primary"
              class="ml-1"
            />
          </button>
        </div>

        <!-- Scrollable content -->
        <div class="flex-1 overflow-y-auto px-5 py-5 space-y-5">

          <!-- ── Basic Tab ──────────────────────────────────────────── -->
          <template v-if="activeTab === 'basic'">
            <!-- Demographics -->
            <section class="space-y-3">
              <h4 class="text-[10px] font-black uppercase tracking-widest text-primary">Demographics</h4>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1">Gender</label>
                  <USelectMenu
                    v-model="demog.gender"
                    :options="genderOptions"
                    placeholder="All genders"
                    class="w-full"
                    size="sm"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1">Age Category</label>
                  <USelectMenu
                    v-model="demog.is_minor"
                    :options="minorOptions"
                    value-attribute="value"
                    option-attribute="label"
                    placeholder="All ages"
                    class="w-full"
                    size="sm"
                  />
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">Age Range</label>
                <div class="grid grid-cols-2 gap-2">
                  <UInput v-model.number="demog.age_min" type="number" placeholder="Min age" min="0" max="120" size="sm" />
                  <UInput v-model.number="demog.age_max" type="number" placeholder="Max age" min="0" max="120" size="sm" />
                </div>
              </div>
            </section>

            <!-- Status -->
            <section class="space-y-3">
              <h4 class="text-[10px] font-black uppercase tracking-widest text-primary">Status</h4>
              <div class="grid grid-cols-2 gap-3">
                <UCheckbox v-model="stat.is_checked_in" label="Checked In" />
                <UCheckbox v-model="stat.is_registered" label="Registered" />
                <UCheckbox v-model="stat.is_cancelled" label="Cancelled" />
                <UCheckbox v-model="stat.is_staff" label="Event Staff" />
              </div>
            </section>

            <!-- Location & Organisation -->
            <section class="space-y-3">
              <h4 class="text-[10px] font-black uppercase tracking-widest text-primary">Location & Organisation</h4>
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">Organisation</label>
                <OrganisationSelect
                  :model-value="orgValue"
                  :multiple="true"
                  @update:model-value="onOrgChange"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">Location (Area From)</label>
                <LocationMultiSelect
                  :model-value="locationValue"
                  :allowed-types="['area']"
                  @update:model-value="onLocationChange"
                />
              </div>
            </section>

            <!-- Personal Needs -->
            <section class="space-y-3">
              <h4 class="text-[10px] font-black uppercase tracking-widest text-primary">Personal Needs</h4>
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <UCheckbox v-model="demog.has_dietary_requirements" />
                  <span class="text-sm text-gray-700">Has Dietary Requirements</span>
                </div>
                <div v-if="demog.has_dietary_requirements" class="pl-6">
                  <DietaryRequirementSelect v-model="demog.dietary_requirement" :multiple="true" />
                </div>
              </div>
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <UCheckbox v-model="demog.has_medical_conditions" />
                  <span class="text-sm text-gray-700">Has Medical Conditions</span>
                </div>
                <div v-if="demog.has_medical_conditions" class="pl-6">
                  <MedicalConditionSelect v-model="demog.medical_condition" :multiple="true" />
                </div>
              </div>
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <UCheckbox v-model="demog.has_accessibility_requirements" />
                  <span class="text-sm text-gray-700">Has Accessibility Requirements</span>
                </div>
                <div v-if="demog.has_accessibility_requirements" class="pl-6">
                  <AccessibilityRequirementSelect v-model="demog.accessibility_requirement" :multiple="true" />
                </div>
              </div>
            </section>
          </template>

          <!-- ── Questions Tab ─────────────────────────────────────── -->
          <template v-if="activeTab === 'questions'">
            <!-- Operator -->
            <div v-if="(localFilters.question_filter?.conditions ?? []).length > 1" class="flex items-center gap-2">
              <span class="text-xs font-semibold text-gray-600">Match answers with</span>
              <USelectMenu
                :model-value="localFilters.question_filter?.operator ?? 'AND'"
                :options="operatorOptions"
                size="xs"
                value-attribute="value"
                option-attribute="label"
                class="w-28"
                @update:model-value="updateQuestionOperator"
              />
              <span class="text-xs text-gray-400">
                ({{ localFilters.question_filter?.operator === 'OR' ? 'any condition' : 'all conditions' }})
              </span>
            </div>

            <!-- Empty state -->
            <div
              v-if="!(localFilters.question_filter?.conditions ?? []).length"
              class="rounded-xl border-2 border-dashed border-gray-200 p-6 text-center"
            >
              <UIcon name="i-heroicons-question-mark-circle" class="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p class="text-sm text-gray-500">No question filters added yet.</p>
              <p class="text-xs text-gray-400 mt-1">Add conditions to filter by question answers in this form.</p>
            </div>

            <!-- Condition rows -->
            <QuestionConditionRow
              v-for="(cond, idx) in (localFilters.question_filter?.conditions ?? [])"
              :key="idx"
              :model-value="cond"
              :question="getQuestionDetail(cond.question_id)"
              @update:model-value="updateQuestionCondition(idx, $event)"
              @remove="removeQuestionCondition(idx)"
            />

            <!-- Add question selector -->
            <div v-if="formId">
              <label class="block text-xs font-semibold text-gray-700 mb-1 mt-2">Add question filter</label>
              <EventFormQuestionSelect
                :model-value="null"
                :form-id="formId"
                :multiple="false"
                placeholder="Pick a question to add…"
                @select="onQuestionSelect"
              />
            </div>
          </template>
        </div>

        <!-- Footer actions -->
        <div class="shrink-0 flex items-center justify-between gap-3 px-5 py-4 border-t border-gray-200 bg-gray-50">
          <UButton
            label="Clear All"
            variant="ghost"
            color="gray"
            size="sm"
            @click="clearAll"
          />
          <div class="flex gap-2">
            <UButton
              label="Cancel"
              variant="outline"
              color="gray"
              size="sm"
              @click="$emit('update:modelValue', false)"
            />
            <UButton
              label="Apply Filters"
              size="sm"
              @click="applyFilters"
            />
          </div>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { FormResponseAdvancedFilters } from '~/composables/resources/events/useFormResponsesFilter'
import type { FormQuestionConditionRequest } from '~/api/types.gen'
import QuestionConditionRow from '~/components/attendees/filters/QuestionConditionRow.vue'
import type { QuestionDetail } from '~/components/attendees/filters/QuestionConditionRow.vue'
import EventFormQuestionSelect from '~/components/ui/EventFormQuestionSelect.vue'
import OrganisationSelect from '~/components/ui/OrganisationSelect.vue'
import LocationMultiSelect from '~/components/ui/LocationMultiSelect.vue'
import type { LocationMultiSelectValue } from '~/components/ui/LocationMultiSelect.vue'
import DietaryRequirementSelect from '~/components/ui/DietaryRequirementSelect.vue'
import MedicalConditionSelect from '~/components/ui/MedicalConditionSelect.vue'
import AccessibilityRequirementSelect from '~/components/ui/AccessibilityRequirementSelect.vue'
import { useEventFormQuestions } from '~/composables/resources/events/eventForms'

const props = defineProps<{
  modelValue: boolean
  filters: FormResponseAdvancedFilters
  formId?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'apply', filters: FormResponseAdvancedFilters): void
  (e: 'clear'): void
}>()

// ── Tabs ──────────────────────────────────────────────────────────────────────
type TabValue = 'basic' | 'questions'
const activeTab = ref<TabValue>('basic')

const tabs = [
  { value: 'basic' as const, label: 'Basic', icon: 'i-heroicons-user-group' },
  { value: 'questions' as const, label: 'Questions', icon: 'i-heroicons-document-text' },
]

// ── Local filter state ────────────────────────────────────────────────────────

function makeLocalFilters(source: FormResponseAdvancedFilters): FormResponseAdvancedFilters {
  return {
    demographics: { ...(source.demographics ?? {}) },
    status: { ...(source.status ?? {}) },
    question_filter: {
      operator: source.question_filter?.operator ?? 'AND',
      conditions: [...(source.question_filter?.conditions ?? [])],
    },
  }
}

const localFilters = ref<FormResponseAdvancedFilters>(makeLocalFilters(props.filters))

watch(
  () => props.filters,
  (f) => { localFilters.value = makeLocalFilters(f) },
  { deep: true },
)

// Typed section accessors
const demog = computed(() => localFilters.value.demographics as Record<string, any>)
const stat = computed(() => localFilters.value.status as Record<string, any>)

// ── Organisation / Location adapters ─────────────────────────────────────────

const orgValue = computed(() => localFilters.value.demographics?.organisation ?? [])
function onOrgChange(v: number | number[] | null) {
  if (v === null) localFilters.value.demographics!.organisation = []
  else if (Array.isArray(v)) localFilters.value.demographics!.organisation = v
  else localFilters.value.demographics!.organisation = [v]
}

const locationValue = computed<LocationMultiSelectValue>(() => ({
  area: (localFilters.value.demographics as any)?.area_from ?? [],
  chapter: (localFilters.value.demographics as any)?.chapter_from ?? [],
  cluster: (localFilters.value.demographics as any)?.cluster_from ?? [],
  country: (localFilters.value.demographics as any)?.country_from ?? [],
}))

function onLocationChange(v: LocationMultiSelectValue) {
  const d = localFilters.value.demographics as any
  d.area_from = v.area ?? []
  d.chapter_from = v.chapter ?? []
  d.cluster_from = v.cluster ?? []
  d.country_from = v.country ?? []
}

// ── Question conditions ───────────────────────────────────────────────────────

const operatorOptions = [
  { value: 'AND', label: 'AND (all)' },
  { value: 'OR', label: 'OR (any)' },
]

function updateQuestionOperator(op: 'AND' | 'OR') {
  localFilters.value.question_filter = {
    ...localFilters.value.question_filter,
    operator: op,
  }
}

function updateQuestionCondition(idx: number, updated: FormQuestionConditionRequest) {
  const conditions = [...(localFilters.value.question_filter?.conditions ?? [])]
  conditions[idx] = updated
  localFilters.value.question_filter = { ...localFilters.value.question_filter, conditions }
}

function removeQuestionCondition(idx: number) {
  const conditions = [...(localFilters.value.question_filter?.conditions ?? [])]
  conditions.splice(idx, 1)
  localFilters.value.question_filter = { ...localFilters.value.question_filter, conditions }
}

// Cache question details for rendering condition rows
const questionDetailsCache = ref<Map<number, QuestionDetail>>(new Map())

// Also fetch questions from the API so condition rows can show labels when loaded from state
const { data: formQuestionsData } = useEventFormQuestions(
  computed(() => props.formId ? { form: props.formId, page_size: 200, ordering: 'order' } : undefined),
  { enabled: computed(() => !!props.formId) },
)

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

function getQuestionDetail(questionId: number): QuestionDetail {
  if (questionDetailsCache.value.has(questionId)) {
    return questionDetailsCache.value.get(questionId)!
  }
  if (fetchedQuestionsMap.value.has(questionId)) {
    return fetchedQuestionsMap.value.get(questionId)!
  }
  return {
    id: questionId,
    title: `Question #${questionId}`,
    type: 'short_answer',
    typeDisplay: 'Short Answer',
    minValue: null,
    maxValue: null,
    options: [],
  }
}

function onQuestionSelect(detail: QuestionDetail | null) {
  // Cache the detail so the row can render immediately
  if (!detail) return
  questionDetailsCache.value = new Map(questionDetailsCache.value)
  questionDetailsCache.value.set(detail.id, detail)

  const newCondition: FormQuestionConditionRequest = {
    question_id: detail.id,
    type: detail.type as FormQuestionConditionRequest['type'],
  }
  const conditions = [...(localFilters.value.question_filter?.conditions ?? []), newCondition]
  localFilters.value.question_filter = { ...localFilters.value.question_filter, conditions }
}

// ── Tab counts ────────────────────────────────────────────────────────────────

function countDefined(obj: Record<string, unknown> | null | undefined): number {
  if (!obj) return 0
  let n = 0
  for (const v of Object.values(obj)) {
    if (v === undefined || v === null) continue
    if (Array.isArray(v) && v.length === 0) continue
    n++
  }
  return n
}

const tabCounts = computed<Record<TabValue, number>>(() => ({
  basic:
    countDefined(localFilters.value.demographics as any) +
    countDefined(localFilters.value.status as any),
  questions: (localFilters.value.question_filter?.conditions ?? []).length,
}))

// ── Static options ────────────────────────────────────────────────────────────

const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say']
const minorOptions = [
  { value: true, label: 'Minors only (under 18)' },
  { value: false, label: 'Adults only (18+)' },
]

// ── Actions ───────────────────────────────────────────────────────────────────

function applyFilters() {
  emit('apply', { ...localFilters.value })
  emit('update:modelValue', false)
}

function clearAll() {
  localFilters.value = { demographics: {}, status: {}, question_filter: { operator: 'AND', conditions: [] } }
  emit('clear')
  emit('update:modelValue', false)
}
</script>
