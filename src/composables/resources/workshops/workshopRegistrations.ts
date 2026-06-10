import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  workshopsRegistrationsList,
  workshopsRegistrationsCreate,
  workshopsRegistrationsRetrieve,
  workshopsRegistrationsPartialUpdate,
  workshopsRegistrationsUpdate,
  workshopsRegistrationsDestroy,
  workshopsRegistrationsCancelCreate,
  workshopsRegistrationsConfirmCreate,
  workshopsRegistrationsPromoteWaitlistCreate,
} from '~/api/sdk.gen'
import type {
  WorkshopsRegistrationsListData,
  WorkshopsRegistrationsCreateData,
  WorkshopsRegistrationsPartialUpdateData,
  WorkshopsRegistrationsUpdateData,
} from '~/api/types.gen'
import { WORKSHOPS_QUERY_KEY } from './workshops'

const REG_QUERY_KEY = [...WORKSHOPS_QUERY_KEY, 'registrations'] as const

// ─── Queries ───────────────────────────────────────────────────────────────────

export function useWorkshopRegistrations(
  params?: MaybeRefOrGetter<WorkshopsRegistrationsListData['query'] | undefined>,
) {
  return useQuery({
    queryKey: [...REG_QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return workshopsRegistrationsList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

export function useWorkshopRegistration(registrationId: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: [...REG_QUERY_KEY, 'detail', registrationId] as const,
    queryFn: () => {
      const registration_id = toValue(registrationId)
      return workshopsRegistrationsRetrieve({ path: { registration_id } })
    },
    enabled: () => !!toValue(registrationId),
  })
}

// ─── Mutations ─────────────────────────────────────────────────────────────────

export function useCreateWorkshopRegistration() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: WorkshopsRegistrationsCreateData['body']) =>
      workshopsRegistrationsCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REG_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: WORKSHOPS_QUERY_KEY })
    },
  })
}

export function useUpdateWorkshopRegistration() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      registrationId,
      body,
    }: {
      registrationId: string
      body: WorkshopsRegistrationsUpdateData['body']
    }) => workshopsRegistrationsUpdate({ path: { registration_id: registrationId }, body }),
    onSuccess: (_, { registrationId }) => {
      queryClient.invalidateQueries({ queryKey: REG_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: [...REG_QUERY_KEY, 'detail', registrationId] })
      queryClient.invalidateQueries({ queryKey: WORKSHOPS_QUERY_KEY })
    },
  })
}

export function usePartialUpdateWorkshopRegistration() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      registrationId,
      body,
    }: {
      registrationId: string
      body: WorkshopsRegistrationsPartialUpdateData['body']
    }) => workshopsRegistrationsPartialUpdate({ path: { registration_id: registrationId }, body }),
    onSuccess: (_, { registrationId }) => {
      queryClient.invalidateQueries({ queryKey: REG_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: [...REG_QUERY_KEY, 'detail', registrationId] })
      queryClient.invalidateQueries({ queryKey: WORKSHOPS_QUERY_KEY })
    },
  })
}

export function useDeleteWorkshopRegistration() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (registrationId: string) =>
      workshopsRegistrationsDestroy({ path: { registration_id: registrationId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REG_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: WORKSHOPS_QUERY_KEY })
    },
  })
}

export function useCancelWorkshopRegistration() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (registrationId: string) =>
      workshopsRegistrationsCancelCreate({
        path: { registration_id: registrationId },
        body: {} as any,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REG_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: WORKSHOPS_QUERY_KEY })
    },
  })
}

export function useConfirmWorkshopRegistration() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (registrationId: string) =>
      workshopsRegistrationsConfirmCreate({
        path: { registration_id: registrationId },
        body: {} as any,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REG_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: WORKSHOPS_QUERY_KEY })
    },
  })
}

export function usePromoteWaitlistRegistration() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (registrationId: string) =>
      workshopsRegistrationsPromoteWaitlistCreate({
        path: { registration_id: registrationId },
        body: {} as any,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REG_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: WORKSHOPS_QUERY_KEY })
    },
  })
}
