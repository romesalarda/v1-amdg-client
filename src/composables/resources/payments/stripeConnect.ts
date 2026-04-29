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
    mutationFn: () => createStripeConnectOnboardingLink(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}