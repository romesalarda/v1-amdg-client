import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  eventStaffInvitesList,
  eventStaffInviteRetrieve,
  eventStaffInvitesCreate,
  eventStaffInviteUpdate,
  eventStaffInvitePartialUpdate,
  eventStaffInviteDelete,
  eventListStaffInvitesAcceptCreate,
  eventStaffInvitesMyInvites
} from '~/api/sdk.gen'
import type {
  EventStaffInvitesListData,
  EventStaffInvitesCreateData,
  EventStaffInviteUpdateData,
  EventStaffInvitePartialUpdateData,
  EventStaffInviteDeleteData,
  EventListStaffInvitesAcceptCreateData,
} from '~/api/types.gen'
import { useAuthStore } from '~/stores/auth'

export function useMyEventStaffInvites(params?: MaybeRefOrGetter<{ accepted?: boolean; is_valid?: boolean } | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'my-invites-global', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return   eventStaffInvitesMyInvites({ query: queryParams })
    },
  })
}
 

const QUERY_KEY = ['eventStaffInvites'] as const

/**
 * List all event staff invites for a specific event
 */
export function useEventStaffInvites(
  eventId: MaybeRefOrGetter<string>,
  params?: MaybeRefOrGetter<EventStaffInvitesListData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', eventId, params] as const,
    queryFn: () => {
      const id = toValue(eventId)
      const queryParams = toValue(params)
      return eventStaffInvitesList({ 
        path: { event_id: id }, 
        query: queryParams 
      })
    },
    enabled: () => !!toValue(eventId),
  })
}

/**
 * Get current user's event staff invites for a specific event
 * Use this to check if the current user has pending invites for an event
 */
export function useMyEventStaffInvitesForEvent(
  eventId: MaybeRefOrGetter<string>,
  params?: MaybeRefOrGetter<{ accepted?: boolean; is_valid?: boolean } | undefined>
) {
  const authStore = useAuthStore()
  
  return useQuery({
    queryKey: [...QUERY_KEY, 'my-invites', eventId, params] as const,
    queryFn: () => {
      const event_id = toValue(eventId)
      const queryParams = toValue(params)
      
      return eventStaffInvitesList({ 
        path: { event_id }, 
        query: { 
          target_user: authStore.user?.id,
          ...queryParams
        } 
      })
    },
    enabled: () => !!toValue(eventId) && !!authStore.user?.id,
  })
}

/**
 * Get a single event staff invite by ID
 */
export function useEventStaffInvite(
  eventId: MaybeRefOrGetter<string>,
  inviteId: MaybeRefOrGetter<string>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', eventId, inviteId] as const,
    queryFn: () => {
      const event_id = toValue(eventId)
      const invite_id = toValue(inviteId)
      return eventStaffInviteRetrieve({ 
        path: { event_id, invite_id: String(invite_id) } 
      })
    },
    enabled: () => !!toValue(eventId) && !!toValue(inviteId),
  })
}

/**
 * Create a new event staff invite
 */
export function useCreateEventStaffInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, body }: { eventId: string; body: EventStaffInvitesCreateData['body'] }) =>
      eventStaffInvitesCreate({ 
        path: { event_id: eventId }, 
        body 
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ 
        queryKey: [...QUERY_KEY, 'list', variables.eventId] 
      })
    },
  })
}

/**
 * Update an event staff invite (full update)
 */
export function useUpdateEventStaffInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ 
      eventId, 
      inviteId, 
      body 
    }: { 
      eventId: string; 
      inviteId: string; 
      body: EventStaffInviteUpdateData['body'] 
    }) =>
      eventStaffInviteUpdate({ 
        path: { event_id: eventId, invite_id: String(inviteId) }, 
        body 
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.eventId, variables.inviteId],
      })
    },
  })
}

/**
 * Partially update an event staff invite
 */
export function usePartialUpdateEventStaffInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ 
      eventId, 
      inviteId, 
      body 
    }: { 
      eventId: string; 
      inviteId: string; 
      body?: EventStaffInvitePartialUpdateData['body'] 
    }) =>
      eventStaffInvitePartialUpdate({ 
        path: { event_id: eventId, invite_id: String(inviteId) }, 
        body 
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.eventId, variables.inviteId],
      })
    },
  })
}

/**
 * Delete an event staff invite
 */
export function useDeleteEventStaffInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, inviteId }: { eventId: string; inviteId: string }) =>
      eventStaffInviteDelete({ 
        path: { event_id: eventId, invite_id: String(inviteId) } 
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.eventId, variables.inviteId],
      })
    },
  })
}

/**
 * Accept an event staff invite
 */
export function useAcceptEventStaffInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, inviteId }: { eventId: string; inviteId: string }) =>
      eventListStaffInvitesAcceptCreate({ 
        path: { event_id: eventId, invite_id: String(inviteId) },
        throwOnError: true
      }),
    onSuccess: (_, variables) => {
      // Invalidate invites queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      // Also invalidate event staff queries since a new staff member was added
      queryClient.invalidateQueries({ queryKey: ['eventStaff'] })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.eventId, variables.inviteId],
      })
    },
  })
}
