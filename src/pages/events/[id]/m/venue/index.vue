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
							class="rounded-xl border bg-white p-4 transition-colors hover:bg-mist-blue/40"
							:class="entry.is_primary ? 'border-primary/40 ring-1 ring-primary/20' : 'border-deep-navy/10'"
						>
							<div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
								<!-- Details -->
								<div class="flex min-w-0 flex-1 items-start gap-3">
									<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
										<span class="material-symbols-outlined text-xl text-primary">location_on</span>
									</div>

									<div class="min-w-0 flex-1">
										<div class="flex flex-wrap items-center gap-2">
											<h3 class="truncate text-base font-semibold text-navy-900">{{ entry.name }}</h3>
											<span
												v-if="entry.is_primary"
												class="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary"
											>
												<span class="material-symbols-outlined text-sm">star</span>
												Primary
											</span>
										</div>

										<p class="mt-1 text-sm text-navy-600">
											{{ entry.address || 'No address available' }}
										</p>
										<p class="mt-0.5 flex items-center gap-1 text-xs text-navy-400">
											<span class="material-symbols-outlined text-sm">map</span>
											{{ entry.city || 'No city' }}
										</p>
									</div>
								</div>

								<!-- Actions -->
								<div class="flex flex-wrap items-center gap-2 md:shrink-0 md:justify-end">
									<NuxtLink
										:to="`/events/${id}/m/venue/${entry.event_venue_id}`"
										class="inline-flex h-8 items-center gap-1.5 rounded-lg border border-deep-navy/15 px-3 text-xs font-semibold text-navy-700 transition-colors hover:bg-mist-blue/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
									>
										<span class="material-symbols-outlined text-base">tune</span>
										Manage
									</NuxtLink>

									<NuxtLink
										:to="`/events/${id}/m/venue/${entry.event_venue_id}/floor-plans`"
										class="inline-flex h-8 items-center gap-1.5 rounded-lg border border-deep-navy/15 px-3 text-xs font-semibold text-navy-700 transition-colors hover:bg-mist-blue/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
									>
										<span class="material-symbols-outlined text-base">map</span>
										Floor Plans
									</NuxtLink>

									<button
										v-if="canUpdateVenueLinks && !entry.is_primary"
										type="button"
										class="inline-flex h-8 items-center gap-1.5 rounded-lg border border-primary/30 px-3 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
										:disabled="partialUpdateEventVenue.isPending.value"
										@click="setPrimaryVenue(entry.event_venue_id)"
									>
										<span class="material-symbols-outlined text-base">star</span>
										Set as Primary
									</button>

									<button
										v-if="canDeleteVenueLinks"
										type="button"
										class="inline-flex h-8 items-center gap-1.5 rounded-lg border border-transparent px-3 text-xs font-semibold text-red-600 transition-colors hover:border-red-200 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
										@click="removeVenueLink(entry.event_venue_id)"
									>
										<span class="material-symbols-outlined text-base">delete</span>
										Remove
									</button>
								</div>
							</div>

							<!-- Map -->
							<div
								v-if="entry.address"
								class="mt-4 h-56 overflow-hidden rounded-lg border border-deep-navy/10 bg-mist-blue"
							>
								<iframe
									:src="`https://maps.google.com/maps?q=${encodeURIComponent(entry.address + ' ' + (entry.city || ''))}&output=embed`"
									:title="`Map showing ${entry.name}`"
									class="h-full w-full border-0"
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
import { useCreateEventVenue, useDeleteEventVenue, useEventVenues, usePartialUpdateEventVenue } from '~/composables/resources/events/eventVenues'
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
    deniedRedirect: '/403',
  }
})

const route = useRoute()
const toast = useToast()

const id = computed(() => String(route.params.id))
const { can } = useCurrentUserEventPermissions(id)

const canCreateVenueLinks = computed(() => can('REGISTRATION', 'create').value.allowed)
const canDeleteVenueLinks = computed(() => can('REGISTRATION', 'delete').value.allowed)
const canUpdateVenueLinks = computed(() => can('REGISTRATION', 'update').value.allowed)

const { data: event } = useEvent(id)
const eventInternalId = computed(() => event.value?.data?.id)

const linkedSearch = ref('')
const globalVenueSearch = ref('')
const showVenueWizard = ref(false)

const eventVenueQuery = computed(() => ({
	event_id: id.value,
	search: linkedSearch.value || undefined,
	ordering: 'name',
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
	return new Set(eventVenueList.value.map(item => item.source_venue_id).filter(Boolean))
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
const partialUpdateEventVenue = usePartialUpdateEventVenue()

const setPrimaryVenue = async (eventVenueId: string) => {
	try {
		await partialUpdateEventVenue.mutateAsync({ eventVenueId, body: { is_primary: true } })
		toast.add({
			title: 'Primary venue updated',
			description: 'This venue is now the primary venue for the event.',
			color: 'green',
		})
	}
	catch (error: any) {
		toast.add({
			title: 'Could not set primary venue',
			description: error?.message || 'An error occurred while updating the venue.',
			color: 'red',
		})
	}
}

const handleVenueSelection = async (venueId: number) => {
	if (!event.value?.data?.event_id) {
		toast.add({
			title: 'Event not ready',
			description: 'Event context is still loading. Please try again in a moment.',
			color: 'red',
		})
		return
	}

	try {
		await createEventVenue.mutateAsync({
			event: event.value?.data?.event_id,
			source_venue_id: venueId,
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