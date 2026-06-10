import { ref } from 'vue'
import { useRunWorkshopAllocation } from '~/composables/resources/workshops'
import type { WorkshopAllocationResult } from '~/composables/resources/workshops'

export interface AllocationRun {
  workshopId: number
  workshopTitle: string
  result: WorkshopAllocationResult
}

export function useWorkshopAllocation() {
  const runMutation = useRunWorkshopAllocation()

  const showResultModal = ref(false)
  const lastResult = ref<AllocationRun | null>(null)

  async function triggerAllocation(workshopId: number, workshopTitle: string) {
    const result = await runMutation.mutateAsync(workshopId)
    lastResult.value = { workshopId, workshopTitle, result }
    showResultModal.value = true
    return result
  }

  function closeResultModal() {
    showResultModal.value = false
  }

  return {
    isRunning: runMutation.isPending,
    lastResult,
    showResultModal,
    triggerAllocation,
    closeResultModal,
  }
}
