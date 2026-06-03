<template>
  <div class="min-h-screen bg-mist-blue/20">

    <!-- Header -->
    <header class="bg-white border-b border-deep-navy/10 shadow-sm">
      <div class="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
        <button
          type="button"
          class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-deep-navy/15 text-xs font-semibold text-navy-600 hover:bg-mist-blue/60"
          @click="$router.back()"
        >
          <span class="material-symbols-outlined text-sm">arrow_back</span>
          Back
        </button>
        <div class="flex-1 min-w-0">
          <h1 class="text-base font-black text-deep-navy">Floor Plans</h1>
          <p v-if="venueName" class="text-xs text-navy-400 truncate">{{ venueName }}</p>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90"
          @click="showUploadForm = true"
        >
          <span class="material-symbols-outlined text-base">upload</span>
          Upload Floor Plan
        </button>
      </div>
    </header>

    <main class="max-w-5xl mx-auto px-6 py-8">

      <!-- Loading -->
      <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="i in 3" :key="i" class="h-52 bg-white rounded-2xl border border-deep-navy/10 animate-pulse" />
      </div>

      <!-- Empty state -->
      <div v-else-if="!floorPlans.length" class="flex flex-col items-center justify-center py-20 text-center text-navy-400">
        <span class="material-symbols-outlined text-5xl mb-3 text-navy-300">map</span>
        <h2 class="text-base font-black text-navy-600 mb-1">No floor plans yet</h2>
        <p class="text-sm text-navy-400 mb-5">Upload an image to start annotating rooms and areas.</p>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90"
          @click="showUploadForm = true"
        >
          <span class="material-symbols-outlined text-base">upload</span>
          Upload First Floor Plan
        </button>
      </div>

      <!-- Floor plan cards -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <article
          v-for="fp in floorPlans"
          :key="fp.id"
          class="bg-white rounded-2xl border border-deep-navy/10 shadow-sm overflow-hidden flex flex-col"
        >
          <!-- Thumbnail -->
          <div class="aspect-video bg-mist-blue/40 relative overflow-hidden">
            <img
              v-if="fp.image_url"
              :src="fp.image_url"
              :alt="fp.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="absolute inset-0 flex items-center justify-center">
              <span class="material-symbols-outlined text-4xl text-navy-300">image_not_supported</span>
            </div>
            <!-- Level badge -->
            <span class="absolute top-2 left-2 px-2 py-0.5 bg-deep-navy/70 text-white text-[10px] font-black rounded-full backdrop-blur-sm">
              L{{ fp.level }}<span v-if="fp.level_label"> · {{ fp.level_label }}</span>
            </span>
          </div>

          <!-- Body -->
          <div class="p-4 flex flex-col flex-1 gap-3">
            <div class="flex-1">
              <h3 class="text-sm font-black text-navy-900 truncate">{{ fp.name }}</h3>
              <p class="text-xs text-navy-400 mt-0.5">
                {{ fp.original_width && fp.original_height ? `${fp.original_width} × ${fp.original_height}px` : 'Dimensions unknown' }}
              </p>
            </div>

            <div class="flex gap-2">
              <NuxtLink
                :to="`/venues/${venueId}/floor-plans/${fp.id}/annotate`"
                class="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90"
              >
                <span class="material-symbols-outlined text-sm">draw</span>
                Annotate
              </NuxtLink>
              <button
                type="button"
                class="px-3 py-1.5 text-xs font-bold rounded-lg border border-deep-navy/15 text-navy-600 hover:bg-mist-blue/50"
                title="Delete floor plan"
                @click="confirmDelete(fp)"
              >
                <span class="material-symbols-outlined text-sm text-red-400">delete</span>
              </button>
            </div>
          </div>
        </article>
      </div>
    </main>

    <!-- Upload modal -->
    <Transition name="drawer">
      <div v-if="showUploadForm" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40" @click="closeUploadForm" />
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-navy-50">
            <h2 class="text-sm font-black text-deep-navy">Upload Floor Plan</h2>
            <button type="button" class="icon-btn" @click="closeUploadForm">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <form class="p-6 space-y-4" @submit.prevent="submitUpload">
            <div>
              <label class="block text-xs font-black text-navy-400 uppercase tracking-wider mb-1">Name *</label>
              <input
                v-model="uploadForm.name"
                type="text"
                required
                placeholder="e.g. Ground Floor, Level 1"
                class="input w-full"
              />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-black text-navy-400 uppercase tracking-wider mb-1">Level</label>
                <input
                  v-model.number="uploadForm.level"
                  type="number"
                  min="-5"
                  max="100"
                  class="input w-full"
                />
              </div>
              <div>
                <label class="block text-xs font-black text-navy-400 uppercase tracking-wider mb-1">Level Label</label>
                <input
                  v-model="uploadForm.level_label"
                  type="text"
                  placeholder="Ground, Mezzanine…"
                  class="input w-full"
                />
              </div>
            </div>
            <div>
              <label class="block text-xs font-black text-navy-400 uppercase tracking-wider mb-1">Image *</label>
              <div
                class="border-2 border-dashed border-deep-navy/20 rounded-xl p-6 text-center cursor-pointer hover:bg-mist-blue/20 transition-colors"
                @click="fileInputRef?.click()"
                @dragover.prevent
                @drop.prevent="onFileDrop"
              >
                <input
                  ref="fileInputRef"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="onFileChange"
                />
                <span class="material-symbols-outlined text-3xl text-navy-300 mb-2 block">image</span>
                <p class="text-sm font-medium text-navy-600">
                  {{ uploadForm.file ? uploadForm.file.name : 'Click or drag & drop an image' }}
                </p>
                <p class="text-xs text-navy-400 mt-1">PNG, JPG, WEBP — max 20 MB</p>
              </div>
            </div>

            <p v-if="uploadError" class="text-sm text-red-600 font-medium">{{ uploadError }}</p>

            <div class="flex gap-3 pt-2">
              <button type="button" class="btn-secondary flex-1" @click="closeUploadForm">Cancel</button>
              <button
                type="submit"
                :disabled="!uploadForm.name.trim() || !uploadForm.file || isUploading"
                :class="[
                  'btn-primary flex-1 flex items-center justify-center gap-2',
                  (!uploadForm.name.trim() || !uploadForm.file || isUploading) ? 'opacity-50 cursor-not-allowed' : '',
                ]"
              >
                <span v-if="isUploading" class="material-symbols-outlined text-base animate-spin">progress_activity</span>
                {{ isUploading ? 'Uploading…' : 'Upload' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFloorPlans, useCreateFloorPlan, useDeleteFloorPlan } from '~/composables/resources/venues/floorPlans'
import type { FloorPlanListItem, FloorPlanCreateBody } from '~/composables/resources/venues/floorPlans'

definePageMeta({ layout: 'default', middleware: ['auth'] })

const route = useRoute()
const toast = useToast()

const venueId = computed(() => String(route.params.venueId))

const { data: floorPlansResponse, isLoading } = useFloorPlans(venueId)
const floorPlans = computed<FloorPlanListItem[]>(() => {
  const d = floorPlansResponse.value?.data as any
  if (!d) return []
  const items = d.results ?? d
  return (Array.isArray(items) ? items : []).sort(
    (a: FloorPlanListItem, b: FloorPlanListItem) => a.level - b.level || a.name.localeCompare(b.name),
  )
})

const venueName = computed(() => floorPlans.value[0]?.venue_name ?? null)

// ── Upload ────────────────────────────────────────────────────────────────
const showUploadForm = ref(false)
const isUploading = ref(false)
const uploadError = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)

const uploadForm = ref({
  name: '',
  level: 0,
  level_label: '',
  file: null as File | null,
})

const createFloorPlan = useCreateFloorPlan(venueId)

function closeUploadForm() {
  showUploadForm.value = false
  uploadForm.value = { name: '', level: 0, level_label: '', file: null }
  uploadError.value = ''
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.[0]) uploadForm.value.file = input.files[0]
}

function onFileDrop(e: DragEvent) {
  const file = e.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) uploadForm.value.file = file
}

async function submitUpload() {
  if (!uploadForm.value.file || !uploadForm.value.name.trim()) return
  isUploading.value = true
  uploadError.value = ''
  try {
    const body: FloorPlanCreateBody = {
      venue: Number(venueId.value),
      name: uploadForm.value.name.trim(),
      level: uploadForm.value.level,
      image: uploadForm.value.file,
    }
    if (uploadForm.value.level_label.trim()) body.level_label = uploadForm.value.level_label.trim()
    await createFloorPlan.mutateAsync(body)
    toast.add({ title: 'Floor plan uploaded', color: 'green' })
    closeUploadForm()
  } catch (err: any) {
    uploadError.value = err?.response?.data?.image?.[0] ?? err?.response?.data?.detail ?? err?.message ?? 'Upload failed'
  } finally {
    isUploading.value = false
  }
}

// ── Delete ────────────────────────────────────────────────────────────────
const deleteFloorPlan = useDeleteFloorPlan(venueId)

async function confirmDelete(fp: FloorPlanListItem) {
  if (!window.confirm(`Delete "${fp.name}"? This will also remove all its annotations.`)) return
  try {
    await deleteFloorPlan.mutateAsync(fp.id)
    toast.add({ title: 'Floor plan deleted', color: 'green' })
  } catch (err: any) {
    toast.add({
      title: 'Delete failed',
      description: err?.response?.data?.detail ?? err?.message,
      color: 'red',
    })
  }
}
</script>

<style scoped>
.input {
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
}
.icon-btn:hover { background: rgb(240 247 255); }

.drawer-enter-active, .drawer-leave-active { transition: opacity 0.2s ease; }
.drawer-enter-from, .drawer-leave-to { opacity: 0; }
</style>
