<template>
  <div
    class="prose prose-sm max-w-none text-navy-700 leading-relaxed"
    :class="{ 'opacity-40 italic text-navy-400': !content?.trim() }"
  >
    <template v-if="content?.trim()">
      <Comark :options="{ autoUnwrap: true, autoClose: true }">
        {{ content }}
      </Comark>
    </template>
    <p v-else class="text-xs">Nothing to preview yet.</p>
  </div>
</template>

<script setup lang="ts">
import { Comark } from '@comark/vue'

defineProps<{
  content?: string
}>()
</script>
