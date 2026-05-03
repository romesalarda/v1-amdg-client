import { computed, ref, type Ref } from 'vue'
import { useToast } from '#ui/composables/useToast'
import {
  useAttendeeEmergencyContacts,
  useCreateAttendeeEmergencyContact,
  useUpdateAttendeeEmergencyContact,
  useDeleteAttendeeEmergencyContact,
} from '~/composables/resources/attendee/attendeeEmergencyContacts'

export const useAttendeeEmergencyContactsEditor = (attendeeId: Ref<string>) => {
  const toast = useToast()

  const emergencyContacts = useAttendeeEmergencyContacts(attendeeId)
  const emergencyContactsLoading = computed(() => emergencyContacts.isLoading.value)

  const createEmergencyMutation = useCreateAttendeeEmergencyContact()
  const updateEmergencyMutation = useUpdateAttendeeEmergencyContact()
  const deleteEmergencyMutation = useDeleteAttendeeEmergencyContact()

  const showAddEmergencyForm = ref(false)
  const editingEmergencyId = ref<number | null>(null)
  const newEmergencyContact = ref({
    first_name: '',
    last_name: '',
    relationship: '',
    phone_number: '',
    email: '',
    primary_contact: false,
  })

  const cancelAddEmergencyContact = () => {
    showAddEmergencyForm.value = false
    newEmergencyContact.value = {
      first_name: '',
      last_name: '',
      relationship: '',
      phone_number: '',
      email: '',
      primary_contact: false,
    }
  }

  const cancelEditEmergencyContact = () => {
    editingEmergencyId.value = null
    newEmergencyContact.value = {
      first_name: '',
      last_name: '',
      relationship: '',
      phone_number: '',
      email: '',
      primary_contact: false,
    }
  }

  const handleAddEmergencyContact = async () => {
    if (!newEmergencyContact.value.first_name || !newEmergencyContact.value.last_name || !newEmergencyContact.value.phone_number) {
      toast.add({ title: 'Error', description: 'Please fill all required fields', color: 'red' })
      return
    }

    try {
      await createEmergencyMutation.mutateAsync({
        attendeeId: attendeeId.value,
        body: {
          first_name: newEmergencyContact.value.first_name,
          last_name: newEmergencyContact.value.last_name,
          relationship: newEmergencyContact.value.relationship as any,
          phone_number: newEmergencyContact.value.phone_number,
          email: newEmergencyContact.value.email || null,
          primary_contact: newEmergencyContact.value.primary_contact,
        },
      })
      cancelAddEmergencyContact()
      toast.add({ title: 'Success', description: 'Emergency contact added', color: 'green' })
    } catch (error) {
      console.error('Failed to add emergency contact:', error)
      toast.add({ title: 'Error', description: 'Failed to add contact', color: 'red' })
    }
  }

  const editEmergencyContact = (contact: any) => {
    editingEmergencyId.value = contact.id
    newEmergencyContact.value = {
      first_name: contact.first_name,
      last_name: contact.last_name,
      relationship: contact.relationship,
      phone_number: contact.phone_number,
      email: contact.email || '',
      primary_contact: contact.primary_contact || false,
    }
  }

  const handleUpdateEmergencyContact = async () => {
    if (!editingEmergencyId.value) return

    try {
      await updateEmergencyMutation.mutateAsync({
        attendeeId: attendeeId.value,
        contactId: editingEmergencyId.value,
        body: {
          first_name: newEmergencyContact.value.first_name,
          last_name: newEmergencyContact.value.last_name,
          relationship: newEmergencyContact.value.relationship as any,
          phone_number: newEmergencyContact.value.phone_number,
          email: newEmergencyContact.value.email || null,
          primary_contact: newEmergencyContact.value.primary_contact,
        },
      })
      cancelEditEmergencyContact()
      toast.add({ title: 'Success', description: 'Emergency contact updated', color: 'green' })
    } catch (error) {
      console.error('Failed to update emergency contact:', error)
      toast.add({ title: 'Error', description: 'Failed to update contact', color: 'red' })
    }
  }

  const deleteEmergencyContact = async (contactId: number) => {
    if (!confirm('Are you sure you want to delete this emergency contact?')) return

    try {
      await deleteEmergencyMutation.mutateAsync({
        attendeeId: attendeeId.value,
        contactId,
      })
      toast.add({ title: 'Success', description: 'Emergency contact deleted', color: 'green' })
    } catch (error) {
      console.error('Failed to delete emergency contact:', error)
      toast.add({ title: 'Error', description: 'Failed to delete contact', color: 'red' })
    }
  }

  return {
    emergencyContacts,
    emergencyContactsLoading,
    createEmergencyMutation,
    updateEmergencyMutation,
    deleteEmergencyMutation,
    showAddEmergencyForm,
    editingEmergencyId,
    newEmergencyContact,
    handleAddEmergencyContact,
    editEmergencyContact,
    handleUpdateEmergencyContact,
    deleteEmergencyContact,
    cancelAddEmergencyContact,
    cancelEditEmergencyContact,
  }
}
