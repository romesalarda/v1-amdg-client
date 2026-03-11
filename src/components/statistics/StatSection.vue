<template>
  <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm">
    <!-- Section Header -->
    <div v-if="title || $slots.header" class="px-6 py-4 border-b border-gray-200">
      <slot name="header">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-deep-navy">{{ title }}</h3>
            <p v-if="description" class="text-sm text-gray-500 mt-1">{{ description }}</p>
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
    <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-200 bg-gray-50">
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
