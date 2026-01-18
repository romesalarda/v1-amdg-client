import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  messagesList,
  messagesRetrieve,
  messagesCreate,
  messagesUpdate,
  messagesPartialUpdate,
  messagesDestroy,
} from '~/api/sdk.gen'
import type {
  MessagesListData,
  MessagesCreateData,
  MessagesUpdateData,
  MessagesPartialUpdateData,
  MessagesDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['messages'] as const

/**
 * List all attendee messages
 */
export function useMessages(params?: MaybeRefOrGetter<MessagesListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return messagesList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single message by ID
 */
export function useMessage(messageId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', messageId] as const,
    queryFn: () => {
      const id = toValue(messageId)
      return messagesRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(messageId),
  })
}

/**
 * Create a new message
 */
export function useCreateMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: MessagesCreateData['body']) => messagesCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update a message (full update)
 */
export function useUpdateMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ messageId, body }: { messageId: number; body: MessagesUpdateData['body'] }) =>
      messagesUpdate({ path: { id: messageId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.messageId],
      })
    },
  })
}

/**
 * Partially update a message
 */
export function usePartialUpdateMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ messageId, body }: { messageId: number; body?: MessagesPartialUpdateData['body'] }) =>
      messagesPartialUpdate({ path: { id: messageId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.messageId],
      })
    },
  })
}

/**
 * Delete a message
 */
export function useDeleteMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (messageId: number) => messagesDestroy({ path: { id: messageId } }),
    onSuccess: (_, messageId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', messageId],
      })
    },
  })
}
