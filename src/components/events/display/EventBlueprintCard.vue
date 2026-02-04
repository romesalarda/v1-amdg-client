<template>
  <div 
    class="group cursor-pointer"
    @click="navigateTo(linkTo)"
  >
    <div class="relative rounded-sm border border-primary-500/20 bg-navy-accent-600/30 overflow-hidden transition-all hover:border-primary-500/60 p-6">
      <div class="flex justify-between items-start mb-4">
        <div class="flex items-center gap-3">
          <span 
            :class="[
              'text-[10px] px-2 py-0.5 font-black uppercase',
              badgeClass
            ]"
          >
            {{ badge }}
          </span>
          <span class="text-primary-500/40 font-mono text-[10px]">{{ referenceNumber }}</span>
        </div>
        <div class="flex items-center gap-2 text-[10px] text-primary-500/70 font-mono">
          <UIcon name="i-heroicons-calendar" class="text-xs" />
          {{ formattedDate }}
        </div>
      </div>
      
      <h3 class="text-white font-bold text-xl mb-2 leading-tight group-hover:text-primary-500 transition-colors">
        {{ event.name || event.title }}
      </h3>
      <p class="text-white/50 text-sm mb-4 line-clamp-2">
        {{ event.description || event.short_description || 'No description provided' }}
      </p>
      
      <div class="flex items-center gap-4 text-[10px] text-primary-500/70 font-mono flex-wrap">
        <div class="flex items-center gap-1" v-if="event.organisation_name">
          <UIcon name="i-heroicons-building-office" class="text-xs" />
          {{ event.organisation_name }}
        </div>
        <div class="flex items-center gap-1" v-if="event.location">
          <UIcon name="i-heroicons-map-pin" class="text-xs" />
          {{ event.location }}
        </div>
        <slot name="meta"></slot>
      </div>

      <!-- Action slot for custom buttons -->
      <div v-if="$slots.actions" class="mt-4 pt-4 border-t border-primary-500/10">
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EventList } from '~/api/types.gen'
import { formatDate } from '~/utils/time'

const props = withDefaults(defineProps<{
  event: EventList | any
  badge?: string
  badgeVariant?: 'live' | 'staff' | 'discover' | 'drafting'
  referenceNumber?: string
  linkTo?: string
}>(), {
  badge: 'LIVE',
  badgeVariant: 'live'
})

const linkTo = computed(() => {
  if (props.linkTo) return props.linkTo
  return `/events/${props.event.event_id || props.event.id}`
})

const badgeClass = computed(() => {
  const variants = {
    live: 'bg-primary-500 text-background-dark-600',
    staff: 'bg-purple-500/20 text-purple-400 border border-purple-400/40',
    discover: 'bg-primary-500/20 text-primary-500 border border-primary-500/40',
    drafting: 'bg-white/10 text-white/60 border border-white/20'
  }
  return variants[props.badgeVariant] || variants.live
})

const formattedDate = computed(() => {
  return formatDate(props.event.start_datetime, 'MMM dd, yyyy').toUpperCase()
})
</script>
