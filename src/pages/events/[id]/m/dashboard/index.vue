<template>
  <EventManagementLayout :event-id="id" :event="event">
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- Total Registrations -->
      <div class="bg-white border border-deep-navy p-6 rounded-lg shadow-sm flex justify-between items-start">
        <div>
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Total Registrations</p>
          <h3 class="text-4xl font-black text-deep-navy mt-2">{{ event?.number_of_attendees || 0 }}</h3>
          <p v-if="event?.maximum_attendance" class="text-[10px] font-bold text-gray-400 mt-1 uppercase">
            of {{ event.maximum_attendance }} capacity
          </p>
        </div>
        <div class="w-12 h-12 rounded bg-blue-50 flex items-center justify-center text-deep-navy border border-blue-100">
          <UIcon name="i-heroicons-user-group" class="w-6 h-6" />
        </div>
      </div>

      <!-- Event Staff -->
      <div class="bg-white border border-deep-navy p-6 rounded-lg shadow-sm flex justify-between items-start">
        <div>
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Event Staff</p>
          <h3 class="text-4xl font-black text-deep-navy mt-2">{{ staffList?.count || 0 }}</h3>
          <p class="text-[10px] font-bold text-gray-400 mt-1 uppercase">Active members</p>
        </div>
        <div class="w-12 h-12 rounded bg-purple-50 flex items-center justify-center text-deep-navy border border-purple-100">
          <UIcon name="i-heroicons-identification" class="w-6 h-6" />
        </div>
      </div>

      <!-- Live Forms -->
      <div class="bg-white border border-deep-navy p-6 rounded-lg shadow-sm flex justify-between items-start">
        <div>
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Form Questions</p>
          <h3 class="text-4xl font-black text-deep-navy mt-2">{{ questionsList?.count || 0 }}</h3>
          <p class="text-[10px] font-bold text-gray-400 mt-1 uppercase">Registration fields</p>
        </div>
        <div class="w-12 h-12 rounded bg-green-50 flex items-center justify-center text-deep-navy border border-green-100">
          <UIcon name="i-heroicons-clipboard-document-list" class="w-6 h-6" />
        </div>
      </div>
    </div>

    <!-- Registrations Over Time Chart -->
    <section class="bg-white border border-deep-navy rounded-lg shadow-sm overflow-hidden mb-8">
      <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <h2 class="text-sm font-black text-deep-navy flex items-center gap-2 uppercase tracking-widest">
          <UIcon name="i-heroicons-chart-bar" class="text-xl text-deep-navy" />
          Registrations Over Time
        </h2>
        <div class="flex gap-2">
          <span class="px-2 py-1 bg-gray-50 rounded text-[10px] font-bold text-deep-navy border border-gray-100">7 DAYS</span>
          <span class="px-2 py-1 rounded text-[10px] font-bold text-gray-400 border border-transparent">30 DAYS</span>
        </div>
      </div>
      <div class="h-[300px]">
        <LineChart :data="registrationChartData" :labels="registrationChartLabels" color="#0a192f" />
      </div>
    </section>

    <!-- Financial Metrics Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- Net Profit -->
      <div class="bg-white border border-deep-navy p-6 rounded-lg shadow-sm">
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Net Profit</p>
        <div class="flex items-baseline gap-2">
          <h3 class="text-3xl font-black text-deep-navy">£{{ netProfit.toLocaleString() }}.00</h3>
          <span class="text-xs font-bold text-green-600 flex items-center">
            <UIcon name="i-heroicons-arrow-up" class="w-3 h-3" /> 12%
          </span>
        </div>
      </div>

      <!-- Revenue Split -->
      <div class="bg-white border border-deep-navy p-6 rounded-lg shadow-sm">
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Revenue Split</p>
        <div class="space-y-3">
          <div class="flex items-center justify-between text-[10px] font-bold uppercase">
            <span class="text-deep-navy">Tickets</span>
            <span class="text-gray-400">85%</span>
          </div>
          <div class="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex">
            <div class="h-full bg-deep-navy" style="width: 85%"></div>
            <div class="h-full bg-gray-300" style="width: 15%"></div>
          </div>
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-deep-navy"></span>
              <span class="text-[10px] font-bold text-gray-400 uppercase">Tickets</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-gray-300"></span>
              <span class="text-[10px] font-bold text-gray-400 uppercase">Merchandise</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Venue Capacity -->
      <div class="bg-white border border-deep-navy p-6 rounded-lg shadow-sm flex items-center justify-between">
        <div>
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Venue Capacity</p>
          <h3 class="text-3xl font-black text-deep-navy">{{ Math.round(attendancePercentage) }}%</h3>
          <p class="text-[10px] font-bold text-gray-400 uppercase mt-1">
            {{ event?.number_of_attendees || 0 }} / {{ event?.maximum_attendance || 0 }}
          </p>
        </div>
        <div class="relative w-20 h-20">
          <CircularProgress 
            :percentage="attendancePercentage" 
            :size="80" 
            :stroke-width="6"
            color="primary"
          />
        </div>
      </div>
    </div>

    <!-- Bottom Grid: Attendees per Area + Recent Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
      <!-- Attendees per Area (8 cols) -->
      <div class="lg:col-span-8">
        <section class="bg-white border border-deep-navy rounded-lg shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 class="text-sm font-black text-deep-navy flex items-center gap-2 uppercase tracking-widest">
              <UIcon name="i-heroicons-map" class="text-xl" />
              Attendees per Area
            </h2>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <ProgressBar
                v-for="area in attendeesByArea"
                :key="area.label"
                :label="area.label"
                :value="area.value"
                :percentage="area.percentage"
                color="primary"
              />
            </div>
          </div>
        </section>

        <!-- Recent Activity -->
        <section class="bg-white border border-deep-navy rounded-lg shadow-sm overflow-hidden mt-8">
          <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 class="text-sm font-black text-deep-navy flex items-center gap-2 uppercase tracking-widest">
              <UIcon name="i-heroicons-bell" class="text-xl" />
              Recent Activity
            </h2>
            <NuxtLink
              :to="`/events/${id}/m/participants/dashboard`"
              class="text-[10px] font-black text-blue-600 hover:text-blue-700 flex items-center gap-1 uppercase tracking-widest"
            >
              Full Log <UIcon name="i-heroicons-arrow-right" class="text-sm" />
            </NuxtLink>
          </div>
          <div class="divide-y divide-gray-50">
            <div
              v-for="(activity, idx) in recentActivities"
              :key="idx"
              class="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
            >
              <div class="flex items-center gap-4">
                <div :class="['w-8 h-8 rounded-full flex items-center justify-center', activity.colorClass]">
                  <UIcon :name="activity.icon" class="text-sm" />
                </div>
                <div>
                  <h4 class="text-sm font-bold text-deep-navy">{{ activity.title }}</h4>
                  <p class="text-[10px] text-gray-400 uppercase font-bold">{{ activity.subtitle }}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Sidebar (4 cols) -->
      <div class="lg:col-span-4 space-y-6">
        <!-- Event Status -->
        <div class="bg-white border border-deep-navy rounded-lg shadow-sm p-6">
          <h3 class="text-sm font-black text-deep-navy uppercase tracking-widest mb-4">Event Status</h3>
          <div class="space-y-4">
            <div>
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Current Status</p>
              <UBadge
                v-if="event?.status"
                :color="getStatusColor(event.status)"
                variant="subtle"
                size="md"
              >
                {{ event.status_display }}
              </UBadge>
            </div>
            <div v-if="event?.start_datetime">
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Start Date</p>
              <p class="text-sm font-bold text-deep-navy">{{ formatDate(event.start_datetime) }}</p>
            </div>
            <div v-if="event?.end_datetime">
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">End Date</p>
              <p class="text-sm font-bold text-deep-navy">{{ formatDate(event.end_datetime) }}</p>
            </div>
            <div v-if="event?.created_at">
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Created</p>
              <p class="text-sm font-bold text-deep-navy">{{ formatCompactDateTime(event.created_at) }}</p>
            </div>
          </div>
        </div>

        <!-- Features Enabled -->
        <div class="bg-white border border-deep-navy rounded-lg shadow-sm p-6">
          <h3 class="text-sm font-black text-deep-navy uppercase tracking-widest mb-4">Features Enabled</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600 font-medium">Payments</span>
              <UIcon
                :name="settings?.payment_enabled ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
                :class="settings?.payment_enabled ? 'text-green-600' : 'text-gray-400'"
                class="w-5 h-5"
              />
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600 font-medium">Product Shop</span>
              <UIcon
                :name="settings?.product_selling_enabled ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
                :class="settings?.product_selling_enabled ? 'text-green-600' : 'text-gray-400'"
                class="w-5 h-5"
              />
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600 font-medium">Donations</span>
              <UIcon
                :name="settings?.donation_enabled ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
                :class="settings?.donation_enabled ? 'text-green-600' : 'text-gray-400'"
                class="w-5 h-5"
              />
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600 font-medium">Sponsors</span>
              <UIcon
                :name="settings?.accepting_sponsorships_enabled ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
                :class="settings?.accepting_sponsorships_enabled ? 'text-green-600' : 'text-gray-400'"
                class="w-5 h-5"
              />
            </div>
          </div>
        </div>

        <!-- Overview Stats -->
        <div class="bg-white border border-deep-navy rounded-lg shadow-sm p-6">
          <h3 class="text-sm font-black text-deep-navy uppercase tracking-widest mb-4">Overview</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600 font-medium">Resources</span>
              <span class="font-black text-deep-navy">{{ resourcesList?.count || 0 }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600 font-medium">Landing Images</span>
              <span class="font-black text-deep-navy">{{ landingImages?.count || 0 }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600 font-medium">Staff Roles</span>
              <span class="font-black text-deep-navy">{{ rolesList?.count || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </EventManagementLayout>
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { attendeesList } from '~/api/sdk.gen'
import { useEvent } from '~/composables/resources/events/events'
import { useEventSettings } from '~/composables/resources/events/eventSettings'
import { useEventStaff } from '~/composables/resources/events/eventStaff'
import { useEventQuestions } from '~/composables/resources/events/eventQuestions'
import { useEventRoles } from '~/composables/resources/events/eventRoles'
import { useEventResources } from '~/composables/resources/events/eventResources'
import { useEventLandingImages } from '~/composables/resources/events/eventLandingImages'
import { formatDate, formatCompactDateTime } from '~/utils/time'
import EventManagementLayout from '~/components/events/EventManagementLayout.vue'
import LineChart from '~/components/charts/LineChart.vue'
import ProgressBar from '~/components/charts/ProgressBar.vue'
import CircularProgress from '~/components/charts/CircularProgress.vue'

definePageMeta({
  layout: false,
  middleware: 'auth',
})

const route = useRoute()
const id = computed(() => route.params.id as string)

// Fetch event data
const { data: eventData, isPending: isEventPending } = useEvent(id)
const event = computed(() => eventData.value?.data)

const { data: settingsData } = useEventSettings(id)
const settings = computed(() => settingsData.value?.data)

const { data: staffData } = useEventStaff({ event__event_id: id.value })
const staffList = computed(() => staffData.value?.data)

const { data: questionsData } = useEventQuestions({ event__event_id: id.value })
const questionsList = computed(() => questionsData.value?.data)

const { data: rolesData } = useEventRoles()
const rolesList = computed(() => rolesData.value?.data)

const { data: resourcesData } = useEventResources(id, { page_size: 1 })
const resourcesList = computed(() => resourcesData.value?.data)

const { data: landingImagesData } = useEventLandingImages(id, { page_size: 1 })
const landingImages = computed(() => landingImagesData.value?.data)

// Fetch attendees list for chart data and recent activity
const { data: attendeesData, isPending: isAttendeesPending } = useQuery({
  queryKey: ['attendees', 'list', id],
  queryFn: () => {
    return attendeesList({
      query: {
        event: id.value,
        page_size: 100, // Fetch more for chart data
        ordering: '-created_at',
      },
    })
  },
  enabled: () => !!id.value,
})

const attendeesResults = computed(() => attendeesData.value?.data?.results || [])

const attendancePercentage = computed(() => {
  if (!event.value?.maximum_attendance) return 0
  const current = event.value.number_of_attendees || 0
  return Math.min((current / event.value.maximum_attendance) * 100, 100)
})

// Chart Data: Registrations Over Time (Last 7 days)
const registrationChartData = computed(() => {
  // Get last 7 days
  const days = 7
  const data = new Array(days).fill(0)
  const today = new Date()
  
  attendeesResults.value.forEach(attendee => {
    const createdDate = new Date(attendee.created_at)
    const daysDiff = Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysDiff >= 0 && daysDiff < days) {
      data[days - 1 - daysDiff]++
    }
  })
  
  // If no real data, use mock data for demonstration
  if (data.every(val => val === 0)) {
    return [15, 28, 42, 38, 55, 68, 82]
  }
  
  return data
})

const registrationChartLabels = computed(() => {
  const labels = []
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const today = new Date()
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    labels.push(days[date.getDay()])
  }
  
  return labels
})

// Mock Financial Data (until backend aggregation is available)
const netProfit = computed(() => {
  // TODO: Calculate from payments when aggregation endpoint is available
  return 42850
})

// Mock Regional Distribution Data
const attendeesByArea = computed(() => {
  // TODO: Calculate from attendees location data when available
  return [
    { label: 'Southeast', value: 482, percentage: 65 },
    { label: 'Birmingham', value: 315, percentage: 45 },
    { label: 'Wales', value: 218, percentage: 32 },
    { label: 'Scotland', value: 156, percentage: 20 },
  ]
})

// Recent Activities (converted from latest registrations)
const recentActivities = computed(() => {
  const activities = []
  
  // Add recent registrations
  attendeesResults.value.slice(0, 3).forEach(attendee => {
    activities.push({
      icon: 'i-heroicons-user-plus',
      colorClass: 'bg-blue-100 text-blue-600',
      title: `New registration by ${attendee.full_name}`,
      subtitle: `${formatCompactDateTime(attendee.created_at)}`,
    })
  })
  
  // Add mock activities for variety (until we have real activity tracking)
  if (activities.length < 3) {
    activities.push(
      {
        icon: 'i-heroicons-identification',
        colorClass: 'bg-purple-100 text-purple-600',
        title: 'Staff member added',
        subtitle: 'Team Update • 2 hours ago',
      },
      {
        icon: 'i-heroicons-shopping-cart',
        colorClass: 'bg-green-100 text-green-600',
        title: 'Product purchase completed',
        subtitle: 'Order #8821 • 4 hours ago',
      }
    )
  }
  
  return activities.slice(0, 3)
})

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