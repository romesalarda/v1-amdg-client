<template>
  <!-- Header -->
  <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
    <div class="flex items-center gap-3">
      <UIcon name="i-heroicons-bell" class="w-5 h-5 text-primary" />
      <div>
        <h2 class="text-sm font-black text-primary uppercase tracking-widest">Stock Alerts</h2>
        <p class="text-xs text-gray-500">
          Variant stock levels across all products
          <span v-if="tab.totalCount.value > 0" class="ml-1 font-medium text-gray-700">
            ({{ tab.totalCount.value }} variant{{ tab.totalCount.value !== 1 ? 's' : '' }})
          </span>
        </p>
      </div>
    </div>

    <div class="flex items-center gap-2 flex-wrap">
      <!-- Search -->
      <UInput
        v-model="tab.searchQuery.value"
        placeholder="Search variants…"
        size="sm"
        icon="i-heroicons-magnifying-glass"
        :trailing-icon="tab.searchQuery.value ? 'i-heroicons-x-mark' : undefined"
        @click:trailing="tab.clearSearch()"
        class="w-44"
      />

      <!-- Filter toggle -->
      <UButton
        size="sm"
        :variant="showFilters ? 'solid' : 'outline'"
        color="gray"
        icon="i-heroicons-adjustments-horizontal"
        @click="showFilters = !showFilters"
      >
        Filters
        <UBadge v-if="tab.hasFiltersActive.value" color="primary" size="xs" class="ml-1">•</UBadge>
      </UButton>

      <!-- Refresh -->
      <UButton
        size="sm"
        variant="ghost"
        color="gray"
        icon="i-heroicons-arrow-path"
        :loading="tab.isFetching.value"
        title="Refresh"
        @click="tab.currentPage.value = tab.currentPage.value"
      />
    </div>
  </div>

  <!-- Filters Panel -->
  <div v-if="showFilters" class="px-6 py-3 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-3 items-end">
    <!-- Low stock toggle -->
    <div class="flex items-center gap-2">
      <label class="text-xs font-medium text-gray-600">Low stock only</label>
      <UToggle v-model="tab.filters.lowStock" size="sm" />
    </div>

    <!-- In stock -->
    <div class="flex items-center gap-2">
      <label class="text-xs font-medium text-gray-600">In stock</label>
      <UToggle
        :model-value="tab.filters.inStock === true"
        @update:model-value="tab.filters.inStock = $event ? true : undefined"
        size="sm"
      />
    </div>

    <!-- Active -->
    <div class="flex items-center gap-2">
      <label class="text-xs font-medium text-gray-600">Active only</label>
      <UToggle
        :model-value="tab.filters.isActive === true"
        @update:model-value="tab.filters.isActive = $event ? true : undefined"
        size="sm"
      />
    </div>

    <!-- Min stock -->
    <div class="flex flex-col gap-1">
      <label class="text-xs font-medium text-gray-600">Min stock</label>
      <UInput
        :model-value="tab.filters.minStock"
        @update:model-value="tab.filters.minStock = $event ? Number($event) : undefined"
        type="number"
        min="0"
        placeholder="0"
        size="sm"
        class="w-24"
      />
    </div>

    <!-- Max stock -->
    <div class="flex flex-col gap-1">
      <label class="text-xs font-medium text-gray-600">Max stock</label>
      <UInput
        :model-value="tab.filters.maxStock"
        @update:model-value="tab.filters.maxStock = $event ? Number($event) : undefined"
        type="number"
        min="0"
        placeholder="—"
        size="sm"
        class="w-24"
      />
    </div>

    <!-- Size -->
    <div class="flex flex-col gap-1">
      <label class="text-xs font-medium text-gray-600">Size</label>
      <select
        v-model="tab.filters.size"
        class="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
      >
        <option :value="undefined">All</option>
        <option value="XS">XS</option>
        <option value="SM">SM</option>
        <option value="MD">MD</option>
        <option value="LG">LG</option>
        <option value="XL">XL</option>
        <option value="OS">One Size</option>
        <option value="NA">N/A</option>
      </select>
    </div>

    <!-- Color search -->
    <div class="flex flex-col gap-1">
      <label class="text-xs font-medium text-gray-600">Color</label>
      <UInput
        v-model="tab.filters.color"
        placeholder="e.g. red"
        size="sm"
        class="w-28"
      />
    </div>

    <!-- Ordering -->
    <div class="flex flex-col gap-1">
      <label class="text-xs font-medium text-gray-600">Sort by</label>
      <select
        v-model="tab.filters.ordering"
        class="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
      >
        <option value="stock_quantity">Stock ↑</option>
        <option value="-stock_quantity">Stock ↓</option>
        <option value="final_price">Price ↑</option>
        <option value="-final_price">Price ↓</option>
        <option value="added_at">Oldest</option>
        <option value="-added_at">Newest</option>
      </select>
    </div>

    <!-- Page size -->
    <div class="flex flex-col gap-1">
      <label class="text-xs font-medium text-gray-600">Per page</label>
      <select
        v-model="tab.pageSize.value"
        class="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
      >
        <option :value="10">10</option>
        <option :value="20">20</option>
        <option :value="50">50</option>
      </select>
    </div>

    <UButton size="sm" variant="ghost" color="gray" @click="tab.clearFilters()">Reset</UButton>
  </div>

  <!-- Loading State -->
  <div v-if="tab.isLoading.value" class="p-6 space-y-3">
    <USkeleton class="h-20 w-full" v-for="i in 5" :key="i" />
  </div>

  <!-- Variants List -->
  <div v-else-if="tab.variants.value.length > 0" class="divide-y divide-gray-100">
    <div
      v-for="variant in tab.variants.value"
      :key="variant.variant_id"
      class="p-4 hover:bg-gray-50 transition-colors"
    >
      <div class="flex items-center justify-between gap-4">
        <!-- Variant image + info -->
        <div class="flex items-center gap-4 flex-1 min-w-0">
          <!-- Image -->
          <div class="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            <img
              v-if="tab.getVariantImage(variant)"
              :src="tab.getVariantImage(variant)!"
              :alt="variant.product_title"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <UIcon name="i-heroicons-photo" class="w-6 h-6 text-gray-400" />
            </div>
          </div>

          <!-- Details -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap mb-0.5">
              <span class="font-semibold text-gray-900 truncate text-sm">{{ variant.product_title }}</span>
              <UBadge :color="tab.getVariantStockColor(variant)" size="xs">
                {{ tab.getVariantStockLabel(variant) }}
              </UBadge>
              <UBadge v-if="!variant.is_active" color="gray" size="xs" variant="soft">Inactive</UBadge>
            </div>
            <div class="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
              <span v-if="variant.size && variant.size !== 'NA'">
                <span class="font-medium">Size:</span> {{ variant.size_display }}
              </span>
              <span v-if="variant.color">
                <span class="font-medium">Color:</span> {{ variant.color }}
              </span>
              <span>
                <span class="font-medium">Stock:</span>
                <span
                  :class="[
                    'ml-0.5 font-semibold',
                    (variant.stock_quantity ?? 0) === 0 ? 'text-red-600' :
                    (variant.stock_quantity ?? 0) <= 5 ? 'text-amber-600' : 'text-gray-700'
                  ]"
                >{{ variant.stock_quantity ?? 0 }}</span>
              </span>
              <span>
                <span class="font-medium">Price:</span> {{ variant.final_price }}
              </span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2 flex-shrink-0">
          <UButton
            size="xs"
            variant="outline"
            color="primary"
            icon="i-heroicons-arrow-path"
            @click="navigateTo(`/events/${eventId}/m/shop/products/${getProductUuid(variant)}/editor?tab=variants`)"
          >
            Restock
          </UButton>
          <UButton
            size="xs"
            variant="ghost"
            color="gray"
            icon="i-heroicons-eye"
            @click="navigateTo(`/events/${eventId}/m/shop/products/${getProductUuid(variant)}/editor`)"
            title="View product"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- Empty State -->
  <div v-else class="p-12 text-center">
    <UIcon name="i-heroicons-check-circle" class="w-16 h-16 text-green-300 mx-auto mb-4" />
    <h3 class="text-lg font-semibold text-gray-900 mb-2">
      {{ tab.hasFiltersActive.value ? 'No variants match the filters' : 'All stocked up!' }}
    </h3>
    <p class="text-sm text-gray-500">
      <template v-if="tab.hasFiltersActive.value">
        Try adjusting your filters.
        <UButton size="xs" variant="link" color="primary" @click="tab.clearFilters()">Clear filters</UButton>
      </template>
      <template v-else>No variants are currently flagged for a stock alert.</template>
    </p>
  </div>

  <!-- Pagination -->
  <div
    v-if="tab.totalPages.value > 1"
    class="px-6 py-3 border-t border-gray-100 flex items-center justify-between"
  >
    <p class="text-xs text-gray-500">
      Page {{ tab.currentPage.value }} of {{ tab.totalPages.value }}
      <span class="ml-1">({{ tab.totalCount.value }} total)</span>
    </p>
    <div class="flex items-center gap-1">
      <UButton
        size="xs"
        variant="outline"
        color="gray"
        icon="i-heroicons-chevron-left"
        :disabled="tab.currentPage.value <= 1"
        @click="tab.currentPage.value--"
      />
      <UButton
        size="xs"
        variant="outline"
        color="gray"
        icon="i-heroicons-chevron-right"
        :disabled="tab.currentPage.value >= tab.totalPages.value"
        @click="tab.currentPage.value++"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EventDetail } from '~/api/types.gen'
import type { VariantWithProductImage } from '~/composables/resources/products/eventVariantStockAlerts'
import { useStockAlertsTab } from '~/composables/shop/dashboard/useStockAlertsTab'

const props = defineProps<{
  eventId: string
  event: EventDetail | undefined
}>()

const showFilters = ref(false)
const tab = useStockAlertsTab(computed(() => props.event))

/**
 * Resolve the product UUID for navigation.
 * The variant has `product` (integer id); we use the product list from the tab to look it up.
 */
function getProductUuid(variant: VariantWithProductImage): string {
  const product = tab.products.value.find(p => p.id === variant.product)
  return product?.product_id ?? ''
}
</script>
