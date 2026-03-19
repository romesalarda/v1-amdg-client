<template>
  <CommunitiesManagementLayout :organisation-id="organisationId" :organisation="organisation">
    <!-- Loading State -->
    <div v-if="isLoadingOrganisation" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <USkeleton v-for="i in 8" :key="i" class="h-32" />
    </div>

    <div v-else-if="organisation" class="space-y-8">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">Organisation Snapshot</h2>
          <p class="text-sm text-gray-500">Live data refreshes every 60 seconds.</p>
        </div>
        <div class="flex items-center gap-3">
          <UButton
            size="sm"
            variant="outline"
            icon="i-heroicons-chart-pie"
            :to="`/communities/${organisationId}/m/statistics`"
          >
            Open Statistics
          </UButton>
          <UButton
            size="sm"
            icon="i-heroicons-arrow-path"
            :loading="isRefreshing"
            @click="refreshAll"
          >
            Refresh
          </UButton>
        </div>
      </div>

      <div v-if="statsError" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        Unable to load one or more statistics sections. You can still refresh and view detailed analytics.
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Events</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">{{ overview?.total_events ?? 0 }}</p>
            </div>
            <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-calendar-days" class="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <div class="mt-4 text-sm text-gray-500">{{ overview?.upcoming_events ?? 0 }} upcoming</div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Attendees</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">{{ overview?.total_attendees ?? 0 }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-users" class="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div class="mt-4 text-sm text-gray-500">{{ overview?.average_attendees_per_event ?? 0 }} avg per event</div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Revenue</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">{{ formatMoney(overview?.total_revenue ?? 0, 'GBP') }}</p>
            </div>
            <div class="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-banknotes" class="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <div class="mt-4 text-sm text-gray-500">{{ formatMoney(overview?.average_event_revenue ?? 0, 'GBP') }} avg event revenue</div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Controllers</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">{{ overview?.total_controllers ?? organisation.controllers_count ?? 0 }}</p>
            </div>
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-shield-check" class="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div class="mt-4 text-sm text-gray-500">{{ overview?.total_members ?? organisation.memberships_count ?? 0 }} total members</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Top Events By Attendance</h2>
          </div>
          <div class="p-6">
            <div v-if="topEvents.length" class="space-y-4">
              <div
                v-for="eventItem in topEvents"
                :key="eventItem.event_title"
                class="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0"
              >
                <div class="min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ eventItem.event_title }}</p>
                  <p class="text-xs text-gray-500 mt-1">{{ formatMoney(eventItem.completed_payment_amount, 'GBP') }} revenue</p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-semibold text-gray-900">{{ eventItem.attendee_count }} attendees</p>
                  <p class="text-xs text-gray-500">{{ eventItem.completed_payment_count }} completed payments</p>
                </div>
              </div>
            </div>
            <div v-else class="text-sm text-gray-500">No event performance data available yet.</div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Leaders By Location</h2>
          </div>
          <div class="p-6 space-y-4">
            <div v-if="leaderTypeDistribution.length" class="space-y-3">
              <div
                v-for="locationType in leaderTypeDistribution"
                :key="locationType.label"
                class="flex items-center justify-between"
              >
                <span class="text-sm font-medium text-gray-700">{{ locationType.label }}</span>
                <span class="text-sm font-semibold text-gray-900">{{ locationType.count }}</span>
              </div>
            </div>
            <div v-else class="text-sm text-gray-500">No leader location data available.</div>

            <div v-if="topAreas.length" class="pt-4 border-t border-gray-200">
              <h3 class="text-sm font-semibold text-gray-900 mb-3">Top Areas</h3>
              <div class="space-y-2">
                <div v-for="area in topAreas" :key="area.name" class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">{{ area.name }}</span>
                  <span class="font-medium text-gray-900">{{ area.count }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">Go Deeper With Organisation Analytics</h2>
          <UButton
            :to="`/communities/${organisationId}/m/statistics`"
            size="sm"
            icon="i-heroicons-arrow-right"
          >
            Open Full Statistics
          </UButton>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="p-4 bg-gray-50 rounded-lg">
              <p class="text-xs uppercase tracking-wide text-gray-500">Completed Events</p>
              <p class="text-2xl font-bold text-gray-900 mt-2">{{ overview?.completed_events ?? 0 }}</p>
            </div>
            <div class="p-4 bg-gray-50 rounded-lg">
              <p class="text-xs uppercase tracking-wide text-gray-500">Verified Members</p>
              <p class="text-2xl font-bold text-gray-900 mt-2">{{ overview?.verified_members ?? 0 }}</p>
            </div>
            <div class="p-4 bg-gray-50 rounded-lg">
              <p class="text-xs uppercase tracking-wide text-gray-500">Average Payment</p>
              <p class="text-2xl font-bold text-gray-900 mt-2">{{ formatMoney(overview?.average_payment_value ?? 0, 'GBP') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </CommunitiesManagementLayout>
</template>

<script setup lang="ts">
import { formatMoney } from '~/utils/money'
import { useOrganisation } from '~/composables/resources/organisation/organisations'
import {
  useOrganisationOverviewStatistics,
  useOrganisationLeadersDistributionStatistics,
  useOrganisationEventPerformanceStatistics,
} from '~/composables/statistics/organisations/organisation-statistics'

definePageMeta({
  middleware: ['auth', 'organisation-controller'],
  layout: 'default',
})

const route = useRoute()
const organisationId = computed(() => route.params.id as string)

useHead({
  title: 'Management Dashboard',
})

const toNumber = (value: unknown): number => {
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

const toLabel = (value: unknown, fallback = 'Unknown'): string => {
  if (typeof value === 'string' && value.trim().length) return value
  return fallback
}

const statisticsQuery = computed(() => ({
  organisation_id: Number(organisationId.value),
  format: 'raw' as const,
}))

const performanceQuery = computed(() => ({
  organisation_id: Number(organisationId.value),
  format: 'raw' as const,
  limit: 10,
}))

const { data: orgData, isLoading: isLoadingOrganisation } = useOrganisation(computed(() => Number(organisationId.value)))
const organisation = computed(() => orgData.value?.data)

const {
  data: overviewData,
  error: overviewError,
  isFetching: isFetchingOverview,
  refetch: refetchOverview,
} = useOrganisationOverviewStatistics(statisticsQuery)

const {
  data: leadersData,
  error: leadersError,
  isFetching: isFetchingLeaders,
  refetch: refetchLeaders,
} = useOrganisationLeadersDistributionStatistics(statisticsQuery)

const {
  data: eventPerformanceData,
  error: eventPerformanceError,
  isFetching: isFetchingEventPerformance,
  refetch: refetchEventPerformance,
} = useOrganisationEventPerformanceStatistics(performanceQuery)

const overview = computed(() => overviewData.value?.data)

const topEvents = computed(() => {
  const rows = eventPerformanceData.value?.data?.events
  if (!Array.isArray(rows)) return []

  return rows
    .map((row) => {
      const data = row as Record<string, unknown>
      return {
        event_title: toLabel(data.event_title, 'Untitled Event'),
        attendee_count: toNumber(data.attendee_count),
        completed_payment_count: toNumber(data.completed_payment_count),
        completed_payment_amount: toNumber(data.completed_payment_amount),
      }
    })
    .sort((a, b) => b.attendee_count - a.attendee_count)
    .slice(0, 5)
})

const leaderTypeDistribution = computed(() => {
  const rows = leadersData.value?.data?.distribution
  if (!Array.isArray(rows)) return []

  return rows
    .map((row) => {
      const data = row as Record<string, unknown>
      return {
        label: toLabel(data.label ?? data.location_type),
        count: toNumber(data.value ?? data.count),
      }
    })
    .sort((a, b) => b.count - a.count)
})

const topAreas = computed(() => {
  const rows = leadersData.value?.data?.area_distribution
  if (!Array.isArray(rows)) return []

  return rows
    .map((row) => {
      const data = row as Record<string, unknown>
      return {
        name: toLabel(data.label),
        count: toNumber(data.value),
      }
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
})

const isRefreshing = computed(() =>
  isFetchingOverview.value || isFetchingLeaders.value || isFetchingEventPerformance.value
)

const statsError = computed(() =>
  Boolean(overviewError.value || leadersError.value || eventPerformanceError.value)
)

const refreshAll = async () => {
  await Promise.all([refetchOverview(), refetchLeaders(), refetchEventPerformance()])
}
</script>