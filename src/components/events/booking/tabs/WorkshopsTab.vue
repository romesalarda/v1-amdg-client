<template>
  <div class="space-y-6">

    <!-- Attendee registration statuses -->
    <section v-if="attendeeRegistrations.length" class="bg-white rounded-2xl border border-deep-navy/10 shadow-drawn overflow-hidden">
      <WorkshopInfoModal v-model="infoModalOpen" :workshop-id="infoModalWorkshopId" />
      <div class="flex items-center gap-2 px-5 py-4 border-b border-navy-50">
        <span class="material-symbols-outlined text-primary">workspace_premium</span>
        <h3 class="text-sm font-black text-primary uppercase tracking-widest">Your Workshop Allocations</h3>
      </div>
      <div class="divide-y divide-navy-50">
        <div
          v-for="reg in attendeeRegistrations"
          :key="reg.registration_id"
          class="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-navy-50 transition-colors"
          @click="infoModalWorkshopId = reg.workshop; infoModalOpen = true"
        >        
          <div class="flex-1 min-w-0" v-if="reg.status === 'CONFIRMED'">
            <img
              v-if="workshopNameMap[reg.workshop]?.landing"
              :src="workshopNameMap[reg.workshop]?.landing"
              :alt="workshopNameMap[reg.workshop]?.title"
              class="w-full h-full object-cover max-h-30 rounded-md mb-1"
            />
            <p class="text-xl font-bold text-navy-900 truncate mt-2">
              {{ workshopNameMap[reg.workshop]?.title ?? `Workshop #${reg.workshop}` }}
            </p>
            <p class="text-md text-navy-400">
              Registered {{ formatDate(reg.registered_at) }}
            </p>
          </div>
          <div class="flex-1 min-w-0" v-else-if="reg.status === 'CANCELLED'">
            <p class="text-xl font-bold text-navy-900 truncate">
              {{ workshopNameMap[reg.workshop]?.title ?? `Workshop #${reg.workshop}` }}
            </p>
            <p class="text-md text-navy-400 bg-red-50 px-2 py-1 rounded-md inline-block mt-1">
              Cancelled registration {{ formatDate(reg.registered_at) }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Interest ranking form -->
    <section class="bg-white rounded-2xl border border-deep-navy/10 shadow-drawn overflow-hidden">
      <div class="flex items-center gap-2 px-5 py-4 border-b border-navy-50">
        <span class="material-symbols-outlined text-primary">format_list_numbered</span>
        <div class="flex-1">
          <h3 class="text-sm font-black text-primary uppercase tracking-widest">Workshop Preferences</h3>
          <p class="text-xs text-navy-400 mt-0.5">Rank the workshops you'd like to attend. #1 is your top choice.</p>
        </div>
      </div>
      <div class="p-5">
        <WorkshopInterestForm
          :event-id="urlSafeEventId"
          :event-uuid="eventUuid"
          :attendee-id="numericAttendeeId"
          @saved="onSaved"
          @finalised="onFinalised"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import WorkshopInterestForm from '~/components/events/workshops/WorkshopInterestForm.vue'
import { useWorkshopRegistrations, useWorkshops } from '~/composables/resources/workshops'
import WorkshopInfoModal from '~/components/events/workshops/WorkshopInfoModal.vue'

const props = defineProps<{
  eventId: string
  eventUuid: string
  attendeeId: string
}>()

const { $notyf } = useNuxtApp()
const infoModalOpen = ref(false)
const infoModalWorkshopId = ref<number | null>(null)

const urlSafeEventId = computed(() => encodeURIComponent(props.eventId))
const numericAttendeeId = computed(() => String(props.attendeeId))
const eventUuid = computed(() => props.eventUuid)
// All registrations for this attendee
const { data: regsData } = useWorkshopRegistrations(
  computed(() =>
    numericAttendeeId.value
      ? { attendee: numericAttendeeId.value, page_size: 100 }
      : undefined,
  ),
)
const attendeeRegistrations = computed(() => regsData.value?.data?.results ?? [])

// Map workshop IDs → titles
const { data: workshopsData } = useWorkshops(
  computed(() =>
    urlSafeEventId.value ? { event: urlSafeEventId.value, page_size: 200 } : undefined,
  ),
)
const workshopNameMap = computed<Record<number, { title: string, landing: string }>>(() => {
  const map: Record<number, { title: string, landing: string }> = {}
  for (const w of workshopsData.value?.data?.results ?? []) {
    map[w.id] = { title: w.title, landing: w.landing_image ?? '' }
  }
  return map
})

function formatDate(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(undefined, { dateStyle: 'medium' })
}

function onSaved() {
  $notyf?.success('Preferences saved as draft.')
}

function onFinalised() {
  $notyf?.success('Preferences submitted!')
}
</script>
