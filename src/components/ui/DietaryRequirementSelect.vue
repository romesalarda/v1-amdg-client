<!-- Replace DietaryRequirementSelect.vue with this file (adds multiple prop + clear) -->
<template>
  <div ref="containerRef">
    <div
      class="w-full px-4 py-3 bg-mist-blue border border-transparent focus-within:border-primary rounded-xl flex items-center gap-2 cursor-pointer transition-all"
      :class="{ 'border-red-500 focus-within:border-red-500': hasError }"
      @click="openDropdown"
    >
      <span class="material-symbols-outlined text-primary text-base shrink-0">restaurant</span>
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
      <span
        v-if="!multiple && singleLabel && !searchQuery"
        class="text-xs font-bold text-primary truncate max-w-[180px]"
      >{{ singleLabel }}</span>
      <span
        v-if="multiple && multiValues.length > 0 && !searchQuery"
        class="text-xs font-bold text-primary shrink-0"
      >{{ multiValues.length }} selected</span>
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
            Loading…
          </div>

          <div v-else-if="!options.length" class="py-4 text-center text-sm text-navy-400">
            No dietary requirements found
          </div>

          <ul v-else class="max-h-56 overflow-y-auto py-1">
            <li
              v-for="(option, index) in options"
              :key="option.id"
              :ref="(el) => setItemRef(el, index)"
              class="flex items-center gap-3 px-4 py-2.5 cursor-pointer text-sm font-medium transition-colors"
              :class="[
                isSelected(option.id) ? 'bg-primary/10 text-primary' : 'text-navy-800 hover:bg-mist-blue',
                index === highlightedIndex ? 'bg-mist-blue' : '',
              ]"
              @click="selectItem(option.id, option.label)"
              @mouseenter="highlightedIndex = index"
            >
              <span
                class="material-symbols-outlined text-base shrink-0"
                :class="isSelected(option.id) ? 'text-primary' : 'text-navy-300'"
              >{{ multiple ? (isSelected(option.id) ? 'check_box' : 'check_box_outline_blank') : (isSelected(option.id) ? 'check_circle' : 'radio_button_unchecked') }}</span>
              <span class="truncate">{{ option.label }}</span>
            </li>
          </ul>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount, type CSSProperties } from 'vue'
import { useDietaryRequirementSearch } from '~/composables/resources/attendee/useDietaryRequirementSearch'

const props = withDefaults(defineProps<{
  modelValue?: number | null | number[]
  multiple?: boolean
  placeholder?: string
  hasError?: boolean
}>(), {
  modelValue: null,
  multiple: false,
  placeholder: 'Search dietary requirement…',
  hasError: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | null | number[]): void
}>()

const isOpen = ref(false)
const searchQuery = ref('')
const highlightedIndex = ref(-1)
const singleLabel = ref('')
const containerRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const itemRefs = ref<Array<HTMLElement | null>>([])
const dropdownStyle = ref<CSSProperties>({})

const { options, isLoading } = useDietaryRequirementSearch(searchQuery)

const multiValues = computed<number[]>(() => {
  if (!props.multiple) return []
  return Array.isArray(props.modelValue) ? (props.modelValue as number[]) : []
})

const hasAnyValue = computed(() =>
  props.multiple ? multiValues.value.length > 0 : props.modelValue != null,
)

const triggerPlaceholder = computed(() => {
  if (props.multiple) {
    return multiValues.value.length > 0 ? 'Search to add more…' : props.placeholder
  }
  return singleLabel.value || props.placeholder
})

function isSelected(id: number): boolean {
  if (props.multiple) return multiValues.value.includes(id)
  return props.modelValue === id
}

watch(options, (nextOptions) => {
  if (props.multiple || !props.modelValue) return
  const selected = nextOptions.find((item) => item.id === props.modelValue)
  if (selected) singleLabel.value = selected.label
}, { immediate: true })

watch(() => props.modelValue, (val) => {
  if (!props.multiple && !val) singleLabel.value = ''
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

function selectItem(id: number, label: string) {
  if (props.multiple) {
    const current = multiValues.value
    const idx = current.indexOf(id)
    emit('update:modelValue', idx === -1 ? [...current, id] : current.filter(v => v !== id))
    searchQuery.value = ''
  } else {
    singleLabel.value = label
    emit('update:modelValue', id)
    closeDropdown()
  }
}

function clearSelection() {
  singleLabel.value = ''
  emit('update:modelValue', props.multiple ? [] : null)
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
  if (option) selectItem(option.id, option.label)
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
