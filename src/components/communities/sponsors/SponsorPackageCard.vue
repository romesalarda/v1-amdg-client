<template>
	<div
		role="button"
		class="bg-white rounded-xl p-6 relative group transition-all duration-300"
		:class="[
			pkg.cardClass,
			selectable ? 'cursor-pointer hover:-translate-y-1 hover:shadow-md' : '',
			selected ? pkg.selectedClass : '',
		]"
		:tabindex="selectable ? 0 : -1"
		@click="selectable ? emit('select') : undefined"
		@keydown.enter.prevent="selectable ? emit('select') : undefined"
		@keydown.space.prevent="selectable ? emit('select') : undefined"
	>
		<!-- Premium badge (hidden when selected checkmark is shown) -->
		<div
			v-if="pkg.showPremiumBadge && !(selectable && selected)"
			class="absolute top-4 right-4 text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full"
			:class="pkg.premiumBadgeClass"
		>
			Premium
		</div>

		<!-- Selected checkmark -->
		<div
			v-if="selectable && selected"
			class="absolute top-4 right-4 h-6 w-6 rounded-full bg-deep-navy flex items-center justify-center"
		>
			<svg class="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
				<path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		</div>

		<!-- Header: icon + tier + name -->
		<div class="flex items-center gap-3 mb-5">
			<div
				class="w-12 h-12 rounded-full flex items-center justify-center border flex-shrink-0"
				:class="pkg.iconWrapClass"
			>
				<span class="material-symbols-outlined" :class="pkg.iconClass">{{ pkg.icon }}</span>
			</div>
			<div class="min-w-0">
				<span class="text-xs font-bold uppercase tracking-tighter" :class="pkg.tierTextClass">
					Tier {{ pkg.tier ?? 1 }}
				</span>
				<h4 class="text-2xl font-black leading-none text-deep-navy mt-0.5 truncate">{{ pkg.package_name }}</h4>
			</div>
		</div>

		<!-- Amount -->
		<div class="mb-6">
			<div class="text-sm text-deep-navy/50 mb-1 font-medium">Investment</div>
			<div class="text-4xl font-black tracking-tighter text-deep-navy">
				{{ formatMoney(pkg.modified_amount ?? pkg.base_amount ?? '0', pkg.base_amount_currency ?? 'GBP') }}
			</div>
		</div>

		<!-- Sponsors count + active status -->
		<div
			v-if="pkg.sponsors_count !== undefined || pkg.active !== undefined"
			class="flex items-center justify-between mb-6 pb-6 border-b border-[#f1f4f9]"
		>
			<div v-if="pkg.sponsors_count !== undefined" class="flex flex-col">
				<span class="text-xs uppercase tracking-widest text-deep-navy/50">Sponsors</span>
				<span class="text-xl font-bold text-deep-navy">{{ String(pkg.sponsors_count).padStart(2, '0') }}</span>
			</div>
			<span
				v-if="pkg.active !== undefined"
				class="px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1"
				:class="pkg.active ? 'bg-emerald-100 text-emerald-700' : 'bg-[#e5e8ed] text-[#45464d]'"
			>
				<span class="w-1.5 h-1.5 rounded-full" :class="pkg.active ? 'bg-emerald-500' : 'bg-[#76767e]'" />
				{{ pkg.active ? 'Active' : 'Inactive' }}
			</span>
		</div>

		<!-- Description -->
		<p class="text-sm text-deep-navy/60 line-clamp-3">
			{{ pkg.package_description || 'No package description provided.' }}
		</p>
	</div>
</template>

<script lang="ts" setup>
import type { StyledSponsorPackage } from '~/composables/communities/sponsors/useSponsorPackageStyling'
import { formatMoney } from '~/utils/money'

defineProps<{
	pkg: StyledSponsorPackage
	selected?: boolean
	selectable?: boolean
}>()

const emit = defineEmits<{
	(e: 'select'): void
}>()
</script>
