import { useRouter, useRoute } from '#app'
import { useRegistrationStore } from '~/stores/registration'

/**
 * Middleware to validate booking intent integrity on the registration page
 * 
 * This middleware ensures:
 * 1. A valid booking intent exists in the registration store
 * 2. URL parameters (event ID, ticket count) match the booking intent
 * 3. Redirects to the event index page if no valid intent is found
 * 4. Validates ticket count doesn't exceed intended ticket count
 */
export default defineNuxtRouteMiddleware((to, from) => {
  const router = useRouter()
  const route = useRoute()
  const registrationStore = useRegistrationStore()

  // Extract route parameters
  const eventId = String(to.params.id || '')
  const ticketsParam = Number(to.query.tickets || 1)

  // Preview mode bypasses booking intent requirement entirely
  const isPreview = String(to.query.preview || '').toLowerCase() === 'true'
  if (isPreview) {
    return
  }

  // Check if registration store has been initialized with an intent
  if (!registrationStore.bookingIntentId) {
    // No booking intent found - redirect to event index page
    return router.push({
      name: 'events-id',
      params: { id: eventId },
    })
  }

  // Validate that the event ID in the URL matches the booking intent's event
  if (registrationStore.eventId !== eventId) {
    // Event ID mismatch - redirect to the correct event
    return router.push({
      name: 'events-id',
      params: { id: eventId },
    })
  }

  // Validate that the ticket count matches or is less than the booking intent's intended count
  if (ticketsParam > registrationStore.ticketCount) {
    // Requested more tickets than the intent allows - redirect to event index
    return router.push({
      name: 'events-id',
      params: { id: eventId },
    })
  }

  // Additional validation: ensure the store's attendees array matches ticket count
  if (registrationStore.attendees.length !== registrationStore.ticketCount) {
    // Store state is inconsistent - this shouldn't happen in normal flow
    // but we'll redirect to be safe
    return router.push({
      name: 'events-id',
      params: { id: eventId },
    })
  }
})
