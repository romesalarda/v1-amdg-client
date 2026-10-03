<template>
  <Navbar />

  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div class="text-center max-w-2xl mx-auto">
          <h1 class="text-9xl font-bold text-gray-800">Sorry!</h1>
          <h2 class="text-3xl font-semibold text-gray-700 mt-4">Something went wrong</h2>
          
          <!-- Custom error message from query -->
          <p v-if="error?.message" class="text-gray-600 mt-4 mb-8 max-w-md mx-auto">
              {{ error.message  }}
          </p>
          <p v-else class="text-gray-600 mt-4 mb-8 max-w-md mx-auto">
              An unexpected error occurred.
          </p>

          <!-- Additional help text -->
          <div class="text-sm text-gray-500 mb-8">
              <p>We encountered an unexpected error while trying to process your request. Please try again later or contact support if the issue persists.</p>
          </div>

          <!-- Action buttons -->
          <div class="flex gap-4 justify-center">
              <button 
                  @click="goBack"
                  class="inline-block px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
              >
                  Go Back
              </button>
              <NuxtLink 
                  to="/my-dashboard" 
                  class="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                  Go to Dashboard
              </NuxtLink>
          </div>
      </div>
  </div>
  <Footer /> 
</template>

<script setup lang="ts">

import Navbar from '~/components/common/Navbar.vue'
import Footer from '~/components/common/Footer.vue'

const props = defineProps({
  error: Object
})

const router = useRouter()

useHead({
  title: 'An Error Occurred',
  meta: [
    { name: 'description', content: 'An error occurred while trying to access the page.' },
  ],
})

const goBack = () => {
    router.back()
}

</script>