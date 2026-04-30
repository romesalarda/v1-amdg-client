<template>
  <div class="space-y-6">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        :value="ageData?.data?.total_with_age ?? 0"
        label="Attendees with Age"
        icon="i-heroicons-user-circle"
        icon-color="blue"
      />
      <StatCard
        :value="ageData?.data?.average_age?.toFixed(1) ?? 'N/A'"
        label="Average Age"
        icon="i-heroicons-calendar"
        icon-color="green"
      />
      <StatCard
        :value="genderData?.data?.total ?? 0"
        label="Total Records"
        icon="i-heroicons-users"
        icon-color="purple"
      />
      <StatCard
        :value="selectedLocationTotalWithValue"
        :label="`With ${selectedLocationLabel}`"
        icon="i-heroicons-map-pin"
        icon-color="amber"
      />
    </div>

    <!-- Charts Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Age Distribution -->
      <StatSection 
        title="Age Distribution"
        description="Breakdown of attendees by age groups"
      >
        <div v-if="ageLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <div v-else-if="ageError" class="text-center text-red-600 py-8">
          Error loading age distribution
        </div>
        <BarChart
          v-else-if="ageChartData.length"
          :data="ageChartData"
          height="300px"
          color="#3b82f6"
          value-label="Attendees"
        />
        <div v-else class="text-center text-gray-500 py-8">
          No age data available
        </div>
      </StatSection>

      <!-- Gender Distribution -->
      <StatSection 
        title="Gender Distribution"
        description="Distribution of attendees by gender"
      >
        <div v-if="genderLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
        <div v-else-if="genderError" class="text-center text-red-600 py-8">
          Error loading gender distribution
        </div>
        <PieChart
          v-else-if="genderChartData.length"
          :data="genderChartData"
          height="300px"
          :donut="true"
          :colors="['#3b82f6', '#8b5cf6', '#ec4899']"
          value-label="Attendees"
        />
        <div v-else class="text-center text-gray-500 py-8">
          No gender data available
        </div>
      </StatSection>

      <!-- Relationship Distribution -->
      <StatSection 
        title="Relationship to User"
        description="How attendees are related to the booking user"
      >
        <div v-if="relationshipLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
        <div v-else-if="relationshipError" class="text-center text-red-600 py-8">
          Error loading relationship distribution
        </div>
        <PieChart
          v-else-if="relationshipChartData.length"
          :data="relationshipChartData"
          height="300px"
          :donut="true"
          :colors="['#10b981', '#06b6d4', '#f59e0b', '#8b5cf6']"
          value-label="Attendees"
        />
        <div v-else class="text-center text-gray-500 py-8">
          No relationship data available
        </div>
      </StatSection>

      <!-- Location Distribution -->
      <StatSection 
        :title="`Geographic Distribution by ${selectedLocationLabel}`"
        description="Distribution of attendees by area, chapter, cluster, and country"
      >
        <div class="mb-4 flex flex-wrap gap-2">
          <button
            v-for="option in locationOptions"
            :key="option.value"
            @click="selectedLocationType = option.value"
            class="px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-colors"
            :class="selectedLocationType === option.value
              ? 'bg-amber-600 text-white'
              : 'bg-amber-50 text-amber-700 hover:bg-amber-100'"
          >
            {{ option.label }}
          </button>
        </div>
        <div v-if="locationBreakdownLoading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        </div>
        <div v-else-if="locationBreakdownError" class="text-center text-red-600 py-8">
          Error loading location distribution
        </div>
        <BarChart
          v-else-if="locationChartData.length"
          :data="locationChartData"
          height="300px"
          color="#f59e0b"
          :horizontal="true"
          value-label="Attendees"
        />
        <div v-else class="text-center text-gray-500 py-8">
          No location data available
        </div>
      </StatSection>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAgeDistribution, useGenderDistribution, useRelationshipDistribution, useLocationBreakdown } from '~/composables/statistics/attendee/attendee-statistics'
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
const selectedLocationType = ref<'area' | 'chapter' | 'cluster' | 'country'>('area')
const locationOptions = [
  { value: 'area' as const, label: 'Area' },
  { value: 'chapter' as const, label: 'Chapter' },
  { value: 'cluster' as const, label: 'Cluster' },
  { value: 'country' as const, label: 'Country' },
]

// Fetch statistics data
const { data: ageData, isLoading: ageLoading, error: ageError } = useAgeDistribution(() => props.queryParams)
const { data: genderData, isLoading: genderLoading, error: genderError } = useGenderDistribution(() => props.queryParams)
const { data: relationshipData, isLoading: relationshipLoading, error: relationshipError } = useRelationshipDistribution(() => props.queryParams)
const { data: locationBreakdownData, isLoading: locationBreakdownLoading, error: locationBreakdownError } = useLocationBreakdown(() => props.queryParams)

// Transform data for charts
const ageChartData = computed<BarChartData[]>(() => {
  if (!ageData.value?.data?.distribution) return []
  return ageData.value.data.distribution.map((item: any) => ({
    label: item.label,
    value: item.value,
  }))
})

const genderChartData = computed<PieChartData[]>(() => {
  if (!genderData.value?.data?.distribution) return []
  return genderData.value.data.distribution.map((item: any) => ({
    name: item.label,
    value: item.value,
  }))
})

const relationshipChartData = computed<PieChartData[]>(() => {
  if (!relationshipData.value?.data?.distribution) return []
  return relationshipData.value.data.distribution.map((item: any) => ({
    name: item.label,
    value: item.value,
  }))
})

const selectedLocationSection = computed(() => {
  const data = locationBreakdownData.value?.data
  if (!data) return null

  const sections = {
    area: data.by_area,
    chapter: data.by_chapter,
    cluster: data.by_cluster,
    country: data.by_country,
  }

  return sections[selectedLocationType.value] as any
})

const selectedLocationLabel = computed(() => {
  const option = locationOptions.find((item) => item.value === selectedLocationType.value)
  return option?.label ?? 'Location'
})

const selectedLocationTotalWithValue = computed(() => {
  const section = selectedLocationSection.value
  if (!section) return 0

  return section.total_with_value ?? section.total_with_area ?? 0
})

const locationChartData = computed<BarChartData[]>(() => {
  const distribution = selectedLocationSection.value?.distribution
  if (!distribution) return []

  return distribution
    .slice(0, 10)
    .map((item: any) => ({
      label: item.label,
      value: item.value,
    }))
})
</script>
