import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  eventListPolicyPartialUpdate,
  eventListPolicyRetrieve,
} from '~/api/sdk.gen'
import type { EventListPolicyPartialUpdateData } from '~/api/types.gen'

const QUERY_KEY = ['eventPolicy'] as const

/**
 * Fetch the event's editable policy values and its effective organisation-capped policy.
 */
export function useEventPolicy(eventId: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'event', eventId] as const,
    queryFn: () =>
      eventListPolicyRetrieve({ path: { url_safe_title: toValue(eventId) } }),
    enabled: () => !!toValue(eventId),
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Partially update an event policy. Requires organisation control or policy management access.
 */
export function useUpdateEventPolicy() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      eventId,
      body,
    }: {
      eventId: string
      body: NonNullable<EventListPolicyPartialUpdateData['body']>
    }) =>
      eventListPolicyPartialUpdate({
        path: { url_safe_title: eventId },
        body,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'event', variables.eventId],
      })
    },
  })
}
