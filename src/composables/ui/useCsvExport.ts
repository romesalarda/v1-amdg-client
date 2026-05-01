import type { ProductList } from '~/api/types.gen'

export function useCsvExport() {
  function exportProductsToCSV(_products: ProductList[]) {
    // TODO: Implement CSV export
    console.log('Export to CSV')
  }

  return { exportProductsToCSV }
}
