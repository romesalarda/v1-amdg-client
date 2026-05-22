import { computed, ref, watch, type MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useProducts } from './products'
import type { ProductList } from '~/api/types.gen'

export type ProductOption = {
  id: string
  title: string
  displayCode: string
}

export function useProductSearch(
  searchQuery: MaybeRefOrGetter<string>,
  eventSlug?: MaybeRefOrGetter<string | undefined>,
) {
  const debouncedSearch = ref('')

  const updateDebounced = useDebounceFn((value: string) => {
    debouncedSearch.value = value
  }, 300)

  watch(
    () => toValue(searchQuery),
    (value) => updateDebounced(String(value || '')),
    { immediate: true },
  )

  const query = useProducts(
    computed(() => ({
      page_size: 50,
      ordering: 'title',
      search: debouncedSearch.value.trim() || undefined,
      event: eventSlug ? (toValue(eventSlug) || undefined) : undefined,
    })),
  )

  const options = computed<ProductOption[]>(() => {
    const rows: ProductList[] = query.data.value?.data?.results || []
    return rows
      .map((r) => ({
        id: String(r.product_id || '').trim(),
        title: String(r.title || '').trim(),
        displayCode: String(r.display_code || '').trim(),
      }))
      .filter((r) => r.id.length > 0 && r.title.length > 0)
  })

  return {
    options,
    isLoading: query.isLoading,
  }
}
