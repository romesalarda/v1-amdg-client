import { computed, onBeforeUnmount, ref, watch, watchEffect, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '#ui/composables/useToast'
import { useCreateBookingIntent, usePingBookingIntent } from '~/composables/resources/booking/bookingIntents'

type BookingIntentManagerOptions = {
  event: Ref<{ event_id?: string } | null>
  eventId: Ref<string>
  ticketCount: Ref<number>
  bookingIntentId: Ref<string | null>
  checkoutCompleted: Ref<boolean>
  setBookingIntentId: (intentId: string) => void
  resetRegistrationStore: () => void
  onIntentExpired?: () => void
  isPreview?: Ref<boolean>
}

export const useBookingIntentManager = (options: BookingIntentManagerOptions) => {
  const router = useRouter()
  const toast = useToast()

  const bookingIntentMutation = useCreateBookingIntent()
  const pingBookingIntentMutation = usePingBookingIntent()

  const isCreatingIntent = ref(false)
  const showIntentExpiredModal = ref(false)
  const intentExpiresAtMs = ref<number | null>(null)
  const intentNowMs = ref(Date.now())

  let intentCountdownTimer: ReturnType<typeof setInterval> | null = null
  let intentPingTimer: ReturnType<typeof setInterval> | null = null

  const setIntentExpiryFromSeconds = (seconds?: number | null) => {
    if (typeof seconds !== 'number' || Number.isNaN(seconds)) return
    const safeSeconds = Math.max(0, Math.floor(seconds))
    intentExpiresAtMs.value = Date.now() + safeSeconds * 1000
    intentNowMs.value = Date.now()
  }

  const setIntentExpiryFromIso = (expiresAt?: string | null) => {
    if (!expiresAt) return
    const parsed = new Date(expiresAt).getTime()
    if (Number.isNaN(parsed)) return
    intentExpiresAtMs.value = parsed
    intentNowMs.value = Date.now()
  }

  const intentCountdownSeconds = computed(() => {
    if (!options.bookingIntentId.value || !intentExpiresAtMs.value || showIntentExpiredModal.value) return null
    const remaining = Math.ceil((intentExpiresAtMs.value - intentNowMs.value) / 1000)
    return Math.max(0, remaining)
  })

  const showIntentCountdown = computed(() => {
    return !!options.bookingIntentId.value && intentCountdownSeconds.value !== null && !showIntentExpiredModal.value
  })

  const intentCountdownLabel = computed(() => {
    const totalSeconds = intentCountdownSeconds.value
    if (totalSeconds === null) return '--:--'
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  })

  const intentTimerToneClass = computed(() => {
    const remaining = intentCountdownSeconds.value
    if (remaining === null || remaining > 300) {
      return 'border-emerald-300 bg-emerald-50 text-emerald-800'
    }
    if (remaining > 120) {
      return 'border-amber-300 bg-amber-50 text-amber-800'
    }
    return 'border-red-300 bg-red-50 text-red-800'
  })

  const stopIntentCountdown = () => {
    if (!intentCountdownTimer) return
    clearInterval(intentCountdownTimer)
    intentCountdownTimer = null
  }

  const startIntentCountdown = () => {
    stopIntentCountdown()
    if (!options.bookingIntentId.value || !intentExpiresAtMs.value) return
    intentCountdownTimer = setInterval(() => {
      intentNowMs.value = Date.now()
    }, 1000)
  }

  const markIntentExpired = () => {
    if (options.checkoutCompleted.value) return
    options.onIntentExpired?.()
    showIntentExpiredModal.value = true
    stopIntentCountdown()
  }

  const pingBookingIntent = async (silent: boolean = true) => {
    if (options.isPreview?.value) {
      return true
    }

    if (isCreatingIntent.value) {
      return true
    }

    if (!options.bookingIntentId.value) {
      markIntentExpired()
      return false
    }

    try {
      const response = await pingBookingIntentMutation.mutateAsync({
        intent: options.bookingIntentId.value,
      })
      const data = response.data as {
        is_active?: boolean
        redirect_required?: boolean
        seconds_remaining?: number
        expires_at?: string | null
      }

      setIntentExpiryFromSeconds(data?.seconds_remaining)
      if (!intentExpiresAtMs.value) {
        setIntentExpiryFromIso(data?.expires_at)
      }
      if (options.bookingIntentId.value && intentExpiresAtMs.value && !showIntentExpiredModal.value) {
        startIntentCountdown()
      }

      if (!data?.is_active || data?.redirect_required) {
        markIntentExpired()
        return false
      }

      return true
    } catch (error: any) {
      const statusCode = error?.status || error?.response?.status
      if (statusCode === 400 || statusCode === 404) {
        markIntentExpired()
        return false
      }

      if (!silent) {
        toast.add({ title: 'Warning', description: 'Unable to verify booking intent right now.', color: 'amber' })
      }
      return true
    }
  }

  const stopIntentPing = () => {
    if (!intentPingTimer) return
    clearInterval(intentPingTimer)
    intentPingTimer = null
  }

  const startIntentPing = () => {
    stopIntentPing()
    if (!options.bookingIntentId.value) return
    intentPingTimer = setInterval(() => {
      void pingBookingIntent(true)
    }, 120000)
  }

  const redirectToEventHome = () => {
    showIntentExpiredModal.value = false
    options.resetRegistrationStore()
    stopIntentCountdown()
    router.push({ path: `events/${options.eventId.value}` })
  }

  watchEffect(() => {
    if (options.isPreview?.value) return
    if (!options.event.value || options.bookingIntentId.value || isCreatingIntent.value) return
    isCreatingIntent.value = true
    bookingIntentMutation
      .mutateAsync({
        event: options.event.value.event_id as string,
        intended_ticket_count: options.ticketCount.value,
      })
      .then((response) => {
        const intentId = response.data?.booking_intent_id
        if (intentId) {
          options.setBookingIntentId(intentId)
          setIntentExpiryFromIso((response.data as { expires_at?: string | null })?.expires_at)
          if (!intentExpiresAtMs.value) {
            setIntentExpiryFromSeconds(20 * 60)
          }
          startIntentCountdown()
        }
      })
      .catch(() => {
        toast.add({ title: 'Error', description: 'Failed to create booking intent.', color: 'red' })
      })
      .finally(() => {
        isCreatingIntent.value = false
      })
  })

  watch(
    () => options.bookingIntentId.value,
    (intentId) => {
      if (options.isPreview?.value) return
      if (!intentId) {
        stopIntentPing()
        stopIntentCountdown()
        intentExpiresAtMs.value = null
        return
      }
      void pingBookingIntent(true)
      startIntentPing()
      if (intentExpiresAtMs.value) {
        startIntentCountdown()
      }
    },
    { immediate: true }
  )

  watch(
    () => options.checkoutCompleted.value,
    (completed) => {
      if (!completed) return
      showIntentExpiredModal.value = false
      stopIntentPing()
      stopIntentCountdown()
    }
  )

  watch(
    () => intentCountdownSeconds.value,
    (seconds) => {
      if (seconds === null) return
      if (seconds <= 0) {
        markIntentExpired()
      }
    }
  )

  onBeforeUnmount(() => {
    stopIntentPing()
    stopIntentCountdown()
  })

  return {
    isCreatingIntent,
    showIntentExpiredModal,
    intentCountdownSeconds,
    showIntentCountdown,
    intentCountdownLabel,
    intentTimerToneClass,
    pingBookingIntent,
    stopIntentPing,
    stopIntentCountdown,
    redirectToEventHome,
  }
}
