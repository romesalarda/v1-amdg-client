<template>
  <div class="rounded-xl border border-navy-100/60 bg-white overflow-hidden">
    <div class="flex items-center gap-2 px-4 py-2.5 bg-mist-blue/60 border-b border-navy-100/60">
      <span class="material-symbols-outlined text-primary text-[16px]">{{ icon }}</span>
      <h3 class="text-[10px] font-black text-primary uppercase tracking-[0.15em]">{{ title }}</h3>
    </div>
    <div class="p-4">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  icon: string
}>()
</script>
