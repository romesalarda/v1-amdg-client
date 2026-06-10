<template>
  <div class="overflow-x-auto">
    <div class="flex gap-3.5 min-w-0 pb-2" style="min-width: max-content;">
      <div
        v-for="workshop in workshops"
        :key="workshop.id"
        class="flex flex-col w-56 flex-shrink-0"
      >
        <!-- Column header -->
        <div class="bg-white rounded-t-2xl border border-b-0 border-deep-navy/10 px-3 pt-2.5 pb-0">
          <div class="flex items-center gap-2 pb-2">
            <!-- Status dot -->
            <span
              class="w-1.5 h-1.5 rounded-full flex-shrink-0"
              :class="{
                'bg-green-400': workshop.status === 'OPEN',
                'bg-slate-300': workshop.status === 'DRAFT',
                'bg-red-400': workshop.status === 'CLOSED',
              }"
            />
            <span class="flex-1 text-[11px] font-medium text-navy-900 truncate">{{ workshop.title }}</span>
            <span class="text-[11px] text-navy-400 flex-shrink-0 tabular-nums">
              {{ registrationCounts[workshop.id] ?? 0 }}{{ workshop.capacity != null ? ` / ${workshop.capacity}` : '' }}
            </span>
          </div>
          <!-- Capacity bar -->
          <div class="h-[3px] rounded-full bg-deep-navy/10 overflow-hidden mb-[-1px]">
            <div
              class="h-full rounded-full transition-all duration-300"
              :class="capacityFillClass(workshop)"
              :style="{ width: capacityPercent(workshop) }"
            />
          </div>
        </div>

        <!-- Drop zone -->
        <div
          class="flex-1 min-h-[240px] bg-white rounded-b-2xl border border-deep-navy/10 p-2 flex flex-col gap-1.5 transition-colors"
          :class="dragOverWorkshopId === workshop.id ? 'bg-primary/5 border-primary/30' : ''"
          @dragover.prevent="dragOverWorkshopId = workshop.id"
          @dragleave="dragOverWorkshopId = null"
          @drop.prevent="onDrop(workshop.id)"
        >
          <template v-if="loadingMap[workshop.id]">
            <div v-for="i in 2" :key="i" class="h-10 bg-white rounded-lg animate-pulse" />
          </template>

          <template v-else>
            <div
              v-for="reg in registrationsByWorkshop[workshop.id] ?? []"
              :key="reg.registration_id"
              draggable="true"
              @dragstart="onDragStart(reg)"
              @dragend="dragOverWorkshopId = null"
              class="flex items-center gap-2 bg-white rounded-lg border border-deep-navy/10 px-2.5 py-1.5 cursor-grab select-none hover:border-primary/30 active:scale-[0.98] transition-all group"
            >
              <i class="ti ti-grip-vertical text-[14px] text-navy-200 group-hover:text-navy-300 flex-shrink-0" aria-hidden="true" />
              <div class="w-[26px] h-[26px] rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-medium text-primary flex-shrink-0">
                {{ initial(reg.attendee_name) }}
              </div>
              <span class="flex-1 text-[12px] font-medium text-navy-900 truncate">{{ reg.attendee_name }}</span>
              <WorkshopRegistrationStatusBadge :status="reg.status" />
            </div>

            <div v-if="!(registrationsByWorkshop[workshop.id]?.length)" class="text-[11px] text-navy-300 text-center py-6">
              Drop attendees here
            </div>
          </template>
        </div>
  </div>

  <!-- Unassigned column -->
  <div class="flex flex-col w-56 flex-shrink-0">
    <div class="bg-white rounded-t-2xl border border-b-0 border-deep-navy/10 px-3 pt-2.5 pb-2.5">
      <span class="text-[10px] font-medium text-navy-400 uppercase tracking-widest">Unassigned / Waitlisted</span>
    </div>
    <div
      class="flex-1 min-h-[240px] bg-white rounded-b-2xl border border-deep-navy/10 p-2 flex flex-col gap-1.5 transition-colors"
      :class="dragOverWorkshopId === UNASSIGNED_COLUMN ? 'bg-amber-50 border-amber-200' : ''"
      @dragover.prevent="dragOverWorkshopId = UNASSIGNED_COLUMN"
      @dragleave="dragOverWorkshopId = null"
      @drop.prevent="onDrop(UNASSIGNED_COLUMN)"
    >
      <div
        v-for="reg in waitlistedRegistrations"
        :key="reg.registration_id"
        class="flex items-center gap-2 bg-white rounded-lg border border-deep-navy/10 px-2.5 py-1.5"
      >
        <div class="w-[26px] h-[26px] rounded-full bg-amber-100 flex items-center justify-center text-[10px] font-medium text-amber-700 flex-shrink-0">
          {{ initial(reg.attendee_name) }}
        </div>
        <span class="flex-1 text-[12px] font-medium text-navy-900 truncate">{{ reg.attendee_name }}</span>
        <span class="text-[10px] text-navy-300">W#{{ reg.workshop }}</span>
      </div>
      <div v-if="!waitlistedRegistrations.length" class="text-[11px] text-navy-300 text-center py-6">
        No waitlisted registrations
      </div>
    </div>
  </div>
</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import WorkshopStatusBadge from './WorkshopStatusBadge.vue'
import WorkshopRegistrationStatusBadge from './WorkshopRegistrationStatusBadge.vue'
import {
  useWorkshopRegistrationsByWorkshop,
  useWorkshopRegistrations,
  usePartialUpdateWorkshopRegistration,
} from '~/composables/resources/workshops'
import type { WorkshopList, WorkshopRegistrationList } from '~/api/types.gen'

const UNASSIGNED_COLUMN = -1

const props = defineProps<{
  workshops: WorkshopList[]
  eventId: number
}>()

const { $notyf } = useNuxtApp()

// ─── Per-workshop registration queries ─────────────────────────────────────────
// Build one query per workshop. We use a computed map to avoid over-fetching.
const workshopIds = computed(() => props.workshops.map(w => w.id))

// Aggregate query: all registrations for these workshops
const { data: allRegsData, isLoading: allRegsLoading } = useWorkshopRegistrations(
  computed(() => ({
    workshop: undefined,
    page_size: 1000,
  })),
)

function capacityPercent(workshop: WorkshopList) {
  if (!workshop.capacity) return '0%'
  const count = registrationCounts.value[workshop.id] ?? 0
  return `${Math.min(100, Math.round((count / workshop.capacity) * 100))}%`
}

function capacityFillClass(workshop: WorkshopList) {
  if (!workshop.capacity) return 'bg-primary'
  const pct = (registrationCounts.value[workshop.id] ?? 0) / workshop.capacity
  if (pct >= 0.9) return 'bg-red-400'
  if (pct >= 0.7) return 'bg-amber-400'
  return 'bg-primary'
}

// Filter client-side to only this event's workshops (avoid over-broad queries)
const allRegs = computed<WorkshopRegistrationList[]>(() => {
  const wsIds = new Set(workshopIds.value)
  return (allRegsData.value?.data?.results ?? []).filter(r => wsIds.has(r.workshop))
})

const registrationsByWorkshop = computed<Record<number, WorkshopRegistrationList[]>>(() => {
  const map: Record<number, WorkshopRegistrationList[]> = {}
  for (const ws of props.workshops) {
    map[ws.id] = []
  }
  for (const reg of allRegs.value) {
    if (reg.status === 'CONFIRMED') {
      map[reg.workshop] ??= []
      map[reg.workshop].push(reg)
    }
  }
  return map
})

const registrationCounts = computed<Record<number, number>>(() => {
  const counts: Record<number, number> = {}
  for (const [wsId, regs] of Object.entries(registrationsByWorkshop.value)) {
    counts[Number(wsId)] = regs.length
  }
  return counts
})

const waitlistedRegistrations = computed(() =>
  allRegs.value.filter(r => r.status === 'WAITLISTED'),
)

const loadingMap = computed<Record<number, boolean>>(() => {
  const m: Record<number, boolean> = {}
  for (const ws of props.workshops) m[ws.id] = allRegsLoading.value
  return m
})

// ─── Drag & Drop ────────────────────────────────────────────────────────────────
const dragOverWorkshopId = ref<number | null>(null)
let draggingReg: WorkshopRegistrationList | null = null

function onDragStart(reg: WorkshopRegistrationList) {
  draggingReg = reg
}

const patchMutation = usePartialUpdateWorkshopRegistration()

async function onDrop(targetWorkshopId: number) {
  dragOverWorkshopId.value = null
  if (!draggingReg) return
  if (targetWorkshopId === UNASSIGNED_COLUMN) {
    // Moving to unassigned = waitlisted; just cancel for now
    draggingReg = null
    return
  }
  if (draggingReg.workshop === targetWorkshopId) {
    draggingReg = null
    return
  }

  const reg = draggingReg
  draggingReg = null

  try {
    await patchMutation.mutateAsync({
      registrationId: reg.registration_id,
      body: { workshop: targetWorkshopId, attendee: reg.attendee },
    })
    $notyf?.success('Attendee moved.')
  } catch {
    $notyf?.error('Could not move attendee.')
  }
}

function initial(name: string | undefined): string {
  return String(name ?? '').trim().charAt(0).toUpperCase() || '?'
}
</script>
