import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  eventSettingsList,
  eventSettingsRetrieve,
  eventSettingsCreate,
  eventSettingsUpdate,
  eventSettingsPartialUpdate,
  eventSettingsDestroy,
  eventListSettingsRetrieve,
} from '~/api/sdk.gen'
import type {
  EventSettingsListData,
  EventSettingsCreateData,
  EventSettingsUpdateData,
  EventSettingsPartialUpdateData,
  EventSettingsDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['eventSettings'] as const

/**
 * List all event settings
 */
export function useEventSettingsList(params?: MaybeRefOrGetter<EventSettingsListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return eventSettingsList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get event settings by event ID
 */
export function useEventSettings(eventId: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'event', eventId] as const,
    queryFn: () => {
      const id = toValue(eventId)
      return eventListSettingsRetrieve({ path: { event_id: id } })
    },
    enabled: () => !!toValue(eventId),
  })
}

/**
 * Get event settings by ID
 */
export function useEventSetting(settingsId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', settingsId] as const,
    queryFn: () => {
      const id = toValue(settingsId)
      return eventSettingsRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(settingsId),
  })
}

/**
 * Create new event settings
 */
export function useCreateEventSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: EventSettingsCreateData['body']) => eventSettingsCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update event settings (full update)
 */
export function useUpdateEventSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ settingsId, body }: { settingsId: number; body: EventSettingsUpdateData['body'] }) =>
      eventSettingsUpdate({ path: { id: settingsId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.settingsId],
      })
    },
  })
}

/**
 * Partially update event settings
 */
export function usePartialUpdateEventSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ settingsId, body }: { settingsId: number; body?: EventSettingsPartialUpdateData['body'] }) =>
      eventSettingsPartialUpdate({ path: { id: settingsId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.settingsId],
      })
    },
  })
}

/**
 * Delete event settings
 */
export function useDeleteEventSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (settingsId: number) => eventSettingsDestroy({ path: { id: settingsId } }),
    onSuccess: (_, settingsId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', settingsId],
      })
    },
  })
}
