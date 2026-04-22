<template>
  <EventManagementLayout :event-id="id" :event="event" :has-hero="true">
    <!-- Hero Section -->
    <div class="relative h-[350px] w-full overflow-hidden">
      <!-- Background Image -->
      <div class="absolute inset-0">
        <img
          v-if="event?.main_landing_image?.image"
          :src="resolveImageUrl(event.main_landing_image.image)"
          :alt="event.title"
          class="h-full w-full object-cover"
          @error="onImageError"
        >
        <div v-else class="h-full w-full bg-deep-navy" />
      </div>
      
      <!-- Navy overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-deep-navy/70 via-deep-navy/50 to-transparent" />
      
      <!-- Content Overlay -->
      <div class="absolute inset-0 flex items-end">
        <div class="w-full px-8 py-10 text-white">
          <div class="max-w-4xl">
            <p class="mb-2 text-[11px] font-semibold uppercase tracking-[0.4em] text-white/55">
              Event management dashboard
            </p>
            <h1 class="text-4xl font-black tracking-tight md:text-5xl" style="font-family: 'Plus Jakarta Sans', sans-serif;">
              {{ event?.title || 'Event dashboard' }}
            </h1>
            <div class="mt-4 flex flex-wrap gap-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/70">
              <span class="rounded-full bg-white/10 px-3 py-1 backdrop-blur">
                {{ event?.status_display || 'Status pending' }}
              </span>
              <span class="rounded-full bg-white/10 px-3 py-1 backdrop-blur">
                {{ animatedAttendancePercentage.toFixed(0) }}% capacity
              </span>
              <span class="rounded-full bg-white/10 px-3 py-1 backdrop-blur">
                £{{ formatCurrency(animatedTotalRevenue) }} revenue
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-mist-blue p-8">
      <div class="space-y-8">
        <section class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div class="rounded-xl bg-white p-5">
            <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-gray-500">Total registrations</p>
            <div class="mt-3 flex items-end justify-between gap-4">
              <div>
                <div class="text-4xl font-black text-deep-navy" style="font-family: 'Plus Jakarta Sans', sans-serif;">
                  {{ animatedTotalAttendees.toFixed(0) }}
                </div>
                <p v-if="event?.maximum_attendance" class="mt-1 text-xs font-medium uppercase tracking-[0.2em] text-gray-400">
                  of {{ event.maximum_attendance }} capacity
                </p>
              </div>
              <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-deep-navy">
                <UIcon name="i-heroicons-user-group" class="h-6 w-6" />
              </div>
            </div>
          </div>

          <div class="rounded-xl bg-white p-5">
            <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-gray-500">Event revenue</p>
            <div class="mt-3 flex items-end justify-between gap-4">
              <div>
                <div class="text-4xl font-black text-deep-navy" style="font-family: 'Plus Jakarta Sans', sans-serif;">
                  £{{ formatCurrency(animatedTotalRevenue) }}
                </div>
                <p class="mt-1 text-xs font-medium uppercase tracking-[0.2em] text-gray-400">
                  from {{ animatedTotalBookings.toFixed(0) }} bookings
                </p>
              </div>
              <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <UIcon name="i-heroicons-currency-pound" class="h-6 w-6" />
              </div>
            </div>
          </div>

          <div class="rounded-xl bg-white p-5">
            <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-gray-500">Event staff</p>
            <div class="mt-3 flex items-end justify-between gap-4">
              <div>
                <div class="text-4xl font-black text-deep-navy" style="font-family: 'Plus Jakarta Sans', sans-serif;">
                  {{ animatedTotalStaff.toFixed(0) }}
                </div>
                <p class="mt-1 text-xs font-medium uppercase tracking-[0.2em] text-gray-400">
                  active members
                </p>
              </div>
              <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <UIcon name="i-heroicons-identification" class="h-6 w-6" />
              </div>
            </div>
          </div>

          <div class="rounded-xl bg-white p-5">
            <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-gray-500">Form questions</p>
            <div class="mt-3 flex items-end justify-between gap-4">
              <div>
                <div class="text-4xl font-black text-deep-navy" style="font-family: 'Plus Jakarta Sans', sans-serif;">
                  {{ animatedTotalQuestions.toFixed(0) }}
                </div>
                <p class="mt-1 text-xs font-medium uppercase tracking-[0.2em] text-gray-400">
                  registration fields
                </p>
              </div>
              <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <UIcon name="i-heroicons-clipboard-document-list" class="h-6 w-6" />
              </div>
            </div>
          </div>
        </section>

        <section class="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div class="xl:col-span-8 rounded-xl bg-white overflow-hidden">
            <div class="flex flex-col gap-4 border-b border-black/5 px-6 py-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-gray-500">Analytics</p>
                <h2 class="mt-1 text-xl font-black text-deep-navy" style="font-family: 'Plus Jakarta Sans', sans-serif;">
                  Registrations over time
                </h2>
              </div>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="period in registrationPeriods"
                  :key="period.value"
                  type="button"
                  class="rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition-colors"
                  :class="registrationPeriod === period.value
                    ? 'bg-deep-navy text-white'
                    : 'bg-mist-blue text-deep-navy/70 hover:bg-deep-navy/5'"
                  @click="registrationPeriod = period.value"
                >
                  {{ period.label }}
                </button>
              </div>
            </div>

            <div class="p-6">
              <div v-if="isLoadingRegistrationTrends" class="flex h-80 items-center justify-center">
                <div class="text-center">
                  <div class="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-deep-navy" />
                  <p class="text-sm font-medium text-gray-500">Loading registration data...</p>
                </div>
              </div>
              <div v-else-if="registrationTrendsError" class="flex h-80 items-center justify-center">
                <div class="text-center">
                  <UIcon name="i-heroicons-exclamation-triangle" class="mx-auto h-12 w-12 text-red-400" />
                  <p class="mt-4 text-sm font-medium text-gray-500">Could not load registration trends.</p>
                </div>
              </div>
              <v-chart
                v-else-if="registrationTrendsOption"
                :option="registrationTrendsOption"
                :autoresize="true"
                class="h-80"
              />
              <div v-else class="flex h-80 items-center justify-center">
                <div class="text-center">
                  <UIcon name="i-heroicons-chart-bar" class="mx-auto h-12 w-12 text-gray-300" />
                  <p class="mt-4 text-sm font-medium text-gray-500">No registration data available.</p>
                </div>
              </div>
            </div>
          </div>

          <div class="xl:col-span-4 space-y-6">
            <div class="rounded-xl bg-gradient-to-br p-6 text-white" :class="eventStateAppearance.gradient">
              <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">Event state</p>
              <div class="mt-3 flex items-center justify-between gap-4">
                <div>
                  <div class="text-2xl font-black" :class="eventStateAppearance.textColor">
                    {{ event?.status_display || 'N/A' }}
                  </div>
                  <p class="mt-1 text-xs font-medium uppercase tracking-[0.2em] text-white/40">
                    Current status
                  </p>
                </div>
                <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <UIcon :name="eventStateAppearance.icon" class="h-7 w-7 text-white/80" />
                </div>
              </div>
            </div>

            <div class="rounded-xl bg-white p-6">
              <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-gray-500">Revenue sources</p>
              <div class="mt-4 space-y-4">
                <div v-if="isLoadingRevenue" class="text-center text-xs text-gray-400">Loading...</div>
                <div v-else-if="!revenueBreakdown || normalizeNumber(revenueBreakdown.total_revenue) === 0" class="text-center text-xs text-gray-400">No revenue data.</div>
                <template v-else>
                  <div v-for="(item, key) in revenueBreakdown.breakdown" :key="key" class="space-y-2">
                    <div class="flex items-center justify-between text-xs">
                      <span class="font-semibold text-gray-600">{{ (item as any).source }}</span>
                      <span class="font-bold text-deep-navy">£{{ formatCurrency((item as any).value as number) }}</span>
                    </div>
                    <div class="h-2 rounded-full bg-gray-200">
                      <div
                        class="h-2 rounded-full bg-blue-500"
                        :style="{ width: `${revenueShare((item as any).value as number)}%` }"
                      />
                    </div>
                  </div>
                </template>
              </div>
            </div>


          </div>
        </section>
          <section class="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <div class="xl:col-span-9 rounded-xl bg-white overflow-hidden">
              <div class="flex flex-col gap-4 border-b border-black/5 px-6 py-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-gray-500">Distribution</p>
                  <h2 class="mt-1 text-xl font-black text-deep-navy" style="font-family: 'Plus Jakarta Sans', sans-serif;">
                    Attendee locations
                  </h2>
                </div>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="scope in locationScopes"
                    :key="scope.value"
                    type="button"
                    class="rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition-colors"
                    :class="selectedLocationScope === scope.value
                      ? 'bg-deep-navy text-white'
                      : 'bg-mist-blue text-deep-navy/70 hover:bg-deep-navy/5'"
                    @click="selectedLocationScope = scope.value"
                  >
                    {{ scope.label }}
                  </button>
                </div>
              </div>
              <div class="h-[500px] w-full bg-gray-100">
                <MapLibre
                  v-if="!isLocationBreakdownPending"
                  :map-id="'location-breakdown-map'"
                  :map-style="mapStyle"
                  :center="mapCenter"
                  :zoom="mapZoom"
                  :sources="areaMapSources"
                  :layers="areaMapLayers"
                />
                <div v-else class="flex h-full items-center justify-center">
                  <div class="text-center">
                    <div class="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-deep-navy" />
                    <p class="text-sm font-medium text-gray-500">Loading map data...</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="xl:col-span-3 rounded-xl bg-white">
              <div class="border-b border-black/5 px-6 py-5">
                <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-gray-500">Top locations</p>
                <h2 class="mt-1 text-xl font-black text-deep-navy" style="font-family: 'Plus Jakarta Sans', sans-serif;">
                  By {{ selectedLocationScopeLabel }}
                </h2>
              </div>
              <div class="p-6">
                <div v-if="isLocationBreakdownPending" class="text-center text-xs text-gray-400">Loading...</div>
                <div v-else-if="!attendeesByLocation.length" class="text-center text-xs text-gray-400">No location data.</div>
                <ul v-else class="space-y-4">
                  <li v-for="(item, index) in attendeesByLocation" :key="index" class="flex items-center justify-between gap-4">
                    <div class="flex-1">
                      <p class="truncate text-sm font-bold text-deep-navy">{{ item.label }}</p>
                      <p class="text-xs text-gray-500">{{ item.value }} attendees</p>
                    </div>
                    <div class="text-sm font-black text-deep-navy">{{ item.percentage.toFixed(1) }}%</div>
                  </li>
                </ul>
              </div>
            </div>
          </section>

        <section class="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div class="rounded-xl bg-white overflow-hidden">
            <div class="border-b border-black/5 px-6 py-5">
              <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-gray-500">Payments</p>
              <h2 class="mt-1 text-xl font-black text-deep-navy" style="font-family: 'Plus Jakarta Sans', sans-serif;">
                Payment status breakdown
              </h2>
            </div>
            <div class="p-6">
              <div v-if="isLoadingPaymentStatus" class="flex h-80 items-center justify-center">
                <div class="text-center">
                  <div class="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-deep-navy" />
                  <p class="text-sm font-medium text-gray-500">Loading payment data...</p>
                </div>
              </div>
              <v-chart
                v-else-if="paymentStatusOption"
                :option="paymentStatusOption"
                :autoresize="true"
                class="h-80"
              />
              <div v-else class="flex h-80 items-center justify-center">
                <div class="text-center">
                  <UIcon name="i-heroicons-currency-pound" class="mx-auto h-12 w-12 text-gray-300" />
                  <p class="mt-4 text-sm font-medium text-gray-500">No payment data available.</p>
                </div>
              </div>
            </div>
          </div>

          <div class="rounded-xl bg-white overflow-hidden">
            <div class="border-b border-black/5 px-6 py-5">
              <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-gray-500">Activity</p>
              <h2 class="mt-1 text-xl font-black text-deep-navy" style="font-family: 'Plus Jakarta Sans', sans-serif;">
                Recent activities
              </h2>
            </div>
            <div class="p-6">
              <ul v-if="recentActivities.length" class="space-y-4">
                <li v-for="activity in recentActivities" :key="activity.title" class="flex items-start gap-4">
                  <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full" :class="activity.color">
                    <UIcon :name="activity.icon" class="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-deep-navy">{{ activity.title }}</p>
                  </div>
                </li>
              </ul>
              <div v-else class="flex h-80 items-center justify-center">
                <div class="text-center">
                  <UIcon name="i-heroicons-bolt-slash" class="mx-auto h-12 w-12 text-gray-300" />
                  <p class="mt-4 text-sm font-medium text-gray-500">No recent activities.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </EventManagementLayout>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, PieChart, BarChart, GaugeChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'
import { attendeesList, locationsAreasList, locationsChaptersList, locationsClustersList, locationsCountriesList } from '~/api/sdk.gen'
import { useEvent } from '~/composables/resources/events/events'
import { useEventSettings } from '~/composables/resources/events/eventSettings'
import { useEventStaff } from '~/composables/resources/events/eventStaff'
import { useEventQuestions } from '~/composables/resources/events/eventQuestions'
import { useEventRoles } from '~/composables/resources/events/eventRoles'
import { useEventResources } from '~/composables/resources/events/eventResources'
import { useEventLandingImages } from '~/composables/resources/events/eventLandingImages'
import { useEventOverview, useRegistrationTrends, useRevenueOverview, usePaymentStatus } from '~/composables/statistics/event/event-statistics'
import { useLocationBreakdown } from '~/composables/statistics/attendee/attendee-statistics'
import { formatDate, formatCompactDateTime } from '~/utils/time'
import EventManagementLayout from '~/components/events/EventManagementLayout.vue'
import MapLibre from '~/components/common/MapLibre.vue'
import { resolveImageUrl, onImageError } from '~/utils/image'

use([
  CanvasRenderer,
  LineChart,
  PieChart,
  BarChart,
  GaugeChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
])

definePageMeta({
  layout: false,
  middleware: 'auth',
})

useHead({
  title: 'Event Dashboard',
  link: [
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com',
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossorigin: 'anonymous',
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800&display=swap',
    },
  ],
})

const route = useRoute()
const id = computed(() => route.params.id as string)
const registrationPeriod = ref<'hour' | 'day' | 'week' | 'month'>('week')
const isRefreshing = ref(false)
const mapStyle = 'https://demotiles.maplibre.org/style.json'
const defaultMapCenter: [number, number] = [0, 20]
const defaultMapZoom = 1.7

const registrationPeriods = [
  { value: 'hour' as const, label: 'Hour' },
  { value: 'day' as const, label: 'Day' },
  { value: 'week' as const, label: 'Week' },
  { value: 'month' as const, label: 'Month' },
]

const locationScopes = [
  { value: 'area' as const, label: 'Area' },
  { value: 'chapter' as const, label: 'Chapter' },
  { value: 'cluster' as const, label: 'Cluster' },
  { value: 'country' as const, label: 'Country' },
]
const selectedLocationScope = ref<'area' | 'chapter' | 'cluster' | 'country'>('area')

const selectedLocationListItems = computed(() => {
  if (selectedLocationScope.value === 'area') return extractLocationResults(areaLocationsQuery.data.value)
  if (selectedLocationScope.value === 'chapter') return extractLocationResults(chapterLocationsQuery.data.value)
  if (selectedLocationScope.value === 'cluster') return extractLocationResults(clusterLocationsQuery.data.value)
  return extractLocationResults(countryLocationsQuery.data.value)
})

const { data: eventData, refetch: refetchEvent } = useEvent(id)
const event = computed(() => eventData.value?.data)

const { data: settingsData, refetch: refetchSettings } = useEventSettings(id)
const settings = computed(() => settingsData.value?.data)

const { data: staffData, refetch: refetchStaff } = useEventStaff({ event: id.value })
const staffList = computed(() => staffData.value?.data)

const { data: questionsData, refetch: refetchQuestions } = useEventQuestions({ event: id.value })
const questionsList = computed(() => questionsData.value?.data)

const { data: rolesData, refetch: refetchRoles } = useEventRoles()
const rolesList = computed(() => rolesData.value?.data)

const { data: resourcesData, refetch: refetchResources } = useEventResources(id, { page_size: 1 })
const resourcesList = computed(() => resourcesData.value?.data)

const { data: landingImagesData, refetch: refetchLandingImages } = useEventLandingImages(id, { page_size: 1 })
const landingImages = computed(() => landingImagesData.value?.data)

const { data: overviewData, refetch: refetchOverview } = useEventOverview(computed(() => ({
  event_id: id.value,
} as any)))
const overview = computed(() => overviewData.value?.data)

const eventSlug = computed(() => event.value?.url_safe_title || '')

const { data: revenueData, refetch: refetchRevenue, isLoading: isLoadingRevenue } = useRevenueOverview(computed(() => ({
  event_id: id.value,
} as any)))
const revenueBreakdown = computed(() => revenueData.value?.data)

const registrationTrendQuery = computed(() => ({
  event_id: eventSlug.value || undefined,
  period: registrationPeriod.value,
  cumulative: true,
} as any))

const registrationTrendsReady = computed(() => !!eventSlug.value)

const { data: registrationTrendsData, isLoading: isLoadingRegistrationTrends, error: registrationTrendsError, refetch: refetchRegistrationTrends } = useRegistrationTrends(registrationTrendQuery)

const { data: paymentStatusData, isLoading: isLoadingPaymentStatus, refetch: refetchPaymentStatus } = usePaymentStatus(computed(() => ({
  event_id: id.value,
} as any)))

const { data: locationBreakdownData, isPending: isLocationBreakdownPending, refetch: refetchLocationBreakdown } = useLocationBreakdown(computed(() => ({
  event_id: id.value,
} as any)))

const { data: attendeesData, refetch: refetchAttendees } = useQuery({
  queryKey: ['attendees', 'list', id],
  queryFn: () => attendeesList({
    query: {
      event: id.value,
      page_size: 100,
      ordering: '-created_at',
    },
  }),
  enabled: () => !!id.value,
})

const attendeesResults = computed(() => attendeesData.value?.data?.results || [])

const normalizeNumber = (value: unknown) => {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : 0
}

const useAnimatedNumber = (source: () => number, duration = 900, delay = 0) => {
  const animatedValue = ref(0)
  let stepTimerId: ReturnType<typeof setTimeout> | null = null
  let startTimerId: ReturnType<typeof setTimeout> | null = null

  const animate = (from: number, to: number) => {
    if (stepTimerId !== null) {
      clearTimeout(stepTimerId)
      stepTimerId = null
    }
    if (startTimerId !== null) {
      clearTimeout(startTimerId)
      startTimerId = null
    }

    const run = () => {
      const startedAt = Date.now()
      const delta = to - from

      const step = () => {
        const progress = Math.min((Date.now() - startedAt) / duration, 1)
        const easedProgress = 1 - Math.pow(1 - progress, 3)
        animatedValue.value = from + delta * easedProgress

        if (progress < 1) {
          stepTimerId = setTimeout(step, 16)
        }
      }

      step()
    }

    if (delay > 0) {
      startTimerId = setTimeout(run, delay)
      return
    }

    run()
  }

  watch(source, (nextValue, previousValue) => {
    animate(previousValue ?? 0, nextValue)
  }, {
    immediate: true,
  })

  onBeforeUnmount(() => {
    if (stepTimerId !== null) {
      clearTimeout(stepTimerId)
    }
    if (startTimerId !== null) {
      clearTimeout(startTimerId)
    }
  })

  return animatedValue
}

type LocationRow = {
  label: string
  value: number
  percentage: number
}

type AreaMapPoint = {
  label: string
  count: number
  percentage: number
  longitude: number
  latitude: number
  color: string
}

type LocationListItem = {
  area_name?: string
  chapter_name?: string
  cluster_name?: string
  country_name?: string
  latitude?: string | number | null
  longitude?: string | number | null
}

const colorPalette = ['#0a192f', '#d97706', '#10b981', '#2563eb', '#7c3aed', '#059669', '#ca8a04', '#7f1d1d']

const normalizeLabel = (value: string) => value.trim().toLowerCase()

const toCoordinate = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === '') return null
  const coordinate = typeof value === 'number' ? value : Number.parseFloat(value)
  return Number.isFinite(coordinate) ? coordinate : null
}

const extractLocationResults = (response: unknown) => {
  const payload = (response as any)?.data
  if (Array.isArray(payload?.results)) return payload.results as LocationListItem[]
  if (Array.isArray(payload)) return payload as LocationListItem[]
  return []
}

const areaLocationsQuery = useQuery({
  queryKey: ['locations', 'areas'],
  queryFn: () => locationsAreasList({ query: { page_size: 500 } }),
})

const chapterLocationsQuery = useQuery({
  queryKey: ['locations', 'chapters'],
  queryFn: () => locationsChaptersList({ query: { page_size: 500 } }),
})

const clusterLocationsQuery = useQuery({
  queryKey: ['locations', 'clusters'],
  queryFn: () => locationsClustersList({ query: { page_size: 500 } }),
})

const countryLocationsQuery = useQuery({
  queryKey: ['locations', 'countries'],
  queryFn: () => locationsCountriesList({ query: { page_size: 500 } }),
})

const areaMapPoints = computed(() => {
  const entries: LocationRow[] = locationBreakdownEntry.value?.[selectedLocationScope.value] || []
  const locationsByLabel = new Map(
    selectedLocationListItems.value.map((location: LocationListItem) => {
      const label = String(location.area_name ?? location.chapter_name ?? location.cluster_name ?? location.country_name ?? '').trim()
      return [normalizeLabel(label), location]
    }),
  )

  return entries.flatMap((entry: LocationRow, index: number) => {
    const location = locationsByLabel.get(normalizeLabel(entry.label))
    const longitude = toCoordinate(location?.longitude)
    const latitude = toCoordinate(location?.latitude)

    if (longitude === null || latitude === null) {
      return []
    }

    return [{
      label: entry.label,
      count: entry.value,
      percentage: entry.percentage,
      longitude,
      latitude,
      color: colorPalette[index % colorPalette.length],
    } as AreaMapPoint]
  })
})

const areaMapGeoJson = computed(() => ({
  type: 'FeatureCollection',
  features: areaMapPoints.value.map((point: AreaMapPoint) => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [point.longitude, point.latitude],
    },
    properties: {
      label: point.label,
      count: point.count,
      percentage: point.percentage,
      color: point.color,
    },
  })),
}))

const areaMapSources = computed(() => (([
  {
    name: 'areas',
    data: areaMapGeoJson.value as any,
  },
])))

const mapCenter = computed<[number, number]>(() => {
  if (!areaMapPoints.value.length) return defaultMapCenter

  const totalLongitude = areaMapPoints.value.reduce((sum, point) => sum + point.longitude, 0)
  const totalLatitude = areaMapPoints.value.reduce((sum, point) => sum + point.latitude, 0)
  return [totalLongitude / areaMapPoints.value.length, totalLatitude / areaMapPoints.value.length]
})

const mapZoom = computed(() => {
  if (areaMapPoints.value.length <= 1) return 3.4
  if (areaMapPoints.value.length <= 4) return 2.6
  return defaultMapZoom
})

const areaMapLayers = computed(() => (([
  {
    id: 'areas-circle',
    type: 'circle',
    source: 'areas',
    paint: {
      'circle-color': ['get', 'color'],
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['get', 'count'],
        0, 6,
        25, 10,
        100, 16,
        250, 22,
      ],
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 2,
      'circle-opacity': 0.92,
    },
  },
  {
    id: 'areas-label',
    type: 'symbol',
    source: 'areas',
    layout: {
      'text-field': ['get', 'label'],
      'text-size': 11,
      'text-offset': [0, 1.4],
      'text-anchor': 'top',
      'text-allow-overlap': false,
    },
    paint: {
      'text-color': '#0a192f',
      'text-halo-color': '#ffffff',
      'text-halo-width': 1.5,
    },
  },
])))

const formatCurrency = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === '') return '0.00'
  const numericValue = typeof value === 'string' ? Number.parseFloat(value) : value
  if (!Number.isFinite(numericValue)) return '0.00'
  return numericValue.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const revenueShare = (value: string | number | null | undefined) => {
  const total = normalizeNumber(revenueBreakdown.value?.total_revenue)
  if (!total) return 0
  return Math.max(0, Math.min(100, (normalizeNumber(value) / total) * 100))
}

const totalRevenueTarget = computed(() => normalizeNumber(overview.value?.total_revenue))
const totalAttendeesTarget = computed(() => normalizeNumber(overview.value?.total_attendees ?? event.value?.number_of_attendees ?? 0))
const totalBookingsTarget = computed(() => normalizeNumber(overview.value?.total_bookings))
const totalStaffTarget = computed(() => normalizeNumber(staffList.value?.count))
const totalQuestionsTarget = computed(() => normalizeNumber(questionsList.value?.count))
const totalResourcesTarget = computed(() => normalizeNumber(resourcesList.value?.count))
const totalLandingImagesTarget = computed(() => normalizeNumber(landingImages.value?.count))
const totalRolesTarget = computed(() => normalizeNumber(rolesList.value?.count))
const attendancePercentageTarget = computed(() => {
  if (!event.value?.maximum_attendance) return 0
  return Math.min((totalAttendeesTarget.value / event.value.maximum_attendance) * 100, 100)
})

const animatedTotalRevenue = useAnimatedNumber(() => totalRevenueTarget.value, 1000)
const animatedTotalAttendees = useAnimatedNumber(() => totalAttendeesTarget.value, 900, 90)
const animatedTotalBookings = useAnimatedNumber(() => totalBookingsTarget.value, 900, 130)
const animatedTotalStaff = useAnimatedNumber(() => totalStaffTarget.value, 900, 170)
const animatedTotalQuestions = useAnimatedNumber(() => totalQuestionsTarget.value, 900, 210)
const animatedTotalResources = useAnimatedNumber(() => totalResourcesTarget.value, 850, 250)
const animatedTotalLandingImages = useAnimatedNumber(() => totalLandingImagesTarget.value, 850, 290)
const animatedTotalRoles = useAnimatedNumber(() => totalRolesTarget.value, 850, 330)
const animatedAttendancePercentage = useAnimatedNumber(() => attendancePercentageTarget.value, 900, 120)

const eventStateAppearance = computed(() => {
  const status = event.value?.status || 'DRAFTING'
  const appearances: Record<string, { gradient: string, icon: string, textColor: string }> = {
    DRAFTING: { gradient: 'from-blue-500 to-blue-700', icon: 'i-heroicons-pencil-square', textColor: 'text-white' },
    PUBLISHED: { gradient: 'from-sky-500 to-sky-700', icon: 'i-heroicons-megaphone', textColor: 'text-white' },
    OPEN: { gradient: 'from-emerald-500 to-green-700', icon: 'i-heroicons-lock-open', textColor: 'text-white' },
    CLOSED: { gradient: 'from-rose-500 to-red-700', icon: 'i-heroicons-lock-closed', textColor: 'text-white' },
    IN_PROGRESS: { gradient: 'from-yellow-500 to-amber-700', icon: 'i-heroicons-play', textColor: 'text-white' },
    COMPLETED: { gradient: 'from-violet-500 to-purple-700', icon: 'i-heroicons-check-circle', textColor: 'text-white' },
    CANCELLED: { gradient: 'from-red-600 to-red-800', icon: 'i-heroicons-x-circle', textColor: 'text-white' },
    POSTPONED: { gradient: 'from-orange-500 to-amber-700', icon: 'i-heroicons-pause-circle', textColor: 'text-white' },
    ARCHIVED: { gradient: 'from-gray-500 to-slate-700', icon: 'i-heroicons-archive-box', textColor: 'text-white' },
  }
  return appearances[status] || appearances.DRAFTING
})

const selectedLocationScopeLabel = computed(() => {
  const selected = locationScopes.find((scope) => scope.value === selectedLocationScope.value)
  return selected?.label ?? 'Area'
})

const extractDistributionRows = (section: unknown) => {
  if (!section) return []

  type DistributionRow = {
    label: string
    value: number
    percentage: number
  }

  const source = Array.isArray(section)
    ? section
    : Array.isArray((section as any).distribution)
      ? (section as any).distribution
      : Array.isArray((section as any).results)
        ? (section as any).results
        : Array.isArray((section as any).items)
          ? (section as any).items
          : Object.entries(section as Record<string, unknown>)
              .filter(([key]) => !['distribution', 'results', 'items', 'generated_at', 'filters_applied', 'total'].includes(key))
              .map(([label, value]) => ({ label, value }))

  const total = normalizeNumber((section as any).total)
  return source
    .map((item: unknown) => {
      const entry = item as Record<string, unknown>
      const label = String(entry.label ?? entry.name ?? entry.title ?? entry.key ?? 'Unknown')
      const value = normalizeNumber(entry.value ?? entry.count ?? entry.total ?? entry.amount)
      const percentage = normalizeNumber(entry.percentage ?? (total ? (value / total) * 100 : 0))
      return {
        label,
        value,
        percentage: Math.min(100, Math.max(0, percentage)),
      } satisfies DistributionRow
    })
    .filter((item: DistributionRow) => item.value > 0 || item.percentage > 0)
    .sort((a: DistributionRow, b: DistributionRow) => b.value - a.value)
}

const locationBreakdownEntry = computed(() => {
  const breakdown = locationBreakdownData.value?.data
  if (!breakdown) return null

  return {
    area: extractDistributionRows((breakdown as any).by_area),
    chapter: extractDistributionRows((breakdown as any).by_chapter),
    cluster: extractDistributionRows((breakdown as any).by_cluster),
    country: extractDistributionRows((breakdown as any).by_country),
  }
})

const attendeesByLocation = computed(() => {
  const entries = locationBreakdownEntry.value?.[selectedLocationScope.value] || []
  return entries.slice(0, 8)
})

const locationTotal = computed(() => {
  const breakdown = locationBreakdownData.value?.data as any
  return normalizeNumber(breakdown?.total)
})

const registrationTrendsOption = computed(() => {
  const trends = registrationTrendsData.value?.data?.trends
  if (!trends || trends.length === 0) return null

  const formatTrendLabel = (value: string) => {
    const date = new Date(value)

    if (registrationPeriod.value === 'hour') {
      return date.toLocaleString('en-GB', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    }

    if (registrationPeriod.value === 'month') {
      return date.toLocaleDateString('en-GB', {
        month: 'short',
        year: 'numeric',
      })
    }

    return date.toLocaleDateString('en-GB', {
      month: 'short',
      day: 'numeric',
    })
  }

  return {
    color: ['#0a192f', '#2563eb'],
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#0a192f',
        },
      },
    },
    legend: {
      data: ['New Registrations', 'Cumulative Total'],
      bottom: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '12%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: trends.map((trend: any) => formatTrendLabel(trend.date)),
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: 'New Registrations',
        type: 'line',
        data: trends.map((trend: any) => trend.count),
        smooth: true,
        itemStyle: {
          color: '#0a192f',
        },
        lineStyle: {
          width: 3,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(10, 25, 47, 0.3)',
              },
              {
                offset: 1,
                color: 'rgba(10, 25, 47, 0)',
              },
            ],
          },
        },
      },
      {
        name: 'Cumulative Total',
        type: 'line',
        data: trends.map((trend: any) => trend.cumulative ?? 0),
        smooth: true,
        itemStyle: {
          color: '#ecc813',
        },
        lineStyle: {
          width: 2,
          type: 'dashed',
        },
      },
    ],
  }
})

const revenueOption = computed(() => {
  const breakdown = revenueData.value?.data?.breakdown
  if (!breakdown || (breakdown as any[]).length === 0) return null

  const sourceColors: Record<string, string> = {
    Bookings: '#0a192f',
    Products: '#d97706',
    Donations: '#10b981',
    Sponsors: '#2563eb',
  }

  return {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: £{c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: [
      {
        name: 'Revenue',
        type: 'pie',
        radius: ['38%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#ffffff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '20',
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: (breakdown as any[]).map((item: any) => ({
          value: item.value,
          name: item.source,
          itemStyle: {
            color: sourceColors[item.source] || '#374151',
          },
        })),
      },
    ],
  }
})

const paymentStatusOption = computed(() => {
  const distribution = paymentStatusData.value?.data?.distribution
  if (!distribution || !Array.isArray(distribution) || distribution.length === 0) return null

  const statusColors: Record<string, string> = {
    'Completed': '#10b981',
    'Paid': '#10b981',
    'Pending': '#f59e0b',
    'Failed': '#ef4444',
    'Cancelled': '#ef4444',
    'Refunded': '#6b7280',
    'Partially Refunded': '#d97706',
    'Drafting': '#9ca3af',
  }

  const data = distribution.map((item: any) => ({
    value: item.count,
    name: item.label,
    itemStyle: {
      color: statusColors[item.label] || '#374151',
    },
  })).filter(item => item.value > 0)

  if (data.length === 0) return null

  return {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      bottom: 0,
      left: 'center',
    },
    series: [
      {
        name: 'Payment Status',
        type: 'pie',
        radius: '66%',
        center: ['50%', '45%'],
        data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  }
})

const recentActivities = computed(() => {
  const activities: Array<{ id: string, icon: string; color: string; title: string; time: string }> = []

  attendeesResults.value.slice(0, 3).forEach((attendee) => {
    activities.push({
      id: `attendee-${attendee.attendee_id}`,
      icon: 'i-heroicons-user-plus',
      color: 'bg-blue-500',
      title: `New registration by ${attendee.full_name}`,
      time: formatCompactDateTime(attendee.created_at),
    })
  })

  if (activities.length < 3) {
    activities.push(
      {
        id: 'staff-add',
        icon: 'i-heroicons-identification',
        color: 'bg-violet-500',
        title: 'Staff member added',
        time: 'Team update',
      },
      {
        id: 'product-purchase',
        icon: 'i-heroicons-shopping-cart',
        color: 'bg-emerald-500',
        title: 'Product purchase completed',
        time: 'Order activity',
      }
    )
  }

  return activities.slice(0, 3)
})

const attendancePercentage = computed(() => {
  if (!event.value?.maximum_attendance) return 0
  const current = overview.value?.total_attendees ?? event.value.number_of_attendees ?? 0
  return Math.min((current / event.value.maximum_attendance) * 100, 100)
})

const refreshAll = async () => {
  isRefreshing.value = true
  try {
    if (registrationTrendsReady.value) {
      await refetchRegistrationTrends()
    }
    await Promise.allSettled([
      refetchEvent(),
      refetchSettings(),
      refetchStaff(),
      refetchQuestions(),
      refetchRoles(),
      refetchResources(),
      refetchLandingImages(),
      refetchOverview(),
      refetchRevenue(),
      refetchPaymentStatus(),
      refetchLocationBreakdown(),
      refetchAttendees(),
    ])
  } finally {
    isRefreshing.value = false
  }
}

watch([eventSlug, registrationPeriod], async ([slug]) => {
  if (slug) {
    await refetchRegistrationTrends()
  }
}, { immediate: true })

const getStatusColor = (status: string): 'gray' | 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange' => {
  const colors: Record<string, 'gray' | 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange'> = {
    DRAFTING: 'gray',
    PUBLISHED: 'blue',
    OPEN: 'green',
    CLOSED: 'red',
    IN_PROGRESS: 'yellow',
    COMPLETED: 'purple',
    CANCELLED: 'red',
    POSTPONED: 'orange',
    ARCHIVED: 'gray',
  }
  return colors[status] || 'gray'
}
</script>
