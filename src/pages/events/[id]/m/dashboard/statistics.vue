<template>
  <EventManagementLayout :event-id="id" :event="event?.data">
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-2xl font-black text-deep-navy uppercase tracking-widest">Event Statistics</h1>
          <p class="text-sm text-gray-500 font-medium mt-1">Comprehensive analytics for {{ event?.data?.title || 'this event' }}</p>
        </div>
        <UButton
          :to="`/events/${id}/m/dashboard`"
          variant="outline"
          color="gray"
          icon="i-heroicons-arrow-left"
          size="md"
        >
          Back to Dashboard
        </UButton>
      </div>

      <!-- Overview Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-ticket" class="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div class="text-2xl font-black text-deep-navy">{{ overview?.total_bookings ?? '-' }}</div>
              <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Event Bookings</div>
            </div>
          </div>
        </div>

        <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-users" class="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div class="text-2xl font-black text-deep-navy">{{ overview?.total_attendees ?? '-' }}</div>
              <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Event Attendees</div>
            </div>
          </div>
        </div>

        <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-currency-pound" class="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div class="text-2xl font-black text-deep-navy">£{{ formatCurrency(overview?.total_revenue) }}</div>
              <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Event Revenue</div>
            </div>
          </div>
        </div>

        <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-chart-bar" class="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div class="text-2xl font-black text-deep-navy">{{ overview?.average_capacity_utilization?.toFixed(1) ?? '-' }}%</div>
              <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Capacity Used</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Additional Metrics Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Average Rating</div>
              <div class="flex items-center gap-2">
                <div class="text-2xl font-black text-deep-navy">{{ overview?.average_rating?.toFixed(1) ?? 'N/A' }}</div>
                <UIcon v-if="overview?.average_rating" name="i-heroicons-star-solid" class="w-5 h-5 text-yellow-500" />
              </div>
              <div class="text-xs text-gray-400 mt-1">Based on attendee reviews</div>
            </div>
            <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-star" class="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Event Status</div>
              <div class="text-2xl font-black text-deep-navy">{{ event?.data?.status_display ?? 'N/A' }}</div>
              <div class="text-xs text-gray-400 mt-1">Current event state</div>
            </div>
            <div class="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-signal" class="w-6 h-6 text-rose-600" />
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Registration Trends Chart -->
        <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-chart-bar-square" class="w-5 h-5 text-primary" />
              <h3 class="text-sm font-black text-primary uppercase tracking-widest">Registration Trends</h3>
            </div>
            <UButton
              size="xs"
              variant="ghost"
              color="gray"
              icon="i-heroicons-arrow-path"
              @click="refetchRegistrationTrends"
              :loading="isLoadingRegistrationTrends"
            >
              Refresh
            </UButton>
          </div>
          <div class="p-6">
            <div v-if="isLoadingRegistrationTrends" class="h-80 flex items-center justify-center">
              <div class="text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p class="text-sm text-gray-500">Loading registration trends...</p>
              </div>
            </div>
            <div v-else-if="registrationTrendsError" class="h-80 flex items-center justify-center">
              <div class="text-center">
                <UIcon name="i-heroicons-exclamation-circle" class="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p class="text-sm text-gray-600">Unable to load registration trends</p>
                <p class="text-xs text-gray-500 mt-2">This chart requires event data</p>
              </div>
            </div>
            <v-chart
              v-else-if="registrationTrendsOption"
              :option="registrationTrendsOption"
              :autoresize="true"
              class="h-80"
            />
            <div v-else class="h-80 flex items-center justify-center">
              <div class="text-center">
                <UIcon name="i-heroicons-chart-bar-square" class="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p class="text-sm text-gray-500">No registration data available</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Revenue Breakdown Chart -->
        <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-currency-pound" class="w-5 h-5 text-primary" />
              <h3 class="text-sm font-black text-primary uppercase tracking-widest">Revenue Breakdown</h3>
            </div>
            <UButton
              size="xs"
              variant="ghost"
              color="gray"
              icon="i-heroicons-arrow-path"
              @click="refetchRevenue"
              :loading="isLoadingRevenue"
            >
              Refresh
            </UButton>
          </div>
          <div class="p-6">
            <div v-if="isLoadingRevenue" class="h-80 flex items-center justify-center">
              <div class="text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p class="text-sm text-gray-500">Loading revenue data...</p>
              </div>
            </div>
            <v-chart
              v-else-if="revenueOption"
              :option="revenueOption"
              :autoresize="true"
              class="h-80"
            />
            <div v-else class="h-80 flex items-center justify-center">
              <div class="text-center">
                <UIcon name="i-heroicons-currency-pound" class="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p class="text-sm text-gray-500">No revenue data available</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Payment Status Chart -->
        <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-credit-card" class="w-5 h-5 text-primary" />
              <h3 class="text-sm font-black text-primary uppercase tracking-widest">Payment Status</h3>
            </div>
            <UButton
              size="xs"
              variant="ghost"
              color="gray"
              icon="i-heroicons-arrow-path"
              @click="refetchPaymentStatus"
              :loading="isLoadingPaymentStatus"
            >
              Refresh
            </UButton>
          </div>
          <div class="p-6">
            <div v-if="isLoadingPaymentStatus" class="h-80 flex items-center justify-center">
              <div class="text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p class="text-sm text-gray-500">Loading payment data...</p>
              </div>
            </div>
            <v-chart
              v-else-if="paymentStatusOption"
              :option="paymentStatusOption"
              :autoresize="true"
              class="h-80"
            />
            <div v-else class="h-80 flex items-center justify-center">
              <div class="text-center">
                <UIcon name="i-heroicons-credit-card" class="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p class="text-sm text-gray-500">No payment data available</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Capacity Utilization Chart -->
        <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-user-group" class="w-5 h-5 text-primary" />
              <h3 class="text-sm font-black text-primary uppercase tracking-widest">Capacity Utilization</h3>
            </div>
            <UButton
              size="xs"
              variant="ghost"
              color="gray"
              icon="i-heroicons-arrow-path"
              @click="refetchCapacity"
              :loading="isLoadingCapacity"
            >
              Refresh
            </UButton>
          </div>
          <div class="p-6">
            <div v-if="isLoadingCapacity" class="h-80 flex items-center justify-center">
              <div class="text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p class="text-sm text-gray-500">Loading capacity data...</p>
              </div>
            </div>
            <v-chart
              v-else-if="capacityOption"
              :option="capacityOption"
              :autoresize="true"
              class="h-80"
            />
            <div v-else class="h-80 flex items-center justify-center">
              <div class="text-center">
                <UIcon name="i-heroicons-user-group" class="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p class="text-sm text-gray-500">No capacity data available</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </EventManagementLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, PieChart, BarChart, GaugeChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'
import { 
  useEventOverview,
  useRegistrationTrends,
  useRevenueOverview,
  usePaymentStatus,
  useCapacityUtilization,
} from '~/composables/statistics/event/event-statistics'
import { useEvent } from '~/composables/resources/events/events'
import EventManagementLayout from '~/components/events/EventManagementLayout.vue'

// Register ECharts components
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

const route = useRoute()
const id = computed(() => route.params.id as string)

// Fetch event details
const { data: event } = useEvent(id)

// Fetch overview statistics
// Note: TypeScript types show event_id as number, but backend accepts UUID string
const { 
  data: overviewData, 
  isLoading: isLoadingOverview,
  refetch: refetchOverview 
} = useEventOverview(computed(() => ({
  // @ts-ignore - Backend accepts UUID string despite OpenAPI spec saying number
  event_id: id.value,
} as any)))

const overview = computed(() => overviewData.value?.data)

// Fetch registration trends
const { 
  data: registrationTrendsData, 
  isLoading: isLoadingRegistrationTrends,
  error: registrationTrendsError,
  refetch: refetchRegistrationTrends 
} = useRegistrationTrends(computed(() => ({
  // @ts-ignore - Backend accepts UUID string despite OpenAPI spec saying number
  event_id: id.value,
  period: 'week' as const,
  cumulative: true,
} as any)))

// Fetch revenue overview
const { 
  data: revenueData, 
  isLoading: isLoadingRevenue,
  refetch: refetchRevenue 
} = useRevenueOverview(computed(() => ({
  // @ts-ignore - Backend accepts UUID string despite OpenAPI spec saying number
  event_id: id.value,
} as any)))

// Fetch payment status
const { 
  data: paymentStatusData, 
  isLoading: isLoadingPaymentStatus,
  refetch: refetchPaymentStatus 
} = usePaymentStatus(computed(() => ({
  // @ts-ignore - Backend accepts UUID string despite OpenAPI spec saying number
  event_id: id.value,
} as any)))

// Fetch capacity utilization
const { 
  data: capacityData, 
  isLoading: isLoadingCapacity,
  refetch: refetchCapacity 
} = useCapacityUtilization(computed(() => ({
  // @ts-ignore - Backend accepts UUID string despite OpenAPI spec saying number
  event_id: id.value,
} as any)))

// Format currency helper
const formatCurrency = (value: string | number | null | undefined) => {
  if (!value) return '0.00'
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  return numValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// Registration Trends Chart Option
const registrationTrendsOption = computed(() => {
  const trends = registrationTrendsData.value?.data?.trends
  if (!trends || trends.length === 0) return null

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      data: ['New Registrations', 'Cumulative Total']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: trends.map((t: any) => new Date(t.date).toLocaleDateString('en-GB', { 
        month: 'short', 
        day: 'numeric' 
      }))
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: 'New Registrations',
        type: 'line',
        data: trends.map((t: any) => t.count),
        smooth: true,
        itemStyle: {
          color: '#3b82f6'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0,
              color: 'rgba(59, 130, 246, 0.3)'
            }, {
              offset: 1,
              color: 'rgba(59, 130, 246, 0.05)'
            }]
          }
        }
      },
      {
        name: 'Cumulative Total',
        type: 'line',
        data: trends.map((t: any) => t.cumulative ?? 0),
        smooth: true,
        itemStyle: {
          color: '#10b981'
        }
      }
    ]
  }
})

// Revenue Breakdown Chart Option
const revenueOption = computed(() => {
  const breakdown = revenueData.value?.data?.breakdown
  if (!breakdown || breakdown.length === 0) return null

  return {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: £{c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: 'Revenue',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: breakdown.map((item: any) => ({
          value: item.value,
          name: item.source,
          itemStyle: {
            color: item.source === 'Bookings' ? '#3b82f6' : 
                   item.source === 'Products' ? '#10b981' : 
                   '#f59e0b'
          }
        }))
      }
    ]
  }
})

// Payment Status Chart Option
const paymentStatusOption = computed(() => {
  const distribution = paymentStatusData.value?.data?.distribution
  if (!distribution || distribution.length === 0) return null

  return {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      bottom: '0',
      left: 'center'
    },
    series: [
      {
        name: 'Payment Status',
        type: 'pie',
        radius: '65%',
        center: ['50%', '45%'],
        data: distribution.map((item: any) => ({
          value: item.count,
          name: item.label,
          itemStyle: {
            color: item.label === 'COMPLETED' ? '#10b981' : 
                   item.label === 'PENDING' ? '#f59e0b' : 
                   '#ef4444'
          }
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
})

// Capacity Utilization Chart Option
const capacityOption = computed(() => {
  const events = capacityData.value?.data?.events
  if (!events || events.length === 0) return null

  // Take top 10 events
  const topEvents = events.slice(0, 10)

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => {
        const data = params[0]
        const event = topEvents[data.dataIndex] as any
        return `
          <strong>${event.title}</strong><br/>
          Registered: ${event.registered_count}<br/>
          Capacity: ${event.maximum_attendance}<br/>
          Utilization: ${event.utilization_percentage?.toFixed(1) ?? 0}%
        `
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    yAxis: {
      type: 'category',
      data: topEvents.map((e: any) => {
        // Truncate long titles
        const title = e.title
        return title.length > 30 ? title.substring(0, 27) + '...' : title
      }),
      axisLabel: {
        interval: 0
      }
    },
    series: [
      {
        name: 'Utilization',
        type: 'bar',
        data: topEvents.map((e: any) => ({
          value: e.utilization_percentage,
          itemStyle: {
            color: e.utilization_percentage >= 95 ? '#ef4444' : 
                   e.utilization_percentage >= 80 ? '#f59e0b' : 
                   '#10b981'
          }
        })),
        label: {
          show: true,
          position: 'right',
          formatter: '{c}%'
        }
      }
    ]
  }
})
</script>
