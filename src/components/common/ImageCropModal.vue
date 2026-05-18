<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4"
      @mousedown.self="close"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col overflow-hidden"
        style="max-height: 90vh"
        @mousedown.stop
      >
        <!-- ── Header ── -->
        <div class="flex items-center gap-3 px-6 py-4 border-b border-deep-navy/10 flex-shrink-0">
          <span class="material-symbols-outlined text-primary">crop</span>
          <div class="flex-1">
            <h2 class="text-sm font-black text-primary uppercase tracking-widest">Image Crop Editor</h2>
            <p class="text-xs text-navy-400 mt-0.5">Drag the handles to set your crop area</p>
          </div>
          <button
            class="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            title="Close"
            @click="close"
          >
            <span class="material-symbols-outlined text-gray-400 text-xl">close</span>
          </button>
        </div>

        <!-- ── Body ── -->
        <div class="flex flex-1 min-h-0 overflow-hidden">
          <!-- Left: interactive crop area -->
          <div class="flex flex-col flex-1 min-w-0 gap-3 p-4 overflow-hidden">
            <!-- Controls -->
            <div class="flex items-center gap-2 flex-shrink-0 flex-wrap">
              <button
                :class="aspectLocked
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                @click="toggleAspectLock"
              >
                <span class="material-symbols-outlined text-sm">{{ aspectLocked ? 'lock' : 'lock_open' }}</span>
                Lock to hero ratio ({{ HERO_RATIO_LABEL }})
              </button>
              <button
                class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors"
                @click="resetCrop"
              >
                <span class="material-symbols-outlined text-sm">refresh</span>
                Reset
              </button>
              <span v-if="imageLoaded" class="ml-auto text-xs text-gray-400 font-mono">
                {{ cropW }} × {{ cropH }} px
              </span>
            </div>

            <!-- Crop canvas area -->
            <div
              class="flex-1 min-h-0 flex items-center justify-center bg-[#1a1a2e] rounded-xl overflow-hidden"
              style="min-height: 220px"
            >
              <div
                v-if="!imageLoaded"
                class="flex flex-col items-center gap-3 text-white/40"
              >
                <span class="material-symbols-outlined text-4xl animate-pulse">image</span>
                <span class="text-xs">Loading image…</span>
              </div>

              <!-- imageWrapEl matches the displayed image dimensions exactly -->
              <div
                ref="imageWrapEl"
                class="relative select-none"
                :class="imageLoaded ? 'block' : 'hidden'"
              >
                <!-- Source image — crossOrigin needed for canvas export -->
                <img
                  ref="imgEl"
                  :src="imageSrc"
                  crossorigin="anonymous"
                  draggable="false"
                  class="block pointer-events-none"
                  style="max-width: 100%; max-height: 400px; display: block"
                  @load="onImageLoad"
                />

                <!-- Dark overlays (pointer-events-none) -->
                <template v-if="imageLoaded">
                  <!-- top -->
                  <div
                    class="absolute bg-black/55 pointer-events-none"
                    :style="{ top: 0, left: 0, right: 0, height: `${cropBox.y}px` }"
                  />
                  <!-- bottom -->
                  <div
                    class="absolute bg-black/55 pointer-events-none"
                    :style="{ top: `${cropBox.y + cropBox.h}px`, left: 0, right: 0, bottom: 0 }"
                  />
                  <!-- left -->
                  <div
                    class="absolute bg-black/55 pointer-events-none"
                    :style="{ top: `${cropBox.y}px`, left: 0, width: `${cropBox.x}px`, height: `${cropBox.h}px` }"
                  />
                  <!-- right -->
                  <div
                    class="absolute bg-black/55 pointer-events-none"
                    :style="{ top: `${cropBox.y}px`, left: `${cropBox.x + cropBox.w}px`, right: 0, height: `${cropBox.h}px` }"
                  />
                </template>

                <!-- Crop selection box -->
                <div
                  v-if="imageLoaded"
                  class="absolute border-2 border-white cursor-move"
                  :style="cropBoxStyle"
                  @mousedown.prevent.stop="startDrag"
                >
                  <!-- Rule-of-thirds guides -->
                  <div class="absolute inset-0 pointer-events-none overflow-hidden">
                    <div class="absolute top-0 bottom-0 border-r border-white/25" style="left: 33.33%" />
                    <div class="absolute top-0 bottom-0 border-r border-white/25" style="left: 66.66%" />
                    <div class="absolute left-0 right-0 border-b border-white/25" style="top: 33.33%" />
                    <div class="absolute left-0 right-0 border-b border-white/25" style="top: 66.66%" />
                  </div>

                  <!-- Resize handles (8 total) -->
                  <div
                    v-for="handle in HANDLES"
                    :key="handle.id"
                    class="absolute w-2.5 h-2.5 bg-white rounded-sm border border-primary z-10"
                    :class="handle.cursor"
                    :style="handle.style"
                    @mousedown.prevent.stop="startResize(handle.id, $event)"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Right: preview + options -->
          <div class="w-72 flex-shrink-0 flex flex-col gap-4 p-4 border-l border-deep-navy/10 overflow-y-auto">
            <!-- Preview label -->
            <div class="flex-shrink-0">
              <p class="text-[10px] font-black uppercase tracking-widest text-primary mb-0.5">Hero Preview</p>
              <p class="text-xs text-navy-400">Exactly how this crop appears on the event page</p>
            </div>

            <!-- Live preview — CSS-transform approach, no canvas / CORS needed -->
            <div
              class="relative overflow-hidden rounded-xl bg-[#1a1a2e] flex-shrink-0"
              style="aspect-ratio: 2.618; width: 100%"
              ref="previewContainerEl"
            >
              <img
                v-if="imageLoaded && imageSrc"
                :src="imageSrc"
                draggable="false"
                class="absolute pointer-events-none"
                :style="previewImageStyle"
              />
              <div
                v-else
                class="absolute inset-0 flex items-center justify-center text-white/20"
              >
                <span class="material-symbols-outlined text-2xl">image</span>
              </div>
            </div>

            <!-- Crop info -->
            <div class="bg-gray-50 rounded-xl p-3 space-y-1.5 text-xs flex-shrink-0">
              <div class="flex justify-between">
                <span class="text-gray-500">Crop size</span>
                <span class="font-mono font-semibold text-navy-700">{{ cropW }} × {{ cropH }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Output format</span>
                <span class="font-semibold text-navy-700">JPEG, q92</span>
              </div>
              <div v-if="cropW > 0" class="flex justify-between">
                <span class="text-gray-500">Hero scale</span>
                <span
                  class="font-semibold"
                  :class="heroScalePercent >= 100 ? 'text-green-600' : 'text-amber-600'"
                >{{ heroScalePercent }}%</span>
              </div>
            </div>

            <!-- Upload options -->
            <div class="space-y-2 flex-shrink-0">
              <label class="flex items-start gap-2 p-2.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  v-model="deleteOriginal"
                  type="checkbox"
                  class="mt-0.5 h-4 w-4 rounded text-primary border-gray-300"
                />
                <div>
                  <p class="text-xs font-semibold text-navy-700">Replace original</p>
                  <p class="text-[10px] text-navy-400">Delete the uncropped image after saving</p>
                </div>
              </label>
              <label class="flex items-start gap-2 p-2.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  v-model="setAsMain"
                  type="checkbox"
                  class="mt-0.5 h-4 w-4 rounded text-primary border-gray-300"
                />
                <div>
                  <p class="text-xs font-semibold text-navy-700">Set as main image</p>
                  <p class="text-[10px] text-navy-400">Feature this cropped version as the hero banner</p>
                </div>
              </label>
            </div>

            <!-- CORS note -->
            <p class="text-[10px] text-navy-300 leading-relaxed flex-shrink-0">
              <span class="font-semibold">Note:</span> Image export requires CORS headers on the media server. If saving fails with a "cross-origin" error, ensure <code class="bg-gray-100 px-0.5 rounded">Access-Control-Allow-Origin</code> is set on your media storage.
            </p>
          </div>
        </div>

        <!-- ── Footer ── -->
        <div class="flex items-center justify-between px-6 py-4 border-t border-deep-navy/10 flex-shrink-0">
          <button
            class="px-4 py-2 text-sm font-bold text-navy-600 hover:bg-gray-100 rounded-xl transition-colors"
            @click="close"
          >
            Cancel
          </button>
          <button
            :disabled="!imageLoaded || isSaving"
            class="flex items-center gap-2 px-5 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
            @click="saveCrop"
          >
            <span
              v-if="isSaving"
              class="material-symbols-outlined text-base animate-spin"
            >progress_activity</span>
            <span v-else class="material-symbols-outlined text-base">crop</span>
            {{ isSaving ? 'Saving…' : 'Save Crop' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onUnmounted, reactive, ref, watch } from 'vue'
import type { Resource } from '~/api/types.gen'
import { cropImageToBlob } from '~/composables/ui/useImageCrop'
import { useAddEventLandingImage } from '~/composables/resources/events/eventLandingImages'
import { useRemoveEventResource, usePromoteLandingImage } from '~/composables/resources/events/eventResources'
import { resolveImageUrl } from '~/utils/image'

// ─────────────────────────────────────────────────────────────
// Props / emits
// ─────────────────────────────────────────────────────────────

const props = defineProps<{
  modelValue: boolean
  resource: Resource
  eventId: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  /** Emitted after the cropped image was successfully uploaded. */
  saved: []
}>()

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

// Hero dimensions: h-[450px] md:h-[550px] w-full at 1440 viewport
const HERO_W = 1440
const HERO_H = 550
const HERO_RATIO = HERO_W / HERO_H // ≈ 2.618
const HERO_RATIO_LABEL = `${HERO_W / 180}:${HERO_H / 180}` // 8:~3.06 → display as approx

type HandleId = 'nw' | 'n' | 'ne' | 'w' | 'e' | 'sw' | 's' | 'se'

const HANDLES: { id: HandleId; style: Record<string, string>; cursor: string }[] = [
  { id: 'nw', style: { top: '-5px', left: '-5px' }, cursor: 'cursor-nw-resize' },
  { id: 'n', style: { top: '-5px', left: 'calc(50% - 5px)' }, cursor: 'cursor-n-resize' },
  { id: 'ne', style: { top: '-5px', right: '-5px' }, cursor: 'cursor-ne-resize' },
  { id: 'w', style: { top: 'calc(50% - 5px)', left: '-5px' }, cursor: 'cursor-w-resize' },
  { id: 'e', style: { top: 'calc(50% - 5px)', right: '-5px' }, cursor: 'cursor-e-resize' },
  { id: 'sw', style: { bottom: '-5px', left: '-5px' }, cursor: 'cursor-sw-resize' },
  { id: 's', style: { bottom: '-5px', left: 'calc(50% - 5px)' }, cursor: 'cursor-s-resize' },
  { id: 'se', style: { bottom: '-5px', right: '-5px' }, cursor: 'cursor-se-resize' },
]

const MIN_CROP_PX = 40 // minimum crop box edge in display pixels

// ─────────────────────────────────────────────────────────────
// Image source
// ─────────────────────────────────────────────────────────────

const imageSrc = computed<string>(() => {
  const r = props.resource
  if (!r) return ''
  // Prefer original (highest quality) for best crop output
  return (
    r.image_urls?.original ||
    r.image_urls?.large ||
    r.image_urls?.medium ||
    resolveImageUrl(r.image) ||
    ''
  )
})

// ─────────────────────────────────────────────────────────────
// DOM refs
// ─────────────────────────────────────────────────────────────

const imgEl = ref<HTMLImageElement | null>(null)
const imageWrapEl = ref<HTMLDivElement | null>(null)
const previewContainerEl = ref<HTMLDivElement | null>(null)

// ─────────────────────────────────────────────────────────────
// Image state
// ─────────────────────────────────────────────────────────────

const imageLoaded = ref(false)
const naturalW = ref(0)
const naturalH = ref(0)
const displayW = ref(0)
const displayH = ref(0)

function onImageLoad() {
  const el = imgEl.value
  if (!el) return
  naturalW.value = el.naturalWidth
  naturalH.value = el.naturalHeight
  setAsMain.value = props.resource?.tag === 'LANDING_PHOTO_MAIN'

  // imageLoaded must be true BEFORE nextTick so the wrapper's `hidden`
  // class is removed and the browser lays out the element, giving
  // non-zero clientWidth / clientHeight.
  imageLoaded.value = true

  nextTick(() => {
    if (!imgEl.value) return
    displayW.value = imgEl.value.clientWidth
    displayH.value = imgEl.value.clientHeight
    resetCropToFull()
  })
}

// ─────────────────────────────────────────────────────────────
// Crop box (in display pixels)
// ─────────────────────────────────────────────────────────────

const cropBox = reactive({ x: 0, y: 0, w: 0, h: 0 })

// Scale from display pixels → natural image pixels
const scaleX = computed(() => (displayW.value > 0 ? naturalW.value / displayW.value : 1))
const scaleY = computed(() => (displayH.value > 0 ? naturalH.value / displayH.value : 1))

// Crop in natural pixels (used for canvas export)
const naturalCrop = computed(() => ({
  x: Math.round(cropBox.x * scaleX.value),
  y: Math.round(cropBox.y * scaleY.value),
  w: Math.round(cropBox.w * scaleX.value),
  h: Math.round(cropBox.h * scaleY.value),
}))

const cropW = computed(() => naturalCrop.value.w)
const cropH = computed(() => naturalCrop.value.h)

/**
 * Percentage of hero resolution this crop provides.
 * 100% means the crop exactly matches 1440×550.
 * <100% means the image will be upscaled (may look soft).
 */
const heroScalePercent = computed(() => {
  if (!cropW.value || !cropH.value) return 0
  const s = Math.min(cropW.value / HERO_W, cropH.value / HERO_H)
  return Math.round(s * 100)
})

const cropBoxStyle = computed(() => ({
  position: 'absolute' as const,
  left: `${cropBox.x}px`,
  top: `${cropBox.y}px`,
  width: `${cropBox.w}px`,
  height: `${cropBox.h}px`,
}))

// ─────────────────────────────────────────────────────────────
// Crop tools
// ─────────────────────────────────────────────────────────────

function resetCropToFull() {
  cropBox.x = 0
  cropBox.y = 0
  cropBox.w = displayW.value
  cropBox.h = displayH.value
}

function resetCrop() {
  if (aspectLocked.value) {
    fitHeroRatio()
  } else {
    resetCropToFull()
  }
}

/**
 * Fit the largest hero-ratio crop box centred on the image.
 */
function fitHeroRatio() {
  const imgRatio = displayW.value / displayH.value
  if (imgRatio > HERO_RATIO) {
    // Image wider than hero → constrain by height
    const w = Math.round(displayH.value * HERO_RATIO)
    cropBox.x = Math.round((displayW.value - w) / 2)
    cropBox.y = 0
    cropBox.w = w
    cropBox.h = displayH.value
  } else {
    // Image taller than hero → constrain by width
    const h = Math.round(displayW.value / HERO_RATIO)
    cropBox.x = 0
    cropBox.y = Math.round((displayH.value - h) / 2)
    cropBox.w = displayW.value
    cropBox.h = h
  }
}

const aspectLocked = ref(false)

function toggleAspectLock() {
  aspectLocked.value = !aspectLocked.value
  if (aspectLocked.value) fitHeroRatio()
}

// ─────────────────────────────────────────────────────────────
// Mouse interaction
// ─────────────────────────────────────────────────────────────

type DragState = { mode: 'move' | HandleId; startX: number; startY: number; startBox: typeof cropBox }

let drag: DragState | null = null

function startDrag(e: MouseEvent) {
  drag = { mode: 'move', startX: e.clientX, startY: e.clientY, startBox: { ...cropBox } }
  window.addEventListener('mousemove', onMouseMove, { passive: true })
  window.addEventListener('mouseup', onMouseUp)
}

function startResize(handle: HandleId, e: MouseEvent) {
  drag = { mode: handle, startX: e.clientX, startY: e.clientY, startBox: { ...cropBox } }
  window.addEventListener('mousemove', onMouseMove, { passive: true })
  window.addEventListener('mouseup', onMouseUp)
}

function onMouseMove(e: MouseEvent) {
  if (!drag || !imageLoaded.value) return
  const dx = e.clientX - drag.startX
  const dy = e.clientY - drag.startY

  if (drag.mode === 'move') {
    cropBox.x = clamp(drag.startBox.x + dx, 0, displayW.value - cropBox.w)
    cropBox.y = clamp(drag.startBox.y + dy, 0, displayH.value - cropBox.h)
    return
  }

  applyResize(drag.mode, dx, dy, drag.startBox)
}

function onMouseUp() {
  drag = null
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
}

function applyResize(handle: HandleId, dx: number, dy: number, s: typeof cropBox) {
  let x = s.x, y = s.y, w = s.w, h = s.h

  // Raw resize per handle
  switch (handle) {
    case 'nw': x += dx; w -= dx; y += dy; h -= dy; break
    case 'n':  y += dy; h -= dy; break
    case 'ne': w += dx; y += dy; h -= dy; break
    case 'w':  x += dx; w -= dx; break
    case 'e':  w += dx; break
    case 'sw': x += dx; w -= dx; h += dy; break
    case 's':  h += dy; break
    case 'se': w += dx; h += dy; break
  }

  // Aspect ratio constraint
  if (aspectLocked.value) {
    if (handle === 'n' || handle === 's') {
      // Height-primary: derive width from height
      h = Math.max(MIN_CROP_PX, h)
      const newW = h * HERO_RATIO
      if (handle === 'n') {
        // Keep bottom-right fixed, extend left/right to centre
        const right = s.x + s.w
        x = right - newW
      }
      // For 's', keep left edge; just extend right
      w = newW
    } else {
      // Width-primary: derive height from width
      w = Math.max(MIN_CROP_PX, w)
      const newH = w / HERO_RATIO
      if (handle === 'nw' || handle === 'ne') {
        // Keep bottom edge fixed
        const bottom = s.y + s.h
        y = bottom - newH
      }
      h = newH
    }
  }

  // Enforce minimum size
  if (w < MIN_CROP_PX) {
    if (handle === 'nw' || handle === 'w' || handle === 'sw') x = s.x + s.w - MIN_CROP_PX
    w = MIN_CROP_PX
    if (aspectLocked.value) h = w / HERO_RATIO
  }
  if (h < MIN_CROP_PX) {
    if (handle === 'nw' || handle === 'n' || handle === 'ne') y = s.y + s.h - MIN_CROP_PX
    h = MIN_CROP_PX
    if (aspectLocked.value) w = h * HERO_RATIO
  }

  // Clamp to image bounds — pull back negative x/y and cap at image edge
  if (x < 0) { w += x; x = 0 }
  if (y < 0) { h += y; y = 0 }
  x = Math.max(0, x)
  y = Math.max(0, y)
  if (x + w > displayW.value) w = displayW.value - x
  if (y + h > displayH.value) h = displayH.value - y

  cropBox.x = Math.round(x)
  cropBox.y = Math.round(y)
  cropBox.w = Math.round(Math.max(MIN_CROP_PX, w))
  cropBox.h = Math.round(Math.max(MIN_CROP_PX, h))
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

// ─────────────────────────────────────────────────────────────
// CSS-transform live preview (no canvas / CORS required)
// ─────────────────────────────────────────────────────────────

/**
 * Positions the source image inside the preview container so that
 * only the current crop region is visible, filling the container.
 * Uses pure CSS transforms — no canvas, no CORS requirement.
 */
const previewImageStyle = computed<Record<string, string | undefined>>(() => {
  if (!imageLoaded.value || cropBox.w === 0 || cropBox.h === 0) {
    return { display: 'none' }
  }

  // Preview container has aspect-ratio 2.618 and width = panel width (~256px accounting for padding)
  const previewW = previewContainerEl.value?.clientWidth ?? 256
  const previewH = previewW / HERO_RATIO

  // Scale so crop region exactly fills the preview
  const scale = Math.max(previewW / cropBox.w, previewH / cropBox.h)

  const scaledImgW = displayW.value * scale
  const scaledImgH = displayH.value * scale
  const offsetX = cropBox.x * scale
  const offsetY = cropBox.y * scale

  return {
    position: 'absolute',
    width: `${scaledImgW}px`,
    height: `${scaledImgH}px`,
    left: `-${offsetX}px`,
    top: `-${offsetY}px`,
    pointerEvents: 'none',
    userSelect: 'none',
  }
})

// ─────────────────────────────────────────────────────────────
// Save / upload
// ─────────────────────────────────────────────────────────────

const deleteOriginal = ref(false)
const setAsMain = ref(false)
const isSaving = ref(false)

const addImageMutation = useAddEventLandingImage()
const removeResourceMutation = useRemoveEventResource()
const promoteMutation = usePromoteLandingImage()
const toast = useToast()

async function saveCrop() {
  if (!imageLoaded.value || isSaving.value) return
  isSaving.value = true

  try {
    // 1. Crop to JPEG Blob via canvas
    const blob = await cropImageToBlob(imageSrc.value, naturalCrop.value, 0.92)
    const baseName = props.resource.name || 'image'
    const file = new File([blob], `${baseName}-cropped.jpg`, { type: 'image/jpeg' })

    // 2. Upload new cropped image
    const wasMain = props.resource.tag === 'LANDING_PHOTO_MAIN'
    await addImageMutation.mutateAsync({
      eventId: props.eventId,
      body: {
        name: `${baseName} (cropped)`,
        description: props.resource.description ?? '',
        image: file,
        is_main: setAsMain.value,
        public: true,
      },
    })

    // 3. Optionally delete original
    if (deleteOriginal.value) {
      await removeResourceMutation.mutateAsync({
        eventId: props.eventId,
        query: { resource_id: props.resource.id },
      })
    }

    toast.add({ title: 'Saved', description: 'Cropped image uploaded successfully', color: 'green' })
    emit('saved')
    emit('update:modelValue', false)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save crop'
    toast.add({ title: 'Error', description: msg, color: 'red' })
  } finally {
    isSaving.value = false
  }
}

function close() {
  if (isSaving.value) return // prevent accidental close mid-upload
  emit('update:modelValue', false)
}

// ─────────────────────────────────────────────────────────────
// Lifecycle
// ─────────────────────────────────────────────────────────────

// Reset state whenever the modal re-opens
watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      imageLoaded.value = false
      aspectLocked.value = false
      deleteOriginal.value = false
      setAsMain.value = false
      cropBox.x = 0
      cropBox.y = 0
      cropBox.w = 0
      cropBox.h = 0
    }
  },
)

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
})
</script>
