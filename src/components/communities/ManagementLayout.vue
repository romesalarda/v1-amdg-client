<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header with Organization Info -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div v-if="organisation?.logo" class="w-12 h-12 bg-gray-100 rounded-lg p-2">
              <img 
                :src="resolveImageUrl(organisation.logo)" 
                :alt="organisation.title"
                @error="onImageError"
                class="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">{{ organisation?.title || 'Community' }}</h1>
              <p class="text-sm text-gray-600">Management Dashboard</p>
            </div>
          </div>
          
          <UButton 
            :to="`/communities/${organisationId}`" 
            variant="outline"
            icon="i-heroicons-arrow-left"
          >
            View Community
          </UButton>
        </div>

        <!-- Navigation Tabs -->
        <nav class="flex gap-6 mt-6" aria-label="Management navigation">
          <NuxtLink
            :to="`/communities/${organisationId}/m/dashboard`"
            class="px-1 pb-3 border-b-2 text-sm font-medium transition-colors"
            :class="isActive('dashboard') 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'"
          >
            <UIcon name="i-heroicons-home" class="w-4 h-4 inline mr-1" />
            Dashboard
          </NuxtLink>
          
          <NuxtLink
            :to="`/communities/${organisationId}/m/landing/editor`"
            class="px-1 pb-3 border-b-2 text-sm font-medium transition-colors"
            :class="isActive('landing') 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'"
          >
            <UIcon name="i-heroicons-photo" class="w-4 h-4 inline mr-1" />
            Landing Page
          </NuxtLink>
          
          <NuxtLink
            :to="`/communities/${organisationId}/m/members`"
            class="px-1 pb-3 border-b-2 text-sm font-medium transition-colors"
            :class="isActive('members') 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'"
          >
            <UIcon name="i-heroicons-users" class="w-4 h-4 inline mr-1" />
            Members
          </NuxtLink>
          
          <NuxtLink
            :to="`/communities/${organisationId}/m/events`"
            class="px-1 pb-3 border-b-2 text-sm font-medium transition-colors"
            :class="isActive('events') 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'"
          >
            <UIcon name="i-heroicons-calendar-days" class="w-4 h-4 inline mr-1" />
            Events
          </NuxtLink>

          <NuxtLink
            :to="`/communities/${organisationId}/m/sponsors`"
            class="px-1 pb-3 border-b-2 text-sm font-medium transition-colors"
            :class="isActive('sponsors')
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'"
          >
            <UIcon name="i-heroicons-banknotes" class="w-4 h-4 inline mr-1" />
            Sponsors
          </NuxtLink>

          <NuxtLink
            :to="`/communities/${organisationId}/m/leaders`"
            class="px-1 pb-3 border-b-2 text-sm font-medium transition-colors"
            :class="isActive('leaders')
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'"
          >
            <UIcon name="i-heroicons-shield-check" class="w-4 h-4 inline mr-1" />
            Leaders
          </NuxtLink>

          <NuxtLink
            :to="`/communities/${organisationId}/m/statistics`"
            class="px-1 pb-3 border-b-2 text-sm font-medium transition-colors"
            :class="isActive('statistics')
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'"
          >
            <UIcon name="i-heroicons-chart-pie" class="w-4 h-4 inline mr-1" />
            Statistics
          </NuxtLink>
        </nav>
      </div>
    </div>

    <!-- Content Area -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { resolveImageUrl, onImageError } from '~/utils/image'

const props = defineProps<{
  organisationId: string | number
  organisation?: any
}>()

const route = useRoute()

const isActive = (section: string) => {
  return route.path.includes(`/m/${section}`)
}
</script>
