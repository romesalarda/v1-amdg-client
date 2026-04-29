<template>
  <div class="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
    <!-- Section Header -->
    <div v-if="title || $slots.header" class="border-b border-slate-100 px-6 py-4">
      <slot name="header">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-[0.95rem] font-black uppercase tracking-[0.16em] text-deep-navy">{{ title }}</h3>
            <p v-if="description" class="mt-1 text-sm text-slate-500">{{ description }}</p>
          </div>
          <slot name="header-actions"></slot>
        </div>
      </slot>
    </div>

    <!-- Section Content -->
    <div :class="contentClass">
      <slot></slot>
    </div>

    <!-- Section Footer -->
    <div v-if="$slots.footer" class="border-t border-slate-100 bg-slate-50 px-6 py-4">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title?: string
  description?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  padding: 'md',
})

const contentClass = computed(() => {
  const paddingMap = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
  }
  return paddingMap[props.padding]
})
</script>
