import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { 
  eventListAvailabilityTemplatesList, 
  eventListApplyAvailabilityTemplateCreate, 
  eventListSaveWindowsAsTemplateCreate,
  eventListAvailabilityTemplatesManagePartialUpdate,
  eventListAvailabilityTemplatesManageDestroy,
  eventListPreviewTemplateApplicationRetrieve
} from '~/api/sdk.gen'
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
 * Preview template application (check for conflicts)
 */
export function usePreviewTemplateApplication(eventId: MaybeRefOrGetter<string>) {
  return useMutation({
    mutationFn: async (templateId: string) => {
      const response = await eventListPreviewTemplateApplicationRetrieve({
        path: { event_id: toValue(eventId) },
        query: { template_id: templateId },
      })
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
 * Update template metadata (name and description only)
 */
export function useUpdateAvailabilityTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ templateId, data }: { templateId: string; data: { name?: string; description?: string } }) => {
      const response = await eventListAvailabilityTemplatesManagePartialUpdate({
        query: { template_id: templateId },
        body: data,
      })
      return response.data
    },
    onSuccess: () => {
      // Invalidate templates list to show updated template
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Delete a template
 */
export function useDeleteAvailabilityTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (templateId: string) => {
      await eventListAvailabilityTemplatesManageDestroy({
        query: { template_id: templateId },
      })
    },
    onSuccess: () => {
      // Invalidate templates list to remove deleted template
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
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
