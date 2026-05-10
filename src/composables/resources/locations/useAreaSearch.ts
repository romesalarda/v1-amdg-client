import { computed, ref, watch, type MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useQuery } from '@tanstack/vue-query'
import { locationsAreasList } from '~/api/sdk.gen'

export type AreaSearchOption = {
  id: number
  label: string
}

export const useAreaSearch = (
  searchQuery: MaybeRefOrGetter<string>,
  minSearchLength: MaybeRefOrGetter<number> = 2,
) => {
  const debouncedSearch = ref('')

  const updateDebounced = useDebounceFn((value: string) => {
    debouncedSearch.value = value
  }, 300)

  watch(
    () => toValue(searchQuery),
    (value) => {
      updateDebounced(String(value || ''))
    },
    { immediate: true }
  )

  const normalizedQuery = computed(() => debouncedSearch.value.trim())
  const canSearch = computed(() => normalizedQuery.value.length >= toValue(minSearchLength))

  const query = useQuery({
    queryKey: computed(() => ['area-search', normalizedQuery.value] as const),
    queryFn: async () => {
      const response = await locationsAreasList({
        query: {
          search: normalizedQuery.value,
          page_size: 5,
        },
      })
      return response.data?.results || []
    },
    enabled: canSearch,
  })

  const options = computed<AreaSearchOption[]>(() => {
    const rows = query.data.value || []
    return rows
      .map((row: any) => ({
        id: Number(row.id),
        label: String(row.area_name || '').trim(),
      }))
      .filter((row) => Number.isFinite(row.id) && row.id > 0 && row.label.length > 0)
  })

  const isLoading = computed(() => canSearch.value && query.isLoading.value)

  return {
    options,
    isLoading,
    canSearch,
  }
}
