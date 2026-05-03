import { computed, ref, type Ref } from 'vue'
import { useToast } from '#ui/composables/useToast'
import { useConsents } from '~/composables/resources/attendee/attendeeConsents'
import {
  useAttendeeConsents,
  useCreateAttendeeConsent,
  usePartialUpdateAttendeeConsent,
  useDeleteAttendeeConsent,
} from '~/composables/resources/attendee/attendeeConsentsRelationship'

export const useAttendeeConsentsEditor = (attendeeId: Ref<string>, eventId: Ref<string>) => {
  const toast = useToast()

  const eventConsents = useConsents(computed(() => ({ event: eventId.value })))
  const attendeeConsents = useAttendeeConsents(attendeeId)

  const createConsentMutation = useCreateAttendeeConsent()
  const partialUpdateConsentMutation = usePartialUpdateAttendeeConsent()
  const deleteConsentMutation = useDeleteAttendeeConsent()

  const showAddConsentForm = ref(false)
  const newConsent = ref<{
    consent: number | null
    consent_given: boolean
  }>({ consent: null, consent_given: false })

  const cancelAddConsent = () => {
    showAddConsentForm.value = false
    newConsent.value = {
      consent: null,
      consent_given: false,
    }
  }

  const handleAddConsent = async () => {
    if (!newConsent.value.consent) {
      toast.add({ title: 'Error', description: 'Please select a consent', color: 'red' })
      return
    }

    const existing = attendeeConsents.data.value?.data?.results || []
    const duplicate = existing.find((c: any) => c.consent === newConsent.value.consent)
    if (duplicate) {
      toast.add({ title: 'Error', description: 'This consent already exists', color: 'red' })
      return
    }

    try {
      await createConsentMutation.mutateAsync({
        attendeeId: attendeeId.value,
        body: {
          consent: newConsent.value.consent,
          consent_given: newConsent.value.consent_given,
          given_at: newConsent.value.consent_given ? new Date().toISOString() : null,
        } as any,
      })
      cancelAddConsent()
      toast.add({ title: 'Success', description: 'Consent added', color: 'green' })
    } catch (error) {
      console.error('Failed to add consent:', error)
      toast.add({ title: 'Error', description: 'Failed to add consent', color: 'red' })
    }
  }

  const toggleConsentGiven = async (consentRecord: any) => {
    try {
      await partialUpdateConsentMutation.mutateAsync({
        attendeeId: attendeeId.value,
        consentId: consentRecord.id,
        body: {
          consent_given: !consentRecord.consent_given,
          given_at: !consentRecord.consent_given ? new Date().toISOString() : null,
        } as any,
      })
      toast.add({ title: 'Success', description: 'Consent updated', color: 'green' })
    } catch (error) {
      console.error('Failed to toggle consent:', error)
      toast.add({ title: 'Error', description: 'Failed to update consent', color: 'red' })
    }
  }

  const deleteConsent = async (consentId: number) => {
    if (!confirm('Are you sure you want to delete this consent record?')) return

    try {
      await deleteConsentMutation.mutateAsync({
        attendeeId: attendeeId.value,
        consentId,
      })
      toast.add({ title: 'Success', description: 'Consent deleted', color: 'green' })
    } catch (error) {
      console.error('Failed to delete consent:', error)
      toast.add({ title: 'Error', description: 'Failed to delete consent', color: 'red' })
    }
  }

  const markAllRequiredConsentsAsGiven = async () => {
    const requiredConsents = eventConsents.data.value?.data?.results?.filter((c: any) => c.required) || []
    const existingConsentIds = new Set(attendeeConsents.data.value?.data?.results?.map((ac: any) => ac.consent) || [])

    if (!confirm(`This will mark all ${requiredConsents.length} required consents as given. Continue?`)) return

    try {
      for (const consent of requiredConsents) {
        if (!existingConsentIds.has(consent.id)) {
          await createConsentMutation.mutateAsync({
            attendeeId: attendeeId.value,
            body: {
              consent: consent.id,
              consent_given: true,
              given_at: new Date().toISOString(),
            } as any,
          })
        } else {
          const existingRecord = attendeeConsents.data.value?.data?.results?.find((ac: any) => ac.consent === consent.id)
          if (existingRecord && !existingRecord.consent_given) {
            await partialUpdateConsentMutation.mutateAsync({
              attendeeId: attendeeId.value,
              consentId: existingRecord.id,
              body: {
                consent_given: true,
                given_at: new Date().toISOString(),
              } as any,
            })
          }
        }
      }
      toast.add({ title: 'Success', description: 'All required consents marked as given', color: 'green' })
    } catch (error) {
      console.error('Failed to mark consents:', error)
      toast.add({ title: 'Error', description: 'Failed to mark some consents', color: 'red' })
    }
  }

  return {
    eventConsents,
    attendeeConsents,
    createConsentMutation,
    partialUpdateConsentMutation,
    deleteConsentMutation,
    showAddConsentForm,
    newConsent,
    handleAddConsent,
    toggleConsentGiven,
    deleteConsent,
    markAllRequiredConsentsAsGiven,
    cancelAddConsent,
  }
}
