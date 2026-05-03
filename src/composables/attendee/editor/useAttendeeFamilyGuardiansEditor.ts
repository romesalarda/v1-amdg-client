import { computed, ref, type Ref } from 'vue'
import { useToast } from '#ui/composables/useToast'
import { useAttendees } from '~/composables/resources/attendee/attendees'
import {
  useGuardians,
  useCreateGuardian,
  useDeleteGuardian,
  useFamilyAttendees,
  useCreateFamilyAttendee,
  useDeleteFamilyAttendee,
  useFamilyGroups,
  useCreateFamilyGroup,
} from '~/composables/resources/common'
import { extractApiErrorMessage } from '~/utils/errors'

type EventData = {
  id?: number
  organisation?: number
}

export const useAttendeeFamilyGuardiansEditor = (
  attendeeId: Ref<string>,
  attendeeResourceId: Ref<string | undefined>,
  eventId: Ref<string>,
  eventData: Ref<EventData | undefined>,
) => {
  const toast = useToast()

  const guardians = useGuardians(computed(() => {
    if (!attendeeId.value) return undefined
    return {
      attendee: attendeeResourceId.value,
      page_size: 100,
    }
  }))

  const familyMemberships = useFamilyAttendees(computed(() => {
    if (!attendeeId.value) return undefined
    return {
      attendee: attendeeResourceId.value,
      page_size: 100,
    }
  }))

  const familyGroups = useFamilyGroups(computed(() => ({ page_size: 100, event: eventId.value } as any)))
  const guardianAttendees = useAttendees(computed(() => ({
    event: eventId.value,
    page_size: 200,
  })))

  const createGuardianMutation = useCreateGuardian()
  const deleteGuardianMutation = useDeleteGuardian()
  const createFamilyMembershipMutation = useCreateFamilyAttendee()
  const deleteFamilyMembershipMutation = useDeleteFamilyAttendee()
  const createFamilyGroupMutation = useCreateFamilyGroup()

  const showAddGuardianForm = ref(false)
  const showAddFamilyMembershipForm = ref(false)
  const showCreateFamilyGroupForm = ref(false)
  const newFamilyGroupName = ref('')
  const newGuardian = ref<{
    relationship: 'spouse' | 'child' | 'friend' | 'parent' | 'sibling' | 'other'
  }>({
    relationship: 'parent',
  })

  const guardianSearchQuery = ref('')
  const selectedGuardianAttendeeId = ref<string | null>(null)

  const filteredGuardianAttendees = computed(() => {
    const attendees = guardianAttendees.data.value?.data?.results || []
    const searchQuery = guardianSearchQuery.value.trim().toLowerCase()

    return attendees
      .filter((candidate: any) => candidate.attendee_id !== attendeeId.value)
      .filter((candidate: any) => {
        if (!searchQuery) return true

        const fullName = String(candidate.full_name || '').toLowerCase()
        const email = String(candidate.email || '').toLowerCase()
        const displayId = String(candidate.attendee_display_id || '').toLowerCase()

        return (
          fullName.includes(searchQuery) ||
          email.includes(searchQuery) ||
          displayId.includes(searchQuery)
        )
      })
  })

  const selectedGuardianCandidate = computed(() => {
    if (!selectedGuardianAttendeeId.value) return null
    return filteredGuardianAttendees.value.find(
      (candidate: any) => candidate.attendee_id === selectedGuardianAttendeeId.value,
    ) || null
  })

  const selectedGuardianHasLinkedUser = computed(() => {
    return !!(selectedGuardianCandidate.value as any)?._links?.user
  })

  const newFamilyMembership = ref<{
    family_group: number | null
    relationship: 'parent' | 'sibling' | 'child' | 'spouse' | 'friend' | 'other'
    is_primary_guardian: boolean
  }>({
    family_group: null,
    relationship: 'sibling',
    is_primary_guardian: false,
  })

  const cancelAddGuardian = () => {
    showAddGuardianForm.value = false
    newGuardian.value = {
      relationship: 'parent',
    }
    guardianSearchQuery.value = ''
    selectedGuardianAttendeeId.value = null
  }

  const handleAddGuardian = async () => {
    if (!attendeeId.value) {
      toast.add({ title: 'Error', description: 'Attendee is not loaded yet', color: 'red' })
      return
    }

    if (!selectedGuardianAttendeeId.value) {
      toast.add({ title: 'Error', description: 'Please choose an attendee to link as guardian', color: 'red' })
      return
    }

    const selectedCandidate = filteredGuardianAttendees.value.find(
      (candidate: any) => candidate.attendee_id === selectedGuardianAttendeeId.value,
    ) as any

    if (!selectedCandidate?._links?.user) {
      toast.add({
        title: 'Guardian Account Required',
        description: 'Selected attendee does not have a linked user account.',
        color: 'red',
      })
      return
    }

    const userLinkMatch = String(selectedCandidate._links.user).match(/\/users\/(\d+)\//)
    const selectedGuardianUserId = userLinkMatch ? parseInt(userLinkMatch[1], 10) : null

    if (!selectedGuardianUserId) {
      toast.add({ title: 'Error', description: 'Could not resolve guardian user account', color: 'red' })
      return
    }

    try {
      await createGuardianMutation.mutateAsync({
        attendee: attendeeId.value,
        user: selectedGuardianUserId,
        relationship: newGuardian.value.relationship,
      } as any)

      cancelAddGuardian()
      toast.add({ title: 'Success', description: 'Guardian added', color: 'green' })
    } catch (error) {
      console.error('Failed to add guardian:', error)
      toast.add({ title: 'Error', description: extractApiErrorMessage(error, 'Failed to add guardian'), color: 'red' })
    }
  }

  const deleteGuardian = async (guardianId: number) => {
    if (!confirm('Are you sure you want to remove this guardian relationship?')) return

    try {
      await deleteGuardianMutation.mutateAsync(guardianId)
      toast.add({ title: 'Success', description: 'Guardian removed', color: 'green' })
    } catch (error) {
      console.error('Failed to delete guardian:', error)
      toast.add({ title: 'Error', description: 'Failed to remove guardian', color: 'red' })
    }
  }

  const cancelAddFamilyMembership = () => {
    showAddFamilyMembershipForm.value = false
    newFamilyMembership.value = {
      family_group: null,
      relationship: 'sibling',
      is_primary_guardian: false,
    }
  }

  const handleAddFamilyMembership = async () => {
    if (!attendeeId.value || !newFamilyMembership.value.family_group) {
      toast.add({ title: 'Error', description: 'Select a family group first', color: 'red' })
      return
    }

    try {
      await createFamilyMembershipMutation.mutateAsync({
        family_group: newFamilyMembership.value.family_group,
        attendee: attendeeId.value,
        relationship: newFamilyMembership.value.relationship,
        is_primary_guardian: newFamilyMembership.value.is_primary_guardian,
      } as any)

      cancelAddFamilyMembership()
      toast.add({ title: 'Success', description: 'Family membership added', color: 'green' })
    } catch (error) {
      console.error('Failed to add family membership:', error)
      const errorMessage = extractApiErrorMessage(error, 'Failed to add family membership')
      if (errorMessage.toLowerCase().includes('already a member')) {
        cancelAddFamilyMembership()
        toast.add({
          title: 'Already Added',
          description: 'This attendee is already in the selected family group.',
          color: 'blue',
        })
        return
      }
      toast.add({ title: 'Error', description: errorMessage, color: 'red' })
    }
  }

  const cancelCreateFamilyGroup = () => {
    showCreateFamilyGroupForm.value = false
    newFamilyGroupName.value = ''
  }

  const handleCreateFamilyGroup = async () => {
    const familyName = newFamilyGroupName.value.trim()
    if (!familyName) {
      toast.add({ title: 'Error', description: 'Please enter a family group name', color: 'red' })
      return
    }

    const eventNumericId = eventData.value?.id
    const organisationId = eventData.value?.organisation

    if (!eventNumericId || !organisationId) {
      toast.add({ title: 'Error', description: 'Event context is not ready yet', color: 'red' })
      return
    }

    try {
      await createFamilyGroupMutation.mutateAsync({
        family_name: familyName,
        event: eventNumericId,
        organisation: organisationId,
      } as any)

      cancelCreateFamilyGroup()
      toast.add({ title: 'Success', description: 'Family group created', color: 'green' })
    } catch (error) {
      console.error('Failed to create family group:', error)
      toast.add({ title: 'Error', description: extractApiErrorMessage(error, 'Failed to create family group'), color: 'red' })
    }
  }

  const deleteFamilyMembership = async (membershipId: number) => {
    if (!confirm('Are you sure you want to remove this family membership?')) return

    try {
      await deleteFamilyMembershipMutation.mutateAsync(membershipId)
      toast.add({ title: 'Success', description: 'Family membership removed', color: 'green' })
    } catch (error) {
      console.error('Failed to remove family membership:', error)
      toast.add({ title: 'Error', description: 'Failed to remove family membership', color: 'red' })
    }
  }

  return {
    guardians,
    familyMemberships,
    familyGroups,
    guardianAttendees,
    createGuardianMutation,
    deleteGuardianMutation,
    createFamilyMembershipMutation,
    deleteFamilyMembershipMutation,
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
  }
}