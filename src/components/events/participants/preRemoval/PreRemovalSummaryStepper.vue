<template>
  <div class="p-6">
    <div class="mb-4 flex items-start justify-between gap-5">
      <div>
        <h3 class="text-xl font-bold text-gray-900">Pre-removal summary</h3>
        <p class="text-lg text-gray-500">
          {{ attendeeLabel }}
        </p>
      </div>
      <UButton
        color="gray"
        variant="ghost"
        icon="i-heroicons-x-mark"
        @click="$emit('close')"
      />
    </div>

    <div class="mb-4">
      <UStepper
        v-model="activeStepIndex"
        :items="steps"
        :linear="false"
      />
    </div>

    <div v-if="loading" class="space-y-2">
      <div v-for="i in 4" :key="i" class="h-12 rounded-lg bg-gray-100 animate-pulse" />
    </div>

    <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      Unable to load pre-removal summary. Please try again.
    </div>

    <div v-else-if="summary" class="space-y-4">
      <div v-if="activeStep === 'overview'" class="space-y-3">
        

        <div
          :class="[
            'rounded-lg border p-4 text-sm',
            summary.can_delete
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-amber-200 bg-amber-50 text-amber-800'
          ]"
        >
          <div class="flex items-start gap-2">
            <UIcon
              :name="summary.can_delete ? 'i-heroicons-check-circle' : 'i-heroicons-exclamation-triangle'"
              class="mt-0.5 h-5 w-5 flex-shrink-0"
            />
            <div class="space-y-1">
              <p class="font-semibold">
                {{ summary.can_delete ? 'Deletion review complete' : 'Deletion is still blocked' }}
              </p>
              <p>
                {{ summary.can_delete
                  ? 'The final delete action is available on the last step.'
                  : 'Resolve active ticket and unresolved order blockers before the final irreversible delete action is enabled.' }}
              </p>
            </div>
          </div>
        </div>

        <div v-if="summary.suggested_actions.length" class="rounded-lg border border-gray-200 bg-white p-4">
          <h4 class="text-xs font-semibold uppercase text-gray-500">Suggested actions</h4>
          <ul class="mt-2 space-y-1 text-sm text-gray-700">
            <li v-for="action in summary.suggested_actions" :key="action.code">• {{ action.message }}</li>
          </ul>
        </div>

        <div class="grid gap-4 lg:grid-cols-2">
          <div class="rounded-lg border border-gray-200 bg-white p-4">
            <div class="mb-3 flex items-center gap-2">
              <UIcon name="i-heroicons-link" class="h-4 w-4 text-indigo-600" />
              <h4 class="text-sm font-semibold text-gray-900">Linked payments</h4>
              <UBadge color="indigo" variant="soft" size="xs">{{ linkedPaymentItems.length }}</UBadge>
            </div>

            <div v-if="linkedPaymentItems.length" class="space-y-2">
              <div
                v-for="payment in linkedPaymentItems"
                :key="`overview-linked-${payment.key}`"
                class="rounded-lg border border-gray-200 bg-gray-50 p-3"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0 space-y-1">
                    <div class="flex items-center gap-2">
                      <span class="truncate text-sm font-mono text-gray-900">{{ payment.item.payment_reference || payment.item.payment_id || 'Payment' }}</span>
                      <UBadge v-if="payment.item.payment_status" color="gray" variant="soft" size="xs">{{ payment.item.payment_status }}</UBadge>
                    </div>
                    <p class="text-xs text-gray-600">
                      {{ payment.item.amount || 'No amount' }}
                      <span v-if="payment.item.currency">({{ payment.item.currency }})</span>
                      <span v-if="payment.item.method_title"> • {{ payment.item.method_title }}</span>
                    </p>
                  </div>
                  <UButton
                    color="blue"
                    variant="soft"
                    size="xs"
                    :disabled="payment.item.can_request_refund === false"
                    @click="$emit('requestRefund', payment.item)"
                  >
                    Refund
                  </UButton>
                </div>
              </div>
            </div>

            <div v-else class="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
              No linked package payments on this page.
            </div>
          </div>

          <div class="rounded-lg border border-gray-200 bg-white p-4">
            <div class="mb-3 flex items-center gap-2">
              <UIcon name="i-heroicons-arrow-path-rounded-square" class="h-4 w-4 text-amber-600" />
              <h4 class="text-sm font-semibold text-gray-900">Active refunds</h4>
              <UBadge color="amber" variant="soft" size="xs">{{ activeRefundEntries.length }}</UBadge>
            </div>

            <div v-if="activeRefundEntries.length" class="space-y-2">
              <div
                v-for="refund in activeRefundEntries"
                :key="refund.key"
                class="rounded-lg border border-amber-200 bg-amber-50 p-3"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0 space-y-1">
                    <div class="flex items-center gap-2">
                      <span class="truncate text-sm font-semibold text-gray-900">{{ refund.tracking_reference || refund.refund_id }}</span>
                      <UBadge color="amber" variant="soft" size="xs">{{ refund.verification_status || 'pending' }}</UBadge>
                    </div>
                    <p class="text-xs text-gray-700">
                      {{ refund.amount || 'No amount' }}
                      <span v-if="refund.payment_reference"> • {{ refund.payment_reference }}</span>
                    </p>
                    <p v-if="refund.reason" class="text-xs text-gray-600">{{ refund.reason }}</p>
                  </div>
                  <UIcon name="i-heroicons-exclamation-circle" class="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                </div>
              </div>
            </div>

            <div v-else class="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
              No active package refunds on this page.
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="activeStep === 'packages'" class="space-y-3">
        <div class="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-600" v-if="!dedupedPaymentItems.length && !activeRefundEntries.length">
          <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-slate-500">
            <UIcon name="i-heroicons-currency-pound" class="h-7 w-7" />
          </div>
          <p class="mt-4 text-base font-black uppercase tracking-[0.22em] text-slate-500">No Payments</p>
          <p class="mt-2 text-sm text-slate-500">This attendee has no payments blocking deletion</p>
        </div>

        <div
          v-for="payment in dedupedPaymentItems"
          :key="payment.key"
          class="rounded-lg border border-gray-200 bg-white p-3"
        >
          <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div class="space-y-1 hover:cursor-pointer hover:bg-gray-50 transition" @click="router.push(`/events/${eventQueryValue}/m/payments/list?search=${payment.item.payment_reference}`)">
              <div class="flex flex-wrap items-center gap-2" 
>
                <UIcon name="i-heroicons-cube-transparent" class="h-4 w-4 text-indigo-600" />
                <span class="text-sm font-semibold text-gray-900">{{ payment.item.payment_reference || payment.item.payment_id || 'Payment' }}</span>
                <UBadge v-if="payment.item.payment_descriptor" color="blue" variant="soft" size="xs">{{ payment.item.payment_descriptor }}</UBadge>
                <UBadge v-if="payment.item.payment_status" color="gray" variant="soft" size="xs">{{ payment.item.payment_status.replace("_", " ").toLowerCase() }}</UBadge>
              </div>

              <p class="text-xs text-gray-600">
                {{ payment.item.amount || 'No amount' }}
                <span v-if="payment.item.currency">({{ payment.item.currency }})</span>
                <span v-if="payment.item.method_title"> • {{ payment.item.method_title }}</span>
              </p>

              <div class="flex flex-wrap gap-1">
                <UBadge
                  v-for="source in payment.sources"
                  :key="`${payment.key}-${source}`"
                  color="indigo"
                  variant="soft"
                  size="xs"
                >
                  {{ paymentSourceLabel(source) }}
                </UBadge>
              </div>
            </div>

            <div class="flex flex-col gap-2 md:items-end">
              <UButton
                color="blue"
                variant="solid"
                size="sm"
                :disabled="payment.item.can_request_refund === false"
                :class="payment.item.can_request_refund ? '' : 'cursor-not-allowed opacity-50'"
                @click="$emit('requestRefund', payment.item)"
              >
                Request refund
              </UButton>
              <p
                v-if="payment.item.can_request_refund === false && payment.item.refund_block_reason"
                class="max-w-xs text-xs text-amber-700"
              >
                {{ payment.item.refund_block_reason }}
              </p>
            </div>
          </div>
        </div>

        <div v-for="blocker in packageBlockers" :key="`page-${blocker.code}`">
          <div v-if="blocker.pagination" class="rounded-lg border border-gray-200 bg-gray-50 p-2 text-xs text-gray-600">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span>
                {{ paymentSourceLabel(blocker.code) }}: page {{ blocker.pagination.page }} of {{ blocker.pagination.total_pages }}
              </span>
              <div class="flex items-center gap-1">
                <UButton
                  size="2xs"
                  variant="ghost"
                  color="gray"
                  :disabled="!blocker.pagination.has_previous"
                  @click="emitPage(blocker.pagination.previous_page)"
                >
                  Prev
                </UButton>
                <UButton
                  size="2xs"
                  variant="ghost"
                  color="gray"
                  :disabled="!blocker.pagination.has_next"
                  @click="emitPage(blocker.pagination.next_page)"
                >
                  Next
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="activeStep === 'tickets'" class="space-y-3">
        <div class="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-600" v-if="!activeTicketItems.length">
          <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-slate-500">
            <UIcon name="i-heroicons-ticket" class="h-7 w-7" />
          </div>
          <p class="mt-4 text-base font-black uppercase tracking-[0.22em] text-slate-500">No Tickets</p>
          <p class="mt-2 text-sm text-slate-500">This attendee has no tickets blocking deletion</p>
        </div>

        <PreRemovalTicketCard
          v-for="(ticketItem, idx) in activeTicketItems"
          :key="String(ticketItem.ticket_id || ticketItem.ticket_code || idx)"
          :item="ticketItem"
        />

        <div v-if="activeTicketsBlocker?.pagination" class="rounded-lg border border-gray-200 bg-gray-50 p-2 text-xs text-gray-600">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span>
              Active tickets: page {{ activeTicketsBlocker.pagination.page }} of {{ activeTicketsBlocker.pagination.total_pages }}
            </span>
            <div class="flex items-center gap-1">
              <UButton
                size="2xs"
                variant="ghost"
                color="gray"
                :disabled="!activeTicketsBlocker.pagination.has_previous"
                @click="emitPage(activeTicketsBlocker.pagination.previous_page)"
              >
                Prev
              </UButton>
              <UButton
                size="2xs"
                variant="ghost"
                color="gray"
                :disabled="!activeTicketsBlocker.pagination.has_next"
                @click="emitPage(activeTicketsBlocker.pagination.next_page)"
              >
                Next
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="activeStep === 'orders'" class="space-y-3">
        <!-- <div v-if="!orderItems.length" class="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
          No unresolved order blockers on this page.
        </div> -->
        <div class="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-600" v-if="!orderItems.length">
          <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-slate-500">
            <UIcon name="i-heroicons-shopping-bag" class="h-7 w-7" />
          </div>
          <p class="mt-4 text-base font-black uppercase tracking-[0.22em] text-slate-500">No Orders</p>
          <p class="mt-2 text-sm text-slate-500">This attendee has no orders blocking deletion</p>
        </div>

        <PreRemovalOrderCard
          v-for="(orderItem, idx) in orderItems"
          :key="String(orderItem.order_id || orderItem.order_reference || idx)"
          :item="orderItem"
          :event-query-value="eventQueryValue"
        />

        <div v-if="ordersBlocker?.pagination" class="rounded-lg border border-gray-200 bg-gray-50 p-2 text-xs text-gray-600">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span>
              Orders: page {{ ordersBlocker.pagination.page }} of {{ ordersBlocker.pagination.total_pages }}
            </span>
            <div class="flex items-center gap-1">
              <UButton
                size="2xs"
                variant="ghost"
                color="gray"
                :disabled="!ordersBlocker.pagination.has_previous"
                @click="emitPage(ordersBlocker.pagination.previous_page)"
              >
                Prev
              </UButton>
              <UButton
                size="2xs"
                variant="ghost"
                color="gray"
                :disabled="!ordersBlocker.pagination.has_next"
                @click="emitPage(ordersBlocker.pagination.next_page)"
              >
                Next
              </UButton>
            </div>
          </div>
        </div>

      </div>

      <div v-else-if="activeStep === 'final'" class="space-y-4 max-w-lg mx-auto">
        <!-- Cancel action -->
        <div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div class="flex items-start gap-3">
            <div class="rounded-full bg-blue-100 p-2 flex-shrink-0">
              <UIcon name="i-heroicons-x-circle" class="h-5 w-5 text-blue-700" />
            </div>
            <div class="min-w-0 flex-1 space-y-3">
              <div>
                <h4 class="text-sm font-bold uppercase tracking-wide text-blue-800">Alternative: cancel attendee</h4>
                <p class="mt-1 text-sm text-blue-700">
                  Mark this attendee as cancelled to preserve historical records while removing them from active participation. This can be reversed.
                </p>
              </div>
              <div v-if="attendeeName && summary?.can_delete && !isCancelled" class="space-y-1.5">
                <label class="text-xs font-semibold text-blue-800">
                  Type <span class="font-mono font-bold">{{ attendeeName }}</span> to confirm cancellation
                </label>
                <UInput
                  v-model="cancelConfirmInput"
                  size="sm"
                  placeholder="Type attendee name to confirm"
                  :ui="{ base: 'w-full' }"
                />
              </div>
              <UButton
                v-if="!isCancelled"
                color="blue"
                :disabled="cancelling || isCancelled || !summary?.can_delete || (!!attendeeName && !cancelNameConfirmed)"
                :loading="cancelling"
                @click="$emit('confirmCancel')"
              >
                Set attendee status to CANCELLED
              </UButton>
              <div v-else class="flex items-center gap-2 text-sm text-green-700">
                <UIcon name="i-heroicons-check-circle" class="h-4 w-4 flex-shrink-0" />
                Attendee is cancelled
              </div>
            </div>
          </div>
        </div>

        <!-- Danger zone: permanent delete -->
        <div class="rounded-xl border-2 border-red-400 bg-red-50 p-4 shadow-sm">
          <div class="mb-3 flex items-center gap-2">
            <span class="rounded bg-red-600 px-2 py-0.5 text-xs font-bold uppercase tracking-widest text-white">Danger zone</span>
            <span class="text-xs text-red-600 font-medium">Irreversible action</span>
          </div>
          <div class="flex items-start gap-3">
            <div class="rounded-full bg-red-200 p-2 flex-shrink-0">
              <UIcon name="i-heroicons-exclamation-triangle-solid" class="h-5 w-5 text-red-700" />
            </div>
            <div class="min-w-0 flex-1 space-y-3">
              <div>
                <h4 class="text-sm font-bold uppercase tracking-wide text-red-800">Permanently delete attendee</h4>
                <p class="mt-1 text-sm text-red-700">
                  This will permanently remove the attendee record. This action <strong>cannot be undone</strong> and should only be done after every blocker above has been fully reviewed.
                </p>
              </div>
              <div class="rounded-lg border border-red-300 bg-white/80 p-3 text-xs text-red-700 space-y-1">
                <div class="flex items-start gap-2">
                  <UIcon name="i-heroicons-no-symbol" class="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>All attendee data, ticket assignments, and linked records will be permanently deleted.</span>
                </div>
                <div class="flex items-start gap-2">
                  <UIcon name="i-heroicons-no-symbol" class="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>This cannot be restored from this screen.</span>
                </div>
              </div>
              <div v-if="summary?.can_delete" class="space-y-1.5">
                <label class="text-xs font-semibold text-red-800">
                  Type <span class="font-mono font-bold">{{ attendeeName || 'attendee name' }}</span> to confirm permanent deletion
                </label>
                <UInput
                  v-model="deleteConfirmInput"
                  size="sm"
                  :placeholder="`Type &quot;${attendeeName || 'attendee name'}&quot; to confirm`"
                  :ui="{ base: 'w-full border-red-300 focus:border-red-500 focus:ring-red-500' }"
                />
                <p v-if="deleteConfirmInput && !deleteNameConfirmed" class="text-xs text-red-600">
                  Name does not match. Please type exactly: <span class="font-mono font-semibold">{{ attendeeName }}</span>
                </p>
              </div>
              <UButton
                color="red"
                variant="solid"
                :disabled="!summary?.can_delete || deleting || !deleteNameConfirmed"
                :loading="deleting"
                @click="$emit('confirmDelete')"
              >
                <UIcon name="i-heroicons-trash" class="mr-1 h-4 w-4" />
                Delete attendee permanently
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type {
  AttendeePreRemovalSummary,
  AttendeePreRemovalBlockerItem,
  AttendeePreRemovalRefundSummary,
} from '~/composables/resources/attendee/attendees'
import PreRemovalTicketCard from './PreRemovalTicketCard.vue'
import PreRemovalOrderCard from './PreRemovalOrderCard.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

type StepKey = 'overview' | 'packages' | 'tickets' | 'orders' | 'final'

const props = defineProps<{
  summary?: AttendeePreRemovalSummary
  loading: boolean
  error?: unknown
  deleting?: boolean
  cancelling?: boolean
  attendeeName?: string
  attendeeDisplayId?: string
  eventQueryValue?: string
  isCancelled?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirmDelete'): void
  (e: 'confirmCancel'): void
  (e: 'requestRefund', item: AttendeePreRemovalBlockerItem): void
  (e: 'pageChange', page: number): void
}>()

const activeStepIndex = ref(0)
const stepOrder: StepKey[] = ['overview', 'packages', 'tickets', 'orders', 'final']
const activeStep = computed<StepKey>(() => stepOrder[activeStepIndex.value] || 'overview')

const deleteConfirmInput = ref('')
const cancelConfirmInput = ref('')

const deleteNameConfirmed = computed(() =>
  !!props.attendeeName && deleteConfirmInput.value.trim() === props.attendeeName.trim(),
)
const cancelNameConfirmed = computed(() =>
  !!props.attendeeName && cancelConfirmInput.value.trim() === props.attendeeName.trim(),
)

const blockers = computed(() => props.summary?.blockers || [])
const blockingCodes = ['active_tickets', 'unresolved_orders']
const blockingBlockers = computed(() => blockers.value.filter(b => blockingCodes.includes(b.code)))

const packageBlockers = computed(() => blockers.value.filter(b => ['outstanding_payments', 'linked_payments', 'active_refunds'].includes(b.code)))
const activeTicketsBlocker = computed(() => blockers.value.find(b => b.code === 'active_tickets'))
const ordersBlocker = computed(() => blockers.value.find(b => b.code === 'unresolved_orders'))

const activeTicketItems = computed(() => (activeTicketsBlocker.value?.items || []).filter(item => item.type === 'ticket'))
const orderItems = computed(() => (ordersBlocker.value?.items || []).filter(item => item.type === 'order'))

const dedupedPaymentItems = computed(() => {
  const byKey = new Map<string, { key: string; item: AttendeePreRemovalBlockerItem; sources: string[] }>()

  for (const blocker of packageBlockers.value) {
    for (const item of blocker.items || []) {
      if (item.type !== 'payment' && !item.payment_id && !item.payment_reference) {
        continue
      }

      const key = item.payment_id || item.payment_reference || `${item.booking_id || 'booking'}-${item.amount || 'amount'}-${item.payment_status || 'status'}`
      if (!byKey.has(key)) {
        byKey.set(key, { key, item, sources: [blocker.code] })
      } else {
        const existing = byKey.get(key)!
        if (!existing.sources.includes(blocker.code)) {
          existing.sources.push(blocker.code)
        }
      }
    }
  }

  return Array.from(byKey.values())
})

const linkedPaymentItems = computed(() =>
  dedupedPaymentItems.value.filter(payment => payment.sources.includes('linked_payments')),
)

const activeRefundEntries = computed(() => {
  const refunds = new Map<string, AttendeePreRemovalRefundSummary & { key: string; payment_reference?: string | null }>()

  for (const blocker of packageBlockers.value) {
    if (blocker.code !== 'active_refunds') {
      continue
    }

    for (const item of blocker.items || []) {
      for (const refund of item.active_refunds || []) {
        const key = refund.refund_id || refund.tracking_reference || `${item.payment_id || item.payment_reference || 'payment'}-${refund.amount || 'amount'}`
        if (!refunds.has(key)) {
          refunds.set(key, {
            ...refund,
            key,
            payment_reference: item.payment_reference || item.payment_id,
          })
        }
      }
    }
  }

  return Array.from(refunds.values())
})

const steps = computed(() => [
  {
    key: 'overview' as StepKey,
    label: 'Overview',
    icon: 'i-heroicons-list-bullet',
    count: blockingBlockers.value.length,
  },
  {
    key: 'packages' as StepKey,
    label: 'Package Payments',
    icon: 'i-heroicons-cube-transparent',
    count: packageBlockers.value.reduce((sum, blocker) => sum + blocker.count, 0),
  },
  {
    key: 'tickets' as StepKey,
    label: 'Active Tickets',
    icon: 'i-heroicons-ticket',
    count: activeTicketsBlocker.value?.count || 0,
  },
  {
    key: 'orders' as StepKey,
    label: 'Orders',
    icon: 'i-heroicons-shopping-bag',
    count: ordersBlocker.value?.count || 0,
  },
  {
    key: 'final' as StepKey,
    label: 'Final Action',
    icon: 'i-heroicons-exclamation-triangle',
    count: props.summary?.can_delete ? 0 : blockingBlockers.value.length,
  },
])

const attendeeLabel = computed(() => {
  if (props.attendeeName || props.attendeeDisplayId) {
    return `${props.attendeeName || 'Attendee'} (${props.attendeeDisplayId || 'N/A'})`
  }
  return 'Review blockers before deleting this attendee.'
})

function paymentSourceLabel(code: string) {
  const labels: Record<string, string> = {
    outstanding_payments: 'Outstanding payment',
    linked_payments: 'Linked payment',
    active_refunds: 'Active refund',
  }
  return labels[code] || code
}

function emitPage(page?: number | null) {
  if (!page || page < 1) {
    return
  }
  emit('pageChange', page)
}
</script>
