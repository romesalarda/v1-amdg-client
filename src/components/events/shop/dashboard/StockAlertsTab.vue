<template>
  <!-- Header -->
  <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <UIcon name="i-heroicons-bell" class="w-5 h-5 text-primary" />
      <div>
        <h2 class="text-sm font-black text-primary uppercase tracking-widest">Stock Alerts</h2>
        <p class="text-xs text-gray-500">Products with low stock levels requiring attention</p>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <select
        v-model="tab.stockAlertThreshold.value"
        class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
      >
        <option :value="10">10% or less</option>
        <option :value="20">20% or less</option>
        <option :value="30">30% or less</option>
        <option :value="50">50% or less</option>
      </select>
    </div>
  </div>

  <!-- Loading State -->
  <div v-if="tab.isLoading.value" class="p-6 space-y-3">
    <USkeleton class="h-20 w-full" v-for="i in 5" :key="i" />
  </div>

  <!-- Stock Alerts List -->
  <div v-else-if="tab.lowStockProducts.value.length > 0" class="divide-y divide-gray-100">
    <div
      v-for="product in tab.lowStockProducts.value"
      :key="product.product_id"
      class="p-6 hover:bg-gray-50 transition-colors"
    >
      <div class="flex items-start justify-between gap-4">
        <!-- Product Info -->
        <div class="flex items-start gap-4 flex-1">
          <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            <div class="w-full h-full flex items-center justify-center">
              <UIcon name="i-heroicons-photo" class="w-6 h-6 text-gray-400" />
            </div>
          </div>

          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h4 class="font-semibold text-gray-900">{{ product.title }}</h4>
              <UBadge :color="tab.getStockAlertColor(product)" size="xs">
                {{ tab.getStockAlertLabel(product) }}
              </UBadge>
            </div>

            <div class="text-sm text-gray-600 space-y-1">
              <p>
                <span class="font-medium">Variants:</span>
                {{ product.variant_count }} variant{{ product.variant_count !== 1 ? 's' : '' }}
              </p>
              <p class="text-xs text-gray-500">
                Click "Restock" to manage variant inventories
              </p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <UButton
            size="sm"
            variant="outline"
            color="primary"
            icon="i-heroicons-arrow-path"
            @click="navigateTo(`/events/${eventId}/m/shop/products/${product.product_id}/editor?tab=variants`)"
          >
            Restock
          </UButton>
          <UButton
            size="sm"
            variant="ghost"
            color="gray"
            icon="i-heroicons-eye"
            @click="navigateTo(`/events/${eventId}/m/shop/products/${product.product_id}/editor`)"
            title="View product"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- Empty State -->
  <div v-else class="p-12 text-center">
    <UIcon name="i-heroicons-check-circle" class="w-16 h-16 text-green-300 mx-auto mb-4" />
    <h3 class="text-lg font-semibold text-gray-900 mb-2">All stocked up!</h3>
    <p class="text-sm text-gray-500">No products are below the {{ tab.stockAlertThreshold.value }}% stock threshold</p>
  </div>
</template>

<script setup lang="ts">
import type { EventDetail } from '~/api/types.gen'
import { useStockAlertsTab } from '~/composables/shop/dashboard/useStockAlertsTab'

const props = defineProps<{
  eventId: string
  event: EventDetail | undefined
}>()

const tab = useStockAlertsTab(computed(() => props.event))
</script>
