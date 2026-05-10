import { computed, ref, watch, type MaybeRefOrGetter } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { toValue } from 'vue'
import { useOrganisations } from './organisations'

export type OrganisationSearchOption = {
  id: number
  title: string
}

export const useOrganisationSearch = (searchQuery: MaybeRefOrGetter<string>) => {
  const debouncedSearch = ref('')

  const updateDebounced = useDebounceFn((value: string) => {
    debouncedSearch.value = value
  }, 250)

  watch(
    () => toValue(searchQuery),
    (value) => {
      updateDebounced(String(value || ''))
    },
    { immediate: true }
  )

  const query = useOrganisations(
    computed(() => ({
      page_size: 80,
      ordering: 'title',
      search: debouncedSearch.value.trim() || undefined,
    }))
  )

  const options = computed<OrganisationSearchOption[]>(() => {
    const rows = query.data.value?.data?.results || []
    return rows
      .map((row: any) => ({
        id: Number(row.id),
        title: String(row.title || '').trim(),
      }))
      .filter((row) => Number.isFinite(row.id) && row.id > 0 && row.title.length > 0)
  })

  return {
    options,
    isLoading: query.isLoading,
  }
}
