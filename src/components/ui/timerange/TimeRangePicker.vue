<template>
  <div class="relative">
    <!-- Trigger button -->
    <button
      type="button"
      class="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:border-gray-300 hover:bg-gray-50 transition-all"
      @click="open = true"
    >
      <UIcon name="i-heroicons-clock" class="h-4 w-4 text-gray-400" />
      <span class="font-mono">
        {{ displayValue }}
      </span>
      <UIcon name="i-heroicons-chevron-down" class="h-3.5 w-3.5 text-gray-400" />
    </button>

    <!-- Modal overlay -->
    <Teleport to="body">
      <Transition name="trp-fade">
        <div
          v-if="open"
          class="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/50 backdrop-blur-sm"
          @mousedown.self="cancel"
        >
          <div
            class="w-[440px] rounded-2xl border border-gray-200 bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Select time range"
          >
            <!-- Header -->
            <div class="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <span class="flex items-center gap-2 text-sm font-medium text-gray-800">
                <UIcon name="i-heroicons-clock" class="h-4 w-4 text-gray-500" />
                Select time range
              </span>
              <button
                class="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                aria-label="Close"
                @click="cancel"
              >
                <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
              </button>
            </div>

            <!-- Live preview pill -->
            <div class="mx-5 mt-4 flex items-center justify-center gap-3 rounded-lg bg-blue-50 px-4 py-3">
              <span class="font-mono text-xl font-medium text-blue-700">{{ formatDisplay(draft.from) }}</span>
              <UIcon name="i-heroicons-arrow-right" class="h-4 w-4 text-blue-300" />
              <span class="font-mono text-xl font-medium text-blue-700">{{ formatDisplay(draft.to) }}</span>
            </div>

            <!-- Pickers -->
            <div class="grid grid-cols-2 divide-x divide-gray-100 px-5 pb-1 pt-4">
              <div class="pr-4">
                <p class="mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400">From</p>
                <TimeDrumPicker v-model="draft.from" />
              </div>
              <div class="pl-4">
                <p class="mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400">To</p>
                <TimeDrumPicker v-model="draft.to" />
              </div>
            </div>

            <!-- Footer -->
            <div class="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">
              <button
                class="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                @click="clear"
              >
                Clear
              </button>
              <button
                class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                @click="apply"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import TimeDrumPicker from './TimeDrumPicker.vue'

interface TimeValue {
  h: string   // '01'–'12'
  m: string   // '00'–'59'
  ampm: 'AM' | 'PM'
}

interface Props {
  modelValueFrom?: string | undefined | null // 'HH:MM' 24h
  modelValueTo?: string | undefined | null    // 'HH:MM' 24h
}

const props = withDefaults(defineProps<Props>(), {
  modelValueFrom: undefined,
  modelValueTo: undefined,
})

const emit = defineEmits<{
  'update:modelValueFrom': [value: string | undefined | null]
  'update:modelValueTo': [value: string | undefined | null]
}>()

const open = ref(false)

function parse24h(val: string | null): TimeValue {
  if (!val) return { h: '12', m: '00', ampm: 'AM' }
  const [hStr, mStr] = val.split(':')
  let h = parseInt(hStr)
  const ampm: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM'
  if (h === 0) h = 12
  else if (h > 12) h -= 12
  return { h: String(h).padStart(2, '0'), m: (mStr ?? '00').padStart(2, '0'), ampm }
}

function to24h(t: TimeValue): string {
  let h = parseInt(t.h)
  if (t.ampm === 'AM' && h === 12) h = 0
  else if (t.ampm === 'PM' && h !== 12) h += 12
  return `${String(h).padStart(2, '0')}:${t.m}`
}

function formatDisplay(t: TimeValue): string {
  return `${t.h}:${t.m} ${t.ampm}`
}

const draft = ref({
  from: parse24h(props.modelValueFrom ?? null),
  to: parse24h(props.modelValueTo ?? null),
})

watch(open, (val) => {
  if (val) {
    draft.value = {
      from: parse24h(props.modelValueFrom ?? null),
      to: parse24h(props.modelValueTo ?? null),
    }
  }
})

const displayValue = computed(() => {
  if (!props.modelValueFrom && !props.modelValueTo) return 'Any time'
  const f = props.modelValueFrom ? formatDisplay(parse24h(props.modelValueFrom ?? null)) : '—'
  const t = props.modelValueTo ? formatDisplay(parse24h(props.modelValueTo ?? null)) : '—'
  return `${f} → ${t}`
})

function apply() {
  emit('update:modelValueFrom', to24h(draft.value.from))
  emit('update:modelValueTo', to24h(draft.value.to))
  open.value = false
}

function clear() {
  emit('update:modelValueFrom', null)
  emit('update:modelValueTo', null)
  open.value = false
}

function cancel() {
  open.value = false
}
</script>

<style scoped>
.trp-fade-enter-active,
.trp-fade-leave-active {
  transition: opacity 0.18s ease;
}
.trp-fade-enter-from,
.trp-fade-leave-to {
  opacity: 0;
}
</style>