<template>
  <div class="space-y-3">
    <div class="bg-rose-50 rounded-lg p-4 border border-rose-200">
      <div class="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div class="text-xs text-rose-700 mb-1">Tracking Reference</div>
          <div class="font-mono font-semibold text-rose-900">{{ donation?.tracking_reference || 'N/A' }}</div>
        </div>
        <div>
          <div class="text-xs text-rose-700 mb-1">Status</div>
          <div class="font-semibold text-rose-900">{{ formatLabel(donation?.status) }}</div>
        </div>
        <div>
          <div class="text-xs text-rose-700 mb-1">Donated By</div>
          <div class="font-semibold text-rose-900">{{ donation?.donated_by_name || donation?.donated_by || 'N/A' }}</div>
        </div>
        <div>
          <div class="text-xs text-rose-700 mb-1">Created At</div>
          <div class="font-semibold text-rose-900">{{ formatDateTime(donation?.created_at) }}</div>
        </div>
      </div>
      <div class="mt-3 pt-3 border-t border-rose-200 flex items-center justify-between">
        <span class="text-sm text-rose-700">Donation Amount</span>
        <span class="text-lg font-black text-rose-900">{{ formatDisplayAmount(donation?.amount, donation?.currency) }}</span>
      </div>
      <div v-if="donation?.message" class="mt-3 pt-3 border-t border-rose-200 text-sm text-rose-900">
        {{ donation.message }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ donation: any }>()

function formatDateTime(dateString: string): string {
  if (!dateString) return 'N/A'

  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return 'N/A'

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

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
</script>
