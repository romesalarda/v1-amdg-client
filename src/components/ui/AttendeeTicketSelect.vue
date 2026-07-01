<template>
  <div ref="containerRef">
    <div
      class="w-full px-3 py-2 border rounded-lg flex items-center gap-2 cursor-pointer transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary"
      :class="modelValue ? 'border-primary/40 bg-primary/5' : 'border-gray-300 bg-white'"
      @click="openDropdown"
    >
      <UIcon name="i-heroicons-ticket" class="h-4 w-4 text-primary shrink-0" />
      <span v-if="selectedTicket && !isOpen" class="flex-1 text-sm font-medium text-gray-800 truncate">
        {{ selectedTicket.ticket_code }}
        <span class="ml-1 text-xs text-gray-500">· {{ selectedTicket.ticket_type_title }}</span>
      </span>
      <input
        v-else
        ref="inputRef"
        v-model="searchQuery"
        type="text"
        class="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
        :placeholder="modelValue ? '' : placeholder"
        @focus="openDropdown"
        @keydown.escape="closeDropdown"
        @keydown.arrow-down.prevent="highlightNext"
        @keydown.arrow-up.prevent="highlightPrev"
        @keydown.enter.prevent="selectHighlighted"
      />
      <button
        v-if="modelValue"
        type="button"
        class="shrink-0 text-gray-400 hover:text-red-500 transition-colors"
        @click.stop="clearSelection"
        title="Clear ticket"
      >
        <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
      </button>
      <UIcon
        name="i-heroicons-chevron-down"
        class="h-4 w-4 text-gray-400 shrink-0 transition-transform"
        :class="{ 'rotate-180': isOpen }"
      />
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
          class="fixed bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
          :style="dropdownStyle"
        >
          <div v-if="isLoading" class="flex items-center justify-center gap-2 py-4 text-sm text-gray-400">
            <UIcon name="i-heroicons-arrow-path" class="h-4 w-4 animate-spin" />
            Loading tickets...
          </div>
          <div v-else-if="!tickets.length" class="py-4 text-center text-sm text-gray-400">
            No tickets found for this attendee.
          </div>
          <ul v-else class="max-h-56 overflow-y-auto py-1">
            <li
              v-for="(ticket, index) in tickets"
              :key="ticket.ticket_id"
              :ref="el => setItemRef(el, index)"
              class="flex items-center gap-3 px-4 py-2.5 cursor-pointer text-sm transition-colors"
              :class="[
                ticket.ticket_id === modelValue
                  ? 'bg-primary text-white'
                  : 'text-gray-800 hover:bg-gray-50',
                index === highlightedIndex && ticket.ticket_id !== modelValue
                  ? 'bg-gray-50'
                  : '',
              ]"
              @click="selectTicket(ticket)"
              @mouseenter="highlightedIndex = index"
            >
              <UIcon
                name="i-heroicons-ticket"
                class="h-4 w-4 shrink-0"
                :class="ticket.ticket_id === modelValue ? 'text-white' : 'text-primary'"
              />
              <div class="flex-1 min-w-0">
                <div class="font-mono font-semibold truncate">{{ ticket.ticket_code }}</div>
                <div class="text-xs truncate" :class="ticket.ticket_id === modelValue ? 'text-white/70' : 'text-gray-500'">
                  {{ ticket.ticket_type_title }}
                </div>
              </div>
              <span
                class="text-xs font-medium px-1.5 py-0.5 rounded shrink-0"
                :class="ticketStatusClass(ticket.status, ticket.ticket_id === modelValue)"
              >
                {{ ticket.status }}
              </span>
            </li>
          </ul>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount, type CSSProperties } from 'vue'
import { useAttendeeTickets } from '~/composables/resources/tickets/useAttendeeTickets'
import type { TicketList } from '~/api/types.gen'

const props = withDefaults(defineProps<{
  modelValue?: string | null
  attendeeId: string
  placeholder?: string
}>(), {
  modelValue: null,
  placeholder: 'Select ticket (optional)',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
}>()

// Fetch all tickets for this specific attendee only
const { data: ticketsData, isLoading } = useAttendeeTickets(
  computed(() => props.attendeeId || undefined)
)

const tickets = computed<TicketList[]>(() => {
  const results = ticketsData.value?.data?.results ?? []
  if (!searchQuery.value.trim()) return results
  const q = searchQuery.value.trim().toLowerCase()
  return results.filter(
    t => t.ticket_code.toLowerCase().includes(q) || t.ticket_type_title.toLowerCase().includes(q)
  )
})

const selectedTicket = computed(() =>
  ticketsData.value?.data?.results?.find(t => t.ticket_id === props.modelValue) ?? null
)

// Dropdown state
const isOpen = ref(false)
const searchQuery = ref('')
const highlightedIndex = ref(-1)
const containerRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const itemRefs = ref<Array<HTMLElement | null>>([])
const dropdownStyle = ref<CSSProperties>({})

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

function selectTicket(ticket: TicketList) {
  emit('update:modelValue', ticket.ticket_id)
  closeDropdown()
}

function clearSelection() {
  emit('update:modelValue', null)
}

function highlightNext() {
  if (!isOpen.value) { openDropdown(); return }
  highlightedIndex.value = Math.min(highlightedIndex.value + 1, tickets.value.length - 1)
  scrollToHighlighted()
}

function highlightPrev() {
  highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
  scrollToHighlighted()
}

function selectHighlighted() {
  const t = tickets.value[highlightedIndex.value]
  if (t) selectTicket(t)
}

function scrollToHighlighted() {
  nextTick(() => { itemRefs.value[highlightedIndex.value]?.scrollIntoView({ block: 'nearest' }) })
}

function updateDropdownPosition() {
  const trigger = containerRef.value?.firstElementChild as HTMLElement | null
  if (!trigger) return
  const rect = trigger.getBoundingClientRect()
  const top = Math.round(rect.bottom + 6)
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

watch(isOpen, (value) => { if (value) nextTick(updateDropdownPosition) })

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

function ticketStatusClass(status: string, isSelected: boolean) {
  if (isSelected) return 'bg-white/20 text-white'
  if (status === 'ACTIVE') return 'bg-green-100 text-green-700'
  if (status === 'CANCELLED') return 'bg-red-100 text-red-700'
  return 'bg-gray-100 text-gray-600'
}
</script>
