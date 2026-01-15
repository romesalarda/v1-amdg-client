<template>
  <div class="max-w-4xl mx-auto py-12 px-4">
    <div class="mb-12 text-center">
      <h1 class="text-4xl font-serif font-light text-gray-900 mb-4">Parish Events</h1>
      <p class="text-gray-500 font-light">Ad Majorem Dei Gloriam</p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-4">
      <USkeleton class="h-24 w-full" v-for="i in 3" :key="i" />
    </div>

    <!-- Error State -->
    <div v-else-if="isError" class="bg-red-50 text-red-600 p-4 rounded-md">
      Unable to load events.
    </div>

    <!-- Data State -->
    <div v-else class="space-y-6">
      <div 
        v-for="event in events" 
        :key="event.event_id"
        class="group bg-white border border-gray-100 p-6 rounded-lg hover:shadow-sm transition-all duration-300"
      >
        <div class="flex justify-between items-start mb-4">
          <div class="space-y-1">
            <span class="inline-block px-2 py-1 bg-amber-50 text-amber-700 text-xs font-semibold tracking-wider uppercase rounded-full">
              {{ event.event_type_name }}
            </span>
            <h3 class="text-xl font-serif text-gray-900 group-hover:text-amber-700 transition-colors">
              {{ event.title }}
            </h3>
          </div>
          <div class="text-center bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
            <span class="block text-2xl font-bold text-gray-900">{{ new Date(event.start_datetime).getDate() }}</span>
            <span class="block text-xs font-medium text-gray-500 uppercase">{{ new Date(event.start_datetime).toLocaleString('default', { month: 'short' }) }}</span>
          </div>
        </div>
        
        <p class="text-gray-600 mb-6 line-clamp-2">
          {{ event.short_description }}
        </p>

        <div class="flex items-center justify-between pt-4 border-t border-gray-50">
          <div class="flex items-center text-sm text-gray-500">
            <UIcon name="i-heroicons-clock" class="w-4 h-4 mr-1.5" />
            {{ new Date(event.start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
          </div>
          
          <NuxtLink :to="`/events/${event.event_id}`" class="inline-flex items-center text-sm font-medium text-amber-700 hover:text-amber-800">
            View Details
            <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 ml-1" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data, isLoading, isError } = useEvents()
// computed property to access results, assuming DRF pagination
const events = computed(() => data.value?.results || [])
</script>
