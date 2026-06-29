<template>
  <ManagementLayout :organisation-id="organisationId" :organisation="organisation">
    <!-- <div class="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 class="text-4xl font-black text-deep-navy tracking-tight">Community Events</h1>
        <p class="mt-2 text-sm font-medium text-deep-navy/60">
          Dashboard view for quick status, registration progress, and event access.
        </p>
      </div>
      <div class="inline-flex items-center rounded-md bg-deep-navy px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white">
        {{ totalCount }} total
      </div>
    </div> -->

    <div class="mb-8 bg-blue-600 px-4 py-6 sm:px-6 lg:px-8 rounded-2xl shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
      <div class="mx-auto flex max-w-5xl items-center rounded-full border border-slate-200 bg-white px-2 py-2 shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
        <!-- Search -->
        <div class="relative flex-1">
          <svg
            class="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search events, types, descriptions..."
            class="h-12 w-full rounded-full bg-transparent pl-12 pr-10 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />

          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <svg
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Divider -->
        <div class="mx-2 hidden h-8 w-px bg-slate-200 md:block"></div>

        <!-- Status Filter -->
        <div class="relative w-auto md:w-56">
          <select
            v-model="statusFilter"
            class="h-12 w-full appearance-none rounded-full bg-transparent px-5 pr-10 text-sm font-medium text-slate-700 focus:outline-none"
          >
            <option :value="undefined">All Statuses</option>
            <option value="DRAFTING">Drafting</option>
            <option value="PUBLISHED">Published</option>
            <option value="OPEN">Open</option>
            <option value="CLOSED">Closed</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="POSTPONED">Postponed</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          <svg
            class="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        <!-- Search Button -->
        <button
          class="ml-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700"
        >
          <svg
            class="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="space-y-3">
      <div v-for="i in 5" :key="i" class="rounded-lg bg-white p-6 ring-1 ring-slate-200">
        <USkeleton class="mb-3 h-6 w-2/5 rounded-lg" />
        <USkeleton class="h-4 w-1/3 rounded-lg" />
      </div>
    </div>

    <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 p-6">
      <div class="flex gap-4">
        <div class="flex-shrink-0">
          <div class="flex h-10 w-10 items-center justify-center rounded-md bg-red-500">
            <svg class="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
          </div>
        </div>
        <div class="flex-1">
          <h3 class="mb-1 text-sm font-black uppercase tracking-tight text-deep-navy">Error loading events</h3>
          <p class="text-xs font-medium text-deep-navy/70">{{ error.message }}</p>
        </div>
      </div>
    </div>

    <div
      v-else-if="!events.length"
      class="rounded-lg bg-white py-16 text-center shadow-[0_18px_36px_rgba(15,23,42,0.08)] ring-1 ring-slate-200"
    >
      <div class="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-md border border-slate-200 bg-slate-100">
        <UIcon name="i-heroicons-calendar-days" class="h-16 w-16 text-slate-400" />
      </div>
      <h3 class="mb-2 text-xl font-black uppercase tracking-tight text-deep-navy">No events found</h3>
      <p class="text-sm font-medium text-deep-navy/60">
        {{ searchQuery || statusFilter ? 'Try adjusting your filters' : 'Get started by creating your first event' }}
      </p>
    </div>

    <section v-else class="overflow-hidden rounded-2xl border-2 border-deep-navy bg-white shadow-drawn">
      <div class="border-b border-gray-100 px-6 py-5 sm:px-8">
        <div class="flex items-center gap-3">
          <UIcon name="i-heroicons-calendar-days" class="h-5 w-5 text-primary" />
          <h2 class="text-sm font-black uppercase tracking-widest text-primary">Events</h2>
        </div>
        <p class="mt-3 text-xs text-gray-500">Live list of events with status, timing, and registration progress.</p>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-gray-50">
            <tr class="border-b border-gray-100">
              <th class="px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-600 sm:px-8">Event</th>
              <th class="px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-600">Date</th>
              <th class="px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-600">Status</th>
              <th class="px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-600">Registrations</th>
              <th class="px-6 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-600 sm:px-8">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 bg-white">
            <tr
              v-for="event in events"
              :key="event.event_id"
              class="transition hover:bg-gray-50"
            >
              <td class="px-6 py-4 sm:px-8">
                <div class="flex items-center gap-4">
                  <div class="h-12 w-12 overflow-hidden rounded-lg border border-gray-200 bg-slate-200">
                    <img
                      v-if="event.main_landing_image?.image"
                      :src="resolveImageUrl(event.main_landing_image.image)"
                      :alt="event.title"
                      class="h-full w-full object-cover"
                      @error="onImageError"
                    />
                    <div v-else class="h-full w-full bg-gradient-to-br from-slate-300 to-slate-500" />
                  </div>
                  <div class="min-w-0">
                    <NuxtLink
                      :to="`/communities/${organisationId}/m/events/${event.url_safe_title}`"
                      class="line-clamp-1 text-base font-semibold text-gray-900 hover:text-primary"
                    >
                      {{ event.title }}
                    </NuxtLink>
                    <p class="line-clamp-1 text-xs font-medium uppercase tracking-[0.14em] text-gray-500">
                      {{ event.event_type_name || 'General event' }}
                    </p>
                  </div>
                </div>
              </td>

              <td class="px-6 py-4">
                <div class="space-y-1">
                  <p class="text-sm font-semibold text-gray-900">{{ formatEventDate(event.start_datetime) }}</p>
                  <p class="inline-flex items-center gap-1 text-xs font-medium text-gray-500">
                    <UIcon name="i-heroicons-clock" class="h-3.5 w-3.5" />
                    {{ formatEventTime(event.start_datetime) }}
                  </p>
                </div>
              </td>

              <td class="px-6 py-4">
                <span
                  class="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]"
                  :class="getStatusBadgeClass(event.status)"
                >
                  <UIcon name="i-heroicons-sparkles" class="h-3.5 w-3.5" />
                  {{ event.status }}
                </span>
              </td>

              <td class="px-6 py-4">
                <div class="space-y-1">
                  <div class="flex items-center justify-between text-xs font-semibold text-deep-navy">
                    <span>{{ getRegistrationLabel(event) }}</span>
                    <span class="text-gray-500">{{ event.attendee_overview.percentage_full?.toFixed(1) }}%</span>
                  </div>
                  <div class="h-1.5 overflow-hidden rounded-md bg-gray-200">
                    <div
                      class="h-full rounded-md bg-primary transition-all duration-300"
                      :style="{ width: `${event.attendee_overview.percentage_full || 0}%` }"
                    />
                  </div>
                </div>
              </td>

              <td class="px-6 py-4 sm:px-8">
                <div class="flex justify-end gap-2">
                  <NuxtLink
                    :to="`/events/${event.url_safe_title}`"
                    class="inline-flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                  >
                    <UIcon name="i-heroicons-eye" class="h-3.5 w-3.5" />
                    View
                  </NuxtLink>
                  <NuxtLink
                    :to="`/communities/${organisationId}/m/events/${event.url_safe_title}`"
                    class="inline-flex items-center gap-1 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-slate-700"
                  >
                    <UIcon name="i-heroicons-cog-6-tooth" class="h-3.5 w-3.5" />
                    Manage
                  </NuxtLink>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex flex-col gap-4 border-t border-gray-100 bg-gray-50 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p class="text-sm font-medium text-gray-600">
          Showing {{ showingStart }}-{{ showingEnd }} of {{ totalCount }} events
        </p>

        <div class="flex items-center gap-2">
          <button
            class="flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="currentPage <= 1"
            @click="setPage(currentPage - 1)"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            v-for="page in visiblePages"
            :key="page"
            class="flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm font-black transition"
            :class="page === currentPage ? 'bg-slate-900 text-white' : 'border border-gray-300 text-slate-700 hover:bg-gray-100'"
            @click="setPage(page)"
          >
            {{ page }}
          </button>

          <button
            class="flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="currentPage >= totalPages"
            @click="setPage(currentPage + 1)"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  </ManagementLayout>
</template>

<script setup lang="ts">
import type { EventList } from '~/api/types.gen'
import { useEvents } from '~/composables/resources/events/events'
import { useOrganisation } from '~/composables/resources/organisation/organisations'
import ManagementLayout from '~/components/communities/ManagementLayout.vue'
import { resolveImageUrl, onImageError } from '~/utils/image'

const route = useRoute()
const organisationId = computed(() => route.params.id as string)

// Fetch organisation for the layout
const { data: orgData } = useOrganisation(organisationId)
const organisation = computed(() => orgData.value?.data)
const organisationNumericId = computed(() => organisation.value?.id)

const searchQuery = ref('')
const statusFilter = ref<string | undefined>(undefined)
const currentPage = ref(1)
const pageSize = ref(10)

const queryParams = computed(() => ({
  organisation: organisationNumericId.value,
  page: currentPage.value,
  page_size: pageSize.value,
  ...(statusFilter.value && { status: statusFilter.value }),
  ...(searchQuery.value && { search: searchQuery.value }),
}))

const { data, isLoading, error } = useEvents(queryParams)

const events = computed<EventList[]>(() => data.value?.data?.results || [])
const totalCount = computed(() => data.value?.data?.count || 0)

const totalPages = computed(() => {
  const pages = Math.ceil(totalCount.value / pageSize.value)
  return pages > 0 ? pages : 1
})

const showingStart = computed(() => {
  if (!totalCount.value) return 0
  return (currentPage.value - 1) * pageSize.value + 1
})

const showingEnd = computed(() => {
  if (!totalCount.value) return 0
  return Math.min(currentPage.value * pageSize.value, totalCount.value)
})

const visiblePages = computed(() => {
  const maxVisible = 5
  if (totalPages.value <= maxVisible) {
    return Array.from({ length: totalPages.value }, (_, index) => index + 1)
  }

  let start = Math.max(currentPage.value - 2, 1)
  let end = Math.min(start + maxVisible - 1, totalPages.value)

  if (end - start + 1 < maxVisible) {
    start = Math.max(end - maxVisible + 1, 1)
  }

  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
})

watch([searchQuery, statusFilter], () => {
  currentPage.value = 1
})

watch(totalPages, (pageCount) => {
  if (currentPage.value > pageCount) {
    currentPage.value = pageCount
  }
})

const setPage = (page: number) => {
  if (page < 1 || page > totalPages.value || page === currentPage.value) return
  currentPage.value = page
}

const formatEventDate = (dateString?: string) => {
  if (!dateString) return 'No date'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateString))
}

const formatEventTime = (dateString?: string) => {
  if (!dateString) return ''
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateString))
}

const getStatusLabel = (status?: string) => {
  switch (status?.toUpperCase()) {
    case 'DRAFTING':
      return 'Draft'
    case 'IN_PROGRESS':
      return 'In Progress'
    default:
      return status || 'Unknown'
  }
}

const getStatusBadgeClass = (status?: string) => {
  switch (status?.toUpperCase()) {
    case 'OPEN':
    case 'PUBLISHED':
      return 'bg-emerald-100 text-emerald-700'
    case 'DRAFTING':
      return 'bg-slate-200 text-slate-700'
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-700'
    case 'CLOSED':
    case 'COMPLETED':
      return 'bg-orange-100 text-orange-700'
    case 'CANCELLED':
    case 'DELETED':
      return 'bg-red-100 text-red-700'
    case 'POSTPONED':
      return 'bg-amber-100 text-amber-700'
    case 'ARCHIVED':
      return 'bg-zinc-200 text-zinc-700'
    default:
      return 'bg-slate-200 text-slate-700'
  }
}

const getAttendeeCount = (event: EventList) => {
  const eventWithTotals = event as EventList & {
    number_of_attendees?: number
    attendees_count?: number
    current_attendance?: number
  }

  return eventWithTotals.number_of_attendees
    ?? eventWithTotals.attendees_count
    ?? eventWithTotals.current_attendance
    ?? 0
}

const getCapacity = (event: EventList) => {
  const eventWithCapacity = event as EventList & {
    maximum_attendance?: number | null
    max_attendance?: number | null
  }

  return eventWithCapacity.maximum_attendance ?? eventWithCapacity.max_attendance ?? null
}

const getRegistrationPercent = (event: EventList) => {
  const attendees = getAttendeeCount(event)
  const capacity = getCapacity(event)
  if (!capacity || capacity <= 0) return attendees > 0 ? 100 : 0
  return Math.max(0, Math.min(100, Math.round((attendees / capacity) * 100)))
}

const getRegistrationLabel = (event: EventList) => {
  const attendees = event.attendee_overview?.total_attendees
  const capacity = event.attendee_overview?.max_attendance
  if (!capacity || capacity <= 0) return `${attendees} attendees`
  return `${attendees} / ${capacity} attendees`
}

definePageMeta({
  middleware: ['auth', 'organisation-controller'],
  layout: false,
})

</script>