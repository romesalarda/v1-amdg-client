import type { Ref } from 'vue'
import {
  useCreateBookingPackage,
  usePartialUpdateBookingPackage,
  useDeleteBookingPackage,
} from '~/composables/resources/booking/bookingPackages'
import { bookingsPackageAvailabilityWindowsList } from '~/api/sdk.gen'
import Swal from 'sweetalert2'

export function useBookingPackageManagement(
  eventId: Ref<string>,
  event: Ref<any>,
  packages: Ref<any[]>,
  refetchPackages: () => void,
) {
  const route = useRoute()
  const router = useRouter()
  const toast = useToast()

  // Package edit modal
  const showPackageModal = ref(false)
  const editingPackage = ref<any>(null)
  const isManualModalOpen = ref(false)

  // Availability modal
  const showPackageAvailabilityModal = ref(false)
  const selectedPackageId = ref<number | null>(null)

  // Used to prevent re-running the window search
  const hasSearchedForPackage = ref(false)

  const createPackageMutation = useCreateBookingPackage()
  const updatePackageMutation = usePartialUpdateBookingPackage()
  const deletePackageMutation = useDeleteBookingPackage()

  const packageMutationLoading = computed(
    () => createPackageMutation.isPending.value || updatePackageMutation.isPending.value,
  )

  const selectedPackageName = computed(() => {
    if (!selectedPackageId.value) return ''
    const pkg = packages.value.find(p => p.id === selectedPackageId.value)
    return pkg?.name || ''
  })

  // ── Package edit modal ───────────────────────────────────────────────────────

  const openPackageModal = (pkg?: any) => {
    editingPackage.value = pkg || null
    showPackageModal.value = true

    if (pkg?.id) {
      isManualModalOpen.value = true
      router.replace({ query: { ...route.query, 'package-id': pkg.id.toString() } })
    }
  }

  const closePackageModal = () => {
    showPackageModal.value = false
    editingPackage.value = null

    if (route.query['package-id']) {
      router.replace({ query: { ...route.query, 'package-id': undefined } })
    }
    isManualModalOpen.value = false
  }

  const handlePackageSubmit = async (data: any) => {
    try {
      if (editingPackage.value) {
        await updatePackageMutation.mutateAsync({
          packageId: editingPackage.value.id,
          body: data,
        })
        toast.add({ title: 'Package updated', color: 'green' })
      } else {
        await createPackageMutation.mutateAsync({
          ...data,
          event: Number(event.value?.data.id),
        })
        toast.add({ title: 'Package created', color: 'green' })
      }

      closePackageModal()
      refetchPackages()
    } catch (error) {
      toast.add({
        title: editingPackage.value ? 'Failed to update package' : 'Failed to create package',
        description: error instanceof Error ? error.message : 'An error occurred',
        color: 'red',
      })
    }
  }

  const togglePackageStatus = async (packageId: number, isActive: boolean) => {
    try {
      await updatePackageMutation.mutateAsync({
        packageId,
        body: { is_active: isActive },
      })
      toast.add({ title: 'Status updated', color: 'green' })
      refetchPackages()
    } catch (error) {
      toast.add({
        title: 'Failed to update status',
        description: error instanceof Error ? error.message : 'An error occurred',
        color: 'red',
      })
    }
  }

  const removePackage = async (packageId: number) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will remove the package and all associated discounts.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove it!',
      cancelButtonText: 'Cancel',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deletePackageMutation.mutateAsync(packageId)
          toast.add({ title: 'Package removed', color: 'green' })
          refetchPackages()
        } catch (error) {
          toast.add({
            title: 'Failed to remove package',
            description: error instanceof Error ? error.message : 'An error occurred',
            color: 'red',
          })
        }
      }
    })
  }

  // ── Availability modal ───────────────────────────────────────────────────────

  function openPackageAvailabilityModal(packageId: number) {
    selectedPackageId.value = packageId
    showPackageAvailabilityModal.value = true
    isManualModalOpen.value = true
    router.replace({ query: { ...route.query, 'package-id': packageId.toString() } })
  }

  function closePackageAvailabilityModal() {
    showPackageAvailabilityModal.value = false
    selectedPackageId.value = null

    if (route.query['package-id'] || route.query['window-id']) {
      router.replace({ query: { ...route.query, 'package-id': undefined, 'window-id': undefined } })
    }
    isManualModalOpen.value = false
  }

  // ── URL sync ─────────────────────────────────────────────────────────────────

  // When only ?window-id= is given (no package-id), search all packages to find which one owns it
  watch(
    () => ({
      packagesLoaded: packages.value.length > 0,
      windowId: route.query['window-id'],
      packageId: route.query['package-id'],
    }),
    async ({ packagesLoaded, windowId, packageId }) => {
      if (!packagesLoaded || hasSearchedForPackage.value || !windowId || packageId) return

      hasSearchedForPackage.value = true

      try {
        for (const pkg of packages.value) {
          const response = await bookingsPackageAvailabilityWindowsList({ path: { id: pkg.id } })
          const results = (response.data as any)?.results
          if (results && Array.isArray(results)) {
            const foundWindow = results.find((w: any) => w.availability_id === windowId)
            if (foundWindow) {
              router.replace({
                query: { ...route.query, 'package-id': pkg.id.toString(), 'window-id': windowId },
              })
              break
            }
          }
        }
      } catch (error) {
        console.error('Error finding package for window:', error)
      }
    },
    { immediate: true },
  )

  // When ?package-id= is present (without window-id), open the package edit modal
  watch(
    () => ({
      packageId: route.query['package-id'],
      packagesLoaded: packages.value.length > 0,
    }),
    ({ packageId, packagesLoaded }) => {
      if (isManualModalOpen.value) {
        isManualModalOpen.value = false
        return
      }
      if (route.query['window-id']) return
      if (packageId && packagesLoaded && !showPackageAvailabilityModal.value && !showPackageModal.value) {
        const pkgId = parseInt(packageId as string, 10)
        if (!isNaN(pkgId)) {
          const pkg = packages.value.find(p => p.id === pkgId)
          if (pkg) openPackageModal(pkg)
        }
      }
    },
  )

  return {
    showPackageModal,
    editingPackage,
    packageMutationLoading,
    openPackageModal,
    closePackageModal,
    handlePackageSubmit,
    togglePackageStatus,
    removePackage,
    showPackageAvailabilityModal,
    selectedPackageId,
    selectedPackageName,
    openPackageAvailabilityModal,
    closePackageAvailabilityModal,
  }
}
