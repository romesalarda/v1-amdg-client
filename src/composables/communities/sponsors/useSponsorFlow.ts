import { nextTick } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { computed, reactive, ref, watch } from 'vue'
import { loadStripe } from '@stripe/stripe-js'
import type { Stripe, StripeCardElement, StripeElements } from '@stripe/stripe-js'
import {
  useSponsorableEvents,
  useOrganisationSponsorCheckout,
  useOrganisationSponsorInvites,
  useOrganisationSponsorshipPaymentHistory,
  type SponsorCheckoutResponse,
} from '~/composables/resources/organisation/organisationSponsorInvites'
import { extractCollection, useEventSponsorshipPackages } from '~/composables/resources/events/eventSponsors'
import { usePaymentMethods } from '~/composables/resources/payments/paymentMethods'
import { useStripeConfig } from '~/composables/resources/common/stripe'
import type { SponsorableEventList, SponsorshipPaymentTimelineItem } from '~/api/types.gen'
import { extractApiErrorMessage } from '~/utils/errors'
import { formatMoney } from '~/utils/money'

export type PackageItem = {
  package_id: string
  package_name: string
  tier: number
  modified_amount: string
  base_amount_currency: string
}

export const SPONSOR_FLOW_STEPS = [
  { id: 1, label: 'Event', hint: 'Choose a target' },
  { id: 2, label: 'Package', hint: 'Set package + payment' },
  { id: 3, label: 'Review', hint: 'Confirm checkout' },
] as const

export function useSponsorFlow(
  organisationId: Ref<string> | ComputedRef<string>,
  organisationNumericId: ComputedRef<number | undefined>,
  selectedEventId: Ref<string>,
  selectedEventSnapshot: Ref<SponsorableEventList | null>,
) {
  const { $notyf } = useNuxtApp()

  const eventSearch = ref('')
  const eventPage = ref(1)
  const eventPageSize = 8
  const activeStep = ref(1)
  const checkoutResult = ref<SponsorCheckoutResponse | null>(null)

  const checkoutForm = reactive({
    mode: 'direct' as 'direct' | 'token',
    inviteToken: '',
    packageId: '',
    paymentMethodId: null as number | null,
    name: '',
    description: '',
  })

  watch(eventSearch, () => {
    eventPage.value = 1
  })

  watch(selectedEventId, () => {
    activeStep.value = 1
  })

  // Sponsorable events
  const { data: sponsorableEventsResponse, isLoading: isLoadingSponsorableEvents } = useSponsorableEvents(computed(() => ({
    organisation: organisationNumericId.value,
    search: eventSearch.value.trim() || undefined,
    page: eventPage.value,
    page_size: eventPageSize,
    ordering: 'start_datetime',
  })))

  const sponsorableEvents = computed(() => sponsorableEventsResponse.value?.events || [])
  const sponsorableEventsCount = computed(() => sponsorableEventsResponse.value?.count || 0)
  const hasNextEventsPage = computed(() => !!sponsorableEventsResponse.value?.next)
  const hasPrevEventsPage = computed(() => !!sponsorableEventsResponse.value?.previous)

  // Auto-select first event when list loads
  watch(
    sponsorableEvents,
    (value) => {
      if (!selectedEventId.value && value.length > 0) {
        selectedEventId.value = value[0].event_id
        selectedEventSnapshot.value = value[0]
        return
      }
      const updated = value.find(event => event.event_id === selectedEventId.value)
      if (updated) {
        selectedEventSnapshot.value = updated
      }
    },
    { immediate: true },
  )

  const selectedEvent = computed(() => {
    const inCurrentPage = sponsorableEvents.value.find(event => event.event_id === selectedEventId.value)
    return inCurrentPage || selectedEventSnapshot.value
  })

  // Invites — needed for checkout validation (TanStack Query deduplicates)
  const { data: invitesResponse } = useOrganisationSponsorInvites(computed(() => {
    if (!selectedEventId.value) return undefined
    return { event_id: selectedEventId.value, page_size: 100 }
  }))

  const acceptedInvites = computed(() => {
    const invites = invitesResponse.value?.invites as Array<{ accepted: boolean }> | undefined
    return invites?.filter(i => i.accepted) || []
  })

  // Packages — requires url_safe_title path param (NOT UUID)
  const packagesEventUrlSafeTitle = computed(() => selectedEventSnapshot.value?.url_safe_title || '')
  const { data: packagesResponse, isLoading: isLoadingPackages } = useEventSponsorshipPackages(packagesEventUrlSafeTitle)
  const sponsorshipPackages = computed<PackageItem[]>(() => extractCollection<PackageItem>(packagesResponse.value?.data))

  // Payment methods — filter by event UUID
  const { data: paymentMethodsResponse, isLoading: isLoadingPaymentMethods } = usePaymentMethods(computed(() => {
    if (!selectedEventId.value) return undefined
    return { event_id: selectedEventId.value, is_active: true, page_size: 100 }
  }))
  const paymentMethods = computed<any[]>(() => extractCollection<any>(paymentMethodsResponse.value?.data))

  // Payment history
  const { data: paymentHistoryData, isLoading: isLoadingPaymentHistory } = useOrganisationSponsorshipPaymentHistory(computed(() => {
    if (!selectedEventId.value || !organisationNumericId.value) return undefined
    return { event_id: selectedEventId.value, organisation_id: organisationNumericId.value }
  }))

  const paymentSummary = computed<Record<string, unknown>>(() => {
    const source = paymentHistoryData.value?.summary
    if (!source || typeof source !== 'object') return {}
    return source as Record<string, unknown>
  })

  const paymentSummaryCount = computed(() => {
    const value = paymentSummary.value.total_payments ?? paymentSummary.value.payments_count ?? paymentSummary.value.count
    return typeof value === 'number' ? value : Number(value || 0)
  })

  const paymentSummaryPending = computed(() => {
    const value = paymentSummary.value.pending_payments ?? paymentSummary.value.pending_count ?? 0
    return typeof value === 'number' ? value : Number(value || 0)
  })

  const paymentSummaryAmount = computed(() => {
    const amount = paymentSummary.value.total_completed_amount || '0'
    const currency = typeof paymentSummary.value.currency === 'string' ? paymentSummary.value.currency : 'GBP'
    return formatMoney(String(amount), currency)
  })

  const paymentTimeline = computed<SponsorshipPaymentTimelineItem[]>(() => paymentHistoryData.value?.timeline || [])

  // Selected package / method
  const selectedPackage = computed(() =>
    sponsorshipPackages.value.find(pkg => pkg.package_id === checkoutForm.packageId) || null,
  )
  const selectedPaymentMethod = computed(() =>
    paymentMethods.value.find(method => method.id === checkoutForm.paymentMethodId) || null,
  )
  const selectedPackageAmount = computed(() => {
    if (!selectedPackage.value) return 'N/A'
    return formatMoney(selectedPackage.value.modified_amount, selectedPackage.value.base_amount_currency)
  })

  // Checkout validation
  const checkoutBlockMessage = computed(() => {
    if (!selectedEvent.value) return 'Select an event to continue with sponsorship checkout.'
    if (!selectedEvent.value.can_checkout) {
      return selectedEvent.value.sponsor_checkout_policy_notes || 'Checkout is currently not available for this event under its sponsorship policy.'
    }
    if (selectedEvent.value.requires_invite_acceptance_for_checkout && checkoutForm.mode === 'direct' && acceptedInvites.value.length === 0) {
      return 'This event requires an accepted invite before direct checkout. Use Invite Token mode after accepting an invite.'
    }
    return ''
  })

  const canCheckout = computed(() => {
    if (!selectedEvent.value?.can_checkout) return false
    const hasCoreFields = !!checkoutForm.packageId && !!checkoutForm.paymentMethodId
    if (!hasCoreFields) return false
    if (checkoutForm.mode === 'token') return checkoutForm.inviteToken.trim().length > 0
    if (selectedEvent.value?.requires_invite_acceptance_for_checkout && acceptedInvites.value.length === 0) return false
    return !!selectedEventId.value
  })

  // Stripe config (for publishable key)
  const { data: stripeConfigData } = useStripeConfig()
  const stripePublishableKey = computed(() => String(stripeConfigData.value?.data?.publishable_key || '').trim())

  // Stripe state
  const stripeCardMountRef = ref<HTMLElement | null>(null)
  const stripeInstance = ref<Stripe | null>(null)
  const stripeElements = ref<StripeElements | null>(null)
  const stripeCardElement = ref<StripeCardElement | null>(null)
  const stripeCardReady = ref(false)
  const stripeCardError = ref('')
  const stripePaymentAttemptError = ref('')
  const isConfirmingStripePayment = ref(false)

  const isStripeMethod = computed(() => selectedPaymentMethod.value?.method_type === 'STRIPE')

  const getStripeAccountId = (): string | null => {
    const details = selectedPaymentMethod.value?.provided_details
    if (!details || typeof details !== 'object' || Array.isArray(details)) return null
    const id = (details as Record<string, unknown>).stripe_account_id
    return typeof id === 'string' && id.trim() ? id.trim() : null
  }

  const teardownStripeElements = () => {
    if (stripeCardElement.value) {
      stripeCardElement.value.unmount()
      stripeCardElement.value = null
    }
    stripeElements.value = null
    stripeInstance.value = null
    stripeCardReady.value = false
    stripeCardError.value = ''
    stripePaymentAttemptError.value = ''
  }

  const ensureStripeCardMounted = async () => {
    if (!isStripeMethod.value || activeStep.value !== 3) return
    if (stripeCardElement.value) return

    const key = stripePublishableKey.value
    if (!key) {
      stripeCardError.value = 'Stripe is not configured yet.'
      return
    }

    await nextTick()
    if (!stripeCardMountRef.value) return

    const accountId = getStripeAccountId()
    const stripe = await loadStripe(key, accountId ? ({ stripeAccount: accountId } as any) : {})
    if (!stripe) {
      stripeCardError.value = 'Could not initialize Stripe card form.'
      return
    }

    stripeInstance.value = stripe
    stripeElements.value = stripe.elements()
    stripeCardElement.value = stripeElements.value.create('card', { hidePostalCode: true })
    stripeCardElement.value.mount(stripeCardMountRef.value)
    stripeCardElement.value.on('change', (event) => {
      stripeCardError.value = event.error?.message || ''
      stripeCardReady.value = !!event.complete && !event.error
      if (stripePaymentAttemptError.value) stripePaymentAttemptError.value = ''
    })
  }

  watch(
    [isStripeMethod, activeStep, stripePublishableKey],
    ([stripeSelected, step, key], [, , prevKey]) => {
      if (!stripeSelected || step !== 3) {
        teardownStripeElements()
        return
      }
      if (key !== prevKey) teardownStripeElements()
      void ensureStripeCardMounted().catch((err) => {
        console.error('[sponsor stripe init] mount failed', err)
      })
    },
    { immediate: true },
  )

  // Checkout mutation
  const checkoutMutation = useOrganisationSponsorCheckout()
  const isCheckingOut = computed(() => checkoutMutation.isPending.value)

  // Step navigation
  function canGoNextStep(): boolean {
    if (activeStep.value === 1) return !!selectedEventId.value
    if (activeStep.value === 2) return canCheckout.value
    return false
  }

  function goNextStep() {
    if (activeStep.value === 1 && !selectedEventId.value) {
      $notyf.error('Select an event to continue.')
      return
    }
    if (activeStep.value === 2 && !canCheckout.value) {
      $notyf.error(checkoutBlockMessage.value || 'Complete package and payment details first.')
      return
    }
    activeStep.value = Math.min(3, activeStep.value + 1)
  }

  // Event selection helpers
  function selectEvent(event: SponsorableEventList) {
    selectedEventId.value = event.event_id
    selectedEventSnapshot.value = event
    checkoutResult.value = null
    checkoutForm.packageId = ''
    checkoutForm.paymentMethodId = null
    checkoutForm.description = ''
    checkoutForm.inviteToken = ''
  }

  function selectFirstEvent() {
    const first = sponsorableEvents.value[0]
    if (first) selectEvent(first)
  }

  // Checkout submit
  async function submitCheckout() {
    if (!canCheckout.value) {
      $notyf.error(checkoutBlockMessage.value || 'Complete package, payment method, and mode details before checkout.')
      return
    }

    const payload: any = {
      package_id: checkoutForm.packageId,
      payment_method_id: checkoutForm.paymentMethodId,
    }

    if (selectedEventId.value) {
      payload.event_id = selectedEventId.value
    }

    if (checkoutForm.mode === 'token') {
      payload.invite_token = checkoutForm.inviteToken.trim()
    } else {
      if (!organisationNumericId.value) {
        $notyf.error('Community information is still loading. Please try again.')
        return
      }
      payload.organisation_id = organisationNumericId.value
    }

    if (checkoutForm.name.trim()) payload.name = checkoutForm.name.trim()
    if (checkoutForm.description.trim()) payload.description = checkoutForm.description.trim()

    try {
      const response = await checkoutMutation.mutateAsync(payload)
      if (response.error) {
        $notyf.error(extractApiErrorMessage(response.error, 'Checkout failed.'))
        return
      }
      // Hold the response data locally — do NOT set checkoutResult yet for Stripe.
      // Setting checkoutResult causes v-if="!checkoutResult" to unmount the card element,
      // which would break confirmCardPayment if called after.
      const responseData = (response?.data || null) as SponsorCheckoutResponse | null

      if (isStripeMethod.value) {
        const clientSecret = responseData?.client_secret
        if (!clientSecret) {
          $notyf.error('Stripe checkout initialized but no client secret was returned. Contact support.')
          checkoutResult.value = responseData
          return
        }
        // Card element should already be mounted (watcher fires on step 3 entry).
        // ensureStripeCardMounted() is idempotent — safe to call as a guard.
        await ensureStripeCardMounted()
        if (!stripeInstance.value || !stripeCardElement.value) {
          $notyf.error(stripeCardError.value || 'Card form could not be initialized. Please refresh and try again.')
          return
        }
        isConfirmingStripePayment.value = true
        stripePaymentAttemptError.value = ''
        const accountId = getStripeAccountId()
        const result = await stripeInstance.value.confirmCardPayment(
          clientSecret,
          { payment_method: { card: stripeCardElement.value } },
          accountId ? ({ stripeAccount: accountId } as any) : undefined,
        )
        isConfirmingStripePayment.value = false
        if (result.error) {
          stripePaymentAttemptError.value = result.error.message || 'Card payment failed.'
          $notyf.error(stripePaymentAttemptError.value)
          return
        }
        // Only set checkoutResult AFTER confirmation — this unmounts the card element
        checkoutResult.value = responseData
        $notyf.success('Card payment confirmed!')
      } else {
        checkoutResult.value = responseData
        $notyf.success('Checkout initialized successfully.')
      }
    } catch (error) {
      isConfirmingStripePayment.value = false
      $notyf.error(extractApiErrorMessage(error, 'Checkout failed.'))
    }
  }

  // Reset flow state (called when switching away mid-flow)
  function resetFlow() {
    activeStep.value = 1
    checkoutResult.value = null
    checkoutForm.packageId = ''
    checkoutForm.paymentMethodId = null
    checkoutForm.description = ''
    checkoutForm.inviteToken = ''
  }

  // Invite-mode auto-switch
  watch(
    () => selectedEvent.value?.requires_invite_acceptance_for_checkout,
    (requiresInvite) => {
      if (requiresInvite && acceptedInvites.value.length === 0) {
        checkoutForm.mode = 'token'
      }
    },
    { immediate: true },
  )

  return {
    // state
    eventSearch,
    eventPage,
    eventPageSize,
    activeStep,
    checkoutForm,
    checkoutResult,
    steps: SPONSOR_FLOW_STEPS,
    // loading
    isLoadingSponsorableEvents,
    isLoadingPackages,
    isLoadingPaymentMethods,
    isLoadingPaymentHistory,
    isCheckingOut,
    // event data
    sponsorableEvents,
    sponsorableEventsCount,
    hasNextEventsPage,
    hasPrevEventsPage,
    selectedEvent,
    // packages / methods
    sponsorshipPackages,
    paymentMethods,
    selectedPackage,
    selectedPaymentMethod,
    selectedPackageAmount,
    // payment history
    paymentHistoryData,
    paymentSummaryCount,
    paymentSummaryPending,
    paymentSummaryAmount,
    paymentTimeline,
    // checkout
    canCheckout,
    checkoutBlockMessage,
    canGoNextStep,
    goNextStep,
    selectEvent,
    selectFirstEvent,
    submitCheckout,
    resetFlow,
    // stripe
    stripeCardMountRef,
    stripeCardReady,
    stripeCardError,
    stripePaymentAttemptError,
    isConfirmingStripePayment,
    isStripeMethod,
  }
}
