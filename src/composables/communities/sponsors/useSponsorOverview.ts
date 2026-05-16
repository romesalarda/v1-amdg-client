import type { ComputedRef, Ref } from 'vue'
import { computed, ref, watch } from 'vue'
import {
  useOrganisationInboundSponsors,
  useOrganisationOutboundSponsors,
  useOrganisationSponsorFlowStatistics,
} from '~/composables/resources/organisation/organisationSponsorInvites'
import type { EventSponsorLedger } from '~/api/types.gen'

export function useSponsorOverview(
  organisationId: Ref<string> | ComputedRef<string>,
  selectedEventId: Ref<string> | ComputedRef<string>,
) {
  const ledgerSearch = ref('')
  const ledgerUseSelectedEvent = ref(false)
  const ledgerPageSize = 6
  const inboundPage = ref(1)
  const outboundPage = ref(1)

  watch(ledgerSearch, () => {
    inboundPage.value = 1
    outboundPage.value = 1
  })

  const ledgerEventId = computed(() => {
    if (!ledgerUseSelectedEvent.value) return undefined
    return selectedEventId.value || undefined
  })

  const inboundLedgerQuery = computed(() => ({
    organisation_id: organisationId.value,
    search: ledgerSearch.value.trim() || undefined,
    page: inboundPage.value,
    page_size: ledgerPageSize,
    ordering: '-added_at',
    event_id: ledgerEventId.value,
  }))

  const outboundLedgerQuery = computed(() => ({
    organisation_id: organisationId.value,
    search: ledgerSearch.value.trim() || undefined,
    page: outboundPage.value,
    page_size: ledgerPageSize,
    ordering: '-added_at',
    event_id: ledgerEventId.value,
  }))

  const { data: inboundResponse, isLoading: isLoadingInbound } = useOrganisationInboundSponsors(inboundLedgerQuery)
  const { data: outboundResponse, isLoading: isLoadingOutbound } = useOrganisationOutboundSponsors(outboundLedgerQuery)

  const inboundSponsors = computed<EventSponsorLedger[]>(() => inboundResponse.value?.rows || [])
  const outboundSponsors = computed<EventSponsorLedger[]>(() => outboundResponse.value?.rows || [])
  const inboundCount = computed(() => inboundResponse.value?.count || 0)
  const outboundCount = computed(() => outboundResponse.value?.count || 0)

  const { data: sponsorFlowResponse, isLoading: isLoadingSponsorFlow } = useOrganisationSponsorFlowStatistics(
    computed(() => ({
      organisation_id: organisationId.value,
      event_id: ledgerEventId.value,
      format: 'raw',
    })),
  )

  const sponsorFlowStats = computed(() => sponsorFlowResponse.value)

  const inboundSummary = computed(() => parseSummaryStats(sponsorFlowStats.value?.inbound_summary))
  const outboundSummary = computed(() => parseSummaryStats(sponsorFlowStats.value?.outbound_summary))
  const netSummary = computed(() => parseNetSummary(sponsorFlowStats.value?.net_summary))

  const netCompletedRevenueDelta = computed(() => netSummary.value.completed_revenue_delta)
  const netSponsorDelta = computed(() => netSummary.value.sponsor_count_delta)

  const inboundSponsorChart = computed(() => {
    const rows = sponsorFlowStats.value?.inbound_by_sponsor as Array<Record<string, unknown>> | undefined
    if (!rows) return []
    return rows
      .map(item => ({
        name: String(item.organisation_title || 'Unknown'),
        value: asNumber(item.committed_amount),
      }))
      .filter(item => item.value > 0)
  })

  const inboundEventChart = computed(() => {
    const rows = sponsorFlowStats.value?.inbound_by_event as Array<Record<string, unknown>> | undefined
    if (!rows) return []
    return rows.map(item => ({
      label: String(item.event_title || 'Unknown'),
      value: asNumber(item.sponsor_count),
    }))
  })

  const outboundEventChart = computed(() => {
    const rows = sponsorFlowStats.value?.outbound_by_event as Array<Record<string, unknown>> | undefined
    if (!rows) return []
    return rows.map(item => ({
      label: String(item.event_title || 'Unknown'),
      value: asNumber(item.sponsor_count),
    }))
  })

  return {
    // state
    ledgerSearch,
    ledgerUseSelectedEvent,
    ledgerPageSize,
    inboundPage,
    outboundPage,
    // loading
    isLoadingInbound,
    isLoadingOutbound,
    isLoadingSponsorFlow,
    // data
    inboundSponsors,
    outboundSponsors,
    inboundCount,
    outboundCount,
    inboundSummary,
    outboundSummary,
    netSummary,
    netCompletedRevenueDelta,
    netSponsorDelta,
    // charts
    inboundSponsorChart,
    inboundEventChart,
    outboundEventChart,
  }
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number') return value
  const parsed = Number(value)
  return Number.isNaN(parsed) ? fallback : parsed
}

function parseNetSummary(source?: Record<string, unknown> | null) {
  const summary = source || {}
  return {
    sponsor_count_delta: asNumber(summary.sponsor_count_delta),
    commitment_amount_delta: asNumber(summary.commitment_amount_delta),
    completed_revenue_delta: asNumber(summary.completed_revenue_delta),
    average_commitment_per_sponsor_delta: asNumber(summary.average_commitment_per_sponsor_delta),
    average_completed_revenue_per_sponsor_delta: asNumber(summary.average_completed_revenue_per_sponsor_delta),
  }
}

function parseSummaryStats(source?: Record<string, unknown> | null) {
  const summary = source || {}
  return {
    total_sponsors: asNumber(summary.total_sponsors),
    unique_organisations: asNumber(summary.unique_organisations),
    commitment_amount: asNumber(summary.commitment_amount),
    completed_revenue: asNumber(summary.completed_revenue),
    pending_revenue: asNumber(summary.pending_revenue),
    average_commitment_per_sponsor: asNumber(summary.average_commitment_per_sponsor),
    average_completed_revenue_per_sponsor: asNumber(summary.average_completed_revenue_per_sponsor),
    total_payments: asNumber(summary.total_payments),
    completed_payments: asNumber(summary.completed_payments),
    pending_payments: asNumber(summary.pending_payments),
    failed_payments: asNumber(summary.failed_payments),
    cancelled_payments: asNumber(summary.cancelled_payments),
  }
}
