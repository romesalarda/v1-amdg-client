<template>
  <div class="overflow-x-auto">
    <div class="flex gap-3 pb-2 w-full">
      <!-- Workshop columns -->
      <div
        v-for="workshop in workshops"
        :key="workshop.id"
        class="flex flex-col flex-1 min-w-[190px]"
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
          class="flex-1 min-h-[240px] bg-white rounded-b-2xl border border-deep-navy/10 p-2 flex flex-col gap-1.5 transition-all"
          :class="[
            dragOverWorkshopId === workshop.id ? 'bg-primary/5 border-primary/30' : '',
            isDragging && dragOverWorkshopId !== workshop.id ? 'ring-1 ring-inset ring-primary/10' : '',
          ]"
          @dragover.prevent="dragOverWorkshopId = workshop.id"
          @dragleave.self="dragOverWorkshopId = null"
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
              @dragend="onDragEnd"
              class="flex items-center gap-2 rounded-lg border px-2.5 py-1.5 cursor-grab select-none active:scale-[0.98] transition-all group"
              :class="[
                draggingReg?.registration_id === reg.registration_id ? 'opacity-40' : '',
                reg.status === 'CANCELLED'
                  ? 'bg-slate-50 border-slate-200 opacity-60'
                  : 'bg-white border-deep-navy/10 hover:border-primary/30',
              ]"
            >
              <i class="ti ti-grip-vertical text-[14px] text-navy-200 group-hover:text-navy-300 flex-shrink-0" aria-hidden="true" />
              <div
                class="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[10px] font-medium flex-shrink-0"
                :class="reg.status === 'CANCELLED' ? 'bg-slate-200 text-slate-400' : 'bg-primary/10 text-primary'"
              >
                {{ initial(reg.attendee_name) }}
              </div>
              <span
                class="flex-1 text-[12px] font-medium truncate"
                :class="reg.status === 'CANCELLED' ? 'line-through text-navy-400' : 'text-navy-900'"
              >{{ reg.attendee_name }}</span>
              <WorkshopRegistrationStatusBadge :status="reg.status" />
            </div>

            <div v-if="!(registrationsByWorkshop[workshop.id]?.length)" class="text-[11px] text-navy-300 text-center py-6">
              Drop attendees here
            </div>
          </template>
        </div>
      </div>

      <!-- Unassigned / Pending column -->
      <div class="flex flex-col flex-1 min-w-[190px]">
        <div class="bg-white rounded-t-2xl border border-b-0 border-deep-navy/10 px-3 pt-2.5 pb-2.5 flex items-center justify-between">
          <span class="text-[10px] font-medium text-navy-400 uppercase tracking-widest">Unassigned / Pending</span>
          <span class="text-[11px] text-navy-400 tabular-nums">{{ unassignedRegistrations.length }}</span>
        </div>
        <div
          class="flex-1 min-h-[240px] bg-white rounded-b-2xl border border-deep-navy/10 p-2 flex flex-col gap-1.5 overflow-y-auto max-h-[600px]"
          :class="isDragging ? 'ring-1 ring-inset ring-amber-200' : ''"
        >
          <div
            v-for="reg in unassignedRegistrations"
            :key="reg.registration_id"
            draggable="true"
            @dragstart="onDragStart(reg)"
            @dragend="onDragEnd"
            class="flex items-center gap-2 bg-white rounded-lg border border-deep-navy/10 px-2.5 py-1.5 cursor-grab select-none hover:border-primary/30 active:scale-[0.98] transition-all group"
            :class="draggingReg?.registration_id === reg.registration_id ? 'opacity-40' : ''"
          >
            <i class="ti ti-grip-vertical text-[14px] text-navy-200 group-hover:text-navy-300 flex-shrink-0" aria-hidden="true" />
            <div
              class="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[10px] font-medium flex-shrink-0"
              :class="reg.status === 'WAITLISTED' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'"
            >
              {{ initial(reg.attendee_name) }}
            </div>
            <span class="flex-1 text-[12px] font-medium text-navy-900 truncate">{{ reg.attendee_name }}</span>
            <WorkshopRegistrationStatusBadge :status="reg.status" />
          </div>
          <div v-if="!unassignedRegistrations.length" class="text-[11px] text-navy-300 text-center py-6">
            No unassigned attendees
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Drag action overlay: slides up from the bottom of the viewport while dragging -->
  <Teleport to="body">
    <Transition name="drag-overlay">
      <div
        v-if="isDragging"
        class="fixed bottom-0 left-0 right-0 z-50 flex gap-3 p-4 bg-white/95 backdrop-blur-sm border-t border-deep-navy/10 shadow-2xl"
      >
        <!-- Move to Pending zone -->
        <div
          class="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed py-4 transition-all"
          :class="dragOverZone === 'pending' ? 'bg-amber-50 border-amber-400 scale-[1.02]' : 'border-amber-200'"
          @dragover.prevent="dragOverZone = 'pending'"
          @dragleave.self="dragOverZone = null"
          @drop.prevent="onDropZone('pending')"
        >
          <i class="ti ti-arrow-back-up text-[18px] pointer-events-none" :class="dragOverZone === 'pending' ? 'text-amber-500' : 'text-amber-400'" aria-hidden="true" />
          <span class="text-[13px] font-medium pointer-events-none" :class="dragOverZone === 'pending' ? 'text-amber-700' : 'text-amber-500'">Move to Pending</span>
        </div>

        <!-- Cancel Registration zone -->
        <div
          class="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed py-4 transition-all"
          :class="dragOverZone === 'cancel' ? 'bg-red-50 border-red-400 scale-[1.02]' : 'border-red-200'"
          @dragover.prevent="dragOverZone = 'cancel'"
          @dragleave.self="dragOverZone = null"
          @drop.prevent="onDropZone('cancel')"
        >
          <i class="ti ti-trash text-[18px] pointer-events-none" :class="dragOverZone === 'cancel' ? 'text-red-500' : 'text-red-400'" aria-hidden="true" />
          <span class="text-[13px] font-medium pointer-events-none" :class="dragOverZone === 'cancel' ? 'text-red-700' : 'text-red-500'">Cancel Registration</span>
          <span class="text-[11px] text-red-300 pointer-events-none hidden sm:inline">— hidden 5 min</span>
        </div>

        <!-- Delete Record zone: permanently removes the registration row -->
        <div
          class="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed py-4 transition-all"
          :class="dragOverZone === 'delete' ? 'bg-purple-50 border-purple-500 scale-[1.02]' : 'border-purple-200'"
          @dragover.prevent="dragOverZone = 'delete'"
          @dragleave.self="dragOverZone = null"
          @drop.prevent="onDropZone('delete')"
        >
          <i class="ti ti-database-x text-[18px] pointer-events-none" :class="dragOverZone === 'delete' ? 'text-purple-600' : 'text-purple-400'" aria-hidden="true" />
          <span class="text-[13px] font-medium pointer-events-none" :class="dragOverZone === 'delete' ? 'text-purple-800' : 'text-purple-500'">Delete Record</span>
          <span class="text-[11px] pointer-events-none hidden sm:inline" :class="dragOverZone === 'delete' ? 'text-purple-400' : 'text-purple-300'">— permanent</span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import WorkshopRegistrationStatusBadge from './WorkshopRegistrationStatusBadge.vue'
import {
  useWorkshopRegistrations,
  usePartialUpdateWorkshopRegistration,
  useCancelWorkshopRegistration,
  useDeleteWorkshopRegistration,
} from '~/composables/resources/workshops'
import type { WorkshopList, WorkshopRegistrationList } from '~/api/types.gen'

const props = defineProps<{
  workshops: WorkshopList[]
  eventId: number
}>()

const { $notyf } = useNuxtApp()

const workshopIds = computed(() => props.workshops.map(w => w.id))

const { data: allRegsData, isLoading: allRegsLoading } = useWorkshopRegistrations(
  computed(() => ({
    workshop: undefined,
    page_size: 1000,
  })),
)

// ─── Cancel suppression: keep recently-cancelled registrations off the board ───
const recentlyCancelledIds = ref(new Set<string>())

function suppressCancelled(id: string) {
  recentlyCancelledIds.value = new Set([...recentlyCancelledIds.value, id])
  setTimeout(() => {
    const next = new Set(recentlyCancelledIds.value)
    next.delete(id)
    recentlyCancelledIds.value = next
  }, 5 * 60 * 1000)
}

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

// Filter client-side to only this event's workshops, excluding recently-cancelled
const allRegs = computed<WorkshopRegistrationList[]>(() => {
  const wsIds = new Set(workshopIds.value)
  return (allRegsData.value?.data?.results ?? []).filter(
    r => wsIds.has(r.workshop) && !recentlyCancelledIds.value.has(r.registration_id),
  )
})

const registrationsByWorkshop = computed<Record<number, WorkshopRegistrationList[]>>(() => {
  const map: Record<number, WorkshopRegistrationList[]> = {}
  for (const ws of props.workshops) map[ws.id] = []
  for (const reg of allRegs.value) {
    // Show CONFIRMED first, CANCELLED last so staff can identify and delete duplicates
    if (reg.status === 'CONFIRMED' || reg.status === 'CANCELLED') {
      map[reg.workshop] ??= []
      if (reg.status === 'CONFIRMED') map[reg.workshop].unshift(reg)
      else map[reg.workshop].push(reg)
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

const unassignedRegistrations = computed(() =>
  allRegs.value.filter(r => r.status === 'WAITLISTED' || r.status === 'PENDING_ALLOCATION'),
)

const loadingMap = computed<Record<number, boolean>>(() => {
  const m: Record<number, boolean> = {}
  for (const ws of props.workshops) m[ws.id] = allRegsLoading.value
  return m
})

// ─── Drag & Drop ────────────────────────────────────────────────────────────────
const isDragging = ref(false)
const dragOverWorkshopId = ref<number | null>(null)
const dragOverZone = ref<'pending' | 'cancel' | 'delete' | null>(null)
const draggingReg = ref<WorkshopRegistrationList | null>(null)

function onDragStart(reg: WorkshopRegistrationList) {
  draggingReg.value = reg
  isDragging.value = true
}

function onDragEnd() {
  isDragging.value = false
  dragOverWorkshopId.value = null
  dragOverZone.value = null
  draggingReg.value = null
}

const patchMutation = usePartialUpdateWorkshopRegistration()
const cancelMutation = useCancelWorkshopRegistration()
const deleteMutation = useDeleteWorkshopRegistration()

async function onDrop(targetWorkshopId: number) {
  dragOverWorkshopId.value = null
  isDragging.value = false
  const reg = draggingReg.value
  draggingReg.value = null
  if (!reg) return
  if (reg.workshop === targetWorkshopId && reg.status === 'CONFIRMED') return

  try {
    await patchMutation.mutateAsync({
      registrationId: reg.registration_id,
      body: { workshop: targetWorkshopId, attendee: reg.attendee, status: 'CONFIRMED' },
    })
    $notyf?.success('Attendee assigned.')
  } catch {
    $notyf?.error('Could not assign attendee.')
  }
}

async function onDropZone(zone: 'pending' | 'cancel' | 'delete') {
  dragOverZone.value = null
  isDragging.value = false
  const reg = draggingReg.value
  draggingReg.value = null
  if (!reg) return

  if (zone === 'pending') {
    if (reg.status === 'PENDING_ALLOCATION') return
    try {
      await patchMutation.mutateAsync({
        registrationId: reg.registration_id,
        body: { workshop: reg.workshop, attendee: reg.attendee, status: 'PENDING_ALLOCATION' },
      })
      $notyf?.success('Moved back to pending pool.')
    } catch {
      $notyf?.error('Could not update registration.')
    }
  } else if (zone === 'cancel') {
    try {
      await cancelMutation.mutateAsync(reg.registration_id)
      suppressCancelled(reg.registration_id)
      $notyf?.error('Registration cancelled — hidden from board for 5 minutes.')
    } catch {
      $notyf?.error('Could not cancel registration.')
    }
  } else {
    try {
      await deleteMutation.mutateAsync(reg.registration_id)
      // Suppress immediately; record is gone from DB after query invalidation
      suppressCancelled(reg.registration_id)
      $notyf?.error('Registration record deleted permanently.')
    } catch {
      $notyf?.error('Could not delete registration.')
    }
  }
}

function initial(name: string | undefined): string {
  return String(name ?? '').trim().charAt(0).toUpperCase() || '?'
}
</script>

<style scoped>
.drag-overlay-enter-active,
.drag-overlay-leave-active {
  transition: transform 0.2s ease, opacity 0.15s ease;
}
.drag-overlay-enter-from,
.drag-overlay-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
