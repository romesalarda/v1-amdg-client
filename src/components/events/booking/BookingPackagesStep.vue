<template>
  <section>
    <span class="text-[10px] font-bold text-navy-400 uppercase tracking-widest block mb-2">Step 2 - Required</span>
    <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
      <!-- Header -->
      <div class="flex items-center gap-2 p-6 pb-4 border-b border-navy-50">
        <span class="material-symbols-outlined text-primary">inventory_2</span>
        <div class="flex-1">
          <h3 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest">Booking Packages</h3>
          <p class="text-xs text-navy-600 mt-1">Create pricing packages linked to ticket types</p>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="showSearch = !showSearch"
            :class="['p-2 rounded-lg text-navy-600 hover:text-primary hover:bg-navy-50 transition-colors', showSearch ? 'bg-navy-50 text-primary' : '']"
            title="Search & Filter"
          >
            <span class="material-symbols-outlined text-sm">search</span>
          </button>
          <button
            v-if="canCreate"
            @click="emit('open-modal')"
            :disabled="!ticketTypes.length"
            class="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-slate-800 transition-all text-xs font-bold uppercase tracking-tight disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="material-symbols-outlined text-sm">add</span>
            <span>Add Package</span>
          </button>
        </div>
      </div>

      <!-- Collapsible Search/Filter -->
      <div v-show="showSearch" class="px-6 py-3 border-b border-navy-50 bg-slate-50">
        <div class="flex flex-wrap gap-3">
          <div class="flex-1 min-w-[180px]">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search packages..."
              class="w-full text-sm border border-deep-navy/15 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/40 bg-white"
            />
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <select
              v-model="ticketTypeFilter"
              class="text-sm border border-deep-navy/15 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/40 bg-white"
            >
              <option value="">All Ticket Types</option>
              <option v-for="tt in ticketTypes" :key="tt.id" :value="tt.id">{{ tt.title }}</option>
            </select>
            <select
              v-model="activeFilter"
              class="text-sm border border-deep-navy/15 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/40 bg-white"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <button
              v-if="searchQuery || ticketTypeFilter || activeFilter"
              @click="clearFilters"
              class="text-xs text-navy-500 hover:text-primary px-2 py-1.5 transition-colors"
            >Clear</button>
          </div>
        </div>
      </div>

      <!-- List -->
      <div class="p-6 space-y-4">
        <div v-if="isLoading" class="space-y-3">
          <div v-for="i in 3" :key="i" class="h-28 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"></div>
        </div>

        <div v-else-if="packages.length" class="space-y-3">
          <div
            v-for="pkg in packages"
            :key="pkg.id"
            class="p-4 border border-deep-navy/10 rounded-xl bg-mist-blue/40 hover:bg-mist-blue/60 transition-colors"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h4 class="font-semibold text-navy-900">{{ pkg.name }}</h4>
                <p v-if="pkg.description" class="text-sm text-navy-600 mt-1">{{ pkg.description }}</p>
                <div class="flex items-center gap-2 mt-2">
                  <span class="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded border border-blue-100">
                    {{ formatAmount(pkg.base_amount, pkg.base_amount_currency) }}
                  </span>
                  <span class="text-xs text-navy-500">
                    Ticket: {{ getTicketTypeName(pkg.ticket_type, ticketTypes) }}
                  </span>
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <button
                  @click="emit('open-availability', pkg.id)"
                  title="Manage Availability Windows"
                  class="p-1.5 text-navy-600 hover:text-primary transition-colors"
                >
                  <span class="material-symbols-outlined text-lg">schedule</span>
                </button>
                <button
                  @click="emit('toggle-status', pkg.id, !pkg.is_active)"
                  :disabled="!canUpdate"
                  type="button"
                  class="w-10 h-5 rounded-full relative transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/30"
                  :class="pkg.is_active ? 'bg-primary hover:bg-primary/90' : 'bg-navy-200 hover:bg-navy-300'"
                >
                  <div
                    class="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-200 ease-in-out"
                    :class="pkg.is_active ? 'right-1' : 'left-1'"
                  ></div>
                </button>
                <button
                  @click="emit('open-modal', pkg)"
                  :disabled="!canUpdate"
                  class="p-1.5 text-navy-600 hover:text-primary transition-colors disabled:opacity-50"
                >
                  <span class="material-symbols-outlined text-lg">edit</span>
                </button>
                <button
                  @click="emit('remove', pkg.id)"
                  :disabled="!canDelete || pkg.can_delete === false"
                  class="p-1.5 text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                >
                  <span class="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8 text-navy-600">
          <p v-if="searchQuery || ticketTypeFilter || activeFilter">No packages match your search criteria.</p>
          <p v-else-if="!ticketTypes.length">Create ticket types first before adding packages</p>
          <p v-else>No packages yet. Create one to get started.</p>
        </div>

        <!-- Pagination -->
        <div v-if="totalCount > 0" class="flex items-center justify-between pt-3 border-t border-navy-50">
          <span class="text-xs text-navy-500">{{ paginationLabel }}</span>
          <div class="flex items-center gap-1">
            <button
              @click="page--"
              :disabled="page <= 1"
              class="p-1.5 rounded-md text-navy-600 hover:text-primary hover:bg-navy-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span class="material-symbols-outlined text-base">chevron_left</span>
            </button>
            <span class="text-xs text-navy-700 px-2">{{ page }} / {{ totalPages }}</span>
            <button
              @click="page++"
              :disabled="page >= totalPages"
              class="p-1.5 rounded-md text-navy-600 hover:text-primary hover:bg-navy-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span class="material-symbols-outlined text-base">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useBookingPackages } from '~/composables/resources/booking/bookingPackages'

const props = defineProps<{
  eventId: string
  ticketTypes: any[]
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
}>()

const emit = defineEmits<{
  'open-modal': [pkg?: any]
  'open-availability': [pkgId: number]
  'toggle-status': [id: number, isActive: boolean]
  remove: [id: number]
}>()

const PAGE_SIZE = 10

const showSearch = ref(false)
const searchQuery = ref('')
const debouncedSearch = ref('')
const ticketTypeFilter = ref<number | ''>('')
const activeFilter = ref('')
const page = ref(1)

let searchTimeout: ReturnType<typeof setTimeout> | null = null

watch(searchQuery, (val) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    debouncedSearch.value = val
    page.value = 1
  }, 350)
})

watch([ticketTypeFilter, activeFilter], () => {
  page.value = 1
})

function clearFilters() {
  searchQuery.value = ''
  debouncedSearch.value = ''
  ticketTypeFilter.value = ''
  activeFilter.value = ''
  page.value = 1
}

const queryParams = computed(() => ({
  event: props.eventId,
  search: debouncedSearch.value || undefined,
  ticket_type: ticketTypeFilter.value !== '' ? Number(ticketTypeFilter.value) : undefined,
  is_active: activeFilter.value !== '' ? activeFilter.value === 'true' : undefined,
  page: page.value,
  page_size: PAGE_SIZE,
}))

const { data, isLoading } = useBookingPackages(queryParams)

const packages = computed(() => data.value?.data?.results ?? [])
const totalCount = computed(() => data.value?.data?.count ?? 0)
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / PAGE_SIZE)))

const paginationLabel = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE + 1
  const end = Math.min(page.value * PAGE_SIZE, totalCount.value)
  return `Showing ${start}–${end} of ${totalCount.value}`
})

function formatAmount(amount: string | number, currency?: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(Number(amount))
}

function getTicketTypeName(ticketTypeId: number, ticketTypes: any[]) {
  const ticketType = ticketTypes.find((t: any) => t.id === ticketTypeId)
  return ticketType?.title.replace(/_/g, ' ') || 'Unknown'
}
</script>
