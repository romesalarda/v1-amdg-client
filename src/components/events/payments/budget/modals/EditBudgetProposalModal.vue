<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('close')" />
      <div class="relative w-full max-w-lg bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
        <div class="flex items-center gap-2 px-6 py-5 border-b border-navy-50">
          <span class="material-symbols-outlined text-primary">edit</span>
          <h3 class="text-sm font-black text-primary uppercase tracking-widest flex-1">Edit Budget Proposal</h3>
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
                Title <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.proposal_title"
                type="text"
                placeholder="e.g. Annual Conference 2026 Budget"
                required
                maxlength="255"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">
                Description <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="form.proposal_description"
                rows="3"
                placeholder="Describe the purpose and scope of this budget proposal..."
                required
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Verification Status</label>
              <select
                v-model="form.verification_status"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
              >
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
                <option value="processed">Processed</option>
              </select>
            </div>

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
                <span v-else>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { BudgetProposalList } from '~/api/types.gen'
import { usePartialUpdateBudgetProposal } from '~/composables/resources/payments/budgetProposals'

const props = defineProps<{
  open: boolean
  proposal: BudgetProposalList | null
}>()

const emit = defineEmits<{
  close: []
  updated: []
}>()

const toast = useToast()
const isSubmitting = ref(false)

const form = reactive({
  proposal_title: '',
  proposal_description: '',
  verification_status: 'pending' as 'pending' | 'verified' | 'rejected' | 'processed',
})

watch(
  () => props.proposal,
  (proposal) => {
    if (proposal) {
      form.proposal_title = proposal.proposal_title
      form.proposal_description = proposal.proposal_description ?? ''
      form.verification_status = (proposal.verification_status as typeof form.verification_status) ?? 'pending'
    }
  },
  { immediate: true }
)

const isFormValid = computed(
  () => form.proposal_title.trim().length > 0 && form.proposal_description.trim().length > 0
)

const updateMutation = usePartialUpdateBudgetProposal()

async function handleSubmit() {
  if (!isFormValid.value || !props.proposal) return
  isSubmitting.value = true
  try {
    await updateMutation.mutateAsync({
      proposalId: props.proposal.proposal_id,
      body: {
        proposal_title: form.proposal_title.trim(),
        proposal_description: form.proposal_description.trim(),
        verification_status: form.verification_status,
      },
    })
    toast.add({ title: 'Proposal updated', color: 'green' })
    emit('updated')
    emit('close')
  } catch {
    toast.add({ title: 'Failed to update proposal', color: 'red' })
  } finally {
    isSubmitting.value = false
  }
}
</script>
