<template>
  <div class="relative h-40 flex-1 overflow-hidden">
    <!-- Centre highlight rail -->
    <div class="pointer-events-none absolute inset-x-1 top-1/2 z-0 h-9 -translate-y-1/2 rounded-md border border-gray-300 bg-white" />
    <!-- Fade masks -->
    <div class="pointer-events-none absolute inset-x-0 top-0 z-10 h-14 bg-gradient-to-b from-gray-50 to-transparent" />
    <div class="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-14 bg-gradient-to-t from-gray-50 to-transparent" />

    <!-- Scroll body -->
    <div
      ref="drum"
      class="no-scrollbar relative h-full overflow-y-scroll"
      @scroll.passive="onScroll"
    >
      <div class="h-[56px]" />
      <div
        v-for="item in items"
        :key="item"
        class="flex h-9 cursor-pointer select-none items-center text-primary justify-center font-mono font-medium transition-colors"
        :class="item === modelValue ? 'text-gray-900' : 'text-gray-900 hover:text-gray-600'"
        @click="scrollTo(item)"
      >
        {{ item }}
      </div>
      <div class="h-[56px]" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'

const props = defineProps<{ items: string[]; modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [v: string] }>()

const drum = ref<HTMLElement | null>(null)
const ITEM_H = 36

function scrollTo(val: string, smooth = true) {
  const idx = props.items.indexOf(val)
  if (idx === -1 || !drum.value) return
  drum.value.scrollTo({ top: idx * ITEM_H, behavior: smooth ? 'smooth' : 'instant' })
}

function onScroll() {
  if (!drum.value) return
  const idx = Math.round(drum.value.scrollTop / ITEM_H)
  const val = props.items[Math.max(0, Math.min(idx, props.items.length - 1))]
  if (val !== props.modelValue) emit('update:modelValue', val)
}

onMounted(() => nextTick(() => scrollTo(props.modelValue, false)))
watch(() => props.modelValue, (val) => scrollTo(val))
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { scrollbar-width: none; }
</style>