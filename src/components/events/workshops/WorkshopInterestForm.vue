<template>
  <div class="space-y-4">

    <!-- Loading -->
    <div v-if="isLoadingWorkshops || isLoadingSubmission" class="space-y-2">
      <div v-for="i in 3" :key="i" class="h-12 bg-mist-blue/60 rounded-xl animate-pulse" />
    </div>

    <!-- No workshops on this event -->
    <div v-else-if="!availableWorkshops.length && !closedWorkshops.length" class="text-center py-8">
      <span class="material-symbols-outlined text-4xl text-navy-200 block mb-2">workspace_premium</span>
      <p class="text-sm text-navy-400">No workshops available for this event yet.</p>
    </div>

    <template v-else>

      <!-- Finalised banner — no unlock button once submitted -->
      <div v-if="isFinalised" class="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
        <span class="material-symbols-outlined text-emerald-600">check_circle</span>
        <div class="flex-1">
          <p class="text-xs font-bold text-emerald-700">Preferences submitted</p>
          <p class="text-xs text-emerald-600">Your workshop preferences have been locked in. Contact staff if you need to make changes.</p>
        </div>
      </div>

      <!-- Dirty warning -->
      <div v-if="isDirty && !isFinalised" class="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
        <span class="material-symbols-outlined text-amber-500 text-sm">warning</span>
        <p class="text-xs text-amber-700 flex-1">You have unsaved changes.</p>
        <button @click="doSave" :disabled="isSaving" class="text-xs font-bold text-amber-700 hover:text-amber-900 underline disabled:opacity-50">Save</button>
      </div>

      <!-- Two-column ranking layout (only when there are OPEN workshops) -->
      <template v-if="availableWorkshops.length">

        <!-- Workshop info modal -->
        <WorkshopInfoModal v-model="infoModalOpen" :workshop-id="infoModalWorkshopId" />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

          <!-- Available (unranked) -->
          <div>
            <h4 class="text-[10px] font-black text-navy-400 uppercase tracking-widest mb-2">Available Workshops</h4>
            <div
              class="min-h-[80px] rounded-xl border-2 border-dashed border-navy-100 bg-mist-blue/20 p-2 space-y-2 transition-colors"
              :class="{ 'border-primary/30 bg-primary/5': !isFinalised && dragOver === 'unranked' }"
              @dragover.prevent="!isFinalised && (dragOver = 'unranked')"
              @dragleave="dragOver = null"
              @drop.prevent="!isFinalised && onDropToUnranked()"
            >
              <p v-if="!unrankedWorkshops.length" class="text-xs text-navy-300 text-center py-3">
                All workshops ranked
              </p>
              <div
                v-for="workshop in unrankedWorkshops"
                :key="workshop.id"
                :draggable="!isFinalised"
                @dragstart="!isFinalised && onDragStart('unranked', workshop.id)"
                @dragend="dragOver = null"
                class="flex items-center gap-2 bg-white rounded-lg border border-deep-navy/10 px-3 py-2.5 select-none transition-colors"
                :class="isFinalised ? 'cursor-default opacity-70' : 'cursor-grab hover:border-primary/40'"
              >
                <!-- Thumbnail -->
                <div class="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-mist-blue flex items-center justify-center">
                  <img
                    v-if="workshop.landing_image"
                    :src="workshop.landing_image"
                    :alt="workshop.title"
                    class="w-full h-full object-cover"
                  />
                  <span v-else class="material-symbols-outlined text-base text-navy-300">workspace_premium</span>
                </div>
                <!-- Title + date -->
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-semibold text-navy-900 truncate">{{ workshop.title }}</p>
                  <p class="text-[10px] text-navy-400 truncate">{{ formatWorkshopDate(workshop.date) }}</p>
                </div>
                <!-- Info button -->
                <button
                  @click.stop="openInfoModal(workshop.id)"
                  class="text-navy-300 hover:text-primary hover:bg-primary/10 rounded p-0.5 transition-colors flex-shrink-0"
                  title="View details"
                >
                  <span class="material-symbols-outlined text-sm">info</span>
                </button>
                <!-- Add to ranked button -->
                <button
                  v-if="!isFinalised"
                  @click="addToRanked(workshop.id)"
                  class="text-primary hover:bg-primary/10 rounded p-0.5 transition-colors flex-shrink-0"
                  title="Add to ranking"
                >
                  <span class="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Ranked -->
          <div>
            <h4 class="text-[10px] font-black text-navy-400 uppercase tracking-widest mb-2">Your Preferences (1 = top choice)</h4>
            <div
              class="min-h-[80px] rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 p-2 space-y-2 transition-colors"
              :class="{ 'border-primary/60 bg-primary/10': !isFinalised && dragOver === 'ranked' }"
              @dragover.prevent="!isFinalised && (dragOver = 'ranked')"
              @dragleave="dragOver = null"
              @drop.prevent="!isFinalised && onDropToRanked()"
            >
              <p v-if="!rankedWorkshops.length" class="text-xs text-navy-300 text-center py-3">
                Drag workshops here to rank them
              </p>
              <div
                v-for="(workshop, index) in rankedWorkshops"
                :key="workshop.id"
                :draggable="!isFinalised"
                @dragstart="!isFinalised && onDragStart('ranked', workshop.id, index)"
                @dragover.prevent="!isFinalised && (dragOverRankedIndex = index)"
                @dragleave="dragOverRankedIndex = null"
                @drop.prevent="!isFinalised && onDropOntoRankedItem(index)"
                @dragend="dragOver = null; dragOverRankedIndex = null"
                class="flex items-center gap-2 bg-white rounded-lg border px-3 py-2.5 select-none transition-colors"
                :class="[
                  isFinalised ? 'cursor-default' : 'cursor-grab',
                  !isFinalised && dragOverRankedIndex === index ? 'border-primary bg-primary/5' : 'border-deep-navy/10',
                ]"
              >
                <span class="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">
                  {{ index + 1 }}
                </span>
                <span class="material-symbols-outlined text-sm text-navy-300">drag_indicator</span>
                <!-- Thumbnail -->
                <div class="flex-shrink-0 w-8 h-8 rounded-md overflow-hidden bg-gradient-to-br from-primary/20 to-mist-blue flex items-center justify-center">
                  <img
                    v-if="workshop.landing_image"
                    :src="workshop.landing_image"
                    :alt="workshop.title"
                    class="w-full h-full object-cover"
                  />
                  <span v-else class="material-symbols-outlined text-xs text-navy-300">workspace_premium</span>
                </div>
                <!-- Title + date -->
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-semibold text-navy-900 truncate">{{ workshop.title }}</p>
                  <p class="text-[10px] text-navy-400 truncate">{{ formatWorkshopDate(workshop.date) }}</p>
                </div>
                <!-- Info button -->
                <button
                  @click.stop="openInfoModal(workshop.id)"
                  class="text-navy-300 hover:text-primary hover:bg-primary/10 rounded p-0.5 transition-colors flex-shrink-0"
                  title="View details"
                >
                  <span class="material-symbols-outlined text-sm">info</span>
                </button>
                <!-- Remove / status -->
                <button
                  v-if="!isFinalised"
                  @click="removeFromRanked(workshop.id)"
                  class="text-navy-400 hover:text-red-500 hover:bg-red-50 rounded p-0.5 transition-colors flex-shrink-0"
                  title="Remove from ranking"
                >
                  <span class="material-symbols-outlined text-sm">close</span>
                </button>
                <span v-else class="material-symbols-outlined text-sm text-emerald-500 flex-shrink-0">check</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Action buttons -->
        <div v-if="!isFinalised" class="flex items-center justify-end gap-3 pt-2">
          <button
            v-if="isDirty"
            @click="doSave"
            :disabled="isSaving"
            class="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-navy-700 border border-deep-navy/20 rounded-xl hover:bg-mist-blue transition-colors disabled:opacity-50"
          >
            <span v-if="isSaving" class="material-symbols-outlined text-sm animate-spin">refresh</span>
            Save Draft
          </button>
          <button
            @click="doFinalise"
            :disabled="isSaving || rankedWorkshops.length === 0"
            class="flex items-center gap-1.5 px-5 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <span v-if="isSaving" class="material-symbols-outlined text-sm animate-spin">refresh</span>
            <span v-else class="material-symbols-outlined text-sm">check</span>
            Submit Preferences
          </button>
        </div>
      </template>

      <!-- Closed workshops (read-only) -->
      <div v-if="closedWorkshops.length">
        <h4 class="text-[10px] font-black text-navy-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <span class="material-symbols-outlined text-sm text-navy-300">lock</span>
          Closed Workshops
        </h4>
        <div class="space-y-1.5">
          <div
            v-for="workshop in closedWorkshops"
            :key="workshop.id"
            class="flex items-center gap-2 bg-navy-50/60 rounded-lg border border-deep-navy/10 px-3 py-2 opacity-60"
          >
            <span class="material-symbols-outlined text-sm text-navy-300">lock</span>
            <span class="flex-1 text-xs font-semibold text-navy-600 truncate">{{ workshop.title }}</span>
            <span class="text-[10px] font-bold text-navy-400 uppercase tracking-wide">Closed</span>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useWorkshopInterestEditor } from '~/composables/workshops/useWorkshopInterestEditor'
import WorkshopInfoModal from '~/components/events/workshops/WorkshopInfoModal.vue'

const props = defineProps<{
  eventId: string
  eventUuid: string
  attendeeId: string
}>()

const emit = defineEmits<{
  saved: []
  finalised: []
}>()

const {
  availableWorkshops,
  closedWorkshops,
  rankedWorkshops,
  unrankedWorkshops,
  isFinalised,
  isDirty,
  isLoadingWorkshops,
  isLoadingSubmission,
  isSaving,
  addToRanked,
  removeFromRanked,
  reorder,
  saveRanks,
  finalise,
} = useWorkshopInterestEditor(
  () => props.eventId,
  () => props.eventUuid,
  () => props.attendeeId,
)

// ─── Info modal state ─────────────────────────────────────────────────────────
const infoModalOpen = ref(false)
const infoModalWorkshopId = ref<number | null>(null)

function openInfoModal(workshopId: number) {
  infoModalWorkshopId.value = workshopId
  infoModalOpen.value = true
}

// ─── Drag state ────────────────────────────────────────────────────────────────
const dragOver = ref<'ranked' | 'unranked' | null>(null)
const dragOverRankedIndex = ref<number | null>(null)

let draggingFrom: 'ranked' | 'unranked' | null = null
let draggingWorkshopId: number | null = null
let draggingFromIndex: number | null = null

function onDragStart(from: 'ranked' | 'unranked', workshopId: number, index?: number) {
  draggingFrom = from
  draggingWorkshopId = workshopId
  draggingFromIndex = index ?? null
}

function onDropToRanked() {
  if (draggingWorkshopId === null) return
  if (draggingFrom === 'unranked') {
    addToRanked(draggingWorkshopId)
  }
  dragOver.value = null
}

function onDropToUnranked() {
  if (draggingWorkshopId === null) return
  if (draggingFrom === 'ranked') {
    removeFromRanked(draggingWorkshopId)
  }
  dragOver.value = null
}

function onDropOntoRankedItem(toIndex: number) {
  if (draggingWorkshopId === null) return
  if (draggingFrom === 'unranked') {
    addToRanked(draggingWorkshopId)
    const newIndex = rankedWorkshops.value.findIndex(w => w.id === draggingWorkshopId)
    if (newIndex !== -1 && newIndex !== toIndex) reorder(newIndex, toIndex)
  } else if (draggingFrom === 'ranked' && draggingFromIndex !== null) {
    reorder(draggingFromIndex, toIndex)
  }
  dragOver.value = null
  dragOverRankedIndex.value = null
}

async function doSave() {
  await saveRanks()
  emit('saved')
}

async function doFinalise() {
  await finalise()
  emit('finalised')
}

// ─── Date helper ───────────────────────────────────────────────────────────────
function formatWorkshopDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })
    + ' · '
    + d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: true })
}
</script>
