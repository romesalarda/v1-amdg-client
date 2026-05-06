<template>
  <div class="space-y-3">
    <div class="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
      <div class="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div class="text-xs text-indigo-700 mb-1">Order Reference</div>
          <div class="font-mono font-semibold text-indigo-900">{{ order?.order_reference_id || 'N/A' }}</div>
        </div>
        <div>
          <div class="text-xs text-indigo-700 mb-1">Status</div>
          <div class="font-semibold text-indigo-900">{{ formatLabel(order?.status) }}</div>
        </div>
        <div>
          <div class="text-xs text-indigo-700 mb-1">Customer</div>
          <div class="font-semibold text-indigo-900">{{ order?.customer_name || order?.customer_id || 'N/A' }}</div>
        </div>
        <div>
          <div class="text-xs text-indigo-700 mb-1">Attendee</div>
          <div class="font-semibold text-indigo-900">{{ order?.attendee_name || order?.attendee_id || 'N/A' }}</div>
        </div>
      </div>
      <div class="mt-3 pt-3 border-t border-indigo-200 flex items-center justify-between">
        <span class="text-sm text-indigo-700">Total Amount</span>
        <span class="text-lg font-black text-indigo-900">{{ formatDisplayAmount(order?.total_amount) }}</span>
      </div>
    </div>

    <div class="bg-white rounded-lg p-4 border border-gray-200">
      <div class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Order Items ({{ orderItems.length }})</div>
      <div class="space-y-2">
        <div
          v-for="item in orderItems"
          :key="item.order_item_id || `${item.product_variant_id || 'variant'}-${item.product_title || 'item'}`"
          class="rounded-lg bg-gray-50 border border-gray-200 p-3"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-start gap-3 min-w-0">
              <img
                :src="getOrderItemImageUrl(item)"
                alt="Order item variant image"
                class="h-14 w-14 rounded-md border border-gray-200 bg-white object-cover flex-shrink-0"
                @error="onImageError"
              >
              <div class="min-w-0">
                <div class="text-sm font-semibold text-gray-900 truncate">{{ item.product_title || item.product_variant_details?.product_title || 'Product' }}</div>
                <div class="text-xs text-gray-600 mt-1">
                  Qty {{ item.quantity || 1 }} x {{ formatDisplayAmount(item.unit_price, item.currency) }}
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  {{ getVariantSubtitle(item) }}
                </div>
              </div>
            </div>
            <div class="text-right space-y-1">
              <div class="text-xs text-gray-500">Line Total</div>
              <div class="text-sm font-bold text-gray-900">{{ item.final_price_for_attendee || formatDisplayAmount(item.total_price || item.total_amount, item.currency) }}</div>
              <UBadge :color="getOrderItemStatusColor(item.status) as any" variant="soft" size="xs">
                {{ formatLabel(item.status) }}
              </UBadge>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { resolveImageUrl, onImageError } from '~/utils/image'

const props = defineProps<{ order: any }>()

const orderItems = computed<any[]>(() => {
  const items = props.order?.order_items
  return Array.isArray(items) ? items : []
})

function formatDisplayAmount(amount: any, currency?: string): string {
  if (amount === null || amount === undefined || amount === '') return 'N/A'
  if (typeof amount === 'string' && amount.includes('£')) return amount
  if (typeof amount === 'string' && /^\s*[A-Z]{3}\s+/.test(amount)) return amount

  const parsed = Number.parseFloat(String(amount).replace(/[^0-9.-]/g, ''))
  if (!Number.isFinite(parsed)) return String(amount)

  const currencyCode = (currency || 'GBP').toUpperCase()
  try {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: currencyCode }).format(parsed)
  } catch {
    return `${currencyCode} ${parsed.toFixed(2)}`
  }
}

function formatLabel(value: any): string {
  if (value === null || value === undefined || value === '') return 'N/A'
  return String(value).replace(/_/g, ' ')
}

function getOrderItemImageUrl(item: any): string {
  const details = item?.product_variant_details || {}
  return resolveImageUrl(details.variant_image_url || details.image_url || details.product_image_url || null)
}

function getVariantSubtitle(item: any): string {
  const details = item?.product_variant_details || {}
  const tokens: string[] = []

  if (details.size) tokens.push(`Size: ${details.size}`)
  if (details.color) tokens.push(`Color: ${details.color}`)

  return tokens.length ? tokens.join(' • ') : 'Variant details unavailable'
}

function getOrderItemStatusColor(status: unknown): 'green' | 'amber' | 'gray' | 'red' | 'blue' {
  const normalized = String(status || '').toLowerCase()
  if (normalized === 'completed') return 'green'
  if (normalized === 'pending') return 'amber'
  if (normalized === 'pending_refund' || normalized === 'partially_refunded') return 'blue'
  if (normalized === 'refunded') return 'red'
  return 'gray'
}
</script>
