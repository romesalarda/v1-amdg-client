import { computed, ref, type ComputedRef } from 'vue'

export type JourneyStepAction = 'shop' | 'info' | 'location' | 'time'

export function useBookingJourneySteps(args: {
  outstandingPayments: ComputedRef<any[]>
  hasBringInfo: ComputedRef<boolean>
  hasLocationInfo: ComputedRef<boolean>
  hasTimingInfo: ComputedRef<boolean>
}) {
  const hideAllJourneyDetails = ref(false)

  const registrationStepComplete = computed(() => args.outstandingPayments.value.length === 0)

  const journeySteps = computed<Array<{
    id: number
    title: string
    description: string
    done: boolean
    action: JourneyStepAction
    cta: string
  }>>(() => [
    {
      id: 1,
      title: 'Finish registration',
      description: registrationStepComplete.value
        ? 'Registration is complete and there are no outstanding payments.'
        : 'Complete checkout in the shop and clear any outstanding payments.',
      done: registrationStepComplete.value,
      action: 'shop',
      cta: 'Open shop',
    },
    {
      id: 2,
      title: 'What to bring + important info',
      description: args.hasBringInfo.value
        ? 'Review event briefing guidance before arrival.'
        : 'Important preparation info is limited right now; check updates closer to event day.',
      done: args.hasBringInfo.value,
      action: 'info',
      cta: 'View info',
    },
    {
      id: 3,
      title: 'Location',
      description: args.hasLocationInfo.value
        ? 'Confirm the venue details and map before travel.'
        : 'Venue details are still being finalized.',
      done: args.hasLocationInfo.value,
      action: 'location',
      cta: 'View location',
    },
    {
      id: 4,
      title: 'Time',
      description: args.hasTimingInfo.value
        ? 'Double-check start and end times in your timezone.'
        : 'Event timing has not been published yet.',
      done: args.hasTimingInfo.value,
      action: 'time',
      cta: 'View time',
    },
  ])

  return {
    hideAllJourneyDetails,
    registrationStepComplete,
    journeySteps,
  }
}
