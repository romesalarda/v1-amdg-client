<template>
  <div class="space-y-6">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        :value="consentsData?.data?.total_attendees ?? 0"
        label="Total Attendees"
        icon="i-heroicons-users"
        icon-color="blue"
      />
      <StatCard
        :value="consentsData?.data?.total_consents ?? 0"
        label="Consent Types"
        icon="i-heroicons-document-text"
        icon-color="purple"
      />
      <StatCard
        :value="averageCompletionRate"
        label="Avg Completion Rate"
        icon="i-heroicons-check-badge"
        icon-color="green"
        format="percentage"
      />
    </div>

    <!-- Info Message if no event_id -->
    <div v-if="!hasEventId" class="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <div class="flex items-start gap-3">
        <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-amber-600 mt-0.5" />
        <div>
          <h4 class="text-sm font-semibold text-amber-900">Event Selection Required</h4>
          <p class="text-sm text-amber-700 mt-1">
            Consent statistics are event-specific. Please ensure you're viewing this page from a specific event.
          </p>
        </div>
      </div>
    </div>

    <!-- Consent Breakdown -->
    <div v-else-if="consentsData?.data?.consent_breakdown">
      <div class="grid grid-cols-1 gap-6">
        <StatSection 
          v-for="consent in consentsData.data.consent_breakdown"
          :key="(consent as any).consent_code"
          :title="(consent as any).consent_title"
          :description="`${(consent as any).required ? 'Required' : 'Optional'} consent`"
        >
          <div class="space-y-4">
            <!-- Stats Grid -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <div class="text-2xl font-bold text-gray-900">{{ (consent as any).total_responses }}</div>
                <div class="text-xs text-gray-600 mt-1">Responses</div>
              </div>
              <div class="text-center p-3 bg-green-50 rounded-lg">
                <div class="text-2xl font-bold text-green-900">{{ (consent as any).consents_given }}</div>
                <div class="text-xs text-green-700 mt-1">Given</div>
              </div>
              <div class="text-center p-3 bg-red-50 rounded-lg">
                <div class="text-2xl font-bold text-red-900">{{ (consent as any).consents_declined }}</div>
                <div class="text-xs text-red-700 mt-1">Declined</div>
              </div>
              <div class="text-center p-3 bg-amber-50 rounded-lg">
                <div class="text-2xl font-bold text-amber-900">
                  {{ ((consentsData.data as any).total_attendees - (consent as any).total_responses) }}
                </div>
                <div class="text-xs text-amber-700 mt-1">No Response</div>
              </div>
            </div>

            <!-- Completion Rate Progress Bar -->
            <div>
              <div class="flex justify-between text-sm font-medium text-gray-700 mb-2">
                <span>Completion Rate</span>
                <span>{{ ((consent as any).completion_rate as number)?.toFixed(1) ?? 0 }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-4">
                <div 
                  class="h-4 rounded-full transition-all duration-500"
                  :class="(consent as any).completion_rate >= 80 ? 'bg-green-600' : (consent as any).completion_rate >= 50 ? 'bg-amber-600' : 'bg-red-600'"
                  :style="{ width: `${(consent as any).completion_rate ?? 0}%` }"
                ></div>
              </div>
            </div>

            <!-- Approval Rate Progress Bar -->
            <div>
              <div class="flex justify-between text-sm font-medium text-gray-700 mb-2">
                <span>Approval Rate</span>
                <span>{{ ((consent as any).approval_rate as number)?.toFixed(1) ?? 0 }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-4">
                <div 
                  class="h-4 rounded-full transition-all duration-500"
                  :class="(consent as any).approval_rate >= 80 ? 'bg-green-600' : (consent as any).approval_rate >= 50 ? 'bg-amber-600' : 'bg-red-600'"
                  :style="{ width: `${(consent as any).approval_rate ?? 0}%` }"
                ></div>
              </div>
            </div>

            <!-- Distribution Chart -->
            <div class="mt-4">
              <PieChart
                :data="getConsentDistribution(consent)"
                height="250px"
                :colors="['#10b981', '#ef4444', '#9ca3af']"
                :donut="true"
              />
            </div>
          </div>
        </StatSection>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="consentsLoading" class="flex items-center justify-center h-64">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="consentsError" class="text-center text-red-600 py-8">
      Error loading consent statistics
    </div>

    <!-- Empty State -->
    <div v-else class="text-center text-gray-500 py-16">
      No consent data available
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useConsents } from '~/composables/statistics/attendee/attendee-statistics'
import StatCard from '~/components/statistics/StatCard.vue'
import StatSection from '~/components/statistics/StatSection.vue'
import PieChart from '~/components/charts/PieChart.vue'
import type { PieChartData } from '~/components/charts/PieChart.vue'

interface Props {
  queryParams: Record<string, any>
}

const props = defineProps<Props>()

// Check if event_id is provided
const hasEventId = computed(() => !!props.queryParams.event_id)

// Fetch consents data (only if event_id is present)
const { data: consentsData, isLoading: consentsLoading, error: consentsError } = useConsents(() => props.queryParams)

// Calculate average completion rate
const averageCompletionRate = computed(() => {
  if (!consentsData.value?.data?.consent_breakdown) return 0
  const consents = consentsData.value.data.consent_breakdown
  if (consents.length === 0) return 0
  
  const totalRate = consents.reduce((sum: number, c: any) => sum + (c.completion_rate ?? 0), 0)
  return totalRate / consents.length
})

// Get distribution data for a specific consent
const getConsentDistribution = (consent: any): PieChartData[] => {
  return [
    { name: 'Given', value: consent.consents_given },
    { name: 'Declined', value: consent.consents_declined },
    { name: 'No Response', value: consentsData.value!.data!.total_attendees - consent.total_responses },
  ]
}
</script>
