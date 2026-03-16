<template>
  <ManagementLayout :organisation-id="organisationId" :organisation="organisation">
    <!-- Back Button -->
    <NuxtLink
      :to="`/communities/${organisationId}/m/events`"
      class="inline-flex items-center gap-2 px-5 py-3 mb-6 border-2 border-deep-navy/20 text-deep-navy hover:bg-deep-navy/5 rounded-xl font-black text-sm uppercase tracking-wider transition-all"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Back to Events
    </NuxtLink>

    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-6">
      <div class="bg-white border-2 border-deep-navy rounded-xl shadow-drawn p-8">
        <USkeleton class="h-8 w-3/4 mb-4" />
        <USkeleton class="h-6 w-1/2" />
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <USkeleton v-for="i in 4" :key="i" class="h-32 rounded-xl" />
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-500/10 border-2 border-red-500/20 rounded-xl p-6">
      <div class="flex gap-4">
        <div class="flex-shrink-0">
          <div class="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
          </div>
        </div>
        <div class="flex-1">
          <h3 class="text-sm font-black text-deep-navy uppercase tracking-tight mb-1">Error loading event</h3>
          <p class="text-xs text-deep-navy/70 font-medium">{{ error.message }}</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else-if="event" class="space-y-6">
      <!-- Page Header with Actions -->
      <div class="bg-white border-2 border-deep-navy rounded-xl shadow-drawn p-8">
        <div class="flex items-start justify-between gap-6">
          <div class="flex-1">
            <h1 class="text-3xl font-black text-deep-navy uppercase tracking-tight mb-3">{{ event.title }}</h1>
            <p class="text-deep-navy/70 mb-4 font-bold text-sm uppercase tracking-wider">{{ event.display_code }}</p>
            <div class="flex flex-wrap gap-2">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider" :class="getStatusClasses(event.status)">
                {{ event.status_display }}
              </span>
              <span v-if="event.is_approved" class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-500 text-white">
                Authorized
              </span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3">
            <NuxtLink
              :to="`/communities/${organisationId}/m/events/${eventId}/authorise`"
              class="inline-flex items-center gap-2 px-6 py-3 bg-deep-navy hover:bg-deep-navy/90 text-white rounded-xl font-black text-sm uppercase tracking-wider transition-all"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Authorize Event
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white border-2 border-deep-navy rounded-xl shadow-drawn p-6">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center border-2 border-blue-500/20">
              <svg class="w-7 h-7 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
            </div>
            <div>
              <p class="text-[10px] font-black text-deep-navy/50 uppercase tracking-[0.2em] mb-1">Attendees</p>
              <p class="text-2xl font-black text-deep-navy">{{ event.number_of_attendees }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white border-2 border-deep-navy rounded-xl shadow-drawn p-6">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 bg-green-500/10 rounded-xl flex items-center justify-center border-2 border-green-500/20">
              <svg class="w-7 h-7 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
              </svg>
            </div>
            <div>
              <p class="text-[10px] font-black text-deep-navy/50 uppercase tracking-[0.2em] mb-1">Duration</p>
              <p class="text-2xl font-black text-deep-navy">{{ event.duration_days }} day(s)</p>
            </div>
          </div>
        </div>

        <div class="bg-white border-2 border-deep-navy rounded-xl shadow-drawn p-6">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center border-2 border-purple-500/20">
              <svg class="w-7 h-7 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12.75c1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.73V18H6v-1.61c0-1.18.68-2.26 1.76-2.73 1.17-.52 2.61-.91 4.24-.91zM4 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm1.13 1.1c-.37-.06-.74-.1-1.13-.1-.99 0-1.93.21-2.78.58C.48 14.9 0 15.62 0 16.43V18h4.5v-1.61c0-.83.23-1.61.63-2.29zM20 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm4 3.43c0-.81-.48-1.53-1.22-1.85-.85-.37-1.79-.58-2.78-.58-.39 0-.76.04-1.13.1.4.68.63 1.46.63 2.29V18H24v-1.57zM12 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z"/>
              </svg>
            </div>
            <div>
              <p class="text-[10px] font-black text-deep-navy/50 uppercase tracking-[0.2em] mb-1">Max Capacity</p>
              <p class="text-2xl font-black text-deep-navy">{{ event.maximum_attendance || '∞' }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white border-2 border-deep-navy rounded-xl shadow-drawn p-6">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 bg-orange-500/10 rounded-xl flex items-center justify-center border-2 border-orange-500/20">
              <svg class="w-7 h-7 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 2v2h6V2h2v2h1c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h1V2h2zm10 18V8H5v12h14zM7 10h5v5H7v-5z"/>
              </svg>
            </div>
            <div>
              <p class="text-[10px] font-black text-deep-navy/50 uppercase tracking-[0.2em] mb-1">Registration</p>
              <p class="text-lg font-black text-deep-navy">
                {{ event.can_participants_register ? 'Open' : 'Closed' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Information Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Event Details -->
        <div class="bg-white border-2 border-deep-navy rounded-xl shadow-drawn">
          <div class="px-8 py-6 border-b-2 border-deep-navy/10">
            <h2 class="text-xl font-black text-deep-navy uppercase tracking-tight">Event Details</h2>
          </div>

          <div class="p-8 space-y-6">
            <div class="flex items-start gap-4">
              <svg class="w-5 h-5 text-deep-navy/40 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>
              </svg>
              <div class="flex-1">
                <label class="text-[10px] font-black text-deep-navy/50 uppercase tracking-[0.2em] block mb-2">Event Type</label>
                <p class="text-sm text-deep-navy font-medium">{{ event.event_type_details?.title || 'N/A' }}</p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <svg class="w-5 h-5 text-deep-navy/40 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path fill-rule="evenodd" d="M4.5 2.25a.75.75 0 000 1.5v16.5h-.75a.75.75 0 000 1.5h16.5a.75.75 0 000-1.5h-.75V3.75a.75.75 0 000-1.5h-15zM9 6a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H9zm-.75 3.75A.75.75 0 019 9h1.5a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM9 12a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H9zm3.75-5.25A.75.75 0 0113.5 6H15a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM13.5 9a.75.75 0 000 1.5H15A.75.75 0 0015 9h-1.5zm-.75 3.75a.75.75 0 01.75-.75H15a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM9 19.5v-2.25a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v2.25a.75.75 0 01-.75.75h-4.5A.75.75 0 019 19.5z" clip-rule="evenodd" />
              </svg>
              <div class="flex-1">
                <label class="text-[10px] font-black text-deep-navy/50 uppercase tracking-[0.2em] block mb-2">Organization</label>
                <p class="text-sm text-deep-navy font-medium">{{ event.organisation_name }}</p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <svg class="w-5 h-5 text-deep-navy/40 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
              </svg>
              <div class="flex-1">
                <label class="text-[10px] font-black text-deep-navy/50 uppercase tracking-[0.2em] block mb-2">Start Date & Time</label>
                <p class="text-sm text-deep-navy font-medium">{{ formatEventDateTime(event.start_datetime) }}</p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <svg class="w-5 h-5 text-deep-navy/40 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
              </svg>
              <div class="flex-1">
                <label class="text-[10px] font-black text-deep-navy/50 uppercase tracking-[0.2em] block mb-2">End Date & Time</label>
                <p class="text-sm text-deep-navy font-medium">{{ formatEventDateTime(event.end_datetime) }}</p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <svg class="w-5 h-5 text-deep-navy/40 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
              <div class="flex-1">
                <label class="text-[10px] font-black text-deep-navy/50 uppercase tracking-[0.2em] block mb-2">Timezone</label>
                <p class="text-sm text-deep-navy font-medium">{{ event.timezone }}</p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <svg class="w-5 h-5 text-deep-navy/40 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              <div class="flex-1">
                <label class="text-[10px] font-black text-deep-navy/50 uppercase tracking-[0.2em] block mb-2">Created By</label>
                <p class="text-sm text-deep-navy font-medium">{{ event.created_by_email }}</p>
                <p class="text-xs text-deep-navy/60 mt-1 font-medium">{{ formatEventDateTime(event.created_at) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Status Information -->
        <div class="bg-white border-2 border-deep-navy rounded-xl shadow-drawn">
          <div class="px-8 py-6 border-b-2 border-deep-navy/10">
            <h2 class="text-xl font-black text-deep-navy uppercase tracking-tight">Status Information</h2>
          </div>

          <div class="p-8 space-y-6">
            <div>
              <label class="text-[10px] font-black text-deep-navy/50 uppercase tracking-[0.2em] block mb-3">Current Status</label>
              <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider" :class="getStatusClasses(event.status)">
                {{ event.status_display }}
              </span>
            </div>

            <div>
              <label class="text-[10px] font-black text-deep-navy/50 uppercase tracking-[0.2em] block mb-3">Authorization Status</label>
              <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider" :class="event.is_approved ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'">
                {{ event.is_approved ? 'Authorized' : 'Pending Authorization' }}
              </span>
            </div>

            <div>
              <label class="text-[10px] font-black text-deep-navy/50 uppercase tracking-[0.2em] block mb-2">Registration</label>
              <p class="text-sm text-deep-navy font-medium">
                {{ event.can_participants_register ? 'Open for registration' : 'Registration closed' }}
              </p>
            </div>

            <div>
              <label class="text-[10px] font-black text-deep-navy/50 uppercase tracking-[0.2em] block mb-2">Ongoing Status</label>
              <p class="text-sm text-deep-navy font-medium">
                {{ event.is_ongoing ? 'Event is currently in progress' : 'Event not started or ended' }}
              </p>
            </div>

            <div v-if="event.deleted_at">
              <label class="text-[10px] font-black text-deep-navy/50 uppercase tracking-[0.2em] block mb-2">Deleted</label>
              <p class="text-sm text-red-600 font-bold">
                Deleted on {{ formatEventDateTime(event.deleted_at) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Descriptions -->
      <div v-if="event.short_description || event.long_description" class="bg-white border-2 border-deep-navy rounded-xl shadow-drawn">
        <div class="px-8 py-6 border-b-2 border-deep-navy/10">
          <h2 class="text-xl font-black text-deep-navy uppercase tracking-tight">Description</h2>
        </div>

        <div class="p-8 space-y-6">
          <div v-if="event.short_description">
            <label class="text-[10px] font-black text-deep-navy/50 uppercase tracking-[0.2em] block mb-3">Short Description</label>
            <p class="text-sm text-deep-navy font-medium leading-relaxed">{{ event.short_description }}</p>
          </div>

          <div v-if="event.long_description" class="border-t-2 border-deep-navy/10 pt-6">
            <label class="text-[10px] font-black text-deep-navy/50 uppercase tracking-[0.2em] block mb-3">Full Description</label>
            <div class="prose prose-sm max-w-none">
              <p class="text-sm text-deep-navy font-medium leading-relaxed whitespace-pre-wrap">{{ event.long_description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Additional Information -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div v-if="event.theme || event.anchor_verse" class="bg-white border-2 border-deep-navy rounded-xl shadow-drawn">
          <div class="px-8 py-6 border-b-2 border-deep-navy/10">
            <h2 class="text-xl font-black text-deep-navy uppercase tracking-tight">Theme & Spiritual Focus</h2>
          </div>

          <div class="p-8 space-y-6">
            <div v-if="event.theme">
              <label class="text-[10px] font-black text-deep-navy/50 uppercase tracking-[0.2em] block mb-3">Theme</label>
              <p class="text-sm text-deep-navy font-medium leading-relaxed">{{ event.theme }}</p>
            </div>

            <div v-if="event.anchor_verse">
              <label class="text-[10px] font-black text-deep-navy/50 uppercase tracking-[0.2em] block mb-3">Anchor Verse</label>
              <p class="text-sm text-deep-navy font-medium italic leading-relaxed">"{{ event.anchor_verse }}"</p>
            </div>
          </div>
        </div>

        <div v-if="event.important_information || event.what_to_bring" class="bg-white border-2 border-deep-navy rounded-xl shadow-drawn">
          <div class="px-8 py-6 border-b-2 border-deep-navy/10">
            <h2 class="text-xl font-black text-deep-navy uppercase tracking-tight">Important Details</h2>
          </div>

          <div class="p-8 space-y-6">
            <div v-if="event.important_information">
              <label class="text-[10px] font-black text-deep-navy/50 uppercase tracking-[0.2em] block mb-3">Important Information</label>
              <p class="text-sm text-deep-navy font-medium leading-relaxed whitespace-pre-wrap">{{ event.important_information }}</p>
            </div>

            <div v-if="event.what_to_bring">
              <label class="text-[10px] font-black text-deep-navy/50 uppercase tracking-[0.2em] block mb-3">What to Bring</label>
              <p class="text-sm text-deep-navy font-medium leading-relaxed whitespace-pre-wrap">{{ event.what_to_bring }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ManagementLayout>
</template>

<script setup lang="ts">

definePageMeta({
  middleware: ['auth', 'organisation-controller'],
  layout: 'default',
})

import { useEvent } from '~/composables/resources/events/events'
import { useOrganisation } from '~/composables/resources/organisation/organisations'
import { formatDateTime } from '~/utils/time'
import ManagementLayout from '~/components/communities/ManagementLayout.vue'

const route = useRoute()

const organisationId = computed(() => route.params.id as string)
const eventId = computed(() => route.params.event_id as string)

// Fetch organisation for the layout
const { data: orgData } = useOrganisation(Number(organisationId.value))
const organisation = computed(() => orgData.value?.data)

// Fetch event details
const { data, isLoading, error } = useEvent(eventId)
const event = computed(() => data.value?.data)

const formatEventDateTime = (dateString?: string) => {
  if (!dateString) return 'N/A'
  return formatDateTime(dateString, event.value?.timezone || 'UTC', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getStatusColor = (status?: string): 'gray' | 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'yellow' => {
  const colors: Record<string, 'gray' | 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'yellow'> = {
    'DRAFTING': 'gray',
    'PUBLISHED': 'blue',
    'OPEN': 'green',
    'CLOSED': 'orange',
    'IN_PROGRESS': 'purple',
    'COMPLETED': 'gray',
    'DELETED': 'red',
    'CANCELLED': 'red',
    'POSTPONED': 'yellow',
    'ARCHIVED': 'gray',
  }
  return colors[status || ''] || 'gray'
}

const getStatusClasses = (status?: string): string => {
  const classes: Record<string, string> = {
    'DRAFTING': 'bg-gray-500 text-white',
    'PUBLISHED': 'bg-blue-500 text-white',
    'OPEN': 'bg-green-500 text-white',
    'CLOSED': 'bg-orange-500 text-white',
    'IN_PROGRESS': 'bg-purple-500 text-white',
    'COMPLETED': 'bg-gray-500 text-white',
    'DELETED': 'bg-red-500 text-white',
    'CANCELLED': 'bg-red-500 text-white',
    'POSTPONED': 'bg-amber-500 text-white',
    'ARCHIVED': 'bg-gray-500 text-white',
  }
  return classes[status || ''] || 'bg-gray-500 text-white'
}
</script>
