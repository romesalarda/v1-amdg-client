<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <div class="flex items-center gap-2">
        <span class="text-sm text-navy-500">
          {{ total > 0 ? `${total} proposal${total !== 1 ? 's' : ''}` : 'No proposals yet' }}
        </span>
      </div>
      <button
        @click="showCreateModal = true"
        class="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-colors"
      >
        <span class="material-symbols-outlined text-sm">add</span>
        New Proposal
      </button>
    </div>

    <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      <div v-for="i in 3" :key="i" class="h-48 bg-mist-blue/60 rounded-xl animate-pulse" />
    </div>

    <div v-else-if="proposals.length" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      <BudgetProposalCard
        v-for="proposal in proposals"
        :key="proposal.proposal_id"
        :proposal="proposal"
        @view="handleView"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>

    <div v-else class="text-center py-16 text-navy-400">
      <span class="material-symbols-outlined text-5xl block mb-3 opacity-30">receipt_long</span>
      <p class="text-sm font-semibold">No budget proposals yet.</p>
      <p class="text-xs mt-1">Create the first proposal for this event.</p>
    </div>

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

    <CreateBudgetProposalModal
      :open="showCreateModal"
      :event-id="eventId"
      @close="showCreateModal = false"
      @created="() => {}"
    />

    <EditBudgetProposalModal
      :open="showEditModal"
      :proposal="selectedProposal"
      @close="showEditModal = false"
      @updated="() => {}"
    />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import type { BudgetProposalList } from '~/api/types.gen'
import { useBudgetProposals, useDeleteBudgetProposal } from '~/composables/resources/payments/budgetProposals'
import BudgetProposalCard from '../BudgetProposalCard.vue'
import CreateBudgetProposalModal from '../modals/CreateBudgetProposalModal.vue'
import EditBudgetProposalModal from '../modals/EditBudgetProposalModal.vue'

const props = defineProps<{
  eventId: string
}>()

const router = useRouter()
const toast = useToast()

const currentPage = ref(1)
const PAGE_SIZE = 12
const showCreateModal = ref(false)
const showEditModal = ref(false)
const selectedProposal = ref<BudgetProposalList | null>(null)

const queryParams = computed(() => ({
  event_url_safe_title: props.eventId,
  page: currentPage.value,
  page_size: PAGE_SIZE,
}))

const { data, isLoading } = useBudgetProposals(queryParams)
const proposals = computed(() => data.value?.data?.results ?? [])
const total = computed(() => data.value?.data?.count ?? 0)
const totalPages = computed(() => Math.ceil(total.value / PAGE_SIZE))

const deleteMutation = useDeleteBudgetProposal()

function handleView(proposalId: string) {
  router.push(`/events/${props.eventId}/m/payments/budget/${proposalId}`)
}

function handleEdit(proposal: BudgetProposalList) {
  selectedProposal.value = proposal
  showEditModal.value = true
}

async function handleDelete(proposalId: string) {
  const result = await Swal.fire({
    title: 'Delete proposal?',
    text: 'This action cannot be undone.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Delete',
    confirmButtonColor: '#ef4444',
    cancelButtonText: 'Cancel',
  })
  if (!result.isConfirmed) return
  try {
    await deleteMutation.mutateAsync(proposalId)
    toast.add({ title: 'Proposal deleted', color: 'green' })
  } catch {
    toast.add({ title: 'Failed to delete proposal', color: 'red' })
  }
}
</script>
