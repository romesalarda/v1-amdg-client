<template>
  <div class="space-y-6">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        :value="donationStats?.data?.total_donations ?? 0"
        label="Total Donations"
        icon="i-heroicons-heart"
        icon-color="pink"
        :loading="donationStatsLoading"
      />
      <StatCard
        :value="formatCurrency(donationStats?.data?.total_amount ?? 0)"
        label="Total Amount"
        icon="i-heroicons-currency-dollar"
        icon-color="green"
        :loading="donationStatsLoading"
      />
      <StatCard
        :value="formatCurrency(donationStats?.data?.average_amount ?? 0)"
        label="Average Donation"
        icon="i-heroicons-calculator"
        icon-color="blue"
        :loading="donationStatsLoading"
      />
      <StatCard
        :value="topDonors?.data?.total_returned ?? 0"
        label="Top Donors"
        icon="i-heroicons-star"
        icon-color="amber"
        :loading="topDonorsLoading"
      />
    </div>

    <!-- Charts Grid -->
    <div class="grid grid-cols-1 gap-6">
      <!-- Donation Trends -->
      <StatSection 
        title="Donation Trends Over Time"
        description="Track donation patterns and growth"
      >
        <div v-if="donationTrendsLoading" class="flex items-center justify-center h-80">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
        </div>
        <div v-else-if="donationTrendsError" class="text-center text-red-600 py-8">
          Error loading donation trends
        </div>
        <div v-else-if="donationTrendsData.data.length && donationTrendsData.labels.length" style="height: 320px;">
          <LineChart
            :data="donationTrendsData.data"
            :labels="donationTrendsData.labels"
            color="#ec4899"
            :smooth="true"
          />
        </div>
        <div v-else class="text-center text-gray-500 py-8">
          No donation trend data available
        </div>
      </StatSection>

      <!-- Donation Status Distribution and Top Donors Side by Side -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Donation Status Distribution -->
        <StatSection 
          title="Donation Status Distribution"
          description="Donation verification status breakdown"
        >
          <div v-if="donationStatsLoading" class="flex items-center justify-center h-64">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <div v-else-if="donationStatsError" class="text-center text-red-600 py-8">
            Error loading donation status
          </div>
          <PieChart
            v-else-if="donationStatusChartData.length"
            :data="donationStatusChartData"
            height="300px"
            :donut="true"
            :colors="['#10b981', '#3b82f6', '#f59e0b', '#ef4444']"
          />
          <div v-else class="text-center text-gray-500 py-8">
            No status data available
          </div>
        </StatSection>

        <!-- Top Donors Summary -->
        <StatSection 
          title="Donation Count Trends"
          description="Number of donations over time"
        >
          <div v-if="donationTrendsLoading" class="flex items-center justify-center h-64">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          </div>
          <div v-else-if="donationTrendsError" class="text-center text-red-600 py-8">
            Error loading donation count trends
          </div>
          <BarChart
            v-else-if="donationCountChartData.length"
            :data="donationCountChartData"
            height="300px"
            color="#f59e0b"
          />
          <div v-else class="text-center text-gray-500 py-8">
            No donation count data available
          </div>
        </StatSection>
      </div>
    </div>

    <!-- Top Donors Table -->
    <StatSection 
      title="Top Donors"
      description="Most generous contributors"
    >
      <div v-if="topDonorsLoading" class="flex items-center justify-center h-40">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
      <div v-else-if="topDonorsError" class="text-center text-red-600 py-8">
        Error loading top donors
      </div>
      <div v-else-if="topDonorsTableData.length" class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-gray-200 bg-gray-50">
              <th class="py-3 px-4 font-semibold text-gray-700">Donor</th>
              <th class="py-3 px-4 font-semibold text-gray-700">Email</th>
              <th class="py-3 px-4 font-semibold text-gray-700 text-right">Total Donated</th>
              <th class="py-3 px-4 font-semibold text-gray-700 text-right">Donations</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="donor in topDonorsTableData"
              :key="donor.user_id"
              class="border-b border-gray-100 hover:bg-gray-50"
            >
              <td class="py-3 px-4">
                <span class="font-medium">{{ donor.name }}</span>
              </td>
              <td class="py-3 px-4 text-gray-600">
                {{ donor.email }}
              </td>
              <td class="py-3 px-4 text-right">
                <span class="font-semibold text-green-600">{{ formatCurrency(donor.total_donated) }}</span>
              </td>
              <td class="py-3 px-4 text-right text-gray-600">
                {{ donor.donation_count }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center text-gray-500 py-8">
        No donor data available
      </div>
    </StatSection>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  useDonationStats,
  useDonationTrends,
  useTopDonors,
} from '~/composables/statistics/payments/payment-statistics'
import StatCard from '~/components/statistics/StatCard.vue'
import StatSection from '~/components/statistics/StatSection.vue'
import PieChart from '~/components/charts/PieChart.vue'
import BarChart from '~/components/charts/BarChart.vue'
import LineChart from '~/components/charts/LineChart.vue'
import type { PieChartData } from '~/components/charts/PieChart.vue'
import type { BarChartData } from '~/components/charts/BarChart.vue'

interface Props {
  queryParams: Record<string, string | number | boolean>
}

const props = defineProps<Props>()
const activeGroupBy = computed(() => (props.queryParams.group_by as string) || 'day')

// Fetch statistics data
const { data: donationStats, isLoading: donationStatsLoading, error: donationStatsError } = useDonationStats(() => props.queryParams)
const { data: donationTrends, isLoading: donationTrendsLoading, error: donationTrendsError } = useDonationTrends(() => props.queryParams)
const { data: topDonors, isLoading: topDonorsLoading, error: topDonorsError } = useTopDonors(() => props.queryParams)

// Format currency
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

// Transform data for donation trends chart (amount over time)
const donationTrendsData = computed<{ data: number[], labels: string[] }>(() => {
  if (!donationTrends.value?.data?.trends) return { data: [], labels: [] }
  
  const trends = donationTrends.value.data.trends
  return {
    data: trends.map((item: { amount?: number }) => item.amount ?? 0),
    labels: trends.map((item: { date?: string }) => {
      if (!item.date) return ''
      const date = new Date(item.date)

      if (activeGroupBy.value === 'hour') {
        return date.toLocaleString('en-GB', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      }

      if (activeGroupBy.value === 'month') {
        return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
      }

      return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
    }),
  }
})

// Transform data for donation count bar chart
const donationCountChartData = computed<BarChartData[]>(() => {
  if (!donationTrends.value?.data?.trends) return []
  
  const trends = donationTrends.value.data.trends
  return trends.map((item: { date?: string; count?: number }) => ({
    label: item.date
      ? (() => {
          const date = new Date(item.date)

          if (activeGroupBy.value === 'hour') {
            return date.toLocaleString('en-GB', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })
          }

          if (activeGroupBy.value === 'month') {
            return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
          }

          return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
        })()
      : '',
    value: item.count ?? 0,
  }))
})

// Transform data for donation status pie chart
const donationStatusChartData = computed<PieChartData[]>(() => {
  if (!donationStats.value?.data?.status_distribution) return []
  return donationStats.value.data.status_distribution.map((item: { label?: string; value?: number }) => ({
    name: item.label ?? 'Unknown',
    value: item.value ?? 0,
  }))
})

// Transform data for top donors table
const topDonorsTableData = computed(() => {
  if (!topDonors.value?.data?.donors) return []
  return topDonors.value.data.donors.map((donor: {
    user_id?: number
    name?: string
    email?: string
    total_donated?: number
    donation_count?: number
  }) => ({
    user_id: donor.user_id ?? 0,
    name: donor.name ?? 'Unknown',
    email: donor.email ?? 'N/A',
    total_donated: donor.total_donated ?? 0,
    donation_count: donor.donation_count ?? 0,
  }))
})
</script>
