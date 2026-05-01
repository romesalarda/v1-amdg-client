import { computed } from 'vue'
import { useQueries } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import { productsListVariantsList } from '~/api/sdk.gen'
import type { ProductList, ProductVariantList } from '~/api/types.gen'

export type VariantStockFilters = {
  search?: string
  low_stock?: boolean
  in_stock?: boolean
  is_active?: boolean
  min_stock?: number
  max_stock?: number
  size?: 'LG' | 'MD' | 'NA' | 'OS' | 'SM' | 'XL' | 'XS'
  color?: string
  ordering?: string
  page?: number
  page_size?: number
}

export type VariantWithProductImage = ProductVariantList & {
  _product_main_image: { id?: number; url?: string | null } | null
}

/**
 * Fetch variants for each product in the list in parallel, applying optional stock filters.
 * Returns a flat aggregated list of variants across all products along with pagination meta.
 */
export function useEventVariantStockAlerts(
  products: MaybeRefOrGetter<ProductList[]>,
  filters: MaybeRefOrGetter<VariantStockFilters>,
) {
  const productImageMap = computed<Map<number, { id?: number; url?: string | null } | null>>(() => {
    const map = new Map<number, { id?: number; url?: string | null } | null>()
    for (const product of toValue(products)) {
      map.set(product.id, product.main_image ?? null)
    }
    return map
  })

  const variantQueries = useQueries({
    queries: computed(() =>
      toValue(products).map((product) => {
        const f = toValue(filters)
        return {
          queryKey: ['product-variants', 'list', product.product_id, f] as const,
          queryFn: () =>
            productsListVariantsList({
              path: { product_product_id: product.product_id },
              query: {
                search: f.search || undefined,
                low_stock: f.low_stock,
                in_stock: f.in_stock,
                is_active: f.is_active,
                min_stock: f.min_stock,
                max_stock: f.max_stock,
                size: f.size,
                color: f.color || undefined,
                ordering: f.ordering,
                page: f.page,
                page_size: f.page_size,
              },
            }),
          enabled: !!product.product_id,
        }
      }),
    ),
  })

  const isLoading = computed(() => toValue(products).length > 0 && variantQueries.value.some((q) => q.isLoading))

  const isFetching = computed(() => variantQueries.value.some((q) => q.isFetching))

  /**
   * Flat list of all variants across products, enriched with the product fallback image.
   */
  const variants = computed<VariantWithProductImage[]>(() => {
    const results: VariantWithProductImage[] = []
    for (const q of variantQueries.value) {
      const items = (q.data as any)?.data?.results as ProductVariantList[] | undefined
      if (!items) continue
      for (const variant of items) {
        results.push({
          ...variant,
          _product_main_image: productImageMap.value.get(variant.product) ?? null,
        })
      }
    }
    return results
  })

  /** Total count across all product variant queries */
  const totalCount = computed(() => {
    let total = 0
    for (const q of variantQueries.value) {
      const count = (q.data as any)?.data?.count as number | undefined
      if (count != null) total += count
    }
    return total
  })

  return {
    variants,
    totalCount,
    isLoading,
    isFetching,
    productImageMap,
  }
}
