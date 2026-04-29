<template>
  <div class="space-y-6">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        :value="ticketOverviewData?.data?.total_tickets ?? 0"
        label="Total Tickets"
        icon="i-heroicons-rectangle-stack"
        icon-color="blue"
        :loading="overviewLoading"
      />
      <StatCard
        :value="ticketOverviewData?.data?.total_uses_remaining ?? 0"
        label="Total Uses Remaining"
        icon="i-heroicons-check-badge"
        icon-color="green"
        :loading="overviewLoading"
      />
      <StatCard
        :value="`${ticketUsageData?.data?.usage_rate ?? 0}%`"
        label="Usage Rate"
        icon="i-heroicons-chart-pie"
        icon-color="purple"
        :loading="usageLoading"
      />
      <StatCard
        :value="ticketOverviewData?.data?.average_uses_remaining?.toFixed(1) ?? '0'"
        label="Avg Uses Remaining"
        icon="i-heroicons-arrow-path"
        icon-color="amber"
        :loading="overviewLoading"
      />
    </div>

    <!-- Charts Grid Row 1 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Ticket Status Distribution -->
      <StatSection 
        title="Ticket Status"
        description="Distribution by ticket status"
      >
        <div v-if="statusLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <div v-else-if="statusError" class="text-center text-red-600 py-8">
          Error loading ticket status
        </div>
        <PieChart
          v-else-if="ticketStatusChartData.length"
          :data="ticketStatusChartData"
          height="300px"
          :donut="true"
          :colors="['#10b981', '#ef4444', '#6b7280']"
        />
        <div v-else class="text-center text-gray-500 py-8">
          No ticket status data available
        </div>
      </StatSection>

      <!-- Ticket Scope Distribution -->
      <StatSection 
        title="Ticket Scope"
        description="Distribution by access scope"
      >
        <div v-if="scopeLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
        <div v-else-if="scopeError" class="text-center text-red-600 py-8">
          Error loading ticket scope
        </div>
        <PieChart
          v-else-if="ticketScopeChartData.length"
          :data="ticketScopeChartData"
          height="300px"
          :donut="true"
          :colors="['#3b82f6', '#8b5cf6', '#ec4899']"
        />
        <div v-else class="text-center text-gray-500 py-8">
          No ticket scope data available
        </div>
      </StatSection>
    </div>

    <!-- Charts Grid Row 2 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Ticket Types Distribution -->
      <StatSection 
        title="Ticket Types"
        description="Breakdown by ticket type and scope"
      >
        <div v-if="typesLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
        <div v-else-if="typesError" class="text-center text-red-600 py-8">
          Error loading ticket types
        </div>
        <BarChart
          v-else-if="ticketTypesChartData.length"
          :data="ticketTypesChartData"
          height="300px"
          color="#6366f1"
        />
        <div v-else class="text-center text-gray-500 py-8">
          No ticket type data available
        </div>
      </StatSection>

      <!-- Ticket Usage Metrics -->
      <StatSection 
        title="Usage Metrics"
        description="Ticket utilization statistics"
      >
        <div v-if="usageLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
        </div>
        <div v-else-if="usageError" class="text-center text-red-600 py-8">
          Error loading usage metrics
        </div>
        <div v-else-if="ticketUsageData?.data" class="p-6 space-y-4">
          <div class="flex justify-between items-center py-3 border-b border-gray-100">
            <span class="text-sm font-medium text-gray-700">Valid Tickets</span>
            <span class="text-lg font-bold text-emerald-600">{{ ticketUsageData.data.valid_tickets }}</span>
          </div>
          <div class="flex justify-between items-center py-3 border-b border-gray-100">
            <span class="text-sm font-medium text-gray-700">Used Tickets</span>
            <span class="text-lg font-bold text-blue-600">{{ ticketUsageData.data.used_tickets }}</span>
          </div>
          <div class="flex justify-between items-center py-3 border-b border-gray-100">
            <span class="text-sm font-medium text-gray-700">Cancelled Tickets</span>
            <span class="text-lg font-bold text-red-600">{{ ticketUsageData.data.cancelled_tickets }}</span>
          </div>
          <div class="flex justify-between items-center py-3 border-b border-gray-100">
            <span class="text-sm font-medium text-gray-700">Usage Rate</span>
            <span class="text-2xl font-bold text-purple-600">{{ ticketUsageData.data.usage_rate }}%</span>
          </div>
          <div class="pt-2">
            <div class="text-xs text-gray-500 mb-2">Capacity Utilization</div>
            <div class="bg-gray-100 rounded-full h-4 overflow-hidden">
              <div 
                class="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-500"
                :style="`width: ${ticketUsageData.data.usage_rate}%`"
              ></div>
            </div>
          </div>
        </div>
        <div v-else class="text-center text-gray-500 py-8">
          No usage data available
        </div>
      </StatSection>
    </div>

    <!-- Detailed Tables -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Status Breakdown Table -->
      <StatSection 
        title="Status Breakdown"
        description="Detailed ticket status information"
      >
        <div v-if="overviewLoading" class="flex items-center justify-center h-32">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <div v-else-if="ticketOverviewData?.data?.status_breakdown" class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                <th class="px-4 py-3 text-right font-semibold text-gray-700">Count</th>
                <th class="px-4 py-3 text-right font-semibold text-gray-700">Percentage</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="status in ticketOverviewData.data.status_breakdown" :key="status.status" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-gray-900">{{ formatStatus(status.status) }}</td>
                <td class="px-4 py-3 text-right text-gray-700">{{ status.count }}</td>
                <td class="px-4 py-3 text-right text-gray-600">{{ status.percentage }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-center text-gray-500 py-8">
          No status breakdown available
        </div>
      </StatSection>

      <!-- Scope Breakdown Table -->
      <StatSection 
        title="Scope Breakdown"
        description="Detailed ticket scope information"
      >
        <div v-if="overviewLoading" class="flex items-center justify-center h-32">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
        <div v-else-if="ticketOverviewData?.data?.scope_breakdown" class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 text-left font-semibold text-gray-700">Scope</th>
                <th class="px-4 py-3 text-right font-semibold text-gray-700">Count</th>
                <th class="px-4 py-3 text-right font-semibold text-gray-700">Percentage</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="scope in ticketOverviewData.data.scope_breakdown" :key="scope.scope" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-gray-900">{{ formatStatus(scope.scope) }}</td>
                <td class="px-4 py-3 text-right text-gray-700">{{ scope.count }}</td>
                <td class="px-4 py-3 text-right text-gray-600">{{ scope.percentage }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-center text-gray-500 py-8">
          No scope breakdown available
        </div>
      </StatSection>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  useTicketOverview,
  useTicketStatus,
  useTicketTypes,
  useTicketUsage,
  useTicketScope,
} from '~/composables/statistics/bookings/booking-statistics'
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

// Fetch all ticket statistics
const { data: ticketOverviewData, isLoading: overviewLoading } = useTicketOverview(() => props.queryParams)
const { data: statusData, isLoading: statusLoading, error: statusError } = useTicketStatus(() => props.queryParams)
const { data: typesData, isLoading: typesLoading, error: typesError } = useTicketTypes(() => props.queryParams)
const { data: ticketUsageData, isLoading: usageLoading, error: usageError } = useTicketUsage(() => props.queryParams)
const { data: scopeData, isLoading: scopeLoading, error: scopeError } = useTicketScope(() => props.queryParams)

// Transform data for charts
const ticketStatusChartData = computed<PieChartData[]>(() => {
  if (!statusData.value?.data?.distribution) return []
  return statusData.value.data.distribution.map((item: any) => ({
    name: formatStatus(item.label),
    value: item.value,
  }))
})

const ticketScopeChartData = computed<PieChartData[]>(() => {
  if (!scopeData.value?.data?.distribution) return []
  return scopeData.value.data.distribution.map((item: any) => ({
    name: formatStatus(item.label),
    value: item.value,
  }))
})

const ticketTypesChartData = computed<BarChartData[]>(() => {
  if (!typesData.value?.data?.distribution) return []
  return typesData.value.data.distribution.map((item: any) => ({
    label: item.scope || 'Unknown',
    value: item.count,
  }))
})

// Helper function to format status/scope
const formatStatus = (text: string) => {
  if (!text) {
    return text
  }
  return text.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}
</script>
