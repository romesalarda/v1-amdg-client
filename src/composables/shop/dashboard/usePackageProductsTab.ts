import { ref, computed, reactive, watch } from 'vue'
import type { Ref } from 'vue'
import type { EventDetail, BookingPackageList, ProductList } from '~/api/types.gen'
import { useBookingPackages } from '~/composables/resources/booking/bookingPackages'
import {
  useBookingPackageProducts,
  useCreateBookingPackageProduct,
  useUpdateBookingPackageProduct,
  useDeleteBookingPackageProduct,
  type BookingPackageProduct,
} from '~/composables/resources/booking/bookingProductPackages'
import { useProducts } from '~/composables/resources/products/products'

export function usePackageProductsTab(event: Ref<EventDetail | undefined>) {
  const toast = useToast()

  // Booking packages
  const bookingPackagesQuery = computed(() => {
    const eventSlug = event.value?.url_safe_title
    if (!eventSlug) return undefined
    return { event: eventSlug, page_size: 100 }
  })

  const { data: bookingPackagesData, isLoading: bookingPackagesLoading } =
    useBookingPackages(bookingPackagesQuery)
  const bookingPackages = computed<BookingPackageList[]>(
    () => bookingPackagesData.value?.data?.results || [],
  )

  const selectedPackageId = ref<number | null>(null)

  watch(bookingPackages, (items) => {
    if (!selectedPackageId.value && items.length > 0) {
      selectedPackageId.value = Number(items[0].id)
    }
  })

  // Package products
  const packageProductsQuery = computed(() =>
    selectedPackageId.value ? selectedPackageId.value : undefined,
  )

  const {
    data: packageProductsData,
    isLoading: packageProductsLoading,
    refetch: refetchPackageProducts,
  } = useBookingPackageProducts(packageProductsQuery)

  const packageProducts = computed<BookingPackageProduct[]>(
    () => packageProductsData.value?.data?.results || [],
  )

  // Event products available for linking
  const eventProductsQuery = computed(() => {
    const eventSlug = event.value?.url_safe_title
    if (!eventSlug) return undefined
    return { event: eventSlug, page_size: 200 }
  })

  const { data: eventProductsData } = useProducts(eventProductsQuery)
  const eventProducts = computed<ProductList[]>(
    () => eventProductsData.value?.data?.results || [],
  )

  const linkedProductIds = computed(
    () => new Set(packageProducts.value.map(item => Number(item.product))),
  )

  const availableProductsForLinking = computed(() =>
    eventProducts.value.filter(product => !linkedProductIds.value.has(Number(product.id))),
  )

  // Search/filter
  const searchQuery = ref('')

  const filteredPackageProducts = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()
    if (!query) return packageProducts.value
    return packageProducts.value.filter(
      item =>
        item.product_title.toLowerCase().includes(query) ||
        item.product_display_code.toLowerCase().includes(query),
    )
  })

  // Link form
  const packageProductForm = reactive({
    productId: null as number | null,
    quantityPerAttendee: 1,
    percentageModifier: '-10.00',
  })

  function resetPackageProductForm() {
    packageProductForm.productId = null
    packageProductForm.quantityPerAttendee = 1
    packageProductForm.percentageModifier = '-10.00'
  }

  // Inline edit state
  const editingPackageProductId = ref<number | null>(null)
  const editingPackageProduct = reactive({
    quantityPerAttendee: 1,
    percentageModifier: '0.00',
  })

  function startPackageProductEdit(row: BookingPackageProduct) {
    editingPackageProductId.value = row.id
    editingPackageProduct.quantityPerAttendee = Number(row.quantity_per_attendee)
    editingPackageProduct.percentageModifier = Number(row.percentage_modifier).toFixed(2)
  }

  function cancelPackageProductEdit() {
    editingPackageProductId.value = null
    editingPackageProduct.quantityPerAttendee = 1
    editingPackageProduct.percentageModifier = '0.00'
  }

  function formatModifier(value: string | number) {
    const numeric = Number(value)
    if (Number.isNaN(numeric)) return '0.00%'
    return `${numeric > 0 ? '+' : ''}${numeric.toFixed(2)}%`
  }

  // Mutations
  const createPackageProductMutation = useCreateBookingPackageProduct()
  const updatePackageProductMutation = useUpdateBookingPackageProduct()
  const deletePackageProductMutation = useDeleteBookingPackageProduct()

  async function createPackageProductLink() {
    if (!selectedPackageId.value) {
      toast.add({ title: 'Validation Error', description: 'Select a booking package first', color: 'red' })
      return
    }
    if (!packageProductForm.productId) {
      toast.add({ title: 'Validation Error', description: 'Select a product to link', color: 'red' })
      return
    }
    if (
      !Number.isFinite(packageProductForm.quantityPerAttendee) ||
      packageProductForm.quantityPerAttendee < 1
    ) {
      toast.add({
        title: 'Validation Error',
        description: 'Quantity per attendee must be at least 1',
        color: 'red',
      })
      return
    }
    if (linkedProductIds.value.has(Number(packageProductForm.productId))) {
      toast.add({
        title: 'No changes needed',
        description: 'This product is already linked to the selected package',
        color: 'blue',
      })
      return
    }

    try {
      await createPackageProductMutation.mutateAsync({
        packageId: selectedPackageId.value,
        body: {
          product: Number(packageProductForm.productId),
          quantity_per_attendee: Number(packageProductForm.quantityPerAttendee),
          percentage_modifier: Number(packageProductForm.percentageModifier).toFixed(2),
          booking_package: Number(selectedPackageId.value),
        },
      })

      toast.add({ title: 'Success', description: 'Product linked to package', color: 'green' })
      resetPackageProductForm()
      refetchPackageProducts()
    } catch (err: any) {
      toast.add({
        title: 'Error',
        description: err?.message || 'Failed to link product to package',
        color: 'red',
      })
    }
  }

  async function savePackageProductEdit(packageProductId: number) {
    if (!selectedPackageId.value) return

    if (
      !Number.isFinite(editingPackageProduct.quantityPerAttendee) ||
      editingPackageProduct.quantityPerAttendee < 1
    ) {
      toast.add({
        title: 'Validation Error',
        description: 'Quantity per attendee must be at least 1',
        color: 'red',
      })
      return
    }

    try {
      await updatePackageProductMutation.mutateAsync({
        packageId: selectedPackageId.value,
        packageProductId,
        body: {
          quantity_per_attendee: Number(editingPackageProduct.quantityPerAttendee),
          percentage_modifier: Number(editingPackageProduct.percentageModifier).toFixed(2),
        },
      })

      toast.add({ title: 'Success', description: 'Linked product updated', color: 'green' })
      cancelPackageProductEdit()
      refetchPackageProducts()
    } catch (err: any) {
      toast.add({
        title: 'Error',
        description: err?.message || 'Failed to update linked product',
        color: 'red',
      })
    }
  }

  async function deletePackageProductLink(packageProductId: number) {
    if (!selectedPackageId.value) return

    try {
      await deletePackageProductMutation.mutateAsync({
        packageId: selectedPackageId.value,
        packageProductId,
      })

      toast.add({
        title: 'Success',
        description: 'Linked product removed from package',
        color: 'green',
      })

      if (editingPackageProductId.value === packageProductId) {
        cancelPackageProductEdit()
      }
      refetchPackageProducts()
    } catch (err: any) {
      toast.add({
        title: 'Error',
        description: err?.message || 'Failed to remove linked product',
        color: 'red',
      })
    }
  }

  return {
    bookingPackages,
    bookingPackagesLoading,
    selectedPackageId,
    packageProducts,
    packageProductsLoading,
    filteredPackageProducts,
    availableProductsForLinking,
    linkedProductIds,
    searchQuery,
    packageProductForm,
    resetPackageProductForm,
    editingPackageProductId,
    editingPackageProduct,
    startPackageProductEdit,
    cancelPackageProductEdit,
    formatModifier,
    createPackageProductMutation,
    updatePackageProductMutation,
    deletePackageProductMutation,
    createPackageProductLink,
    savePackageProductEdit,
    deletePackageProductLink,
  }
}
