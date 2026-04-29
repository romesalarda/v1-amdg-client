<template>
  <div class="space-y-4">
    <!-- Booking overview content goes here -->
    <div class="rounded-2xl border border-deep-navy/10 bg-white p-5">
      <p class="text-sm text-deep-navy/60">Booking overview content will be populated here</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  booking: any
  event: any
  attendees: any[]
  journeySteps?: any[]
  eventTitle?: string
  eventStart?: string
  eventEnd?: string
  eventLocation?: string
  eventWhatToBring?: string
  eventCheckInInstructions?: string
  venueMapEmbedUrl?: string
  eventVenues?: any[]
  formattedBookedAt?: string
  isSingleAttendeeBooking?: boolean
}>()

defineEmits<{
  handleJourneyStepAction: [action: string]
}>()
</script>
