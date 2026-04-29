import { defineStore } from 'pinia'

type BookingShopState = {
  eventId: string | null
  bookingReference: string | null
  selectedAttendeeId: string | null
  activeOrderId: string | null
  selectedPaymentMethodId: number | null
}

export const useBookingShopStore = defineStore('booking-shop', {
  state: (): BookingShopState => ({
    eventId: null,
    bookingReference: null,
    selectedAttendeeId: null,
    activeOrderId: null,
    selectedPaymentMethodId: null,
  }),
  actions: {
    setScope(eventId: string, bookingReference: string) {
      const hasScopeChanged = this.eventId !== eventId || this.bookingReference !== bookingReference

      this.eventId = eventId
      this.bookingReference = bookingReference

      if (hasScopeChanged) {
        this.selectedAttendeeId = null
        this.activeOrderId = null
        this.selectedPaymentMethodId = null
      }
    },
    setSelectedAttendee(attendeeId: string | null) {
      if (this.selectedAttendeeId !== attendeeId) {
        this.selectedAttendeeId = attendeeId
        this.activeOrderId = null
      }
    },
    setActiveOrder(orderId: string | null) {
      this.activeOrderId = orderId
    },
    setSelectedPaymentMethod(paymentMethodId: number | null) {
      this.selectedPaymentMethodId = paymentMethodId
    },
    reset() {
      this.eventId = null
      this.bookingReference = null
      this.selectedAttendeeId = null
      this.activeOrderId = null
      this.selectedPaymentMethodId = null
    },
  },
})
