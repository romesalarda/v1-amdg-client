<template>
	<CommunitiesManagementLayout :organisation-id="organisationId" :organisation="organisation">
		<div class="space-y-8">
			<div class="bg-white border-2 border-deep-navy rounded-xl shadow-drawn p-8">
				<div class="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
					<div>
						<h1 class="text-3xl font-black text-deep-navy uppercase tracking-tight">Sponsorships</h1>
						<p class="mt-2 text-sm text-deep-navy/60 font-medium">
							Invite sponsors, manage commitments, and initialize payment checkout for event sponsorship packages.
						</p>
					</div>

					<div class="w-full md:w-[360px]">
						<label class="block text-[10px] font-black text-deep-navy/50 mb-3 uppercase tracking-[0.2em]">
							Active Event
						</label>
						<select
							v-model="selectedEventId"
							class="w-full px-4 py-4 bg-white border-2 border-deep-navy rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
						>
							<option value="">Select event</option>
							<option v-for="event in events" :key="event.event_id" :value="event.event_id">
								{{ event.title }}
							</option>
						</select>
					</div>
				</div>

				<div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
					<div class="p-4 rounded-xl border-2 border-deep-navy/10 bg-deep-navy/5">
						<p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/50">Packages</p>
						<p class="mt-2 text-xl font-black text-deep-navy">{{ sponsorshipPackages.length }}</p>
					</div>
					<div class="p-4 rounded-xl border-2 border-deep-navy/10 bg-deep-navy/5">
						<p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/50">Payment Methods</p>
						<p class="mt-2 text-xl font-black text-deep-navy">{{ paymentMethods.length }}</p>
					</div>
					<div class="p-4 rounded-xl border-2 border-deep-navy/10 bg-deep-navy/5">
						<p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/50">Pending Invites</p>
						<p class="mt-2 text-xl font-black text-deep-navy">{{ pendingInvites.length }}</p>
					</div>
				</div>
			</div>

			<div class="bg-white border-2 border-deep-navy rounded-xl shadow-drawn">
				<div class="px-8 py-6 border-b-2 border-deep-navy/10">
					<h2 class="text-xl font-black text-deep-navy uppercase tracking-tight">Sponsor Invites</h2>
					<p class="text-sm text-deep-navy/60 mt-2 font-medium">
						Review and respond to sponsorship invites sent by event organisers.
					</p>
				</div>

				<div class="p-8 space-y-6">
					<div v-if="isLoadingInvites" class="space-y-3">
						<USkeleton class="h-16 w-full" />
						<USkeleton class="h-16 w-full" />
					</div>

					<div
						v-else-if="eventInvites.length === 0"
						class="text-center py-10 bg-deep-navy/5 border-2 border-dashed border-deep-navy/20 rounded-xl"
					>
						<p class="text-sm font-bold text-deep-navy/60">No sponsor invites received yet.</p>
					</div>

					<div v-else class="space-y-3">
						<div
							v-for="invite in eventInvites"
							:key="invite.invite_id"
							class="p-5 border-2 border-deep-navy/10 rounded-xl"
						>
							<div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
								<div>
									<p class="text-sm font-black text-deep-navy uppercase tracking-tight">{{ invite.email }}</p>
									<p class="text-[10px] text-deep-navy/50 font-bold uppercase tracking-wider mt-1">
										Sent {{ formatDateSafe(invite.sent_at) }}
									</p>
									<div class="mt-2 flex items-center gap-2">
										<span class="text-[10px] font-black uppercase tracking-wider text-deep-navy/50">Token</span>
										<code class="px-2 py-1 rounded bg-blue-500/10 text-blue-700 text-xs font-bold">{{ invite.token }}</code>
									</div>
								</div>

								<div class="flex flex-wrap items-center gap-2">
									<span :class="inviteBadgeClass(invite)" class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
										{{ inviteBadgeLabel(invite) }}
									</span>

									<button
										v-if="invite.is_valid && !invite.accepted && !invite.declined"
										:disabled="isAcceptingToken"
										@click="acceptInviteToken(invite.token)"
										class="px-4 py-2 border-2 border-green-600 text-green-700 hover:bg-green-600 hover:text-white rounded-xl font-black text-[10px] uppercase tracking-wider transition-all disabled:opacity-50"
									>
										Accept
									</button>
									<button
										v-if="invite.is_valid && !invite.accepted && !invite.declined"
										:disabled="isDecliningToken"
										@click="declineInviteToken(invite.token)"
										class="px-4 py-2 border-2 border-red-600 text-red-700 hover:bg-red-600 hover:text-white rounded-xl font-black text-[10px] uppercase tracking-wider transition-all disabled:opacity-50"
									>
										Decline
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="bg-white border-2 border-deep-navy rounded-xl shadow-drawn">
				<div class="px-8 py-6 border-b-2 border-deep-navy/10">
					<h2 class="text-xl font-black text-deep-navy uppercase tracking-tight">Sponsor Checkout</h2>
					<p class="text-sm text-deep-navy/60 mt-2 font-medium">
						Commit a sponsorship package and initialize payment (Stripe or bank transfer).
					</p>
				</div>

				<div class="p-8 space-y-6">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label class="block text-[10px] font-black text-deep-navy/50 mb-3 uppercase tracking-[0.2em]">
								Checkout Mode
							</label>
							<div class="grid grid-cols-2 gap-2 bg-deep-navy/5 rounded-xl p-2 border-2 border-deep-navy/10">
								<button
									type="button"
									:class="checkoutForm.mode === 'direct' ? 'bg-deep-navy text-white' : 'text-deep-navy hover:bg-deep-navy/10'"
									class="px-3 py-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all"
									@click="checkoutForm.mode = 'direct'"
								>
									Direct
								</button>
								<button
									type="button"
									:class="checkoutForm.mode === 'token' ? 'bg-deep-navy text-white' : 'text-deep-navy hover:bg-deep-navy/10'"
									class="px-3 py-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all"
									@click="checkoutForm.mode = 'token'"
								>
									Invite Token
								</button>
							</div>
						</div>

						<div>
							<label class="block text-[10px] font-black text-deep-navy/50 mb-3 uppercase tracking-[0.2em]">
								Sponsor Name (Optional)
							</label>
							<input
								v-model="checkoutForm.name"
								type="text"
								placeholder="Defaults to organisation title"
								class="w-full px-4 py-4 bg-white border-2 border-deep-navy rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
							/>
						</div>
					</div>

					<div v-if="checkoutForm.mode === 'token'">
						<label class="block text-[10px] font-black text-deep-navy/50 mb-3 uppercase tracking-[0.2em]">
							Invite Token
						</label>
						<input
							v-model="checkoutForm.inviteToken"
							type="text"
							placeholder="Paste invite token"
							class="w-full px-4 py-4 bg-white border-2 border-deep-navy rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
						/>
					</div>

					<div>
						<label class="block text-[10px] font-black text-deep-navy/50 mb-3 uppercase tracking-[0.2em]">
							Sponsorship Package
						</label>
						<div v-if="isLoadingPackages" class="space-y-2">
							<USkeleton class="h-16 w-full" />
							<USkeleton class="h-16 w-full" />
						</div>
						<div v-else-if="sponsorshipPackages.length === 0" class="text-sm font-bold text-deep-navy/60">
							No active packages available for this event.
						</div>
						<div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
							<button
								v-for="pkg in sponsorshipPackages"
								:key="pkg.package_id"
								type="button"
								class="text-left p-4 border-2 rounded-xl transition-all"
								:class="checkoutForm.packageId === pkg.package_id
									? 'border-deep-navy bg-deep-navy text-white'
									: 'border-deep-navy/20 bg-white text-deep-navy hover:border-deep-navy/40'"
								@click="checkoutForm.packageId = pkg.package_id"
							>
								<p class="text-sm font-black uppercase tracking-tight">{{ pkg.package_name }}</p>
								<p class="mt-1 text-xs font-bold uppercase tracking-wider opacity-80">Tier {{ pkg.tier }}</p>
								<p class="mt-2 text-sm font-black">{{ formatMoney(pkg.modified_amount, pkg.base_amount_currency) }}</p>
							</button>
						</div>
					</div>

					<div>
						<label class="block text-[10px] font-black text-deep-navy/50 mb-3 uppercase tracking-[0.2em]">
							Payment Method
						</label>
						<div v-if="isLoadingPaymentMethods" class="space-y-2">
							<USkeleton class="h-16 w-full" />
						</div>
						<div v-else-if="paymentMethods.length === 0" class="text-sm font-bold text-deep-navy/60">
							No active payment methods found for this event.
						</div>
						<div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
							<button
								v-for="method in paymentMethods"
								:key="method.id"
								type="button"
								class="text-left p-4 border-2 rounded-xl transition-all"
								:class="checkoutForm.paymentMethodId === method.id
									? 'border-deep-navy bg-deep-navy text-white'
									: 'border-deep-navy/20 bg-white text-deep-navy hover:border-deep-navy/40'"
								@click="checkoutForm.paymentMethodId = method.id"
							>
								<p class="text-sm font-black uppercase tracking-tight">{{ method.title }}</p>
								<p class="mt-1 text-xs font-bold uppercase tracking-wider opacity-80">{{ formatMethodType(method.method_type) }}</p>
							</button>
						</div>
					</div>

					<div>
						<label class="block text-[10px] font-black text-deep-navy/50 mb-3 uppercase tracking-[0.2em]">
							Description (Optional)
						</label>
						<textarea
							v-model="checkoutForm.description"
							rows="3"
							placeholder="Optional note for this sponsorship"
							class="w-full px-4 py-4 bg-white border-2 border-deep-navy rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
						/>
					</div>

					<div class="flex justify-end">
						<button
							:disabled="!canCheckout || isCheckingOut"
							@click="submitCheckout"
							class="px-8 py-3 bg-deep-navy hover:bg-deep-navy/90 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50"
						>
							{{ isCheckingOut ? 'Initializing...' : 'Start Sponsor Checkout' }}
						</button>
					</div>

					<div v-if="checkoutResult" class="p-5 rounded-xl border-2 border-green-600/30 bg-green-500/10 space-y-2">
						<p class="text-sm font-black text-deep-navy uppercase tracking-tight">Checkout Initialized</p>
						<p class="text-xs font-bold text-deep-navy/70 uppercase tracking-wider">Sponsor ID: {{ checkoutResult.sponsor_id }}</p>
						<p class="text-xs font-bold text-deep-navy/70 uppercase tracking-wider">Payment Reference: {{ checkoutResult.payment_reference }}</p>
						<p class="text-xs font-bold text-deep-navy/70 uppercase tracking-wider">Status: {{ checkoutResult.payment_status }}</p>

						<div v-if="checkoutResult.payment_method_type === 'STRIPE'" class="mt-3 p-4 rounded-lg bg-white border border-green-700/20">
							<p class="text-xs font-black uppercase tracking-wider text-deep-navy">Stripe Payment Ready</p>
							<p class="mt-1 text-xs font-medium text-deep-navy/70">Client Secret: {{ checkoutResult.client_secret || 'Unavailable in response' }}</p>
							<p class="text-xs font-medium text-deep-navy/70">Payment Intent: {{ checkoutResult.payment_intent_id || 'Unavailable in response' }}</p>
						</div>

						<div v-if="checkoutResult.payment_method_type === 'BANK_TRANSFER'" class="mt-3 p-4 rounded-lg bg-white border border-green-700/20">
							<p class="text-xs font-black uppercase tracking-wider text-deep-navy">Bank Transfer Instructions</p>
							<p class="mt-1 text-xs font-medium text-deep-navy/70">Reference: {{ checkoutResult.bank_transfer_reference || 'Use payment reference above' }}</p>
							<pre class="mt-2 text-xs text-deep-navy/70 whitespace-pre-wrap">{{ stringifyDetails(checkoutResult.payment_instructions) }}</pre>
						</div>
					</div>
				</div>
			</div>
		</div>
	</CommunitiesManagementLayout>
</template>

<script lang="ts" setup>
import { useEvents } from '~/composables/resources/events/events'
import { extractCollection, useEventSponsorshipPackages } from '~/composables/resources/events/eventSponsors'
import { useOrganisation } from '~/composables/resources/organisation/organisations'
import {
	useAcceptOrganisationSponsorInviteByToken,
	useDeclineOrganisationSponsorInviteByToken,
	useOrganisationSponsorCheckout,
	useOrganisationSponsorInvites,
	type SponsorCheckoutResponse,
} from '~/composables/resources/organisation/organisationSponsorInvites'
import { usePaymentMethods } from '~/composables/resources/payments/paymentMethods'
import { formatDate } from '~/utils/time'

definePageMeta({
	middleware: ['auth', 'organisation-controller'],
	layout: 'default',
})

useHead({
	title: 'Community Sponsorships',
})

type InviteItem = {
	invite_id: string
	email: string
	token: string
	accepted: boolean
	declined: boolean
	is_valid: boolean
	sent_at?: string
	responded_at?: string | null
}

type EventItem = {
	id: number
	event_id: string
	title: string
}

type PackageItem = {
	package_id: string
	package_name: string
	tier: number
	modified_amount: string
	base_amount_currency: string
}

const route = useRoute()
const { $notyf } = useNuxtApp()

const organisationId = computed(() => Number(route.params.id))

const { data: organisationData } = useOrganisation(organisationId)
const organisation = computed(() => organisationData.value?.data)

const selectedEventId = ref('')

const { data: eventsData } = useEvents(computed(() => ({
	organisation: organisationId.value,
	page_size: 200,
})))

const events = computed<EventItem[]>(() => {
	const payload = eventsData.value?.data
	return extractCollection<EventItem>(payload)
})

watch(
	events,
	(value) => {
		if (!selectedEventId.value && value.length > 0) {
			selectedEventId.value = value[0].event_id
		}
	},
	{ immediate: true },
)

const selectedEvent = computed(() => events.value.find(event => event.event_id === selectedEventId.value) || null)

const { data: packagesResponse, isLoading: isLoadingPackages } = useEventSponsorshipPackages(selectedEventId)

const sponsorshipPackages = computed<PackageItem[]>(() => {
	const payload = packagesResponse.value?.data
	return extractCollection<PackageItem>(payload)
})

const { data: paymentMethodsResponse, isLoading: isLoadingPaymentMethods } = usePaymentMethods(computed(() => {
	if (!selectedEvent.value?.id) {
		return undefined
	}

	return {
		event: selectedEvent.value.id,
		is_active: true,
		page_size: 100,
	}
}))

const paymentMethods = computed<any[]>(() => {
	const payload = paymentMethodsResponse.value?.data
	return extractCollection<any>(payload)
})

const { data: invitesResponse, isLoading: isLoadingInvites } = useOrganisationSponsorInvites(computed(() => {
	return {
		page_size: 100,
	}
}))

const eventInvites = computed<InviteItem[]>(() => invitesResponse.value?.invites as InviteItem[] || [])
const pendingInvites = computed(() => eventInvites.value.filter(invite => invite.is_valid && !invite.accepted && !invite.declined))

const acceptInviteMutation = useAcceptOrganisationSponsorInviteByToken()
const declineInviteMutation = useDeclineOrganisationSponsorInviteByToken()
const checkoutMutation = useOrganisationSponsorCheckout()

const checkoutForm = reactive({
	mode: 'direct' as 'direct' | 'token',
	inviteToken: '',
	packageId: '',
	paymentMethodId: null as number | null,
	name: '',
	description: '',
})

const checkoutResult = ref<SponsorCheckoutResponse | null>(null)

const isAcceptingToken = computed(() => acceptInviteMutation.isPending.value)
const isDecliningToken = computed(() => declineInviteMutation.isPending.value)
const isCheckingOut = computed(() => checkoutMutation.isPending.value)

const canCheckout = computed(() => {
	const hasCoreFields = !!checkoutForm.packageId && !!checkoutForm.paymentMethodId
	if (!hasCoreFields) {
		return false
	}

	if (checkoutForm.mode === 'token') {
		return checkoutForm.inviteToken.trim().length > 0
	}

	return !!selectedEventId.value
})

function formatMoney(amount: string, currency?: string) {
	const parsed = Number(amount)
	if (Number.isNaN(parsed)) {
		return `${amount} ${currency || ''}`.trim()
	}

	return new Intl.NumberFormat('en-GB', {
		style: 'currency',
		currency: currency || 'GBP',
		minimumFractionDigits: 2,
	}).format(parsed)
}

function formatDateSafe(value?: string | null) {
	if (!value) {
		return 'Unknown date'
	}

	return formatDate(value)
}

function formatMethodType(methodType: string) {
	if (methodType === 'BANK_TRANSFER') {
		return 'Bank Transfer'
	}

	if (methodType === 'STRIPE') {
		return 'Stripe'
	}

	if (methodType === 'CASH') {
		return 'Cash'
	}

	return methodType
}

function inviteBadgeLabel(invite: InviteItem) {
	if (invite.accepted) {
		return 'Accepted'
	}

	if (invite.declined) {
		return 'Declined'
	}

	if (!invite.is_valid) {
		return 'Expired'
	}

	return 'Pending'
}

function inviteBadgeClass(invite: InviteItem) {
	if (invite.accepted) {
		return 'bg-green-600 text-white'
	}

	if (invite.declined) {
		return 'bg-red-600 text-white'
	}

	if (!invite.is_valid) {
		return 'bg-gray-500 text-white'
	}

	return 'bg-blue-600 text-white'
}

function stringifyDetails(value: unknown) {
	if (!value) {
		return 'No additional instructions returned.'
	}

	try {
		return JSON.stringify(value, null, 2)
	} catch {
		return String(value)
	}
}

function extractErrorMessage(error: unknown) {
	const fallback = 'Something went wrong. Please try again.'
	const err = error as any
	const data = err?.response?.data || err?.data

	if (typeof data?.error === 'string') {
		return data.error
	}

	if (typeof data?.detail === 'string') {
		return data.detail
	}

	if (data && typeof data === 'object') {
		const first = Object.values(data)[0]
		if (Array.isArray(first) && typeof first[0] === 'string') {
			return first[0]
		}
		if (typeof first === 'string') {
			return first
		}
	}

	if (err?.message) {
		return err.message
	}

	return fallback
}

async function acceptInviteToken(token: string) {
	try {
		await acceptInviteMutation.mutateAsync(token)
		$notyf.success('Invite marked as accepted.')
	} catch (error) {
		$notyf.error(extractErrorMessage(error))
	}
}

async function declineInviteToken(token: string) {
	try {
		await declineInviteMutation.mutateAsync(token)
		$notyf.success('Invite marked as declined.')
	} catch (error) {
		$notyf.error(extractErrorMessage(error))
	}
}

async function submitCheckout() {
	if (!canCheckout.value) {
		$notyf.error('Complete package, payment method, and mode details before checkout.')
		return
	}

	const payload: any = {
		package_id: checkoutForm.packageId,
		payment_method_id: checkoutForm.paymentMethodId,
	}

	if (selectedEventId.value) {
		payload.event_id = selectedEventId.value
	}

	if (checkoutForm.mode === 'token') {
		payload.invite_token = checkoutForm.inviteToken.trim()
	} else {
		payload.organisation_id = organisationId.value
	}

	if (checkoutForm.name.trim()) {
		payload.name = checkoutForm.name.trim()
	}

	if (checkoutForm.description.trim()) {
		payload.description = checkoutForm.description.trim()
	}

	try {
		const response = await checkoutMutation.mutateAsync(payload)
		checkoutResult.value = (response?.data || null) as SponsorCheckoutResponse | null

		if (response.error) {
			$notyf.error(extractErrorMessage(response.error))
			return
		}
		$notyf.success('Checkout initialized successfully.')
	} catch (error) {
		$notyf.error(extractErrorMessage(error))
	}
}
</script>