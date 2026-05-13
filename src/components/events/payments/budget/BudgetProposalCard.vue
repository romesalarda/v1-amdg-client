<template>
  <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
    <div class="p-5">
      <div class="flex items-start justify-between gap-3 mb-3">
        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-bold text-navy-900 truncate">{{ proposal.proposal_title }}</h3>
          <p class="text-xs text-navy-500 mt-0.5 line-clamp-2">{{ proposal.proposal_description }}</p>
        </div>
        <div class="flex flex-col items-end gap-1.5 flex-shrink-0">
          <BudgetHealthBadge :health-status="proposal.health_status" />
          <span
            class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize"
            :class="statusClasses"
          >
            {{ proposal.verification_status ?? 'pending' }}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 mb-4">
        <div class="bg-red-50 rounded-lg p-2.5 text-center">
          <div class="text-base font-black text-red-800">{{ proposal.total_credits }}</div>
          <div class="text-[10px] text-navy-400 uppercase tracking-wide font-semibold mt-0.5">
            Outgoing ({{ proposal.credit_count }})
          </div>
        </div>
        <div class="bg-green-50 rounded-lg p-2.5 text-center">
          <div class="text-base font-black text-green-800">{{ proposal.total_debits }}</div>
          <div class="text-[10px] text-navy-400 uppercase tracking-wide font-semibold mt-0.5">
            Est. Inbound ({{ proposal.debit_count }})
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between text-xs text-navy-400 mb-4">
        <span class="flex items-center gap-1">
          <span class="material-symbols-outlined text-sm">person</span>
          {{ proposal.proposed_by_name ?? 'Unknown' }}
        </span>
        <span>{{ formatDate(proposal.created_at) }}</span>
      </div>

      <div class="flex gap-2">
        <button
          @click="$emit('view', proposal.proposal_id)"
          class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors"
        >
          <span class="material-symbols-outlined text-sm">open_in_new</span>
          View
        </button>
        <button
          @click="$emit('edit', proposal)"
          class="p-2 text-navy-400 hover:text-navy-700 hover:bg-mist-blue rounded-lg transition-colors"
          title="Edit"
        >
          <span class="material-symbols-outlined text-base">edit</span>
        </button>
        <button
          @click="$emit('delete', proposal.proposal_id)"
          class="p-2 text-navy-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete"
        >
          <span class="material-symbols-outlined text-base">delete</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BudgetProposalList } from '~/api/types.gen'
import BudgetHealthBadge from './BudgetHealthBadge.vue'

const props = defineProps<{
  proposal: BudgetProposalList
}>()

defineEmits<{
  view: [proposalId: string]
  edit: [proposal: BudgetProposalList]
  delete: [proposalId: string]
}>()

const statusColorMap: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  verified: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
  processed: 'bg-green-100 text-green-700',
}

const statusClasses = computed(
  () => statusColorMap[props.proposal.verification_status ?? 'pending'] ?? statusColorMap.pending
)

function formatMoney(value: string | undefined): string {
  if (!value) return '£0.00'
  const num = parseFloat(value)
  if (isNaN(num)) return '£0.00'
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
  }).format(num)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
</script>
