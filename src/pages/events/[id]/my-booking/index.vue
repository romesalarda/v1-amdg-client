<template>
	<div class="mx-auto max-w-5xl px-4 py-8">
		<div class="mb-6 flex flex-wrap items-start justify-between gap-4">
			<div>
				<p class="text-xs uppercase tracking-wide text-gray-500">My booking</p>
				<h1 class="text-2xl font-semibold text-gray-900">Select a booking</h1>
				<p class="mt-1 text-sm text-gray-600">Choose which booking you want to view for this event.</p>
			</div>

			<NuxtLink
				:to="`/events/${eventId}`"
				class="inline-flex items-center rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
			>
				Back to event
			</NuxtLink>
		</div>

		<div v-if="myBooking.isLoading.value" class="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
			Loading your bookings...
		</div>

		<div
			v-else-if="myBooking.error.value && !isNotFound"
			class="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700"
		>
			Unable to load your bookings right now.
		</div>

		<div v-else-if="bookingItems.length" class="space-y-4">
			<article
				v-for="item in bookingItems"
				:key="item.booking.booking_reference"
				class="rounded-lg border border-gray-200 bg-white p-5"
			>
				<div class="mb-3 flex flex-wrap items-start justify-between gap-3">
					<div>
						<h2 class="text-lg font-semibold text-gray-900">{{ item.booking.booking_reference }}</h2>
						<p class="text-sm text-gray-600">
							{{ item.is_booking_owner ? 'You are the booking owner' : 'You are linked as an attendee' }}
						</p>
					</div>

					<NuxtLink
						:to="`/events/${eventId}/my-booking/${item.booking.booking_reference}`"
						class="inline-flex items-center rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
					>
						View booking
					</NuxtLink>
				</div>

				<dl class="grid gap-2 text-sm text-gray-700 md:grid-cols-3">
					<div>
						<dt class="text-gray-500">Booked at</dt>
						<dd class="font-medium">{{ formatDate(item.booking.booked_at) }}</dd>
					</div>
					<div>
						<dt class="text-gray-500">Attendees</dt>
						<dd class="font-medium">{{ item.booking.attendee_count || 0 }}</dd>
					</div>
					<div>
						<dt class="text-gray-500">Payments</dt>
						<dd class="font-medium">{{ item.booking.payments?.length || 0 }}</dd>
					</div>
				</dl>

				<div class="mt-3 text-sm text-gray-700">
					<span class="font-medium">Attendee names:</span>
					<span v-if="item.booking.attendees?.length" class="ml-1">
						{{ item.booking.attendees.map(attendee => attendee.name).filter(Boolean).join(', ') }}
					</span>
					<span v-else class="ml-1 text-gray-500">No attendees found</span>
				</div>
			</article>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useEventMyBooking, type ApiErrorLike } from '~/composables/resources/events'

const route = useRoute()

const eventId = computed(() => String(route.params.id || ''))
const myBooking = useEventMyBooking(eventId)

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

const bookingItems = computed(() => myBooking.data.value?.bookings || [])

function formatDate(value?: string) {
	if (!value) {
		return '-'
	}

	const date = new Date(value)
	if (Number.isNaN(date.getTime())) {
		return value
	}

	return date.toLocaleString()
}
</script>