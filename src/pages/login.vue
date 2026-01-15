<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-serif text-gray-900">Sign in to AMDG</h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <UInput 
            v-model="email" 
            type="email" 
            placeholder="Email address"
            class="mb-4"
            size="lg"
            autofocus
          />
          <UInput 
            v-model="password" 
            type="password" 
            placeholder="Password"
            size="lg"
          />
        </div>

        <div>
           <UButton 
             type="submit" 
             color="black" 
             block 
             size="lg"
             :loading="loading"
           >
             Sign in
           </UButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const email = ref('')
const password = ref('')
const auth = useAuthStore()
const loading = computed(() => auth.loading)

const handleLogin = async () => {
  await auth.login({ email: email.value, password: password.value })
  navigateTo('/admin/dashboard')
}
</script>
