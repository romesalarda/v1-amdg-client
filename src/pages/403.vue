<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div class="text-center max-w-2xl mx-auto">
            <h1 class="text-9xl font-bold text-gray-800">403</h1>
            <h2 class="text-3xl font-semibold text-gray-700 mt-4">Access Denied</h2>
            
            <!-- Custom error message from query -->
            <p v-if="errorMessage" class="text-gray-600 mt-4 mb-8 max-w-md mx-auto">
                {{ errorMessage }}
            </p>
            <p v-else class="text-gray-600 mt-4 mb-8 max-w-md mx-auto">
                Sorry, you do not have permission to access this page.
            </p>

            <!-- Additional help text -->
            <div class="text-sm text-gray-500 mb-8">
                <p>Looks like you tried to access a restricted page, please contact an event administrator if you believe this is a mistake.</p>
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
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()

// Get error message from query params
const errorMessage = computed(() => route.query.message as string | undefined)

const goBack = () => {
    router.back()
}
</script>