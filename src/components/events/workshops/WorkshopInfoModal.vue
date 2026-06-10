<template>
  <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-lg' }">
    <UCard :ui="{ body: { padding: 'p-0' }, ring: '', divide: '' }">
      <!-- Loading skeleton -->
      <div v-if="isLoading" class="p-6 space-y-4">
        <div class="h-44 bg-mist-blue/60 rounded-xl animate-pulse" />
        <div class="h-6 bg-mist-blue/60 rounded-lg w-2/3 animate-pulse" />
        <div class="flex gap-2">
          <div class="h-5 bg-mist-blue/60 rounded-full w-24 animate-pulse" />
          <div class="h-5 bg-mist-blue/60 rounded-full w-20 animate-pulse" />
        </div>
        <div class="space-y-2">
          <div class="h-3 bg-mist-blue/60 rounded w-full animate-pulse" />
          <div class="h-3 bg-mist-blue/60 rounded w-5/6 animate-pulse" />
          <div class="h-3 bg-mist-blue/60 rounded w-4/6 animate-pulse" />
        </div>
      </div>

      <!-- Content -->
      <template v-else-if="workshop">
        <!-- Hero image -->
        <div class="relative h-48 bg-gradient-to-br from-primary/20 via-mist-blue to-navy-100 overflow-hidden rounded-t-xl">
          <img
            v-if="workshop.landing_image"
            :src="workshop.landing_image"
            :alt="workshop.title"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <span class="material-symbols-outlined text-6xl text-navy-200">workspace_premium</span>
          </div>
          <!-- Close button overlaid on image -->
          <button
            @click="isOpen = false"
            class="absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-full p-1 text-navy-600 hover:bg-white transition-colors shadow-sm"
          >
            <span class="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        <!-- Body -->
        <div class="p-5 space-y-4 max-h-[60vh] overflow-y-auto">

          <!-- Title -->
          <h3 class="text-lg font-black text-deep-navy leading-tight pr-2">{{ workshop.title }}</h3>

          <!-- Meta chips row -->
          <div class="flex flex-wrap gap-1.5">
            <span class="inline-flex items-center gap-1 text-[10px] font-bold text-navy-700 bg-mist-blue/70 rounded-full px-2.5 py-1">
              <span class="material-symbols-outlined text-xs">calendar_today</span>
              {{ formatDate(workshop.date) }}
            </span>
            <span class="inline-flex items-center gap-1 text-[10px] font-bold text-navy-700 bg-mist-blue/70 rounded-full px-2.5 py-1">
              <span class="material-symbols-outlined text-xs">schedule</span>
              {{ formatTime(workshop.date) }}
            </span>
            <span
              v-if="workshop.duration_minutes"
              class="inline-flex items-center gap-1 text-[10px] font-bold text-navy-700 bg-mist-blue/70 rounded-full px-2.5 py-1"
            >
              <span class="material-symbols-outlined text-xs">timer</span>
              {{ workshop.duration_minutes }} min
            </span>
            <span
              v-if="workshop.venue_name"
              class="inline-flex items-center gap-1 text-[10px] font-bold text-navy-700 bg-mist-blue/70 rounded-full px-2.5 py-1"
            >
              <span class="material-symbols-outlined text-xs">location_on</span>
              {{ workshop.venue_name }}{{ workshop.room_name ? ` · ${workshop.room_name}` : '' }}
            </span>
            <span
              v-if="workshop.capacity"
              class="inline-flex items-center gap-1 text-[10px] font-bold text-navy-700 bg-mist-blue/70 rounded-full px-2.5 py-1"
            >
              <span class="material-symbols-outlined text-xs">group</span>
              {{ workshop.registration_count }} / {{ workshop.capacity }} spots
            </span>
          </div>

          <!-- Divider -->
          <div class="border-t border-deep-navy/8" />

          <!-- Description -->
          <div v-if="workshop.description">
            <h4 class="text-[10px] font-black text-navy-400 uppercase tracking-widest mb-1.5">About this Workshop</h4>
            <p class="text-xs text-navy-700 leading-relaxed whitespace-pre-line">{{ workshop.description }}</p>
          </div>

          <!-- What to Expect -->
          <div v-if="workshop.what_to_expect">
            <h4 class="text-[10px] font-black text-navy-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <span class="material-symbols-outlined text-xs text-primary">star</span>
              What to Expect
            </h4>
            <p class="text-xs text-navy-700 leading-relaxed whitespace-pre-line">{{ workshop.what_to_expect }}</p>
          </div>

          <!-- What to Bring -->
          <div v-if="workshop.what_to_bring">
            <h4 class="text-[10px] font-black text-navy-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <span class="material-symbols-outlined text-xs text-primary">backpack</span>
              What to Bring
            </h4>
            <p class="text-xs text-navy-700 leading-relaxed whitespace-pre-line">{{ workshop.what_to_bring }}</p>
          </div>

          <!-- Registration window (informational) -->
          <div v-if="workshop.registration_opens_at || workshop.registration_closes_at" class="rounded-xl border border-deep-navy/10 bg-mist-blue/30 px-4 py-3 space-y-1">
            <h4 class="text-[10px] font-black text-navy-400 uppercase tracking-widest">Registration Window</h4>
            <div v-if="workshop.registration_opens_at" class="flex items-center gap-1.5 text-xs text-navy-600">
              <span class="material-symbols-outlined text-xs text-emerald-500">play_circle</span>
              Opens: {{ formatDateTime(workshop.registration_opens_at) }}
            </div>
            <div v-if="workshop.registration_closes_at" class="flex items-center gap-1.5 text-xs text-navy-600">
              <span class="material-symbols-outlined text-xs text-amber-500">stop_circle</span>
              Closes: {{ formatDateTime(workshop.registration_closes_at) }}
            </div>
          </div>

        </div>
      </template>

      <!-- Error state -->
      <div v-else class="p-8 text-center">
        <span class="material-symbols-outlined text-3xl text-navy-200 block mb-2">error_outline</span>
        <p class="text-xs text-navy-400">Could not load workshop details.</p>
        <button @click="isOpen = false" class="mt-3 text-xs font-bold text-primary underline">Close</button>
      </div>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWorkshop } from '~/composables/resources/workshops'

const props = defineProps<{
  modelValue: boolean
  workshopId: number | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const workshopQuery = useWorkshop(
  computed(() => props.workshopId ?? 0),
)

const isLoading = computed(() => workshopQuery.isLoading.value)
const workshop = computed(() => workshopQuery.data.value?.data ?? null)

// ─── Date helpers ──────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleString('en-AU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })
}
</script>
