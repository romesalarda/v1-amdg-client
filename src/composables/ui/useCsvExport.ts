import type { InventoryProductLine, InventoryVariantLine, ProductList } from '~/api/types.gen'

type CsvColumnDef<T> = {
  header: string
  value: (row: T) => string | number | boolean | null | undefined
}

function buildCsv<T>(rows: T[], columns: CsvColumnDef<T>[]): string {
  const escape = (v: string | number | boolean | null | undefined): string => {
    const s = v == null ? '' : String(v)
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s
  }

  const header = columns.map(c => escape(c.header)).join(',')
  const body = rows.map(row =>
    columns.map(c => escape(c.value(row))).join(','),
  )

  return [header, ...body].join('\r\n')
}

function downloadCsv(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

const PRODUCT_COLUMNS: CsvColumnDef<ProductList>[] = [
  { header: 'ID', value: r => r.id },
  { header: 'Product ID', value: r => r.product_id },
  { header: 'Display Code', value: r => r.display_code },
  { header: 'Title', value: r => r.title },
  { header: 'Event', value: r => r.event_name },
  { header: 'Base Amount', value: r => r.base_amount },
  { header: 'Currency', value: r => r.base_amount_currency },
  { header: 'Percentage Modifier', value: r => r.percentage_modifier ?? '' },
  { header: 'Final Price', value: r => r.final_price },
  { header: 'Max Qty Per Order', value: r => r.max_purchase_quantity_per_order ?? '' },
  { header: 'Verified', value: r => r.verified ?? false },
  { header: 'Active', value: r => r.is_active ?? false },
  { header: 'Variant Count', value: r => r.variant_count },
  { header: 'Categories', value: r => r.categories.join('; ') },
  { header: 'Added At', value: r => r.added_at },
]

export function useCsvExport() {
  function exportToCSV<T>(
    rows: T[],
    columns: CsvColumnDef<T>[],
    filename: string,
  ): void {
    const csv = buildCsv(rows, columns)
    downloadCsv(csv, filename)
  }

  function exportProductsToCSV(products: ProductList[], filename = 'products.csv'): void {
    exportToCSV(products, PRODUCT_COLUMNS, filename)
  }

  function exportInventoryToCSV(products: InventoryProductLine[], filename = 'inventory.csv'): void {
    // Flatten to one row per variant so every cell is a scalar value
    type InventoryRow = InventoryVariantLine & {
      product_id: string
      display_code: string
      title: string
      is_active_product: boolean
      verified: boolean
    }

    const rows: InventoryRow[] = products.flatMap(p =>
      p.variants.map(v => ({
        ...v,
        product_id: p.product_id,
        display_code: p.display_code,
        title: p.title,
        is_active_product: p.is_active,
        verified: p.verified,
      })),
    )

    const columns: CsvColumnDef<InventoryRow>[] = [
      { header: 'Product ID', value: r => r.product_id },
      { header: 'Display Code', value: r => r.display_code },
      { header: 'Title', value: r => r.title },
      { header: 'Active', value: r => r.is_active_product },
      { header: 'Verified', value: r => r.verified },
      { header: 'Variant ID', value: r => r.variant_id },
      { header: 'Size', value: r => r.size },
      { header: 'Color', value: r => r.color },
      { header: 'Variant Active', value: r => r.is_active },
      { header: 'Current Stock', value: r => r.current_stock },
      { header: 'Live Order Units', value: r => r.live_order_units },
      { header: 'Max Stock Qty', value: r => r.max_stock_quantity ?? '' },
      { header: 'Qty To Order', value: r => r.quantity_to_order ?? '' },
      { header: 'Unit Price', value: r => r.unit_price },
      { header: 'Stock Value', value: r => r.current_stock_value },
      { header: 'Restock Cost', value: r => r.restock_cost ?? '' },
    ]

    exportToCSV(rows, columns, filename)
  }

  return { exportToCSV, exportProductsToCSV, exportInventoryToCSV }
}
