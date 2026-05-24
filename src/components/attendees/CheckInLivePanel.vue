<template>
  <div class="flex flex-col gap-4">
    <!-- Connection indicator -->
    <!-- <div class="flex items-center gap-2">
      <span
        class="inline-block w-2.5 h-2.5 rounded-full"
        :class="isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-300'"
      />
      <span class="text-xs text-gray-500 font-medium uppercase tracking-wide">
        {{ isConnected ? 'Live' : 'Disconnected' }}
      </span>
    </div> -->

    <!-- No item state -->
    <div
      v-if="!currentItem"
      class="bg-white border border-deep-navy/10 rounded-xl shadow-sm flex flex-col items-center justify-center gap-5 text-center py-16 px-8 min-h-[500px]"
    >
      <div class="relative flex items-center justify-center">
        <span class="absolute inline-block w-20 h-20 rounded-full bg-deep-navy/5 animate-ping" style="animation-duration:2s" />
        <div class="relative z-10 bg-deep-navy/5 rounded-full p-5">
          <UIcon name="i-heroicons-qr-code" class="w-10 h-10 text-deep-navy/30" />
        </div>
      </div>
      <div class="space-y-1">
        <p class="text-base font-bold text-deep-navy/40">Waiting for scan…</p>
        <p class="text-xs text-gray-400">Scans will appear here in real time</p>
      </div>
      <div v-if="isConnected" class="flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span class="text-xs text-gray-400 font-medium">Live</span>
      </div>
      <div v-else class="flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full bg-gray-300" />
        <span class="text-xs text-gray-400 font-medium">Disconnected</span>
      </div>
    </div>

    <!-- Check-in card -->
    <div
      v-else
      class="bg-white border border-deep-navy/10 rounded-xl shadow-sm overflow-hidden transition-all"
    >
      <!-- Result banner -->
      <div
        class="px-4 py-2 flex items-center gap-2 text-sm font-semibold"
        :class="resultBannerClass"
      >
        <UIcon :name="resultIcon" class="w-4 h-4" />
        {{ resultLabel }}
      </div>

      <!-- Body -->
      <div class="p-5 space-y-4">
        <!-- Attendee -->
        <div class="flex items-start gap-3">
          <!-- Avatar placeholder -->
          <div class="w-12 h-12 rounded-full bg-deep-navy/10 flex items-center justify-center flex-shrink-0 text-deep-navy font-black text-lg uppercase">
            <span v-if="attendeeDetails">{{ attendeeInitials }}</span>
            <UIcon v-else name="i-heroicons-user" class="w-6 h-6 text-deep-navy/40" />
          </div>
          <div class="min-w-0 flex-1">
            <!-- Loading skeleton -->
            <template v-if="attendeeLoading">
              <div class="h-5 w-32 bg-gray-100 rounded animate-pulse mb-1" />
              <div class="h-3.5 w-20 bg-gray-100 rounded animate-pulse" />
            </template>
            <template v-else>
              <p class="text-lg font-black text-deep-navy leading-tight truncate">
                {{ attendeeDetails?.full_name ?? currentItem.attendee_display_id }}
              </p>
              <p class="text-xs text-gray-500 font-mono mt-0.5">{{ currentItem.attendee_display_id }}</p>
            </template>
          </div>
        </div>

        <!-- Enriched attendee details row -->
        <div v-if="attendeeDetails && !attendeeLoading" class="grid grid-cols-2 gap-2 text-xs">
          <div v-if="attendeeDetails.email" class="flex items-center gap-1.5 text-gray-500 min-w-0 col-span-2">
            <UIcon name="i-heroicons-envelope" class="w-3.5 h-3.5 flex-shrink-0" />
            <span class="truncate">{{ attendeeDetails.email }}</span>
          </div>
          <!-- Age + minor highlight -->
          <div v-if="attendeeDetails.age" class="flex items-center gap-1.5">
            <UIcon name="i-heroicons-cake" class="w-3.5 h-3.5 flex-shrink-0 text-gray-500" />
            <span
              class="font-semibold text-sm"
              :class="attendeeDetails.is_minor ? 'text-amber-700' : 'text-gray-700'"
            >
              Age {{ attendeeDetails.age }}
            </span>
            <UBadge v-if="attendeeDetails.is_minor" color="amber" variant="solid" size="xs" class="ml-0.5">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-3 h-3 mr-0.5" />
              Minor
            </UBadge>
          </div>
          <!-- Area from -->
          <div v-if="attendeeDetails.area_from_name ?? currentItem.area_from" class="flex items-center gap-1.5 text-gray-500">
            <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5 flex-shrink-0" />
            <span class="text-sm font-medium text-gray-700 truncate">{{ attendeeDetails.area_from_name ?? currentItem.area_from }}</span>
          </div>
        </div>

        <!-- Area from (fallback when no attendee details) -->
        <p v-else-if="!attendeeDetails && currentItem.area_from && !attendeeLoading" class="text-sm text-gray-500">
          <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5 inline-block mr-1" />
          {{ currentItem.area_from }}
        </p>

        <!-- Medical / Dietary / Accessibility highlights -->
        <template v-if="attendeeDetails && !attendeeLoading">
          <div
            v-if="medicalConditions.length"
            class="flex items-start gap-2 bg-red-50 border border-red-300 rounded-lg p-3"
          >
            <UIcon name="i-heroicons-heart" class="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div class="min-w-0">
              <p class="text-xs font-black text-red-700 uppercase tracking-wide mb-1">Medical Conditions</p>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="mc in medicalConditions"
                  :key="mc.id"
                  class="inline-block bg-red-100 text-red-800 text-xs font-semibold px-2 py-0.5 rounded-full"
                >
                  {{ mc.condition_details?.label ?? mc.id }}
                </span>
              </div>
              <p v-if="medicalConditions.some(m => m.details || m.notes)" class="text-xs text-red-600 mt-1 italic">
                {{ medicalConditions.map(m => m.details || m.notes).filter(Boolean).join(' · ') }}
              </p>
            </div>
          </div>

          <div
            v-if="dietaryRequirements.length"
            class="flex items-start gap-2 bg-amber-50 border border-amber-300 rounded-lg p-3"
          >
            <UIcon name="i-heroicons-fire" class="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div class="min-w-0">
              <p class="text-xs font-black text-amber-700 uppercase tracking-wide mb-1">Dietary Requirements</p>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="dr in dietaryRequirements"
                  :key="dr.id"
                  class="inline-block bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded-full"
                >
                  {{ dr.requirement_details?.label ?? dr.id }}
                </span>
              </div>
            </div>
          </div>

          <div
            v-if="accessibilityRequirements.length"
            class="flex items-start gap-2 bg-blue-50 border border-blue-300 rounded-lg p-3"
          >
            <UIcon name="i-heroicons-adjustments-horizontal" class="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div class="min-w-0">
              <p class="text-xs font-black text-blue-700 uppercase tracking-wide mb-1">Accessibility</p>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="ar in accessibilityRequirements"
                  :key="ar.id"
                  class="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full"
                >
                  {{ ar.requirement_details?.label ?? ar.id }}
                </span>
              </div>
            </div>
          </div>
        </template>

        <!-- Ticket as QR code -->
        <div v-if="currentItem.ticket_code" class="flex items-start gap-3">
          <div class="flex h-24 w-24 items-center justify-center rounded-lg border border-gray-200 bg-white flex-shrink-0">
            <Qrcode
              :value="currentItem.ticket_code"
              :width="96"
              :height="96"
              class="h-30 w-30"
            />
          </div>
          <div class="flex-1 min-w-0">
            <span class="text-xs text-gray-400 uppercase tracking-widest font-semibold block mb-1">Ticket</span>
            <span v-if="currentItem.ticket_type_code" class="text-xs text-gray-600 font-medium block mb-1">{{ currentItem.ticket_type_code }}</span>
            <span class="font-mono text-xs text-gray-500 break-all">{{ currentItem.ticket_code.slice(-16) }}</span>
          </div>
        </div>

        <!-- Method + Action badges -->
        <div class="flex flex-wrap gap-2">
          <UBadge
            :color="currentItem.action === 'CHECK_IN' ? 'green' : 'amber'"
            variant="subtle"
            size="sm"
          >
            {{ currentItem.action === 'CHECK_IN' ? 'Check In' : 'Check Out' }}
          </UBadge>
          <UBadge color="gray" variant="subtle" size="sm">
            {{ methodLabel(currentItem.method) }}
          </UBadge>
          <UBadge v-if="currentItem.matches_priority_filter" color="purple" variant="subtle" size="sm">
            <UIcon name="i-heroicons-star" class="w-3 h-3 mr-1" />
            Priority
          </UBadge>
          <UBadge v-if="attendeeDetails?.is_event_staff" color="blue" variant="subtle" size="sm">
            <UIcon name="i-heroicons-shield-check" class="w-3 h-3 mr-1" />
            Staff
          </UBadge>
        </div>

        <!-- Outstanding payments warning -->
        <div
          v-if="currentItem.has_outstanding_payments"
          class="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3"
        >
          <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p class="text-xs text-red-700 font-medium">Outstanding payments on this booking</p>
        </div>

        <!-- Timestamp + performed by -->
        <div class="text-xs text-gray-400 flex items-center gap-1">
          <UIcon name="i-heroicons-clock" class="w-3.5 h-3.5" />
          {{ relativeTime }}
        </div>
      </div>
    </div>

    <!-- Navigation (manual mode) -->
    <div v-if="showNavigation" class="flex items-center gap-2 justify-between">
      <UButton
        color="gray"
        variant="outline"
        size="sm"
        icon="i-heroicons-chevron-left"
        :disabled="!currentItem"
        @click="$emit('go-back')"
      >
        Prev
      </UButton>
      <span v-if="remainingCount > 0" class="text-xs text-gray-400">+{{ remainingCount }} more</span>
      <UButton
        color="gray"
        variant="outline"
        size="sm"
        trailing-icon="i-heroicons-chevron-right"
        :disabled="!currentItem"
        @click="$emit('advance')"
      >
        Next
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CheckInBroadcastPayload } from '~/composables/websockets/events/useCheckInSocket'
import type { CheckInDisplayMode } from '~/composables/useCheckInModes'
import type { AttendeeDetail, AttendeeDietaryRequirement, AttendeeAccessibilityRequirement, AttendeeMedicalCondition } from '~/api/types.gen'
import { attendeesRetrieve, attendeesDietaryRequirementsList, attendeesMedicalConditionsList, attendeesAccessibilityRequirementsList } from '~/api/sdk.gen'

interface Props {
  currentItem: CheckInBroadcastPayload | null
  isConnected: boolean
  mode: CheckInDisplayMode
  remainingCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  remainingCount: 0,
})

defineEmits<{
  advance: []
  'go-back': []
}>()

// ── Attendee detail fetch ─────────────────────────────────────────────────

const attendeeDetails = ref<AttendeeDetail | null>(null)
const attendeeLoading = ref(false)

// Medical / Dietary / Accessibility
const dietaryRequirements = ref<AttendeeDietaryRequirement[]>([])
const medicalConditions = ref<AttendeeMedicalCondition[]>([])
const accessibilityRequirements = ref<AttendeeAccessibilityRequirement[]>([])

async function fetchAttendeeDetails(attendeeId: string) {
  attendeeLoading.value = true
  attendeeDetails.value = null
  dietaryRequirements.value = []
  medicalConditions.value = []
  accessibilityRequirements.value = []
  try {
    const [detailRes, dietaryRes, medicalRes, accessibilityRes] = await Promise.all([
      attendeesRetrieve({ path: { attendee_id: attendeeId } }),
      attendeesDietaryRequirementsList({ path: { attendee_id: attendeeId } }),
      attendeesMedicalConditionsList({ path: { attendee_id: attendeeId } }),
      attendeesAccessibilityRequirementsList({ path: { attendee_id: attendeeId } }),
    ])
    if (detailRes.data) attendeeDetails.value = detailRes.data
    if (dietaryRes.data) dietaryRequirements.value = (dietaryRes.data as any).results ?? []
    if (medicalRes.data) medicalConditions.value = (medicalRes.data as any).results ?? []
    if (accessibilityRes.data) accessibilityRequirements.value = (accessibilityRes.data as any).results ?? []
  } catch {
    // Non-critical: fall back to displaying attendee_display_id
  } finally {
    attendeeLoading.value = false
  }
}

watch(
  () => props.currentItem?.attendee_id,
  (id) => {
    if (id) fetchAttendeeDetails(id)
    else attendeeDetails.value = null
  },
  { immediate: true },
)

const attendeeInitials = computed(() => {
  const name = attendeeDetails.value?.full_name
  if (!name) return ''
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
})

// ── Computed ──────────────────────────────────────────────────────────────

const showNavigation = computed(() => props.mode === 'manual')

const resultBannerClass = computed(() => {
  if (!props.currentItem) return ''
  const r = props.currentItem.scan_result
  if (r === 'SUCCESS') return 'bg-green-50 text-green-700'
  if (r === 'ALREADY_CHECKED_IN' || r === 'ALREADY_CHECKED_OUT') return 'bg-amber-50 text-amber-700'
  if (['CANCELLED_ATTENDEE', 'CANCELLED_TICKET'].includes(r)) return 'bg-red-50 text-red-700'
  if (r === 'OUTSTANDING_PAYMENTS') return 'bg-orange-50 text-orange-700'
  return 'bg-gray-50 text-gray-600'
})

const resultIcon = computed(() => {
  if (!props.currentItem) return 'i-heroicons-question-mark-circle'
  const r = props.currentItem.scan_result
  if (r === 'SUCCESS') return 'i-heroicons-check-circle'
  if (r === 'ALREADY_CHECKED_IN' || r === 'ALREADY_CHECKED_OUT') return 'i-heroicons-arrow-path'
  if (['CANCELLED_ATTENDEE', 'CANCELLED_TICKET'].includes(r)) return 'i-heroicons-x-circle'
  if (r === 'OUTSTANDING_PAYMENTS') return 'i-heroicons-exclamation-triangle'
  return 'i-heroicons-information-circle'
})

const resultLabel = computed(() => {
  if (!props.currentItem) return ''
  const labels: Record<string, string> = {
    SUCCESS: 'Scan successful',
    ALREADY_CHECKED_IN: 'Already checked in',
    ALREADY_CHECKED_OUT: 'Already checked out',
    INVALID_TICKET: 'Invalid ticket',
    CANCELLED_ATTENDEE: 'Attendee cancelled',
    CANCELLED_TICKET: 'Ticket cancelled',
    NOT_FOUND: 'Not found',
    OUTSTANDING_PAYMENTS: 'Outstanding payments',
    ERROR: 'Error',
  }
  return labels[props.currentItem.scan_result] ?? props.currentItem.scan_result
})

const relativeTime = computed(() => {
  if (!props.currentItem) return ''
  const d = new Date(props.currentItem.performed_at)
  const diff = Math.floor((Date.now() - d.getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
})

function methodLabel(method: string) {
  return { QR_CODE: 'QR Code', MANUAL: 'Manual', ADMIN: 'Admin' }[method] ?? method
}
</script>
