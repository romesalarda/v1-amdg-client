<template>
	<div class="space-y-6">
		<div class="flex flex-wrap items-start justify-between gap-4 border-b border-[#ecc81333] pb-4">
			<div>
				<p class="text-xs uppercase tracking-widest text-[#ecc813]">My Booking</p>
				<h1 class="text-2xl font-semibold text-white">Booking dashboard</h1>
				<p class="mt-1 text-sm text-slate-300">Filter bookings, continue pending payments, and jump into attendee management.</p>
			</div>

			<NuxtLink
				:to="`/events/${eventId}`"
				class="inline-flex items-center rounded-md border border-[#ecc81366] px-3 py-2 text-sm text-[#ecc813] hover:bg-[#ecc8131a]"
			>
				Back to event
			</NuxtLink>
		</div>

		<section class="grid gap-4 lg:grid-cols-3">
			<article class="rounded-xl border border-[#ecc81333] bg-[#0f1728] p-4 lg:col-span-2">
				<h2 class="text-sm font-semibold uppercase tracking-wide text-[#ecc813]">Find bookings</h2>
				<div class="mt-3 grid gap-3 md:grid-cols-2">
					<label class="space-y-1 text-xs uppercase tracking-wide text-slate-300">
						<span>Attendee name</span>
						<input
							v-model="filters.attendee_name"
							type="text"
							placeholder="e.g. John"
							class="w-full rounded-md border border-slate-700 bg-[#0a1220] px-3 py-2 text-sm text-white placeholder:text-slate-500"
						>
					</label>

					<label class="space-y-1 text-xs uppercase tracking-wide text-slate-300">
						<span>Booking reference</span>
						<input
							v-model="filters.booking_reference"
							type="text"
							placeholder="e.g. BK-..."
							class="w-full rounded-md border border-slate-700 bg-[#0a1220] px-3 py-2 text-sm text-white placeholder:text-slate-500"
						>
					</label>

					<label class="space-y-1 text-xs uppercase tracking-wide text-slate-300">
						<span>Last N days</span>
						<input
							v-model.number="filters.booked_in_days"
							type="number"
							min="1"
							class="w-full rounded-md border border-slate-700 bg-[#0a1220] px-3 py-2 text-sm text-white"
						>
					</label>

					<label class="space-y-1 text-xs uppercase tracking-wide text-slate-300">
						<span>Outstanding payments</span>
						<select
							v-model="filters.has_outstanding_payments"
							class="w-full rounded-md border border-slate-700 bg-[#0a1220] px-3 py-2 text-sm text-white"
						>
							<option value="all">All</option>
							<option value="true">Only outstanding</option>
							<option value="false">Only clear</option>
						</select>
					</label>
				</div>
				<div class="mt-3 flex flex-wrap gap-2">
					<button
						type="button"
						class="rounded-md bg-[#ecc813] px-3 py-2 text-sm font-semibold text-[#0b1423] hover:bg-[#f4d645]"
						@click="applyFilters"
					>
						Apply filters
					</button>
					<button
						type="button"
						class="rounded-md border border-slate-600 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
						@click="resetFilters"
					>
						Reset
					</button>
				</div>
			</article>

			<article class="rounded-xl border border-[#ecc81333] bg-[#0f1728] p-4">
				<h2 class="text-sm font-semibold uppercase tracking-wide text-[#ecc813]">Outstanding payments</h2>
				<p class="mt-1 text-sm text-slate-300">{{ outstandingSummary }}</p>
				<ul class="mt-3 space-y-2 text-sm text-slate-200">
					<li v-for="payment in outstandingItems.slice(0, 3)" :key="payment.payment_reference" class="rounded-md border border-slate-700 bg-[#0a1220] p-2">
						<p class="font-medium text-white">{{ payment.payment_reference || 'Pending payment' }}</p>
						<p class="text-xs text-slate-400">{{ payment.status || 'PENDING' }} · {{ payment.amount || '-' }}</p>
						<p v-if="payment.metadata_attendees?.length" class="mt-1 text-xs text-slate-300">
							Attendees: {{ payment.metadata_attendees.join(', ') }}
						</p>
					</li>
				</ul>
			</article>
		</section>

		<div v-if="myBooking.isLoading.value" class="rounded-xl border border-slate-700 bg-[#0f1728] p-6 text-sm text-slate-300">
			Loading your bookings...
		</div>

		<div
			v-else-if="myBooking.error.value && !isNotFound"
			class="rounded-xl border border-red-500/40 bg-red-950/30 p-6 text-sm text-red-200"
		>
			Unable to load your bookings right now.
		</div>

		<div v-else-if="bookingItems.length" class="space-y-4">
			<article
				v-for="item in bookingItems"
				:key="item.booking.booking_reference"
				class="rounded-xl border border-slate-700 bg-[#0f1728] p-5"
			>
				<div class="mb-3 flex flex-wrap items-start justify-between gap-3">
					<div>
						<h2 class="text-lg font-semibold text-white">{{ item.booking.booking_reference }}</h2>
						<p class="text-sm text-slate-300">
							{{ item.is_booking_owner ? 'You are the booking owner' : 'You are linked as an attendee' }}
						</p>
					</div>

					<NuxtLink
						:to="`/events/${eventId}/my-booking/${item.booking.booking_reference}`"
						class="inline-flex items-center rounded-md bg-[#ecc813] px-3 py-2 text-sm font-semibold text-[#0b1423] hover:bg-[#f4d645]"
					>
						View booking
					</NuxtLink>
				</div>

				<dl class="grid gap-2 text-sm text-slate-200 md:grid-cols-3">
					<div>
						<dt class="text-slate-400">Booked at</dt>
						<dd class="font-medium">{{ formatDate(item.booking.booked_at) }}</dd>
					</div>
					<div>
						<dt class="text-slate-400">Attendees</dt>
						<dd class="font-medium">{{ item.booking.attendee_count || 0 }}</dd>
					</div>
					<div>
						<dt class="text-slate-400">Payments</dt>
						<dd class="font-medium">{{ item.booking.payments?.length || 0 }}</dd>
					</div>
				</dl>

				<div class="mt-3 text-sm text-slate-200">
					<span class="font-medium">Attendee names:</span>
					<span v-if="item.booking.attendees?.length" class="ml-1">
						{{ item.booking.attendees.map(attendee => attendee.name).filter(Boolean).join(', ') }}
					</span>
					<span v-else class="ml-1 text-slate-400">No attendees found</span>
				</div>
			</article>

			<div class="flex items-center justify-end gap-2">
				<button
					type="button"
					class="rounded-md border border-slate-600 px-3 py-2 text-sm text-slate-300 disabled:opacity-40"
					:disabled="!pagination.previous"
					@click="previousPage"
				>
					Previous
				</button>
				<button
					type="button"
					class="rounded-md border border-slate-600 px-3 py-2 text-sm text-slate-300 disabled:opacity-40"
					:disabled="!pagination.next"
					@click="nextPage"
				>
					Next
				</button>
			</div>
		</div>

		<div v-else class="rounded-xl border border-slate-700 bg-[#0f1728] p-6 text-sm text-slate-300">
			No bookings matched your filters.
		</div>
	</div>
</template>

<script setup lang="ts">
import {
	type ApiErrorLike,
	useEventMyBooking,
	useEventMyOutstandingBookingPayments,
} from '~/composables/resources/events'

definePageMeta({
	layout: 'booking' as any,
})

const route = useRoute()
const router = useRouter()

const eventId = computed(() => String(route.params.id || ''))

const page = ref(Number(route.query.page || 1) || 1)
const filters = reactive({
	attendee_name: String(route.query.attendee_name || ''),
	booking_reference: String(route.query.booking_reference || ''),
	booked_in_days: route.query.booked_in_days ? Number(route.query.booked_in_days) : undefined as number | undefined,
	has_outstanding_payments: String(route.query.has_outstanding_payments || 'all') as 'all' | 'true' | 'false',
})

const bookingQuery = computed(() => ({
	page: page.value,
	attendee_name: filters.attendee_name || undefined,
	booking_reference: filters.booking_reference || undefined,
	booked_in_days: filters.booked_in_days || undefined,
	has_outstanding_payments:
		filters.has_outstanding_payments === 'all'
			? undefined
			: filters.has_outstanding_payments === 'true',
}))

const myBooking = useEventMyBooking(eventId, bookingQuery)

const outstandingPayments = useEventMyOutstandingBookingPayments(eventId, computed(() => ({
	page: 1,
	attendee_name: filters.attendee_name || undefined,
	payment_status: 'PENDING',
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

const bookingItems = computed(() => myBooking.data.value?.bookings || [])
const pagination = computed(() => myBooking.data.value?.pagination || { count: 0, next: null, previous: null })
const outstandingItems = computed(() => outstandingPayments.data.value?.items || [])

const outstandingSummary = computed(() => {
	const count = outstandingPayments.data.value?.pagination.count || 0
	if (!count) {
		return 'No outstanding payments found.'
	}
	return `${count} payment${count > 1 ? 's' : ''} waiting for completion.`
})

function applyFilters() {
	page.value = 1
	syncQueryParams()
}

function resetFilters() {
	filters.attendee_name = ''
	filters.booking_reference = ''
	filters.booked_in_days = undefined
	filters.has_outstanding_payments = 'all'
	page.value = 1
	syncQueryParams()
}

function nextPage() {
	if (!pagination.value.next) {
		return
	}
	page.value += 1
	syncQueryParams()
}

function previousPage() {
	if (!pagination.value.previous || page.value <= 1) {
		return
	}
	page.value -= 1
	syncQueryParams()
}

function syncQueryParams() {
	router.replace({
		query: {
			...route.query,
			page: page.value > 1 ? String(page.value) : undefined,
			attendee_name: filters.attendee_name || undefined,
			booking_reference: filters.booking_reference || undefined,
			booked_in_days: filters.booked_in_days ? String(filters.booked_in_days) : undefined,
			has_outstanding_payments: filters.has_outstanding_payments !== 'all' ? filters.has_outstanding_payments : undefined,
		},
	})
}

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