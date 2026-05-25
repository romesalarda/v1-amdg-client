<template>
  <UModal :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <div class="p-6">
      <div class="flex items-start justify-between mb-4">
        <div>
          <h3 class="text-xl font-bold text-gray-900 font-mono">{{ selectedBooking?.booking_reference || 'Booking details' }}</h3>
          <p class="text-sm text-gray-500">Booking Details</p>
        </div>
        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-x-mark"
          @click="emit('update:modelValue', false)"
        />
      </div>

      <div v-if="isLoading" class="space-y-2">
        <div v-for="i in 4" :key="i" class="h-12 bg-gray-100 rounded-lg animate-pulse" />
      </div>

      <div v-else-if="selectedBooking" class="space-y-4">
        <div class="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase">Made By</p>
            <p class="text-sm text-gray-900">{{ selectedBooking.made_by_name || 'N/A' }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase">Booked At</p>
            <p class="text-sm text-gray-900">{{ new Date(selectedBooking.booked_at).toLocaleString() }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase">Attendee Count</p>
            <p class="text-sm text-gray-900">{{ selectedBooking.attendee_count }}</p>
          </div>
        </div>

        <div v-if="selectedBooking.attendees && selectedBooking.attendees.length > 0" class="pt-4 border-t">
          <p class="text-xs font-semibold text-gray-500 uppercase mb-2">Attendees</p>
          <div class="space-y-2 max-h-48 overflow-y-auto">
            <NuxtLink
              v-for="attendee in selectedBooking.attendees"
              :key="attendee.id"
              :to="attendee.id ? `/events/${eventId}/m/participants/editor/${attendee.id}` : '#'"
              class="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
            >
              <div>
                <p class="text-sm font-medium text-gray-900">{{ attendee.name || 'Unknown attendee' }}</p>
                <p class="text-xs text-gray-500">{{ attendee.display_id || 'No attendee ID' }}</p>
              </div>
              <UIcon name="i-heroicons-chevron-right" class="w-4 h-4 text-gray-400" />
            </NuxtLink>
          </div>
        </div>

        <div v-if="selectedBooking.payments && selectedBooking.payments.length > 0" class="pt-4 border-t">
          <p class="text-xs font-semibold text-gray-500 uppercase mb-2">Payments</p>
          <div class="space-y-2">
            <button
              v-for="payment in selectedBooking.payments"
              :key="payment.payment_id"
              type="button"
              class="w-full flex items-center justify-between p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
              @click="emit('go-to-payment', payment.payment_reference)"
            >
              <div>
                <p class="text-sm font-medium text-gray-900">{{ payment.payment_reference || payment.payment_id }}</p>
                <p class="text-xs text-gray-500">{{ payment.amount ? `${payment.amount}` : 'Amount unavailable' }}</p>
              </div>
              <div class="flex items-center gap-2">
                <UBadge
                  :color="payment.status === 'COMPLETED' ? 'green' : payment.status === 'PENDING' ? 'amber' : 'red'"
                  variant="soft"
                  size="xs"
                >
                  {{ payment.status || 'UNKNOWN' }}
                </UBadge>
                <UIcon name="i-heroicons-arrow-top-right-on-square" class="w-4 h-4 text-gray-400" />
              </div>
            </button>
          </div>
        </div>

        <div v-if="selectedBooking.tickets && selectedBooking.tickets.length > 0" class="pt-4 border-t">
          <p class="text-xs font-semibold text-gray-500 uppercase mb-2">Tickets</p>
          <div class="space-y-2">
            <div
              v-for="ticket in selectedBooking.tickets"
              :key="ticket.ticket_id"
              class="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
            >
              <div>
                <p class="text-sm font-medium text-gray-900 font-mono">{{ ticket.ticket_code }}</p>
                <p class="text-xs text-gray-500">{{ ticket.attendee_name }}</p>
              </div>
              <UBadge
                :color="ticket.status === 'USED' ? 'gray' : ticket.status === 'ACTIVE' ? 'green' : 'red'"
                variant="soft"
                size="xs"
              >
                {{ ticket.status || 'UNKNOWN' }}
              </UBadge>
            </div>
          </div>
        </div>

        <div class="pt-4 border-t flex gap-2">
          <UButton
            block
            variant="outline"
            color="gray"
            @click="emit('update:modelValue', false)"
          >
            Close
          </UButton>
        </div>
      </div>

      <div v-else class="text-sm text-gray-500 pt-4 border-t">
        Unable to load booking details.
      </div>
    </div>
  </UModal>
</template>

<script setup lang="ts">
import { useBooking } from '~/composables/resources/booking/bookings'
import type { BookingDetail } from '~/api/types.gen'

const props = defineProps<{
  modelValue: boolean
  bookingId: number | null
  eventId: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'go-to-payment', reference: string | undefined): void
}>()

const bookingIdRef = computed(() => props.bookingId || 0)
const { data: selectedBookingData, isLoading } = useBooking(bookingIdRef)

const selectedBooking = computed(() => selectedBookingData.value?.data as BookingDetail | undefined)

watch(() => props.modelValue, (isOpen) => {
  if (!isOpen) {
    // bookingId will be cleared by parent — nothing to reset here
  }
})
</script>
