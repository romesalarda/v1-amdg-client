<template>
  <EventsManagementLayout :event-id="id" :event="event?.data">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">

      <!-- ── Main column ─────────────────────────────────────────── -->
      <div class="lg:col-span-8 space-y-6">

        <!-- Toolbar -->
        <div class="flex items-center gap-3">
          <!-- Search -->
          <div class="relative flex-1">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-base text-navy-400">search</span>
            <input
              v-model="search"
              type="text"
              placeholder="Search workshops…"
              class="w-full pl-9 pr-9 py-2.5 bg-white border border-deep-navy/10 focus:border-primary focus:ring-0 rounded-xl text-sm font-medium text-navy-900 placeholder:text-navy-400 transition-all outline-none"
            />
            <button v-if="search" @click="search = ''" class="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-700">
              <span class="material-symbols-outlined text-base">close</span>
            </button>
          </div>

          <!-- Status filter -->
          <select
            v-model="statusFilter"
            class="py-2.5 pl-3 pr-8 bg-white border border-deep-navy/10 rounded-xl text-sm font-medium text-navy-900 focus:border-primary outline-none"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="OPEN">Open</option>
            <option value="CLOSED">Closed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <!-- View toggle -->
          <div class="flex gap-1 bg-white border border-deep-navy/10 rounded-xl p-1">
            <button
              @click="view = 'list'"
              class="p-1.5 rounded-lg transition-colors"
              :class="view === 'list' ? 'bg-primary text-white' : 'text-navy-400 hover:text-navy-700'"
              title="List view"
            >
              <span class="material-symbols-outlined text-base">list</span>
            </button>
            <button
              @click="view = 'kanban'"
              class="p-1.5 rounded-lg transition-colors"
              :class="view === 'kanban' ? 'bg-primary text-white' : 'text-navy-400 hover:text-navy-700'"
              title="Kanban view"
            >
              <span class="material-symbols-outlined text-base">view_kanban</span>
            </button>
          </div>

          <!-- Create button -->
          <button
            :disabled="!event_url_title"
            @click="openCreate"
            class="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <span class="material-symbols-outlined text-sm">add</span>
            New Workshop
          </button>
        </div>

        <!-- Kanban view -->
        <template v-if="view === 'kanban'">
          <div v-if="workshopsLoading" class="flex gap-4">
            <div v-for="i in 3" :key="i" class="w-64 h-48 bg-white rounded-2xl border border-deep-navy/10 animate-pulse" />
          </div>
          <WorkshopKanbanBoard
            v-else-if="workshopList.length && eventNumericId"
            :workshops="workshopList"
            :event-id="eventNumericId"
          />
          <div v-else class="text-center py-12 text-navy-400 text-sm">No workshops to display in kanban.</div>
        </template>

        <!-- Loading skeleton -->
        <div v-if="view === 'list' && workshopsLoading" class="space-y-3">
          <div v-for="i in 4" :key="i" class="h-20 bg-white rounded-2xl animate-pulse border border-deep-navy/10" />
        </div>

        <!-- Error -->
        <div v-else-if="view === 'list' && workshopsError" class="bg-white rounded-2xl border border-red-200 p-8 text-center text-red-500 text-sm">
          Failed to load workshops. Please refresh.
        </div>

        <!-- Empty state -->
        <div v-else-if="view === 'list' && !workshopList.length" class="bg-white rounded-2xl border border-deep-navy/10 shadow-drawn p-12 text-center">
          <span class="material-symbols-outlined text-5xl text-navy-200 block mb-3">workspace_premium</span>
          <p class="text-sm text-navy-400 mb-4">No workshops yet for this event.</p>
          <button
            :disabled="!event_url_title"
            @click="openCreate"
            class="inline-flex items-center gap-1.5 px-5 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors"
          >
            <span class="material-symbols-outlined text-sm">add</span>
            Create First Workshop
          </button>
        </div>

        <!-- Workshop list -->
        <div v-else-if="view === 'list'" class="space-y-3">
          <div v-for="workshop in workshopList" :key="workshop.id">
            <WorkshopCard
              :workshop="workshop"
              :expanded="expandedIds.has(workshop.id)"
              @edit="openEdit"
              @delete="handleDelete"
              @open-registrations="handleOpen"
              @close-registrations="handleClose"
              @toggle-registrations="toggleExpand"
              @run-allocation="(id) => runAllocById(id)"
            />

            <!-- Registrations panel -->
            <Transition name="slide-down">
              <div
                v-if="expandedIds.has(workshop.id)"
                class="bg-white border-x border-b border-deep-navy/10 rounded-b-2xl -mt-3 pt-3 overflow-hidden"
              >
                <WorkshopRegistrationsPanel :workshop-id="workshop.id" />
              </div>
            </Transition>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="view === 'list' && totalPages > 1" class="flex items-center justify-between">
          <p class="text-xs text-navy-400">
            Showing {{ (page - 1) * pageSize + 1 }}–{{ Math.min(page * pageSize, total) }} of {{ total }}
          </p>
          <div class="flex items-center gap-1">
            <button
              @click="page--"
              :disabled="page === 1"
              class="p-1.5 rounded-lg text-navy-400 hover:text-navy-700 hover:bg-white disabled:opacity-30"
            >
              <span class="material-symbols-outlined text-base">chevron_left</span>
            </button>
            <button
              v-for="p in totalPages"
              :key="p"
              @click="page = p"
              class="min-w-[28px] h-7 rounded-lg text-xs font-bold transition-colors"
              :class="p === page ? 'bg-primary text-white' : 'text-navy-500 hover:bg-white'"
            >
              {{ p }}
            </button>
            <button
              @click="page++"
              :disabled="page === totalPages"
              class="p-1.5 rounded-lg text-navy-400 hover:text-navy-700 hover:bg-white disabled:opacity-30"
            >
              <span class="material-symbols-outlined text-base">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ── Sidebar ─────────────────────────────────────────────── -->
      <div class="lg:col-span-4 space-y-6">

        <!-- Stats card -->
        <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="bg-primary px-6 py-4">
            <h3 class="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
              <span class="material-symbols-outlined text-base">bar_chart</span>
              Workshop Overview
            </h3>
          </div>
          <div class="p-6 grid grid-cols-2 gap-4">
            <div class="text-center">
              <div class="text-3xl font-black text-navy-900">{{ total }}</div>
              <div class="text-xs text-navy-400 mt-1 uppercase tracking-wide font-semibold">Total</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-black text-emerald-600">{{ openCount }}</div>
              <div class="text-xs text-navy-400 mt-1 uppercase tracking-wide font-semibold">Open</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-black text-blue-600">{{ closedCount }}</div>
              <div class="text-xs text-navy-400 mt-1 uppercase tracking-wide font-semibold">Closed</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-black text-navy-400">{{ draftCount }}</div>
              <div class="text-xs text-navy-400 mt-1 uppercase tracking-wide font-semibold">Draft</div>
            </div>
          </div>
        </section>

        <!-- Tips card -->
        <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="px-6 py-4 border-b border-navy-50 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-xl">lightbulb</span>
            <h3 class="text-[11px] font-black text-primary uppercase tracking-widest">Tips</h3>
          </div>
          <div class="p-6 text-sm space-y-3 text-navy-600">
            <p><strong class="text-navy-800">DRAFT</strong> workshops are hidden from attendees. Set to <strong class="text-navy-800">OPEN</strong> to allow interest submissions.</p>
            <p>Use <strong class="text-navy-800">Interest Ranking</strong> mode to let attendees rank preferences, then run the allocation algorithm.</p>
            <p>Expand a workshop row to see and manage its registrations inline.</p>
          </div>
        </section>
      </div>
    </div>

    <!-- Create / Edit modal -->
    <WorkshopCreateEditModal
      v-if="event_url_title"
      v-model="showModal"
      :event-id="event_url_title"
      :edit-workshop="editingWorkshop"
      @saved="onSaved"
    />

    <!-- Allocation result modal -->
    <WorkshopAllocationResultModal
      v-model="showResultModal"
      :run="lastResult"
    />
  </EventsManagementLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import EventsManagementLayout from '~/components/events/EventManagementLayout.vue'
import WorkshopCard from '~/components/events/workshops/WorkshopCard.vue'
import WorkshopRegistrationsPanel from '~/components/events/workshops/WorkshopRegistrationsPanel.vue'
import WorkshopCreateEditModal from '~/components/events/workshops/WorkshopCreateEditModal.vue'
import WorkshopKanbanBoard from '~/components/events/workshops/WorkshopKanbanBoard.vue'
import WorkshopAllocationResultModal from '~/components/events/workshops/WorkshopAllocationResultModal.vue'
import { useEvent } from '~/composables/resources/events/events'
import {
  useWorkshops,
  useDeleteWorkshop,
  useOpenWorkshopRegistrations,
  useCloseWorkshopRegistrations,
} from '~/composables/resources/workshops'
import { useWorkshopAllocation } from '~/composables/workshops/useWorkshopAllocation'
import type { WorkshopList } from '~/api/types.gen'

definePageMeta({
  layout: false,
  middleware: ['auth'],
})

const route = useRoute()
const { $notyf } = useNuxtApp()

const id = computed(() => String(route.params.id))

const { data: event } = useEvent(id)
const event_url_title = computed(() => event.value?.data?.url_safe_title)
const eventNumericId = computed<number | null>(() => {
  const raw = (event.value?.data as any)?.id
  return typeof raw === 'number' ? raw : null
})

// ─── Filters & pagination ──────────────────────────────────────────────────────
const search = ref('')
const searchDebounced = ref('')
const statusFilter = ref<'' | 'DRAFT' | 'OPEN' | 'CLOSED' | 'CANCELLED'>('')
const view = ref<'list' | 'kanban'>('list')
const page = ref(1)
const pageSize = 10

let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(search, (val) => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    searchDebounced.value = val
    page.value = 1
  }, 300)
})

watch(statusFilter, () => { page.value = 1 })

const workshopsParams = computed(() => ({
  event: event_url_title.value ?? undefined,
  search: searchDebounced.value || undefined,
  status: statusFilter.value || undefined,
  page: page.value,
  page_size: pageSize,
}))

const {
  data: workshopsData,
  isLoading: workshopsLoading,
  isError: workshopsError,
} = useWorkshops(computed(() =>
  event_url_title.value ? workshopsParams.value : undefined,
))

const workshopList = computed<WorkshopList[]>(() => workshopsData.value?.data?.results ?? [])
const total = computed(() => workshopsData.value?.data?.count ?? 0)
const totalPages = computed(() => Math.ceil(total.value / pageSize))

// ─── Sidebar stats (fetches all to get accurate counts across pages) ───────────
const { data: allWorkshopsData } = useWorkshops(computed(() =>
  event_url_title.value ? { event: event_url_title.value, page_size: 1000 } : undefined,
))
const allWorkshops = computed<WorkshopList[]>(() => allWorkshopsData.value?.data?.results ?? [])
const openCount = computed(() => allWorkshops.value.filter(w => w.status === 'OPEN').length)
const closedCount = computed(() => allWorkshops.value.filter(w => w.status === 'CLOSED').length)
const draftCount = computed(() => allWorkshops.value.filter(w => w.status === 'DRAFT').length)

// ─── Expand registrations ──────────────────────────────────────────────────────
const expandedIds = ref(new Set<number>())

function toggleExpand(workshopId: number) {
  if (expandedIds.value.has(workshopId)) {
    expandedIds.value.delete(workshopId)
  } else {
    expandedIds.value.add(workshopId)
  }
  // Trigger reactivity on Set
  expandedIds.value = new Set(expandedIds.value)
}

// ─── Modal ─────────────────────────────────────────────────────────────────────
const showModal = ref(false)
const editingWorkshop = ref<WorkshopList | null>(null)

function openCreate() {
  editingWorkshop.value = null
  showModal.value = true
}

function openEdit(workshop: WorkshopList) {
  editingWorkshop.value = workshop
  showModal.value = true
}

function onSaved() {
  $notyf?.success('Workshop saved.')
}

// ─── Mutations ─────────────────────────────────────────────────────────────────
const deleteMutation = useDeleteWorkshop()
const openMutation = useOpenWorkshopRegistrations()
const closeMutation = useCloseWorkshopRegistrations()

async function handleDelete(workshopId: number) {
  if (!confirm('Delete this workshop? This cannot be undone.')) return
  try {
    await deleteMutation.mutateAsync(workshopId)
    expandedIds.value.delete(workshopId)
    expandedIds.value = new Set(expandedIds.value)
    $notyf?.success('Workshop deleted.')
  } catch {
    $notyf?.error('Could not delete workshop.')
  }
}

async function handleOpen(workshopId: number) {
  try {
    await openMutation.mutateAsync(workshopId)
    $notyf?.success('Registrations opened.')
  } catch {
    $notyf?.error('Could not open registrations.')
  }
}

async function handleClose(workshopId: number) {
  try {
    await closeMutation.mutateAsync(workshopId)
    $notyf?.success('Registrations closed.')
  } catch {
    $notyf?.error('Could not close registrations.')
  }
}

// ─── Allocation ────────────────────────────────────────────────────────────────
const { isRunning: allocationRunning, lastResult, showResultModal, triggerAllocation } = useWorkshopAllocation()

async function runAlloc(workshop: WorkshopList) {
  try {
    await triggerAllocation(workshop.id, workshop.title)
  } catch {
    $notyf?.error('Allocation failed. Please try again.')
  }
}

async function runAllocById(workshopId: number) {
  const workshop = workshopList.value.find(w => w.id === workshopId)
  if (workshop) await runAlloc(workshop)
}
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}
.slide-down-enter-to,
.slide-down-leave-from {
  max-height: 600px;
  opacity: 1;
}
</style>
