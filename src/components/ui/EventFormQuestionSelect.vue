<template>
  <div ref="containerRef">
    <div
      class="w-full px-4 py-3 bg-mist-blue border border-transparent focus-within:border-primary rounded-xl flex items-center gap-2 cursor-pointer transition-all"
      :class="{ 'opacity-50 cursor-not-allowed': activeFormIds.length === 0 }"
      @mousedown.prevent="activeFormIds.length > 0 ? openDropdown() : undefined"
    >
      <span class="material-symbols-outlined text-primary text-base shrink-0">quiz</span>
      <input
        ref="inputRef"
        v-model="searchQuery"
        type="text"
        class="flex-1 bg-transparent text-sm font-medium text-navy-900 outline-none placeholder:text-navy-400 min-w-0"
        :placeholder="selectedLabel || placeholder"
        :disabled="activeFormIds.length === 0"
        @keydown.escape="closeDropdown"
        @keydown.arrow-down.prevent="highlightNext"
        @keydown.arrow-up.prevent="highlightPrev"
        @keydown.enter.prevent="selectHighlighted"
      />
      <span
        v-if="selectedLabel && !searchQuery"
        class="text-xs font-bold text-primary truncate max-w-[180px]"
      >{{ selectedLabel }}</span>
      <button
        v-if="hasAnyValue"
        class="material-symbols-outlined text-navy-400 text-base shrink-0 hover:text-red-500 transition-colors"
        type="button"
        @click.stop="clearSelection"
      >close</button>
      <span
        v-else
        class="material-symbols-outlined text-navy-400 text-base shrink-0 transition-transform"
        :class="{ 'rotate-180': isOpen }"
      >expand_more</span>
    </div>

    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-150"
        enter-from-class="opacity-0 translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-1"
      >
        <div
          v-if="isOpen"
          ref="dropdownRef"
          class="fixed bg-white border border-navy-100 rounded-xl shadow-lg overflow-hidden"
          :style="dropdownStyle"
        >
          <div v-if="isLoading" class="flex items-center justify-center gap-2 py-4 text-sm text-navy-400">
            <span class="material-symbols-outlined text-base animate-spin">progress_activity</span>
            Loading questions…
          </div>

          <div v-else-if="!filteredOptions.length" class="py-4 text-center text-sm text-navy-400">
            No questions found
          </div>

          <ul v-else class="max-h-64 overflow-y-auto py-1">
            <li
              v-for="(option, index) in filteredOptions"
              :key="option.id"
              :ref="(el) => setItemRef(el, index)"
              class="flex items-center gap-3 px-4 py-2.5 cursor-pointer text-sm font-medium transition-colors"
              :class="[
                isSelected(option.id) ? 'bg-primary/10 text-primary' : 'text-navy-800 hover:bg-mist-blue',
                index === highlightedIndex ? 'bg-mist-blue' : '',
              ]"
              @click="selectItem(option.id, option.title)"
              @mouseenter="highlightedIndex = index"
            >
              <span
                class="material-symbols-outlined text-base shrink-0"
                :class="isSelected(option.id) ? 'text-primary' : 'text-navy-300'"
              >{{ multiple ? (isSelected(option.id) ? 'check_box' : 'check_box_outline_blank') : (isSelected(option.id) ? 'check_circle' : 'radio_button_unchecked') }}</span>
              <div class="flex flex-col min-w-0">
                <span class="truncate">{{ option.title }}</span>
                <span
                  class="text-xs truncate"
                  :class="isSelected(option.id) ? 'text-primary/70' : 'text-navy-400'"
                >{{ option.typeDisplay }}</span>
              </div>
            </li>
          </ul>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount, type CSSProperties } from 'vue'
import { useQueries } from '@tanstack/vue-query'
import { eventFormQuestionsList } from '~/api/sdk.gen'

type QuestionOption = {
  id: number
  title: string
  type: string
  typeDisplay: string
  minValue: number | null
  maxValue: number | null
  options: { id: number; option_text: string }[]
}

const props = withDefaults(defineProps<{
  modelValue?: number | null | number[]
  formId?: string | null
  /** Preferred over formId when multiple forms are selected */
  formIds?: string[] | null
  multiple?: boolean
  placeholder?: string
}>(), {
  modelValue: null,
  formId: null,
  formIds: null,
  multiple: false,
  placeholder: 'Select a question…',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | null | number[]): void
  /** Emitted with the full option object so callers can react to question type */
  (e: 'select', option: QuestionOption | null): void
  /** Emitted with all currently selected option details (useful for multi-select) */
  (e: 'selections', options: QuestionOption[]): void
}>()

const isOpen = ref(false)
const searchQuery = ref('')
const highlightedIndex = ref(-1)
const singleLabel = ref('')
const selectedLabel = computed(() => singleLabel.value)
const containerRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const itemRefs = ref<Array<HTMLElement | null>>([])
const dropdownStyle = ref<CSSProperties>({})

// ── Query: support single formId or array of formIds ─────────────────────────

const activeFormIds = computed<string[]>(() => {
  if (props.formIds && props.formIds.length > 0) return props.formIds
  if (props.formId) return [props.formId]
  return []
})

const questionQueries = useQueries({
  queries: computed(() =>
    activeFormIds.value.map((fid) => ({
      queryKey: ['eventFormQuestions', 'list', { form: fid, page_size: 200, ordering: 'order' }] as const,
      queryFn: () => eventFormQuestionsList({ query: { form: fid, page_size: 200, ordering: 'order' } }),
      enabled: !!fid,
    }))
  ),
})

const isLoading = computed(() => questionQueries.value.some((q) => q.isLoading))

const allOptions = computed<QuestionOption[]>(() => {
  const seenIds = new Set<number>()
  const results: QuestionOption[] = []
  for (const q of questionQueries.value) {
    const rows = (q.data as any)?.data?.results || []
    for (const r of rows) {
      const id = Number(r.id)
      if (!seenIds.has(id)) {
        seenIds.add(id)
        results.push({
          id,
          title: String(r.question_title || '').trim(),
          type: String(r.question_type || ''),
          typeDisplay: String(r.question_type_display || r.question_type || '').trim(),
          minValue: r.min_value ?? null,
          maxValue: r.max_value ?? null,
          options: (r.options || []) as { id: number; option_text: string }[],
        })
      }
    }
  }
  return results.filter((r) => Number.isFinite(r.id) && r.title.length > 0)
})

const filteredOptions = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return allOptions.value
  return allOptions.value.filter((o) => o.title.toLowerCase().includes(q))
})

// ── Multi-select helpers ────────────────────────────────────────────────────

const multiValues = computed<number[]>(() => {
  if (!props.multiple) return []
  return Array.isArray(props.modelValue) ? (props.modelValue as number[]) : []
})

const hasAnyValue = computed(() =>
  props.multiple ? multiValues.value.length > 0 : props.modelValue != null,
)

function isSelected(id: number): boolean {
  if (props.multiple) return multiValues.value.includes(id)
  return props.modelValue === id
}

// ── Label resolution ────────────────────────────────────────────────────────

watch(allOptions, (opts) => {
  if (props.multiple || !props.modelValue) return
  const selected = opts.find((o) => o.id === props.modelValue)
  if (selected) singleLabel.value = selected.title
}, { immediate: true })

watch(() => props.modelValue, (val) => {
  if (!props.multiple && !val) singleLabel.value = ''
})

// Reset when form(s) change — only reset the visual label; the parent
// (EventFormFilterPanel) already clears formAnsweredQuestions in onFormsChange,
// so emitting update:modelValue here would create a redundant mutation that
// re-enters EventFormFilterPanel's deep watcher and causes an infinite loop.
watch(activeFormIds, () => {
  singleLabel.value = ''
}, { deep: true })

// Emit selections whenever modelValue or allOptions changes (multi-mode)
watch([() => props.modelValue, allOptions], () => {
  if (!props.multiple) return
  const ids = Array.isArray(props.modelValue) ? (props.modelValue as number[]) : []
  const details = ids.map(id => allOptions.value.find(o => o.id === id)).filter(Boolean) as QuestionOption[]
  emit('selections', details)
}, { deep: true })

// ── Dropdown ────────────────────────────────────────────────────────────────

function setItemRef(el: unknown, index: number) {
  itemRefs.value[index] = el as HTMLElement | null
}

function openDropdown() {
  if (isOpen.value) return
  isOpen.value = true
  highlightedIndex.value = -1
  nextTick(() => {
    inputRef.value?.focus()
    updateDropdownPosition()
  })
}

function closeDropdown() {
  isOpen.value = false
  searchQuery.value = ''
  highlightedIndex.value = -1
  dropdownStyle.value = {}
}

function selectItem(id: number, title: string) {
  const option = allOptions.value.find((o) => o.id === id) ?? null

  if (props.multiple) {
    const current = multiValues.value
    const idx = current.indexOf(id)
    const next = idx === -1 ? [...current, id] : current.filter(v => v !== id)
    emit('update:modelValue', next)
    searchQuery.value = ''
    // Emit selections with updated set
    const details = next.map(nid => allOptions.value.find(o => o.id === nid)).filter(Boolean) as QuestionOption[]
    emit('selections', details)
  } else {
    singleLabel.value = title
    emit('update:modelValue', id)
    emit('select', option)
    emit('selections', option ? [option] : [])
    closeDropdown()
  }
}

function clearSelection() {
  singleLabel.value = ''
  emit('update:modelValue', props.multiple ? [] : null)
  emit('select', null)
  emit('selections', [])
}

function highlightNext() {
  if (!isOpen.value) { openDropdown(); return }
  highlightedIndex.value = Math.min(highlightedIndex.value + 1, filteredOptions.value.length - 1)
  scrollToHighlighted()
}

function highlightPrev() {
  highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
  scrollToHighlighted()
}

function selectHighlighted() {
  const option = filteredOptions.value[highlightedIndex.value]
  if (option) selectItem(option.id, option.title)
}

function scrollToHighlighted() {
  nextTick(() => { itemRefs.value[highlightedIndex.value]?.scrollIntoView({ block: 'nearest' }) })
}

function updateDropdownPosition() {
  const trigger = containerRef.value?.firstElementChild as HTMLElement | null
  if (!trigger) return
  const rect = trigger.getBoundingClientRect()
  const top = Math.round(rect.bottom + 8)
  const maxHeight = Math.max(160, window.innerHeight - top - 16)
  dropdownStyle.value = {
    top: `${top}px`,
    left: `${Math.round(rect.left)}px`,
    width: `${Math.round(rect.width)}px`,
    maxHeight: `${maxHeight}px`,
    zIndex: '9999',
  }
}

function handleOutsideClick(event: MouseEvent) {
  const target = event.target as Node
  if (containerRef.value?.contains(target) || dropdownRef.value?.contains(target)) return
  if (isOpen.value) closeDropdown()
}

function handleViewportChange() {
  if (isOpen.value) updateDropdownPosition()
}

watch(isOpen, (value) => {
  if (value) {
    window.addEventListener('resize', handleViewportChange)
    window.addEventListener('scroll', handleViewportChange, true)
  } else {
    window.removeEventListener('resize', handleViewportChange)
    window.removeEventListener('scroll', handleViewportChange, true)
  }
})

onMounted(() => { document.addEventListener('mousedown', handleOutsideClick) })
onBeforeUnmount(() => { document.removeEventListener('mousedown', handleOutsideClick) })
</script>
