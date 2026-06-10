<template>
  <div class="space-y-6">

    <!-- Attendee registration statuses -->
    <section v-if="attendeeRegistrations.length" class="bg-white rounded-2xl border border-deep-navy/10 shadow-drawn overflow-hidden">
      <div class="flex items-center gap-2 px-5 py-4 border-b border-navy-50">
        <span class="material-symbols-outlined text-primary">workspace_premium</span>
        <h3 class="text-sm font-black text-primary uppercase tracking-widest">Your Workshop Allocations</h3>
      </div>
      <div class="divide-y divide-navy-50">
        <div
          v-for="reg in attendeeRegistrations"
          :key="reg.registration_id"
          class="flex items-center gap-3 px-5 py-3"
        >
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-navy-900 truncate">
              {{ workshopNameMap[reg.workshop] ?? `Workshop #${reg.workshop}` }}
            </p>
            <p class="text-xs text-navy-400">
              Registered {{ formatDate(reg.registered_at) }}
            </p>
          </div>
          <WorkshopRegistrationStatusBadge :status="reg.status" />
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
import WorkshopRegistrationStatusBadge from '~/components/events/workshops/WorkshopRegistrationStatusBadge.vue'
import { useWorkshopRegistrations, useWorkshops } from '~/composables/resources/workshops'

const props = defineProps<{
  eventId: string
  eventUuid: string
  attendeeId: string
}>()

const { $notyf } = useNuxtApp()

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
const workshopNameMap = computed<Record<number, string>>(() => {
  const map: Record<number, string> = {}
  for (const w of workshopsData.value?.data?.results ?? []) {
    map[w.id] = w.title
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
