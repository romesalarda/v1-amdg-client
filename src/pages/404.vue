<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div class="text-center">
            <h1 class="text-9xl font-bold text-gray-800">404</h1>
            <h2 class="text-3xl font-semibold text-gray-700 mt-4">Page Not Found</h2>
            <p class="text-gray-600 mt-4 mb-8 max-w-md mx-auto">
                Sorry, the page you are looking for doesn't exist or has been moved.
            </p>
            <NuxtLink 
                to="/" 
                class="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
                Go Back Home
            </NuxtLink>
        </div>
    </div>
</template>

<script setup lang="ts">

useHead({
  title: '404 Page Not Found',
  meta: [
    { name: 'description', content: 'The page you are looking for does not exist or has been moved.' },
  ],
})

</script>