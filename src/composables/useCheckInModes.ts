import type { CheckInBroadcastPayload } from './websockets/events/useCheckInSocket'

// ── Types ─────────────────────────────────────────────────────────────────────

export type CheckInDisplayMode = 'auto' | 'manual' | 'priority'

export interface UseCheckInModesOptions {
  /** Ref or array of all recent check-ins (from useCheckInSocket) */
  recentCheckIns: Readonly<Ref<ReadonlyArray<CheckInBroadcastPayload>>>
  /** Ref to items matching the priority filter (from useCheckInSocket) */
  priorityQueue: Readonly<Ref<ReadonlyArray<CheckInBroadcastPayload>>>
  /**
   * How long (ms) each item is shown in auto mode before advancing.
   * @default 10000
   */
  autoAdvanceInterval?: number
}

// ── Composable ────────────────────────────────────────────────────────────────

/**
 * Manages which check-in is currently displayed on screen.
 *
 * Three modes:
 * - **auto** — advances through `recentCheckIns` automatically on a timer
 * - **manual** — exposes `advance()` / `goBack()` for manual navigation
 * - **priority** — feeds only items from `priorityQueue` (auto-advancing)
 *
 * The composable never mutates the source arrays — it tracks a cursor index.
 *
 * @example
 * ```ts
 * const ws = useCheckInSocket(eventId)
 * const modes = useCheckInModes({
 *   recentCheckIns: ws.recentCheckIns,
 *   priorityQueue: ws.priorityQueue,
 * })
 *
 * // Show current item
 * watch(modes.currentItem, (item) => {
 *   if (item) highlightCard(item)
 * })
 *
 * // Change mode
 * modes.setMode('priority')
 * ```
 */
export function useCheckInModes(options: UseCheckInModesOptions) {
  const { recentCheckIns, priorityQueue, autoAdvanceInterval = 10_000 } = options

  const mode = ref<CheckInDisplayMode>('auto')
  const cursorIndex = ref(0)
  let autoTimer: ReturnType<typeof setInterval> | null = null

  // ── Active queue (derived from mode) ─────────────────────────────────────

  const activeQueue = computed<ReadonlyArray<CheckInBroadcastPayload>>(() => {
    return mode.value === 'priority' ? priorityQueue.value : recentCheckIns.value
  })

  const currentItem = computed<CheckInBroadcastPayload | null>(() => {
    const q = activeQueue.value
    if (!q.length) return null
    // Clamp cursor to valid range (list can grow prepend-style)
    const idx = Math.min(cursorIndex.value, q.length - 1)
    return q[idx] ?? null
  })

  // Remaining items after cursor
  const remainingCount = computed(() => {
    const total = activeQueue.value.length
    return Math.max(0, total - cursorIndex.value - 1)
  })

  // ── Navigation ────────────────────────────────────────────────────────────

  /**
   * Move to the next item (older in time, since list is prepended).
   * Wraps around to the newest item.
   */
  function advance() {
    const len = activeQueue.value.length
    if (!len) return
    cursorIndex.value = (cursorIndex.value + 1) % len
  }

  /**
   * Move to the previous item (newer in time).
   */
  function goBack() {
    const len = activeQueue.value.length
    if (!len) return
    cursorIndex.value = cursorIndex.value === 0 ? len - 1 : cursorIndex.value - 1
  }

  /**
   * Jump to the newest item (index 0).
   */
  function jumpToLatest() {
    cursorIndex.value = 0
  }

  // ── Auto-advance timer ────────────────────────────────────────────────────

  function startAutoTimer() {
    stopAutoTimer()
    if (mode.value === 'auto' || mode.value === 'priority') {
      autoTimer = setInterval(advance, autoAdvanceInterval)
    }
  }

  function stopAutoTimer() {
    if (autoTimer !== null) {
      clearInterval(autoTimer)
      autoTimer = null
    }
  }

  // ── Mode switching ────────────────────────────────────────────────────────

  function setMode(newMode: CheckInDisplayMode) {
    if (newMode === mode.value) return
    mode.value = newMode
    cursorIndex.value = 0
    stopAutoTimer()
    if (newMode === 'auto' || newMode === 'priority') {
      startAutoTimer()
    }
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  // Start timer on mount if default mode is auto
  if (import.meta.client) {
    startAutoTimer()

    onBeforeUnmount(() => {
      stopAutoTimer()
    })
  }

  // When new items arrive (list grows), keep cursor at 0 so newest is shown
  watch(
    () => activeQueue.value.length,
    (newLen, oldLen) => {
      if (newLen > oldLen) {
        // New item prepended — reset to newest unless user is manually browsing
        if (mode.value === 'auto' || mode.value === 'priority') {
          cursorIndex.value = 0
        }
      }
    },
  )

  return {
    // State
    mode: readonly(mode),
    currentItem,
    activeQueue,
    remainingCount,
    cursorIndex: readonly(cursorIndex),

    // Navigation
    advance,
    goBack,
    jumpToLatest,

    // Mode control
    setMode,
  }
}

export type UseCheckInModes = ReturnType<typeof useCheckInModes>
