<template>
  <!-- Backdrop -->
  <Transition name="receipt-fade">
    <div
      v-if="open"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      @click.self="$emit('close')"
    >
      <!-- Modal Card -->
      <Transition name="receipt-scale">
        <div
          v-if="open"
          class="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          <!-- Modal Header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h3 class="text-xs font-black text-primary uppercase tracking-widest">Product Receipt</h3>
              <p class="text-sm font-semibold text-deep-navy mt-0.5 leading-tight">{{ product?.title }}</p>
            </div>
            <button
              type="button"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-deep-navy/40 hover:text-deep-navy hover:bg-gray-100 transition-colors"
              @click="$emit('close')"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Receipt Body -->
          <div class="p-4 max-h-[70vh] overflow-y-auto">
            <!-- Status badges -->
            <div class="flex items-center gap-1.5 mb-4">
              <span
                class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide"
                :class="product?.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
              >
                {{ product?.is_active ? 'Active' : 'Inactive' }}
              </span>
              <span
                v-if="product?.verified"
                class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-blue-100 text-blue-700"
              >
                Verified
              </span>
              <span class="ml-auto font-mono text-[10px] text-deep-navy/40">{{ product?.display_code }}</span>
            </div>

            <!-- Receipt -->
            <div class="bg-[#fdfcf8] border border-dashed border-deep-navy/20 rounded-lg font-mono text-[14px] overflow-hidden">
              <!-- Receipt header -->
              <div class="px-4 pt-4 pb-3 text-center border-b border-dashed border-deep-navy/15">
                <p class="text-[9px] uppercase tracking-[0.2em] text-deep-navy/40 font-sans font-black">Inventory Summary</p>
                <p class="text-sm font-bold text-deep-navy mt-0.5 font-sans leading-tight">{{ product?.title }}</p>
                <p class="text-[9px] text-deep-navy/40 mt-1 font-sans font-mono">{{ product?.display_code }}</p>
              </div>

              <!-- Variant lines -->
              <div class="px-4 pt-3">
                <p class="text-[9px] uppercase tracking-[0.18em] text-deep-navy/40 font-sans font-black mb-2.5">Variants</p>

                <div
                  v-for="variant in product?.variants"
                  :key="variant.variant_id"
                  class="flex items-start gap-2 py-2 border-b border-dashed border-deep-navy/8 last:border-0"
                >
                  <!-- Color swatch -->
                  <div
                    class="w-3.5 h-3.5 mt-0.5 rounded-sm border border-deep-navy/15 flex-shrink-0"
                    :style="{ backgroundColor: variant.color }"
                  />
                  <div class="flex-1 min-w-0">
                    <div class="flex items-baseline justify-between gap-1">
                      <span class="text-deep-navy/80 leading-tight truncate">{{ variant.size }}</span>
                      <span class="font-bold text-deep-navy flex-shrink-0 tabular-nums">{{ formatMoneyStr(variant.current_stock_value) }}</span>
                    </div>
                    <div class="flex items-center justify-between mt-0.5">
                      <div class="flex items-center gap-2 text-[10px] text-deep-navy/35 font-sans">
                        <span>{{ variant.current_stock }} units</span>
                        <span v-if="variant.live_order_units > 0" class="text-amber-600 font-semibold">
                          ({{ variant.live_order_units }} live)
                        </span>
                        <span v-if="variant.max_stock_quantity !== null" class="text-deep-navy/25">
                          / {{ variant.max_stock_quantity }} max
                        </span>
                      </div>
                      <span class="text-[10px] text-deep-navy/35 font-sans tabular-nums">@ {{ formatMoneyStr(variant.unit_price) }}</span>
                    </div>
                    <!-- Restock line -->
                    <div
                      v-if="variant.quantity_to_order !== null"
                      class="mt-0.5 text-[10px] font-sans"
                      :class="variant.quantity_to_order > 0 ? 'text-rose-500' : 'text-green-600'"
                    >
                      {{ variant.quantity_to_order > 0 ? `Reorder ${variant.quantity_to_order} units` : 'Fully stocked' }}
                      <span v-if="variant.restock_cost && variant.quantity_to_order > 0" class="tabular-nums">
                        — {{ formatMoneyStr(variant.restock_cost) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Totals footer -->
              <div class="mx-4 mt-3 pt-3 border-t-2 border-double border-deep-navy/20 pb-4 space-y-1.5">
                <div class="flex justify-between items-center">
                  <span class="text-[9px] uppercase tracking-[0.15em] text-deep-navy/40 font-sans font-black">Total Stock</span>
                  <span class="font-bold text-deep-navy tabular-nums">{{ product?.total_current_stock }} units</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-[9px] uppercase tracking-[0.15em] text-deep-navy/40 font-sans font-black">Stock Value</span>
                  <span class="font-bold text-emerald-700 tabular-nums">{{ formatMoneyStr(product?.total_current_stock_value ?? '') }}</span>
                </div>
                <div v-if="product?.total_restock_cost" class="flex justify-between items-center pt-1 border-t border-dashed border-deep-navy/10">
                  <span class="text-[9px] uppercase tracking-[0.15em] text-deep-navy/40 font-sans font-black">Total Restock Cost</span>
                  <span class="font-bold text-rose-700 tabular-nums">{{ formatMoneyStr(product.total_restock_cost) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="px-5 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              type="button"
              class="px-4 py-2 text-xs font-black uppercase tracking-wider text-deep-navy/60 border-2 border-deep-navy/15 rounded-lg hover:bg-gray-50 transition-colors"
              @click="$emit('close')"
            >
              Close
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { InventoryProductLine } from '~/api/types.gen'
import { formatMoney } from '~/utils/money'

defineProps<{
  open: boolean
  product: InventoryProductLine | null
}>()

defineEmits<{
  close: []
}>()

function formatMoneyStr(moneyStr: string): string {
  const parts = moneyStr.trim().split(' ')
  if (parts.length >= 2) {
    const currency = parts[parts.length - 1]!
    const amount = parts.slice(0, parts.length - 1).join(' ')
    return formatMoney(amount, currency)
  }
  return moneyStr
}
</script>

<style scoped>
.receipt-fade-enter-active,
.receipt-fade-leave-active {
  transition: opacity 0.2s ease;
}
.receipt-fade-enter-from,
.receipt-fade-leave-to {
  opacity: 0;
}

.receipt-scale-enter-active,
.receipt-scale-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.receipt-scale-enter-from,
.receipt-scale-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(8px);
}
</style>
