<template>
	<aside class="w-full space-y-4 lg:w-72 lg:flex-shrink-0">
		<div>
			<p class="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Registration group</p>
		</div>

		<button
			v-for="(attendee, index) in attendees"
			:key="index"
			type="button"
			class="w-full rounded-2xl border p-4 text-left transition-all duration-300"
			:class="attendeeSidebarCardClass(index, attendee)"
			@click="emit('jump-to-attendee', index)"
		>
			<div class="flex items-start justify-between gap-3">
				<div>
					<div class="flex items-center gap-2">
						<p class="text-base font-black text-slate-900">
							{{ attendeeDisplayName(attendee, index) }}
						</p>
						<UBadge v-if="isAttendeeMinor(attendee)" color="amber" variant="subtle" size="xs">
							Minor
						</UBadge>
					</div>
					<p class="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
						{{ attendeeStepSummary(index) }}
					</p>
					<p v-if="isAttendeeMinor(attendee) && !minorHasEmergencyContact(attendee)" class="mt-1 text-[10px] font-bold text-red-600 uppercase tracking-wider">
						⚠ Emergency contact required
					</p>
				</div>
				<span
					class="rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider"
					:class="attendeeStatusBadgeClass(index, attendee)"
				>
					{{ attendeeStatusLabel(index, attendee) }}
				</span>
			</div>
		</button>

		<div class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5" v-if="!showCheckoutPricingSidebar">
			<p class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Current attendee snapshot</p>
			<div v-if="currentAttendee" class="mt-3 space-y-2">
				<p class="text-sm font-bold text-slate-800">{{ attendeeDisplayName(currentAttendee, currentIndex) }}</p>
				<p class="text-xs text-slate-600">
					Email: {{ currentAttendee.email || 'Not provided yet' }}
				</p>
				<p class="text-xs text-slate-600">
					DOB: {{ currentAttendee.date_of_birth || 'Not provided yet' }}
				</p>
				<p class="text-xs text-slate-600">
					Package: {{ packageById(currentAttendee.packageId)?.name || 'Not selected' }}
				</p>
			</div>
			<p class="mt-3 text-[11px] leading-relaxed text-slate-500">
				Keep medical, dietary, and emergency details accurate to support safe event safeguarding.
			</p>
		</div>

		<div class="space-y-4 lg:sticky lg:top-24" v-if="showCheckoutPricingSidebar">
			<div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
				<div class="flex items-center justify-between">
					<h3 class="text-sm font-semibold text-slate-900">Payment breakdown</h3>
				</div>
				<p v-if="checkoutPreviewLoading" class="mt-3 text-xs text-slate-500">Refreshing payment breakdown...</p>
				<p v-else-if="checkoutPreviewError" class="mt-3 text-xs font-semibold text-red-600">{{ checkoutPreviewError }}</p>
				<div class="mt-3 space-y-2">
					<div
						v-for="item in breakdownLines"
						:key="item.id"
						class="rounded-lg border border-slate-100 bg-slate-50 px-3 py-3 text-sm"
					>
						<div class="flex items-center justify-between gap-3">
							<div>
								<p class="font-semibold text-slate-800">{{ item.name }}</p>
								<p class="text-xs text-slate-500">{{ item.description }}</p>
								<p v-if="item.discountHint" class="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">{{ item.discountHint }}</p>
							</div>
							<p class="font-semibold text-slate-900">{{ formatMoney(item.finalAmount, item.currency) }}</p>
						</div>
						<p class="mt-2 text-[11px] text-slate-600">
							{{ formatMoney(item.originalAmount, item.currency) }}
							<span class="text-slate-400"> - </span>
							<span class="text-emerald-700">{{ formatMoney(item.discountAmount, item.currency) }}</span>
							<span class="text-slate-400"> = </span>
							<span class="font-semibold text-slate-800">{{ formatMoney(item.finalAmount, item.currency) }}</span>
						</p>
					</div>
					<p v-if="!breakdownLines.length && !checkoutPreviewLoading" class="text-xs text-slate-500">No payable items selected yet.</p>
				</div>
				<div class="mt-4 border-t border-slate-100 pt-3 text-sm">
					<div class="flex items-center justify-between text-slate-600">
						<span>Subtotal</span>
						<span>{{ formatMoney(paymentBreakdownTotal.originalAmount, paymentBreakdownTotal.currency) }}</span>
					</div>
					<div class="mt-1 flex items-center justify-between text-emerald-700">
						<span>Total discount</span>
						<span>-{{ formatMoney(paymentBreakdownTotal.discountAmount, paymentBreakdownTotal.currency) }}</span>
					</div>
					<div class="mt-2 flex items-center justify-between text-base font-bold text-slate-900">
						<span>Total due</span>
						<span>{{ formatMoney(paymentBreakdownTotal.amount, paymentBreakdownTotal.currency) }}</span>
					</div>
					<p v-if="isPollingPaymentStatus" class="mt-2 text-xs font-semibold text-amber-700">{{ paymentProcessingMessage || 'Finalizing your payment...' }}</p>
				</div>
			</div>

			<div class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
				<div class="flex items-center gap-2 font-semibold">
					<UIcon name="i-heroicons-lock-closed" class="h-4 w-4" />
					Powered and secured by Stripe
				</div>
				<p class="mt-1 text-xs text-emerald-700">We do not store any card data.</p>
			</div>
		</div>
	</aside>
</template>

<script setup lang="ts">
import { formatMoney } from '~/utils/money'
import type { AttendeeDraft } from '~/stores/registration'

export type BreakdownLine = {
	id: string
	name: string
	description: string
	originalAmount: number
	discountAmount: number
	finalAmount: number
	currency: string
	discountHint?: string
}

defineProps<{
	attendees: AttendeeDraft[]
	currentIndex: number
	currentAttendee: AttendeeDraft | undefined
	showCheckoutPricingSidebar: boolean
	attendeeDisplayName: (attendee: AttendeeDraft, index: number) => string
	isAttendeeMinor: (attendee: AttendeeDraft) => boolean
	minorHasEmergencyContact: (attendee: AttendeeDraft) => boolean
	attendeeStatusLabel: (index: number, attendee: AttendeeDraft) => string
	attendeeStatusBadgeClass: (index: number, attendee: AttendeeDraft) => string
	attendeeSidebarCardClass: (index: number, attendee: AttendeeDraft) => string
	attendeeStepSummary: (index: number) => string
	packageById: (id?: number) => any
	checkoutPreviewLoading: boolean
	checkoutPreviewError: string
	breakdownLines: BreakdownLine[]
	paymentBreakdownTotal: { originalAmount: number; discountAmount: number; amount: number; currency: string }
	isPollingPaymentStatus: boolean
	paymentProcessingMessage: string
}>()

const emit = defineEmits<{
	'jump-to-attendee': [index: number]
}>()
</script>
