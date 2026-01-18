import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  paymentsDonationsList,
  paymentsDonationsRetrieve,
  paymentsDonationsCreate,
  paymentsDonationsUpdate,
  paymentsDonationsPartialUpdate,
  paymentsDonationsDestroy,
  paymentsDonationsCreateWithPaymentCreate,
  paymentsDonationsVerifyDonationCreate,
} from '~/api/sdk.gen'
import type {
  PaymentsDonationsListData,
  PaymentsDonationsCreateData,
  PaymentsDonationsUpdateData,
  PaymentsDonationsPartialUpdateData,
  PaymentsDonationsDestroyData,
  PaymentsDonationsCreateWithPaymentCreateData,
  PaymentsDonationsVerifyDonationCreateData,
} from '~/api/types.gen'

const QUERY_KEY = ['paymentDonations'] as const

/**
 * List all donations
 */
export function usePaymentDonations(params?: MaybeRefOrGetter<PaymentsDonationsListData['query'] | undefined>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params] as const,
    queryFn: () => {
      const queryParams = toValue(params)
      return paymentsDonationsList(queryParams ? { query: queryParams } : undefined)
    },
  })
}

/**
 * Get a single donation by ID
 */
export function usePaymentDonation(donationId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', donationId] as const,
    queryFn: () => {
      const id = toValue(donationId)
      return paymentsDonationsRetrieve({ path: { donation_id: String(id) } })
    },
    enabled: () => !!toValue(donationId),
  })
}

/**
 * Create a new donation
 */
export function useCreatePaymentDonation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: PaymentsDonationsCreateData['body']) => paymentsDonationsCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Create a donation with associated payment in one step
 */
export function useCreatePaymentDonationWithPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: PaymentsDonationsCreateWithPaymentCreateData['body']) => paymentsDonationsCreateWithPaymentCreate({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['payments'] })
    },
  })
}

/**
 * Verify a donation
 */
export function useVerifyPaymentDonation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ donationId, body }: { donationId: number; body: PaymentsDonationsVerifyDonationCreateData['body'] }) =>
      paymentsDonationsVerifyDonationCreate({ path: { donation_id: String(donationId) }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', String(variables.donationId)],
      })
    },
  })
}

/**
 * Update a donation (full update)
 */
export function useUpdatePaymentDonation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ donationId, body }: { donationId: number; body: PaymentsDonationsUpdateData['body'] }) =>
      paymentsDonationsUpdate({ path: { donation_id: String(donationId) }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', String(variables.donationId)],
      })
    },
  })
}

/**
 * Partially update a donation
 */
export function usePartialUpdatePaymentDonation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ donationId, body }: { donationId: number; body?: PaymentsDonationsPartialUpdateData['body'] }) =>
      paymentsDonationsPartialUpdate({ path: { donation_id: String(donationId) }, body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'detail', String(variables.donationId)],
      })
    },
  })
}

/**
 * Delete a donation
 */
export function useDeletePaymentDonation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (donationId: number) => paymentsDonationsDestroy({ path: { donation_id: String(donationId) } }),
    onSuccess: (_, donationId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.removeQueries({
        queryKey: [...QUERY_KEY, 'detail', String(donationId)],
      })
    },
  })
}
