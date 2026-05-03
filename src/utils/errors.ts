export const extractApiErrorMessage = (error: unknown, fallback: string): string => {
  const apiError = error as any
  const responseData = apiError?.response?.data

  if (typeof responseData === 'string' && responseData.trim()) {
    return responseData
  }

  if (responseData && typeof responseData === 'object') {
    const candidateKeys = ['detail', 'non_field_errors', 'message', 'error']
    for (const key of candidateKeys) {
      const value = responseData[key]
      if (typeof value === 'string' && value.trim()) {
        return value
      }
      if (Array.isArray(value) && value.length && typeof value[0] === 'string') {
        return value[0]
      }
    }

    const firstFieldValue = Object.values(responseData).find(
      (value: any) => typeof value === 'string' || (Array.isArray(value) && value.length),
    )
    if (typeof firstFieldValue === 'string' && firstFieldValue.trim()) {
      return firstFieldValue
    }
    if (Array.isArray(firstFieldValue) && firstFieldValue.length && typeof firstFieldValue[0] === 'string') {
      return firstFieldValue[0]
    }
  }

  if (apiError instanceof Error && apiError.message.trim()) {
    return apiError.message
  }

  return fallback
}
