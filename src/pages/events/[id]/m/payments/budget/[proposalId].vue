<template>
  <EventManagementLayout :event-id="eventId" :event="event?.data">
    <div class="space-y-6">
      <!-- Back link -->
      <div>
        <NuxtLink
          :to="`/events/${eventId}/m/payments/budget`"
          class="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-400 hover:text-primary transition-colors"
        >
          <span class="material-symbols-outlined text-sm">arrow_back</span>
          Back to Budget
        </NuxtLink>
      </div>

      <!-- Loading state -->
      <div v-if="proposalLoading" class="space-y-4">
        <div class="h-32 bg-mist-blue/60 rounded-2xl animate-pulse" />
        <div class="h-48 bg-mist-blue/60 rounded-2xl animate-pulse" />
      </div>

      <template v-else-if="proposal">
        <!-- Proposal header -->
        <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn p-6">
          <div class="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 class="text-lg font-black text-navy-900">{{ proposal.proposal_title }}</h1>
              <p class="text-sm text-navy-500 mt-1">{{ proposal.proposal_description }}</p>
            </div>
            <div class="flex flex-col items-end gap-2 flex-shrink-0">
              <BudgetHealthBadge :health-status="proposal.health_status" />
              <span
                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize"
                :class="statusClasses"
              >
                {{ proposal.verification_status ?? 'pending' }}
              </span>
            </div>
          </div>
          <div class="flex items-center gap-4 text-xs text-navy-400">
            <span class="flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">person</span>
              {{ proposal.proposed_by_name ?? 'Unknown' }}
            </span>
            <span class="flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">schedule</span>
              {{ formatDate(proposal.created_at) }}
            </span>
          </div>
          <div class="flex gap-2 mt-5">
            <button
              @click="showEditModal = true"
              class="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border border-deep-navy/20 text-navy-700 hover:bg-mist-blue transition-colors"
            >
              <span class="material-symbols-outlined text-sm">edit</span>
              Edit Proposal
            </button>
            <button
              @click="handleDelete"
              class="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
            >
              <span class="material-symbols-outlined text-sm">delete</span>
              Delete
            </button>
          </div>
        </div>

        <!-- Statistics -->
        <div v-if="statistics" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <div class="bg-white border border-deep-navy/10 rounded-xl p-4 text-center">
            <div class="text-xl font-black text-red-700">{{ formatMoney(statistics.total_outgoing, statistics.total_outgoing_currency) }}</div>
            <div class="text-[10px] text-navy-400 uppercase tracking-wide font-semibold mt-1">Total Costs ({{ statistics.credit_count }})</div>
          </div>
          <div class="bg-white border border-deep-navy/10 rounded-xl p-4 text-center">
            <div class="text-xl font-black text-mist-blue">{{ formatMoney(statistics.estimated_inbound, statistics.estimated_inbound_currency) }}</div>
            <div class="text-[10px] text-navy-400 uppercase tracking-wide font-semibold mt-1">Est. Income ({{ statistics.debit_count }})</div>
          </div>
          <div class="bg-white border border-deep-navy/10 rounded-xl p-4 text-center">
            <div class="text-xl font-black text-green-700">{{ formatMoney(statistics.real_inbound, statistics.real_inbound_currency) }}</div>
            <div class="text-[10px] text-navy-400 uppercase tracking-wide font-semibold mt-1">Real Income</div>
          </div>
          <div
            class="border rounded-xl p-4 text-center"
            :class="netRealPositive ? 'bg-green-50 border-green-200' : netRealNegative ? 'bg-red-50 border-red-200' : 'bg-white border-deep-navy/10'"
          >
            <div
              class="text-xl font-black"
              :class="netRealPositive ? 'text-green-800' : netRealNegative ? 'text-red-800' : 'text-navy-900'"
            >
              {{ formatMoney(statistics.net_real, statistics.real_inbound_currency) }}
            </div>
            <div class="text-[10px] text-navy-400 uppercase tracking-wide font-semibold mt-1">Net Real</div>
          </div>
        </div>

        <!-- Linked costs & income -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Credits (Costs) -->
          <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
            <div class="flex items-center gap-2 px-5 py-4 border-b border-navy-50">
              <span class="material-symbols-outlined text-red-500 text-lg">arrow_downward</span>
              <h2 class="text-[11px] font-black text-primary uppercase tracking-widest flex-1">Costs Linked</h2>
              <button
                @click="showAddCreditModal = true"
                class="flex items-center gap-1 text-xs font-bold text-primary hover:bg-mist-blue px-2 py-1 rounded-lg transition-colors"
              >
                <span class="material-symbols-outlined text-sm">add</span>
                Link
              </button>
            </div>
            <div class="p-4 space-y-2">
              <div v-if="creditsLoading" class="space-y-2">
                <div v-for="i in 2" :key="i" class="h-10 bg-mist-blue/60 rounded-lg animate-pulse" />
              </div>
              <div
                v-else-if="linkedCredits.length"
                v-for="credit in linkedCredits"
                :key="credit.credit_id"
                class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50"
              >
                <div class="flex-1 min-w-0">
                  <div class="text-xs font-semibold text-navy-900 truncate">{{ credit.description }}</div>
                  <div class="text-[10px] text-navy-400">{{ formatExpenseType(credit.expense_type) }}</div>
                </div>
                <div class="text-xs font-black text-red-700 flex-shrink-0">{{ formatMoney(credit.amount) }}</div>
                <button
                  @click="handleRemoveCredit(credit.credit_id)"
                  class="p-1 text-navy-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                >
                  <span class="material-symbols-outlined text-sm">link_off</span>
                </button>
              </div>
              <div v-else class="text-center py-6 text-navy-400 text-xs">No costs linked yet.</div>
            </div>
          </div>

          <!-- Debits (Income) -->
          <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
            <div class="flex items-center gap-2 px-5 py-4 border-b border-navy-50">
              <span class="material-symbols-outlined text-green-500 text-lg">arrow_upward</span>
              <h2 class="text-[11px] font-black text-primary uppercase tracking-widest flex-1">Income Linked</h2>
              <button
                @click="showAddDebitModal = true"
                class="flex items-center gap-1 text-xs font-bold text-primary hover:bg-mist-blue px-2 py-1 rounded-lg transition-colors"
              >
                <span class="material-symbols-outlined text-sm">add</span>
                Link
              </button>
            </div>
            <div class="p-4 space-y-2">
              <div v-if="debitsLoading" class="space-y-2">
                <div v-for="i in 2" :key="i" class="h-10 bg-mist-blue/60 rounded-lg animate-pulse" />
              </div>
              <div
                v-else-if="linkedDebits.length"
                v-for="debit in linkedDebits"
                :key="debit.debit_id"
                class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50"
              >
                <div class="flex-1 min-w-0">
                  <div class="text-xs font-semibold text-navy-900 truncate">{{ debit.description }}</div>
                  <div class="text-[10px] text-navy-400">{{ formatExpenseType(debit.expense_type) }}</div>
                </div>
                <div class="text-xs font-black text-green-700 flex-shrink-0">{{ formatMoney(debit.amount) }}</div>
                <button
                  @click="handleRemoveDebit(debit.debit_id)"
                  class="p-1 text-navy-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                >
                  <span class="material-symbols-outlined text-sm">link_off</span>
                </button>
              </div>
              <div v-else class="text-center py-6 text-navy-400 text-xs">No income entries linked yet.</div>
            </div>
          </div>
        </div>
      </template>

      <div v-else class="text-center py-20 text-navy-400">
        <span class="material-symbols-outlined text-5xl block mb-3 opacity-30">receipt_long</span>
        <p class="text-sm font-semibold">Proposal not found.</p>
      </div>

      <EditBudgetProposalModal
        :open="showEditModal"
        :proposal="proposal ?? null"
        @close="showEditModal = false"
        @updated="() => {}"
      />

      <Teleport to="body">
        <div v-if="showAddCreditModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showAddCreditModal = false" />
          <div class="relative w-full max-w-md bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
            <div class="flex items-center gap-2 px-6 py-5 border-b border-navy-50">
              <span class="material-symbols-outlined text-primary">link</span>
              <h3 class="text-sm font-black text-primary uppercase tracking-widest flex-1">Link Cost Entry</h3>
              <button @click="showAddCreditModal = false" class="p-1.5 text-navy-400 hover:text-navy-700 hover:bg-mist-blue rounded-lg transition-colors">
                <span class="material-symbols-outlined text-base">close</span>
              </button>
            </div>
            <div class="p-6 space-y-4">
              <div v-if="allCreditsLoading" class="h-10 bg-mist-blue/60 rounded-lg animate-pulse" />
              <template v-else>
                <select
                  v-model="selectedCreditId"
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                >
                  <option value="">Select a cost entry</option>
                  <option v-for="credit in availableCredits" :key="credit.credit_id" :value="credit.credit_id">
                    {{ credit.description }} - {{ formatMoney(credit.amount) }}
                  </option>
                </select>
                <p v-if="!availableCredits.length" class="text-xs text-navy-400">No available cost entries to link.</p>
              </template>
              <div class="flex gap-2 pt-2">
                <button @click="showAddCreditModal = false" class="flex-1 px-4 py-2 text-sm font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">Cancel</button>
                <button
                  @click="handleLinkCredit"
                  :disabled="!selectedCreditId || addCreditMutation.isPending.value"
                  class="flex-1 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </Teleport>

      <Teleport to="body">
        <div v-if="showAddDebitModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showAddDebitModal = false" />
          <div class="relative w-full max-w-md bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
            <div class="flex items-center gap-2 px-6 py-5 border-b border-navy-50">
              <span class="material-symbols-outlined text-primary">link</span>
              <h3 class="text-sm font-black text-primary uppercase tracking-widest flex-1">Link Income Entry</h3>
              <button @click="showAddDebitModal = false" class="p-1.5 text-navy-400 hover:text-navy-700 hover:bg-mist-blue rounded-lg transition-colors">
                <span class="material-symbols-outlined text-base">close</span>
              </button>
            </div>
            <div class="p-6 space-y-4">
              <div v-if="allDebitsLoading" class="h-10 bg-mist-blue/60 rounded-lg animate-pulse" />
              <template v-else>
                <select
                  v-model="selectedDebitId"
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                >
                  <option value="">Select an income entry</option>
                  <option v-for="debit in availableDebits" :key="debit.debit_id" :value="debit.debit_id">
                    {{ debit.description }} - {{ formatMoney(debit.amount) }}
                  </option>
                </select>
                <p v-if="!availableDebits.length" class="text-xs text-navy-400">No available income entries to link.</p>
              </template>
              <div class="flex gap-2 pt-2">
                <button @click="showAddDebitModal = false" class="flex-1 px-4 py-2 text-sm font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">Cancel</button>
                <button
                  @click="handleLinkDebit"
                  :disabled="!selectedDebitId || addDebitMutation.isPending.value"
                  class="flex-1 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </EventManagementLayout>
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { paymentsBudgetProposalsCreditsList, paymentsBudgetProposalsDebitsList } from '~/api/sdk.gen'
import EventManagementLayout from '~/components/events/EventManagementLayout.vue'
import BudgetHealthBadge from '~/components/events/payments/budget/BudgetHealthBadge.vue'
import EditBudgetProposalModal from '~/components/events/payments/budget/modals/EditBudgetProposalModal.vue'
import { useEvent } from '~/composables/resources/events/events'
import {
  useAddCreditToProposal,
  useAddDebitToProposal,
  useBudgetProposal,
  useBudgetProposalStatistics,
  useDeleteBudgetProposal,
  useRemoveCreditFromProposal,
  useRemoveDebitFromProposal,
} from '~/composables/resources/payments/budgetProposals'
import { useCreditExpenses } from '~/composables/resources/payments/creditExpenses'
import { useDebitExpenses } from '~/composables/resources/payments/debitExpenses'

definePageMeta({
  layout: false,
  middleware: ['auth', 'event-permission'],
  eventPermission: {
    category: 'PAYMENT_MANAGEMENT',
    action: 'read',
    deniedRedirect: '/403',
  },
})

const route = useRoute()
const router = useRouter()
const toast = useToast()

const eventId = computed(() => String(route.params.id ?? ''))
const proposalId = computed(() => String(route.params.proposalId ?? ''))
const eventPk = computed(() => event.value?.data?.id ?? null)

const { data: event } = useEvent(eventId)
const { data: proposalData, isLoading: proposalLoading, refetch: refetchProposal } = useBudgetProposal(proposalId)
const { data: statisticsData } = useBudgetProposalStatistics(proposalId)
const proposal = computed(() => proposalData.value?.data ?? null)
const statistics = computed(() => statisticsData.value?.data ?? null)
const canLoadLinkedEntries = computed(() => !!proposal.value?.proposal_id)

const showEditModal = ref(false)
const showAddCreditModal = ref(false)
const showAddDebitModal = ref(false)

// Linked credits & debits — use the proposal's credits/debits endpoints
const { data: creditsData, isLoading: creditsLoading, refetch: refetchLinkedCredits } = useQuery({
  queryKey: computed(() => ['budget-proposals', 'linked-credits', proposalId.value]),
  queryFn: () => paymentsBudgetProposalsCreditsList({ path: { proposal_id: proposalId.value } }),
  enabled: canLoadLinkedEntries,
  retry: 1,
  suspense: false,
})
const { data: debitsData, isLoading: debitsLoading, refetch: refetchLinkedDebits } = useQuery({
  queryKey: computed(() => ['budget-proposals', 'linked-debits', proposalId.value]),
  queryFn: () => paymentsBudgetProposalsDebitsList({ path: { proposal_id: proposalId.value } }),
  enabled: canLoadLinkedEntries,
  retry: 1,
  suspense: false,
})
const linkedCredits = computed(() => (creditsData.value?.data?.results) ?? [])
const linkedDebits = computed(() => (debitsData.value?.data?.results) ?? [])

const creditQueryParams = computed(() => ({
  event: eventPk.value ?? undefined,
  page_size: 100,
}))
const debitQueryParams = computed(() => ({
  event: eventPk.value ?? undefined,
  page_size: 100,
}))
const { data: allCreditsData, isLoading: allCreditsLoading } = useCreditExpenses(creditQueryParams)
const { data: allDebitsData, isLoading: allDebitsLoading } = useDebitExpenses(debitQueryParams)

const linkedCreditIds = computed(() => new Set(linkedCredits.value.map((credit: any) => credit.credit_id)))
const linkedDebitIds = computed(() => new Set(linkedDebits.value.map((debit: any) => debit.debit_id)))

const availableCredits = computed(() => {
  const credits = allCreditsData.value?.data?.results ?? []
  return credits.filter((credit: any) => !linkedCreditIds.value.has(credit.credit_id))
})

const availableDebits = computed(() => {
  const debits = allDebitsData.value?.data?.results ?? []
  return debits.filter((debit: any) => !linkedDebitIds.value.has(debit.debit_id))
})

const selectedCreditId = ref('')
const selectedDebitId = ref('')

const deleteMutation = useDeleteBudgetProposal()
const addCreditMutation = useAddCreditToProposal()
const addDebitMutation = useAddDebitToProposal()
const removeCreditMutation = useRemoveCreditFromProposal()
const removeDebitMutation = useRemoveDebitFromProposal()

const statusColorMap: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  verified: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
  processed: 'bg-green-100 text-green-700',
}
const statusClasses = computed(
  () => statusColorMap[proposal.value?.verification_status ?? 'pending'] ?? statusColorMap.pending
)

const netRealValue = computed(() => parseFloat(statistics.value?.net_real ?? '0'))
const netRealPositive = computed(() => netRealValue.value > 0)
const netRealNegative = computed(() => netRealValue.value < 0)

function formatMoney(value: string | undefined, currency = 'GBP'): string {
  if (!value) return '£0.00'
  const num = parseFloat(value)
  if (isNaN(num)) return '£0.00'
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency, minimumFractionDigits: 2 }).format(num)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatExpenseType(type: string | undefined) {
  return (type ?? 'OTHER').replace(/_/g, ' ')
}

async function handleDelete() {
  const result = await Swal.fire({
    title: 'Delete this proposal?',
    text: 'This action cannot be undone.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Delete',
    confirmButtonColor: '#ef4444',
    cancelButtonText: 'Cancel',
  })
  if (!result.isConfirmed) return
  try {
    await deleteMutation.mutateAsync(proposalId.value)
    toast.add({ title: 'Proposal deleted', color: 'green' })
    router.push(`/events/${eventId.value}/m/payments/budget`)
  } catch {
    toast.add({ title: 'Failed to delete proposal', color: 'red' })
  }
}

async function handleRemoveCredit(creditId: string) {
  try {
    await removeCreditMutation.mutateAsync({ proposalId: proposalId.value, creditId })
    toast.add({ title: 'Cost entry unlinked', color: 'green' })
  } catch {
    toast.add({ title: 'Failed to unlink entry', color: 'red' })
  }
}

async function handleRemoveDebit(debitId: string) {
  try {
    await removeDebitMutation.mutateAsync({ proposalId: proposalId.value, debitId })
    toast.add({ title: 'Income entry unlinked', color: 'green' })
  } catch {
    toast.add({ title: 'Failed to unlink entry', color: 'red' })
  }
}

async function handleLinkCredit() {
  if (!selectedCreditId.value) return
  try {
    await addCreditMutation.mutateAsync({
      proposalId: proposalId.value,
      creditId: selectedCreditId.value,
    })
    toast.add({ title: 'Cost entry linked', color: 'green' })
    showAddCreditModal.value = false
    selectedCreditId.value = ''
    await Promise.all([refetchLinkedCredits(), refetchProposal()])
  } catch {
    toast.add({ title: 'Failed to link cost entry', color: 'red' })
  }
}

async function handleLinkDebit() {
  if (!selectedDebitId.value) return
  try {
    await addDebitMutation.mutateAsync({
      proposalId: proposalId.value,
      debitId: selectedDebitId.value,
    })
    toast.add({ title: 'Income entry linked', color: 'green' })
    showAddDebitModal.value = false
    selectedDebitId.value = ''
    await Promise.all([refetchLinkedDebits(), refetchProposal()])
  } catch {
    toast.add({ title: 'Failed to link income entry', color: 'red' })
  }
}
</script>
