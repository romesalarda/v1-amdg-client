<template>
  <EventManagementLayout :event-id="id" :event="event?.data">
    <div class="space-y-6">
      <!-- Tab Navigation -->
      <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
        <div class="border-b border-gray-200">
          <nav class="flex -mb-px">
            <button
              v-for="tab in tabs"
              :key="tab.value"
              @click="currentTab = tab.value"
              :class="[
                'flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-colors',
                currentTab === tab.value
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              ]"
            >
              <UIcon :name="tab.icon" class="w-5 h-5" />
              {{ tab.label }}
              <UBadge v-if="tab.badge" color="gray" variant="soft" size="xs">{{ tab.badge }}</UBadge>
            </button>
          </nav>
        </div>

        <ProductsTab v-if="currentTab === 'products'" :event-id="id" :event="event?.data" />
        <CategoriesTab v-else-if="currentTab === 'categories'" :event-id="id" :event="event?.data" />
        <CategoryMappingTab v-else-if="currentTab === 'category-mapping'" :event-id="id" :event="event?.data" />
        <PackageProductsTab v-else-if="currentTab === 'package-products'" :event-id="id" :event="event?.data" />
        <StockAlertsTab v-else-if="currentTab === 'stock'" :event-id="id" :event="event?.data" />
        <StatisticsTab v-else-if="currentTab === 'statistics'" />
      </div>
    </div>

    <!-- Floating Action Bar -->
    <div class="fixed bottom-0 left-64 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-deep-navy/10 shadow-2xl">
      <div class="max-w-screen-xl mx-auto px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <UIcon name="i-heroicons-shopping-bag" class="w-5 h-5 text-primary" />
            <div>
              <p class="text-xs font-black text-primary uppercase tracking-widest">Shop Dashboard</p>
              <p class="text-[10px] text-deep-navy/60 font-medium">Manage products, orders, and categories</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <UButton
              size="sm"
              variant="outline"
              color="gray"
              icon="i-heroicons-clipboard-document-list"
              @click="navigateTo(`/events/${id}/m/shop/inventory`)"
            >
              Inventory
            </UButton>
            <UButton
              size="sm"
              variant="outline"
              color="gray"
              icon="i-heroicons-shopping-cart"
              @click="navigateTo(`/events/${id}/m/shop/orders`)"
            >
              View Orders
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </EventManagementLayout>
</template>

<script setup lang="ts">
import { useEvent } from '~/composables/resources/events/events'
import { useProductsOverview } from '~/composables/statistics/products/product-statistics'
import EventManagementLayout from '~/components/events/EventManagementLayout.vue'
import ProductsTab from '~/components/events/shop/dashboard/ProductsTab.vue'
import CategoriesTab from '~/components/events/shop/dashboard/CategoriesTab.vue'
import CategoryMappingTab from '~/components/events/shop/dashboard/CategoryMappingTab.vue'
import PackageProductsTab from '~/components/events/shop/dashboard/PackageProductsTab.vue'
import StockAlertsTab from '~/components/events/shop/dashboard/StockAlertsTab.vue'
import StatisticsTab from '~/components/events/shop/dashboard/StatisticsTab.vue'

definePageMeta({
  layout: false,
  middleware: ['auth', 'event-permission'],
  eventPermission: {
    category: 'PRODUCT_MANAGEMENT',
    action: 'read',
    deniedRedirect: '/403',
  }
})

const route = useRoute()
const id = computed(() => route.params.id as string)

const { data: event } = useEvent(id)

// Statistics used for tab badge counts only
const { data: statisticsData } = useProductsOverview({ event_id: id.value })

const totalProducts = computed(
  () => (statisticsData.value?.data?.product_summary?.total_products as number) || 0,
)
const lowStockCount = computed(
  () => (statisticsData.value?.data?.variant_summary?.low_stock_count as number) || 0,
)

const currentTab = ref('products')
const tabs = computed(() => [
  { value: 'products', label: 'Products', icon: 'i-heroicons-cube', badge: totalProducts.value || undefined },
  { value: 'package-products', label: 'Package Products', icon: 'i-heroicons-link' },
  { value: 'categories', label: 'Categories', icon: 'i-heroicons-folder' },
  { value: 'category-mapping', label: 'Category Mapping', icon: 'i-heroicons-squares-2x2' },
  { value: 'stock', label: 'Stock Alerts', icon: 'i-heroicons-bell', badge: lowStockCount.value || undefined },
  { value: 'statistics', label: 'Statistics', icon: 'i-heroicons-chart-bar' },
])
</script>