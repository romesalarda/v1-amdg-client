<template>
  <div class="space-y-4">
    <!-- Attendee info content goes here -->
    <div class="rounded-2xl border border-deep-navy/10 bg-white p-5">
      <p class="text-sm text-deep-navy/60">Attendee information form and sections will be populated here</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  selectedAttendeeId: string
  selectedAttendee?: any
  booking?: any
  isPersonalInfoEditing?: boolean
  attendeeSectionsOpen?: Record<string, boolean>
  attendeeForm?: any
  areaOptions?: any[]
  areaSearch?: string
  areaLookupLoading?: boolean
  emergencyContactForm?: any
  attendeeEmergencyContactList?: any[]
  showMedicalForm?: boolean
  showDietaryForm?: boolean
  showAccessibilityForm?: boolean
  attendeeMedicalConditions?: any
  attendeeDietaryRequirements?: any
  attendeeAccessibilityRequirements?: any
  attendeeConsents?: any
  medicalConditions?: any
  dietaryRequirements?: any
  accessibilityRequirements?: any
}>()

defineEmits<{
  'update:isPersonalInfoEditing': [value: boolean]
  'update:attendeeForm': [value: any]
  'update:areaSearch': [value: string]
  'update:showMedicalForm': [value: boolean]
  'update:showDietaryForm': [value: boolean]
  'update:showAccessibilityForm': [value: boolean]
  'toggle-section': [section: string]
  'save-attendee': []
  'discard-changes': []
  'add-emergency-contact': []
  'remove-emergency-contact': [contactId: number]
  'add-medical-condition': []
  'remove-medical-condition': [conditionId: number]
  'add-dietary-requirement': []
  'remove-dietary-requirement': [requirementId: number]
  'add-accessibility-requirement': []
  'remove-accessibility-requirement': [requirementId: number]
  'toggle-consent': [consentId: number, checked: boolean]
}>()
</script>
