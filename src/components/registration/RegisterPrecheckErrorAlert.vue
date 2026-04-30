<template>
  <div
    v-if="hasErrors"
    class="rounded-xl border border-red-300 bg-red-50 p-4 shadow-sm"
  >
    <div class="flex items-start gap-3">
      <svg class="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div class="min-w-0 flex-1">
        <p class="text-sm font-bold text-red-700 uppercase tracking-wide">Registration Validation Failed</p>
        <p class="mt-1 text-xs text-red-600">
          Please review the issues below before completing registration.
        </p>

        <!-- Booking-level errors -->
        <ul v-if="bookingErrors.length" class="mt-2 space-y-1">
          <li
            v-for="(code, i) in bookingErrors"
            :key="`booking-${i}`"
            class="flex items-start gap-1.5 text-xs text-red-700"
          >
            <span class="mt-0.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400"></span>
            {{ formatPrecheckErrorCode(code) }}
          </li>
        </ul>

        <!-- Per-attendee errors -->
        <div v-if="attendeeErrors.length" class="mt-2 space-y-2">
          <div
            v-for="item in attendeeErrors"
            :key="`attendee-${item.index}`"
          >
            <p class="text-xs font-semibold text-red-700">Attendee {{ item.index + 1 }}:</p>
            <ul class="mt-0.5 space-y-1">
              <li
                v-for="(code, i) in item.codes"
                :key="`attendee-${item.index}-${i}`"
                class="flex items-start gap-1.5 text-xs text-red-700"
              >
                <span class="mt-0.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400"></span>
                {{ formatPrecheckErrorCode(code) }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PrecheckAttendeeError } from '~/composables/registration/usePrecheckValidation'
import { formatPrecheckErrorCode } from '~/composables/registration/usePrecheckValidation'

const props = defineProps<{
  bookingErrors: string[]
  attendeeErrors: PrecheckAttendeeError[]
}>()

const hasErrors = computed(() => props.bookingErrors.length > 0 || props.attendeeErrors.length > 0)
</script>
