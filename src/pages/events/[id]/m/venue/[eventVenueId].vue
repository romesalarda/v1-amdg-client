<template>
  <EventManagementLayout :event-id="id" :event="event?.data">
    <div class="space-y-6">
      <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden p-6">
        <div class="flex items-center gap-3 flex-wrap">
          <NuxtLink
            :to="`/events/${id}/m/venue`"
            class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-deep-navy/15 text-xs font-semibold text-navy-600 hover:bg-mist-blue/60"
          >
            <span class="material-symbols-outlined text-sm">arrow_back</span>
            Back to Venues
          </NuxtLink>

          <div class="flex-1 min-w-0">
            <h1 class="text-lg font-black text-deep-navy">{{ eventVenue?.data?.venue_name || 'Venue Details' }}</h1>
            <p class="text-sm text-navy-600 mt-1">{{ eventVenue?.data?.venue_address || 'No address available' }}</p>
            <p class="text-xs text-navy-400">{{ eventVenue?.data?.venue_city || 'No city' }}</p>
          </div>
        </div>
      </section>

      <section class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <article class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="px-5 py-4 border-b border-navy-50 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">meeting_room</span>
            <h2 class="text-xs font-black text-primary uppercase tracking-widest">Rooms</h2>
          </div>
          <div class="p-5 space-y-3">
            <form class="space-y-2" @submit.prevent="createRoom">
              <input v-model="roomForm.room_name" required type="text" placeholder="Room name" class="input" />
              <input v-model="roomForm.capacity" min="0" type="number" placeholder="Capacity" class="input" />
              <textarea v-model="roomForm.description" rows="2" placeholder="Description" class="input resize-none" />
              <button :disabled="!canUpdate" class="btn-primary disabled:opacity-40">Add Room</button>
            </form>

            <div v-if="rooms.length" class="space-y-2">
              <div v-for="room in rooms" :key="room.id" class="rounded-xl border border-deep-navy/10 p-3">
                <div v-if="editingRoomId === room.id" class="space-y-2">
                  <input v-model="roomEdit.room_name" type="text" class="input" />
                  <input v-model="roomEdit.capacity" min="0" type="number" class="input" />
                  <textarea v-model="roomEdit.description" rows="2" class="input resize-none" />
                  <div class="flex gap-2">
                    <button type="button" class="btn-primary" @click="saveRoom(room.id)">Save</button>
                    <button type="button" class="btn-secondary" @click="editingRoomId = null">Cancel</button>
                  </div>
                </div>
                <div v-else class="flex items-start justify-between gap-2">
                  <div>
                    <p class="text-sm font-semibold text-navy-900">{{ room.room_name }}</p>
                    <p class="text-xs text-navy-500">Capacity: {{ room.capacity ?? 'N/A' }}</p>
                    <p class="text-xs text-navy-400">{{ room.description || 'No description' }}</p>
                  </div>
                  <div class="flex items-center gap-1">
                    <button type="button" :disabled="!canUpdate" class="icon-btn" @click="startRoomEdit(room)">
                      <span class="material-symbols-outlined text-base">edit</span>
                    </button>
                    <button type="button" :disabled="!canDelete" class="icon-btn text-red-600" @click="removeRoom(room.id)">
                      <span class="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <p v-else class="text-sm text-navy-500">No rooms yet.</p>
          </div>
        </article>

        <article class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="px-5 py-4 border-b border-navy-50 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">contact_phone</span>
            <h2 class="text-xs font-black text-primary uppercase tracking-widest">Contacts</h2>
          </div>
          <div class="p-5 space-y-3">
            <form class="space-y-2" @submit.prevent="createContact">
              <input v-model="contactForm.contact_name" required type="text" placeholder="Contact name" class="input" />
              <input v-model="contactForm.phone_number" type="text" placeholder="Phone" class="input" />
              <input v-model="contactForm.email" type="email" placeholder="Email" class="input" />
              <select v-model="contactForm.role" class="input">
                <option value="OWNER">Owner</option>
                <option value="MANAGER">Manager</option>
                <option value="COORDINATOR">Coordinator</option>
                <option value="SUPPORT">Support</option>
                <option value="OTHER">Other</option>
              </select>
              <button :disabled="!canUpdate" class="btn-primary disabled:opacity-40">Add Contact</button>
            </form>

            <div v-if="contacts.length" class="space-y-2">
              <div v-for="contact in contacts" :key="contact.id" class="rounded-xl border border-deep-navy/10 p-3">
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
                    <button type="button" class="btn-primary" @click="saveContact(contact.id)">Save</button>
                    <button type="button" class="btn-secondary" @click="editingContactId = null">Cancel</button>
                  </div>
                </div>
                <div v-else class="flex items-start justify-between gap-2">
                  <div>
                    <p class="text-sm font-semibold text-navy-900">{{ contact.contact_name }}</p>
                    <p class="text-xs text-navy-500">{{ contact.role || 'OWNER' }}</p>
                    <p class="text-xs text-navy-400">{{ contact.phone_number || 'No phone' }} | {{ contact.email || 'No email' }}</p>
                  </div>
                  <div class="flex items-center gap-1">
                    <button type="button" :disabled="!canUpdate" class="icon-btn" @click="startContactEdit(contact)">
                      <span class="material-symbols-outlined text-base">edit</span>
                    </button>
                    <button type="button" :disabled="!canDelete" class="icon-btn text-red-600" @click="removeContact(contact.id)">
                      <span class="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <p v-else class="text-sm text-navy-500">No contacts yet.</p>
          </div>
        </article>

        <article class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="px-5 py-4 border-b border-navy-50 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">label</span>
            <h2 class="text-xs font-black text-primary uppercase tracking-widest">Metadata</h2>
          </div>
          <div class="p-5 space-y-3">
            <form class="space-y-2" @submit.prevent="createMetadata">
              <input v-model="metadataForm.label" required type="text" placeholder="Label" class="input" />
              <textarea v-model="metadataForm.value" rows="2" placeholder="Value" class="input resize-none" />
              <button :disabled="!canUpdate" class="btn-primary disabled:opacity-40">Add Metadata</button>
            </form>

            <div v-if="metadataItems.length" class="space-y-2">
              <div v-for="item in metadataItems" :key="item.id" class="rounded-xl border border-deep-navy/10 p-3">
                <div v-if="editingMetadataId === item.id" class="space-y-2">
                  <input v-model="metadataEdit.label" type="text" class="input" />
                  <textarea v-model="metadataEdit.value" rows="2" class="input resize-none" />
                  <div class="flex gap-2">
                    <button type="button" class="btn-primary" @click="saveMetadata(item.id)">Save</button>
                    <button type="button" class="btn-secondary" @click="editingMetadataId = null">Cancel</button>
                  </div>
                </div>
                <div v-else class="flex items-start justify-between gap-2">
                  <div>
                    <p class="text-sm font-semibold text-navy-900">{{ item.label }}</p>
                    <p class="text-xs text-navy-400">{{ item.value || 'No value' }}</p>
                  </div>
                  <div class="flex items-center gap-1">
                    <button type="button" :disabled="!canUpdate" class="icon-btn" @click="startMetadataEdit(item)">
                      <span class="material-symbols-outlined text-base">edit</span>
                    </button>
                    <button type="button" :disabled="!canDelete" class="icon-btn text-red-600" @click="removeMetadata(item.id)">
                      <span class="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <p v-else class="text-sm text-navy-500">No metadata yet.</p>
          </div>
        </article>
      </section>
    </div>
  </EventManagementLayout>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import EventManagementLayout from '~/components/events/EventManagementLayout.vue'
import { useCurrentUserEventPermissions } from '~/composables/permissions'
import { useEvent } from '~/composables/resources/events/events'
import { useEventVenue } from '~/composables/resources/events/eventVenues'
import { extractResults } from '~/composables/resources/events/eventVenueManagement'
import {
  useCreateLocationRoom,
  useDeleteLocationRoom,
  useLocationRooms,
  useUpdateLocationRoom,
} from '~/composables/resources/locations/locationRooms'
import {
  useCreateLocationVenueContact,
  useDeleteLocationVenueContact,
  useLocationVenueContacts,
  useUpdateLocationVenueContact,
} from '~/composables/resources/locations/locationVenueContacts'
import {
  useCreateLocationVenueMetadata,
  useDeleteLocationVenueMetadata,
  useLocationVenueMetadata,
  useUpdateLocationVenueMetadata,
} from '~/composables/resources/locations/locationVenueMetadata'
import { useLocationVenue } from '~/composables/resources/locations/locationVenues'

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

const { data: event } = useEvent(id)
const { data: eventVenue } = useEventVenue(eventVenueId)
const venueId = computed(() => eventVenue.value?.data?.venue)

const { data: locationVenue } = useLocationVenue(computed(() => venueId.value || 0))

const roomQuery = computed(() => ({ venue: venueId.value, page_size: 100 }))
const contactQuery = computed(() => ({ venue: venueId.value, page_size: 100 }))
const metadataQuery = computed(() => ({ venue: venueId.value, page_size: 100 }))

const { data: roomsResponse } = useLocationRooms(roomQuery)
const { data: contactsResponse } = useLocationVenueContacts(contactQuery)
const { data: metadataResponse } = useLocationVenueMetadata(metadataQuery)

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

const createRoomMutation = useCreateLocationRoom()
const updateRoomMutation = useUpdateLocationRoom()
const deleteRoomMutation = useDeleteLocationRoom()

const createContactMutation = useCreateLocationVenueContact()
const updateContactMutation = useUpdateLocationVenueContact()
const deleteContactMutation = useDeleteLocationVenueContact()

const createMetadataMutation = useCreateLocationVenueMetadata()
const updateMetadataMutation = useUpdateLocationVenueMetadata()
const deleteMetadataMutation = useDeleteLocationVenueMetadata()

const createRoom = async () => {
  if (!canUpdate.value)
    return

  if (!venueId.value)
    return

  await createRoomMutation.mutateAsync({
    venue: venueId.value,
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

  if (!venueId.value)
    return

  await updateRoomMutation.mutateAsync({
    roomId,
    body: {
      venue: venueId.value,
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

  if (!venueId.value)
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
    venue: venueId.value,
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

  if (!venueId.value)
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
      venue: venueId.value,
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

  if (!venueId.value || !locationVenue.value?.data?.poi)
    return

  await createMetadataMutation.mutateAsync({
    venue: venueId.value,
    poi: locationVenue.value.data.poi,
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

  if (!venueId.value || !locationVenue.value?.data?.poi)
    return

  await updateMetadataMutation.mutateAsync({
    metadataId,
    body: {
      venue: venueId.value,
      poi: locationVenue.value.data.poi,
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
