<template>
  <div class="select-none">
    <!-- Month header -->
    <div class="flex items-center justify-between mb-4">
      <button
        type="button"
        class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
        :style="hideLeft ? 'visibility:hidden' : ''"
        @click="$emit('prev')"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <span class="text-sm font-bold text-gray-800">{{ MONTHS[month] }} {{ year }}</span>
      <button
        type="button"
        class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
        :style="hideRight ? 'visibility:hidden' : ''"
        @click="$emit('next')"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Day headers -->
    <div class="grid grid-cols-7 mb-1">
      <div v-for="d in DAYS" :key="d" class="text-center text-[10px] font-bold text-gray-400 uppercase py-1">{{ d }}</div>
    </div>

    <!-- Day cells -->
    <div class="grid grid-cols-7">
      <div
        v-for="cell in cells"
        :key="cell.dateStr"
        class="relative h-9 flex items-center justify-center"
        :class="[
          inRange(cell.dateStr) ? 'bg-blue-50' : '',
          isRangeStart(cell.dateStr) ? 'rounded-l-full' : '',
          isRangeEnd(cell.dateStr) ? 'rounded-r-full' : '',
        ]"
        @mouseenter="cell.currentMonth && $emit('hover', cell.dateStr)"
        @mouseleave="$emit('hover', '')"
        @click="cell.currentMonth && $emit('select', cell.dateStr)"
      >
        <span
          class="w-9 h-9 flex items-center justify-center rounded-full text-sm font-semibold transition-colors z-10 relative"
          :class="[
            !cell.currentMonth ? 'text-gray-300 cursor-default' : '',
            cell.currentMonth && isStart(cell.dateStr) ? 'bg-blue-600 text-white cursor-pointer' : '',
            cell.currentMonth && isEnd(cell.dateStr) && !isStart(cell.dateStr) ? 'bg-blue-600 text-white cursor-pointer' : '',
            cell.currentMonth && !isStart(cell.dateStr) && !isEnd(cell.dateStr) && inRange(cell.dateStr) ? 'text-blue-700 cursor-pointer hover:bg-blue-100' : '',
            cell.currentMonth && !isStart(cell.dateStr) && !isEnd(cell.dateStr) && !inRange(cell.dateStr) && isToday(cell.dateStr) ? 'text-blue-600 cursor-pointer hover:bg-gray-100' : '',
            cell.currentMonth && !isStart(cell.dateStr) && !isEnd(cell.dateStr) && !inRange(cell.dateStr) && !isToday(cell.dateStr) ? 'text-gray-800 cursor-pointer hover:bg-gray-100' : '',
          ]"
        >
          <span :class="isToday(cell.dateStr) && !isStart(cell.dateStr) && !isEnd(cell.dateStr) ? 'border-b-2 border-blue-500 leading-none pb-0.5' : ''">
            {{ cell.day }}
          </span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const props = defineProps<{
  year: number
  month: number // 0-based
  draft: { start: string; end: string }
  hoverDate: string
  hideLeft?: boolean
  hideRight?: boolean
}>()

defineEmits<{
  select: [date: string]
  hover: [date: string]
  prev: []
  next: []
}>()

const toIso = (y: number, m: number, d: number) =>
  `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`

const todayStr = toIso(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate())

const cells = computed(() => {
  const firstDay = new Date(props.year, props.month, 1)
  const startOffset = (firstDay.getDay() + 6) % 7 // Mon=0
  const daysInMonth = new Date(props.year, props.month + 1, 0).getDate()
  const daysInPrev = new Date(props.year, props.month, 0).getDate()

  const result: Array<{ dateStr: string; day: number; currentMonth: boolean }> = []

  for (let i = startOffset - 1; i >= 0; i--) {
    const d = daysInPrev - i
    const m = props.month === 0 ? 12 : props.month
    const y = props.month === 0 ? props.year - 1 : props.year
    result.push({ dateStr: toIso(y, m, d), day: d, currentMonth: false })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    result.push({ dateStr: toIso(props.year, props.month + 1, d), day: d, currentMonth: true })
  }

  const remaining = 42 - result.length
  for (let d = 1; d <= remaining; d++) {
    const m = props.month === 11 ? 1 : props.month + 2
    const y = props.month === 11 ? props.year + 1 : props.year
    result.push({ dateStr: toIso(y, m, d), day: d, currentMonth: false })
  }

  return result
})

const effectiveEnd = computed(() => {
  if (props.draft.end) return props.draft.end
  if (props.draft.start && props.hoverDate && props.hoverDate > props.draft.start) return props.hoverDate
  return ''
})

const isStart = (d: string) => props.draft.start === d
const isEnd = (d: string) => !!effectiveEnd.value && effectiveEnd.value === d
const inRange = (d: string) => {
  const { start } = props.draft
  const end = effectiveEnd.value
  if (!start || !end) return false
  return d > start && d < end
}
const isRangeStart = (d: string) => isStart(d) && !!effectiveEnd.value
const isRangeEnd = (d: string) => isEnd(d) && !!props.draft.start
const isToday = (d: string) => d === todayStr
</script>
