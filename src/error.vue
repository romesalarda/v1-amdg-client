<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full text-center space-y-8">
      <div>
        <h1 class="text-9xl font-bold text-gray-200">OPS</h1>
        <h2 class="mt-6 text-3xl font-bold text-gray-900">Something went wrong</h2>
        <p class="mt-2 text-sm text-gray-600">
            {{ error?.message || 'An unexpected error occurred.' }}
        </p>
      </div>
      <div class="mt-8">
        <UButton
          to="/"
          color="black"
          size="lg"
        >
          Go back home
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  error: Object
})

const handleError = () => clearError({ redirect: '/' })
</script>
