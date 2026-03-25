<template>
	<div class="min-h-screen bg-white">
		<section class="relative h-[250px] w-full overflow-hidden md:h-[350px]">
			<div class="absolute inset-0 bg-deep-navy">
				<img
					v-if="heroImageSrc"
					:src="heroImageSrc"
					alt="Event landing"
					class="h-full w-full object-cover"
					@error="onImageError"
				>
				<div v-else class="h-full w-full bg-gradient-to-br from-blue-600 to-deep-navy"></div>
			</div>
			<div class="absolute inset-0 bg-gradient-to-t from-deep-navy via-deep-navy/40 to-transparent"></div>

			<div class="absolute inset-0 flex items-end">
				<div class="max-container-fluid w-full pb-12 md:pb-16">
					<div class="flex flex-wrap items-end justify-between gap-4">
						<div class="max-w-3xl">
							<p class="text-[10px] font-black uppercase tracking-[0.3em] text-blue-300">My Booking</p>
							<h1 class="mt-3 text-5xl font-black uppercase leading-[0.9] tracking-tight text-white md:text-7xl">{{ heroTitle }}</h1>
							<p class="mt-4 max-w-2xl text-base text-white/85 md:text-xl">Manage bookings, track pending payments, and complete transfers with confidence.</p>
						</div>
						<NuxtLink
							:to="`/events/${eventId}`"
							class="inline-flex items-center rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-[11px] font-black uppercase tracking-wider text-white hover:bg-white/20"
						>
							Back to event
						</NuxtLink>
					</div>
				</div>
			</div>
		</section>

	

		<div class="max-container-fluid py-8">
			<div class="space-y-6">
		<section class="grid gap-6 lg:grid-cols-12">
			<div class="space-y-4 lg:col-span-8">
				<article class="rounded-2xl border border-deep-navy/10 bg-white p-5">
					<div class="rounded-xl border border-deep-navy/10 bg-mist-blue/20 p-4">
						<div class="flex flex-wrap items-center gap-3">
							<div class="relative min-w-[260px] flex-1">
								<span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-deep-navy/35">
									<UIcon name="i-heroicons-magnifying-glass" class="h-4 w-4" />
								</span>
								<input
									v-model="searchQuery"
									type="text"
									placeholder="Search attendee name or booking reference"
									class="w-full rounded-xl border border-deep-navy/15 bg-white py-3 pl-10 pr-4 text-sm text-deep-navy placeholder:text-deep-navy/35 focus:border-blue-500 focus:outline-none"
								>
							</div>
							<button
								type="button"
								class="rounded-xl border border-deep-navy/15 bg-white px-4 py-3 text-xs font-black uppercase tracking-wider text-deep-navy hover:border-blue-500 hover:text-blue-600"
								@click="showFilters = !showFilters"
							>
								{{ showFilters ? 'Hide filters' : 'More filters' }}
							</button>
							<button
								type="button"
								class="rounded-xl bg-deep-navy px-4 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-blue-600"
								@click="applyFilters"
							>
								Search
							</button>
						</div>

						<div v-if="showFilters" class="mt-4 grid gap-3 border-t border-deep-navy/10 pt-4 md:grid-cols-3">
							<label class="space-y-1 text-xs font-bold uppercase tracking-wide text-deep-navy/60">
								<span>Last N days</span>
								<input
									v-model.number="filters.booked_in_days"
									type="number"
									min="1"
									class="w-full rounded-md border border-deep-navy/15 bg-white px-3 py-2 text-sm text-deep-navy focus:border-blue-500 focus:outline-none"
								>
							</label>

							<label class="space-y-1 text-xs font-bold uppercase tracking-wide text-deep-navy/60">
								<span>Outstanding payments</span>
								<select
									v-model="filters.has_outstanding_payments"
									class="w-full rounded-md border border-deep-navy/15 bg-white px-3 py-2 text-sm text-deep-navy focus:border-blue-500 focus:outline-none"
								>
									<option value="all">All</option>
									<option value="true">Only outstanding</option>
									<option value="false">Only clear</option>
								</select>
							</label>

							<div class="flex items-end">
								<button
									type="button"
									class="w-full rounded-md border border-deep-navy/20 bg-white px-3 py-2 text-sm font-semibold text-deep-navy hover:border-blue-500 hover:text-blue-600"
									@click="resetFilters"
								>
									Reset filters
								</button>
							</div>
						</div>
					</div>

					<!-- <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
						<h2 class="text-sm font-black uppercase tracking-wide text-deep-navy">Your bookings</h2>
						<p class="text-xs font-semibold uppercase tracking-wider text-deep-navy/50">Page size: 5</p>
					</div> -->

					<div v-if="myBooking.isLoading.value" class="rounded-lg border border-deep-navy/10 bg-mist-blue/30 p-6 text-sm text-deep-navy/60">
						Loading your bookings...
					</div>

					<div
						v-else-if="myBooking.error.value && !isNotFound"
						class="rounded-lg border border-red-500/40 bg-red-950/30 p-6 text-sm text-red-200"
					>
						Unable to load your bookings right now.
					</div>

					<div v-else-if="bookingItems.length" class="space-y-4 mt-5">
						<NuxtLink
							v-for="item in bookingItems"
							:key="item.booking.booking_reference"
							:to="`/events/${eventId}/b/${item.booking.booking_reference}`"
							class="group block rounded-xl border border-deep-navy/10 bg-white p-5 transition-all duration-200 hover:border-blue-300 hover:bg-blue-50/20"
						>
							<div class="mb-3 flex items-start justify-between gap-4">
								<div class="space-y-1">
									<p class="text-[11px] font-black uppercase tracking-wide text-deep-navy/50">Booking</p>
									<h2 class="text-xl font-black text-deep-navy">{{ getBookingDisplayTitle(item) }}</h2>
									<p class="text-sm text-deep-navy/60">
										{{ item.is_booking_owner ? 'You are the booking owner' : 'You are linked as an attendee' }}
									</p>
								</div>

								<div class="flex items-center gap-3">
									<div class="text-right">
										<p class="text-[11px] font-black uppercase tracking-wide text-deep-navy/50">Price</p>
										<p class="text-base font-black text-deep-navy">{{ getBookingPaymentTotal(item.booking.payments) }}</p>
									</div>
									<div class="flex h-14 w-14 items-center justify-center rounded-full border border-deep-navy/15 bg-white text-deep-navy/50 transition-all duration-200 group-hover:border-blue-400 group-hover:bg-blue-600 group-hover:text-white">
										<UIcon name="i-heroicons-arrow-right" class="h-7 w-7" />
									</div>
								</div>
							</div>

							<dl class="grid gap-2 text-sm text-deep-navy md:grid-cols-3">
								<div>
									<dt class="text-deep-navy/50">Booked at</dt>
									<dd class="font-medium">{{ formatDate(item.booking.booked_at) }}</dd>
								</div>
								<div>
									<dt class="text-deep-navy/50">Attendees</dt>
									<dd class="font-medium">{{ item.booking.attendee_count || 0 }}</dd>
								</div>
								<div>
									<dt class="text-deep-navy/50">Names</dt>
									<dd class="font-medium">{{ item.booking.attendees.map(attendee => attendee.name).filter(Boolean).join(', ') }}</dd>
								</div>
							</dl>

						</NuxtLink>

						<div class="flex items-center justify-end gap-2">
							<button
								type="button"
								class="rounded-md border border-deep-navy/20 bg-white px-3 py-2 text-sm font-semibold text-deep-navy disabled:opacity-40"
								:disabled="!pagination.previous"
								@click="previousPage"
							>
								Previous
							</button>
							<button
								type="button"
								class="rounded-md border border-deep-navy/20 bg-white px-3 py-2 text-sm font-semibold text-deep-navy disabled:opacity-40"
								:disabled="!pagination.next"
								@click="nextPage"
							>
								Next
							</button>
						</div>
					</div>

					<div v-else class="rounded-lg border border-deep-navy/10 bg-mist-blue/30 p-6 text-sm text-deep-navy/60">
						No bookings matched your filters.
					</div>
				</article>
			</div>

			<aside class="lg:col-span-4">
				<article class="sticky top-24 rounded-2xl border-2 border-blue-200 bg-gradient-to-b from-blue-50 to-white p-5 shadow-sm">
					<div class="flex items-start justify-between gap-3">
						<div>
							<h2 class="text-sm font-black uppercase tracking-wide text-blue-700">Outstanding payment</h2>
							<p class="mt-1 text-sm text-blue-900/80">{{ outstandingSummary }}</p>
						</div>
						<p v-if="outstandingItems.length" class="rounded-full border border-blue-300 bg-white px-2.5 py-1 text-xs font-black text-blue-700">
							{{ outstandingIndex + 1 }} / {{ outstandingItems.length }}
						</p>
					</div>

					<div v-if="outstandingPayments.isLoading.value" class="mt-4 rounded-lg border border-deep-navy/10 bg-mist-blue/30 p-4 text-sm text-deep-navy/60">
						Loading payment details...
					</div>

					<div v-else-if="currentOutstandingPayment" class="mt-4 space-y-3">
						<div class="rounded-lg border border-blue-200 bg-blue-600 p-3 text-white">
							<p class="mt-2 inline-flex rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-black uppercase tracking-wide">{{ currentOutstandingPayment.status || 'PENDING' }}</p>
							<p class="mt-2 text-lg font-black">{{ currentOutstandingPayment.amount || '-' }}</p>
						</div>

						<div class="rounded-lg border border-blue-200 bg-white p-3">
							<p class="text-xs font-black uppercase tracking-wide text-blue-700">Payment method</p>
							<p class="mt-1 text-sm font-semibold text-deep-navy">
								{{ currentOutstandingPayment.payment_method_title || currentOutstandingPayment.payment_method || 'N/A' }}
							</p>
							<p v-if="currentOutstandingPayment.payment_instructions" class="mt-2 rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-800">
								{{ currentOutstandingPayment.payment_instructions }}
							</p>
						</div>

						<div v-if="formattedPaymentDetails.length" class="rounded-lg border border-blue-200 bg-white p-3">
							<p class="text-xs font-black uppercase tracking-wide text-blue-700">Bank transfer details</p>
							<dl class="mt-2 space-y-2 text-sm">
								<div v-for="detail in formattedPaymentDetails" :key="detail.label" class="rounded-md border border-blue-200 bg-blue-50 px-2 py-1.5">
									<dt class="text-[11px] font-black uppercase tracking-wide text-blue-700">{{ detail.label }}</dt>
									<dd class="mt-0.5 break-all font-medium text-deep-navy">{{ detail.value }}</dd>
								</div>
							</dl>
						</div>

						<p v-if="currentOutstandingPayment.metadata_attendees?.length" class="rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs text-deep-navy/80">
							Attendees: {{ currentOutstandingPayment.metadata_attendees.join(', ') }}
						</p>

						<div v-if="outstandingItems.length > 1" class="grid grid-cols-2 gap-2 pt-1">
							<button
								type="button"
								class="rounded-md border border-deep-navy/20 bg-white px-3 py-2 text-sm font-semibold text-deep-navy hover:border-blue-500 hover:text-blue-600"
								@click="previousOutstanding"
							>
								Previous
							</button>
							<button
								type="button"
								class="rounded-md bg-deep-navy px-3 py-2 text-sm font-semibold text-white hover:bg-blue-600"
								@click="nextOutstanding"
							>
								Next
							</button>
						</div>
					</div>

					<div v-else class="mt-4 rounded-lg border border-deep-navy/10 bg-mist-blue/30 p-4 text-sm text-deep-navy/60">
						No outstanding payments found.
					</div>
				</article>
			</aside>
		</section>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import {
	type ApiErrorLike,
	useEvent,
	useEventMyBooking,
	useEventMyOutstandingBookingPayments,
} from '~/composables/resources/events'
import { onImageError, resolveImageUrl } from '~/utils/image'

definePageMeta({
	layout: 'booking' as any,
})

const route = useRoute()
const router = useRouter()

const eventId = computed(() => String(route.params.id || ''))
const { data: eventData } = useEvent(eventId)
const event = computed(() => eventData.value?.data)

const heroTitle = computed(() => event.value?.title || myBooking.data.value?.event?.title || 'Booking dashboard')
const heroImageSrc = computed(() => {
	const eventImage = event.value?.main_landing_image?.image || (event.value as any)?.main_landing_image?.image
	if (!eventImage) {
		return ''
	}
	return resolveImageUrl(eventImage)
})

const showFilters = ref(false)
const searchQuery = ref(String(route.query.q || ''))

const page = ref(Number(route.query.page || 1) || 1)
const filters = reactive({
	booked_in_days: route.query.booked_in_days ? Number(route.query.booked_in_days) : undefined as number | undefined,
	has_outstanding_payments: String(route.query.has_outstanding_payments || 'all') as 'all' | 'true' | 'false',
})

const bookingQuery = computed(() => ({
	page: page.value,
	page_size: 5,
	attendee_name: searchQuery.value || undefined,
	booking_reference: searchQuery.value || undefined,
	booked_in_days: filters.booked_in_days || undefined,
	has_outstanding_payments:
		filters.has_outstanding_payments === 'all'
			? undefined
			: filters.has_outstanding_payments === 'true',
}))

const myBooking = useEventMyBooking(eventId, bookingQuery)

const outstandingPayments = useEventMyOutstandingBookingPayments(eventId, computed(() => ({
	page: 1,
	attendee_name: searchQuery.value || undefined,
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
const outstandingIndex = ref(0)

watch(
	() => outstandingItems.value.length,
	(length) => {
		if (!length) {
			outstandingIndex.value = 0
			return
		}
		if (outstandingIndex.value >= length) {
			outstandingIndex.value = 0
		}
	},
)

const currentOutstandingPayment = computed(() => {
	if (!outstandingItems.value.length) {
		return null
	}
	return outstandingItems.value[outstandingIndex.value] || null
})

const formattedPaymentDetails = computed(() => {
	const details = currentOutstandingPayment.value?.payment_method_details
	if (!details || typeof details !== 'object' || Array.isArray(details)) {
		return []
	}

	return Object.entries(details as Record<string, unknown>)
		.filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== '')
		.map(([key, value]) => ({
			label: formatDetailLabel(key),
			value: typeof value === 'object' ? JSON.stringify(value) : String(value),
		}))
})

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
	searchQuery.value = ''
	filters.booked_in_days = undefined
	filters.has_outstanding_payments = 'all'
	page.value = 1
	syncQueryParams()
}

function nextOutstanding() {
	if (!outstandingItems.value.length) {
		return
	}
	outstandingIndex.value = (outstandingIndex.value + 1) % outstandingItems.value.length
}

function previousOutstanding() {
	if (!outstandingItems.value.length) {
		return
	}
	outstandingIndex.value =
		(outstandingIndex.value - 1 + outstandingItems.value.length) % outstandingItems.value.length
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
			q: searchQuery.value || undefined,
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

function formatDetailLabel(value: string) {
	return value
		.replace(/_/g, ' ')
		.replace(/\b\w/g, (match) => match.toUpperCase())
}

function getBookingDisplayTitle(item: {
	booking?: { attendees?: Array<{ name?: string }>; attendee_count?: number }
}) {
	const names = item.booking?.attendees?.map(attendee => attendee.name).filter(Boolean) || []
	if (names.length) {
		return names[0] as string
	}
	const count = item.booking?.attendee_count || 0
	if (count > 1) {
		return `${count} attendees`
	}
	return 'Your booking'
}

function getBookingPaymentTotal(payments?: Array<{ amount?: string }>) {
	if (!payments?.length) {
		return '-'
	}

	const firstAmount = payments[0]?.amount || ''
	const currencySymbolMatch = firstAmount.match(/^[^\d-]+/)
	const currencySymbol = currencySymbolMatch?.[0] || ''

	const total = payments.reduce((sum, payment) => {
		const rawAmount = payment?.amount || ''
		const numeric = Number(rawAmount.replace(/[^\d.-]/g, ''))
		if (Number.isNaN(numeric)) {
			return sum
		}
		return sum + numeric
	}, 0)

	if (!Number.isFinite(total) || total <= 0) {
		return payments[0]?.amount || '-'
	}

	return `${currencySymbol}${total.toFixed(2)}`
}
</script>