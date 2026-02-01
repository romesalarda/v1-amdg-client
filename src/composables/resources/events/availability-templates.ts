import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { eventListAvailabilityTemplatesList, eventListApplyAvailabilityTemplateCreate, eventListSaveWindowsAsTemplateCreate } from '~/api/sdk.gen'
import type { AvailabilityWindowTemplate } from '~/api/types.gen'

const QUERY_KEY = ['events', 'availabilityTemplates']

/**
 * Fetch availability window templates for the organization
 */
export function useAvailabilityTemplates() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const response = await eventListAvailabilityTemplatesList()
      return response.data
    },
  })
}

/**
 * Apply a template to an event
 */
export function useApplyAvailabilityTemplate(eventId: MaybeRefOrGetter<string>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (templateId: string) => {
      const response = await eventListApplyAvailabilityTemplateCreate({
        path: { event_id: toValue(eventId) },
        body: { template_id: templateId },
      })
      return response.data
    },
    onSuccess: () => {
      // Invalidate availability windows to refetch
      queryClient.invalidateQueries({ queryKey: ['events', 'availabilityWindows', toValue(eventId)] })
    },
  })
}

/**
 * Save current event's windows as a template
 */
export function useSaveWindowsAsTemplate(eventId: MaybeRefOrGetter<string>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const response = await eventListSaveWindowsAsTemplateCreate({
        path: { event_id: toValue(eventId) },
        body: data,
      })
      return response.data
    },
    onSuccess: () => {
      // Invalidate templates list to show new template
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}
