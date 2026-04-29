<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="handleClose" />

      <div class="relative w-full max-w-3xl bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
        <div class="flex items-center gap-2 px-6 py-4 border-b border-navy-50">
          <span class="material-symbols-outlined text-primary">add_location_alt</span>
          <div class="flex-1">
            <h3 class="text-sm font-black text-primary uppercase tracking-widest">Add Venue To Event</h3>
            <p class="text-xs text-navy-400 mt-0.5">Search global venues first or create a new POI + venue</p>
          </div>
          <button class="p-1.5 rounded-lg hover:bg-mist-blue/70" @click="handleClose">
            <span class="material-symbols-outlined text-navy-500">close</span>
          </button>
        </div>

        <div class="px-6 pt-4">
          <div class="inline-flex rounded-xl bg-mist-blue/80 p-1">
            <button
              class="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              :class="mode === 'existing' ? 'bg-white text-primary shadow-sm' : 'text-navy-500'"
              @click="mode = 'existing'"
            >
              Link Existing
            </button>
            <button
              class="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              :class="mode === 'create' ? 'bg-white text-primary shadow-sm' : 'text-navy-500'"
              @click="mode = 'create'"
            >
              Create New
            </button>
          </div>
        </div>

        <div class="p-6 max-h-[70vh] overflow-y-auto">
          <div v-if="mode === 'existing'" class="space-y-4">
            <div class="space-y-2">
              <label class="block text-xs font-black text-primary uppercase tracking-widest">Search Existing Venue</label>
              <input
                :value="search"
                @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
                type="text"
                placeholder="Search by venue, city, or address"
                class="w-full rounded-xl border border-primary-500/20 bg-white px-4 py-2.5 text-sm text-navy-900 placeholder:text-navy-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div class="space-y-2">
              <div v-if="venues.length" class="space-y-2 max-h-72 overflow-y-auto pr-1">
                <button
                  v-for="item in venues"
                  :key="item.id"
                  class="w-full text-left rounded-xl border px-4 py-3 transition-colors"
                  :class="selectedVenueId === item.id ? 'border-primary bg-primary/5' : 'border-deep-navy/10 hover:bg-mist-blue/50'"
                  @click="selectedVenueId = item.id"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <p class="text-sm font-bold text-deep-navy">{{ item.poi_name || item.poi?.name || 'Unnamed venue' }}</p>
                      <p class="text-xs text-navy-500 mt-1">{{ item.poi_address || item.poi?.address || 'No address' }}</p>
                      <p class="text-xs text-navy-400 mt-1">{{ item.poi_city || item.poi?.city || 'No city' }}</p>
                    </div>
                  </div>
                </button>
              </div>

              <div v-else class="rounded-xl border border-dashed border-deep-navy/20 p-6 text-center text-sm text-navy-500">
                No matching venues found. Switch to Create New.
              </div>
            </div>
          </div>

          <form v-else class="space-y-6" @submit.prevent="handleCreateNew">
            <div>
              <h4 class="text-xs font-black text-primary uppercase tracking-widest mb-3">Quick Venue Details</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input v-model="poiForm.name" required type="text" placeholder="Venue name" class="input" />
                <select v-model="poiForm.poi_type" class="input">
                  <option value="VENUE">Venue</option>
                  <option value="SPORTS_VENUE">Sports Venue</option>
                </select>
                <input v-model="poiForm.city" type="text" placeholder="City" class="input" />
                <input v-model="venueForm.capacity" min="0" type="number" placeholder="Capacity (optional)" class="input" />
              </div>
              <textarea v-model="poiForm.address" required rows="2" placeholder="Address" class="input mt-3 resize-none" />
              <p class="mt-2 text-xs text-navy-500">Only name and address are required. You can add full venue metadata later from Manage Details.</p>
            </div>

            <p v-if="createError" class="text-sm text-red-600">{{ createError }}</p>
          </form>
        </div>

        <div class="px-6 py-4 border-t border-navy-50 flex items-center gap-3">
          <button class="px-4 py-2 rounded-xl border border-deep-navy/20 text-sm font-semibold text-navy-600 hover:bg-mist-blue/70" @click="handleClose">
            Cancel
          </button>

          <button
            v-if="mode === 'existing'"
            class="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-40"
            :disabled="!selectedVenueId"
            @click="emitSelect"
          >
            Link Selected Venue
          </button>

          <button
            v-else
            class="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-40"
            :disabled="isBusy"
            @click="handleCreateNew"
          >
            {{ isBusy ? 'Creating...' : 'Create Venue' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useEventVenueManagement } from '~/composables/resources/events/eventVenueManagement'

const props = defineProps<{
  open: boolean
  search: string
  venues: Array<any>
}>()

const emit = defineEmits<{
  close: []
  select: [venueId: number]
  'update:search': [value: string]
}>()

const mode = ref<'existing' | 'create'>('existing')
const selectedVenueId = ref<number | null>(null)
const createError = ref('')

const poiForm = reactive({
  name: '',
  address: '',
  city: '',
  poi_type: 'VENUE' as 'VENUE' | 'SPORTS_VENUE',
})

const venueForm = reactive({
  capacity: '' as string | number,
})

const { isBusy, createVenueFromPoiAndVenueData } = useEventVenueManagement()

const resetCreateForm = () => {
  poiForm.name = ''
  poiForm.address = ''
  poiForm.city = ''
  poiForm.poi_type = 'VENUE'
  venueForm.capacity = ''
}

watch(() => props.open, (isOpen) => {
  if (!isOpen)
    return

  mode.value = 'existing'
  selectedVenueId.value = null
  createError.value = ''
  resetCreateForm()
})

const emitSelect = () => {
  if (!selectedVenueId.value)
    return

  emit('select', selectedVenueId.value)
}

const handleClose = () => {
  emit('close')
}

const handleCreateNew = async () => {
  if (mode.value !== 'create')
    return

  createError.value = ''

  if (!poiForm.name.trim() || !poiForm.address.trim()) {
    createError.value = 'POI name and address are required.'
    return
  }

  try {
    const result = await createVenueFromPoiAndVenueData({
      poi: {
        name: poiForm.name.trim(),
        address: poiForm.address.trim(),
        city: poiForm.city.trim() || '',
        poi_type: poiForm.poi_type,
      },
      venue: {
        capacity: venueForm.capacity === '' ? null : Number(venueForm.capacity),
      },
    })

    emit('select', result.venueId)
  }
  catch (error: any) {
    createError.value = error?.message || 'Failed to create POI and venue.'
  }
}
</script>

<style scoped>
.input {
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid rgb(27 45 89 / 0.18);
  background: white;
  padding: 0.65rem 0.95rem;
  font-size: 0.875rem;
  color: #1f2937;
  outline: none;
}

.input:focus {
  border-color: rgb(35 117 202);
  box-shadow: 0 0 0 2px rgb(35 117 202 / 0.2);
}
</style>
