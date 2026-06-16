import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import type {
  AttendeeFiltersRequest,
  AttendeeFilterRequestRequest,
} from '~/api/types.gen'

export type ParticipantsView = 'attendees' | 'bookings' | 'families' | 'statistics' | 'tickets'

// Re-export the structured filter type so consumers can import from one place
export type { AttendeeFiltersRequest }

// ── URL encode / decode ───────────────────────────────────────────────────────

function encodeFilters(filters: AttendeeFiltersRequest): string {
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify(filters))))
  }
  catch {
    return ''
  }
}

function decodeFilters(raw: string): AttendeeFiltersRequest | null {
  try {
    const json = decodeURIComponent(escape(atob(raw)))
    return JSON.parse(json) as AttendeeFiltersRequest
  }
  catch {
    return null
  }
}

function makeEmptyFilters(): AttendeeFiltersRequest {
  return {
    operator: 'AND',
    demographics: {},
    status: {},
    forms: { operator: 'AND', conditions: [] },
    registration_questions: { operator: 'AND', conditions: [] },
    orders: {},
    payments: {},
    advanced: {},
  }
}

// ── Active filter counting ────────────────────────────────────────────────────

function countDefinedFields(obj: Record<string, unknown>): number {
  let count = 0
  for (const val of Object.values(obj)) {
    if (val === undefined || val === null) continue
    if (Array.isArray(val) && val.length === 0) continue
    count++
  }
  return count
}

function countFilters(filters: AttendeeFiltersRequest): number {
  let count = 0
  if (filters.demographics) count += countDefinedFields(filters.demographics as any)
  if (filters.status) count += countDefinedFields(filters.status as any)
  if (filters.orders) count += countDefinedFields(filters.orders as any)
  if (filters.payments) count += countDefinedFields(filters.payments as any)
  if (filters.advanced) count += countDefinedFields(filters.advanced as any)
  count += (filters.forms?.conditions ?? []).length
  count += (filters.registration_questions?.conditions ?? []).length
  return count
}

// ── Main composable ───────────────────────────────────────────────────────────

export function useParticipantsUrlState(eventId: MaybeRefOrGetter<string>) {
  const route = useRoute()
  const router = useRouter()

  function getQueryString(value: unknown): string | undefined {
    if (Array.isArray(value)) {
      const first = value.find((v) => typeof v === 'string')
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

  // ─── State ───────────────────────────────────────────────────────────────────

  const currentView = ref<ParticipantsView>(parseView(route.query.view))
  const searchQuery = ref(getQueryString(route.query.search) || '')
  const currentPage = ref(Number(getQueryString(route.query.page)) || 1)
  const pageSize = ref(Number(getQueryString(route.query.page_size)) || 25)

  const _initialOrdering = getQueryString(route.query.ordering) || ''
  const currentSort = ref<string>(_initialOrdering.startsWith('-') ? _initialOrdering.slice(1) : _initialOrdering)
  const sortDirection = ref<'asc' | 'desc'>(_initialOrdering.startsWith('-') ? 'desc' : 'asc')

  const showFilters = ref(false)
  const showFiltersModal = ref(false)

  const _rawF = getQueryString(route.query.f)
  const _decoded = _rawF ? decodeFilters(_rawF) : null
  const filters = ref<AttendeeFiltersRequest>(_decoded ?? makeEmptyFilters())

  const debouncedSearch = ref(searchQuery.value)
  let searchTimeout: ReturnType<typeof setTimeout>

  // ─── Route → state sync ──────────────────────────────────────────────────────

  watch(() => route.query.view, (view) => { currentView.value = parseView(view) })
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
  watch(() => route.query.f, (value) => {
    const raw = getQueryString(value)
    const decoded = raw ? decodeFilters(raw) : null
    filters.value = decoded ?? makeEmptyFilters()
  })

  // ─── Debounced search ────────────────────────────────────────────────────────

  watch(searchQuery, (newValue) => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      debouncedSearch.value = newValue
      currentPage.value = 1
    }, 300)
  })

  // ─── Query params ────────────────────────────────────────────────────────────

  /** POST body for POST /api/attendees/filter/ */
  const postFilterBody = computed<AttendeeFilterRequestRequest>(() => {
    const id = toValue(eventId)
    const body: AttendeeFilterRequestRequest = {
      event: id,
      page: currentPage.value,
      page_size: pageSize.value,
      filters: filters.value,
    }
    if (debouncedSearch.value) body.search = debouncedSearch.value
    if (currentSort.value)
      body.ordering = sortDirection.value === 'desc' ? `-${currentSort.value}` : currentSort.value
    return body
  })

  /** GET params for stats / bookings / family groups (unchanged GET endpoints) */
  const queryParams = computed(() => {
    const id = toValue(eventId)
    const params: Record<string, any> = { event: id, page: currentPage.value, page_size: pageSize.value }
    if (debouncedSearch.value) params.search = debouncedSearch.value
    if (currentSort.value)
      params.ordering = sortDirection.value === 'desc' ? `-${currentSort.value}` : currentSort.value
    return params
  })

  const bookingsQueryParams = computed(() => {
    const id = toValue(eventId)
    const params: Record<string, any> = { event: id, page: currentPage.value, page_size: pageSize.value }
    if (debouncedSearch.value) params.search = debouncedSearch.value
    if (currentSort.value)
      params.ordering = sortDirection.value === 'desc' ? `-${currentSort.value}` : currentSort.value
    return params
  })

  const familyGroupsQueryParams = computed(() => {
    const id = toValue(eventId)
    const params: Record<string, any> = { event: id, page: currentPage.value, page_size: pageSize.value }
    if (debouncedSearch.value) params.search = debouncedSearch.value
    if (currentSort.value)
      params.ordering = sortDirection.value === 'desc' ? `-${currentSort.value}` : currentSort.value
    return params
  })

  const eventBookingsQueryParams = computed(() => ({ event: toValue(eventId), page_size: 100 }))

  // ─── Active filter count ─────────────────────────────────────────────────────

  const activeFilterCount = computed(() => countFilters(filters.value))

  // ─── Active filter chips ─────────────────────────────────────────────────────

  function buildActiveFilterChips(
    organisationsList: any[],
    areasList: any[],
    questionsList: any[],
    dietaryList: any[],
    medicalList: any[],
    accessibilityList: any[],
    formQuestionsList: any[],
    formsList: any[] = [],
  ) {
    return computed(() => {
      const chips: Array<{ key: string; label: string; value: string }> = []
      const f = filters.value

      // ── Helper: look up a form question title by integer ID ──────────────────
      function fqTitle(questionId: number): string {
        const q = formQuestionsList.find((q: any) => Number(q.id) === questionId)
        return q ? String(q.question_title || '').trim() || `Q${questionId}` : `Q${questionId}`
      }

      // ── Helper: look up a form title by UUID ─────────────────────────────────
      function formTitle(formId: string): string {
        const form = formsList.find((f: any) => f.id === formId)
        return form ? String(form.title || '').trim() || formId.slice(0, 8) : formId.slice(0, 8)
      }

      // ── Helper: look up a registration question title by UUID ────────────────
      function rqTitle(questionId: string): string {
        const q = questionsList.find((q: any) => String(q.id) === questionId)
        return q ? String(q.question_title || q.question_body || '').trim() || `Q${questionId.slice(0, 6)}` : `Q${questionId.slice(0, 6)}`
      }

      // ── Helper: build a human-readable summary of a question condition ────────
      function fqConditionSummary(qCond: any): string {
        const type = String(qCond.type || '')
        if (type === 'short_answer' || type === 'long_answer' || type === 'email' || type === 'phone') {
          return qCond.contains ? `contains "${qCond.contains}"` : 'has answer'
        }
        if (type === 'single_choice' || type === 'multiple_choice') {
          const opts = qCond.selected_options
          return opts?.length ? `option ${opts.join('/')}` : 'any option'
        }
        if (type === 'slider' || type === 'rating') {
          if (qCond.min != null && qCond.max != null) return `${qCond.min}–${qCond.max}`
          if (qCond.min != null) return `≥ ${qCond.min}`
          if (qCond.max != null) return `≤ ${qCond.max}`
          return 'any value'
        }
        if (type === 'date') {
          if (qCond.date_after && qCond.date_before) return `${qCond.date_after} – ${qCond.date_before}`
          if (qCond.date_after) return `after ${qCond.date_after}`
          if (qCond.date_before) return `before ${qCond.date_before}`
          return 'any date'
        }
        if (type === 'time') {
          if (qCond.time_after && qCond.time_before) return `${qCond.time_after} – ${qCond.time_before}`
          if (qCond.time_after) return `after ${qCond.time_after}`
          if (qCond.time_before) return `before ${qCond.time_before}`
          return 'any time'
        }
        if (type === 'upload') {
          return 'submitted'
        }
        return type
      }

      const d = f.demographics ?? {}
      if (d.gender) chips.push({ key: 'demographics.gender', label: 'Gender', value: String(d.gender) })
      if (d.age_min != null) chips.push({ key: 'demographics.age_min', label: 'Min Age', value: String(d.age_min) })
      if (d.age_max != null) chips.push({ key: 'demographics.age_max', label: 'Max Age', value: String(d.age_max) })
      if (d.is_minor != null) chips.push({ key: 'demographics.is_minor', label: 'Minor', value: d.is_minor ? 'Yes' : 'No' })
      if (d.organisation && d.organisation.length > 0) {
        const names = d.organisation.map((id) => organisationsList.find((o: any) => o.id === id)?.title || String(id))
        chips.push({ key: 'demographics.organisation', label: 'Organisation', value: names.join(', ') })
      }
      if (d.area_from && d.area_from.length > 0) {
        const names = d.area_from.map((id) => areasList.find((a: any) => a.id === id)?.area_name || String(id))
        chips.push({ key: 'demographics.area_from', label: 'Area', value: names.join(', ') })
      }
      if (d.has_dietary_requirements != null) chips.push({ key: 'demographics.has_dietary_requirements', label: 'Has Dietary', value: d.has_dietary_requirements ? 'Yes' : 'No' })
      if (d.dietary_requirement && d.dietary_requirement.length > 0) {
        const names = d.dietary_requirement.map((id) => dietaryList.find((r: any) => r.id === id)?.label || String(id))
        chips.push({ key: 'demographics.dietary_requirement', label: 'Dietary', value: names.join(', ') })
      }
      if (d.has_medical_conditions != null) chips.push({ key: 'demographics.has_medical_conditions', label: 'Has Medical', value: d.has_medical_conditions ? 'Yes' : 'No' })
      if (d.medical_condition && d.medical_condition.length > 0) {
        const names = d.medical_condition.map((id) => medicalList.find((c: any) => c.id === id)?.label || String(id))
        chips.push({ key: 'demographics.medical_condition', label: 'Medical', value: names.join(', ') })
      }
      if (d.has_accessibility_requirements != null) chips.push({ key: 'demographics.has_accessibility_requirements', label: 'Has Accessibility', value: d.has_accessibility_requirements ? 'Yes' : 'No' })
      if (d.accessibility_requirement && d.accessibility_requirement.length > 0) {
        const names = d.accessibility_requirement.map((id) => accessibilityList.find((r: any) => r.id === id)?.label || String(id))
        chips.push({ key: 'demographics.accessibility_requirement', label: 'Accessibility', value: names.join(', ') })
      }
      if (d.has_emergency_contacts != null) chips.push({ key: 'demographics.has_emergency_contacts', label: 'Emergency Contacts', value: d.has_emergency_contacts ? 'Yes' : 'No' })
      if (d.include_deleted) chips.push({ key: 'demographics.include_deleted', label: 'Include Deleted', value: 'Yes' })

      const s = f.status ?? {}
      if (s.is_checked_in != null) chips.push({ key: 'status.is_checked_in', label: 'Checked In', value: s.is_checked_in ? 'Yes' : 'No' })
      if (s.is_registered != null) chips.push({ key: 'status.is_registered', label: 'Registered', value: s.is_registered ? 'Yes' : 'No' })
      if (s.is_cancelled != null) chips.push({ key: 'status.is_cancelled', label: 'Cancelled', value: s.is_cancelled ? 'Yes' : 'No' })
      if (s.is_staff != null) chips.push({ key: 'status.is_staff', label: 'Staff', value: s.is_staff ? 'Yes' : 'No' })

      // ── Form condition chips — one chip per question condition ──────────────
      ;(f.forms?.conditions ?? []).forEach((cond, i) => {
        const title = formTitle(cond.form)
        const questions = cond.questions ?? []
        if (questions.length === 0) {
          // Only has_response / response_complete filters
          const parts: string[] = []
          if (cond.has_response === true) parts.push('has response')
          else if (cond.has_response === false) parts.push('no response')
          if (cond.response_complete === true) parts.push('complete')
          else if (cond.response_complete === false) parts.push('incomplete')
          chips.push({
            key: `forms.${i}`,
            label: title,
            value: parts.join(', ') || 'response filter',
          })
        }
        else {
          questions.forEach((qCond: any, qi: number) => {
            chips.push({
              key: `forms.${i}.q${qi}`,
              label: title,
              value: `${fqTitle(qCond.question_id)}: ${fqConditionSummary(qCond)}`,
            })
          })
        }
      })

      // ── Registration question chips — one chip per condition ────────────────
      ;(f.registration_questions?.conditions ?? []).forEach((cond, i) => {
        const title = rqTitle(String(cond.question_id))
        chips.push({
          key: `rq.${i}`,
          label: 'Question',
          value: `${title}: ${fqConditionSummary(cond)}`,
        })
      })

      const o = f.orders ?? {}
      if (o.has_orders != null) chips.push({ key: 'orders.has_orders', label: 'Has Orders', value: o.has_orders ? 'Yes' : 'No' })
      if (o.order_status && o.order_status.length > 0) chips.push({ key: 'orders.order_status', label: 'Order Status', value: o.order_status.join(', ') })
      if (o.order_status_not && o.order_status_not.length > 0) chips.push({ key: 'orders.order_status_not', label: 'Order Status Not', value: o.order_status_not.join(', ') })
      if (o.purchased_product && o.purchased_product.length > 0) chips.push({ key: 'orders.purchased_product', label: 'Product', value: String(o.purchased_product.join(', ')) })
      if (o.purchased_product_title) chips.push({ key: 'orders.purchased_product_title', label: 'Product Title', value: String(o.purchased_product_title) })
      if (o.order_total_min != null) chips.push({ key: 'orders.order_total_min', label: 'Order Min', value: String(o.order_total_min) })
      if (o.order_total_max != null) chips.push({ key: 'orders.order_total_max', label: 'Order Max', value: String(o.order_total_max) })
      if (o.order_created_after) chips.push({ key: 'orders.order_created_after', label: 'Order After', value: String(o.order_created_after) })
      if (o.order_created_before) chips.push({ key: 'orders.order_created_before', label: 'Order Before', value: String(o.order_created_before) })
      if (o.order_reference_id) chips.push({ key: 'orders.order_reference_id', label: 'Order Ref', value: String(o.order_reference_id) })
      if (o.has_completed_orders != null) chips.push({ key: 'orders.has_completed_orders', label: 'Completed Orders', value: o.has_completed_orders ? 'Yes' : 'No' })
      if (o.has_pending_orders != null) chips.push({ key: 'orders.has_pending_orders', label: 'Pending Orders', value: o.has_pending_orders ? 'Yes' : 'No' })

      const p = f.payments ?? {}
      if (p.has_payments != null) chips.push({ key: 'payments.has_payments', label: 'Has Payments', value: p.has_payments ? 'Yes' : 'No' })
      if (p.payment_status && p.payment_status.length > 0) chips.push({ key: 'payments.payment_status', label: 'Payment Status', value: p.payment_status.join(', ') })
      if (p.payment_method_type && p.payment_method_type.length > 0) chips.push({ key: 'payments.payment_method_type', label: 'Method Type', value: p.payment_method_type.join(', ') })
      if (p.payment_reference) chips.push({ key: 'payments.payment_reference', label: 'Payment Ref', value: String(p.payment_reference) })
      if (p.bank_transfer_reference) chips.push({ key: 'payments.bank_transfer_reference', label: 'Bank Transfer Ref', value: String(p.bank_transfer_reference) })
      if (p.has_refunds != null) chips.push({ key: 'payments.has_refunds', label: 'Has Refunds', value: p.has_refunds ? 'Yes' : 'No' })
      if (p.refund_status && p.refund_status.length > 0) chips.push({ key: 'payments.refund_status', label: 'Refund Status', value: p.refund_status.join(', ') })
      if (p.has_donations != null) chips.push({ key: 'payments.has_donations', label: 'Has Donations', value: p.has_donations ? 'Yes' : 'No' })
      if (p.has_discounts_used != null) chips.push({ key: 'payments.has_discounts_used', label: 'Has Discounts', value: p.has_discounts_used ? 'Yes' : 'No' })
      if (p.discount_name) chips.push({ key: 'payments.discount_name', label: 'Discount Name', value: String(p.discount_name) })

      const a = f.advanced ?? {}
      if (a.relationship_to_user) chips.push({ key: 'advanced.relationship_to_user', label: 'Relationship', value: String(a.relationship_to_user) })
      if (a.self_registered != null) chips.push({ key: 'advanced.self_registered', label: 'Self Registered', value: a.self_registered ? 'Yes' : 'No' })
      if (a.has_booking != null) chips.push({ key: 'advanced.has_booking', label: 'Has Booking', value: a.has_booking ? 'Yes' : 'No' })
      if (a.date_of_birth_after) chips.push({ key: 'advanced.date_of_birth_after', label: 'DOB After', value: String(a.date_of_birth_after) })
      if (a.date_of_birth_before) chips.push({ key: 'advanced.date_of_birth_before', label: 'DOB Before', value: String(a.date_of_birth_before) })
      if (a.created_after) chips.push({ key: 'advanced.created_after', label: 'Created After', value: String(a.created_after) })
      if (a.created_before) chips.push({ key: 'advanced.created_before', label: 'Created Before', value: String(a.created_before) })

      return chips
    })
  }

  // ─── URL → state sync (watcher) ──────────────────────────────────────────────

  watch(
    [searchQuery, currentPage, pageSize, currentSort, sortDirection, filters, currentView],
    () => {
      const query: Record<string, any> = {}
      if (searchQuery.value) query.search = searchQuery.value
      if (currentPage.value > 1) query.page = currentPage.value
      if (pageSize.value !== 25) query.page_size = pageSize.value
      if (currentSort.value)
        query.ordering = sortDirection.value === 'desc' ? `-${currentSort.value}` : currentSort.value
      if (currentView.value !== 'attendees') query.view = currentView.value
      if (currentView.value === 'tickets' && route.query.ticket_id)
        query.ticket_id = route.query.ticket_id

      if (countFilters(filters.value) > 0) {
        const encoded = encodeFilters(filters.value)
        if (encoded) query.f = encoded
      }

      router.replace({ query })
    },
    { deep: true },
  )

  // ─── Actions ──────────────────────────────────────────────────────────────────

  function changeView(view: ParticipantsView) {
    currentView.value = view
    currentPage.value = 1
  }

  function setSorting(field: string) {
    if (currentSort.value === field) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    }
    else {
      currentSort.value = field
      sortDirection.value = 'asc'
    }
    currentPage.value = 1
  }

  function clearAllFilters() {
    searchQuery.value = ''
    filters.value = makeEmptyFilters()
    currentPage.value = 1
  }

  function removeFilter(key: string) {
    const [section, field] = key.split('.')
    const f = filters.value as any
    if (section === 'forms') {
      const idx = Number(field)
      if (!Number.isNaN(idx)) {
        const conditions = [...(f.forms?.conditions ?? [])]
        conditions.splice(idx, 1)
        filters.value = { ...filters.value, forms: { ...filters.value.forms, conditions } }
      }
    }
    else if (section === 'rq') {
      const idx = Number(field)
      if (!Number.isNaN(idx)) {
        const conditions = [...(f.registration_questions?.conditions ?? [])]
        conditions.splice(idx, 1)
        filters.value = { ...filters.value, registration_questions: { ...filters.value.registration_questions, conditions } }
      }
    }
    else if (f[section] && field) {
      filters.value = { ...filters.value, [section]: { ...f[section], [field]: undefined } }
    }
    currentPage.value = 1
  }

  function applyFilters(updatedFilters: AttendeeFiltersRequest) {
    filters.value = { ...updatedFilters }
    currentPage.value = 1
    showFiltersModal.value = false
  }

  return {
    currentView,
    changeView,
    searchQuery,
    debouncedSearch,
    currentPage,
    pageSize,
    currentSort,
    sortDirection,
    setSorting,
    filters,
    activeFilterCount,
    buildActiveFilterChips,
    clearAllFilters,
    removeFilter,
    applyFilters,
    showFilters,
    showFiltersModal,
    postFilterBody,
    queryParams,
    bookingsQueryParams,
    familyGroupsQueryParams,
    eventBookingsQueryParams,
  }
}
