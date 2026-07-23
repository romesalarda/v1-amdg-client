<template>
  <div ref="containerRef" class="w-full min-w-0">
    <div
      class="w-full min-w-0 px-4 py-3 bg-mist-blue border border-transparent focus-within:border-primary rounded-xl flex items-center gap-2 cursor-pointer transition-all"
      :class="{ 'border-red-500 focus-within:border-red-500': hasError }"
      @click="openDropdown"
    >
      <span class="material-symbols-outlined text-primary text-base shrink-0">shopping_bag</span>
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
        class="shrink min-w-0 text-xs font-bold text-primary truncate max-w-[180px]"
      >{{ selectedLabel }}</span>
      <button
        v-if="modelValue"
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
            Searching products…
          </div>

          <div v-else-if="!options.length" class="py-4 text-center text-sm text-navy-400">
            No products found
          </div>

          <ul v-else class="max-h-56 overflow-y-auto py-1">
            <li
              v-for="(option, index) in options"
              :key="option.id"
              :ref="(el) => setItemRef(el, index)"
              class="flex items-center gap-3 px-4 py-2.5 cursor-pointer text-sm font-medium transition-colors"
              :class="[
                option.id === modelValue ? 'bg-primary text-white' : 'text-navy-800 hover:bg-mist-blue',
                index === highlightedIndex ? 'bg-mist-blue' : '',
              ]"
              @click="selectItem(option.id, option.title)"
              @mouseenter="highlightedIndex = index"
            >
              <span
                class="material-symbols-outlined text-base shrink-0"
                :class="option.id === modelValue ? 'text-white' : 'text-primary'"
              >check_circle</span>
              <div class="flex flex-col min-w-0">
                <span class="truncate">{{ option.title }}</span>
                <span
                  class="text-xs truncate"
                  :class="option.id === modelValue ? 'text-white/70' : 'text-navy-400'"
                >{{ option.displayCode }}</span>
              </div>
            </li>
          </ul>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onBeforeUnmount, type CSSProperties } from 'vue'
import { useProductSearch } from '~/composables/resources/products/useProductSearch'

const props = withDefaults(defineProps<{
  modelValue?: string | null
  eventSlug?: string
  placeholder?: string
  hasError?: boolean
}>(), {
  modelValue: null,
  placeholder: 'Search products…',
  hasError: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
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

const { options, isLoading } = useProductSearch(
  searchQuery,
  () => props.eventSlug,
)

watch(options, (nextOptions) => {
  if (!props.modelValue) return
  const selected = nextOptions.find((item) => item.id === props.modelValue)
  if (selected) selectedLabel.value = selected.title
}, { immediate: true })

watch(() => props.modelValue, (val) => {
  if (!val) selectedLabel.value = ''
})

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

function selectItem(id: string, label: string) {
  selectedLabel.value = label
  emit('update:modelValue', id)
  closeDropdown()
}

function clearSelection() {
  selectedLabel.value = ''
  emit('update:modelValue', null)
}

function highlightNext() {
  if (!isOpen.value) { openDropdown(); return }
  highlightedIndex.value = Math.min(highlightedIndex.value + 1, options.value.length - 1)
  scrollToHighlighted()
}

function highlightPrev() {
  highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
  scrollToHighlighted()
}

function selectHighlighted() {
  const option = options.value[highlightedIndex.value]
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
