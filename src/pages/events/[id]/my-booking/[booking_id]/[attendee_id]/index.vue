<template>
	<div class="mx-auto max-w-3xl px-4 py-8">
		<div class="mb-6 flex flex-wrap items-start justify-between gap-4">
			<div>
				<p class="text-xs uppercase tracking-wide text-gray-500">Manage attendee</p>
				<h1 class="text-2xl font-semibold text-gray-900">{{ attendeeName }}</h1>
			</div>

			<NuxtLink
				:to="`/events/${eventId}/my-booking/${bookingReference}`"
				class="inline-flex items-center rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
			>
				Back to booking
			</NuxtLink>
		</div>

		<div v-if="isLoadingPage" class="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
			Loading attendee details...
		</div>

		<div
			v-else-if="hasError"
			class="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700"
		>
			Unable to load attendee details right now.
		</div>

		<form v-else class="space-y-6 rounded-lg border border-gray-200 bg-white p-6" @submit.prevent="saveAttendee">
			<div class="grid gap-4 md:grid-cols-2">
				<label class="space-y-1 text-sm">
					<span class="text-gray-700">First name</span>
					<input
						v-model="form.first_name"
						type="text"
						required
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
					>
				</label>

				<label class="space-y-1 text-sm">
					<span class="text-gray-700">Last name</span>
					<input
						v-model="form.last_name"
						type="text"
						required
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
					>
				</label>
			</div>

			<div class="grid gap-4 md:grid-cols-2">
				<label class="space-y-1 text-sm">
					<span class="text-gray-700">Email</span>
					<input
						v-model="form.email"
						type="email"
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
					>
				</label>

				<label class="space-y-1 text-sm">
					<span class="text-gray-700">Phone number</span>
					<input
						v-model="form.phone_number"
						type="text"
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
					>
				</label>
			</div>

			<div class="grid gap-4 md:grid-cols-2">
				<label class="space-y-1 text-sm">
					<span class="text-gray-700">Date of birth</span>
					<input
						v-model="form.date_of_birth"
						type="date"
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
					>
				</label>

				<label class="space-y-1 text-sm">
					<span class="text-gray-700">Gender</span>
					<input
						v-model="form.gender"
						type="text"
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
					>
				</label>
			</div>

			<div class="grid gap-4 md:grid-cols-2">
				<label class="space-y-1 text-sm">
					<span class="text-gray-700">Relationship to user</span>
					<select
						v-model="form.relationship_to_user"
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
					>
						<option value="">Not set</option>
						<option value="self">Self</option>
						<option value="spouse">Spouse</option>
						<option value="child">Child</option>
						<option value="friend">Friend</option>
						<option value="parent">Parent</option>
						<option value="sibling">Sibling</option>
						<option value="other">Other</option>
					</select>
				</label>

				<label class="space-y-1 text-sm">
					<span class="text-gray-700">Area id</span>
					<input
						v-model.number="form.area_from"
						type="number"
						min="1"
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
					>
				</label>
			</div>

			<div class="flex items-center justify-end gap-3">
				<NuxtLink
					:to="`/events/${eventId}/my-booking/${bookingReference}`"
					class="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
				>
					Cancel
				</NuxtLink>
				<button
					type="submit"
					:disabled="isSaving"
					class="inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
				>
					{{ isSaving ? 'Saving...' : 'Save changes' }}
				</button>
			</div>
		</form>
	</div>
</template>

<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query'
import { useAttendee, useUpdateAttendee } from '~/composables/resources/attendee/attendees'
import {
	useEventMyBooking,
	invalidateEventMyBookingQuery,
	type ApiErrorLike,
} from '~/composables/resources/events'

definePageMeta({
	layout: 'booking' as any,
})

type RelationshipType = 'self' | 'spouse' | 'child' | 'friend' | 'parent' | 'sibling' | 'other' | ''

const route = useRoute()
const router = useRouter()
const toast = useToast()
const queryClient = useQueryClient()

const eventId = computed(() => String(route.params.id || ''))
const bookingReference = computed(() => String(route.params.booking_id || ''))
const attendeeId = computed(() => String(route.params.attendee_id || ''))

const myBooking = useEventMyBooking(eventId, computed(() => ({
	booking_reference: bookingReference.value,
})))
const attendee = useAttendee(attendeeId)
const updateAttendee = useUpdateAttendee()

const selectedBookingItem = computed(() => {
	return myBooking.data.value?.bookings?.find(item => item.booking?.booking_reference === bookingReference.value)
})
const bookingAttendees = computed(() => selectedBookingItem.value?.booking?.attendees || [])
const isAttendeeInBooking = computed(() => bookingAttendees.value.some(item => item.id === attendeeId.value))

const form = ref({
	first_name: '',
	last_name: '',
	email: '',
	phone_number: '',
	date_of_birth: '',
	gender: '',
	relationship_to_user: '' as RelationshipType,
	area_from: null as number | null,
})

const isSaving = computed(() => updateAttendee.isPending.value)
const isLoadingPage = computed(() => myBooking.isLoading.value || attendee.isLoading.value)
const hasError = computed(() => !!myBooking.error.value || !!attendee.error.value)

const attendeeName = computed(() => {
	const attendeeData = attendee.data.value?.data
	if (!attendeeData) {
		return 'Attendee'
	}
	return attendeeData.full_name || `${attendeeData.first_name} ${attendeeData.last_name}`.trim() || 'Attendee'
})

watchEffect(() => {
	const myBookingError = myBooking.error.value as unknown as ApiErrorLike | undefined
	if (myBookingError?.statusCode === 404) {
		throw createError({
			statusCode: 404,
			statusMessage: 'Booking not found',
			fatal: true,
		})
	}
})

watchEffect(() => {
	if (!myBooking.isLoading.value && myBooking.data.value && !selectedBookingItem.value) {
		throw createError({
			statusCode: 404,
			statusMessage: 'Booking not found',
			fatal: true,
		})
	}
})

watchEffect(() => {
	if (!myBooking.isLoading.value && myBooking.data.value && !isAttendeeInBooking.value) {
		throw createError({
			statusCode: 404,
			statusMessage: 'Attendee not found in this booking',
			fatal: true,
		})
	}
})

watchEffect(() => {
	if (!myBooking.isLoading.value && myBooking.data.value && !selectedBookingItem.value?.can_manage_all_attendees) {
		throw createError({
			statusCode: 403,
			statusMessage: 'You do not have permission to manage attendees in this booking',
			fatal: true,
		})
	}
})

watch(
	() => attendee.data.value?.data,
	(value) => {
		if (!value) {
			return
		}

		form.value = {
			first_name: value.first_name || '',
			last_name: value.last_name || '',
			email: value.email || '',
			phone_number: value.phone_number || '',
			date_of_birth: value.date_of_birth || '',
			gender: value.gender || '',
			relationship_to_user: (value.relationship_to_user as RelationshipType) || '',
			area_from: value.area_from || null,
		}
	},
	{ immediate: true },
)

async function saveAttendee() {
	try {
		await updateAttendee.mutateAsync({
			attendeeId: attendeeId.value,
			body: {
				first_name: form.value.first_name,
				last_name: form.value.last_name,
				email: form.value.email || null,
				phone_number: form.value.phone_number || null,
				date_of_birth: form.value.date_of_birth || null,
				gender: form.value.gender || null,
				relationship_to_user: form.value.relationship_to_user || undefined,
				area_from: form.value.area_from,
			},
		})

		await invalidateEventMyBookingQuery(queryClient, eventId.value)

		toast.add({
			title: 'Attendee updated',
			description: 'Changes were saved successfully.',
			color: 'green',
		})

		router.push(`/events/${eventId.value}/my-booking/${bookingReference.value}`)
	} catch (error) {
		console.error('Failed to update attendee', error)
		toast.add({
			title: 'Update failed',
			description: 'Could not save attendee changes. Please try again.',
			color: 'red',
		})
	}
}
</script>
