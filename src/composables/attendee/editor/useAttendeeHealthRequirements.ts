import { computed, ref, type Ref } from 'vue'
import { useToast } from '#ui/composables/useToast'
import { useMedicalConditions } from '~/composables/resources/attendee/bookingMedicalConditions'
import { useDietaryRequirements } from '~/composables/resources/attendee/attendeeDietaryRequirements'
import { useAccessibilityRequirements } from '~/composables/resources/attendee/accessibilityRequirements'
import {
  useAttendeeMedicalConditions,
  useCreateAttendeeMedicalCondition,
  useUpdateAttendeeMedicalCondition,
  useDeleteAttendeeMedicalCondition,
} from '~/composables/resources/attendee/attendeeMedicalConditions'
import {
  useAttendeeDietaryRequirements,
  useCreateAttendeeDietaryRequirement,
  useUpdateAttendeeDietaryRequirement,
  useDeleteAttendeeDietaryRequirement,
} from '~/composables/resources/attendee/attendeeDietaryRequirementsRelationship'
import {
  useAttendeeAccessibilityRequirements,
  useCreateAttendeeAccessibilityRequirement,
  useUpdateAttendeeAccessibilityRequirement,
  useDeleteAttendeeAccessibilityRequirement,
} from '~/composables/resources/attendee/attendeeAccessibilityRequirements'

export const useAttendeeHealthRequirements = (attendeeId: Ref<string>) => {
  const toast = useToast()

  const medicalConditions = useMedicalConditions()
  const dietaryRequirements = useDietaryRequirements()
  const accessibilityRequirements = useAccessibilityRequirements()

  const attendeeMedicalConditions = useAttendeeMedicalConditions(attendeeId)
  const attendeeDietaryRequirements = useAttendeeDietaryRequirements(attendeeId)
  const attendeeAccessibilityRequirements = useAttendeeAccessibilityRequirements(attendeeId)

  const medicalConditionsLoading = computed(() => attendeeMedicalConditions.isLoading.value)
  const dietaryRequirementsLoading = computed(() => attendeeDietaryRequirements.isLoading.value)
  const accessibilityRequirementsLoading = computed(() => attendeeAccessibilityRequirements.isLoading.value)

  const createMedicalMutation = useCreateAttendeeMedicalCondition()
  const updateMedicalMutation = useUpdateAttendeeMedicalCondition()
  const deleteMedicalMutation = useDeleteAttendeeMedicalCondition()

  const createDietaryMutation = useCreateAttendeeDietaryRequirement()
  const updateDietaryMutation = useUpdateAttendeeDietaryRequirement()
  const deleteDietaryMutation = useDeleteAttendeeDietaryRequirement()

  const createAccessibilityMutation = useCreateAttendeeAccessibilityRequirement()
  const updateAccessibilityMutation = useUpdateAttendeeAccessibilityRequirement()
  const deleteAccessibilityMutation = useDeleteAttendeeAccessibilityRequirement()

  const showAddMedicalForm = ref(false)
  const editingMedicalId = ref<number | null>(null)
  const newMedicalCondition = ref({
    medical_condition: null as number | null,
    severity: '',
    details: '',
    notes: '',
  })

  const showAddDietaryForm = ref(false)
  const editingDietaryId = ref<number | null>(null)
  const newDietaryRequirement = ref({
    dietary_requirement: null as number | null,
    details: '',
    notes: '',
  })

  const showAddAccessibilityForm = ref(false)
  const editingAccessibilityId = ref<number | null>(null)
  const newAccessibilityRequirement = ref({
    accessibility_requirement: null as number | null,
    details: '',
    notes: '',
  })

  const cancelAddMedicalCondition = () => {
    showAddMedicalForm.value = false
    newMedicalCondition.value = {
      medical_condition: null,
      severity: '',
      details: '',
      notes: '',
    }
  }

  const cancelEditMedicalCondition = () => {
    editingMedicalId.value = null
    newMedicalCondition.value = {
      medical_condition: null,
      severity: '',
      details: '',
      notes: '',
    }
  }

  const handleAddMedicalCondition = async () => {
    if (!newMedicalCondition.value.medical_condition) {
      toast.add({ title: 'Error', description: 'Please select a condition', color: 'red' })
      return
    }

    const existing = attendeeMedicalConditions.data.value?.data?.results || []
    const duplicate = existing.find((c: any) => c.medical_condition === newMedicalCondition.value.medical_condition)
    if (duplicate) {
      toast.add({ title: 'Error', description: 'This condition already exists', color: 'red' })
      return
    }

    try {
      await createMedicalMutation.mutateAsync({
        attendeeId: attendeeId.value,
        body: {
          medical_condition: newMedicalCondition.value.medical_condition,
          severity: newMedicalCondition.value.severity || undefined,
          details: newMedicalCondition.value.details || '',
          notes: newMedicalCondition.value.notes || '',
        } as any,
      })
      cancelAddMedicalCondition()
      toast.add({ title: 'Success', description: 'Medical condition added', color: 'green' })
    } catch (error) {
      console.error('Failed to add medical condition:', error)
      toast.add({ title: 'Error', description: 'Failed to add condition', color: 'red' })
    }
  }

  const editMedicalCondition = (condition: any) => {
    editingMedicalId.value = condition.id
    newMedicalCondition.value = {
      medical_condition: condition.medical_condition,
      severity: condition.severity || '',
      details: condition.details || '',
      notes: condition.notes || '',
    }
  }

  const handleUpdateMedicalCondition = async () => {
    if (!editingMedicalId.value) return
    if (!newMedicalCondition.value.medical_condition) {
      toast.add({ title: 'Error', description: 'Please select a condition', color: 'red' })
      return
    }

    try {
      await updateMedicalMutation.mutateAsync({
        attendeeId: attendeeId.value,
        conditionId: editingMedicalId.value,
        body: {
          medical_condition: newMedicalCondition.value.medical_condition,
          severity: newMedicalCondition.value.severity || undefined,
          details: newMedicalCondition.value.details || '',
          notes: newMedicalCondition.value.notes || '',
        } as any,
      })
      cancelEditMedicalCondition()
      toast.add({ title: 'Success', description: 'Medical condition updated', color: 'green' })
    } catch (error) {
      console.error('Failed to update medical condition:', error)
      toast.add({ title: 'Error', description: 'Failed to update condition', color: 'red' })
    }
  }

  const deleteMedicalCondition = async (conditionId: number) => {
    if (!confirm('Are you sure you want to delete this medical condition?')) return

    try {
      await deleteMedicalMutation.mutateAsync({
        attendeeId: attendeeId.value,
        conditionId,
      })
      toast.add({ title: 'Success', description: 'Medical condition deleted', color: 'green' })
    } catch (error) {
      console.error('Failed to delete medical condition:', error)
      toast.add({ title: 'Error', description: 'Failed to delete condition', color: 'red' })
    }
  }

  const cancelAddDietaryRequirement = () => {
    showAddDietaryForm.value = false
    newDietaryRequirement.value = {
      dietary_requirement: null,
      details: '',
      notes: '',
    }
  }

  const cancelEditDietaryRequirement = () => {
    editingDietaryId.value = null
    newDietaryRequirement.value = {
      dietary_requirement: null,
      details: '',
      notes: '',
    }
  }

  const handleAddDietaryRequirement = async () => {
    if (!newDietaryRequirement.value.dietary_requirement) {
      toast.add({ title: 'Error', description: 'Please select a requirement', color: 'red' })
      return
    }

    const existing = attendeeDietaryRequirements.data.value?.data?.results || []
    const duplicate = existing.find((r: any) => r.dietary_requirement === newDietaryRequirement.value.dietary_requirement)
    if (duplicate) {
      toast.add({ title: 'Error', description: 'This requirement already exists', color: 'red' })
      return
    }

    try {
      await createDietaryMutation.mutateAsync({
        attendeeId: attendeeId.value,
        body: {
          dietary_requirement: newDietaryRequirement.value.dietary_requirement,
          details: newDietaryRequirement.value.details || '',
          notes: newDietaryRequirement.value.notes || '',
        } as any,
      })
      cancelAddDietaryRequirement()
      toast.add({ title: 'Success', description: 'Dietary requirement added', color: 'green' })
    } catch (error) {
      console.error('Failed to add dietary requirement:', error)
      toast.add({ title: 'Error', description: 'Failed to add requirement', color: 'red' })
    }
  }

  const editDietaryRequirement = (requirement: any) => {
    editingDietaryId.value = requirement.id
    newDietaryRequirement.value = {
      dietary_requirement: requirement.dietary_requirement,
      details: requirement.details || '',
      notes: requirement.notes || '',
    }
  }

  const handleUpdateDietaryRequirement = async () => {
    if (!editingDietaryId.value) return
    if (!newDietaryRequirement.value.dietary_requirement) {
      toast.add({ title: 'Error', description: 'Please select a requirement', color: 'red' })
      return
    }

    try {
      await updateDietaryMutation.mutateAsync({
        attendeeId: attendeeId.value,
        requirementId: editingDietaryId.value,
        body: {
          dietary_requirement: newDietaryRequirement.value.dietary_requirement,
          details: newDietaryRequirement.value.details || '',
          notes: newDietaryRequirement.value.notes || '',
        } as any,
      })
      cancelEditDietaryRequirement()
      toast.add({ title: 'Success', description: 'Dietary requirement updated', color: 'green' })
    } catch (error) {
      console.error('Failed to update dietary requirement:', error)
      toast.add({ title: 'Error', description: 'Failed to update requirement', color: 'red' })
    }
  }

  const deleteDietaryRequirement = async (requirementId: number) => {
    if (!confirm('Are you sure you want to delete this dietary requirement?')) return

    try {
      await deleteDietaryMutation.mutateAsync({
        attendeeId: attendeeId.value,
        requirementId,
      })
      toast.add({ title: 'Success', description: 'Dietary requirement deleted', color: 'green' })
    } catch (error) {
      console.error('Failed to delete dietary requirement:', error)
      toast.add({ title: 'Error', description: 'Failed to delete requirement', color: 'red' })
    }
  }

  const cancelAddAccessibilityRequirement = () => {
    showAddAccessibilityForm.value = false
    newAccessibilityRequirement.value = {
      accessibility_requirement: null,
      details: '',
      notes: '',
    }
  }

  const cancelEditAccessibilityRequirement = () => {
    editingAccessibilityId.value = null
    newAccessibilityRequirement.value = {
      accessibility_requirement: null,
      details: '',
      notes: '',
    }
  }

  const handleAddAccessibilityRequirement = async () => {
    if (!newAccessibilityRequirement.value.accessibility_requirement) {
      toast.add({ title: 'Error', description: 'Please select a requirement', color: 'red' })
      return
    }

    const existing = attendeeAccessibilityRequirements.data.value?.data?.results || []
    const duplicate = existing.find((r: any) => r.accessibility_requirement === newAccessibilityRequirement.value.accessibility_requirement)
    if (duplicate) {
      toast.add({ title: 'Error', description: 'This requirement already exists', color: 'red' })
      return
    }

    try {
      await createAccessibilityMutation.mutateAsync({
        attendeeId: attendeeId.value,
        body: {
          accessibility_requirement: newAccessibilityRequirement.value.accessibility_requirement,
          details: newAccessibilityRequirement.value.details || '',
          notes: newAccessibilityRequirement.value.notes || '',
        } as any,
      })
      cancelAddAccessibilityRequirement()
      toast.add({ title: 'Success', description: 'Accessibility requirement added', color: 'green' })
    } catch (error) {
      console.error('Failed to add accessibility requirement:', error)
      toast.add({ title: 'Error', description: 'Failed to add requirement', color: 'red' })
    }
  }

  const editAccessibilityRequirement = (requirement: any) => {
    editingAccessibilityId.value = requirement.id
    newAccessibilityRequirement.value = {
      accessibility_requirement: requirement.accessibility_requirement,
      details: requirement.details || '',
      notes: requirement.notes || '',
    }
  }

  const handleUpdateAccessibilityRequirement = async () => {
    if (!editingAccessibilityId.value) return
    if (!newAccessibilityRequirement.value.accessibility_requirement) {
      toast.add({ title: 'Error', description: 'Please select a requirement', color: 'red' })
      return
    }

    try {
      await updateAccessibilityMutation.mutateAsync({
        attendeeId: attendeeId.value,
        requirementId: editingAccessibilityId.value,
        body: {
          accessibility_requirement: newAccessibilityRequirement.value.accessibility_requirement,
          details: newAccessibilityRequirement.value.details || '',
          notes: newAccessibilityRequirement.value.notes || '',
        } as any,
      })
      cancelEditAccessibilityRequirement()
      toast.add({ title: 'Success', description: 'Accessibility requirement updated', color: 'green' })
    } catch (error) {
      console.error('Failed to update accessibility requirement:', error)
      toast.add({ title: 'Error', description: 'Failed to update requirement', color: 'red' })
    }
  }

  const deleteAccessibilityRequirement = async (requirementId: number) => {
    if (!confirm('Are you sure you want to delete this accessibility requirement?')) return

    try {
      await deleteAccessibilityMutation.mutateAsync({
        attendeeId: attendeeId.value,
        requirementId,
      })
      toast.add({ title: 'Success', description: 'Accessibility requirement deleted', color: 'green' })
    } catch (error) {
      console.error('Failed to delete accessibility requirement:', error)
      toast.add({ title: 'Error', description: 'Failed to delete requirement', color: 'red' })
    }
  }

  return {
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
    deleteMedicalMutation,
    createDietaryMutation,
    updateDietaryMutation,
    deleteDietaryMutation,
    createAccessibilityMutation,
    updateAccessibilityMutation,
    deleteAccessibilityMutation,
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
  }
}
