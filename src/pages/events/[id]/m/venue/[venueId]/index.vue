<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-50">

    <!-- Header -->
    <header class="bg-white border-b border-deep-navy/10 shadow-sm">
      <div class="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
        <button
          type="button"
          class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-deep-navy/15 text-xs font-semibold text-navy-600 hover:bg-mist-blue/60"
          @click="$router.back()"
        >
          <span class="material-symbols-outlined text-sm">arrow_back</span>
          Back
        </button>
        <div class="flex-1 min-w-0">
          <h1 class="text-base font-black text-deep-navy truncate">
            {{ isLoading ? 'Loading…' : (venue?.poi_name ?? 'Venue') }}
          </h1>
          <p v-if="venue?.poi_city" class="text-xs text-navy-400 truncate">{{ venue.poi_city }}</p>
        </div>
      </div>
    </header>

    <main class="max-w-5xl mx-auto px-6 py-8 space-y-6">

      <!-- Skeleton -->
      <template v-if="isLoading">
        <div class="h-40 bg-white rounded-2xl border border-deep-navy/10 animate-pulse" />
        <div class="h-32 bg-white rounded-2xl border border-deep-navy/10 animate-pulse" />
      </template>

      <template v-else-if="venue">

        <!-- ── Overview card ─────────────────────────────────────── -->
        <section class="bg-white rounded-2xl border border-deep-navy/10 shadow-sm overflow-hidden">
          <div class="flex items-center gap-2 px-6 py-4 border-b border-navy-50">
            <span class="material-symbols-outlined text-primary">location_on</span>
            <h2 class="text-sm font-black text-primary uppercase tracking-widest">Overview</h2>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p class="text-[10px] font-black text-navy-400 uppercase tracking-wider mb-0.5">Name</p>
                <p class="text-sm font-semibold text-navy-900">{{ venue.poi_name }}</p>
              </div>
              <div>
                <p class="text-[10px] font-black text-navy-400 uppercase tracking-wider mb-0.5">Address</p>
                <p class="text-sm text-navy-700">{{ venue.poi_details?.address || '—' }}</p>
              </div>
              <div>
                <p class="text-[10px] font-black text-navy-400 uppercase tracking-wider mb-0.5">City</p>
                <p class="text-sm text-navy-700">{{ venue.poi_city || '—' }}</p>
              </div>
              <div>
                <p class="text-[10px] font-black text-navy-400 uppercase tracking-wider mb-0.5">Type</p>
                <span class="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary">
                  {{ venue.poi_details?.poi_type_display ?? venue.poi_type }}
                </span>
              </div>
              <div>
                <p class="text-[10px] font-black text-navy-400 uppercase tracking-wider mb-0.5">Capacity</p>
                <p class="text-sm text-navy-700">{{ venue.capacity ?? 'Not set' }}</p>
              </div>
              <div>
                <p class="text-[10px] font-black text-navy-400 uppercase tracking-wider mb-0.5">Added by</p>
                <p class="text-sm text-navy-700">{{ venue.added_by_name ?? '—' }}</p>
              </div>
            </div>

            <!-- Map embed if coordinates or address available -->
            <div
              v-if="venue.poi_details?.address"
              class="mt-6 h-100 rounded-xl overflow-hidden border border-deep-navy/10 bg-mist-blue/20"
            >
              <iframe
                :src="`https://maps.google.com/maps?q=${encodeURIComponent(venue.poi_details.address)}&output=embed`"
                class="w-full h-full border-0"
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>

        <!-- ── Notes cards (description / instructions / notes) ─── -->
        <div
          v-if="venue.description || venue.instructions || venue.notes"
          class="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div v-if="venue.description" class="bg-white rounded-2xl border border-deep-navy/10 shadow-sm p-5">
            <p class="text-[10px] font-black text-navy-400 uppercase tracking-wider mb-2">Description</p>
            <p class="text-sm text-navy-700 whitespace-pre-line">{{ venue.description }}</p>
          </div>
          <div v-if="venue.instructions" class="bg-white rounded-2xl border border-deep-navy/10 shadow-sm p-5">
            <p class="text-[10px] font-black text-navy-400 uppercase tracking-wider mb-2">Instructions</p>
            <p class="text-sm text-navy-700 whitespace-pre-line">{{ venue.instructions }}</p>
          </div>
          <div v-if="venue.notes" class="bg-white rounded-2xl border border-deep-navy/10 shadow-sm p-5">
            <p class="text-[10px] font-black text-navy-400 uppercase tracking-wider mb-2">Notes</p>
            <p class="text-sm text-navy-700 whitespace-pre-line">{{ venue.notes }}</p>
          </div>
        </div>

        <!-- ── Rooms ──────────────────────────────────────────────── -->
        <!-- <section class="bg-white rounded-2xl border border-deep-navy/10 shadow-sm overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-navy-50">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">meeting_room</span>
              <h2 class="text-sm font-black text-primary uppercase tracking-widest">Rooms</h2>
            </div>
            <span class="text-xs font-bold text-navy-400 bg-navy-50 rounded-full px-2 py-0.5">{{ rooms.length }}</span>
          </div>

          <div v-if="rooms.length" class="divide-y divide-navy-50">
            <div
              v-for="room in rooms"
              :key="room.id"
              class="flex items-start gap-4 px-6 py-4"
            >
              <div class="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-primary text-sm">door_open</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-navy-900">{{ room.room_name }}</p>
                <p v-if="room.description" class="text-xs text-navy-500 mt-0.5 truncate">{{ room.description }}</p>
              </div>
              <div v-if="room.capacity" class="text-xs text-navy-500 shrink-0">
                <span class="font-semibold text-navy-700">{{ room.capacity }}</span> cap
              </div>
            </div>
          </div>

          <div v-else class="flex flex-col items-center justify-center py-10 text-navy-400">
            <span class="material-symbols-outlined text-3xl text-navy-300 mb-2">meeting_room</span>
            <p class="text-sm">No rooms defined</p>
          </div>
        </section> -->

        <!-- ── Contacts ───────────────────────────────────────────── -->
        <section class="bg-white rounded-2xl border border-deep-navy/10 shadow-sm overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-navy-50">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">contacts</span>
              <h2 class="text-sm font-black text-primary uppercase tracking-widest">Contacts</h2>
            </div>
            <span class="text-xs font-bold text-navy-400 bg-navy-50 rounded-full px-2 py-0.5">{{ contacts.length }}</span>
          </div>

          <div v-if="contacts.length" class="divide-y divide-navy-50">
            <div
              v-for="contact in contacts"
              :key="contact.id"
              class="flex items-start gap-4 px-6 py-4"
            >
              <div class="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-primary text-sm">person</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <p class="text-sm font-semibold text-navy-900">{{ contact.contact_name }}</p>
                  <span
                    v-if="contact.role_display"
                    class="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-navy-100 text-navy-600"
                  >{{ contact.role_display }}</span>
                </div>
                <p v-if="contact.email" class="text-xs text-navy-500 mt-0.5">{{ contact.email }}</p>
                <p v-if="contact.phone_number" class="text-xs text-navy-500">{{ contact.phone_number }}</p>
              </div>
            </div>
          </div>

          <div v-else class="flex flex-col items-center justify-center py-10 text-navy-400">
            <span class="material-symbols-outlined text-3xl text-navy-300 mb-2">contacts</span>
            <p class="text-sm">No contacts defined</p>
          </div>
        </section>

        <!-- ── Metadata ───────────────────────────────────────────── -->
        <section
          v-if="metadataList.length"
          class="bg-white rounded-2xl border border-deep-navy/10 shadow-sm overflow-hidden"
        >
          <div class="flex items-center gap-2 px-6 py-4 border-b border-navy-50">
            <span class="material-symbols-outlined text-primary">info</span>
            <h2 class="text-sm font-black text-primary uppercase tracking-widest">Metadata</h2>
          </div>
          <div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div v-for="meta in metadataList" :key="meta.id">
              <p class="text-[10px] font-black text-navy-400 uppercase tracking-wider mb-0.5">{{ meta.label }}</p>
              <p class="text-sm text-navy-700">{{ meta.value || '—' }}</p>
            </div>
          </div>
        </section>

        <!-- ── Audit info ─────────────────────────────────────────── -->
        <p class="text-[11px] text-navy-400 text-right pb-2">
          Added {{ new Date(venue.added_at).toLocaleDateString() }}
          · Last updated {{ new Date(venue.updated_at).toLocaleDateString() }}
        </p>

      </template>

      <!-- Error state -->
      <div v-else class="flex flex-col items-center justify-center py-24 text-center">
        <span class="material-symbols-outlined text-5xl text-navy-300 mb-3">error_outline</span>
        <h2 class="text-base font-black text-navy-600 mb-1">Venue not found</h2>
        <p class="text-sm text-navy-400">The venue you're looking for doesn't exist or you don't have access.</p>
      </div>

    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { VenueDetail } from '~/api/types.gen'
import { useLocationVenue } from '~/composables/resources/locations/locationVenues'

definePageMeta({
  layout: false,
  middleware: ['auth', 'event-permission'],
  eventPermission: {
    category: 'GENERAL',
    action: 'read',
    deniedRedirect: '/403',
  },
})
const route = useRoute()
const venueId = computed(() => Number(route.params.venueId))

const { data: venueResponse, isLoading } = useLocationVenue(venueId)

const venue = computed<VenueDetail | null>(() => (venueResponse.value?.data as VenueDetail) ?? null)

interface VenueRoom { id: number; room_name: string; capacity?: number | null; description?: string }
interface VenueContact { id: number; contact_name: string; email?: string; phone_number?: string; role?: string; role_display?: string }
interface VenueMetaItem { id: number; label: string; value?: string }

const rooms = computed<VenueRoom[]>(() => (venue.value?.rooms as VenueRoom[]) ?? [])
const contacts = computed<VenueContact[]>(() => (venue.value?.contacts as VenueContact[]) ?? [])
const metadataList = computed<VenueMetaItem[]>(() => (venue.value?.metadata_list as VenueMetaItem[]) ?? [])
</script>