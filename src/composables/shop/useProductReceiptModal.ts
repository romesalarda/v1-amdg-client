import { ref, computed } from 'vue'
import type { InventoryProductLine } from '~/api/types.gen'

export function useProductReceiptModal() {
  const selectedProduct = ref<InventoryProductLine | null>(null)

  const isOpen = computed(() => selectedProduct.value !== null)

  function openReceipt(product: InventoryProductLine) {
    selectedProduct.value = product
  }

  function closeReceipt() {
    selectedProduct.value = null
  }

  return {
    selectedProduct,
    isOpen,
    openReceipt,
    closeReceipt,
  }
}
