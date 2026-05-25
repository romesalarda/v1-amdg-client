<template>
  <div class="overflow-x-auto">
    <table class="w-full text-left text-sm">
      <thead>
        <tr class="border-b border-gray-200 bg-gray-50">
          <th
            class="py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
            @click="emit('set-sorting', 'booking_reference')"
          >
            <div class="flex items-center gap-1">
              Booking Reference
              <UIcon
                v-if="currentSort === 'booking_reference'"
                :name="sortDirection === 'asc' ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                class="w-4 h-4"
              />
            </div>
          </th>
          <th class="py-3 px-4 font-semibold text-gray-700">Made By</th>
          <th
            class="py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
            @click="emit('set-sorting', 'attendee_count')"
          >
            <div class="flex items-center gap-1">
              Attendees
              <UIcon
                v-if="currentSort === 'attendee_count'"
                :name="sortDirection === 'asc' ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                class="w-4 h-4"
              />
            </div>
          </th>
          <th
            class="py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
            @click="emit('set-sorting', 'booked_at')"
          >
            <div class="flex items-center gap-1">
              Booked At
              <UIcon
                v-if="currentSort === 'booked_at'"
                :name="sortDirection === 'asc' ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                class="w-4 h-4"
              />
            </div>
          </th>
          <th class="py-3 px-4 font-semibold text-gray-700 text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="booking in bookings"
          :key="booking.id"
          class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <td class="py-3 px-4">
            <span class="font-mono text-sm font-semibold text-gray-900">{{ booking.booking_reference }}</span>
          </td>
          <td class="py-3 px-4 text-gray-600">
            {{ booking.made_by_name || 'N/A' }}
          </td>
          <td class="py-3 px-4">
            <UBadge color="blue" variant="soft" size="xs">
              {{ booking.attendee_count }} {{ booking.attendee_count === 1 ? 'person' : 'people' }}
            </UBadge>
          </td>
          <td class="py-3 px-4 text-gray-600 text-xs">
            {{ new Date(booking.booked_at).toLocaleString() }}
          </td>
          <td class="py-3 px-4">
            <div class="flex items-center justify-end gap-1">
              <UButton
                size="xs"
                variant="ghost"
                color="gray"
                icon="i-heroicons-eye"
                title="View details"
                @click="emit('view-booking', booking)"
              >
                View
              </UButton>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { BookingList } from '~/api/types.gen'

defineProps<{
  bookings: BookingList[]
  currentSort: string
  sortDirection: 'asc' | 'desc'
}>()

const emit = defineEmits<{
  (e: 'set-sorting', field: string): void
  (e: 'view-booking', booking: BookingList): void
}>()
</script>
