<template>
  <EventManagementLayout :event-id="id" :event="event?.data">
    <div class="space-y-6 pb-24">
      <!-- Summary Cards -->
      <div
        v-if="!isLoading && inventoryData?.data"
        class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4"
      >
        <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn p-5">
          <p class="text-xs font-black text-primary uppercase tracking-widest mb-1">Products</p>
          <p class="text-3xl font-black text-deep-navy">{{ inventoryData.data.total_products }}</p>
        </div>
        <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn p-5">
          <p class="text-xs font-black text-primary uppercase tracking-widest mb-1">Variants</p>
          <p class="text-3xl font-black text-deep-navy">{{ inventoryData.data.total_variants }}</p>
        </div>
        <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn p-5">
          <p class="text-xs font-black text-primary uppercase tracking-widest mb-1">Stock Units</p>
          <p class="text-3xl font-black text-deep-navy">
            {{ inventoryData.data.total_stock_units }}
          </p>
        </div>
        <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn p-5">
          <p class="text-xs font-black text-primary uppercase tracking-widest mb-1">Stock Value</p>
          <p class="text-2xl font-black text-deep-navy">
            {{ formatMoneyStr(inventoryData.data.grand_total_stock_value) }}
          </p>
        </div>
        <div
          v-if="inventoryData.data.has_restock_data && inventoryData.data.grand_total_restock_cost"
          class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn p-5"
        >
          <p class="text-xs font-black text-primary uppercase tracking-widest mb-1">
            Restock Cost
          </p>
          <p class="text-2xl font-black text-deep-navy">
            {{ formatMoneyStr(inventoryData.data.grand_total_restock_cost) }}
          </p>
        </div>
      </div>

      <!-- Summary cards skeleton -->
      <div v-else-if="isLoading" class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <div
          v-for="i in 5"
          :key="i"
          class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn p-5"
        >
          <div class="h-3 w-16 bg-gray-200 rounded animate-pulse mb-3" />
          <div class="h-8 w-20 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>

      <!-- Inventory Table Card -->
      <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
        <!-- Card header with filters -->
        <div class="px-6 py-4 border-b border-gray-200 flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-archive-box" class="w-5 h-5 text-primary" />
            <span class="text-sm font-black text-primary uppercase tracking-widest">Inventory</span>
          </div>

          <div class="flex flex-wrap items-center gap-4 ml-auto">
            <!-- is_active filter -->
            <label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <UToggle v-model="filterActiveOnly" size="sm" />
              Active only
            </label>

            <!-- needs_reorder filter -->
            <label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <UToggle v-model="filterNeedsReorder" size="sm" />
              Needs reorder
            </label>

            <!-- has_stock filter -->
            <label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <UToggle v-model="filterHasStock" size="sm" />
              Has stock
            </label>

            <UButton
              size="sm"
              variant="ghost"
              color="gray"
              icon="i-heroicons-arrow-path"
              :loading="isFetching"
              @click="refetch()"
            >
              Refresh
            </UButton>
          </div>
        </div>

        <!-- Loading skeleton -->
        <div v-if="isLoading" class="p-6 space-y-3">
          <div
            v-for="i in 6"
            :key="i"
            class="h-14 bg-gray-100 rounded-lg animate-pulse"
          />
        </div>

        <!-- Empty state -->
        <div
          v-else-if="!isLoading && products.length === 0"
          class="p-12 flex flex-col items-center gap-3"
        >
          <UIcon name="i-heroicons-archive-box" class="w-12 h-12 text-gray-200" />
          <p class="text-sm text-gray-500">No products found matching your filters</p>
          <UButton size="sm" variant="ghost" color="gray" @click="clearFilters">
            Clear filters
          </UButton>
        </div>

        <!-- Product table -->
        <InventoryProductTable
          v-else
          :products="products"
          :has-restock-data="inventoryData?.data?.has_restock_data ?? false"
          :currency="inventoryData?.data?.currency ?? ''"
          @view-variant-attendees="openVariantPanel"
        />
      </div>
    </div>

    <!-- Variant Attendees Panel -->
    <VariantAttendeesPanel
      :open="!!selectedVariantId"
      :variant-id="selectedVariantId"
      :variant-label="selectedVariantLabel"
      :event-slug="id"
      @close="closeVariantPanel"
    />

    <!-- Floating Action Bar -->
    <div
      class="fixed bottom-0 left-64 right-0 z-30 bg-white/95 backdrop-blur-lg border-t border-deep-navy/10 shadow-2xl"
    >
      <div class="max-w-screen-xl mx-auto px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <UIcon name="i-heroicons-archive-box" class="w-5 h-5 text-primary" />
            <div>
              <p class="text-xs font-black text-primary uppercase tracking-widest">
                Inventory Management
              </p>
              <p class="text-[10px] text-deep-navy/60 font-medium">
                Stock levels, order units, and restock requirements
              </p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <UButton
              size="sm"
              variant="outline"
              color="gray"
              icon="i-heroicons-shopping-bag"
              @click="navigateTo(`/events/${id}/m/shop/dashboard`)"
            >
              Shop Dashboard
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </EventManagementLayout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import EventManagementLayout from '~/components/events/EventManagementLayout.vue'
import InventoryProductTable from '~/components/events/shop/inventory/InventoryProductTable.vue'
import VariantAttendeesPanel from '~/components/events/shop/inventory/VariantAttendeesPanel.vue'
import { useEvent } from '~/composables/resources/events/events'
import { useInventoryBreakdown } from '~/composables/resources/products/productInventory'
import { formatMoney } from '~/utils/money'
import type { InventoryProductLine } from '~/api/types.gen'

definePageMeta({
  layout: false,
  middleware: ['auth', 'event-permission'],
  eventPermission: {
    category: 'PRODUCT_MANAGEMENT',
    action: 'read',
    deniedRedirect: '/403',
  },
})

const route = useRoute()
const id = computed(() => route.params.id as string)

const { data: event } = useEvent(id)

// Filters
const filterActiveOnly = ref(false)
const filterNeedsReorder = ref(false)
const filterHasStock = ref(false)

const breakdownParams = computed(() => ({
  event: id.value,
  ...(filterActiveOnly.value ? { is_active: true } : {}),
  ...(filterNeedsReorder.value ? { needs_reorder: true } : {}),
  ...(filterHasStock.value ? { has_stock: true } : {}),
}))

const { data: inventoryData, isLoading, isFetching, refetch } = useInventoryBreakdown(breakdownParams)

const products = computed<InventoryProductLine[]>(() => inventoryData.value?.data?.products ?? [])

function clearFilters() {
  filterActiveOnly.value = false
  filterNeedsReorder.value = false
  filterHasStock.value = false
}

// Variant attendees panel
const selectedVariantId = ref<string | null>(null)
const selectedVariantLabel = ref('')

function openVariantPanel(variantId: string, label: string) {
  selectedVariantId.value = variantId
  selectedVariantLabel.value = label
}

function closeVariantPanel() {
  selectedVariantId.value = null
  selectedVariantLabel.value = ''
}

function formatMoneyStr(moneyStr: string | null | undefined): string {
  if (!moneyStr) return '—'
  const parts = moneyStr.trim().split(' ')
  if (parts.length >= 2) {
    const currency = parts[parts.length - 1]!
    const amount = parts.slice(0, parts.length - 1).join(' ')
    return formatMoney(amount, currency)
  }
  return moneyStr
}
</script>
