<template>
	<div class="space-y-6">
		<div>
			<h2 class="text-lg font-semibold text-gray-900">Review and pay</h2>
			<p class="text-sm text-gray-600">Confirm attendee selections and choose a payment method.</p>
		</div>

		<!-- Attendee summary cards -->
		<div class="space-y-4">
			<div
				v-for="(attendee, index) in attendees"
				:key="index"
				class="rounded-xl border border-gray-200 p-4"
			>
				<div class="flex items-start justify-between">
					<div>
						<p class="text-sm font-semibold text-gray-900">
							Attendee {{ index + 1 }}: {{ attendee.first_name }} {{ attendee.last_name }}
						</p>
						<p class="mt-1 text-xs text-gray-600">
							Package: {{ packageById(attendee.packageId)?.name || 'Not selected' }}
						</p>
						<div class="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
							<span class="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">
								Age {{ calculateAge(attendee.date_of_birth || '') ?? 'N/A' }}
							</span>
							<span class="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">
								{{ attendee.personalInfo.medicalConditions.length }} medical
							</span>
							<span class="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">
								{{ attendee.personalInfo.dietaryRequirements.length }} dietary
							</span>
							<span class="rounded-full px-2.5 py-1 font-semibold" :class="attendeeReviewAmount(attendee, index).amount === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-50 text-emerald-700'">
								Due {{ attendeeReviewAmount(attendee, index).amount === 0 ? 'FREE' : formatMoney(attendeeReviewAmount(attendee, index).amount, attendeeReviewAmount(attendee, index).currency) }}
							</span>
						</div>
					</div>
					<UButton size="xs" color="gray" variant="ghost" @click="emit('jump-to-attendee', index)">
						Edit
					</UButton>
				</div>
			</div>
		</div>

		<!-- Free booking notice -->
		<div v-if="isBookingFree" class="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
			<div class="flex items-center gap-3">
				<UIcon name="i-heroicons-check-circle" class="h-5 w-5 text-emerald-600" />
				<div>
					<p class="font-semibold text-emerald-900">This event is FREE!</p>
					<p class="mt-1 text-xs text-emerald-700">No payment method required. Complete your registration below.</p>
				</div>
			</div>
		</div>

		<!-- Payment method selection -->
		<div v-else>
			<label class="mb-1 block text-sm font-medium text-gray-700">Payment method</label>
			<div v-if="paymentMethods.length" class="grid gap-3 sm:grid-cols-1 lg:grid-cols-1">
				<button
					v-for="method in paymentMethods"
					:key="method.id"
					type="button"
					class="rounded-xl border p-4 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
					:class="method.id === selectedPaymentMethodId ? 'border-slate-900 bg-slate-900 text-white shadow-lg' : 'border-slate-200 bg-white hover:border-slate-300'"
					:disabled="isCheckoutUiBusy"
					@click="emit('update:selectedPaymentMethodId', method.id)"
				>
					<div class="flex items-center justify-between gap-2">
						<div class="flex items-center gap-2">
							<UIcon :name="getMethodIcon(method.method_type)" class="h-5 w-5" />
							<p class="text-sm font-semibold">{{ method.title }}</p>
						</div>
						<UIcon
							v-if="method.id === selectedPaymentMethodId"
							name="i-heroicons-check-circle"
							class="h-5 w-5 text-emerald-400"
						/>
					</div>
					<p class="mt-2 text-xs uppercase tracking-[0.14em]" :class="method.id === selectedPaymentMethodId ? 'text-white/80' : 'text-slate-500'">
						{{ method.method_type?.replace('_', ' ') || 'Method' }}
					</p>
				</button>
			</div>
			<p v-else class="text-sm text-gray-500">No payment methods available for this event.</p>
		</div>

		<!-- Payment method details -->
		<div v-if="selectedPaymentMethod && !isBookingFree" class="rounded-xl border border-slate-200 bg-slate-50 p-4">
			<div class="flex items-center justify-between gap-3">
				<p class="text-sm font-semibold text-slate-900">{{ selectedPaymentMethod.title }}</p>
				<span class="rounded-full bg-slate-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-700">
					{{ paymentMethodTypeLabel }}
				</span>
			</div>

			<!-- Bank Transfer Details -->
			<div v-if="isBankTransferMethod" class="mt-4 grid gap-3 sm:grid-cols-2">
				<div class="rounded-lg border border-blue-200 bg-blue-50 p-3">
					<p class="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">Account name</p>
					<p class="mt-1 text-sm font-semibold text-blue-900">{{ bankDetails.account_name || 'TBA' }}</p>
				</div>
				<div class="rounded-lg border border-blue-200 bg-blue-50 p-3">
					<p class="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">Sort code</p>
					<p class="mt-1 text-sm font-semibold text-blue-900">{{ bankDetails.sort_code || 'TBA' }}</p>
				</div>
				<div class="rounded-lg border border-blue-200 bg-blue-50 p-3 sm:col-span-2">
					<p class="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">Account number</p>
					<p class="mt-1 text-sm font-semibold text-blue-900">{{ bankDetails.account_number || 'TBA' }}</p>
				</div>

				<div class="rounded-lg border border-blue-200 bg-blue-50 p-3 sm:col-span-2">
					<p class="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">Reserved transfer reference</p>
					<p v-if="reservedBankTransferLoading" class="mt-1 text-sm font-semibold text-blue-900">Reserving your reference...</p>
					<p v-else-if="reservedBankTransferReference" class="mt-1 text-lg font-black tracking-[0.16em] text-blue-900">{{ reservedBankTransferReference }}</p>
					<p v-else class="mt-1 text-sm text-blue-900">Select bank transfer to reserve your reference before checkout.</p>
					<p v-if="reservedBankTransferError" class="mt-2 text-xs font-semibold text-red-600">{{ reservedBankTransferError }}</p>
					<p v-else-if="reservedBankTransferPaymentReference" class="mt-2 text-[11px] text-blue-700">Draft payment {{ reservedBankTransferPaymentReference }} is reserved for this checkout.</p>
				</div>

				<div v-if="isBankTransferEvidenceRequiredImmediately" class="rounded-lg border border-amber-200 bg-white p-3 sm:col-span-2 space-y-3">
					<p class="text-xs font-semibold text-slate-800">Upload transfer evidence</p>
					<p class="text-[11px] text-slate-500">Your transfer reference is already reserved above so you can include it before checkout.</p>
					<div class="grid gap-3 sm:grid-cols-2">
						<div class="sm:col-span-2">
							<label class="mb-1 block text-[11px] font-semibold text-slate-700">Evidence file <span class="text-red-600">*</span></label>
							<input
								type="file"
								accept=".pdf,.jpg,.jpeg,.png"
								class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
								@change="onBankTransferEvidenceFileChange"
							>
							<p class="mt-1 text-[11px] text-slate-500">Accepted: PDF/JPG/JPEG/PNG up to 10MB.</p>
							<p v-if="bankTransferEvidenceErrors.evidence_file" class="mt-1 text-xs font-semibold text-red-600">{{ bankTransferEvidenceErrors.evidence_file }}</p>
						</div>
						<div>
							<label class="mb-1 block text-[11px] font-semibold text-slate-700">Payer name <span class="text-red-600">*</span></label>
							<UInput v-model="bankTransferEvidence.payer_name" placeholder="Full name on the transfer" />
							<p v-if="bankTransferEvidenceErrors.payer_name" class="mt-1 text-xs font-semibold text-red-600">{{ bankTransferEvidenceErrors.payer_name }}</p>
						</div>
						<div>
							<label class="mb-1 block text-[11px] font-semibold text-slate-700">Payer account last 4 <span class="text-red-600">*</span></label>
							<UInput v-model="bankTransferEvidence.payer_account_last4" placeholder="1234" maxlength="4" />
							<p v-if="bankTransferEvidenceErrors.payer_account_last4" class="mt-1 text-xs font-semibold text-red-600">{{ bankTransferEvidenceErrors.payer_account_last4 }}</p>
						</div>
						<div class="sm:col-span-2">
							<label class="mb-1 block text-[11px] font-semibold text-slate-700">Amount on evidence <span class="text-red-600">*</span></label>
							<UInput
								:model-value="bankTransferEvidence.amount_on_evidence ?? undefined"
								type="number"
								min="0"
								step="0.01"
								placeholder="0.00"
								@update:model-value="(val) => {
									if (val === '' || val === null || val === undefined) {
										bankTransferEvidence.amount_on_evidence = null
										return
									}
									const amount = Number(val)
									bankTransferEvidence.amount_on_evidence = Number.isFinite(amount) ? amount : null
								}"
							/>
							<p v-if="bankTransferEvidenceErrors.amount_on_evidence" class="mt-1 text-xs font-semibold text-red-600">{{ bankTransferEvidenceErrors.amount_on_evidence }}</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Stripe Card Details -->
			<div v-else-if="isStripeMethod" class="mt-4 space-y-3">
				<div class="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
					<div class="flex items-center justify-between gap-2">
						<p>Enter your card details. Payment is processed securely with Stripe.</p>
						<div class="flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
							<UIcon name="i-heroicons-lock-closed" class="h-3.5 w-3.5" />
							Secured by Stripe
						</div>
					</div>
				</div>
				<div v-if="isStripeTestMode" class="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
					<p class="font-bold uppercase tracking-[0.12em]">Stripe test mode</p>
					<p class="mt-1">Use card number <span class="font-black">4242 4242 4242 4242</span>, any future expiry date, any CVC.</p>
					<div class="mt-3">
						<label class="mb-1 block text-[11px] font-semibold text-amber-900">Stripe publishable key override</label>
						<UInput :model-value="manualStripePublicKey" @update:model-value="emit('update:manualStripePublicKey', $event as string)" placeholder="pk_test_..." />
					</div>
				</div>
				<div v-if="!effectiveStripePublishableKey" class="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
					Missing Stripe publishable key. Add it in test mode override or Stripe settings.
				</div>
				<div class="rounded-lg border border-slate-300 bg-white p-3">
					<div :ref="(el) => { onStripeMountReady(el as HTMLElement | null) }" class="min-h-[44px]"></div>
				</div>
				<p v-if="stripeCardError" class="text-xs font-semibold text-red-600">{{ stripeCardError }}</p>
				<p v-else-if="stripePaymentAttemptError" class="text-xs font-semibold text-red-600">
					{{ stripePaymentAttemptError }}
				</p>
				<p v-else-if="!stripeCardReady" class="text-xs text-slate-500">Complete card details to enable checkout.</p>
				<p v-else class="text-xs font-semibold text-emerald-700">Card details ready.</p>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { formatMoney } from '~/utils/money'
import type { AttendeeDraft } from '~/stores/registration'
import type { PaymentMethod } from '~/api/types.gen'

defineProps<{
	attendees: AttendeeDraft[]
	packageById: (id?: number) => any
	calculateAge: (dob: string) => number | null
	attendeeReviewAmount: (attendee: AttendeeDraft, index: number) => { amount: number; currency: string }
	isBookingFree: boolean
	paymentMethods: PaymentMethod[]
	selectedPaymentMethodId: number | null
	isCheckoutUiBusy: boolean
	getMethodIcon: (methodType: string) => string
	paymentMethodTypeLabel: string
	selectedPaymentMethod: PaymentMethod | undefined
	isBankTransferMethod: boolean
	isStripeMethod: boolean
	bankDetails: { account_name?: string; sort_code?: string; account_number?: string }
	reservedBankTransferLoading: boolean
	reservedBankTransferReference: string | null
	reservedBankTransferError: string
	reservedBankTransferPaymentReference: string | null
	isBankTransferEvidenceRequiredImmediately: boolean
	bankTransferEvidence: { payer_name: string; payer_account_last4: string; amount_on_evidence: number | null; [key: string]: any }
	bankTransferEvidenceErrors: { evidence_file?: string; payer_name?: string; payer_account_last4?: string; amount_on_evidence?: string }
	onBankTransferEvidenceFileChange: (event: Event) => void
	isStripeTestMode: boolean
	effectiveStripePublishableKey: string
	manualStripePublicKey: string
	onStripeMountReady: (el: HTMLElement | null) => void
	stripeCardError: string
	stripePaymentAttemptError: string
	stripeCardReady: boolean
}>()

const emit = defineEmits<{
	'jump-to-attendee': [index: number]
	'update:selectedPaymentMethodId': [id: number | null]
	'update:manualStripePublicKey': [value: string]
}>()
</script>
