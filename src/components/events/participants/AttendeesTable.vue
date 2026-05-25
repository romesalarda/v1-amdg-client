<template>
  <div class="overflow-x-auto">
    <table class="w-full text-left text-sm">
      <thead>
        <tr class="border-b border-gray-200 bg-gray-50">
          <th class="py-3 px-4">
            <input
              :checked="selectAll"
              type="checkbox"
              @change="emit('toggle-select-all')"
              class="rounded border-gray-300 text-primary focus:ring-primary"
            />
          </th>
          <th
            class="py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
            @click="emit('set-sorting', 'attendee_display_id')"
          >
            <div class="flex items-center gap-1">
              ID
              <UIcon
                v-if="currentSort === 'attendee_display_id'"
                :name="sortDirection === 'asc' ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                class="w-4 h-4"
              />
            </div>
          </th>
          <th
            class="py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
            @click="emit('set-sorting', 'first_name')"
          >
            <div class="flex items-center gap-1">
              Name
              <UIcon
                v-if="currentSort === 'first_name'"
                :name="sortDirection === 'asc' ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                class="w-4 h-4"
              />
            </div>
          </th>
          <th class="py-3 px-4 font-semibold text-gray-700">Email</th>
          <th
            class="py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
            @click="emit('set-sorting', 'age')"
          >
            <div class="flex items-center gap-1">
              Age
              <UIcon
                v-if="currentSort === 'age'"
                :name="sortDirection === 'asc' ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                class="w-4 h-4"
              />
            </div>
          </th>
          <th class="py-3 px-4 font-semibold text-gray-700">Gender</th>
          <th class="py-3 px-4 font-semibold text-gray-700">Area</th>
          <th class="py-3 px-4 font-semibold text-gray-700">Status</th>
          <th class="py-3 px-4 font-semibold text-gray-700 text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="attendee in attendees"
          :key="attendee.attendee_id"
          class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <td class="py-3 px-4">
            <input
              :checked="selectedAttendees.includes(attendee.attendee_id)"
              type="checkbox"
              :value="attendee.attendee_id"
              @change="onCheckboxChange(attendee.attendee_id)"
              class="rounded border-gray-300 text-primary focus:ring-primary"
            />
          </td>
          <td class="py-3 px-4">
            <span class="font-mono text-xs text-gray-600">{{ attendee.attendee_display_id }}</span>
          </td>
          <td class="py-3 px-4">
            <div class="flex items-center gap-2">
              <div>
                <div class="font-semibold text-gray-900">{{ attendee.full_name }}</div>
                <div class="text-xs text-gray-500">{{ attendee.phone_number || 'No phone' }}</div>
              </div>
              <div class="flex gap-1">
                <UBadge v-if="attendee.is_minor" color="amber" variant="soft" size="xs">Minor</UBadge>
                <UBadge v-if="(attendee as any).is_event_staff" color="purple" variant="soft" size="xs">Staff</UBadge>
              </div>
            </div>
          </td>
          <td class="py-3 px-4 text-gray-600">
            {{ attendee.email || 'No email' }}
          </td>
          <td class="py-3 px-4 text-gray-600">
            {{ attendee.age }}
          </td>
          <td class="py-3 px-4 text-gray-600">
            {{ attendee.gender || '-' }}
          </td>
          <td class="py-3 px-4 text-gray-600 text-xs">
            {{ attendee.area_from_name || '-' }}
          </td>
          <td class="py-3 px-4">
            <UBadge
              :color="(attendee as any).is_checked_in ? 'green' : 'gray'"
              variant="soft"
              size="xs"
            >
              {{ (attendee as any).status }}
            </UBadge>
          </td>
          <td class="py-3 px-4">
            <div class="flex items-center justify-end gap-1">
              <UButton
                size="xs"
                variant="ghost"
                color="gray"
                icon="i-heroicons-eye"
                @click="emit('view-details', attendee)"
                title="Quick view"
              />
              <UButton
                size="xs"
                variant="ghost"
                color="gray"
                icon="i-heroicons-pencil"
                :to="`/events/${eventId}/m/participants/editor/${attendee.attendee_id}`"
                title="Edit details"
              />
              <UButton
                size="xs"
                variant="ghost"
                color="red"
                icon="i-heroicons-trash"
                title="Remove attendee"
                @click="emit('open-removal', attendee)"
              />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { ExtendedAttendeeList } from '~/composables/participants/useParticipantsDashboardData'

const props = defineProps<{
  attendees: ExtendedAttendeeList[]
  currentSort: string
  sortDirection: 'asc' | 'desc'
  selectedAttendees: string[]
  selectAll: boolean
  eventId: string
}>()

const emit = defineEmits<{
  (e: 'set-sorting', field: string): void
  (e: 'toggle-select-all'): void
  (e: 'update:selectedAttendees', value: string[]): void
  (e: 'view-details', attendee: ExtendedAttendeeList): void
  (e: 'open-removal', attendee: ExtendedAttendeeList): void
}>()

function onCheckboxChange(attendeeId: string) {
  const current = [...props.selectedAttendees]
  const idx = current.indexOf(attendeeId)
  if (idx === -1) {
    current.push(attendeeId)
  } else {
    current.splice(idx, 1)
  }
  emit('update:selectedAttendees', current)
}
</script>
