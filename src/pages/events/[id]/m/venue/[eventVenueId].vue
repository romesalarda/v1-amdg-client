<template>
  <EventManagementLayout :event-id="id" :event="event?.data">
    <div class="space-y-6">

      <!-- ── Header ──────────────────────────────────────────────────── -->
      <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
        <div class="p-6">
          <div class="flex items-start gap-4 flex-wrap">
            <NuxtLink
              :to="`/events/${id}/m/venue`"
              class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-deep-navy/15 text-xs font-semibold text-navy-600 hover:bg-mist-blue/60 shrink-0"
            >
              <span class="material-symbols-outlined text-sm">arrow_back</span>
              Back to Venues
            </NuxtLink>

            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap mb-1">
                <h1 class="text-xl font-black text-deep-navy">{{ eventVenue?.data?.name || 'Venue Details' }}</h1>
                <span v-if="poiType" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary">
                  <span class="material-symbols-outlined text-xs">Domain</span>
                  Location
                </span>
              </div>
              <div class="flex items-center gap-4 flex-wrap text-sm text-navy-500">
                <span v-if="eventVenue?.data?.address" class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-base text-navy-400">location_on</span>
                  {{ eventVenue.data.address }}
                </span>
                <span v-if="eventVenue?.data?.city" class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-base text-navy-400">public</span>
                  {{ eventVenue.data.city }}
                </span>
                <span v-if="eventVenue?.data?.postcode" class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-base text-navy-400">markunread_mailbox</span>
                  {{ eventVenue.data.postcode }}
                </span>
                <span v-if="venueTotalCapacity" class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-base text-navy-400">groups</span>
                  Capacity: {{ venueTotalCapacity }}
                </span>
              </div>
            </div>

            <a
              v-if="directionsUrl"
              :href="directionsUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 shrink-0"
            >
              <span class="material-symbols-outlined text-sm">directions</span>
              Get Directions
            </a>
          </div>
        </div>
      </section>

      <!-- ── Map + Venue Info ────────────────────────────────────────── -->
      <section class="grid grid-cols-1 lg:grid-cols-5 gap-6">

        <!-- Map -->
        <div class="lg:col-span-3 bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="px-5 py-4 border-b border-navy-50 flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">map</span>
              <h2 class="text-xs font-black text-primary uppercase tracking-widest">Location Map</h2>
            </div>
            <a
              v-if="directionsUrl"
              :href="directionsUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="text-xs text-primary font-semibold hover:underline flex items-center gap-0.5"
            >
              Open in Maps
              <span class="material-symbols-outlined text-xs">open_in_new</span>
            </a>
          </div>
          <div class="relative">
            <iframe
              v-if="mapSrc"
              :src="mapSrc"
              class="w-full h-72 lg:h-96 border-0"
              allowfullscreen
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              title="Venue location map"
            />
            <div v-else class="h-72 lg:h-96 flex flex-col items-center justify-center bg-mist-blue/30 text-navy-400 gap-2">
              <span class="material-symbols-outlined text-4xl text-navy-300">map</span>
              <p class="text-sm font-medium">No location data available</p>
              <p class="text-xs text-navy-300">Add an address or coordinates to see the map</p>
            </div>
          </div>
        </div>

        <!-- Venue Details -->
        <div class="lg:col-span-2 bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden flex flex-col">
          <div class="px-5 py-4 border-b border-navy-50 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">info</span>
            <h2 class="text-xs font-black text-primary uppercase tracking-widest">Venue Info</h2>
          </div>
          <div class="p-5 space-y-4 flex-1">
            <!-- Address block -->
            <div v-if="eventVenue?.data?.address" class="flex gap-3">
              <span class="material-symbols-outlined text-navy-400 text-lg shrink-0 mt-0.5">location_on</span>
              <div>
                <p class="text-xs font-black text-navy-400 uppercase tracking-wider mb-0.5">Address</p>
                <p class="text-sm text-navy-900">{{ eventVenue.data.address }}</p>
                <p v-if="eventVenue?.data?.city" class="text-xs text-navy-500">{{ eventVenue.data.city }}</p>
                <p v-if="eventVenue?.data?.postcode" class="text-xs text-navy-500">{{ eventVenue.data.postcode }}</p>
              </div>
            </div>

            <!-- Coordinates -->
            <div v-if="hasCoordinates" class="flex gap-3">
              <span class="material-symbols-outlined text-navy-400 text-lg shrink-0 mt-0.5">my_location</span>
              <div>
                <p class="text-xs font-black text-navy-400 uppercase tracking-wider mb-0.5">Coordinates</p>
                <p class="text-xs text-navy-600 font-mono">
                  {{ eventVenue?.data?.latitude }}, {{ eventVenue?.data?.longitude }}
                </p>
              </div>
            </div>

            <!-- Capacity -->
            <div v-if="venueTotalCapacity" class="flex gap-3">
              <span class="material-symbols-outlined text-navy-400 text-lg shrink-0 mt-0.5">groups</span>
              <div>
                <p class="text-xs font-black text-navy-400 uppercase tracking-wider mb-0.5">Total Capacity</p>
                <p class="text-sm text-navy-900">{{ venueTotalCapacity }} people</p>
              </div>
            </div>

            <!-- Description -->
            <div v-if="eventVenue?.data?.description" class="flex gap-3">
              <span class="material-symbols-outlined text-navy-400 text-lg shrink-0 mt-0.5">notes</span>
              <div>
                <p class="text-xs font-black text-navy-400 uppercase tracking-wider mb-0.5">Description</p>
                <p class="text-sm text-navy-700 leading-relaxed">{{ eventVenue.data.description }}</p>
              </div>
            </div>

            <!-- Instructions -->
            <div v-if="eventVenue?.data?.instructions" class="flex gap-3">
              <span class="material-symbols-outlined text-navy-400 text-lg shrink-0 mt-0.5">list_alt</span>
              <div>
                <p class="text-xs font-black text-navy-400 uppercase tracking-wider mb-0.5">Access Instructions</p>
                <p class="text-sm text-navy-700 leading-relaxed whitespace-pre-line">{{ eventVenue.data.instructions }}</p>
              </div>
            </div>

            <!-- Notes -->
            <div v-if="eventVenue?.data?.notes" class="flex gap-3">
              <span class="material-symbols-outlined text-navy-400 text-lg shrink-0 mt-0.5">sticky_note_2</span>
              <div>
                <p class="text-xs font-black text-navy-400 uppercase tracking-wider mb-0.5">Notes</p>
                <p class="text-sm text-navy-700 leading-relaxed whitespace-pre-line">{{ eventVenue.data.notes }}</p>
              </div>
            </div>

            <p v-if="!eventVenue?.data?.address && !eventVenue?.data?.description && !eventVenue?.data?.instructions && !eventVenue?.data?.notes" class="text-sm text-navy-400 italic">
              No additional venue details available.
            </p>
          </div>
        </div>
      </section>

      <!-- ── Management Cards ────────────────────────────────────────── -->
      <section class="grid grid-cols-1 xl:grid-cols-3 gap-6">

        <!-- Rooms -->
        <article class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="px-5 py-4 border-b border-navy-50 flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">meeting_room</span>
              <h2 class="text-xs font-black text-primary uppercase tracking-widest">Rooms</h2>
            </div>
            <span v-if="rooms.length" class="text-xs font-bold text-navy-400 bg-navy-50 rounded-full px-2 py-0.5">{{ rooms.length }}</span>
          </div>
          <div class="p-5 space-y-4">
            <!-- Add room form -->
            <details v-if="canUpdate" class="group">
              <summary class="flex items-center gap-2 cursor-pointer text-xs font-black text-primary uppercase tracking-widest list-none select-none">
                <span class="material-symbols-outlined text-base transition-transform group-open:rotate-45">add_circle</span>
                Add New Room
              </summary>
              <form class="mt-3 space-y-2 pl-1" @submit.prevent="createRoom">
                <input v-model="roomForm.room_name" required type="text" placeholder="Room name" class="input" />
                <input v-model="roomForm.capacity" min="0" type="number" placeholder="Capacity (optional)" class="input" />
                <textarea v-model="roomForm.description" rows="2" placeholder="Description (optional)" class="input resize-none" />
                <button class="btn-primary w-full">Add Room</button>
              </form>
            </details>

            <!-- Room list -->
            <div v-if="rooms.length" class="space-y-2">
              <div v-for="room in rooms" :key="room.id" class="rounded-xl border border-deep-navy/10 bg-mist-blue/20 p-3">
                <div v-if="editingRoomId === room.id" class="space-y-2">
                  <input v-model="roomEdit.room_name" type="text" class="input" />
                  <input v-model="roomEdit.capacity" min="0" type="number" class="input" />
                  <textarea v-model="roomEdit.description" rows="2" class="input resize-none" />
                  <div class="flex gap-2">
                    <button type="button" class="btn-primary flex-1" @click="saveRoom(room.id)">Save</button>
                    <button type="button" class="btn-secondary flex-1" @click="editingRoomId = null">Cancel</button>
                  </div>
                </div>
                <div v-else class="flex items-start justify-between gap-2">
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2 flex-wrap">
                      <p class="text-sm font-semibold text-navy-900">{{ room.room_name }}</p>
                      <span v-if="room.capacity" class="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                        {{ room.capacity }} cap
                      </span>
                    </div>
                    <p v-if="room.description" class="text-xs text-navy-500 mt-0.5 leading-snug">{{ room.description }}</p>
                  </div>
                  <div class="flex items-center gap-1 shrink-0">
                    <button type="button" :disabled="!canUpdate" class="icon-btn" @click="startRoomEdit(room)">
                      <span class="material-symbols-outlined text-base">edit</span>
                    </button>
                    <button type="button" :disabled="!canDelete" class="icon-btn text-red-500" @click="removeRoom(room.id)">
                      <span class="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="flex flex-col items-center justify-center py-6 text-center text-navy-400">
              <span class="material-symbols-outlined text-3xl mb-1 text-navy-300">meeting_room</span>
              <p class="text-sm font-medium">No rooms defined yet</p>
              <p class="text-xs text-navy-300">Use the form above to add rooms</p>
            </div>
          </div>
        </article>

        <!-- Contacts -->
        <article class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="px-5 py-4 border-b border-navy-50 flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">contact_phone</span>
              <h2 class="text-xs font-black text-primary uppercase tracking-widest">Contacts</h2>
            </div>
            <span v-if="contacts.length" class="text-xs font-bold text-navy-400 bg-navy-50 rounded-full px-2 py-0.5">{{ contacts.length }}</span>
          </div>
          <div class="p-5 space-y-4">
            <!-- Add contact form -->
            <details v-if="canUpdate" class="group">
              <summary class="flex items-center gap-2 cursor-pointer text-xs font-black text-primary uppercase tracking-widest list-none select-none">
                <span class="material-symbols-outlined text-base transition-transform group-open:rotate-45">add_circle</span>
                Add New Contact
              </summary>
              <form class="mt-3 space-y-2 pl-1" @submit.prevent="createContact">
                <input v-model="contactForm.contact_name" required type="text" placeholder="Full name" class="input" />
                <input v-model="contactForm.phone_number" type="text" placeholder="Phone number" class="input" />
                <input v-model="contactForm.email" type="email" placeholder="Email address" class="input" />
                <select v-model="contactForm.role" class="input">
                  <option value="OWNER">Owner</option>
                  <option value="MANAGER">Manager</option>
                  <option value="COORDINATOR">Coordinator</option>
                  <option value="SUPPORT">Support</option>
                  <option value="OTHER">Other</option>
                </select>
                <button class="btn-primary w-full">Add Contact</button>
              </form>
            </details>

            <!-- Contact list -->
            <div v-if="contacts.length" class="space-y-2">
              <div v-for="contact in contacts" :key="contact.id" class="rounded-xl border border-deep-navy/10 bg-mist-blue/20 p-3">
                <div v-if="editingContactId === contact.id" class="space-y-2">
                  <input v-model="contactEdit.contact_name" type="text" class="input" />
                  <input v-model="contactEdit.phone_number" type="text" class="input" />
                  <input v-model="contactEdit.email" type="email" class="input" />
                  <select v-model="contactEdit.role" class="input">
                    <option value="OWNER">Owner</option>
                    <option value="MANAGER">Manager</option>
                    <option value="COORDINATOR">Coordinator</option>
                    <option value="SUPPORT">Support</option>
                    <option value="OTHER">Other</option>
                  </select>
                  <div class="flex gap-2">
                    <button type="button" class="btn-primary flex-1" @click="saveContact(contact.id)">Save</button>
                    <button type="button" class="btn-secondary flex-1" @click="editingContactId = null">Cancel</button>
                  </div>
                </div>
                <div v-else class="flex items-start justify-between gap-2">
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2 flex-wrap mb-1">
                      <p class="text-sm font-semibold text-navy-900">{{ contact.contact_name }}</p>
                      <span :class="roleClass(contact.role)" class="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full">
                        {{ contact.role || 'OWNER' }}
                      </span>
                    </div>
                    <a
                      v-if="contact.phone_number"
                      :href="`tel:${contact.phone_number}`"
                      class="flex items-center gap-1 text-xs text-navy-500 hover:text-primary"
                    >
                      <span class="material-symbols-outlined text-sm">call</span>
                      {{ contact.phone_number }}
                    </a>
                    <a
                      v-if="contact.email"
                      :href="`mailto:${contact.email}`"
                      class="flex items-center gap-1 text-xs text-navy-500 hover:text-primary"
                    >
                      <span class="material-symbols-outlined text-sm">mail</span>
                      {{ contact.email }}
                    </a>
                  </div>
                  <div class="flex items-center gap-1 shrink-0">
                    <button type="button" :disabled="!canUpdate" class="icon-btn" @click="startContactEdit(contact)">
                      <span class="material-symbols-outlined text-base">edit</span>
                    </button>
                    <button type="button" :disabled="!canDelete" class="icon-btn text-red-500" @click="removeContact(contact.id)">
                      <span class="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="flex flex-col items-center justify-center py-6 text-center text-navy-400">
              <span class="material-symbols-outlined text-3xl mb-1 text-navy-300">contact_phone</span>
              <p class="text-sm font-medium">No contacts added yet</p>
              <p class="text-xs text-navy-300">Use the form above to add contacts</p>
            </div>
          </div>
        </article>

        <!-- Metadata -->
        <article class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="px-5 py-4 border-b border-navy-50 flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">label</span>
              <h2 class="text-xs font-black text-primary uppercase tracking-widest">Metadata</h2>
            </div>
            <span v-if="metadataItems.length" class="text-xs font-bold text-navy-400 bg-navy-50 rounded-full px-2 py-0.5">{{ metadataItems.length }}</span>
          </div>
          <div class="p-5 space-y-4">
            <!-- Add metadata form -->
            <details v-if="canUpdate" class="group">
              <summary class="flex items-center gap-2 cursor-pointer text-xs font-black text-primary uppercase tracking-widest list-none select-none">
                <span class="material-symbols-outlined text-base transition-transform group-open:rotate-45">add_circle</span>
                Add New Entry
              </summary>
              <form class="mt-3 space-y-2 pl-1" @submit.prevent="createMetadata">
                <input v-model="metadataForm.label" required type="text" placeholder="Label (e.g. WiFi Password)" class="input" />
                <textarea v-model="metadataForm.value" rows="2" placeholder="Value" class="input resize-none" />
                <button class="btn-primary w-full">Add Entry</button>
              </form>
            </details>

            <!-- Metadata list -->
            <div v-if="metadataItems.length" class="space-y-2">
              <div v-for="item in metadataItems" :key="item.id" class="rounded-xl border border-deep-navy/10 overflow-hidden">
                <div v-if="editingMetadataId === item.id" class="p-3 space-y-2 bg-mist-blue/20">
                  <input v-model="metadataEdit.label" type="text" class="input" />
                  <textarea v-model="metadataEdit.value" rows="2" class="input resize-none" />
                  <div class="flex gap-2">
                    <button type="button" class="btn-primary flex-1" @click="saveMetadata(item.id)">Save</button>
                    <button type="button" class="btn-secondary flex-1" @click="editingMetadataId = null">Cancel</button>
                  </div>
                </div>
                <div v-else class="flex items-stretch">
                  <div class="bg-mist-blue/40 px-3 py-2.5 flex items-start justify-center min-w-[2.5rem]">
                    <span class="material-symbols-outlined text-sm text-navy-400">label</span>
                  </div>
                  <div class="flex-1 px-3 py-2 min-w-0">
                    <p class="text-[10px] font-black text-navy-400 uppercase tracking-wider">{{ item.label }}</p>
                    <p class="text-sm text-navy-800 mt-0.5 break-words">{{ item.value || '—' }}</p>
                  </div>
                  <div class="flex items-center gap-0.5 px-2">
                    <button type="button" :disabled="!canUpdate" class="icon-btn" @click="startMetadataEdit(item)">
                      <span class="material-symbols-outlined text-base">edit</span>
                    </button>
                    <button type="button" :disabled="!canDelete" class="icon-btn text-red-500" @click="removeMetadata(item.id)">
                      <span class="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="flex flex-col items-center justify-center py-6 text-center text-navy-400">
              <span class="material-symbols-outlined text-3xl mb-1 text-navy-300">label</span>
              <p class="text-sm font-medium">No metadata entries yet</p>
              <p class="text-xs text-navy-300">Store extra info like WiFi passwords, parking notes, etc.</p>
            </div>
          </div>
        </article>
      </section>
    </div>
  </EventManagementLayout>
</template>

<script setup lang="ts">
import EventManagementLayout from '~/components/events/EventManagementLayout.vue'
import { useCurrentUserEventPermissions } from '~/composables/permissions'
import { useEvent } from '~/composables/resources/events/events'
import { useEventVenue } from '~/composables/resources/events/eventVenues'
import { extractResults } from '~/composables/resources/events/eventVenueManagement'
import {
  useCreateEventVenueRoom,
  useDeleteEventVenueRoom,
  useEventVenueRooms,
  useUpdateEventVenueRoom,
} from '~/composables/resources/events/eventVenueRooms'
import {
  useCreateEventVenueContact,
  useDeleteEventVenueContact,
  useEventVenueContacts,
  useUpdateEventVenueContact,
} from '~/composables/resources/events/eventVenueContacts'
import {
  useCreateEventVenueMetadata,
  useDeleteEventVenueMetadata,
  useEventVenueMetadata,
  useUpdateEventVenueMetadata,
} from '~/composables/resources/events/eventVenueMetadata'

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
const eventVenueId = computed(() => String(route.params.eventVenueId))

const { can } = useCurrentUserEventPermissions(id)
const canUpdate = computed(() => can('REGISTRATION', 'update').value.allowed)
const canDelete = computed(() => can('REGISTRATION', 'delete').value.allowed)

// ── Map & venue display helpers ────────────────────────────────────────────
const poiType = computed(() => eventVenue.value?.data?.poi_type as string | undefined)
const venueTotalCapacity = computed(() => eventVenue.value?.data?.capacity as number | undefined)
const hasCoordinates = computed(() => {
  const lat = eventVenue.value?.data?.latitude
  const lon = eventVenue.value?.data?.longitude
  return lat != null && lon != null
})

const mapSrc = computed(() => {
  const data = eventVenue.value?.data
  const lat = data?.latitude
  const lon = data?.longitude
  const addr = data?.address
  if (lat != null && lon != null) {
    return `https://maps.google.com/maps?q=${lat},${lon}&output=embed&iwloc=&z=15`
  }
  if (addr) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(addr)}&output=embed&iwloc=&z=15`
  }
  return null
})

const directionsUrl = computed(() => {
  const data = eventVenue.value?.data
  const lat = data?.latitude
  const lon = data?.longitude
  const addr = data?.address
  if (lat != null && lon != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`
  }
  if (addr) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addr)}`
  }
  return null
})

const ROLE_CLASSES: Record<string, string> = {
  OWNER: 'bg-purple-100 text-purple-700',
  MANAGER: 'bg-blue-100 text-blue-700',
  COORDINATOR: 'bg-teal-100 text-teal-700',
  SUPPORT: 'bg-amber-100 text-amber-700',
  OTHER: 'bg-navy-100 text-navy-600',
}
const roleClass = (role: string) => ROLE_CLASSES[role] || ROLE_CLASSES.OTHER

const { data: event } = useEvent(id)
const { data: eventVenue } = useEventVenue(eventVenueId)

const roomQuery = computed(() => ({ event_venue: eventVenueId.value, page_size: 100 }))
const contactQuery = computed(() => ({ event_venue: eventVenueId.value, page_size: 100 }))
const metadataQuery = computed(() => ({ event_venue: eventVenueId.value, page_size: 100 }))

const { data: roomsResponse } = useEventVenueRooms(roomQuery)
const { data: contactsResponse } = useEventVenueContacts(contactQuery)
const { data: metadataResponse } = useEventVenueMetadata(metadataQuery)

const rooms = computed(() => extractResults<any>(roomsResponse.value))
const contacts = computed(() => extractResults<any>(contactsResponse.value))
const metadataItems = computed(() => extractResults<any>(metadataResponse.value))

const roomForm = reactive({ room_name: '', description: '', capacity: '' as string | number })
const contactForm = reactive({
  contact_name: '',
  phone_number: '',
  email: '',
  role: 'OWNER' as '' | 'COORDINATOR' | 'MANAGER' | 'OTHER' | 'OWNER' | 'SUPPORT',
})
const metadataForm = reactive({ label: '', value: '' })

const editingRoomId = ref<number | null>(null)
const editingContactId = ref<number | null>(null)
const editingMetadataId = ref<number | null>(null)

const roomEdit = reactive({ room_name: '', description: '', capacity: '' as string | number | null })
const contactEdit = reactive({
  contact_name: '',
  phone_number: '',
  email: '',
  role: 'OWNER' as '' | 'COORDINATOR' | 'MANAGER' | 'OTHER' | 'OWNER' | 'SUPPORT',
})
const metadataEdit = reactive({ label: '', value: '' })

const createRoomMutation = useCreateEventVenueRoom()
const updateRoomMutation = useUpdateEventVenueRoom()
const deleteRoomMutation = useDeleteEventVenueRoom()

const createContactMutation = useCreateEventVenueContact()
const updateContactMutation = useUpdateEventVenueContact()
const deleteContactMutation = useDeleteEventVenueContact()

const createMetadataMutation = useCreateEventVenueMetadata()
const updateMetadataMutation = useUpdateEventVenueMetadata()
const deleteMetadataMutation = useDeleteEventVenueMetadata()

const createRoom = async () => {
  if (!canUpdate.value)
    return

  await createRoomMutation.mutateAsync({
    event_venue: eventVenueId.value,
    room_name: roomForm.room_name.trim(),
    description: roomForm.description.trim() || null,
    capacity: roomForm.capacity === '' ? null : Number(roomForm.capacity),
  })

  roomForm.room_name = ''
  roomForm.description = ''
  roomForm.capacity = ''
  toast.add({ title: 'Room added', color: 'green' })
}

const startRoomEdit = (room: any) => {
  editingRoomId.value = room.id
  roomEdit.room_name = room.room_name || ''
  roomEdit.description = room.description || ''
  roomEdit.capacity = room.capacity ?? ''
}

const saveRoom = async (roomId: number) => {
  if (!canUpdate.value)
    return

  await updateRoomMutation.mutateAsync({
    roomId,
    body: {
      event_venue: eventVenueId.value,
      room_name: roomEdit.room_name.trim(),
      description: String(roomEdit.description || '').trim() || null,
      capacity: roomEdit.capacity === '' ? null : Number(roomEdit.capacity),
    },
  })

  editingRoomId.value = null
  toast.add({ title: 'Room updated', color: 'green' })
}

const removeRoom = async (roomId: number) => {
  if (!canDelete.value)
    return

  if (!window.confirm('Delete this room?'))
    return

  await deleteRoomMutation.mutateAsync(roomId)
  toast.add({ title: 'Room deleted', color: 'green' })
}

const createContact = async () => {
  if (!canUpdate.value)
    return

  if (!contactForm.phone_number.trim() && !contactForm.email.trim()) {
    toast.add({
      title: 'Missing contact method',
      description: 'Provide at least phone or email.',
      color: 'red',
    })
    return
  }

  await createContactMutation.mutateAsync({
    event_venue: eventVenueId.value,
    contact_name: contactForm.contact_name.trim(),
    phone_number: contactForm.phone_number.trim() || null,
    email: contactForm.email.trim() || null,
    role: contactForm.role,
  })

  contactForm.contact_name = ''
  contactForm.phone_number = ''
  contactForm.email = ''
  contactForm.role = 'OWNER'
  toast.add({ title: 'Contact added', color: 'green' })
}

const startContactEdit = (contact: any) => {
  editingContactId.value = contact.id
  contactEdit.contact_name = contact.contact_name || ''
  contactEdit.phone_number = contact.phone_number || ''
  contactEdit.email = contact.email || ''
  contactEdit.role = contact.role || 'OWNER'
}

const saveContact = async (contactId: number) => {
  if (!canUpdate.value)
    return

  if (!contactEdit.phone_number.trim() && !contactEdit.email.trim()) {
    toast.add({
      title: 'Missing contact method',
      description: 'Provide at least phone or email.',
      color: 'red',
    })
    return
  }

  await updateContactMutation.mutateAsync({
    contactId,
    body: {
      event_venue: eventVenueId.value,
      contact_name: contactEdit.contact_name.trim(),
      phone_number: contactEdit.phone_number.trim() || null,
      email: contactEdit.email.trim() || null,
      role: contactEdit.role,
    },
  })

  editingContactId.value = null
  toast.add({ title: 'Contact updated', color: 'green' })
}

const removeContact = async (contactId: number) => {
  if (!canDelete.value)
    return

  if (!window.confirm('Delete this contact?'))
    return

  await deleteContactMutation.mutateAsync(contactId)
  toast.add({ title: 'Contact deleted', color: 'green' })
}

const createMetadata = async () => {
  if (!canUpdate.value)
    return

  await createMetadataMutation.mutateAsync({
    event_venue: eventVenueId.value,
    label: metadataForm.label.trim(),
    value: metadataForm.value.trim() || null,
  })

  metadataForm.label = ''
  metadataForm.value = ''
  toast.add({ title: 'Metadata added', color: 'green' })
}

const startMetadataEdit = (item: any) => {
  editingMetadataId.value = item.id
  metadataEdit.label = item.label || ''
  metadataEdit.value = item.value || ''
}

const saveMetadata = async (metadataId: number) => {
  if (!canUpdate.value)
    return

  await updateMetadataMutation.mutateAsync({
    metadataId,
    body: {
      event_venue: eventVenueId.value,
      label: metadataEdit.label.trim(),
      value: metadataEdit.value.trim() || null,
    },
  })

  editingMetadataId.value = null
  toast.add({ title: 'Metadata updated', color: 'green' })
}

const removeMetadata = async (metadataId: number) => {
  if (!canDelete.value)
    return

  if (!window.confirm('Delete this metadata entry?'))
    return

  await deleteMetadataMutation.mutateAsync(metadataId)
  toast.add({ title: 'Metadata deleted', color: 'green' })
}
</script>

<style scoped>
.input {
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid rgb(27 45 89 / 0.18);
  background: white;
  padding: 0.55rem 0.8rem;
  font-size: 0.875rem;
  color: #1f2937;
  outline: none;
}

.input:focus {
  border-color: rgb(35 117 202);
  box-shadow: 0 0 0 2px rgb(35 117 202 / 0.2);
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  background: rgb(35 117 202);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.45rem 0.8rem;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  border: 1px solid rgb(27 45 89 / 0.2);
  color: #374151;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.45rem 0.8rem;
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.9rem;
  height: 1.9rem;
  border-radius: 0.5rem;
  color: #334155;
  background: transparent;
}

.icon-btn:hover {
  background: rgb(240 247 255);
}

</style>
