import type { CheckInResponse } from '~/api/types.gen'
import { checkinsCreate } from '~/api/sdk.gen'

// ── Types ─────────────────────────────────────────────────────────────────────

export type ScanAction = 'CHECK_IN' | 'CHECK_OUT'

export interface ScanResult {
  id: string
  raw_value: string
  response: CheckInResponse
  scanned_at: string
}

export interface UseCheckInScannerOptions {
  /** UUID of the event — used as the `event` filter context */
  eventIdentifier: Ref<string>
  /** Default action to apply on each scan */
  action?: Ref<ScanAction>
  /** Cooldown in ms between accepted scans (prevents double-scans) */
  cooldown?: number
  /** Max number of results to keep in history */
  maxHistory?: number
}

// ── Composable ────────────────────────────────────────────────────────────────

/**
 * Handles the QR scan → HTTP POST → result flow for check-in scanning.
 *
 * Decoupled from the camera UI — pass any barcode raw value via `processCode()`.
 * `QrcodeStream`'s `@detect` event should call `onDetect(barcodes)`.
 *
 * Cooldown (default 2 s) prevents duplicate submissions from the same physical scan.
 *
 * @example
 * ```ts
 * const scanner = useCheckInScanner({ eventIdentifier, action })
 * // In template: <QrcodeStream @detect="scanner.onDetect" />
 * ```
 */
export function useCheckInScanner(options: UseCheckInScannerOptions) {
  const {
    eventIdentifier,
    action = ref<ScanAction>('CHECK_IN'),
    cooldown = 2000,
    maxHistory = 50,
  } = options

  // ── State ────────────────────────────────────────────────────────────────

  const isProcessing = ref(false)
  /** Pause the camera stream while processing to prevent double-scans */
  const isPaused = ref(false)
  const lastResult = ref<ScanResult | null>(null)
  const lastError = ref<string | null>(null)
  const recentResults = ref<ScanResult[]>([])
  const scanCount = ref(0)
  const successCount = ref(0)
  const failureCount = ref(0)

  // ── Core processing ───────────────────────────────────────────────────────

  /**
   * Submit a raw code value to the check-in API.
   * Detects whether it looks like an attendee display ID or a ticket code.
   */
  async function processCode(rawValue: string) {
    if (isProcessing.value || isPaused.value) return

    const code = rawValue.trim()
    if (!code) return

    isProcessing.value = true
    isPaused.value = true
    lastError.value = null
    scanCount.value++

    // Determine identifier type heuristically:
    // ATT- prefix → attendee_display_id
    // TKT- prefix → ticket_code
    // anything else → try ticket_code first (most common QR payload)
    const body: Record<string, string> = code.startsWith('ATT-')
      ? { attendee_display_id: code }
      : { ticket_code: code }

    try {
      const res = await checkinsCreate({
        body: {
          ...body,
          action: action.value,
          method: 'QR_CODE',
          device_info: {
            source: 'qr_scanner',
            user_agent: import.meta.client ? navigator.userAgent : 'ssr',
          },
        },
      })

      if (res.data) {
        const entry: ScanResult = {
          id: res.data.check_in_id,
          raw_value: code,
          response: res.data,
          scanned_at: new Date().toISOString(),
        }
        lastResult.value = entry
        recentResults.value = [entry, ...recentResults.value].slice(0, maxHistory)
        successCount.value++
      }
    } catch (err: any) {
      failureCount.value++
      // Extract a readable error message from the API response
      const detail =
        err?.response?.data?.detail ||
        err?.response?.data?.non_field_errors?.[0] ||
        err?.message ||
        'Unknown error'
      lastError.value = detail
      console.error('[CheckInScanner] Scan failed:', detail, err)
    } finally {
      isProcessing.value = false
      // Resume camera after cooldown
      setTimeout(() => {
        isPaused.value = false
      }, cooldown)
    }
  }

  /**
   * Handler for `QrcodeStream`'s `@detect` event.
   * Takes the first decoded barcode from the array.
   */
  function onDetect(barcodes: Array<{ rawValue: string }>) {
    const first = barcodes?.[0]
    if (first?.rawValue) {
      processCode(first.rawValue)
    }
  }

  /**
   * Manually submit a typed code (manual entry fallback).
   */
  async function submitManual(code: string) {
    if (!code.trim()) return
    await processCode(code.trim())
  }

  /** Clear the last result/error (e.g. after dismissing the overlay) */
  function clearLast() {
    lastResult.value = null
    lastError.value = null
  }

  return {
    // State (read-only)
    isProcessing: readonly(isProcessing),
    isPaused: readonly(isPaused),
    lastResult: readonly(lastResult),
    lastError: readonly(lastError),
    recentResults: readonly(recentResults),
    scanCount: readonly(scanCount),
    successCount: readonly(successCount),
    failureCount: readonly(failureCount),

    // Methods
    onDetect,
    submitManual,
    clearLast,
    processCode,
  }
}

export type UseCheckInScanner = ReturnType<typeof useCheckInScanner>
