import { computed, ref, watch, type MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useQuery } from '@tanstack/vue-query'
import {
  locationsAreasList,
  locationsChaptersList,
  locationsClustersList,
  locationsCountriesList,
} from '~/api/sdk.gen'

export type LocationType = 'area' | 'chapter' | 'cluster' | 'country'

export type LocationSearchOption = {
  id: number
  label: string
  type: LocationType
  typeLabel: string
}

const TYPE_LABELS: Record<LocationType, string> = {
  area: 'Area',
  chapter: 'Chapter',
  cluster: 'Cluster',
  country: 'Country',
}

/**
 * Searches across one or more location types (area, chapter, cluster, country).
 *
 * @param searchQuery - Reactive search string
 * @param allowedTypes - Which location types to include (default: ['area'])
 * @param extraParams - Extra query params forwarded to every API call (e.g. { chapter: 5 })
 * @param minSearchLength - Minimum chars before firing area/chapter/cluster queries (default: 2)
 */
export const useLocationSearch = (
  searchQuery: MaybeRefOrGetter<string>,
  allowedTypes: MaybeRefOrGetter<LocationType[]> = ['area'],
  extraParams: MaybeRefOrGetter<Record<string, any>> = {},
  minSearchLength: MaybeRefOrGetter<number> = 2,
) => {
  const debouncedSearch = ref('')

  const updateDebounced = useDebounceFn((value: string) => {
    debouncedSearch.value = value
  }, 300)

  watch(
    () => toValue(searchQuery),
    (value) => updateDebounced(String(value || '')),
    { immediate: true },
  )

  const normalizedQuery = computed(() => debouncedSearch.value.trim())
  const minLen = computed(() => toValue(minSearchLength))
  const types = computed(() => toValue(allowedTypes))
  const extra = computed(() => toValue(extraParams))

  // Country queries are always enabled (no meaningful search param — shows first page)
  const hasCountry = computed(() => types.value.includes('country'))
  const canSearch = computed(
    () => normalizedQuery.value.length >= minLen.value || hasCountry.value,
  )

  const isSearchable = computed(
    () => normalizedQuery.value.length >= minLen.value,
  )

  // ── Area query ──────────────────────────────────────────────────────────────

  const areaQuery = useQuery({
    queryKey: computed(() => ['location-search-area', normalizedQuery.value, extra.value] as const),
    queryFn: async () => {
      const response = await locationsAreasList({
        query: { search: normalizedQuery.value, page_size: 8, active: true, ...extra.value },
      })
      return response.data?.results || []
    },
    enabled: computed(() => types.value.includes('area') && isSearchable.value),
  })

  // ── Chapter query ───────────────────────────────────────────────────────────

  const chapterQuery = useQuery({
    queryKey: computed(() => ['location-search-chapter', normalizedQuery.value, extra.value] as const),
    queryFn: async () => {
      const response = await locationsChaptersList({
        query: { search: normalizedQuery.value, page_size: 8, active: true, ...extra.value },
      })
      return response.data?.results || []
    },
    enabled: computed(() => types.value.includes('chapter') && isSearchable.value),
  })

  // ── Cluster query ───────────────────────────────────────────────────────────

  const clusterQuery = useQuery({
    queryKey: computed(() => ['location-search-cluster', normalizedQuery.value, extra.value] as const),
    queryFn: async () => {
      const response = await locationsClustersList({
        query: { search: normalizedQuery.value, page_size: 8, active: true, ...extra.value },
      })
      return response.data?.results || []
    },
    enabled: computed(() => types.value.includes('cluster') && isSearchable.value),
  })

  // ── Country query (always loads when type is allowed — no text search on API) ──

  const countryQuery = useQuery({
    queryKey: computed(() => ['location-search-country', extra.value] as const),
    queryFn: async () => {
      const response = await locationsCountriesList({
        query: { page_size: 50, active: true, ...extra.value },
      })
      return response.data?.results || []
    },
    enabled: hasCountry,
  })

  // ── Merged options ──────────────────────────────────────────────────────────

  const options = computed<LocationSearchOption[]>(() => {
    const result: LocationSearchOption[] = []

    if (types.value.includes('area') && isSearchable.value) {
      for (const row of areaQuery.data.value || []) {
        const label = String((row as any).area_name || '').trim()
        if (label) result.push({ id: Number((row as any).id), label, type: 'area', typeLabel: TYPE_LABELS.area })
      }
    }

    if (types.value.includes('chapter') && isSearchable.value) {
      for (const row of chapterQuery.data.value || []) {
        const label = String((row as any).chapter_name || '').trim()
        if (label) result.push({ id: Number((row as any).id), label, type: 'chapter', typeLabel: TYPE_LABELS.chapter })
      }
    }

    if (types.value.includes('cluster') && isSearchable.value) {
      for (const row of clusterQuery.data.value || []) {
        const label = String((row as any).cluster_name || '').trim()
        if (label) result.push({ id: Number((row as any).id), label, type: 'cluster', typeLabel: TYPE_LABELS.cluster })
      }
    }

    if (types.value.includes('country')) {
      const q = normalizedQuery.value.toLowerCase()
      for (const row of countryQuery.data.value || []) {
        const label = String((row as any).country_name || '').trim()
        // Client-side text filter for countries (API has no search param)
        if (label && (q.length < minLen.value || label.toLowerCase().includes(q))) {
          result.push({ id: Number((row as any).id), label, type: 'country', typeLabel: TYPE_LABELS.country })
        }
      }
    }

    return result
  })

  const isLoading = computed(() =>
    (types.value.includes('area') && isSearchable.value && areaQuery.isLoading.value)
    || (types.value.includes('chapter') && isSearchable.value && chapterQuery.isLoading.value)
    || (types.value.includes('cluster') && isSearchable.value && clusterQuery.isLoading.value)
    || (types.value.includes('country') && countryQuery.isLoading.value),
  )

  return { options, isLoading, canSearch }
}
