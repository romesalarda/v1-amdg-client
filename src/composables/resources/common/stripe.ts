import { useQuery, useMutation } from '@tanstack/vue-query'
import {
  getStripeConfig,
  confirmPaymentIntent,
  createPaymentIntent,
} from '~/api/sdk.gen'
import type {
  ConfirmPaymentIntentData,
  CreatePaymentIntentData,
} from '~/api/types.gen'

const QUERY_KEY = ['stripe'] as const

/**
 * Get Stripe configuration (publishable key and test mode)
 */
export function useStripeConfig() {
  return useQuery({
    queryKey: [...QUERY_KEY, 'config'] as const,
    queryFn: () => getStripeConfig(),
  })
}

/**
 * Create a Stripe PaymentIntent
 */
export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: (body: CreatePaymentIntentData['body']) => createPaymentIntent({ body }),
  })
}

/**
 * Manually confirm a Stripe PaymentIntent
 */
export function useConfirmPaymentIntent() {
  return useMutation({
    mutationFn: (body: ConfirmPaymentIntentData['body']) => confirmPaymentIntent({ body }),
  })
}
