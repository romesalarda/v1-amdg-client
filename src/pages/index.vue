<template>
  <div>
    <Navbar />
    <main class="min-h-[calc(100vh-64px)] py-8">
      <div class="max-w-7xl mx-auto px-6">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Welcome to AMDG</h1>
        <p class="text-lg text-gray-600">This is the home page.</p>
      </div>
    </main>
  </div>
</template>

<script lang="ts" setup>
import Navbar from '~/components/common/Navbar.vue'
</script>
