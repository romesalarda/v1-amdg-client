<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('close')" />
      <div class="relative w-full max-w-lg bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
        <div class="flex items-center gap-2 px-6 py-5 border-b border-navy-50">
          <span class="material-symbols-outlined text-primary">arrow_downward</span>
          <h3 class="text-sm font-black text-primary uppercase tracking-widest flex-1">New Credit Expense (Cost)</h3>
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
                placeholder="e.g. Venue booking deposit"
                required
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Expense Type</label>
              <select
                v-model="form.expense_type"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
              >
                <option value="VENUE_COST">Venue Cost</option>
                <option value="FOOD_COST">Food Cost</option>
                <option value="CLERGY_COST">Clergy Cost</option>
                <option value="CONSECRATED_RELIGIOUS_COST">Consecrated Religious Cost</option>
                <option value="LOGISTICS_COST">Logistics Cost</option>
                <option value="TRANSPORT_COST">Transport Cost</option>
                <option value="STAFF_COST">Staff Cost</option>
                <option value="CREATIVES_COST">Creatives Cost</option>
                <option value="TECHNICAL_COST">Technical Cost</option>
                <option value="STIPEND">Stipend</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">
                Amount <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                required
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
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
                <span v-else>Create Cost Entry</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useCreateCreditExpense } from '~/composables/resources/payments/creditExpenses'

const props = defineProps<{
  open: boolean
  eventId: string
  eventPk: number | null
}>()

const emit = defineEmits<{
  close: []
  created: []
}>()

const toast = useToast()
const isSubmitting = ref(false)

const form = reactive({
  description: '',
  expense_type: 'OTHER' as 'VENUE_COST' | 'FOOD_COST' | 'CLERGY_COST' | 'CONSECRATED_RELIGIOUS_COST' | 'LOGISTICS_COST' | 'TRANSPORT_COST' | 'STAFF_COST' | 'CREATIVES_COST' | 'TECHNICAL_COST' | 'STIPEND' | 'OTHER',
  amount: '',
  paid_date: '',
  is_settled: false,
})

const isFormValid = computed(
  () => form.description.trim().length > 0 && form.amount !== '' && parseFloat(form.amount) >= 0
)

const createMutation = useCreateCreditExpense()

function resetForm() {
  form.description = ''
  form.expense_type = 'OTHER'
  form.amount = ''
  form.paid_date = ''
  form.is_settled = false
}

async function handleSubmit() {
  if (!isFormValid.value) return
  isSubmitting.value = true
  try {
    await createMutation.mutateAsync({
      event: props.eventPk,
      description: form.description.trim(),
      expense_type: form.expense_type,
      amount: form.amount,
      paid_date: form.paid_date || null,
      is_settled: form.is_settled,
    })
    toast.add({ title: 'Cost entry created', color: 'green' })
    resetForm()
    emit('created')
    emit('close')
  } catch {
    toast.add({ title: 'Failed to create cost entry', color: 'red' })
  } finally {
    isSubmitting.value = false
  }
}
</script>
