<template>
  <div ref="containerRef">
    <div
      class="w-full px-4 py-3 bg-mist-blue border border-transparent focus-within:border-primary rounded-xl flex items-center gap-2 cursor-pointer transition-all"
      :class="{ 'border-red-500 focus-within:border-red-500': hasError }"
      @click="openDropdown"
    >
      <span class="material-symbols-outlined text-primary text-base shrink-0">confirmation_number</span>
      <input
        ref="inputRef"
        v-model="searchQuery"
        type="text"
        class="flex-1 bg-transparent text-sm font-medium text-navy-900 outline-none placeholder:text-navy-400 min-w-0"
        :placeholder="selectedLabel || placeholder"
        @focus="openDropdown"
        @keydown.escape="closeDropdown"
        @keydown.arrow-down.prevent="highlightNext"
        @keydown.arrow-up.prevent="highlightPrev"
        @keydown.enter.prevent="selectHighlighted"
      />
      <span
        v-if="selectedLabel && !searchQuery"
        class="text-xs font-bold text-primary truncate max-w-[180px]"
      >{{ selectedLabel }}</span>
      <span class="material-symbols-outlined text-navy-400 text-base shrink-0 transition-transform" :class="{ 'rotate-180': isOpen }">
        expand_more
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
          <div v-if="!canSearch" class="py-4 text-center text-sm text-navy-400">
            Type at least {{ minSearchLength }} characters to search ticket types.
          </div>

          <div v-else-if="isLoading" class="flex items-center justify-center gap-2 py-4 text-sm text-navy-400">
            <span class="material-symbols-outlined text-base animate-spin">progress_activity</span>
            Searching ticket types...
          </div>

          <div v-else-if="!options.length" class="py-4 text-center text-sm text-navy-400">
            No ticket types found for "{{ searchQuery }}"
          </div>

          <ul v-else class="max-h-56 overflow-y-auto py-1">
            <li
              v-for="(option, index) in options"
              :key="option.id"
              :ref="el => setItemRef(el, index)"
              class="flex items-center gap-3 px-4 py-2.5 cursor-pointer text-sm font-medium transition-colors"
              :class="[
                option.id === modelValue ? 'bg-primary text-white' : 'text-navy-800 hover:bg-mist-blue',
                index === highlightedIndex ? 'bg-mist-blue' : '',
              ]"
              @click="selectOption(option)"
              @mouseenter="highlightedIndex = index"
            >
              <span
                class="material-symbols-outlined text-base shrink-0"
                :class="option.id === modelValue ? 'text-white' : 'text-primary'"
              >check_circle</span>
              <span class="truncate">{{ option.title }}</span>
              <span
                class="ml-auto text-xs font-mono shrink-0"
                :class="option.id === modelValue ? 'text-white/70' : 'text-navy-400'"
              >{{ option.code }}</span>
            </li>
          </ul>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onBeforeUnmount, computed, type CSSProperties } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useBookingTicketTypes } from '~/composables/resources/booking/bookingTicketTypes'

export type TicketTypeSearchOption = {
  id: number
  code: string
  title: string
}

const props = withDefaults(defineProps<{
  modelValue?: number | null
  selectedLabel?: string | null
  placeholder?: string
  hasError?: boolean
  minSearchLength?: number
  eventId?: string | null
}>(), {
  modelValue: null,
  selectedLabel: null,
  placeholder: 'Search ticket type (min 2 chars)',
  hasError: false,
  minSearchLength: 2,
  eventId: null,
})

const emit = defineEmits<{
  (e: 'select', id: number, code: string, title: string): void
}>()

const isOpen = ref(false)
const searchQuery = ref('')
const highlightedIndex = ref(-1)
const containerRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const itemRefs = ref<Array<HTMLElement | null>>([])
const dropdownStyle = ref<CSSProperties>({})

// ── Debounced search ───────────────────────────────────────────────────────

const debouncedSearch = ref('')

const updateDebounced = useDebounceFn((value: string) => {
  debouncedSearch.value = value
}, 300)

watch(searchQuery, (value) => {
  updateDebounced(value)
})

const normalizedQuery = computed(() => debouncedSearch.value.trim())
const canSearch = computed(() => normalizedQuery.value.length >= props.minSearchLength)

// ── Query ──────────────────────────────────────────────────────────────────

const queryParams = computed(() =>
  canSearch.value
    ? {
        search: normalizedQuery.value,
        page_size: 10,
        ...(props.eventId ? { event: props.eventId } : {}),
      }
    : undefined,
)

const { data, isFetching: isLoading } = useBookingTicketTypes(queryParams)

const options = computed<TicketTypeSearchOption[]>(() => {
  const results = data.value?.data?.results ?? []
  return results.map((row) => ({
    id: row.id,
    code: row.code,
    title: row.title,
  }))
})

// ── Dropdown helpers ───────────────────────────────────────────────────────

function setItemRef(el: unknown, index: number) {
  itemRefs.value[index] = el as HTMLElement | null
}

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

function selectOption(option: TicketTypeSearchOption) {
  emit('select', option.id, option.code, option.title)
  closeDropdown()
}

function highlightNext() {
  if (!isOpen.value) {
    openDropdown()
    return
  }
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
  if (option) {
    selectOption(option)
  }
}

function scrollToHighlighted() {
  nextTick(() => {
    itemRefs.value[highlightedIndex.value]?.scrollIntoView({ block: 'nearest' })
  })
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
  if (containerRef.value?.contains(target) || dropdownRef.value?.contains(target)) {
    return
  }
  if (isOpen.value) {
    closeDropdown()
  }
}

function handleViewportChange() {
  if (isOpen.value) {
    updateDropdownPosition()
  }
}

watch(isOpen, (value) => {
  if (value) {
    nextTick(updateDropdownPosition)
  }
})

onMounted(() => {
  document.addEventListener('mousedown', handleOutsideClick)
  window.addEventListener('scroll', handleViewportChange, true)
  window.addEventListener('resize', handleViewportChange)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleOutsideClick)
  window.removeEventListener('scroll', handleViewportChange, true)
  window.removeEventListener('resize', handleViewportChange)
})
</script>
