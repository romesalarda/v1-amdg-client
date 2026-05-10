import { computed, type MaybeRefOrGetter } from 'vue'
import { useCheckoutAlternativeSignins } from '~/composables/resources/booking/bookingAlternativeSignins'

export type AlternativeSigninOption = {
  id: string
  title: string
  description: string | null
  formatMatch: string | null
}

export const useAttendeeEnrichmentOptions = (bookingIntentId: MaybeRefOrGetter<string | null | undefined>) => {
  const checkoutAlternativeSigninsQuery = useCheckoutAlternativeSignins(bookingIntentId)

  const alternativeSigninOptions = computed<AlternativeSigninOption[]>(() => {
    const payload = checkoutAlternativeSigninsQuery.data.value?.data as any
    const rows = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.results)
        ? payload.results
        : []

    return rows.map((row: any) => ({
      id: String(row.id || ''),
      title: String(row.title || '').trim(),
      description: row.description ? String(row.description) : null,
      formatMatch: row.format_match ? String(row.format_match) : null,
    })).filter((row: AlternativeSigninOption) => row.id.length > 0 && row.title.length > 0)
  })

  return {
    alternativeSigninOptions,
    alternativeSigninsLoading: checkoutAlternativeSigninsQuery.isLoading,
  }
}
