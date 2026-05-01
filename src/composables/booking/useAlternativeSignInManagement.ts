import type { Ref } from 'vue'
import {
  useCreateBookingAlternativeSignin,
  usePartialUpdateBookingAlternativeSignin,
  useDeleteBookingAlternativeSignin,
} from '~/composables/resources/booking/bookingAlternativeSignins'

export const patternOptions = [
  { label: 'No Pattern (Any Format)', value: 'none' },
  { label: 'Numeric Only (e.g., 12345)', value: 'numeric' },
  { label: 'Alphanumeric (e.g., ABC123)', value: 'alphanumeric' },
  { label: 'Dashed Numbers (e.g., 1234-5678-9012)', value: 'dashed-numeric' },
  { label: 'Email Format', value: 'email' },
  { label: 'Custom Regex', value: 'custom' },
]

export const patternExamples: Record<string, { regex: string; example: string; description: string }> = {
  numeric: {
    regex: String.raw`^\d+$`,
    example: '12345',
    description: 'Only numbers allowed',
  },
  alphanumeric: {
    regex: String.raw`^[A-Za-z0-9]+$`,
    example: 'ABC123',
    description: 'Letters and numbers only',
  },
  'dashed-numeric': {
    regex: String.raw`^\d{4}-\d{4}-\d{4}$`,
    example: '1234-5678-9012',
    description: 'Four digits, dash, four digits, dash, four digits',
  },
  email: {
    regex: String.raw`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`,
    example: 'user@example.com',
    description: 'Valid email address format',
  },
}

export function detectPatternType(formatMatch: string | null): string {
  if (!formatMatch) return 'none'
  for (const [key, pattern] of Object.entries(patternExamples)) {
    if (pattern.regex === formatMatch) return key
  }
  return 'custom'
}

export function useAlternativeSignInManagement(
  eventPk: Ref<number | null>,
  signIns: Ref<any[]>,
  refetchSignIns: () => void,
) {
  const route = useRoute()
  const router = useRouter()
  const toast = useToast()

  const showSignInModal = ref(false)
  const editingSignIn = ref<any>(null)
  const isManualModalOpen = ref(false)

  const addSignInMutation = useCreateBookingAlternativeSignin()
  const updateSignInMutation = usePartialUpdateBookingAlternativeSignin()
  const deleteSignInMutation = useDeleteBookingAlternativeSignin()

  const signInMutationLoading = computed(
    () => addSignInMutation.isPending.value || updateSignInMutation.isPending.value,
  )

  const openSignInModal = (signIn?: any) => {
    if (signIn) {
      editingSignIn.value = signIn
      if (signIn.id) {
        isManualModalOpen.value = true
        router.replace({ query: { ...route.query, 'signin-id': signIn.id.toString() } })
      }
    } else {
      editingSignIn.value = null
    }
    showSignInModal.value = true
  }

  const closeSignInModal = () => {
    showSignInModal.value = false
    editingSignIn.value = null

    if (route.query['signin-id']) {
      router.replace({ query: { ...route.query, 'signin-id': undefined } })
    }
    isManualModalOpen.value = false
  }

  const onSubmitSignIn = async (data: {
    title: string
    description?: string
    format_match: string | null
    max_uses_per_signin: number | null
  }) => {
    try {
      const payload = {
        title: data.title,
        description: data.description || undefined,
        format_match: data.format_match,
        max_uses_per_signin: data.max_uses_per_signin,
        is_active: true,
      }

      if (editingSignIn.value) {
        await updateSignInMutation.mutateAsync({ signinId: editingSignIn.value.id, body: payload })
        toast.add({ title: 'Sign-in method updated', color: 'green' })
      } else {
        await addSignInMutation.mutateAsync({ ...payload, event: Number(eventPk.value) })
        toast.add({ title: 'Sign-in method created', color: 'green' })
      }

      closeSignInModal()
      refetchSignIns()
    } catch (error) {
      toast.add({
        title: editingSignIn.value ? 'Failed to update sign-in method' : 'Failed to create sign-in method',
        description: error instanceof Error ? error.message : 'An error occurred',
        color: 'red',
      })
    }
  }

  const removeSignIn = async (signInId: string) => {
    try {
      await deleteSignInMutation.mutateAsync(signInId)
      toast.add({ title: 'Sign-in method removed', color: 'green' })
      refetchSignIns()
    } catch (error) {
      toast.add({
        title: 'Failed to remove sign-in method',
        description: error instanceof Error ? error.message : 'An error occurred',
        color: 'red',
      })
    }
  }

  // URL param watcher — opens modal when ?signin-id= is present on load
  watch(
    () => ({
      signinId: route.query['signin-id'],
      signInsLoaded: signIns.value.length > 0,
    }),
    ({ signinId, signInsLoaded }) => {
      if (isManualModalOpen.value) {
        isManualModalOpen.value = false
        return
      }
      if (signinId && signInsLoaded && !showSignInModal.value) {
        const signin = signIns.value.find(s => s.id === signinId)
        if (signin) openSignInModal(signin)
      }
    },
  )

  return {
    showSignInModal,
    editingSignIn,
    signInMutationLoading,
    openSignInModal,
    closeSignInModal,
    onSubmitSignIn,
    removeSignIn,
  }
}
