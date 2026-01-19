<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <div v-if="loading" class="space-y-4">
        <UIcon name="i-heroicons-arrow-path" class="w-12 h-12 animate-spin text-gray-400 mx-auto" />
        <p class="text-gray-600">Completing sign in with Google...</p>
      </div>
      <div v-else-if="error" class="space-y-4">
        <UIcon name="i-heroicons-x-circle" class="w-12 h-12 text-red-500 mx-auto" />
        <h2 class="text-xl font-semibold text-gray-900">Authentication Failed</h2>
        <p class="text-gray-600">{{ error }}</p>
        <UButton to="/login" color="black">Back to Login</UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { authGoogleCallbackCreate } from '@/api/sdk.gen'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  const code = route.query.code as string
  const state = route.query.state as string

  if (!code) {
    error.value = 'No authorization code received from Google'
    loading.value = false
    return
  }

  try {
    // Call backend with the authorization code
    const response = await authGoogleCallbackCreate({
      body: {
        code,
        redirect_uri: window.location.origin + '/auth/callback'
      }
    })

    if (response.data) {
      // Fetch user data to update store
      await auth.fetchUser()
      
      // Redirect to my-dashboard
      router.push('/my-dashboard')
    } else {
      error.value = 'Failed to authenticate with Google'
      loading.value = false
    }
  } catch (e: any) {
    console.error('Google OAuth callback error:', e)
    error.value = e.response?.data?.detail || e.message || 'Authentication failed'
    loading.value = false
  }
})
</script>
