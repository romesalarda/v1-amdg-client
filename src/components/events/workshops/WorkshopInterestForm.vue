<template>
  <div class="space-y-4">

    <!-- Loading -->
    <div v-if="isLoadingWorkshops || isLoadingSubmission" class="space-y-2">
      <div v-for="i in 3" :key="i" class="h-12 bg-mist-blue/60 rounded-xl animate-pulse" />
    </div>

    <!-- No workshops on this event -->
    <div v-else-if="!availableWorkshops.length" class="text-center py-8">
      <span class="material-symbols-outlined text-4xl text-navy-200 block mb-2">workspace_premium</span>
      <p class="text-sm text-navy-400">No open workshops available for this event yet.</p>
    </div>

    <template v-else>

      <!-- Finalised banner -->
      <div v-if="isFinalised" class="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
        <span class="material-symbols-outlined text-emerald-600">lock</span>
        <div class="flex-1">
          <p class="text-xs font-bold text-emerald-700">Interest submission locked</p>
          <p class="text-xs text-emerald-600">Your preferences have been submitted. Contact staff if you need to make changes.</p>
        </div>
        <button
          @click="doUnfinalise"
          :disabled="isSaving"
          class="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline disabled:opacity-50"
        >
          Unlock
        </button>
      </div>

      <!-- Dirty warning -->
      <div v-if="isDirty && !isFinalised" class="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
        <span class="material-symbols-outlined text-amber-500 text-sm">warning</span>
        <p class="text-xs text-amber-700 flex-1">You have unsaved changes.</p>
        <button @click="doSave" :disabled="isSaving" class="text-xs font-bold text-amber-700 hover:text-amber-900 underline disabled:opacity-50">Save</button>
      </div>

      <!-- Two-column layout -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

        <!-- Available (unranked) -->
        <div>
          <h4 class="text-[10px] font-black text-navy-400 uppercase tracking-widest mb-2">Available Workshops</h4>
          <div
            class="min-h-[80px] rounded-xl border-2 border-dashed border-navy-100 bg-mist-blue/20 p-2 space-y-2 transition-colors"
            :class="{ 'border-primary/30 bg-primary/5': dragOver === 'unranked' }"
            @dragover.prevent="dragOver = 'unranked'"
            @dragleave="dragOver = null"
            @drop.prevent="onDropToUnranked"
          >
            <p v-if="!unrankedWorkshops.length" class="text-xs text-navy-300 text-center py-3">
              All workshops ranked
            </p>
            <div
              v-for="workshop in unrankedWorkshops"
              :key="workshop.id"
              draggable="true"
              @dragstart="onDragStart('unranked', workshop.id)"
              @dragend="dragOver = null"
              class="flex items-center gap-2 bg-white rounded-lg border border-deep-navy/10 px-3 py-2 cursor-grab select-none hover:border-primary/40 transition-colors"
            >
              <span class="material-symbols-outlined text-sm text-navy-300">drag_indicator</span>
              <span class="flex-1 text-xs font-semibold text-navy-900 truncate">{{ workshop.title }}</span>
              <button
                v-if="!isFinalised"
                @click="addToRanked(workshop.id)"
                class="text-primary hover:bg-primary/10 rounded p-0.5 transition-colors"
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
            :class="{ 'border-primary/60 bg-primary/10': dragOver === 'ranked' }"
            @dragover.prevent="dragOver = 'ranked'"
            @dragleave="dragOver = null"
            @drop.prevent="onDropToRanked"
          >
            <p v-if="!rankedWorkshops.length" class="text-xs text-navy-300 text-center py-3">
              Drag workshops here to rank them
            </p>
            <div
              v-for="(workshop, index) in rankedWorkshops"
              :key="workshop.id"
              draggable="true"
              @dragstart="onDragStart('ranked', workshop.id, index)"
              @dragover.prevent="dragOverRankedIndex = index"
              @dragleave="dragOverRankedIndex = null"
              @drop.prevent="onDropOntoRankedItem(index)"
              @dragend="dragOver = null; dragOverRankedIndex = null"
              class="flex items-center gap-2 bg-white rounded-lg border px-3 py-2 cursor-grab select-none transition-colors"
              :class="dragOverRankedIndex === index ? 'border-primary bg-primary/5' : 'border-deep-navy/10'"
            >
              <span class="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">
                {{ index + 1 }}
              </span>
              <span class="material-symbols-outlined text-sm text-navy-300">drag_indicator</span>
              <span class="flex-1 text-xs font-semibold text-navy-900 truncate">{{ workshop.title }}</span>
              <button
                v-if="!isFinalised"
                @click="removeFromRanked(workshop.id)"
                class="text-navy-400 hover:text-red-500 hover:bg-red-50 rounded p-0.5 transition-colors"
                title="Remove from ranking"
              >
                <span class="material-symbols-outlined text-sm">close</span>
              </button>
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useWorkshopInterestEditor } from '~/composables/workshops/useWorkshopInterestEditor'

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
  unfinalise,
} = useWorkshopInterestEditor(
  () => props.eventId,
  () => props.eventUuid,
  () => props.attendeeId,
)

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

async function doUnfinalise() {
  await unfinalise()
}
</script>
