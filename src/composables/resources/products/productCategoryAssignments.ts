import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { productsEventCategoriesCreate, productsEventCategoriesDestroy } from '~/api/sdk.gen'

const PRODUCTS_QUERY_KEY = ['products'] as const
const PRODUCT_EVENT_CATEGORIES_QUERY_KEY = ['productEventCategories'] as const

interface ProductCategoryAssignmentInput {
  productPk: number
}

interface BulkAssignCategoryInput {
  eventId: number
  categoryId: number
  products: ProductCategoryAssignmentInput[]
}

interface BulkRemoveCategoryInput {
  associationIds: string[]
}

/**
 * Assign categories to products in bulk using event-category-product associations.
 */
export function useBulkAssignCategoryToProducts() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ eventId, categoryId, products }: BulkAssignCategoryInput) => {
      const creates = products.map(({ productPk }) => {
        return productsEventCategoriesCreate({
          body: {
            event: eventId,
            category: categoryId,
            product: productPk,
          } as any,
        })
      })

      const responses = await Promise.all(creates)

      return {
        responses,
        updatedCount: products.length,
        skippedCount: 0,
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: PRODUCT_EVENT_CATEGORIES_QUERY_KEY })
    },
  })
}

/**
 * Remove category assignments from products in bulk by deleting associations.
 */
export function useBulkRemoveCategoryFromProducts() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ associationIds }: BulkRemoveCategoryInput) => {
      const uniqueAssociationIds = Array.from(new Set(associationIds))

      const deletes = uniqueAssociationIds.map((associationId) =>
        productsEventCategoriesDestroy({
          path: { id: associationId },
        })
      )

      await Promise.all(deletes)

      return {
        removedCount: uniqueAssociationIds.length,
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: PRODUCT_EVENT_CATEGORIES_QUERY_KEY })
    },
  })
}
