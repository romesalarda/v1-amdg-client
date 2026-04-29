<template>
  <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-4xl', height: 'sm:max-h-[90vh]' }">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between w-full">
          <h3 class="text-lg font-semibold text-gray-900">Product Preview</h3>
          <UButton
            :variant="viewMode === 'rich' ? 'soft' : 'ghost'"
            size="sm"
            :color="viewMode === 'rich' ? 'primary' : 'gray'"
            @click="viewMode = viewMode === 'rich' ? 'technical' : 'rich'"
          >
            {{ viewMode === 'rich' ? 'View Technical Details' : 'Back to Preview' }}
          </UButton>
        </div>
      </template>

      <!-- Rich View - Matches BookingShopProductCard -->
      <template v-if="viewMode === 'rich'">
        <div v-if="product" class="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <!-- Image Gallery - Left Side -->
          <div>
            <div class="overflow-hidden rounded-2xl border border-deep-navy/10 bg-mist-blue">
              <img
                :src="activeImageUrl"
                :alt="product.title"
                class="h-64 w-full object-cover md:h-80"
              >
            </div>
            <div v-if="galleryImages.length > 1" class="mt-3 grid grid-cols-5 gap-2">
              <button
                v-for="image in galleryImages"
                :key="image"
                type="button"
                class="overflow-hidden rounded-lg border disabled:cursor-not-allowed disabled:opacity-60"
                :class="activeImageUrl === image ? 'border-deep-navy' : 'border-deep-navy/15'"
                @click="activeImageUrl = image"
              >
                <img :src="image" alt="Variant preview" class="h-14 w-full object-cover">
              </button>
            </div>
          </div>

          <!-- Product Details - Right Side -->
          <div>
            <h3 class="mt-2 text-2xl font-black text-deep-navy">{{ product.title }}</h3>

            <div class="mt-4 flex items-center gap-2 flex-wrap">
              <p class="text-xl font-black text-deep-navy">
                {{ activePrice }}
              </p>
              <span
                v-if="activeVariant?.context_has_discount"
                class="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700"
              >
                Discount active
              </span>
              <span class="rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wide" :class="stockBadgeClass(activeVariant)">
                {{ stockLabel(activeVariant) }}
              </span>
              <span class="rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wide" :class="availabilityStatusClass">
                {{ availabilityStatusLabel }}
              </span>
            </div>

            <p v-if="typeof activeVariant?.context_remaining_quantity === 'number'" class="mt-2 text-xs font-semibold text-deep-navy/75">
              Remaining for attendee: {{ Math.max(0, activeVariant.context_remaining_quantity) }}
            </p>

            <ul v-if="discountNames(activeVariant).length" class="mt-2 space-y-1 text-[11px] text-emerald-800">
              <li
                v-for="(discountName, index) in discountNames(activeVariant)"
                :key="`${activeVariant.variant_id}-discount-${index}`"
              >
                {{ discountName }}
              </li>
            </ul>

            <p class="mt-2 text-xs text-deep-navy/65">{{ availabilityDescription }}</p>

            <!-- Categories -->
            <div v-if="product.categories?.length" class="mt-4">
              <p class="text-[11px] font-black uppercase tracking-[0.18em] text-deep-navy/55">Categories</p>
              <div class="mt-2 flex flex-wrap gap-2">
                <UBadge v-for="cat in product.categories" :key="cat" color="blue" variant="soft" size="sm">
                  {{ cat }}
                </UBadge>
              </div>
            </div>

            <!-- Color Selection -->
            <div class="mt-5">
              <p class="text-[11px] font-black uppercase tracking-[0.18em] text-deep-navy/55">Choose colour</p>
              <div class="mt-2 flex flex-wrap gap-2">
                <button
                  v-for="option in colorOptions"
                  :key="option.value"
                  type="button"
                  class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition"
                  :class="selectedColor === option.value ? 'border-deep-navy bg-deep-navy text-white' : 'border-deep-navy/20 bg-white text-deep-navy hover:border-deep-navy/45'"
                  @click="selectColor(option.value)"
                >
                  <span
                    v-if="option.hex"
                    class="inline-block h-3 w-3 rounded-full border"
                    :class="selectedColor === option.value ? 'border-white/70' : 'border-deep-navy/25'"
                    :style="{ backgroundColor: option.hex }"
                  />
                  {{ option.label }}
                </button>
              </div>
            </div>

            <!-- Size Selection -->
            <div class="mt-4">
              <p class="text-[11px] font-black uppercase tracking-[0.18em] text-deep-navy/55">Choose size</p>
              <div class="mt-2 flex flex-wrap gap-2">
                <button
                  v-for="option in sizeOptions"
                  :key="option.variant.variant_id"
                  type="button"
                  class="rounded-full border px-3 py-1.5 text-xs font-semibold transition"
                  :class="selectedVariantId === option.variant.variant_id ? 'border-deep-navy bg-deep-navy text-white' : 'border-deep-navy/20 bg-white text-deep-navy hover:border-deep-navy/45'"
                  @click="selectSize(option.variant)"
                >
                  {{ option.variant.size_display || 'Standard' }}
                  <span v-if="option.modifierText" class="ml-1 opacity-85">{{ option.modifierText }}</span>
                </button>
              </div>
            </div>

            <!-- Quantity & Action (Read-Only) -->
            <div class="mt-5 flex items-center gap-3">
              <input
                type="number"
                value="1"
                class="w-24 rounded-xl border border-deep-navy/20 px-3 py-2 text-sm"
                disabled
              >
              <button
                type="button"
                class="rounded-xl bg-deep-navy px-5 py-2.5 text-xs font-black uppercase tracking-wide text-white opacity-50 cursor-not-allowed"
                disabled
              >
                Preview Only
              </button>
            </div>

            <p class="mt-3 text-[11px] text-deep-navy/60">This is a read-only preview. Switch to Technical Details for stock and order information.</p>
          </div>
        </div>
      </template>

      <!-- Technical View - Detailed Information -->
      <template v-else-if="viewMode === 'technical'">
        <div v-if="product" class="space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          <!-- Summary Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div class="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Product ID</div>
              <div class="font-mono text-sm text-blue-900 break-all">{{ product.product_id }}</div>
            </div>
            <div class="bg-green-50 rounded-lg p-4 border border-green-200">
              <div class="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">Total Variants</div>
              <div class="text-2xl font-bold text-green-900">{{ variantRows.length }}</div>
            </div>
            <div class="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <div class="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Total Stock</div>
              <div class="text-2xl font-bold text-amber-900">{{ totalStock }}</div>
            </div>
            <div class="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div class="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">Base Price</div>
              <div class="text-2xl font-bold text-purple-900">{{ formatMoney(product.base_amount, product.base_amount_currency) }}</div>
            </div>
          </div>

          <!-- Product Information -->
          <div class="bg-gray-50 rounded-lg p-5 border border-gray-200">
            <h4 class="text-sm font-semibold text-gray-900 mb-4">Product Information</h4>
            <dl class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <dt class="text-gray-600 text-xs uppercase tracking-wide mb-1">Display Code</dt>
                <dd class="font-mono text-gray-900 text-base">{{ product.display_code }}</dd>
              </div>
              <div>
                <dt class="text-gray-600 text-xs uppercase tracking-wide mb-1">Base Price</dt>
                <dd class="font-semibold text-gray-900 text-base">{{ formatMoney(product.base_amount, product.base_amount_currency) }}</dd>
              </div>
              <div>
                <dt class="text-gray-600 text-xs uppercase tracking-wide mb-1">Final Price</dt>
                <dd class="font-semibold text-gray-900 text-base">{{ product.final_price}}</dd>
              </div>
              <div>
                <dt class="text-gray-600 text-xs uppercase tracking-wide mb-1">Price Modifier</dt>
                <dd class="font-semibold text-gray-900 text-base">{{ product.percentage_modifier ? `${product.percentage_modifier}%` : 'None' }}</dd>
              </div>
              <div>
                <dt class="text-gray-600 text-xs uppercase tracking-wide mb-1">Status</dt>
                <dd class="flex gap-2">
                  <UBadge :color="product.is_active ? 'green' : 'gray'" variant="soft" size="xs">{{ product.is_active ? 'Active' : 'Inactive' }}</UBadge>
                  <UBadge :color="product.verified ? 'green' : 'amber'" variant="soft" size="xs">{{ product.verified ? 'Verified' : 'Unverified' }}</UBadge>
                </dd>
              </div>
              <div>
                <dt class="text-gray-600 text-xs uppercase tracking-wide mb-1">Variant Count</dt>
                <dd class="font-semibold text-gray-900 text-base">{{ variantRows.length }} variant{{ variantRows.length !== 1 ? 's' : '' }}</dd>
              </div>
            </dl>
          </div>

          <!-- Variants Detailed Table -->
          <div v-if="variantRows.length > 0" class="space-y-3">
            <h4 class="text-sm font-semibold text-gray-900">Variant Details</h4>
            <div class="overflow-x-auto border border-gray-200 rounded-lg">
              <table class="w-full text-xs">
                <thead>
                  <tr class="border-b border-gray-200 bg-gray-50">
                    <th class="text-left py-3 px-3 font-semibold text-gray-700">Variant ID</th>
                    <th class="text-left py-3 px-3 font-semibold text-gray-700">Color</th>
                    <th class="text-left py-3 px-3 font-semibold text-gray-700">Size</th>
                    <th class="text-right py-3 px-3 font-semibold text-gray-700">Stock</th>
                    <th class="text-right py-3 px-3 font-semibold text-gray-700">Price</th>
                    <th class="text-right py-3 px-3 font-semibold text-gray-700">Max Per Order</th>
                    <th class="text-center py-3 px-3 font-semibold text-gray-700">Active</th>
                    <th class="text-center py-3 px-3 font-semibold text-gray-700">In Stock</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="variant in variantRows" :key="variant.variant_id" class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td class="py-3 px-3 font-mono text-gray-900 truncate">{{ variant.variant_id }}</td>
                    <td class="py-3 px-3">{{ variant.color || 'Standard' }}</td>
                    <td class="py-3 px-3">{{ variant.size_display || 'Standard' }}</td>
                    <td class="py-3 px-3 text-right font-semibold">{{ variant.stock_quantity ?? 0 }}</td>
                    <td class="py-3 px-3 text-right font-semibold">{{ variant.final_price }}</td>
                    <td class="py-3 px-3 text-right">{{ variant.max_purchase_quantity_per_order || '∞' }}</td>
                    <td class="py-3 px-3 text-center">
                      <UIcon :name="variant.is_active ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'" :class="variant.is_active ? 'text-green-600' : 'text-gray-300'" class="w-4 h-4 mx-auto" />
                    </td>
                    <td class="py-3 px-3 text-center">
                      <UIcon :name="variant.is_in_stock ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'" :class="variant.is_in_stock ? 'text-green-600' : 'text-red-600'" class="w-4 h-4 mx-auto" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-8">
            <UIcon name="i-heroicons-inbox" class="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p class="text-sm text-gray-500">No variants found for this product</p>
          </div>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import type { ProductList, ProductVariantList, AvailabilityWindow } from '~/api/types.gen'
import { productVariantsAvailabilityWindowsList } from '~/api/sdk.gen'
import { useProductVariants } from '~/composables/resources/products/productVariants'
import { formatMoney } from '~/utils/money'

const props = defineProps<{
  modelValue: boolean
  product: ProductList | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// View mode state
const viewMode = ref<'rich' | 'technical'>('rich')

// Variant data
const variantQuery = useProductVariants(
  computed(() => {
    if (!props.product?.product_id) return undefined
    return {
      productId: props.product.product_id,
    }
  })
)

const variantRows = computed<ProductVariantList[]>(() => {
  const results = variantQuery.data.value?.data?.results
  return Array.isArray(results) ? (results as ProductVariantList[]) : []
})

// State
const selectedVariantId = ref<string>('')
const selectedColor = ref<string>('')
const selectedSize = ref<string>('')
const activeImageUrl = ref<string>('https://placehold.co/800x600?text=Product')
const windowsByVariant = ref<Record<string, AvailabilityWindow[]>>({})

// Active variant
const activeVariant = computed(() => {
  if (!variantRows.value.length) {
    return {
      variant_id: '',
      size_display: 'No variants',
      color: '',
      stock_quantity: 0,
      max_purchase_quantity_per_order: 1,
      is_active: false,
      is_in_stock: false,
      final_price: props.product?.final_price || '0',
      images: {},
    } as ProductVariantList
  }
  return variantRows.value.find((row) => row.variant_id === selectedVariantId.value) || variantRows.value[0]
})

// Gallery images
const galleryImages = computed(() => {
  const variant = activeVariant.value
  const images: string[] = []
  const main = variant?.images?.main?.url
  if (main) images.push(main)
  ;(variant?.images?.additional || []).forEach((image) => {
    if (image.url) images.push(image.url)
  })
  if (!images.length && props.product?.main_image?.url) {
    images.push(props.product.main_image.url)
  }
  if (!images.length) {
    images.push('https://placehold.co/800x600?text=Product')
  }
  return [...new Set(images)]
})

// Color and size options
type ColorOption = {
  value: string
  label: string
  hex?: string
}

type SizeOption = {
  variant: ProductVariantList
  modifierText: string
}

const colorOptions = computed<ColorOption[]>(() => {
  const seen = new Set<string>()
  const options: ColorOption[] = []

  variantRows.value.forEach((variant) => {
    const value = colorKey(variant.color)
    if (seen.has(value)) return
    seen.add(value)
    options.push({
      value,
      label: colorLabel(variant.color),
      hex: normalizeHexColor(variant.color),
    })
  })

  if (!options.length) {
    options.push({ value: 'no-color', label: 'Standard' })
  }

  return options
})

const sizeOptions = computed<SizeOption[]>(() => {
  const rowsForColor = variantRows.value.filter((variant) => colorKey(variant.color) === selectedColor.value)
  const prices = rowsForColor
    .map((variant) => toAmount(variantPrice(variant)))
    .filter((value): value is number => value !== null)
  const basePrice = prices.length ? Math.min(...prices) : null

  return rowsForColor.map((variant) => {
    const currentPrice = toAmount(variantPrice(variant))
    if (basePrice === null || currentPrice === null) {
      return { variant, modifierText: '' }
    }

    const delta = currentPrice - basePrice
    if (Math.abs(delta) < 0.005) {
      return { variant, modifierText: '' }
    }

    const sign = delta > 0 ? '+' : '-'
    return {
      variant,
      modifierText: `${sign}${formatMoney(Math.abs(delta).toFixed(2), 'GBP')}`,
    }
  })
})

// Active price
const activePrice = computed(() => {
  const variant = activeVariant.value
  return variant?.final_price || props.product?.final_price || '0'
})

// Technical view - totals
const totalStock = computed(() => {
  return variantRows.value.reduce((sum, variant) => sum + (variant.stock_quantity ?? 0), 0)
})

// Watchers for variant initialization
watch(
  variantRows,
  async (rows) => {
    if (!rows.length) {
      selectedVariantId.value = ''
      selectedColor.value = ''
      selectedSize.value = ''
      windowsByVariant.value = {}
      return
    }

    const current = rows.find((row) => row.variant_id === selectedVariantId.value)
    const bySelectors = rows.find(
      (row) => colorKey(row.color) === selectedColor.value && (row.size_display || '') === selectedSize.value
    )
    const nextVariant = current || bySelectors || rows[0]

    selectedVariantId.value = nextVariant?.variant_id || ''
    selectedColor.value = colorKey(nextVariant?.color)
    selectedSize.value = nextVariant?.size_display || ''

    const nextWindows: Record<string, AvailabilityWindow[]> = {}
    await Promise.all(
      rows.map(async (row) => {
        try {
          const response = await productVariantsAvailabilityWindowsList({
            path: {
              product_product_id: props.product!.product_id,
              variant_id: row.variant_id,
            },
          })
          const resultRows = (response.data as { results?: AvailabilityWindow[] } | undefined)?.results
          nextWindows[row.variant_id] = Array.isArray(resultRows) ? (resultRows as AvailabilityWindow[]) : []
        } catch {
          nextWindows[row.variant_id] = []
        }
      })
    )

    windowsByVariant.value = nextWindows
  },
  { immediate: true }
)

watch(
  [selectedColor, selectedSize, variantRows],
  () => {
    const rows = variantRows.value
    if (!rows.length) return

    const match = rows.find(
      (row) => colorKey(row.color) === selectedColor.value && (row.size_display || '') === selectedSize.value
    )
    if (match) {
      selectedVariantId.value = match.variant_id
      return
    }

    const colorMatch = rows.find((row) => colorKey(row.color) === selectedColor.value)
    if (colorMatch) {
      selectedVariantId.value = colorMatch.variant_id
      selectedSize.value = colorMatch.size_display || ''
    }
  },
  { immediate: true }
)

watch(
  galleryImages,
  (rows) => {
    if (!rows.length) return
    if (!rows.includes(activeImageUrl.value)) {
      activeImageUrl.value = rows[0]
    }
  },
  { immediate: true }
)

// Helper functions
function colorKey(color: string | null | undefined) {
  return (color || 'no-color').trim().toLowerCase() || 'no-color'
}

function colorLabel(color: string | null | undefined) {
  return (color || '').trim() || 'Standard'
}

function normalizeHexColor(color: string | null | undefined) {
  const raw = (color || '').trim()
  if (!raw) return ''

  const match = raw.match(/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
  if (!match) return ''

  const body = match[1]
  if (body.length === 3) {
    return `#${body[0]}${body[0]}${body[1]}${body[1]}${body[2]}${body[2]}`.toUpperCase()
  }

  return `#${body}`.toUpperCase()
}

function toAmount(value: string | number | null | undefined) {
  if (value === null || value === undefined) return null
  const parsed = Number.parseFloat(String(value))
  return Number.isFinite(parsed) ? parsed : null
}

function variantPrice(variant: ProductVariantList) {
  return variant.final_price || props.product?.final_price || '0'
}

function selectColor(nextColor: string) {
  selectedColor.value = nextColor
  const rowsForColor = variantRows.value.filter((row) => colorKey(row.color) === nextColor)
  if (!rowsForColor.length) return

  const keepSize = rowsForColor.find((row) => (row.size_display || '') === selectedSize.value)
  const nextVariant = keepSize || rowsForColor[0]
  selectedSize.value = nextVariant.size_display || ''
  selectedVariantId.value = nextVariant.variant_id
}

function selectSize(variant: ProductVariantList) {
  selectedVariantId.value = variant.variant_id
  selectedColor.value = colorKey(variant.color)
  selectedSize.value = variant.size_display || ''
}


function stockLabel(variant: ProductVariantList) {
  if (!variant.is_active) return 'Inactive'
  if (!variant.is_in_stock || !variant.stock_quantity) return 'Out of stock'
  if (variant.stock_quantity <= 5) return `${variant.stock_quantity} left`
  return `${variant.stock_quantity} in stock`
}

function stockBadgeClass(variant: ProductVariantList) {
  if (!variant.is_active) return 'bg-gray-200 text-gray-700'
  if (!variant.is_in_stock || !variant.stock_quantity) return 'bg-red-100 text-red-700'
  if (variant.stock_quantity <= 5) return 'bg-amber-100 text-amber-700'
  return 'bg-green-100 text-green-700'
}

function activeWindowsFor(variantId: string, type: 'PRODUCT_WINDOW' | 'PRODUCT_PREVIEW_WINDOW') {
  const rows = windowsByVariant.value[variantId] || []
  return rows.filter((window) => window.availability_type === type && window.is_active)
}

function isPurchaseOpen(variantId: string) {
  return activeWindowsFor(variantId, 'PRODUCT_WINDOW').length > 0
}

function isPreviewOnly(variantId: string) {
  return !isPurchaseOpen(variantId) && activeWindowsFor(variantId, 'PRODUCT_PREVIEW_WINDOW').length > 0
}

function hasConfiguredPurchaseWindow(variantId: string) {
  const rows = windowsByVariant.value[variantId] || []
  return rows.some((window) => window.availability_type === 'PRODUCT_WINDOW')
}

function isWindowBlocked(variantId: string) {
  return hasConfiguredPurchaseWindow(variantId) && !isPurchaseOpen(variantId)
}

const availabilityStatusLabel = computed(() => {
  const variantId = activeVariant.value?.variant_id
  if (!variantId) return ''
  if (isPurchaseOpen(variantId)) return 'Purchasable'
  if (isPreviewOnly(variantId)) return 'Preview'
  if (isWindowBlocked(variantId)) return 'Unavailable'
  return 'Always available'
})

const availabilityStatusClass = computed(() => {
  const variantId = activeVariant.value?.variant_id
  if (!variantId) return 'bg-deep-navy/10 text-deep-navy border border-deep-navy/15'
  if (isPurchaseOpen(variantId)) return 'bg-green-100 text-green-800 border border-green-200'
  if (isPreviewOnly(variantId)) return 'bg-blue-100 text-blue-800 border border-blue-200'
  if (isWindowBlocked(variantId)) return 'bg-amber-100 text-amber-800 border border-amber-200'
  return 'bg-deep-navy/10 text-deep-navy border border-deep-navy/15'
})

const availabilityDescription = computed(() => {
  const variantId = activeVariant.value?.variant_id
  if (!variantId) return ''
  if (isPreviewOnly(variantId)) {
    return 'This variant is in preview mode and cannot be purchased yet.'
  }
  if (isWindowBlocked(variantId)) {
    const purchaseRows = (windowsByVariant.value[variantId] || []).filter((window) => window.availability_type === 'PRODUCT_WINDOW')
    if (purchaseRows.length > 0) {
      return `Purchases are currently blocked. This variant may have availability windows configured.`
    }
    return 'This variant is outside its purchase window.'
  }
  return ''
})

function discountNames(variant: ProductVariantList) {
  if (!Array.isArray(variant.context_discounts)) {
    return []
  }

  return variant.context_discounts
    .map((item) => {
      if (typeof item !== 'object' || item === null || !('name' in item)) {
        return null
      }
      const record = item as { name?: unknown; value?: unknown }
      if (typeof record.name !== 'string' || !record.name.trim()) {
        return null
      }
      if (typeof record.value === 'string' && record.value.trim()) {
        return `${record.name} (${record.value})`
      }
      return record.name
    })
    .filter((value): value is string => Boolean(value))
}
</script>
