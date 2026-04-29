import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { createStripeConnectOnboardingLink, getStripeConnectStatus } from '~/api/sdk.gen'

const QUERY_KEY = ['stripeConnect'] as const

export function useStripeConnectStatus() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => getStripeConnectStatus(),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchInterval: (query) => {
      const status = (query.state.data as any)?.data?.status
      return status === 'ACTIVE' ? false : 5_000
    },
  })
}

export function useCreateStripeConnectOnboardingLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (forceNew?: boolean) => {
      // Pass force_new in the request body if creating a new account
      if (forceNew) {
        return createStripeConnectOnboardingLink({ body: { force_new: true } })
      }
      return createStripeConnectOnboardingLink({ body: { force_new: false } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      // Also invalidate the connected accounts list
      queryClient.invalidateQueries({ queryKey: ['stripeConnectedAccounts'] })
    },
  })
}