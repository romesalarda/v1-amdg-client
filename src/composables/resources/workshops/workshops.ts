import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  workshopsListList,
  workshopsListRetrieve,
  workshopsListCreate,
  workshopsListPartialUpdate,
  workshopsListUpdate,
  workshopsListDestroy,
  workshopsListOpenRegistrationsCreate,
  workshopsListCloseRegistrationsCreate,
  workshopsListRunAllocationCreate,
  workshopsListRegistrationsList,
} from '~/api/sdk.gen'
import type {
  WorkshopsListListData,
  WorkshopsListCreateData,
  WorkshopsListPartialUpdateData,
  WorkshopsListUpdateData,
  WorkshopsListRegistrationsListData,
} from '~/api/types.gen'

export const WORKSHOPS_QUERY_KEY = ['workshops'] as const

// ─── Allocation result type ────────────────────────────────────────────────────
// Derived from allocation.py: {'placed': placed, 'waitlisted': waitlisted, 'unplaced': unplaced}
export interface WorkshopAllocationResult {
  placed: number
  waitlisted: number
  unplaced: number
}

function parseAllocationResult(raw: unknown): WorkshopAllocationResult {
  if (raw && typeof raw === 'object') {
    const r = raw as Record<string, unknown>
    return {
      placed: typeof r.placed === 'number' ? r.placed : 0,
      waitlisted: typeof r.waitlisted === 'number' ? r.waitlisted : 0,
      unplaced: typeof r.unplaced === 'number' ? r.unplaced : 0,
    }
  }
  return { placed: 0, waitlisted: 0, unplaced: 0 }
}

// ─── Queries ───────────────────────────────────────────────────────────────────

export function useWorkshops(params?: MaybeRefOrGetter<WorkshopsListListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...WORKSHOPS_QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return workshopsListList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

export function useWorkshop(workshopId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...WORKSHOPS_QUERY_KEY, 'detail', workshopId] as const,
    queryFn: () => {
      const id = toValue(workshopId)
      return workshopsListRetrieve({ path: { id } })
    },
    enabled: () => !!toValue(workshopId),
  })
}

export function useWorkshopRegistrationsByWorkshop(
  workshopId: MaybeRefOrGetter<number>,
  params?: MaybeRefOrGetter<Omit<WorkshopsListRegistrationsListData['query'], never> | undefined>,
) {
  return useQuery({
    queryKey: [...WORKSHOPS_QUERY_KEY, 'registrations', workshopId, params] as const,
    queryFn: () => {
      const id = toValue(workshopId)
      const queryParams = toValue(params)
      return workshopsListRegistrationsList({ path: { id }, query: queryParams })
    },
    enabled: () => !!toValue(workshopId),
  })
}

// ─── Mutations ─────────────────────────────────────────────────────────────────

export function useCreateWorkshop() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: WorkshopsListCreateData['body']) => workshopsListCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKSHOPS_QUERY_KEY })
    },
  })
}

export function useUpdateWorkshop() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: WorkshopsListUpdateData['body'] }) =>
      workshopsListUpdate({ path: { id }, body }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: WORKSHOPS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: [...WORKSHOPS_QUERY_KEY, 'detail', id] })
    },
  })
}

export function usePartialUpdateWorkshop() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: WorkshopsListPartialUpdateData['body'] }) =>
      workshopsListPartialUpdate({ path: { id }, body }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: WORKSHOPS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: [...WORKSHOPS_QUERY_KEY, 'detail', id] })
    },
  })
}

export function useDeleteWorkshop() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => workshopsListDestroy({ path: { id } }),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: WORKSHOPS_QUERY_KEY })
      queryClient.removeQueries({ queryKey: [...WORKSHOPS_QUERY_KEY, 'detail', id] })
    },
  })
}

export function useOpenWorkshopRegistrations() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      workshopsListOpenRegistrationsCreate({ path: { id }, body: {} as any }),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: WORKSHOPS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: [...WORKSHOPS_QUERY_KEY, 'detail', id] })
    },
  })
}

export function useCloseWorkshopRegistrations() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      workshopsListCloseRegistrationsCreate({ path: { id }, body: {} as any }),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: WORKSHOPS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: [...WORKSHOPS_QUERY_KEY, 'detail', id] })
    },
  })
}

export function useRunWorkshopAllocation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number): Promise<WorkshopAllocationResult> => {
      const response = await workshopsListRunAllocationCreate({ path: { id }, body: {} as any })
      return parseAllocationResult(response.data)
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: WORKSHOPS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: [...WORKSHOPS_QUERY_KEY, 'detail', id] })
      queryClient.invalidateQueries({ queryKey: [...WORKSHOPS_QUERY_KEY, 'registrations', id] })
    },
  })
}
