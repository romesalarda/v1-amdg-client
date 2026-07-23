<template>
  <div ref="containerRef" class="w-full min-w-0">
    <!-- Input trigger -->
    <div
      class="w-full min-w-0 px-4 py-3 bg-mist-blue border border-transparent focus-within:border-primary rounded-xl flex items-center gap-2 cursor-pointer transition-all"
      :class="{ 'border-red-500 focus-within:border-red-500': hasError }"
      @click="openDropdown"
    >
      <span class="material-symbols-outlined text-primary text-base shrink-0">public</span>
      <input
        ref="inputRef"
        v-model="searchQuery"
        type="text"
        class="flex-1 bg-transparent text-sm font-medium text-navy-900 outline-none placeholder:text-navy-400 min-w-0"
        :placeholder="modelValue || 'Search timezone…'"
        @focus="openDropdown"
        @keydown.escape="closeDropdown"
        @keydown.arrow-down.prevent="highlightNext"
        @keydown.arrow-up.prevent="highlightPrev"
        @keydown.enter.prevent="selectHighlighted"
      />
      <span
        v-if="modelValue && !searchQuery"
        class="shrink min-w-0 text-xs font-bold text-primary truncate max-w-[180px]"
      >{{ modelValue }}</span>
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
          <!-- Loading -->
          <div v-if="isLoading" class="flex items-center justify-center gap-2 py-4 text-sm text-navy-400">
            <span class="material-symbols-outlined text-base animate-spin">progress_activity</span>
            Loading timezones…
          </div>

          <!-- Empty -->
          <div v-else-if="!filteredTimezones.length" class="py-4 text-center text-sm text-navy-400">
            No timezones found for "{{ searchQuery }}"
          </div>

          <!-- List -->
          <ul v-else ref="listRef" class="max-h-56 overflow-y-auto py-1">
            <li
              v-for="(tz, index) in filteredTimezones"
              :key="tz"
              :ref="el => setItemRef(el, index)"
              class="flex items-center gap-3 px-4 py-2.5 cursor-pointer text-sm font-medium transition-colors"
              :class="[
                tz === modelValue ? 'bg-primary text-white' : 'text-navy-800 hover:bg-mist-blue',
                index === highlightedIndex ? 'bg-mist-blue' : '',
              ]"
              @click="selectTimezone(tz)"
              @mouseenter="highlightedIndex = index"
            >
              <span
                class="material-symbols-outlined text-base shrink-0"
                :class="tz === modelValue ? 'text-white' : 'text-primary'"
              >check_circle</span>
              <span class="truncate">{{ tz }}</span>
            </li>
          </ul>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useTimezones } from '~/composables/resources/common/timezones'
import { useDebounceFn } from '@vueuse/core'

const props = defineProps<{
  modelValue: string
  hasError?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const isOpen = ref(false)
const searchQuery = ref('')
const highlightedIndex = ref(-1)
const containerRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const listRef = ref<HTMLElement | null>(null)
const itemRefs = ref<Array<HTMLElement | null>>([])
const dropdownStyle = ref<Record<string, string>>({})

// Debounced query passed to composable
const debouncedSearch = ref('')
const updateDebounced = useDebounceFn((val: string) => {
  debouncedSearch.value = val
}, 300)

watch(searchQuery, val => updateDebounced(val))

const { data: timezones, isLoading } = useTimezones(debouncedSearch)

const filteredTimezones = computed(() => timezones.value ?? [])

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
  debouncedSearch.value = ''
  highlightedIndex.value = -1
  dropdownStyle.value = {}
}

function selectTimezone(tz: string) {
  emit('update:modelValue', tz)
  closeDropdown()
}

function highlightNext() {
  if (!isOpen.value) {
    openDropdown()
    return
  }
  const max = filteredTimezones.value.length - 1
  highlightedIndex.value = Math.min(highlightedIndex.value + 1, max)
  scrollToHighlighted()
}

function highlightPrev() {
  highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
  scrollToHighlighted()
}

function selectHighlighted() {
  const tz = filteredTimezones.value[highlightedIndex.value]
  if (tz) selectTimezone(tz)
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

// Close on outside click
function handleOutsideClick(e: MouseEvent) {
  const target = e.target as Node
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

watch(isOpen, value => {
  if (value) {
    nextTick(updateDropdownPosition)
  }
})

onMounted(() => document.addEventListener('mousedown', handleOutsideClick))
onMounted(() => {
  window.addEventListener('scroll', handleViewportChange, true)
  window.addEventListener('resize', handleViewportChange)
})
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleOutsideClick)
  window.removeEventListener('scroll', handleViewportChange, true)
  window.removeEventListener('resize', handleViewportChange)
})
</script>
