import type { Ref } from 'vue'
import { useCreateBookingPackageDiscount } from '~/composables/resources/booking/bookingPackageDiscounts'
import {
  usePartialUpdatePaymentDiscount,
  useDeletePaymentDiscount,
} from '~/composables/resources/payments/paymentDiscounts'
import Swal from 'sweetalert2'

export function useDiscountManagement(
  packages: Ref<any[]>,
  refetchDiscounts: () => void,
) {
  const route = useRoute()
  const router = useRouter()
  const toast = useToast()

  const showDiscountModal = ref(false)
  const editingDiscount = ref<any>(null)
  const selectedPackageForDiscount = ref<number | null>(null)
  const isManualModalOpen = ref(false)

  const createDiscountMutation = useCreateBookingPackageDiscount()
  const updateDiscountMutation = usePartialUpdatePaymentDiscount()
  const deleteDiscountMutation = useDeletePaymentDiscount()

  const discountMutationLoading = computed(
    () => createDiscountMutation.isPending.value || updateDiscountMutation.isPending.value,
  )

  const openDiscountModal = (discount?: any, packageId?: number) => {
    editingDiscount.value = discount || null
    selectedPackageForDiscount.value = packageId || null
    showDiscountModal.value = true

    if (discount?.discount_id) {
      isManualModalOpen.value = true
      router.replace({ query: { ...route.query, 'discount-id': discount.discount_id } })
    }
  }

  const closeDiscountModal = () => {
    showDiscountModal.value = false
    editingDiscount.value = null
    selectedPackageForDiscount.value = null

    if (route.query['discount-id']) {
      router.replace({ query: { ...route.query, 'discount-id': undefined } })
    }
    isManualModalOpen.value = false
  }

  const handleDiscountSubmit = async (data: any) => {
    try {
      const discountData = {
        name: data.name,
        description: data.description || undefined,
        discount_type: data.discount_type,
        percentage: data.discount_type === 'PERCENTAGE' ? data.percentage : undefined,
        amount: data.discount_type === 'FIXED' ? data.amount : undefined,
        active: data.active,
        rules: data.rules || [],
      }

      if (editingDiscount.value) {
        await updateDiscountMutation.mutateAsync({
          discountId: editingDiscount.value.discount_id,
          body: discountData,
        })
        toast.add({ title: 'Discount updated', color: 'green' })
      } else {
        const packageId = data.packageId || selectedPackageForDiscount.value
        if (!packageId) {
          toast.add({ title: 'Please select a booking package', color: 'orange' })
          return
        }
        await createDiscountMutation.mutateAsync({ packageId, discount: discountData })
        toast.add({ title: 'Discount created', color: 'green' })
      }

      closeDiscountModal()
      refetchDiscounts()
    } catch (error) {
      toast.add({
        title: editingDiscount.value ? 'Failed to update discount' : 'Failed to create discount',
        description: error instanceof Error ? error.message : 'An error occurred',
        color: 'red',
      })
    }
  }

  const toggleDiscountStatus = async (discountId: string, isActive: boolean) => {
    try {
      await updateDiscountMutation.mutateAsync({ discountId, body: { active: isActive } })
      toast.add({ title: 'Status updated', color: 'green' })
      refetchDiscounts()
    } catch (error) {
      toast.add({
        title: 'Failed to update status',
        description: error instanceof Error ? error.message : 'An error occurred',
        color: 'red',
      })
    }
  }

  const removeDiscount = async (discountId: string) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will remove the discount and all associated rules.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove it!',
      cancelButtonText: 'Cancel',
    }).then(async (result) => {
      try {
        await deleteDiscountMutation.mutateAsync(discountId)
        toast.add({ title: 'Discount removed', color: 'green' })
        refetchDiscounts()
      } catch (error) {
        toast.add({
          title: 'Failed to remove discount',
          description: error instanceof Error ? error.message : 'An error occurred',
          color: 'red',
        })
      }
    })
  }

  // URL param watcher — opens modal when ?discount-id= is present
  watch(
    () => ({
      discountId: route.query['discount-id'],
    }),
    ({ discountId }) => {
      if (isManualModalOpen.value) {
        isManualModalOpen.value = false
        return
      }
      // Discount lookup is handled by the caller (index.vue passes discounts array)
      // This watcher is intentionally left minimal; opening is done from index.vue
    },
  )

  return {
    showDiscountModal,
    editingDiscount,
    selectedPackageForDiscount,
    discountMutationLoading,
    openDiscountModal,
    closeDiscountModal,
    handleDiscountSubmit,
    toggleDiscountStatus,
    removeDiscount,
  }
}
