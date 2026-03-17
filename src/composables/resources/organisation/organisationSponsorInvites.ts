import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  organisationsSponsorInvitesList,
  organisationsSponsorInvitesCreate,
  organisationsSponsorInvitesDestroy,
  organisationsSponsorInvitesAcceptByTokenCreate,
  organisationsSponsorInvitesDeclineByTokenCreate,
  organisationsSponsorsCheckoutCreate,
} from '~/api/sdk.gen'
import type {
  EventSponsorCheckoutRequest,
  EventSponsorInviteCreateUpdateRequest,
  EventSponsorInviteList,
  OrganisationsSponsorInvitesListData,
  OrganisationsSponsorsCheckoutCreateResponse,
} from '~/api/types.gen'

const INVITES_QUERY_KEY = ['organisationSponsorInvites'] as const

export type SponsorCheckoutResponse = OrganisationsSponsorsCheckoutCreateResponse & {
  sponsor_id?: string
  payment_id?: string
  payment_reference?: string
  payment_status?: string
  payment_method_type?: 'BANK_TRANSFER' | 'STRIPE' | 'CASH' | string
  client_secret?: string
  payment_intent_id?: string
  publishable_key?: string
  bank_transfer_reference?: string
  payment_instructions?: Record<string, unknown>
}

function normalizeListPayload(payload: unknown): EventSponsorInviteList[] {
  if (!payload) {
    return []
  }

  if (Array.isArray(payload)) {
    return payload as EventSponsorInviteList[]
  }

  if (typeof payload === 'object' && payload !== null && Array.isArray((payload as { results?: unknown[] }).results)) {
    return (payload as { results: EventSponsorInviteList[] }).results
  }

  return []
}

export function useOrganisationSponsorInvites(
  params?: MaybeRefOrGetter<OrganisationsSponsorInvitesListData['query'] | undefined>,
) {
  return useQuery({
    queryKey: [...INVITES_QUERY_KEY, 'list', params] as const,
    queryFn: async () => {
      const queryParams = toValue(params)
      const response = await organisationsSponsorInvitesList(queryParams ? { query: queryParams } : undefined)

      return {
        raw: response,
        invites: normalizeListPayload(response?.data),
      }
    },
  })
}

export function useCreateOrganisationSponsorInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: EventSponsorInviteCreateUpdateRequest) => organisationsSponsorInvitesCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVITES_QUERY_KEY })
    },
  })
}

export function useDeleteOrganisationSponsorInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (inviteId: string) => organisationsSponsorInvitesDestroy({ path: { invite_id: inviteId } }),
    onSuccess: (_, inviteId) => {
      queryClient.invalidateQueries({ queryKey: INVITES_QUERY_KEY })
      queryClient.removeQueries({ queryKey: [...INVITES_QUERY_KEY, 'detail', inviteId] })
    },
  })
}

export function useAcceptOrganisationSponsorInviteByToken() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (token: string) => organisationsSponsorInvitesAcceptByTokenCreate({ body: { token } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVITES_QUERY_KEY })
    },
  })
}

export function useDeclineOrganisationSponsorInviteByToken() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (token: string) => organisationsSponsorInvitesDeclineByTokenCreate({ body: { token } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVITES_QUERY_KEY })
    },
  })
}

export function useOrganisationSponsorCheckout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: EventSponsorCheckoutRequest) => organisationsSponsorsCheckoutCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organisationSponsors'] })
      queryClient.invalidateQueries({ queryKey: INVITES_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] })
    },
  })
}
