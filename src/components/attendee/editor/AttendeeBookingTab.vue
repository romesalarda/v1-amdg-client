<template>
  <div>
    <div v-if="booking.isLoading.value" class="text-center py-8 text-gray-500 text-sm">
      Loading booking...
    </div>
    <div v-else-if="!attendee?.booking || !booking.data.value?.data" class="text-center py-8 text-gray-500 text-sm">
      <UIcon name="i-heroicons-exclamation-circle" class="w-8 h-8 mx-auto mb-2 text-gray-400" />
      <p>No booking linked to this attendee</p>
    </div>
    <div v-else class="space-y-4">
      <div>
        <h3 class="text-xs font-black text-primary uppercase tracking-widest mb-2">Booking Details</h3>
        <dl class="grid grid-cols-2 gap-3">
          <div>
            <dt class="text-xs font-semibold text-gray-500 uppercase">Booking Reference</dt>
            <dd class="mt-0.5 text-sm text-gray-900 font-mono">{{ booking.data.value.data.booking_reference }}</dd>
          </div>
          <div>
            <dt class="text-xs font-semibold text-gray-500 uppercase">Booked At</dt>
            <dd class="mt-0.5 text-sm text-gray-900">{{ new Date(booking.data.value.data.booked_at).toLocaleString() }}</dd>
          </div>
          <div>
            <dt class="text-xs font-semibold text-gray-500 uppercase">Made By</dt>
            <dd class="mt-0.5 text-sm text-gray-900">{{ booking.data.value.data.made_by_name || 'N/A' }}</dd>
          </div>
          <div>
            <dt class="text-xs font-semibold text-gray-500 uppercase">Attendee Count</dt>
            <dd class="mt-0.5 text-sm text-gray-900">{{ booking.data.value.data.attendee_count }}</dd>
          </div>
        </dl>
      </div>

      <div v-if="booking.data.value.data.payments?.length" class="pt-4 border-t border-gray-200">
        <h3 class="text-xs font-black text-primary uppercase tracking-widest mb-2">Payment Information</h3>
        <div class="space-y-2">
          <div v-for="payment in booking.data.value.data.payments" :key="payment.payment_id" class="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <div>
              <p class="text-xs font-semibold text-gray-900">{{ payment.payment_reference }}</p>
              <p class="text-xs text-gray-600">{{ payment.original_amount }} -> {{ payment.final_amount }}</p>
            </div>
            <div class="flex">
              <UBadge
                :color="payment.status === 'COMPLETED' ? 'green' : payment.status === 'PENDING' ? 'amber' : 'red'"
                variant="soft"
                size="xs"
              >
                {{ payment.status.toUpperCase().replaceAll('_', ' ') }}
              </UBadge>
              <NuxtLink
                :to="`/events/${eventId}/m/payments/list?payment=${payment.payment_id}`"
                class="ml-4 text-xs text-primary hover:underline"
              >
                View Payment
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <div v-if="booking.data.value.data.tickets?.length" class="pt-4 border-t border-gray-200">
        <h3 class="text-xs font-black text-primary uppercase tracking-widest mb-2">Tickets</h3>
        <div class="space-y-2">
          <div v-for="ticket in booking.data.value.data.tickets" :key="ticket.ticket_id" class="p-3 rounded-lg bg-gray-50 border border-gray-200 text-left transition-colors hover:bg-primary/5 hover:border-primary/30 cursor-pointer"
            @click="navigateTo(`/events/${eventId}/m/participants/dashboard?view=tickets&ticket_id=${ticket.ticket_id}`)"
          >
            <div>
              <p class="text-xs font-semibold text-gray-900 font-mono">{{ ticket.ticket_code }}</p>
              <p class="text-xs text-gray-600">{{ ticket.attendee_name }}</p>
            </div>
            <UBadge
              :color="ticket.status === 'ACTIVE' ? 'green' : 'gray'"
              variant="soft"
              size="xs"
            >
              {{ ticket.status }}
            </UBadge>
          </div>
        </div>
      </div>

      <div v-if="booking.data.value.data.attendees?.length > 1" class="pt-4 border-t border-gray-200">
        <h3 class="text-xs font-black text-primary uppercase tracking-widest mb-2">Other Attendees in this Booking</h3>
        <div class="space-y-2">
          <NuxtLink
            v-for="siblingAttendee in booking.data.value.data.attendees.filter((a: any) => a.id !== attendeeId)"
            :key="siblingAttendee.id"
            :to="`/events/${eventId}/m/participants/editor/${siblingAttendee.id}`"
            class="block p-2 bg-gray-50 rounded-lg hover:bg-primary/5 transition-colors"
          >
            <p class="text-xs font-semibold text-primary">{{ siblingAttendee.name }}</p>
            <p class="text-xs text-gray-600">{{ siblingAttendee.display_id }}</p>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  attendee: any
  booking: any
  attendeeId: string
  eventId: string
}>()
</script>
