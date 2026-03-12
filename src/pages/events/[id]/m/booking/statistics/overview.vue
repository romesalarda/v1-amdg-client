<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div v-for="i in 8" :key="i" class="h-24 bg-gray-100 rounded-lg animate-pulse"></div>
      </div>
      <div class="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <UIcon name="i-heroicons-exclamation-triangle" class="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-gray-900 mb-2">Failed to load statistics</h3>
      <p class="text-sm text-gray-500 mb-4">{{ error }}</p>
      <UButton @click="refetch" variant="outline">Try Again</UButton>
    </div>

    <!-- Content -->
    <template v-else-if="overviewData">
      <!-- Summary Cards Row 1: Bookings & Attendees -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          :value="overviewData.data?.bookings?.total ?? 0"
          label="Total Bookings"
          icon="i-heroicons-ticket"
          icon-color="blue"
        />
        <StatCard
          :value="overviewData.data?.bookings?.total_attendees ?? 0"
          label="Total Attendees"
          icon="i-heroicons-users"
          icon-color="green"
        />
        <StatCard
          :value="overviewData.data?.bookings?.average_attendees_per_booking?.toFixed(1) ?? '0'"
          label="Avg Attendees/Booking"
          icon="i-heroicons-user-group"
          icon-color="purple"
        />
        <StatCard
          :value="overviewData.data?.tickets?.total ?? 0"
          label="Total Tickets"
          icon="i-heroicons-rectangle-stack"
          icon-color="amber"
        />
      </div>

      <!-- Summary Cards Row 2: Packages, Intents & Revenue -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          :value="overviewData.data?.packages?.total ?? 0"
          label="Active Packages"
          icon="i-heroicons-cube"
          icon-color="indigo"
        />
        <StatCard
          :value="overviewData.data?.intents?.total ?? 0"
          label="Booking Intents"
          icon="i-heroicons-clock"
          icon-color="blue"
        />
        <StatCard
          :value="formatCurrency(overviewData.data?.revenue?.total ?? 0)"
          label="Total Revenue"
          icon="i-heroicons-currency-dollar"
          icon-color="green"
        />
        <StatCard
          :value="formatCurrency(overviewData.data?.revenue?.average_per_booking ?? 0)"
          label="Avg Revenue/Booking"
          icon="i-heroicons-chart-bar"
          icon-color="red"
        />
      </div>

      <!-- Charts Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Booking Status Distribution -->
        <StatSection 
          title="Booking Status"
          description="Distribution by payment status"
        >
          <PieChart
            v-if="bookingStatusData.length"
            :data="bookingStatusData"
            height="300px"
            :donut="true"
            :colors="['#10b981', '#f59e0b', '#ef4444', '#6b7280']"
          />
          <div v-else class="text-center text-gray-500 py-8">
            No status data available
          </div>
        </StatSection>

        <!-- Ticket Status Distribution -->
        <StatSection 
          title="Ticket Status"
          description="Distribution by ticket status"
        >
          <PieChart
            v-if="ticketStatusData.length"
            :data="ticketStatusData"
            height="300px"
            :donut="true"
            :colors="['#3b82f6', '#8b5cf6', '#ec4899']"
          />
          <div v-else class="text-center text-gray-500 py-8">
            No ticket data available
          </div>
        </StatSection>

        <!-- Intent Status Breakdown -->
        <StatSection 
          title="Intent Status"
          description="Booking intent conversion funnel"
        >
          <BarChart
            v-if="intentStatusData.length"
            :data="intentStatusData"
            height="300px"
            color="#06b6d4"
          />
          <div v-else class="text-center text-gray-500 py-8">
            No intent data available
          </div>
        </StatSection>

        <!-- Package Distribution -->
        <StatSection 
          title="Package Distribution"
          description="Top packages by usage"
        >
          <BarChart
            v-if="packageDistData.length"
            :data="packageDistData"
            height="300px"
            color="#8b5cf6"
            :horizontal="true"
          />
          <div v-else class="text-center text-gray-500 py-8">
            No package data available
          </div>
        </StatSection>
      </div>

      <!-- Summary Tables -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Booking Status Breakdown Table -->
        <StatSection 
          title="Booking Status Details"
          description="Detailed breakdown by status"
        >
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                  <th class="px-4 py-3 text-right font-semibold text-gray-700">Count</th>
                  <th class="px-4 py-3 text-right font-semibold text-gray-700">Percentage</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="status in (overviewData.data?.tickets?.status_breakdown ?? [])" :key="status.status" class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-gray-900">{{ formatStatus(status.status) }}</td>
                  <td class="px-4 py-3 text-right text-gray-700">{{ status.count }}</td>
                  <td class="px-4 py-3 text-right text-gray-600">{{ status.percentage }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </StatSection>

        <!-- Package Summary Table -->
        <StatSection 
          title="Package Overview"
          description="Package metrics summary"
        >
          <div class="space-y-3">
            <div class="flex justify-between items-center py-2 border-b border-gray-100">
              <span class="text-sm text-gray-600">Total Packages:</span>
              <span class="text-sm font-semibold text-gray-900">{{ overviewData.data?.packages?.total ?? 0 }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-gray-100">
              <span class="text-sm text-gray-600">Active Packages:</span>
              <span class="text-sm font-semibold text-gray-900">{{ overviewData.data?.packages?.active ?? 0 }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-gray-100">
              <span class="text-sm text-gray-600">Total Usage:</span>
              <span class="text-sm font-semibold text-gray-900">{{ overviewData.data?.packages?.total_usage ?? 0 }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-gray-100">
              <span class="text-sm text-gray-600">Completed Payments:</span>
              <span class="text-sm font-semibold text-gray-900">{{ overviewData.data?.revenue?.total_completed_payments ?? 0 }}</span>
            </div>
            <div class="flex justify-between items-center py-2">
              <span class="text-sm text-gray-600">Avg Revenue/Booking:</span>
              <span class="text-sm font-semibold text-gray-900">{{ formatCurrency(overviewData.data?.revenue?.average_per_booking ?? 0) }}</span>
            </div>
          </div>
        </StatSection>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDashboardOverview } from '~/composables/statistics/bookings/booking-statistics'
import StatCard from '~/components/statistics/StatCard.vue'
import StatSection from '~/components/statistics/StatSection.vue'
import PieChart from '~/components/charts/PieChart.vue'
import BarChart from '~/components/charts/BarChart.vue'
import type { PieChartData } from '~/components/charts/PieChart.vue'
import type { BarChartData } from '~/components/charts/BarChart.vue'

interface Props {
  queryParams: Record<string, any>
}

const props = defineProps<Props>()

// Fetch dashboard overview
const { data: overviewData, isLoading, error, refetch } = useDashboardOverview(() => props.queryParams)

// Transform booking status data for pie chart
const bookingStatusData = computed<PieChartData[]>(() => {
  // BookingsSummary doesn't have status_breakdown, show simple overview
  if (!overviewData.value?.data?.bookings) return []
  return [
    { name: 'Total Bookings', value: overviewData.value.data.bookings.total },
    { name: 'Total Attendees', value: overviewData.value.data.bookings.total_attendees }
  ]
})

// Transform ticket status data for pie chart
const ticketStatusData = computed<PieChartData[]>(() => {
  const ticketBreakdown = overviewData.value?.data?.tickets?.status_breakdown
  if (!ticketBreakdown) return []
  return ticketBreakdown.map((item: any) => ({
    name: formatStatus(item.status),
    value: item.count,
  }))
})

// Transform intent status data for bar chart
const intentStatusData = computed<BarChartData[]>(() => {
  const intentSummary = overviewData.value?.data?.intents?.status_breakdown
  if (!intentSummary) return []
  return intentSummary.map((item: any) => ({
    label: formatStatus(item.status),
    value: item.count,
  }))
})

// Transform package distribution data
const packageDistData = computed<BarChartData[]>(() => {
  // This would ideally come from a separate endpoint, but for overview we can show placeholder
  // or fetch from package popularity endpoint
  return []
})

// Helper function to format status
const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
</script>
