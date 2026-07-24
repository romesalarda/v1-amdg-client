<template>
  <EventManagementLayout :event-id="id" :event="event?.data">
    <div class="space-y-6 pb-24">
      <!-- Summary Cards -->
      <div
        v-if="!isLoading && inventoryData?.data"
        class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4"
      >
        <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <UIcon name="i-heroicons-cube" class="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div class="text-2xl font-black text-deep-navy">{{ inventoryData.data.total_products }}</div>
              <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Products</div>
            </div>
          </div>
        </div>
        <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <UIcon name="i-heroicons-squares-2x2" class="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div class="text-2xl font-black text-deep-navy">{{ inventoryData.data.total_variants }}</div>
              <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Variants</div>
            </div>
          </div>
        </div>
        <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <UIcon name="i-heroicons-archive-box" class="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div class="text-2xl font-black text-deep-navy">{{ inventoryData.data.total_stock_units }}</div>
              <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Stock Units</div>
            </div>
          </div>
        </div>
        <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <UIcon name="i-heroicons-banknotes" class="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div class="text-xl font-black text-deep-navy leading-tight">
                {{ formatMoneyStr(inventoryData.data.grand_total_stock_value) }}
              </div>
              <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Stock Value</div>
            </div>
          </div>
        </div>
        <div
          v-if="inventoryData.data.has_restock_data && inventoryData.data.grand_total_restock_cost"
          class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <div class="text-xl font-black text-deep-navy leading-tight">
                {{ formatMoneyStr(inventoryData.data.grand_total_restock_cost) }}
              </div>
              <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Restock Cost</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary cards skeleton -->
      <div v-else-if="isLoading" class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <div
          v-for="i in 5"
          :key="i"
          class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gray-100 rounded-lg animate-pulse flex-shrink-0" />
            <div class="space-y-2">
              <div class="h-6 w-14 bg-gray-200 rounded animate-pulse" />
              <div class="h-3 w-20 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <!-- Inventory Table Card -->
      <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
        <!-- Card header -->
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <UIcon name="i-heroicons-archive-box" class="w-5 h-5 text-primary" />
            <div>
              <h2 class="text-sm font-black text-primary uppercase tracking-widest">Inventory</h2>
              <p class="text-xs text-gray-500">
                Showing {{ products.length }} product{{ products.length !== 1 ? 's' : '' }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <UButton
              size="sm"
              variant="ghost"
              color="gray"
              :icon="showFilters ? 'i-heroicons-funnel' : 'i-heroicons-funnel'"
              @click="showFilters = !showFilters"
            >
              {{ showFilters ? 'Hide' : 'Show' }} Filters
              <UBadge v-if="activeFilterCount > 0" color="primary" variant="soft" size="xs" class="ml-1">
                {{ activeFilterCount }}
              </UBadge>
            </UButton>
            <UButton
              size="sm"
              variant="ghost"
              color="gray"
              icon="i-heroicons-arrow-down-tray"
              :disabled="products.length === 0"
              @click="handleExportCsv()"
            />
            <UButton
              size="sm"
              variant="ghost"
              color="gray"
              icon="i-heroicons-arrow-path"
              :loading="isFetching"
              @click="refetch()"
            />
          </div>
        </div>

        <!-- Filter panel -->
        <div v-if="showFilters" class="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div class="flex flex-wrap items-center gap-6">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="filterActiveOnly"
                type="checkbox"
                class="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span class="text-sm text-gray-700">Active only</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="filterNeedsReorder"
                type="checkbox"
                class="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span class="text-sm text-gray-700">Needs reorder</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="filterHasStock"
                type="checkbox"
                class="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span class="text-sm text-gray-700">Has stock</span>
            </label>
            <UButton
              v-if="activeFilterCount > 0"
              size="xs"
              variant="ghost"
              color="gray"
              @click="clearFilters"
            >
              Clear all
            </UButton>
          </div>
        </div>

        <!-- Loading skeleton -->
        <div v-if="isLoading" class="p-6 space-y-3">
          <div
            v-for="i in 6"
            :key="i"
            class="h-16 bg-gray-100 rounded-lg animate-pulse"
          />
        </div>

        <!-- Empty state -->
        <div
          v-else-if="!isLoading && products.length === 0"
          class="p-12 text-center"
        >
          <UIcon name="i-heroicons-archive-box" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 class="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
          <p class="text-sm text-gray-500 mb-4">
            {{ activeFilterCount > 0 ? 'Try adjusting your filters' : 'No products have been added to this event yet' }}
          </p>
          <UButton
            v-if="activeFilterCount > 0"
            variant="soft"
            color="gray"
            @click="clearFilters"
          >
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
          @view-product-receipt="openReceipt"
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

    <!-- Product Receipt Modal -->
    <ProductReceiptModal
      :open="isReceiptOpen"
      :product="selectedReceiptProduct"
      @close="closeReceipt"
    />

    <!-- Floating Action Bar -->
    <div
      :class="['fixed bottom-0 right-0 z-30 bg-white/95 backdrop-blur-lg border-t border-deep-navy/10 shadow-2xl transition-all duration-300', sidebarStore.isOpen ? 'left-64' : 'left-0']"
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
import ProductReceiptModal from '~/components/events/shop/inventory/ProductReceiptModal.vue'
import VariantAttendeesPanel from '~/components/events/shop/inventory/VariantAttendeesPanel.vue'
import { useEvent } from '~/composables/resources/events/events'
import { useSidebarStore } from '~/stores/sidebar'
import { useInventoryBreakdown } from '~/composables/resources/products/productInventory'
import { useProductReceiptModal } from '~/composables/shop/useProductReceiptModal'
import { useCsvExport } from '~/composables/ui/useCsvExport'
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
const sidebarStore = useSidebarStore()

const { data: event } = useEvent(id)

// Filters
const filterActiveOnly = ref(false)
const filterNeedsReorder = ref(false)
const filterHasStock = ref(false)
const showFilters = ref(false)

const activeFilterCount = computed(
  () => [filterActiveOnly.value, filterNeedsReorder.value, filterHasStock.value].filter(Boolean).length,
)

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

// CSV export
const { exportInventoryToCSV } = useCsvExport()

function handleExportCsv() {
  const eventSlug = id.value
  exportInventoryToCSV(products.value, `inventory-${eventSlug}.csv`)
}

// Product receipt modal
const {
  selectedProduct: selectedReceiptProduct,
  isOpen: isReceiptOpen,
  openReceipt,
  closeReceipt,
} = useProductReceiptModal()

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
