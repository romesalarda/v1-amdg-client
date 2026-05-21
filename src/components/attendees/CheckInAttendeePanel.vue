<template>
  <!-- Backdrop -->
  <Transition name="checkin-panel-fade">
    <div
      v-if="open"
      class="fixed inset-0 bg-black/40 z-40"
      @click="$emit('close')"
    />
  </Transition>

  <!-- Panel -->
  <Transition name="checkin-panel-slide">
    <div
      v-if="open"
      class="fixed inset-y-0 right-0 w-full max-w-3xl bg-white shadow-2xl z-50 flex flex-col"
    >
      <!-- Header -->
      <div class="flex items-start justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
        <div class="min-w-0 flex-1 pr-4">
          <p class="text-xs font-black text-primary uppercase tracking-widest">Attendee</p>
          <div v-if="attendee" class="mt-0.5 flex items-center gap-2 flex-wrap">
            <h3 class="text-lg font-black text-deep-navy truncate">{{ attendee.full_name }}</h3>
            <span class="font-mono text-xs text-gray-500">{{ attendee.attendee_display_id }}</span>
            <UBadge
              :color="statusColor(attendee.status)"
              variant="subtle"
              size="xs"
              class="capitalize"
            >
              {{ attendee.status }}
            </UBadge>
            <UBadge v-if="attendee.is_checked_in" color="green" variant="subtle" size="xs">
              <UIcon name="i-heroicons-check-circle" class="w-3 h-3 mr-1" />
              Checked In
            </UBadge>
            <!-- <UBadge v-if="attendee.has_outstanding_payments" color="red" variant="subtle" size="xs">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-3 h-3 mr-1" />
              Unpaid
            </UBadge> -->
          </div>
          <div v-else-if="isLoading" class="mt-1 h-5 w-48 bg-gray-100 rounded animate-pulse" />
          <div v-else-if="loadError" class="mt-1 text-sm text-red-500">Failed to load attendee</div>
        </div>
        <UButton
          icon="i-heroicons-x-mark"
          variant="ghost"
          color="gray"
          size="sm"
          class="flex-shrink-0"
          @click="$emit('close')"
        />
      </div>

      <!-- Tab bar -->
      <div class="flex gap-1 px-4 pt-3 pb-0 border-b border-gray-100 flex-shrink-0">
        <button
          v-for="tab in panelTabs"
          :key="tab.id"
          class="px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 -mb-px"
          :class="
            currentTab === tab.id
              ? 'border-primary text-primary bg-primary/5'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          "
          @click="currentTab = tab.id"
        >
          <UIcon :name="tab.icon" class="w-3.5 h-3.5 inline-block mr-1" />
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab content -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- Loading skeleton -->
        <div v-if="isLoading" class="space-y-3">
          <div v-for="i in 5" :key="i" class="h-10 bg-gray-100 rounded-lg animate-pulse" />
        </div>

        <template v-else-if="attendee">
          <!-- Details tab -->
          <div v-if="currentTab === 'details'">
            <AttendeeDetailsTab
              :attendee-data="attendee"
              :area-options="areas.data.value?.data?.results || []"
              :editing-basic-info="editingBasicInfo"
              :form-data="formData"
              :update-basic-info-pending="updateMutation.isPending.value"
              :medical-condition-options="health.medicalConditions.data.value?.data?.results || []"
              :attendee-medical-list="health.attendeeMedicalConditions.data.value?.data?.results || []"
              :medical-count="health.attendeeMedicalConditions.data.value?.data?.count || 0"
              :medical-conditions-loading="health.medicalConditionsLoading.value"
              :show-add-medical-form="health.showAddMedicalForm.value"
              :editing-medical-id="health.editingMedicalId.value"
              :new-medical-condition="health.newMedicalCondition.value"
              :create-medical-pending="health.createMedicalMutation.isPending.value"
              :update-medical-pending="health.updateMedicalMutation.isPending.value"
              :dietary-requirement-options="health.dietaryRequirements.data.value?.data?.results || []"
              :attendee-dietary-list="health.attendeeDietaryRequirements.data.value?.data?.results || []"
              :dietary-count="health.attendeeDietaryRequirements.data.value?.data?.count || 0"
              :dietary-requirements-loading="health.dietaryRequirementsLoading.value"
              :show-add-dietary-form="health.showAddDietaryForm.value"
              :editing-dietary-id="health.editingDietaryId.value"
              :new-dietary-requirement="health.newDietaryRequirement.value"
              :create-dietary-pending="health.createDietaryMutation.isPending.value"
              :update-dietary-pending="health.updateDietaryMutation.isPending.value"
              :accessibility-requirement-options="health.accessibilityRequirements.data.value?.data?.results || []"
              :attendee-accessibility-list="health.attendeeAccessibilityRequirements.data.value?.data?.results || []"
              :accessibility-count="health.attendeeAccessibilityRequirements.data.value?.data?.count || 0"
              :accessibility-requirements-loading="health.accessibilityRequirementsLoading.value"
              :show-add-accessibility-form="health.showAddAccessibilityForm.value"
              :editing-accessibility-id="health.editingAccessibilityId.value"
              :new-accessibility-requirement="health.newAccessibilityRequirement.value"
              :create-accessibility-pending="health.createAccessibilityMutation.isPending.value"
              :update-accessibility-pending="health.updateAccessibilityMutation.isPending.value"
              :attendee-orgs-list="orgs.attendeeOrganisations.data.value?.data?.results || []"
              :org-loading="orgs.attendeeOrganisations.isLoading.value"
              :organisation-options="orgs.organisations.data.value?.data?.results || []"
              :create-org-pending="orgs.createOrganisationMutation.isPending.value"
              :show-change-organisation="orgs.showChangeOrganisation.value"
              :selected-organisation="orgs.selectedOrganisation.value"
              @set-editing-basic-info="editingBasicInfo = $event"
              @update-basic-info="handleUpdateBasicInfo"
              @cancel-edit-basic-info="cancelEditBasicInfo"
              @set-show-add-medical-form="health.showAddMedicalForm.value = $event"
              @add-medical-condition="health.handleAddMedicalCondition"
              @edit-medical-condition="health.editMedicalCondition($event)"
              @update-medical-condition="health.handleUpdateMedicalCondition"
              @delete-medical-condition="health.deleteMedicalCondition($event)"
              @cancel-add-medical-condition="health.cancelAddMedicalCondition"
              @cancel-edit-medical-condition="health.cancelEditMedicalCondition"
              @set-show-add-dietary-form="health.showAddDietaryForm.value = $event"
              @add-dietary-requirement="health.handleAddDietaryRequirement"
              @edit-dietary-requirement="health.editDietaryRequirement($event)"
              @update-dietary-requirement="health.handleUpdateDietaryRequirement"
              @delete-dietary-requirement="health.deleteDietaryRequirement($event)"
              @cancel-add-dietary-requirement="health.cancelAddDietaryRequirement"
              @cancel-edit-dietary-requirement="health.cancelEditDietaryRequirement"
              @set-show-add-accessibility-form="health.showAddAccessibilityForm.value = $event"
              @add-accessibility-requirement="health.handleAddAccessibilityRequirement"
              @edit-accessibility-requirement="health.editAccessibilityRequirement($event)"
              @update-accessibility-requirement="health.handleUpdateAccessibilityRequirement"
              @delete-accessibility-requirement="health.deleteAccessibilityRequirement($event)"
              @cancel-add-accessibility-requirement="health.cancelAddAccessibilityRequirement"
              @cancel-edit-accessibility-requirement="health.cancelEditAccessibilityRequirement"
              @set-show-change-organisation="orgs.showChangeOrganisation.value = $event"
              @set-selected-organisation="orgs.selectedOrganisation.value = $event"
              @change-organisation="orgs.handleChangeOrganisation"
              @cancel-change-organisation="orgs.showChangeOrganisation.value = false; orgs.selectedOrganisation.value = null"
              @remove-organisation="orgs.removeOrganisation($event)"
            />
          </div>

          <!-- Booking tab -->
          <div v-if="currentTab === 'booking'">
            <AttendeeBookingTab
              :attendee="attendee"
              :booking="booking"
              :attendee-id="resolvedAttendeeId"
              :event-id="eventId"
            />
          </div>

          <!-- Emergency Contacts tab -->
          <div v-if="currentTab === 'emergency'">
            <AttendeeEmergencyContactsTab
              :show-add-emergency-form="emergency.showAddEmergencyForm.value"
              :editing-emergency-id="emergency.editingEmergencyId.value"
              :new-emergency-contact="emergency.newEmergencyContact.value"
              :create-emergency-pending="emergency.createEmergencyMutation.isPending.value"
              :update-emergency-pending="emergency.updateEmergencyMutation.isPending.value"
              :emergency-contacts-loading="emergency.emergencyContactsLoading.value"
              :emergency-contacts="emergency.emergencyContacts.data.value?.data?.results || []"
              @set-show-add-emergency-form="emergency.showAddEmergencyForm.value = $event"
              @add-emergency-contact="emergency.handleAddEmergencyContact"
              @cancel-add-emergency-contact="emergency.cancelAddEmergencyContact"
              @update-emergency-contact="emergency.handleUpdateEmergencyContact"
              @cancel-edit-emergency-contact="emergency.cancelEditEmergencyContact"
              @edit-emergency-contact="emergency.editEmergencyContact($event)"
              @delete-emergency-contact="emergency.deleteEmergencyContact($event)"
            />
          </div>

          <!-- Actions tab -->
          <div v-if="currentTab === 'actions'">
            <AttendeeActionsTab
              :is-loading="actions.attendeeActions.isLoading.value"
              :actions="actions.filteredActions.value"
              :action-type-filter="actions.actionTypeFilter.value"
              :action-date-start="actions.actionDateStart.value"
              :action-date-end="actions.actionDateEnd.value"
              @export-csv="actions.exportActionsToCSV"
              @update:action-type-filter="actions.actionTypeFilter.value = $event"
              @update:action-date-start="actions.actionDateStart.value = $event"
              @update:action-date-end="actions.actionDateEnd.value = $event"
            />
          </div>
        </template>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useAttendee } from '~/composables/resources/attendee/attendees'
import { useEvent } from '~/composables/resources/events/events'
import { useBooking } from '~/composables/resources/booking/bookings'
import { useAreas } from '~/composables/resources/locations/locations'
import { useAttendeeBasicInfoEditor } from '~/composables/attendee/editor/useAttendeeBasicInfoEditor'
import { useAttendeeHealthRequirements } from '~/composables/attendee/editor/useAttendeeHealthRequirements'
import { useAttendeeOrganisationsEditor } from '~/composables/attendee/editor/useAttendeeOrganisationsEditor'
import { useAttendeeEmergencyContactsEditor } from '~/composables/attendee/editor/useAttendeeEmergencyContactsEditor'
import { useAttendeeActionsHistoryEditor } from '~/composables/attendee/editor/useAttendeeActionsHistoryEditor'
import AttendeeDetailsTab from '~/components/attendee/editor/AttendeeDetailsTab.vue'
import AttendeeBookingTab from '~/components/attendee/editor/AttendeeBookingTab.vue'
import AttendeeEmergencyContactsTab from '~/components/attendee/editor/AttendeeEmergencyContactsTab.vue'
import AttendeeActionsTab from '~/components/attendee/editor/AttendeeActionsTab.vue'

interface Props {
  open: boolean
  attendeeId: string | null
  eventId: string
}

const props = defineProps<Props>()

defineEmits<{ close: [] }>()

// ── Tabs ───────────────────────────────────────────────────────────────────

const panelTabs = [
  { id: 'details', label: 'Details', icon: 'i-heroicons-user' },
  { id: 'booking', label: 'Booking', icon: 'i-heroicons-ticket' },
  { id: 'emergency', label: 'Emergency', icon: 'i-heroicons-phone' },
  { id: 'actions', label: 'Actions', icon: 'i-heroicons-clock' },
]

const currentTab = ref('details')

// Reset to first tab when attendee changes
watch(() => props.attendeeId, () => {
  currentTab.value = 'details'
})

// ── Attendee data ──────────────────────────────────────────────────────────

const resolvedAttendeeId = computed(() => props.attendeeId ?? '')
const attendeeQuery = useAttendee(resolvedAttendeeId)

const attendee = computed(() => attendeeQuery.data.value?.data)
const isLoading = computed(() => attendeeQuery.isLoading.value && !!props.attendeeId)
const loadError = computed(() => attendeeQuery.isError.value)

// ── Dependent data ─────────────────────────────────────────────────────────

const event = useEvent(computed(() => props.eventId))
const eventData = computed(() => event.data.value?.data)
const attendeeData = computed(() => attendee.value)
const areas = useAreas()

const booking = useBooking(computed(() => attendee.value?.booking || 0))

// ── Composables ────────────────────────────────────────────────────────────

const {
  updateMutation,
  formData,
  editingBasicInfo,
  handleUpdateBasicInfo,
  cancelEditBasicInfo,
} = useAttendeeBasicInfoEditor(resolvedAttendeeId, attendeeData)

const health = useAttendeeHealthRequirements(resolvedAttendeeId)
const orgs = useAttendeeOrganisationsEditor(resolvedAttendeeId)
const emergency = useAttendeeEmergencyContactsEditor(resolvedAttendeeId)
const actions = useAttendeeActionsHistoryEditor(resolvedAttendeeId, attendeeData, eventData)

// ── Helpers ────────────────────────────────────────────────────────────────

function statusColor(status: string | undefined) {
  if (!status) return 'gray'
  if (status === 'registered') return 'green'
  if (status === 'checked_in') return 'blue'
  if (status === 'cancelled') return 'red'
  return 'gray'
}
</script>

<style scoped>
.checkin-panel-fade-enter-active,
.checkin-panel-fade-leave-active {
  transition: opacity 0.2s ease;
}
.checkin-panel-fade-enter-from,
.checkin-panel-fade-leave-to {
  opacity: 0;
}

.checkin-panel-slide-enter-active,
.checkin-panel-slide-leave-active {
  transition: transform 0.25s ease;
}
.checkin-panel-slide-enter-from,
.checkin-panel-slide-leave-to {
  transform: translateX(100%);
}
</style>
