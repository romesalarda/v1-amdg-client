<template>
	<div class="min-h-screen bg-[#f7f9fe] text-[#181c20]">
		<section class="relative h-[320px] overflow-hidden md:h-[350px]">
			<div class="absolute inset-0 bg-[#0b132b]">
				<img
					v-if="heroImageSrc"
					:src="heroImageSrc"
					alt="Event landing"
					class="h-full w-full object-cover"
					@error="onImageError"
				>
				<div v-else class="h-full w-full bg-gradient-to-br from-[#26408b] to-[#0b132b]"></div>
			</div>
			<div class="absolute inset-0 bg-gradient-to-t from-black/80 via-[#0b132b]/50 to-transparent"></div>
			<div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.14),_transparent_40%)]"></div>

			<div class="absolute bottom-0 left-0 w-full">
				<div class="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 pb-12 md:px-8 md:pb-14 lg:flex-row lg:items-end lg:justify-between">
					<div class="max-w-4xl">
						<p class="text-[10px] font-black uppercase tracking-[0.35em] text-blue-200">My Booking</p>
						<h1 class="mt-4 text-5xl font-black uppercase leading-[0.9] tracking-tight text-white md:text-7xl">{{ heroTitle }}</h1>
						<p class="mt-5 max-w-2xl text-sm leading-6 text-blue-100/80 md:text-lg">
							Manage bookings, track outstanding payments, and complete transfers from a single dashboard.
						</p>
					</div>

					<NuxtLink
						:to="`/events/${eventId}`"
						class="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 py-3 text-[11px] font-black uppercase tracking-[0.25em] text-white backdrop-blur-md transition-transform hover:-translate-y-0.5 hover:bg-white/20"
					>
						Back to event
					</NuxtLink>
				</div>
			</div>
		</section>
		<div class="relative z-20 bg-white border-b border-deep-navy/10 shadow-sm animate-soft-in-delay">
		<div class="max-w-6xl mx-auto px-3 py-2">
			<div class="flex flex-wrap justify-between gap-3">
			<div class="flex items-center gap-3 px-3 py-4 min-w-0">
				<div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 ">
				<div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-blue-100 text-blue-700">
					<span class="material-symbols-outlined" style="font-size:20px">calendar_month</span>
				</div>
				</div>
				<div class="min-w-0">
				<p class="text-label-bold font-label-bold text-deep-navy/50 uppercase">Date</p>
				<p class="text-body-md font-body-md font-bold text-deep-navy truncate">{{ eventInfo.dateRange }}</p>
				</div>
			</div>

			<div class="flex items-center gap-3 px-3 py-4 min-w-0">
				<div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
				<div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-blue-100 text-blue-700">
					<span class="material-symbols-outlined" style="font-size:20px">schedule</span>
				</div>
				</div>
				<div class="min-w-0">
				<p class="text-label-bold font-label-bold text-deep-navy/50 uppercase">Timing</p>
				<p class="text-body-md font-body-md font-bold text-deep-navy truncate">{{ formatDateTime(eventInfo.startTime) }}</p>
				<p class="text-body-sm font-body-sm text-deep-navy/60 truncate">{{ }}</p>
				</div>
			</div>

			<div class="flex items-center gap-3 px-3 py-4 min-w-0">
				<div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
				<div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-blue-100 text-blue-700">
					<span class="material-symbols-outlined" style="font-size:20px">location_on</span>
				</div>
				</div>
				<div class="min-w-0">
				<p class="text-label-bold font-label-bold text-deep-navy/50 uppercase">Location</p>
				<p class="text-body-md font-body-md font-bold text-deep-navy truncate">{{ eventInfo.location }}</p>
				<p v-if="primaryVenue?.venue_city" class="text-body-sm font-body-sm text-deep-navy/60 truncate">{{ primaryVenue.venue_city }}</p>
				</div>
			</div>

			<div class="flex items-center gap-3 px-3 py-4 min-w-0">
				<div
				class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
				:class="outstandingPayments.data.value?.items.length ? 'bg-primary/10 text-primary' : 'bg-green-100 text-green-700'"
				>
				<span class="material-symbols-outlined" style="font-size:20px">payments</span>
				</div>
				<div class="min-w-0">
				<p class="text-label-bold font-label-bold text-deep-navy/50 uppercase">Booking Status</p>
				<p class="text-body-md font-body-md font-bold" :class="outstandingPayments.data.value?.items.length ? 'text-primary' : 'text-green-700'">
					{{ outstandingPayments.data.value?.items.length ? `${outstandingPayments.data.value.items.length} payment(s) outstanding` : 'No outstanding payments' }}
				</p>
				</div>
			</div>
			</div>
		</div>
		</div>

		<div class="mx-auto max-w-7xl px-6 py-12 md:px-8">
			<section class="grid grid-cols-1 gap-12 lg:grid-cols-12">
				<div class="lg:col-span-8">
					<div class="flex items-center justify-between gap-4 pb-8">
						<h2 class="text-3xl font-black tracking-tight text-[#181c20] md:text-4xl">Active Bookings</h2>
						<div class="hidden md:flex items-center gap-2">
							<span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
							<span class="text-xs font-black uppercase tracking-[0.25em] text-[#0b132b]/45">Registration open</span>
						</div>
					</div>

					<div class="mb-8 flex flex-wrap items-center gap-4">
						<div class="relative min-w-[260px] flex-1">
							<span class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#0b132b]/45">
								<UIcon name="i-heroicons-magnifying-glass" class="h-5 w-5" />
							</span>
							<input
								v-model="searchQuery"
								type="text"
								placeholder="Search attendee name or booking reference"
								class="w-full rounded-2xl border-0 bg-[#f1f4f9] py-3 pl-12 pr-4 text-sm text-[#181c20] ring-1 ring-[#dbe4f0] placeholder:text-[#0b132b]/35 focus:ring-2 focus:ring-[#0b132b]/15"
							>
						</div>
						<div class="flex gap-2">
							<button
								type="button"
								class="rounded-full bg-[#0b132b] px-5 py-3 text-[11px] font-black uppercase tracking-[0.22em] text-white"
								@click="showFilters = !showFilters"
							>
								{{ showFilters ? 'Hide filters' : 'More filters' }}
							</button>
							<button
								type="button"
								class="rounded-full border border-[#dbe4f0] bg-white px-5 py-3 text-[11px] font-black uppercase tracking-[0.22em] text-[#0b132b]"
								@click="applyFilters"
							>
								Search
							</button>
						</div>
					</div>

					<div v-if="showFilters" class="mb-8 grid gap-3 border-t border-[#dbe4f0] pt-4 md:grid-cols-3">
						<label class="space-y-1 text-[11px] font-black uppercase tracking-[0.22em] text-[#0b132b]/60">
							<span>Last N days</span>
							<input
								v-model.number="filters.booked_in_days"
								type="number"
								min="1"
								class="w-full rounded-xl border border-[#dbe4f0] bg-white px-3 py-2 text-sm text-[#181c20] focus:border-[#0b132b] focus:outline-none"
							>
						</label>

						<label class="space-y-1 text-[11px] font-black uppercase tracking-[0.22em] text-[#0b132b]/60">
							<span>Outstanding payments</span>
							<select
								v-model="filters.has_outstanding_payments"
								class="w-full rounded-xl border border-[#dbe4f0] bg-white px-3 py-2 text-sm text-[#181c20] focus:border-[#0b132b] focus:outline-none"
							>
								<option value="all">All</option>
								<option value="true">Only outstanding</option>
								<option value="false">Only clear</option>
							</select>
						</label>

						<div class="flex items-end">
							<button
								type="button"
								class="w-full rounded-xl border border-[#dbe4f0] bg-white px-3 py-2 text-sm font-semibold text-[#0b132b]"
								@click="resetFilters"
							>
								Reset filters
							</button>
						</div>
					</div>

					<div v-if="myBooking.isLoading.value" class="rounded-xl border border-[#dbe4f0] bg-[#f1f4f9] p-6 text-sm text-[#0b132b]/60">
						Loading your bookings...
					</div>

					<div
						v-else-if="myBooking.error.value && !isNotFound"
						class="rounded-xl border border-red-500/30 bg-red-50 p-6 text-sm text-red-700"
					>
						Unable to load your bookings right now.
					</div>

					<div v-else-if="bookingItems.length" class="space-y-4">
						<NuxtLink
							v-for="item in bookingItems"
							:key="item.booking.booking_reference"
							:to="`/events/${eventId}/b/${item.booking.booking_reference}`"
							class="group flex items-center justify-between gap-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#dbe4f0] transition-all hover:-translate-y-0.5 hover:shadow-md"
						>
							<div class="flex min-w-0 items-center gap-5">
								<!-- <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0b132b] font-black text-[#bec5e5]">
									{{ getBookingInitials(getBookingDisplayTitle(item)) }}
								</div> -->
								<img
									:src="`https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${item.booking.booking_reference}`"
									alt="Default profile"
									class="w-12 h-12 rounded-full object-cover"
								/>
								<div class="min-w-0">
									<h3 class="font-black text-[#181c20] text-xl md:text-2xl">{{ getBookingDisplayTitle(item) }}</h3>
									<p class="text-sm font-medium text-[#0b132b]/55">
										Ref: #{{ item.booking.booking_reference.slice(0,20).toUpperCase()  }} ...
									</p>
								</div>
							</div>

							<div class="flex items-center gap-10 text-right">
								<div>
									<p class="mb-2 text-[10px] font-black uppercase tracking-widest text-[#0b132b]/45">Attendees</p>
									<div class="flex justify-end -space-x-2">
										<div
											v-for="(attendee, attendeeIndex) in getBookingAttendeePreview(item)"
											:key="`${item.booking.booking_reference}-${attendeeIndex}`"
											class="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-[9px] font-black text-[#0b132b]"
										>
											{{ getAttendeeInitials(attendee?.name) }}
										</div>
										<div
											v-if="!getBookingAttendeePreview(item).length"
											class="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-[9px] font-black text-[#0b132b]"
										>
											?
										</div>
									</div>
								</div>
								<div>
									<p class="mb-2 text-[10px] font-black uppercase tracking-widest text-[#0b132b]/45">Amount</p>
									<p class="font-black text-lg text-[#181c20]">{{ getBookingPaymentTotal(item.booking.payments) }}</p>
								</div>
								<div class="text-right">
									<p class="mb-2 text-[10px] font-black uppercase tracking-widest text-[#0b132b]/45">Booked</p>
									<p class="text-sm font-medium text-[#181c20]">{{ formatRelativeTime(item.booking.booked_at) }}</p>
								</div>
								<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f1f4f9] text-[#0b132b] transition-all group-hover:bg-[#0b132b] group-hover:text-white">
									<UIcon name="i-heroicons-chevron-right" class="h-5 w-5" />
								</div>
							</div>
						</NuxtLink>

						<div class="mt-12 flex items-center justify-between border-t border-[#dbe4f0] pt-8 text-sm font-medium text-[#0b132b]/55">
							<button
								type="button"
								class="flex items-center gap-2 transition-colors hover:text-[#181c20] disabled:opacity-40"
								:disabled="!pagination.previous"
								@click="previousPage"
							>
								<UIcon name="i-heroicons-arrow-left" class="h-5 w-5" />
								Previous
							</button>
							<span class="font-black text-[#181c20]">Page {{ page }}{{ pagination.count ? ` of ${Math.max(1, Math.ceil((pagination.count || 0) / 5))}` : '' }}</span>
							<button
								type="button"
								class="flex items-center gap-2 transition-colors hover:text-[#181c20] disabled:opacity-40"
								:disabled="!pagination.next"
								@click="nextPage"
							>
								Next
								<UIcon name="i-heroicons-arrow-right" class="h-5 w-5" />
							</button>
						</div>
					</div>

					<div v-else class="rounded-xl border border-[#dbe4f0] bg-[#f1f4f9] p-6 text-sm text-[#0b132b]/60">
						No bookings matched your filters.
					</div>
				</div>

				<aside class="space-y-8 lg:col-span-4">
					<div class="rounded-2xl bg-[#0b132b] p-8 text-white shadow-sm" v-if="outstandingItems.length >= 1">
						<div class="mb-6 flex items-start justify-between gap-4" >
							<div class="flex items-center gap-2 rounded-lg bg-red-600 px-3 py-1.5 text-white">
							<UIcon name="i-heroicons-exclamation-triangle" class="h-4 w-4" />
							<span class="text-[10px] font-black uppercase tracking-[0.22em]">
								Urgent Action Required
							</span>
							</div>
							<div v-if="outstandingItems.length > 1" class="flex gap-2">
								<button
									type="button"
									class="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
									@click="previousOutstanding"
								>
									<UIcon name="i-heroicons-chevron-left" class="h-4 w-4" />
								</button>
								<button
									type="button"
									class="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
									@click="nextOutstanding"
								>
									<UIcon name="i-heroicons-chevron-right" class="h-4 w-4" />
								</button>
							</div>
						</div>

						<div v-if="outstandingPayments.isLoading.value" class="rounded-2xl bg-white/5 p-4 text-sm text-white/70">
							Loading payment details...
						</div>

						<div v-else-if="currentOutstandingPayment" class="space-y-8">
							<div>
								<p class="text-[10px] font-black uppercase tracking-[0.22em] text-blue-200/60">Outstanding Payment</p>
								<h3 class="mt-2 text-4xl font-black tracking-tight text-white">{{ formatMoney(currentOutstandingPayment.amount || 0, currentOutstandingPayment.currency || 'USD') }}</h3>
								<p class="mt-1 text-xs font-medium text-blue-200/40">
									{{ outstandingItems.length }} payment{{ outstandingItems.length === 1 ? '' : 's' }} waiting for {{ currentOutstandingPayment.metadata_attendees?.[0] || 'completion' }}
								</p>
							</div>

							<button type="button" class="w-full rounded-full bg-white py-4 text-sm font-black uppercase tracking-[0.22em] text-[#0b132b] transition-transform hover:-translate-y-0.5"
								@click="() => router.push(`/events/${eventId}/b/${currentOutstandingPayment?.booking?.booking?.booking_reference}`)"
							>
								Complete Payment
							</button>

							<!-- <div class="border-t border-white/10 pt-8">
								<h4 class="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-white">
									<UIcon name="i-heroicons-banknotes" class="h-4 w-4" />
									Bank Transfer Details
								</h4>
								<div class="space-y-4">
									<div v-for="detail in formattedPaymentDetails" :key="detail.label" class="rounded-xl bg-white/5 p-4">
										<p class="mb-1 block text-[10px] font-bold uppercase tracking-[0.22em] text-blue-200/60">{{ detail.label }}</p>
										<p class="font-black text-white">{{ detail.value }}</p>
									</div>
									<div v-if="!formattedPaymentDetails.length" class="rounded-xl bg-white/5 p-4 text-sm text-white/70">
										No bank transfer details available.
									</div>
								</div>
							</div> -->
						</div>

						<div v-else class="rounded-2xl bg-white/5 p-4 text-sm text-white/70">
							No outstanding payments found.
						</div>
					</div>

					<div class="rounded-2xl bg-[#131a33] p-8 text-white">
						<h3 class="mb-6 text-xl font-black">Upcoming Deadlines</h3>
						<div class="space-y-6">
							<div class="flex gap-4">
								<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
									<UIcon name="i-heroicons-document-text" class="h-5 w-5 text-[#bec5e5]" />
								</div>
								<div>
									<p class="text-sm font-bold">Review booking details</p>
									<p class="text-xs text-white/60">Check names and references before payment.</p>
								</div>
							</div>
							<div class="flex gap-4">
								<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
									<UIcon name="i-heroicons-credit-card" class="h-5 w-5 text-[#bec5e5]" />
								</div>
								<div>
									<p class="text-sm font-bold">Complete outstanding payments</p>
									<p class="text-xs text-white/60">{{ outstandingSummary }}</p>
								</div>
							</div>
						</div>
						<!-- <button type="button" class="mt-8 w-full rounded-full border border-white/15 py-3 text-xs font-black uppercase tracking-[0.22em] text-white transition-colors hover:bg-white/10">
							View All Tasks
						</button> -->
					</div>
				</aside>
			</section>
		</div>
	</div>
</template>

<script setup lang="ts">
import {
	type ApiErrorLike,
	useEvent,
	useEventVenues,
	useEventMyBooking,
	useEventMyOutstandingBookingPayments,
} from '~/composables/resources/events'
import { onImageError, resolveImageUrl } from '~/utils/image'
import { formatDate, formatTime } from '~/utils/time'
import { formatMoney } from '~/utils/money'

definePageMeta({
	layout: 'booking' as any,
})

const route = useRoute()
const router = useRouter()

const eventId = computed(() => String(route.params.id || ''))
const { data: eventData } = useEvent(eventId)
const event = computed(() => eventData.value?.data)

const { data: venuesData } = useEventVenues(computed(() => ({
	event: eventId.value,
})))
const eventVenues = computed(() => venuesData.value?.data?.results || [])
const primaryVenue = computed(() => eventVenues.value[0])

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
const eventInfo = computed(() => {
	const eventRecord = event.value as Record<string, any> | undefined
	const startDateTime = eventRecord?.start_datetime
	const endDateTime = eventRecord?.end_datetime
	const timezone = eventRecord?.timezone

	return {
		location: primaryVenue.value?.venue_name || eventRecord?.organisation_name || 'TBA',
		dateRange: formatEventDateRange(startDateTime, endDateTime),
		startTime: startDateTime ? formatTime(startDateTime, timezone) : 'TBA',
		cost: eventRecord?.general_price || 'TBA',
		status: eventRecord?.status_display || eventRecord?.status || (eventRecord?.is_registration_open ? 'Registration Open' : 'Registration Closed'),
	}
})

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

function formatRelativeTime(value?: string) {
	if (!value) {
		return '-'
	}

	const date = new Date(value)
	if (Number.isNaN(date.getTime())) {
		return value
	}

	const diffMs = Date.now() - date.getTime()
	const diffMinutes = Math.round(diffMs / 60000)
	if (Math.abs(diffMinutes) < 1) {
		return 'just now'
	}

	const diffHours = Math.round(diffMinutes / 60)
	if (Math.abs(diffHours) < 24) {
		return `${Math.abs(diffHours)} hour${Math.abs(diffHours) === 1 ? '' : 's'} ago`
	}

	const diffDays = Math.round(diffHours / 24)
	return `${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'} ago`
}

function formatDetailLabel(value: string) {
	return value
		.replace(/_/g, ' ')
		.replace(/\b\w/g, (match) => match.toUpperCase())
}

function formatEventDateRange(startDate?: string, endDate?: string) {

	if (startDate && endDate) {
		return `${formatDate(startDate, 'MMM d, yyyy')} - ${formatDate(endDate, 'MMM d, yyyy')}`
	}

	if (startDate) {
		return formatDate(startDate, 'MMM d, yyyy')
	}

	return 'Date TBC'
}

function getBookingInitials(title: string) {
	const initials = title
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map(part => part[0]?.toUpperCase() || '')
		.join('')

	return initials || 'BK'
}

function getAttendeeInitials(name?: string) {
	if (!name) {
		return '?'
	}

	return name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map(part => part[0]?.toUpperCase() || '')
		.join('') || name[0]?.toUpperCase() || '?'
}

function getBookingAttendeePreview(item: {
	booking?: { attendees?: Array<{ name?: string }> }
}) {
	return item.booking?.attendees?.filter(attendee => attendee.name).slice(0, 3) || []
}

function hasOutstandingPayment(payments?: Array<{ status?: string }>) {
	if (!payments?.length) {
		return false
	}

	return payments.some((payment) => {
		const status = String(payment?.status || '').toUpperCase()
		return status.includes('PENDING') || status.includes('DUE') || status.includes('OUTSTANDING') || status.includes('UNPAID')
	})
}

function getBookingPaymentStatusLabel(payments?: Array<{ status?: string }>) {
	if (hasOutstandingPayment(payments)) {
		return 'Action required'
	}

	if (!payments?.length) {
		return 'No payments'
	}

	return 'Paid'
}

function getBookingPaymentStatusClass(payments?: Array<{ status?: string }>) {
	if (hasOutstandingPayment(payments)) {
		return 'text-amber-600'
	}

	if (!payments?.length) {
		return 'text-[#0b132b]/45'
	}

	return 'text-emerald-600'
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

	if (total.toFixed(2) === '0.00') {
		return 'Free'
	}

	return `${currencySymbol}${total.toFixed(2)}`
}
</script>