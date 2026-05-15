<template>
  <div class="grid grid-cols-1 gap-6">
    <!-- Main Products Content -->
    <div>
      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 border-b border-gray-100 bg-gray-50">
        <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-cube" class="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div class="text-2xl font-black text-deep-navy">{{ tab.totalProducts.value }}</div>
              <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Total Products</div>
            </div>
          </div>
        </div>

        <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div class="text-2xl font-black text-deep-navy">{{ tab.activeProductsCount.value }}</div>
              <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Active Products</div>
            </div>
          </div>
        </div>

        <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div class="text-2xl font-black text-deep-navy">{{ tab.lowStockCount.value }}</div>
              <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Low Stock</div>
            </div>
          </div>
        </div>

        <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-currency-pound" class="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div class="text-2xl font-black text-deep-navy">{{ tab.formatCurrency(tab.totalRevenue.value) }}</div>
              <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Total Revenue</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Table Header -->
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <UIcon name="i-heroicons-cube" class="w-5 h-5 text-primary" />
          <div>
            <h2 class="text-sm font-black text-primary uppercase tracking-widest">Products</h2>
            <p class="text-xs text-gray-500">Showing {{ tab.products.value.length }} of {{ tab.totalProducts.value }} products</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <UButton
            size="sm"
            variant="ghost"
            color="gray"
            :icon="tab.showFilters.value ? 'i-heroicons-funnel' : 'i-heroicons-funnel'"
            @click="tab.showFilters.value = !tab.showFilters.value"
          >
            {{ tab.showFilters.value ? 'Hide' : 'Show' }} Filters
            <UBadge v-if="tab.activeFilterCount.value > 0" color="primary" variant="soft" size="xs" class="ml-1">
              {{ tab.activeFilterCount.value }}
            </UBadge>
          </UButton>
          <UButton
            size="sm"
            variant="outline"
            color="gray"
            icon="i-heroicons-arrow-down-tray"
            @click="tab.exportProductsToCSV()"
          >
            Export CSV
          </UButton>
          <UButton
            size="sm"
            variant="outline"
            color="gray"
            icon="i-heroicons-shopping-cart"
            @click="navigateTo(`/events/${eventId}/m/shop/orders`)"
            title="View orders"
          >
            Orders
          </UButton>
          <UButton
            size="sm"
            variant="solid"
            color="primary"
            icon="i-heroicons-plus"
            @click="navigateTo(`/events/${eventId}/m/shop/products/new/editor`)"
          >
            Add Product
          </UButton>
        </div>
      </div>

      <!-- Search Bar + Inline Filters -->
      <div class="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <div class="flex items-center gap-3">
          <div class="flex-1">
            <div class="relative">
              <UIcon name="i-heroicons-magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                v-model="tab.searchQuery.value"
                type="text"
                placeholder="Search by product name, ID, or category..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div v-if="tab.activeFilterCount.value > 0" class="flex items-center gap-2">
            <UButton size="xs" variant="ghost" color="gray" @click="tab.clearAllFilters()">
              Clear all
            </UButton>
          </div>
        </div>

        <!-- Inline Filters Panel -->
        <div v-if="tab.showFilters.value" class="pt-4 mt-4 border-t border-gray-100">
          <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <!-- Status -->
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Status</label>
              <div class="space-y-2">
                <label class="flex items-center gap-2">
                  <input
                    v-model="tab.filters.verified"
                    type="checkbox"
                    class="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span class="text-sm text-gray-700">Verified only</span>
                </label>
                <label class="flex items-center gap-2">
                  <input
                    v-model="tab.filters.active"
                    type="checkbox"
                    class="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span class="text-sm text-gray-700">Active only</span>
                </label>
              </div>
            </div>

            <!-- Stock Status -->
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Stock Status</label>
              <div class="space-y-2">
                <label class="flex items-center gap-2">
                  <input
                    v-model="tab.filters.inStock"
                    type="checkbox"
                    class="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span class="text-sm text-gray-700">In Stock</span>
                </label>
                <label class="flex items-center gap-2">
                  <input
                    v-model="tab.filters.lowStock"
                    type="checkbox"
                    class="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span class="text-sm text-gray-700">Low Stock</span>
                </label>
                <label class="flex items-center gap-2">
                  <input
                    v-model="tab.filters.outOfStock"
                    type="checkbox"
                    class="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span class="text-sm text-gray-700">Out of Stock</span>
                </label>
              </div>
            </div>

            <!-- Price Range -->
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Price Range</label>
              <div class="grid grid-cols-2 gap-2">
                <input
                  v-model.number="tab.filters.minPrice"
                  type="number"
                  placeholder="Min"
                  class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <input
                  v-model.number="tab.filters.maxPrice"
                  type="number"
                  placeholder="Max"
                  class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <!-- Filter Actions -->
            <div class="flex items-end justify-items-center items-center">
              <button
                @click="tab.clearAllFilters()"
                class="w-full px-4 py-2 text-sm font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="tab.isLoading.value" class="p-6 space-y-3">
        <div v-for="i in 10" :key="i" class="h-16 bg-gray-100 rounded-lg animate-pulse" />
      </div>

      <!-- Empty State -->
      <div v-else-if="tab.products.value.length === 0" class="p-12 text-center">
        <UIcon name="i-heroicons-cube" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
        <p class="text-sm text-gray-500 mb-4">
          {{ tab.searchQuery.value || tab.activeFilterCount.value > 0
            ? 'Try adjusting your filters or search query'
            : 'No products have been created for this event yet'
          }}
        </p>
        <UButton
          v-if="tab.searchQuery.value || tab.activeFilterCount.value > 0"
          variant="soft"
          color="gray"
          @click="tab.clearAllFilters()"
        >
          Clear filters
        </UButton>
        <UButton
          v-else
          color="primary"
          @click="navigateTo(`/events/${eventId}/m/shop/products/new/editor`)"
        >
          Create First Product
        </UButton>
      </div>

      <!-- Products Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-gray-200 bg-gray-50">
              <th class="py-3 px-4">
                <input
                  v-model="tab.selectAll.value"
                  type="checkbox"
                  @change="tab.toggleSelectAll()"
                  class="rounded border-gray-300 text-primary focus:ring-primary"
                />
              </th>
              <th class="py-3 px-4 font-semibold text-gray-700">Image</th>
              <th
                class="py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                @click="tab.setSorting('title')"
              >
                <div class="flex items-center gap-1">
                  Product
                  <UIcon
                    v-if="tab.currentSort.value === 'title'"
                    :name="tab.sortDirection.value === 'asc' ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                    class="w-4 h-4"
                  />
                </div>
              </th>
              <th class="py-3 px-4 font-semibold text-gray-700">Categories</th>
              <th
                class="py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                @click="tab.setSorting('final_price')"
              >
                <div class="flex items-center gap-1">
                  Price
                  <UIcon
                    v-if="tab.currentSort.value === 'final_price'"
                    :name="tab.sortDirection.value === 'asc' ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                    class="w-4 h-4"
                  />
                </div>
              </th>
              <th class="py-3 px-4 font-semibold text-gray-700">Variants</th>
              <th class="py-3 px-4 font-semibold text-gray-700">Stock</th>
              <th class="py-3 px-4 font-semibold text-gray-700">Status</th>
              <th class="py-3 px-4 font-semibold text-gray-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="product in tab.products.value"
              :key="product.product_id"
              class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td class="py-3 px-4">
                <input
                  v-model="tab.selectedProducts.value"
                  type="checkbox"
                  :value="product.product_id"
                  class="rounded border-gray-300 text-primary focus:ring-primary"
                />
              </td>
              <td class="py-3 px-4">
                <div class="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    v-if="product.main_image?.url"
                    :src="product.main_image.url"
                    :alt="product.title"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <UIcon name="i-heroicons-photo" class="w-6 h-6 text-gray-400" />
                  </div>
                </div>
              </td>
              <td class="py-3 px-4">
                <div>
                  <div class="font-semibold text-gray-900">{{ product.title }}</div>
                  <div class="text-xs text-gray-500 font-mono">{{ product.display_code }}</div>
                </div>
              </td>
              <td class="py-3 px-4">
                <div class="flex flex-wrap gap-1">
                  <UBadge
                    v-for="(category, idx) in product.categories.slice(0, 2)"
                    :key="idx"
                    color="blue"
                    variant="soft"
                    size="xs"
                  >
                    {{ category }}
                  </UBadge>
                  <UBadge
                    v-if="product.categories.length > 2"
                    color="gray"
                    variant="soft"
                    size="xs"
                  >
                    +{{ product.categories.length - 2 }}
                  </UBadge>
                </div>
              </td>
              <td class="py-3 px-4 font-semibold text-gray-900">
                {{ product.final_price }}
                <span
                  v-if="product.percentage_modifier && parseFloat(product.percentage_modifier) !== 0"
                  class="text-xs text-gray-500"
                >
                  ({{ parseFloat(product.percentage_modifier) > 0 ? '+' : '' }}{{ product.percentage_modifier }}%)
                </span>
              </td>
              <td class="py-3 px-4">
                <UBadge color="gray" variant="soft" size="xs">
                  {{ product.variant_count }} variant{{ product.variant_count !== 1 ? 's' : '' }}
                </UBadge>
              </td>
              <td class="py-3 px-4">
                <UBadge
                  :color="tab.getStockStatusColor(tab.getProductStockStatus(product)) as any"
                  variant="soft"
                  size="xs"
                >
                  {{ tab.getStockStatusLabel(tab.getProductStockStatus(product)) }}
                </UBadge>
              </td>
              <td class="py-3 px-4">
                <div class="flex gap-1">
                  <UBadge
                    :color="tab.getPublicationStatusColor(tab.getPublicationStatus(product.verified ?? false, product.is_active ?? false)) as any"
                    variant="soft"
                    size="xs"
                  >
                    {{ tab.getPublicationStatusLabel(tab.getPublicationStatus(product.verified ?? false, product.is_active ?? false)) }}
                  </UBadge>
                </div>
              </td>
              <td class="py-3 px-4">
                <div class="flex items-center justify-end gap-1">
                  <UButton
                    size="xs"
                    variant="ghost"
                    color="gray"
                    icon="i-heroicons-eye"
                    @click="tab.viewProductDetails(product)"
                    title="Quick view"
                  />
                  <UButton
                    size="xs"
                    variant="ghost"
                    color="gray"
                    icon="i-heroicons-pencil"
                    @click="navigateTo(`/events/${eventId}/m/shop/products/${product.product_id}/editor`)"
                    title="Edit product"
                  />
                  <UButton
                    size="xs"
                    variant="ghost"
                    color="red"
                    icon="i-heroicons-trash"
                    @click="tab.deleteProduct(product)"
                    title="Delete product"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        v-if="!tab.isLoading.value && tab.products.value.length > 0"
        class="px-6 py-4 border-t border-gray-100 flex items-center justify-between"
      >
        <div class="flex items-center gap-3">
          <select
            v-model="tab.pageSize.value"
            class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option :value="10">10 per page</option>
            <option :value="25">25 per page</option>
            <option :value="50">50 per page</option>
            <option :value="100">100 per page</option>
          </select>
          <span class="text-xs text-gray-500">
            Showing {{ ((tab.currentPage.value - 1) * tab.pageSize.value) + 1 }} to
            {{ Math.min(tab.currentPage.value * tab.pageSize.value, tab.totalProducts.value) }}
            of {{ tab.totalProducts.value }}
          </span>
        </div>

        <UPagination
          v-model="tab.currentPage.value"
          :page-count="tab.pageSize.value"
          :total="tab.totalProducts.value"
          :max="7"
        />
      </div>
    </div>

  </div>

  <!-- Product Preview Modal -->
  <ProductPreviewModal
    v-model="tab.isPreviewOpen.value"
    :product="tab.selectedProduct.value"
  />
</template>

<script setup lang="ts">
import type { EventDetail } from '~/api/types.gen'
import { useProductsTab } from '~/composables/shop/dashboard/useProductsTab'
import ProductPreviewModal from '~/components/events/shop/ProductPreviewModal.vue'

const props = defineProps<{
  eventId: string
  event: EventDetail | undefined
}>()

const tab = useProductsTab(
  computed(() => props.eventId),
  computed(() => props.event),
)
</script>
