import { ref, computed, reactive, watch } from 'vue'
import type { Ref } from 'vue'
import type { EventDetail } from '~/api/types.gen'
import { useProducts } from '~/composables/resources/products/products'
import { useEventVariantStockAlerts } from '~/composables/resources/products/eventVariantStockAlerts'
import { useTableSearch } from '~/composables/ui/useTableSearch'
import type { VariantWithProductImage } from '~/composables/resources/products/eventVariantStockAlerts'

export function useStockAlertsTab(event: Ref<EventDetail | undefined>) {
  const { searchQuery, debouncedSearch, clearSearch } = useTableSearch()

  const filters = reactive({
    lowStock: true,
    inStock: undefined as boolean | undefined,
    isActive: undefined as boolean | undefined,
    minStock: undefined as number | undefined,
    maxStock: undefined as number | undefined,
    size: undefined as 'LG' | 'MD' | 'NA' | 'OS' | 'SM' | 'XL' | 'XS' | undefined,
    color: '',
    ordering: 'stock_quantity' as string,
  })

  const currentPage = ref(1)
  const pageSize = ref(20)

  watch([debouncedSearch, () => ({ ...filters })], () => {
    currentPage.value = 1
  })

  // ── Products query (all products for this event) ──────────────────────────
  const productsQuery = computed(() => {
    const eventSlug = event.value?.url_safe_title
    if (!eventSlug) return undefined
    return { event: eventSlug, page_size: 200 }
  })

  const { data: productsData, isLoading: productsLoading } = useProducts(productsQuery)
  const products = computed(() => productsData.value?.data?.results ?? [])

  // ── Per-product variant queries ───────────────────────────────────────────
  const variantFilters = computed(() => ({
    search: debouncedSearch.value || undefined,
    low_stock: filters.lowStock || undefined,
    in_stock: filters.inStock,
    is_active: filters.isActive,
    min_stock: filters.minStock,
    max_stock: filters.maxStock,
    size: filters.size,
    color: filters.color || undefined,
    ordering: filters.ordering,
    page: currentPage.value,
    page_size: pageSize.value,
  }))

  const { variants, totalCount, isLoading: variantsLoading, isFetching } = useEventVariantStockAlerts(
    products,
    variantFilters,
  )

  const isLoading = computed(() => productsLoading.value || variantsLoading.value)

  // ── Helpers ───────────────────────────────────────────────────────────────
  function getVariantStockColor(variant: VariantWithProductImage) {
    const stock = variant.stock_quantity ?? 0
    if (stock === 0) return 'red'
    if (stock <= 5) return 'amber'
    if (stock <= 15) return 'yellow'
    return 'green'
  }

  function getVariantStockLabel(variant: VariantWithProductImage) {
    const stock = variant.stock_quantity ?? 0
    if (stock === 0) return 'Out of Stock'
    if (stock <= 5) return 'Critical'
    if (stock <= 15) return 'Low Stock'
    return 'In Stock'
  }

  function getVariantImage(variant: VariantWithProductImage): string | null {
    return variant.images?.main?.url ?? variant._product_main_image?.url ?? null
  }

  function clearFilters() {
    filters.lowStock = true
    filters.inStock = undefined
    filters.isActive = undefined
    filters.minStock = undefined
    filters.maxStock = undefined
    filters.size = undefined
    filters.color = ''
    filters.ordering = 'stock_quantity'
    currentPage.value = 1
    clearSearch()
  }

  const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))
  const hasFiltersActive = computed(() =>
    !filters.lowStock ||
    filters.inStock !== undefined ||
    filters.isActive !== undefined ||
    filters.minStock !== undefined ||
    filters.maxStock !== undefined ||
    filters.size !== undefined ||
    !!filters.color ||
    !!debouncedSearch.value,
  )

  return {
    // search
    searchQuery,
    clearSearch,
    // filters
    filters,
    clearFilters,
    hasFiltersActive,
    // pagination
    currentPage,
    pageSize,
    totalPages,
    totalCount,
    // data
    products,
    variants,
    isLoading,
    isFetching,
    // helpers
    getVariantStockColor,
    getVariantStockLabel,
    getVariantImage,
  }
}
