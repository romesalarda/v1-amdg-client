import { ref, computed, watch } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import { useEventFormResponses } from '~/composables/resources/events/eventFormResponses'
import { eventFormResponseAnswersList, eventFormsRetrieve } from '~/api/sdk.gen'
import type {
  EventFormResponsesListData,
  EventFormResponse,
  EventFormResponseAnswer,
  EventForm,
} from '~/api/types.gen'

export interface FormResponsesTableFilters {
  is_complete?: boolean | undefined
  ordering?: string
  page?: number
  page_size?: number
}

export interface ResponseWithAnswers {
  response: EventFormResponse
  answers: EventFormResponseAnswer[]
  isLoadingAnswers: boolean
}

/**
 * Composable powering the FormResponsesTable component.
 * Handles server-side paging, filtering by is_complete, and lazy-loading answers per response.
 */
export function useFormResponsesTable(formId: MaybeRefOrGetter<string>) {
  // ── Filters / pagination ──────────────────────────────────────────────────
  const filters = ref<FormResponsesTableFilters>({
    page: 1,
    page_size: 25,
    ordering: '-submitted_at',
  })

  const isFilterSidebarOpen = ref(false)

  const queryParams = computed<EventFormResponsesListData['query']>(() => ({
    form: toValue(formId),
    is_complete: filters.value.is_complete,
    ordering: filters.value.ordering,
    page: filters.value.page,
    page_size: filters.value.page_size,
  }))

  // Remove undefined keys so the API doesn't receive them
  const cleanedQueryParams = computed<EventFormResponsesListData['query']>(() => {
    const q = queryParams.value ?? {}
    return Object.fromEntries(
      Object.entries(q).filter(([, v]) => v !== undefined),
    ) as EventFormResponsesListData['query']
  })

  // ── Responses query ───────────────────────────────────────────────────────
  const responsesQuery = useEventFormResponses(cleanedQueryParams)

  const responses = computed<EventFormResponse[]>(
    () => (responsesQuery.data.value?.data as any)?.results ?? [],
  )
  const totalCount = computed<number>(
    () => (responsesQuery.data.value?.data as any)?.count ?? 0,
  )
  const totalPages = computed(() =>
    Math.ceil(totalCount.value / (filters.value.page_size ?? 25)),
  )

  // ── Form detail (questions) ───────────────────────────────────────────────
  const formDetail = ref<EventForm | null>(null)
  const isLoadingFormDetail = ref(false)

  async function loadFormDetail(id: string) {
    if (!id || isLoadingFormDetail.value) return
    isLoadingFormDetail.value = true
    try {
      const result = await eventFormsRetrieve({ path: { id } })
      if (result.data) formDetail.value = result.data
    } catch {
      // non-critical – detail used for question titles in the modal
    } finally {
      isLoadingFormDetail.value = false
    }
  }

  watch(
    () => toValue(formId),
    (id) => { if (id) loadFormDetail(id) },
    { immediate: true },
  )

  // ── Lazy answer loading per response ─────────────────────────────────────
  const answersByResponseId = ref<Record<string, EventFormResponseAnswer[]>>({})
  const loadingAnswerIds = ref<Set<string>>(new Set())

  async function loadAnswers(responseId: string) {
    if (answersByResponseId.value[responseId] !== undefined) return
    if (loadingAnswerIds.value.has(responseId)) return
    loadingAnswerIds.value.add(responseId)
    // Force reactivity update on the Set
    loadingAnswerIds.value = new Set(loadingAnswerIds.value)
    try {
      const result = await eventFormResponseAnswersList({
        query: { response: responseId, page_size: 100 },
      })
      answersByResponseId.value = {
        ...answersByResponseId.value,
        [responseId]: (result.data as any)?.results ?? [],
      }
    } catch {
      answersByResponseId.value = { ...answersByResponseId.value, [responseId]: [] }
    } finally {
      loadingAnswerIds.value.delete(responseId)
      loadingAnswerIds.value = new Set(loadingAnswerIds.value)
    }
  }

  function getAnswers(responseId: string): EventFormResponseAnswer[] {
    return answersByResponseId.value[responseId] ?? []
  }

  function isLoadingAnswers(responseId: string): boolean {
    return loadingAnswerIds.value.has(responseId)
  }

  // ── Selected response (for modal) ─────────────────────────────────────────
  const selectedResponseId = ref<string | null>(null)

  const selectedResponse = computed<EventFormResponse | null>(
    () => responses.value.find((r) => r.id === selectedResponseId.value) ?? null,
  )

  function openResponse(response: EventFormResponse) {
    selectedResponseId.value = response.id
    loadAnswers(response.id)
  }

  function closeResponse() {
    selectedResponseId.value = null
  }

  // ── Filter helpers ─────────────────────────────────────────────────────────
  function applyFilters(newFilters: Partial<FormResponsesTableFilters>) {
    filters.value = { ...filters.value, ...newFilters, page: 1 }
  }

  function clearFilters() {
    filters.value = { page: 1, page_size: filters.value.page_size ?? 25, ordering: '-submitted_at' }
  }

  const activeFilterCount = computed(() => {
    let count = 0
    if (filters.value.is_complete !== undefined) count++
    if (filters.value.ordering && filters.value.ordering !== '-submitted_at') count++
    return count
  })

  function setPage(page: number) {
    filters.value = { ...filters.value, page }
  }

  return {
    // state
    filters,
    isFilterSidebarOpen,

    // queries
    responsesQuery,
    responses,
    totalCount,
    totalPages,

    // form detail
    formDetail,
    isLoadingFormDetail,

    // answers
    loadAnswers,
    getAnswers,
    isLoadingAnswers,
    answersByResponseId,

    // selection
    selectedResponse,
    selectedResponseId,
    openResponse,
    closeResponse,

    // filter helpers
    activeFilterCount,
    applyFilters,
    clearFilters,
    setPage,
  }
}
