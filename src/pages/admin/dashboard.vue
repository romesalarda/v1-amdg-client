<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar Stub -->
    <aside class="w-64 bg-white border-r border-gray-200 p-6">
      <div class="font-serif font-bold text-xl mb-8">AMDG Admin</div>
      <nav class="space-y-2">
        <UButton block variant="ghost" class="justify-start text-gray-600">Dashboard</UButton>
        <UButton block variant="ghost" class="justify-start text-gray-600">Events</UButton>
        <UButton block variant="ghost" class="justify-start text-gray-600">Settings</UButton>
      </nav>
    </aside>

    <!-- Content -->
    <main class="flex-1 p-8">
      <header class="flex justify-between items-center mb-8">
        <h1 class="text-2xl font-light text-gray-900">Dashboard</h1>
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-500">{{ auth.user?.email }}</span>
          <UButton @click="auth.logout()" variant="soft" color="gray" size="sm">Logout</UButton>
        </div>
      </header>

      <UCard>
        <template #header>
          <div class="flex justify-between items-center">
             <h3 class="font-medium text-gray-900">Recent Events</h3>
             <UButton label="Create Event" color="black" size="sm" />
          </div>
        </template>
        
        <div v-if="isLoading" class="p-4">Loading...</div>
        <table v-else class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-gray-100 text-gray-500">
              <th class="py-3 font-normal">Title</th>
              <th class="py-3 font-normal">Date</th>
              <th class="py-3 font-normal">Category</th>
              <th class="py-3 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="event in events" :key="event.event_id" class="group hover:bg-gray-50">
              <td class="py-3 text-gray-900 font-medium">{{ event.title }}</td>
              <td class="py-3 text-gray-500">{{ new Date(event.start_datetime).toLocaleDateString() }}</td>
              <td class="py-3 text-gray-500">{{ event.event_type_name }}</td>
              <td class="py-3 text-right">
                <UButton icon="i-heroicons-pencil" variant="ghost" color="gray" size="xs" />
              </td>
            </tr>
          </tbody>
        </table>
      </UCard>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false, // Full screen layout for admin
  middleware: 'auth'
})

const auth = useAuthStore()
// Guard: mock simple redirect
if (!auth.isAuthenticated) {
  // In real app, middleware handles this
  // navigateTo('/login')
}

const { data, isLoading } = useEvents()
const events = computed(() => data.value?.results || [])
</script>
