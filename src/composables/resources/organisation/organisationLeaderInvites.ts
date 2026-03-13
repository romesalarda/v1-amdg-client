import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  organisationsLeaderInvitesList,
  organisationsLeaderInvitesRetrieve,
  organisationsLeaderInvitesCreate,
  organisationsLeaderInvitesUpdate,
  organisationsLeaderInvitesPartialUpdate,
  organisationsLeaderInvitesDestroy,
  organisationsLeaderInvitesAcceptCreate,
  organisationsLeaderInvitesMyInvitesRetrieve,
  organisationsLeadersCandidateUsersRetrieve,
} from '~/api/sdk.gen'
import type {
  OrganisationsLeaderInvitesListData,
  OrganisationsLeaderInvitesCreateData,
  OrganisationsLeaderInvitesUpdateData,
  OrganisationsLeaderInvitesPartialUpdateData,
  OrganisationsLeaderInvitesDestroyData,
  OrganisationsLeaderInvitesAcceptCreateData,
  OrganisationsLeaderInvitesMyInvitesRetrieveData,
  OrganisationsLeadersCandidateUsersRetrieveData,
} from '~/api/types.gen'

const INVITES_QUERY_KEY = ['organisationLeaderInvites'] as const
const CANDIDATES_QUERY_KEY = ['organisationLeaderCandidates'] as const

export type LeaderCandidateUser = {
  id: number
  email: string
  username: string
  first_name: string
  last_name: string
  full_name: string
}

export type LeaderCandidateListResponse = {
  count: number
  next: string | null
  previous: string | null
  results: LeaderCandidateUser[]
}

type UnknownRecord = Record<string, unknown>

function normalizeLeaderInvitesList(payload: unknown) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (!payload || typeof payload !== 'object') {
    return []
  }

  const raw = payload as UnknownRecord

  if (Array.isArray(raw.results)) {
    return raw.results
  }

  // Fallback for non-paginated single-invite response typing.
  if ('id' in raw) {
    return [raw]
  }

  return []
}

function toNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' ? value : fallback
}

function toString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function mapCandidate(candidate: unknown): LeaderCandidateUser | null {
  if (!candidate || typeof candidate !== 'object') {
    return null
  }

  const raw = candidate as UnknownRecord
  if (typeof raw.id !== 'number') {
    return null
  }

  return {
    id: raw.id,
    email: toString(raw.email),
    username: toString(raw.username),
    first_name: toString(raw.first_name),
    last_name: toString(raw.last_name),
    full_name: toString(raw.full_name),
  }
}

function mapCandidateList(candidates: unknown): LeaderCandidateUser[] {
  if (!Array.isArray(candidates)) {
    return []
  }

  return candidates
    .map(mapCandidate)
    .filter((candidate): candidate is LeaderCandidateUser => candidate !== null)
}

export function normalizeLeaderCandidateResponse(payload: unknown): LeaderCandidateListResponse {
  // Endpoint may return paginated shape or raw list depending on backend pagination config.
  if (Array.isArray(payload)) {
    const results = mapCandidateList(payload)
    return {
      count: results.length,
      next: null,
      previous: null,
      results,
    }
  }

  if (!payload || typeof payload !== 'object') {
    return {
      count: 0,
      next: null,
      previous: null,
      results: [],
    }
  }

  const raw = payload as UnknownRecord

  return {
    count: toNumber(raw.count),
    next: typeof raw.next === 'string' || raw.next === null ? raw.next : null,
    previous: typeof raw.previous === 'string' || raw.previous === null ? raw.previous : null,
    results: mapCandidateList(raw.results),
  }
}

/**
 * List all location leader invites
 */
export function useOrganisationLeaderInvites(params?: MaybeRefOrGetter<OrganisationsLeaderInvitesListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...INVITES_QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return organisationsLeaderInvitesList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single location leader invite by UUID
 */
export function useOrganisationLeaderInvite(inviteId: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: [...INVITES_QUERY_KEY, 'detail', inviteId] as const,
    queryFn: () => {
      const id = toValue(inviteId)
      return organisationsLeaderInvitesRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(inviteId),
  })
}

/**
 * Create a new location leader invite
 */
export function useCreateOrganisationLeaderInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: OrganisationsLeaderInvitesCreateData['body']) => organisationsLeaderInvitesCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVITES_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['organisationLeaders'] })
      queryClient.invalidateQueries({ queryKey: CANDIDATES_QUERY_KEY })
    },
  })
}

/**
 * Update a location leader invite (full update)
 */
export function useUpdateOrganisationLeaderInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ inviteId, body }: { inviteId: string; body: OrganisationsLeaderInvitesUpdateData['body'] }) =>
      organisationsLeaderInvitesUpdate({ path: { id: inviteId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: INVITES_QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...INVITES_QUERY_KEY, 'detail', variables.inviteId],
      })
    },
  })
}

/**
 * Partially update a location leader invite
 */
export function usePartialUpdateOrganisationLeaderInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ inviteId, body }: { inviteId: string; body?: OrganisationsLeaderInvitesPartialUpdateData['body'] }) =>
      organisationsLeaderInvitesPartialUpdate({ path: { id: inviteId }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: INVITES_QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...INVITES_QUERY_KEY, 'detail', variables.inviteId],
      })
    },
  })
}

/**
 * Delete a location leader invite
 */
export function useDeleteOrganisationLeaderInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (inviteId: OrganisationsLeaderInvitesDestroyData['path']['id']) =>
      organisationsLeaderInvitesDestroy({ path: { id: inviteId } }),
    onSuccess: (_, inviteId) => {
      queryClient.invalidateQueries({ queryKey: INVITES_QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...INVITES_QUERY_KEY, 'detail', inviteId],
      })
      queryClient.invalidateQueries({ queryKey: ['organisationLeaders'] })
      queryClient.invalidateQueries({ queryKey: CANDIDATES_QUERY_KEY })
    },
  })
}

/**
 * Accept a location leader invite
 */
export function useAcceptOrganisationLeaderInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (inviteId: OrganisationsLeaderInvitesAcceptCreateData['path']['id']) =>
      organisationsLeaderInvitesAcceptCreate({ path: { id: inviteId }, throwOnError: true }),
    onSuccess: (_, inviteId) => {
      queryClient.invalidateQueries({ queryKey: INVITES_QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...INVITES_QUERY_KEY, 'detail', inviteId],
      })
      queryClient.invalidateQueries({ queryKey: ['organisationLeaders'] })
    },
  })
}

/**
 * Get leader invites for the authenticated user.
 */
export function useMyOrganisationLeaderInvites(
  params?: MaybeRefOrGetter<OrganisationsLeaderInvitesMyInvitesRetrieveData['query'] | undefined>,
) {
  return useQuery({
    queryKey: [...INVITES_QUERY_KEY, 'my-invites', params] as const,
    queryFn: async () => {
      const queryParams = toValue(params)
      const response = await organisationsLeaderInvitesMyInvitesRetrieve(queryParams ? { query: queryParams } : undefined)

      return {
        raw: response,
        invites: normalizeLeaderInvitesList(response?.data),
      }
    },
  })
}

/**
 * Search candidate users who are eligible to become leaders.
 */
export function useOrganisationLeaderCandidates(
  params: MaybeRefOrGetter<OrganisationsLeadersCandidateUsersRetrieveData['query'] | undefined>,
  enabled: MaybeRefOrGetter<boolean> = true,
) {
  return useQuery({
    queryKey: [...CANDIDATES_QUERY_KEY, 'list', params] as const,
    queryFn: async () => {
      const queryParams = toValue(params)
      if (!queryParams) {
        return {
          raw: null,
          normalized: normalizeLeaderCandidateResponse(null),
        }
      }

      const response = await organisationsLeadersCandidateUsersRetrieve({ query: queryParams })
      return {
        raw: response,
        normalized: normalizeLeaderCandidateResponse(response?.data),
      }
    },
    enabled: () => toValue(enabled) && !!toValue(params),
  })
}
