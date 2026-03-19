import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'
import {
  eventListSponsorableList,
  organisationsSponsorInvitesList,
  organisationsSponsorInvitesCreate,
  organisationsSponsorInvitesDestroy,
  organisationsSponsorInvitesAcceptByTokenCreate,
  organisationsSponsorInvitesDeclineByTokenCreate,
  organisationsSponsorsCheckoutCreate,
  organisationsSponsorsInboundList,
  organisationsSponsorsOutboundList,
  organisationsSponsorsPaymentHistoryRetrieve,
  organisationsStatisticsSponsorsFlowRetrieve,
} from '~/api/sdk.gen'
import type {
  EventSponsorLedger,
  EventListSponsorableListData,
  EventSponsorCheckoutRequest,
  EventSponsorInviteCreateUpdateRequest,
  EventSponsorInviteList,
  OrganisationSponsorFlowStatistics,
  OrganisationsSponsorInvitesListData,
  OrganisationsSponsorsCheckoutCreateResponse,
  OrganisationsSponsorsInboundListData,
  OrganisationsSponsorsOutboundListData,
  OrganisationsSponsorsPaymentHistoryRetrieveData,
  OrganisationsStatisticsSponsorsFlowRetrieveData,
  SponsorableEventList,
  SponsorshipPaymentHistory,
} from '~/api/types.gen'

const INVITES_QUERY_KEY = ['organisationSponsorInvites'] as const
const SPONSORABLE_EVENTS_QUERY_KEY = ['sponsorableEvents'] as const
const SPONSORSHIP_PAYMENT_HISTORY_QUERY_KEY = ['sponsorshipPaymentHistory'] as const
const SPONSOR_LEDGER_QUERY_KEY = ['organisationSponsorLedger'] as const
const SPONSOR_FLOW_QUERY_KEY = ['organisationSponsorFlow'] as const

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

type PaginatedResponse<T> = {
  count: number
  next?: string | null
  previous?: string | null
  results: T[]
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

function normalizePaginatedPayload<T>(payload: unknown): PaginatedResponse<T> {
  if (!payload || typeof payload !== 'object') {
    return { count: 0, next: null, previous: null, results: [] }
  }

  const data = payload as Partial<PaginatedResponse<T>>
  return {
    count: typeof data.count === 'number' ? data.count : 0,
    next: typeof data.next === 'string' || data.next === null ? data.next : null,
    previous: typeof data.previous === 'string' || data.previous === null ? data.previous : null,
    results: Array.isArray(data.results) ? data.results : [],
  }
}

export function useSponsorableEvents(
  params?: MaybeRefOrGetter<EventListSponsorableListData['query'] | undefined>,
) {
  return useQuery({
    queryKey: [...SPONSORABLE_EVENTS_QUERY_KEY, 'list', params] as const,
    queryFn: async () => {
      const queryParams = toValue(params)
      const response = await eventListSponsorableList(queryParams ? { query: queryParams } : undefined)
      const normalized = normalizePaginatedPayload<SponsorableEventList>(response?.data)

      return {
        raw: response,
        events: normalized.results,
        count: normalized.count,
        next: normalized.next,
        previous: normalized.previous,
      }
    },
  })
}

export function useOrganisationSponsorshipPaymentHistory(
  params?: MaybeRefOrGetter<OrganisationsSponsorsPaymentHistoryRetrieveData['query'] | undefined>,
) {
  return useQuery({
    queryKey: [...SPONSORSHIP_PAYMENT_HISTORY_QUERY_KEY, params] as const,
    enabled: computed(() => {
      const value = toValue(params)
      return !!value?.event_id && !!value?.organisation_id
    }),
    queryFn: async () => {
      const queryParams = toValue(params)
      if (!queryParams?.event_id || !queryParams?.organisation_id) {
        return null
      }

      const response = await organisationsSponsorsPaymentHistoryRetrieve({ query: queryParams })
      return (response?.data || null) as SponsorshipPaymentHistory | null
    },
  })
}

export function useOrganisationInboundSponsors(
  params?: MaybeRefOrGetter<OrganisationsSponsorsInboundListData['query'] | undefined>,
) {
  return useQuery({
    queryKey: [...SPONSOR_LEDGER_QUERY_KEY, 'inbound', params] as const,
    enabled: computed(() => {
      const value = toValue(params)
      return !!value?.organisation_id
    }),
    queryFn: async () => {
      const queryParams = toValue(params)
      if (!queryParams?.organisation_id) {
        return { raw: null, rows: [], count: 0, next: null, previous: null }
      }

      const response = await organisationsSponsorsInboundList({ query: queryParams })
      const normalized = normalizePaginatedPayload<EventSponsorLedger>(response?.data)

      return {
        raw: response,
        rows: normalized.results,
        count: normalized.count,
        next: normalized.next,
        previous: normalized.previous,
      }
    },
  })
}

export function useOrganisationOutboundSponsors(
  params?: MaybeRefOrGetter<OrganisationsSponsorsOutboundListData['query'] | undefined>,
) {
  return useQuery({
    queryKey: [...SPONSOR_LEDGER_QUERY_KEY, 'outbound', params] as const,
    enabled: computed(() => {
      const value = toValue(params)
      return !!value?.organisation_id
    }),
    queryFn: async () => {
      const queryParams = toValue(params)
      if (!queryParams?.organisation_id) {
        return { raw: null, rows: [], count: 0, next: null, previous: null }
      }

      const response = await organisationsSponsorsOutboundList({ query: queryParams })
      const normalized = normalizePaginatedPayload<EventSponsorLedger>(response?.data)

      return {
        raw: response,
        rows: normalized.results,
        count: normalized.count,
        next: normalized.next,
        previous: normalized.previous,
      }
    },
  })
}

export function useOrganisationSponsorFlowStatistics(
  params?: MaybeRefOrGetter<OrganisationsStatisticsSponsorsFlowRetrieveData['query'] | undefined>,
) {
  return useQuery({
    queryKey: [...SPONSOR_FLOW_QUERY_KEY, params] as const,
    enabled: computed(() => {
      const value = toValue(params)
      return !!value?.organisation_id
    }),
    queryFn: async () => {
      const queryParams = toValue(params)
      if (!queryParams?.organisation_id) {
        return null
      }

      const response = await organisationsStatisticsSponsorsFlowRetrieve({ query: queryParams })
      return (response?.data || null) as OrganisationSponsorFlowStatistics | null
    },
  })
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
      queryClient.invalidateQueries({ queryKey: SPONSORSHIP_PAYMENT_HISTORY_QUERY_KEY })
    },
  })
}
