import type { MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'
import { useBooking } from '~/composables/resources/booking/bookings'
import { useProductOrder } from '~/composables/resources/products/productOrders'
import { usePaymentDonation } from '~/composables/resources/payments/paymentDonations'

export type PaymentLiveRelationType = 'ORDER' | 'BOOKING' | 'DONATION' | 'UNKNOWN'

type UnknownRecord = Record<string, any>

interface UsePaymentLiveRelationOptions {
  payment: MaybeRefOrGetter<any>
}

function asObject(value: unknown): UnknownRecord | null {
  return value && typeof value === 'object' ? (value as UnknownRecord) : null
}

function parseOptionalInt(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function parseOptionalString(value: unknown): string | null {
  const parsed = String(value ?? '').trim()
  return parsed ? parsed : null
}

export function usePaymentLiveRelation(options: UsePaymentLiveRelationOptions) {
  const payment = computed(() => toValue(options.payment))

  const descriptor = computed(() => String(payment.value?.descriptor || '').toLowerCase())
  const metadata = computed<UnknownRecord | null>(() => asObject(payment.value?.metadata))

  const bookingId = computed<number | null>(() => {
    return parseOptionalInt(metadata.value?.booking_id)
  })

  const orderId = computed<string | null>(() => {
    return parseOptionalString(metadata.value?.order_id)
  })

  const donationId = computed<number | null>(() => {
    const directId = parseOptionalInt(metadata.value?.donation_id)
    if (directId) return directId

    return parseOptionalInt(metadata.value?.donation?.id)
  })

  const relationType = computed<PaymentLiveRelationType>(() => {
    const value = metadata.value

    if (orderId.value || Array.isArray(value?.order?.order_items) || descriptor.value.includes('order')) {
      return 'ORDER'
    }

    if (
      bookingId.value ||
      value?.booking_id ||
      value?.payment_type?.toLowerCase?.().includes('booking') ||
      value?.attendee_selections ||
      value?.checkout_attendees ||
      descriptor.value.includes('booking')
    ) {
      return 'BOOKING'
    }

    if (donationId.value || value?.donation || descriptor.value.includes('donation')) {
      return 'DONATION'
    }

    return 'UNKNOWN'
  })

  const activeBookingId = computed(() => (relationType.value === 'BOOKING' ? bookingId.value : null))
  const activeOrderId = computed(() => (relationType.value === 'ORDER' ? orderId.value : null))
  const activeDonationId = computed(() => (relationType.value === 'DONATION' ? donationId.value : null))

  const bookingQuery = useBooking(computed(() => activeBookingId.value || 0))
  const orderQuery = useProductOrder(computed(() => undefined), computed(() => activeOrderId.value || ''))
  const donationQuery = usePaymentDonation(computed(() => activeDonationId.value || 0))

  const liveData = computed<any | null>(() => {
    if (relationType.value === 'BOOKING') return bookingQuery.data.value?.data || null
    if (relationType.value === 'ORDER') return orderQuery.data.value?.data || null
    if (relationType.value === 'DONATION') return donationQuery.data.value?.data || null
    return null
  })

  const isLiveLoading = computed(() => {
    if (relationType.value === 'BOOKING') return bookingQuery.isLoading.value || bookingQuery.isFetching.value
    if (relationType.value === 'ORDER') return orderQuery.isLoading.value || orderQuery.isFetching.value
    if (relationType.value === 'DONATION') return donationQuery.isLoading.value || donationQuery.isFetching.value
    return false
  })

  const liveError = computed(() => {
    if (relationType.value === 'BOOKING') return bookingQuery.error.value || null
    if (relationType.value === 'ORDER') return orderQuery.error.value || null
    if (relationType.value === 'DONATION') return donationQuery.error.value || null
    return null
  })

  const missingRelationId = computed(() => {
    if (relationType.value === 'BOOKING') return !activeBookingId.value
    if (relationType.value === 'ORDER') return !activeOrderId.value
    if (relationType.value === 'DONATION') return !activeDonationId.value
    return false
  })

  const hasLiveData = computed(() => !!liveData.value)
  const hasLiveRelation = computed(() => relationType.value !== 'UNKNOWN')

  const fallbackReason = computed(() => {
    if (relationType.value === 'UNKNOWN') return 'No live relation type could be determined for this payment.'
    if (missingRelationId.value) return 'Live relation id is missing in payment metadata.'
    if (liveError.value) return 'Unable to fetch live relation data. Falling back to metadata snapshot.'
    return ''
  })

  const shouldFallbackToMetadata = computed(() => {
    if (relationType.value === 'UNKNOWN') return true
    if (missingRelationId.value) return true
    if (liveError.value) return true
    return false
  })

  return {
    relationType,
    metadata,
    bookingId,
    orderId,
    donationId,
    hasLiveRelation,
    hasLiveData,
    liveData,
    isLiveLoading,
    liveError,
    fallbackReason,
    shouldFallbackToMetadata,
    missingRelationId,
  }
}
