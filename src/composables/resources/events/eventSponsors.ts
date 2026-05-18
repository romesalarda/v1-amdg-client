import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  eventListSponsorsList,
  eventListSponsorsCreate,
  eventListSponsorsPartialUpdate,
  eventListSponsorsDestroy,
  eventListSponsorsApprove,
  eventListSponsorsReject,
  eventListSponsorshipPackagesList,
  eventListSponsorshipPackagesCreate,
  eventListSponsorshipPackagesPartialUpdate,
  eventListSponsorshipPackagesDestroy,
  eventStatisticsSponsorPackagesRetrieve,
  organisationsSponsorInvitesList,
  organisationsSponsorInvitesCreate,
  organisationsSponsorInvitesDestroy,
} from '~/api/sdk.gen'
import type {
  EventSponsorCreateUpdateRequest,
  EventSponsorInviteCreateUpdateRequest,
  EventSponsorPackageCreateUpdateRequest,
  EventStatisticsSponsorPackagesRetrieveData,
} from '~/api/types.gen'

const QUERY_KEY = ['eventSponsors'] as const
const INVITES_QUERY_KEY = ['eventSponsorInvites'] as const

export function extractCollection<T>(payload: unknown): T[] {
  if (!payload)
    return []

  if (Array.isArray(payload))
    return payload as T[]

  if (typeof payload === 'object' && payload !== null && Array.isArray((payload as { results?: unknown[] }).results)) {
    return (payload as { results: T[] }).results
  }

  return []
}

export function useEventSponsors(eventId: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', eventId] as const,
    queryFn: () => eventListSponsorsList({ path: { url_safe_title: toValue(eventId) } }),
    enabled: () => !!toValue(eventId),
  })
}

export function useCreateEventSponsor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, body }: { eventId: string; body: EventSponsorCreateUpdateRequest }) => {
      return eventListSponsorsCreate({
        path: { url_safe_title: eventId },
        body: body as any,
      })
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'list', variables.eventId] })
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'performance', variables.eventId] })
    },
  })
}

export function useUpdateEventSponsor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      eventId,
      sponsorId,
      body,
    }: {
      eventId: string
      sponsorId: string
      body: Partial<EventSponsorCreateUpdateRequest>
    }) => {
      return eventListSponsorsPartialUpdate({
        path: { url_safe_title: eventId, sponsor_id: sponsorId },
        body: body as any,
      })
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'list', variables.eventId] })
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'performance', variables.eventId] })
    },
  })
}

export function useDeleteEventSponsor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, sponsorId }: { eventId: string; sponsorId: string }) => {
      return eventListSponsorsDestroy({
        path: { url_safe_title: eventId, sponsor_id: sponsorId },
      })
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'list', variables.eventId] })
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'performance', variables.eventId] })
    },
  })
}

export function useApproveEventSponsor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, sponsorId }: { eventId: string; sponsorId: string }) => {
      return eventListSponsorsApprove({
        path: { url_safe_title: eventId, sponsor_id: sponsorId },
        body: {} as any,
      })
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'list', variables.eventId] })
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'performance', variables.eventId] })
    },
  })
}

export function useRejectEventSponsor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, sponsorId }: { eventId: string; sponsorId: string }) => {
      return eventListSponsorsReject({
        path: { url_safe_title: eventId, sponsor_id: sponsorId },
        body: {} as any,
      })
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'list', variables.eventId] })
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'performance', variables.eventId] })
    },
  })
}

export function useEventSponsorshipPackages(eventId: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'packages', eventId] as const,
    queryFn: () => eventListSponsorshipPackagesList({ path: { url_safe_title: toValue(eventId) } }),
    enabled: () => !!toValue(eventId),
  })
}

export function useCreateEventSponsorshipPackage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, body }: { eventId: string; body: EventSponsorPackageCreateUpdateRequest }) => {
      return eventListSponsorshipPackagesCreate({
        path: { url_safe_title: eventId },
        body: body as any,
      })
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'packages', variables.eventId] })
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'list', variables.eventId] })
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'performance', variables.eventId] })
    },
  })
}

export function useUpdateEventSponsorshipPackage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      eventId,
      packageId,
      body,
    }: {
      eventId: string
      packageId: string
      body: Partial<EventSponsorPackageCreateUpdateRequest>
    }) => {
      return eventListSponsorshipPackagesPartialUpdate({
        path: { url_safe_title: eventId, package_id: packageId },
        body: body as any,
      })
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'packages', variables.eventId] })
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'list', variables.eventId] })
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'performance', variables.eventId] })
    },
  })
}

export function useDeleteEventSponsorshipPackage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, packageId }: { eventId: string; packageId: string }) => {
      return eventListSponsorshipPackagesDestroy({
        path: { url_safe_title: eventId, package_id: packageId },
      })
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'packages', variables.eventId] })
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'list', variables.eventId] })
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'performance', variables.eventId] })
    },
  })
}

export function useEventSponsorPackagePerformance(
  params?: MaybeRefOrGetter<EventStatisticsSponsorPackagesRetrieveData['query'] | undefined>
) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'performance', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return eventStatisticsSponsorPackagesRetrieve(queryParams ? { query: queryParams } : undefined)
    },
  })
}

export function useEventSponsorInvites(eventId: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: [...INVITES_QUERY_KEY, 'list', eventId] as const,
    queryFn: () => {
      const id = toValue(eventId)
      return organisationsSponsorInvitesList({ query: { event: id, page_size: 200 } })
    },
    enabled: () => !!toValue(eventId),
  })
}

export function useCreateEventSponsorInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ body }: { body: EventSponsorInviteCreateUpdateRequest }) => {
      return organisationsSponsorInvitesCreate({ body })
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: INVITES_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['organisationSponsorInvites'] })
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, 'list', String(variables.body.event)] })
    },
  })
}

export function useDeleteEventSponsorInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ inviteId }: { inviteId: string }) => {
      return organisationsSponsorInvitesDestroy({ path: { invite_id: inviteId } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVITES_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['organisationSponsorInvites'] })
    },
  })
}