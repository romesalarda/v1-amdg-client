<template>
  <Navbar />
  <div class="min-h-screen bg-mist-blue">
    <div class="bg-deep-navy border-b border-white/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <!-- Event Info & Back Button -->
        <div class="flex items-start justify-between mb-6">
          <div class="flex items-start gap-4 flex-1">
            <!-- Event Image -->
            <div
              v-if="event?.main_landing_image?.image"
              class="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200"
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
              class="w-16 h-16 rounded-lg bg-deep-navy/50 border border-blue-500/40 flex items-center justify-center flex-shrink-0"
            >
              <UIcon name="i-heroicons-calendar" class="w-8 h-8 text-blue-500" />
            </div>

            <!-- Event Details -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h1 class="text-2xl font-bold text-white truncate">
                  {{ event?.title || 'Loading...' }}
                </h1>
                <UBadge
                  v-if="event?.status"
                  :color="getStatusColor(event.status)"
                  variant="subtle"
                  size="sm"
                >
                  {{ event.status_display }}
                </UBadge>
              </div>
              <p class="text-sm text-white/70">
                Event Management Dashboard
              </p>
              <div v-if="event" class="flex items-center gap-4 mt-2 text-xs text-white/60">
                <span class="flex items-center gap-1">
                  <UIcon name="i-heroicons-calendar" class="w-3.5 h-3.5" />
                  {{ formatDateTime(event.start_datetime) }}
                </span>
                <span v-if="event.organisation_name" class="flex items-center gap-1">
                  <UIcon name="i-heroicons-building-office" class="w-3.5 h-3.5" />
                  {{ event.organisation_name }}
                </span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 flex-shrink-0">
            <UButton
              :to="`/events/${eventId}`"
              variant="ghost"
              color="gray"
              icon="i-heroicons-eye"
              size="sm"
            >
              View Event
            </UButton>
            <UButton
              :to="`/events/${eventId}/preview`"
              variant="ghost"
              color="gray"
              icon="i-heroicons-arrow-top-right-on-square"
              size="sm"
            >
              Preview
            </UButton>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <nav class="flex gap-1 overflow-x-auto pb-px -mb-px">
          <NuxtLink
            v-for="tab in tabs"
            :key="tab.path"
            :to="`/events/${eventId}/m/${tab.path}`"
            :class="[
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap rounded-t-lg',
              isActive(tab.path)
                ? 'bg-mist-blue text-blue-600 border-b-2 border-blue-500'
                : 'text-white/70 hover:text-white hover:bg-white/5',
            ]"
          >
            <UIcon :name="tab.icon" class="w-4 h-4" />
            {{ tab.label }}
          </NuxtLink>
        </nav>
      </div>
    </div>

    <!-- Content Area -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </div>
  </div>
  <Footer />
</template>

<script setup lang="ts">
import { resolveImageUrl, onImageError } from '~/utils/image'
import { formatDateTime } from '~/utils/time'
import Navbar from '~/components/common/Navbar.vue'
import Footer from '~/components/common/Footer.vue'
import type { EventDetail } from '~/api/types.gen'

const props = defineProps<{
  eventId: string | number
  event?: EventDetail
}>()

const route = useRoute()

const tabs = [
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
  },
  {
    path: 'registration',
    label: 'Registration Form',
    icon: 'i-heroicons-clipboard-document-list',
  },
  {
    path: 'staff',
    label: 'Staff',
    icon: 'i-heroicons-user-group',
  },
  {
    path: 'resources',
    label: 'Resources',
    icon: 'i-heroicons-document-text',
  },
]

const isActive = (section: string) => {
  return route.path.includes(`/m/${section}`)
}

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
