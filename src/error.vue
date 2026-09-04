<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
    <FlowingBackground :speed="2" :soft="8" :palette="4" position="absolute" />

    <div class="max-w-md w-full text-center relative z-10 bg-black/50 backdrop-blur-lg rounded-3xl shadow-2xl px-8 py-12 border border-white/10">
      <p class="text-xs font-semibold tracking-[0.3em] text-cyan-300/80 uppercase mb-4">
        Error
      </p>
      <h1 class="text-7xl font-barbara text-white leading-none select-none">
        SO LIKE...
      </h1>
      <h2 class="-mt-6 text-2xl sm:text-3xl font-bold text-white mt-5">
        Something went wrong
      </h2>
      <p class="mt-3 text-sm text-white/70">
        {{ error?.message || 'An unexpected error occurred.' }}
      </p>
      <div class="mt-8">
        <UButton
          to="/"
          size="lg"
          class="bg-cyan-400 hover:bg-cyan-300 text-gray-900 font-bold px-8 rounded-full"
          @click="handleError"
        >
          Go back home
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import FlowingBackground from '~/components/ui/flowingBackground.vue'

const props = defineProps({
  error: Object
})

const handleError = () => clearError({ redirect: '/' })

</script>