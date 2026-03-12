export function formatMoney(
  amount: string | number,
  currency: string,
  locale = 'en-GB'
) {
  const numericAmount =
    typeof amount === 'string'
      ? Number.parseFloat(amount)
      : amount

  if (Number.isNaN(numericAmount)) {
    return ''
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount)
}


export function parseAmount(amount: string | number): number {
  if (typeof amount === 'number') return amount
  if (!amount) return 0
  // Remove currency symbols and parse
  const cleanAmount = String(amount).replace(/[£$€,]/g, '').trim()
  const parsed = parseFloat(cleanAmount)
  return isNaN(parsed) ? 0 : parsed
}