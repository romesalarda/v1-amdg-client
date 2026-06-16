<template>
  <div class="flex overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
    <!-- Hours drum -->
    <DrumColumn :items="hours" :model-value="modelValue.h" @update:model-value="emit('update:modelValue', { ...modelValue, h: $event })" />

    <div class="flex items-center px-0.5 text-sm font-semibold text-gray-300">:</div>

    <!-- Minutes drum -->
    <DrumColumn :items="minutes" :model-value="modelValue.m" @update:model-value="emit('update:modelValue', { ...modelValue, m: $event })" />

    <!-- AM/PM -->
    <div class="flex flex-col justify-center gap-1 border-l border-gray-200 px-2 py-2">
      <button
        v-for="p in ['AM', 'PM']"
        :key="p"
        class="rounded px-2 py-1 text-xs font-semibold transition-all"
        :class="modelValue.ampm === p
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'"
        @click="emit('update:modelValue', { ...modelValue, ampm: p as 'AM' | 'PM' })"
      >
        {{ p }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import DrumColumn from './DrumColumn.vue'

interface TimeValue {
  h: string
  m: string
  ampm: 'AM' | 'PM'
}

defineProps<{ modelValue: TimeValue }>()
const emit = defineEmits<{ 'update:modelValue': [v: TimeValue] }>()

const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))
</script>