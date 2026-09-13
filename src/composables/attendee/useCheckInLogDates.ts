import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import { checkinsLogDatesRetrieve } from '~/api/sdk.gen'

/**
 * Fetches distinct check-in log dates for an event with incremental pagination.
 */
export function useCheckInLogDates(
  eventId: MaybeRefOrGetter<string | undefined>,
  pageSize: number = 20,
) {
  const dates = ref<string[]>([])
  const page = ref(1)
  const total = ref(0)
  const hasNext = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const canLoadMore = computed(() => hasNext.value && !isLoading.value)

  const reset = () => {
    dates.value = []
    page.value = 1
    total.value = 0
    hasNext.value = false
    error.value = null
  }

  async function fetchPage(append: boolean) {
    const event = toValue(eventId)
    if (!event) {
      reset()
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const res = await checkinsLogDatesRetrieve({
        query: {
          event,
          page: page.value,
          page_size: pageSize,
        },
        throwOnError: true,
      })

      const incoming = res.data.results
      total.value = typeof res.data.count === 'number' ? res.data.count : incoming.length
      hasNext.value = !!res.data.next

      const merged = append ? [...dates.value, ...incoming] : incoming
      dates.value = Array.from(new Set(merged))
    } catch (err: any) {
      error.value = err?.data?.detail ?? err?.message ?? 'Failed to load log dates.'
    } finally {
      isLoading.value = false
    }
  }

  async function refresh() {
    page.value = 1
    await fetchPage(false)
  }

  async function loadMore() {
    if (!canLoadMore.value) return
    page.value += 1
    await fetchPage(true)
  }

  watch(
    () => toValue(eventId),
    () => {
      if (!toValue(eventId)) {
        reset()
        return
      }
      refresh()
    },
    { immediate: true },
  )

  return {
    dates: readonly(dates),
    total: readonly(total),
    page: readonly(page),
    isLoading: readonly(isLoading),
    error: readonly(error),
    canLoadMore,
    refresh,
    loadMore,
    reset,
  }
}
