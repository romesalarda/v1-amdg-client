<template>
  <EventManagementLayout :event-id="id" :event="event?.data">
    <div class="space-y-8">

      <!-- ── Header ──────────────────────────────────────────────────── -->
      <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
        <div class="p-8">
          <div class="flex items-start gap-5 flex-wrap">
            <NuxtLink
              :to="`/events/${id}/m/venue`"
              class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-deep-navy/15 text-sm font-semibold text-navy-600 transition-all duration-150 hover:bg-mist-blue/60 hover:-translate-x-0.5 shrink-0"
            >
              <span class="material-symbols-outlined text-base">arrow_back</span>
              Venues
            </NuxtLink>

            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2.5 flex-wrap mb-1.5">
                <h1 class="text-2xl font-bold text-deep-navy tracking-tight">{{ eventVenue?.data?.name || 'Venue Details' }}</h1>
                <span v-if="poiType" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                  <span class="material-symbols-outlined text-sm">domain</span>
                  Location
                </span>
              </div>
              <div class="flex items-center gap-5 flex-wrap text-sm text-navy-500">
                <span v-if="eventVenue?.data?.address" class="flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-base text-navy-400">location_on</span>
                  {{ eventVenue.data.address }}
                </span>
                <span v-if="eventVenue?.data?.city" class="flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-base text-navy-400">public</span>
                  {{ eventVenue.data.city }}
                </span>
                <span v-if="eventVenue?.data?.postcode" class="flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-base text-navy-400">markunread_mailbox</span>
                  {{ eventVenue.data.postcode }}
                </span>
                <span v-if="venueTotalCapacity" class="flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-base text-navy-400">groups</span>
                  Capacity {{ venueTotalCapacity }}
                </span>
              </div>
            </div>

            <a
              v-if="directionsUrl"
              :href="directionsUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-sm transition-all duration-150 hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98] shrink-0"
            >
              <span class="material-symbols-outlined text-base">directions</span>
              Get Directions
            </a>
          </div>
        </div>
      </section>

      <!-- ── Map + Venue Info ────────────────────────────────────────── -->
      <section class="grid grid-cols-1 lg:grid-cols-5 gap-6">

        <!-- Map -->
        <div class="lg:col-span-3 bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="px-6 py-5 border-b border-navy-50 flex items-center justify-between gap-2">
            <div class="flex items-center gap-2.5">
              <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-mist-blue/60 text-navy-500">
                <span class="material-symbols-outlined text-lg">map</span>
              </span>
              <h2 class="text-base font-semibold text-deep-navy">Location</h2>
            </div>
            <a
              v-if="directionsUrl"
              :href="directionsUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm text-blue-600 font-medium transition-colors hover:text-blue-700 flex items-center gap-1"
            >
              Open in Maps
              <span class="material-symbols-outlined text-sm">open_in_new</span>
            </a>
          </div>
          <div class="relative">
            <iframe
              v-if="mapSrc"
              :src="mapSrc"
              class="w-full h-80 lg:h-[26rem] border-0"
              allowfullscreen
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              title="Venue location map"
            />
            <div v-else class="h-80 lg:h-[26rem] flex flex-col items-center justify-center bg-mist-blue/20 text-navy-400 gap-2.5">
              <span class="material-symbols-outlined text-5xl text-navy-300">map</span>
              <p class="text-sm font-medium">No location data available</p>
              <p class="text-xs text-navy-300">Add an address or coordinates to see the map</p>
            </div>
          </div>
        </div>

        <!-- Venue Details -->
        <div class="lg:col-span-2 bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden flex flex-col">
          <div class="px-6 py-5 border-b border-navy-50 flex items-center gap-2.5">
            <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-mist-blue/60 text-navy-500">
              <span class="material-symbols-outlined text-lg">info</span>
            </span>
            <h2 class="text-base font-semibold text-deep-navy">Venue info</h2>
          </div>
          <div class="p-6 space-y-5 flex-1">
            <!-- Address block -->
            <div v-if="eventVenue?.data?.address" class="flex gap-3.5">
              <span class="material-symbols-outlined text-navy-400 text-xl shrink-0 mt-0.5">location_on</span>
              <div>
                <p class="text-xs font-semibold text-navy-400 mb-1">Address</p>
                <p class="text-sm text-navy-900 leading-relaxed">{{ eventVenue.data.address }}</p>
                <p v-if="eventVenue?.data?.city" class="text-xs text-navy-500 mt-0.5">{{ eventVenue.data.city }}</p>
                <p v-if="eventVenue?.data?.postcode" class="text-xs text-navy-500">{{ eventVenue.data.postcode }}</p>
              </div>
            </div>

            <!-- Coordinates -->
            <div v-if="hasCoordinates" class="flex gap-3.5">
              <span class="material-symbols-outlined text-navy-400 text-xl shrink-0 mt-0.5">my_location</span>
              <div>
                <p class="text-xs font-semibold text-navy-400 mb-1">Coordinates</p>
                <p class="text-xs text-navy-600 font-mono">
                  {{ eventVenue?.data?.latitude }}, {{ eventVenue?.data?.longitude }}
                </p>
              </div>
            </div>

            <!-- Capacity -->
            <div v-if="venueTotalCapacity" class="flex gap-3.5">
              <span class="material-symbols-outlined text-navy-400 text-xl shrink-0 mt-0.5">groups</span>
              <div>
                <p class="text-xs font-semibold text-navy-400 mb-1">Total capacity</p>
                <p class="text-sm text-navy-900">{{ venueTotalCapacity }} people</p>
              </div>
            </div>

            <!-- Description -->
            <div v-if="eventVenue?.data?.description" class="flex gap-3.5">
              <span class="material-symbols-outlined text-navy-400 text-xl shrink-0 mt-0.5">notes</span>
              <div>
                <p class="text-xs font-semibold text-navy-400 mb-1">Description</p>
                <p class="text-sm text-navy-700 leading-relaxed">{{ eventVenue.data.description }}</p>
              </div>
            </div>

            <!-- Instructions -->
            <div v-if="eventVenue?.data?.instructions" class="flex gap-3.5">
              <span class="material-symbols-outlined text-navy-400 text-xl shrink-0 mt-0.5">list_alt</span>
              <div>
                <p class="text-xs font-semibold text-navy-400 mb-1">Access instructions</p>
                <p class="text-sm text-navy-700 leading-relaxed whitespace-pre-line">{{ eventVenue.data.instructions }}</p>
              </div>
            </div>

            <!-- Notes -->
            <div v-if="eventVenue?.data?.notes" class="flex gap-3.5">
              <span class="material-symbols-outlined text-navy-400 text-xl shrink-0 mt-0.5">sticky_note_2</span>
              <div>
                <p class="text-xs font-semibold text-navy-400 mb-1">Notes</p>
                <p class="text-sm text-navy-700 leading-relaxed whitespace-pre-line">{{ eventVenue.data.notes }}</p>
              </div>
            </div>

            <p v-if="!eventVenue?.data?.address && !eventVenue?.data?.description && !eventVenue?.data?.instructions && !eventVenue?.data?.notes" class="text-sm text-navy-400 italic">
              No additional venue details available.
            </p>
          </div>
        </div>
      </section>

      <!-- ── Rooms ───────────────────────────────────────────────────── -->
      <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
        <div class="px-6 py-5 border-b border-navy-50 flex items-center justify-between gap-2">
          <div class="flex items-center gap-2.5">
            <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-mist-blue/60 text-navy-500">
              <span class="material-symbols-outlined text-lg">meeting_room</span>
            </span>
            <h2 class="text-base font-semibold text-deep-navy">Rooms</h2>
            <span v-if="rooms.length" class="text-xs font-semibold text-navy-400 bg-navy-50 rounded-full px-2.5 py-1">{{ rooms.length }}</span>
          </div>
          <button
            v-if="canUpdate"
            type="button"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-[0.97]"
            :class="showRoomForm ? 'bg-navy-100 text-navy-600' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'"
            @click="showRoomForm = !showRoomForm"
          >
            <span class="material-symbols-outlined text-base transition-transform duration-200" :class="showRoomForm ? 'rotate-45' : ''">add</span>
            {{ showRoomForm ? 'Close' : 'Add room' }}
          </button>
        </div>

        <!-- Add room form -->
        <div class="grid transition-[grid-template-rows] duration-300 ease-out" :style="{ gridTemplateRows: showRoomForm ? '1fr' : '0fr' }">
          <div class="overflow-hidden">
            <form class="px-6 pt-5 pb-6 border-b border-navy-50 bg-mist-blue/10 grid grid-cols-1 sm:grid-cols-3 gap-3" @submit.prevent="createRoom">
              <input v-model="roomForm.room_name" required type="text" placeholder="Room name" class="input" />
              <input v-model="roomForm.capacity" min="0" type="number" placeholder="Capacity (optional)" class="input" />
              <textarea v-model="roomForm.description" rows="1" placeholder="Description (optional)" class="input resize-none sm:col-span-3" />
              <button class="btn-primary sm:col-span-3 sm:w-fit sm:px-6">Add room</button>
            </form>
          </div>
        </div>

        <div class="p-6">
          <div v-if="rooms.length" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <div
              v-for="room in rooms"
              :key="room.id"
              class="group rounded-xl border border-deep-navy/10 bg-white p-4 transition-all duration-200 hover:border-blue-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <div v-if="editingRoomId === room.id" class="space-y-2">
                <input v-model="roomEdit.room_name" type="text" class="input" />
                <input v-model="roomEdit.capacity" min="0" type="number" class="input" />
                <textarea v-model="roomEdit.description" rows="2" class="input resize-none" />
                <div class="flex gap-2">
                  <button type="button" class="btn-primary flex-1" @click="saveRoom(room.id)">Save</button>
                  <button type="button" class="btn-secondary flex-1" @click="editingRoomId = null">Cancel</button>
                </div>
              </div>
              <div v-else>
                <div class="flex items-start justify-between gap-2">
                  <div class="flex items-center gap-2.5 min-w-0">
                    <span class="flex items-center justify-center w-9 h-9 rounded-lg bg-mist-blue/50 text-navy-500 shrink-0">
                      <span class="material-symbols-outlined text-lg">door_front</span>
                    </span>
                    <p class="text-sm font-semibold text-navy-900 truncate">{{ room.room_name }}</p>
                  </div>
                  <div class="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <button type="button" :disabled="!canUpdate" class="icon-btn" @click="startRoomEdit(room)">
                      <span class="material-symbols-outlined text-base">edit</span>
                    </button>
                    <button type="button" :disabled="!canDelete" class="icon-btn text-red-500" @click="removeRoom(room.id)">
                      <span class="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>
                <p v-if="room.description" class="text-xs text-navy-500 mt-2 leading-relaxed">{{ room.description }}</p>
                <span v-if="room.capacity" class="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 rounded-full px-2.5 py-1 mt-3">
                  <span class="material-symbols-outlined text-sm">groups</span>
                  {{ room.capacity }} capacity
                </span>
              </div>
            </div>
          </div>
          <div v-else class="flex flex-col items-center justify-center py-10 text-center text-navy-400">
            <span class="material-symbols-outlined text-4xl mb-2 text-navy-300">meeting_room</span>
            <p class="text-sm font-medium">No rooms defined yet</p>
            <p class="text-xs text-navy-300 mt-0.5">Add rooms to break this venue down for registration and floor planning</p>
          </div>
        </div>
      </section>

      <!-- ── Contacts + Metadata ─────────────────────────────────────── -->
      <section class="grid grid-cols-1 xl:grid-cols-2 gap-6">

        <!-- Contacts -->
        <article class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="px-6 py-5 border-b border-navy-50 flex items-center justify-between gap-2">
            <div class="flex items-center gap-2.5">
              <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-mist-blue/60 text-navy-500">
                <span class="material-symbols-outlined text-lg">contact_phone</span>
              </span>
              <h2 class="text-base font-semibold text-deep-navy">Contacts</h2>
              <span v-if="contacts.length" class="text-xs font-semibold text-navy-400 bg-navy-50 rounded-full px-2.5 py-1">{{ contacts.length }}</span>
            </div>
            <button
              v-if="canUpdate"
              type="button"
              class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-[0.97]"
              :class="showContactForm ? 'bg-navy-100 text-navy-600' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'"
              @click="showContactForm = !showContactForm"
            >
              <span class="material-symbols-outlined text-base transition-transform duration-200" :class="showContactForm ? 'rotate-45' : ''">add</span>
              {{ showContactForm ? 'Close' : 'Add' }}
            </button>
          </div>

          <div class="grid transition-[grid-template-rows] duration-300 ease-out" :style="{ gridTemplateRows: showContactForm ? '1fr' : '0fr' }">
            <div class="overflow-hidden">
              <form class="px-6 pt-5 pb-6 border-b border-navy-50 bg-mist-blue/10 space-y-2.5" @submit.prevent="createContact">
                <input v-model="contactForm.contact_name" required type="text" placeholder="Full name" class="input" />
                <div class="grid grid-cols-2 gap-2.5">
                  <input v-model="contactForm.phone_number" type="text" placeholder="Phone number" class="input" />
                  <input v-model="contactForm.email" type="email" placeholder="Email address" class="input" />
                </div>
                <select v-model="contactForm.role" class="input">
                  <option value="OWNER">Owner</option>
                  <option value="MANAGER">Manager</option>
                  <option value="COORDINATOR">Coordinator</option>
                  <option value="SUPPORT">Support</option>
                  <option value="OTHER">Other</option>
                </select>
                <button class="btn-primary w-fit px-6">Add contact</button>
              </form>
            </div>
          </div>

          <div class="p-6 space-y-3">
            <div v-if="contacts.length" class="space-y-3">
              <div
                v-for="contact in contacts"
                :key="contact.id"
                class="group rounded-xl border border-deep-navy/10 p-3.5 transition-all duration-200 hover:border-blue-200 hover:shadow-sm"
              >
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
                  <div class="flex items-start gap-3 min-w-0">
                    <span class="flex items-center justify-center w-9 h-9 rounded-full bg-mist-blue/60 text-navy-600 text-xs font-bold shrink-0 mt-0.5">
                      {{ initials(contact.contact_name) }}
                    </span>
                    <div class="min-w-0">
                      <div class="flex items-center gap-2 flex-wrap mb-1">
                        <p class="text-sm font-semibold text-navy-900 truncate">{{ contact.contact_name }}</p>
                        <span :class="roleClass(contact.role)" class="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full">
                          {{ contact.role || 'OWNER' }}
                        </span>
                      </div>
                      <a
                        v-if="contact.phone_number"
                        :href="`tel:${contact.phone_number}`"
                        class="flex items-center gap-1.5 text-xs text-navy-500 transition-colors hover:text-blue-600"
                      >
                        <span class="material-symbols-outlined text-sm">call</span>
                        {{ contact.phone_number }}
                      </a>
                      <a
                        v-if="contact.email"
                        :href="`mailto:${contact.email}`"
                        class="flex items-center gap-1.5 text-xs text-navy-500 transition-colors hover:text-blue-600"
                      >
                        <span class="material-symbols-outlined text-sm">mail</span>
                        {{ contact.email }}
                      </a>
                    </div>
                  </div>
                  <div class="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
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
            <div v-else class="flex flex-col items-center justify-center py-8 text-center text-navy-400">
              <span class="material-symbols-outlined text-3xl mb-1.5 text-navy-300">contact_phone</span>
              <p class="text-sm font-medium">No contacts added yet</p>
              <p class="text-xs text-navy-300 mt-0.5">Add a venue owner or on-site manager</p>
            </div>
          </div>
        </article>

        <!-- Metadata -->
        <article class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="px-6 py-5 border-b border-navy-50 flex items-center justify-between gap-2">
            <div class="flex items-center gap-2.5">
              <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-mist-blue/60 text-navy-500">
                <span class="material-symbols-outlined text-lg">label</span>
              </span>
              <h2 class="text-base font-semibold text-deep-navy">Other details</h2>
              <span v-if="metadataItems.length" class="text-xs font-semibold text-navy-400 bg-navy-50 rounded-full px-2.5 py-1">{{ metadataItems.length }}</span>
            </div>
            <button
              v-if="canUpdate"
              type="button"
              class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-[0.97]"
              :class="showMetadataForm ? 'bg-navy-100 text-navy-600' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'"
              @click="showMetadataForm = !showMetadataForm"
            >
              <span class="material-symbols-outlined text-base transition-transform duration-200" :class="showMetadataForm ? 'rotate-45' : ''">add</span>
              {{ showMetadataForm ? 'Close' : 'Add' }}
            </button>
          </div>

          <div class="grid transition-[grid-template-rows] duration-300 ease-out" :style="{ gridTemplateRows: showMetadataForm ? '1fr' : '0fr' }">
            <div class="overflow-hidden">
              <form class="px-6 pt-5 pb-6 border-b border-navy-50 bg-mist-blue/10 space-y-2.5" @submit.prevent="createMetadata">
                <input v-model="metadataForm.label" required type="text" placeholder="Label (e.g. WiFi password)" class="input" />
                <textarea v-model="metadataForm.value" rows="1" placeholder="Value" class="input resize-none" />
                <button class="btn-primary w-fit px-6">Add entry</button>
              </form>
            </div>
          </div>

          <div class="p-6 space-y-2.5">
            <div v-if="metadataItems.length" class="space-y-2.5">
              <div
                v-for="item in metadataItems"
                :key="item.id"
                class="group rounded-xl border border-deep-navy/10 overflow-hidden transition-all duration-200 hover:border-blue-200 hover:shadow-sm"
              >
                <div v-if="editingMetadataId === item.id" class="p-3.5 space-y-2 bg-mist-blue/10">
                  <input v-model="metadataEdit.label" type="text" class="input" />
                  <textarea v-model="metadataEdit.value" rows="2" class="input resize-none" />
                  <div class="flex gap-2">
                    <button type="button" class="btn-primary flex-1" @click="saveMetadata(item.id)">Save</button>
                    <button type="button" class="btn-secondary flex-1" @click="editingMetadataId = null">Cancel</button>
                  </div>
                </div>
                <div v-else class="flex items-stretch">
                  <div class="bg-mist-blue/40 px-3.5 py-3 flex items-start justify-center min-w-[2.75rem]">
                    <span class="material-symbols-outlined text-base text-navy-400">label</span>
                  </div>
                  <div class="flex-1 px-3.5 py-3 min-w-0">
                    <p class="text-xs font-semibold text-navy-400">{{ item.label }}</p>
                    <p class="text-sm text-navy-800 mt-0.5 break-words">{{ item.value || '—' }}</p>
                  </div>
                  <div class="flex items-center gap-0.5 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
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
            <div v-else class="flex flex-col items-center justify-center py-8 text-center text-navy-400">
              <span class="material-symbols-outlined text-3xl mb-1.5 text-navy-300">label</span>
              <p class="text-sm font-medium">No entries yet</p>
              <p class="text-xs text-navy-300 mt-0.5">Store WiFi passwords, parking notes, and similar details</p>
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

const initials = (name?: string) => {
  if (!name) return '?'
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('')
}

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

// ── Add-form visibility (drives the animated expand/collapse panels) ───────
const showRoomForm = ref(false)
const showContactForm = ref(false)
const showMetadataForm = ref(false)

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
  showRoomForm.value = false
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
  showContactForm.value = false
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
  showMetadataForm.value = false
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
  border: 1px solid rgb(27 45 89 / 0.16);
  background: white;
  padding: 0.6rem 0.85rem;
  font-size: 0.875rem;
  color: #1f2937;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.input:focus {
  border-color: rgb(37 99 235);
  box-shadow: 0 0 0 3px rgb(37 99 235 / 0.12);
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  background: rgb(37 99 235);
  color: white;
  font-size: 0.8125rem;
  font-weight: 600;
  padding: 0.55rem 1rem;
  transition: background-color 0.15s ease, transform 0.1s ease;
}

.btn-primary:hover {
  background: rgb(29 78 216);
}

.btn-primary:active {
  transform: scale(0.98);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  border: 1px solid rgb(27 45 89 / 0.18);
  color: #374151;
  font-size: 0.8125rem;
  font-weight: 600;
  padding: 0.55rem 1rem;
  transition: background-color 0.15s ease;
}

.btn-secondary:hover {
  background: rgb(248 250 252);
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  color: #334155;
  background: transparent;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.icon-btn:hover {
  background: rgb(239 246 255);
  color: rgb(37 99 235);
}

.icon-btn:disabled {
  opacity: 0.35;
  pointer-events: none;
}
</style>