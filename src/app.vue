<template>
  <div class="min-h-screen text-gray-900 font-sans antialiased">
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <UNotifications />
  </div>
</template>

<script setup lang="ts">
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - AMDG` : 'AMDG';
  }
})
</script>
