<template>
  <article
    class="overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200"
    :class="[
      step !== 'initial' ? 'border-deep-navy/25 shadow-md' : 'border-deep-navy/10',
      addDisabled && step === 'initial' ? 'opacity-60' : '',
    ]"
  >
    <!-- Product image -->
    <div class="relative h-44 overflow-hidden bg-mist-blue">
      <img
        :src="activeImageUrl"
        :alt="product.title"
        class="h-full w-full object-cover transition-opacity duration-300"
      >
      <!-- Step progress strip -->
      <div v-if="step !== 'initial'" class="absolute bottom-0 left-0 right-0 flex gap-0.5 px-3 pb-2">
        <div
          class="h-0.5 flex-1 rounded-full transition-colors duration-300"
          :class="['size', 'color', 'quantity'].includes(step) ? 'bg-white' : 'bg-white/30'"
        />
        <div
          class="h-0.5 flex-1 rounded-full transition-colors duration-300"
          :class="['color', 'quantity'].includes(step) ? 'bg-white' : 'bg-white/30'"
        />
        <div
          class="h-0.5 flex-1 rounded-full transition-colors duration-300"
          :class="step === 'quantity' ? 'bg-white' : 'bg-white/30'"
        />
      </div>
    </div>

    <!-- Card body -->
    <div class="p-4">
      <!-- Always-visible header -->
      <div class="flex items-start gap-3 justify-between justify-items-center items-center">
        <div class="min-w-0 flex-1">
          <h3 class="line-clamp-2 text-sm font-black leading-snug text-deep-navy">
            {{ product.title }}
          </h3>
          <div class="mt-1 flex flex-wrap items-center gap-1.5">
            <span class="text-base font-black text-deep-navy">{{ activePrice }}</span>
            <span
              v-if="step !== 'initial' && activeVariant.context_has_discount"
              class="rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-emerald-700"
            >
              Discount
            </span>
            <span
              v-if="step !== 'initial' && selectedSize"
              class="rounded-full bg-deep-navy/[0.07] px-2 py-0.5 text-[10px] font-semibold text-deep-navy"
            >
              {{ selectedSize }}
            </span>
            <span
              v-if="step === 'quantity' && selectedColor && selectedColor !== 'no-color'"
              class="rounded-full bg-deep-navy/[0.07] px-2 py-0.5 text-[10px] font-semibold capitalize text-deep-navy"
            >
              {{ colorLabel(activeVariant.color) }}
            </span>
          </div>
        </div>

        <!-- Buy / Close -->
        <div class="shrink-0">
          <button
            v-if="step === 'initial'"
            type="button"
            :disabled="addDisabled"
            class="inline-flex items-center gap-1 rounded-xl bg-deep-navy px-3.5 py-2 text-[11px] font-black uppercase tracking-wide text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            @click="startBuy"
          >
            Buy
            <span class="material-symbols-outlined text-sm leading-none">add_shopping_cart</span>
          </button>
          <button
            v-else
            type="button"
            class="rounded-lg p-1.5 text-deep-navy/40 transition-colors hover:bg-deep-navy/[0.06] hover:text-deep-navy"
            @click="closeSteps"
          >
            <span class="material-symbols-outlined text-base leading-none">close</span>
          </button>
        </div>
      </div>

      <!-- Blocked reason -->
      <p v-if="addDisabled && addDisabledReason" class="mt-2 text-[11px] text-amber-700">
        {{ addDisabledReason }}
      </p>

      <!-- Animated step content -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-1"
        mode="out-in"
      >
        <!-- Loading skeleton (variants loading while step is open) -->
        <div v-if="step !== 'initial' && isLoading" key="skeleton" class="mt-4 animate-pulse space-y-2">
          <div class="h-3 w-20 rounded bg-deep-navy/[0.06]" />
          <div class="flex gap-2">
            <div class="h-9 w-14 rounded-xl bg-deep-navy/[0.06]" />
            <div class="h-9 w-14 rounded-xl bg-deep-navy/[0.06]" />
            <div class="h-9 w-14 rounded-xl bg-deep-navy/[0.06]" />
          </div>
        </div>

        <!-- Size step -->
        <div v-else-if="step === 'size'" key="size" class="mt-4">
          <p class="mb-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-deep-navy/55">
            Choose size
          </p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="option in allSizeOptions"
              :key="option.size"
              type="button"
              class="rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors"
              :class="
                option.hasStock
                  ? 'border-deep-navy/20 text-deep-navy hover:border-deep-navy hover:bg-deep-navy/[0.04]'
                  : 'cursor-not-allowed border-deep-navy/8 text-deep-navy/30'
              "
              :disabled="!option.hasStock"
              @click="pickSize(option.size)"
            >
              {{ option.size }}
            </button>
          </div>
        </div>

        <!-- Colour step -->
        <div v-else-if="step === 'color'" key="color" class="mt-4">
          <div class="mb-2.5 flex items-center justify-between">
            <p class="text-[10px] font-black uppercase tracking-[0.18em] text-deep-navy/55">
              Choose colour
            </p>
            <button
              type="button"
              class="flex items-center gap-0.5 text-[10px] font-semibold text-deep-navy/45 transition-colors hover:text-deep-navy"
              @click="stepBack"
            >
              <span class="material-symbols-outlined text-xs leading-none">arrow_back</span>
              Back
            </button>
          </div>
          <div class="space-y-1.5">
            <button
              v-for="option in colorsForSelectedSize"
              :key="option.value"
              type="button"
              class="flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-xs transition-colors"
              :class="
                canAddVariant(option.variant)
                  ? 'border-deep-navy/15 hover:border-deep-navy hover:bg-deep-navy/[0.03]'
                  : 'cursor-not-allowed border-deep-navy/8 opacity-45'
              "
              :disabled="!canAddVariant(option.variant)"
              @click="pickColor(option)"
            >
              <span
                class="h-4 w-4 shrink-0 rounded-full border"
                :class="option.hex ? 'border-deep-navy/15' : 'border-dashed border-deep-navy/20'"
                :style="option.hex ? { backgroundColor: option.hex } : {}"
              />
              <span class="flex-1 font-semibold text-deep-navy">{{ option.label }}</span>
              <span class="text-[10px] text-deep-navy/50">
                <template v-if="!option.variant.is_active">Inactive</template>
                <template v-else-if="!option.variant.is_in_stock">Out of stock</template>
                <template v-else>
                  {{ option.variant.stock_quantity }} in stock
                  <template v-if="typeof option.variant.context_remaining_quantity === 'number'">
                    &middot; {{ Math.max(0, option.variant.context_remaining_quantity) }} for you
                  </template>
                </template>
              </span>
            </button>
          </div>
        </div>

        <!-- Quantity step -->
        <div v-else-if="step === 'quantity'" key="quantity" class="mt-4">
          <!-- Discount names + back -->
          <div class="mb-3 flex items-start justify-between gap-2">
            <ul v-if="discountNames(activeVariant).length" class="space-y-0.5">
              <li
                v-for="(name, i) in discountNames(activeVariant)"
                :key="i"
                class="flex items-center gap-1 text-[11px] text-emerald-800"
              >
                <span class="material-symbols-outlined text-xs leading-none">local_offer</span>
                {{ name }}
              </li>
            </ul>
            <div v-else />
            <button
              type="button"
              class="flex shrink-0 items-center gap-0.5 text-[10px] font-semibold text-deep-navy/45 transition-colors hover:text-deep-navy"
              @click="stepBack"
            >
              <span class="material-symbols-outlined text-xs leading-none">arrow_back</span>
              Back
            </button>
          </div>

          <!-- Availability banner -->
          <div
            v-if="availabilityBanner(activeVariant.variant_id)"
            class="mb-3 rounded-xl border p-3"
            :class="availabilityBanner(activeVariant.variant_id)?.classes"
          >
            <div class="flex items-start gap-2">
              <span class="material-symbols-outlined text-sm leading-none">
                {{ availabilityBanner(activeVariant.variant_id)?.icon }}
              </span>
              <div>
                <p class="text-[11px] font-black uppercase tracking-wide">
                  {{ availabilityBanner(activeVariant.variant_id)?.title }}
                </p>
                <p class="mt-0.5 text-[11px]">
                  {{ availabilityBanner(activeVariant.variant_id)?.message }}
                </p>
              </div>
            </div>
          </div>

          <!-- Remaining for attendee -->
          <p
            v-if="typeof activeVariant.context_remaining_quantity === 'number'"
            class="mb-3 text-xs font-semibold text-deep-navy/65"
          >
            {{ Math.max(0, activeVariant.context_remaining_quantity) }} remaining for this attendee
          </p>

          <!-- Qty stepper + Add to Cart -->
          <div class="flex items-center gap-2">
            <div class="flex items-center overflow-hidden rounded-xl border border-deep-navy/20">
              <button
                type="button"
                class="px-3 py-2.5 text-sm font-bold text-deep-navy transition-colors hover:bg-deep-navy/[0.05] disabled:cursor-not-allowed disabled:opacity-35"
                :disabled="activeQuantity <= 1 || !canAddVariant(activeVariant) || !!addingVariantId"
                @click="decrementQty"
              >
                &minus;
              </button>
              <span class="min-w-[2.25rem] py-2 text-center text-sm font-black text-deep-navy">
                {{ activeQuantity }}
              </span>
              <button
                type="button"
                class="px-3 py-2.5 text-sm font-bold text-deep-navy transition-colors hover:bg-deep-navy/[0.05] disabled:cursor-not-allowed disabled:opacity-35"
                :disabled="activeQuantity >= maxQuantity(activeVariant) || !canAddVariant(activeVariant) || !!addingVariantId"
                @click="incrementQty"
              >
                +
              </button>
            </div>
            <button
              type="button"
              class="flex-1 rounded-xl bg-deep-navy px-4 py-2.5 text-[11px] font-black uppercase tracking-wide text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="!canAddVariant(activeVariant) || !!addingVariantId || addDisabled"
              @click="handleAdd(activeVariant)"
            >
              {{ addingVariantId === activeVariant.variant_id ? 'Adding…' : 'Add to Cart' }}
            </button>
          </div>

          <!-- Context blocker message -->
          <p
            v-if="
              isPreviewOnly(activeVariant.variant_id) ||
              isWindowBlocked(activeVariant.variant_id) ||
              activeVariant.context_can_purchase === false
            "
            class="mt-2 text-[11px] text-deep-navy/55"
          >
            {{ availabilityDescription(activeVariant.variant_id) }}
          </p>
        </div>
      </Transition>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { AvailabilityWindow, ProductList, ProductVariantList } from '~/api/types.gen'
import { productVariantsAvailabilityWindowsList, productsAvailabilityWindowsList } from '~/api/sdk.gen'
import { useProductVariants } from '~/composables/resources/products/productVariants'
import { formatDateTime } from '~/utils/time'
import { formatMoney } from '~/utils/money'

const props = defineProps<{
  product: ProductList
  attendeeId?: string
  currencyCode?: string
  addDisabled?: boolean
  addDisabledReason?: string
}>()

const addDisabled = computed(() => !!props.addDisabled)
const addDisabledReason = computed(() => String(props.addDisabledReason || '').trim())

const emit = defineEmits<{
  add: [payload: { variantId: string; quantity: number }]
}>()

const variantQuery = useProductVariants(
  computed(() => ({
    productId: props.product.product_id,
    attendeeId: props.attendeeId,
  }))
)
const isLoading = computed(() => variantQuery.isLoading.value)
const resolvedCurrencyCode = computed(() => props.currencyCode || 'GBP')
const productPrice = computed(() => props.product.final_price || props.product.base_amount || '0')
const variantRows = computed<ProductVariantList[]>(() => {
  const results = variantQuery.data.value?.data?.results
  return Array.isArray(results) ? (results as ProductVariantList[]) : []
})

const productWindows = ref<AvailabilityWindow[]>([])
const windowsByVariant = ref<Record<string, AvailabilityWindow[]>>({})
const quantities = ref<Record<string, number>>({})
const selectedVariantId = ref<string>('')
const selectedColor = ref<string>('')
const selectedSize = ref<string>('')
const activeImageUrl = ref<string>('https://placehold.co/800x600?text=Product')
const addingVariantId = ref<string | null>(null)

// ── Progressive disclosure step management ──────────────────────────────────
type Step = 'initial' | 'size' | 'color' | 'quantity'
const stepHistory = ref<Step[]>(['initial'])
const step = computed<Step>(() => stepHistory.value[stepHistory.value.length - 1] ?? 'initial')

type ColorPickerOption = {
  variant: ProductVariantList
  value: string
  label: string
  hex: string
}

const allSizeOptions = computed(() => {
  const sizeMap = new Map<string, ProductVariantList[]>()
  variantRows.value.forEach((variant) => {
    const size = variant.size_display || 'Standard'
    if (!sizeMap.has(size)) sizeMap.set(size, [])
    sizeMap.get(size)!.push(variant)
  })
  return Array.from(sizeMap.entries()).map(([size, variants]) => ({
    size,
    variants,
    hasStock: variants.some((v) => !!v.is_in_stock && !!v.is_active),
  }))
})

const colorsForSelectedSize = computed<ColorPickerOption[]>(() => {
  const size = selectedSize.value
  const inSize = variantRows.value.filter((v) => (v.size_display || 'Standard') === size)
  const seen = new Set<string>()
  return inSize
    .filter((v) => {
      const key = colorKey(v.color)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .map((v) => ({
      variant: v,
      value: colorKey(v.color),
      label: colorLabel(v.color),
      hex: normalizeHexColor(v.color),
    }))
})

function startBuy() {
  if (addDisabled.value) return
  if (isLoading.value || !variantRows.value.length) {
    stepHistory.value = ['initial', 'size']
    return
  }

  const sizes = allSizeOptions.value
  if (sizes.length > 1) {
    stepHistory.value = ['initial', 'size']
    return
  }

  if (sizes[0]) selectedSize.value = sizes[0].size

  const colors = colorsForSelectedSize.value
  if (colors.length > 1) {
    stepHistory.value = ['initial', 'color']
    return
  }

  if (colors[0]) {
    selectedColor.value = colors[0].value
    selectedVariantId.value = colors[0].variant.variant_id
  }

  stepHistory.value = ['initial', 'quantity']
}

function pickSize(size: string) {
  selectedSize.value = size
  const colors = colorsForSelectedSize.value
  if (colors.length > 1) {
    stepHistory.value = [...stepHistory.value, 'color']
    return
  }

  if (colors[0]) {
    selectedColor.value = colors[0].value
    selectedVariantId.value = colors[0].variant.variant_id
  }
  stepHistory.value = [...stepHistory.value, 'quantity']
}

function pickColor(option: ColorPickerOption) {
  selectedColor.value = option.value
  selectedVariantId.value = option.variant.variant_id
  selectedSize.value = option.variant.size_display || ''
  stepHistory.value = [...stepHistory.value, 'quantity']
}

function stepBack() {
  if (stepHistory.value.length > 1) {
    stepHistory.value = stepHistory.value.slice(0, -1)
  }
}

function closeSteps() {
  stepHistory.value = ['initial']
}

function decrementQty() {
  activeQuantity.value = Math.max(1, activeQuantity.value - 1)
}

function incrementQty() {
  activeQuantity.value = Math.min(maxQuantity(activeVariant.value), activeQuantity.value + 1)
}

// Auto-advance when variants finish loading while user is waiting in the size step
watch([variantRows, step], ([rows, currentStep]) => {
  if (currentStep === 'size' && rows.length > 0 && allSizeOptions.value.length === 1) {
    closeSteps()
    startBuy()
  }
})

// Reset step when attendee switches
watch(
  () => props.attendeeId,
  () => {
    stepHistory.value = ['initial']
  }
)
// ────────────────────────────────────────────────────────────────────────────

type ColorOption = {
  value: string
  label: string
  hex?: string
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

const activePrice = computed(() => activeVariant.value?.context_final_price || activeVariant.value?.final_price || productPrice.value || '0')
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
      productWindows.value = []
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
    let nextProductWindows: AvailabilityWindow[] = []
    await Promise.all(
      [
        (async () => {
          try {
            const response = await productsAvailabilityWindowsList({
              path: {
                product_id: props.product.product_id,
              },
            })
            const resultRows = (response.data as { results?: AvailabilityWindow[] } | undefined)?.results
            nextProductWindows = Array.isArray(resultRows) ? (resultRows as AvailabilityWindow[]) : []
          } catch {
            nextProductWindows = []
          }
        })(),
        ...rows.map(async (row) => {
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
        }),
      ]
    )

    productWindows.value = nextProductWindows
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

function evaluateWindowState(rows: AvailabilityWindow[]) {
  const activePurchase = rows.some((window) => window.availability_type === 'PRODUCT_WINDOW' && window.is_active)
  const activePreview = rows.some((window) => window.availability_type === 'PRODUCT_PREVIEW_WINDOW' && window.is_active)
  const hasConfiguredPurchase = rows.some((window) => window.availability_type === 'PRODUCT_WINDOW')

  if (activePurchase) return 'purchase'
  if (activePreview) return 'preview'
  if (hasConfiguredPurchase) return 'blocked'
  return 'always'
}

function productWindowState() {
  return evaluateWindowState(productWindows.value || [])
}

function variantWindowState(variantId: string) {
  return evaluateWindowState(windowsByVariant.value[variantId] || [])
}

function effectiveAvailabilityState(variantId: string) {
  const productState = productWindowState()
  if (productState === 'blocked' || productState === 'preview') {
    return productState
  }

  const variantState = variantWindowState(variantId)
  if (variantState === 'blocked' || variantState === 'preview') {
    return variantState
  }

  return 'purchase'
}

function activePurchaseWindow(rows: AvailabilityWindow[]) {
  return rows.find((window) => window.availability_type === 'PRODUCT_WINDOW' && window.is_active)
}

function activePreviewWindow(rows: AvailabilityWindow[]) {
  return rows.find((window) => window.availability_type === 'PRODUCT_PREVIEW_WINDOW' && window.is_active)
}

function nextPurchaseWindow(rows: AvailabilityWindow[]) {
  const now = new Date()
  const candidates = rows
    .filter((window) => window.availability_type === 'PRODUCT_WINDOW' && !!window.available_from)
    .map((window) => ({
      window,
      from: new Date(window.available_from || ''),
    }))
    .filter((item) => Number.isFinite(item.from.getTime()) && item.from > now)
    .sort((a, b) => a.from.getTime() - b.from.getTime())

  return candidates[0]?.window
}

function daysRemaining(endDate?: string) {
  if (!endDate) return null
  const now = new Date()
  const end = new Date(endDate)
  if (!Number.isFinite(end.getTime())) return null
  const diff = end.getTime() - now.getTime()
  if (diff <= 0) return 0
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function availabilityBanner(variantId: string): {
  title: string
  message: string
  icon: string
  classes: string
} | null {
  const state = effectiveAvailabilityState(variantId)
  const productState = productWindowState()
  const variantWindowRows = windowsByVariant.value[variantId] || []
  const governingRows = productState === 'always' ? variantWindowRows : productWindows.value

  if (state === 'blocked') {
    const nextWindow = nextPurchaseWindow(governingRows)
    return {
      title: 'No longer available',
      message: nextWindow?.available_from
        ? `Sales reopen on ${formatDateTime(nextWindow.available_from)}.`
        : 'This item is no longer available for purchase.',
      icon: 'event_busy',
      classes: 'border-red-200 bg-red-50 text-red-900',
    }
  }

  if (state === 'preview') {
    const previewWindow = activePreviewWindow(governingRows)
    return {
      title: 'Preview only',
      message: previewWindow?.available_to
        ? `Preview ends on ${formatDateTime(previewWindow.available_to)}.`
        : 'This item is visible but not purchasable yet.',
      icon: 'visibility',
      classes: 'border-blue-200 bg-blue-50 text-blue-900',
    }
  }

  const purchaseWindow = productState !== 'always'
    ? activePurchaseWindow(productWindows.value)
    : activePurchaseWindow(variantWindowRows)

  const remaining = daysRemaining(purchaseWindow?.available_to)
  if (remaining !== null && remaining <= 7) {
    return {
      title: remaining <= 1 ? 'Last day to purchase' : `${remaining} days left to purchase`,
      message: purchaseWindow?.available_to
        ? `This window closes on ${formatDateTime(purchaseWindow.available_to)}.`
        : 'Availability is time-limited.',
      icon: 'warning',
      classes: 'border-amber-200 bg-amber-50 text-amber-900',
    }
  }

  return null
}

function isPurchaseOpen(variantId: string) {
  return effectiveAvailabilityState(variantId) === 'purchase'
}

function isPreviewOnly(variantId: string) {
  return effectiveAvailabilityState(variantId) === 'preview'
}

function isWindowBlocked(variantId: string) {
  return effectiveAvailabilityState(variantId) === 'blocked'
}

function maxQuantity(variant: ProductVariantList) {
  const remaining =
    typeof variant.context_remaining_quantity === 'number'
      ? Math.max(0, variant.context_remaining_quantity)
      : undefined
  const fromRule = remaining ?? (variant.max_purchase_quantity_per_order || 50)
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
  const blockedByContext = variant.context_can_purchase === false || (typeof variant.context_remaining_quantity === 'number' && variant.context_remaining_quantity <= 0)
  return !!variant.is_active && !!variant.is_in_stock && !isPreviewOnly(variant.variant_id) && !isWindowBlocked(variant.variant_id) && !blockedByContext
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
  const variant = variantRows.value.find((row) => row.variant_id === variantId)
  if (variant?.context_can_purchase === false) {
    return 'This attendee does not currently meet purchase requirements for this variant.'
  }

  if (typeof variant?.context_remaining_quantity === 'number' && variant.context_remaining_quantity <= 0) {
    return 'This attendee has reached the purchase limit for this variant.'
  }

  if (isPreviewOnly(variantId)) {
    if (productWindowState() === 'preview') {
      return 'This product is currently in preview mode and cannot be purchased yet.'
    }
    return 'This variant is in preview mode and cannot be added yet.'
  }

  if (isWindowBlocked(variantId)) {
    const purchaseRows = (
      productWindowState() === 'blocked'
        ? productWindows.value
        : windowsByVariant.value[variantId] || []
    ).filter((window) => window.availability_type === 'PRODUCT_WINDOW')
    const nextWindow = purchaseRows[0]
    if (nextWindow?.available_from) {
      return `Purchases reopen at ${formatDateTime(nextWindow.available_from)}.`
    }
    if (productWindowState() === 'blocked') {
      return 'This product is no longer available for purchase.'
    }
    return 'This variant is no longer available for purchase.'
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

function handleAdd(variant: ProductVariantList) {
  if (addDisabled.value) return
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
      stepHistory.value = ['initial']
    }
  }, 1200)
}
</script>
