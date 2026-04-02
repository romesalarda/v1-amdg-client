import { computed, ref } from 'vue'
import { locationsPoisList, locationsVenuesList } from '~/api/sdk.gen'
import { useCreateLocationPoi } from '~/composables/resources/locations/locationPois'
import { useCreateLocationVenue } from '~/composables/resources/locations/locationVenues'

function toPositiveId(value: unknown): number | null {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed <= 0)
    return null

  return parsed
}

function parseTrailingIdFromUrl(url: unknown): number | null {
  if (typeof url !== 'string')
    return null

  const match = url.match(/\/(\d+)\/?$/)
  return match ? toPositiveId(match[1]) : null
}

function extractIdFromResponseData(data: any): number | null {
  const directId =
    toPositiveId(data?.id)
    ?? toPositiveId(data?.pk)
    ?? toPositiveId(data?.venue_id)
    ?? toPositiveId(data?.poi_id)

  if (directId)
    return directId

  return parseTrailingIdFromUrl(data?._links?.self)
}

function extractIdFromResponseHeaders(response: any): number | null {
  const headers = response?.response?.headers
  if (!headers?.get)
    return null

  return (
    parseTrailingIdFromUrl(headers.get('Location'))
    ?? parseTrailingIdFromUrl(headers.get('location'))
    ?? parseTrailingIdFromUrl(headers.get('Content-Location'))
    ?? parseTrailingIdFromUrl(headers.get('content-location'))
  )
}

function normalize(value?: string | null): string {
  return (value || '').trim().toLowerCase()
}

function getApiErrorMessage(response: any): string | null {
  if (!response?.error)
    return null

  const error = response.error as any
  if (typeof error === 'string')
    return error

  if (Array.isArray(error))
    return error.join(', ')

  if (typeof error?.detail === 'string')
    return error.detail

  if (typeof error?.message === 'string')
    return error.message

  return 'Request failed. Please check the input and try again.'
}

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
      const poiError = getApiErrorMessage(poiResponse)
      if (poiError) {
        throw new Error(poiError)
      }

      let poiId =
        extractIdFromResponseData(poiResponse?.data)
        ?? extractIdFromResponseHeaders(poiResponse)

      if (!poiId) {
        const poiLookupResponse = await locationsPoisList({
          query: {
            search: payload.poi.name,
            city: payload.poi.city || undefined,
            postcode: payload.poi.postcode || undefined,
            poi_type: payload.poi.poi_type,
            ordering: '-id',
            page_size: 25,
          },
        })

        const poiCandidates = extractResults<any>(poiLookupResponse).filter(item =>
          normalize(item.name) === normalize(payload.poi.name)
          && normalize(item.address) === normalize(payload.poi.address)
          && normalize(item.city) === normalize(payload.poi.city)
          && normalize(item.postcode) === normalize(payload.poi.postcode)
          && item.poi_type === payload.poi.poi_type,
        )

        poiId = toPositiveId(poiCandidates[0]?.id)
      }

      if (!poiId) {
        throw new Error('POI was created but no ID could be resolved from the API response.')
      }

      const venueResponse = await createVenueMutation.mutateAsync({
        poi: poiId,
        description: payload.venue.description || '',
        instructions: payload.venue.instructions || '',
        notes: payload.venue.notes || '',
        capacity: payload.venue.capacity ?? null,
      })

      const venueError = getApiErrorMessage(venueResponse)
      if (venueError) {
        throw new Error(venueError)
      }

      let venueId =
        extractIdFromResponseData(venueResponse?.data)
        ?? extractIdFromResponseHeaders(venueResponse)

      if (!venueId) {
        const venueLookupResponse = await locationsVenuesList({
          query: {
            poi: poiId,
            ordering: '-id',
            page_size: 5,
          },
        })

        const venueCandidates = extractResults<any>(venueLookupResponse).filter(item => Number(item.poi) === poiId)
        venueId = toPositiveId(venueCandidates[0]?.id)
      }

      if (!venueId) {
        throw new Error('Venue was created but no ID could be resolved from the API response.')
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
