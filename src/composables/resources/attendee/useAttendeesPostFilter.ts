import { useQuery } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue, computed } from 'vue'
import { attendeesFilterCreate } from '~/api/sdk.gen'
import type { AttendeeFilterRequestRequest, AttendeeFilterResponse, AttendeeList } from '~/api/types.gen'

const QUERY_KEY = ['attendees', 'filter'] as const

/**
 * POST-based attendee filter composable.
 *
 * Wraps POST /api/attendees/filter/ with Vue Query.
 * The query key is derived from the full body so any change triggers a refetch.
 */
export function useAttendeesPostFilter(
  body: MaybeRefOrGetter<AttendeeFilterRequestRequest | null>,
  options?: { enabled?: MaybeRefOrGetter<boolean> },
) {
  const enabled = computed(() => {
    const b = toValue(body)
    const optEnabled = toValue(options?.enabled ?? true)
    return optEnabled && b !== null && !!b.event
  })

  return useQuery({
    queryKey: computed(() => [...QUERY_KEY, toValue(body)]),
    queryFn: async () => {
      const b = toValue(body)
      if (!b) throw new Error('No filter body')
      const res = await attendeesFilterCreate({ body: b })
      return res.data as AttendeeFilterResponse
    },
    enabled,
    placeholderData: (prev) => prev,
  })
}

/** Typed result rows — the SDK returns `results` as `{ [key: string]: unknown }[]`
 *  We cast to AttendeeList for consumer convenience. */
export function useAttendeesPostFilterResults(
  body: MaybeRefOrGetter<AttendeeFilterRequestRequest | null>,
  options?: { enabled?: MaybeRefOrGetter<boolean> },
) {
  const query = useAttendeesPostFilter(body, options)
  return {
    ...query,
    attendees: computed(() => (query.data.value?.results ?? []) as AttendeeList[]),
    total: computed(() => query.data.value?.count ?? 0),
    totalPages: computed(() => query.data.value?.total_pages ?? 0),
    hasNext: computed(() => query.data.value?.has_next ?? false),
    hasPrevious: computed(() => query.data.value?.has_previous ?? false),
  }
}
