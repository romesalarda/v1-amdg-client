import { checkinsBulkDeleteLogsDestroy } from '~/api/sdk.gen'

export type BulkDeleteMode = 'all' | 'specific' | 'range'

export interface BulkDeleteScope {
  mode: BulkDeleteMode
  date?: string
  date_from?: string
  date_to?: string
}

export interface BulkDeleteResult {
  deleted: number
}

export function buildBulkDeleteLogsBody(eventId: string, scope: BulkDeleteScope) {
  const body: Record<string, string> = { event: eventId }

  if (scope.mode === 'specific') {
    if (!scope.date) {
      throw new Error('A specific date is required when mode is specific.')
    }
    body.date = scope.date
    return body
  }

  if (scope.mode === 'range') {
    if (scope.date_from) body.date_from = scope.date_from
    if (scope.date_to) body.date_to = scope.date_to
    return body
  }

  return body
}

/**
 * Deletes check-in logs for an event using all/specific/range scopes.
 */
export function useBulkDeleteCheckInLogs() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function execute(eventId: string, scope: BulkDeleteScope): Promise<BulkDeleteResult> {
    isLoading.value = true
    error.value = null
    try {
      const body = buildBulkDeleteLogsBody(eventId, scope)
      const response = await checkinsBulkDeleteLogsDestroy({
        body,
        throwOnError: true,
      })
      return response.data
    } catch (err: any) {
      error.value = err?.data?.detail ?? err?.message ?? 'Failed to delete logs.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading: readonly(isLoading),
    error: readonly(error),
    execute,
  }
}
