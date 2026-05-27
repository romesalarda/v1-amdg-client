import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  eventNotificationsList,
  eventNotificationsRetrieve,
  eventNotificationsDestroy,
  eventNotificationsMarkReadCreate,
  eventNotificationsMarkAllReadCreate,
} from '~/api/sdk.gen'
import type { EventNotificationsListData } from '~/api/types.gen'

const QUERY_KEY = ['eventNotifications'] as const

export function useEventNotifications(params?: MaybeRefOrGetter<EventNotificationsListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return eventNotificationsList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

export function useEventNotification(id: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', id] as const,
    queryFn: () => eventNotificationsRetrieve({ path: { id: toValue(id) } }),
    enabled: () => !!toValue(id),
  })
}

export function useDeleteEventNotification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => eventNotificationsDestroy({ path: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => eventNotificationsMarkReadCreate({ path: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => eventNotificationsMarkAllReadCreate(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}
