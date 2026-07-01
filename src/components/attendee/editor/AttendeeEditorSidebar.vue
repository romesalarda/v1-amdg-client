<template>
  <div class="hidden xl:block xl:col-span-4 space-y-6">
    <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden sticky top-6">
      <div class="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 pb-20">
        <div class="flex justify-center">
          <div class="relative">
            <img
              v-if="linkedUserProfile?.profile_picture_url && attendee?.relationship_display?.toLowerCase() === 'self'"
              :src="linkedUserProfile.profile_picture_url"
              :alt="attendee?.full_name"
              class="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <div
              v-else
              class="rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border-4 border-white shadow-lg"
            >
              <img
                v-if="attendee?.relationship_display?.toLowerCase() !== 'self'"
                :src="`https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${attendee?.attendee_id}`"
                alt="Default profile"
                class="w-32 h-32 rounded-full object-cover"
              />
            </div>

            <div
              v-if="linkedUserId"
              class="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-md"
              title="Linked to user account"
            >
              <UIcon name="i-heroicons-link" class="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div class="px-6 -mt-14 pb-6 relative z-10">
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
          <h2 class="text-xl font-black text-gray-900 mb-1">
            {{ attendee?.full_name }}
          </h2>
          <p class="text-sm text-gray-500 mb-3">
            {{ attendee?.relationship_display }}
          </p>

          <div class="flex items-center justify-center gap-2 mb-3">
            <UBadge v-if="attendee?.is_minor" color="amber" variant="soft" size="xs">
              {{ attendee?.age }} years • Minor
            </UBadge>
            <UBadge v-else color="gray" variant="soft" size="xs">
              {{ attendee?.age }} years
            </UBadge>
            <UBadge v-if="attendee?.is_event_staff" color="purple" variant="soft" size="xs">
              Staff
            </UBadge>
          </div>

          <div v-if="attendee?.is_checked_in" class="flex items-center justify-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
            <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-green-600" />
            <span class="text-xs font-bold text-green-700 uppercase">Checked In</span>
          </div>
        </div>

        <div class="mt-4 space-y-2">
          <UButton
            v-if="linkedUserId"
            block
            size="sm"
            color="blue"
            variant="soft"
            icon="i-heroicons-user"
          >
            View User Profile
          </UButton>
        </div>

        <div class="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h3 class="text-xs font-black uppercase tracking-widest text-gray-700">Quick Overview</h3>
          <div class="mt-3 space-y-2">
            <div class="flex items-start justify-between gap-3 text-xs">
              <span class="font-semibold uppercase tracking-wide text-gray-500">Area From</span>
              <span class="text-right text-gray-900">{{ attendee?.area_from_name || 'N/A' }}</span>
            </div>
            <div class="flex items-start justify-between gap-3 text-xs">
              <span class="font-semibold uppercase tracking-wide text-gray-500">Gender</span>
              <span class="text-right text-gray-900">{{ attendee?.gender || 'N/A' }}</span>
            </div>
            <div class="flex items-start justify-between gap-3 text-xs">
              <span class="font-semibold uppercase tracking-wide text-gray-500">Email</span>
              <span class="text-right break-all text-gray-900">{{ attendee?.email || linkedUserProfile?.email || 'N/A' }}</span>
            </div>
            <div class="flex items-start justify-between gap-3 text-xs">
              <span class="font-semibold uppercase tracking-wide text-gray-500">Phone</span>
              <span class="text-right text-gray-900">{{ attendee?.phone_number || linkedUserProfile?.phone_number || 'N/A' }}</span>
            </div>
          </div>
        </div>

        <div class="mt-4 rounded-xl border p-4" :class="criticalMedicalItems.length ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'">
          <div class="flex items-center justify-between gap-3">
            <h3 class="text-xs font-black uppercase" :class="criticalMedicalItems.length ? 'text-red-700' : 'text-gray-700'">
              Critical Health Info
            </h3>
            <UBadge :color="criticalMedicalItems.length ? 'red' : 'gray'" variant="soft" size="xs">
              {{ criticalMedicalItems.length }}
            </UBadge>
          </div>

          <div v-if="criticalMedicalItems.length" class="mt-3 space-y-2">
            <div
              v-for="item in criticalMedicalItems"
              :key="String(item.id)"
              class="rounded-lg border border-red-200 bg-white/90 p-2"
            >
              <p class="text-xs font-semibold text-red-800">{{ item.condition_details?.label || 'Medical condition' }}</p>
              <p class="mt-0.5 text-xs text-red-700">
                {{ item.severity ? `${item.severity.toUpperCase()} severity` : 'Severity not set' }}
              </p>
              <p v-if="item.details" class="mt-0.5 text-xs text-red-700">{{ item.details }}</p>
            </div>
          </div>

          <p v-else class="mt-2 text-xs text-gray-600">No high-severity medical conditions flagged.</p>
        </div>

        <div class="mt-4 rounded-xl border border-gray-200 bg-white p-4">
          <div class="flex items-center justify-between gap-3">
            <h3 class="text-xs font-black uppercase text-gray-700">Recent Actions</h3>
            <UBadge color="gray" variant="soft" size="xs">{{ recentActions.length }}</UBadge>
          </div>

          <div v-if="recentActions.length" class="mt-3 space-y-2">
            <div
              v-for="action in recentActions"
              :key="String(action.id || `${action.action}-${action.performed_at}`)"
              class="rounded-lg border border-gray-200 bg-gray-50 p-2"
            >
              <div class="flex items-center justify-between gap-2">
                <UBadge
                  :color="action.action === 'registered' ? 'green' : action.action === 'checked_in' ? 'blue' : action.action === 'cancelled' ? 'red' : 'gray'"
                  size="xs"
                >
                  {{ action.action_display || action.action || 'Action' }}
                </UBadge>
                <span class="text-[11px] text-gray-500">{{ formatDate(action.performed_at) }}</span>
              </div>
              <p class="mt-1 text-xs text-gray-700">By {{ action.performed_by_name || 'System' }}</p>
              <p v-if="action.notes" class="mt-1 text-xs text-gray-600">{{ action.notes }}</p>
            </div>
          </div>

          <p v-else class="mt-2 text-xs text-gray-600">No action history available.</p>
        </div>

        <div class="mt-4 rounded-xl border border-gray-200 bg-white p-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3 class="text-xs font-black uppercase text-gray-700">Want to remove this attendee?</h3>
              <p class="mt-1 text-xs text-gray-500">Deletion blockers, package checks, and final action flow.</p>
            </div>
            <UButton
              size="xs"
              variant="soft"
              color="gray"
              icon="i-heroicons-document-magnifying-glass"
              @click="showPreRemovalModal = true"
            >
              Open
            </UButton>
          </div>

          <div class="mt-3 rounded-lg border p-3 text-xs" :class="preRemovalSummary?.can_delete ? 'border-green-200 bg-green-50 text-green-700' : 'border-amber-200 bg-amber-50 text-amber-700'">
            <p class="font-semibold">
              {{ preRemovalSummary?.can_delete ? 'Deletion currently allowed' : 'Deletion currently blocked' }}
            </p>
            <p class="mt-1">
              {{ preRemovalSummary?.summary_counts?.total_blockers || 0 }} blockers detected
              <span v-if="preRemovalSummary?.summary_counts">• {{ preRemovalSummary.summary_counts.high_priority_blockers || 0 }} high priority</span>
            </p>
          </div>

          <p class="mt-2 text-xs text-gray-600">Open the modal to review blocker details and perform final actions.</p>
        </div>
      </div>
    </section>

    <UModal v-model="showPreRemovalModal" :ui="{ width: 'sm:max-w-5xl' }">
      <PreRemovalSummaryStepper
        :summary="preRemovalSummary"
        :loading="preRemovalLoading"
        :error="preRemovalError"
        :deleting="preRemovalDeleting"
        :cancelling="preRemovalCancelling"
        :attendee-name="attendee?.full_name"
        :attendee-display-id="attendee?.attendee_display_id"
        :event-query-value="eventQueryValue"
        @close="showPreRemovalModal = false"
        @confirm-delete="emit('confirmDelete')"
        @confirm-cancel="emit('confirmCancel')"
        @request-refund="emit('requestRefund', $event)"
        @page-change="emit('preRemovalPageChange', $event)"
      />
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type {
  AttendeePreRemovalSummary,
  AttendeePreRemovalBlockerItem,
} from '~/composables/resources/attendee/attendees'
import PreRemovalSummaryStepper from '~/components/events/participants/preRemoval/PreRemovalSummaryStepper.vue'

const showPreRemovalModal = ref(false)

const props = defineProps<{
  attendee: any
  linkedUserProfile: any
  linkedUserId: number | null
  attendeeMedicalList?: any[]
  attendeeActions?: any[]
  preRemovalSummary?: AttendeePreRemovalSummary
  preRemovalLoading?: boolean
  preRemovalError?: unknown
  preRemovalDeleting?: boolean
  preRemovalCancelling?: boolean
  eventQueryValue?: string
}>()

const emit = defineEmits<{
  (event: 'confirmDelete'): void
  (event: 'confirmCancel'): void
  (event: 'requestRefund', item: AttendeePreRemovalBlockerItem): void
  (event: 'preRemovalPageChange', page: number): void
}>()

const criticalMedicalItems = computed(() => (props.attendeeMedicalList || []).filter((item: any) => {
  const severity = String(item?.severity || '').toLowerCase()
  return severity === 'severe' || severity === 'moderate'
}))

const recentActions = computed(() => {
  const actions = [...(props.attendeeActions || [])]
  return actions
    .sort((a: any, b: any) => new Date(b?.performed_at || 0).getTime() - new Date(a?.performed_at || 0).getTime())
    .slice(0, 4)
})

function formatDate(value?: string) {
  if (!value) {
    return 'Unknown'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Unknown'
  }

  return date.toLocaleString()
}
</script>
