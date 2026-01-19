<template>
  <div class="py-8">
    <div class="max-w-7xl mx-auto px-6">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">Settings</h1>
      <p class="text-lg text-gray-600">Manage your events.</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: 'auth'
})
</script>
