import type { MaybeRefOrGetter, ComputedRef } from 'vue'
import { toValue } from 'vue'
import { useAttendees } from '~/composables/resources/attendee/attendees'
import { useBookings } from '~/composables/resources/booking/bookings'
import { useBookingTickets } from '~/composables/resources/booking/bookingTickets'
import { useEvent } from '~/composables/resources/events/events'
import { useEventQuestions } from '~/composables/resources/events/eventQuestions'
import { useOrganisations } from '~/composables/resources/organisation/organisations'
import { useAreas } from '~/composables/resources/locations/locations'
import { useDietaryRequirements } from '~/composables/resources/attendee/attendeeDietaryRequirements'
import { useMedicalConditions } from '~/composables/resources/attendee/bookingMedicalConditions'
import { useAccessibilityRequirements } from '~/composables/resources/attendee/accessibilityRequirements'
import { useEventFormQuestions } from '../resources/events/eventForms'
import { useFamilyGroups } from '~/composables/resources/common/familyGroups'
import type { AttendeeList, BookingList, FamilyGroupList } from '~/api/types.gen'

export interface ExtendedAttendeeList extends AttendeeList {
  is_event_staff?: boolean
  is_checked_in: boolean
  is_registered: boolean
  is_cancelled: boolean
  is_refunded: boolean
}

export interface ExtendedBookingList extends Omit<BookingList, 'attendees'> {
  attendees?: Array<{
    attendee_id?: number | string
    attendee_display_id?: string
    full_name?: string
    is_refunded: boolean
  }>
}

export function useParticipantsDashboardData(
  eventId: MaybeRefOrGetter<string>,
  queryParams: ComputedRef<Record<string, any>>,
  bookingsQueryParams: ComputedRef<Record<string, any>>,
  familyGroupsQueryParams: ComputedRef<Record<string, any>>,
  eventBookingsQueryParams: ComputedRef<Record<string, any>>,
) {
  const id = computed(() => toValue(eventId))

  // ─── Event ──────────────────────────────────────────────────────────────────

  const { data: event } = useEvent(id)

  // ─── Main data ───────────────────────────────────────────────────────────────

  const { data: attendeesData, isLoading } = useAttendees(queryParams)
  const { data: bookingsData, isLoading: bookingsLoading } = useBookings(bookingsQueryParams)
  const { data: familyGroupsData, isLoading: familyGroupsLoading, refetch: refetchFamilyGroups } = useFamilyGroups(familyGroupsQueryParams)
  const { data: eventBookingsData } = useBookings(eventBookingsQueryParams)
  const { data: eventFormQuestionsData } = useEventFormQuestions(computed(() => {
    // Use first form ID from comma-separated list for chip label resolution
    const formParam = queryParams.value.form_response_form
    const firstFormId = formParam ? String(formParam).split(',')[0].trim() : undefined
    return { form: firstFormId, page_size: 100 }
  }))

  // ─── Stats queries ───────────────────────────────────────────────────────────

  const { data: checkedInData } = useAttendees(computed(() => ({ event: id.value, is_checked_in: true, page_size: 1 })))
  const { data: minorData } = useAttendees(computed(() => ({ event: id.value, is_minor: true, page_size: 1 })))
  const { data: staffData } = useAttendees(computed(() => ({ event: id.value, is_event_staff: true, page_size: 1 })))

  const { data: issuedTicketsStatsData } = useBookingTickets(computed(() => ({ event: id.value, page_size: 1 })))
  const { data: activeIssuedTicketsStatsData } = useBookingTickets(computed(() => ({ event: id.value, status: ['ACTIVE'], page_size: 1 })))
  const { data: usedIssuedTicketsStatsData } = useBookingTickets(computed(() => ({ event: id.value, status: ['USED'], page_size: 1 })))
  const { data: cancelledIssuedTicketsStatsData } = useBookingTickets(computed(() => ({ event: id.value, status: ['CANCELLED'], page_size: 1 })))

  // ─── Filter dropdown data ─────────────────────────────────────────────────────

  const { data: organisationsData } = useOrganisations({ page_size: 100 })
  const { data: areasData } = useAreas({ page_size: 100 })
  const { data: eventQuestionsData } = useEventQuestions(computed(() => ({ event: event.value?.data.event_id, page_size: 100 })))
  const { data: dietaryRequirementsData } = useDietaryRequirements({ page_size: 100 })
  const { data: medicalConditionsData } = useMedicalConditions({ page_size: 100 })
  const { data: accessibilityRequirementsData } = useAccessibilityRequirements({ page_size: 100 })

  // ─── Computed ─────────────────────────────────────────────────────────────────

  const attendees = computed(() => (attendeesData.value?.data?.results || []) as ExtendedAttendeeList[])
  const totalAttendees = computed(() => attendeesData.value?.data?.count || 0)

  const bookings = computed(() => (bookingsData.value?.data?.results || []) as BookingList[])
  const totalBookings = computed(() => bookingsData.value?.data?.count || 0)

  const familyGroups = computed(() => (familyGroupsData.value?.data?.results || []) as FamilyGroupList[])
  const totalFamilyGroups = computed(() => familyGroupsData.value?.data?.count || 0)
  const familiesWithMembers = computed(() => familyGroups.value.filter(group => group.member_count > 0).length)
  const visibleFamilyMembers = computed(() => familyGroups.value.reduce((sum, group) => sum + group.member_count, 0))

  const eventBookings = computed<ExtendedBookingList[]>(() => {
    const results = eventBookingsData.value?.data?.results || []
    return (results as BookingList[]).map(booking => ({ ...booking }))
  })

  const organisations = computed(() => organisationsData.value?.data?.results || [])
  const formQuestions = computed(() => eventFormQuestionsData.value?.data?.results || [])
  const areas = computed(() => areasData.value?.data?.results || [])
  const eventQuestions = computed(() => eventQuestionsData.value?.data?.results || [])
  const dietaryRequirements = computed(() => dietaryRequirementsData.value?.data?.results || [])
  const medicalConditions = computed(() => medicalConditionsData.value?.data?.results || [])
  const accessibilityRequirements = computed(() => accessibilityRequirementsData.value?.data?.results || [])

  const checkedInCount = computed(() => checkedInData.value?.data?.count || 0)
  const minorCount = computed(() => minorData.value?.data?.count || 0)
  const staffCount = computed(() => staffData.value?.data?.count || 0)

  const totalIssuedTickets = computed(() => issuedTicketsStatsData.value?.data?.count || 0)
  const activeIssuedTickets = computed(() => activeIssuedTicketsStatsData.value?.data?.count || 0)
  const usedIssuedTickets = computed(() => usedIssuedTicketsStatsData.value?.data?.count || 0)
  const cancelledIssuedTickets = computed(() => cancelledIssuedTicketsStatsData.value?.data?.count || 0)

  const orderEventQueryValue = computed(() =>
    String(event.value?.data?.url_safe_title || event.value?.data?.event_id || id.value || ''),
  )

  return {
    // Event
    event,

    // Attendees
    attendees,
    totalAttendees,
    isLoading,

    // Bookings
    bookings,
    totalBookings,
    bookingsLoading,

    // Family groups
    familyGroups,
    totalFamilyGroups,
    familyGroupsLoading,
    refetchFamilyGroups,
    familiesWithMembers,
    visibleFamilyMembers,

    // Event bookings (create modal dropdown)
    eventBookings,

    // Filter dropdowns
    organisations,
    areas,
    eventQuestions,
    formQuestions,
    dietaryRequirements,
    medicalConditions,
    accessibilityRequirements,

    // Stats
    checkedInCount,
    minorCount,
    staffCount,
    totalIssuedTickets,
    activeIssuedTickets,
    usedIssuedTickets,
    cancelledIssuedTickets,

    // Misc
    orderEventQueryValue,
  }
}
