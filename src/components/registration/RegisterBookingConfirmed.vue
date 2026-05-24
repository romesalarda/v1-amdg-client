<template>
	<Transition
		enter-active-class="transition duration-500 ease-out"
		enter-from-class="opacity-0"
		enter-to-class="opacity-100"
		leave-active-class="transition duration-300 ease-in"
		leave-from-class="opacity-100"
		leave-to-class="opacity-0"
	>
		<div v-if="isVisible" class="fixed inset-0 z-50 overflow-y-auto bg-surface">

			<!-- Hero -->
			<section class="relative w-full h-[400px] md:h-[500px] overflow-hidden">
				<img
					v-if="heroImageUrl"
					:src="heroImageUrl"
					:alt="event?.title"
					class="absolute inset-0 w-full h-full object-cover grayscale-[0.2] brightness-[0.4]"
				/>
				<div
					v-else
					class="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
				/>

				<div class="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
					<div class="confirmed-pop">
						<div class="mb-4 inline-flex items-center gap-2 px-3 py-1 bg-primary-container text-on-primary-container rounded-lg text-xs font-semibold uppercase tracking-wider">
							<UIcon name="i-heroicons-check-circle-solid" class="h-[18px] w-[18px] flex-shrink-0" />
							Booking Confirmed
						</div>
						<h1 class="text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-none">
							You're In!
						</h1>
						<p class="mt-3 text-lg text-slate-300 max-w-xl">
							<template v-if="event?.title && tickets.length">
								Your tickets for <strong>{{ event.title }}</strong> have been secured.
							</template>
							<template v-else-if="event?.title">
								Get ready for <strong>{{ event.title }}</strong>. Your booking has been secured.
							</template>
							<template v-else>
								Your booking has been confirmed.
							</template>
						</p>
					</div>
				</div>
			</section>

			<!-- Main content -->
			<main class="max-w-4xl mx-auto -mt-20 relative z-10 px-4 mb-16">

				<!-- Ticket loading state -->
				<div v-if="ticketsLoading" class="bg-white rounded-xl shadow-2xl p-12 flex flex-col items-center gap-3">
					<div class="h-8 w-8 rounded-full border-2 border-slate-200 border-t-slate-500 animate-spin" />
					<p class="text-sm font-semibold text-slate-500">Preparing your ticketsâ€¦</p>
				</div>

				<!-- Tickets (CASH / FREE / Stripe confirmed) -->
				<template v-else-if="tickets.length">
					<div
						v-for="ticket in tickets"
						:key="ticket.ticket_id"
						class="ticket-card bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row mb-4"
					>
						<!-- Left: event details -->
						<div class="flex-grow p-8 md:p-10 bg-white">
							<!-- Header row: event + mobile QR -->
							<div class="flex justify-between items-start mb-8">
								<div>
									<span class="text-xs font-semibold uppercase tracking-widest text-slate-400 block mb-1">Event</span>
									<h2 class="text-xl font-bold text-slate-900 leading-tight">{{ event?.title }}</h2>
									<p v-if="ticket.attendee_name" class="mt-1 text-sm text-slate-500 font-medium">{{ ticket.attendee_name }}</p>
								</div>
								<!-- Mobile QR code -->
								<div class="flex md:hidden p-2 bg-white border border-slate-200 rounded-lg shadow-sm ml-4 flex-shrink-0">
									<Qrcode :value="ticket.ticket_code" :width="80" :height="80" />
								</div>
							</div>

							<!-- Detail grid -->
							<div class="grid grid-cols-2 gap-y-6 gap-x-4 mb-8">
								<div v-if="eventDateRange">
									<span class="text-[11px] font-semibold uppercase tracking-widest text-slate-400 block mb-1">Date</span>
									<p class="text-sm font-bold text-slate-900">{{ eventDateRange }}</p>
								</div>
								<div v-if="event?.location">
									<span class="text-[11px] font-semibold uppercase tracking-widest text-slate-400 block mb-1">Location</span>
									<p class="text-sm font-bold text-slate-900">{{ event.location }}</p>
								</div>
								<div v-if="ticket.package_name">
									<span class="text-[11px] font-semibold uppercase tracking-widest text-slate-400 block mb-1">Package</span>
									<p class="text-sm font-bold text-slate-900">{{ ticket.package_name }}</p>
								</div>
								<div v-if="ticket.ticket_type_title">
									<span class="text-[11px] font-semibold uppercase tracking-widest text-slate-400 block mb-1">Ticket Type</span>
									<p class="text-sm font-bold text-slate-900">{{ ticket.ticket_type_title }}</p>
								</div>
								<div v-if="checkoutResult?.total_amount && checkoutResult?.currency && isLastTicket(ticket)">
									<span class="text-[11px] font-semibold uppercase tracking-widest text-slate-400 block mb-1">Total Paid</span>
									<p class="text-sm font-bold text-slate-900">
										{{ formatMoney(checkoutResult.total_amount, checkoutResult.currency) }}
									</p>
								</div>
                                
							</div>
                            <div class ="mb-6">
                                <span class="text-[11px] font-semibold uppercase tracking-widest text-slate-400 block mb-1">Booking Ref</span>
                                <p class="text-sm font-mono text-slate-900">{{ checkoutResult?.booking_reference }}</p>
                            </div>
							<!-- CTAs -->
							<div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100">
								<button
									class="flex-1 bg-blue-600 text-white py-3.5 rounded text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
									@click="emit('view-dashboard')"
								>
									<UIcon name="i-heroicons-ticket" class="h-4 w-4" />
									View my tickets
								</button>
							</div>
						</div>

						<!-- Vertical divider with cutout circles -->
						<div class="hidden md:flex flex-col items-center justify-center bg-white relative px-4 ticket-cutout">
							<div class="w-px h-full dash-line opacity-30" />
						</div>

						<!-- Right: QR code (desktop) -->
						<div class="hidden md:flex flex-col items-center justify-center p-10 bg-slate-50 min-w-[280px]">
							<div class="p-4 bg-white border border-slate-200 rounded-lg shadow-sm mb-4">
								<Qrcode :value="ticket.ticket_code" :width="160" :height="160" />
							</div>
							<p class="text-xs text-slate-400 text-center font-medium leading-relaxed">
								Scan at entrance for entry.<br />
								<span class="font-mono">{{ ticket.ticket_code.slice(0, 20) }}</span>
							</p>
						</div>
					</div>
				</template>

				<!-- Bank transfer card -->
				<div v-else-if="isBankTransfer" class="bg-white rounded-xl shadow-2xl overflow-hidden mb-4">
					<div class="flex flex-col md:flex-row">
						<!-- Left -->
						<div class="flex-grow p-8 md:p-10">
							<div class="mb-6">
								<span class="text-xs font-semibold uppercase tracking-widest text-slate-400 block mb-1">Booking Status</span>
								<h2 class="text-xl font-bold text-slate-900">Payment Pending</h2>
								<p class="mt-1 text-sm text-slate-500">Your booking is reserved. Tickets will be issued after your bank transfer is verified.</p>
							</div>

							<div class="grid grid-cols-2 gap-y-6 gap-x-4 mb-8">
								<div v-if="event?.title">
									<span class="text-[11px] font-semibold uppercase tracking-widest text-slate-400 block mb-1">Event</span>
									<p class="text-sm font-bold text-slate-900">{{ event.title }}</p>
								</div>
								<div v-if="eventDateRange">
									<span class="text-[11px] font-semibold uppercase tracking-widest text-slate-400 block mb-1">Date</span>
									<p class="text-sm font-bold text-slate-900">{{ eventDateRange }}</p>
								</div>
								
								<div v-if="checkoutResult?.total_amount && checkoutResult?.currency">
									<span class="text-[11px] font-semibold uppercase tracking-widest text-slate-400 block mb-1">Amount Due</span>
									<p class="text-sm font-bold text-slate-900">{{ formatMoney(checkoutResult.total_amount, checkoutResult.currency) }}</p>
                                    <!-- {{ props?.event?. }} -->
								</div>
                                
							</div>
                            <div>
                                <span class="text-[11px] font-semibold uppercase tracking-widest text-slate-400 block mb-1">Booking Ref</span>
                                <p class="text-sm font-bold font-mono text-slate-900">{{ checkoutResult?.booking_reference }}</p>
                            </div>

							<div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100">
								<button
									class="flex-1 bg-blue-600 text-white py-3.5 rounded text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
									@click="emit('view-dashboard')"
								>
									<UIcon name="i-heroicons-ticket" class="h-4 w-4" />
									View my booking
								</button>
							</div>
						</div>

						<!-- Vertical divider -->
						<div class="hidden md:flex flex-col items-center justify-center bg-white relative px-4 ticket-cutout">
							<div class="w-px h-full dash-line opacity-30" />
						</div>

						<!-- Right: bank transfer reference -->
						<div class="hidden md:flex flex-col items-center justify-center p-10 bg-slate-50 min-w-[280px] text-center">
							<div class="p-6 bg-white border border-slate-200 rounded-lg shadow-sm w-full mb-4">
								<p class="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-3">Payment Reference</p>
								<p class="text-lg font-black font-mono text-slate-900 break-all">{{ checkoutResult?.bank_transfer_reference }}</p>
							</div>
							<p class="text-xs text-slate-400 leading-relaxed">
								Include this reference<br />when making your bank transfer
							</p>
						</div>
					</div>

					<!-- Mobile bank transfer reference -->
					<div class="md:hidden px-8 pb-8">
						<div class="rounded-xl border-2 border-amber-200 bg-amber-50 p-4">
							<p class="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-700 mb-2">Payment Reference</p>
							<p class="text-xl font-black font-mono text-amber-900">{{ checkoutResult?.bank_transfer_reference }}</p>
							<p v-if="checkoutResult?.bank_transfer_instructions" class="mt-2 text-xs text-amber-700">
								{{ checkoutResult.bank_transfer_instructions }}
							</p>
						</div>
					</div>
				</div>

				<!-- Fallback: confirmed but tickets still being issued -->
				<div v-else class="bg-white rounded-xl shadow-2xl overflow-hidden mb-4">
					<div class="p-8 md:p-10 flex items-start gap-4">
						<span class="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
							<UIcon name="i-heroicons-check-circle" class="h-6 w-6" />
						</span>
						<div class="flex-grow">
							<p class="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-600">Booking Confirmed</p>
							<h2 class="mt-0.5 text-xl font-bold text-slate-900">{{ event?.title }}</h2>
							<p class="mt-1 text-sm text-slate-500">Your tickets are being issued and will be emailed to you shortly.</p>
							<div class="mt-5 grid grid-cols-2 gap-y-4 gap-x-4 pt-4 border-t border-slate-100">
								<div>
									<span class="text-[11px] font-semibold uppercase tracking-widest text-slate-400 block mb-0.5">Booking Ref</span>
									<p class="text-sm font-bold font-mono text-slate-900">{{ checkoutResult?.booking_reference }}</p>
								</div>
								<div v-if="eventDateRange">
									<span class="text-[11px] font-semibold uppercase tracking-widest text-slate-400 block mb-0.5">Date</span>
									<p class="text-sm font-bold text-slate-900">{{ eventDateRange }}</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Secondary info -->
				<section class="text-center mt-2 mb-8">
					<p class="text-sm text-slate-400">
						Need to make changes? Manage your booking in
						<button class="text-blue-400 hover:underline transition-all" @click="emit('view-dashboard')">your event dashboard</button>.
					</p>
				</section>

				<!-- CTA -->
				<div class="flex justify-center">
					<UButton
						size="xl"
						color="primary"
						@click="emit('view-dashboard')"
					>
						View your event dashboard
					</UButton>
				</div>
			</main>

		</div>
	</Transition>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { formatDate } from '~/utils/time'
import { formatMoney } from '~/utils/money'
import { resolveImageUrl } from '~/utils/image'
import { bookingsBookingTicketsList } from '~/api/sdk.gen'

const props = defineProps<{
	isVisible: boolean
	event: any | null
	checkoutResult: any | null
}>()

const emit = defineEmits<{
	'view-dashboard': []
}>()

// ---------- Ticket fetching ----------

const tickets = ref<any[]>([])
const ticketsLoading = ref(false)
let pollTimer: ReturnType<typeof setTimeout> | null = null
let pollAttempts = 0
const MAX_POLL_ATTEMPTS = 6

function clearPoll() {
	if (pollTimer) {
		clearTimeout(pollTimer)
		pollTimer = null
	}
}

const isBankTransfer = computed(() =>
	Boolean(props.checkoutResult?.bank_transfer_reference)
)

async function fetchTickets() {
	const bookingId = Number(props.checkoutResult?.booking_id)
	if (!bookingId) return

	try {
		const res = await bookingsBookingTicketsList({ path: { id: bookingId } })
		const data = Array.isArray(res.data) ? res.data : []
		if (data.length) {
			tickets.value = data
			ticketsLoading.value = false
			clearPoll()
			return
		}
	} catch {
		// ignore fetch errors during polling
	}

	// If no tickets yet, poll (for Stripe where tickets are issued async)
	if (!isBankTransfer.value && pollAttempts < MAX_POLL_ATTEMPTS) {
		pollAttempts++
		pollTimer = setTimeout(fetchTickets, 2000)
	} else {
		ticketsLoading.value = false
	}
}

watch(() => props.isVisible, async (visible) => {
	if (!visible) {
		clearPoll()
		return
	}

	pollAttempts = 0
	tickets.value = []

	// Seed immediately from inline checkout response (CASH/FREE/confirmed Stripe)
	if (Array.isArray(props.checkoutResult?.tickets) && props.checkoutResult.tickets.length) {
		tickets.value = props.checkoutResult.tickets
		return
	}

	// Bank transfer: no tickets to fetch yet
	if (isBankTransfer.value) return

	// Otherwise fetch (and poll if needed)
	if (props.checkoutResult?.booking_id) {
		ticketsLoading.value = true
		await fetchTickets()
	}
}, { immediate: true })

// ---------- Computed ----------



const heroImageUrl = computed(() => {
	const img = props.event?.main_landing_image
	if (!img) return null
	const src = img.image_urls?.large ?? img.image_urls?.medium ?? img.image_urls?.original ?? img.image ?? img.resource_url
	return src ? resolveImageUrl(src) : null
})

const eventDateRange = computed(() => {
	const start = props.event?.start_datetime
	const end = props.event?.end_datetime
	if (!start) return null
	const startStr = formatDate(start, 'MMM d, yyyy')
	if (!end) return startStr
	const endStr = formatDate(end, 'MMM d, yyyy')
	if (startStr === endStr) return startStr
	const s = new Date(start)
	const e = new Date(end)
	if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth()) {
		return `${formatDate(start, 'MMM d')} – ${formatDate(end, 'd, yyyy')}`
	}
	return `${startStr} – ${endStr}`
})

function isLastTicket(ticket: any) {
	return tickets.value[tickets.value.length - 1]?.ticket_id === ticket.ticket_id
}
</script>

<style scoped>
/* Page background matches checkout.html surface token */
.bg-surface {
	background-color: #061423;
}

/* Primary container badge colours matching checkout.html dark theme */
.bg-primary-container {
	background-color: #0062ff;
}
.text-on-primary-container {
	color: #f3f3ff;
}

/* Physical ticket cutout â€” semicircle notches centred on the divider line */
.ticket-cutout::before,
.ticket-cutout::after {
	content: '';
	position: absolute;
	width: 32px;
	height: 32px;
	background-color: #061423;
	border-radius: 50%;
	left: 50%;
	transform: translateX(-50%);
}
.ticket-cutout::before {
	top: -16px;
}
.ticket-cutout::after {
	bottom: -16px;
}

/* Dashed divider line between ticket halves */
.dash-line {
	background-image: linear-gradient(to bottom, #cbd5e1 50%, transparent 50%);
	background-size: 1px 12px;
	background-repeat: repeat-y;
	width: 1px;
	height: 100%;
}

/* Entrance animation */
.confirmed-pop {
	animation: confirmedRise 0.7s ease-out;
}

.ticket-card {
	animation: confirmedRise 0.6s ease-out 0.15s both;
}

@keyframes confirmedRise {
	from {
		opacity: 0;
		transform: translateY(16px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}
</style>
