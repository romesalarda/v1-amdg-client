import { computed, ref, type Ref } from 'vue'
import { useToast } from '#ui/composables/useToast'
import {
  useAttendeeAlternativeSignins,
  useCreateAttendeeAlternativeSignin,
  useUpdateAttendeeAlternativeSignin,
  useDeleteAttendeeAlternativeSignin,
} from '~/composables/resources/booking/bookingAlternativeSignins'
import { useBookingAlternativeSignins } from '~/composables/resources/booking/bookingAlternativeSignins'
import type { AttendeeAlternativeSigninList } from '~/api/types.gen'

export const useAttendeeIdentifiersEditor = (
  attendeeId: Ref<string>,
  eventId: Ref<string>,
) => {
  const toast = useToast()

  // Fetch all attendee alternative signins filtered by this attendee's UUID
  const attendeeSignins = useAttendeeAlternativeSignins(
    computed(() => ({ attendee: attendeeId.value }))
  )

  // Fetch event-level alternative signin definitions for the dropdown
  const eventSigninDefinitions = useBookingAlternativeSignins(
    computed(() => ({ event: eventId.value, is_active: true, page_size: 100 }))
  )

  const signinsLoading = computed(() => attendeeSignins.isLoading.value)

  const createMutation = useCreateAttendeeAlternativeSignin()
  const updateMutation = useUpdateAttendeeAlternativeSignin()
  const deleteMutation = useDeleteAttendeeAlternativeSignin()

  const showAddForm = ref(false)
  const editingSigninId = ref<string | null>(null)
  const editingSignin = ref<AttendeeAlternativeSigninList | null>(null)

  const newSignin = ref({
    event_alternative_signin: '',
    identifier: '',
    ticket: null as string | null,
  })

  const resetForm = () => {
    newSignin.value = {
      event_alternative_signin: '',
      identifier: '',
      ticket: null,
    }
  }

  const cancelAddSignin = () => {
    showAddForm.value = false
    resetForm()
  }

  const startEditSignin = (signin: AttendeeAlternativeSigninList) => {
    editingSigninId.value = signin.sign_id
    editingSignin.value = signin
    newSignin.value = {
      event_alternative_signin: signin.event_alternative_signin,
      identifier: signin.identifier,
      ticket: signin.ticket ?? null,
    }
  }

  const cancelEditSignin = () => {
    editingSigninId.value = null
    editingSignin.value = null
    resetForm()
  }

  const handleAddSignin = async () => {
    if (!newSignin.value.event_alternative_signin || !newSignin.value.identifier.trim()) {
      toast.add({ title: 'Error', description: 'Please fill in all required fields.', color: 'red' })
      return
    }

    try {
      await createMutation.mutateAsync({
        attendee: attendeeId.value as any, // UUID accepted by backend via SlugRelatedField
        event_alternative_signin: newSignin.value.event_alternative_signin,
        identifier: newSignin.value.identifier.trim(),
        ticket: newSignin.value.ticket ?? undefined,
      })
      cancelAddSignin()
      toast.add({ title: 'Success', description: 'Alternative identifier added.', color: 'green' })
    } catch (error: any) {
      const msg = error?.body?.identifier?.[0] || error?.body?.detail || error?.message || 'Failed to add identifier.'
      toast.add({ title: 'Error', description: msg, color: 'red' })
    }
  }

  const handleUpdateSignin = async () => {
    if (!editingSigninId.value || !newSignin.value.identifier.trim()) {
      toast.add({ title: 'Error', description: 'Please fill in all required fields.', color: 'red' })
      return
    }

    try {
      await updateMutation.mutateAsync({
        signId: editingSigninId.value,
        body: {
          attendee: attendeeId.value,
          event_alternative_signin: newSignin.value.event_alternative_signin,
          identifier: newSignin.value.identifier.trim(),
          ticket: newSignin.value.ticket ?? undefined,
        },
      })
      cancelEditSignin()
      toast.add({ title: 'Success', description: 'Alternative identifier updated.', color: 'green' })
    } catch (error: any) {
      const msg = error?.body?.identifier?.[0] || error?.body?.detail || error?.message || 'Failed to update identifier.'
      toast.add({ title: 'Error', description: msg, color: 'red' })
    }
  }

  const handleDeleteSignin = async (signId: string) => {
    try {
      await deleteMutation.mutateAsync(signId)
      toast.add({ title: 'Success', description: 'Alternative identifier removed.', color: 'green' })
    } catch (error: any) {
      toast.add({ title: 'Error', description: 'Failed to remove identifier.', color: 'red' })
    }
  }

  return {
    attendeeSignins,
    eventSigninDefinitions,
    signinsLoading,
    createMutation,
    updateMutation,
    deleteMutation,
    showAddForm,
    editingSigninId,
    newSignin,
    cancelAddSignin,
    startEditSignin,
    cancelEditSignin,
    handleAddSignin,
    handleUpdateSignin,
    handleDeleteSignin,
  }
}
