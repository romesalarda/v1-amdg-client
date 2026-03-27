<template>
  <div class="mx-auto max-w-3xl px-4 py-12 text-sm text-deep-navy/70">
    Redirecting to the updated booking workspace...
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'booking' as any,
})

const route = useRoute()

const eventId = String(route.params.id || '')
const bookingReference = String(route.params.booking_id || '')
const attendeeId = String(route.params.attendee_id || '')
const tabQuery = String(route.query.tab || 'attendee')

await navigateTo(
  {
    path: `/events/${eventId}/b/${bookingReference}`,
    query: {
      attendee: attendeeId,
      tab: tabQuery,
    },
  },
  { replace: true },
)
</script>
