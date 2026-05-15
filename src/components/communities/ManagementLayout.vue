<template>
    <Navbar />

  <!-- Mobile menu button -->
  <!-- <button
    v-if="!sidebarOpen"
    @click="sidebarOpen = true"
    class="lg:hidden fixed top-20 left-4 z-50 p-2 bg-deep-navy text-white rounded-lg shadow-lg hover:bg-deep-navy/90 transition-colors"
  >
    <UIcon name="i-heroicons-bars-3" class="w-6 h-6" />
  </button> -->

  <!-- Overlay for mobile -->
  <div
    v-if="sidebarOpen"
    @click="sidebarOpen = false"
    class="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
  />

  <!-- Sidebar -->
  <aside
    :class="[
      'fixed inset-y-0 left-0 z-50 w-64 bg-deep-navy text-white flex flex-col transition-transform duration-300',
      'lg:translate-x-0',
      sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    ]"
  >
    <!-- Logo/Brand -->
    <div class="p-6 flex items-center gap-3 border-b border-white/10">
      <span class="font-bold tracking-tight text-lg">Community Control</span>
    </div>

    <!-- Organisation Info -->
    <div class="p-4 border-b border-white/10">
      <div class="flex items-start gap-3">
        <!-- Organisation Image -->
        <div
          v-if="organisation?.logo"
          class="w-12 h-12 rounded overflow-hidden flex-shrink-0 bg-deep-navy/50 border border-white/10"
        >
          <img
            :src="resolveImageUrl(organisation.logo)"
            :alt="organisation.title"
            class="w-full h-full object-contain"
            @error="onImageError"
          />
        </div>
        <div
          v-else
          class="w-12 h-12 rounded bg-deep-navy/50 border border-blue-500/40 flex items-center justify-center flex-shrink-0"
        >
          <UIcon name="i-heroicons-building-office" class="w-6 h-6 text-blue-500" />
        </div>

        <!-- Organisation Details -->
        <div class="flex-1 min-w-0">
          <h2 class="text-sm font-bold text-white truncate">
            {{ organisation?.title || 'Community' }}
          </h2>
          <p class="text-xs text-white/60 mt-1">Management Dashboard</p>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-hide">
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.path"
        :to="`/communities/${organisationId}/m/${tab.path}`"
        @click="onTabClick"
        :class="[
          'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all',
          isActive(tab.path)
            ? 'bg-white/10 text-white'
            : 'text-white/60 hover:text-white hover:bg-white/5',
        ]"
      >
        <UIcon :name="tab.icon" class="w-5 h-5" />
        <span>{{ tab.label }}</span>
      </NuxtLink>
    </nav>

    <!-- Bottom Actions -->
    <div class="p-4 border-t border-white/10 space-y-2">
      <UButton
        :to="`/communities/${organisationId}`"
        variant="ghost"
        color="white"
        block
        size="sm"
        icon="i-heroicons-eye"
        class="justify-start text-white/70 hover:text-white hover:bg-white/5"
      >
        View Community
      </UButton>
    </div>
  </aside>

  <!-- Main Content -->
  <div class="min-h-screen bg-mist-blue lg:ml-64 transition-all duration-300">
    <!-- Top Header Bar -->
    <header class="h-16 bg-white border-b border-gray-200 sticky top-0 z-30 px-8 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button
          @click="sidebarOpen = !sidebarOpen"
          class="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <UIcon name="i-heroicons-bars-3" class="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h3 class="font-bold text-deep-navy">{{ currentPageTitle }}</h3>
          <p class="text-xs text-gray-500">{{ organisation?.title || 'Community' }}</p>
        </div>
      </div>
    </header>

    <!-- Content Area -->
    <div class="p-8">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { resolveImageUrl, onImageError } from '~/utils/image'
import Navbar from '~/components/common/Navbar.vue'

const props = defineProps<{
  organisationId: string | number
  organisation?: any
}>()

const route = useRoute()
const sidebarOpen = ref(false)

const tabs = computed(() => [
  {
    path: 'dashboard',
    label: 'Dashboard',
    icon: 'i-heroicons-chart-bar',
  },
  {
    path: 'landing/editor',
    label: 'Landing Page',
    icon: 'i-heroicons-photo',
  },
  {
    path: 'members',
    label: 'Members',
    icon: 'i-heroicons-users',
  },
  {
    path: 'events',
    label: 'Events',
    icon: 'i-heroicons-calendar-days',
  },
  {
    path: 'sponsors',
    label: 'Sponsors',
    icon: 'i-heroicons-banknotes',
  },
  {
    path: 'leaders',
    label: 'Leaders',
    icon: 'i-heroicons-shield-check',
  },
  {
    path: 'statistics',
    label: 'Statistics',
    icon: 'i-heroicons-chart-pie',
  },
])

const onTabClick = () => {
  sidebarOpen.value = false
}

const isActive = (section: string) => {
  return route.path.includes(`/m/${section}`)
}

const currentPageTitle = computed(() => {
  const activeTab = tabs.value.find(tab => isActive(tab.path))
  return activeTab?.label || 'Community Management'
})
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
