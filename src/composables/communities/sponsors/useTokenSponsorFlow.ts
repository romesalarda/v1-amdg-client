import { nextTick } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { computed, reactive, ref, watch } from 'vue'
import { loadStripe } from '@stripe/stripe-js'
import type { Stripe, StripeCardElement, StripeElements } from '@stripe/stripe-js'
import {
  useRetrieveSponsorInviteByToken,
  useOrganisationSponsorCheckout,
  type SponsorCheckoutResponse,
  type SponsorInviteByTokenData,
} from '~/composables/resources/organisation/organisationSponsorInvites'
import { extractCollection, useEventSponsorshipPackages } from '~/composables/resources/events/eventSponsors'
import { usePaymentMethods } from '~/composables/resources/payments/paymentMethods'
import { useStripeConfig } from '~/composables/resources/common/stripe'
import { useSponsorPackageStyling } from '~/composables/communities/sponsors/useSponsorPackageStyling'
import { extractApiErrorMessage } from '~/utils/errors'
import { formatMoney } from '~/utils/money'

export type TokenFlowPackageItem = {
  package_id: string
  package_name: string
  package_description?: string | null
  tier?: number | null
  modified_amount?: string
  base_amount?: string
  base_amount_currency?: string
  active?: boolean
  sponsors_count?: number
}

export type TokenFlowPaymentMethod = {
  id: number
  title: string
  method_type: string
  provided_details?: Record<string, unknown> | null
}

export const TOKEN_FLOW_STEPS = [
  { key: 'invite', label: 'Invite', description: 'Review details' },
  { key: 'package', label: 'Package', description: 'Select & pay' },
  { key: 'review', label: 'Review', description: 'Confirm checkout' },
] as const

export function useTokenSponsorFlow(
  token: Ref<string> | ComputedRef<string>,
  eventUrlSafeTitle: Ref<string> | ComputedRef<string>,
) {
  const { $notyf } = useNuxtApp()

  const activeStep = ref(0) // 0-indexed for UStepper.vue
  const checkoutResult = ref<SponsorCheckoutResponse | null>(null)

  const checkoutForm = reactive({
    packageId: '',
    paymentMethodId: null as number | null,
    organisationName: '',
    sponsorName: '',
    description: '',
  })

  // ── Invite data ────────────────────────────────────────────────────────────
  const {
    data: inviteData,
    isLoading: isLoadingInvite,
    isError: isInviteError,
    error: inviteError,
  } = useRetrieveSponsorInviteByToken(token)

  const invite = computed<SponsorInviteByTokenData | null>(() => inviteData.value ?? null)

  const inviteIsValid = computed(() => {
    if (!invite.value) return false
    return invite.value.is_valid
  })

  // Whether the invite has a pre-linked organisation (no org-name input needed).
  const inviteHasOrg = computed(() => !!invite.value?.organisation)

  // The event UUID to send with the checkout payload.
  const eventUuid = computed(() => invite.value?.event_id ?? '')

  // ── Packages ───────────────────────────────────────────────────────────────
  const { data: packagesResponse, isLoading: isLoadingPackages } = useEventSponsorshipPackages(eventUrlSafeTitle)
  const packages = computed<TokenFlowPackageItem[]>(() =>
    extractCollection<TokenFlowPackageItem>(packagesResponse.value?.data),
  )
  const { styledPackages } = useSponsorPackageStyling(packages)

  // ── Payment methods ────────────────────────────────────────────────────────
  const { data: paymentMethodsResponse, isLoading: isLoadingPaymentMethods } = usePaymentMethods(computed(() => {
    if (!eventUuid.value) return undefined
    return { event_id: eventUuid.value, is_active: true, page_size: 100 }
  }))
  const paymentMethods = computed<TokenFlowPaymentMethod[]>(() =>
    extractCollection<TokenFlowPaymentMethod>(paymentMethodsResponse.value?.data),
  )

  // ── Selected items ─────────────────────────────────────────────────────────
  const selectedPackage = computed(() =>
    packages.value.find(p => p.package_id === checkoutForm.packageId) ?? null,
  )
  const selectedPaymentMethod = computed(() =>
    paymentMethods.value.find(m => m.id === checkoutForm.paymentMethodId) ?? null,
  )
  const selectedPackageAmount = computed(() => {
    if (!selectedPackage.value) return 'N/A'
    const amount = selectedPackage.value.modified_amount || 'ERROR'
    return amount
  })

  // ── Step navigation ────────────────────────────────────────────────────────
  function canGoNext(): boolean {
    if (activeStep.value === 0) {
      if (!inviteIsValid.value) return false
      if (!inviteHasOrg.value && !checkoutForm.organisationName.trim()) return false
      return true
    }
    if (activeStep.value === 1) {
      return !!checkoutForm.packageId && !!checkoutForm.paymentMethodId
    }
    return false
  }

  function goNext() {
    if (!canGoNext()) return
    activeStep.value = Math.min(TOKEN_FLOW_STEPS.length - 1, activeStep.value + 1)
  }

  function goBack() {
    if (activeStep.value === 0) return
    activeStep.value -= 1
  }

  // ── Stripe ─────────────────────────────────────────────────────────────────
  const { data: stripeConfigData } = useStripeConfig()
  const stripePublishableKey = computed(() => String(stripeConfigData.value?.data?.publishable_key || '').trim())

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
    if (!isStripeMethod.value || activeStep.value !== 2) return
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
      if (!stripeSelected || step !== 2) {
        teardownStripeElements()
        return
      }
      if (key !== prevKey) teardownStripeElements()
      void ensureStripeCardMounted().catch((err) => {
        console.error('[token-sponsor stripe init] mount failed', err)
      })
    },
    { immediate: true },
  )

  // ── Checkout ───────────────────────────────────────────────────────────────
  const checkoutMutation = useOrganisationSponsorCheckout()
  const isCheckingOut = computed(() => checkoutMutation.isPending.value)

  const canSubmit = computed(() => {
    if (!checkoutForm.packageId || !checkoutForm.paymentMethodId) return false
    if (!inviteIsValid.value) return false
    if (!inviteHasOrg.value && !checkoutForm.organisationName.trim()) return false
    if (isStripeMethod.value && !checkoutResult.value && !stripeCardReady.value) return false
    return true
  })

  async function submitCheckout() {
    if (!canSubmit.value) return

    const payload: Record<string, unknown> = {
      package_id: checkoutForm.packageId,
      payment_method_id: checkoutForm.paymentMethodId,
      invite_token: token.value,
    }

    if (eventUuid.value) payload.event_id = eventUuid.value
    if (!inviteHasOrg.value) payload.organisation_name = checkoutForm.organisationName.trim()
    if (checkoutForm.sponsorName.trim()) payload.name = checkoutForm.sponsorName.trim()
    if (checkoutForm.description.trim()) payload.description = checkoutForm.description.trim()

    try {
      const response = await checkoutMutation.mutateAsync(payload as any)
      if (response.error) {
        $notyf.error(extractApiErrorMessage(response.error, 'Checkout failed.'))
        return
      }

      const responseData = (response?.data ?? null) as SponsorCheckoutResponse | null

      if (isStripeMethod.value) {
        const clientSecret = responseData?.client_secret
        if (!clientSecret) {
          $notyf.error('Stripe checkout initialized but no client secret was returned.')
          checkoutResult.value = responseData
          return
        }
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
        checkoutResult.value = responseData
        $notyf.success('Card payment confirmed!')
      }
      else {
        checkoutResult.value = responseData
        $notyf.success('Checkout initialized successfully.')
      }
    }
    catch (error) {
      isConfirmingStripePayment.value = false
      $notyf.error(extractApiErrorMessage(error, 'Checkout failed.'))
    }
  }

  return {
    // state
    activeStep,
    checkoutForm,
    checkoutResult,
    steps: TOKEN_FLOW_STEPS,
    // invite
    invite,
    isLoadingInvite,
    isInviteError,
    inviteError,
    inviteIsValid,
    inviteHasOrg,
    eventUuid,
    // packages
    packages,
    styledPackages,
    isLoadingPackages,
    // payment methods
    paymentMethods,
    isLoadingPaymentMethods,
    // selected
    selectedPackage,
    selectedPaymentMethod,
    selectedPackageAmount,
    // navigation
    canGoNext,
    goNext,
    goBack,
    // checkout
    canSubmit,
    isCheckingOut,
    submitCheckout,
    // stripe
    stripeCardMountRef,
    stripeCardReady,
    stripeCardError,
    stripePaymentAttemptError,
    isConfirmingStripePayment,
    isStripeMethod,
  }
}
