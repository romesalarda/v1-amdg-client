<template>
  <article class="rounded-3xl border border-deep-navy/10 bg-white p-5 shadow-sm">
    <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
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
            class="overflow-hidden rounded-lg border"
            :class="activeImageUrl === image ? 'border-deep-navy' : 'border-deep-navy/15'"
            @click="activeImageUrl = image"
          >
            <img :src="image" alt="Variant preview" class="h-14 w-full object-cover">
          </button>
        </div>
      </div>

      <div>
        <p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/50">{{ product.display_code }}</p>
        <h3 class="mt-2 text-2xl font-black text-deep-navy">{{ product.title }}</h3>
        <p class="mt-1 text-sm text-deep-navy/60">{{ product.event_name }}</p>

        <div class="mt-4 flex items-center gap-2">
          <p class="text-xl font-black text-deep-navy">
            {{ activePrice}}
          </p>
          <span class="rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wide" :class="stockBadgeClass(activeVariant)">
            {{ stockLabel(activeVariant) }}
          </span>
          <span class="rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wide" :class="availabilityStatusClass(activeVariant.variant_id)">
            {{ availabilityStatusLabel(activeVariant.variant_id) }}
          </span>
        </div>

        <p class="mt-2 text-xs text-deep-navy/65">{{ availabilityDescription(activeVariant.variant_id) }}</p>

        <div class="mt-5">
          <p class="text-[11px] font-black uppercase tracking-[0.18em] text-deep-navy/55">Choose colour</p>
          <div class="mt-2 flex flex-wrap gap-2">
            <button
              v-for="option in colorOptions"
              :key="option.value"
              type="button"
              class="rounded-full border px-3 py-1.5 text-xs font-semibold transition"
              :class="selectedColor === option.value ? 'border-deep-navy bg-deep-navy text-white' : 'border-deep-navy/20 bg-white text-deep-navy hover:border-deep-navy/45'"
              @click="selectColor(option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

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

        <div class="mt-5 flex items-center gap-3">
          <input
            v-model.number="activeQuantity"
            type="number"
            min="1"
            :max="maxQuantity(activeVariant)"
            class="w-24 rounded-xl border border-deep-navy/20 px-3 py-2 text-sm"
            :disabled="!canAddVariant(activeVariant) || addingVariantId === activeVariant.variant_id"
          >
          <button
            type="button"
            class="rounded-xl bg-deep-navy px-5 py-2.5 text-xs font-black uppercase tracking-wide text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="!canAddVariant(activeVariant) || addingVariantId === activeVariant.variant_id"
            @click="handleAdd(activeVariant)"
          >
            {{ addingVariantId === activeVariant.variant_id ? 'Adding...' : 'Add to Cart' }}
          </button>
        </div>

        <p class="mt-3 text-[11px] text-deep-navy/60">Discounts are validated server-side once item is added to cart.</p>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { AvailabilityWindow, ProductList, ProductVariantList } from '~/api/types.gen'
import { productVariantsAvailabilityWindowsList } from '~/api/sdk.gen'
import { useProductVariants } from '~/composables/resources/products/productVariants'
import { formatDateTime } from '~/utils/time'
import { formatMoney } from '~/utils/money'

const props = defineProps<{
  product: ProductList
  currencyCode?: string
}>()

const emit = defineEmits<{
  add: [payload: { variantId: string; quantity: number }]
}>()

const variantQuery = useProductVariants(computed(() => props.product.product_id))
const isLoading = computed(() => variantQuery.isLoading.value)
const resolvedCurrencyCode = computed(() => props.currencyCode || 'GBP')
const productPrice = computed(() => props.product.final_price || props.product.base_amount || '0')
const variantRows = computed<ProductVariantList[]>(() => {
  const results = variantQuery.data.value?.data?.results
  return Array.isArray(results) ? (results as ProductVariantList[]) : []
})

const windowsByVariant = ref<Record<string, AvailabilityWindow[]>>({})
const quantities = ref<Record<string, number>>({})
const selectedVariantId = ref<string>('')
const selectedColor = ref<string>('')
const selectedSize = ref<string>('')
const activeImageUrl = ref<string>('https://placehold.co/800x600?text=Product')
const addingVariantId = ref<string | null>(null)

type ColorOption = {
  value: string
  label: string
}

type SizeOption = {
  variant: ProductVariantList
  modifierText: string
}

const activeVariant = computed(() => {
  if (!variantRows.value.length) {
    return {
      variant_id: '',
      size_display: 'Variant unavailable',
      color: '',
      stock_quantity: 0,
      max_purchase_quantity_per_order: 1,
      is_active: false,
      is_in_stock: false,
      final_price: productPrice.value,
      images: {},
    } as ProductVariantList
  }

  return variantRows.value.find((row) => row.variant_id === selectedVariantId.value) || variantRows.value[0]
})

const galleryImages = computed(() => {
  const variant = activeVariant.value
  const images: string[] = []
  const main = variant?.images?.main?.url
  if (main) images.push(main)
  ;(variant?.images?.additional || []).forEach((image) => {
    if (image.url) images.push(image.url)
  })
  if (!images.length && props.product.main_image?.url) {
    images.push(props.product.main_image.url)
  }
  if (!images.length) {
    images.push('https://placehold.co/800x600?text=Product')
  }
  return [...new Set(images)]
})

const activePrice = computed(() => activeVariant.value?.final_price || productPrice.value || '0')
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
      modifierText: `${sign}${formatMoney(Math.abs(delta).toFixed(2), resolvedCurrencyCode.value)}`,
    }
  })
})

const activeQuantity = computed({
  get: () => {
    const variantId = activeVariant.value?.variant_id
    if (!variantId) return 1
    return Math.max(1, quantities.value[variantId] || 1)
  },
  set: (next: number) => {
    const variant = activeVariant.value
    if (!variant?.variant_id) return
    const safe = Number.isNaN(Number(next)) ? 1 : Math.min(Math.max(1, Number(next)), maxQuantity(variant))
    quantities.value[variant.variant_id] = safe
  },
})

watch(
  variantRows,
  async (rows) => {
    if (!rows.length) {
      selectedVariantId.value = ''
      selectedColor.value = ''
      selectedSize.value = ''
      windowsByVariant.value = {}
      quantities.value = {}
      return
    }

    const nextQuantities: Record<string, number> = {}
    rows.forEach((row) => {
      nextQuantities[row.variant_id] = Math.max(1, quantities.value[row.variant_id] || 1)
    })
    quantities.value = nextQuantities

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
              product_product_id: props.product.product_id,
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

function maxQuantity(variant: ProductVariantList) {
  const fromRule = variant.max_purchase_quantity_per_order || 50
  const fromStock = typeof variant.stock_quantity === 'number' ? Math.max(0, variant.stock_quantity) : fromRule
  return Math.max(1, Math.min(fromRule, fromStock))
}

function variantPrice(variant: ProductVariantList) {
  return variant.final_price || productPrice.value || '0'
}

function toAmount(value: string | number | null | undefined) {
  if (value === null || value === undefined) return null
  const parsed = Number.parseFloat(String(value))
  return Number.isFinite(parsed) ? parsed : null
}

function colorKey(color: string | null | undefined) {
  return (color || 'no-color').trim().toLowerCase() || 'no-color'
}

function colorLabel(color: string | null | undefined) {
  return (color || '').trim() || 'Standard'
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

function canAddVariant(variant: ProductVariantList) {
  return !!variant.is_active && !!variant.is_in_stock && !isPreviewOnly(variant.variant_id) && !isWindowBlocked(variant.variant_id)
}

function availabilityStatusLabel(variantId: string) {
  if (isPurchaseOpen(variantId)) return 'Purchasable'
  if (isPreviewOnly(variantId)) return 'Preview'
  if (isWindowBlocked(variantId)) return 'Unavailable'
  return 'Always available'
}

function availabilityStatusClass(variantId: string) {
  if (isPurchaseOpen(variantId)) return 'bg-green-100 text-green-800 border border-green-200'
  if (isPreviewOnly(variantId)) return 'bg-blue-100 text-blue-800 border border-blue-200'
  if (isWindowBlocked(variantId)) return 'bg-amber-100 text-amber-800 border border-amber-200'
  return 'bg-deep-navy/10 text-deep-navy border border-deep-navy/15'
}

function availabilityDescription(variantId: string) {
  if (isPreviewOnly(variantId)) {
    return 'This variant is in preview mode and cannot be added yet.'
  }

  if (isWindowBlocked(variantId)) {
    const purchaseRows = (windowsByVariant.value[variantId] || []).filter((window) => window.availability_type === 'PRODUCT_WINDOW')
    const nextWindow = purchaseRows[0]
    if (nextWindow?.available_from) {
      return `Purchases reopen at ${formatDateTime(nextWindow.available_from)}.`
    }
    return 'This variant is outside its purchase window.'
  }

  return 'Stock and eligibility are validated again in cart and checkout.'
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

function safeQuantity(variant: ProductVariantList) {
  const requested = Number(quantities.value[variant.variant_id] || 1)
  if (Number.isNaN(requested)) return 1
  return Math.min(Math.max(1, requested), maxQuantity(variant))
}

function handleAdd(variant: ProductVariantList) {
  if (!canAddVariant(variant)) return

  const quantity = safeQuantity(variant)
  quantities.value[variant.variant_id] = quantity
  addingVariantId.value = variant.variant_id

  emit('add', {
    variantId: variant.variant_id,
    quantity,
  })

  window.setTimeout(() => {
    if (addingVariantId.value === variant.variant_id) {
      addingVariantId.value = null
    }
  }, 1200)
}
</script>
