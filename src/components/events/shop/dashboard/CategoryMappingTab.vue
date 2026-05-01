<template>
  <!-- Header -->
  <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
    <div class="flex items-center gap-3">
      <UIcon name="i-heroicons-squares-2x2" class="w-5 h-5 text-primary" />
      <div>
        <h2 class="text-sm font-black text-primary uppercase tracking-widest">Category Mapping</h2>
        <p class="text-xs text-gray-500">Assign one category to multiple products in one action</p>
      </div>
    </div>

    <div class="w-full md:w-auto min-w-[260px]">
      <label class="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Target Category</label>
      <select
        v-model.number="tab.selectedCategoryId.value"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
      >
        <option :value="null">Select a category...</option>
        <option
          v-for="category in categories"
          :key="category.id"
          :value="category.id"
        >
          {{ category.name }}
        </option>
      </select>
    </div>
  </div>

  <!-- Controls -->
  <div class="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3 flex-wrap">
    <div class="relative flex-1 min-w-[260px]">
      <UIcon name="i-heroicons-magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        v-model="tab.searchQuery.value"
        type="text"
        placeholder="Search products by title, display code, or category..."
        class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
      />
    </div>

    <UBadge color="gray" variant="soft">
      {{ tab.selectedProductIds.value.length }} selected
    </UBadge>

    <UButton
      size="sm"
      variant="ghost"
      color="gray"
      @click="tab.clearSelection()"
      :disabled="tab.selectedProductIds.value.length === 0"
    >
      Clear Selection
    </UButton>

    <UButton
      size="sm"
      variant="solid"
      color="primary"
      icon="i-heroicons-link"
      :loading="tab.bulkAssignMutation.isPending.value"
      :disabled="!tab.selectedCategoryId.value || tab.selectedProductIds.value.length === 0"
      @click="tab.assignCategoryToSelectedProducts()"
    >
      Assign Category
    </UButton>

    <UButton
      size="sm"
      variant="outline"
      color="red"
      icon="i-heroicons-link-slash"
      :loading="tab.bulkRemoveMutation.isPending.value"
      :disabled="!tab.selectedCategoryId.value || tab.selectedProductIds.value.length === 0"
      @click="tab.removeCategoryFromSelectedProducts()"
    >
      Remove Category
    </UButton>
  </div>

  <!-- Loading -->
  <div v-if="tab.productsLoading.value" class="p-6 space-y-3">
    <div v-for="i in 8" :key="i" class="h-14 bg-gray-100 rounded-lg animate-pulse" />
  </div>

  <!-- Empty -->
  <div v-else-if="tab.products.value.length === 0" class="p-12 text-center">
    <UIcon name="i-heroicons-cube" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
    <h3 class="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
    <p class="text-sm text-gray-500">Try a different search query or add products first.</p>
  </div>

  <!-- Product Mapping Table -->
  <div v-else class="overflow-x-auto">
    <table class="w-full text-left text-sm">
      <thead>
        <tr class="border-b border-gray-200 bg-gray-50">
          <th class="py-3 px-4">
            <input
              v-model="tab.allProductsSelected.value"
              type="checkbox"
              class="rounded border-gray-300 text-primary focus:ring-primary"
            />
          </th>
          <th class="py-3 px-4 font-semibold text-gray-700">Product</th>
          <th class="py-3 px-4 font-semibold text-gray-700">Current Categories</th>
          <th class="py-3 px-4 font-semibold text-gray-700">Mapping Status</th>
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
              v-model="tab.selectedProductIds.value"
              type="checkbox"
              :value="product.product_id"
              class="rounded border-gray-300 text-primary focus:ring-primary"
            />
          </td>
          <td class="py-3 px-4">
            <div>
              <div class="font-semibold text-gray-900">{{ product.title }}</div>
              <div class="text-xs text-gray-500 font-mono">{{ product.display_code }}</div>
            </div>
          </td>
          <td class="py-3 px-4">
            <div v-if="product.categories.length" class="flex flex-wrap gap-1">
              <UBadge
                v-for="(categoryName, index) in product.categories"
                :key="`${product.product_id}-${index}`"
                color="gray"
                variant="soft"
                size="xs"
              >
                {{ categoryName }}
              </UBadge>
            </div>
            <p v-else class="text-xs text-gray-400 italic">No categories</p>
          </td>
          <td class="py-3 px-4">
            <UBadge
              v-if="tab.isCategoryAssignedToProduct(product)"
              color="green"
              variant="soft"
              size="xs"
            >
              Already Assigned
            </UBadge>
            <span v-else class="text-xs text-gray-500">Not assigned</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { EventDetail } from '~/api/types.gen'
import { useProductCategories } from '~/composables/resources/products/productCategories'
import { useCategoryMappingTab } from '~/composables/shop/dashboard/useCategoryMappingTab'

const props = defineProps<{
  eventId: string
  event: EventDetail | undefined
}>()

const tab = useCategoryMappingTab(computed(() => props.event))

const { data: productCategoriesData } = useProductCategories(
  computed(() => ({ page_size: 100 })),
)
const categories = computed(() => productCategoriesData.value?.data?.results || [])
</script>
