<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('close')" />
      <div class="relative w-full max-w-lg bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
        <div class="flex items-center gap-2 px-6 py-5 border-b border-navy-50">
          <span class="material-symbols-outlined text-primary">arrow_upward</span>
          <h3 class="text-sm font-black text-primary uppercase tracking-widest flex-1">New Debit Expense (Income)</h3>
          <button
            @click="$emit('close')"
            class="p-1.5 text-navy-400 hover:text-navy-700 hover:bg-mist-blue rounded-lg transition-colors"
          >
            <span class="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        <div class="p-6">
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">
                Description <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.description"
                type="text"
                placeholder="e.g. Ticket sales revenue"
                required
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">
                Expense Type
              </label>
              <select
                v-model="form.expense_type"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
              >
                <option value="DONATION">Donation</option>
                <option value="TICKET_SALES">Ticket Sales</option>
                <option value="MERCHANDISE_SALES">Merchandise Sales</option>
                <option value="SPONSORSHIP">Sponsorship</option>
                <option value="GRANTS">Grants</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">
                  Quantity
                </label>
                <input
                  v-model.number="form.quantity"
                  type="number"
                  min="1"
                  placeholder="1"
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">
                  Unit Price <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.unit_price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  required
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div class="bg-green-50 rounded-lg px-3 py-2 text-xs text-green-700 font-semibold">
              Total amount: {{ computedTotal }}
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Paid Date</label>
              <input
                v-model="form.paid_date"
                type="date"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="form.is_settled" type="checkbox" class="rounded text-primary" />
              <span class="text-sm font-semibold text-gray-700">Mark as settled</span>
            </label>

            <div class="flex gap-2 pt-2">
              <button
                type="button"
                @click="$emit('close')"
                class="flex-1 px-4 py-2 text-sm font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="!isFormValid || isSubmitting"
                class="flex-1 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <span v-if="isSubmitting" class="material-symbols-outlined animate-spin text-base">progress_activity</span>
                <span v-else>Create Income Entry</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useCreateDebitExpense } from '~/composables/resources/payments/debitExpenses'

const props = defineProps<{
  open: boolean
  eventId: string
}>()

const emit = defineEmits<{
  close: []
  created: []
}>()

const toast = useToast()
const isSubmitting = ref(false)

const form = reactive({
  description: '',
  expense_type: 'OTHER' as 'DONATION' | 'TICKET_SALES' | 'MERCHANDISE_SALES' | 'SPONSORSHIP' | 'GRANTS' | 'OTHER',
  quantity: 1,
  unit_price: '',
  paid_date: '',
  is_settled: false,
})

const isFormValid = computed(
  () => form.description.trim().length > 0 && form.unit_price !== '' && parseFloat(form.unit_price) >= 0
)

const computedTotal = computed(() => {
  const qty = form.quantity || 1
  const price = parseFloat(form.unit_price) || 0
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(qty * price)
})

const createMutation = useCreateDebitExpense()

function resetForm() {
  form.description = ''
  form.expense_type = 'OTHER'
  form.quantity = 1
  form.unit_price = ''
  form.paid_date = ''
  form.is_settled = false
}

async function handleSubmit() {
  if (!isFormValid.value) return
  isSubmitting.value = true
  try {
    await createMutation.mutateAsync({
      event: props.eventId,
      description: form.description.trim(),
      expense_type: form.expense_type,
      quantity: form.quantity || 1,
      unit_price: form.unit_price,
      paid_date: form.paid_date || null,
      is_settled: form.is_settled,
    })
    toast.add({ title: 'Income entry created', color: 'green' })
    resetForm()
    emit('created')
    emit('close')
  } catch {
    toast.add({ title: 'Failed to create income entry', color: 'red' })
  } finally {
    isSubmitting.value = false
  }
}
</script>
