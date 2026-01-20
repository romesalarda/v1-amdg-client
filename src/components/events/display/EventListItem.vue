<template>
  <NuxtLink 
    :to="linkTo" 
    class="block group"
  >
    <div class="bg-white border border-gray-300 rounded-lg p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200 shadow-sm">
      <div class="flex justify-between items-start gap-4">
        <div class="flex-1 space-y-3">
          <!-- Title and Status -->
          <div class="flex items-start justify-between gap-3">
            <h3 class="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {{ event.title }}
            </h3>
            <UBadge 
              :color="getStatusColor(event.status)" 
              :label="event.status_display"
              size="sm"
            />
          </div>

          <!-- Event Type and Organization -->
          <div class="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-700">
            <div v-if="event.event_type_name" class="flex items-center gap-1.5">
              <UIcon name="i-heroicons-tag" class="w-4 h-4" />
              <span>{{ event.event_type_name }}</span>
            </div>
            <div v-if="event.organisation_name" class="flex items-center gap-1.5">
              <UIcon name="i-heroicons-building-office" class="w-4 h-4" />
              <span>{{ event.organisation_name }}</span>
            </div>
          </div>

          <!-- Dates -->
          <div class="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-700">
            <div class="flex items-center gap-1.5">
              <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
              <span>{{ formatDateTimeCompact(event.start_datetime, event.timezone) }}</span>
            </div>
            <div v-if="event.end_datetime" class="flex items-center gap-1.5">
              <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
              <span>{{ formatDateTimeCompact(event.end_datetime, event.timezone) }}</span>
            </div>
          </div>

          <!-- Description -->
          <p v-if="event.short_description" class="text-sm text-gray-700 line-clamp-2">
            {{ event.short_description }}
          </p>
        </div>

        <!-- Action Icon -->
        <div class="flex-shrink-0">
          <UIcon 
            name="i-heroicons-chevron-right" 
            class="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors"
          />
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { EventList } from '~/api/types.gen'
import { formatDateTimeCompact } from '~/utils/time'

const props = defineProps<{
  event: EventList
  linkTo?: string
}>()

const linkTo = computed(() => {
  if (props.linkTo) return props.linkTo
  return `/events/${props.event.event_id}`
})

const getStatusColor = (status?: string): 'gray' | 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'yellow' => {
  const colors = {
    'DRAFTING': 'gray',
    'PUBLISHED': 'blue',
    'OPEN': 'green',
    'CLOSED': 'orange',
    'IN_PROGRESS': 'purple',
    'COMPLETED': 'gray',
    'DELETED': 'red',
    'CANCELLED': 'red',
    'POSTPONED': 'yellow',
    'ARCHIVED': 'gray',
  } as const
  return (colors[status as keyof typeof colors] || 'gray') as 'gray' | 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'yellow'
}
</script>
