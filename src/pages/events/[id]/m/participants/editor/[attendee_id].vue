<template>
  <EventManagementLayout :event-id="eventId" :event="event?.data.value?.data">
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-6">
      <!-- Main Content (Left - 8/12 on xl, 12/12 on smaller) -->
      <div class="xl:col-span-8 space-y-6">
        
        <AttendeeEditorHeader
          :attendee="attendee.data.value?.data"
          :linked-user-profile="linkedUserProfile"
          :current-tab="currentTab"
          :tabs="tabs"
          @change-tab="changeTab"
        >
            <!-- Details Tab (Combined: Basic Info + Medical + Dietary + Accessibility + Organisations) -->
            <div v-if="currentTab === 'details'">
              <AttendeeDetailsTab
                :attendee-data="attendee.data.value?.data"
                :area-options="areas.data.value?.data?.results || []"
                :editing-basic-info="editingBasicInfo"
                :form-data="formData"
                :update-basic-info-pending="updateMutation.isPending.value"
                :medical-condition-options="medicalConditions.data.value?.data?.results || []"
                :attendee-medical-list="attendeeMedicalConditions.data.value?.data?.results || []"
                :medical-count="attendeeMedicalConditions.data.value?.data?.count || 0"
                :medical-conditions-loading="medicalConditionsLoading"
                :show-add-medical-form="showAddMedicalForm"
                :editing-medical-id="editingMedicalId"
                :new-medical-condition="newMedicalCondition"
                :create-medical-pending="createMedicalMutation.isPending.value"
                :update-medical-pending="updateMedicalMutation.isPending.value"
                :dietary-requirement-options="dietaryRequirements.data.value?.data?.results || []"
                :attendee-dietary-list="attendeeDietaryRequirements.data.value?.data?.results || []"
                :dietary-count="attendeeDietaryRequirements.data.value?.data?.count || 0"
                :dietary-requirements-loading="dietaryRequirementsLoading"
                :show-add-dietary-form="showAddDietaryForm"
                :editing-dietary-id="editingDietaryId"
                :new-dietary-requirement="newDietaryRequirement"
                :create-dietary-pending="createDietaryMutation.isPending.value"
                :update-dietary-pending="updateDietaryMutation.isPending.value"
                :accessibility-requirement-options="accessibilityRequirements.data.value?.data?.results || []"
                :attendee-accessibility-list="attendeeAccessibilityRequirements.data.value?.data?.results || []"
                :accessibility-count="attendeeAccessibilityRequirements.data.value?.data?.count || 0"
                :accessibility-requirements-loading="accessibilityRequirementsLoading"
                :show-add-accessibility-form="showAddAccessibilityForm"
                :editing-accessibility-id="editingAccessibilityId"
                :new-accessibility-requirement="newAccessibilityRequirement"
                :create-accessibility-pending="createAccessibilityMutation.isPending.value"
                :update-accessibility-pending="updateAccessibilityMutation.isPending.value"
                :attendee-orgs-list="attendeeOrganisations.data.value?.data?.results || []"
                :org-loading="attendeeOrganisations.isLoading.value"
                :organisation-options="organisations.data.value?.data?.results || []"
                :create-org-pending="createOrganisationMutation.isPending.value"
                :show-change-organisation="showChangeOrganisation"
                :selected-organisation="selectedOrganisation"
                @set-editing-basic-info="editingBasicInfo = $event"
                @update-basic-info="handleUpdateBasicInfo"
                @cancel-edit-basic-info="cancelEditBasicInfo"
                @set-show-add-medical-form="showAddMedicalForm = $event"
                @add-medical-condition="handleAddMedicalCondition"
                @edit-medical-condition="editMedicalCondition($event)"
                @update-medical-condition="handleUpdateMedicalCondition"
                @delete-medical-condition="deleteMedicalCondition($event)"
                @cancel-add-medical-condition="cancelAddMedicalCondition"
                @cancel-edit-medical-condition="cancelEditMedicalCondition"
                @set-show-add-dietary-form="showAddDietaryForm = $event"
                @add-dietary-requirement="handleAddDietaryRequirement"
                @edit-dietary-requirement="editDietaryRequirement($event)"
                @update-dietary-requirement="handleUpdateDietaryRequirement"
                @delete-dietary-requirement="deleteDietaryRequirement($event)"
                @cancel-add-dietary-requirement="cancelAddDietaryRequirement"
                @cancel-edit-dietary-requirement="cancelEditDietaryRequirement"
                @set-show-add-accessibility-form="showAddAccessibilityForm = $event"
                @add-accessibility-requirement="handleAddAccessibilityRequirement"
                @edit-accessibility-requirement="editAccessibilityRequirement($event)"
                @update-accessibility-requirement="handleUpdateAccessibilityRequirement"
                @delete-accessibility-requirement="deleteAccessibilityRequirement($event)"
                @cancel-add-accessibility-requirement="cancelAddAccessibilityRequirement"
                @cancel-edit-accessibility-requirement="cancelEditAccessibilityRequirement"
                @set-show-change-organisation="showChangeOrganisation = $event"
                @set-selected-organisation="selectedOrganisation = $event"
                @change-organisation="handleChangeOrganisation"
                @cancel-change-organisation="showChangeOrganisation = false; selectedOrganisation = null"
                @remove-organisation="removeOrganisation($event)"
              />
            </div>

            <!-- Booking Tab -->
            <div v-if="currentTab === 'booking'">
              <AttendeeBookingTab
                :attendee="attendee.data.value?.data"
                :booking="booking"
                :attendee-id="attendeeId"
                :event-id="eventId"
              />
            </div>

            <!-- Emergency Contacts Tab -->
            <div v-if="currentTab === 'emergency'">
              <AttendeeEmergencyContactsTab
                :show-add-emergency-form="showAddEmergencyForm"
                :editing-emergency-id="editingEmergencyId"
                :new-emergency-contact="newEmergencyContact"
                :create-emergency-pending="createEmergencyMutation.isPending.value"
                :update-emergency-pending="updateEmergencyMutation.isPending.value"
                :emergency-contacts-loading="emergencyContactsLoading"
                :emergency-contacts="emergencyContacts.data.value?.data?.results || []"
                @set-show-add-emergency-form="showAddEmergencyForm = $event"
                @add-emergency-contact="handleAddEmergencyContact"
                @cancel-add-emergency-contact="cancelAddEmergencyContact"
                @update-emergency-contact="handleUpdateEmergencyContact"
                @cancel-edit-emergency-contact="cancelEditEmergencyContact"
                @edit-emergency-contact="editEmergencyContact($event)"
                @delete-emergency-contact="deleteEmergencyContact($event)"
              />
            </div>

            <!-- Consents Tab -->
            <div v-if="currentTab === 'consents'">
              <AttendeeConsentsTab
                :show-add-consent-form="showAddConsentForm"
                :new-consent="newConsent"
                :create-consent-pending="createConsentMutation.isPending.value"
                :event-consents="eventConsents.data.value?.data?.results || []"
                :attendee-consents-loading="attendeeConsents.isLoading.value"
                :attendee-consents="attendeeConsents.data.value?.data?.results || []"
                :partial-update-consent-pending="partialUpdateConsentMutation.isPending.value"
                @set-show-add-consent-form="showAddConsentForm = $event"
                @add-consent="handleAddConsent"
                @cancel-add-consent="cancelAddConsent"
                @toggle-consent-given="toggleConsentGiven($event)"
                @delete-consent="deleteConsent($event)"
                @mark-all-required-consents-as-given="markAllRequiredConsentsAsGiven"
              />
            </div>

            <!-- Family & Guardians Tab -->
            <div v-if="currentTab === 'family'" class="space-y-6">
              <AttendeeFamilyTab
                :show-add-guardian-form="showAddGuardianForm"
                :guardian-search-query="guardianSearchQuery"
                :selected-guardian-attendee-id="selectedGuardianAttendeeId"
                :filtered-guardian-attendees="filteredGuardianAttendees"
                :guardian-attendees-loading="guardianAttendees.isLoading.value"
                :selected-guardian-candidate="selectedGuardianCandidate"
                :selected-guardian-has-linked-user="selectedGuardianHasLinkedUser"
                :new-guardian="newGuardian"
                :create-guardian-pending="createGuardianMutation.isPending.value"
                :guardians-loading="guardians.isLoading.value"
                :guardians="guardians.data.value?.data?.results || []"
                :show-create-family-group-form="showCreateFamilyGroupForm"
                :new-family-group-name="newFamilyGroupName"
                :create-family-group-pending="createFamilyGroupMutation.isPending.value"
                :show-add-family-membership-form="showAddFamilyMembershipForm"
                :family-groups="familyGroups.data.value?.data?.results || []"
                :new-family-membership="newFamilyMembership"
                :create-family-membership-pending="createFamilyMembershipMutation.isPending.value"
                :family-memberships-loading="familyMemberships.isLoading.value"
                :family-memberships="familyMemberships.data.value?.data?.results || []"
                @set-show-add-guardian-form="showAddGuardianForm = $event"
                @update-guardian-search-query="guardianSearchQuery = $event"
                @update-selected-guardian-attendee-id="selectedGuardianAttendeeId = $event"
                @update-new-guardian-relationship="newGuardian.relationship = ($event as any)"
                @add-guardian="handleAddGuardian"
                @cancel-add-guardian="cancelAddGuardian"
                @delete-guardian="deleteGuardian"
                @set-show-create-family-group-form="showCreateFamilyGroupForm = $event"
                @update-new-family-group-name="newFamilyGroupName = $event"
                @create-family-group="handleCreateFamilyGroup"
                @cancel-create-family-group="cancelCreateFamilyGroup"
                @set-show-add-family-membership-form="showAddFamilyMembershipForm = $event"
                @update-new-family-membership-family-group="newFamilyMembership.family_group = $event"
                @update-new-family-membership-relationship="newFamilyMembership.relationship = ($event as any)"
                @update-new-family-membership-primary-guardian="newFamilyMembership.is_primary_guardian = $event"
                @add-family-membership="handleAddFamilyMembership"
                @cancel-add-family-membership="cancelAddFamilyMembership"
                @delete-family-membership="deleteFamilyMembership"
              />
            </div>

            <!-- Actions Tab -->
            <div v-if="currentTab === 'actions'">
              <AttendeeActionsTab
                :is-loading="attendeeActions.isLoading.value"
                :actions="filteredActions"
                :action-type-filter="actionTypeFilter"
                :action-date-start="actionDateStart"
                :action-date-end="actionDateEnd"
                @export-csv="exportActionsToCSV"
                @update:action-type-filter="actionTypeFilter = $event"
                @update:action-date-start="actionDateStart = $event"
                @update:action-date-end="actionDateEnd = $event"
              />
            </div>

            <!-- Question Answers Tab (NEW) -->
            <div v-if="currentTab === 'questions'">
              <AttendeeQuestionAnswers
                v-if="event.data.value?.data"
                :event="event.data.value?.data"
                :attendee-id="attendee.data.value?.data?.attendee_id || ''"
              />
            </div>

            <!-- Forms Tab -->
            <div v-if="currentTab === 'forms'">
              <AttendeeFormsTab
                :event-id="eventId"
                :attendee-id="attendee.data.value?.data?.attendee_id || ''"
              />
            </div>

            <!-- Orders Tab (NEW) -->
            <div v-if="currentTab === 'orders'">
              <AttendeeOrdersTab
                :show-create-order-form="showCreateOrderForm"
                :create-order-pending="createOrderMutation.isPending.value"
                :orders-loading="attendeeOrders.isLoading.value"
                :orders="attendeeOrders.data.value?.data?.results || []"
                :show-add-item-form-for-order="showAddItemFormForOrder"
                :new-order-item="newOrderItem"
                :add-order-item-pending="addOrderItemMutation.isPending.value"
                :get-order-status-color="getOrderStatusColor"
                :get-order-item-title="getOrderItemTitle"
                :get-order-item-code="getOrderItemCode"
                :get-order-item-image-url="getOrderItemImageUrl"
                :get-order-item-size="getOrderItemSize"
                :get-order-item-color="getOrderItemColor"
                :get-order-item-color-style="getOrderItemColorStyle"
                @create-order="handleCreateOrder"
                @set-show-create-order-form="showCreateOrderForm = $event"
                @cancel-order="cancelOrder"
                @toggle-add-item-form="toggleAddItemForm"
                @add-order-item="handleAddOrderItem"
                @cancel-add-item-form="showAddItemFormForOrder = null; resetOrderItemForm()"
                @update-order-item-product-variant-id="newOrderItem.product_variant_id = $event"
                @update-order-item-quantity="newOrderItem.quantity = $event"
              />
            </div>
        </AttendeeEditorHeader>
      </div>

      <AttendeeEditorSidebar
        :attendee="attendee.data.value?.data"
        :linked-user-profile="linkedUserProfile"
        :linked-user-id="linkedUserId"
        :attendee-medical-list="attendeeMedicalConditions.data.value?.data?.results || []"
        :attendee-actions="attendeeActions.data.value?.data?.results || []"
        :pre-removal-summary="preRemovalSummary"
        :pre-removal-loading="preRemovalSummaryLoading"
        :pre-removal-error="preRemovalSummaryError"
        :pre-removal-deleting="deleteMutation.isPending.value"
        :pre-removal-cancelling="cancelMutation.isPending.value"
        :event-query-value="orderEventQueryValue"
        @confirm-delete="confirmDeleteAttendee"
        @confirm-cancel="confirmCancelAttendee"
        @pre-removal-page-change="handlePreRemovalPageChange"
      />
    </div>
  </EventManagementLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Ref } from 'vue'
import { useToast } from '#ui/composables/useToast'

// Composables - Attendee
import {
  useAttendee,
  useDeleteAttendee,
  useCancelAttendee,
  useAttendeePreRemovalSummary,
} from '~/composables/resources/attendee/attendees'
import { useEvent } from '~/composables/resources/events/events'
import { useAreas } from '~/composables/resources/locations/locations'
import { useProfiles } from '~/composables/resources/user/profiles'
import { useBooking } from '~/composables/resources/booking/bookings'


import { useAttendeeBasicInfoEditor } from '~/composables/attendee/editor/useAttendeeBasicInfoEditor'
import { useAttendeeHealthRequirements } from '~/composables/attendee/editor/useAttendeeHealthRequirements'
import { useAttendeeEmergencyContactsEditor } from '~/composables/attendee/editor/useAttendeeEmergencyContactsEditor'
import { useAttendeeConsentsEditor } from '~/composables/attendee/editor/useAttendeeConsentsEditor'
import { useAttendeeFamilyGuardiansEditor } from '~/composables/attendee/editor/useAttendeeFamilyGuardiansEditor'
import { useAttendeeOrganisationsEditor } from '~/composables/attendee/editor/useAttendeeOrganisationsEditor'
import { useAttendeeOrdersEditor } from '~/composables/attendee/editor/useAttendeeOrdersEditor'
import { useAttendeeActionsHistoryEditor } from '~/composables/attendee/editor/useAttendeeActionsHistoryEditor'
import { useAttendeeEditorTabs } from '~/composables/attendee/editor/useAttendeeEditorTabs'

// Composables - Consents
// Components
import EventManagementLayout from '~/components/events/EventManagementLayout.vue'
import AttendeeQuestionAnswers from '~/components/attendee/AttendeeQuestionAnswers.vue'
import AttendeeEditorHeader from '~/components/attendee/editor/AttendeeEditorHeader.vue'
import AttendeeBookingTab from '~/components/attendee/editor/AttendeeBookingTab.vue'
import AttendeeActionsTab from '~/components/attendee/editor/AttendeeActionsTab.vue'
import AttendeeConsentsTab from '~/components/attendee/editor/AttendeeConsentsTab.vue'
import AttendeeDetailsTab from '~/components/attendee/editor/AttendeeDetailsTab.vue'
import AttendeeEmergencyContactsTab from '~/components/attendee/editor/AttendeeEmergencyContactsTab.vue'
import AttendeeFamilyTab from '~/components/attendee/editor/AttendeeFamilyTab.vue'
import AttendeeOrdersTab from '~/components/attendee/editor/AttendeeOrdersTab.vue'
import AttendeeFormsTab from '~/components/attendee/editor/AttendeeFormsTab.vue'
import AttendeeEditorSidebar from '~/components/attendee/editor/AttendeeEditorSidebar.vue'


definePageMeta({
  layout: false,
  middleware: ['auth', 'event-permission'],
  eventPermission: {
    category: 'BOOKING_MANAGEMENT',
    action: 'read',
    deniedRedirect: '/403',
  },
})


// Route & Router
const route = useRoute()
const router = useRouter()
const toast = useToast()

// Route Params
const attendeeId = computed(() => route.params.attendee_id as string)
const eventId = computed(() => route.params.id as string)
const preRemovalPage = ref(1)
const preRemovalPageSize = ref(5)
const { currentTab, tabs, changeTab } = useAttendeeEditorTabs()

// ====================
// DATA QUERIES
// ====================

// Attendee & Event
const attendee = useAttendee(attendeeId)
const event = useEvent(eventId)
const attendeeResourceId = computed(() => attendee.data.value?.data?.attendee_id)
const areas = useAreas()

// Linked User Profile
const linkedUserId = computed(() => {
  if (!attendee.data.value?.data?._links?.user) return null
  const match = attendee.data.value.data._links.user.match(/\/users\/(\d+)\//)
  return match ? parseInt(match[1]) : null
})

const linkedProfilesQuery = useProfiles(computed(() =>
  linkedUserId.value ? { user: linkedUserId.value } : undefined
))
const linkedUserProfile = computed(() =>
  linkedProfilesQuery.data.value?.data?.results?.[0]
)

// Booking
const booking = useBooking(computed(() => attendee.data.value?.data?.booking || 0))

const {
  updateMutation,
  formData,
  editingBasicInfo,
  handleUpdateBasicInfo,
  cancelEditBasicInfo,
} = useAttendeeBasicInfoEditor(
  attendeeId,
  computed(() => attendee.data.value?.data),
)

const {
  medicalConditions,
  dietaryRequirements,
  accessibilityRequirements,
  attendeeMedicalConditions,
  attendeeDietaryRequirements,
  attendeeAccessibilityRequirements,
  medicalConditionsLoading,
  dietaryRequirementsLoading,
  accessibilityRequirementsLoading,
  createMedicalMutation,
  updateMedicalMutation,
  createDietaryMutation,
  updateDietaryMutation,
  createAccessibilityMutation,
  updateAccessibilityMutation,
  showAddMedicalForm,
  editingMedicalId,
  newMedicalCondition,
  showAddDietaryForm,
  editingDietaryId,
  newDietaryRequirement,
  showAddAccessibilityForm,
  editingAccessibilityId,
  newAccessibilityRequirement,
  handleAddMedicalCondition,
  editMedicalCondition,
  handleUpdateMedicalCondition,
  deleteMedicalCondition,
  cancelAddMedicalCondition,
  cancelEditMedicalCondition,
  handleAddDietaryRequirement,
  editDietaryRequirement,
  handleUpdateDietaryRequirement,
  deleteDietaryRequirement,
  cancelAddDietaryRequirement,
  cancelEditDietaryRequirement,
  handleAddAccessibilityRequirement,
  editAccessibilityRequirement,
  handleUpdateAccessibilityRequirement,
  deleteAccessibilityRequirement,
  cancelAddAccessibilityRequirement,
  cancelEditAccessibilityRequirement,
} = useAttendeeHealthRequirements(attendeeId)

const {
  emergencyContacts,
  emergencyContactsLoading,
  createEmergencyMutation,
  updateEmergencyMutation,
  showAddEmergencyForm,
  editingEmergencyId,
  newEmergencyContact,
  handleAddEmergencyContact,
  editEmergencyContact,
  handleUpdateEmergencyContact,
  deleteEmergencyContact,
  cancelAddEmergencyContact,
  cancelEditEmergencyContact,
} = useAttendeeEmergencyContactsEditor(attendeeId)

const {
  eventConsents,
  attendeeConsents,
  createConsentMutation,
  partialUpdateConsentMutation,
  showAddConsentForm,
  newConsent,
  handleAddConsent,
  toggleConsentGiven,
  deleteConsent,
  markAllRequiredConsentsAsGiven,
  cancelAddConsent,
} = useAttendeeConsentsEditor(attendeeId, eventId)

const {
  guardians,
  familyMemberships,
  familyGroups,
  guardianAttendees,
  createGuardianMutation,
  createFamilyMembershipMutation,
  createFamilyGroupMutation,
  showAddGuardianForm,
  showAddFamilyMembershipForm,
  showCreateFamilyGroupForm,
  newFamilyGroupName,
  newGuardian,
  guardianSearchQuery,
  selectedGuardianAttendeeId,
  filteredGuardianAttendees,
  selectedGuardianCandidate,
  selectedGuardianHasLinkedUser,
  newFamilyMembership,
  cancelAddGuardian,
  handleAddGuardian,
  deleteGuardian,
  cancelAddFamilyMembership,
  handleAddFamilyMembership,
  cancelCreateFamilyGroup,
  handleCreateFamilyGroup,
  deleteFamilyMembership,
} = useAttendeeFamilyGuardiansEditor(
  attendeeId,
  attendeeResourceId,
  eventId,
  computed(() => event.data.value?.data as any),
)

const {
  attendeeActions,
  actionTypeFilter,
  actionDateStart,
  actionDateEnd,
  filteredActions,
  exportActionsToCSV,
} = useAttendeeActionsHistoryEditor(
  attendeeId,
  computed(() => attendee.data.value?.data),
  computed(() => event.data.value?.data),
)

const {
  attendeeOrganisations,
  organisations,
  createOrganisationMutation,
  showChangeOrganisation,
  selectedOrganisation,
  handleChangeOrganisation,
  removeOrganisation,
} = useAttendeeOrganisationsEditor(attendeeId)

const {
  attendeeOrders,
  createOrderMutation,
  addOrderItemMutation,
  showCreateOrderForm,
  showAddItemFormForOrder,
  newOrderItem,
  handleCreateOrder,
  toggleAddItemForm,
  handleAddOrderItem,
  cancelOrder,
  deleteOrder,
  resetOrderItemForm,
  getOrderItemTitle,
  getOrderItemCode,
  getOrderItemImageUrl,
  getOrderItemSize,
  getOrderItemColor,
  getOrderItemColorStyle,
  getOrderStatusColor,
} = useAttendeeOrdersEditor(attendeeId, attendeeResourceId, eventId)

const preRemovalSummaryQueryParams = computed(() => ({
  page: preRemovalPage.value,
  page_size: preRemovalPageSize.value,
}))
const {
  data: preRemovalSummaryData,
  isLoading: preRemovalSummaryLoading,
  error: preRemovalSummaryError,
} = useAttendeePreRemovalSummary(attendeeId, preRemovalSummaryQueryParams)
const preRemovalSummary = computed(() => preRemovalSummaryData.value?.data)
const orderEventQueryValue = computed(() => String(event.data.value?.data?.url_safe_title || event.data.value?.data?.event_id || eventId.value || ''))

// ====================
// LOADING STATES
// ====================

// ====================
// MUTATIONS
// ====================
const deleteMutation = useDeleteAttendee()
const cancelMutation = useCancelAttendee()

// ====================
// BASIC INFO HANDLERS
// ====================
// Basic info handlers are managed in useAttendeeBasicInfoEditor.


// CONTINUE IN NEXT PART...

// Medical, dietary, and accessibility handlers are managed in useAttendeeHealthRequirements.

// ====================
// EMERGENCY CONTACTS HANDLERS
// ====================
// Emergency contacts handlers are managed in useAttendeeEmergencyContactsEditor.

// CONTINUES IN NEXT PART...

// ====================
// CONSENTS HANDLERS
// ====================
// Consent handlers are managed in useAttendeeConsentsEditor.

// ====================
// FAMILY & GUARDIANS HANDLERS
// ====================
// Family and guardians handlers are managed in useAttendeeFamilyGuardiansEditor.

// ====================
// ORGANISATIONS HANDLERS
// ====================
// Organisation handlers are managed in useAttendeeOrganisationsEditor.

// ====================
// ACTIONS HANDLERS
// ====================
// Actions handlers are managed in useAttendeeActionsHistoryEditor.

// ====================
// ORDERS HANDLERS (NEW)
// ====================
// Orders handlers are managed in useAttendeeOrdersEditor.

function handlePreRemovalPageChange(page: number) {
  if (page < 1) {
    return
  }
  preRemovalPage.value = page
}

async function confirmDeleteAttendee() {
  const summary = preRemovalSummary.value
  if (!summary?.can_delete) {
    toast.add({
      title: 'Deletion blocked',
      description: 'Resolve blockers before permanently deleting this attendee.',
      color: 'orange',
    })
    return
  }

  try {
    await deleteMutation.mutateAsync(attendeeId.value)
    toast.add({
      title: 'Attendee removed',
      description: 'The attendee has been removed successfully.',
      color: 'green',
    })
    router.push(`/events/${eventId.value}/m/participants/dashboard`)
  } catch (error: any) {
    toast.add({
      title: 'Delete failed',
      description: error?.message || 'Unable to remove attendee.',
      color: 'red',
    })
  }
}

async function confirmCancelAttendee() {
  try {
    await cancelMutation.mutateAsync({
      attendeeId: attendeeId.value,
      body: { invalidate: false },
    })
    toast.add({
      title: 'Attendee cancelled',
      description: 'The attendee status has been set to CANCELLED.',
      color: 'green',
    })
  } catch (error: any) {
    toast.add({
      title: 'Cancel failed',
      description: error?.message || 'Unable to cancel attendee.',
      color: 'red',
    })
  }
}
</script>

