import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  usersList,
  usersRetrieve,
  usersCreate,
  usersUpdate,
  usersPartialUpdate,
  usersDestroy,
  usersMeRetrieve,
  usersMeUpdatePartialUpdate,
  usersProfileRetrieve,
  usersChangePasswordCreate,
  usersVerifyEmailCreate,
} from '~/api/sdk.gen'
import type {
  UsersListData,
  UsersCreateData,
  UsersUpdateData,
  UsersPartialUpdateData,
  UsersDestroyData,
  UsersMeUpdatePartialUpdateData,
  UsersChangePasswordCreateData,
  UsersVerifyEmailCreateData,
} from '~/api/types.gen'

const QUERY_KEY = ['users'] as const

/**
 * List all users
 */
export function useUsers(params?: MaybeRefOrGetter<UsersListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return usersList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Retrieve a single user by ID
 */
export function useUser(userId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', userId] as const,
    queryFn: () => {
      const id = toValue(userId)
      return usersRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(userId),
  })
}

/**
 * Get current authenticated user
 */
export function useMe() {
  return useQuery({
    queryKey: [...QUERY_KEY, 'me'] as const,
    queryFn: () => usersMeRetrieve(),
  })
}

/**
 * Get user profile by user ID
 */
export function useUserProfile(userId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'profile', userId] as const,
    queryFn: () => {
      const id = toValue(userId)
      return usersProfileRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(userId),
  })
}

/**
 * Create a new user
 */
export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UsersCreateData['body']) => usersCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update an existing user (full update)
 */
export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, body }: { userId: number; body: UsersUpdateData['body'] }) =>
      usersUpdate({ path: { id: userId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.userId],
      })
    },
  })
}

/**
 * Partially update an existing user
 */
export function usePartialUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, body }: { userId: number; body?: UsersPartialUpdateData['body'] }) =>
      usersPartialUpdate({ path: { id: userId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.userId],
      })
    },
  })
}

/**
 * Update current user's profile
 */
export function useUpdateMe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UsersMeUpdatePartialUpdateData['body']) => usersMeUpdatePartialUpdate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'me'] })
    },
  })
}

/**
 * Delete a user
 */
export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: number) => usersDestroy({ path: { id: userId } }),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', userId],
      })
    },
  })
}

/**
 * Change user password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (body: UsersChangePasswordCreateData['body']) => usersChangePasswordCreate({ body }),
  })
}

/**
 * Verify user email
 */
export function useVerifyEmail() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UsersVerifyEmailCreateData['body']) => usersVerifyEmailCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'me'] })
    },
  })
}
