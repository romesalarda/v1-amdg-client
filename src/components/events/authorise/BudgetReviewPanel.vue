<template>
  <div class="space-y-6">
    <!-- Overview section with flag button -->
    <div class="bg-white border-2 border-deep-navy/10 rounded-xl overflow-hidden">
      <div class="px-6 py-4 border-b border-deep-navy/10 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <h2 class="text-sm font-black text-deep-navy/70 uppercase tracking-[0.15em]">Budget Overview</h2>
          <span v-if="issuesForSection('budget-overview').length"
            class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white uppercase">
            {{ issuesForSection('budget-overview').length }} issue{{ issuesForSection('budget-overview').length !== 1 ? 's' : '' }}
          </span>
        </div>
        <button
          type="button"
          @click="$emit('toggle-flag', 'budget-overview')"
          :class="activeFlagSection === 'budget-overview'
            ? 'inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg bg-amber-500 text-white'
            : 'inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg border-2 border-deep-navy/20 text-deep-navy/60 hover:border-amber-400 hover:text-amber-600 transition-colors'"
        >
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/>
          </svg>
          {{ activeFlagSection === 'budget-overview' ? 'Cancel' : 'Flag Issue' }}
        </button>
      </div>

      <div class="p-6">
        <EventBudgetStatisticsPanel :event-id="eventId" />
      </div>

      <!-- Flag form for overview -->
      <div v-if="activeFlagSection === 'budget-overview'" class="px-6 pb-5 pt-3 border-t border-amber-200 bg-amber-50">
        <p class="text-[10px] font-black text-amber-700 uppercase tracking-[0.15em] mb-2">Add issue for: Budget Overview</p>
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
            @click="$emit('add-issue', 'budget-overview', 'Budget Overview')"
            :disabled="!flagDraft.trim()"
            class="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-black uppercase tracking-wider disabled:opacity-40 transition-colors"
          >
            Add Issue
          </button>
          <button
            type="button"
            @click="$emit('toggle-flag', 'budget-overview')"
            class="px-4 py-1.5 border-2 border-amber-300 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-black uppercase tracking-wider transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      <!-- Issues list -->
      <div v-if="issuesForSection('budget-overview').length" class="px-6 pb-5 space-y-2">
        <p class="text-[10px] font-black text-deep-navy/40 uppercase tracking-[0.15em] mb-2">Flagged Issues</p>
        <div
          v-for="issue in issuesForSection('budget-overview')"
          :key="issue.id"
          class="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2"
        >
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
    </div>

    <!-- Proposals section -->
    <div class="bg-white border-2 border-deep-navy/10 rounded-xl overflow-hidden">
      <div class="px-6 py-4 border-b border-deep-navy/10">
        <h2 class="text-sm font-black text-deep-navy/70 uppercase tracking-[0.15em]">Budget Proposals</h2>
        <p class="text-xs text-deep-navy/40 mt-1">Review each proposal and flag any concerns before authorising.</p>
      </div>

      <div class="p-6">
        <div v-if="isLoading" class="space-y-4">
          <div v-for="i in 3" :key="i" class="h-32 bg-gray-100 rounded-xl animate-pulse" />
        </div>

        <div v-else-if="proposals.length" class="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <ProposalReviewCard
            v-for="proposal in proposals"
            :key="proposal.proposal_id"
            :proposal="proposal"
            :section-issues="sectionIssues"
            :active-flag-section="activeFlagSection"
            :flag-draft="flagDraft"
            @toggle-flag="(key) => $emit('toggle-flag', key)"
            @update-draft="(val) => $emit('update-draft', val)"
            @add-issue="(key, label) => $emit('add-issue', key, label)"
            @remove-issue="(id) => $emit('remove-issue', id)"
          />
        </div>

        <div v-else class="text-center py-12 text-navy-400">
          <span class="material-symbols-outlined text-5xl block mb-3 opacity-30">receipt_long</span>
          <p class="text-sm font-semibold">No budget proposals for this event.</p>
          <p class="text-xs mt-1">The organiser has not submitted any proposals yet.</p>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-6">
          <button
            :disabled="currentPage === 1"
            @click="currentPage--"
            class="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50"
          >
            Previous
          </button>
          <span class="text-xs text-navy-400">Page {{ currentPage }} of {{ totalPages }}</span>
          <button
            :disabled="currentPage >= totalPages"
            @click="currentPage++"
            class="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SectionIssue } from '~/composables/useReviewIssues'
import { useBudgetProposals } from '~/composables/resources/payments/budgetProposals'
import EventBudgetStatisticsPanel from '~/components/events/payments/budget/EventBudgetStatisticsPanel.vue'
import ProposalReviewCard from './ProposalReviewCard.vue'

const props = defineProps<{
  eventId: string
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

const PAGE_SIZE = 10
const currentPage = ref(1)

const queryParams = computed(() => ({
  event_url_safe_title: props.eventId,
  page: currentPage.value,
  page_size: PAGE_SIZE,
}))

const { data: proposalsData, isLoading } = useBudgetProposals(queryParams)

const proposals = computed(() => proposalsData.value?.data?.results ?? [])
const total = computed(() => proposalsData.value?.data?.count ?? 0)
const totalPages = computed(() => Math.ceil(total.value / PAGE_SIZE))

const issuesForSection = (key: string) =>
  props.sectionIssues.filter(i => i.sectionKey === key)
</script>
