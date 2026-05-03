import { computed, ref, type Ref } from 'vue'
import { useToast } from '#ui/composables/useToast'
import {
  useAttendeeOrganisations,
  useCreateAttendeeOrganisation,
  useDeleteAttendeeOrganisation,
} from '~/composables/resources/attendee/attendeeOrganisations'
import { useOrganisations } from '~/composables/resources/organisation/organisations'

export const useAttendeeOrganisationsEditor = (attendeeId: Ref<string>) => {
  const toast = useToast()

  const attendeeOrganisations = useAttendeeOrganisations(attendeeId)
  const organisations = useOrganisations(computed(() => ({ page_size: 100 })))

  const createOrganisationMutation = useCreateAttendeeOrganisation()
  const deleteOrganisationMutation = useDeleteAttendeeOrganisation()

  const showChangeOrganisation = ref(false)
  const selectedOrganisation = ref<number | null>(null)

  const handleChangeOrganisation = async () => {
    if (!selectedOrganisation.value) {
      toast.add({ title: 'Error', description: 'Please select an organisation', color: 'red' })
      return
    }

    const existing = attendeeOrganisations.data.value?.data?.results || []
    try {
      for (const org of existing) {
        await deleteOrganisationMutation.mutateAsync({
          attendeeId: attendeeId.value,
          organisationId: org.id,
        })
      }

      await createOrganisationMutation.mutateAsync({
        attendeeId: attendeeId.value,
        body: {
          organisation: selectedOrganisation.value,
        } as any,
      })

      showChangeOrganisation.value = false
      selectedOrganisation.value = null
      toast.add({ title: 'Success', description: 'Organisation updated', color: 'green' })
    } catch (error) {
      console.error('Failed to change organisation:', error)
      toast.add({ title: 'Error', description: 'Failed to update organisation', color: 'red' })
    }
  }

  const removeOrganisation = async (organisationId: number) => {
    if (!confirm('Are you sure you want to remove this organisation?')) return

    try {
      await deleteOrganisationMutation.mutateAsync({
        attendeeId: attendeeId.value,
        organisationId,
      })
      toast.add({ title: 'Success', description: 'Organisation removed', color: 'green' })
    } catch (error) {
      console.error('Failed to remove organisation:', error)
      toast.add({ title: 'Error', description: 'Failed to remove organisation', color: 'red' })
    }
  }

  return {
    attendeeOrganisations,
    organisations,
    createOrganisationMutation,
    deleteOrganisationMutation,
    showChangeOrganisation,
    selectedOrganisation,
    handleChangeOrganisation,
    removeOrganisation,
  }
}