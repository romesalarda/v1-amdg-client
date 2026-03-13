import { computed, ref } from 'vue'
import { useCreateLocationPoi } from '~/composables/resources/locations/locationPois'
import { useCreateLocationVenue } from '~/composables/resources/locations/locationVenues'

export function useEventVenueManagement() {
  const isSubmitting = ref(false)
  const createPoiMutation = useCreateLocationPoi()
  const createVenueMutation = useCreateLocationVenue()

  const isBusy = computed(() => {
    return isSubmitting.value || createPoiMutation.isPending.value || createVenueMutation.isPending.value
  })

  const createVenueFromPoiAndVenueData = async (payload: {
    poi: {
      name: string
      address: string
      city?: string
      postcode?: string
      description?: string
      poi_type: 'VENUE' | 'SPORTS_VENUE'
      latitude?: string | null
      longitude?: string | null
    }
    venue: {
      description?: string
      instructions?: string
      notes?: string
      capacity?: number | null
    }
  }) => {
    isSubmitting.value = true

    try {
      const poiResponse = await createPoiMutation.mutateAsync(payload.poi)
      const poiId = Number((poiResponse.data as any)?.id)

      if (!poiId) {
        throw new Error('POI creation did not return an ID.')
      }

      const venueResponse = await createVenueMutation.mutateAsync({
        poi: poiId,
        description: payload.venue.description || '',
        instructions: payload.venue.instructions || '',
        notes: payload.venue.notes || '',
        capacity: payload.venue.capacity ?? null,
      })

      const venueId = Number((venueResponse.data as any)?.id)

      if (!venueId) {
        throw new Error('Venue creation did not return an ID.')
      }

      return {
        poiId,
        venueId,
        venue: venueResponse.data,
      }
    }
    finally {
      isSubmitting.value = false
    }
  }

  return {
    isBusy,
    createVenueFromPoiAndVenueData,
  }
}

export function extractResults<T>(response: any): T[] {
  if (!response?.data)
    return []

  if (Array.isArray(response.data))
    return response.data as T[]

  if (Array.isArray(response.data.results))
    return response.data.results as T[]

  return []
}
