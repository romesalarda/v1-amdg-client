import type { QueryClient } from '@tanstack/vue-query'
import { eventListSettingsRetrieve } from '~/api/sdk.gen'

type RestrictedSection = 'payments' | 'sponsors' | 'shop'

const restrictedSectionSettings: Record<RestrictedSection, string> = {
  payments: 'payment_enabled',
  sponsors: 'accepting_sponsorships_enabled',
  shop: 'product_selling_enabled',
}

export default defineNuxtRouteMiddleware(async (to) => {
  const section = getManagementSection(to.path)

  if (!section) {
    return
  }

  const eventId = String(to.params.id || '')
  if (!eventId) {
    return
  }

  try {
    const settings = await getEventSettings(eventId)
    const requiredSetting = restrictedSectionSettings[section]
    const isEnabled = Boolean(settings?.[requiredSetting])

    if (isEnabled) {
      return
    }

    return navigateTo({
      path: `/events/${eventId}/m/dashboard`,
      query: {
        error: 'section_disabled',
        section,
      },
    })
  } catch (error) {
    console.error('[event-management-settings] failed to validate section access', error)
    return navigateTo(`/events/${eventId}/m/dashboard`)
  }
})

function getManagementSection(path: string): RestrictedSection | null {
  const match = path.match(/^\/events\/[^/]+\/m\/([^/?#]+)/)
  const section = match?.[1]

  if (section === 'payments' || section === 'sponsors' || section === 'shop') {
    return section
  }

  return null
}

async function getEventSettings(eventId: string) {
  const { $queryClient } = useNuxtApp()
  const queryClient = $queryClient as QueryClient | undefined
  const queryKey = ['eventSettings', 'event', eventId] as const

  const cached = queryClient?.getQueryData(queryKey) as any
  if (cached?.data) {
    return cached.data
  }

  const response = await eventListSettingsRetrieve({
    path: { event_id: eventId },
  })

  if (queryClient) {
    queryClient.setQueryData(queryKey, response)
  }

  return response.data
}
