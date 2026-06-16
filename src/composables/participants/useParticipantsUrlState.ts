import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'

export type ParticipantsView = 'attendees' | 'bookings' | 'families' | 'statistics' | 'tickets'

export type ParticipantsFilters = {
  // Demographics
  organisation: number | undefined
  areaFrom: number | undefined
  gender: string | undefined
  ageMin: number | undefined
  ageMax: number | undefined

  // Status filters
  isCheckedIn: boolean | undefined
  isRegistered: boolean | undefined
  isCancelled: boolean | undefined
  isMinor: boolean | undefined
  isStaff: boolean | undefined

  // Personal needs
  hasDietaryRequirements: boolean | undefined
  dietaryRequirement: number | undefined
  hasMedicalConditions: boolean | undefined
  medicalCondition: number | undefined
  hasAccessibilityRequirements: boolean | undefined
  accessibilityRequirement: number | undefined
  hasEmergencyContacts: boolean | undefined

  // Question filters
  hasAnsweredQuestions: boolean | undefined
  question: string | undefined
  questionAnswerSearch: string | undefined
  answeredQuestionType: string | undefined
  hasUnansweredRequiredQuestions: boolean | undefined
  selectedOption: number | undefined
  sliderAnswerMin: number | undefined
  sliderAnswerMax: number | undefined

  // Order filters
  hasOrders: boolean | undefined
  orderStatus: string | undefined
  orderStatusNot: string | undefined
  purchasedProduct: number | undefined
  purchasedProductTitle: string | undefined
  orderTotalMin: number | undefined
  orderTotalMax: number | undefined
  orderCreatedAfter: string | undefined
  orderCreatedBefore: string | undefined
  orderReferenceId: string | undefined
  hasCompletedOrders: boolean | undefined
  hasPendingOrders: boolean | undefined

  // Payment filters
  hasPayments: boolean | undefined
  paymentId: string | undefined
  paymentReference: string | undefined
  bankTransferReference: string | undefined
  paymentStatus: string | undefined
  paymentTarget: string | undefined
  paymentMethodType: string | undefined
  paymentMethodTitle: string | undefined
  hasRefunds: boolean | undefined
  refundStatus: string | undefined
  refundIsActive: boolean | undefined
  hasDonations: boolean | undefined
  donationStatus: string | undefined
  hasDiscountsUsed: boolean | undefined
  discountId: string | undefined
  discountName: string | undefined

  // Advanced filters
  relationshipToUser: string | undefined
  selfRegistered: boolean | undefined
  hasBooking: boolean | undefined
  booking: string | undefined
  dateOfBirthAfter: string | undefined
  dateOfBirthBefore: string | undefined
  createdAfter: string | undefined
  createdBefore: string | undefined
  includeDeleted: boolean | undefined

  // Event form filters
  hasFormResponses: boolean | undefined
  /** Comma-separated form IDs; e.g. "1,2,3" */
  formResponseForms: string | undefined
  formResponseComplete: boolean | undefined
  formAnswerSearch: string | undefined
  /** Comma-separated question IDs; e.g. "10,20" */
  formAnsweredQuestions: string | undefined
  formHasUnansweredRequired: boolean | undefined
  /** Comma-separated option IDs; e.g. "1,2" */
  formSelectedOption: string | undefined
  formAnswerSubmittedAfter: string | undefined
  formAnswerSubmittedBefore: string | undefined
  formNumericAnswerMin: number | undefined
  formNumericAnswerMax: number | undefined
  formAnswerDateAfter: string | undefined
  formAnswerDateBefore: string | undefined
  formAnswerTimeAfter: string | undefined
  formAnswerTimeBefore: string | undefined
}

function makeEmptyFilters(): ParticipantsFilters {
  return {
    organisation: undefined,
    areaFrom: undefined,
    gender: undefined,
    ageMin: undefined,
    ageMax: undefined,
    isCheckedIn: undefined,
    isRegistered: undefined,
    isCancelled: undefined,
    isMinor: undefined,
    isStaff: undefined,
    hasDietaryRequirements: undefined,
    dietaryRequirement: undefined,
    hasMedicalConditions: undefined,
    medicalCondition: undefined,
    hasAccessibilityRequirements: undefined,
    accessibilityRequirement: undefined,
    hasEmergencyContacts: undefined,
    hasAnsweredQuestions: undefined,
    question: undefined,
    questionAnswerSearch: undefined,
    answeredQuestionType: undefined,
    hasUnansweredRequiredQuestions: undefined,
    selectedOption: undefined,
    sliderAnswerMin: undefined,
    sliderAnswerMax: undefined,
    hasOrders: undefined,
    orderStatus: undefined,
    orderStatusNot: undefined,
    purchasedProduct: undefined,
    purchasedProductTitle: undefined,
    orderTotalMin: undefined,
    orderTotalMax: undefined,
    orderCreatedAfter: undefined,
    orderCreatedBefore: undefined,
    orderReferenceId: undefined,
    hasCompletedOrders: undefined,
    hasPendingOrders: undefined,
    hasPayments: undefined,
    paymentId: undefined,
    paymentReference: undefined,
    bankTransferReference: undefined,
    paymentStatus: undefined,
    paymentTarget: undefined,
    paymentMethodType: undefined,
    paymentMethodTitle: undefined,
    hasRefunds: undefined,
    refundStatus: undefined,
    refundIsActive: undefined,
    hasDonations: undefined,
    donationStatus: undefined,
    hasDiscountsUsed: undefined,
    discountId: undefined,
    discountName: undefined,
    relationshipToUser: undefined,
    selfRegistered: undefined,
    hasBooking: undefined,
    booking: undefined,
    dateOfBirthAfter: undefined,
    dateOfBirthBefore: undefined,
    createdAfter: undefined,
    createdBefore: undefined,
    includeDeleted: undefined,
    // Event form filters
    hasFormResponses: undefined,
    formResponseForms: undefined,
    formResponseComplete: undefined,
    formAnswerSearch: undefined,
    formAnsweredQuestions: undefined,
    formHasUnansweredRequired: undefined,
    formSelectedOption: undefined,
    formAnswerSubmittedAfter: undefined,
    formAnswerSubmittedBefore: undefined,
    formNumericAnswerMin: undefined,
    formNumericAnswerMax: undefined,
    formAnswerDateAfter: undefined,
    formAnswerDateBefore: undefined,
    formAnswerTimeAfter: undefined,
    formAnswerTimeBefore: undefined,
  }
}

export function useParticipantsUrlState(eventId: MaybeRefOrGetter<string>) {
  const route = useRoute()
  const router = useRouter()

  // ─── Helpers ────────────────────────────────────────────────────────────────

  function getQueryString(value: unknown): string | undefined {
    if (Array.isArray(value)) {
      const first = value.find(v => typeof v === 'string')
      return typeof first === 'string' ? first : undefined
    }
    return typeof value === 'string' ? value : undefined
  }

  function parseView(raw: unknown): ParticipantsView {
    const v = String(raw || '')
    if (v === 'bookings') return 'bookings'
    if (v === 'families') return 'families'
    if (v === 'statistics') return 'statistics'
    if (v === 'tickets') return 'tickets'
    return 'attendees'
  }

  // ─── State ──────────────────────────────────────────────────────────────────

  const currentView = ref<ParticipantsView>(parseView(route.query.view))

  const searchQuery = ref(route.query.search as string || '')
  const currentPage = ref(Number(route.query.page) || 1)
  const pageSize = ref(Number(route.query.page_size) || 25)
  const currentSort = ref<string>(route.query.ordering as string || '')
  const sortDirection = ref<'asc' | 'desc'>('asc')

  const showFilters = ref(false)
  const showFiltersModal = ref(false)

  const filters = ref<ParticipantsFilters>({
    // Demographics
    organisation: route.query.organisation ? Number(route.query.organisation) : undefined,
    areaFrom: route.query.area_from ? Number(route.query.area_from) : undefined,
    gender: route.query.gender as string | undefined,
    ageMin: route.query.age_min ? Number(route.query.age_min) : undefined,
    ageMax: route.query.age_max ? Number(route.query.age_max) : undefined,

    // Status filters
    isCheckedIn: route.query.is_checked_in === 'true' ? true : undefined,
    isRegistered: route.query.is_registered === 'true' ? true : undefined,
    isCancelled: route.query.is_cancelled === 'true' ? true : undefined,
    isMinor: route.query.is_minor === 'true' ? true : undefined,
    isStaff: route.query.is_event_staff === 'true' ? true : undefined,

    // Personal needs
    hasDietaryRequirements: route.query.has_dietary_requirements === 'true' ? true : undefined,
    dietaryRequirement: route.query.dietary_requirement ? Number(route.query.dietary_requirement) : undefined,
    hasMedicalConditions: route.query.has_medical_conditions === 'true' ? true : undefined,
    medicalCondition: route.query.medical_condition ? Number(route.query.medical_condition) : undefined,
    hasAccessibilityRequirements: route.query.has_accessibility_requirements === 'true' ? true : undefined,
    accessibilityRequirement: route.query.accessibility_requirement ? Number(route.query.accessibility_requirement) : undefined,
    hasEmergencyContacts: route.query.has_emergency_contacts === 'true' ? true : undefined,

    // Question filters
    hasAnsweredQuestions: route.query.has_answered_questions === 'true' ? true : undefined,
    question: route.query.question as string | undefined,
    questionAnswerSearch: route.query.question_answer_search as string | undefined,
    answeredQuestionType: route.query.answered_question_type as string | undefined,
    hasUnansweredRequiredQuestions: route.query.has_unanswered_required_questions === 'true' ? true : undefined,
    selectedOption: route.query.selected_option ? Number(route.query.selected_option) : undefined,
    sliderAnswerMin: route.query.slider_answer_min ? Number(route.query.slider_answer_min) : undefined,
    sliderAnswerMax: route.query.slider_answer_max ? Number(route.query.slider_answer_max) : undefined,

    // Order filters
    hasOrders: route.query.has_orders === 'true' ? true : undefined,
    orderStatus: route.query.order_status as string | undefined,
    orderStatusNot: route.query.order_status_not as string | undefined,
    purchasedProduct: route.query.purchased_product ? Number(route.query.purchased_product) : undefined,
    purchasedProductTitle: route.query.purchased_product_title as string | undefined,
    orderTotalMin: route.query.order_total_min ? Number(route.query.order_total_min) : undefined,
    orderTotalMax: route.query.order_total_max ? Number(route.query.order_total_max) : undefined,
    orderCreatedAfter: route.query.order_created_after as string | undefined,
    orderCreatedBefore: route.query.order_created_before as string | undefined,
    orderReferenceId: route.query.order_reference_id as string | undefined,
    hasCompletedOrders: route.query.has_completed_orders === 'true' ? true : undefined,
    hasPendingOrders: route.query.has_pending_orders === 'true' ? true : undefined,

    // Payment filters
    hasPayments: route.query.has_payments === 'true' ? true : undefined,
    paymentId: route.query.payment_id as string | undefined,
    paymentReference: route.query.payment_reference as string | undefined,
    bankTransferReference: route.query.bank_transfer_reference as string | undefined,
    paymentStatus: route.query.payment_status as string | undefined,
    paymentTarget: route.query.payment_target as string | undefined,
    paymentMethodType: route.query.payment_method_type as string | undefined,
    paymentMethodTitle: route.query.payment_method_title as string | undefined,
    hasRefunds: route.query.has_refunds === 'true' ? true : undefined,
    refundStatus: route.query.refund_status as string | undefined,
    refundIsActive: route.query.refund_is_active === 'true' ? true : undefined,
    hasDonations: route.query.has_donations === 'true' ? true : undefined,
    donationStatus: route.query.donation_status as string | undefined,
    hasDiscountsUsed: route.query.has_discounts_used === 'true' ? true : undefined,
    discountId: route.query.discount_id as string | undefined,
    discountName: route.query.discount_name as string | undefined,

    // Advanced filters
    relationshipToUser: route.query.relationship_to_user as string | undefined,
    selfRegistered: route.query.self_registered === 'true' ? true : undefined,
    hasBooking: route.query.has_booking === 'true' ? true : undefined,
    booking: route.query.booking as string | undefined,
    dateOfBirthAfter: route.query.date_of_birth_after as string | undefined,
    dateOfBirthBefore: route.query.date_of_birth_before as string | undefined,
    createdAfter: route.query.created_after as string | undefined,
    createdBefore: route.query.created_before as string | undefined,
    includeDeleted: route.query.include_deleted === 'true' ? true : undefined,

    // Event form filters
    hasFormResponses: route.query.has_form_responses === 'true' ? true : undefined,
    formResponseForms: route.query.form_response_form as string | undefined,
    formResponseComplete: route.query.form_response_complete === 'true' ? true : undefined,
    formAnswerSearch: route.query.form_answer_search as string | undefined,
    formAnsweredQuestions: route.query.form_answered_question as string | undefined,
    formHasUnansweredRequired: route.query.form_has_unanswered_required === 'true' ? true : undefined,
    formSelectedOption: route.query.form_selected_option as string | undefined,
    formAnswerSubmittedAfter: route.query.form_answer_submitted_after as string | undefined,
    formAnswerSubmittedBefore: route.query.form_answer_submitted_before as string | undefined,
    formNumericAnswerMin: route.query.form_numeric_answer_min ? Number(route.query.form_numeric_answer_min) : undefined,
    formNumericAnswerMax: route.query.form_numeric_answer_max ? Number(route.query.form_numeric_answer_max) : undefined,
    formAnswerDateAfter: route.query.form_answer_date_after as string | undefined,
    formAnswerDateBefore: route.query.form_answer_date_before as string | undefined,
    formAnswerTimeAfter: route.query.form_answer_time_after as string | undefined,
    formAnswerTimeBefore: route.query.form_answer_time_before as string | undefined,
  })

  const debouncedQuestionSearch = ref(filters.value.questionAnswerSearch || '')
  let questionSearchTimeout: ReturnType<typeof setTimeout>

  const debouncedSearch = ref(searchQuery.value)
  let searchTimeout: ReturnType<typeof setTimeout>

  // ─── Route → state sync (external navigation) ───────────────────────────────

  watch(() => route.query.view, (view) => {
    currentView.value = parseView(view)
  })

  watch(() => route.query.search, (value) => {
    const next = getQueryString(value) || ''
    if (searchQuery.value !== next) searchQuery.value = next
  })

  watch(() => route.query.page, (value) => {
    const next = Number(getQueryString(value)) || 1
    if (currentPage.value !== next) currentPage.value = next
  })

  watch(() => route.query.page_size, (value) => {
    const next = Number(getQueryString(value)) || 25
    if (pageSize.value !== next) pageSize.value = next
  })

  watch(() => route.query.ordering, (value) => {
    const ordering = getQueryString(value) || ''
    const nextDir: 'asc' | 'desc' = ordering.startsWith('-') ? 'desc' : 'asc'
    const nextSort = ordering.startsWith('-') ? ordering.slice(1) : ordering
    if (sortDirection.value !== nextDir) sortDirection.value = nextDir
    if (currentSort.value !== nextSort) currentSort.value = nextSort
  })

  // ─── Debounced search ───────────────────────────────────────────────────────

  watch(searchQuery, (newValue) => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      debouncedSearch.value = newValue
      currentPage.value = 1
    }, 300)
  })

  // ─── Query params ───────────────────────────────────────────────────────────

  const queryParams = computed(() => {
    const id = toValue(eventId)
    const params: Record<string, any> = {
      event: id,
      page: currentPage.value,
      page_size: pageSize.value,
    }

    if (debouncedSearch.value) params.search = debouncedSearch.value
    if (currentSort.value) params.ordering = sortDirection.value === 'desc' ? `-${currentSort.value}` : currentSort.value

    const f = filters.value
    if (f.organisation) params.organisation = f.organisation
    if (f.areaFrom) params.area_from = f.areaFrom
    if (f.gender) params.gender = f.gender
    if (f.ageMin) params.age_min = f.ageMin
    if (f.ageMax) params.age_max = f.ageMax
    if (f.isMinor !== undefined) params.is_minor = f.isMinor
    if (f.isCheckedIn !== undefined) params.is_checked_in = f.isCheckedIn
    if (f.isRegistered !== undefined) params.is_registered = f.isRegistered
    if (f.isCancelled !== undefined) params.is_cancelled = f.isCancelled
    if (f.isStaff !== undefined) params.is_event_staff = f.isStaff
    if (f.hasDietaryRequirements !== undefined) params.has_dietary_requirements = f.hasDietaryRequirements
    if (f.dietaryRequirement) params.dietary_requirement = f.dietaryRequirement
    if (f.hasMedicalConditions !== undefined) params.has_medical_conditions = f.hasMedicalConditions
    if (f.medicalCondition) params.medical_condition = f.medicalCondition
    if (f.hasAccessibilityRequirements !== undefined) params.has_accessibility_requirements = f.hasAccessibilityRequirements
    if (f.accessibilityRequirement) params.accessibility_requirement = f.accessibilityRequirement
    if (f.question) params.question = f.question
    if (debouncedQuestionSearch.value) params.question_answer_search = debouncedQuestionSearch.value
    if (f.hasAnsweredQuestions !== undefined) params.has_answered_questions = f.hasAnsweredQuestions
    if (f.hasUnansweredRequiredQuestions !== undefined) params.has_unanswered_required_questions = f.hasUnansweredRequiredQuestions
    if (f.selectedOption) params.selected_option = f.selectedOption
    if (f.sliderAnswerMin) params.slider_answer_min = f.sliderAnswerMin
    if (f.sliderAnswerMax) params.slider_answer_max = f.sliderAnswerMax
    if (f.answeredQuestionType) params.answered_question_type = f.answeredQuestionType
    if (f.hasOrders !== undefined) params.has_orders = f.hasOrders
    if (f.orderStatus) params.order_status = f.orderStatus
    if (f.orderStatusNot) params.order_status_not = f.orderStatusNot
    if (f.purchasedProduct) params.purchased_product = f.purchasedProduct
    if (f.purchasedProductTitle) params.purchased_product_title = f.purchasedProductTitle
    if (f.orderTotalMin) params.order_total_min = f.orderTotalMin
    if (f.orderTotalMax) params.order_total_max = f.orderTotalMax
    if (f.orderCreatedAfter) params.order_created_after = f.orderCreatedAfter
    if (f.orderCreatedBefore) params.order_created_before = f.orderCreatedBefore
    if (f.orderReferenceId) params.order_reference_id = f.orderReferenceId
    if (f.hasCompletedOrders !== undefined) params.has_completed_orders = f.hasCompletedOrders
    if (f.hasPendingOrders !== undefined) params.has_pending_orders = f.hasPendingOrders
    if (f.hasPayments !== undefined) params.has_payments = f.hasPayments
    if (f.paymentId) params.payment_id = f.paymentId
    if (f.paymentReference) params.payment_reference = f.paymentReference
    if (f.bankTransferReference) params.bank_transfer_reference = f.bankTransferReference
    if (f.paymentStatus) params.payment_status = f.paymentStatus
    if (f.paymentTarget) params.payment_target = f.paymentTarget
    if (f.paymentMethodType) params.payment_method_type = f.paymentMethodType
    if (f.paymentMethodTitle) params.payment_method_title = f.paymentMethodTitle
    if (f.hasRefunds !== undefined) params.has_refunds = f.hasRefunds
    if (f.refundStatus) params.refund_status = f.refundStatus
    if (f.refundIsActive !== undefined) params.refund_is_active = f.refundIsActive
    if (f.hasDonations !== undefined) params.has_donations = f.hasDonations
    if (f.donationStatus) params.donation_status = f.donationStatus
    if (f.hasDiscountsUsed !== undefined) params.has_discounts_used = f.hasDiscountsUsed
    if (f.discountId) params.discount_id = f.discountId
    if (f.discountName) params.discount_name = f.discountName
    if (f.relationshipToUser) params.relationship_to_user = f.relationshipToUser
    if (f.selfRegistered !== undefined) params.self_registered = f.selfRegistered
    if (f.hasBooking !== undefined) params.has_booking = f.hasBooking
    if (f.booking) params.booking = f.booking
    if (f.dateOfBirthAfter) params.date_of_birth_after = f.dateOfBirthAfter
    if (f.dateOfBirthBefore) params.date_of_birth_before = f.dateOfBirthBefore
    if (f.createdAfter) params.created_after = f.createdAfter
    if (f.createdBefore) params.created_before = f.createdBefore
    if (f.includeDeleted !== undefined) params.include_deleted = f.includeDeleted

    // Event form filters
    if (f.hasFormResponses !== undefined) params.has_form_responses = f.hasFormResponses
    if (f.formResponseForms) params.form_response_form = f.formResponseForms
    if (f.formResponseComplete !== undefined) params.form_response_complete = f.formResponseComplete
    if (f.formAnswerSearch) params.form_answer_search = f.formAnswerSearch
    if (f.formAnsweredQuestions) params.form_answered_question = f.formAnsweredQuestions
    if (f.formHasUnansweredRequired !== undefined) params.form_has_unanswered_required = f.formHasUnansweredRequired
    if (f.formSelectedOption) params.form_selected_option = f.formSelectedOption
    if (f.formAnswerSubmittedAfter) params.form_answer_submitted_after = f.formAnswerSubmittedAfter
    if (f.formAnswerSubmittedBefore) params.form_answer_submitted_before = f.formAnswerSubmittedBefore
    if (f.formNumericAnswerMin !== undefined) params.form_numeric_answer_min = f.formNumericAnswerMin
    if (f.formNumericAnswerMax !== undefined) params.form_numeric_answer_max = f.formNumericAnswerMax
    if (f.formAnswerDateAfter) params.form_answer_date_after = f.formAnswerDateAfter
    if (f.formAnswerDateBefore) params.form_answer_date_before = f.formAnswerDateBefore
    if (f.formAnswerTimeAfter) params.form_answer_time_after = f.formAnswerTimeAfter
    if (f.formAnswerTimeBefore) params.form_answer_time_before = f.formAnswerTimeBefore

    return params
  })

  const bookingsQueryParams = computed(() => {
    const id = toValue(eventId)
    const params: Record<string, any> = {
      event: id,
      page: currentPage.value,
      page_size: pageSize.value,
    }
    if (debouncedSearch.value) params.search = debouncedSearch.value
    if (currentSort.value) params.ordering = sortDirection.value === 'desc' ? `-${currentSort.value}` : currentSort.value
    return params
  })

  const familyGroupsQueryParams = computed(() => {
    const id = toValue(eventId)
    const params: Record<string, any> = {
      event: id,
      page: currentPage.value,
      page_size: pageSize.value,
    }
    if (debouncedSearch.value) params.search = debouncedSearch.value
    if (currentSort.value) params.ordering = sortDirection.value === 'desc' ? `-${currentSort.value}` : currentSort.value
    return params
  })

  const eventBookingsQueryParams = computed(() => ({
    event: toValue(eventId),
    page_size: 100,
  }))

  // ─── Active filter count ─────────────────────────────────────────────────────

  const activeFilterCount = computed(() => {
    let count = 0
    const f = filters.value
    if (f.organisation) count++
    if (f.areaFrom) count++
    if (f.gender) count++
    if (f.ageMin) count++
    if (f.ageMax) count++
    if (f.isCheckedIn !== undefined) count++
    if (f.isRegistered !== undefined) count++
    if (f.isCancelled !== undefined) count++
    if (f.isMinor !== undefined) count++
    if (f.isStaff !== undefined) count++
    if (f.hasDietaryRequirements !== undefined) count++
    if (f.hasMedicalConditions !== undefined) count++
    if (f.hasAccessibilityRequirements !== undefined) count++
    if (f.hasPayments !== undefined) count++
    if (f.paymentId) count++
    if (f.paymentReference) count++
    if (f.bankTransferReference) count++
    if (f.paymentStatus) count++
    if (f.paymentTarget) count++
    if (f.paymentMethodType) count++
    if (f.paymentMethodTitle) count++
    if (f.hasRefunds !== undefined) count++
    if (f.refundStatus) count++
    if (f.refundIsActive !== undefined) count++
    if (f.hasDonations !== undefined) count++
    if (f.donationStatus) count++
    if (f.hasDiscountsUsed !== undefined) count++
    if (f.discountId) count++
    if (f.discountName) count++
    // Form filter count
    if (f.hasFormResponses !== undefined) count++
    if (f.formResponseForms) count++
    if (f.formResponseComplete !== undefined) count++
    if (f.formAnswerSearch) count++
    if (f.formAnsweredQuestions) count++
    if (f.formHasUnansweredRequired !== undefined) count++
    if (f.formSelectedOption) count++
    if (f.formAnswerSubmittedAfter) count++
    if (f.formAnswerSubmittedBefore) count++
    if (f.formNumericAnswerMin !== undefined) count++
    if (f.formNumericAnswerMax !== undefined) count++
    if (f.formAnswerDateAfter) count++
    if (f.formAnswerDateBefore) count++
    if (f.formAnswerTimeAfter) count++
    if (f.formAnswerTimeBefore) count++
    return count
  })

  // ─── Active filter chips ─────────────────────────────────────────────────────

  function buildActiveFilterChips(
    organisationsList: any[],
    areasList: any[],
    questionsList: any[],
    dietaryList: any[],
    medicalList: any[],
    accessibilityList: any[],
    formQuestionsList: any[],
  ) {
    return computed(() => {
      const chips: Array<{ key: string; label: string; value: string }> = []

      const parseValue = (value: string ): string[] => {
        if (value.includes(',')) {
          return value.split(',').map(v => v.trim())
        }
        return [value]
      }

      const formatValue = (value: any, key: string): string => {
        if (typeof value === 'boolean') return value ? 'Yes' : 'No'
        if (key === 'organisation' && organisationsList.length > 0) {
          const org = organisationsList.find((o: any) => o.id === value)
          const orgList = organisationsList.filter((o: any) => parseValue(String(value)).includes(String(o.id)))
          return org?.title || String(orgList.map((o: any) => o.title).join(', ')) || String(value)
        }
        if (key === 'areaFrom' && areasList.length > 0) {
          const area = areasList.find((a: any) => a.id === value)
          const areaList = areasList.filter((a: any) => parseValue(String(value)).includes(String(a.id)))
          return area?.area_name || String(areaList.map((a: any) => a.area_name).join(', ')) || String(value)
        }
        if (key === 'question' && questionsList.length > 0) {
          const question = questionsList.find((q: any) => q.id === value)
          const questionList = questionsList.filter((q: any) => parseValue(String(value)).includes(String(q.id)))
          return question?.question_body || String(questionList.map((q: any) => q.question_body).join(', ')) || String(value)
        }
        if (key === 'dietaryRequirement' && dietaryList.length > 0) {
          const req = dietaryList.find((r: any) => r.id === value)
          const reqList = dietaryList.filter((r: any) => parseValue(String(value)).includes(String(r.id)))
          return req?.label || String(reqList.map((r: any) => r.label).join(', ')) || String(value)
        }
        if (key === 'medicalCondition' && medicalList.length > 0) {
          const cond = medicalList.find((c: any) => c.id === value)
          const condList = medicalList.filter((c: any) => parseValue(String(value)).includes(String(c.id)))
          return cond?.label || String(condList.map((c: any) => c.label).join(', ')) || String(value)
        }
        if (key === 'accessibilityRequirement' && accessibilityList.length > 0) {
          const req = accessibilityList.find((r: any) => r.id === value)
          const reqList = accessibilityList.filter((r: any) => parseValue(String(value)).includes(String(r.id)))
          return req?.label || String(reqList.map((r: any) => r.label).join(', ')) || String(value)
        }

        if (key === 'formAnsweredQuestions' && formQuestionsList.length > 0) {
          const ids = String(value).split(',').map(Number).filter(Number.isFinite)
          const names = ids.map(id => {
            const q = formQuestionsList.find((q: any) => q.id === id)
            return q?.question_title || q?.question_body || `Question ${id}`
          })
          if (names.length === 1) return names[0]
          return `${names.length} questions`
        }
        if (key === 'formResponseForms') {
          const ids = String(value).split(',').filter(Boolean)
          if (ids.length === 1) return `Form ${ids[0]}`
          return `${ids.length} forms`
        }
        if (key === 'formAnswerTimeAfter' && formQuestionsList.length > 0) {
          return `Form Time After: ${String(value)}`
        }
        if (key === 'formAnswerTimeBefore' && formQuestionsList.length > 0) {
          return `Form Time Before: ${String(value)}`
        }
        return String(value)
      }

      const labels: Record<string, string> = {
        organisation: 'Organisation',
        areaFrom: 'Area',
        gender: 'Gender',
        ageMin: 'Min Age',
        ageMax: 'Max Age',
        isMinor: 'Minor',
        isCheckedIn: 'Checked In',
        isRegistered: 'Registered',
        isCancelled: 'Cancelled',
        isStaff: 'Staff',
        hasDietaryRequirements: 'Has Dietary Req',
        dietaryRequirement: 'Dietary Requirement',
        hasMedicalConditions: 'Has Medical Cond',
        medicalCondition: 'Medical Condition',
        hasAccessibilityRequirements: 'Has Accessibility',
        accessibilityRequirement: 'Accessibility Req',
        question: 'Question',
        questionAnswerSearch: 'Answer Search',
        hasAnsweredQuestions: 'Answered Questions',
        hasUnansweredRequiredQuestions: 'Unanswered Required',
        selectedOption: 'Selected Option',
        sliderAnswerMin: 'Slider Min',
        sliderAnswerMax: 'Slider Max',
        hasOrders: 'Has Orders',
        orderStatus: 'Order Status',
        orderStatusNot: 'Order Status Not',
        purchasedProduct: 'Product',
        purchasedProductTitle: 'Product Title',
        orderTotalMin: 'Order Min',
        orderTotalMax: 'Order Max',
        orderCreatedAfter: 'Order After',
        orderCreatedBefore: 'Order Before',
        orderReferenceId: 'Order Reference',
        hasCompletedOrders: 'Has Completed Orders',
        hasPendingOrders: 'Has Pending Orders',
        hasPayments: 'Has Payments',
        paymentId: 'Payment ID',
        paymentReference: 'Payment Reference',
        bankTransferReference: 'Bank Transfer Ref',
        paymentStatus: 'Payment Status',
        paymentTarget: 'Payment Target',
        paymentMethodType: 'Method Type',
        paymentMethodTitle: 'Method Title',
        hasRefunds: 'Has Refunds',
        refundStatus: 'Refund Status',
        refundIsActive: 'Refund Active',
        hasDonations: 'Has Donations',
        donationStatus: 'Donation Status',
        hasDiscountsUsed: 'Has Discounts Used',
        discountId: 'Discount ID',
        discountName: 'Discount Name',
        relationshipToUser: 'Relationship',
        selfRegistered: 'Self Registered',
        hasBooking: 'Has Booking',
        booking: 'Booking',
        dateOfBirthAfter: 'DOB After',
        dateOfBirthBefore: 'DOB Before',
        createdAfter: 'Created After',
        createdBefore: 'Created Before',
        includeDeleted: 'Include Deleted',
        hasEmergencyContacts: 'Has Emergency Contacts',
        answeredQuestionType: 'Answered Question Type',
        // Form filter labels
        hasFormResponses: 'Has Form Responses',
        formResponseForms: 'Form(s)',
        formResponseComplete: 'Form Response Complete',
        formAnswerSearch: 'Form Answer Search',
        formAnsweredQuestions: 'Form Question(s)',
        formHasUnansweredRequired: 'Unanswered Required (Form)',
        formSelectedOption: 'Form Selected Option',
        formAnswerSubmittedAfter: 'Form Submitted After',
        formAnswerSubmittedBefore: 'Form Submitted Before',
        formNumericAnswerMin: 'Form Answer Min',
        formNumericAnswerMax: 'Form Answer Max',
        formAnswerDateAfter: 'Form Date After',
        formAnswerDateBefore: 'Form Date Before',
        formAnswerTimeAfter: 'Form Time After',
        formAnswerTimeBefore: 'Form Time Before',
      }

      Object.entries(filters.value).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          chips.push({
            key,
            label: labels[key] || key,
            value: formatValue(value, key),
          })
        }
      })

      return chips
    })
  }

  // ─── URL → state sync (big watcher) ─────────────────────────────────────────

  watch(
    [searchQuery, currentPage, pageSize, currentSort, sortDirection, filters, currentView],
    () => {
      const query: Record<string, any> = {}
      const f = filters.value

      if (searchQuery.value) query.search = searchQuery.value
      if (currentPage.value > 1) query.page = currentPage.value
      if (pageSize.value !== 25) query.page_size = pageSize.value
      if (currentSort.value) query.ordering = sortDirection.value === 'desc' ? `-${currentSort.value}` : currentSort.value
      if (currentView.value === 'bookings') query.view = 'bookings'
      if (currentView.value === 'families') query.view = 'families'
      if (currentView.value === 'statistics') query.view = 'statistics'
      if (currentView.value === 'tickets') query.view = 'tickets'
      if (currentView.value === 'tickets' && route.query.ticket_id) query.ticket_id = route.query.ticket_id

      if (f.organisation) query.organisation = f.organisation
      if (f.areaFrom) query.area_from = f.areaFrom
      if (f.gender) query.gender = f.gender
      if (f.ageMin) query.age_min = f.ageMin
      if (f.ageMax) query.age_max = f.ageMax
      if (f.isCheckedIn !== undefined) query.is_checked_in = f.isCheckedIn
      if (f.isRegistered !== undefined) query.is_registered = f.isRegistered
      if (f.isCancelled !== undefined) query.is_cancelled = f.isCancelled
      if (f.isMinor !== undefined) query.is_minor = f.isMinor
      if (f.isStaff !== undefined) query.is_event_staff = f.isStaff
      if (f.hasDietaryRequirements !== undefined) query.has_dietary_requirements = f.hasDietaryRequirements
      if (f.dietaryRequirement) query.dietary_requirement = f.dietaryRequirement
      if (f.hasMedicalConditions !== undefined) query.has_medical_conditions = f.hasMedicalConditions
      if (f.medicalCondition) query.medical_condition = f.medicalCondition
      if (f.hasAccessibilityRequirements !== undefined) query.has_accessibility_requirements = f.hasAccessibilityRequirements
      if (f.accessibilityRequirement) query.accessibility_requirement = f.accessibilityRequirement
      if (f.hasEmergencyContacts !== undefined) query.has_emergency_contacts = f.hasEmergencyContacts
      if (f.question) query.question = f.question
      if (f.questionAnswerSearch) query.question_answer_search = f.questionAnswerSearch
      if (f.hasAnsweredQuestions !== undefined) query.has_answered_questions = f.hasAnsweredQuestions
      if (f.hasUnansweredRequiredQuestions !== undefined) query.has_unanswered_required_questions = f.hasUnansweredRequiredQuestions
      if (f.selectedOption) query.selected_option = f.selectedOption
      if (f.sliderAnswerMin) query.slider_answer_min = f.sliderAnswerMin
      if (f.sliderAnswerMax) query.slider_answer_max = f.sliderAnswerMax
      if (f.answeredQuestionType) query.answered_question_type = f.answeredQuestionType
      if (f.hasOrders !== undefined) query.has_orders = f.hasOrders
      if (f.orderStatus) query.order_status = f.orderStatus
      if (f.orderStatusNot) query.order_status_not = f.orderStatusNot
      if (f.purchasedProduct) query.purchased_product = f.purchasedProduct
      if (f.purchasedProductTitle) query.purchased_product_title = f.purchasedProductTitle
      if (f.orderTotalMin) query.order_total_min = f.orderTotalMin
      if (f.orderTotalMax) query.order_total_max = f.orderTotalMax
      if (f.orderCreatedAfter) query.order_created_after = f.orderCreatedAfter
      if (f.orderCreatedBefore) query.order_created_before = f.orderCreatedBefore
      if (f.orderReferenceId) query.order_reference_id = f.orderReferenceId
      if (f.hasCompletedOrders !== undefined) query.has_completed_orders = f.hasCompletedOrders
      if (f.hasPendingOrders !== undefined) query.has_pending_orders = f.hasPendingOrders
      if (f.hasPayments !== undefined) query.has_payments = f.hasPayments
      if (f.paymentId) query.payment_id = f.paymentId
      if (f.paymentReference) query.payment_reference = f.paymentReference
      if (f.bankTransferReference) query.bank_transfer_reference = f.bankTransferReference
      if (f.paymentStatus) query.payment_status = f.paymentStatus
      if (f.paymentTarget) query.payment_target = f.paymentTarget
      if (f.paymentMethodType) query.payment_method_type = f.paymentMethodType
      if (f.paymentMethodTitle) query.payment_method_title = f.paymentMethodTitle
      if (f.hasRefunds !== undefined) query.has_refunds = f.hasRefunds
      if (f.refundStatus) query.refund_status = f.refundStatus
      if (f.refundIsActive !== undefined) query.refund_is_active = f.refundIsActive
      if (f.hasDonations !== undefined) query.has_donations = f.hasDonations
      if (f.donationStatus) query.donation_status = f.donationStatus
      if (f.hasDiscountsUsed !== undefined) query.has_discounts_used = f.hasDiscountsUsed
      if (f.discountId) query.discount_id = f.discountId
      if (f.discountName) query.discount_name = f.discountName
      if (f.relationshipToUser) query.relationship_to_user = f.relationshipToUser
      if (f.selfRegistered !== undefined) query.self_registered = f.selfRegistered
      if (f.hasBooking !== undefined) query.has_booking = f.hasBooking
      if (f.booking) query.booking = f.booking
      if (f.dateOfBirthAfter) query.date_of_birth_after = f.dateOfBirthAfter
      if (f.dateOfBirthBefore) query.date_of_birth_before = f.dateOfBirthBefore
      if (f.createdAfter) query.created_after = f.createdAfter
      if (f.createdBefore) query.created_before = f.createdBefore
      if (f.includeDeleted !== undefined) query.include_deleted = f.includeDeleted

      // Event form filters
      if (f.hasFormResponses !== undefined) query.has_form_responses = f.hasFormResponses
      if (f.formResponseForms) query.form_response_form = f.formResponseForms
      if (f.formResponseComplete !== undefined) query.form_response_complete = f.formResponseComplete
      if (f.formAnswerSearch) query.form_answer_search = f.formAnswerSearch
      if (f.formAnsweredQuestions) query.form_answered_question = f.formAnsweredQuestions
      if (f.formHasUnansweredRequired !== undefined) query.form_has_unanswered_required = f.formHasUnansweredRequired
      if (f.formSelectedOption) query.form_selected_option = f.formSelectedOption
      if (f.formAnswerSubmittedAfter) query.form_answer_submitted_after = f.formAnswerSubmittedAfter
      if (f.formAnswerSubmittedBefore) query.form_answer_submitted_before = f.formAnswerSubmittedBefore
      if (f.formNumericAnswerMin !== undefined) query.form_numeric_answer_min = f.formNumericAnswerMin
      if (f.formNumericAnswerMax !== undefined) query.form_numeric_answer_max = f.formNumericAnswerMax
      if (f.formAnswerDateAfter) query.form_answer_date_after = f.formAnswerDateAfter
      if (f.formAnswerDateBefore) query.form_answer_date_before = f.formAnswerDateBefore
      if (f.formAnswerTimeAfter) query.form_answer_time_after = f.formAnswerTimeAfter
      if (f.formAnswerTimeBefore) query.form_answer_time_before = f.formAnswerTimeBefore

      router.replace({ query })
    },
    { deep: true },
  )

  // ─── Actions ─────────────────────────────────────────────────────────────────

  function changeView(view: ParticipantsView) {
    currentView.value = view
    currentPage.value = 1
  }

  function setSorting(field: string) {
    if (currentSort.value === field) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      currentSort.value = field
      sortDirection.value = 'asc'
    }
  }

  function clearAllFilters() {
    searchQuery.value = ''
    debouncedQuestionSearch.value = ''
    filters.value = makeEmptyFilters()
    currentPage.value = 1
  }

  function removeFilter(key: string) {
    // @ts-ignore - dynamic key access
    filters.value[key] = undefined
    if (key === 'questionAnswerSearch') {
      debouncedQuestionSearch.value = ''
    }
    currentPage.value = 1
  }

  function applyFilters(updatedFilters: ParticipantsFilters) {
    filters.value = { ...updatedFilters }
    currentPage.value = 1
    showFiltersModal.value = false
  }

  function handleQuestionSearchInput(value: string) {
    clearTimeout(questionSearchTimeout)
    questionSearchTimeout = setTimeout(() => {
      debouncedQuestionSearch.value = value
      filters.value.questionAnswerSearch = value
    }, 500)
  }

  return {
    // View
    currentView,
    changeView,

    // Search & pagination
    searchQuery,
    debouncedSearch,
    currentPage,
    pageSize,
    currentSort,
    sortDirection,
    setSorting,

    // Filters
    filters,
    debouncedQuestionSearch,
    activeFilterCount,
    buildActiveFilterChips,
    clearAllFilters,
    removeFilter,
    applyFilters,
    handleQuestionSearchInput,

    // Filter UI
    showFilters,
    showFiltersModal,

    // Query params
    queryParams,
    bookingsQueryParams,
    familyGroupsQueryParams,
    eventBookingsQueryParams,
  }
}
