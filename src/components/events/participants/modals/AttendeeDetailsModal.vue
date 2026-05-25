<template>
  <UModal :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <div v-if="attendee" class="p-6 max-h-[85vh] overflow-y-auto space-y-4">

      <!-- Header -->
      <div class="flex items-start justify-between">
        <div>
          <h3 class="text-xl font-bold text-gray-900">{{ attendee.full_name }}</h3>
          <p class="text-sm text-gray-500 font-mono">{{ attendee.attendee_display_id }}</p>
        </div>
        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-x-mark"
          @click="emit('update:modelValue', false)"
        />
      </div>

      <!-- Status + tags -->
      <div class="flex flex-wrap gap-2">
        <UBadge :color="(statusColor(attendee.status) as any)" variant="solid" size="sm" class="font-semibold capitalize">
          {{ statusLabel(attendee.status) }}
        </UBadge>
        <UBadge v-if="attendee.is_minor" color="amber" variant="soft">Minor</UBadge>
        <UBadge v-if="(attendee as any).is_event_staff" color="purple" variant="soft">Staff</UBadge>
      </div>

      <!-- Basic info -->
      <div class="grid grid-cols-2 gap-3 pt-3 border-t">
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
          <p class="text-xs font-semibold text-gray-500 uppercase">Area</p>
          <p class="text-sm text-gray-900">{{ (attendee as any).area_from_name || 'N/A' }}</p>
        </div>
        <div>
          <p class="text-xs font-semibold text-gray-500 uppercase">Relationship</p>
          <p class="text-sm text-gray-900">{{ relationshipLabel }}</p>
        </div>
      </div>

      <!-- Tickets -->
      <div class="pt-3 border-t">
        <p class="text-xs font-semibold text-gray-500 uppercase mb-2">Tickets</p>
        <div v-if="loading" class="text-xs text-gray-400 py-2">Loading...</div>
        <div v-else-if="!tickets.length" class="text-xs text-gray-400 py-2">No active tickets found.</div>
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <NuxtLink
            v-for="ticket in tickets"
            :key="ticket.ticket_id"
            :to="`/events/${eventId}/m/participants/editor/${attendee.attendee_id}?tab=booking`"
            class="flex flex-col items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 hover:bg-gray-100 transition-colors"
          >
            <div class="flex items-center justify-center rounded bg-white border border-gray-200 p-1">
              <Qrcode
                v-if="ticket.qr_value"
                :value="ticket.qr_value"
                :width="120"
                :height="120"
                class="w-[120px] h-[120px]"
              />
              <UIcon v-else name="i-heroicons-ticket" class="w-16 h-16 text-gray-300" />
            </div>
            <div class="w-full text-center">
              <p class="font-mono text-[10px] font-semibold text-gray-700 truncate">{{ ticket.qr_display_code }}</p>
              <span
                class="text-[10px] font-semibold"
                :class="ticket.status === 'ACTIVE' ? 'text-green-600' : ticket.status === 'CANCELLED' ? 'text-red-500' : 'text-blue-600'"
              >
                {{ ticket.status }}
              </span>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Critical info -->
      <div v-if="!loading && hasCriticalInfo" class="pt-3 border-t">
        <p class="text-xs font-semibold text-red-600 uppercase mb-2 flex items-center gap-1">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-3.5 h-3.5" />
          Critical Info
        </p>

        <div v-if="medicalConditions.length" class="mb-2">
          <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Medical</p>
          <div class="flex flex-wrap gap-1">
            <UBadge
              v-for="m in medicalConditions"
              :key="m.id"
              color="red"
              variant="soft"
              size="xs"
            >
              {{ m.condition_details.label }}<template v-if="m.severity"> · {{ m.severity }}</template>
            </UBadge>
          </div>
        </div>

        <div v-if="dietaryRequirements.length" class="mb-2">
          <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Dietary</p>
          <div class="flex flex-wrap gap-1">
            <UBadge
              v-for="d in dietaryRequirements"
              :key="d.id"
              color="amber"
              variant="soft"
              size="xs"
            >
              {{ d.requirement_details.label }}
            </UBadge>
          </div>
        </div>

        <div v-if="accessibilityRequirements.length">
          <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Accessibility</p>
          <div class="flex flex-wrap gap-1">
            <UBadge
              v-for="a in accessibilityRequirements"
              :key="a.id"
              color="blue"
              variant="soft"
              size="xs"
            >
              {{ a.requirement_details.label }}
            </UBadge>
          </div>
        </div>
      </div>

      <!-- Footer actions -->
      <div class="pt-3 border-t space-y-2">
        <UButton
          block
          variant="solid"
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
  </UModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ExtendedAttendeeList } from '~/composables/participants/useParticipantsDashboardData'
import type {
  AttendeeDietaryRequirement,
  AttendeeMedicalCondition,
  AttendeeAccessibilityRequirement,
} from '~/api/types.gen'
import {
  attendeesDietaryRequirementsList,
  attendeesMedicalConditionsList,
  attendeesAccessibilityRequirementsList,
} from '~/api/sdk.gen'
import { useAttendeeActiveTickets } from '~/composables/resources/tickets/useAttendeeTickets'
import { useFormattedTicketsForQR } from '~/composables/resources/tickets/useTicketQRCode'
import { bookingsListRetrieve } from '~/api/sdk.gen'

const props = defineProps<{
  modelValue: boolean
  attendee: ExtendedAttendeeList | null
  eventId: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

// ── Status helpers ────────────────────────────────────────────────────────

type AttendeeStatus = 'pending_payment' | 'registered' | 'checked_in' | 'checked_out' | 'cancelled' | 'whitelisted'

function statusColor(status?: string): string {
  const map: Record<AttendeeStatus, string> = {
    pending_payment: 'amber',
    registered: 'blue',
    checked_in: 'green',
    checked_out: 'indigo',
    cancelled: 'red',
    whitelisted: 'purple',
  }
  return map[status as AttendeeStatus] ?? 'gray'
}

function statusLabel(status?: string): string {
  const map: Record<AttendeeStatus, string> = {
    pending_payment: 'Pending Payment',
    registered: 'Registered',
    checked_in: 'Checked In',
    checked_out: 'Checked Out',
    cancelled: 'Cancelled',
    whitelisted: 'Whitelisted',
  }
  return map[status as AttendeeStatus] ?? status ?? '—'
}

// ── Tickets ───────────────────────────────────────────────────────────────

const attendeeId = computed(() => props.attendee?.attendee_id ?? '')

const ticketsQuery = useAttendeeActiveTickets(attendeeId)

const tickets = useFormattedTicketsForQR(
  computed(() => ticketsQuery.data.value?.data?.results ?? [])
)

// ── Critical info + booking ───────────────────────────────────────────────

const loading = ref(false)
const dietaryRequirements = ref<AttendeeDietaryRequirement[]>([])
const medicalConditions = ref<AttendeeMedicalCondition[]>([])
const accessibilityRequirements = ref<AttendeeAccessibilityRequirement[]>([])
const bookingMadeByName = ref<string | null>(null)

async function fetchDetails(attendeeId: string, bookingId?: number | null) {
  loading.value = true
  dietaryRequirements.value = []
  medicalConditions.value = []
  accessibilityRequirements.value = []
  bookingMadeByName.value = null
  try {
    const requests: Promise<any>[] = [
      attendeesDietaryRequirementsList({ path: { attendee_id: attendeeId } }),
      attendeesMedicalConditionsList({ path: { attendee_id: attendeeId } }),
      attendeesAccessibilityRequirementsList({ path: { attendee_id: attendeeId } }),
    ]
    if (bookingId) requests.push(bookingsListRetrieve({ path: { id: bookingId } }))

    const [dietaryRes, medicalRes, accessibilityRes, bookingRes] = await Promise.all(requests)
    dietaryRequirements.value = (dietaryRes.data as any)?.results ?? []
    medicalConditions.value = (medicalRes.data as any)?.results ?? []
    accessibilityRequirements.value = (accessibilityRes.data as any)?.results ?? []
    if (bookingRes) bookingMadeByName.value = bookingRes.data?.made_by_name ?? null
  } catch {
    // non-critical, fail silently
  } finally {
    loading.value = false
  }
}

watch(
  () => props.attendee?.attendee_id,
  (id) => {
    if (id) fetchDetails(id, (props.attendee as any)?.booking)
    else {
      dietaryRequirements.value = []
      medicalConditions.value = []
      accessibilityRequirements.value = []
      bookingMadeByName.value = null
    }
  },
  { immediate: true },
)

const relationshipLabel = computed(() => {
  const rel = props.attendee?.relationship_display
  if (!rel) return 'N/A'
  if (props.attendee?.relationship_to_user === 'self') return 'Self'
  if (bookingMadeByName.value) return `${rel} of ${bookingMadeByName.value}`
  return rel
})

const hasCriticalInfo = computed(
  () =>
    medicalConditions.value.length > 0 ||
    dietaryRequirements.value.length > 0 ||
    accessibilityRequirements.value.length > 0,
)
</script>
