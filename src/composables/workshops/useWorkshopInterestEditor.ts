import { ref, computed, watch } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import {
  useWorkshops,
  useWorkshopInterestSubmissions,
  useCreateWorkshopInterestSubmission,
  useUpdateWorkshopInterestSubmission,
  useFinaliseInterestSubmission,
  useUnfinaliseInterestSubmission,
} from '~/composables/resources/workshops'
import type { WorkshopList, WorkshopInterestRank } from '~/api/types.gen'

export interface RankedWorkshop extends WorkshopInterestRank {
  workshop_id: number
}

/**
 * Manages the drag-to-rank interest submission for an attendee on an event.
 *
 * - Fetches the event's open workshops.
 * - Fetches or creates a single interest submission for (event, attendee).
 * - Exposes ranked / unranked lists and drag/reorder operations.
 * - Handles save (update/create) and finalise/unfinalise lifecycle.
 */
export function useWorkshopInterestEditor(
  eventId: MaybeRefOrGetter<string>,
  eventUUID: MaybeRefOrGetter<string>,
  attendeeId: MaybeRefOrGetter<string>,
) {
  // ─── Queries ───────────────────────────────────────────────────────────────
  // Fetch all workshops for the event (OPEN + CLOSED shown; OPEN can be ranked)
  const workshopsQuery = useWorkshops(
    computed(() => {
      const ev = toValue(eventId)
      return ev ? { event: ev, page_size: 200 } : undefined
    }),
  )

  const submissionQuery = useWorkshopInterestSubmissions(
    computed(() => {
      const ev = toValue(eventId)
      const att = toValue(attendeeId)
      return ev && att ? { event: ev, attendee: att } : undefined
    }),
  )

  // ─── Mutations ─────────────────────────────────────────────────────────────
  const createMutation = useCreateWorkshopInterestSubmission()
  const updateMutation = useUpdateWorkshopInterestSubmission()
  const finaliseMutation = useFinaliseInterestSubmission()
  const unfinaliseMutation = useUnfinaliseInterestSubmission()

  // ─── Local state ───────────────────────────────────────────────────────────
  // rankedIds is the source-of-truth for the current ranking order.
  const rankedIds = ref<number[]>([])
  const isDirty = ref(false)
  const isSaving = ref(false)

  const allWorkshops = computed<WorkshopList[]>(
    () => workshopsQuery.data.value?.data?.results ?? [],
  )

  // Only OPEN workshops can be ranked; CLOSED are shown read-only
  const availableWorkshops = computed<WorkshopList[]>(
    () => allWorkshops.value.filter(w => w.status === 'OPEN'),
  )

  const closedWorkshops = computed<WorkshopList[]>(
    () => allWorkshops.value.filter(w => w.status === 'CLOSED'),
  )

  // The existing submission (one per attendee×event)
  const existingSubmission = computed(
    () => submissionQuery.data.value?.data?.results?.[0] ?? null,
  )

  const isFinalised = computed(() => existingSubmission.value?.is_finalised ?? false)
  const submissionId = computed(() => existingSubmission.value?.submission_id ?? null)

  // Seed ranked IDs from server data once loaded
  watch(
    existingSubmission,
    (sub) => {
      if (sub && !isDirty.value) {
        rankedIds.value = [...sub.ranks].sort((a, b) => a.rank - b.rank).map(r => r.workshop)
      }
    },
    { immediate: true },
  )

  // ─── Derived lists ─────────────────────────────────────────────────────────
  const rankedWorkshops = computed<WorkshopList[]>(() => {
    return rankedIds.value
      .map(id => availableWorkshops.value.find(w => w.id === id))
      .filter((w): w is WorkshopList => w !== undefined)
  })

  const unrankedWorkshops = computed<WorkshopList[]>(() => {
    const ranked = new Set(rankedIds.value)
    return availableWorkshops.value.filter(w => !ranked.has(w.id))
  })

  // ─── Drag operations ───────────────────────────────────────────────────────

  function addToRanked(workshopId: number) {
    if (!rankedIds.value.includes(workshopId)) {
      rankedIds.value = [...rankedIds.value, workshopId]
      isDirty.value = true
    }
  }

  function removeFromRanked(workshopId: number) {
    rankedIds.value = rankedIds.value.filter(id => id !== workshopId)
    isDirty.value = true
  }

  function reorder(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return
    const arr = [...rankedIds.value]
    const [item] = arr.splice(fromIndex, 1)
    arr.splice(toIndex, 0, item)
    rankedIds.value = arr
    isDirty.value = true
  }

  // ─── Persist ───────────────────────────────────────────────────────────────

  async function saveRanks(): Promise<string | null> {
    const ev = String(toValue(eventUUID))
    const att = String(toValue(attendeeId))
    if (!ev || !att) return null

    const ranks = rankedIds.value.map((workshopId, index) => ({
      workshop: workshopId,
      rank: index + 1,
    }))

    isSaving.value = true
    try {
      if (submissionId.value) {
        await updateMutation.mutateAsync({
          submissionId: submissionId.value,
          body: { event: ev, attendee: att, ranks },
        })
        isDirty.value = false
        return submissionId.value
      } else {
        const res = await createMutation.mutateAsync({ event: ev, attendee: att, ranks })
        isDirty.value = false
        return (res.data as any)?.submission_id ?? null
      }
    } finally {
      isSaving.value = false
    }
  }

  async function finalise() {
    let sid = submissionId.value
    if (!sid) {
      sid = await saveRanks()
    }
    if (!sid) throw new Error('No submission to finalise: could not create or find submission ID')
    isSaving.value = true
    try {
      await finaliseMutation.mutateAsync(sid)
    } finally {
      isSaving.value = false
    }
  }

  async function unfinalise() {
    const sid = submissionId.value
    if (!sid) return
    isSaving.value = true
    try {
      await unfinaliseMutation.mutateAsync(sid)
    } finally {
      isSaving.value = false
    }
  }

  return {
    // Data
    availableWorkshops,
    closedWorkshops,
    rankedWorkshops,
    unrankedWorkshops,
    existingSubmission,
    isFinalised,
    isDirty,
    // Loading states
    isLoadingWorkshops: workshopsQuery.isLoading,
    isLoadingSubmission: submissionQuery.isLoading,
    isSaving,
    // Operations
    addToRanked,
    removeFromRanked,
    reorder,
    saveRanks,
    finalise,
    unfinalise,
  }
}
