import type { Ref } from 'vue'
import { useCreateBookingPackageDiscount } from '~/composables/resources/booking/bookingPackageDiscounts'
import {
  usePartialUpdatePaymentDiscount,
  useDeletePaymentDiscount,
} from '~/composables/resources/payments/paymentDiscounts'
import { useCreatePaymentDiscountRule } from '~/composables/resources/payments/paymentDiscountRules'
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
  const createDiscountRuleMutation = useCreatePaymentDiscountRule()

  const discountMutationLoading = computed(
    () =>
      createDiscountMutation.isPending.value
      || updateDiscountMutation.isPending.value
      || createDiscountRuleMutation.isPending.value,
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
      }

      if (editingDiscount.value) {
        await updateDiscountMutation.mutateAsync({
          discountId: editingDiscount.value.discount_id,
          body: {
            ...discountData,
            rules: data.rules || [],
          },
        })
        toast.add({ title: 'Discount updated', color: 'green' })
      } else {
        const packageId = data.packageId || selectedPackageForDiscount.value
        if (!packageId) {
          toast.add({ title: 'Please select a booking package', color: 'orange' })
          return
        }

        const createdDiscountResponse = await createDiscountMutation.mutateAsync({
          packageId,
          discount: discountData,
        })

        const createdDiscount = createdDiscountResponse?.data as any
        const createdDiscountId = typeof createdDiscount?.id === 'number'
          ? createdDiscount.id
          : Number(createdDiscount?.id)

        const rulesToCreate = Array.isArray(data.rules) ? data.rules : []

        if (rulesToCreate.length > 0) {
          if (!Number.isFinite(createdDiscountId) || createdDiscountId <= 0) {
            throw new Error('Discount was created, but rule creation failed because the new discount ID was not returned by the server.')
          }

          const ruleCreationResults = await Promise.allSettled(
            rulesToCreate.map((rule: any) => createDiscountRuleMutation.mutateAsync({
              discount: createdDiscountId,
              rule_type: rule.rule_type,
              name: rule.name,
              description: rule.description || undefined,
              value: rule.value || undefined,
              active: rule.active ?? true,
            })),
          )

          const failedRuleCount = ruleCreationResults.filter(result => result.status === 'rejected').length
          if (failedRuleCount > 0) {
            throw new Error(`Discount was created, but ${failedRuleCount} rule${failedRuleCount > 1 ? 's' : ''} failed to save.`)
          }
        }

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
