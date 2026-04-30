import { computed, ref, watch, type Ref } from 'vue'
import { bookingsPackageProductsList, productsListRetrieve, productsListVariantsList } from '~/api/sdk.gen'
import type { AttendeeDraft, ProductSelectionDraft } from '~/stores/registration'

export type PackageProductRow = {
  id: number
  productPublicId: string
  productTitle: string
  quantityPerAttendee: number
  baseAmount: string
  modifiedAmount: string
  currency: string
  imageUrl: string | null
}

export type VariantRow = {
  variantId: string
  sizeDisplay: string
  color: string
  finalPrice: string
  stockQuantity: number
  isActive: boolean
}

type SelectedAddOnSummaryRow = {
  packageProductId: number
  productTitle: string
  variantLabel: string
  quantity: number
}

type PackageProductManagerOptions = {
  currentAttendee: Ref<AttendeeDraft | undefined>
  currentIndex: Ref<number>
  setProductSelections: (index: number, selections: ProductSelectionDraft[]) => void
}

export const usePackageProductManager = (options: PackageProductManagerOptions) => {
  const packageProductsLoading = ref(false)
  const packageProductsError = ref('')
  const currentPackageProducts = ref<PackageProductRow[]>([])
  const packageProductVariants = ref<Record<number, VariantRow[]>>({})
  const selectedProductSizesByAttendee = ref<Record<number, Record<number, string | null>>>({})
  const getCurrentAttendeeSizeMap = (): Record<number, string | null> => {
    const attendeeIndex = options.currentIndex.value
    if (!selectedProductSizesByAttendee.value[attendeeIndex]) {
      selectedProductSizesByAttendee.value[attendeeIndex] = {}
    }
    return selectedProductSizesByAttendee.value[attendeeIndex]
  }

  const selectedProductSizes = computed(() => getCurrentAttendeeSizeMap())


  let packageProductLoadVersion = 0

  const currentAttendeeProductSelections = computed(() => options.currentAttendee.value?.productSelections || [])

  const variantOptionLabel = (variant: VariantRow, currency: string) => {
    const stockLabel = variant.stockQuantity > 0 ? `${variant.stockQuantity} left` : 'Out of stock'
    return `${variant.sizeDisplay} ${variant.color} - ${variant.finalPrice} ${currency} (${stockLabel})`
  }

  const handlePackageProductVariantChange = (packageProductId: number, event: Event) => {
    const value = String((event.target as HTMLSelectElement)?.value || '')
    setPackageProductVariantSelection(packageProductId, value)
  }

  const getSelectionForPackageProduct = (packageProductId: number) => {
    return (currentAttendeeProductSelections.value || []).find((selection) => selection.packageProductId === packageProductId)
  }

  const getVariantsForPackageProduct = (packageProductId: number): VariantRow[] => {
    return packageProductVariants.value[packageProductId] || []
  }

  const getUniqueSizesForPackageProduct = (packageProductId: number): Array<{ size: string; Available: boolean }> => {
    const variants = getVariantsForPackageProduct(packageProductId)
    const sizeMap = new Map<string, boolean>()

    variants.forEach((variant) => {
      const hasAvailable = sizeMap.get(variant.sizeDisplay) || (variant.isActive && variant.stockQuantity > 0)
      sizeMap.set(variant.sizeDisplay, hasAvailable)
    })

    return Array.from(sizeMap.entries()).map(([size, available]) => ({
      size,
      Available: available,
    }))
  }

  const getColorsForPackageProductAndSize = (packageProductId: number, size: string): Array<{ color: string; colorHex: string; stockQuantity: number; isActive: boolean }> => {
    const variants = getVariantsForPackageProduct(packageProductId)
    return variants
      .filter((variant) => variant.sizeDisplay === size)
      .map((variant) => ({
        color: variant.color || '#000000',
        colorHex: variant.color || '#000000',
        stockQuantity: variant.stockQuantity,
        isActive: variant.isActive,
      }))
      .filter((item, index, arr) => arr.findIndex((v) => v.colorHex === item.colorHex) === index)
  }

  const getVariantIdForPackageProductSizeColor = (packageProductId: number, size: string, colorHex: string): string | null => {
    const variants = getVariantsForPackageProduct(packageProductId)
    const variant = variants.find(
      (v) => v.sizeDisplay === size && (v.color === colorHex || (!v.color && colorHex === '#000000'))
    )
    return variant?.variantId || null
  }

  const setSelectedSizeForProduct = (packageProductId: number, size: string | null) => {
    const next = {
      ...getCurrentAttendeeSizeMap(),
      [packageProductId]: size,
    }
    selectedProductSizesByAttendee.value = {
      ...selectedProductSizesByAttendee.value,
      [options.currentIndex.value]: next,
    }
  }

  const getSelectedSizeForProduct = (packageProductId: number): string | null => {
    return getCurrentAttendeeSizeMap()[packageProductId] || null
  }

  const getSelectedVariantPriceInfo = (packageProduct: PackageProductRow): { standardPrice: number; bundledPrice: number; quantity: number; totalPrice: number } | null => {
    const selection = getSelectionForPackageProduct(packageProduct.id)
    if (!selection) return null

    const standardPrice = Number(packageProduct.baseAmount || 0)
    const bundledPrice = Number(packageProduct.modifiedAmount || packageProduct.baseAmount || 0)
    const quantity = Number(selection.quantity || 1)
    const totalPrice = bundledPrice * quantity

    return {
      standardPrice,
      bundledPrice,
      quantity,
      totalPrice,
    }
  }

  const hasAnyVariantsForPackageProduct = (packageProductId: number): boolean => {
    return getVariantsForPackageProduct(packageProductId).length > 0
  }

  const hasSelectableVariantsForPackageProduct = (packageProductId: number): boolean => {
    return getVariantsForPackageProduct(packageProductId).some((variant) => variant.isActive && variant.stockQuantity > 0)
  }

  const getBundleMultiplier = (packageProduct: PackageProductRow): number => {
    const base = Number(packageProduct.baseAmount || 0)
    const modified = Number(packageProduct.modifiedAmount || 0)
    if (!Number.isFinite(base) || base <= 0) return 1
    if (!Number.isFinite(modified) || modified < 0) return 1
    return modified / base
  }

  const getBundledVariantEstimate = (packageProduct: PackageProductRow, variant: VariantRow): number => {
    const standard = Number(variant.finalPrice || 0)
    if (!Number.isFinite(standard) || standard < 0) return 0
    return standard * getBundleMultiplier(packageProduct)
  }

  const getSelectedVariantForPackageProduct = (packageProductId: number): VariantRow | undefined => {
    const selection = getSelectionForPackageProduct(packageProductId)
    if (!selection) return undefined
    return getVariantsForPackageProduct(packageProductId).find((variant) => variant.variantId === selection.variantId)
  }

  const getSelectedBundledVariantEstimate = (packageProduct: PackageProductRow): number | null => {
    const selectedVariant = getSelectedVariantForPackageProduct(packageProduct.id)
    if (!selectedVariant) return null
    return getBundledVariantEstimate(packageProduct, selectedVariant)
  }

  const selectedAddOnsSummary = computed<SelectedAddOnSummaryRow[]>(() => {
    return (currentAttendeeProductSelections.value || []).map((selection) => {
      const packageProduct = currentPackageProducts.value.find((row) => row.id === selection.packageProductId)
      const variant = getVariantsForPackageProduct(selection.packageProductId).find((row) => row.variantId === selection.variantId)
      const variantLabel = variant
        ? `${variant.sizeDisplay} ${variant.color}`
        : `Variant ${selection.variantId.slice(0, 8)}`

      return {
        packageProductId: selection.packageProductId,
        productTitle: packageProduct?.productTitle || 'Product',
        variantLabel,
        quantity: Number(selection.quantity || 1),
      }
    })
  })

  const setSelectionsForCurrentAttendee = (next: ProductSelectionDraft[]) => {
    options.setProductSelections(options.currentIndex.value, next)
  }

  const setPackageProductVariantSelection = (packageProductId: number, variantId: string) => {
    if (!variantId) {
      removePackageProductSelection(packageProductId)
      return
    }

    const existing = currentAttendeeProductSelections.value || []
    const index = existing.findIndex((selection) => selection.packageProductId === packageProductId)
    const next = [...existing]

    if (index >= 0) {
      next[index] = {
        ...next[index],
        variantId,
        quantity: Math.max(1, Number(next[index].quantity || 1)),
      }
    } else {
      next.push({ packageProductId, variantId, quantity: 1 })
    }

    const selectedVariant = getVariantsForPackageProduct(packageProductId).find((variant) => variant.variantId === variantId)
    if (selectedVariant?.sizeDisplay) {
      setSelectedSizeForProduct(packageProductId, selectedVariant.sizeDisplay)
    }

    setSelectionsForCurrentAttendee(next)
  }

  const setPackageProductQuantity = (packageProductId: number, quantity: number) => {
    const packageProduct = currentPackageProducts.value.find((row) => row.id === packageProductId)
    if (!packageProduct) return

    const existing = currentAttendeeProductSelections.value || []
    const index = existing.findIndex((selection) => selection.packageProductId === packageProductId)
    if (index < 0) return

    const next = [...existing]
    next[index] = {
      ...next[index],
      quantity: Math.min(packageProduct.quantityPerAttendee, Math.max(1, Number(quantity || 1))),
    }
    setSelectionsForCurrentAttendee(next)
  }

  const removePackageProductSelection = (packageProductId: number) => {
    const next = (currentAttendeeProductSelections.value || []).filter((selection) => selection.packageProductId !== packageProductId)
    setSelectionsForCurrentAttendee(next)
  }

  const loadPackageProductsForCurrentAttendee = async () => {
    const attendee = options.currentAttendee.value
    const packageId = attendee?.packageId
    const loadVersion = ++packageProductLoadVersion

    packageProductsError.value = ''
    if (!packageId) {
      currentPackageProducts.value = []
      packageProductVariants.value = {}
      selectedProductSizesByAttendee.value = {
        ...selectedProductSizesByAttendee.value,
        [options.currentIndex.value]: {},
      }
      if (attendee?.productSelections?.length) {
        setSelectionsForCurrentAttendee([])
      }
      return
    }

    packageProductsLoading.value = true
    try {
      const packageResponse = await bookingsPackageProductsList({ path: { id: packageId } })
      if (loadVersion !== packageProductLoadVersion) return

      const products = (packageResponse.data?.results || []).map((row: any) => {
        const productPublicId = String(row.product_public_id || row.product_id || row.product || '').trim()

        return {
          id: Number(row.id),
          productPublicId,
          productTitle: String(row.product_title || 'Product'),
          quantityPerAttendee: Math.max(1, Number(row.quantity_per_attendee || 1)),
          baseAmount: String(row.base_amount || '0.00'),
          modifiedAmount: String(row.modified_amount || '0.00'),
          currency: String(row.base_amount_currency || 'GBP'),
          imageUrl: null,
        }
      })

      const packageProductLookups = await Promise.all(products.map(async (product): Promise<[number, { variants: VariantRow[]; imageUrl: string | null }]> => {
        if (!product.productPublicId) {
          console.warn(`[Package Product] No product ID found for package product ${product.id}`)
          return [product.id, { variants: [], imageUrl: null }]
        }
        try {
          const [variantsResponse, productResponse] = await Promise.all([
            productsListVariantsList({
              path: { product_product_id: product.productPublicId },
              query: { page_size: 200 },
            }),
            productsListRetrieve({
              path: { product_id: product.productPublicId },
            }),
          ])

          const variants = (variantsResponse.data?.results || []).map((variant: any) => ({
            variantId: String(variant.variant_id || variant.id || ''),
            sizeDisplay: String(variant.size_display || variant.size || 'Variant'),
            color: String(variant.color || ''),
            finalPrice: String(variant.final_price || variant.modified_amount || product.modifiedAmount),
            stockQuantity: Number(variant.stock_quantity || 0),
            isActive: !!variant.is_active,
          }))

          const detail = productResponse.data
          const mainImage = detail?.main_image?.url || detail?.images?.main?.url || null

          if (mainImage) {
            console.log(`[Package Product] Found image for product ${product.productPublicId}: ${mainImage}`)
          }

          return [product.id, { variants, imageUrl: mainImage }]
        } catch (error) {
          console.error(`[Package Product] Failed to fetch details for product ${product.productPublicId}:`, error)
          return [product.id, { variants: [], imageUrl: null }]
        }
      }))

      if (loadVersion !== packageProductLoadVersion) return

      packageProductVariants.value = Object.fromEntries(
        packageProductLookups.map(([productId, row]) => [productId, row.variants])
      )

      currentPackageProducts.value = products.map((product) => {
        const lookup = packageProductLookups.find(([productId]) => productId === product.id)?.[1]
        return {
          ...product,
          imageUrl: lookup?.imageUrl || null,
        }
      })

      const validProductIds = new Set(currentPackageProducts.value.map((product) => product.id))
      const normalized = (attendee?.productSelections || []).filter((selection) => {
        if (!validProductIds.has(selection.packageProductId)) return false
        const variants = packageProductVariants.value[selection.packageProductId] || []
        return variants.some((variant) => {
          return variant.variantId === selection.variantId && variant.isActive && variant.stockQuantity > 0
        })
      }).map((selection) => {
        const pkg = currentPackageProducts.value.find((row) => row.id === selection.packageProductId)
        if (!pkg) return selection
        return {
          ...selection,
          quantity: Math.min(pkg.quantityPerAttendee, Math.max(1, Number(selection.quantity || 1))),
        }
      })

      if ((attendee?.productSelections || []).length !== normalized.length) {
        setSelectionsForCurrentAttendee(normalized)
      }

      const syncedSizes: Record<number, string | null> = {}
      normalized.forEach((selection) => {
        const variant = (packageProductVariants.value[selection.packageProductId] || []).find((row) => row.variantId === selection.variantId)
        if (variant?.sizeDisplay) {
          syncedSizes[selection.packageProductId] = variant.sizeDisplay
        }
      })
      selectedProductSizesByAttendee.value = {
        ...selectedProductSizesByAttendee.value,
        [options.currentIndex.value]: syncedSizes,
      }
    } catch (error) {
      if (loadVersion !== packageProductLoadVersion) return
      currentPackageProducts.value = []
      packageProductVariants.value = {}
      packageProductsError.value = 'Unable to load package products right now.'
      console.error('Failed to load package products', error)
    } finally {
      if (loadVersion === packageProductLoadVersion) {
        packageProductsLoading.value = false
      }
    }
  }

  watch(
    [() => options.currentIndex.value, () => options.currentAttendee.value?.packageId],
    () => {
      void loadPackageProductsForCurrentAttendee()
    },
    { immediate: true }
  )

  return {
    packageProductsLoading,
    packageProductsError,
    currentPackageProducts,
    currentAttendeeProductSelections,
    selectedProductSizes,
    selectedAddOnsSummary,
    variantOptionLabel,
    handlePackageProductVariantChange,
    getSelectionForPackageProduct,
    getVariantsForPackageProduct,
    getUniqueSizesForPackageProduct,
    getColorsForPackageProductAndSize,
    getVariantIdForPackageProductSizeColor,
    setSelectedSizeForProduct,
    getSelectedSizeForProduct,
    getSelectedVariantPriceInfo,
    hasAnyVariantsForPackageProduct,
    hasSelectableVariantsForPackageProduct,
    getBundleMultiplier,
    getBundledVariantEstimate,
    getSelectedVariantForPackageProduct,
    getSelectedBundledVariantEstimate,
    setPackageProductVariantSelection,
    setPackageProductQuantity,
    removePackageProductSelection,
    loadPackageProductsForCurrentAttendee,
  }
}
