<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <span class="text-sm text-navy-500">
        {{ total > 0 ? `${total} cost entr${total !== 1 ? 'ies' : 'y'}` : 'No cost entries yet' }}
      </span>
      <button
        @click="showCreateModal = true"
        class="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-colors"
      >
        <span class="material-symbols-outlined text-sm">add</span>
        New Cost Entry
      </button>
    </div>

    <div v-if="isLoading" class="space-y-3">
      <div v-for="i in 4" :key="i" class="h-16 bg-mist-blue/60 rounded-xl animate-pulse" />
    </div>

    <div v-else-if="credits.length" class="space-y-3">
      <div
        v-for="credit in credits"
        :key="credit.credit_id"
        class="flex items-center gap-4 bg-white border border-deep-navy/10 rounded-xl px-4 py-3 hover:shadow-sm transition-shadow"
      >
        <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <span class="material-symbols-outlined text-red-600 text-sm">arrow_downward</span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-sm font-semibold text-navy-900 truncate">{{ credit.description }}</div>
          <div class="flex items-center gap-2 mt-0.5">
            <span class="text-[10px] text-navy-400 uppercase tracking-wide font-semibold">
              {{ formatExpenseType(credit.expense_type) }}
            </span>
            <span
              class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold capitalize"
              :class="statusClasses(credit.verification_status)"
            >
              {{ credit.verification_status ?? 'pending' }}
            </span>
            <span v-if="credit.is_settled" class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700">
              Settled
            </span>
          </div>
        </div>
        <div class="text-right flex-shrink-0">
          <div class="text-sm font-black text-red-700">{{ formatMoney(credit.amount) }}</div>
          <div v-if="credit.paid_date" class="text-[10px] text-navy-400 mt-0.5">{{ formatDate(credit.paid_date) }}</div>
        </div>
        <button
          @click="handleDelete(credit.credit_id)"
          class="p-1.5 text-navy-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
          title="Delete"
        >
          <span class="material-symbols-outlined text-sm">delete</span>
        </button>
      </div>
    </div>

    <div v-else class="text-center py-16 text-navy-400">
      <span class="material-symbols-outlined text-5xl block mb-3 opacity-30">arrow_downward</span>
      <p class="text-sm font-semibold">No cost entries yet.</p>
      <p class="text-xs mt-1">Record outgoing costs for this event.</p>
    </div>

    <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-6">
      <button :disabled="currentPage === 1" @click="currentPage--" class="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50">Previous</button>
      <span class="text-xs text-navy-400">Page {{ currentPage }} of {{ totalPages }}</span>
      <button :disabled="currentPage >= totalPages" @click="currentPage++" class="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50">Next</button>
    </div>

    <CreateCreditExpenseModal
      :open="showCreateModal"
      :event-id="eventId"
      :event-pk="eventPk"
      @close="showCreateModal = false"
      @created="() => {}"
    />
  </div>
</template>

<script setup lang="ts">
import Swal from 'sweetalert2'
import { useCreditExpenses, useDeleteCreditExpense } from '~/composables/resources/payments/creditExpenses'
import CreateCreditExpenseModal from '../modals/CreateCreditExpenseModal.vue'

const props = defineProps<{
  eventId: string
  eventPk: number | null
}>()

const toast = useToast()
const currentPage = ref(1)
const PAGE_SIZE = 15
const showCreateModal = ref(false)

const queryParams = computed(() => ({
  event: props.eventPk ?? undefined,
  page: currentPage.value,
  page_size: PAGE_SIZE,
}))

const { data, isLoading } = useCreditExpenses(queryParams)
const credits = computed(() => data.value?.data?.results ?? [])
const total = computed(() => data.value?.data?.count ?? 0)
const totalPages = computed(() => Math.ceil(total.value / PAGE_SIZE))

const deleteMutation = useDeleteCreditExpense()

const statusColorMap: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  verified: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
  processed: 'bg-green-100 text-green-700',
}

function statusClasses(status: string | undefined) {
  return statusColorMap[status ?? 'pending'] ?? statusColorMap.pending
}

function formatExpenseType(type: string | undefined) {
  return (type ?? 'OTHER').replace(/_/g, ' ')
}

function formatMoney(value: string | undefined) {
  if (!value) return '£0.00'
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(parseFloat(value))
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function handleDelete(creditId: string) {
  const result = await Swal.fire({
    title: 'Delete cost entry?',
    text: 'This action cannot be undone.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Delete',
    confirmButtonColor: '#ef4444',
    cancelButtonText: 'Cancel',
  })
  if (!result.isConfirmed) return
  try {
    await deleteMutation.mutateAsync(creditId)
    toast.add({ title: 'Cost entry deleted', color: 'green' })
  } catch {
    toast.add({ title: 'Failed to delete entry', color: 'red' })
  }
}
</script>
