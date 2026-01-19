import { useQuery, useMutation, useQueryClient, shouldThrowError } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  profilesList,
  profilesRetrieve,
  profilesCreate,
  profilesUpdate,
  profilesPartialUpdate,
  profilesDestroy,
  profilesMeRetrieve,
} from '~/api/sdk.gen'
import type {
  ProfilesListData,
  ProfilesCreateData,
  ProfilesUpdateData,
  ProfilesPartialUpdateData,
  ProfilesDestroyData,
} from '~/api/types.gen'

const QUERY_KEY = ['profiles'] as const

/**
 * List all profiles
 */
export function useProfiles(params?: MaybeRefOrGetter<ProfilesListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return profilesList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Retrieve a single profile by ID
 */
export function useProfile(profileId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', profileId] as const,
    queryFn: () => {
      const id = toValue(profileId)
      return profilesRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(profileId),
  })
}

/**
 * Get current user's profile
 */
export function useMyProfile() {
  return useQuery({
    queryKey: [...QUERY_KEY, 'me'] as const,
    queryFn: () => profilesMeRetrieve(),
  })
}

/**
 * Create a new profile
 */
export function useCreateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: ProfilesCreateData['body']) => profilesCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Update an existing profile (full update)
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ profileId, body }: { profileId: number; body: ProfilesUpdateData['body'] }) =>
      profilesUpdate({ path: { id: profileId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.profileId],
      })
    },
  })
}

/**
 * Partially update an existing profile
 */
export function usePartialUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ profileId, body }: { profileId: number; body?: ProfilesPartialUpdateData['body'] }) =>
      profilesPartialUpdate({ path: { id: profileId }, body , throwOnError: true}),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', variables.profileId],
      })
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'me'] })
    },
  })
}

/**
 * Delete a profile
 */
export function useDeleteProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (profileId: number) => profilesDestroy({ path: { id: profileId } }),
    onSuccess: (_, profileId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', profileId],
      })
    },
  })
}
