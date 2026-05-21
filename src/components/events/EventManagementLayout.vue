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
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    ]"
  >
    <!-- Logo/Brand -->
    <div class="p-6 flex items-center gap-3 border-b border-white/10">
      <!-- <div class="w-8 h-8 bg-white rounded flex items-center justify-center flex-shrink-0">
        <span class="text-deep-navy font-black text-xl">A</span>
      </div> -->
      <span class="font-bold tracking-tight text-lg">Event Control Panel</span>
    </div>

    <!-- Event Info -->
    <div class="p-4 border-b border-white/10">
      <div class="flex items-start gap-3">
        <!-- Event Image -->
        <div
          v-if="event?.main_landing_image?.image"
          class="w-12 h-12 rounded overflow-hidden flex-shrink-0 bg-deep-navy/50 border border-white/10"
        >
          <img
            :src="resolveImageUrl(event.main_landing_image.image)"
            :alt="event.title"
            class="w-full h-full object-cover"
            @error="onImageError"
          />
        </div>
        <div
          v-else
          class="w-12 h-12 rounded bg-deep-navy/50 border border-blue-500/40 flex items-center justify-center flex-shrink-0"
        >
          <UIcon name="i-heroicons-calendar" class="w-6 h-6 text-blue-500" />
        </div>

        <!-- Event Details -->
        <div class="flex-1 min-w-0">
          <div class="flex items-start gap-2 mb-1">
            <h2 class="text-sm font-bold text-white truncate flex-1">
              {{ event?.title || 'Loading...' }}
            </h2>
          </div>
          <UBadge
            v-if="event?.status"
            :color="getStatusColor(event.status)"
            variant="subtle"
            size="xs"
          >
            {{ event.status_display }}
          </UBadge>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-hide">
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.path"
        :to="`/events/${eventId}/m/${tab.path}`"
        @click="onTabClick($event, tab.disabled)"
        :aria-disabled="tab.disabled ? 'true' : undefined"
        :tabindex="tab.disabled ? -1 : undefined"
        :class="[
          'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all',
          isActive(tab.path)
            ? 'bg-white/10 text-white'
            : 'text-white/60 hover:text-white hover:bg-white/5',
          tab.disabled ? 'cursor-not-allowed opacity-50 pointer-events-none' : ''
          
        ]"

        
      >
        <UIcon :name="tab.icon" class="w-5 h-5" />
        <span>{{ tab.label }}</span>
      </NuxtLink>
    </nav>

    <!-- Bottom Actions -->
    <div class="p-4 border-t border-white/10 space-y-2">
      <UButton
        :to="`/events/${eventId}`"
        variant="ghost"
        color="white"
        block
        size="sm"
        icon="i-heroicons-eye"
        class="justify-start text-white/70 hover:text-white hover:bg-white/5"
      >
        View Event
      </UButton>
      <UButton
        :to="`/events/${eventId}/?view=preview`"
        variant="ghost"
        color="white"
        block
        size="sm"
        icon="i-heroicons-arrow-top-right-on-square"
        class="justify-start text-white/70 hover:text-white hover:bg-white/5"
      >
        Preview
      </UButton>
    </div>
  </aside>

  <!-- Main Content -->
  <div :class="['min-h-screen bg-mist-blue transition-all duration-300', sidebarOpen ? 'lg:ml-64' : 'ml-0']">
    <!-- Top Header Bar -->
    <header :class="[
      'h-16 bg-white border-b border-gray-200 sticky z-30 px-8 flex items-center justify-between',
      hasHero ? 'top-0' : 'top-12'
    ]">
      <div class="flex items-center gap-4">
        <button
          @click="sidebarOpen = !sidebarOpen"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <UIcon name="i-heroicons-bars-3" class="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h3 class="font-bold text-deep-navy">{{ currentPageTitle }}</h3>
          <p class="text-xs text-gray-500">{{ event?.title || 'Loading...' }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span v-if="event?.organisation_name" class="text-xs text-gray-500">
          {{ event.organisation_name }}
        </span>
      </div>
    </header>

    <!-- Content Area -->
    <div :class="!hasHero && 'p-8'">
      <slot />
    </div>
  </div>
  
  <!-- <Footer /> -->
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { resolveImageUrl, onImageError } from '~/utils/image'
import Navbar from '~/components/common/Navbar.vue'
import { useEventSettings } from '~/composables/resources/events/eventSettings'
import type { EventDetail } from '~/api/types.gen'


const props = defineProps<{
  eventId: string
  event?: EventDetail,
  hasHero?: boolean
}>()
const { data: settingsData } = useEventSettings(props.eventId)
const eventSettings = computed(() => settingsData.value?.data)

const route = useRoute()
const sidebarOpen = ref(true)

const tabs = computed(() => [
  {
    path: 'dashboard',
    label: 'Dashboard',
    icon: 'i-heroicons-chart-bar',
  },
  {
    path: 'info',
    label: 'Event Info',
    icon: 'i-heroicons-information-circle',
  },
  {
    path: 'landing',
    label: 'Landing Page',
    icon: 'i-heroicons-photo',
  },
  {
    path: 'booking',
    label: 'Booking & Tickets',
    icon: 'i-heroicons-ticket',
    disabled: props.event?.external_event,
  },
  {
    path: 'dates',
    label: 'Dates & Windows',
    icon: 'i-heroicons-calendar-days',
  },
  {
    path: 'payments',
    label: 'Payments',
    icon: 'i-heroicons-credit-card',
    disabled: props.event?.external_event,
  },
  {
    path: 'participants/dashboard',
    label: 'Participants',
    icon: 'i-heroicons-users',
    disabled: props.event?.external_event,
  },
  {
    path: 'registration',
    label: 'Registration Form',
    icon: 'i-heroicons-clipboard-document-list',
    disabled: props.event?.external_event,
  },
  {
    path: 'staff',
    label: 'Staff',
    icon: 'i-heroicons-user-group',
    disabled: props.event?.external_event,
  },
  {
    path: 'venue',
    label: 'Venues',
    icon: 'i-heroicons-map-pin',
  },
    {
    path: 'resources',
    label: 'Resources',
    icon: 'i-heroicons-document-text',
  },
  {
    label: 'Shop',
    path: 'shop/dashboard',
    icon: 'i-heroicons-shopping-bag',
    disabled: !eventSettings.value?.product_selling_enabled || props.event?.external_event,
  },
  {
    path: 'sponsors',
    label: 'Sponsors',
    icon: 'i-heroicons-building-office-2',
    disabled: !eventSettings.value?.accepting_sponsorships_enabled || props.event?.external_event,
  },
])

const onTabClick = (event: MouseEvent, disabled?: boolean) => {
  if (disabled) {
    event.preventDefault()
    event.stopPropagation()
    return
  }

  // Close sidebar on mobile only
  if (window.innerWidth < 1024) {
    sidebarOpen.value = false
  }
}

const isActive = (section: string) => {
  return route.path.includes(`/m/${section}`)
}

const currentPageTitle = computed(() => {
  const activeTab = tabs.value.find(tab => isActive(tab.path))
  return activeTab?.label || 'Event Management'
})

const getStatusColor = (status: string): 'gray' | 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange' => {
  const colors: Record<string, 'gray' | 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange'> = {
    DRAFTING: 'gray',
    PUBLISHED: 'blue',
    OPEN: 'green',
    CLOSED: 'red',
    IN_PROGRESS: 'yellow',
    COMPLETED: 'purple',
    CANCELLED: 'red',
    POSTPONED: 'orange',
    ARCHIVED: 'gray',
  }
  return colors[status] || 'gray'
}
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
