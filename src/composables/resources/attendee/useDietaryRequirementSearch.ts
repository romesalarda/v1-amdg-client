import { computed, ref, watch, type MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useDietaryRequirements } from './attendeeDietaryRequirements'

export type DietaryRequirementOption = {
  id: number
  label: string
}

export function useDietaryRequirementSearch(searchQuery: MaybeRefOrGetter<string>) {
  const debouncedSearch = ref('')

  const updateDebounced = useDebounceFn((value: string) => {
    debouncedSearch.value = value
  }, 250)

  watch(
    () => toValue(searchQuery),
    (value) => updateDebounced(String(value || '')),
    { immediate: true },
  )

  const query = useDietaryRequirements(
    computed(() => ({
      page_size: 100,
      ordering: 'label',
      search: debouncedSearch.value.trim() || undefined,
    })),
  )

  const options = computed<DietaryRequirementOption[]>(() => {
    const rows = query.data.value?.data?.results || []
    return rows
      .map((r: any) => ({ id: Number(r.id), label: String(r.label || '').trim() }))
      .filter((r) => Number.isFinite(r.id) && r.id > 0 && r.label.length > 0)
  })

  return {
    options,
    isLoading: query.isLoading,
  }
}
