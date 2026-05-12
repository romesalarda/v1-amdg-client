<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('close')" />
      <div class="relative w-full max-w-3xl bg-white border border-deep-navy/10 rounded-2xl shadow-drawn flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="flex items-center gap-3 px-6 py-5 border-b border-navy-50 flex-shrink-0">
          <span class="material-symbols-outlined text-blue-600">undo</span>
          <div class="flex-1">
            <h3 class="text-sm font-black text-primary uppercase tracking-widest">Refund Request Details</h3>
            <p class="text-xs text-gray-500 mt-0.5 font-mono">{{ refund.tracking_reference }}</p>
          </div>
          <UBadge :color="getRefundStatusColor(refund.verification_status || 'pending') as any" variant="soft" size="lg">
            {{ getRefundStatusLabel(refund.verification_status || 'pending') }}
          </UBadge>
          <button
            @click="$emit('close')"
            class="p-1.5 text-navy-400 hover:text-navy-700 hover:bg-mist-blue rounded-lg transition-colors"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Content -->
        <div class="p-6 overflow-y-auto flex-1 space-y-6">
          <!-- Basic Info -->
          <section>
            <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="material-symbols-outlined text-sm">info</span>
              Refund Information
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="text-xs text-gray-500 mb-1">Refund ID</div>
                <div class="font-mono text-sm font-semibold">{{ refund.refund_id }}</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="text-xs text-gray-500 mb-1">Tracking Reference</div>
                <div class="font-mono text-sm font-semibold">{{ refund.tracking_reference }}</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="text-xs text-gray-500 mb-1">Amount</div>
                <div class="text-lg font-bold text-blue-600">£{{ parseFloat(refund.amount || '0').toFixed(2) }}</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="text-xs text-gray-500 mb-1">Request Type</div>
                <UBadge :color="refund.is_partial ? 'amber' : 'blue'" variant="soft" size="sm">
                  {{ refund.is_partial ? 'Partial Refund' : 'Full Refund' }}
                </UBadge>
              </div>
            </div>
          </section>

          <!-- Reason -->
          <section>
            <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="material-symbols-outlined text-sm">description</span>
              Refund Reason
            </h4>
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p class="text-sm text-gray-900">{{ refund.reason || 'No reason provided' }}</p>
            </div>
          </section>

          <!-- Related Payment -->
          <section v-if="refund.payment">
            <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="material-symbols-outlined text-sm">payments</span>
              Related Payment
            </h4>
            <div class="bg-green-50 rounded-lg p-4 border border-green-200">
              <div class="flex justify-between items-start">
                <div>
                  <div class="text-xs text-green-700 mb-1">Payment Reference</div>
                  <div class="font-mono text-sm font-semibold text-green-900">
                    {{ refund.payment_reference }}
                  </div>
                  <div class="text-xs text-gray-600 mt-2">
                    Amount: £{{ parseFloat(refund.amount || '0').toFixed(2) }}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Request Details -->
          <section>
            <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="material-symbols-outlined text-sm">person</span>
              Request Details
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="text-xs text-gray-500 mb-1">Requested By</div>
                <div class="text-sm font-semibold text-gray-900">
                  {{ refund.requested_by_name || 'N/A' }}
                </div>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="text-xs text-gray-500 mb-1">Requested At</div>
                <div class="text-sm font-semibold text-gray-900">
                  {{ formatDateTime(refund.requested_at) }}
                </div>
              </div>
              <div v-if="refund.processed_by" class="bg-gray-50 rounded-lg p-4">
                <div class="text-xs text-gray-500 mb-1">Processed By</div>
                <div class="text-sm font-semibold text-gray-900">
                  {{ refund.processed_by_name }}
                </div>
              </div>
              <div v-if="refund.processed_at" class="bg-gray-50 rounded-lg p-4">
                <div class="text-xs text-gray-500 mb-1">Processed At</div>
                <div class="text-sm font-semibold text-gray-900">
                  {{ formatDateTime(refund.processed_at) }}
                </div>
              </div>
            </div>
          </section>

          <!-- Associations -->
          <section v-if="refund.associations && refund.associations.length > 0">
            <h4 class="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700">
              <span class="material-symbols-outlined text-sm">link</span>
              Refund Associations
            </h4>
            <div class="space-y-3">
              <article
                v-for="assoc in refund.associations"
                :key="assoc.id"
                class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm"
              >
                <div class="flex items-start justify-between gap-4">
                  <div class="min-w-0 flex-1">
                    <div class="text-sm font-semibold text-slate-900">
                      {{ assoc.description || 'Refund association' }}
                    </div>
                    <div class="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wide">
                      <span class="rounded-full bg-slate-200 px-2.5 py-1 text-slate-700">
                        Amount: £{{ parseFloat(assoc.amount || '0').toFixed(2) }}
                      </span>
                      <span
                        v-if="assoc.metadata?.scope"
                        class="rounded-full bg-blue-100 px-2.5 py-1 text-blue-800"
                      >
                        Scope: {{ normalizeLabel(assoc.metadata.scope) }}
                      </span>
                      <span
                        v-if="assoc.metadata?.entity"
                        class="rounded-full bg-slate-200 px-2.5 py-1 text-slate-700"
                      >
                        Entity: {{ normalizeLabel(assoc.metadata.entity) }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="mt-4 space-y-4">
                  <!-- Hybrid / targeted order-item card -->
                  <div
                    v-if="isHybridOrderItemAssoc(assoc)"
                    class="rounded-xl border border-slate-200 bg-white p-4"
                  >
                    <div class="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Refunded Item(s)</div>
                    <div class="grid gap-3 md:grid-cols-2">
                      <!-- order_item_id present: fetch full details -->
                      <RefundHybridOrderItemCard
                        v-if="assoc.metadata?.order_item_id"
                        :order-item-id="Number(assoc.metadata.order_item_id)"
                        :quantity="assoc.metadata?.quantity ?? undefined"
                        :amount="assoc.metadata?.amount ?? assoc.amount ?? undefined"
                      />
                      <!-- Legacy records without order_item_id: show variant metadata inline -->
                      <div v-else class="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <div class="h-12 w-12 shrink-0 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-300">
                          <UIcon name="i-heroicons-photo" class="h-5 w-5" />
                        </div>
                        <div class="min-w-0 flex-1">
                          <div class="truncate text-sm font-semibold text-slate-900">Variant {{ assoc.metadata?.variant_id || 'N/A' }}</div>
                          <div class="mt-1 flex items-center gap-2 text-xs text-slate-600">
                            <span>{{ assoc.metadata?.quantity ?? 1 }}x</span>
                            <span class="font-semibold">£{{ parseFloat(String(assoc.amount || '0')).toFixed(2) }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Standard order association (non-hybrid) -->
                  <div
                    v-else-if="isAssociatedOrder(assoc) && relatedOrder"
                    class="rounded-xl border border-slate-200 bg-white p-4 hover:bg-blue-50 cursor-pointer transition-colors"
                    @click="navigateTo(`/events/${eventIdFromRoute}/m/shop/orders/${relatedOrder.order_id}/detail`)"
                  >
                    <div class="flex items-center justify-between gap-3">
                      <div>
                        <div class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                          Related Order
                        </div>
                        <div class="mt-1 text-sm font-semibold text-slate-900">
                          {{ relatedOrder.order_reference_id || relatedOrder.order_id || 'Order' }}
                        </div>
                        <div class="mt-1 text-xs text-slate-500">
                          {{ relatedOrder.customer_name || 'N/A' }}
                        </div>
                      </div>
                      <UBadge
                        :color="getRefundStatusColor(relatedOrder.status || 'pending') as any"
                        variant="soft"
                        size="sm"
                      >
                        {{ normalizeLabel(relatedOrder.status_display || relatedOrder.status || 'pending') }}
                      </UBadge>
                    </div>

                    <div class="mt-4 grid gap-3 sm:grid-cols-1">
                      <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Order Total</div>
                        <div class="mt-1 text-lg font-black text-primary">
                          {{ relatedOrder.total_amount || 'N/A' }}
                        </div>
                        <div class="mt-1 text-xs text-slate-500">Items: {{ relatedOrder.item_count || orderItems.length || 0 }}</div>
                      </div>
                    </div>

                    <div v-if="orderItems.length > 0" class="mt-4 grid gap-3 md:grid-cols-1">
                      <article
                        v-for="(item, index) in orderItems"
                        :key="item.id || `${relatedOrder.order_id}-${index}`"
                        class="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3"
                      >
                        <div class="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                          <img
                            v-if="getOrderItemImageUrl(item)"
                            :src="resolveImageUrl(getOrderItemImageUrl(item))"
                            :alt="getOrderItemTitle(item)"
                            class="h-full w-full object-cover"
                            @error="onImageError"
                          />
                          <div v-else class="flex h-full w-full items-center justify-center text-slate-300">
                            <UIcon name="i-heroicons-photo" class="h-5 w-5" />
                          </div>
                        </div>
                        <div class="min-w-0 flex-1">
                          <div class="truncate text-sm font-semibold text-slate-900">
                            {{ getOrderItemTitle(item) }}
                          </div>
                          <div class="mt-1 text-xs text-slate-500">
                            {{ getOrderItemCode(item) }}
                          </div>
                          <div class="mt-2 flex flex-wrap gap-1.5 text-[11px] font-medium text-slate-600">
                            <span v-if="getOrderItemSize(item)" class="rounded-full bg-slate-100 px-2 py-0.5">
                              Size: {{ normalizeLabel(getOrderItemSize(item)) }}
                            </span>
                            <span v-if="getOrderItemColor(item)" class="rounded-full bg-slate-100 px-2 py-0.5">
                              Color: {{ normalizeLabel(getOrderItemColor(item)) }}
                            </span>
                            <span v-if="item.total_price" class="rounded-full bg-slate-100 px-2 py-0.5">
                              Total Price: {{ normalizeLabel(item.total_price) }}
                            </span>
                            <span v-if="item.unit_price" class="rounded-full bg-slate-100 px-2 py-0.5">
                              Unit Price: {{ normalizeLabel(item.unit_price) }}
                            </span>
                            <span v-if="item.status" class="rounded-full bg-slate-100 px-2 py-0.5">
                              Status: {{ normalizeLabel(item.status) }}
                            </span>
                          </div>
                        </div>
                      </article>
                    </div>
                  </div>

                  <!-- Hybrid ticket: simplified attendee + ticket display -->
                  <div
                    v-if="isHybridTicketAssoc(assoc)"
                    class="rounded-xl border border-slate-200 bg-white p-4"
                  >
                    <div class="flex items-center justify-between gap-4">
                      <div>
                        <div class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Ticket</div>
                        <div class="mt-1 font-mono text-sm font-semibold text-slate-900">{{ assoc.metadata?.ticket_id || 'N/A' }}</div>
                      </div>
                      <NuxtLink
                        v-if="relatedAttendee"
                        :to="`/events/${eventIdFromRoute}/m/participants/editor/${assoc.metadata?.attendee_id}`"
                        class="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        <span class="font-semibold">{{ relatedAttendee.full_name }}</span>
                        <span class="material-symbols-outlined text-base leading-none">open_in_new</span>
                      </NuxtLink>
                      <span v-else class="text-sm text-slate-400">Loading attendee…</span>
                    </div>
                  </div>

                  <!-- Standard attendee association (non-hybrid) -->
                  <div
                    v-else-if="isAssociatedAttendee(assoc) && relatedAttendee && !isHybridOrderItemAssoc(assoc)"
                    class="rounded-xl border border-slate-200 bg-white p-4 hover:bg-blue-50 cursor-pointer transition-colors"
                    @click="navigateTo(`/events/${eventIdFromRoute}/m/participants/editor/${assoc.metadata?.attendee_id}`)"
                  >
                    <div class="flex items-center justify-between gap-3">
                      <div>
                        <div class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                          Related Attendee
                        </div>
                        <div class="mt-1 text-sm font-semibold text-slate-900">
                          {{ relatedAttendee.full_name || 'Attendee' }}
                        </div>
                        <div class="mt-1 text-xs text-slate-500">
                          {{ relatedAttendee.attendee_display_id || relatedAttendee.attendee_id || 'N/A' }}
                        </div>
                      </div>
                      <img
                        :src="`https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${relatedAttendee.attendee_id}`"
                        alt="Default profile"
                        class="w-12 h-12 rounded-full object-cover"
                      />
                    </div>

                    <div class="mt-4 grid gap-3 sm:grid-cols-2">
                      <div
                        v-for="field in attendeeDetails"
                        :key="field.label"
                        class="rounded-xl border border-slate-200 bg-slate-50 p-3"
                      >
                        <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {{ field.label }}
                        </div>
                        <div class="mt-1 break-words text-sm font-semibold text-slate-900">
                          {{ field.value }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <section v-if="refund.metadata">
            <details class="group rounded-2xl border border-slate-200 bg-slate-50">
              <summary class="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 [&::-webkit-details-marker]:hidden">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-sm text-slate-600">note</span>
                  <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Processing Notes
                  </h4>
                  <UBadge color="gray" variant="soft" size="xs">JSON</UBadge>
                </div>
                <button
                  type="button"
                  :disabled="metadataCopyPending || !canUseClipboard"
                  @click.stop="copyProcessingNotes"
                  class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                  title="Copy processing notes"
                >
                  <span class="material-symbols-outlined text-sm">content_copy</span>
                  {{ metadataCopyPending ? 'Copying...' : 'Copy notes' }}
                </button>
              </summary>
              <div class="border-t border-slate-200 px-4 py-4">
                <div class="rounded-xl border border-slate-200 bg-white p-4">
                  <pre class="overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs leading-6 text-slate-700">{{ formattedMetadataJson }}</pre>
                </div>
              </div>
            </details>
          </section>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-navy-50 flex justify-end gap-2 flex-shrink-0">
          <button
            @click="$emit('close')"
            class="px-6 py-2 text-sm font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import {
  getRefundStatusLabel,
  getRefundStatusColor,
} from '~/schemas/events/paymentConstants'

import { usePaymentRefund } from '~/composables/resources/payments/paymentRefunds'
import { useProductOrder } from '~/composables/resources/products/productOrders'
import { useAttendee } from '~/composables/resources/attendee/attendees'
import RefundHybridOrderItemCard from './RefundHybridOrderItemCard.vue'
import { resolveImageUrl, onImageError } from '~/utils/image'

interface Props {
  refund: any
  open: boolean
}

interface RefundAssociation {
  id: string
  amount?: string | number | null
  description?: string | null
  metadata?: Record<string, any> | null
}

const props = defineProps<Props>()
defineEmits(['close'])

const { $notyf } = useNuxtApp()
const route = useRoute()
const eventIdFromRoute = computed(() => String(route.params.id || ''))

const { data: refundData } = usePaymentRefund(props.refund.refund_id)

const refund = computed(() => refundData.value?.data || props.refund)
const associationList = computed<RefundAssociation[]>(() => {
  if (!Array.isArray(refund.value?.associations)) return []
  return refund.value.associations as RefundAssociation[]
})
const canUseClipboard = computed(() => typeof navigator !== 'undefined' && !!navigator.clipboard)
const formattedMetadataJson = computed(() => {
  if (!refund.value?.metadata) return '{}'
  return JSON.stringify(refund.value.metadata, null, 2)
})
const metadataCopyPending = ref(false)

function normalizeLabel(value: any): string {
  return String(value ?? '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, character => character.toUpperCase())
    .trim()
}

function normalizeAssociationEntity(value: any): string {
  return String(value ?? '').trim().toLowerCase()
}

function isHybridScope(assoc: RefundAssociation): boolean {
  return String(assoc?.metadata?.scope || '').includes('hybrid')
}

function isHybridTicketAssoc(assoc: RefundAssociation): boolean {
  return isHybridScope(assoc) && normalizeAssociationEntity(assoc?.metadata?.entity) === 'ticket'
}

function isHybridOrderItemAssoc(assoc: RefundAssociation): boolean {
  const entity = normalizeAssociationEntity(assoc?.metadata?.entity)
  return isHybridScope(assoc) && entity.includes('order_item')
}

function associationMetadataEntries(metadata: Record<string, any>) {
  return Object.entries(metadata || {})
}

function formatAssociationMetadataValue(value: any): string {
  if (value === null || value === undefined || value === '') return 'N/A'
  if (Array.isArray(value) || typeof value === 'object') return JSON.stringify(value, null, 2)
  return String(value)
}

function isAssociatedOrder(association: any): boolean {
  const metadata = association?.metadata || {}
  const entity = normalizeAssociationEntity(metadata.entity)
  return entity.includes('order') || !!metadata.order_id
}

function isAssociatedAttendee(association: any): boolean {
  const metadata = association?.metadata || {}
  const entity = normalizeAssociationEntity(metadata.entity)
  return entity.includes('attendee') || !!metadata.attendee_id
}

const relatedOrderId = computed(() => {
  const association = associationList.value.find((association: RefundAssociation) => isAssociatedOrder(association))
  return String(association?.metadata?.order_id || '').trim()
})

const relatedAttendeeId = computed(() => {
  const association = associationList.value.find((association: RefundAssociation) => isAssociatedAttendee(association))
  return String(association?.metadata?.attendee_id || '').trim()
})

const relatedOrderQuery = useProductOrder(computed(() => ({ event: eventIdFromRoute.value })), relatedOrderId)
const relatedAttendeeQuery = useAttendee(relatedAttendeeId)

const relatedOrder = computed(() => relatedOrderQuery.data.value?.data || null)
const relatedAttendee = computed(() => relatedAttendeeQuery.data.value?.data || null)

const orderItems = computed(() => Array.isArray(relatedOrder.value?.order_items) ? relatedOrder.value.order_items : [])

const attendeeDetails = computed(() => {
  const attendee = relatedAttendee.value
  if (!attendee) return []

  return [
    { label: 'Full Name', value: attendee.full_name || 'N/A' },
    attendee.email ? { label: 'Email', value: attendee.email || 'N/A' } : { label: 'Phone', value: attendee.phone_number || 'N/A' },
  ]
})

const attendeeInitials = computed(() => {
  const attendee = relatedAttendee.value
  const name = String(attendee?.full_name || '').trim()
  if (!name) return 'AT'

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('')

  return initials || 'AT'
})

function getOrderItemDetails(item: any): Record<string, any> | null {
  const details = item?.product_variant_details
  if (!details || typeof details !== 'object') return null
  return details as Record<string, any>
}

function getOrderItemTitle(item: any): string {
  const details = getOrderItemDetails(item)
  return details?.product_title || details?.variant_title || `Variant ${details?.variant_id || item?.product_variant || 'N/A'}`
}

function getOrderItemCode(item: any): string {
  const details = getOrderItemDetails(item)
  if (details?.product_display_code) return String(details.product_display_code)
  if (details?.variant_id) return `Variant ${details.variant_id}`
  return `Variant ${item?.product_variant || 'N/A'}`
}

function getOrderItemImageUrl(item: any): string | null {
  const details = getOrderItemDetails(item)
  return details?.image_url || details?.variant_image_url || details?.product_image_url || null
}

function getOrderItemSize(item: any): string | null {
  const details = getOrderItemDetails(item)
  return details?.size || details?.size_display || null
}

function getOrderItemColor(item: any): string | null {
  const details = getOrderItemDetails(item)
  return details?.color || null
}

async function copyProcessingNotes() {
  if (!canUseClipboard.value) {
    $notyf?.error('Unable to copy processing notes.')
    return
  }

  metadataCopyPending.value = true
  try {
    await navigator.clipboard.writeText(formattedMetadataJson.value)
    $notyf?.success('Processing notes copied to clipboard.')
  } catch (error) {
    console.error('Failed to copy processing notes', error)
    $notyf?.error('Could not copy processing notes.')
  } finally {
    metadataCopyPending.value = false
  }
}


function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
</script>
