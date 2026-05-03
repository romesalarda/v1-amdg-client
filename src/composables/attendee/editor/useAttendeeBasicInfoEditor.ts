import { ref, watch, type Ref } from 'vue'
import { useToast } from '#ui/composables/useToast'
import { useUpdateAttendee } from '~/composables/resources/attendee/attendees'

type RelationshipType = 'child' | 'friend' | 'other' | 'parent' | 'sibling' | 'spouse' | 'self' | ''

export const useAttendeeBasicInfoEditor = (attendeeId: Ref<string>, attendeeData: Ref<any>) => {
  const toast = useToast()
  const updateMutation = useUpdateAttendee()

  const formData = ref<{
    first_name: string
    last_name: string
    email: string
    phone_number: string
    date_of_birth: string
    gender: string
    relationship_to_user: RelationshipType
    area_from: number | null
  }>({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
    gender: '',
    relationship_to_user: '',
    area_from: null,
  })

  const editingBasicInfo = ref(false)

  watch(attendeeData, (newData) => {
    if (newData) {
      formData.value = {
        first_name: newData.first_name,
        last_name: newData.last_name,
        email: newData.email || '',
        phone_number: newData.phone_number || '',
        date_of_birth: newData.date_of_birth || '',
        gender: newData.gender || '',
        relationship_to_user: newData.relationship_to_user || '',
        area_from: newData.area_from || null,
      }
    }
  }, { immediate: true })

  const handleUpdateBasicInfo = async () => {
    try {
      await updateMutation.mutateAsync({
        attendeeId: attendeeId.value,
        body: {
          ...formData.value,
          relationship_to_user: formData.value.relationship_to_user || undefined,
        },
      })
      editingBasicInfo.value = false
      toast.add({ title: 'Success', description: 'Basic information updated', color: 'green' })
    } catch (error) {
      console.error('Failed to update attendee:', error)
      toast.add({ title: 'Error', description: 'Failed to update information', color: 'red' })
    }
  }

  const cancelEditBasicInfo = () => {
    editingBasicInfo.value = false
    if (attendeeData.value) {
      formData.value = {
        first_name: attendeeData.value.first_name,
        last_name: attendeeData.value.last_name,
        email: attendeeData.value.email || '',
        phone_number: attendeeData.value.phone_number || '',
        date_of_birth: attendeeData.value.date_of_birth || '',
        gender: attendeeData.value.gender || '',
        relationship_to_user: attendeeData.value.relationship_to_user || '',
        area_from: attendeeData.value.area_from || null,
      }
    }
  }

  return {
    updateMutation,
    formData,
    editingBasicInfo,
    handleUpdateBasicInfo,
    cancelEditBasicInfo,
  }
}