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
