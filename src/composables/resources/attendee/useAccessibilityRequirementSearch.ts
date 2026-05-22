import { computed, ref, watch, type MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useAccessibilityRequirements } from './accessibilityRequirements'

export type AccessibilityRequirementOption = {
  id: number
  label: string
}

export function useAccessibilityRequirementSearch(searchQuery: MaybeRefOrGetter<string>) {
  const debouncedSearch = ref('')

  const updateDebounced = useDebounceFn((value: string) => {
    debouncedSearch.value = value
  }, 250)

  watch(
    () => toValue(searchQuery),
    (value) => updateDebounced(String(value || '')),
    { immediate: true },
  )

  const query = useAccessibilityRequirements(
    computed(() => ({
      page_size: 100,
      ordering: 'label',
      search: debouncedSearch.value.trim() || undefined,
    })),
  )

  const options = computed<AccessibilityRequirementOption[]>(() => {
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
