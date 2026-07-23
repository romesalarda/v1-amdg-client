<template>
  <div ref="containerRef" class="w-full min-w-0">
    <div
      class="w-full min-w-0 px-4 py-3 bg-mist-blue border border-transparent focus-within:border-primary rounded-xl flex items-center gap-2 cursor-pointer transition-all"
      @mousedown.prevent="openDropdown"
    >
      <span class="material-symbols-outlined text-primary text-base shrink-0">dynamic_form</span>
      <input
        ref="inputRef"
        v-model="searchQuery"
        type="text"
        class="flex-1 bg-transparent text-sm font-medium text-navy-900 outline-none placeholder:text-navy-400 min-w-0"
        :placeholder="multiple ? (multiTriggerLabel || placeholder) : (selectedLabel || placeholder)"
        @keydown.escape="closeDropdown"
        @keydown.arrow-down.prevent="highlightNext"
        @keydown.arrow-up.prevent="highlightPrev"
        @keydown.enter.prevent="selectHighlighted"
      />
      <!-- Single mode: show selected label -->
      <span
        v-if="!multiple && selectedLabel && !searchQuery"
        class="shrink min-w-0 text-xs font-bold text-primary truncate max-w-[180px]"
      >{{ selectedLabel }}</span>
      <!-- Multi mode: show badge with count -->
      <span
        v-if="multiple && multiValues.length > 0 && !searchQuery"
        class="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0"
      >{{ multiValues.length }}</span>
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

    <!-- Multi mode: selected tag chips -->
    <div v-if="multiple && multiValues.length > 0" class="flex flex-wrap gap-1.5 mt-2">
      <span
        v-for="id in multiValues"
        :key="id"
        class="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-lg"
      >
        {{ allOptions.find(o => o.id === id)?.title || id }}
        <button
          class="material-symbols-outlined text-xs hover:text-red-500 transition-colors leading-none"
          type="button"
          @click.stop="selectItem(id, '')"
        >close</button>
      </span>
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
          <div v-if="!eventSlug" class="py-4 text-center text-sm text-navy-400">
            Select an event to load forms
          </div>

          <div v-else-if="isLoading" class="flex items-center justify-center gap-2 py-4 text-sm text-navy-400">
            <span class="material-symbols-outlined text-base animate-spin">progress_activity</span>
            Loading forms…
          </div>

          <div v-else-if="!filteredOptions.length" class="py-4 text-center text-sm text-navy-400">
            No forms found
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
                  :class="[
                    isSelected(option.id) ? 'text-primary/70' : 'text-navy-400',
                    option.statusColor,
                  ]"
                >{{ option.statusDisplay }}</span>
              </div>
            </li>
          </ul>
          <!-- Multi mode: footer with done button -->
          <div v-if="multiple && filteredOptions.length > 0" class="border-t border-navy-100 px-4 py-2 flex justify-between items-center">
            <span class="text-xs text-navy-400">{{ multiValues.length }} selected</span>
            <button class="text-xs font-semibold text-primary hover:text-primary/80 transition-colors" type="button" @click="closeDropdown">Done</button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount, type CSSProperties } from 'vue'
import { useEventForms } from '~/composables/resources/events/eventForms'

const props = withDefaults(defineProps<{
  modelValue?: string | string[] | null
  eventSlug?: string
  placeholder?: string
  multiple?: boolean
}>(), {
  modelValue: null,
  placeholder: 'Select a form…',
  multiple: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | string[] | null): void
}>()

const isOpen = ref(false)
const searchQuery = ref('')
const highlightedIndex = ref(-1)
const selectedLabel = ref('')
const containerRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const itemRefs = ref<Array<HTMLElement | null>>([])
const dropdownStyle = ref<CSSProperties>({})

const query = useEventForms(
  computed(() => ({
    event: props.eventSlug || undefined,
    page_size: 100,
    ordering: '-created_at',
  })),
  { enabled: computed(() => !!props.eventSlug) },
)

const isLoading = query.isLoading

const statusColorMap: Record<string, string> = {
  published: 'text-green-600',
  draft: 'text-amber-500',
  closed: 'text-gray-400',
}

const allOptions = computed(() => {
  const rows = query.data.value?.data?.results || []
  return rows.map((r: any) => ({
    id: String(r.id || '').trim(),
    title: String(r.title || '').trim(),
    statusDisplay: String(r.status_display || r.status || '').trim(),
    statusColor: statusColorMap[r.status] ?? 'text-navy-400',
  })).filter((r) => r.id.length > 0 && r.title.length > 0)
})

const filteredOptions = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return allOptions.value
  return allOptions.value.filter((o) => o.title.toLowerCase().includes(q))
})

// ── Multi-select helpers ────────────────────────────────────────────────────

const multiValues = computed<string[]>(() => {
  if (!props.multiple) return []
  return Array.isArray(props.modelValue) ? (props.modelValue as string[]) : []
})

const hasAnyValue = computed(() =>
  props.multiple ? multiValues.value.length > 0 : (props.modelValue != null && props.modelValue !== ''),
)

function isSelected(id: string): boolean {
  if (props.multiple) return multiValues.value.includes(id)
  return props.modelValue === id
}

// Multi-select trigger label: show names of selected forms, or count
const multiTriggerLabel = computed(() => {
  if (!props.multiple || multiValues.value.length === 0) return ''
  const names = multiValues.value
    .map(id => allOptions.value.find(o => o.id === id)?.title)
    .filter(Boolean)
  if (names.length === 0) return `${multiValues.value.length} form(s) selected`
  if (names.length === 1) return names[0]!
  return `${names.length} forms`
})

watch(allOptions, (opts) => {
  if (props.multiple || !props.modelValue) return
  const selected = opts.find((o) => o.id === props.modelValue)
  if (selected) selectedLabel.value = selected.title
}, { immediate: true })

watch(() => props.modelValue, (val) => {
  if (!props.multiple && !val) selectedLabel.value = ''
})

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

function selectItem(id: string, label: string) {
  if (props.multiple) {
    const current = multiValues.value
    const idx = current.indexOf(id)
    emit('update:modelValue', idx === -1 ? [...current, id] : current.filter(v => v !== id))
    searchQuery.value = ''
    // Keep dropdown open in multi-select mode
  } else {
    selectedLabel.value = label
    emit('update:modelValue', id)
    closeDropdown()
  }
}

function clearSelection() {
  selectedLabel.value = ''
  emit('update:modelValue', props.multiple ? [] : null)
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
  const viewportWidth = window.innerWidth
  const dropdownWidth = Math.round(rect.width)
  const leftPos = Math.round(rect.left)
  const clampedLeft = Math.max(8, Math.min(leftPos, viewportWidth - dropdownWidth - 8))

  dropdownStyle.value = {
    top: `${top}px`,
    left: `${clampedLeft}px`,
    width: `${Math.min(dropdownWidth, viewportWidth - 16)}px`,
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
