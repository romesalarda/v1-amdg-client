import { computed, ref, watch, type Ref } from 'vue'
import type { AttendeeDraft } from '~/stores/registration'

type RegistrationStepManagerOptions = {
  currentIndex: Ref<number>
  isAttendeeReady: (attendee: AttendeeDraft) => boolean
  maxVisibleStepperSteps?: number
}

export const useRegistrationStepManager = (options: RegistrationStepManagerOptions) => {
  const steps = [
    'Attendee details',
    'Event questions',
    'Personal info',
    'Ticket package',
    'Products',
    'Consents',
    'Review & pay',
  ]

  const attendeeStepCount = 6
  const reviewStepIndex = attendeeStepCount
  const maxVisibleStepperSteps = options.maxVisibleStepperSteps ?? 3

  const activeStepIndex = ref(0)
  const stepperTransitionName = ref('stepper-slide-forward')

  const stepWindowStart = computed(() => {
    if (steps.length <= maxVisibleStepperSteps) return 0
    if (activeStepIndex.value <= 1) return 0
    if (activeStepIndex.value >= steps.length - 2) return steps.length - maxVisibleStepperSteps
    return activeStepIndex.value - 1
  })

  const visibleSteps = computed(() => {
    return steps
      .slice(stepWindowStart.value, stepWindowStart.value + maxVisibleStepperSteps)
      .map((label, offset) => ({
        label,
        index: stepWindowStart.value + offset,
      }))
  })

  const stepProgressPercent = computed(() => ((activeStepIndex.value + 1) / steps.length) * 100)

  watch(activeStepIndex, (next, previous) => {
    stepperTransitionName.value = next >= previous ? 'stepper-slide-forward' : 'stepper-slide-back'
  })

  const attendeeDisplayName = (attendee?: AttendeeDraft | null, index?: number) => {
    if (!attendee) return 'Attendee'
    const fullName = `${attendee.first_name || ''} ${attendee.last_name || ''}`.trim()
    if (fullName) return fullName
    if (typeof index === 'number') return `Attendee ${index + 1}`
    return 'Attendee'
  }

  const attendeeStatusLabel = (index: number, attendee: AttendeeDraft) => {
    if (index === options.currentIndex.value) return 'Editing'
    if (options.isAttendeeReady(attendee)) return 'Ready'
    if (index < options.currentIndex.value) return 'Needs info'
    return 'Queued'
  }

  const attendeeStatusBadgeClass = (index: number, attendee: AttendeeDraft) => {
    if (index === options.currentIndex.value) return 'bg-blue-100 text-blue-700'
    if (options.isAttendeeReady(attendee)) return 'bg-emerald-100 text-emerald-700'
    if (index < options.currentIndex.value) return 'bg-amber-100 text-amber-700'
    return 'bg-slate-100 text-slate-500'
  }

  const attendeeSidebarCardClass = (index: number, attendee: AttendeeDraft) => {
    if (index === options.currentIndex.value) {
      return 'border-slate-900 bg-white shadow-[4px_4px_0px_0px_rgba(15,23,42,0.2)]'
    }
    if (options.isAttendeeReady(attendee)) {
      return 'border-emerald-200 bg-emerald-50 hover:border-emerald-300'
    }
    if (index < options.currentIndex.value) {
      return 'border-amber-200 bg-amber-50 hover:border-amber-300'
    }
    return 'border-slate-200 bg-slate-50/90 hover:border-slate-300'
  }

  const attendeeStepSummary = (index: number) => {
    if (index === options.currentIndex.value) return steps[activeStepIndex.value] || 'In progress'
    if (index < options.currentIndex.value) return 'Previously edited'
    return 'Waiting'
  }

  return {
    steps,
    attendeeStepCount,
    reviewStepIndex,
    activeStepIndex,
    stepperTransitionName,
    stepWindowStart,
    visibleSteps,
    stepProgressPercent,
    attendeeDisplayName,
    attendeeStatusLabel,
    attendeeStatusBadgeClass,
    attendeeSidebarCardClass,
    attendeeStepSummary,
  }
}
