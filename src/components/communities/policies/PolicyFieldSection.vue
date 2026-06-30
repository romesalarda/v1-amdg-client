<template>
  <div class="space-y-4">
    <div class="flex items-start gap-3">
      <div class="flex-1">
        <h3 class="text-sm font-black text-deep-navy uppercase tracking-tight">
          {{ title }}
        </h3>
        <p v-if="description" class="text-xs text-deep-navy/60 font-medium mt-0.5">
          {{ description }}
        </p>
      </div>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>
