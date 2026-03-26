<template>
  <BookingWorkspace
    :event-id="eventId"
    :booking-reference="bookingReference"
    :initial-attendee-id="initialAttendeeId"
    :initial-tab="initialTab"
  />
</template>

<script setup lang="ts">
import BookingWorkspace from '~/components/events/booking/BookingWorkspace.vue'

definePageMeta({
	layout: 'booking' as any,
})

const route = useRoute()

const eventId = computed(() => String(route.params.id || ''))
const bookingReference = computed(() => String(route.params.booking_id || ''))
const initialAttendeeId = computed(() => String(route.query.attendee || ''))
const initialTab = computed(() => {
	const tab = String(route.query.tab || '')
	if (tab === 'attendee' || tab === 'health' || tab === 'consents' || tab === 'family' || tab === 'overview') {
		return tab
	}
	return undefined
})
</script>