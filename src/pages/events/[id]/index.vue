<template>
  <div class="max-w-3xl mx-auto py-12 px-4">
    <UButton to="/" icon="i-heroicons-arrow-left" variant="ghost" color="gray" class="mb-8">Back to Events</UButton>
    
    <div v-if="isLoading" class="space-y-4">
      <USkeleton class="h-12 w-3/4" />
      <USkeleton class="h-4 w-1/2" />
      <USkeleton class="h-64 w-full" />
    </div>
    
    <div v-else-if="event" class="max-w-4xl mx-auto space-y-8">
      <header class="space-y-4 text-center">
        <!-- <span class="inline-block px-3 py-1 bg-amber-50 text-amber-700 text-sm font-semibold tracking-wider uppercase rounded-full">
          {{ event.event_type_details?.name }}
        </span> -->
        <h1 class="text-4xl font-serif text-gray-900 leading-tight">{{ event.title }}</h1>
        <div class="flex items-center justify-center space-x-6 text-gray-500">
          <div v-if="event.start_datetime" class="flex items-center">
            <UIcon name="i-heroicons-calendar" class="w-5 h-5 mr-2" />
            <span>{{ new Date(event.start_datetime).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</span>
          </div>
          <!-- <div class="flex items-center">
            <UIcon name="i-heroicons-map-pin" class="w-5 h-5 mr-2" />
            <span>{{ event.location }}</span>
          </div> -->
        </div>
        <div class="flex items-center justify-center space-x-6 text-gray-500">
           <div v-if="event.start_datetime && event.end_datetime" class="flex items-center">
            <UIcon name="i-heroicons-clock" class="w-5 h-5 mr-2" />
             <span>{{ new Date(event.start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }} - {{ new Date(event.end_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</span>
           </div>
        </div>
      </header>

      <div class="prose prose-lg mx-auto text-gray-600 font-sans">
        {{ event.long_description || event.short_description }}
      </div>

      
      <div class="mt-8 pt-8 border-t border-gray-100 flex gap-4">
         <UButton color="black" label="Register" size="lg" />
         <UButton variant="soft" color="gray" label="Add to Calendar" size="lg" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { useEvent } from '~/composables/resources/events/events'

const route = useRoute()
const eventId = String(route.params.id)
const { data, isLoading, isError, isFetched, isEnabled } = useEvent(eventId)
const event = computed(() => data.value?.data)

useHead({
  title: computed(() => event.value?.title || 'Event Loading...')
})
</script>
