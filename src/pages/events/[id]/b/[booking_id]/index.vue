<template>
	<div class="mx-auto max-w-5xl px-4 py-8">
		<div class="mb-6 flex flex-wrap items-start justify-between gap-4">
			<div>
				<p class="text-xs uppercase tracking-wide text-gray-500">My booking</p>
				<h1 class="text-2xl font-semibold text-gray-900">{{ eventTitle }}</h1>
				<p class="mt-1 text-sm text-gray-600">Reference: {{ booking?.booking_reference || '-' }}</p>
			</div>

			<NuxtLink
				:to="`/events/${eventId}`"
				class="inline-flex items-center rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
			>
				Back to event
			</NuxtLink>
		</div>

		<div v-if="myBooking.isLoading.value" class="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
			Loading booking details...
		</div>

		<div
			v-else-if="myBooking.error.value && !isNotFound"
			class="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700"
		>
			Unable to load booking details right now.
		</div>

		<div v-else-if="myBookingData" class="space-y-6">
			<section class="grid gap-4 md:grid-cols-2">
				<article class="rounded-lg border border-gray-200 bg-white p-5">
					<h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-600">Booking summary</h2>
					<dl class="space-y-2 text-sm text-gray-700">
						<div class="flex items-center justify-between">
							<dt>Booked by</dt>
							<dd class="font-medium">{{ booking?.made_by_name || '-' }}</dd>
						</div>
						<div class="flex items-center justify-between">
							<dt>Booked at</dt>
							<dd class="font-medium">{{ formattedBookedAt }}</dd>
						</div>
						<div class="flex items-center justify-between">
							<dt>Attendees</dt>
							<dd class="font-medium">{{ booking?.attendee_count || 0 }}</dd>
						</div>
						<div class="flex items-center justify-between">
							<dt>Selection reason</dt>
							<dd class="font-medium">{{ selectedBookingItem?.selection_reason || '-' }}</dd>
						</div>
					</dl>
				</article>

				<article class="rounded-lg border border-gray-200 bg-white p-5">
					<h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-600">Payments and tickets</h2>
					<dl class="space-y-2 text-sm text-gray-700">
						<div class="flex items-center justify-between">
							<dt>Payments</dt>
							<dd class="font-medium">{{ booking?.payments?.length || 0 }}</dd>
						</div>
						<div class="flex items-center justify-between">
							<dt>Tickets</dt>
							<dd class="font-medium">{{ booking?.tickets?.length || 0 }}</dd>
						</div>
						<div class="flex items-center justify-between">
							<dt>Can manage all attendees</dt>
							<dd class="font-medium">{{ selectedBookingItem?.can_manage_all_attendees ? 'Yes' : 'No' }}</dd>
						</div>
					</dl>
				</article>
			</section>

			<section class="rounded-lg border border-gray-200 bg-white p-5">
				<div class="mb-4 flex items-center justify-between">
					<h2 class="text-sm font-semibold uppercase tracking-wide text-gray-600">Attendees in booking</h2>
					<span class="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
						{{ attendees.length }} total
					</span>
				</div>

				<ul v-if="attendees.length" class="space-y-3">
					<li
						v-for="attendee in attendees"
						:key="attendee.id || attendee.display_id"
						class="flex flex-wrap items-center justify-between gap-3 rounded-md border border-gray-100 p-4"
					>
						<div>
							<p class="text-sm font-medium text-gray-900">{{ attendee.name || 'Unnamed attendee' }}</p>
							<p class="text-xs text-gray-500">{{ attendee.display_id || attendee.id || 'No identifier' }}</p>
						</div>

						<NuxtLink
							v-if="attendee.id && selectedBookingItem?.can_manage_all_attendees"
							:to="`/events/${eventId}/b/${bookingReference}/${attendee.id}`"
							class="inline-flex items-center rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
						>
							Manage attendee
						</NuxtLink>
						<span v-else class="text-xs text-amber-700">Cannot manage this attendee from current access</span>
					</li>
				</ul>

				<p v-else class="text-sm text-gray-600">No attendees found for this booking.</p>
			</section>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useEventMyBooking, type ApiErrorLike } from '~/composables/resources/events'

definePageMeta({
	layout: 'booking' as any,
})

const route = useRoute()

const eventId = computed(() => String(route.params.id || ''))
const bookingReference = computed(() => String(route.params.booking_id || ''))
const myBooking = useEventMyBooking(eventId, computed(() => ({
	booking_reference: bookingReference.value,
})))

const isNotFound = computed(() => {
	const error = myBooking.error.value as unknown as ApiErrorLike | undefined
	return error?.statusCode === 404
})

watchEffect(() => {
	if (isNotFound.value) {
		throw createError({
			statusCode: 404,
			statusMessage: 'Booking not found',
			fatal: true,
		})
	}
})

const myBookingData = computed(() => myBooking.data.value)
const selectedBookingItem = computed(() => {
	return myBookingData.value?.bookings?.find(item => item.booking?.booking_reference === bookingReference.value)
})

watchEffect(() => {
	if (!myBooking.isLoading.value && myBookingData.value && !selectedBookingItem.value) {
		throw createError({
			statusCode: 404,
			statusMessage: 'Booking not found',
			fatal: true,
		})
	}
})

const booking = computed(() => selectedBookingItem.value?.booking)
const attendees = computed(() => booking.value?.attendees || [])
const eventTitle = computed(() => myBookingData.value?.event?.title || 'My booking')

const formattedBookedAt = computed(() => {
	const bookedAt = booking.value?.booked_at
	if (!bookedAt) {
		return '-'
	}

	const date = new Date(bookedAt)
	if (Number.isNaN(date.getTime())) {
		return bookedAt
	}

	return date.toLocaleString()
})
</script>