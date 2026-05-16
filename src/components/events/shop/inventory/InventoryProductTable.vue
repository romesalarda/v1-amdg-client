<template>
  <div class="overflow-x-auto">
    <table class="w-full text-left text-sm">
      <thead>
        <tr class="border-b border-gray-200 bg-gray-50">
          <th class="py-3 px-4 w-8"></th>
          <th class="py-3 px-4 font-semibold text-gray-700">Product</th>
          <th class="py-3 px-4 font-semibold text-gray-700 text-right">Stock</th>
          <th class="py-3 px-4 font-semibold text-gray-700 text-right">Stock Value</th>
          <th v-if="hasRestockData" class="py-3 px-4 font-semibold text-gray-700 text-right">
            Restock Cost
          </th>
          <th class="py-3 px-4 w-8"></th>
        </tr>
      </thead>
      <tbody>
        <template v-for="product in products" :key="product.product_id">
          <!-- Product row -->
          <tr
            class="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
            @click="toggleProduct(product.product_id)"
          >
            <td class="py-3 px-4">
              <UIcon
                :name="
                  expandedProducts.has(product.product_id)
                    ? 'i-heroicons-chevron-down'
                    : 'i-heroicons-chevron-right'
                "
                class="w-4 h-4 text-gray-400"
              />
            </td>
            <td class="py-3 px-4">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-semibold text-gray-900">{{ product.title }}</span>
                <span class="text-xs text-gray-400 font-mono">{{ product.display_code }}</span>
                <UBadge v-if="!product.is_active" color="gray" size="xs">Inactive</UBadge>
                <UBadge v-if="product.verified" color="green" size="xs">Verified</UBadge>
              </div>
            </td>
            <td class="py-3 px-4 text-right font-mono text-gray-900">
              {{ product.total_current_stock }}
            </td>
            <td class="py-3 px-4 text-right font-mono text-gray-700 text-sm">
              {{ formatMoneyStr(product.total_current_stock_value, currency) }}
            </td>
            <td v-if="hasRestockData" class="py-3 px-4 text-right font-mono text-gray-500 text-sm">
              {{
                product.total_restock_cost
                  ? formatMoneyStr(product.total_restock_cost, currency)
                  : '—'
              }}
            </td>
            <td class="py-3 px-4 text-right">
              <UBadge color="gray" size="xs">
                {{ product.variants.length }}
                variant{{ product.variants.length !== 1 ? 's' : '' }}
              </UBadge>
            </td>
          </tr>

          <!-- Variant rows (expanded) -->
          <template v-if="expandedProducts.has(product.product_id)">
            <tr
              v-for="variant in product.variants"
              :key="variant.variant_id"
              class="border-b border-gray-50 bg-gray-50/50"
            >
              <td class="py-2 px-4"></td>
              <td class="py-2 px-4 pl-10">
                <div class="flex items-center gap-2 flex-wrap">
                  <!-- Color swatch -->
                  <span
                    class="inline-block w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                    :style="{ backgroundColor: variant.color }"
                    :title="variant.color"
                  />
                  <span class="text-gray-700 font-medium">{{ variant.size }}</span>
                  <span class="text-xs text-gray-400 font-mono">{{ variant.color }}</span>
                  <UBadge v-if="!variant.is_active" color="gray" size="xs">Inactive</UBadge>
                  <span
                    v-if="variant.live_order_units > 0"
                    class="text-xs text-amber-600 font-semibold"
                  >
                    {{ variant.live_order_units }} live
                  </span>
                </div>
              </td>
              <td class="py-2 px-4 text-right">
                <div class="flex flex-col items-end">
                  <span class="font-mono text-gray-900">{{ variant.current_stock }}</span>
                  <span
                    v-if="variant.max_stock_quantity !== null"
                    class="text-xs text-gray-400"
                  >
                    / {{ variant.max_stock_quantity }} max
                  </span>
                </div>
              </td>
              <td class="py-2 px-4 text-right font-mono text-gray-700 text-sm">
                {{ formatMoneyStr(variant.current_stock_value, currency) }}
              </td>
              <td v-if="hasRestockData" class="py-2 px-4 text-right text-sm">
                <div class="flex flex-col items-end">
                  <span
                    v-if="variant.quantity_to_order !== null"
                    class="font-semibold"
                    :class="variant.quantity_to_order > 0 ? 'text-red-600' : 'text-green-600'"
                  >
                    {{ variant.quantity_to_order > 0 ? `Order ${variant.quantity_to_order}` : 'OK' }}
                  </span>
                  <span
                    v-if="variant.restock_cost"
                    class="text-xs text-gray-400 font-mono"
                  >
                    {{ formatMoneyStr(variant.restock_cost, currency) }}
                  </span>
                  <span v-else-if="variant.quantity_to_order === null" class="text-gray-400 text-xs">—</span>
                </div>
              </td>
              <td class="py-2 px-4 text-right">
                <UButton
                  size="xs"
                  variant="ghost"
                  color="gray"
                  icon="i-heroicons-users"
                  @click.stop="
                    $emit(
                      'view-variant-attendees',
                      variant.variant_id,
                      `${product.title} — ${variant.size} ${variant.color}`,
                    )
                  "
                >
                  Attendees
                </UButton>
              </td>
            </tr>
          </template>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { InventoryProductLine } from '~/api/types.gen'
import { formatMoney } from '~/utils/money'

defineProps<{
  products: InventoryProductLine[]
  hasRestockData: boolean
  currency: string
}>()

defineEmits<{
  'view-variant-attendees': [variantId: string, label: string]
}>()

const expandedProducts = ref(new Set<string>())

function toggleProduct(productId: string) {
  if (expandedProducts.value.has(productId)) {
    expandedProducts.value.delete(productId)
  } else {
    expandedProducts.value.add(productId)
  }
}

/**
 * Money strings from the API are e.g. "30.00 GBP".
 * Use the existing formatMoney utility, or fall back to just the amount portion.
 */
function formatMoneyStr(moneyStr: string, fallbackCurrency: string): string {
  const parts = moneyStr.trim().split(' ')
  if (parts.length >= 2) {
    const currency = parts[parts.length - 1]!
    const amount = parts.slice(0, parts.length - 1).join(' ')
    return formatMoney(amount, currency)
  }
  return formatMoney(moneyStr, fallbackCurrency)
}
</script>
