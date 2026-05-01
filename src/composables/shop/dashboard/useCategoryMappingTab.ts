import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import type { EventDetail, ProductList } from '~/api/types.gen'
import { useProducts } from '~/composables/resources/products/products'
import { useProductEventCategories } from '~/composables/resources/products/productEventCategories'
import {
  useBulkAssignCategoryToProducts,
  useBulkRemoveCategoryFromProducts,
} from '~/composables/resources/products/productCategoryAssignments'

export function useCategoryMappingTab(event: Ref<EventDetail | undefined>) {
  const toast = useToast()

  const searchQuery = ref('')
  const selectedCategoryId = ref<number | null>(null)
  const selectedProductIds = ref<string[]>([])

  // Event category associations — used to determine what is already mapped
  const eventCategoriesQuery = computed(() => {
    const eventSlug = event.value?.url_safe_title
    if (!eventSlug) return undefined
    return { event: eventSlug, page_size: 100 }
  })

  const { data: eventCategoriesData } = useProductEventCategories(eventCategoriesQuery)
  const eventCategories = computed(() => eventCategoriesData.value?.data?.results || [])

  // Products for the mapping table
  const productsQuery = computed(() => {
    const eventSlug = event.value?.url_safe_title
    if (!eventSlug) return undefined
    return {
      event: eventSlug,
      page_size: 100,
      ...(searchQuery.value ? { search: searchQuery.value } : {}),
    }
  })

  const {
    data: productsData,
    isLoading: productsLoading,
    refetch: refetchProducts,
  } = useProducts(productsQuery)

  const products = computed(() => productsData.value?.data?.results || [])

  const allProductsSelected = computed({
    get: () =>
      products.value.length > 0 &&
      products.value.every(product =>
        selectedProductIds.value.includes(product.product_id as string),
      ),
    set: (checked: boolean) => {
      selectedProductIds.value = checked
        ? products.value.map(product => product.product_id as string)
        : []
    },
  })

  function clearSelection() {
    selectedProductIds.value = []
  }

  function isCategoryAssignedToProduct(product: ProductList) {
    const catId = Number(selectedCategoryId.value)
    if (!Number.isFinite(catId) || catId <= 0) return false
    return eventCategories.value.some(
      (association: any) =>
        Number(association.category) === catId && Number(association.product) === Number(product.id),
    )
  }

  const bulkAssignMutation = useBulkAssignCategoryToProducts()
  const bulkRemoveMutation = useBulkRemoveCategoryFromProducts()

  async function assignCategoryToSelectedProducts() {
    const catId = Number(selectedCategoryId.value)

    if (!Number.isFinite(catId) || catId <= 0) {
      toast.add({ title: 'Validation Error', description: 'Select a category first', color: 'red' })
      return
    }
    if (selectedProductIds.value.length === 0) {
      toast.add({ title: 'Validation Error', description: 'Select at least one product', color: 'red' })
      return
    }

    const eventNumericId = Number(event.value?.id)
    if (!Number.isFinite(eventNumericId) || eventNumericId <= 0) {
      toast.add({ title: 'Validation Error', description: 'Event context is missing', color: 'red' })
      return
    }

    const updates = selectedProductIds.value
      .map((productId) => {
        const product = products.value.find(p => p.product_id === productId)
        if (!product) return null
        return { productId, productPk: Number(product.id) }
      })
      .filter((update): update is { productId: string; productPk: number } => update !== null)

    const existingAssociationKeys = new Set(
      eventCategories.value
        .filter(
          (association: any) =>
            Number(association.category) === catId && association.product,
        )
        .map(
          (association: any) => `${Number(association.product)}-${Number(association.category)}`,
        ),
    )

    const productsNeedingUpdate = updates.filter(
      update => !existingAssociationKeys.has(`${update.productPk}-${catId}`),
    )

    if (updates.length === 0) {
      toast.add({
        title: 'No valid products',
        description: 'Could not prepare category updates for selected products',
        color: 'red',
      })
      return
    }

    if (productsNeedingUpdate.length === 0) {
      toast.add({
        title: 'No changes needed',
        description: 'All selected products already have this category',
        color: 'blue',
      })
      return
    }

    try {
      const result = await bulkAssignMutation.mutateAsync({
        eventId: eventNumericId,
        categoryId: catId,
        products: productsNeedingUpdate.map(update => ({ productPk: update.productPk })),
      })

      const skippedCount = result?.skippedCount || 0
      const updatedCount = result?.updatedCount || productsNeedingUpdate.length

      toast.add({
        title: 'Success',
        description:
          skippedCount > 0
            ? `Category assigned to ${updatedCount} product${updatedCount === 1 ? '' : 's'} (${skippedCount} already mapped)`
            : `Category assigned to ${updatedCount} product${updatedCount === 1 ? '' : 's'}`,
        color: 'green',
      })

      clearSelection()
      refetchProducts()
    } catch (err: any) {
      toast.add({
        title: 'Error',
        description: err?.message || 'Failed to assign category to selected products',
        color: 'red',
      })
    }
  }

  async function removeCategoryFromSelectedProducts() {
    const catId = Number(selectedCategoryId.value)

    if (!Number.isFinite(catId) || catId <= 0) {
      toast.add({ title: 'Validation Error', description: 'Select a category first', color: 'red' })
      return
    }
    if (selectedProductIds.value.length === 0) {
      toast.add({ title: 'Validation Error', description: 'Select at least one product', color: 'red' })
      return
    }

    const selectedProductDbIds = new Set(
      products.value
        .filter(product => selectedProductIds.value.includes(product.product_id as string))
        .map(product => Number(product.id))
        .filter(id => Number.isFinite(id) && id > 0),
    )

    const associationIds = eventCategories.value
      .filter(
        (association: any) =>
          Number(association.category) === catId &&
          selectedProductDbIds.has(Number(association.product)),
      )
      .map((association: any) => String(association.id))

    if (associationIds.length === 0) {
      toast.add({
        title: 'No changes needed',
        description: 'No matching category assignments found for selected products',
        color: 'blue',
      })
      return
    }

    try {
      const result = await bulkRemoveMutation.mutateAsync({ associationIds })

      toast.add({
        title: 'Success',
        description: `Category removed from ${result.removedCount} product${result.removedCount === 1 ? '' : 's'}`,
        color: 'green',
      })

      clearSelection()
      refetchProducts()
    } catch (err: any) {
      toast.add({
        title: 'Error',
        description: err?.message || 'Failed to remove category from selected products',
        color: 'red',
      })
    }
  }

  return {
    searchQuery,
    selectedCategoryId,
    selectedProductIds,
    products,
    productsLoading,
    allProductsSelected,
    clearSelection,
    isCategoryAssignedToProduct,
    bulkAssignMutation,
    bulkRemoveMutation,
    assignCategoryToSelectedProducts,
    removeCategoryFromSelectedProducts,
  }
}
