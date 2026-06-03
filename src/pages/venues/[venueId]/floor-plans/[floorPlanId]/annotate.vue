<template>
  <div class="flex flex-col h-screen bg-mist-blue/20 overflow-hidden">

    <!-- ── Header ──────────────────────────────────────────────────── -->
    <header class="flex items-center gap-3 px-6 py-3 bg-white border-b border-deep-navy/10 shadow-sm shrink-0">
      <NuxtLink
        :to="`/venues/${venueId}/floor-plans`"
        class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-deep-navy/15 text-xs font-semibold text-navy-600 hover:bg-mist-blue/60 shrink-0"
      >
        <span class="material-symbols-outlined text-sm">apartment</span>
        Floor Plans
      </NuxtLink>
      <div class="min-w-0 flex-1">
        <h1 class="text-base font-black text-deep-navy truncate">Floor Plan Annotator</h1>
        <p v-if="currentFloorPlan?.name" class="text-xs text-navy-400 truncate">{{ currentFloorPlan.name }}</p>
      </div>
    </header>

    <!-- ── Floor switcher ──────────────────────────────────────────── -->
    <div v-if="allFloorPlans.length > 1" class="flex items-center gap-1 px-5 py-2 bg-white border-b border-deep-navy/10 shrink-0 overflow-x-auto">
      <button
        v-for="fp in allFloorPlans"
        :key="fp.id"
        type="button"
        :class="[
          'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors',
          currentFloorPlanId === String(fp.id)
            ? 'bg-primary text-white shadow-sm'
            : 'text-navy-600 hover:bg-mist-blue/60 border border-deep-navy/10',
        ]"
        @click="switchFloorPlan(fp.id)"
      >
        L{{ fp.level }}<span v-if="fp.level_label"> — {{ fp.level_label }}</span>
        <span class="ml-1 opacity-70 font-normal">{{ fp.name }}</span>
      </button>
    </div>

    <!-- ── Main layout ─────────────────────────────────────────────── -->
    <div class="flex flex-1 overflow-hidden">

      <!-- Left panel: canvas ───────────────────────────────────────── -->
      <div class="flex flex-col flex-1 overflow-hidden p-4 gap-3">

        <!-- Toolbar -->
        <div class="flex items-center gap-3 shrink-0 bg-white rounded-2xl border border-deep-navy/10 shadow-sm px-3 py-2">
          <!-- Mode toggle -->
          <div class="flex items-center rounded-xl bg-mist-blue/60 p-0.5 gap-0.5">
            <button
              type="button"
              :class="[
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                mode === 'VIEW' ? 'bg-white text-primary shadow-sm' : 'text-navy-500 hover:text-navy-700',
              ]"
              @click="setMode('VIEW')"
            >
              <span class="material-symbols-outlined text-sm leading-none">visibility</span>
              View
            </button>
            <button
              type="button"
              :class="[
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                mode === 'DRAW' ? 'bg-white text-primary shadow-sm' : 'text-navy-500 hover:text-navy-700',
              ]"
              @click="setMode('DRAW')"
            >
              <span class="material-symbols-outlined text-sm leading-none">draw</span>
              Draw
            </button>
          </div>

          <!-- Hint -->
          <span v-if="mode === 'DRAW'" class="text-xs text-navy-400 hidden sm:block">
            Click to place vertices · Click first vertex to close
          </span>

          <!-- Cancel in-progress draw -->
          <button
            v-if="mode === 'DRAW' && drawVertices.length > 0"
            type="button"
            class="ml-auto inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-red-500 border border-red-200 bg-red-50 hover:bg-red-100 transition-colors"
            @click="cancelDraw"
          >
            <span class="material-symbols-outlined text-sm leading-none">cancel</span>
            Cancel
          </button>
        </div>

        <!-- Canvas container -->
        <div
          ref="canvasContainerRef"
          class="flex-1 bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden relative"
          :class="mode === 'DRAW' ? 'cursor-crosshair' : 'cursor-default'"
        >
          <div v-if="!currentFloorPlan?.image_url" class="absolute inset-0 flex flex-col items-center justify-center text-navy-400 gap-2">
            <span class="material-symbols-outlined text-4xl text-navy-300">image</span>
            <p class="text-sm font-medium">No floor plan image</p>
          </div>

          <client-only>
            <v-stage
              v-if="stageSize.width > 0 && currentFloorPlan?.image_url"
              ref="stageRef"
              :config="stageConfig"
              @click="handleStageClick"
              @mousemove="handleMouseMove"
            >
              <!-- Layer 1: Background image -->
              <v-layer>
                <v-image v-if="bgImage" :config="bgImageConfig" />
              </v-layer>

              <!-- Layer 2: Saved annotations -->
              <v-layer>
                <template v-for="ann in visibleSavedAnnotations" :key="`saved-${ann.id}`">
                  <v-line :config="savedAnnotationConfig(ann)" @click.stop="handleAnnotationClick(ann.id)" />
                  <v-text :config="annotationLabelConfig(ann.vertices, ann.label, false)" />
                </template>
              </v-layer>

              <!-- Layer 3: Pending new annotations -->
              <v-layer>
                <template v-for="ann in pendingCreates" :key="`pending-${ann.tempId}`">
                  <v-line :config="pendingAnnotationConfig(ann)" />
                  <v-text :config="annotationLabelConfig(ann.vertices, ann.label, true)" />
                </template>
                <!-- Pending updates (modified saved annotations) -->
                <template v-for="[savedId, update] in pendingUpdatesEntries" :key="`update-${savedId}`">
                  <v-line :config="pendingUpdateConfig(savedId, update)" />
                </template>
              </v-layer>

              <!-- Layer 4: Draw-in-progress -->
              <v-layer>
                <v-line v-if="drawVertices.length > 1" :config="drawInProgressConfig" />
                <v-line v-if="drawVertices.length > 0 && cursorPos" :config="drawPreviewConfig" />
                <!-- First vertex close-indicator -->
                <v-circle v-if="drawVertices.length > 0" :config="firstVertexConfig" />
                <!-- All placed vertices -->
                <v-circle
                  v-for="(v, i) in drawPixelVertices"
                  :key="`dv-${i}`"
                  :config="{ x: v.x, y: v.y, radius: 4, fill: '#2375CA', stroke: 'white', strokeWidth: 1.5 }"
                />
              </v-layer>
            </v-stage>
          </client-only>
        </div>
      </div>

      <!-- Right panel: annotation list + save ─────────────────────── -->
      <div class="w-80 shrink-0 flex flex-col bg-white border-l border-deep-navy/10 overflow-hidden">
        <div class="px-4 py-3 border-b border-navy-50 flex items-center justify-between">
          <h2 class="text-xs font-black text-primary uppercase tracking-widest">Annotations</h2>
          <span class="text-xs font-bold text-navy-400 bg-navy-50 rounded-full px-2 py-0.5">{{ allAnnotationsCount }}</span>
        </div>

        <div class="flex-1 overflow-y-auto p-3 space-y-2">
          <!-- Saved annotations -->
          <div
            v-for="ann in savedAnnotations"
            :key="`list-saved-${ann.id}`"
            :class="[
              'rounded-xl border p-3 cursor-pointer transition-colors',
              selectedId === ann.id ? 'border-primary/40 bg-primary/5' : 'border-deep-navy/10 hover:bg-mist-blue/20',
              pendingDeletes.has(ann.id) ? 'opacity-40 line-through' : '',
            ]"
            @click="selectAnnotation(ann.id)"
          >
            <div class="flex items-start gap-2">
              <span
                class="w-3 h-3 rounded-full shrink-0 mt-1 border border-white shadow-sm"
                :style="{ backgroundColor: getPendingColour(ann) }"
              />
              <div class="flex-1 min-w-0">
                <p class="text-xs font-semibold text-navy-900 truncate">{{ getPendingLabel(ann) }}</p>
                <p v-if="ann.room_venue_name" class="text-[10px] text-navy-400 truncate">
                  <span class="material-symbols-outlined text-xs align-middle">meeting_room</span>
                  {{ ann.room_venue_name }}
                </p>
                <span
                  v-if="pendingUpdates.has(ann.id) || pendingDeletes.has(ann.id)"
                  class="text-[9px] uppercase tracking-wider font-black px-1 py-0.5 rounded"
                  :class="pendingDeletes.has(ann.id) ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'"
                >
                  {{ pendingDeletes.has(ann.id) ? 'Deleted' : 'Modified' }}
                </span>
              </div>
              <div class="flex gap-0.5 shrink-0">
                <button
                  type="button"
                  class="icon-btn"
                  title="Edit"
                  @click.stop="openEditDrawer(ann)"
                >
                  <span class="material-symbols-outlined text-sm">edit</span>
                </button>
                <button
                  v-if="!pendingDeletes.has(ann.id)"
                  type="button"
                  class="icon-btn text-red-400"
                  title="Delete"
                  @click.stop="markDelete(ann.id)"
                >
                  <span class="material-symbols-outlined text-sm">delete</span>
                </button>
                <button
                  v-else
                  type="button"
                  class="icon-btn text-navy-400"
                  title="Restore"
                  @click.stop="pendingDeletes.delete(ann.id)"
                >
                  <span class="material-symbols-outlined text-sm">undo</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Pending creates -->
          <div
            v-for="ann in pendingCreates"
            :key="`list-pending-${ann.tempId}`"
            :class="[
              'rounded-xl border border-dashed p-3 cursor-pointer transition-colors border-primary/40',
              selectedId === ann.tempId ? 'bg-primary/5' : 'hover:bg-mist-blue/20',
            ]"
            @click="selectedId = ann.tempId"
          >
            <div class="flex items-start gap-2">
              <span
                class="w-3 h-3 rounded-full shrink-0 mt-1 border border-white shadow-sm"
                :style="{ backgroundColor: ann.colour }"
              />
              <div class="flex-1 min-w-0">
                <p class="text-xs font-semibold text-navy-900 truncate">{{ ann.label }}</p>
                <span class="text-[9px] uppercase tracking-wider font-black px-1 py-0.5 rounded bg-primary/10 text-primary">New</span>
              </div>
              <div class="flex gap-0.5 shrink-0">
                <button type="button" class="icon-btn" title="Edit" @click.stop="openEditPendingDrawer(ann)">
                  <span class="material-symbols-outlined text-sm">edit</span>
                </button>
                <button type="button" class="icon-btn text-red-400" title="Remove" @click.stop="removePendingCreate(ann.tempId)">
                  <span class="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </div>
          </div>

          <div v-if="allAnnotationsCount === 0" class="flex flex-col items-center justify-center py-8 text-center text-navy-400">
            <span class="material-symbols-outlined text-3xl mb-1 text-navy-300">polyline</span>
            <p class="text-sm font-medium">No annotations yet</p>
            <p class="text-xs text-navy-300">Switch to Draw mode to add polygons</p>
          </div>
        </div>

        <!-- Selected annotation details -->
        <div v-if="selectedAnnotation" class="border-t border-navy-50 p-3 bg-mist-blue/10">
          <p class="text-[10px] font-black text-navy-400 uppercase tracking-wider mb-1">Selected</p>
          <p class="text-sm font-semibold text-navy-900">{{ selectedAnnotation.label }}</p>
          <p v-if="selectedAnnotation.room_venue_name" class="text-xs text-navy-500 mt-0.5">
            Room: {{ selectedAnnotation.room_venue_name }}
          </p>
          <div v-if="selectedAnnotation.metadata?.length" class="mt-2 space-y-1">
            <div v-for="meta in selectedAnnotation.metadata" :key="meta.id" class="flex gap-2 text-xs">
              <span class="font-semibold text-navy-700 shrink-0">{{ meta.label }}:</span>
              <span class="text-navy-500">{{ meta.value || '—' }}</span>
            </div>
          </div>
        </div>

        <!-- Save button -->
        <div class="p-3 border-t border-navy-50 shrink-0">
          <div v-if="hasPendingChanges" class="text-[10px] text-amber-600 font-semibold mb-2 flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">warning</span>
            {{ pendingChangeSummary }}
          </div>
          <button
            type="button"
            :disabled="!hasPendingChanges || isSaving"
            :class="[
              'w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-colors',
              hasPendingChanges && !isSaving ? 'bg-primary text-white hover:bg-primary/90' : 'bg-navy-100 text-navy-400 cursor-not-allowed',
            ]"
            @click="saveAll"
          >
            <span v-if="isSaving" class="material-symbols-outlined text-base animate-spin">progress_activity</span>
            <span v-else class="material-symbols-outlined text-base">save</span>
            {{ isSaving ? 'Saving…' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── Annotation Drawer (slide-over) ─────────────────────────── -->
    <Transition name="drawer">
      <div v-if="drawerOpen" class="fixed inset-0 z-50 flex">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/30" @click="closeDrawer" />
        <!-- Panel -->
        <div class="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col">
          <div class="flex items-center justify-between px-5 py-4 border-b border-navy-50">
            <h2 class="text-sm font-black text-deep-navy">
              {{ drawerMode === 'create' ? 'New Annotation' : 'Edit Annotation' }}
            </h2>
            <button type="button" class="icon-btn" @click="closeDrawer">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-5 space-y-4">
            <!-- Label -->
            <div>
              <label class="block text-xs font-black text-navy-400 uppercase tracking-wider mb-1">Label *</label>
              <input
                v-model="drawerForm.label"
                type="text"
                required
                placeholder="e.g. Main Hall, Storage Room"
                class="input"
              />
            </div>

            <!-- Colour -->
            <div>
              <label class="block text-xs font-black text-navy-400 uppercase tracking-wider mb-1">Colour</label>
              <div class="flex items-center gap-3">
                <input v-model="drawerForm.colour" type="color" class="w-10 h-10 rounded cursor-pointer border border-deep-navy/15" />
                <input v-model="drawerForm.colour" type="text" placeholder="#4F46E5" class="input flex-1" />
              </div>
            </div>

            <!-- Link to Room -->
            <div>
              <label class="block text-xs font-black text-navy-400 uppercase tracking-wider mb-1">Link to Room</label>
              <select v-model="drawerForm.room_venue" class="input">
                <option :value="null">— None —</option>
                <option v-for="room in venueRooms" :key="room.id" :value="room.id">
                  {{ room.room_name }}{{ room.capacity ? ` (cap ${room.capacity})` : '' }}
                </option>
              </select>
            </div>

            <!-- Metadata key-value pairs -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="text-xs font-black text-navy-400 uppercase tracking-wider">Metadata</label>
                <button type="button" class="text-xs text-primary font-semibold hover:underline" @click="addMetaRow">
                  + Add
                </button>
              </div>
              <div class="space-y-2">
                <div v-for="(meta, idx) in drawerForm.metadata" :key="idx" class="flex gap-2 items-start">
                  <input v-model="meta.label" type="text" placeholder="Label" class="input flex-1" />
                  <input v-model="meta.value" type="text" placeholder="Value" class="input flex-1" />
                  <button type="button" class="icon-btn text-red-400 shrink-0 mt-0.5" @click="removeMetaRow(idx)">
                    <span class="material-symbols-outlined text-sm">remove_circle</span>
                  </button>
                </div>
              </div>
              <p v-if="!drawerForm.metadata.length" class="text-xs text-navy-400 italic">No metadata entries</p>
            </div>
          </div>

          <div class="p-5 border-t border-navy-50 flex gap-3">
            <button type="button" class="btn-secondary flex-1" @click="closeDrawer">Cancel</button>
            <button
              type="button"
              :disabled="!drawerForm.label.trim()"
              :class="['btn-primary flex-1', !drawerForm.label.trim() ? 'opacity-50 cursor-not-allowed' : '']"
              @click="confirmDrawer"
            >
              {{ drawerMode === 'create' ? 'Add Annotation' : 'Update Annotation' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useFloorPlans, useFloorPlan } from '~/composables/resources/venues/floorPlans'
import {
  useCreateFloorPlanAnnotation,
  useUpdateFloorPlanAnnotation,
  useDeleteFloorPlanAnnotation,
} from '~/composables/resources/venues/floorPlanAnnotations'
import type { FloorPlanAnnotationItem } from '~/composables/resources/venues/floorPlans'
import { locationsRoomsList } from '~/api/sdk.gen'
import { useQueryClient } from '@tanstack/vue-query'

definePageMeta({
  layout: 'default',
  middleware: ['auth'],
})

// ── Route params ──────────────────────────────────────────────────────────
const route = useRoute()
const toast = useToast()
const queryClient = useQueryClient()

const venueId = computed(() => String(route.params.venueId))
const initialFloorPlanId = computed(() => String(route.params.floorPlanId))

// Active floor plan id (can be changed via floor switcher)
const currentFloorPlanId = ref(initialFloorPlanId.value)

// ── Data fetching ─────────────────────────────────────────────────────────
const { data: floorPlansResponse } = useFloorPlans(venueId)
const allFloorPlans = computed(() => {
  const data = floorPlansResponse.value?.data
  if (!data) return []
  const items = (data as any).results ?? data
  return (Array.isArray(items) ? items : []).sort(
    (a: any, b: any) => a.level - b.level || a.name.localeCompare(b.name),
  )
})

const { data: floorPlanResponse } = useFloorPlan(venueId, currentFloorPlanId)
const currentFloorPlan = computed(() => {
  const data = floorPlanResponse.value?.data
  return data ?? null
})
const savedAnnotations = computed<FloorPlanAnnotationItem[]>(() => {
  return (currentFloorPlan.value as any)?.annotations ?? []
})

// Rooms for RoomVenue dropdown
const venueRoomsResponse = ref<any>(null)
const venueRooms = computed(() => {
  const d = venueRoomsResponse.value?.data
  if (!d) return []
  return (d.results ?? d) as { id: number; room_name: string; capacity: number | null }[]
})

onMounted(async () => {
  try {
    venueRoomsResponse.value = await locationsRoomsList({ query: { venue: venueId.value, page_size: 200 } as any })
  } catch (_) {
    // Non-critical, dropdown will be empty
  }
})

// ── Canvas / Konva setup ──────────────────────────────────────────────────
const canvasContainerRef = ref<HTMLElement | null>(null)
const stageRef = ref<any>(null)
const stageSize = reactive({ width: 0, height: 0 })
const bgImage = ref<HTMLImageElement | null>(null)

let resizeObserver: ResizeObserver | null = null

function updateStageSize() {
  if (!canvasContainerRef.value) return
  const { offsetWidth, offsetHeight } = canvasContainerRef.value
  stageSize.width = offsetWidth
  stageSize.height = offsetHeight
}

onMounted(() => {
  nextTick(() => {
    updateStageSize()
    resizeObserver = new ResizeObserver(updateStageSize)
    if (canvasContainerRef.value) resizeObserver.observe(canvasContainerRef.value)
  })
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})

// Load background image when floor plan changes
watch(
  () => currentFloorPlan.value?.image_url,
  (url) => {
    if (!url) { bgImage.value = null; return }
    const img = new Image()
    img.src = url
    img.onload = () => { bgImage.value = img }
  },
  { immediate: true },
)

const stageConfig = computed(() => ({ width: stageSize.width, height: stageSize.height }))

const bgImageConfig = computed(() => {
  if (!bgImage.value || !stageSize.width) return {}
  const origW = currentFloorPlan.value?.original_width ?? bgImage.value.naturalWidth
  const origH = currentFloorPlan.value?.original_height ?? bgImage.value.naturalHeight
  const scale = Math.min(stageSize.width / origW, stageSize.height / origH)
  const w = origW * scale
  const h = origH * scale
  return {
    image: bgImage.value,
    x: (stageSize.width - w) / 2,
    y: (stageSize.height - h) / 2,
    width: w,
    height: h,
  }
})

// Offset/scale helpers to convert between normalised and pixel coords
function normToPixel(v: { x: number; y: number }) {
  const cfg = bgImageConfig.value as any
  if (!cfg.width) return { x: 0, y: 0 }
  return {
    x: cfg.x + v.x * cfg.width,
    y: cfg.y + v.y * cfg.height,
  }
}

function pixelToNorm(px: { x: number; y: number }) {
  const cfg = bgImageConfig.value as any
  if (!cfg.width) return { x: 0, y: 0 }
  return {
    x: Math.min(1, Math.max(0, (px.x - cfg.x) / cfg.width)),
    y: Math.min(1, Math.max(0, (px.y - cfg.y) / cfg.height)),
  }
}

function normVerticesToPoints(vertices: { x: number; y: number }[]) {
  return vertices.flatMap((v) => {
    const p = normToPixel(v)
    return [p.x, p.y]
  })
}

function centroid(vertices: { x: number; y: number }[]) {
  const sum = vertices.reduce((acc, v) => ({ x: acc.x + v.x, y: acc.y + v.y }), { x: 0, y: 0 })
  return { x: sum.x / vertices.length, y: sum.y / vertices.length }
}

// ── Mode & draw state ─────────────────────────────────────────────────────
const mode = ref<'VIEW' | 'DRAW'>('VIEW')
const drawVertices = ref<{ x: number; y: number }[]>([]) // normalised
const cursorPos = ref<{ x: number; y: number } | null>(null)
const selectedId = ref<number | string | null>(null)

const drawPixelVertices = computed(() =>
  drawVertices.value.map(normToPixel),
)

function setMode(m: 'VIEW' | 'DRAW') {
  mode.value = m
  if (m === 'VIEW') cancelDraw()
}

function cancelDraw() {
  drawVertices.value = []
  cursorPos.value = null
}

// ── Draw-in-progress Konva configs ────────────────────────────────────────
const CLOSE_THRESHOLD_PX = 10

const isNearFirstVertex = computed(() => {
  if (drawVertices.value.length < 2 || !cursorPos.value) return false
  const first = normToPixel(drawVertices.value[0])
  const dx = cursorPos.value.x - first.x
  const dy = cursorPos.value.y - first.y
  return Math.sqrt(dx * dx + dy * dy) < CLOSE_THRESHOLD_PX
})

const firstVertexConfig = computed(() => {
  if (!drawPixelVertices.value.length) return {}
  const p = drawPixelVertices.value[0]
  return {
    x: p.x,
    y: p.y,
    radius: isNearFirstVertex.value ? 8 : 5,
    fill: isNearFirstVertex.value ? '#ef4444' : '#2375CA',
    stroke: 'white',
    strokeWidth: 2,
  }
})

const drawInProgressConfig = computed(() => ({
  points: drawPixelVertices.value.flatMap((v) => [v.x, v.y]),
  stroke: '#2375CA',
  strokeWidth: 2,
  lineCap: 'round' as const,
  lineJoin: 'round' as const,
  dash: [6, 3],
}))

const drawPreviewConfig = computed(() => {
  if (!drawPixelVertices.value.length || !cursorPos.value) return {}
  const last = drawPixelVertices.value[drawPixelVertices.value.length - 1]
  return {
    points: [last.x, last.y, cursorPos.value.x, cursorPos.value.y],
    stroke: '#2375CA',
    strokeWidth: 1.5,
    dash: [4, 4],
    opacity: 0.6,
  }
})

// ── Annotation Konva configs ──────────────────────────────────────────────
function hexToRgba(hex: string, alpha: number) {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function savedAnnotationConfig(ann: FloorPlanAnnotationItem) {
  const update = pendingUpdates.get(ann.id)
  const vertices = (update as any)?.vertices ?? ann.vertices
  const colour = (update as any)?.colour ?? ann.colour
  const isSelected = selectedId.value === ann.id
  return {
    points: normVerticesToPoints(vertices),
    closed: true,
    fill: hexToRgba(colour || '#4F46E5', 0.4),
    stroke: pendingUpdates.has(ann.id) ? '#f59e0b' : (colour || '#4F46E5'),
    strokeWidth: isSelected ? 3 : 2,
    dash: pendingUpdates.has(ann.id) ? [8, 4] : [],
    opacity: pendingDeletes.has(ann.id) ? 0.3 : 1,
  }
}

function pendingAnnotationConfig(ann: PendingAnnotation) {
  const isSelected = selectedId.value === ann.tempId
  return {
    points: normVerticesToPoints(ann.vertices),
    closed: true,
    fill: hexToRgba(ann.colour || '#4F46E5', 0.4),
    stroke: ann.colour || '#4F46E5',
    strokeWidth: isSelected ? 3 : 2,
    dash: [8, 4],
  }
}

function pendingUpdateConfig(savedId: number, update: Partial<FloorPlanAnnotationItem>) {
  const original = savedAnnotations.value.find((a) => a.id === savedId)
  if (!original) return {}
  const vertices = update.vertices ?? original.vertices
  const colour = update.colour ?? original.colour
  return {
    points: normVerticesToPoints(vertices),
    closed: true,
    fill: hexToRgba(colour || '#4F46E5', 0.4),
    stroke: '#f59e0b',
    strokeWidth: 2,
    dash: [8, 4],
  }
}

function annotationLabelConfig(vertices: { x: number; y: number }[], label: string, isPending: boolean) {
  const c = centroid(vertices)
  const pixC = normToPixel(c)
  return {
    x: pixC.x - 60,
    y: pixC.y - 8,
    width: 120,
    text: label,
    fontSize: 12,
    fontStyle: 'bold',
    fill: '#1b2d59',
    align: 'center' as const,
    shadowColor: 'white',
    shadowBlur: 4,
    opacity: isPending ? 0.8 : 1,
    listening: false,
  }
}

// ── Pending state ─────────────────────────────────────────────────────────
interface PendingAnnotation {
  tempId: string
  label: string
  colour: string
  vertices: { x: number; y: number }[]
  room_venue: number | null
  metadata: { label: string; value: string }[]
}

const pendingCreates = ref<PendingAnnotation[]>([])
const pendingUpdates = reactive(new Map<number, Partial<FloorPlanAnnotationItem & { metadata_write: any[] }>>())
const pendingDeletes = reactive(new Set<number>())

const pendingUpdatesEntries = computed(() => Array.from(pendingUpdates.entries()))

const hasPendingChanges = computed(
  () => pendingCreates.value.length > 0 || pendingUpdates.size > 0 || pendingDeletes.size > 0,
)

const pendingChangeSummary = computed(() => {
  const parts: string[] = []
  if (pendingCreates.value.length) parts.push(`${pendingCreates.value.length} new`)
  if (pendingUpdates.size) parts.push(`${pendingUpdates.size} updated`)
  if (pendingDeletes.size) parts.push(`${pendingDeletes.size} deleted`)
  return parts.join(', ') + ' — unsaved'
})

const allAnnotationsCount = computed(() => savedAnnotations.value.length + pendingCreates.value.length)

function getPendingLabel(ann: FloorPlanAnnotationItem) {
  return pendingUpdates.get(ann.id)?.label ?? ann.label
}

function getPendingColour(ann: FloorPlanAnnotationItem) {
  return pendingUpdates.get(ann.id)?.colour ?? ann.colour
}

const visibleSavedAnnotations = computed(() => savedAnnotations.value)

function markDelete(id: number) {
  if (pendingDeletes.has(id)) {
    pendingDeletes.delete(id)
  } else {
    pendingDeletes.add(id)
    if (selectedId.value === id) selectedId.value = null
  }
}

function removePendingCreate(tempId: string) {
  const idx = pendingCreates.value.findIndex((a) => a.tempId === tempId)
  if (idx !== -1) pendingCreates.value.splice(idx, 1)
  if (selectedId.value === tempId) selectedId.value = null
}

// ── Selection ─────────────────────────────────────────────────────────────
const selectedAnnotation = computed<FloorPlanAnnotationItem | null>(() => {
  if (typeof selectedId.value !== 'number') return null
  return savedAnnotations.value.find((a) => a.id === selectedId.value) ?? null
})

function selectAnnotation(id: number) {
  selectedId.value = selectedId.value === id ? null : id
}

function handleAnnotationClick(id: number) {
  if (mode.value === 'VIEW') selectAnnotation(id)
}

// ── Stage interaction ─────────────────────────────────────────────────────
function getEventPosition(e: any): { x: number; y: number } | null {
  const stage = stageRef.value?.getStage?.()
  if (!stage) return null
  const pos = stage.getPointerPosition()
  return pos ?? null
}

function handleMouseMove(e: any) {
  if (mode.value !== 'DRAW') return
  const pos = getEventPosition(e)
  if (pos) cursorPos.value = pos
}

function handleStageClick(e: any) {
  if (mode.value !== 'DRAW') return
  const pos = getEventPosition(e)
  if (!pos) return

  // Check if near first vertex to close polygon
  if (drawVertices.value.length >= 3 && isNearFirstVertex.value) {
    closePendingPolygon()
    return
  }

  const norm = pixelToNorm(pos)
  drawVertices.value.push(norm)
}

function closePendingPolygon() {
  const vertices = [...drawVertices.value]
  drawVertices.value = []
  cursorPos.value = null
  // Open drawer to fill in label etc.
  drawerMode.value = 'create'
  drawerForm.label = ''
  drawerForm.colour = '#4F46E5'
  drawerForm.room_venue = null
  drawerForm.metadata = []
  pendingPolygonVertices.value = vertices
  drawerOpen.value = true
}

// Holds vertices for a polygon just closed while drawer is open
const pendingPolygonVertices = ref<{ x: number; y: number }[]>([])

// ── Drawer state ──────────────────────────────────────────────────────────
const drawerOpen = ref(false)
const drawerMode = ref<'create' | 'edit'>('create')
const editingPendingTempId = ref<string | null>(null)
const editingSavedId = ref<number | null>(null)

const drawerForm = reactive({
  label: '',
  colour: '#4F46E5',
  room_venue: null as number | null,
  metadata: [] as { label: string; value: string }[],
})

function closeDrawer() {
  drawerOpen.value = false
  pendingPolygonVertices.value = []
  editingPendingTempId.value = null
  editingSavedId.value = null
}

function addMetaRow() {
  drawerForm.metadata.push({ label: '', value: '' })
}

function removeMetaRow(idx: number) {
  drawerForm.metadata.splice(idx, 1)
}

function openEditDrawer(ann: FloorPlanAnnotationItem) {
  const update = pendingUpdates.get(ann.id)
  drawerMode.value = 'edit'
  editingSavedId.value = ann.id
  editingPendingTempId.value = null
  drawerForm.label = (update as any)?.label ?? ann.label
  drawerForm.colour = (update as any)?.colour ?? ann.colour
  drawerForm.room_venue = (update as any)?.room_venue ?? ann.room_venue
  drawerForm.metadata = (ann.metadata ?? []).map((m) => ({ label: m.label, value: m.value ?? '' }))
  drawerOpen.value = true
}

function openEditPendingDrawer(ann: PendingAnnotation) {
  drawerMode.value = 'edit'
  editingPendingTempId.value = ann.tempId
  editingSavedId.value = null
  drawerForm.label = ann.label
  drawerForm.colour = ann.colour
  drawerForm.room_venue = ann.room_venue
  drawerForm.metadata = ann.metadata.map((m) => ({ ...m }))
  drawerOpen.value = true
}

function confirmDrawer() {
  if (!drawerForm.label.trim()) return

  if (drawerMode.value === 'create') {
    const newAnnotation: PendingAnnotation = {
      tempId: `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      label: drawerForm.label.trim(),
      colour: drawerForm.colour || '#4F46E5',
      vertices: pendingPolygonVertices.value,
      room_venue: drawerForm.room_venue,
      metadata: drawerForm.metadata.filter((m) => m.label.trim()),
    }
    pendingCreates.value.push(newAnnotation)
    selectedId.value = newAnnotation.tempId
  } else if (drawerMode.value === 'edit') {
    if (editingSavedId.value !== null) {
      const existing = pendingUpdates.get(editingSavedId.value) ?? {}
      pendingUpdates.set(editingSavedId.value, {
        ...existing,
        label: drawerForm.label.trim(),
        colour: drawerForm.colour,
        room_venue: drawerForm.room_venue,
        metadata_write: drawerForm.metadata.filter((m) => m.label.trim()),
      })
    } else if (editingPendingTempId.value !== null) {
      const idx = pendingCreates.value.findIndex((a) => a.tempId === editingPendingTempId.value)
      if (idx !== -1) {
        pendingCreates.value[idx] = {
          ...pendingCreates.value[idx],
          label: drawerForm.label.trim(),
          colour: drawerForm.colour,
          room_venue: drawerForm.room_venue,
          metadata: drawerForm.metadata.filter((m) => m.label.trim()),
        }
      }
    }
  }

  closeDrawer()
}

// ── Floor switcher ────────────────────────────────────────────────────────
function switchFloorPlan(id: number) {
  if (hasPendingChanges.value) {
    if (!window.confirm('You have unsaved changes. Discard and switch floor?')) return
  }
  currentFloorPlanId.value = String(id)
  pendingCreates.value = []
  pendingUpdates.clear()
  pendingDeletes.clear()
  selectedId.value = null
}

// ── Mutations ─────────────────────────────────────────────────────────────
const createMutation = useCreateFloorPlanAnnotation(venueId, currentFloorPlanId)
const updateMutation = useUpdateFloorPlanAnnotation(venueId, currentFloorPlanId)
const deleteMutation = useDeleteFloorPlanAnnotation(venueId, currentFloorPlanId)

const isSaving = ref(false)

async function saveAll() {
  if (!hasPendingChanges.value || isSaving.value) return
  isSaving.value = true
  try {
    // Creates
    for (const ann of pendingCreates.value) {
      await createMutation.mutateAsync({
        label: ann.label,
        colour: ann.colour,
        vertices: ann.vertices,
        room_venue: ann.room_venue,
        metadata_write: ann.metadata,
      })
    }
    // Updates
    for (const [id, update] of Array.from(pendingUpdates.entries())) {
      await updateMutation.mutateAsync({ id, body: update as any })
    }
    // Deletes
    for (const id of Array.from(pendingDeletes)) {
      await deleteMutation.mutateAsync(id)
    }

    // Clear pending state
    pendingCreates.value = []
    pendingUpdates.clear()
    pendingDeletes.clear()
    selectedId.value = null

    // Refetch floor plan (annotations are embedded in the detail view)
    await queryClient.invalidateQueries({
      queryKey: ['floorPlans', 'detail', venueId.value, currentFloorPlanId.value],
    })

    toast.add({ title: 'Saved successfully', color: 'green' })
  } catch (err: any) {
    toast.add({
      title: 'Save failed',
      description: err?.response?.data?.detail ?? err?.message ?? 'Unknown error',
      color: 'red',
    })
  } finally {
    isSaving.value = false
  }
}

// Reset pending state when floor plan switches
watch(currentFloorPlanId, () => {
  pendingCreates.value = []
  pendingUpdates.clear()
  pendingDeletes.clear()
  selectedId.value = null
  cancelDraw()
})
</script>

<style scoped>
.input {
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid rgb(27 45 89 / 0.18);
  background: white;
  padding: 0.5rem 0.8rem;
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
  font-size: 0.875rem;
  font-weight: 700;
  padding: 0.5rem 1rem;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  border: 1px solid rgb(27 45 89 / 0.2);
  color: #374151;
  font-size: 0.875rem;
  font-weight: 700;
  padding: 0.5rem 1rem;
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

/* Drawer slide transition */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.2s ease;
}

.drawer-enter-active .absolute.right-0,
.drawer-leave-active .absolute.right-0 {
  transition: transform 0.25s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from .absolute.right-0,
.drawer-leave-to .absolute.right-0 {
  transform: translateX(100%);
}
</style>
