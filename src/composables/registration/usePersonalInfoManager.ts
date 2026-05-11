import { type Ref } from 'vue'
import { isMinor, validatePersonalInfoItem } from '~/schemas/registration'
import type { AttendeeDraft, MedicalConditionItemDraft, PersonalInfoDraft, PersonalInfoItemDraft } from '~/stores/registration'

type PersonalInfoManagerOptions = {
  currentAttendee: Ref<AttendeeDraft | undefined>
  currentIndex: Ref<number>
  setPersonalInfo: (index: number, personalInfo: PersonalInfoDraft) => void
}

export const usePersonalInfoManager = (options: PersonalInfoManagerOptions) => {
  const relationshipOptions = [
    // { label: 'Self', value: 'self' },
    { label: 'Spouse', value: 'spouse' },
    { label: 'Child', value: 'child' },
    { label: 'Friend', value: 'friend' },
    { label: 'Parent', value: 'parent' },
    { label: 'Sibling', value: 'sibling' },
    { label: 'Other', value: 'other' },
  ]

  const genderOptions = [
    { label: 'Female', value: 'female' },
    { label: 'Male', value: 'male' },
    { label: 'Other', value: 'other' },
    { label: 'Prefer not to say', value: 'prefer_not_to_say' },
  ]

  const emergencyRelationshipOptions = [
    { label: 'Parent', value: 'parent' },
    { label: 'Sibling', value: 'sibling' },
    { label: 'Spouse', value: 'spouse' },
    { label: 'Friend', value: 'friend' },
    { label: 'Other', value: 'other' },
  ]

  const isAttendeeMinor = (attendee: AttendeeDraft): boolean => {
    return isMinor(attendee.date_of_birth)
  }

  const minorHasEmergencyContact = (attendee: AttendeeDraft): boolean => {
    if (!isAttendeeMinor(attendee)) return true
    return !!attendee.personalInfo.emergencyContact
      && !!attendee.personalInfo.emergencyContact.first_name?.trim()
      && !!attendee.personalInfo.emergencyContact.last_name?.trim()
      && !!attendee.personalInfo.emergencyContact.phone_number?.trim()
  }

  const hasPersonalInfoItem = (items: PersonalInfoItemDraft[] | MedicalConditionItemDraft[], id: number) => {
    return items.some((item) => item.id === id)
  }

  const hasValidPersonalInfoItems = (attendee: AttendeeDraft) => {
    const dietaryValid = attendee.personalInfo.dietaryRequirements.every((item) => validatePersonalInfoItem(item).isValid)
    const medicalValid = attendee.personalInfo.medicalConditions.every((item) => validatePersonalInfoItem(item).isValid)
    const accessibilityValid = attendee.personalInfo.accessibilityRequirements.every((item) => validatePersonalInfoItem(item).isValid)
    return dietaryValid && medicalValid && accessibilityValid
  }

  const getPersonalInfoItemValidationError = (
    items: PersonalInfoItemDraft[] | MedicalConditionItemDraft[],
    id: number,
  ) => {
    const item = items.find((entry) => entry.id === id)
    if (!item) return ''
    const result = validatePersonalInfoItem(item)
    return result.isValid ? '' : result.error || 'Please provide details for this requirement.'
  }

  const updatePersonalInfoItems = <T extends PersonalInfoItemDraft | MedicalConditionItemDraft>(
    items: T[],
    id: number,
    checked: boolean,
  ) => {
    const next = items.filter((item) => item.id !== id) as T[]
    if (checked) {
      next.push({ id } as T)
    }
    return next
  }

  const toggleDietaryRequirement = (id: number, eventTarget: Event) => {
    if (!options.currentAttendee.value) return
    const checked = (eventTarget.target as HTMLInputElement).checked
    const updated = updatePersonalInfoItems(options.currentAttendee.value.personalInfo.dietaryRequirements, id, checked)
    options.setPersonalInfo(options.currentIndex.value, { ...options.currentAttendee.value.personalInfo, dietaryRequirements: updated })
  }

  const toggleMedicalCondition = (id: number, eventTarget: Event) => {
    if (!options.currentAttendee.value) return
    const checked = (eventTarget.target as HTMLInputElement).checked
    const updated = updatePersonalInfoItems(options.currentAttendee.value.personalInfo.medicalConditions, id, checked)
    options.setPersonalInfo(options.currentIndex.value, { ...options.currentAttendee.value.personalInfo, medicalConditions: updated })
  }

  const toggleAccessibilityRequirement = (id: number, eventTarget: Event) => {
    if (!options.currentAttendee.value) return
    const checked = (eventTarget.target as HTMLInputElement).checked
    const updated = updatePersonalInfoItems(options.currentAttendee.value.personalInfo.accessibilityRequirements, id, checked)
    options.setPersonalInfo(options.currentIndex.value, { ...options.currentAttendee.value.personalInfo, accessibilityRequirements: updated })
  }

  const updateDietaryRequirementDetails = (id: number, details: string | null) => {
    if (!options.currentAttendee.value) return
    const item = options.currentAttendee.value.personalInfo.dietaryRequirements.find((d) => d.id === id)
    if (item) {
      item.details = details && details.trim() !== '' ? details : null
    }
  }

  const updateMedicalConditionSeverity = (id: number, severity: 'mild' | 'moderate' | 'severe' | null) => {
    if (!options.currentAttendee.value) return
    const item = options.currentAttendee.value.personalInfo.medicalConditions.find((d) => d.id === id)
    if (item) {
      item.severity = severity
    }
  }

  const updateMedicalConditionDetails = (id: number, details: string | null) => {
    if (!options.currentAttendee.value) return
    const item = options.currentAttendee.value.personalInfo.medicalConditions.find((d) => d.id === id)
    if (item) {
      item.details = details && details.trim() !== '' ? details : null
    }
  }

  const updateAccessibilityRequirementDetails = (id: number, details: string | null) => {
    if (!options.currentAttendee.value) return
    const item = options.currentAttendee.value.personalInfo.accessibilityRequirements.find((d) => d.id === id)
    if (item) {
      item.details = details && details.trim() !== '' ? details : null
    }
  }

  const isOtherOption = (id: number): boolean => {
    return id === -1 || String(id).toLowerCase().includes('other')
  }

  const getDetailsForItem = (id: number, items: PersonalInfoItemDraft[]): string => {
    const item = items.find((d) => d.id === id)
    return item?.details || ''
  }

  const addEmergencyContact = () => {
    if (!options.currentAttendee.value?.personalInfo) return
    options.currentAttendee.value.personalInfo.emergencyContact = {
      first_name: '',
      last_name: '',
      phone_number: '',
      relationship: undefined,
      email: '',
      primary_contact: true,
    }
  }

  return {
    relationshipOptions,
    genderOptions,
    emergencyRelationshipOptions,
    isAttendeeMinor,
    minorHasEmergencyContact,
    hasPersonalInfoItem,
    hasValidPersonalInfoItems,
    getPersonalInfoItemValidationError,
    toggleDietaryRequirement,
    toggleMedicalCondition,
    toggleAccessibilityRequirement,
    updateDietaryRequirementDetails,
    updateMedicalConditionSeverity,
    updateMedicalConditionDetails,
    updateAccessibilityRequirementDetails,
    isOtherOption,
    getDetailsForItem,
    addEmergencyContact,
  }
}
