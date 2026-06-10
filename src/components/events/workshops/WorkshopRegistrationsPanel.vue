<template>
  <div>
    <!-- Loading -->
    <div v-if="isLoading" class="space-y-2 p-4">
      <div v-for="i in 3" :key="i" class="h-12 bg-mist-blue/60 rounded-xl animate-pulse" />
    </div>

    <!-- Error -->
    <div v-else-if="isError" class="p-4 text-center text-sm text-red-500">
      Failed to load registrations.
    </div>

    <!-- Empty -->
    <div v-else-if="!registrations.length" class="p-6 text-center text-navy-400">
      <span class="material-symbols-outlined text-3xl block mb-2 text-navy-200">person_off</span>
      <p class="text-sm">No registrations yet.</p>
    </div>

    <!-- List -->
    <div v-else class="divide-y divide-navy-50">
      <div
        v-for="reg in registrations"
        :key="reg.registration_id"
        class="flex items-center gap-3 px-4 py-2.5 hover:bg-mist-blue/30 transition-colors"
      >
        <!-- Avatar -->
        <div class="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-black text-primary flex-shrink-0">
          {{ initial(reg.attendee_name) }}
        </div>

        <!-- Name + meta -->
        <div class="flex-1 min-w-0">
          <p class="text-xs font-semibold text-navy-900 truncate">{{ reg.attendee_name }}</p>
          <p class="text-[10px] text-navy-400">
            {{ reg.allocation_method ?? '—' }}
            <span v-if="reg.booking_reference" class="ml-1 text-navy-300">· {{ reg.booking_reference }}</span>
          </p>
        </div>

        <!-- Status badge -->
        <WorkshopRegistrationStatusBadge :status="reg.status" />

        <!-- Actions -->
        <div class="flex items-center gap-1 flex-shrink-0">
          <button
            v-if="reg.status === 'PENDING_ALLOCATION'"
            @click="confirmReg(reg.registration_id)"
            :disabled="actionPending === reg.registration_id"
            title="Confirm"
            class="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50"
          >
            <span class="material-symbols-outlined text-sm">check_circle</span>
          </button>
          <button
            v-if="reg.status === 'WAITLISTED'"
            @click="promoteReg(reg.registration_id)"
            :disabled="actionPending === reg.registration_id"
            title="Promote from waitlist"
            class="p-1 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            <span class="material-symbols-outlined text-sm">arrow_upward</span>
          </button>
          <button
            v-if="reg.status !== 'CANCELLED'"
            @click="cancelReg(reg.registration_id)"
            :disabled="actionPending === reg.registration_id"
            title="Cancel"
            class="p-1 rounded-lg text-navy-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <span class="material-symbols-outlined text-sm">cancel</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-2 border-t border-navy-50">
      <p class="text-xs text-navy-400">
        {{ (page - 1) * pageSize + 1 }}–{{ Math.min(page * pageSize, total) }} of {{ total }}
      </p>
      <div class="flex items-center gap-1">
        <button
          @click="page--"
          :disabled="page === 1"
          class="p-1 rounded text-navy-400 hover:text-navy-700 disabled:opacity-30"
        >
          <span class="material-symbols-outlined text-sm">chevron_left</span>
        </button>
        <span class="text-xs text-navy-500">{{ page }} / {{ totalPages }}</span>
        <button
          @click="page++"
          :disabled="page === totalPages"
          class="p-1 rounded text-navy-400 hover:text-navy-700 disabled:opacity-30"
        >
          <span class="material-symbols-outlined text-sm">chevron_right</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWorkshopRegistrationsByWorkshop } from '~/composables/resources/workshops'
import {
  useCancelWorkshopRegistration,
  useConfirmWorkshopRegistration,
  usePromoteWaitlistRegistration,
} from '~/composables/resources/workshops'
import WorkshopRegistrationStatusBadge from './WorkshopRegistrationStatusBadge.vue'

const props = defineProps<{
  workshopId: number
}>()

const page = ref(1)
const pageSize = 10

const registrationsQuery = useWorkshopRegistrationsByWorkshop(
  computed(() => props.workshopId),
  computed(() => ({ page: page.value, page_size: pageSize })),
)

const { isLoading, isError } = registrationsQuery
const registrations = computed(() => registrationsQuery.data.value?.data?.results ?? [])
const total = computed(() => registrationsQuery.data.value?.data?.count ?? 0)
const totalPages = computed(() => Math.ceil(total.value / pageSize))

const actionPending = ref<string | null>(null)
const cancelMutation = useCancelWorkshopRegistration()
const confirmMutation = useConfirmWorkshopRegistration()
const promoteMutation = usePromoteWaitlistRegistration()

async function cancelReg(id: string) {
  if (!confirm('Cancel this registration?')) return
  actionPending.value = id
  try { await cancelMutation.mutateAsync(id) } finally { actionPending.value = null }
}

async function confirmReg(id: string) {
  actionPending.value = id
  try { await confirmMutation.mutateAsync(id) } finally { actionPending.value = null }
}

async function promoteReg(id: string) {
  actionPending.value = id
  try { await promoteMutation.mutateAsync(id) } finally { actionPending.value = null }
}

function initial(name: string | undefined): string {
  return String(name ?? '').trim().charAt(0).toUpperCase() || '?'
}
</script>
