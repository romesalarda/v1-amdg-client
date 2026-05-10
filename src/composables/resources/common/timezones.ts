import { useQuery } from '@tanstack/vue-query'
import { timezonesRetrieve } from '~/api/sdk.gen'
import type { MaybeRef } from 'vue'

const QUERY_KEY = ['timezones'] as const

/**
 * Fetch all available IANA timezones, optionally filtered by a search string.
 */
export function useTimezones(search?: MaybeRef<string>) {
  return useQuery({
    queryKey: [...QUERY_KEY, search] as const,
    queryFn: () =>
      timezonesRetrieve({
        query: {
          search: unref(search) || undefined,
        },
      }).then(r => r.data ?? []),
    staleTime: Infinity, // timezone list never changes at runtime
  })
}
