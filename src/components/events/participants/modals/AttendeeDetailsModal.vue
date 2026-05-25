<template>
  <UModal :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <div v-if="attendee" class="p-6">
      <div class="flex items-start justify-between mb-4">
        <div>
          <h3 class="text-xl font-bold text-gray-900">{{ attendee.full_name }}</h3>
          <p class="text-sm text-gray-500">{{ attendee.attendee_display_id }}</p>
        </div>
        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-x-mark"
          @click="emit('update:modelValue', false)"
        />
      </div>

      <div class="space-y-4">
        <div class="flex gap-2">
          <UBadge v-if="attendee.is_minor" color="amber" variant="soft">Minor</UBadge>
          <UBadge v-if="(attendee as any).is_event_staff" color="purple" variant="soft">Staff</UBadge>
          <UBadge :color="(attendee as any).is_checked_in ? 'green' : 'gray'" variant="soft">
            {{ (attendee as any).is_checked_in ? 'Checked In' : 'Not Checked In' }}
          </UBadge>
        </div>

        <div class="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase">Email</p>
            <p class="text-sm text-gray-900">{{ attendee.email || 'N/A' }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase">Phone</p>
            <p class="text-sm text-gray-900">{{ attendee.phone_number || 'N/A' }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase">Age</p>
            <p class="text-sm text-gray-900">{{ attendee.age }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase">Gender</p>
            <p class="text-sm text-gray-900">{{ attendee.gender || 'N/A' }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase">Area From</p>
            <p class="text-sm text-gray-900">{{ (attendee as any).area_from_name || 'N/A' }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase">Relationship</p>
            <p class="text-sm text-gray-900">{{ attendee.relationship_display }}</p>
          </div>
        </div>
        <div class="pt-4 border-t p-2 m-2">
          <UButton
            block
            variant="solid"
            class="mb-2"
            color="primary"
            :to="`/events/${eventId}/m/participants/editor/${attendee.attendee_id}?tab=booking`"
          >
            View booking
          </UButton>
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
    </div>
  </UModal>
</template>

<script setup lang="ts">
import type { ExtendedAttendeeList } from '~/composables/participants/useParticipantsDashboardData'

defineProps<{
  modelValue: boolean
  attendee: ExtendedAttendeeList | null
  eventId: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()
</script>
