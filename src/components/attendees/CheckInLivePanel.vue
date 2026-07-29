<template>
  <div class="flex flex-col gap-4">
    <!-- No item state: blank, unpunched ticket stock -->
    <div
      v-if="!currentItem"
      class="relative bg-white rounded-2xl flex flex-col items-center justify-center gap-5 text-center py-16 px-8 min-h-[500px] border-2 border-dashed border-deep-navy/15"
      style="background-image: repeating-linear-gradient(0deg, rgba(15,23,42,0.015) 0px, rgba(15,23,42,0.015) 1px, transparent 1px, transparent 3px);"
    >
      <!-- corner die-cuts, so even the empty stock reads as ticket paper -->
      <span class="absolute w-4 h-4 rounded-full bg-gray-50 -top-2 -left-2 border-2 border-dashed border-deep-navy/15" />
      <span class="absolute w-4 h-4 rounded-full bg-gray-50 -top-2 -right-2 border-2 border-dashed border-deep-navy/15" />
      <span class="absolute w-4 h-4 rounded-full bg-gray-50 -bottom-2 -left-2 border-2 border-dashed border-deep-navy/15" />
      <span class="absolute w-4 h-4 rounded-full bg-gray-50 -bottom-2 -right-2 border-2 border-dashed border-deep-navy/15" />

      <div class="relative flex items-center justify-center">
        <span class="absolute inline-block w-20 h-20 rounded-full bg-deep-navy/5 animate-ping" style="animation-duration:2s" />
        <div class="relative z-10 border-2 border-deep-navy/15 rounded-full p-5">
          <UIcon name="i-heroicons-qr-code" class="w-10 h-10 text-deep-navy/30" />
        </div>
      </div>
      <div class="space-y-1">
        <p class="text-sm font-black uppercase tracking-widest text-deep-navy/40">Awaiting scan</p>
        <p class="text-xs text-gray-400">The next scanned ticket appears here automatically</p>
      </div>
      <div class="flex items-center gap-1.5">
        <span
          class="w-2 h-2 rounded-full"
          :class="isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'"
        />
        <span class="text-xs font-semibold uppercase tracking-wide text-gray-400">
          {{ isConnected ? 'Live' : 'Disconnected' }}
        </span>
      </div>
    </div>

    <!-- Ticket card -->
    <div
      v-else
      class="relative bg-white rounded-2xl shadow-[0_8px_24px_-8px_rgba(15,23,42,0.25)] overflow-hidden -rotate-[0.4deg] transition-transform duration-200 hover:rotate-0"
    >
      <!-- paper grain, faint so it never fights the content -->
      <div
        class="pointer-events-none absolute inset-0 z-0 opacity-[0.4]"
        style="background-image: repeating-linear-gradient(90deg, rgba(15,23,42,0.02) 0px, rgba(15,23,42,0.02) 1px, transparent 1px, transparent 4px);"
      />

      <!-- Ribbon: status band, printed like a grosgrain stripe with a pinked bottom edge -->
      <div class="relative z-10">
        <div
          class="px-4 py-2.5 flex items-center gap-2 text-xs font-black uppercase tracking-widest relative overflow-hidden"
          :class="theme.ribbon"
        >
          <div
            class="absolute inset-0 opacity-20"
            style="background-image: repeating-linear-gradient(-45deg, transparent 0px, transparent 5px, rgba(255,255,255,0.6) 5px, rgba(255,255,255,0.6) 6px);"
          />
          <UIcon :name="resultIcon" class="w-4 h-4 relative" />
          <span class="relative">{{ resultLabel }}</span>
        </div>
        <!-- pinked edge under the ribbon -->
        <div
          class="h-2 w-full"
          :class="theme.ribbon"
          style="clip-path: polygon(0% 0%, 100% 0%, 100% 40%, 96.15% 100%, 92.3% 40%, 88.45% 100%, 84.6% 40%, 80.75% 100%, 76.9% 40%, 73.05% 100%, 69.2% 40%, 65.35% 100%, 61.5% 40%, 57.65% 100%, 53.8% 40%, 49.95% 100%, 46.1% 40%, 42.25% 100%, 38.4% 40%, 34.55% 100%, 30.7% 40%, 26.85% 100%, 23% 40%, 19.15% 100%, 15.3% 40%, 11.45% 100%, 7.6% 40%, 3.75% 100%, 0% 40%);"
        />
      </div>

      <!-- Main panel -->
      <div class="relative z-10 p-5 space-y-4">
        <!-- Attendee -->
        <div class="flex items-start gap-3">
          <div
            class="w-14 h-14 rounded-full bg-deep-navy/10 flex items-center justify-center flex-shrink-0 font-black text-xl uppercase ring-2 ring-white ring-offset-2"
            :class="[theme.accent, theme.ringOffset]"
          >
            <span v-if="attendeeDetails">{{ attendeeInitials }}</span>
            <UIcon v-else name="i-heroicons-user" class="w-7 h-7 text-deep-navy/40" />
          </div>
          <div class="min-w-0 flex-1">
            <template v-if="attendeeLoading">
              <div class="h-6 w-40 bg-gray-100 rounded animate-pulse mb-1.5" />
              <div class="h-3.5 w-24 bg-gray-100 rounded animate-pulse" />
            </template>
            <template v-else>
              <p class="text-2xl font-black text-deep-navy leading-tight">
                {{ attendeeDetails?.full_name ?? currentItem.attendee_display_id }}
              </p>
              <p class="text-xs text-gray-500 font-mono mt-0.5 tracking-wide">{{ currentItem.attendee_display_id }}</p>
            </template>
          </div>
        </div>

        <!-- Enriched attendee details row -->
        <div v-if="attendeeDetails && !attendeeLoading" class="grid grid-cols-2 gap-2 text-xs">
          <div v-if="attendeeDetails.email" class="flex items-center gap-1.5 text-gray-500 min-w-0 col-span-2">
            <UIcon name="i-heroicons-envelope" class="w-3.5 h-3.5 flex-shrink-0" />
            <span class="truncate">{{ attendeeDetails.email }}</span>
          </div>
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
          <div v-if="attendeeDetails.area_from_name ?? currentItem.area_from" class="flex items-center gap-1.5 text-gray-500">
            <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5 flex-shrink-0" />
            <span class="text-sm font-medium text-gray-700 truncate">{{ attendeeDetails.area_from_name ?? currentItem.area_from }}</span>
          </div>
        </div>
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

        <!-- Outstanding payments warning -->
        <div
          v-if="currentItem.has_outstanding_payments"
          class="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3"
        >
          <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p class="text-xs text-red-700 font-medium">Outstanding payments on this booking</p>
        </div>

        <!-- Timestamp -->
        <div class="text-xs text-gray-400 flex items-center gap-1">
          <UIcon name="i-heroicons-clock" class="w-3.5 h-3.5" />
          {{ relativeTime }}
        </div>
      </div>

      <!-- Perforation: sprocket-hole tear line running the full width of the ticket -->
      <div class="relative z-10 w-full h-5" aria-hidden="true">
        <div
          class="absolute inset-y-1/2 left-6 right-6 h-px -translate-y-1/2"
          style="background-image: radial-gradient(circle, rgba(15,23,42,0.22) 1.4px, transparent 1.6px); background-size: 9px 100%; background-repeat: repeat-x;"
        />
        <!-- die-cut notches biting into both edges -->
        <span class="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-50 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.06)]" />
        <span class="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-50 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.06)]" />
      </div>

      <!-- Stub: the tear-off strip, ticket metadata + QR, tinted by status -->
      <div class="relative z-10 px-4 py-3 flex items-center gap-4 flex-wrap" :class="theme.stub">
        <div v-if="currentItem.ticket_code" class="flex items-center gap-3">
          <div class="flex h-22 w-22 items-center justify-center rounded-lg border border-gray-200 bg-white flex-shrink-0 p-1 shadow-sm">
            <Qrcode :value="currentItem.ticket_code" :width="120" :height="120" />
          </div>
          <div class="flex flex-col">
            <span
              class="inline-flex w-fit items-center text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 -rotate-2 border-[1.5px] rounded"
              :class="theme.accent"
              style="border-style: double; border-width: 3px 1px;"
            >
              {{ currentItem.action === 'CHECK_IN' ? 'Admit One' : 'Check Out' }}
            </span>
            <span v-if="currentItem.ticket_type_code" class="text-xs font-bold uppercase tracking-wide text-deep-navy/70 mt-1">
              {{ currentItem.ticket_type_code }}
            </span>
            <span class="font-mono text-[10px] text-gray-500 tracking-wider">{{ currentItem.ticket_code.slice(-16) }}</span>
          </div>
        </div>

        <div class="ml-auto flex flex-wrap gap-1.5 justify-end">
          <UBadge color="gray" variant="subtle" size="xs">
            {{ methodLabel(currentItem.method) }}
          </UBadge>
          <UBadge v-if="currentItem.matches_priority_filter" color="purple" variant="subtle" size="xs">
            <UIcon name="i-heroicons-star" class="w-3 h-3 mr-0.5" />
            Priority
          </UBadge>
          <UBadge v-if="attendeeDetails?.is_event_staff" color="blue" variant="subtle" size="xs">
            <UIcon name="i-heroicons-shield-check" class="w-3 h-3 mr-0.5" />
            Staff
          </UBadge>
        </div>
      </div>

      <!-- outer die-cut border, drawn last so it sits above the paper texture -->
      <div class="pointer-events-none absolute inset-0 rounded-2xl border border-deep-navy/10 z-20" />
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

// Status theme: drives the ribbon, the stub tint, the perforation color, and
// the accent text used on the avatar ring / stub label. Kept as literal
// Tailwind class strings so the JIT compiler can pick them up statically.
const STATUS_THEMES: Record<string, { ribbon: string; stub: string; accent: string; ringOffset: string }> = {
  SUCCESS: {
    ribbon: 'bg-emerald-600 text-white',
    stub: 'bg-emerald-600/[0.06]',
    accent: 'text-emerald-700 border-emerald-700/40',
    ringOffset: 'ring-offset-emerald-50',
  },
  ALREADY_CHECKED_IN: {
    ribbon: 'bg-amber-500 text-white',
    stub: 'bg-amber-500/[0.07]',
    accent: 'text-amber-700 border-amber-700/40',
    ringOffset: 'ring-offset-amber-50',
  },
  ALREADY_CHECKED_OUT: {
    ribbon: 'bg-amber-500 text-white',
    stub: 'bg-amber-500/[0.07]',
    accent: 'text-amber-700 border-amber-700/40',
    ringOffset: 'ring-offset-amber-50',
  },
  CANCELLED_ATTENDEE: {
    ribbon: 'bg-rose-700 text-white',
    stub: 'bg-rose-700/[0.06]',
    accent: 'text-rose-800 border-rose-800/40',
    ringOffset: 'ring-offset-rose-50',
  },
  CANCELLED_TICKET: {
    ribbon: 'bg-rose-700 text-white',
    stub: 'bg-rose-700/[0.06]',
    accent: 'text-rose-800 border-rose-800/40',
    ringOffset: 'ring-offset-rose-50',
  },
  OUTSTANDING_PAYMENTS: {
    ribbon: 'bg-orange-600 text-white',
    stub: 'bg-orange-600/[0.06]',
    accent: 'text-orange-700 border-orange-700/40',
    ringOffset: 'ring-offset-orange-50',
  },
  INVALID_TICKET: {
    ribbon: 'bg-slate-500 text-white',
    stub: 'bg-slate-500/[0.06]',
    accent: 'text-slate-700 border-slate-700/40',
    ringOffset: 'ring-offset-slate-50',
  },
  NOT_FOUND: {
    ribbon: 'bg-slate-500 text-white',
    stub: 'bg-slate-500/[0.06]',
    accent: 'text-slate-700 border-slate-700/40',
    ringOffset: 'ring-offset-slate-50',
  },
  ERROR: {
    ribbon: 'bg-slate-500 text-white',
    stub: 'bg-slate-500/[0.06]',
    accent: 'text-slate-700 border-slate-700/40',
    ringOffset: 'ring-offset-slate-50',
  },
}

const theme = computed(() => {
  const r = props.currentItem?.scan_result
  return (r && STATUS_THEMES[r]) || STATUS_THEMES.NOT_FOUND
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