<template>
  <div class="space-y-6">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        :value="medicalData?.data?.attendees_with_conditions ?? 0"
        label="Medical Conditions"
        icon="i-heroicons-heart"
        icon-color="red"
        :subtitle="`${medicalData?.data?.total_attendees ?? 0} total attendees`"
      />
      <StatCard
        :value="accessibilityData?.data?.attendees_with_requirements ?? 0"
        label="Accessibility Needs"
        icon="i-heroicons-shield-check"
        icon-color="blue"
        :subtitle="`${accessibilityData?.data?.total_attendees ?? 0} total attendees`"
      />
      <StatCard
        :value="dietaryData?.data?.attendees_with_requirements ?? 0"
        label="Dietary Requirements"
        icon="i-heroicons-cake"
        icon-color="green"
        :subtitle="`${dietaryData?.data?.total_attendees ?? 0} total attendees`"
      />
      <StatCard
        :value="(emergencyData?.data as any)?.total_emergency_contacts ?? 0"
        label="Emergency Contacts"
        icon="i-heroicons-phone"
        icon-color="purple"
        :subtitle="`${(emergencyData?.data as any)?.total_attendees ?? 0} attendees`"
      />
    </div>

    <!-- Medical Conditions Section -->
    <StatSection 
      title="Medical Conditions"
      description="Breakdown of medical conditions reported by attendees"
    >
      <div v-if="medicalLoading" class="flex items-center justify-center h-64">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
      <div v-else-if="medicalError" class="text-center text-red-600 py-8">
        Error loading medical conditions
      </div>
      <div v-else-if="medicalChartData.length" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 class="text-sm font-semibold text-gray-700 mb-4">Conditions by Type</h4>
          <BarChart
            :data="medicalChartData"
            height="300px"
            color="#ef4444"
            value-label="Attendees"
          />
        </div>
        <div v-if="severityChartData.length">
          <h4 class="text-sm font-semibold text-gray-700 mb-4">Severity Distribution</h4>
          <PieChart
            :data="severityChartData"
            height="300px"
            :donut="true"
            :colors="['#10b981', '#f59e0b', '#ef4444']"
            value-label="Attendees"
          />
        </div>
      </div>
      <div v-else class="text-center text-gray-500 py-8">
        No medical conditions data available
      </div>
    </StatSection>

    <!-- Accessibility Requirements -->
    <StatSection 
      title="Accessibility Requirements"
      description="Types of accessibility supports needed"
    >
      <div v-if="accessibilityLoading" class="flex items-center justify-center h-64">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
      <div v-else-if="accessibilityError" class="text-center text-red-600 py-8">
        Error loading accessibility requirements
      </div>
      <BarChart
        v-else-if="accessibilityChartData.length"
        :data="accessibilityChartData"
        height="300px"
        color="#3b82f6"
        :horizontal="true"
        value-label="Attendees"
      />
      <div v-else class="text-center text-gray-500 py-8">
        No accessibility requirements data available
      </div>
    </StatSection>

    <!-- Dietary Requirements -->
    <StatSection 
      title="Dietary Requirements"
      description="Types of dietary restrictions and preferences"
    >
      <div v-if="dietaryLoading" class="flex items-center justify-center h-64">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
      <div v-else-if="dietaryError" class="text-center text-red-600 py-8">
        Error loading dietary requirements
      </div>
      <BarChart
        v-else-if="dietaryChartData.length"
        :data="dietaryChartData"
        height="300px"
        color="#10b981"
        :horizontal="true"
        value-label="Attendees"
      />
      <div v-else class="text-center text-gray-500 py-8">
        No dietary requirements data available
      </div>
    </StatSection>

    <!-- Emergency Contacts -->
    <StatSection 
      title="Emergency Contacts"
      description="Emergency contact relationships"
    >
      <div v-if="emergencyLoading" class="flex items-center justify-center h-64">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
      <div v-else-if="emergencyError" class="text-center text-red-600 py-8">
        Error loading emergency contacts
      </div>
      <PieChart
        v-else-if="emergencyChartData.length"
        :data="emergencyChartData"
        height="300px"
        :colors="['#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ec4899']"
        value-label="Contacts"
      />
      <div v-else class="text-center text-gray-500 py-8">
        No emergency contacts data available
      </div>
    </StatSection>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMedicalConditions, useAccessibility, useDietary, useEmergencyContacts } from '~/composables/statistics/attendee/attendee-statistics'
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

// Fetch statistics data
const { data: medicalData, isLoading: medicalLoading, error: medicalError } = useMedicalConditions(() => props.queryParams)
const { data: accessibilityData, isLoading: accessibilityLoading, error: accessibilityError } = useAccessibility(() => props.queryParams)
const { data: dietaryData, isLoading: dietaryLoading, error: dietaryError } = useDietary(() => props.queryParams)
const { data: emergencyData, isLoading: emergencyLoading, error: emergencyError } = useEmergencyContacts(() => props.queryParams)

// Transform data for charts
const medicalChartData = computed<BarChartData[]>(() => {
  if (!medicalData.value?.data?.conditions) return []
  return medicalData.value.data.conditions
    .slice(0, 10)
    .map((item: any) => ({
      label: item.label,
      value: item.value,
    }))
})

const severityChartData = computed<PieChartData[]>(() => {
  if (!medicalData.value?.data?.severity_distribution) return []
  return medicalData.value.data.severity_distribution.map((item: any) => ({
    name: item.label,
    value: item.value,
  }))
})

const accessibilityChartData = computed<BarChartData[]>(() => {
  if (!accessibilityData.value?.data?.requirements) return []
  return accessibilityData.value.data.requirements.map((item: any) => ({
    label: item.label,
    value: item.value,
  }))
})

const dietaryChartData = computed<BarChartData[]>(() => {
  if (!dietaryData.value?.data?.requirements) return []
  return dietaryData.value.data.requirements.map((item: any) => ({
    label: item.label,
    value: item.value,
  }))
})

const emergencyChartData = computed<PieChartData[]>(() => {
  const data = emergencyData.value?.data as any
  if (!data?.relationship_distribution) return []
  return data.relationship_distribution.map((item: any) => ({
    name: item.label,
    value: item.value,
  }))
})
</script>
