<template>
	<EventManagementLayout :event-id="id" :event="event?.data">
		<div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
			<div class="lg:col-span-8 space-y-6">
				<section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden p-6">
					<div class="flex flex-wrap items-center gap-3 pb-4 border-b border-navy-50">
						<div class="flex items-center gap-2">
							<span class="material-symbols-outlined text-primary">map</span>
							<h2 class="text-sm font-black text-primary uppercase tracking-widest">Event Venues</h2>
						</div>

						<div class="ml-auto flex items-center gap-2">
							<input
								v-model="linkedSearch"
								type="text"
								placeholder="Search linked venues"
								class="rounded-xl border border-primary-500/20 bg-white px-3 py-2 text-sm text-navy-900 placeholder:text-navy-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
							/>
							<button
								v-if="canCreateVenueLinks"
								@click="showVenueWizard = true"
								class="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90"
							>
								<span class="material-symbols-outlined text-base">add</span>
								Add Venue
							</button>
						</div>
					</div>

					<div v-if="isLoadingEventVenues" class="space-y-3 pt-4">
						<div v-for="i in 3" :key="i" class="h-24 bg-mist-blue/60 rounded-xl animate-pulse" />
					</div>

					<div v-else-if="eventVenueList.length" class="space-y-3 pt-4">
						<article
							v-for="entry in eventVenueList"
							:key="entry.event_venue_id"
							class="border border-deep-navy/10 rounded-xl p-4 bg-white hover:bg-mist-blue/40 transition-colors"
						>
							<div class="flex items-start gap-3">
								<div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
									<span class="material-symbols-outlined text-primary">location_on</span>
								</div>

								<div class="flex-1 min-w-0">
									<div class="flex items-center gap-2 flex-wrap">
										<h3 class="text-sm font-black text-navy-900">{{ entry.venue_name }}</h3>
										<UBadge color="blue" variant="soft" size="xs">Venue ID: {{ entry.venue }}</UBadge>
									</div>
									<p class="text-sm text-navy-600 mt-1">{{ entry.venue_address || 'No address available' }}</p>
									<p class="text-xs text-navy-400 mt-1">{{ entry.venue_city || 'No city' }}</p>
									
								</div>

								<div class="flex items-center gap-1">
									<NuxtLink
										:to="`/events/${id}/m/venue/${entry.event_venue_id}`"
										class="px-3 py-1.5 text-xs font-bold rounded-lg border border-deep-navy/15 text-navy-700 hover:bg-mist-blue/70"
									>
										Manage Details
									</NuxtLink>
									<button
										v-if="canDeleteVenueLinks"
										class="px-3 py-1.5 text-xs font-bold rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
										@click="removeVenueLink(entry.event_venue_id)"
									>
										Remove
									</button>
								</div>
							</div>
							 <div v-if="entry.venue_address" class="h-64 bg-mist-blue relative border-t border-deep-navy/10 mt-4 rounded-lg overflow-hidden flex items-center justify-center">
								<iframe
								:src="`https://maps.google.com/maps?q=${encodeURIComponent(entry.venue_address + ' ' + (entry.venue_city || ''))}&output=embed`"
								class="w-full h-full border-0"
								loading="lazy"
								referrerpolicy="no-referrer-when-downgrade"
								></iframe>
							</div>
						</article>
					</div>

					<div v-else class="text-center py-12 text-navy-500">
						<span class="material-symbols-outlined text-5xl text-navy-300 mb-3 block">location_off</span>
						<p class="text-sm">No venues linked to this event yet.</p>
						<button
							v-if="canCreateVenueLinks"
							@click="showVenueWizard = true"
							class="mt-4 inline-flex items-center gap-1.5 px-5 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90"
						>
							<span class="material-symbols-outlined text-sm">add_location_alt</span>
							Link First Venue
						</button>
					</div>
				</section>
			</div>

			<div class="lg:col-span-4 space-y-6">
				<section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
					<div class="bg-primary px-6 py-4">
						<h3 class="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
							<span class="material-symbols-outlined text-base">bar_chart</span>
							Venue Overview
						</h3>
					</div>
					<div class="p-6 space-y-4">
						<div class="flex items-center justify-between">
							<span class="text-sm text-navy-600 font-medium">Linked Venues</span>
							<span class="text-2xl font-black text-navy-900">{{ eventVenueList.length }}</span>
						</div>
						<div class="flex items-center justify-between">
							<span class="text-sm text-navy-600 font-medium">Available Global Venues</span>
							<span class="text-2xl font-black text-primary">{{ availableVenueOptions.length }}</span>
						</div>
						<p class="text-xs text-navy-500">
							Venues are global resources. Link existing ones first, then create new POI + venue records only when needed.
						</p>
					</div>
				</section>

				<section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
					<div class="px-6 py-4 border-b border-navy-50 flex items-center gap-2">
						<span class="material-symbols-outlined text-primary text-xl">tips_and_updates</span>
						<h3 class="text-[11px] font-black text-primary uppercase tracking-widest">Venue Workflow</h3>
					</div>
					<div class="p-6 text-sm space-y-2 text-navy-600">
						<p>1. Search and link existing venue resources first.</p>
						<p>2. If no match exists, create POI and venue from this tab.</p>
						<p>3. Open Manage Details to maintain rooms, contacts, and metadata.</p>
					</div>
				</section>
			</div>
		</div>

		<EventVenueWizardModal
			:open="showVenueWizard"
			:search="globalVenueSearch"
			:venues="availableVenueOptions"
			@close="showVenueWizard = false"
			@update:search="globalVenueSearch = $event"
			@select="handleVenueSelection"
		/>
	</EventManagementLayout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useEvent } from '~/composables/resources/events/events'
import { useCreateEventVenue, useDeleteEventVenue, useEventVenues } from '~/composables/resources/events/eventVenues'
import { extractResults } from '~/composables/resources/events/eventVenueManagement'
import { useLocationVenues } from '~/composables/resources/locations/locationVenues'
import { useCurrentUserEventPermissions } from '~/composables/permissions'
import EventManagementLayout from '~/components/events/EventManagementLayout.vue'
import EventVenueWizardModal from '~/components/events/venue/EventVenueWizardModal.vue'

definePageMeta({
	layout: false,
	middleware: ['auth', 'event-permission'],
	eventPermission: {
		category: 'REGISTRATION',
		action: 'read',
	},
})

const route = useRoute()
const toast = useToast()

const id = computed(() => String(route.params.id))
const { can } = useCurrentUserEventPermissions(id)

const canCreateVenueLinks = computed(() => can('REGISTRATION', 'create').value.allowed)
const canDeleteVenueLinks = computed(() => can('REGISTRATION', 'delete').value.allowed)

const { data: event } = useEvent(id)
const eventInternalId = computed(() => event.value?.data?.id)

const linkedSearch = ref('')
const globalVenueSearch = ref('')
const showVenueWizard = ref(false)

const eventVenueQuery = computed(() => ({
	event_id: id.value,
	search: linkedSearch.value || undefined,
	ordering: 'venue__poi__name',
	page_size: 100,
}))

const locationVenueQuery = computed(() => ({
	search: globalVenueSearch.value || undefined,
	ordering: 'poi__name',
	page_size: 100,
}))

const { data: eventVenuesResponse, isLoading: isLoadingEventVenues } = useEventVenues(eventVenueQuery)
const { data: locationVenuesResponse } = useLocationVenues(locationVenueQuery)

const eventVenueList = computed(() => extractResults<any>(eventVenuesResponse.value))
const locationVenueList = computed(() => extractResults<any>(locationVenuesResponse.value))

const linkedVenueIds = computed(() => {
	return new Set(eventVenueList.value.map(item => item.venue))
})

const availableVenueOptions = computed(() => {
	return locationVenueList.value.filter((item) => {
		const poiType = item.poi_type || item.poi?.poi_type
		if (!['VENUE', 'SPORTS_VENUE'].includes(poiType))
			return false

		return !linkedVenueIds.value.has(item.id)
	})
})

const createEventVenue = useCreateEventVenue()
const deleteEventVenue = useDeleteEventVenue()

const handleVenueSelection = async (venueId: number) => {
	if (!eventInternalId.value) {
		toast.add({
			title: 'Event not ready',
			description: 'Event context is still loading. Please try again in a moment.',
			color: 'red',
		})
		return
	}

	try {
		await createEventVenue.mutateAsync({
			event: eventInternalId.value,
			venue: venueId,
		})

		showVenueWizard.value = false

		toast.add({
			title: 'Venue linked',
			description: 'The venue has been linked to this event.',
			color: 'green',
		})
	}
	catch (error: any) {
		toast.add({
			title: 'Could not link venue',
			description: error?.message || 'An error occurred while linking venue.',
			color: 'red',
		})
	}
}

const removeVenueLink = async (eventVenueId: string) => {
	const confirmed = window.confirm('Remove this venue from the event?')
	if (!confirmed)
		return

	try {
		await deleteEventVenue.mutateAsync(eventVenueId)
		toast.add({
			title: 'Venue removed',
			description: 'Venue association was removed from this event.',
			color: 'green',
		})
	}
	catch (error: any) {
		toast.add({
			title: 'Could not remove venue',
			description: error?.message || 'An error occurred while removing venue.',
			color: 'red',
		})
	}
}
</script>