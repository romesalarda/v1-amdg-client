<template>
  <div class="relative" ref="containerRef">
    <!-- Trigger slot -->
    <div @click="open = !open" class="cursor-pointer">
      <slot :label="triggerLabel" :active="hasRange" />
    </div>

    <!-- Modal overlay -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="open"
          class="fixed inset-0 z-[200] flex items-center justify-center p-4"
          @click.self="cancel"
        >
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="cancel" />
          <div
            class="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-[700px] z-10"
            @click.stop
          >
            <!-- Header inputs -->
            <div class="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label class="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Start date</label>
                <input
                  :value="formatInputDate(draft.start)"
                  @input="onStartInput"
                  type="text"
                  placeholder="DD/MM/YYYY"
                  maxlength="10"
                  class="w-full h-10 px-3 rounded-lg border-2 text-sm font-semibold text-gray-800 focus:outline-none transition-colors"
                  :class="draft.start ? 'border-blue-500 focus:border-blue-600' : 'border-blue-400 focus:border-blue-500'"
                />
              </div>
              <div>
                <label class="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">End date</label>
                <input
                  :value="formatInputDate(draft.end)"
                  @input="onEndInput"
                  type="text"
                  placeholder="DD/MM/YYYY"
                  maxlength="10"
                  class="w-full h-10 px-3 rounded-lg border text-sm font-semibold text-gray-800 focus:outline-none transition-colors"
                  :class="draft.end ? 'border-blue-500 focus:border-blue-600' : 'border-gray-200 focus:border-gray-300'"
                />
              </div>
            </div>

            <!-- Dual calendars -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <CalendarMonth
                :year="leftYear"
                :month="leftMonth"
                :draft="draft"
                :hover-date="hoverDate"
                @select="onSelect"
                @hover="hoverDate = $event"
                @prev="prevMonth"
              />
              <CalendarMonth
                :year="rightYear"
                :month="rightMonth"
                :draft="draft"
                :hover-date="hoverDate"
                @select="onSelect"
                @hover="hoverDate = $event"
                @next="nextMonth"
              />
            </div>

            <!-- Footer actions -->
            <div class="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
              <button
                type="button"
                @click="reset"
                class="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Reset
              </button>
              <div class="flex items-center gap-3">
                <button
                  type="button"
                  @click="cancel"
                  class="px-5 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:border-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  @click="apply"
                  class="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValueStart?: string
  modelValueEnd?: string
}>()

const emit = defineEmits<{
  'update:modelValueStart': [value: string]
  'update:modelValueEnd': [value: string]
}>()

const open = ref(false)
const today = new Date()
const hoverDate = ref<string>('')

// Calendar navigation: left shows current month, right shows next
const leftYear = ref(today.getFullYear())
const leftMonth = ref(today.getMonth()) // 0-based
const rightYear = computed(() => leftMonth.value === 11 ? leftYear.value + 1 : leftYear.value)
const rightMonth = computed(() => (leftMonth.value + 1) % 12)

const prevMonth = () => {
  if (leftMonth.value === 0) {
    leftMonth.value = 11
    leftYear.value--
  } else {
    leftMonth.value--
  }
}

const nextMonth = () => {
  if (leftMonth.value === 11) {
    leftMonth.value = 0
    leftYear.value++
  } else {
    leftMonth.value++
  }
}

// Draft state (uncommitted until Apply)
const draft = reactive<{ start: string; end: string }>({
  start: props.modelValueStart || '',
  end: props.modelValueEnd || '',
})

watch(() => props.modelValueStart, v => { draft.start = v || '' })
watch(() => props.modelValueEnd, v => { draft.end = v || '' })

const onSelect = (dateStr: string) => {
  if (!draft.start || (draft.start && draft.end)) {
    // Start a new selection
    draft.start = dateStr
    draft.end = ''
    hoverDate.value = ''
  } else {
    // End selection
    if (dateStr < draft.start) {
      draft.end = draft.start
      draft.start = dateStr
    } else {
      draft.end = dateStr
    }
    hoverDate.value = ''
  }
}

// Format YYYY-MM-DD -> DD/MM/YYYY for display input
const formatInputDate = (iso: string) => {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

// Parse DD/MM/YYYY -> YYYY-MM-DD
const parseInputDate = (val: string): string => {
  const parts = val.replace(/[^0-9]/g, '')
  if (parts.length === 8) {
    const d = parts.slice(0, 2)
    const m = parts.slice(2, 4)
    const y = parts.slice(4, 8)
    const date = new Date(`${y}-${m}-${d}`)
    if (!isNaN(date.getTime())) return `${y}-${m}-${d}`
  }
  return ''
}

const onStartInput = (e: Event) => {
  const val = (e.target as HTMLInputElement).value
  const iso = parseInputDate(val)
  if (iso) draft.start = iso
}

const onEndInput = (e: Event) => {
  const val = (e.target as HTMLInputElement).value
  const iso = parseInputDate(val)
  if (iso) draft.end = iso
}

const hasRange = computed(() => !!(props.modelValueStart || props.modelValueEnd))

const triggerLabel = computed(() => {
  if (props.modelValueStart && props.modelValueEnd) {
    return `${formatInputDate(props.modelValueStart)} – ${formatInputDate(props.modelValueEnd)}`
  }
  if (props.modelValueStart) return `From ${formatInputDate(props.modelValueStart)}`
  if (props.modelValueEnd) return `Until ${formatInputDate(props.modelValueEnd)}`
  return 'Any dates'
})

const reset = () => {
  draft.start = ''
  draft.end = ''
  hoverDate.value = ''
}

const cancel = () => {
  // Revert draft to current committed values
  draft.start = props.modelValueStart || ''
  draft.end = props.modelValueEnd || ''
  hoverDate.value = ''
  open.value = false
}

const apply = () => {
  emit('update:modelValueStart', draft.start)
  emit('update:modelValueEnd', draft.end)
  open.value = false
}
</script>

<script lang="ts">
// Inner CalendarMonth component defined locally
import { defineComponent, computed, h } from 'vue'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export const CalendarMonth = defineComponent({
  name: 'CalendarMonth',
  props: {
    year: { type: Number, required: true },
    month: { type: Number, required: true },
    draft: { type: Object as () => { start: string; end: string }, required: true },
    hoverDate: { type: String, default: '' },
    prev: { type: Boolean, default: false },
    next: { type: Boolean, default: false },
  },
  emits: ['select', 'hover', 'prev', 'next'],
  setup(props, { emit }) {
    const cells = computed(() => {
      const firstDay = new Date(props.year, props.month, 1)
      // Monday-based: 0=Mon ... 6=Sun
      let startOffset = (firstDay.getDay() + 6) % 7
      const daysInMonth = new Date(props.year, props.month + 1, 0).getDate()
      const daysInPrev = new Date(props.year, props.month, 0).getDate()

      const result: Array<{ dateStr: string; day: number; currentMonth: boolean }> = []

      for (let i = startOffset - 1; i >= 0; i--) {
        const d = daysInPrev - i
        const m = props.month === 0 ? 11 : props.month - 1
        const y = props.month === 0 ? props.year - 1 : props.year
        result.push({ dateStr: toIso(y, m + 1, d), day: d, currentMonth: false })
      }

      for (let d = 1; d <= daysInMonth; d++) {
        result.push({ dateStr: toIso(props.year, props.month + 1, d), day: d, currentMonth: true })
      }

      const remaining = 42 - result.length
      for (let d = 1; d <= remaining; d++) {
        const m = props.month === 11 ? 0 : props.month + 1
        const y = props.month === 11 ? props.year + 1 : props.year
        result.push({ dateStr: toIso(y, m + 1, d), day: d, currentMonth: false })
      }

      return result
    })

    const toIso = (y: number, m: number, d: number) =>
      `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`

    const todayStr = toIso(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate())

    const effectiveEnd = computed(() => {
      if (props.draft.end) return props.draft.end
      if (props.draft.start && props.hoverDate && props.hoverDate >= props.draft.start) return props.hoverDate
      return ''
    })

    const isInRange = (dateStr: string) => {
      const { start } = props.draft
      const end = effectiveEnd.value
      if (!start || !end) return false
      return dateStr > start && dateStr < end
    }

    const isStart = (dateStr: string) => props.draft.start === dateStr
    const isEnd = (dateStr: string) => !!effectiveEnd.value && effectiveEnd.value === dateStr
    const isToday = (dateStr: string) => dateStr === todayStr

    return () => {
      const monthLabel = `${MONTHS[props.month]} ${props.year}`

      return h('div', { class: 'select-none' }, [
        // Month header
        h('div', { class: 'flex items-center justify-between mb-4' }, [
          h('button', {
            type: 'button',
            class: 'w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700',
            style: props.next ? 'visibility:hidden' : '',
            onClick: () => emit('prev'),
          }, [
            h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
              h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M15 19l-7-7 7-7' })
            ])
          ]),
          h('span', { class: 'text-sm font-bold text-gray-800' }, monthLabel),
          h('button', {
            type: 'button',
            class: 'w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700',
            style: props.prev ? 'visibility:hidden' : '',
            onClick: () => emit('next'),
          }, [
            h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
              h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 5l7 7-7 7' })
            ])
          ]),
        ]),

        // Day headers
        h('div', { class: 'grid grid-cols-7 mb-2' },
          DAYS.map(d => h('div', { class: 'text-center text-[10px] font-bold text-gray-400 uppercase py-1' }, d))
        ),

        // Day cells
        h('div', { class: 'grid grid-cols-7' },
          cells.value.map(cell => {
            const start = isStart(cell.dateStr)
            const end = isEnd(cell.dateStr)
            const inRange = isInRange(cell.dateStr)
            const today = isToday(cell.dateStr)

            const cellClass = [
              'relative h-9 flex items-center justify-center text-sm font-semibold cursor-pointer transition-colors',
              !cell.currentMonth ? 'text-gray-300' : (start || end) ? 'text-white' : inRange ? 'text-blue-700' : today ? 'text-blue-600' : 'text-gray-800',
              inRange ? 'bg-blue-50' : '',
            ].join(' ')

            const innerClass = [
              'w-9 h-9 flex items-center justify-center rounded-full transition-colors z-10 relative',
              (start || end) ? 'bg-blue-600 text-white' : today && !inRange ? 'border-b-2 border-blue-500' : cell.currentMonth ? 'hover:bg-gray-100' : 'cursor-default',
            ].join(' ')

            return h('div', {
              class: cellClass,
              onClick: () => cell.currentMonth && emit('select', cell.dateStr),
              onMouseenter: () => cell.currentMonth && emit('hover', cell.dateStr),
              onMouseleave: () => emit('hover', ''),
            }, [
              h('span', { class: innerClass }, cell.day)
            ])
          })
        ),
      ])
    }
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
