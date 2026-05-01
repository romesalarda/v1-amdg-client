import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import type { EventDetail, ProductList } from '~/api/types.gen'
import { useProducts } from '~/composables/resources/products/products'

export function useStockAlertsTab(event: Ref<EventDetail | undefined>) {
  const stockAlertThreshold = ref(20)

  const productsQuery = computed(() => {
    const eventSlug = event.value?.url_safe_title
    if (!eventSlug) return undefined
    return { event: eventSlug, page_size: 100 }
  })

  const { data: productsData, isLoading } = useProducts(productsQuery)
  const products = computed(() => productsData.value?.data?.results || [])

  const lowStockProducts = computed(() =>
    products.value
      .filter(product => product.variant_count <= 3)
      .slice(0, 20),
  )

  function getStockAlertColor(product: ProductList) {
    if (product.variant_count === 0) return 'red'
    if (product.variant_count <= 2) return 'amber'
    return 'yellow'
  }

  function getStockAlertLabel(product: ProductList) {
    if (product.variant_count === 0) return 'No Variants'
    if (product.variant_count <= 2) return 'Low Variants'
    return 'Check Variants'
  }

  return {
    stockAlertThreshold,
    isLoading,
    lowStockProducts,
    getStockAlertColor,
    getStockAlertLabel,
  }
}
