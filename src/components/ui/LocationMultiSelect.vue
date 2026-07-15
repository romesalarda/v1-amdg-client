<template>
  <div ref="containerRef">
    <!-- Trigger -->
    <div
      class="w-full px-4 py-3 bg-mist-blue border border-transparent focus-within:border-primary rounded-xl flex items-center gap-2 cursor-pointer transition-all min-h-[48px]"
      :class="{ 'border-red-500 focus-within:border-red-500': hasError }"
      @click="openDropdown"
    >
      <span class="material-symbols-outlined text-primary text-base shrink-0">location_on</span>

      <!-- Selected chips (≤3 inline, then "+N more") -->
      <div v-if="selectedItems.length > 0 && !isOpen" class="flex flex-wrap gap-1 flex-1 min-w-0">
        <span
          v-for="item in visibleChips"
          :key="`${item.type}-${item.id}`"
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
          :class="typeBadgeClass(item.type)"
        >
          {{ item.label }}
          <button
            type="button"
            class="hover:opacity-70 transition-opacity"
            @click.stop="removeItem(item.type, item.id)"
          >
            <span class="material-symbols-outlined" style="font-size: 12px">close</span>
          </button>
        </span>
        <span v-if="selectedItems.length > MAX_VISIBLE_CHIPS" class="text-xs font-semibold text-primary self-center">
          +{{ selectedItems.length - MAX_VISIBLE_CHIPS }} more
        </span>
      </div>

      <!-- Search input -->
      <input
        ref="inputRef"
        v-model="searchQuery"
        type="text"
        class="flex-1 bg-transparent text-sm font-medium text-navy-900 outline-none placeholder:text-navy-400 min-w-0"
        :placeholder="triggerPlaceholder"
        @focus="openDropdown"
        @keydown.escape="closeDropdown"
        @keydown.arrow-down.prevent="highlightNext"
        @keydown.arrow-up.prevent="highlightPrev"
        @keydown.enter.prevent="selectHighlighted"
      />

      <button
        v-if="selectedItems.length > 0"
        class="material-symbols-outlined text-navy-400 text-base shrink-0 hover:text-red-500 transition-colors"
        type="button"
        @click.stop="clearAll"
      >close</button>
      <span
        v-else
        class="material-symbols-outlined text-navy-400 text-base shrink-0 transition-transform"
        :class="{ 'rotate-180': isOpen }"
      >expand_more</span>
    </div>

    <!-- Dropdown -->
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
          <div v-if="!canSearch" class="py-4 text-center text-sm text-navy-400">
            Type at least {{ minSearchLength }} characters to search.
          </div>

          <div v-else-if="isLoading" class="flex items-center justify-center gap-2 py-4 text-sm text-navy-400">
            <span class="material-symbols-outlined text-base animate-spin">progress_activity</span>
            Searching locations…
          </div>

          <div v-else-if="!options.length" class="py-4 text-center text-sm text-navy-400">
            No locations found<template v-if="searchQuery"> for "{{ searchQuery }}"</template>.
          </div>

          <ul v-else class="max-h-64 overflow-y-auto py-1">
            <li
              v-for="(option, index) in options"
              :key="`${option.type}-${option.id}`"
              :ref="el => setItemRef(el, index)"
              class="flex items-center gap-3 px-4 py-2.5 cursor-pointer text-sm font-medium transition-colors"
              :class="[
                isSelected(option.type, option.id) ? 'bg-primary/10 text-primary' : 'text-navy-800 hover:bg-mist-blue',
                index === highlightedIndex ? 'bg-mist-blue' : '',
              ]"
              @click="toggleOption(option)"
              @mouseenter="highlightedIndex = index"
            >
              <span
                class="material-symbols-outlined text-base shrink-0"
                :class="isSelected(option.type, option.id) ? 'text-primary' : 'text-navy-300'"
              >{{ isSelected(option.type, option.id) ? 'check_box' : 'check_box_outline_blank' }}</span>
              <span class="truncate flex-1">{{ option.label }}</span>
              <span
                class="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded shrink-0"
                :class="typeBadgeClass(option.type)"
              >{{ option.typeLabel }}</span>
            </li>
          </ul>

          <!-- Selected count footer -->
          <div v-if="selectedItems.length > 0" class="px-4 py-2 border-t border-gray-100 flex items-center justify-between bg-gray-50">
            <span class="text-xs text-gray-500">{{ selectedItems.length }} selected</span>
            <button type="button" class="text-xs text-red-500 hover:text-red-700 font-medium" @click="clearAll">Clear all</button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount, type CSSProperties } from 'vue'
import { useLocationSearch, type LocationType, type LocationSearchOption } from '~/composables/resources/locations/useLocationSearch'

// ── Types ─────────────────────────────────────────────────────────────────────

export type LocationMultiSelectValue = {
  area?: number[]
  chapter?: number[]
  cluster?: number[]
  country?: number[]
}

type SelectedItem = {
  id: number
  type: LocationType
  label: string
}

// ── Props & emits ─────────────────────────────────────────────────────────────

const props = withDefaults(defineProps<{
  modelValue?: LocationMultiSelectValue
  allowedTypes?: LocationType[]
  extraParams?: Record<string, any>
  placeholder?: string
  hasError?: boolean
  minSearchLength?: number
}>(), {
  modelValue: () => ({}),
  allowedTypes: () => ['area'],
  extraParams: () => ({}),
  placeholder: 'Search location…',
  hasError: false,
  minSearchLength: 2,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: LocationMultiSelectValue): void
}>()

// ── Internal state ────────────────────────────────────────────────────────────

const MAX_VISIBLE_CHIPS = 3

const isOpen = ref(false)
const searchQuery = ref('')
const highlightedIndex = ref(-1)
const containerRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const itemRefs = ref<Array<HTMLElement | null>>([])
const dropdownStyle = ref<CSSProperties>({})

// Tracks selected items with labels (label resolved at pick-time or on mount)
const selectedItems = ref<SelectedItem[]>([])

const { options, isLoading, canSearch } = useLocationSearch(
  searchQuery,
  computed(() => props.allowedTypes),
  computed(() => props.extraParams),
  computed(() => props.minSearchLength),
)

// ── Sync modelValue → selectedItems when prop changes externally ──────────────

function syncFromModelValue(val: LocationMultiSelectValue) {
  const next: SelectedItem[] = []
  const types: LocationType[] = ['area', 'chapter', 'cluster', 'country']
  for (const t of types) {
    const ids = val[t] || []
    for (const id of ids) {
      // Preserve existing resolved label if already known
      const existing = selectedItems.value.find(x => x.type === t && x.id === id)
      next.push({ id, type: t, label: existing?.label ?? String(id) })
    }
  }
  selectedItems.value = next
}

// Resolve labels from API results when they come in (catches pre-selected IDs)
watch(options, (newOptions) => {
  const unresolvedIds = new Set(
    selectedItems.value.filter(x => x.label === String(x.id)).map(x => `${x.type}:${x.id}`)
  )
  if (unresolvedIds.size === 0) return
  let changed = false
  const updated = selectedItems.value.map(item => {
    if (item.label !== String(item.id)) return item
    const match = newOptions.find(o => o.type === item.type && o.id === item.id)
    if (match) { changed = true; return { ...item, label: match.label } }
    return item
  })
  if (changed) selectedItems.value = updated
})

watch(() => props.modelValue, (val) => syncFromModelValue(val ?? {}), { deep: true })

onMounted(() => syncFromModelValue(props.modelValue ?? {}))

// ── Derived value builder ─────────────────────────────────────────────────────

function buildModelValue(): LocationMultiSelectValue {
  const out: LocationMultiSelectValue = {}
  const types: LocationType[] = ['area', 'chapter', 'cluster', 'country']
  for (const t of types) {
    const ids = selectedItems.value.filter(x => x.type === t).map(x => x.id)
    if (ids.length > 0) out[t] = ids
  }
  return out
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const visibleChips = computed(() => selectedItems.value.slice(0, MAX_VISIBLE_CHIPS))

const triggerPlaceholder = computed(() => {
  if (selectedItems.value.length > 0) return 'Search to add more…'
  return props.placeholder
})

function isSelected(type: LocationType, id: number): boolean {
  return selectedItems.value.some(x => x.type === type && x.id === id)
}

function typeBadgeClass(type: LocationType): string {
  const map: Record<LocationType, string> = {
    area: 'bg-blue-100 text-blue-700',
    chapter: 'bg-green-100 text-green-700',
    cluster: 'bg-orange-100 text-orange-700',
    country: 'bg-purple-100 text-purple-700',
  }
  return map[type] ?? 'bg-gray-100 text-gray-600'
}

// ── Selection logic ───────────────────────────────────────────────────────────

function toggleOption(option: LocationSearchOption) {
  if (isSelected(option.type, option.id)) {
    selectedItems.value = selectedItems.value.filter(x => !(x.type === option.type && x.id === option.id))
  }
  else {
    selectedItems.value = [...selectedItems.value, { id: option.id, type: option.type, label: option.label }]
  }
  emit('update:modelValue', buildModelValue())
  searchQuery.value = ''
  // keep dropdown open for multi-select
}

function removeItem(type: LocationType, id: number) {
  selectedItems.value = selectedItems.value.filter(x => !(x.type === type && x.id === id))
  emit('update:modelValue', buildModelValue())
}

function clearAll() {
  selectedItems.value = []
  emit('update:modelValue', {})
}

// ── Dropdown open/close ───────────────────────────────────────────────────────

function openDropdown() {
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

// ── Keyboard navigation ───────────────────────────────────────────────────────

function setItemRef(el: unknown, index: number) {
  itemRefs.value[index] = el as HTMLElement | null
}

function highlightNext() {
  if (!isOpen.value) { openDropdown(); return }
  const max = options.value.length - 1
  highlightedIndex.value = Math.min(highlightedIndex.value + 1, max)
  scrollToHighlighted()
}

function highlightPrev() {
  highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
  scrollToHighlighted()
}

function selectHighlighted() {
  const option = options.value[highlightedIndex.value]
  if (option) toggleOption(option)
}

function scrollToHighlighted() {
  nextTick(() => itemRefs.value[highlightedIndex.value]?.scrollIntoView({ block: 'nearest' }))
}

// ── Dropdown positioning ──────────────────────────────────────────────────────

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

onMounted(() => {
  document.addEventListener('mousedown', handleOutsideClick)
  window.addEventListener('resize', handleViewportChange)
  window.addEventListener('scroll', handleViewportChange, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleOutsideClick)
  window.removeEventListener('resize', handleViewportChange)
  window.removeEventListener('scroll', handleViewportChange, true)
})
</script>
