<template>
  <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
    <div class="px-6 py-4 border-b border-navy-50 flex items-center gap-2">
      <span class="material-symbols-outlined text-primary text-xl">analytics</span>
      <h3 class="text-[11px] font-black text-primary uppercase tracking-widest flex-1">Event Budget Overview</h3>
      <BudgetHealthBadge v-if="stats" :health-status="stats.health_status" />
    </div>

    <div class="p-6">
      <div v-if="isLoading" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div v-for="i in 6" :key="i" class="h-16 bg-mist-blue/60 rounded-xl animate-pulse" />
      </div>

      <div v-else-if="stats" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div class="text-center p-3 bg-mist-blue/40 rounded-xl">
          <div class="text-lg font-black text-navy-900 truncate">{{ formatMoney(stats.total_estimated_inbound, stats.currency) }}</div>
          <div class="text-[10px] text-navy-400 uppercase tracking-wide font-semibold mt-0.5">Est. Inbound</div>
        </div>
        <div class="text-center p-3 bg-green-50 rounded-xl">
          <div class="text-lg font-black text-green-800 truncate">{{ formatMoney(stats.total_real_inbound, stats.currency) }}</div>
          <div class="text-[10px] text-navy-400 uppercase tracking-wide font-semibold mt-0.5">Real Inbound</div>
        </div>
        <div class="text-center p-3 bg-red-50 rounded-xl">
          <div class="text-lg font-black text-red-800 truncate">{{ formatMoney(stats.total_outgoing, stats.currency) }}</div>
          <div class="text-[10px] text-navy-400 uppercase tracking-wide font-semibold mt-0.5">Total Outgoing</div>
        </div>
        <div class="text-center p-3 bg-mist-blue/40 rounded-xl">
          <div class="text-lg font-black text-navy-900 truncate">{{ formatMoney(stats.net_estimated, stats.currency) }}</div>
          <div class="text-[10px] text-navy-400 uppercase tracking-wide font-semibold mt-0.5">Net Estimated</div>
        </div>
        <div
          class="text-center p-3 rounded-xl"
          :class="netRealIsPositive ? 'bg-green-50' : netRealIsNegative ? 'bg-red-50' : 'bg-mist-blue/40'"
        >
          <div
            class="text-lg font-black truncate"
            :class="netRealIsPositive ? 'text-green-800' : netRealIsNegative ? 'text-red-800' : 'text-navy-900'"
          >
            {{ formatMoney(stats.net_real, stats.currency) }}
          </div>
          <div class="text-[10px] text-navy-400 uppercase tracking-wide font-semibold mt-0.5">Net Real</div>
        </div>
        <div class="text-center p-3 bg-mist-blue/40 rounded-xl">
          <div class="text-lg font-black text-navy-900 truncate">{{ stats.proposal_count }}</div>
          <div class="text-[10px] text-navy-400 uppercase tracking-wide font-semibold mt-0.5">Proposals</div>
        </div>
      </div>

      <div v-else class="text-center py-6 text-navy-400 text-sm">
        No budget data available for this event yet.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEventBudgetStatistics } from '~/composables/resources/payments/budgetProposals'
import BudgetHealthBadge from './BudgetHealthBadge.vue'

const props = defineProps<{
  eventId: string
}>()

const params = computed(() => ({ event_id: props.eventId }))
const { data, isLoading } = useEventBudgetStatistics(params)
const stats = computed(() => data.value?.data ?? null)

const netRealValue = computed(() => parseFloat(stats.value?.net_real ?? '0'))
const netRealIsPositive = computed(() => netRealValue.value > 0)
const netRealIsNegative = computed(() => netRealValue.value < 0)

function formatMoney(value: string | undefined, currency: string | undefined): string {
  if (!value) return '—'
  const num = parseFloat(value)
  if (isNaN(num)) return '—'
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency ?? 'GBP',
    minimumFractionDigits: 2,
  }).format(num)
}
</script>
