import { ref, computed, reactive, watch } from 'vue'
import type { Ref } from 'vue'
import type { EventDetail, ProductList } from '~/api/types.gen'
import { useProducts, useDeleteProduct } from '~/composables/resources/products/products'
import { useProductsOverview } from '~/composables/statistics/products/product-statistics'
import { useTablePagination } from '~/composables/ui/useTablePagination'
import { useTableSearch } from '~/composables/ui/useTableSearch'
import { useCsvExport } from '~/composables/ui/useCsvExport'
import {
  getStockStatusLabel,
  getStockStatusColor,
  getPublicationStatus,
  getPublicationStatusLabel,
  getPublicationStatusColor,
} from '~/schemas/events/productConstants'

export function useProductsTab(eventId: Ref<string>, event: Ref<EventDetail | undefined>) {
  const toast = useToast()
  const { currentPage, pageSize, resetPage } = useTablePagination(25)
  const { searchQuery, debouncedSearch, clearSearch } = useTableSearch(resetPage)
  const { exportProductsToCSV: _exportProductsToCSV } = useCsvExport()

  const showFilters = ref(false)
  const filters = reactive({
    verified: false,
    active: false,
    inStock: false,
    lowStock: false,
    outOfStock: false,
    minPrice: null as number | null,
    maxPrice: null as number | null,
  })

  const currentSort = ref<string | null>(null)
  const sortDirection = ref<'asc' | 'desc'>('asc')

  function setSorting(field: string) {
    if (currentSort.value === field) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      currentSort.value = field
      sortDirection.value = 'asc'
    }
  }

  watch(filters, resetPage, { deep: true })

  const queryParams = computed(() => {
    const eventSlug = event.value?.url_safe_title
    if (!eventSlug) return undefined

    const params: any = {
      event: eventSlug,
      page: currentPage.value,
      page_size: pageSize.value,
    }

    if (debouncedSearch.value) params.search = debouncedSearch.value
    if (currentSort.value) {
      params.ordering = sortDirection.value === 'desc' ? `-${currentSort.value}` : currentSort.value
    }
    if (filters.verified) params.verified = true
    if (filters.active) params.is_active = true
    if (filters.inStock && !filters.outOfStock) params.in_stock = true
    else if (filters.outOfStock && !filters.inStock) params.in_stock = false
    if (filters.minPrice !== null) params.min_price = filters.minPrice
    if (filters.maxPrice !== null) params.max_price = filters.maxPrice

    return params
  })

  const { data: productsData, isLoading } = useProducts(queryParams)
  const products = computed(() => productsData.value?.data?.results || [])
  const totalProducts = computed(() => productsData.value?.data?.count || 0)

  // Statistics — uses the route event ID (slug), same pattern as original dashboard
  const { data: statisticsData } = useProductsOverview({ event_id: eventId.value })
  const activeProductsCount = computed(
    () => (statisticsData.value?.data?.product_summary?.active_products as number) || 0,
  )
  const lowStockCount = computed(
    () => (statisticsData.value?.data?.variant_summary?.low_stock_count as number) || 0,
  )
  const totalRevenue = computed(
    () => (statisticsData.value?.data?.revenue_summary?.total_revenue as string) || '0.00',
  )

  const activeFilterCount = computed(() => {
    let count = 0
    if (filters.verified) count++
    if (filters.active) count++
    if (filters.inStock) count++
    if (filters.lowStock) count++
    if (filters.outOfStock) count++
    if (filters.minPrice !== null) count++
    if (filters.maxPrice !== null) count++
    return count
  })

  function clearAllFilters() {
    clearSearch()
    filters.verified = false
    filters.active = false
    filters.inStock = false
    filters.lowStock = false
    filters.outOfStock = false
    filters.minPrice = null
    filters.maxPrice = null
    resetPage()
  }

  // Table selection
  const selectAll = ref(false)
  const selectedProducts = ref<string[]>([])

  function toggleSelectAll() {
    if (selectAll.value) {
      selectedProducts.value = products.value.map((p: ProductList) => p.product_id!)
    } else {
      selectedProducts.value = []
    }
  }

  // Preview modal
  const isPreviewOpen = ref(false)
  const selectedProduct = ref<ProductList | null>(null)

  function viewProductDetails(product: ProductList) {
    selectedProduct.value = product
    isPreviewOpen.value = true
  }

  const deleteProductMutation = useDeleteProduct()
  const isDeleting = ref(false)

  function clearSelection() {
    selectedProducts.value = []
    selectAll.value = false
  }

  async function deleteProduct(product: ProductList) {
    if (!product.product_id || isDeleting.value) return
    if (!window.confirm(`Delete "${product.title}"? This cannot be undone.`)) return

    isDeleting.value = true
    try {
      await deleteProductMutation.mutateAsync(product.product_id)
      selectedProducts.value = selectedProducts.value.filter((id) => id !== product.product_id)
      toast.add({ title: 'Product deleted', description: `"${product.title}" was deleted`, color: 'green' })
    } catch (error: any) {
      toast.add({
        title: 'Delete failed',
        description: error?.message || 'Failed to delete product',
        color: 'red',
      })
    } finally {
      isDeleting.value = false
    }
  }

  async function bulkDeleteProducts() {
    const ids = [...selectedProducts.value]
    if (ids.length === 0 || isDeleting.value) return
    if (!window.confirm(`Delete ${ids.length} selected product${ids.length === 1 ? '' : 's'}? This cannot be undone.`)) return

    isDeleting.value = true
    try {
      const results = await Promise.allSettled(ids.map((id) => deleteProductMutation.mutateAsync(id)))
      const failedIds = ids.filter((_, i) => results[i].status === 'rejected')
      const deletedCount = ids.length - failedIds.length

      selectedProducts.value = failedIds
      selectAll.value = false

      if (deletedCount > 0) {
        toast.add({
          title: 'Products deleted',
          description: `${deletedCount} product${deletedCount === 1 ? '' : 's'} deleted`,
          color: 'green',
        })
      }
      if (failedIds.length > 0) {
        toast.add({
          title: 'Some deletions failed',
          description: `${failedIds.length} product${failedIds.length === 1 ? '' : 's'} could not be deleted`,
          color: 'red',
        })
      }
    } finally {
      isDeleting.value = false
    }
  }

  function formatCurrency(amount?: number | string | null) {
    if (!amount) return '£0.00'
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return `£${num.toFixed(2)}`
  }

  function getProductStockStatus(product: ProductList) {
    if (product.variant_count === 0) return 'out-of-stock' as const
    return 'in-stock' as const
  }

  function exportProductsToCSV() {
    _exportProductsToCSV(products.value)
  }

  return {
    // Pagination
    currentPage,
    pageSize,
    // Search
    searchQuery,
    // Filters
    showFilters,
    filters,
    activeFilterCount,
    clearAllFilters,
    // Sorting
    currentSort,
    sortDirection,
    setSorting,
    // Data
    products,
    totalProducts,
    isLoading,
    // Statistics
    activeProductsCount,
    lowStockCount,
    totalRevenue,
    // Selection
    selectAll,
    selectedProducts,
    toggleSelectAll,
    // Preview
    isPreviewOpen,
    selectedProduct,
    viewProductDetails,
    // Deletion
    isDeleting,
    deleteProduct,
    bulkDeleteProducts,
    clearSelection,
    // Helpers
    formatCurrency,
    getProductStockStatus,
    getStockStatusLabel,
    getStockStatusColor,
    getPublicationStatus,
    getPublicationStatusLabel,
    getPublicationStatusColor,
    exportProductsToCSV,
  }
}
