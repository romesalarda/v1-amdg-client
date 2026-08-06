<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('close')" />
      <div class="relative w-full max-w-lg bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
        <div class="flex items-center gap-2 px-6 py-5 border-b border-navy-50">
          <span class="material-symbols-outlined text-primary">receipt_long</span>
          <h3 class="text-sm font-black text-primary uppercase tracking-widest flex-1">New Budget Proposal</h3>
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
                minlength="10"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                :class="{ 'border-red-300': form.proposal_description && form.proposal_description.trim().length < 10 }"
              />
              <p
                v-if="form.proposal_description && form.proposal_description.trim().length < 10"
                class="text-xs text-red-500 mt-1"
              >
                Description must be at least 10 characters ({{ form.proposal_description.trim().length }}/10)
              </p>
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
                <span v-else>Create Proposal</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useCreateBudgetProposal } from '~/composables/resources/payments/budgetProposals'

const props = defineProps<{
  open: boolean
  eventId: string
}>()

const emit = defineEmits<{
  close: []
  created: []
}>()

const toast = useToast()

const form = reactive({
  proposal_title: '',
  proposal_description: '',
})

const isSubmitting = ref(false)
const isFormValid = computed(
  () => form.proposal_title.trim().length > 0 && form.proposal_description.trim().length > 10
)

const createMutation = useCreateBudgetProposal()

async function handleSubmit() {
  if (!isFormValid.value) return
  isSubmitting.value = true
  try {
    await createMutation.mutateAsync({
      event: props.eventId,
      proposal_title: form.proposal_title.trim(),
      proposal_description: form.proposal_description.trim(),
    })
    toast.add({ title: 'Budget proposal created', color: 'green' })
    form.proposal_title = ''
    form.proposal_description = ''
    emit('created')
    emit('close')
  } catch {
    toast.add({ title: 'Failed to create proposal', color: 'red' })
  } finally {
    isSubmitting.value = false
  }
}
</script>
