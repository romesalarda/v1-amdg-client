<template>
  <div class="relative flex">
    <!-- Main table area -->
    <div class="flex-1 min-w-0 space-y-0 overflow-hidden rounded-xl border border-deep-navy/10 bg-white shadow-sm">
      <!-- Toolbar -->
      <div class="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-deep-navy/8">
        <div class="flex items-center gap-2.5">
          <UIcon name="i-heroicons-document-text" class="w-4 h-4 text-primary" />
          <span class="text-xs font-black uppercase tracking-widest text-primary">
            Responses
          </span>
          <UBadge
            v-if="!responsesQuery.isLoading.value"
            color="gray"
            variant="soft"
            size="xs"
          >
            {{ totalCount }}
          </UBadge>
        </div>

        <div class="flex items-center gap-2">
          <!-- Refresh -->
          <UButton
            icon="i-heroicons-arrow-path"
            size="xs"
            variant="ghost"
            color="gray"
            :loading="responsesQuery.isFetching.value || isAdvancedFiltering"
            @click="responsesQuery.refetch()"
          />

          <!-- Advanced Filter button -->
          <button
            class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
            :class="
              advancedActiveCount > 0
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            "
            @click="$emit('open-advanced-filter')"
          >
            <UIcon name="i-heroicons-funnel" class="w-3.5 h-3.5" />
            Advanced
            <span
              v-if="advancedActiveCount > 0"
              class="ml-0.5 rounded-full bg-white/25 px-1.5 text-[10px] font-black"
            >
              {{ advancedActiveCount }}
            </span>
          </button>

          <!-- Simple Filter toggle -->
          <button
            class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
            :class="
              isFilterSidebarOpen || activeFilterCount > 0
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            "
            @click="isFilterSidebarOpen = !isFilterSidebarOpen"
          >
            <UIcon name="i-heroicons-adjustments-horizontal" class="w-3.5 h-3.5" />
            Filters
            <span
              v-if="activeFilterCount > 0"
              class="ml-0.5 rounded-full bg-white/25 px-1.5 text-[10px] font-black"
            >
              {{ activeFilterCount }}
            </span>
          </button>
        </div>
      </div>

      <!-- Active filter chips -->
      <div
        v-if="activeFilterCount > 0"
        class="flex flex-wrap gap-2 px-5 py-2 border-b border-deep-navy/8 bg-gray-50"
      >
        <template v-if="filters.is_complete !== undefined">
          <span
            class="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary"
          >
            Status: {{ filters.is_complete ? 'Submitted' : 'In Progress' }}
            <button
              class="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
              @click="applyFilters({ is_complete: undefined })"
            >
              <UIcon name="i-heroicons-x-mark" class="w-3 h-3" />
            </button>
          </span>
        </template>
        <template v-if="filters.ordering && filters.ordering !== '-submitted_at'">
          <span
            class="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary"
          >
            Sort: {{ orderingLabel(filters.ordering) }}
            <button
              class="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
              @click="applyFilters({ ordering: '-submitted_at' })"
            >
              <UIcon name="i-heroicons-x-mark" class="w-3 h-3" />
            </button>
          </span>
        </template>
        <button
          class="text-[11px] font-semibold text-gray-500 hover:text-red-500 transition-colors underline"
          @click="clearFilters"
        >
          Clear all
        </button>
      </div>

      <!-- Loading skeleton -->
      <div v-if="responsesQuery.isLoading.value" class="divide-y divide-gray-50">
        <div v-for="i in 6" :key="i" class="flex items-center gap-4 px-5 py-3.5 animate-pulse">
          <div class="h-9 w-9 rounded-full bg-gray-100 shrink-0" />
          <div class="flex-1 space-y-1.5">
            <div class="h-3.5 w-36 rounded bg-gray-100" />
            <div class="h-2.5 w-24 rounded bg-gray-100" />
          </div>
          <div class="h-5 w-16 rounded-full bg-gray-100" />
          <div class="h-4 w-28 rounded bg-gray-100" />
        </div>
      </div>

      <!-- Error -->
      <div
        v-else-if="responsesQuery.error.value"
        class="flex flex-col items-center justify-center gap-3 py-16 text-center"
      >
        <UIcon name="i-heroicons-exclamation-circle" class="w-10 h-10 text-red-400" />
        <p class="text-sm font-semibold text-red-600">Failed to load responses</p>
        <UButton size="xs" variant="soft" color="red" @click="responsesQuery.refetch()">
          Retry
        </UButton>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="responses.length === 0"
        class="flex flex-col items-center justify-center gap-3 py-16 text-center"
      >
        <div class="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
          <UIcon name="i-heroicons-inbox" class="w-8 h-8 text-gray-300" />
        </div>
        <p class="text-sm font-semibold text-deep-navy/70">No responses yet</p>
        <p class="text-xs text-deep-navy/40 max-w-xs">
          {{ activeFilterCount > 0 ? 'No responses match the active filters.' : 'Attendees have not submitted any responses to this form.' }}
        </p>
        <UButton v-if="activeFilterCount > 0" size="xs" variant="ghost" color="gray" @click="clearFilters">
          Clear filters
        </UButton>
      </div>

      <!-- Response rows -->
      <div v-else class="divide-y divide-gray-50">
        <button
          v-for="response in responses"
          :key="response.id"
          type="button"
          class="w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-primary/4 transition-colors group"
          @click="$emit('open-response', response)"
        >
          <!-- Avatar -->
          <div
            class="h-12 w-12 rounded-full flex items-center justify-center shrink-0 text-sm font-black uppercase text-white select-none"
            :class="response.is_complete ? 'bg-emerald-500' : 'bg-amber-400'"
          >
            <!-- {{ initials(response.attendee_display) }} -->
            <img
              :src="`https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${response.attendee_display || response.attendee}`"
              alt="Default profile"
              class="w-12 h-12 rounded-full object-cover"
            />
          </div>

          <!-- Name + ID -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-deep-navy truncate group-hover:text-primary transition-colors">
              {{ response.attendee_display || 'Unknown Attendee' }}
            </p>
            <p class="text-[11px] text-gray-400 font-mono mt-0.5 truncate">
              {{ response.attendee }}
            </p>
          </div>

          <!-- Completion badge -->
          <span
            class="shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide font-mono"
            :class="
              response.is_complete
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-100 text-amber-700'
            "
          >
            <template v-if="response.is_complete">
              <UIcon name="i-heroicons-check" class="w-3 h-3" />
              Submitted
            </template>
            <template v-else>
              <UIcon name="i-heroicons-pencil-square" class="w-3 h-3" />
              In Progress
            </template>
          </span>

          <!-- Submitted at -->
          <span class="shrink-0 text-xs text-gray-400 hidden sm:block">
            {{ formatDate(response.submitted_at) }}
          </span>

          <!-- Chevron -->
          <UIcon
            name="i-heroicons-chevron-right"
            class="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors shrink-0"
          />
        </button>
      </div>

      <!-- Pagination -->
      <div
        v-if="totalPages > 1"
        class="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/50"
      >
        <span class="text-xs text-gray-500">
          Page {{ filters.page ?? 1 }} of {{ totalPages }} · {{ totalCount }} total
        </span>
        <UPagination
          :model-value="filters.page ?? 1"
          :total="totalCount"
          :page-count="filters.page_size ?? 25"
          size="xs"
          @update:model-value="setPage"
        />
      </div>
    </div>

    <!-- Filter sidebar (slides in from the right) -->
    <Transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0 translate-x-4"
      enter-to-class="opacity-100 translate-x-0"
      leave-active-class="transition-all duration-150"
      leave-from-class="opacity-100 translate-x-0"
      leave-to-class="opacity-0 translate-x-4"
    >
      <aside
        v-if="isFilterSidebarOpen"
        class="ml-4 w-64 shrink-0 rounded-xl border border-deep-navy/10 bg-white shadow-sm self-start sticky top-4"
      >
        <div class="flex items-center justify-between px-4 py-3 border-b border-deep-navy/8">
          <span class="text-xs font-black uppercase tracking-widest text-primary">Filters</span>
          <UButton
            icon="i-heroicons-x-mark"
            size="2xs"
            variant="ghost"
            color="gray"
            @click="isFilterSidebarOpen = false"
          />
        </div>

        <div class="px-4 py-4 space-y-5">
          <!-- Completion status -->
          <div>
            <label class="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2">
              Completion
            </label>
            <div class="flex flex-col gap-1.5">
              <label
                v-for="opt in completionOptions"
                :key="String(opt.value)"
                class="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="is_complete"
                  class="rounded-full border-gray-300 text-primary focus:ring-primary/30"
                  :checked="filters.is_complete === opt.value"
                  @change="applyFilters({ is_complete: opt.value })"
                />
                <span class="text-xs text-gray-700">{{ opt.label }}</span>
              </label>
            </div>
          </div>

          <!-- Ordering -->
          <div>
            <label class="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2">
              Sort by
            </label>
            <select
              class="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              :value="filters.ordering ?? '-submitted_at'"
              @change="applyFilters({ ordering: ($event.target as HTMLSelectElement).value })"
            >
              <option v-for="opt in orderingOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <!-- Page size -->
          <div>
            <label class="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2">
              Rows per page
            </label>
            <select
              class="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              :value="filters.page_size ?? 25"
              @change="applyFilters({ page_size: Number(($event.target as HTMLSelectElement).value) })"
            >
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </div>

          <!-- Clear -->
          <UButton
            label="Clear All Filters"
            size="xs"
            variant="soft"
            color="gray"
            block
            :disabled="activeFilterCount === 0"
            @click="clearFilters"
          />
        </div>
      </aside>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { EventFormResponse } from '~/api/types.gen'
import type { FormResponsesTableFilters } from '~/composables/resources/events/useFormResponsesTable'

const props = defineProps<{
  responses: EventFormResponse[]
  totalCount: number
  totalPages: number
  filters: FormResponsesTableFilters
  activeFilterCount: number
  advancedActiveCount: number
  isAdvancedFiltering: boolean
  isFilterSidebarOpen: boolean
  responsesQuery: {
    isLoading: { value: boolean }
    isFetching: { value: boolean }
    error: { value: unknown }
    refetch: () => void
  }
}>()

const emit = defineEmits<{
  (e: 'open-response', response: EventFormResponse): void
  (e: 'apply-filters', filters: Partial<FormResponsesTableFilters>): void
  (e: 'clear-filters'): void
  (e: 'set-page', page: number): void
  (e: 'update:isFilterSidebarOpen', value: boolean): void
  (e: 'open-advanced-filter'): void
}>()

// Make isFilterSidebarOpen a writable computed so the template can use v-model-like binding
const isFilterSidebarOpen = computed({
  get: () => props.isFilterSidebarOpen,
  set: (v) => emit('update:isFilterSidebarOpen', v),
})

function applyFilters(f: Partial<FormResponsesTableFilters>) {
  emit('apply-filters', f)
}

function clearFilters() {
  emit('clear-filters')
}

function setPage(page: number) {
  emit('set-page', page)
}

// ── Options ─────────────────────────────────────────────────────────────────
const completionOptions: Array<{ label: string; value: boolean | undefined }> = [
  { label: 'All responses', value: undefined },
  { label: 'Submitted only', value: true },
  { label: 'In Progress only', value: false },
]

const orderingOptions = [
  { label: 'Newest first', value: '-submitted_at' },
  { label: 'Oldest first', value: 'submitted_at' },
  { label: 'Last updated (newest)', value: '-updated_at' },
  { label: 'Last updated (oldest)', value: 'updated_at' },
]

function orderingLabel(ordering: string): string {
  return orderingOptions.find((o) => o.value === ordering)?.label ?? ordering
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function initials(name: string | null | undefined): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase()
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase()
}

function formatDate(iso: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
