<template>
  <div class="bg-white border-2 border-deep-navy/10 rounded-xl overflow-hidden">
    <!-- Proposal Header -->
    <div class="p-5">
      <div class="flex items-start justify-between gap-3 mb-3">
        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-bold text-navy-900">{{ proposal.proposal_title }}</h3>
          <p v-if="proposal.proposal_description" class="text-xs text-navy-500 mt-0.5 line-clamp-2">
            {{ proposal.proposal_description }}
          </p>
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

      <div class="grid grid-cols-2 gap-3 mb-3">
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

      <div class="flex items-center justify-between text-xs text-navy-400 mb-3">
        <span class="flex items-center gap-1">
          <span class="material-symbols-outlined text-sm">person</span>
          {{ proposal.proposed_by_name ?? 'Unknown' }}
        </span>
        <span>{{ formatDate(proposal.created_at) }}</span>
      </div>

      <!-- Actions row -->
      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="expanded = !expanded"
          class="flex items-center gap-1.5 px-3 py-1.5 border border-deep-navy/20 text-deep-navy/70 text-xs font-semibold rounded-lg hover:bg-deep-navy/5 transition-colors"
        >
          <span class="material-symbols-outlined text-sm">{{ expanded ? 'expand_less' : 'expand_more' }}</span>
          {{ expanded ? 'Hide Details' : 'Show Details' }}
        </button>

        <button
          type="button"
          @click="$emit('toggle-flag', sectionKey)"
          :class="activeFlagSection === sectionKey
            ? 'inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg bg-amber-500 text-white'
            : 'inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg border-2 border-deep-navy/20 text-deep-navy/60 hover:border-amber-400 hover:text-amber-600 transition-colors'"
        >
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/>
          </svg>
          {{ activeFlagSection === sectionKey ? 'Cancel' : 'Flag Issue' }}
        </button>

        <span v-if="issuesForSection(sectionKey).length"
          class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white uppercase ml-auto">
          {{ issuesForSection(sectionKey).length }} issue{{ issuesForSection(sectionKey).length !== 1 ? 's' : '' }}
        </span>
      </div>
    </div>

    <!-- Flag input -->
    <div v-if="activeFlagSection === sectionKey" class="px-5 pb-5 pt-3 border-t border-amber-200 bg-amber-50">
      <p class="text-[10px] font-black text-amber-700 uppercase tracking-[0.15em] mb-2">
        Add issue for: {{ proposal.proposal_title }}
      </p>
      <textarea
        :value="flagDraft"
        @input="$emit('update-draft', ($event.target as HTMLTextAreaElement).value)"
        placeholder="Describe the issue…"
        rows="3"
        class="w-full border-2 border-amber-300 rounded-lg px-3 py-2 text-sm text-deep-navy placeholder:text-deep-navy/30 focus:outline-none focus:border-amber-500 resize-none bg-white"
      />
      <div class="flex gap-2 mt-2">
        <button
          type="button"
          @click="$emit('add-issue', sectionKey, `Proposal: ${proposal.proposal_title}`)"
          :disabled="!flagDraft.trim()"
          class="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-black uppercase tracking-wider disabled:opacity-40 transition-colors"
        >
          Add Issue
        </button>
        <button
          type="button"
          @click="$emit('toggle-flag', sectionKey)"
          class="px-4 py-1.5 border-2 border-amber-300 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-black uppercase tracking-wider transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>

    <!-- Issues list -->
    <div v-if="issuesForSection(sectionKey).length" class="px-5 pb-5 space-y-2"
      :class="activeFlagSection === sectionKey ? '' : 'border-t border-deep-navy/10 pt-3'">
      <p class="text-[10px] font-black text-deep-navy/40 uppercase tracking-[0.15em] mb-2">Flagged Issues</p>
      <div v-for="issue in issuesForSection(sectionKey)" :key="issue.id"
        class="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
        <svg class="w-3.5 h-3.5 mt-0.5 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
        </svg>
        <p class="flex-1 text-xs text-deep-navy/80 font-medium">{{ issue.comment }}</p>
        <button type="button" @click="$emit('remove-issue', issue.id)" title="Remove issue"
          class="flex-shrink-0 text-deep-navy/30 hover:text-red-500 transition-colors">
          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Expanded Details: Credits & Debits -->
    <div v-if="expanded" class="border-t border-deep-navy/10">
      <div v-if="isLoadingDetails" class="px-5 py-4 space-y-2">
        <div v-for="i in 3" :key="i" class="h-10 bg-gray-100 rounded-lg animate-pulse" />
      </div>

      <!-- Receipt -->
      <div v-else class="mx-4 mb-5 bg-[#fdfcf8] border border-dashed border-deep-navy/20 rounded-lg font-mono text-[11px] overflow-hidden">
        <!-- Receipt header -->
        <div class="px-4 pt-4 pb-3 text-center border-b border-dashed border-deep-navy/15">
          <p class="text-[9px] uppercase tracking-[0.2em] text-deep-navy/40 font-sans font-black">Budget Proposal</p>
          <p class="text-sm font-bold text-deep-navy mt-0.5 font-sans leading-tight">{{ proposal.proposal_title }}</p>
          <p class="text-[9px] text-deep-navy/40 mt-1 font-sans">{{ formatDate(proposal.created_at) }}</p>
        </div>

        <!-- Outgoing costs section -->
        <div class="px-4 pt-3">
          <p class="text-[9px] uppercase tracking-[0.18em] text-deep-navy/40 font-sans font-black mb-2">Outgoing Costs</p>
          <div v-if="credits.length">
            <div v-for="credit in credits" :key="credit.credit_id" class="flex items-start justify-between gap-2 py-1.5">
              <div class="flex-1 min-w-0">
                <span class="text-deep-navy/80 leading-tight block truncate">{{ credit.description }}</span>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <span class="text-[9px] text-deep-navy/35 uppercase font-sans">{{ formatExpenseType(credit.expense_type) }}</span>
                  <span class="text-[9px] font-sans px-1 rounded capitalize"
                    :class="statusClasses_(credit.verification_status)">
                    {{ credit.verification_status ?? 'pending' }}
                  </span>
                </div>
              </div>
              <span class="font-bold text-red-700 flex-shrink-0 tabular-nums">- {{ credit.amount }}</span>
            </div>
          </div>
          <p v-else class="text-deep-navy/30 text-center py-2 font-sans text-[10px]">No cost entries.</p>
        </div>

        <!-- Dashed divider -->
        <div class="mx-4 my-3 border-t border-dashed border-deep-navy/15" />

        <!-- Estimated income section -->
        <div class="px-4">
          <p class="text-[9px] uppercase tracking-[0.18em] text-deep-navy/40 font-sans font-black mb-2">Estimated Income</p>
          <div v-if="debits.length">
            <div v-for="debit in debits" :key="debit.debit_id" class="flex items-start justify-between gap-2 py-1.5">
              <div class="flex-1 min-w-0">
                <span class="text-deep-navy/80 leading-tight block truncate">
                  {{ debit.description }}<span v-if="debit.quantity && debit.quantity > 1" class="text-deep-navy/40"> ×{{ debit.quantity }}</span>
                </span>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <span class="text-[9px] text-deep-navy/35 uppercase font-sans">{{ formatExpenseType(debit.expense_type) }}</span>
                  <span class="text-[9px] font-sans px-1 rounded capitalize"
                    :class="statusClasses_(debit.verification_status)">
                    {{ debit.verification_status ?? 'pending' }}
                  </span>
                </div>
              </div>
              <span class="font-bold text-green-700 flex-shrink-0 tabular-nums">{{ debit.amount }}</span>
            </div>
          </div>
          <p v-else class="text-deep-navy/30 text-center py-2 font-sans text-[10px]">No income entries.</p>
        </div>

        <!-- Totals footer -->
        <div class="mx-4 mt-3 pt-3 border-t-2 border-double border-deep-navy/20 pb-4 space-y-1.5">
          <div class="flex justify-between items-center">
            <span class="text-[9px] uppercase tracking-[0.15em] text-deep-navy/40 font-sans font-black">Total Outgoing</span>
            <span class="font-bold text-red-700 tabular-nums">{{ proposal.total_credits }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-[9px] uppercase tracking-[0.15em] text-deep-navy/40 font-sans font-black">Est. Income</span>
            <span class="font-bold text-green-700 tabular-nums">{{ proposal.total_debits }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import type { BudgetProposalList } from '~/api/types.gen'
import type { SectionIssue } from '~/composables/useReviewIssues'
import {
  paymentsBudgetProposalsCreditsList,
  paymentsBudgetProposalsDebitsList,
} from '~/api/sdk.gen'
import BudgetHealthBadge from '~/components/events/payments/budget/BudgetHealthBadge.vue'

const props = defineProps<{
  proposal: BudgetProposalList
  sectionIssues: SectionIssue[]
  activeFlagSection: string | null
  flagDraft: string
}>()

const emit = defineEmits<{
  'toggle-flag': [key: string]
  'update-draft': [value: string]
  'add-issue': [sectionKey: string, sectionLabel: string]
  'remove-issue': [id: string]
}>()

const expanded = ref(false)

const sectionKey = computed(() => `proposal-${props.proposal.proposal_id}`)

const issuesForSection = (key: string) =>
  props.sectionIssues.filter(i => i.sectionKey === key)

// Fetch credits and debits when expanded
const { data: creditsData, isLoading: isLoadingCredits } = useQuery({
  queryKey: ['budget-proposal-credits', () => props.proposal.proposal_id] as const,
  queryFn: () => paymentsBudgetProposalsCreditsList({ path: { proposal_id: props.proposal.proposal_id } }),
  enabled: expanded,
})

const { data: debitsData, isLoading: isLoadingDebits } = useQuery({
  queryKey: ['budget-proposal-debits', () => props.proposal.proposal_id] as const,
  queryFn: () => paymentsBudgetProposalsDebitsList({ path: { proposal_id: props.proposal.proposal_id } }),
  enabled: expanded,
})

const isLoadingDetails = computed(() => isLoadingCredits.value || isLoadingDebits.value)
const credits = computed(() => (creditsData.value as any)?.data?.results ?? creditsData.value?.data ?? [])
const debits = computed(() => (debitsData.value as any)?.data?.results ?? debitsData.value?.data ?? [])

const statusClasses = computed(() => {
  const s = props.proposal.verification_status ?? 'pending'
  const map: Record<string, string> = {
    verified: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    rejected: 'bg-red-100 text-red-700',
  }
  return map[s] ?? 'bg-gray-100 text-gray-700'
})

function statusClasses_(status: string | null | undefined): string {
  const map: Record<string, string> = {
    verified: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    rejected: 'bg-red-100 text-red-700',
  }
  return map[status ?? 'pending'] ?? 'bg-gray-100 text-gray-700'
}

function formatExpenseType(type: string | undefined): string {
  if (!type) return ''
  return type.replace(/_/g, ' ')
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}
</script>
