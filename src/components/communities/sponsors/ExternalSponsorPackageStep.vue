<template>
	<div class="space-y-8">
		<!-- Packages -->
		<div>
			<p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/40 mb-4">Sponsorship Package</p>

			<div v-if="isLoadingPackages" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
				<div v-for="i in 3" :key="i" class="h-64 rounded-xl bg-deep-navy/5 animate-pulse" />
			</div>

			<div v-else-if="styledPackages.length === 0" class="text-center py-10 rounded-xl border-2 border-dashed border-deep-navy/20">
				<span class="material-symbols-outlined text-3xl text-deep-navy/30">inventory_2</span>
				<p class="mt-2 text-sm font-bold text-deep-navy/50">No active packages available for this event.</p>
			</div>

			<div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
				<SponsorPackageCard
					v-for="pkg in styledPackages"
					:key="pkg.package_id"
					:pkg="pkg"
					:selected="selectedPackageId === pkg.package_id"
					:selectable="true"
					@select="emit('update:selectedPackageId', pkg.package_id)"
				/>
			</div>
		</div>

		<!-- Payment methods -->
		<div>
			<p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/40 mb-4">Payment Method</p>

			<div v-if="isLoadingPaymentMethods" class="space-y-2">
				<div v-for="i in 2" :key="i" class="h-16 rounded-xl bg-deep-navy/5 animate-pulse" />
			</div>

			<div v-else-if="paymentMethods.length === 0" class="text-center py-8 rounded-xl border-2 border-dashed border-deep-navy/20">
				<p class="text-sm font-bold text-deep-navy/50">No active payment methods found for this event.</p>
			</div>

			<div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
				<button
					v-for="method in paymentMethods"
					:key="method.id"
					type="button"
					class="text-left p-4 rounded-xl border-2 transition-all"
					:class="selectedPaymentMethodId === method.id
						? 'border-deep-navy bg-deep-navy text-white'
						: 'border-deep-navy/20 bg-white text-deep-navy hover:border-deep-navy/40'"
					@click="emit('update:selectedPaymentMethodId', method.id)"
				>
					<p class="text-sm font-black uppercase tracking-tight">{{ method.title }}</p>
					<p class="mt-1 text-xs font-bold uppercase tracking-wider opacity-70">{{ formatMethodType(method.method_type) }}</p>
				</button>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import SponsorPackageCard from '~/components/communities/sponsors/SponsorPackageCard.vue'
import type { StyledSponsorPackage } from '~/composables/communities/sponsors/useSponsorPackageStyling'
import type { TokenFlowPaymentMethod } from '~/composables/communities/sponsors/useTokenSponsorFlow'

defineProps<{
	styledPackages: StyledSponsorPackage[]
	paymentMethods: TokenFlowPaymentMethod[]
	selectedPackageId: string
	selectedPaymentMethodId: number | null
	isLoadingPackages: boolean
	isLoadingPaymentMethods: boolean
}>()

const emit = defineEmits<{
	(e: 'update:selectedPackageId', value: string): void
	(e: 'update:selectedPaymentMethodId', value: number): void
}>()

function formatMethodType(type: string) {
	const map: Record<string, string> = {
		STRIPE: 'Card (Stripe)',
		BANK_TRANSFER: 'Bank Transfer',
		CASH: 'Cash',
	}
	return map[type] ?? type
}
</script>
