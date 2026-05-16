<template>
  <div class="overflow-x-auto">
    <table class="w-full text-left text-sm">
      <thead>
        <tr class="border-b border-gray-200 bg-gray-50">
          <th class="py-3 px-4 w-10"></th>
          <th class="py-3 px-4 font-semibold text-gray-700">Product</th>
          <th class="py-3 px-4 font-semibold text-gray-700">Status</th>
          <th class="py-3 px-4 font-semibold text-gray-700 text-right">Stock</th>
          <th class="py-3 px-4 font-semibold text-gray-700 text-right">Stock Value</th>
          <th v-if="hasRestockData" class="py-3 px-4 font-semibold text-gray-700 text-right">
            Restock Cost
          </th>
          <th class="py-3 px-4 font-semibold text-gray-700 text-right">Variants</th>
          <th class="py-3 px-4 font-semibold text-gray-700 text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="product in products" :key="product.product_id">
          <!-- Product row -->
          <tr
            class="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
            :class="{ 'bg-blue-50/40': expandedProducts.has(product.product_id) }"
            @click="toggleProduct(product.product_id)"
          >
            <td class="py-3 px-4">
              <div
                class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                :class="
                  expandedProducts.has(product.product_id)
                    ? 'bg-primary/10 text-primary'
                    : 'bg-gray-100 text-gray-400'
                "
              >
                <UIcon
                  :name="
                    expandedProducts.has(product.product_id)
                      ? 'i-heroicons-chevron-down'
                      : 'i-heroicons-chevron-right'
                  "
                  class="w-4 h-4"
                />
              </div>
            </td>
            <td class="py-3 px-4">
              <div>
                <div class="font-semibold text-gray-900">{{ product.title }}</div>
                <div class="text-xs text-gray-400 font-mono mt-0.5">{{ product.display_code }}</div>
              </div>
            </td>
            <td class="py-3 px-4">
              <div class="flex flex-wrap gap-1">
                <UBadge
                  :color="product.is_active ? 'green' : 'gray'"
                  variant="soft"
                  size="xs"
                >
                  {{ product.is_active ? 'Active' : 'Inactive' }}
                </UBadge>
                <UBadge v-if="product.verified" color="blue" variant="soft" size="xs">
                  Verified
                </UBadge>
              </div>
            </td>
            <td class="py-3 px-4 text-right">
              <span class="text-xl font-black text-deep-navy">{{ product.total_current_stock }}</span>
            </td>
            <td class="py-3 px-4 text-right">
              <span class="font-semibold text-gray-900">
                {{ formatMoneyStr(product.total_current_stock_value, currency) }}
              </span>
            </td>
            <td v-if="hasRestockData" class="py-3 px-4 text-right">
              <span class="text-gray-500">
                {{ product.total_restock_cost ? formatMoneyStr(product.total_restock_cost, currency) : '—' }}
              </span>
            </td>
            <td class="py-3 px-4 text-right">
              <UBadge color="gray" variant="soft" size="xs">
                {{ product.variants.length }} variant{{ product.variants.length !== 1 ? 's' : '' }}
              </UBadge>
            </td>
            <td class="py-3 px-4 text-right">
              <UButton
                size="xs"
                variant="soft"
                color="primary"
                icon="i-heroicons-receipt-percent"
                @click.stop="$emit('view-product-receipt', product)"
              >
                Receipt
              </UButton>
            </td>
          </tr>

          <!-- Variant rows (expanded) -->
          <template v-if="expandedProducts.has(product.product_id)">
            <tr
              v-for="variant in product.variants"
              :key="variant.variant_id"
              class="border-b border-blue-100/60 bg-blue-50/20 hover:bg-blue-50/40 transition-colors"
            >
              <!-- Left accent -->
              <td class="py-3 px-4">
                <div class="ml-4 w-0.5 h-8 bg-primary/20 rounded-full mx-auto" />
              </td>
              <td class="py-3 px-4 pl-8">
                <div class="flex items-center gap-3">
                  <!-- Color swatch -->
                  <div
                    class="w-6 h-6 rounded-md border border-gray-300 shadow-sm flex-shrink-0"
                    :style="{ backgroundColor: variant.color }"
                    :title="variant.color"
                  />
                  <div>
                    <div class="font-medium text-gray-800">{{ variant.size }}</div>
                    <div class="text-xs text-gray-400 font-mono">{{ variant.color }}</div>
                  </div>
                </div>
              </td>
              <td class="py-3 px-4">
                <div class="flex flex-wrap gap-1">
                  <UBadge
                    :color="variant.is_active ? 'green' : 'gray'"
                    variant="soft"
                    size="xs"
                  >
                    {{ variant.is_active ? 'Active' : 'Inactive' }}
                  </UBadge>
                  <UBadge
                    v-if="variant.live_order_units > 0"
                    color="amber"
                    variant="soft"
                    size="xs"
                  >
                    {{ variant.live_order_units }} live
                  </UBadge>
                </div>
              </td>
              <td class="py-3 px-4 text-right">
                <div class="flex flex-col items-end">
                  <span class="font-semibold text-gray-900">{{ variant.current_stock }}</span>
                  <span v-if="variant.max_stock_quantity !== null" class="text-xs text-gray-400">
                    / {{ variant.max_stock_quantity }} max
                  </span>
                </div>
              </td>
              <td class="py-3 px-4 text-right">
                <span class="text-gray-700">
                  {{ formatMoneyStr(variant.current_stock_value, currency) }}
                </span>
              </td>
              <td v-if="hasRestockData" class="py-3 px-4 text-right">
                <div class="flex flex-col items-end gap-1">
                  <UBadge
                    v-if="variant.quantity_to_order !== null"
                    :color="variant.quantity_to_order > 0 ? 'red' : 'green'"
                    variant="soft"
                    size="xs"
                  >
                    {{ variant.quantity_to_order > 0 ? `Order ${variant.quantity_to_order}` : 'OK' }}
                  </UBadge>
                  <span v-if="variant.restock_cost" class="text-xs text-gray-400 font-mono">
                    {{ formatMoneyStr(variant.restock_cost, currency) }}
                  </span>
                  <span v-else-if="variant.quantity_to_order === null" class="text-gray-300 text-xs">—</span>
                </div>
              </td>
              <td class="py-3 px-4 text-right">
                <UButton
                  size="xs"
                  variant="soft"
                  color="primary"
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
              <!-- empty cell to align with product-row Actions column -->
              <td class="py-3 px-4" />
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
  'view-product-receipt': [product: InventoryProductLine]
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
